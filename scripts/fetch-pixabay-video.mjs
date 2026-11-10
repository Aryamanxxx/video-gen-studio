#!/usr/bin/env node

/**
 * Lightweight Pixabay Stock Video Fetcher
 * Zero dependencies — Uses Node 18+ native fetch & fs
 *
 * Usage:
 *   node scripts/fetch-pixabay-video.mjs <query> [filename]
 *
 * Example:
 *   node scripts/fetch-pixabay-video.mjs "cyberpunk city" cyberpunk-city.mp4
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Auto-load .env if PIXABAY_API_KEY not already in environment
function loadEnv() {
  if (process.env.PIXABAY_API_KEY) return;
  const envPath = path.join(rootDir, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const apiKey = process.env.PIXABAY_API_KEY;
if (!apiKey || apiKey === "your_pixabay_api_key_here") {
  console.error("❌ Error: PIXABAY_API_KEY is not set or invalid in .env");
  process.exit(1);
}

const query = process.argv[2];
let targetFilename = process.argv[3];

if (!query) {
  console.error("❌ Usage: node scripts/fetch-pixabay-video.mjs <query> [filename]");
  process.exit(1);
}

if (!targetFilename) {
  // Generate safe filename from query
  const safeName = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  targetFilename = `${safeName}.mp4`;
}

if (!targetFilename.endsWith(".mp4")) {
  targetFilename += ".mp4";
}

const assetsDir = path.join(rootDir, "public", "assets");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const outputPath = path.join(assetsDir, targetFilename);

async function fetchPixabayVideo() {
  console.log(`🔍 Searching Pixabay for video: "${query}"...`);
  const apiUrl = `https://pixabay.com/api/videos/?key=${encodeURIComponent(
    apiKey
  )}&q=${encodeURIComponent(query)}&video_type=film&per_page=5`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`Pixabay API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.hits || data.hits.length === 0) {
    throw new Error(`No video hits found on Pixabay for query: "${query}"`);
  }

  console.log(`✓ Found ${data.hits.length} video hits. Selecting best candidate...`);

  // Inspect hits to pick the best video URL
  let selectedHit = null;
  let selectedVideo = null;
  let selectedQuality = "";

  for (const hit of data.hits) {
    if (!hit.videos) continue;
    // Inspect available formats
    // Prefer small (960x540) or medium (720p/1080p) under 30MB for fast git transfer & cloud matrix rendering
    const candidates = [
      { name: "small", v: hit.videos.small },
      { name: "medium", v: hit.videos.medium },
      { name: "large", v: hit.videos.large },
    ].filter((c) => c.v && c.v.url);

    // Pick candidate: prefer small/medium under 30MB
    let best = candidates.find((c) => c.name === "small" && (c.v.size || 0) < 30 * 1024 * 1024);
    if (!best) {
      best = candidates.find((c) => c.name === "medium" && (c.v.size || 0) < 30 * 1024 * 1024);
    }
    if (!best && candidates.length > 0) {
      best = candidates[0];
    }

    if (best) {
      selectedHit = hit;
      selectedVideo = best.v;
      selectedQuality = `${best.name} (${best.v.width}x${best.v.height})`;
      break;
    }
  }

  if (!selectedVideo || !selectedVideo.url) {
    throw new Error("No valid MP4 video download URLs found in the hits.");
  }

  console.log(`🎬 Selected Video ID #${selectedHit.id}:`);
  console.log(`   - Tags: ${selectedHit.tags}`);
  console.log(`   - Duration: ${selectedHit.duration}s`);
  console.log(`   - Resolution: ${selectedVideo.width}x${selectedVideo.height} (${selectedQuality})`);
  console.log(`   - Download URL: ${selectedVideo.url}`);

  console.log(`⬇️ Downloading to ${path.relative(rootDir, outputPath)}...`);
  const videoRes = await fetch(selectedVideo.url);
  if (!videoRes.ok) {
    throw new Error(`Failed to download video file: ${videoRes.status} ${videoRes.statusText}`);
  }

  const arrayBuffer = await videoRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);

  const stats = fs.statSync(outputPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Successfully saved ${targetFilename} (${sizeMb} MB) to public/assets/`);
  console.log(`   Local Path: ${outputPath}`);
}

fetchPixabayVideo().catch((err) => {
  console.error(`❌ Failed:`, err.message);
  process.exit(1);
});
