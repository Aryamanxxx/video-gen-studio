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

---

### Law 9: Dual-Engine Routing & Fast Iteration
The studio operates two specialized production engines:
1. **ENGINE A — Episodic 2D & Stick-Figure Storylines (`src/series/`, ID: `SeriesEpisode`)**:
   - Route here when the user requests a narrative story, zombie survival episode, character animation, comedy skit, or recurring character series.
   - Synthesize multi-character voiceovers via `npm run voice` (`scripts/generate-voiceover.py`).
   - Fetch custom 2D comic backgrounds via `npm run art` (`scripts/fetch-ai-art.mjs` using Pollinations.ai, 0-key).
   - Animate using `RiggedCharacter` (composable SVG puppet with built-in limb kinematics, actions, expressions, and subtitle-driven phoneme lip-sync), `PropsLibrary` (weapons/items), and `Stage2D` (multi-plane parallax camera).
   - Build entire episodes declaratively using `episode-manifest.ts` and play via `EpisodePlayer.tsx`.
2. **ENGINE B — High-Converting Commercial Product Ads (`src/ads/`, ID: `ProductAd`)**:
   - Route here when the user requests e-commerce product videos, physical goods drops, streetwear showcases, packaging reveals, or SaaS UI launch trailers.
   - Enforce the 4-part viral ad framework:
     - `0s–3s`: Pattern-Interrupt Hook (`HookKineticText` with 3-property choreography: `translateY + scale + blur`).
     - `3s–8s`: Problem Agitation & Comparison.
     - `8s–15s`: 3D Hero Product Reveal (`ProductHeroCard` with perspective tilt, specular sheen, floating shadow, tactile callout pills).
     - `15s–20s`: Urgency Offer + CTA Lockup.
   - Drive scenes through `CameraRig.tsx` using damped springs (`AdTheme.springs`) — 100% banning flat linear slides.

---

### Law 10: Parallel Subagent Orchestration & 10-Second Direct Compilation
- Whenever the user asks for a story, stickman episode, or zombie survival video:
  1. **Orchestrate the 4 Production Subagents** in sequence and parallel:
     - `showrunner` (`.agents/agents/showrunner/agent.md`): Generates `public/story/episode-plan.json` using the 7 Viral Story Rules and 10–12 rapid beats.
     - `art-director` (`.agents/agents/art-director/agent.md`): Prepend the locked Character Consistency Bible and batch-fetches all 10–12 beats concurrently in ~8s via `scripts/fetch-story-beats-parallel.mjs`.
     - `audio-director` (`.agents/agents/audio-director/agent.md`): Synthesizes urgent narration (+8% rate) with `edge-tts` and mixes procedural sub-bass tension drone cues.
     - `ffmpeg-compiler` (`.agents/agents/ffmpeg-compiler/agent.md`): Bypasses heavy browser sessions and compiles the entire 30s video in ~8 seconds locally using `npm run fast-episode` (`scripts/compile-story-fast.mjs`).
  2. **Banned Practices**:
     - NEVER generate raw, hand-coded SVG stick figures unless specifically requested. Always use the Character Bible prefix + parallel `flux` 2D illustrated beats.
     - NEVER route fast narrative story episodes to the 15-minute GitHub Actions cloud renderer unless explicitly requested by the user. Always use the 10-second local Direct FFmpeg Compiler (`npm run fast-episode`).
     - Reserve Remotion + GitHub Actions cloud matrix ONLY for Engine B (3D Commercial Product Ads).


---

### Law 11: Zero Pollinations & Mandatory Visual Quality Gate (QC)
- **Zero Pollinations Policy**:
  - Pollinations.ai is permanently banned from this repository (due to HTTP 402 paywalls and low-resolution unaligned model degradation).
  - All visual generation must be executed through high-fidelity cloud models via Hugging Face ZeroGPU Spaces (`gradio_client`) using `HF_TOKEN`:
    - **Still Frames**: `scripts/cloud-flux-gen.py` via `black-forest-labs/FLUX.1-schnell` (with `multimodalart/FLUX.1-merged` fallback), running at 768x1344 (9:16 vertical), 4 steps, and locked story seeds.
    - **AI Video Animation**: `scripts/cloud-wan-i2v.py` via `Lightricks/LTX-2.5` or `Saravutw/WAN2.2_I2V_LIGHTNING_4-8step_custom`.
- **Mandatory Visual QC Gate**:
  - Before compiling any final video (`outputs/*.mp4`), the agent **MUST** inspect the generated beat images and clips:
    1. Confirm file size is healthy (> 50 KB for stills, > 200 KB for MP4 clips).
    2. Confirm aspect ratio and dimensions match 9:16 vertical standards (768x1344 or 1080x1920).
    3. Verify that the image contents strictly depict the Character Bible (round white stickman head, expressive eyes, thick black ink outlines, crimson red beanie, tactical backpack, dark apocalyptic zombie background) rather than random unrelated pictures.
  - If any beat fails this inspection, it must be regenerated with an adjusted seed or failover space before proceeding to compilation.
