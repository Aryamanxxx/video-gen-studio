import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const CHARACTER_BIBLE =
  '2D flat vector stickman survival animation style, Beanie Survives aesthetic, clean round white stickman head with expressive cartoon eyes, thick black ink outlines, protagonist wearing a crimson red knit beanie and dark tactical backpack, gritty dark atmospheric 2D comic background, dramatic rim lighting, high contrast, no text in image -- ';

async function fetchBeatImage(url, outputPath, beatNum, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Art-Director] Fetching Beat #${beatNum} (Attempt ${attempt}/${maxRetries})...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ZeroComputeStudio/2.0',
          'Referer': 'https://pollinations.ai/',
        },
      });

      if (response.status === 402) {
        const errorText = await response.text();
        const retryMatch = errorText.match(/Retry after (\d+)s/);
        const waitSec = retryMatch ? parseInt(retryMatch[1], 10) + 2 : 15;
        console.warn(`[Art-Director] ⏳ Pollinations rate limit reached. Waiting ${waitSec}s before retrying Beat #${beatNum}...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
      console.log(`[Art-Director] ✅ Beat #${beatNum} saved (${(buffer.length / 1024).toFixed(1)} KB) -> ${path.basename(outputPath)}`);
      return true;
    } catch (err) {
      console.warn(`[Art-Director] ⚠️ Beat #${beatNum} attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
}

async function main() {
  const planPath = path.join(rootDir, 'public', 'story', 'episode-plan.json');
  const beatsDir = path.join(rootDir, 'public', 'story', 'beats');

  if (!fs.existsSync(beatsDir)) {
    fs.mkdirSync(beatsDir, { recursive: true });
  }

  let plan;
  if (fs.existsSync(planPath)) {
    plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
    console.log(`[Art-Director] Loaded episode plan: "${plan.title}" (${plan.beats.length} beats)`);
  } else {
    console.log(`[Art-Director] No episode plan found at ${planPath}. Using default 3-beat storyboard.`);
    plan = {
      title: 'DEFAULT SURVIVAL TEST',
      seed: 884210,
      beats: [
        {
          beatNumber: 1,
          prompt: 'protagonist standing outside abandoned convenience store at night, flashlight cutting through dark fog',
        },
        {
          beatNumber: 2,
          prompt: 'protagonist stepping over shattered glass inside store, two dark shadow infected lunging from behind shelves',
        },
        {
          beatNumber: 3,
          prompt: 'protagonist aiming shotgun with bright muzzle flash, infected knocked back into broken counter',
        },
      ],
    };
  }

  const baseSeed = plan.seed || Math.floor(Math.random() * 1000000);
  console.log(`[Art-Director] Generating ${plan.beats.length} visual beats (Seed: ${baseSeed})...`);
  const startTime = Date.now();

  const pollenKey = process.env.POLLEN_API_KEY || process.env.POLLINATIONS_API_KEY;

  for (let idx = 0; idx < plan.beats.length; idx++) {
    const beat = plan.beats[idx];
    const beatIndex = beat.beatNumber || idx + 1;
    const filename = `beat-${String(beatIndex).padStart(2, '0')}.jpg`;
    const outputPath = path.join(beatsDir, filename);

    // Skip if already generated and valid
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000) {
      console.log(`[Art-Director] ⏩ Beat #${beatIndex} already exists (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB) -> skipping download`);
      continue;
    }

    const fullPrompt = CHARACTER_BIBLE + beat.prompt;
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const beatSeed = baseSeed + beatIndex * 73;

    let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${beatSeed}`;
    if (pollenKey) {
      url += `&key=${pollenKey}&model=flux`;
    }

    await fetchBeatImage(url, outputPath, beatIndex);
  }

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[Art-Director] 🚀 ALL BEATS READY in ${elapsedSec}s!`);
}

main();
