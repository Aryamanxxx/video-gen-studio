import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// --- Design Tokens ---
const THEME = {
  bg: "#07090e",
  bgSubtle: "#0e131f",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  cyan: "#06b6d4",
  cyanGlow: "#22d3ee",
  purple: "#8b5cf6",
  violetGlow: "#a855f7",
  emerald: "#10b981",
  amber: "#f59e0b",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', 'Helvetica Neue', sans-serif",
};

// --- Ambient Background with subtle kinetic glow ---
const AmbientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const glow1X = interpolate(frame, [0, 600], [20, 80]);
  const glow2Y = interpolate(frame, [0, 600], [80, 20]);
  const pulse = interpolate(Math.sin((frame / 60) * Math.PI), [-1, 1], [0.85, 1.15]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Radial Glow 1 (Cyan) */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: `${glow1X}%`,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${THEME.cyan}25 0%, rgba(7,9,14,0) 65%)`,
          transform: `translate(-50%, -50%) scale(${pulse})`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      {/* Radial Glow 2 (Purple) */}
      <div
        style={{
          position: "absolute",
          top: `${glow2Y}%`,
          left: "60%",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${THEME.purple}20 0%, rgba(7,9,14,0) 70%)`,
          transform: `translate(-50%, -50%) scale(${pulse * 0.95})`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      {/* Grid Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

// --- Scene 1: The Problem & The Shift (0s - 2.5s / 150 frames) ---
const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const kickerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const mainSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.8 },
  });

  const subSpring = spring({
    frame: frame - 38,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  // Exit transition
  const exitOpacity = interpolate(frame, [125, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [125, 150], [1, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mainScale = interpolate(mainSpring, [0, 1], [0.8, 1]);
  const mainY = interpolate(mainSpring, [0, 1], [50, 0]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
        fontFamily: THEME.fontFamily,
        padding: "0 100px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 1500 }}>
        {/* Kicker Tag */}
        <div
          style={{
            display: "inline-block",
            opacity: kickerSpring,
            transform: `translateY(${interpolate(kickerSpring, [0, 1], [-20, 0])}px)`,
            padding: "8px 24px",
            borderRadius: "9999px",
            border: `1px solid ${THEME.cyan}55`,
            background: `${THEME.cyan}15`,
            color: THEME.cyanGlow,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          Integrated GPU? No Problem.
        </div>

        {/* Main Kinetic Headline */}
        <h1
          style={{
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            margin: "0 0 24px 0",
            opacity: mainSpring,
            transform: `translateY(${mainY}px) scale(${mainScale})`,
            color: THEME.textPrimary,
            textTransform: "uppercase",
          }}
        >
          Zero Local{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${THEME.cyanGlow} 0%, ${THEME.purple} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Compute.
          </span>
        </h1>

        {/* Supporting Line */}
        <p
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: THEME.textSecondary,
            margin: 0,
            opacity: subSpring,
            transform: `translateY(${interpolate(subSpring, [0, 1], [30, 0])}px)`,
            letterSpacing: "-0.01em",
          }}
        >
          0% Local CPU Load • $0 Infrastructure Cost • 100% Autonomous
        </p>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 2: Parallel Matrix Rendering (2.5s - 5.0s / 150 frames) ---
const SceneTwo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  const cardsEntrance = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 110 },
  });

  const exitOpacity = interpolate(frame, [125, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [125, 150], [1, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const workers = [
    { id: "01", status: "Active", time: "1.2s", frames: "0-60" },
    { id: "02", status: "Active", time: "1.1s", frames: "60-120" },
    { id: "03", status: "Active", time: "1.3s", frames: "120-180" },
    { id: "04", status: "Active", time: "1.0s", frames: "180-240" },
    { id: "05", status: "Active", time: "1.2s", frames: "240-300" },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
        fontFamily: THEME.fontFamily,
        padding: "0 100px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: THEME.purple,
            textTransform: "uppercase",
            marginBottom: 16,
            opacity: titleSpring,
          }}
        >
          Cloud-Offloaded Compilation
        </div>
        <h2
          style={{
            fontSize: 90,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: 0,
            color: THEME.textPrimary,
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
          }}
        >
          60 FPS{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${THEME.purple} 0%, ${THEME.cyanGlow} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Matrix Renderer.
          </span>
        </h2>
      </div>

      {/* Sharded Worker Nodes Display */}
      <div
        style={{
          display: "flex",
          gap: 24,
          opacity: cardsEntrance,
          transform: `translateY(${interpolate(cardsEntrance, [0, 1], [50, 0])}px)`,
        }}
      >
        {workers.map((w, index) => {
          const itemDelay = frame - (25 + index * 4);
          const itemSpring = spring({
            frame: Math.max(0, itemDelay),
            fps,
            config: { damping: 12, stiffness: 150 },
          });

          return (
            <div
              key={w.id}
              style={{
                width: 260,
                padding: "24px 20px",
                borderRadius: 16,
                background: "rgba(14, 19, 31, 0.75)",
                border: `1px solid ${THEME.purple}40`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4)`,
                transform: `scale(${interpolate(itemSpring, [0, 1], [0.85, 1])})`,
                opacity: itemSpring,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: THEME.textMuted,
                    letterSpacing: "0.08em",
                  }}
                >
                  RUNNER #{w.id}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: THEME.emerald,
                    background: `${THEME.emerald}20`,
                    padding: "3px 10px",
                    borderRadius: 9999,
                  }}
                >
                  60 FPS
                </span>
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: THEME.textPrimary,
                  marginBottom: 6,
                }}
              >
                Frames {w.frames}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: THEME.textSecondary,
                  fontWeight: 500,
                }}
              >
                Completed in {w.time}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 3: Generative Cloud AI APIs (5.0s - 7.5s / 150 frames) ---
const SceneThree: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const badgesSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const exitOpacity = interpolate(frame, [125, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [125, 150], [1, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tools = [
    { title: "CogVideoX-Flash", desc: "100% Free AI Video Synthesis", tag: "FREE API" },
    { title: "Wan 2.1 Diffusion", desc: "Photoreal B-Roll Generation", tag: "CLOUD TIER" },
    { title: "Remote ComfyUI", desc: "Kaggle Dual-T4 via Cloudflare", tag: "GPU TUNNEL" },
    { title: "Playwright Headless", desc: "Crisp Web UI Walkthroughs", tag: "NATIVE MCP" },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
        fontFamily: THEME.fontFamily,
        padding: "0 100px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: THEME.emerald,
            textTransform: "uppercase",
            marginBottom: 16,
            opacity: titleSpring,
          }}
        >
          Model Context Protocol
        </div>
        <h2
          style={{
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            margin: 0,
            color: THEME.textPrimary,
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
          }}
        >
          Autonomous Cloud AI Stack.
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          maxWidth: 1500,
          width: "100%",
          opacity: badgesSpring,
          transform: `translateY(${interpolate(badgesSpring, [0, 1], [40, 0])}px)`,
        }}
      >
        {tools.map((tool, i) => (
          <div
            key={i}
            style={{
              padding: "32px 28px",
              borderRadius: 20,
              background: "rgba(14, 19, 31, 0.8)",
              border: `1px solid rgba(255, 255, 255, 0.08)`,
              borderTop: `2px solid ${THEME.cyanGlow}`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: THEME.cyanGlow,
                letterSpacing: "0.15em",
                marginBottom: 12,
              }}
            >
              {tool.tag}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: THEME.textPrimary,
                marginBottom: 8,
              }}
            >
              {tool.title}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: THEME.textSecondary,
                lineHeight: 1.4,
              }}
            >
              {tool.desc}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 4: Climax & CTA (7.5s - 10.0s / 150 frames) ---
const SceneFour: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 110, mass: 0.9 },
  });

  const ctaSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const pulse = interpolate(
    Math.sin((frame / 30) * Math.PI),
    [-1, 1],
    [0.98, 1.02]
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: THEME.fontFamily,
        textAlign: "center",
        padding: "0 100px",
      }}
    >
      {/* Studio Header Badge */}
      <div
        style={{
          opacity: titleSpring,
          transform: `scale(${interpolate(titleSpring, [0, 1], [0.8, 1])})`,
          padding: "10px 28px",
          borderRadius: 9999,
          background: "rgba(99, 102, 241, 0.15)",
          border: "1px solid rgba(99, 102, 241, 0.4)",
          color: "#c7d2fe",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 32,
        }}
      >
        Production Studio Live
      </div>

      {/* Main Punchy Climax Title */}
      <h1
        style={{
          fontSize: 112,
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          margin: "0 0 24px 0",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [50, 0])}px)`,
          color: THEME.textPrimary,
          textTransform: "uppercase",
        }}
      >
        Ship 60FPS Video{" "}
        <span
          style={{
            background: `linear-gradient(135deg, ${THEME.cyanGlow} 0%, #a855f7 50%, ${THEME.amber} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          At Zero Cost.
        </span>
      </h1>

      <p
        style={{
          fontSize: 34,
          fontWeight: 500,
          color: THEME.textSecondary,
          maxWidth: 1100,
          margin: "0 0 44px 0",
          opacity: titleSpring,
          lineHeight: 1.4,
        }}
      >
        Author locally. Offload all rendering to GitHub Actions matrix runners.
      </p>

      {/* High-Impact CLI Action Pill */}
      <div
        style={{
          opacity: ctaSpring,
          transform: `scale(${interpolate(ctaSpring, [0, 1], [0.85, 1]) * pulse})`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(15, 23, 42, 0.9)",
          border: `2px solid ${THEME.cyanGlow}`,
          padding: "18px 40px",
          borderRadius: 16,
          boxShadow: `0 0 40px ${THEME.cyanGlow}33`,
        }}
      >
        <span style={{ color: THEME.cyanGlow, fontSize: 28, fontWeight: 900 }}>$</span>
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 32,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "0.02em",
          }}
        >
          git push origin main:render
        </span>
      </div>
    </AbsoluteFill>
  );
};

// --- Root Video Composition (600 frames = 10s @ 60fps) ---
export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <AmbientBackground />

      <Sequence from={0} durationInFrames={150}>
        <SceneOne />
      </Sequence>

      <Sequence from={150} durationInFrames={150}>
        <SceneTwo />
      </Sequence>

      <Sequence from={300} durationInFrames={150}>
        <SceneThree />
      </Sequence>

      <Sequence from={450} durationInFrames={150}>
        <SceneFour />
      </Sequence>
    </AbsoluteFill>
  );
};
