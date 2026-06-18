'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as Phaser from 'phaser';
import { GameScene } from '@/game/scenes/GameScene';
import { ResultScene } from '@/game/scenes/ResultScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@/utils/constants';

interface GameCanvasProps {
  mode: 'ranked' | 'free';
  onScoreUpdate?: (score: number, combo: number) => void;
  onGameOver?: (finalScore: number) => void;
  onClickSound?: () => void;
  onSuccessSound?: () => void;
  onErrorSound?: () => void;
}

export default function GameCanvas({ mode, onScoreUpdate, onGameOver, onClickSound, onSuccessSound, onErrorSound }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameSceneRef = useRef<GameScene | null>(null);

  const handleGameOver = useCallback(
    (finalScore: number) => {
      onGameOver?.(finalScore);
    },
    [onGameOver],
  );

  const handleScoreUpdate = useCallback(
    (score: number, combo: number) => {
      onScoreUpdate?.(score, combo);
    },
    [onScoreUpdate],
  );

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: containerRef.current,
      backgroundColor: '#0f172a',
      scene: [GameScene, ResultScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const phaserGame = new Phaser.Game(config);
    gameRef.current = phaserGame;

    phaserGame.events.on('ready', () => {
      phaserGame.scene.start('GameScene', {
        mode,
        onScoreUpdate: handleScoreUpdate,
        onGameOver: handleGameOver,
        onClickSound,
        onSuccessSound,
        onErrorSound,
      });
    });

    return () => {
      phaserGame.destroy(true);
      gameRef.current = null;
    };
  }, [mode, handleScoreUpdate, handleGameOver, onClickSound, onSuccessSound, onErrorSound]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-[#334155] shadow-lg"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT, maxWidth: '100%' }}
    />
  );
}
