import { CharacterStyle } from './types';

export const HeroSurvivorStyle: CharacterStyle = {
  skinColor: '#f1c27d',
  headRadius: 20,
  bodyColor: '#1e293b',
  limbColor: '#1e293b',
  strokeWidth: 5,
  eyeColor: '#0f172a',
  outfitColor: '#854d0e', // Distressed leather jacket
  pantsColor: '#334155',  // Tactical dark cargo pants
  accentColor: '#38bdf8', // Blue comms headset / tactical strap
  hasBandage: true,
  hatType: 'none',
  isUndead: false,
  bloodStains: false,
  mouthColor: '#881337',
};

export const SidekickSurvivorStyle: CharacterStyle = {
  skinColor: '#ffdbac',
  headRadius: 18,
  bodyColor: '#1e293b',
  limbColor: '#1e293b',
  strokeWidth: 4.5,
  eyeColor: '#1e293b',
  outfitColor: '#ca8a04', // Bright yellow survival hoodie
  pantsColor: '#18181b',  // Dark running pants
  accentColor: '#a855f7', // Purple survival pack
  hasBandage: false,
  hatType: 'hood',
  isUndead: false,
  bloodStains: false,
  mouthColor: '#9f1239',
};

export const WalkerZombieStyle: CharacterStyle = {
  skinColor: '#4d7c59', // Rotting undead greenish-grey
  headRadius: 19,
  bodyColor: '#374151',
  limbColor: '#4b5563',
  strokeWidth: 4.5,
  eyeColor: '#facc15', // Glowing infected amber pupil
  outfitColor: '#1f2937', // Tattered shredded shirt
  pantsColor: '#111827',  // Torn muddy rags
  accentColor: '#dc2626', // Fresh blood splatter & gore
  hasBandage: false,
  hatType: 'none',
  isUndead: true,
  bloodStains: true,
  mouthColor: '#450a0a',
};

export const WalkerZombie2Style: CharacterStyle = {
  ...WalkerZombieStyle,
  skinColor: '#3f624d',
  headRadius: 18,
  outfitColor: '#1e293b',
  pantsColor: '#0f172a',
  eyeColor: '#ef4444', // Blood red eyes
};

export const BossZombieStyle: CharacterStyle = {
  skinColor: '#18181b', // Pure shadowy silhouette
  headRadius: 32,
  bodyColor: '#09090b',
  limbColor: '#09090b',
  strokeWidth: 8,
  eyeColor: '#ef4444', // Huge piercing red glowing eyes
  outfitColor: '#09090b',
  pantsColor: '#09090b',
  isUndead: true,
  bloodStains: true,
  mouthColor: '#450a0a',
};
