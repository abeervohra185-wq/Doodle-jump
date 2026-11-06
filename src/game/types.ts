export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type ThemeId = 'classic' | 'galaxy' | 'jungle' | 'retro';

export type PlatformType = 
  | 'standard' 
  | 'moving' 
  | 'vertical' 
  | 'broken' 
  | 'disappearing';

export type ItemType = 
  | 'spring' 
  | 'trampoline' 
  | 'propeller' 
  | 'jetpack' 
  | 'shield';

export type MonsterType = 'flyer' | 'static' | 'blackhole';

export interface Item {
  type: ItemType;
  x: number; // relative to platform
  y: number; // relative to platform
  width: number;
  height: number;
  used?: boolean;
}

export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  vx: number;
  vy: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  broken?: boolean;
  brokenTimer?: number;
  disappeared?: boolean;
  item?: Item;
}

export interface Monster {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: MonsterType;
  vx: number;
  alive: boolean;
  animFrame: number;
  rotation?: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'star' | 'chunk';
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  squashFactor: number; // for landing squash & jump stretch
  activePowerup: 'propeller' | 'jetpack' | null;
  powerupTimeRemaining: number;
  hasShield: boolean;
  shootAnimTimer: number;
}

export interface ScoreMarker {
  altitude: number;
  label: string;
  type: 'personal' | 'milestone';
}

export interface GameStats {
  score: number;
  highScore: number;
  maxAltitude: number;
  monstersDefeated: number;
  springsUsed: number;
  jetpacksUsed: number;
  gamesPlayed: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}
