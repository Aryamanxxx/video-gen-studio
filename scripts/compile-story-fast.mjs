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

// 3. Build ASS Karaoke Subtitles (Bold Yellow Active Pop)
function generateAssSubtitles(subtitles, outputPath) {
  const header = `[Script Info]
Title: Fast Multi-Angle Cinema Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Normal,Arial Black,56,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,1,4.5,0,2,60,60,340,1
Style: Active,Arial Black,64,&H0015CCFA,&H000000FF,&H00000000,&H80000000,-1,0,0,0,108,108,1,0,1,5.5,0,2,60,60,340,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  if (!subtitles || subtitles.length === 0) {
    fs.writeFileSync(outputPath, header + '\n');
    return;
  }

  const wordsPerChunk = 2;
  const events = [];

  for (let i = 0; i < subtitles.length; i += wordsPerChunk) {
    const chunk = subtitles.slice(i, i + wordsPerChunk);
    for (let j = 0; j < chunk.length; j++) {
      const activeWord = chunk[j];
      const startT = formatAssTime(activeWord.start);
      const endT = formatAssTime(activeWord.end + 0.05);

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

function runFFmpeg(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-300)}`));
    });
  });
}

// 4. Render each beat chunk with 0.15s punchy cut transitions
async function renderBeatChunk(ffmpegBin, beatNumber, beat, duration, chunkOut) {
  const padNum = String(beatNumber).padStart(2, '0');
  const clipFile = path.join(rootDir, 'public', 'story', 'clips', `clip-${padNum}.mp4`);
  const durStr = duration.toFixed(3);

  // STRICT LAW 12 ENFORCEMENT: ONLY REAL ANIMATED .MP4 CLIPS ALLOWED
  if (!fs.existsSync(clipFile) || fs.statSync(clipFile).size < 20000) {
    throw new Error(
      `[FFmpeg-Compiler] ❌ VIOLATION OF LAW 12: Beat #${beatNumber} is missing real animated video clip "${path.basename(clipFile)}"! ` +
      `Static images and zoompan slideshows are permanently banned. Every beat must be a real frame-by-frame animated .mp4 video clip.`
    );
  }

  console.log(`[FFmpeg-Compiler] 🎬 Beat #${beatNumber}: Real AI-Animated Video (${path.basename(clipFile)})`);
  
  // 0.15s punchy cut transition: contrast pop and subtle flash at the head of every angle
  const filterGraph = [
    'scale=1080:1920:force_original_aspect_ratio=increase',
    'crop=1080:1920',
    `eq=contrast='if(lt(t,0.15),1.20,1.0)':brightness='if(lt(t,0.15),0.04,0.0)'`,
    'vignette=PI/5',
    'format=yuv420p'
  ].join(',');

  const args = [
    '-y',
    '-stream_loop', '-1',
    '-i', clipFile,
    '-t', durStr,
    '-vf', filterGraph,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '19',
    '-r', '30',
    '-an',
    chunkOut
  ];
  await runFFmpeg(ffmpegBin, args);
}

