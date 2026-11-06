import { ThemeId, Achievement } from './types';

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 720;

export const PHYSICS = {
  GRAVITY: 0.38,
  JUMP_FORCE: -11.6,
  SPRING_FORCE: -19.5,
  TRAMPOLINE_FORCE: -23.0,
  PROPELLER_SPEED: -5.5,
  PROPELLER_DURATION: 3.5, // seconds
  JETPACK_SPEED: -10.0,
  JETPACK_DURATION: 4.5, // seconds
  PLAYER_SPEED: 7.2,
  PLAYER_ACCEL: 0.85,
  PLAYER_FRICTION: 0.86,
  MAX_FALL_SPEED: 14.0,
  PROJECTILE_SPEED: -15.0,
};

export const PLATFORM = {
  WIDTH: 74,
  HEIGHT: 18,
  MIN_GAP: 55,
  MAX_GAP_BASE: 120,
  MAX_GAP_LIMIT: 165,
};

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  bgClass: string;
  canvasBg: string;
  gridLineColor: string;
  platformColors: {
    standard: string;
    standardBorder: string;
    moving: string;
    movingBorder: string;
    vertical: string;
    verticalBorder: string;
    broken: string;
    brokenBorder: string;
    disappearing: string;
    disappearingBorder: string;
  };
  playerColor: string;
  playerBorder: string;
  playerNose: string;
  accentColor: string;
  uiBg: string;
  doodleOutline: boolean;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic Notebook',
    description: 'Iconic graph paper & hand-drawn doodle aesthetic',
    bgClass: 'bg-graph-paper',
    canvasBg: '#fdfbf4',
    gridLineColor: 'rgba(180, 160, 130, 0.25)',
    platformColors: {
      standard: '#78c044',
      standardBorder: '#487c24',
      moving: '#479bd3',
      movingBorder: '#235f8a',
      vertical: '#f49d37',
      verticalBorder: '#a35d10',
      broken: '#a67243',
      brokenBorder: '#643d1a',
      disappearing: '#ffffff',
      disappearingBorder: '#cbd5e1',
    },
    playerColor: '#8ec63f',
    playerBorder: '#4c7b1c',
    playerNose: '#ff9052',
    accentColor: '#8ec63f',
    uiBg: '#fffdf8',
    doodleOutline: true,
  },
  galaxy: {
    id: 'galaxy',
    name: 'Night Galaxy',
    description: 'Deep cosmic void with glowing celestial platforms',
    bgClass: 'bg-galaxy',
    canvasBg: '#090d16',
    gridLineColor: 'rgba(56, 189, 248, 0.08)',
    platformColors: {
      standard: '#06b6d4',
      standardBorder: '#0891b2',
      moving: '#8b5cf6',
      movingBorder: '#7c3aed',
      vertical: '#ec4899',
      verticalBorder: '#db2777',
      broken: '#475569',
      brokenBorder: '#334155',
      disappearing: '#e0e7ff',
      disappearingBorder: '#a5b4fc',
    },
    playerColor: '#38bdf8',
    playerBorder: '#0284c7',
    playerNose: '#f43f5e',
    accentColor: '#38bdf8',
    uiBg: '#0f172a',
    doodleOutline: false,
  },
  jungle: {
    id: 'jungle',
    name: 'Jungle Safari',
    description: 'Dense rainforest canopy with vine-covered steps',
    bgClass: 'bg-jungle',
    canvasBg: '#132817',
    gridLineColor: 'rgba(74, 222, 128, 0.08)',
    platformColors: {
      standard: '#22c55e',
      standardBorder: '#15803d',
      moving: '#eab308',
      movingBorder: '#a16207',
      vertical: '#f97316',
      verticalBorder: '#c2410c',
      broken: '#78350f',
      brokenBorder: '#451a03',
      disappearing: '#86efac',
      disappearingBorder: '#4ade80',
    },
    playerColor: '#84cc16',
    playerBorder: '#4d7c0f',
    playerNose: '#f59e0b',
    accentColor: '#22c55e',
    uiBg: '#142a18',
    doodleOutline: false,
  },
  retro: {
    id: 'retro',
    name: '8-Bit Arcade',
    description: 'Synthwave scanlines & vibrant arcade pixels',
    bgClass: 'bg-retro',
    canvasBg: '#0f0e1c',
    gridLineColor: 'rgba(236, 72, 153, 0.15)',
    platformColors: {
      standard: '#10b981',
      standardBorder: '#059669',
      moving: '#06b6d4',
      movingBorder: '#0891b2',
      vertical: '#f59e0b',
      verticalBorder: '#d97706',
      broken: '#6b7280',
      brokenBorder: '#4b5563',
      disappearing: '#f43f5e',
      disappearingBorder: '#e11d48',
    },
    playerColor: '#ec4899',
    playerBorder: '#be185d',
    playerNose: '#fbbf24',
    accentColor: '#ec4899',
    uiBg: '#18162d',
    doodleOutline: false,
  },
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_jump',
    title: 'First Bounce',
    description: 'Take your first leap into the stratosphere',
    unlocked: false,
    icon: '🚀',
  },
  {
    id: 'altitude_1k',
    title: 'Sky Bound',
    description: 'Reach an altitude of 1,000 points',
    unlocked: false,
    icon: '☁️',
  },
  {
    id: 'altitude_5k',
    title: 'Cloud Walker',
    description: 'Ascend past 5,000 points into the high sky',
    unlocked: false,
    icon: '⭐',
  },
  {
    id: 'altitude_10k',
    title: 'Orbit Explorer',
    description: 'Surpass 10,000 points into deep space',
    unlocked: false,
    icon: '🪐',
  },
  {
    id: 'spring_master',
    title: 'Super Coil',
    description: 'Bounce on 5 spring coils in a single game',
    unlocked: false,
    icon: '🌀',
  },
  {
    id: 'jetsetter',
    title: 'Jetsetter',
    description: 'Equip a jetpack and blaze past the clouds',
    unlocked: false,
    icon: '🔥',
  },
  {
    id: 'monster_hunter',
    title: 'Alien Buster',
    description: 'Defeat 3 floating monsters in a single run',
    unlocked: false,
    icon: '👾',
  },
  {
    id: 'propeller_ace',
    title: 'Propeller Ace',
    description: 'Collect a propeller hat and fly uninterrupted',
    unlocked: false,
    icon: '🚁',
  },
];
