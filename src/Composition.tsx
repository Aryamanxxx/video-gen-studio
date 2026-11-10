import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AudioLayer, KaraokeSubtitles, KenBurnsVideo } from "./components";
import subtitlesData from "./subtitles.json";

// --- Design Tokens (Optimized for 1080x1920 Mobile Reels) ---
const THEME = {
  bg: "#05070c",
  cardBg: "rgba(10, 16, 31, 0.82)",
  cardBorder: "rgba(56, 189, 248, 0.35)",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  cyan: "#06b6d4",
  cyanGlow: "#38bdf8",
  purple: "#8b5cf6",
  violetGlow: "#c084fc",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', 'Helvetica Neue', sans-serif",
};

// --- Mobile Vignette & Safe Area Gradient Overlay ---
const MobileVignette: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 10,
        background:
          "linear-gradient(180deg, rgba(5,7,12,0.85) 0%, rgba(5,7,12,0.35) 25%, rgba(5,7,12,0.35) 68%, rgba(5,7,12,0.92) 100%)",
      }}
    />
  );
};

// --- Top HUD Bar ---
const TopHUDBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 20,
        transform: `translateY(${(1 - entrance) * -40}px)`,
        opacity: entrance,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 28px",
          borderRadius: 9999,
          background: "rgba(10, 16, 31, 0.85)",
          backdropFilter: "blur(18px)",
          border: `1px solid ${THEME.cyan}60`,
          boxShadow: `0 0 25px rgba(6, 182, 212, 0.35)`,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: THEME.rose,
            boxShadow: `0 0 14px ${THEME.rose}`,
          }}
        />
        <span
          style={{
            color: THEME.textPrimary,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontFamily: THEME.fontFamily,
          }}
        >
          VIRAL HOOK PSYCHOLOGY
        </span>
      </div>
    </div>
  );
};

