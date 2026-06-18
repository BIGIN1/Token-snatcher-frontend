export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const RANKED_DURATION_SECONDS = 60;
export const FREE_DURATION_SECONDS = 0;

export const TOKEN_TYPES = ['blue', 'gold', 'red', 'golden'] as const;
export type TokenType = (typeof TOKEN_TYPES)[number];

export const GOLDEN_TOKEN_BONUS_POINTS = 75;
export const GOLDEN_TOKEN_MULTIPLIER = 2;

export const TOKEN_CONFIG: Record<
  TokenType,
  { points: number; color: number; spawnWeight: number; lifetimeMs: number; isGolden?: boolean }
> = {
  blue: { points: 10, color: 0x3b82f6, spawnWeight: 60, lifetimeMs: 1500 },
  gold: { points: 25, color: 0xf59e0b, spawnWeight: 30, lifetimeMs: 1000 },
  red: { points: 50, color: 0xef4444, spawnWeight: 10, lifetimeMs: 700 },
  // Rare golden token: high base value + bonus (distinct FX)
  golden: {
    points: 40,
    color: 0xfbbf24,
    spawnWeight: 5,
    lifetimeMs: 900,
    isGolden: true,
  },
};


export const MAX_TOKENS_ON_SCREEN = 8;
export const SPAWN_INTERVAL_MS = 800;
export const INITIAL_SPAWN_DELAY_MS = 1000;

export const COMBO_TIMEOUT_MS = 2000;
export const COMBO_MULTIPLIER_INCREMENT = 0.5;
export const MAX_COMBO_MULTIPLIER = 5;

export const DIFFICULTY_INTERVAL_SECONDS = 15;
export const DIFFICULTY_SPAWN_REDUCTION = 50;
export const MIN_SPAWN_INTERVAL_MS = 300;

export const TOKEN_RADIUS = 28;

export const GRID_COLS = 5;
export const GRID_ROWS = 4;
export const GRID_PADDING = 60;
