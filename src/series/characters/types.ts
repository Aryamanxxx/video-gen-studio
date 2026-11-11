export type CharacterAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'panic'
  | 'attack_melee'
  | 'shoot'
  | 'injured'
  | 'crawl'
  | 'dead';

export type CharacterExpression =
  | 'neutral'
  | 'angry'
  | 'terrified'
  | 'smirk'
  | 'shocked'
  | 'zombie_snarl';

export type VisemeType = 'closed' | 'open_wide' | 'round_o' | 'teeth_clench';

export interface CharacterStyle {
  skinColor: string;
  headRadius?: number;
  bodyColor?: string;
  limbColor: string;
  strokeWidth: number;
  eyeColor: string;
  outfitColor: string;
  pantsColor: string;
  accentColor?: string;
  hatType?: 'none' | 'cap' | 'hood' | 'bandana';
  hasBandage?: boolean;
  isUndead?: boolean;
  bloodStains?: boolean;
  mouthColor?: string;
}

export interface SubtitleWord {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface CharacterProps {
  x: number;
  y: number;
  scale?: number;
  direction?: 'left' | 'right';
  action: CharacterAction;
  expression: CharacterExpression;
  style: CharacterStyle;
  isSpeaking?: boolean;
  viseme?: VisemeType;
  subtitles?: SubtitleWord[];
  audioCurrentTimeSeconds?: number;
  heldProp?: 'none' | 'bat' | 'shotgun' | 'flashlight';
  opacity?: number;
}