// --- Scene 1: 00:03 Stopwatch Countdown Window (0.0s–2.5s / frames 0–75) ---
const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popSpring = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 140 },
  });

  const countdown = Math.max(0, 3 - Math.floor(frame / (fps / 3)));
  const pulse = interpolate(Math.sin((frame / 6) * Math.PI), [-1, 1], [0.96, 1.04]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        zIndex: 15,
        fontFamily: THEME.fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${popSpring * pulse})`,
          opacity: popSpring,
        }}
      >
        {/* Giant Circular Digital Timer Badge */}
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(10, 16, 31, 0.9)",
            backdropFilter: "blur(24px)",
            border: `5px solid ${THEME.amber}`,
            boxShadow: `0 0 60px ${THEME.amber}60, inset 0 0 40px ${THEME.amber}30`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 36,
          }}
        >
          <span style={{ fontSize: 44 }}>⏱️</span>
          <span
            style={{
              fontSize: 104,
              fontWeight: 900,
              color: THEME.amber,
              lineHeight: 1,
              letterSpacing: -2,
              textShadow: `0 0 35px ${THEME.amber}80`,
            }}
          >
            00:0{countdown}
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: THEME.textSecondary,
              letterSpacing: 2,
              marginTop: 6,
            }}
          >
            SECONDS
          </span>
        </div>

        {/* Warning Badge */}
        <div
          style={{
            background: "rgba(244, 63, 94, 0.2)",
            border: `2px solid ${THEME.rose}`,
            borderRadius: 16,
            padding: "14px 34px",
            boxShadow: `0 0 30px rgba(244, 63, 94, 0.4)`,
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            CRITICAL ATTENTION WINDOW
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 2: Social Media Swipe Simulator (2.5s–5.0s / frames 75–150) ---
const SceneTwo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  const swipeY = interpolate(frame, [0, 45], [0, -140], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        zIndex: 15,
        fontFamily: THEME.fontFamily,
      }}
    >
      <div
        style={{
          width: 820,
          background: THEME.cardBg,
          backdropFilter: "blur(28px)",
          border: `2px solid ${THEME.cyanGlow}`,
          borderRadius: 32,
          padding: "50px 44px",
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(6, 182, 212, 0.3)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${entrance}) translateY(${swipeY}px)`,
          opacity: entrance,
        }}
      >
        <span style={{ fontSize: 64, marginBottom: 16 }}>📱</span>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: THEME.textPrimary,
            margin: "0 0 16px 0",
            textAlign: "center",
          }}
        >
          FEEDS MOVE AT LIGHTSPEED
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "rgba(244, 63, 94, 0.18)",
            border: `1px solid ${THEME.rose}70`,
            borderRadius: 9999,
            padding: "10px 24px",
          }}
        >
          <span style={{ fontSize: 24 }}>⬆️</span>
          <span
            style={{
              color: THEME.rose,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 1.5,
            }}
          >
            SWIPED AWAY IN 0.3 SECONDS
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 3: The 3 Golden Triggers (5.0s–8.0s / frames 150–240) ---
const SceneThree: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const triggers = [
    { icon: "⚡", title: "SHOCK", subtitle: "Defy common expectations", color: THEME.rose, delay: 0 },
    { icon: "💡", title: "TEACH", subtitle: "Instant micro-value insight", color: THEME.emerald, delay: 15 },
    { icon: "🔥", title: "CURIOSITY", subtitle: "Open an irresistible loop", color: THEME.amber, delay: 30 },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        zIndex: 15,
        fontFamily: THEME.fontFamily,
        padding: "0 80px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 880, display: "flex", flexDirection: "column", gap: 24 }}>
        {triggers.map((item, idx) => {
          const itemSpring = spring({
            frame: Math.max(0, frame - item.delay),
            fps,
            config: { damping: 12, stiffness: 130 },
          });

          return (
            <div
              key={idx}
              style={{
                background: THEME.cardBg,
                backdropFilter: "blur(24px)",
                border: `2px solid ${item.color}70`,
                borderRadius: 24,
                padding: "26px 36px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                boxShadow: `0 15px 40px rgba(0,0,0,0.5), 0 0 25px ${item.color}30`,
                transform: `translateX(${(1 - itemSpring) * -60}px) scale(${itemSpring})`,
                opacity: itemSpring,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  background: `${item.color}25`,
                  border: `2px solid ${item.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 38, fontWeight: 900, color: item.color, letterSpacing: 1.5 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 24, color: THEME.textSecondary, fontWeight: 600 }}>
                  {item.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 4: 97% Drop-Off Alarm (8.0s–11.0s / frames 240–330) ---
const SceneFour: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 140 },
  });

  const flash = interpolate(Math.sin((frame / 5) * Math.PI), [-1, 1], [0.8, 1.2]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        zIndex: 15,
        fontFamily: THEME.fontFamily,
      }}
    >
      <div
        style={{
          width: 840,
          background: "rgba(20, 8, 14, 0.88)",
          backdropFilter: "blur(28px)",
          border: `3px solid ${THEME.rose}`,
          borderRadius: 36,
          padding: "60px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: `0 0 60px ${THEME.rose}50`,
          transform: `scale(${entrance * flash})`,
          opacity: entrance,
        }}
      >
        <span style={{ fontSize: 64, marginBottom: 12 }}>⚠️</span>
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: THEME.rose,
            lineHeight: 1,
            letterSpacing: -3,
            textShadow: `0 0 40px ${THEME.rose}80`,
            marginBottom: 16,
          }}
        >
          97%
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: THEME.textPrimary,
            textAlign: "center",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          DROP OFF BEFORE SECOND THREE
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 5: Banned Weak Intros (11.0s–14.0s / frames 330–420) ---
const SceneFive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        zIndex: 15,
        fontFamily: THEME.fontFamily,
      }}
    >
      <div
        style={{
          width: 860,
          background: THEME.cardBg,
          backdropFilter: "blur(28px)",
          border: `2px solid rgba(244,63,94,0.6)`,
          borderRadius: 32,
          padding: "54px 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: `0 25px 60px rgba(0,0,0,0.6)`,
          transform: `scale(${entrance})`,
          opacity: entrance,
        }}
      >
        <span
          style={{
            color: THEME.rose,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          FATAL RETENTION KILLER
        </span>
        <p
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: THEME.textSecondary,
            textAlign: "center",
            textDecoration: "line-through",
            textDecorationColor: THEME.rose,
            textDecorationThickness: 5,
            margin: "0 0 24px 0",
            lineHeight: 1.4,
          }}
        >
          “Hey guys, what is up, today we are going to talk about...”
        </p>
        <div
          style={{
            background: THEME.rose,
            color: "#ffffff",
            padding: "12px 32px",
            borderRadius: 9999,
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 2,
          }}
        >
          BAN SLOW INTROS FOREVER
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 6: Algorithm Master Crown (14.0s–17.0s / frames 420–510) ---
const SceneSix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 130 },
  });

  const pulse = interpolate(Math.sin((frame / 8) * Math.PI), [-1, 1], [0.97, 1.03]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        zIndex: 15,
        fontFamily: THEME.fontFamily,
      }}
    >
      <div
        style={{
          width: 860,
          background: "rgba(10, 20, 36, 0.9)",
          backdropFilter: "blur(28px)",
          border: `3px solid ${THEME.emerald}`,
          borderRadius: 36,
          padding: "60px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: `0 0 60px ${THEME.emerald}45`,
          transform: `scale(${entrance * pulse})`,
          opacity: entrance,
        }}
      >
        <span style={{ fontSize: 72, marginBottom: 12 }}>👑</span>
        <h2
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: THEME.textPrimary,
            textAlign: "center",
            margin: "0 0 16px 0",
            letterSpacing: -1,
          }}
        >
          MASTER THE HOOK
        </h2>
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: THEME.emerald,
            letterSpacing: 2,
            textTransform: "uppercase",
            textShadow: `0 0 25px ${THEME.emerald}80`,
          }}
        >
          MASTER THE ALGORITHM
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 7: Save & Follow Outro CTA (17.0s–20.0s / frames 510–600) ---
const SceneSeven: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        zIndex: 15,
        fontFamily: THEME.fontFamily,
      }}
    >
      <div
        style={{
          width: 860,
          background: THEME.cardBg,
          backdropFilter: "blur(32px)",
          border: `2px solid ${THEME.cyanGlow}`,
          borderRadius: 36,
          padding: "64px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: `0 25px 70px rgba(0,0,0,0.7), 0 0 45px rgba(6, 182, 212, 0.35)`,
          transform: `scale(${entrance})`,
          opacity: entrance,
        }}
      >
        <span style={{ fontSize: 68, marginBottom: 16 }}>💾</span>
        <h2
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: THEME.textPrimary,
            textAlign: "center",
            margin: "0 0 16px 0",
            letterSpacing: -1,
          }}
        >
          SAVE THIS REEL
        </h2>
        <p
          style={{
            fontSize: 26,
            color: THEME.textSecondary,
            textAlign: "center",
            margin: "0 0 36px 0",
          }}
        >
          Never post a weak video hook again.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: `linear-gradient(135deg, ${THEME.cyan}, ${THEME.purple})`,
            padding: "16px 36px",
            borderRadius: 9999,
            boxShadow: `0 10px 30px rgba(6, 182, 212, 0.4)`,
          }}
        >
          <span style={{ color: "#ffffff", fontSize: 26, fontWeight: 900 }}>
            Follow @VideoStudioAI
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Main 20-Second Vertical Reel Composition (600 frames @ 30fps) ---
export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      {/* 1. Cinematic B-Roll Layer with Continuous KenBurns Camera Motions */}
      {/* Cut 1: Stopwatch Countdown (0s to 2.5s -> 0 to 75 frames) */}
      <Sequence from={0} durationInFrames={75}>
        <KenBurnsVideo
          src={staticFile("assets/stopwatch-timer.mp4")}
          startScale={1.0}
          endScale={1.22}
          panDirection="down"
          panDistance={40}
          opacity={0.42}
        />
      </Sequence>

      {/* Cut 2: Scrolling Phone (2.5s to 5.0s -> 75 to 150 frames) */}
      <Sequence from={75} durationInFrames={75}>
        <KenBurnsVideo
          src={staticFile("assets/phone-scroll.mp4")}
          startScale={1.18}
          endScale={1.02}
          panDirection="up"
          panDistance={35}
          opacity={0.38}
        />
      </Sequence>

      {/* Cut 3: Walking City Crowd (5.0s to 8.0s -> 150 to 240 frames) */}
      <Sequence from={150} durationInFrames={90}>
        <KenBurnsVideo
          src={staticFile("assets/city-crowd.mp4")}
          startScale={1.02}
          endScale={1.20}
          panDirection="left"
          panDistance={45}
          opacity={0.40}
        />
      </Sequence>

      {/* Cut 4: Scrolling Phone Fast Swipe (8.0s to 11.0s -> 240 to 330 frames) */}
      <Sequence from={240} durationInFrames={90}>
        <KenBurnsVideo
          src={staticFile("assets/phone-scroll.mp4")}
          startScale={1.0}
          endScale={1.22}
          panDirection="right"
          panDistance={40}
          opacity={0.38}
        />
      </Sequence>

      {/* Cut 5: Stopwatch Time Elapsed (11.0s to 14.0s -> 330 to 420 frames) */}
      <Sequence from={330} durationInFrames={90}>
        <KenBurnsVideo
          src={staticFile("assets/stopwatch-timer.mp4")}
          startScale={1.22}
          endScale={1.04}
          panDirection="down"
          panDistance={35}
          opacity={0.42}
        />
      </Sequence>

      {/* Cut 6: City Crowd Peak Reach (14.0s to 17.0s -> 420 to 510 frames) */}
      <Sequence from={420} durationInFrames={90}>
        <KenBurnsVideo
          src={staticFile("assets/city-crowd.mp4")}
          startScale={1.0}
          endScale={1.25}
          panDirection="up"
          panDistance={50}
          opacity={0.42}
        />
      </Sequence>

      {/* Cut 7: Outro Digital Server Grid (17.0s to 20.0s -> 510 to 600 frames) */}
      <Sequence from={510} durationInFrames={90}>
        <KenBurnsVideo
          src={staticFile("assets/server-data.mp4")}
          startScale={1.05}
          endScale={1.18}
          panDirection="left"
          panDistance={30}
          opacity={0.36}
        />
      </Sequence>

      {/* 2. Dark Vignette & Safe Zones */}
      <MobileVignette />

      {/* 3. Persistent Top HUD Header */}
      <TopHUDBar />

      {/* 4. Sequential Kinetic Scene Graphics */}
      <Sequence from={0} durationInFrames={75}>
        <SceneOne />
      </Sequence>

      <Sequence from={75} durationInFrames={75}>
        <SceneTwo />
      </Sequence>

      <Sequence from={150} durationInFrames={90}>
        <SceneThree />
      </Sequence>

      <Sequence from={240} durationInFrames={90}>
        <SceneFour />
      </Sequence>

      <Sequence from={330} durationInFrames={90}>
        <SceneFive />
      </Sequence>

      <Sequence from={420} durationInFrames={90}>
        <SceneSix />
      </Sequence>

      <Sequence from={510} durationInFrames={90}>
        <SceneSeven />
      </Sequence>

      {/* 5. Synchronized Bouncing Karaoke Subtitles */}
      <KaraokeSubtitles
        subtitles={subtitlesData}
        wordsPerChunk={2}
        fontSize={66}
        bottomPercentage={23}
      />

      {/* 6. High-Fidelity Audio Layer */}
      <AudioLayer
        voiceoverSrc={staticFile("assets/audio/voiceover.mp3")}
        subtitles={subtitlesData}
      />
    </AbsoluteFill>
  );
};
