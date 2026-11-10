---
description: Permanent Protocol & Laws for Zero-Local-Compute Autonomous Video Production Studio
alwaysApply: true
---

# Zero-Local-Compute Video Studio Protocol

You are operating inside a **Zero-Local-Compute Autonomous Video Production Studio**. The local workstation has an integrated GPU and constrained thermal/power budgets. All heavy rendering and intensive AI compute must run off-device in the cloud at $0 cost.

These four laws are absolute and permanently active across every session in this workspace:

---

### Law 1: Zero Local Rendering (Protect Local Hardware)
- **NEVER** run full local `remotion render` or heavy multi-minute FFmpeg encoding jobs on the local machine.
- **Allowed Local Operations:**
  - Lightweight live preview servers (`npm run dev` / `npx remotion preview` / `npx hyperframes preview`).
  - Single-frame still checks (`npx remotion still src/index.ts Main out/preview.png` or `npm run still`).
  - Linting and schema validation (`npx hyperframes check --json`).
- Verify layouts, text bounding boxes, and clipping strictly via single-frame captures or the web preview.

---

### Law 2: Cloud B-Roll First (Free Cloud Generative Media)
- Author timelines locally while offloading video synthesis to free cloud APIs:
  - **Zhipu CogVideoX-Flash:** 100% free tier AI video generation via `mcp-video-gen` (`cogvideox`).
  - **SiliconFlow / HuggingFace Wan 2.1:** Free-tier credits for Wan 2.1 text-to-video / image-to-video via `mcp-video-gen` (`siliconflow`).
  - **Remote ComfyUI / Wan2GP:** Cloudflare Tunnel endpoint (`COMFYUI_REMOTE_URL`) hooked to free Kaggle Dual T4 GPUs.
  - **Stock B-Roll:** Pexels API or Unsplash for royalty-free footage.
  - **UI Recordings:** Headless browser automation via `playwright-mcp` for crisp software walkthroughs.
- Always store downloaded B-roll clips directly in `public/assets/` in compressed MP4 format.

---

### Law 3: Design Before Animation (Skill Contracts)
- Adhere strictly to the design contracts defined in `.agents/skills/remotion-best-practices` and `.agents/skills/hyperframes`:
  - **Tokens First:** Declare typography, color palettes, and margin tokens before building components.
  - **Action & Title Safe:** Keep primary visual subjects within the 90% action-safe area and text/captions strictly inside the 80% title-safe box.
  - **Physics & Motion:** Use natural spring curves (`spring({ frame, fps, config: { damping, stiffness, mass } })`) instead of raw linear interpolation.
  - **Deterministic Timelines:** Every visual property must be a pure, deterministic function of frame/time. Never use non-seeded `Math.random()`, unbuffered network fetches, or `Date.now()`.

---

### Law 4: Cloud Compilation (GitHub Actions Parallel Matrix)
- When a composition or timeline is ready for final export:
  1. Commit the code, assets, and composition parameters to Git.
  2. Push to the `render` branch or trigger `.github/workflows/render-video-matrix.yml` via GitHub CLI:
     ```bash
     gh workflow run render-video-matrix.yml -f num_of_workers=20 -f remotion_composition_id=Main
     ```
  3. Monitor the cloud workflow execution:
     ```bash
     gh run list --workflow=render-video-matrix.yml
     gh run watch
     ```
  4. 20 parallel Ubuntu runners render the chunks at 30fps/60fps in the cloud, concatenate with audio via FFmpeg, and upload the final `.mp4`.
  5. Download the completed artifact to the local `outputs/` folder:
     ```bash
     gh run download -n studio-rendered-video-60fps -D outputs/
     ```

---

### Law 5: Continuous Motion (Zero Static Frames)
- Static slides, freeze frames, or motionless cards are strictly prohibited.
- Every visual layer must feature continuous, smooth camera motion:
  - Video layers must use subtle scale/pan drifts (e.g. `KenBurnsVideo` scaling 1.0 -> 1.15).
  - Cards and typography must utilize damped physics springs (`damping: 12-16`, `stiffness: 100-140`).
  - Ambient backgrounds must include continuously orbiting radial glows or moving grid overlays.

---

### Law 6: Word-by-Word Karaoke Subtitles (Viral Retention Standard)
- All spoken voiceover must be accompanied by synchronized word-by-word bouncing captions:
  - Generate timestamps using `scripts/generate-voiceover.py` (which produces `subtitles.json`).
  - Render with `KaraokeSubtitles` showing punchy 1–3 center-weighted words at a time.
  - Active spoken words must scale pop with a spring and highlight in bright vibrant yellow (`#facc15`) with a thick dark border (`-webkit-text-stroke: 4px #000`) and ambient drop shadow.

---

### Law 7: Pacing Rhythm (1.5s–2.5s Scene Transitions)
- Fast-paced editorial cuts must occur every 1.5 to 2.5 seconds to sustain mobile viewer attention.
- Incorporate match cuts, spring scale-down exits, or smooth motion blur transitions between sequential scenes.

---

### Law 8: Standard Formats (1080x1920 @ 30fps Default)
- Mobile vertical formats for Instagram Reels, YouTube Shorts, and TikTok must default to **1080 × 1920 at 30fps**.
- 30fps cuts the rendering frame workload in half compared to 60fps, accelerating parallel cloud matrix completion while preserving mobile fluidity.
- Landscape 16:9 formats (1920 × 1080) remain supported as secondary compositions.
