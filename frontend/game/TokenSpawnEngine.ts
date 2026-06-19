import * as Phaser from 'phaser';
import {
  SPAWN_INTERVAL_MS,
  INITIAL_SPAWN_DELAY_MS,
  MAX_TOKENS_ON_SCREEN,
  DIFFICULTY_INTERVAL_SECONDS,
  DIFFICULTY_SPAWN_REDUCTION,
  MIN_SPAWN_INTERVAL_MS,
  TokenType,
} from '@/utils/constants';
import {
  SpawnPoint,
  generateGridSpawnPoints,
  pickRandomTokenType,
  selectSpawnPositions,
  positionKey,
  createSeededRng,
} from '@/utils/spawnLogic';

export interface SpawnConfig {
  /** Base interval between spawns in ms. Default: SPAWN_INTERVAL_MS */
  spawnIntervalMs?: number;
  /** Delay before first spawn. Default: INITIAL_SPAWN_DELAY_MS */
  initialDelayMs?: number;
  /** Max simultaneous tokens on screen. Default: MAX_TOKENS_ON_SCREEN */
  maxTokens?: number;
  /** Enable automatic difficulty scaling. Default: true */
  difficultyScaling?: boolean;
  /** Seed for deterministic randomness (ranked mode). Omit for free mode. */
  seed?: number;
}

export interface SpawnEvent {
  position: SpawnPoint;
  type: TokenType;
}

type SpawnCallback = (events: SpawnEvent[]) => void;

/**
 * TokenSpawnEngine
 *
 * Manages when and where tokens appear.
 * Decoupled from rendering — calls the provided callback with spawn events,
 * leaving visual creation to the caller (e.g. GameScene).
 */
export class TokenSpawnEngine {
  private scene: Phaser.Scene;
  private config: Required<SpawnConfig>;
  private rng: () => number;
  private spawnPoints: SpawnPoint[];
  private occupiedPositions: Set<string> = new Set();
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private difficultyTimer: Phaser.Time.TimerEvent | null = null;
  private currentInterval: number;
  private onSpawn: SpawnCallback;
  private active = false;

  constructor(scene: Phaser.Scene, onSpawn: SpawnCallback, config: SpawnConfig = {}) {
    this.scene = scene;
    this.onSpawn = onSpawn;
    this.config = {
      spawnIntervalMs: config.spawnIntervalMs ?? SPAWN_INTERVAL_MS,
      initialDelayMs: config.initialDelayMs ?? INITIAL_SPAWN_DELAY_MS,
      maxTokens: config.maxTokens ?? MAX_TOKENS_ON_SCREEN,
      difficultyScaling: config.difficultyScaling ?? true,
      seed: config.seed ?? 0,
    };
    this.currentInterval = this.config.spawnIntervalMs;
    this.rng = config.seed !== undefined ? createSeededRng(config.seed) : Math.random;
    this.spawnPoints = generateGridSpawnPoints();
  }

  start(): void {
    this.active = true;
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.config.initialDelayMs,
      callback: this.tick,
      callbackScope: this,
      loop: true,
    });

    if (this.config.difficultyScaling) {
      this.difficultyTimer = this.scene.time.addEvent({
        delay: DIFFICULTY_INTERVAL_SECONDS * 1000,
        callback: this.increaseDifficulty,
        callbackScope: this,
        loop: true,
      });
    }
  }

  stop(): void {
    this.active = false;
    this.spawnTimer?.destroy();
    this.difficultyTimer?.destroy();
    this.spawnTimer = null;
    this.difficultyTimer = null;
  }

  /** Call when a token is placed so its position is marked occupied. */
  markOccupied(x: number, y: number): void {
    this.occupiedPositions.add(positionKey(x, y));
  }

  /** Call when a token is removed to free its position. */
  markFree(x: number, y: number): void {
    this.occupiedPositions.delete(positionKey(x, y));
  }

  /** Current number of occupied positions (= live tokens). */
  get tokenCount(): number {
    return this.occupiedPositions.size;
  }

  /** Current spawn interval in ms (decreases as difficulty rises). */
  get spawnIntervalMs(): number {
    return this.currentInterval;
  }

  private tick(): void {
    if (!this.active) return;
    if (this.occupiedPositions.size >= this.config.maxTokens) return;

    const slots = this.config.maxTokens - this.occupiedPositions.size;
    const positions = selectSpawnPositions(
      this.occupiedPositions,
      this.spawnPoints,
      slots,
      this.rng,
    );

    const events: SpawnEvent[] = positions.map((pos) => ({
      position: pos,
      type: pickRandomTokenType(this.rng),
    }));

    if (events.length > 0) this.onSpawn(events);
  }

  private increaseDifficulty(): void {
    if (!this.active) return;
    this.currentInterval = Math.max(
      MIN_SPAWN_INTERVAL_MS,
      this.currentInterval - DIFFICULTY_SPAWN_REDUCTION,
    );
    this.spawnTimer?.destroy();
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.currentInterval,
      callback: this.tick,
      callbackScope: this,
      loop: true,
    });
  }
}
