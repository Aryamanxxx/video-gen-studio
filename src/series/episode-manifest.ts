import {
  CharacterAction,
  CharacterExpression,
  CharacterStyle,
  SubtitleWord,
} from './characters/types';
import { HeroSurvivorStyle, SidekickSurvivorStyle, WalkerZombieStyle } from './characters/presets';

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
  title?: string;
  startFrame: number;
  durationInFrames: number;
  camera?: {
    zoom?: number;
    panX?: number;
    panY?: number;
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
  characters: Record<string, { name: string; style: CharacterStyle }>;
  scenes: EpisodeScene[];
}

// ==========================================
// STARTER EPISODE 1: "CORNERED IN SECTOR 4"
// ==========================================
export const ZombieEpisode1Manifest: EpisodeManifest = {
  id: 'zombie-ep1',
  title: 'CORNERED IN SECTOR 4',
  totalDurationInFrames: 300, // 10 seconds @ 30fps
  fps: 30,
  characters: {
    hero: {
      name: 'HERO',
      style: HeroSurvivorStyle,
    },
    sidekick: {
      name: 'SCOUT',
      style: SidekickSurvivorStyle,
    },
    zombie: {
      name: 'WALKER',
      style: WalkerZombieStyle,
    },
  },
  scenes: [
    // SCENE 1: THE SHADOWS (0-90 frames / 3.0s)
    {
      id: 'scene-1',
      title: 'THE ALLEYWAY',
      startFrame: 0,
      durationInFrames: 90,
      camera: {
        zoom: 1.05,
        panX: -60,
        panY: -40,
        shake: 0,
      },
      atmosphere: 'night_danger',
      characters: [
        {
          characterId: 'sidekick',
          startX: 240,
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
          startX: 440,
          startY: 1470,
          scale: 2.3,
          direction: 'right',
          action: 'idle',
          expression: 'angry',
          heldProp: 'shotgun',
          isSpeaking: false,
        },
      ],
      dialogue: [
        {
          speakerId: 'sidekick',
          speakerName: 'SCOUT',
          speakerColor: '#eab308',
          text: 'Did you hear that scraping sound?!',
          x: 240,
          y: 1180,
          startFrame: 10,
          durationFrames: 70,
        },
      ],
      props: [
        {
          type: 'barricade',
          x: 60,
          y: 1200,
          scale: 0.8,
        },
      ],
    },

    // SCENE 2: THE INFECTION APPROACHES (90-190 frames / 3.3s)
    {
      id: 'scene-2',
      title: 'THE AMBUSH',
      startFrame: 90,
      durationInFrames: 100,
      camera: {
        zoom: 1.18,
        panX: 80,
        panY: -30,
        shake: 1.5,
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
          expression: 'shocked',
          heldProp: 'flashlight',
        },
        {
          characterId: 'hero',
          startX: 390,
          startY: 1470,
          scale: 2.3,
          direction: 'right',
          action: 'idle',
          expression: 'angry',
          heldProp: 'shotgun',
          isSpeaking: true,
        },
        {
          characterId: 'zombie',
          startX: 920,
          startY: 1470,
          endX: 720,
          endY: 1470,
          scale: 2.35,
          direction: 'left',
          action: 'walk',
          expression: 'zombie_snarl',
        },
      ],
      dialogue: [
        {
          speakerId: 'hero',
          speakerName: 'HERO',
          speakerColor: '#38bdf8',
          text: 'Walker at 12 o\'clock! Don\'t move!',
          x: 390,
          y: 1160,
          startFrame: 98,
          durationFrames: 80,
        },
      ],
    },

    // SCENE 3: POINT BLANK (190-300 frames / 3.7s)
    {
      id: 'scene-3',
      title: 'POINT BLANK',
      startFrame: 190,
      durationInFrames: 110,
      camera: {
        zoom: 1.28,
        panX: 180,
        panY: -10,
        shake: 12, // High recoil shake on blast
      },
      atmosphere: 'apocalypse_amber',
      characters: [
        {
          characterId: 'hero',
          startX: 420,
          startY: 1470,
          scale: 2.4,
          direction: 'right',
          action: 'shoot',
          expression: 'angry',
          heldProp: 'shotgun',
        },
        {
          characterId: 'zombie',
          startX: 720,
          startY: 1470,
          scale: 2.4,
          direction: 'left',
          action: 'injured',
          expression: 'zombie_snarl',
        },
      ],
      props: [
        {
          type: 'blood',
          x: 760,
          y: 1420,
          scale: 1.4,
          rotation: -25,
        },
      ],
      dialogue: [
        {
          speakerId: 'hero',
          speakerName: 'HERO',
          speakerColor: '#38bdf8',
          text: 'HEADSHOT! SECTOR CLEAR!',
          x: 420,
          y: 1130,
          startFrame: 220,
          durationFrames: 70,
        },
      ],
    },
  ],
};
