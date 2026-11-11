import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { EpisodeManifest, GasStationAmbushManifest } from './episode-manifest';
import { Stage2D } from './Stage2D';
import { RiggedCharacter } from './characters/RiggedCharacter';
import { BarricadePlanks, BloodSplatter, SpeechBubble } from './props/PropsLibrary';
import { KaraokeSubtitles, SubtitleWord } from '../components/KaraokeSubtitles';
import { AudioLayer } from '../components/AudioLayer';
import subtitlesData from '../subtitles.json';

const subtitles: SubtitleWord[] = subtitlesData as SubtitleWord[];

export const EpisodePlayer: React.FC<{
  manifest?: EpisodeManifest;
}> = ({ manifest = GasStationAmbushManifest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 1. DETERMINE CURRENT ACTIVE SCENE
  const activeSceneIndex = manifest.scenes.findIndex(
    (scene) =>
      frame >= scene.startFrame &&
      frame < scene.startFrame + scene.durationInFrames
  );
  const safeSceneIndex = activeSceneIndex >= 0 ? activeSceneIndex : manifest.scenes.length - 1;
  const currentScene = manifest.scenes[safeSceneIndex];

  // 2. CAMERA INTERPOLATION ACROSS SCENE DURATION
  const localSceneFrame = frame - currentScene.startFrame;
  const sceneProgress = Math.min(
    1,
    Math.max(0, localSceneFrame / Math.max(1, currentScene.durationInFrames))
  );

  const currentZoom = interpolate(
    sceneProgress,
    [0, 1],
    [currentScene.camera.startZoom, currentScene.camera.endZoom]
  );
  const currentPanX = interpolate(
    sceneProgress,
    [0, 1],
    [currentScene.camera.startPanX, currentScene.camera.endPanX]
  );
  const currentPanY = interpolate(
    sceneProgress,
    [0, 1],
    [currentScene.camera.startPanY, currentScene.camera.endPanY]
  );
  const screenShake = currentScene.camera.shake ?? 0;

  // 3. SCENE 4 CLIFFHANGER OVERLAY
  const isCliffhangerScene = currentScene.id === 'scene-4';
  const cliffhangerSpring = spring({
    frame: Math.max(0, frame - 615),
    fps,
    config: { damping: 10, stiffness: 220, mass: 0.7 },
  });

  return (
    <AbsoluteFill style={{ background: '#05070d', overflow: 'hidden' }}>
      {/* 2D MULTI-PLANE STAGE */}
      <Stage2D
        cameraZoom={currentZoom}
        cameraPanX={currentPanX}
        cameraPanY={currentPanY}
        screenShake={screenShake}
        atmosphere={currentScene.atmosphere}
        background={
          <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
            {/* 2D Comic-style AI Background */}
            <Img
              src={staticFile(manifest.backgroundImage || 'assets/generated/gas-station-bg.jpg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.68) contrast(1.22)',
              }}
            />
            {/* Atmospheric night vignette & danger gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 75% 35%, rgba(220, 38, 38, 0.18) 0%, rgba(9, 13, 22, 0.75) 75%)',
                mixBlendMode: 'multiply',
              }}
            />
          </div>
        }
        midground={
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1080 1920"
            style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          >
            {/* SCENE PROPS */}
            {currentScene.props?.map((prop, idx) => {
              if (prop.type === 'barricade') {
                return (
                  <g
                    key={`prop-${idx}`}
                    transform={`translate(${prop.x}, ${prop.y}) scale(${prop.scale || 1})`}
                  >
                    <BarricadePlanks />
                  </g>
                );
              }
              if (prop.type === 'blood') {
                return (
                  <BloodSplatter
                    key={`prop-${idx}`}
                    x={prop.x}
                    y={prop.y}
                    scale={prop.scale || 1}
                    rotation={prop.rotation || 0}
                  />
                );
              }
              return null;
            })}

            {/* CHARACTERS PLACEMENT & DYNAMIC INTERPOLATION */}
            {currentScene.characters.map((placement, idx) => {
              const charConfig = manifest.characters[placement.characterId];
              if (!charConfig) return null;

              // Smoothly interpolate positions between start and end coordinates
              const posX =
                placement.endX !== undefined
                  ? interpolate(sceneProgress, [0, 1], [placement.startX, placement.endX])
                  : placement.startX;
              const posY =
                placement.endY !== undefined
                  ? interpolate(sceneProgress, [0, 1], [placement.startY, placement.endY])
                  : placement.startY;

              return (
                <RiggedCharacter
                  key={`char-${placement.characterId}-${idx}`}
                  x={posX}
                  y={posY}
                  scale={placement.scale || 2.2}
                  direction={placement.direction || 'right'}
                  action={placement.action}
                  expression={placement.expression}
                  style={charConfig.style}
                  heldProp={placement.heldProp}
                  isSpeaking={placement.isSpeaking}
                  subtitles={subtitles}
                  audioCurrentTimeSeconds={currentTime}
                />
              );
            })}
          </svg>
        }
        foreground={
          isCliffhangerScene ? (
            // Scene 4: Huge titan zombie silhouette with piercing glowing red eyes in foreground
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              style={{ position: 'absolute', pointerEvents: 'none' }}
            >
              <g transform="translate(860, 1280) scale(3.2)" opacity="0.96">
                {/* Silhouette Head */}
                <circle cx="0" cy="0" r="32" fill="#030712" />
                {/* Silhouette Torso & Broad Shoulders */}
                <path d="M -45 80 L -30 20 L 30 20 L 45 80 Z" fill="#030712" />
                {/* Glowing Menacing Piercing Red Eyes */}
                <circle
                  cx="-10"
                  cy="-4"
                  r="6"
                  fill="#ef4444"
                  style={{
                    filter: 'drop-shadow(0 0 16px #ef4444)',
                    opacity: 0.85 + 0.15 * Math.sin(frame * 0.3),
                  }}
                />
                <circle
                  cx="10"
                  cy="-4"
                  r="6"
                  fill="#ef4444"
                  style={{
                    filter: 'drop-shadow(0 0 16px #ef4444)',
                    opacity: 0.85 + 0.15 * Math.sin(frame * 0.3),
                  }}
                />
                <circle cx="-10" cy="-4" r="2.5" fill="#ffffff" />
                <circle cx="10" cy="-4" r="2.5" fill="#ffffff" />
              </g>
            </svg>
          ) : undefined
        }
      />

      {/* DIALOGUE BUBBLES LAYER */}
      {currentScene.dialogue?.map((bubble, idx) => {
        const isBubbleActive =
          frame >= bubble.startFrame &&
          frame < bubble.startFrame + bubble.durationFrames;

        if (!isBubbleActive) return null;

        return (
          <SpeechBubble
            key={`dialogue-${idx}`}
            text={bubble.text}
            speakerName={bubble.speakerName}
            speakerColor={bubble.speakerColor}
            x={bubble.x}
            y={bubble.y}
            startFrame={bubble.startFrame}
            width={380}
          />
        );
      })}

      {/* CLIFFHANGER SLAM CARD (SCENE 4: Frames 600-750) */}
      {isCliffhangerScene && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            pointerEvents: 'none',
            transform: `scale(${interpolate(cliffhangerSpring, [0, 1], [0.4, 1])})`,
            opacity: interpolate(cliffhangerSpring, [0, 0.4, 1], [0, 0.9, 1]),
          }}
        >
          <div
            style={{
              padding: '10px 26px',
              borderRadius: 8,
              background: '#dc2626',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: 3,
              marginBottom: 16,
              boxShadow: '0 0 25px rgba(220, 38, 38, 0.8)',
            }}
          >
            WARNING: MUTATION LEVEL 4
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.15,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              textShadow: '0 6px 20px rgba(0,0,0,0.9), 0 0 40px rgba(239, 68, 68, 0.6)',
              maxWidth: 820,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            THEY AREN'T SLOW ANYMORE...
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 28,
              fontWeight: 900,
              color: '#facc15',
              letterSpacing: 4,
              textTransform: 'uppercase',
              textShadow: '0 0 25px rgba(250, 204, 21, 0.7)',
              padding: '8px 24px',
              border: '2px solid rgba(250, 204, 21, 0.6)',
              borderRadius: 100,
              background: 'rgba(15, 23, 42, 0.85)',
            }}
          >
            PART 2 TOMORROW
          </div>
        </div>
      )}

      {/* KARAOKE SUBTITLES (Synchronized with speech audio) */}
      <KaraokeSubtitles
        subtitles={subtitles}
        wordsPerChunk={2}
        highlightColor="#facc15"
        normalColor="#ffffff"
        fontSize={60}
        bottomPercentage={16}
      />

      {/* DUCKED AUDIO LAYER */}
      <AudioLayer
        voiceoverSrc={staticFile('assets/audio/voiceover.mp3')}
        subtitles={subtitles}
        voiceVolume={1.0}
        musicBaseVolume={0.4}
        musicDuckedVolume={0.12}
      />

      {/* SERIES HUD / EPISODE WATERMARK */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 100,
        }}
      >
        <div
          style={{
            background: '#dc2626',
            color: '#fff',
            fontWeight: 900,
            fontSize: 16,
            padding: '4px 12px',
            borderRadius: 6,
            letterSpacing: 2,
            boxShadow: '0 0 16px rgba(220, 38, 38, 0.6)',
          }}
        >
          EPISODE 01
        </div>
        <div
          style={{
            color: '#94a3b8',
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 1.5,
          }}
        >
          {manifest.title}
        </div>
      </div>

      {/* REC BADGE / TIME CODE */}
      <div
        style={{
          position: 'absolute',
          top: 52,
          right: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#ef4444',
            opacity: Math.sin(frame * 0.2) > 0 ? 1 : 0.2,
            boxShadow: '0 0 10px #ef4444',
          }}
        />
        <div style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: 13, fontWeight: 800 }}>
          LIVE FEED
        </div>
      </div>

      {/* CINEMATIC BARS (Letterbox borders) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 24,
          background: '#000000',
          zIndex: 120,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          background: '#000000',
          zIndex: 120,
        }}
      />
    </AbsoluteFill>
  );
};
