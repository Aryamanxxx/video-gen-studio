import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Locate best FFmpeg binary
function getFFmpegPath() {
  const staticPath = path.join(rootDir, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
  if (fs.existsSync(staticPath)) return staticPath;

  const remotionPath = path.join(
    rootDir,
    'node_modules',
    '@remotion',
    'compositor-win32-x64-msvc',
    'ffmpeg.exe'
  );
  if (fs.existsSync(remotionPath)) return remotionPath;

  return 'ffmpeg';
}

// 2. Format seconds to ASS timestamp (H:MM:SS.CC)
function formatAssTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

// 3. Build ASS Karaoke Subtitles
function generateAssSubtitles(subtitles, outputPath) {
  const header = `[Script Info]
Title: Fast Motion Comic Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Normal,Arial Black,56,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,1,4.5,0,2,60,60,340,1
Style: Active,Arial Black,62,&H0015CCFA,&H000000FF,&H00000000,&H80000000,-1,0,0,0,108,108,1,0,1,5.5,0,2,60,60,340,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  if (!subtitles || subtitles.length === 0) {
    fs.writeFileSync(outputPath, header + '\n');
    return;
  }

  // Group into 2-3 word chunks
  const wordsPerChunk = 2;
  const events = [];

  for (let i = 0; i < subtitles.length; i += wordsPerChunk) {
    const chunk = subtitles.slice(i, i + wordsPerChunk);
    const chunkStart = chunk[0].start;
    const chunkEnd = chunk[chunk.length - 1].end + 0.15;

    for (let j = 0; j < chunk.length; j++) {
      const activeWord = chunk[j];
      const startT = formatAssTime(activeWord.start);
      const endT = formatAssTime(activeWord.end + 0.05);

      // Build highlighted line
      const lineText = chunk
        .map((w, idx) =>
          idx === j
            ? `{\\rActive}${w.word.toUpperCase()}{\\rNormal}`
            : w.word.toUpperCase()
        )
        .join(' ');

      events.push(`Dialogue: 0,${startT},${endT},Normal,,0,0,0,,${lineText}`);
    }
  }

  fs.writeFileSync(outputPath, header + events.join('\n') + '\n');
  console.log(`[FFmpeg-Compiler] ✅ Generated ASS subtitles -> ${path.basename(outputPath)} (${events.length} dialog cues)`);
}

async function runFFmpeg(cmd, args) {
  return new Promise((resolve, reject) => {
    console.log(`[FFmpeg-Compiler] Executing: ${cmd} ${args.slice(0, 8).join(' ')} ...`);
    const proc = spawn(cmd, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

async function main() {
  const ffmpegBin = getFFmpegPath();
  console.log(`[FFmpeg-Compiler] Using FFmpeg binary: ${ffmpegBin}`);

  const startTime = Date.now();
  const storyDir = path.join(rootDir, 'public', 'story');
  const beatsDir = path.join(storyDir, 'beats');
  const planPath = path.join(storyDir, 'episode-plan.json');
  const audioPath = path.join(rootDir, 'public', 'assets', 'audio', 'voiceover.mp3');
  const subJsonPath = path.join(rootDir, 'public', 'assets', 'audio', 'subtitles.json');
  const assSubPath = path.join(storyDir, 'subtitles.ass');
  const outputDir = path.join(rootDir, 'outputs');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const finalOutput = path.join(outputDir, 'latest-episode.mp4');
  const storyEpisodeOutput = path.join(outputDir, 'story-episode.mp4');

  // 1. Check inputs
  if (!fs.existsSync(audioPath)) {
    console.error(`[FFmpeg-Compiler] ❌ Audio missing at ${audioPath}. Run "npm run voice" first.`);
    process.exit(1);
  }

  // Get audio duration or default to 25s
  let subtitles = [];
  if (fs.existsSync(subJsonPath)) {
    subtitles = JSON.parse(fs.readFileSync(subJsonPath, 'utf-8'));
  }
  const totalAudioDuration =
    subtitles.length > 0 ? subtitles[subtitles.length - 1].end + 1.2 : 25;

  // 2. Generate ASS subtitles
  generateAssSubtitles(subtitles, assSubPath);

  // 3. Find beat images
  let beatFiles = [];
  if (fs.existsSync(beatsDir)) {
    beatFiles = fs
      .readdirSync(beatsDir)
      .filter((f) => f.endsWith('.jpg') || f.endsWith('.png'))
      .sort()
      .map((f) => path.join(beatsDir, f));
  }

  if (beatFiles.length === 0) {
    console.error(`[FFmpeg-Compiler] ❌ No beat images in ${beatsDir}. Run "npm run art" or fetcher first.`);
    process.exit(1);
  }

  console.log(`[FFmpeg-Compiler] Found ${beatFiles.length} visual beats. Total duration: ${totalAudioDuration.toFixed(1)}s`);
  const durationPerBeat = (totalAudioDuration / beatFiles.length).toFixed(3);

  // 4. Create Concat Demuxer manifest
  const concatListPath = path.join(storyDir, 'concat-beats.txt');
  const concatContent = beatFiles
    .map((file) => `file '${file.replace(/\\/g, '/')}'\nduration ${durationPerBeat}`)
    .join('\n');

  // Repeat last image to satisfy FFmpeg concat demuxer quirks
  fs.writeFileSync(
    concatListPath,
    concatContent + `\nfile '${beatFiles[beatFiles.length - 1].replace(/\\/g, '/')}'\n`
  );

  // 5. Assemble high-performance filter graph
  // Escape Windows backslashes for FFmpeg subtitles filter
  const escapedAssPath = assSubPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  const videoFilter = [
    'scale=1080:1920:force_original_aspect_ratio=increase',
    'crop=1080:1920',
    'vignette=PI/5',
    `ass='${escapedAssPath}'`,
    'format=yuv420p',
  ].join(',');

  // Procedural audio tension drone (55Hz sub-bass sine + light noise) mixed with voiceover
  const audioFilter = [
    `[1:a]volume=1.0[v]`,
    `aevalsrc=0.08*sin(2*PI*55*t):d=${totalAudioDuration}[drone]`,
    `[v][drone]amix=inputs=2:duration=first:dropout_transition=1.5[aout]`,
  ].join(';');

  const ffmpegArgs = [
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    concatListPath,
    '-i',
    audioPath,
    '-filter_complex',
    `[0:v]${videoFilter}[vout];${audioFilter}`,
    '-map',
    '[vout]',
    '-map',
    '[aout]',
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '20',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-r',
    '30',
    '-t',
    totalAudioDuration.toString(),
    finalOutput,
  ];

  try {
    await runFFmpeg(ffmpegBin, ffmpegArgs);
    // Duplicate to story-episode.mp4 for convenience
    fs.copyFileSync(finalOutput, storyEpisodeOutput);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const stat = fs.statSync(finalOutput);
    console.log(`[FFmpeg-Compiler] 🚀 COMPILED IN ${elapsed}s!`);
    console.log(`[FFmpeg-Compiler] Output: ${finalOutput} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`[FFmpeg-Compiler] Output: ${storyEpisodeOutput}`);
  } catch (err) {
    console.error(`[FFmpeg-Compiler] ❌ Compilation failed:`, err);
    process.exit(1);
  }
}

main();
