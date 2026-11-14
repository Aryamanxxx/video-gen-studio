#!/usr/bin/env python3
"""
scripts/generate-all-video-clips.py
Multi-Endpoint Parallel Video Generator for 100% Real Animated .MP4 Scenes.
Zero static image slideshows. Zero Ken-Burns pan/zoom.

Supports 3 Multi-Backend Tiers:
- Backend A: Google Veo / Gemini API (veo-2.0-generate-001) via google-genai
- Backend B: Dedicated Remote GPU / ComfyUI / Wan Tunnel via REMOTE_VIDEO_URL
- Backend C: Multi-Space Load-Balanced ZeroGPU Pool (Lightricks LTX-2.5, Saravutw Wan 2.2, Multimodalart Wan 2.2)
"""

import os
import sys
import json
import time
import shutil
import argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from gradio_client import Client, handle_file

# Multi-Space Video Pool (Load balanced across scenes)
HF_VIDEO_SPACES = [
    ("https://lightricks-ltx-2-5.hf.space", "ltx"),
    ("https://saravutw-wan2-2-i2v-lightning-4-8step-custom.hf.space", "wan"),
    ("https://multimodalart-wan-2-2-first-last-frame.hf.space", "wan_fl"),
    ("https://multimodalart-wan2-1-fast.hf.space", "wan_fast"),
    ("Lightricks/LTX-2.5", "ltx"),
]

def load_env():
    env_vars = {}
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env_vars[k.strip()] = v.strip()
    return env_vars

def generate_clip_backend_a_veo(prompt: str, output_path: str, gemini_key: str):
    """Backend A: Google Veo via google-genai (veo-2.0-generate-001)"""
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=gemini_key)
        print(f"[Backend-A: Veo] Dispatching text-to-video job...")
        operation = client.models.generate_videos(
            model="veo-2.0-generate-001",
            prompt=prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio="9:16",
                number_of_videos=1,
                duration_seconds=4,
            ),
        )
        print(f"[Backend-A: Veo] Job dispatched. Polling for completion...")
        while not operation.done:
            time.sleep(10)
            operation = client.operations.get(operation)
        
        video = operation.result.generated_videos[0]
        with open(output_path, "wb") as f:
            f.write(video.video.video_bytes)
        print(f"[Backend-A: Veo] ✅ Saved video to {output_path}")
        return True
    except Exception as e:
        print(f"[Backend-A: Veo] Warning: {e}")
        return False

def generate_clip_backend_b_remote(prompt: str, image_path: str, output_path: str, remote_url: str):
    """Backend B: Remote GPU / ComfyUI / Wan tunnel"""
    try:
        import requests
        payload = {"prompt": prompt, "image_path": str(image_path), "duration": 2.0}
        r = requests.post(f"{remote_url}/generate", json=payload, timeout=60)
        if r.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(r.content)
            print(f"[Backend-B: Remote] ✅ Saved video to {output_path}")
            return True
    except Exception as e:
        print(f"[Backend-B: Remote] Warning: {e}")
    return False

