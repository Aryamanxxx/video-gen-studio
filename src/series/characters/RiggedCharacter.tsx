import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CharacterProps, VisemeType } from './types';
import { BaseballBat, FlashlightBeam, Shotgun } from '../props/PropsLibrary';

export const RiggedCharacter: React.FC<CharacterProps> = ({
  x,
  y,
  scale = 1,
  direction = 'right',
  action = 'idle',
  expression = 'neutral',
  style,
  isSpeaking = false,
  viseme,
  subtitles,
  audioCurrentTimeSeconds,
  heldProp = 'none',
  opacity = 1,
}) => {
  const frame = useCurrentFrame();

  // 1. DETERMINE SPEECH & VISEME STATE
  let activeSpeaking = isSpeaking;
  let activeViseme: VisemeType = viseme || 'closed';

  if (subtitles && audioCurrentTimeSeconds !== undefined) {
    const activeSub = subtitles.find(
      (s) => audioCurrentTimeSeconds >= s.start && audioCurrentTimeSeconds <= s.end
    );
    if (activeSub) {
      activeSpeaking = true;
      // Synthesize viseme rhythm from time
      const visemeCycle = Math.floor(frame / 3) % 3;
      if (visemeCycle === 0) activeViseme = 'open_wide';
      else if (visemeCycle === 1) activeViseme = 'teeth_clench';
      else activeViseme = 'round_o';
    } else {
      activeSpeaking = false;
      activeViseme = 'closed';
    }
  } else if (isSpeaking && !viseme) {
    // Fallback rhythmic lip-sync when isSpeaking is true
    const cycle = Math.floor(frame / 4) % 4;
    if (cycle === 0) activeViseme = 'open_wide';
    else if (cycle === 1) activeViseme = 'round_o';
    else if (cycle === 2) activeViseme = 'teeth_clench';
    else activeViseme = 'closed';
  }

  // 2. KINEMATICS ENGINE (Joint Rotations & Offsets)
  let torsoAngle = 0;
  let hipOffsetY = 0;
  let hipOffsetX = 0;
  let headTilt = 0;

  // Angles in degrees
  let leftArmUpper = 12;
  let leftArmLower = 15;
  let rightArmUpper = -12;
  let rightArmLower = 15;

  let leftLegUpper = 0;
  let leftLegLower = 5;
  let rightLegUpper = 0;
  let rightLegLower = 5;

  switch (action) {
    case 'idle': {
      const breath = Math.sin(frame * 0.08);
      hipOffsetY = breath * 2.5;
      torsoAngle = breath * 1.5;
      headTilt = Math.sin(frame * 0.05) * 3;
      leftArmUpper = 14 + breath * 4;
      rightArmUpper = -14 - breath * 4;
      break;
    }

    case 'walk': {
      const walkCycle = frame * 0.22;
      const legStride = 28;
      const armSwing = 32;

      hipOffsetY = Math.abs(Math.sin(walkCycle)) * -6;
      torsoAngle = 4 + Math.sin(walkCycle) * 2;
      headTilt = Math.sin(walkCycle) * -2;

      leftLegUpper = Math.sin(walkCycle) * legStride;
      leftLegLower = Math.max(0, -Math.sin(walkCycle)) * 30 + 5;

      rightLegUpper = -Math.sin(walkCycle) * legStride;
      rightLegLower = Math.max(0, Math.sin(walkCycle)) * 30 + 5;

      // Natural counter-swing
      leftArmUpper = -Math.sin(walkCycle) * armSwing;
      leftArmLower = Math.abs(Math.sin(walkCycle)) * 25 + 10;

      rightArmUpper = Math.sin(walkCycle) * armSwing;
      rightArmLower = Math.abs(Math.cos(walkCycle)) * 25 + 10;
      break;
    }

    case 'run': {
      const runCycle = frame * 0.42;
      const stride = 48;
      const armPump = 54;

      hipOffsetY = Math.abs(Math.sin(runCycle)) * -12;
      torsoAngle = 18; // Strong forward lean
      headTilt = -6;

      leftLegUpper = Math.sin(runCycle) * stride;
      leftLegLower = Math.max(0, -Math.sin(runCycle)) * 55 + 10;

      rightLegUpper = -Math.sin(runCycle) * stride;
      rightLegLower = Math.max(0, Math.sin(runCycle)) * 55 + 10;

      leftArmUpper = -Math.sin(runCycle) * armPump;
      leftArmLower = 65; // Tight elbows

      rightArmUpper = Math.sin(runCycle) * armPump;
      rightArmLower = 65;
      break;
    }

    case 'panic': {
      const shake = (Math.sin(frame * 1.5) + Math.cos(frame * 2.1)) * 3;
      hipOffsetX = shake * 2;
      hipOffsetY = Math.abs(Math.sin(frame * 0.6)) * -5;
      torsoAngle = shake * 2;
      headTilt = -shake * 3;

      // Arms flailing above head
      leftArmUpper = -135 + Math.sin(frame * 0.9) * 25;
      leftArmLower = 45 + Math.cos(frame * 1.1) * 30;

      rightArmUpper = -140 + Math.cos(frame * 0.8) * 25;
      rightArmLower = 45 + Math.sin(frame * 1.2) * 30;

      leftLegUpper = Math.sin(frame * 0.8) * 15;
      rightLegUpper = -Math.sin(frame * 0.8) * 15;
      break;
    }

    case 'attack_melee': {
      // Wind-up and strike animation cycle (20 frames)
      const attackFrame = frame % 22;
      if (attackFrame < 8) {
        // Wind-up: pull arm back and coil torso
        const p = attackFrame / 8;
        torsoAngle = -12 * p;
        rightArmUpper = -50 - 45 * p;
        rightArmLower = 70;
        leftArmUpper = 30 * p;
      } else if (attackFrame < 14) {
        // Violent slash forward
        const p = (attackFrame - 8) / 6;
        torsoAngle = interpolate(p, [0, 1], [-12, 24]);
        rightArmUpper = interpolate(p, [0, 1], [-95, 45]);
        rightArmLower = interpolate(p, [0, 1], [70, 15]);
        leftArmUpper = interpolate(p, [0, 1], [30, -35]);
        hipOffsetX = p * 15;
      } else {
        // Recovery
        const p = (attackFrame - 14) / 8;
        torsoAngle = interpolate(p, [0, 1], [24, 0]);
        rightArmUpper = interpolate(p, [0, 1], [45, -12]);
        rightArmLower = interpolate(p, [0, 1], [15, 15]);
      }
      break;
    }

    case 'shoot': {
      // Aim forward with both hands on weapon
      torsoAngle = -4;
      leftArmUpper = -75;
      leftArmLower = 60;
      rightArmUpper = -70;
      rightArmLower = 35;

      // Recoil impulse every 20 frames
      const recoilPhase = frame % 20;
      if (recoilPhase < 4) {
        const recoilKick = (1 - recoilPhase / 4) * 10;
        torsoAngle += recoilKick;
        rightArmUpper += recoilKick * 1.5;
        headTilt -= recoilKick * 0.8;
      }
      break;
    }

    case 'injured': {
      torsoAngle = 22;
      headTilt = 15;
      // Clutching abdomen
      leftArmUpper = 25;
      leftArmLower = 85;
      rightArmUpper = 10;
      rightArmLower = 30;

      // Heavy limping cycle
      const limpCycle = frame * 0.16;
      hipOffsetY = Math.sin(limpCycle) > 0 ? 8 : 0;
      leftLegUpper = Math.sin(limpCycle) * 18;
      rightLegUpper = -5; // dragging bad leg
      break;
    }

    case 'crawl': {
      torsoAngle = 75; // near flat on ground
      hipOffsetY = 38;
      headTilt = -45; // looking up while crawling

      const crawlCycle = frame * 0.2;
      rightArmUpper = Math.sin(crawlCycle) * 50 - 40;
      rightArmLower = 45;
      leftArmUpper = -Math.sin(crawlCycle) * 50 - 40;
      leftArmLower = 45;

      leftLegUpper = 40 + Math.sin(crawlCycle) * 20;
      rightLegUpper = 40 - Math.sin(crawlCycle) * 20;
      break;
    }

    case 'dead': {
      torsoAngle = 88;
      hipOffsetY = 42;
      headTilt = 30;
      leftArmUpper = 35;
      leftArmLower = 10;
      rightArmUpper = -20;
      rightArmLower = 10;
      leftLegUpper = 10;
      rightLegUpper = 20;
      break;
    }
  }

  // Zombie erratic shamble modification
  if (style.isUndead && (action === 'walk' || action === 'idle')) {
    headTilt += Math.sin(frame * 0.15) * 12 + 8;
    torsoAngle += 10 + Math.sin(frame * 0.1) * 6;
    rightArmUpper = -70 + Math.sin(frame * 0.1) * 15; // reaching outward
    leftArmUpper = -55 + Math.cos(frame * 0.12) * 15;
    rightArmLower = 20;
    leftArmLower = 30;
  }

  const flipX = direction === 'left' ? -1 : 1;

  return (
    <g
      transform={`translate(${x + hipOffsetX}, ${y + hipOffsetY}) scale(${scale * flipX}, ${scale})`}
      opacity={opacity}
    >
      {/* 1. BACK LEG (Left Leg) */}
      <g transform={`translate(-6, 0) rotate(${leftLegUpper})`}>
        {/* Thigh */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="28"
          stroke={style.pantsColor}
          strokeWidth={style.strokeWidth}
          strokeLinecap="round"
        />
        {/* Calf & Foot */}
        <g transform={`translate(0, 28) rotate(${leftLegLower})`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="28"
            stroke={style.pantsColor}
            strokeWidth={style.strokeWidth - 0.5}
            strokeLinecap="round"
          />
          {/* Foot */}
          <line
            x1="0"
            y1="28"
            x2="10"
            y2="28"
            stroke="#09090b"
            strokeWidth={style.strokeWidth + 1}
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* 2. BACK ARM (Left Arm) */}
      <g transform={`translate(0, -48) rotate(${leftArmUpper})`}>
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="24"
          stroke={style.limbColor}
          strokeWidth={style.strokeWidth}
          strokeLinecap="round"
        />
        <g transform={`translate(0, 24) rotate(${leftArmLower})`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="22"
            stroke={style.limbColor}
            strokeWidth={style.strokeWidth - 0.5}
            strokeLinecap="round"
          />
          {/* Hand */}
          <circle cx="0" cy="23" r="3.5" fill={style.skinColor} />
        </g>
      </g>

      {/* 3. TORSO & SPINE */}
      <g transform={`rotate(${torsoAngle})`}>
        {/* Tactical Belt / Hips */}
        <ellipse cx="0" cy="0" rx="9" ry="4" fill="#0f172a" />

        {/* Torso Jacket / Shirt */}
        <path
          d="M -9 0 L -12 -48 L 12 -48 L 9 0 Z"
          fill={style.outfitColor}
          stroke={style.bodyColor}
          strokeWidth="1.5"
        />

        {/* Blood Splatters on Undead Torso */}
        {style.bloodStains && (
          <g fill="#991b1b">
            <circle cx="-3" cy="-24" r="3.5" />
            <circle cx="4" cy="-18" r="2.5" />
            <path d="M -2 -24 Q -4 -12 -3 -8" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Bandage on Hero's Torso/Arm */}
        {style.hasBandage && (
          <rect x="-8" y="-32" width="16" height="5" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        )}

        {/* 4. HEAD & FACE */}
        <g transform={`translate(0, -72) rotate(${headTilt})`}>
          {/* Neck */}
          <line x1="0" y1="20" x2="0" y2="24" stroke={style.skinColor} strokeWidth={style.strokeWidth} />

          {/* Head Sphere */}
          <circle
            cx="0"
            cy="0"
            r={style.headRadius || 20}
            fill={style.skinColor}
            stroke="#09090b"
            strokeWidth={style.strokeWidth}
          />

          {/* Hood / Cap Asset */}
          {style.hatType === 'hood' && (
            <path
              d="M -22 10 Q -26 -26 0 -26 Q 26 -26 22 10 Z"
              fill={style.outfitColor}
              stroke="#0f172a"
              strokeWidth="2"
            />
          )}

          {/* EYES */}
          {expression === 'zombie_snarl' || style.isUndead ? (
            // Undead Glowing / Bloodshot Eyes
            <g>
              <circle cx="-6" cy="-4" r="4" fill="#7f1d1d" />
              <circle cx="6" cy="-4" r="4" fill="#7f1d1d" />
              <circle cx="-6" cy="-4" r="2.5" fill={style.eyeColor} />
              <circle cx="6" cy="-4" r="2.5" fill={style.eyeColor} />
            </g>
          ) : expression === 'terrified' ? (
            // Wide Dilated Shaking Eyes
            <g>
              <circle cx="-6" cy="-4" r="4" fill="#ffffff" stroke="#000" strokeWidth="1" />
              <circle cx="6" cy="-4" r="4" fill="#ffffff" stroke="#000" strokeWidth="1" />
              <circle cx="-6" cy="-4" r="1.5" fill="#000" />
              <circle cx="6" cy="-4" r="1.5" fill="#000" />
              {/* High terrified eyebrows */}
              <line x1="-10" y1="-12" x2="-3" y2="-9" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              <line x1="10" y1="-12" x2="3" y2="-9" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : expression === 'angry' ? (
            // Angry Slanted V-Brows
            <g>
              <line x1="-10" y1="-9" x2="-2" y2="-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="10" y1="-9" x2="2" y2="-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="-6" cy="-3" r="2.2" fill={style.eyeColor} />
              <circle cx="6" cy="-3" r="2.2" fill={style.eyeColor} />
            </g>
          ) : expression === 'smirk' ? (
            // Smug confident eyes
            <g>
              <line x1="-9" y1="-8" x2="-3" y2="-7" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="-10" x2="3" y2="-7" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              <circle cx="-6" cy="-4" r="2.2" fill={style.eyeColor} />
              <circle cx="6" cy="-4" r="2.2" fill={style.eyeColor} />
            </g>
          ) : (
            // Neutral Eyes
            <g>
              <circle cx="-6" cy="-4" r="2.5" fill={style.eyeColor} />
              <circle cx="6" cy="-4" r="2.5" fill={style.eyeColor} />
            </g>
          )}

          {/* MOUTH & PHONEME LIP-SYNC */}
          {expression === 'zombie_snarl' ? (
            // Zombie Snarling Fangs
            <g transform="translate(0, 6)">
              <path d="M -8 -1 Q 0 8 8 -1 Q 0 14 -8 -1 Z" fill={style.mouthColor || '#450a0a'} stroke="#000" strokeWidth="1" />
              {/* Sharp Fangs */}
              <polygon points="-5,-1 -3,4 -1,-1" fill="#fef08a" />
              <polygon points="1,-1 3,4 5,-1" fill="#fef08a" />
              <polygon points="-4,8 -2,4 0,8" fill="#fef08a" />
            </g>
          ) : activeSpeaking ? (
            // Animated Phoneme Mouth
            <g transform="translate(0, 6)">
              {activeViseme === 'open_wide' && (
                <g>
                  <ellipse cx="0" cy="2" rx="6.5" ry="6" fill={style.mouthColor || '#881337'} stroke="#000" strokeWidth="1" />
                  <rect x="-4" y="-3" width="8" height="2.5" rx="1" fill="#ffffff" />
                </g>
              )}
              {activeViseme === 'round_o' && (
                <ellipse cx="0" cy="2" rx="4.5" ry="5.5" fill={style.mouthColor || '#881337'} stroke="#ffffff" strokeWidth="1" />
              )}
              {activeViseme === 'teeth_clench' && (
                <g>
                  <rect x="-7" y="0" width="14" height="4.5" rx="1.5" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
                  <line x1="-3" y1="0" x2="-3" y2="4.5" stroke="#94a3b8" strokeWidth="0.8" />
                  <line x1="3" y1="0" x2="3" y2="4.5" stroke="#94a3b8" strokeWidth="0.8" />
                </g>
              )}
              {activeViseme === 'closed' && (
                <line x1="-5" y1="2" x2="5" y2="2" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
              )}
            </g>
          ) : expression === 'smirk' ? (
            // Smirking Mouth
            <path d="M -5 5 Q 1 4 7 1" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : expression === 'angry' ? (
            // Tight Frown
            <path d="M -6 6 Q 0 2 6 6" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : (
            // Neutral Resting Mouth
            <line x1="-5" y1="5" x2="5" y2="5" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </g>

        {/* 5. FRONT ARM (Right Arm & Held Weapons/Props) */}
        <g transform={`translate(0, -48) rotate(${rightArmUpper})`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="24"
            stroke={style.limbColor}
            strokeWidth={style.strokeWidth}
            strokeLinecap="round"
          />
          <g transform={`translate(0, 24) rotate(${rightArmLower})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="22"
              stroke={style.limbColor}
              strokeWidth={style.strokeWidth - 0.5}
              strokeLinecap="round"
            />
            {/* Hand */}
            <circle cx="0" cy="23" r="3.5" fill={style.skinColor} />

            {/* ATTACHED WEAPON / PROP */}
            {heldProp === 'bat' && (
              <g transform="translate(0, 22) rotate(-55)">
                <BaseballBat scale={0.8} />
              </g>
            )}

            {heldProp === 'shotgun' && (
              <g transform="translate(4, 22) rotate(-15)">
                <Shotgun scale={0.8} isFiring={action === 'shoot'} />
              </g>
            )}

            {heldProp === 'flashlight' && (
              <g transform="translate(2, 22) rotate(15)">
                <FlashlightBeam beamLength={420} />
              </g>
            )}
          </g>
        </g>
      </g>

      {/* 6. FRONT LEG (Right Leg) */}
      <g transform={`translate(6, 0) rotate(${rightLegUpper})`}>
        {/* Thigh */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="28"
          stroke={style.pantsColor}
          strokeWidth={style.strokeWidth}
          strokeLinecap="round"
        />
        {/* Calf & Foot */}
        <g transform={`translate(0, 28) rotate(${rightLegLower})`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="28"
            stroke={style.pantsColor}
            strokeWidth={style.strokeWidth - 0.5}
            strokeLinecap="round"
          />
          {/* Foot */}
          <line
            x1="0"
            y1="28"
            x2="10"
            y2="28"
            stroke="#09090b"
            strokeWidth={style.strokeWidth + 1}
            strokeLinecap="round"
          />
        </g>
      </g>
    </g>
  );
};
