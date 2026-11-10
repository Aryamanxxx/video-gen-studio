import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// --- Design Tokens ---
const THEME = {
  bg: "#05070c",
  bgSubtle: "#0a0f1d",
  cardBg: "rgba(10, 16, 31, 0.78)",
  cardBorder: "rgba(56, 189, 248, 0.25)",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  cyan: "#06b6d4",
  cyanGlow: "#38bdf8",
  purple: "#8b5cf6",
  violetGlow: "#c084fc",
  emerald: "#10b981",
  amber: "#f59e0b",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', 'Helvetica Neue', sans-serif",
};

// --- Cinematic B-Roll Video Layer (Pixabay Stock Integration) ---
const CinematicVideoBackground: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ zIndex: 0, overflow: "hidden", backgroundColor: THEME.bg }}>
      {/* Clip 1: Cyberpunk City (0s–15s / frames 0–900) */}
      <Sequence from={0} durationInFrames={900}>
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile("assets/cyberpunk-city.mp4")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${interpolate(frame, [0, 900], [1.05, 1.16], {
                extrapolateRight: "clamp",
              })})`,
              opacity: 0.38,
              filter: "saturate(1.25) contrast(1.15) brightness(0.9)",
            }}
            muted
          />
        </AbsoluteFill>
      </Sequence>

      {/* Clip 2: Abstract Digital Server Data (15s–30s / frames 900–1800) */}
      <Sequence from={900} durationInFrames={900}>
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile("assets/server-data.mp4")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${interpolate(frame - 900, [0, 900], [1.02, 1.15], {
                extrapolateRight: "clamp",
              })})`,
              opacity: 0.32,
              filter: "saturate(1.3) contrast(1.2) brightness(0.85)",
            }}
            muted
          />
        </AbsoluteFill>
      </Sequence>

      {/* Dark Cinematic Gradient Vignette & Tint for Maximum Typography Legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(5,7,12,0.85) 0%, rgba(5,7,12,0.65) 50%, rgba(5,7,12,0.92) 100%)",
        }}
      />

      {/* Ambient Grid Matrix & Scanline Texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.18), rgba(0,0,0,0.18) 2px, transparent 2px, transparent 4px)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// --- Scene 1: Kinetic Title Hook (0s–7s / 420 frames) ---
const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const kickerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  const subtitleSpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const tagsSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  // Exit transition
  const exitProgress = interpolate(frame, [360, 420], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = 1 - exitProgress;
  const exitScale = 1 + exitProgress * 0.08;
  const exitFilter = `blur(${exitProgress * 14}px)`;

  const floatY = Math.sin((frame / 60) * Math.PI) * 6;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 140px",
        fontFamily: THEME.fontFamily,
        opacity: exitOpacity,
        transform: `scale(${exitScale}) translateY(${floatY}px)`,
        filter: exitFilter,
        zIndex: 1,
      }}
    >
      {/* Top Kicker Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 24px",
          borderRadius: 9999,
          background: "rgba(6, 182, 212, 0.16)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${THEME.cyan}70`,
          boxShadow: `0 0 30px ${THEME.cyan}35`,
          transform: `scale(${Math.max(0, kickerSpring)}) translateY(${(1 - kickerSpring) * -30}px)`,
          opacity: kickerSpring,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: THEME.emerald,
            boxShadow: `0 0 12px ${THEME.emerald}`,
          }}
        />
        <span
          style={{
            color: THEME.cyanGlow,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 3.5,
            textTransform: "uppercase",
          }}
        >
          PIXABAY B-ROLL AUTOMATION • 60 FPS MATRIX
        </span>
      </div>

      {/* Main Kinetic Headline */}
      <h1
        style={{
          fontSize: 102,
          fontWeight: 900,
          textAlign: "center",
          lineHeight: 1.08,
          margin: "0 0 24px 0",
          letterSpacing: -2.5,
          color: THEME.textPrimary,
          transform: `scale(${Math.max(0, titleSpring)}) translateY(${(1 - titleSpring) * 40}px)`,
          opacity: titleSpring,
        }}
      >
        THE ZERO-COMPUTE{" "}
        <span
          style={{
            background: `linear-gradient(135deg, ${THEME.cyanGlow} 0%, #818cf8 50%, ${THEME.violetGlow} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 45px rgba(56, 189, 248, 0.45)`,
          }}
        >
          REVOLUTION
        </span>
      </h1>

      {/* Supporting Subtitle */}
      <p
        style={{
          fontSize: 34,
          fontWeight: 400,
          color: THEME.textSecondary,
          textAlign: "center",
          maxWidth: 1250,
          lineHeight: 1.5,
          margin: "0 0 44px 0",
          transform: `translateY(${(1 - subtitleSpring) * 30}px)`,
          opacity: subtitleSpring,
        }}
      >
        Author timelines locally with instant lightweight feedback. Offload heavy
        60fps rendering to parallel cloud runner matrixes at{" "}
        <strong style={{ color: THEME.emerald, fontWeight: 700 }}>$0 cost</strong>.
      </p>

      {/* Feature Badges Row */}
      <div
        style={{
          display: "flex",
          gap: 20,
          transform: `translateY(${(1 - tagsSpring) * 20}px)`,
          opacity: tagsSpring,
        }}
      >
        {[
          { label: "PIXABAY 1080P B-ROLL", color: THEME.cyan },
          { label: "0% LOCAL CPU/GPU", color: THEME.emerald },
          { label: "20× CLOUD RUNNERS", color: THEME.purple },
          { label: "MCP AI PIPELINE", color: THEME.amber },
        ].map((badge, idx) => (
          <div
            key={idx}
            style={{
              padding: "10px 22px",
              borderRadius: 12,
              background: "rgba(10, 16, 31, 0.85)",
              backdropFilter: "blur(14px)",
              border: `1px solid ${badge.color}55`,
              color: THEME.textPrimary,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 1.5,
              boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
            }}
          >
            {badge.label}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 2: 3-Point Feature Breakdown (7s–15s / 480 frames) ---
const SceneTwo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const card1Spring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 13, stiffness: 110 },
  });
  const card2Spring = spring({
    frame: frame - 36,
    fps,
    config: { damping: 13, stiffness: 110 },
  });
  const card3Spring = spring({
    frame: frame - 54,
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  const exitProgress = interpolate(frame, [420, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = 1 - exitProgress;
  const exitScale = 1 - exitProgress * 0.05;
  const exitFilter = `blur(${exitProgress * 12}px)`;

  const cards = [
    {
      springVal: card1Spring,
      icon: "⚡",
      badge: "SHARDED MATRIX",
      badgeColor: THEME.cyan,
      title: "20× Parallel Cloud Runners",
      metric: "95% Faster",
      desc: "Timelines shard automatically across 20 ephemeral GitHub Actions Ubuntu runners, compiling 60fps chunks simultaneously.",
    },
    {
      springVal: card2Spring,
      icon: "❄️",
      badge: "INTEGRATED GRAPHICS SAFE",
      badgeColor: THEME.emerald,
      title: "0% Local Fan & Thermal Load",
      metric: "0 dB Noise",
      desc: "Your local machine stays cool and responsive. Zero thermal throttling, zero fan noise, and zero hardware degradation.",
    },
    {
      springVal: card3Spring,
      icon: "🧠",
      badge: "AGENTIC WORKFLOW",
      badgeColor: THEME.violetGlow,
      title: "Autonomous MCP Stack",
      metric: "Free-Tier APIs",
      desc: "Direct Model Context Protocol hooks for CogVideoX-Flash, Wan 2.1, and remote Kaggle Dual-T4 ComfyUI tunnels.",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 100px",
        fontFamily: THEME.fontFamily,
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
        filter: exitFilter,
        zIndex: 1,
      }}
    >
      {/* Section Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 50,
          transform: `translateY(${(1 - headerSpring) * -30}px)`,
          opacity: headerSpring,
        }}
      >
        <span
          style={{
            color: THEME.cyanGlow,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: "uppercase",
            display: "block",
            marginBottom: 10,
          }}
        >
          ARCHITECTURAL ADVANTAGE
        </span>
        <h2
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: THEME.textPrimary,
            margin: 0,
            letterSpacing: -1.5,
          }}
        >
          Engineered for Pure Velocity
        </h2>
      </div>

      {/* 3 Staggered Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 32,
          width: "100%",
          maxWidth: 1680,
        }}
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: THEME.cardBg,
              backdropFilter: "blur(24px)",
              border: `1px solid ${card.badgeColor}45`,
              borderRadius: 24,
              padding: "44px 36px",
              boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
              transform: `scale(${Math.max(0, card.springVal)}) translateY(${(1 - card.springVal) * 50}px)`,
              opacity: card.springVal,
            }}
          >
            {/* Top accent light beam */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${card.badgeColor}, transparent)`,
              }}
            />

            {/* Header row: Icon + Pill */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
              }}
            >
              <span style={{ fontSize: 44 }}>{card.icon}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: card.badgeColor,
                  background: `${card.badgeColor}18`,
                  padding: "6px 14px",
                  borderRadius: 9999,
                  letterSpacing: 1.5,
                  border: `1px solid ${card.badgeColor}40`,
                }}
              >
                {card.badge}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: THEME.textPrimary,
                margin: "0 0 14px 0",
                lineHeight: 1.25,
              }}
            >
              {card.title}
            </h3>

            {/* Metric Callout */}
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: card.badgeColor,
                marginBottom: 16,
              }}
            >
              {card.metric}
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 20,
                color: THEME.textSecondary,
                lineHeight: 1.6,
                margin: 0,
                flex: 1,
              }}
            >
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 3: Dynamic Quote & Highlight Metric (15s–23s / 480 frames) ---
const SceneThree: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const quoteSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  const statPillSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  const glowBorderAngle = (frame / 480) * 360;

  const exitProgress = interpolate(frame, [420, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = 1 - exitProgress;
  const exitScale = 1 + exitProgress * 0.05;
  const exitFilter = `blur(${exitProgress * 14}px)`;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 140px",
        fontFamily: THEME.fontFamily,
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
        filter: exitFilter,
        zIndex: 1,
      }}
    >
      {/* Outer Glowing Glass Container */}
      <div
        style={{
          width: "100%",
          maxWidth: 1540,
          background: "rgba(10, 16, 31, 0.88)",
          backdropFilter: "blur(32px)",
          borderRadius: 36,
          padding: "70px 80px",
          border: `1px solid rgba(56, 189, 248, 0.4)`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.65), 0 0 50px rgba(6, 182, 212, 0.2)`,
          position: "relative",
          overflow: "hidden",
          transform: `scale(${Math.max(0, panelSpring)}) translateY(${(1 - panelSpring) * 40}px)`,
          opacity: panelSpring,
        }}
      >
        {/* Animated Gradient Border Accent */}
        <div
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 38,
            background: `conic-gradient(from ${glowBorderAngle}deg, ${THEME.cyan}, ${THEME.purple}, ${THEME.emerald}, ${THEME.cyan})`,
            zIndex: -1,
            opacity: 0.45,
            filter: "blur(8px)",
          }}
        />

        {/* Top Status & Metrics Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: 36,
            marginBottom: 44,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: THEME.cyanGlow,
                boxShadow: `0 0 16px ${THEME.cyanGlow}`,
              }}
            />
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: THEME.cyanGlow,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              PIXABAY INTEGRATED CINEMATIC LAYER
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "rgba(16, 185, 129, 0.15)",
              border: `1px solid ${THEME.emerald}60`,
              padding: "10px 24px",
              borderRadius: 9999,
              transform: `scale(${Math.max(0, statPillSpring)})`,
              opacity: statPillSpring,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 900, color: THEME.emerald }}>
              1800 FRAMES
            </span>
            <span style={{ color: THEME.textMuted }}>•</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: THEME.textPrimary }}>
              20 WORKERS @ 60 FPS
            </span>
          </div>
        </div>

        {/* The Quote Body */}
        <div
          style={{
            transform: `translateY(${(1 - quoteSpring) * 30}px)`,
            opacity: quoteSpring,
          }}
        >
          <p
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: THEME.textPrimary,
              lineHeight: 1.35,
              margin: "0 0 32px 0",
              letterSpacing: -1,
            }}
          >
            “The era of burning local laptop batteries and enduring 30-minute render
            delays is over. <span style={{ color: THEME.cyanGlow }}>Autonomous agents code the timeline;</span> parallel
            cloud runners compile the pixels.”
          </p>

          {/* Attribution Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${THEME.cyan}, ${THEME.purple})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#fff",
                }}
              >
                AG
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: THEME.textPrimary }}>
                  Autonomous Video Studio Protocol
                </div>
                <div style={{ fontSize: 17, color: THEME.textSecondary }}>
                  Pixabay Stock B-Roll • GitHub Actions Matrix
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: THEME.emerald,
                textShadow: `0 0 20px rgba(16, 185, 129, 0.4)`,
              }}
            >
              $0.00 LOCAL HARDWARE COST
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 4: Call to Action Outro (23s–30s / 420 frames) ---
const SceneFour: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  const headlineSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const cliSpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  const badgesSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const ringRotation = (frame / 60) * 45;
  const pulse = interpolate(Math.sin((frame / 45) * Math.PI), [-1, 1], [0.96, 1.04]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 120px",
        fontFamily: THEME.fontFamily,
        zIndex: 1,
      }}
    >
      {/* Animated Logo Mark */}
      <div
        style={{
          width: 140,
          height: 140,
          position: "relative",
          marginBottom: 36,
          transform: `scale(${Math.max(0, logoSpring) * pulse})`,
          opacity: logoSpring,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px dashed ${THEME.cyanGlow}`,
            transform: `rotate(${ringRotation}deg)`,
            boxShadow: `0 0 30px ${THEME.cyan}40`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 18,
            borderRadius: 24,
            background: `linear-gradient(135deg, ${THEME.cyan} 0%, ${THEME.purple} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 40px ${THEME.purple}60`,
          }}
        >
          <span style={{ fontSize: 48, fontWeight: 900, color: "#ffffff" }}>▶</span>
        </div>
      </div>

      {/* Headline */}
      <h2
        style={{
          fontSize: 78,
          fontWeight: 900,
          color: THEME.textPrimary,
          margin: "0 0 16px 0",
          textAlign: "center",
          letterSpacing: -1.5,
          transform: `translateY(${(1 - headlineSpring) * 30}px)`,
          opacity: headlineSpring,
        }}
      >
        START PRODUCING IN THE CLOUD
      </h2>

      <p
        style={{
          fontSize: 28,
          color: THEME.textSecondary,
          margin: "0 0 38px 0",
          textAlign: "center",
          transform: `translateY(${(1 - headlineSpring) * 20}px)`,
          opacity: headlineSpring,
        }}
      >
        Autonomous Remotion Studio • Pixabay Stock B-Roll • 60 FPS Parallel Matrix
      </p>

      {/* Terminal CLI Pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(10, 16, 31, 0.92)",
          backdropFilter: "blur(18px)",
          border: `1px solid ${THEME.cyan}70`,
          borderRadius: 18,
          padding: "16px 36px",
          marginBottom: 44,
          boxShadow: `0 10px 40px rgba(0,0,0,0.65), 0 0 30px rgba(6, 182, 212, 0.25)`,
          transform: `scale(${Math.max(0, cliSpring)})`,
          opacity: cliSpring,
        }}
      >
        <span style={{ color: THEME.emerald, fontSize: 24, fontWeight: 800 }}>$</span>
        <code
          style={{
            fontFamily: "monospace",
            fontSize: 26,
            fontWeight: 700,
            color: THEME.textPrimary,
          }}
        >
          git push origin main:render
        </code>
        <span
          style={{
            color: THEME.textMuted,
            fontSize: 18,
            marginLeft: 12,
            borderLeft: "1px solid rgba(255,255,255,0.15)",
            paddingLeft: 16,
          }}
        >
          Triggers 20 parallel cloud runners instantly
        </span>
      </div>

      {/* Social / Link Badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          transform: `translateY(${(1 - badgesSpring) * 20}px)`,
          opacity: badgesSpring,
        }}
      >
        {[
          { icon: "⚡", label: "github.com/Aryamanxxx/video-gen-studio", color: THEME.cyan },
          { icon: "🎬", label: "Pixabay HD B-Roll", color: THEME.purple },
          { icon: "🛡️", label: "Zero Local Compute Verified", color: THEME.emerald },
        ].map((badge, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 18,
              fontWeight: 600,
              color: THEME.textSecondary,
            }}
          >
            <span>{badge.icon}</span>
            <span style={{ color: THEME.textPrimary }}>{badge.label}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// --- Main 30-Second Composition Root (1800 frames @ 60fps) ---
export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      {/* Pixabay Cinematic B-Roll Video Layer */}
      <CinematicVideoBackground />

      {/* Scene 1: Kinetic Title Hook (0s to 7s -> 0 to 420 frames) */}
      <Sequence from={0} durationInFrames={420}>
        <SceneOne />
      </Sequence>

      {/* Scene 2: 3-Point Feature Breakdown (7s to 15s -> 420 to 900 frames) */}
      <Sequence from={420} durationInFrames={480}>
        <SceneTwo />
      </Sequence>

      {/* Scene 3: Dynamic Quote & Highlight Metric (15s to 23s -> 900 to 1380 frames) */}
      <Sequence from={900} durationInFrames={480}>
        <SceneThree />
      </Sequence>

      {/* Scene 4: Call to Action Outro (23s to 30s -> 1380 to 1800 frames) */}
      <Sequence from={1380} durationInFrames={420}>
        <SceneFour />
      </Sequence>
    </AbsoluteFill>
  );
};
