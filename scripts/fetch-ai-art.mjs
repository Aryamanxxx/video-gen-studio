import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    prompt: '',
    width: 1080,
    height: 1920,
    output: '',
    seed: Math.floor(Math.random() * 1000000),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--prompt' || arg === '-p') {
      options.prompt = args[++i];
    } else if (arg === '--width' || arg === '-w') {
      options.width = parseInt(args[++i], 10);
    } else if (arg === '--height' || arg === '-h') {
      options.height = parseInt(args[++i], 10);
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--seed' || arg === '-s') {
      options.seed = parseInt(args[++i], 10);
    } else if (!options.prompt) {
      options.prompt = arg;
    }
  }

  return options;
}

async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI-Art] Fetching image from Pollinations (attempt ${attempt}/${maxRetries})...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ZeroComputeStudio/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (err) {
      console.warn(`[AI-Art] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 2500 * attempt));
    }
  }
}

async function main() {
  const options = parseArgs();

  if (!options.prompt) {
    options.prompt =
      'post-apocalyptic abandoned ruined city street at night, ruined skyscrapers, blood moon, dark comic book illustration, gritty shadows, highly detailed';
    console.log(`[AI-Art] No prompt provided. Using default: "${options.prompt}"`);
  }

  if (!options.output) {
    const outputDir = path.resolve(__dirname, '../public/assets/generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    options.output = path.join(outputDir, `art-${Date.now()}.jpg`);
  } else {
    options.output = path.resolve(process.cwd(), options.output);
    const parentDir = path.dirname(options.output);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
  }

  const encodedPrompt = encodeURIComponent(options.prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${options.width}&height=${options.height}&seed=${options.seed}&nologo=true`;

  console.log(`[AI-Art] Query URL: ${url}`);
  console.log(`[AI-Art] Target Output: ${options.output}`);

  try {
    const imageBuffer = await fetchWithRetry(url);
    fs.writeFileSync(options.output, imageBuffer);
    console.log(`[AI-Art] SUCCESS! Image saved (${(imageBuffer.length / 1024).toFixed(1)} KB) -> ${options.output}`);
  } catch (err) {
    console.error(`[AI-Art] ERROR: Failed to generate art:`, err.message);
    process.exit(1);
  }
}

main();
