"""Run after installing requirements: python resources/python/try_on/download_weights.py.

Set TRY_ON_WEIGHTS_DIR and HF_HOME to persistent, non-public storage on the GPU host.
"""
import os
from pathlib import Path

from huggingface_hub import hf_hub_download


def main():
    directory = Path(os.environ["TRY_ON_WEIGHTS_DIR"])
    hf_hub_download("fashn-ai/fashn-vton-1.5", "model.safetensors", local_dir=directory)
    for filename in ("yolox_l.onnx", "dw-ll_ucoco_384.onnx"):
        hf_hub_download("fashn-ai/DWPose", filename, local_dir=directory / "dwpose")
    from fashn_human_parser import FashnHumanParser
    FashnHumanParser(device="cpu")


if __name__ == "__main__":
    main()
