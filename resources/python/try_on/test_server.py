import io
import os
import unittest
from unittest.mock import patch

from fastapi import HTTPException
from fastapi.testclient import TestClient
from PIL import Image

from server import MAX_REQUEST_BYTES, create_app, decode_image, validate_pose

TOKEN = "test-secret-" + "x" * 32


def photo(size=(600, 1000), format="PNG"):
    output = io.BytesIO()
    Image.new("RGB", size, "navy").save(output, format=format)
    return output.getvalue()


class FakeEngine:
    def __init__(self):
        self.calls = []

    def generate(self, person, garment, category, photo_type):
        self.calls.append((person, garment, category, photo_type))
        return person


class ServerTest(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {"TRY_ON_SERVICE_TOKEN": TOKEN})
        self.env.start()
        self.engine = FakeEngine()
        self.app = create_app(lambda: self.engine)
        self.client = TestClient(self.app).__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.env.stop()

    def request(self, **overrides):
        data = {"category": "bottoms", "garment_photo_type": "flat-lay"}
        data.update(overrides.pop("data", {}))
        return self.client.post("/v1/try-on", data=data,
            headers=overrides.pop("headers", {"Authorization": f"Bearer {TOKEN}"}),
            files=overrides.pop("files", {"person_image": ("person.png", photo()), "garment_image": ("garment.png", photo())}),
            **overrides)

    def test_generates_png_and_passes_category_and_photo_type(self):
        result = self.request()
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.headers["content-type"], "image/png")
        self.assertEqual(result.headers["cache-control"], "no-store")
        self.assertEqual(Image.open(io.BytesIO(result.content)).size, (600, 1000))
        self.assertEqual(self.engine.calls[0][2:], ("bottoms", "flat-lay"))

    def test_unauthorized_requests_cannot_use_engine(self):
        self.assertEqual(self.request(headers={}).status_code, 401)
        self.assertEqual(self.engine.calls, [])

    def test_body_limit_is_checked_before_parsing(self):
        response = self.client.post("/v1/try-on", content=b"x", headers={
            "Authorization": f"Bearer {TOKEN}", "Content-Length": str(MAX_REQUEST_BYTES + 1)})
        self.assertEqual(response.status_code, 413)
        self.assertEqual(self.engine.calls, [])

    def test_invalid_inputs_are_rejected(self):
        self.assertEqual(self.request(data={"category": "shoes"}).status_code, 422)
        self.assertEqual(self.request(data={"garment_photo_type": "other"}).status_code, 422)
        self.assertEqual(self.request(files={"person_image": ("fake.png", b"not an image"), "garment_image": ("garment.png", photo())}).status_code, 422)
        self.assertEqual(self.engine.calls, [])

    def test_busy_gpu_does_not_run_concurrent_inference(self):
        self.app.state.gate.acquire()
        try:
            self.assertEqual(self.request().status_code, 503)
            self.assertEqual(self.engine.calls, [])
        finally:
            self.app.state.gate.release()

    def test_failure_releases_gpu_and_hides_exception_details(self):
        with patch.object(self.engine, "generate", side_effect=RuntimeError("private data")):
            response = self.request()
            self.assertEqual(response.status_code, 503)
            self.assertNotIn("private data", response.text)
        self.assertEqual(self.request().status_code, 200)

    def test_images_are_resized_and_metadata_stripped(self):
        image = decode_image(photo((3000, 4000)), person=True)
        self.assertEqual(image.size, (1500, 2000))
        self.assertEqual(image.info, {})

    def test_small_and_unsupported_images_are_rejected(self):
        for contents in (photo((100, 100)), photo(format="GIF")):
            with self.assertRaises(HTTPException):
                decode_image(contents, person=True)

    def test_full_body_check_rejects_groups_missing_feet_and_no_person(self):
        validate_pose([list(range(18))])
        missing_foot = list(range(18))
        missing_foot[13] = -1
        for people in ([], [list(range(18)), list(range(18))], [missing_foot]):
            with self.assertRaises(HTTPException):
                validate_pose(people)

    def test_health_requires_authentication(self):
        self.assertEqual(self.client.get("/health").status_code, 401)
        self.assertEqual(self.client.get("/health", headers={"Authorization": f"Bearer {TOKEN}"}).json(), {"ready": True, "busy": False})


if __name__ == "__main__":
    unittest.main()
