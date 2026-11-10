#!/usr/bin/env python3
"""
Free Local Neural Voiceover & Subtitle Timestamp Engine
Uses Microsoft edge-tts to synthesize broadcast-quality neural voiceovers and
concurrently extract word-level timestamps for Remotion karaoke subtitles.

Usage:
  python scripts/generate-voiceover.py --text "Your voiceover script here" [--voice en-US-ChristopherNeural]

Output:
  - public/assets/audio/voiceover.mp3
  - public/assets/audio/subtitles.json ([{ "word": str, "start": float, "end": float }])
"""

import argparse
import asyncio
import json
import os
import sys
import time

try:
    import edge_tts
except ImportError:
    print("❌ Error: edge-tts is not installed. Run: pip install edge-tts", file=sys.stderr)
    sys.exit(1)

# Ensure Windows event loop compatibility
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

DEFAULT_VOICE = "en-US-ChristopherNeural"
DEFAULT_TEXT = "This is an autonomous, zero compute viral video studio producing high retention Reels at sixty frames per second."

async def synthesize_with_retry(text: str, voice: str, audio_path: str, sub_path: str, max_retries: int = 3):
    os.makedirs(os.path.dirname(os.path.abspath(audio_path)), exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(sub_path)), exist_ok=True)

    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            print(f"🎙️ Synthesizing voiceover with {voice} (Attempt {attempt}/{max_retries})...")
            communicate = edge_tts.Communicate(
                text=text,
                voice=voice,
                boundary="WordBoundary"
            )

            words = []
            audio_bytes = bytearray()

            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_bytes.extend(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    # offset and duration are in 100-nanosecond ticks
                    start_sec = round(chunk["offset"] / 10_000_000.0, 3)
                    end_sec = round((chunk["offset"] + chunk["duration"]) / 10_000_000.0, 3)
                    word = chunk["text"].strip()
                    if word:
                        words.append({
                            "word": word,
                            "start": start_sec,
                            "end": end_sec
                        })

            if len(audio_bytes) == 0:
                raise ValueError("Synthesizer returned 0 audio bytes.")

            # Write audio file
            with open(audio_path, "wb") as f:
                f.write(audio_bytes)

            # Write word-level timestamps JSON
            with open(sub_path, "w", encoding="utf-8") as f:
                json.dump(words, f, indent=2, ensure_ascii=False)

            total_duration = words[-1]["end"] if words else 0.0
            print(f"✅ Voiceover synthesized successfully:")
            print(f"   - Audio: {audio_path} ({len(audio_bytes) / 1024:.1f} KB, ~{total_duration:.2f}s)")
            print(f"   - Subtitles: {sub_path} ({len(words)} words tracked)")
            return True

        except Exception as e:
            last_error = e
            print(f"⚠️ Synthesis attempt {attempt} failed: {e}", file=sys.stderr)
            if attempt < max_retries:
                time.sleep(2 * attempt)

    print(f"❌ Failed to synthesize voiceover after {max_retries} attempts: {last_error}", file=sys.stderr)
    return False

def main():
    parser = argparse.ArgumentParser(description="Generate neural voiceover and karaoke subtitle timestamps.")
    parser.add_argument("positional_text", nargs="?", help="Voiceover text (optional if --text passed)")
    parser.add_argument("--text", "-t", help="Voiceover text to speak")
    parser.add_argument("--voice", "-v", default=DEFAULT_VOICE, help=f"Voice name (default: {DEFAULT_VOICE})")
    parser.add_argument("--audio-out", "-a", default="public/assets/audio/voiceover.mp3", help="Output MP3 path")
    parser.add_argument("--sub-out", "-s", default="public/assets/audio/subtitles.json", help="Output subtitles JSON path")

    args = parser.parse_args()
    text = args.text or args.positional_text or DEFAULT_TEXT

    # Find project root relative to script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    audio_path = os.path.join(project_root, args.audio_out) if not os.path.isabs(args.audio_out) else args.audio_out
    sub_path = os.path.join(project_root, args.sub_out) if not os.path.isabs(args.sub_out) else args.sub_out

    success = asyncio.run(synthesize_with_retry(text, args.voice, audio_path, sub_path))
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
