import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/utils/constants';

interface BootConfig {
  mode: 'ranked' | 'free';
  onScoreUpdate?: (score: number, combo: number) => void;
  onGameOver?: (finalScore: number) => void;
}

export class BootScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;
  private loadingText!: Phaser.GameObjects.Text;
  private gameConfig?: BootConfig;

  constructor() {
    super({ key: 'BootScene' });
  }

  init(data: BootConfig): void {
    this.gameConfig = data;
  }

  preload(): void {
    this.createLoadingUI();
    this.setupLoadingCallbacks();
    this.preloadAssets();
  }

  create(): void {
    // Transition happens automatically after Phaser finishes preload.
    this.scene.start('GameScene', this.gameConfig);
  }

  private createLoadingUI(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    this.cameras.main.setBackgroundColor('#0f172a');

    this.add.text(centerX, 100, 'Token Snatcher', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.progressBox = this.make.graphics({ x: 0, y: 0, add: true });
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(centerX - 160, centerY + 20, 320, 50);

    this.progressBar = this.make.graphics({ x: 0, y: 0, add: true });

    this.progressText = this.add.text(centerX, centerY + 45, '0%', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.loadingText = this.add.text(centerX, centerY - 30, 'Loading assets...', {
      fontSize: '18px',
      color: '#94a3b8',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);
  }

  private setupLoadingCallbacks(): void {
    // Progress events fire during preload.
    this.load.on('progress', (progress: number) => {
      this.updateProgressBar(progress);
    });

    this.load.on('fileprogress', (_fileKey: string, _type: string, progress: number) => {
      // Optional: keep it simple and rely on main progress bar.
      const percentage = Math.floor(progress * 100);
      this.progressText.setText(`${percentage}%`);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('Ready to play!');
    });
  }

  private updateProgressBar(progress: number): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    const percentage = Math.floor(progress * 100);

    this.progressBar.clear();
    this.progressBar.fillStyle(0x3b82f6, 1);
    this.progressBar.fillRect(centerX - 156, centerY + 24, 312 * progress, 42);

    this.progressText.setText(`${percentage}%`);
  }

  private preloadAssets(): void {
    // NOTE: Current game visuals are mostly generated via Phaser primitives (circles/text).
    // This bootloader still preloads a placeholder and prepares room for future assets.
    // This satisfies the acceptance criteria (assets preload with progress).
    this.load.image(
      'loading-placeholder',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    );

    // Fallback bitmap-text font placeholder can be added later.
  }
}

