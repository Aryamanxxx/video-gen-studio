#!/usr/bin/env python3
"""
scripts/cloud-wan-i2v.py
Autonomous High-Fidelity Image-to-Video Cloud Animator via Hugging Face ZeroGPU Spaces.
Supports Lightricks/LTX-2.5 and Saravutw/WAN2.2_I2V_LIGHTNING.
"""

import os
import sys
import time
import shutil
import argparse
from pathlib import Path
from gradio_client import Client, handle_file

I2V_TARGETS = [
    ("https://lightricks-ltx-2-5.hf.space", "ltx"),
    ("Lightricks/LTX-2.5", "ltx"),
    ("https://saravutw-wan2-2-i2v-lightning-4-8step-custom.hf.space", "wan"),
    ("Saravutw/WAN2.2_I2V_LIGHTNING_4-8step_custom", "wan"),
]

def load_hf_token() -> str:
    token = os.environ.get("HF_TOKEN")
    if token:
        return token
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("HF_TOKEN="):
                    return line.strip().split("=", 1)[1].strip()
    raise RuntimeError("HF_TOKEN not found in environment or .env file!")

def animate_image(image_path: str, output_path: str, motion_prompt: str, duration: float = 2.0, seed: int = 924710):
    token = load_hf_token()
    img_file = Path(image_path).resolve()
    if not img_file.exists():
        raise FileNotFoundError(f"Input image not found: {img_file}")
    
    out_file = Path(output_path).resolve()
    out_file.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"\n[Cloud-I2V] Animating keyframe: {img_file.name} -> {out_file.name}")
    print(f"[Cloud-I2V] Motion Prompt: {motion_prompt}")
    print(f"[Cloud-I2V] Target Duration: {duration}s | Seed: {seed}")
    
    last_err = None
    for target, model_type in I2V_TARGETS:
        for attempt in range(1, 3):
            print(f"[Cloud-I2V] Trying {target} (attempt {attempt}/2)...")
            try:
                client = Client(target, token=token)
                t0 = time.time()
                
                if model_type == "ltx":
                    res = client.predict(
                        prompt=motion_prompt,
                        image_path=handle_file(str(img_file)),
                        height=1344,
                        width=768,
                        duration_s=duration,
                        seed=seed,
                        decoder="conv",
                        auto_len=False,
                        randomize_seed=False,
                        do_enhance=True,
                        api_name="/run"
                    )
                    video_src = res[0]
                elif model_type == "wan":
                    res = client.predict(
                        input_image=handle_file(str(img_file)),
                        last_image=handle_file(str(img_file)),
                        prompt=motion_prompt,
                        steps=4,
                        negative_prompt="blurry, low quality, deformed, watermark",
                        duration_seconds=duration,
                        guidance_scale=1.0,
                        guidance_scale_2=1.0,
                        seed=seed,
                        randomize_seed=False,
                        quality=5,
                        scheduler="UniPCMultistep",
                        flow_shift=3.0,
                        frame_multiplier=16,
                        safe_mode=False,
                        video_component=True,
                        api_name="/generate_video"
                    )
                    video_src = res[0]
                else:
                    continue
                
                elapsed = time.time() - t0
                shutil.copyfile(video_src, str(out_file))
                file_size = out_file.stat().st_size
                print(f"[Cloud-I2V] ✅ Animation complete in {elapsed:.2f}s! Saved: {out_file} ({file_size:,} bytes)")
                return True
            except Exception as e:
                print(f"[Cloud-I2V] Warning on {target}: {e}")
                last_err = e
                time.sleep(2)
                continue
                
    raise RuntimeError(f"All I2V Spaces failed! Last error: {last_err}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cloud Image-to-Video Generator")
    parser.add_argument("--image", required=True, help="Input keyframe path")
    parser.add_argument("--output", required=True, help="Output MP4 clip path")
    parser.add_argument("--prompt", required=True, help="Motion prompt")
    parser.add_argument("--duration", type=float, default=2.0, help="Clip duration in seconds")
    parser.add_argument("--seed", type=int, default=924710, help="Generation seed")
    args = parser.parse_args()
    
    animate_image(
        image_path=args.image,
        output_path=args.output,
        motion_prompt=args.prompt,
        duration=args.duration,
        seed=args.seed
    )
