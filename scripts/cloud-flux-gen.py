#!/usr/bin/env python3
"""
scripts/cloud-flux-gen.py
Autonomous High-Fidelity FLUX.1 Cloud Generator via Hugging Face ZeroGPU Spaces.
Enforces Character Consistency Bible, 8-Section Prompt SOP, and First-Last-Frame generation.
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
    "2D flat vector stickman survival animation style, Beanie Survives and Stickocalypse aesthetic, "
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
    
    # Prefix prompt if not already formatted with custom art style
    if prompt.startswith("2D flat vector") or prompt.startswith("2D vector character"):
        full_prompt = prompt
    else:
        full_prompt = f"{CHARACTER_BIBLE_PREFIX}{prompt}"
        
    print(f"\n[Flux-Cloud] Generating: {Path(output_path).name}")
    print(f"[Flux-Cloud] Dimensions: {width}x{height} | Seed: {seed} | Steps: {steps}")
    print(f"[Flux-Cloud] Prompt: {full_prompt[:120]}... (total {len(full_prompt)} chars)")
    
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

def generate_character_sheet(output_path: str = "public/story/characters/protagonist-sheet.jpg", seed: int = 924710):
    """
    8-Section Prompt SOP for 3-View Orthographic Turnaround Sheet:
    1. Core Subject: Stickman survivor protagonist
    2. Stable Anchor: Clean round white head, expressive eyes, crisp black ink outlines
    3. Outfit: Crimson red knit beanie, dark charcoal tactical jacket, olive backpack with straps, combat boots
    4. Composition: 3-view orthographic turnaround sheet (front, side 90-degree profile, rear back view)
    5. Medium/Material: 2D vector comic illustration, cell shaded, crisp clean line art
    6. Lighting: Neutral even studio key lighting, balanced rim light
    7. Background: Neutral light grey background, single ground reference line, empty stage
    8. Negative: no 3D render, no photo, no text, no watermark, no extra figures
    """
    prompt = (
        "2D vector character design model sheet, 3-view orthographic turnaround sheet showing front view, "
        "side profile view, and back view of stickman protagonist aligned side by side, clean round white stickman head "
        "with determined cartoon eyes, wearing bright crimson red knit beanie hat, dark charcoal survival jacket, "
        "tactical olive green backpack with webbing straps, fingerless black gloves, sturdy combat boots, "
        "full body head to toe, clean neutral grey background, crisp black ink line art, studio reference lighting, "
        "no text, no watermark, cell shading"
    )
    # 1344x768 landscape for 3-view turnaround sheet
    generate_image(prompt=prompt, output_path=output_path, seed=seed, width=1344, height=768, steps=4)

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
        
        # Check if already valid
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

        # Check if high-action shot requires start and end frames for First-Last-Frame interpolation
        is_action = b.get("isActionShot", False) or b.get("actionType") in ["run", "breach", "barricade", "fall", "collapse", "escape"]
        if is_action:
            start_jpg = beats_dir / f"frame-{pad_num}-start.jpg"
            end_jpg = beats_dir / f"frame-{pad_num}-end.jpg"
            
            if not start_jpg.exists() or force:
                start_prompt = b.get("startPrompt", f"{prompt}, initial anticipation position, tension build")
                generate_image(prompt=start_prompt, output_path=str(start_jpg), seed=seed, width=768, height=1344, steps=4)
            
            if not end_jpg.exists() or force:
                end_prompt = b.get("endPrompt", f"{prompt}, dramatic dynamic follow-through motion, full kinetic action")
                generate_image(prompt=end_prompt, output_path=str(end_jpg), seed=seed + 1, width=768, height=1344, steps=4)
    
    print(f"\n[Flux-Cloud] All {success_count}/{len(beats)} beats generated successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cloud FLUX.1 Story Beat & Character Generator")
    parser.add_argument("--prompt", type=str, help="Custom prompt for single beat")
    parser.add_argument("--output", type=str, help="Output file path (e.g. public/story/beats/beat-01.jpg)")
    parser.add_argument("--seed", type=int, default=924710, help="Fixed generation seed for consistency")
    parser.add_argument("--width", type=int, default=768, help="Target image width")
    parser.add_argument("--height", type=int, default=1344, help="Target image height")
    parser.add_argument("--steps", type=int, default=4, help="Inference steps")
    parser.add_argument("--plan", type=str, default="public/story/episode-plan.json", help="Path to episode-plan.json")
    parser.add_argument("--all", action="store_true", help="Generate all beats from episode plan")
    parser.add_argument("--sheet", action="store_true", help="Generate 3-view orthographic character sheet")
    parser.add_argument("--force", action="store_true", help="Overwrite existing beat images")
    args = parser.parse_args()
    
    if args.sheet:
        out_sheet = args.output or "public/story/characters/protagonist-sheet.jpg"
        generate_character_sheet(output_path=out_sheet, seed=args.seed)
    elif args.all or (not args.prompt and not args.output):
        generate_all_from_plan(args.plan, force=args.force)
    else:
        if not args.prompt or not args.output:
            parser.error("--prompt and --output required when not using --all or --sheet")
        generate_image(prompt=args.prompt, output_path=args.output, seed=args.seed, width=args.width, height=args.height, steps=args.steps)
