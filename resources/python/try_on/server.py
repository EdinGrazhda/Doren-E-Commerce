"""Private FASHN adapter. Run one process per GPU behind a private network.

python -m uvicorn server:app --app-dir resources/python/try_on --host 127.0.0.1 --port 8100 --workers 1 --no-access-log

Set TRY_ON_SERVICE_TOKEN (same secret as Laravel), TRY_ON_WEIGHTS_DIR and
optionally TRY_ON_DEVICE=cuda, TRY_ON_STEPS=30, HF_HOME. Laravel and its dedicated
queue worker must share the private try-ons disk. No images are logged or saved here.
"""

import hmac
import io
import logging
import os
import threading
import warnings
from contextlib import asynccontextmanager
from typing import Annotated, Callable, Literal

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse, Response
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_IMAGE_BYTES = 15 * 1024 * 1024
MAX_REQUEST_BYTES = 27 * 1024 * 1024
MAX_PIXELS = 36_000_000
logger = logging.getLogger(__name__)


class FashnEngine:
    def __init__(self):
        import torch
        from fashn_vton import TryOnPipeline

        device = os.environ.get("TRY_ON_DEVICE", "cuda")
        if device == "cuda" and not torch.cuda.is_available():
            raise RuntimeError("A working CUDA GPU is required. CPU mode is for manual experiments only.")
        self.steps = int(os.environ.get("TRY_ON_STEPS", "30"))
        if not 20 <= self.steps <= 50:
            raise RuntimeError("TRY_ON_STEPS must be between 20 and 50.")
        self.pipeline = TryOnPipeline(weights_dir=os.environ["TRY_ON_WEIGHTS_DIR"], device=device)

    def generate(self, person, garment, category, photo_type):
        import numpy as np

        resized = self.pipeline.pre_resize(person, allow_upsampling=False)
        pose = self.pipeline.pose_model(np.array(resized)[..., ::-1], single=False)
        validate_pose(pose["bodies"]["subset"])
        return self.pipeline(
            person_image=person,
            garment_image=garment,
            category=category,
            garment_photo_type=photo_type,
            num_samples=1,
            num_timesteps=self.steps,
            seed=42,
            segmentation_free=True,
        ).images[0]


def validate_pose(people):
    # DWPose's first 18 joints use OpenPose ordering: head, shoulders, hips, ankles.
    required_joints = (0, 2, 5, 8, 11, 10, 13)
    if len(people) != 1 or any(people[0][joint] < 0 for joint in required_joints):
        raise HTTPException(422, "Use a front-facing photo of one person with head, shoulders, hips and feet visible.")


def decode_image(contents: bytes, person: bool = False) -> Image.Image:
    if not contents or len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image exceeds the size limit.")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(contents)) as source:
                if source.format not in {"JPEG", "PNG", "WEBP"} or getattr(source, "n_frames", 1) != 1:
                    raise HTTPException(422, "Use a still JPEG, PNG or WebP image.")
                if source.width * source.height > MAX_PIXELS:
                    raise HTTPException(422, "Image dimensions exceed the limit.")
                source.load()
                oriented = ImageOps.exif_transpose(source)
                if person and (oriented.width < 384 or oriented.height < 512):
                    raise HTTPException(422, "Use a full-body image at least 384 by 512 pixels.")
                # Composite transparent catalog photos on white and discard embedded metadata.
                rgba = oriented.convert("RGBA")
                clean = Image.new("RGB", rgba.size, "white")
                clean.paste(rgba, mask=rgba.getchannel("A"))
                clean.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
                return clean
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(422, "Image could not be decoded.") from None


def create_app(engine_factory: Callable = FashnEngine) -> FastAPI:
    gate = threading.Lock()

    @asynccontextmanager
    async def lifespan(application):
        token = os.environ.get("TRY_ON_SERVICE_TOKEN", "")
        if len(token) < 32:
            raise RuntimeError("TRY_ON_SERVICE_TOKEN must contain at least 32 characters.")
        application.state.token = token
        application.state.engine = engine_factory()
        yield
        application.state.engine = None

    application = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
    application.state.gate = gate

    @application.middleware("http")
    async def protect(request: Request, call_next):
        expected = "Bearer " + request.app.state.token
        if not hmac.compare_digest(request.headers.get("authorization", "").encode(), expected.encode()):
            return JSONResponse({"detail": "Unauthorized"}, status_code=401)
        if request.method == "POST":
            length = request.headers.get("content-length", "")
            if not length.isdigit():
                return JSONResponse({"detail": "Content-Length required"}, status_code=411)
            if int(length) > MAX_REQUEST_BYTES:
                return JSONResponse({"detail": "Request too large"}, status_code=413)
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response

    @application.get("/health")
    def health():
        return {"ready": application.state.engine is not None, "busy": gate.locked()}

    @application.post("/v1/try-on")
    def generate(
        person_image: Annotated[UploadFile, File()],
        garment_image: Annotated[UploadFile, File()],
        category: Annotated[Literal["tops", "bottoms", "one-pieces"], Form()],
        garment_photo_type: Annotated[Literal["model", "flat-lay"], Form()],
    ):
        if not gate.acquire(blocking=False):
            raise HTTPException(503, "Try-on service is busy.", headers={"Retry-After": "10"})
        try:
            person = decode_image(person_image.file.read(MAX_IMAGE_BYTES + 1), person=True)
            garment = decode_image(garment_image.file.read(MAX_IMAGE_BYTES + 1))
            output = application.state.engine.generate(person, garment, category, garment_photo_type)
            buffer = io.BytesIO()
            # A fresh image prevents accidental metadata from reaching the customer.
            clean = Image.new("RGB", output.size)
            clean.paste(output.convert("RGB"))
            clean.save(buffer, format="PNG")
            return Response(buffer.getvalue(), media_type="image/png")
        except HTTPException:
            raise
        except Exception as exception:
            logger.error("Try-on inference failed (%s)", type(exception).__name__)
            raise HTTPException(503, "Try-on could not be completed.") from None
        finally:
            gate.release()

    return application


app = create_app()
