import {
  CharacterAction,
  CharacterExpression,
  CharacterStyle,
  SubtitleWord,
} from './characters/types';
import {
  BossZombieStyle,
  HeroSurvivorStyle,
  SidekickSurvivorStyle,
  WalkerZombieStyle,
  WalkerZombie2Style,
} from './characters/presets';

export interface SceneCharacterPlacement {
  characterId: string;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  scale?: number;
  direction?: 'left' | 'right';
  action: CharacterAction;
  expression: CharacterExpression;
  heldProp?: 'none' | 'bat' | 'shotgun' | 'flashlight';
  isSpeaking?: boolean;
}

export interface DialogueBubbleConfig {
  speakerId: string;
  speakerName: string;
  speakerColor: string;
  text: string;
  x: number;
  y: number;
  startFrame: number;
  durationFrames: number;
}

export interface ScenePropConfig {
  type: 'bat' | 'shotgun' | 'flashlight' | 'barricade' | 'blood';
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
}

export interface EpisodeScene {
  id: string;
  title: string;
  startFrame: number;
  durationInFrames: number;
  camera: {
    startZoom: number;
    endZoom: number;
    startPanX: number;
    endPanX: number;
    startPanY: number;
    endPanY: number;
    shake?: number;
  };
  atmosphere?: 'fog' | 'rain' | 'apocalypse_amber' | 'night_danger' | 'none';
  characters: SceneCharacterPlacement[];
  dialogue?: DialogueBubbleConfig[];
  props?: ScenePropConfig[];
  subtitles?: SubtitleWord[];
}

export interface EpisodeManifest {
  id: string;
  title: string;
  totalDurationInFrames: number;
  fps: number;
  backgroundImage?: string;
  characters: Record<string, { name: string; style: CharacterStyle }>;
  scenes: EpisodeScene[];
}

