import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const CHARACTER_BIBLE =
  '2D flat vector stickman survival animation style, Beanie Survives aesthetic, clean round white stickman head with expressive cartoon eyes, thick black ink outlines, protagonist wearing a crimson red knit beanie and dark tactical backpack, gritty dark atmospheric 2D comic background, dramatic rim lighting, high contrast, no text in image -- ';

async function main() {
  const planPath = path.join(rootDir, 'public', 'story', 'episode-plan.json');
  const pythonBin = path.join(rootDir, '.mcp-servers', 'mcp-video-gen', '.venv', 'Scripts', 'python.exe');
  const fluxGenScript = path.join(rootDir, 'scripts', 'cloud-flux-gen.py');

  console.log('[Art-Director] 🚀 Generating 2D Motion-Comic Story Beats via Hugging Face Cloud FLUX.1 (ZeroGPU)...');

  if (!fs.existsSync(pythonBin)) {
    throw new Error(`Python virtual environment binary not found at ${pythonBin}`);
  }

  // Trigger Python Cloud FLUX.1 generator
  const result = spawnSync(pythonBin, [fluxGenScript, '--all', '--plan', planPath], {
    stdio: 'inherit',
    env: process.env,
    cwd: rootDir,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Cloud FLUX.1 generation failed with exit code ${result.status}`);
  }

  console.log('[Art-Director] ✅ All story beats generated and verified via FLUX.1-schnell!');
}

main().catch((err) => {
  console.error('[Art-Director] ❌ Fatal error in beat generation:', err.message);
  process.exit(1);
});