async function main() {
  const ffmpegBin = getFFmpegPath();
  console.log(`[FFmpeg-Compiler] Using FFmpeg binary: ${ffmpegBin}`);

  const startTime = Date.now();
  const storyDir = path.join(rootDir, 'public', 'story');
  const chunksDir = path.join(storyDir, 'chunks');
  const planPath = path.join(storyDir, 'episode-plan.json');
  const audioPath = path.join(rootDir, 'public', 'assets', 'audio', 'voiceover.mp3');
  const subJsonPath = path.join(rootDir, 'public', 'assets', 'audio', 'subtitles.json');
  const assSubPath = path.join(storyDir, 'subtitles.ass');
  const outputDir = path.join(rootDir, 'outputs');

  if (!fs.existsSync(chunksDir)) fs.mkdirSync(chunksDir, { recursive: true });
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const finalOutput = path.join(outputDir, 'latest-episode.mp4');
  const stickocalypseOutput = path.join(outputDir, 'stickocalypse-ep1.mp4');
  const cloudEpisodeOutput = path.join(outputDir, 'real-cloud-episode.mp4');
  const allVideoOutput = path.join(outputDir, 'all-video-episode.mp4');

  // 1. Audio validation & total duration
  if (!fs.existsSync(audioPath)) {
    console.error(`[FFmpeg-Compiler] ❌ Audio missing at ${audioPath}.`);
    process.exit(1);
  }

  let subtitles = [];
  if (fs.existsSync(subJsonPath)) {
    subtitles = JSON.parse(fs.readFileSync(subJsonPath, 'utf-8'));
  }
  const totalAudioDuration =
    subtitles.length > 0 ? subtitles[subtitles.length - 1].end + 1.2 : 24.5;
  const durStr = totalAudioDuration.toFixed(2);

  // 2. Generate ASS karaoke subtitles
  generateAssSubtitles(subtitles, assSubPath);

  // 3. Load & Validate Episode Plan (Minimum 8 Distinct Shots Requirement)
  if (!fs.existsSync(planPath)) {
    throw new Error(`[FFmpeg-Compiler] ❌ Episode plan not found at ${planPath}!`);
  }
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
  const numBeats = plan.beats ? plan.beats.length : 0;

  if (numBeats < 8) {
    throw new Error(
      `[FFmpeg-Compiler] ❌ VIOLATION OF RETENTION STANDARD: Episode has only ${numBeats} beats! ` +
      `Short-drama cinematic standards require a minimum of 8 distinct shots (2.5-3.0s each) with zero repetition.`
    );
  }

  // Check that all clips are distinct (no duplicates)
  const clipPaths = plan.beats.map((b) =>
    path.join(rootDir, 'public', 'story', 'clips', `clip-${String(b.beatNumber).padStart(2, '0')}.mp4`)
  );
  const uniqueClips = new Set(clipPaths);
  if (uniqueClips.size !== clipPaths.length) {
    throw new Error(`[FFmpeg-Compiler] ❌ VIOLATION: Duplicate clips detected! Every scene must have a distinct .mp4 clip.`);
  }

  console.log(`[FFmpeg-Compiler] Processing ${numBeats} distinct cinema shots (Total duration: ${durStr}s)...`);

  // Distribute duration per beat
  const durationPerBeat = totalAudioDuration / numBeats;
  const chunkFiles = [];

  for (let idx = 0; idx < numBeats; idx++) {
    const beat = plan.beats[idx];
    const beatNum = beat.beatNumber || idx + 1;
    const beatDuration = beat.durationSeconds || durationPerBeat;
    const chunkPath = path.join(chunksDir, `chunk-${String(beatNum).padStart(2, '0')}.mp4`);
    
    await renderBeatChunk(ffmpegBin, beatNum, beat, beatDuration, chunkPath);
    chunkFiles.push(chunkPath);
  }

  // 4. Create Concat Demuxer manifest for chunks
  const concatListPath = path.join(storyDir, 'concat-chunks.txt');
  const concatContent = chunkFiles
    .map((file) => `file '${file.replace(/\\/g, '/')}'`)
    .join('\n');
  fs.writeFileSync(concatListPath, concatContent + '\n');

  // 5. Multi-Layer Procedural SFX Audio Synthesis + Subtitle Burn
  const escapedAssPath = assSubPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  const videoFilter = [
    `ass='${escapedAssPath}'`,
    'format=yuv420p',
  ].join(',');

  // Multi-layer procedural audio cues:
  // Layer 1: voiceover [1:a]
  // Layer 2: 45Hz heartbeat pulse (rhythmic survival anxiety)
  // Layer 3: 52Hz sub-bass drone drop (building tension)
  const audioFilter = [
    `[1:a]volume=1.0[voice]`,
    `aevalsrc='0.09*sin(2*PI*50*t)':d=${durStr}[subbass]`,
    `aevalsrc='0.11*sin(2*PI*45*t)*abs(sin(2*PI*1.2*t))':d=${durStr}[heartbeat]`,
    `[voice][subbass][heartbeat]amix=inputs=3:duration=first:dropout_transition=1.5[aout]`,
  ].join(';');

  const ffmpegArgs = [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatListPath,
    '-i', audioPath,
    '-filter_complex',
    `[0:v]${videoFilter}[vout];${audioFilter}`,
    '-map', '[vout]',
    '-map', '[aout]',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '19',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-r', '30',
    '-t', durStr,
    finalOutput,
  ];

  console.log(`[FFmpeg-Compiler] Stitching ${numBeats} cinema shots with multi-layer procedural SFX and subtitles...`);
  await runFFmpeg(ffmpegBin, ffmpegArgs);

  // Copy to destination files
  fs.copyFileSync(finalOutput, stickocalypseOutput);
  fs.copyFileSync(finalOutput, cloudEpisodeOutput);
  fs.copyFileSync(finalOutput, allVideoOutput);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const stat = fs.statSync(finalOutput);
  console.log(`\n======================================================`);
  console.log(`[FFmpeg-Compiler] 🚀 COMPILED IN ${elapsed}s!`);
  console.log(`[FFmpeg-Compiler] Primary Output: ${finalOutput} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`[FFmpeg-Compiler] Episode Output: ${stickocalypseOutput}`);
  console.log(`[FFmpeg-Compiler] Cloud Output: ${cloudEpisodeOutput}`);
  console.log(`[FFmpeg-Compiler] All-Video Output: ${allVideoOutput}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('[FFmpeg-Compiler] ❌ Fatal error:', err);
  process.exit(1);
});