// ============================================================
// EPISODE 1: "THE GAS STATION AMBUSH" (25 Seconds / 750 Frames @ 30fps)
// ============================================================
export const GasStationAmbushManifest: EpisodeManifest = {
  id: 'zombie-ep1-ambush',
  title: 'EPISODE 1: THE GAS STATION AMBUSH',
  totalDurationInFrames: 750, // 25 seconds @ 30fps
  fps: 30,
  backgroundImage: 'assets/generated/gas-station-bg.jpg',
  characters: {
    hero: {
      name: 'HERO',
      style: HeroSurvivorStyle,
    },
    sidekick: {
      name: 'SCOUT',
      style: SidekickSurvivorStyle,
    },
    zombie1: {
      name: 'WALKER ALPHA',
      style: WalkerZombieStyle,
    },
    zombie2: {
      name: 'WALKER BETA',
      style: WalkerZombie2Style,
    },
    bossZombie: {
      name: 'THE HORDE TITAN',
      style: BossZombieStyle,
    },
  },
  scenes: [
    // ------------------------------------------------------------
    // SCENE 1: THE QUIET SEARCH (0s–6s / Frames 0–180)
    // ------------------------------------------------------------
    {
      id: 'scene-1',
      title: 'THE QUIET SEARCH',
      startFrame: 0,
      durationInFrames: 180,
      camera: {
        startZoom: 1.05,
        endZoom: 1.15,
        startPanX: -60,
        endPanX: 20,
        startPanY: -30,
        endPanY: -20,
        shake: 0.5,
      },
      atmosphere: 'night_danger',
      characters: [
        {
          characterId: 'hero',
          startX: 80,
          startY: 1470,
          endX: 380,
          endY: 1470,
          scale: 2.3,
          direction: 'right',
          action: 'walk',
          expression: 'neutral',
          heldProp: 'shotgun',
        },
        {
          characterId: 'sidekick',
          startX: 40,
          startY: 1475,
          endX: 220,
          endY: 1475,
          scale: 2.2,
          direction: 'right',
          action: 'idle',
          expression: 'shocked',
          heldProp: 'flashlight',
          isSpeaking: true,
        },
      ],
      dialogue: [
        {
          speakerId: 'sidekick',
          speakerName: 'SCOUT',
          speakerColor: '#eab308',
          text: 'Wait... stop moving! Did you hear that glass shatter?',
          x: 280,
          y: 1140,
          startFrame: 6,
          durationFrames: 120,
        },
      ],
      props: [
        {
          type: 'barricade',
          x: 820,
          y: 1180,
          scale: 0.85,
        },
      ],
    },

    // ------------------------------------------------------------
    // SCENE 2: THE AMBUSH (6s–12s / Frames 180–360)
    // ------------------------------------------------------------
    {
      id: 'scene-2',
      title: 'THE AMBUSH',
      startFrame: 180,
      durationInFrames: 180,
      camera: {
        startZoom: 1.35,
        endZoom: 1.38,
        startPanX: 140,
        endPanX: 180,
        startPanY: -30,
        endPanY: -10,
        shake: 7.5, // Impact shake as planks snap
      },
      atmosphere: 'night_danger',
      characters: [
        {
          characterId: 'sidekick',
          startX: 200,
          startY: 1475,
          scale: 2.2,
          direction: 'right',
          action: 'panic',
          expression: 'terrified',
          heldProp: 'flashlight',
          isSpeaking: true,
        },
        {
          characterId: 'hero',
          startX: 400,
          startY: 1470,
          scale: 2.3,
          direction: 'right',
          action: 'idle',
          expression: 'angry',
          heldProp: 'shotgun',
        },
        {
          characterId: 'zombie1',
          startX: 980,
          startY: 1470,
          endX: 680,
          endY: 1470,
          scale: 2.35,
          direction: 'left',
          action: 'run',
          expression: 'zombie_snarl',
        },
        {
          characterId: 'zombie2',
          startX: 1080,
          startY: 1475,
          endX: 840,
          endY: 1475,
          scale: 2.2,
          direction: 'left',
          action: 'run',
          expression: 'zombie_snarl',
        },
      ],
      dialogue: [
        {
          speakerId: 'sidekick',
          speakerName: 'SCOUT',
          speakerColor: '#eab308',
          text: 'Behind the counter! Two walkers incoming!',
          x: 260,
          y: 1120,
          startFrame: 190,
          durationFrames: 110,
        },
      ],
      props: [
        {
          type: 'barricade',
          x: 820,
          y: 1180,
          scale: 0.85,
        },
      ],
    },

    // ------------------------------------------------------------
    // SCENE 3: CLOSE-QUARTERS COMBAT (12s–20s / Frames 360–600)
    // ------------------------------------------------------------
    {
      id: 'scene-3',
      title: 'CLOSE-QUARTERS COMBAT',
      startFrame: 360,
      durationInFrames: 240,
      camera: {
        startZoom: 1.32,
        endZoom: 1.42,
        startPanX: 180,
        endPanX: 210,
        startPanY: -15,
        endPanY: -10,
        shake: 14, // Heavy recoil kickback & combat shake
      },
      atmosphere: 'apocalypse_amber',
      characters: [
        {
          characterId: 'hero',
          startX: 410,
          startY: 1470,
          scale: 2.4,
          direction: 'right',
          action: 'shoot',
          expression: 'angry',
          heldProp: 'shotgun',
          isSpeaking: true,
        },
        {
          characterId: 'zombie1',
          startX: 670,
          startY: 1470,
          scale: 2.4,
          direction: 'left',
          action: 'crawl', // Blasted down crawling on asphalt
          expression: 'zombie_snarl',
        },
        {
          characterId: 'sidekick',
          startX: 230,
          startY: 1475,
          endX: 740,
          endY: 1475,
          scale: 2.25,
          direction: 'right',
          action: 'attack_melee',
          expression: 'angry',
          heldProp: 'bat', // Charging second zombie with baseball bat
        },
        {
          characterId: 'zombie2',
          startX: 830,
          startY: 1475,
          scale: 2.3,
          direction: 'left',
          action: 'injured',
          expression: 'zombie_snarl',
        },
      ],
      props: [
        {
          type: 'blood',
          x: 690,
          y: 1440,
          scale: 1.6,
          rotation: -30,
        },
        {
          type: 'blood',
          x: 820,
          y: 1450,
          scale: 1.1,
          rotation: 40,
        },
      ],
      dialogue: [
        {
          speakerId: 'hero',
          speakerName: 'HERO',
          speakerColor: '#38bdf8',
          text: 'Hold the line—fire now!',
          x: 410,
          y: 1100,
          startFrame: 370,
          durationFrames: 110,
        },
      ],
    },

    // ------------------------------------------------------------
    // SCENE 4: CLIFFHANGER ENDING (20s–25s / Frames 600–750)
    // ------------------------------------------------------------
    {
      id: 'scene-4',
      title: 'THE CLIFFHANGER',
      startFrame: 600,
      durationInFrames: 150,
      camera: {
        startZoom: 1.02,
        endZoom: 0.98,
        startPanX: 20,
        endPanX: -20,
        startPanY: 0,
        endPanY: 10,
        shake: 1.5,
      },
      atmosphere: 'night_danger',
      characters: [
        {
          characterId: 'hero',
          startX: 360,
          startY: 1470,
          scale: 2.2,
          direction: 'right',
          action: 'idle',
          expression: 'terrified',
          heldProp: 'shotgun',
        },
        {
          characterId: 'sidekick',
          startX: 220,
          startY: 1475,
          scale: 2.1,
          direction: 'right',
          action: 'panic',
          expression: 'terrified',
          heldProp: 'bat',
        },
        {
          characterId: 'bossZombie',
          startX: 860,
          startY: 1450,
          scale: 3.4,
          direction: 'left',
          action: 'idle',
          expression: 'zombie_snarl',
        },
      ],
      props: [
        {
          type: 'blood',
          x: 690,
          y: 1440,
          scale: 1.8,
          rotation: -20,
        },
      ],
    },
  ],
};