def generate_clip_backend_c_hf(space_target, model_type, image_path, motion_prompt, output_path, seed, duration, hf_token):
    """Backend C: ZeroGPU Space worker with strict 60s timeout"""
    img_file = Path(image_path).resolve()
    out_file = Path(output_path).resolve()
    
    print(f"[Backend-C] Connecting to {space_target} for {out_file.name}...")
    client = Client(space_target, token=hf_token)
    t0 = time.time()
    
    if model_type == "ltx":
        job = client.submit(
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
        res = job.result(timeout=60.0)
        video_src = res[0]
    elif model_type == "wan":
        job = client.submit(
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
        res = job.result(timeout=60.0)
        video_src = res[0]
    elif model_type == "wan_fl":
        job = client.submit(
            start_image_pil=handle_file(str(img_file)),
            end_image_pil=handle_file(str(img_file)),
            prompt=motion_prompt,
            negative_prompt="blurry, deformed, bad anatomy, text, watermark",
            duration_seconds=duration,
            steps=8,
            guidance_scale=1.0,
            guidance_scale_2=1.0,
            seed=seed,
            randomize_seed=False,
            api_name="/generate_video"
        )
        res = job.result(timeout=60.0)
        video_src = res[0]["video"] if isinstance(res[0], dict) else res[0]
    else:
        raise ValueError(f"Unknown model type {model_type}")
        
    shutil.copyfile(video_src, str(out_file))
    elapsed = time.time() - t0
    file_size = out_file.stat().st_size
    print(f"[Backend-C] ✅ Generated {out_file.name} in {elapsed:.2f}s ({file_size:,} bytes) via {space_target}")
    return True

def generate_single_scene(beat_info, env, worker_index=0, force=False):
    beat_num = beat_info["beatNumber"]
    pad_num = f"{beat_num:02d}"
    out_clip = Path(f"public/story/clips/clip-{pad_num}.mp4").resolve()
    keyframe_img = Path(f"public/story/beats/beat-{pad_num}.jpg").resolve()
    
    if out_clip.exists() and out_clip.stat().st_size > 20000 and not force:
        print(f"[Video-Generator] ⏩ Clip #{beat_num} already exists ({out_clip.stat().st_size:,} bytes). Skipping.")
        return True

    prompt = beat_info["prompt"]
    motion_prompt = (
        f"2D flat vector stickman animation, {prompt}, "
        f"continuous character locomotion, fluid anime motion physics, cinematic camera"
    )
    seed = beat_info.get("seed", 924710)
    duration = min(beat_info.get("durationSeconds", 2.0), 3.0)

    # 1. Try Backend A (Google Veo) if configured
    gemini_key = env.get("GEMINI_API_KEY")
    if gemini_key and not gemini_key.startswith("your_"):
        print(f"[Clip #{beat_num}] Trying Backend A (Google Veo)...")
        if generate_clip_backend_a_veo(motion_prompt, str(out_clip), gemini_key):
            return True

    # 2. Try Backend B (Dedicated Remote GPU) if configured
    remote_url = env.get("REMOTE_VIDEO_URL") or env.get("COMFYUI_REMOTE_URL")
    if remote_url and not remote_url.startswith("https://your-"):
        print(f"[Clip #{beat_num}] Trying Backend B (Remote GPU)...")
        if generate_clip_backend_b_remote(motion_prompt, str(keyframe_img), str(out_clip), remote_url):
            return True

    # 3. Try Backend C (ZeroGPU Pool with Round-Robin Load Balancing)
    hf_token = env.get("HF_TOKEN")
    if not hf_token:
        raise RuntimeError("HF_TOKEN is required for Backend C ZeroGPU generation!")

    # Distribute initial space by worker_index
    space_order = HF_VIDEO_SPACES[worker_index % len(HF_VIDEO_SPACES):] + HF_VIDEO_SPACES[:worker_index % len(HF_VIDEO_SPACES)]
    last_err = None

    for target, model_type in space_order:
        try:
            print(f"[Clip #{beat_num}] Attempting generation via {target}...")
            if generate_clip_backend_c_hf(target, model_type, str(keyframe_img), motion_prompt, str(out_clip), seed, duration, hf_token):
                return True
        except Exception as e:
            print(f"[Clip #{beat_num}] ⚠️ {target} failed: {e}")
            last_err = e
            time.sleep(1)

    raise RuntimeError(f"All backends failed for Beat #{beat_num}! Last error: {last_err}")

def main():
    parser = argparse.ArgumentParser(description="Multi-Endpoint Parallel Real Video Clip Generator")
    parser.add_argument("--plan", type=str, default="public/story/episode-plan.json", help="Path to episode-plan.json")
    parser.add_argument("--force", action="store_true", help="Force regenerate existing clips")
    parser.add_argument("--concurrency", type=int, default=3, help="Max parallel video workers")
    args = parser.parse_args()

    plan_path = Path(args.plan).resolve()
    if not plan_path.exists():
        raise FileNotFoundError(f"Episode plan not found at {plan_path}")

    with open(plan_path, "r", encoding="utf-8") as f:
        plan = json.load(f)

    beats = plan.get("beats", [])
    env = load_env()

    clips_dir = Path("public/story/clips").resolve()
    clips_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n=======================================================")
    print(f"[Video-Generator] 🎬 STARTING 100% REAL VIDEO GENERATION")
    print(f"[Video-Generator] Episode: {plan.get('title')}")
    print(f"[Video-Generator] Total Scenes: {len(beats)} | Concurrency: {args.concurrency}")
    print(f"=======================================================\n")

    t_start = time.time()
    
    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = {
            executor.submit(generate_single_scene, beat, env, idx, args.force): beat["beatNumber"]
            for idx, beat in enumerate(beats)
        }
        for future in as_completed(futures):
            beat_num = futures[future]
            try:
                future.result()
            except Exception as e:
                print(f"[Video-Generator] ❌ Fatal error on Beat #{beat_num}: {e}")
                sys.exit(1)

    # Final Strict QC Check
    print(f"\n[Video-Generator] 🔍 Running Strict Law 12 Video QC Check...")
    missing = []
    for beat in beats:
        b_num = beat["beatNumber"]
        pad = f"{b_num:02d}"
        c_path = clips_dir / f"clip-{pad}.mp4"
        if not c_path.exists() or c_path.stat().st_size < 20000:
            missing.append(f"clip-{pad}.mp4")
        else:
            print(f"  ✅ Beat #{b_num}: {c_path.name} ({c_path.stat().st_size:,} bytes) [VALID VIDEO]")

    if missing:
        raise RuntimeError(f"Strict Law 12 violation: Missing clips: {missing}")

    elapsed = time.time() - t_start
    print(f"\n[Video-Generator] 🚀 ALL {len(beats)} REAL VIDEO CLIPS VERIFIED IN {elapsed:.1f}s!\n")

if __name__ == "__main__":
    main()
