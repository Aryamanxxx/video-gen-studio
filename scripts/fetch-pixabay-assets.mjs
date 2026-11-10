#!/usr/bin/env node

/**
 * Universal Pixabay Asset Fetcher (Videos & Photos)
 * Supports horizontal (16:9) and vertical (9:16 mobile reels/shorts)
 * Zero external dependencies — Uses native Node.js fetch and fs
 *
 * Usage:
 *   node scripts/fetch-pixabay-assets.mjs <query> [type: video|photo] [orientation: vertical|horizontal|all] [outputPath]
 *
 * Examples:
 *   node scripts/fetch-pixabay-assets.mjs "cyberpunk" video vertical test-clip.mp4
 *   node scripts/fetch-pixabay-assets.mjs "neon night" photo horizontal bg.jpg
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Auto-load .env
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
  console.error("❌ Error: PIXABAY_API_KEY is missing or invalid in .env");
  process.exit(1);
}

// 2. Parse arguments (supports positional and flags)
const args = process.argv.slice(2);
let query = "";
let assetType = "video"; // video | photo
let orientation = "all"; // vertical | horizontal | all
let outputPath = "";

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--query" || arg === "-q") {
    query = args[++i];
  } else if (arg === "--type" || arg === "-t") {
    assetType = args[++i].toLowerCase();
  } else if (arg === "--orientation" || arg === "-o") {
    orientation = args[++i].toLowerCase();
  } else if (arg === "--out") {
    outputPath = args[++i];
  } else if (!query) {
    query = arg;
  } else if (i === 1 && (arg === "video" || arg === "photo")) {
    assetType = arg;
  } else if (i === 2 && (arg === "vertical" || arg === "horizontal" || arg === "all")) {
    orientation = arg;
  } else if (!outputPath) {
    outputPath = arg;
  }
}

if (!query) {
  console.error("❌ Error: Missing search query.");
  console.error("Usage: node scripts/fetch-pixabay-assets.mjs <query> [video|photo] [vertical|horizontal|all] [output.mp4]");
  process.exit(1);
}

// Ensure default output filename if not specified
if (!outputPath) {
  const safeName = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const ext = assetType === "photo" ? ".jpg" : ".mp4";
  outputPath = path.join("public", "assets", `${safeName}${ext}`);
} else if (!path.isAbsolute(outputPath) && !outputPath.startsWith("public")) {
  outputPath = path.join("public", "assets", outputPath);
}

const resolvedOutPath = path.resolve(rootDir, outputPath);
const targetDir = path.dirname(resolvedOutPath);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 3. Robust Fetch with Exponential Backoff Retry Logic
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (res.status === 429) {
        console.warn(`⚠️ Rate-limited (429). Retrying in ${delay}ms... (Attempt ${attempt}/${retries})`);
      } else {
        console.warn(`⚠️ API responded with ${res.status} ${res.statusText}. Retrying in ${delay}ms...`);
      }
    } catch (err) {
      console.warn(`⚠️ Network fetch error: ${err.message}. Retrying in ${delay}ms...`);
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error(`Failed after ${retries} attempts: ${url}`);
}

// 4. Video Downloader
async function handleVideo() {
  console.log(`🔍 Searching Pixabay videos for: "${query}" (Orientation: ${orientation})...`);
  let apiUrl = `https://pixabay.com/api/videos/?key=${encodeURIComponent(
    apiKey
  )}&q=${encodeURIComponent(query)}&video_type=film&per_page=10`;

  if (orientation === "vertical" || orientation === "horizontal") {
    apiUrl += `&orientation=${orientation}`;
  }

  const res = await fetchWithRetry(apiUrl);
  const data = await res.json();

  if (!data.hits || data.hits.length === 0) {
    throw new Error(`No videos found on Pixabay matching query: "${query}"`);
  }

  console.log(`✓ Received ${data.hits.length} candidate videos. Selecting best match...`);

  let selectedHit = null;
  let selectedVideo = null;
  let selectedQuality = "";

  for (const hit of data.hits) {
    if (!hit.videos) continue;

    // Check orientation if specified
    const sample = hit.videos.medium || hit.videos.large || hit.videos.small;
    if (sample && sample.width && sample.height) {
      const isVertical = sample.height > sample.width;
      if (orientation === "vertical" && !isVertical) continue;
      if (orientation === "horizontal" && isVertical) continue;
    }

    // Candidate resolutions
    const candidates = [
      { name: "small", v: hit.videos.small },
      { name: "medium", v: hit.videos.medium },
      { name: "large", v: hit.videos.large },
    ].filter((c) => c.v && c.v.url);

    // Prefer 1080p / 720p with reasonable file size (< 45 MB)
    let best = candidates.find((c) => c.name === "small" && (c.v.size || 0) < 30 * 1024 * 1024);
    if (!best) {
      best = candidates.find((c) => c.name === "medium" && (c.v.size || 0) < 45 * 1024 * 1024);
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

  // Fallback: If orientation filter was too strict, grab the top available hit
  if (!selectedVideo && data.hits.length > 0) {
    const fallbackHit = data.hits[0];
    const candidate = fallbackHit.videos.small || fallbackHit.videos.medium || fallbackHit.videos.large;
    if (candidate && candidate.url) {
      selectedHit = fallbackHit;
      selectedVideo = candidate;
      selectedQuality = `${candidate.width}x${candidate.height} (fallback)`;
    }
  }

  if (!selectedVideo || !selectedVideo.url) {
    throw new Error("No valid downloadable MP4 stream found in video hits.");
  }

  console.log(`🎬 Selected Video ID #${selectedHit.id}:`);
  console.log(`   - Tags: ${selectedHit.tags}`);
  console.log(`   - Duration: ${selectedHit.duration}s`);
  console.log(`   - Resolution: ${selectedQuality}`);
  console.log(`   - URL: ${selectedVideo.url}`);

  console.log(`⬇️ Downloading to ${path.relative(rootDir, resolvedOutPath)}...`);
  const downloadRes = await fetchWithRetry(selectedVideo.url);
  const arrayBuffer = await downloadRes.arrayBuffer();
  fs.writeFileSync(resolvedOutPath, Buffer.from(arrayBuffer));

  const stats = fs.statSync(resolvedOutPath);
  console.log(`✅ Video saved: ${(stats.size / (1024 * 1024)).toFixed(2)} MB -> ${resolvedOutPath}`);
}

// 5. Photo Downloader
async function handlePhoto() {
  console.log(`🔍 Searching Pixabay photos for: "${query}" (Orientation: ${orientation})...`);
  let apiUrl = `https://pixabay.com/api/?key=${encodeURIComponent(
    apiKey
  )}&q=${encodeURIComponent(query)}&image_type=photo&per_page=10`;

  if (orientation === "vertical" || orientation === "horizontal") {
    apiUrl += `&orientation=${orientation}`;
  }

  const res = await fetchWithRetry(apiUrl);
  const data = await res.json();

  if (!data.hits || data.hits.length === 0) {
    throw new Error(`No photos found on Pixabay matching query: "${query}"`);
  }

  const hit = data.hits[0];
  const photoUrl = hit.largeImageURL || hit.imageURL || hit.webformatURL;

  if (!photoUrl) {
    throw new Error("No valid image URL found in top photo hit.");
  }

  console.log(`📸 Selected Photo ID #${hit.id}: ${hit.tags} (${hit.imageWidth}x${hit.imageHeight})`);
  console.log(`⬇️ Downloading to ${path.relative(rootDir, resolvedOutPath)}...`);

  const downloadRes = await fetchWithRetry(photoUrl);
  const arrayBuffer = await downloadRes.arrayBuffer();
  fs.writeFileSync(resolvedOutPath, Buffer.from(arrayBuffer));

  const stats = fs.statSync(resolvedOutPath);
  console.log(`✅ Photo saved: ${(stats.size / 1024).toFixed(1)} KB -> ${resolvedOutPath}`);
}

// Main execution
(async () => {
  try {
    if (assetType === "photo") {
      await handlePhoto();
    } else {
      await handleVideo();
    }
  } catch (err) {
    console.error(`❌ Pixabay Fetch Failed: ${err.message}`);
    process.exit(1);
  }
})();
