import {
  GAME_WIDTH,
  GAME_HEIGHT,
  TOKEN_RADIUS,
  GRID_COLS,
  GRID_ROWS,
  GRID_PADDING,
  TOKEN_CONFIG,
  MAX_TOKENS_ON_SCREEN,
  TokenType,
} from '@/utils/constants';

export interface SpawnPoint {
  x: number;
  y: number;
}

// --- Seeded PRNG (mulberry32) ---
export function createSeededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

export function generateGridSpawnPoints(): SpawnPoint[] {
  const points: SpawnPoint[] = [];
  const cellW = (GAME_WIDTH - GRID_PADDING * 2) / GRID_COLS;
  const cellH = (GAME_HEIGHT - GRID_PADDING * 2) / GRID_ROWS;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const x = Math.round(GRID_PADDING + col * cellW + cellW / 2);
      const y = Math.round(GRID_PADDING + row * cellH + cellH / 2);
      points.push({ x, y });
    }
  }

  return points;
}

// rng defaults to Math.random for backwards-compat / free mode
export function pickRandomTokenType(rng: () => number = Math.random): TokenType {
  const rand = rng() * 100;
  let cumulative = 0;

  for (const type of ['blue', 'gold', 'red', 'golden'] as TokenType[]) {
    cumulative += TOKEN_CONFIG[type].spawnWeight;
    if (rand <= cumulative) return type;
  }

  return 'blue';
}

export function selectSpawnPositions(
  occupiedPositions: Set<string>,
  spawnPoints: SpawnPoint[],
  count: number,
  rng: () => number = Math.random,
): SpawnPoint[] {
  const available = spawnPoints.filter(
    (p) => !occupiedPositions.has(`${p.x},${p.y}`),
  );

  const shuffled = [...available].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(count, MAX_TOKENS_ON_SCREEN));
}

export function positionKey(x: number, y: number): string {
  return `${x},${y}`;
}
