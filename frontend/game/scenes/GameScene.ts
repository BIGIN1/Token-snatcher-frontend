import * as Phaser from 'phaser';
import { TOKEN_CONFIG, TOKEN_RADIUS, SPAWN_INTERVAL_MS, RANKED_DURATION_SECONDS, FREE_DURATION_SECONDS, INITIAL_SPAWN_DELAY_MS, MAX_TOKENS_ON_SCREEN, DIFFICULTY_INTERVAL_SECONDS, DIFFICULTY_SPAWN_REDUCTION, MIN_SPAWN_INTERVAL_MS, GAME_WIDTH, GAME_HEIGHT } from '@/utils/constants';
import { createScoreState, addScore, resetScore, ScoreState } from '@/utils/scoring';
import { generateGridSpawnPoints, pickRandomTokenType, selectSpawnPositions, positionKey, SpawnPoint } from '@/utils/spawnLogic';

interface GameConfig {
  mode: 'ranked' | 'free';
  onScoreUpdate?: (score: number, combo: number) => void;
  onGameOver?: (finalScore: number) => void;
}

export class GameScene extends Phaser.Scene {
  private tokens: Phaser.GameObjects.Container[] = [];
  private occupiedPositions: Set<string> = new Set();
  private spawnPoints: SpawnPoint[] = [];
  private scoreState: ScoreState = createScoreState();
  private spawnTimer!: Phaser.Time.TimerEvent;
  private gameTimer!: Phaser.Time.TimerEvent | null;
  private difficultyTimer!: Phaser.Time.TimerEvent | null;
  private spawnInterval = SPAWN_INTERVAL_MS;
  private timeRemaining = 0;
  private mode: 'ranked' | 'free' = 'free';
  private onScoreUpdate?: (score: number, combo: number) => void;
  private onGameOver?: (finalScore: number) => void;
  private isGameOver = false;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private background!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameConfig): void {
    this.mode = data.mode ?? 'free';
    this.onScoreUpdate = data.onScoreUpdate;
    this.onGameOver = data.onGameOver;
  }

  create(): void {
    this.resetState();
    this.spawnPoints = generateGridSpawnPoints();

    this.background = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0f172a);
    this.background.setOrigin(0, 0);

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });

    this.comboText = this.add.text(16, 48, '', {
      fontSize: '18px',
      color: '#f59e0b',
      fontFamily: 'monospace',
    });

    this.timerText = this.add.text(GAME_WIDTH - 16, 16, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(1, 0);

    if (this.mode === 'ranked') {
      this.timeRemaining = RANKED_DURATION_SECONDS;
      this.timerText.setText(`${this.timeRemaining}s`);

      this.gameTimer = this.time.addEvent({
        delay: 1000,
        callback: this.onTimerTick,
        callbackScope: this,
        loop: true,
      });
    } else {
      this.timerText.setText('∞');
    }

    this.difficultyTimer = this.time.addEvent({
      delay: DIFFICULTY_INTERVAL_SECONDS * 1000,
      callback: this.increaseDifficulty,
      callbackScope: this,
      loop: true,
    });

    this.spawnTimer = this.time.addEvent({
      delay: INITIAL_SPAWN_DELAY_MS,
      callback: this.spawnTokens,
      callbackScope: this,
      loop: true,
    });
  }

  private resetState(): void {
    this.tokens = [];
    this.occupiedPositions = new Set();
    this.scoreState = resetScore();
    this.spawnInterval = SPAWN_INTERVAL_MS;
    this.timeRemaining = 0;
    this.isGameOver = false;
  }

  private onTimerTick(): void {
    if (this.isGameOver) return;
    this.timeRemaining--;
    this.timerText.setText(`${this.timeRemaining}s`);

    if (this.timeRemaining <= 0) {
      this.endGame();
    }
  }

  private increaseDifficulty(): void {
    if (this.isGameOver) return;
    this.spawnInterval = Math.max(MIN_SPAWN_INTERVAL_MS, this.spawnInterval - DIFFICULTY_SPAWN_REDUCTION);

    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }

    this.spawnTimer = this.time.addEvent({
      delay: this.spawnInterval,
      callback: this.spawnTokens,
      callbackScope: this,
      loop: true,
    });
  }

  private spawnTokens(): void {
    if (this.isGameOver) return;
    if (this.tokens.length >= MAX_TOKENS_ON_SCREEN) return;

    const availableSlots = MAX_TOKENS_ON_SCREEN - this.tokens.length;
    const positions = selectSpawnPositions(this.occupiedPositions, this.spawnPoints, availableSlots);

    for (const pos of positions) {
      this.createToken(pos);
    }
  }

  private createToken(pos: SpawnPoint): void {
    const type = pickRandomTokenType();
    const config = TOKEN_CONFIG[type];

    const container = this.add.container(pos.x, pos.y);

    const circle = this.add.circle(0, 0, TOKEN_RADIUS, config.color);
    circle.setStrokeStyle(2, 0xffffff, 0.5);

    const inner = this.add.circle(0, 0, TOKEN_RADIUS - 6, config.color, 0.3);
    inner.setStrokeStyle(1, config.color, 0.8);

    const label = this.add.text(0, 0, '$', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    container.add([circle, inner, label]);
    container.setSize(TOKEN_RADIUS * 2, TOKEN_RADIUS * 2);
    container.setInteractive(
      new Phaser.Geom.Circle(0, 0, TOKEN_RADIUS),
      Phaser.Geom.Circle.Contains,
    );

    container.on('pointerdown', () => this.snatchToken(container, config.points, config.color));
    container.on('pointerover', () => {
      circle.setScale(1.15);
      inner.setScale(1.15);
      label.setScale(1.15);
    });
    container.on('pointerout', () => {
      circle.setScale(1);
      inner.setScale(1);
      label.setScale(1);
    });

    const key = positionKey(pos.x, pos.y);
    this.occupiedPositions.add(key);
    this.tokens.push(container);

    this.time.delayedCall(config.lifetimeMs, () => {
      this.removeToken(container);
    });
  }

  private snatchToken(container: Phaser.GameObjects.Container, basePoints: number, color: number): void {
    if (this.isGameOver) return;

    const now = Date.now();
    const { state, earnedPoints } = addScore(this.scoreState, basePoints, now);
    this.scoreState = state;

    this.updateUI();

    this.showScorePopup(container.x, container.y, earnedPoints, color);

    this.onScoreUpdate?.(this.scoreState.score, this.scoreState.combo);

    this.removeToken(container);
  }

  private showScorePopup(x: number, y: number, points: number, color: number): void {
    const colorStr = '#' + color.toString(16).padStart(6, '0');
    const popup = this.add.text(x, y, `+${points}`, {
      fontSize: '22px',
      color: colorStr,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(1000);

    popup.setScale(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 50,
      alpha: 0,
      scale: 1,
      duration: 700,
      ease: 'Power2',
      onComplete: () => popup.destroy(),
    });
  }

  private removeToken(container: Phaser.GameObjects.Container): void {
    const key = positionKey(container.x, container.y);
    this.occupiedPositions.delete(key);

    const idx = this.tokens.indexOf(container);
    if (idx !== -1) {
      this.tokens.splice(idx, 1);
    }

    container.destroy();
  }

  private updateUI(): void {
    this.scoreText.setText(`Score: ${this.scoreState.score}`);

    if (this.scoreState.combo > 0) {
      const multiplier = 1 + this.scoreState.combo * 0.5;
      this.comboText.setText(`Combo x${multiplier.toFixed(1)}`);
    } else {
      this.comboText.setText('');
    }
  }

  private endGame(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    if (this.spawnTimer) this.spawnTimer.destroy();

    for (const token of [...this.tokens]) {
      this.removeToken(token);
    }

    this.onGameOver?.(this.scoreState.score);

    this.scene.start('ResultScene', {
      score: this.scoreState.score,
      mode: this.mode,
    });
  }

  handleEndGame(): void {
    this.endGame();
  }

  getScore(): number {
    return this.scoreState.score;
  }

  getScoreState(): ScoreState {
    return { ...this.scoreState };
  }
}
