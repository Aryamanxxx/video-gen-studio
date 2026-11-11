#!/usr/bin/env python3
"""
scripts/cloud-flux-gen.py
Autonomous High-Fidelity FLUX.1 Cloud Generator via Hugging Face ZeroGPU Spaces.
Eliminates Pollinations.ai completely. Enforces Character Consistency Bible and 9:16 vertical resolution.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from PIL import Image
from gradio_client import Client

# Character Consistency Bible (Locked Visual Identity)
CHARACTER_BIBLE_PREFIX = (
    "2D flat vector stickman survival animation style, Beanie Survives aesthetic, "
    "clean round white stickman head with expressive cartoon eyes, thick black ink outlines, "
    "protagonist wearing a crimson red knit beanie and dark tactical backpack, gritty dark atmospheric "
    "2D comic background, dramatic rim lighting, high contrast, no text in image -- "
)

# Use direct space URLs to bypass huggingface.co/api metadata resets on Windows
PRIORITY_SPACES = [
    ("https://black-forest-labs-flux-1-schnell.hf.space", "schnell"),
    ("black-forest-labs/FLUX.1-schnell", "schnell"),
    ("https://multimodalart-flux-1-merged.hf.space", "merged"),
    ("multimodalart/FLUX.1-merged", "merged"),
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

def generate_image(prompt: str, output_path: str, seed: int = 924710, width: int = 768, height: int = 1344, steps: int = 4):
    token = load_hf_token()
    
    # Ensure full, untruncated prompt
    full_prompt = prompt if prompt.startswith("2D flat vector") else f"{CHARACTER_BIBLE_PREFIX}{prompt}"
    print(f"\n[Flux-Cloud] Generating beat: {Path(output_path).name}")
    print(f"[Flux-Cloud] Target Dimensions: {width}x{height} | Seed: {seed} | Steps: {steps}")
    print(f"[Flux-Cloud] Full Prompt: {full_prompt[:120]}... (total {len(full_prompt)} chars)")
    
    last_err = None
    for space_target, model_type in PRIORITY_SPACES:
        for attempt in range(1, 3):
            print(f"[Flux-Cloud] Trying {space_target} (attempt {attempt}/2)...")
            try:
                client = Client(space_target, token=token)
                t0 = time.time()
                if model_type == "schnell":
                    result = client.predict(
                        prompt=full_prompt,
                        seed=seed,
                        randomize_seed=False,
                        width=width,
                        height=height,
                        num_inference_steps=steps,
                        api_name="/infer"
                    )
                else:
                    result = client.predict(
                        prompt=full_prompt,
                        seed=seed,
                        randomize_seed=False,
                        width=width,
                        height=height,
                        guidance_scale=3.5,
                        num_inference_steps=max(steps, 8),
                        api_name="/infer"
                    )
                
                elapsed = time.time() - t0
                raw_img_path = result[0]
                print(f"[Flux-Cloud] Generated in {elapsed:.2f}s!")
                
                # Convert to high-quality JPEG (95% quality)
                dest = Path(output_path).resolve()
                dest.parent.mkdir(parents=True, exist_ok=True)
                with Image.open(raw_img_path) as im:
                    im.convert("RGB").save(str(dest), "JPEG", quality=95)
                
                file_size = dest.stat().st_size
                print(f"[Flux-Cloud] Successfully saved JPEG to: {dest} ({file_size:,} bytes)")
                return True
            except Exception as e:
                print(f"[Flux-Cloud] Warning on {space_target}: {e}")
                last_err = e
                time.sleep(2)
                continue
    
    raise RuntimeError(f"All FLUX.1 Spaces failed! Last error: {last_err}")

def generate_all_from_plan(plan_path: str = "public/story/episode-plan.json", force: bool = False):
    plan_file = Path(plan_path).resolve()
    if not plan_file.exists():
        raise FileNotFoundError(f"Episode plan not found at {plan_file}")
    
    with open(plan_file, "r", encoding="utf-8") as f:
        plan = json.load(f)
    
    seed = plan.get("seed", 924710)
    beats = plan.get("beats", [])
    print(f"[Flux-Cloud] Loaded episode plan '{plan.get('title')}' with {len(beats)} beats. Seed: {seed}")
    
    beats_dir = Path("public/story/beats").resolve()
    beats_dir.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    for b in beats:
        beat_num = b["beatNumber"]
        pad_num = f"{beat_num:02d}"
        out_jpg = beats_dir / f"beat-{pad_num}.jpg"
        
        if out_jpg.exists() and not force:
            try:
                with Image.open(out_jpg) as img_check:
                    if img_check.size[0] >= 500 and out_jpg.stat().st_size > 50000:
                        print(f"[Flux-Cloud] Beat {pad_num} already exists and is valid ({out_jpg.stat().st_size:,} bytes). Skipping.")
                        success_count += 1
                        continue
            except Exception:
                pass
        
        prompt = b["prompt"]
        generate_image(prompt=prompt, output_path=str(out_jpg), seed=seed, width=768, height=1344, steps=4)
        success_count += 1
    
    print(f"\n[Flux-Cloud] All {success_count}/{len(beats)} beats generated successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cloud FLUX.1 Story Beat Generator")
    parser.add_argument("--prompt", type=str, help="Custom prompt for single beat")
    parser.add_argument("--output", type=str, help="Output file path (e.g. public/story/beats/beat-01.jpg)")
    parser.add_argument("--seed", type=int, default=924710, help="Fixed generation seed for consistency")
    parser.add_argument("--plan", type=str, default="public/story/episode-plan.json", help="Path to episode-plan.json")
    parser.add_argument("--all", action="store_true", help="Generate all beats from episode plan")
    parser.add_argument("--force", action="store_true", help="Overwrite existing beat images")
    args = parser.parse_args()
    
    if args.all or (not args.prompt and not args.output):
        generate_all_from_plan(args.plan, force=args.force)
    else:
        if not args.prompt or not args.output:
            parser.error("--prompt and --output required when not using --all")
        generate_image(prompt=args.prompt, output_path=args.output, seed=args.seed)
