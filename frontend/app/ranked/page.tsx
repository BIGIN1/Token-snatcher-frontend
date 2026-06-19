"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import ScoreBoard from "@/components/ScoreBoard";
import MusicControls from "@/components/MusicControls";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useAudio } from "@/hooks/useAudio";
import RequireWallet from "@/components/RequireWallet";

const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
});

export default function RankedPage() {
  const { muted, volume, toggleMute, setVolume } = useMusicPlayer(
    "/audio/gameplay.mp3",
  );
  const { sfxMuted, playClick, playSuccess, playError, toggleSfxMute } =
    useAudio();
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const handleScoreUpdate = useCallback(
    (newScore: number, newCombo: number) => {
      setScore(newScore);
      setCombo(newCombo);
    },
    [],
  );

  const handleGameOver = useCallback((finalScore: number) => {
    setGameOver(true);
    setFinalScore(finalScore);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setCombo(0);
    setGameOver(false);
    setFinalScore(0);
    setGameKey((k) => k + 1);
  }, []);

  return (
    <RequireWallet>
      <div className="flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-mono">Ranked Mode</h1>
              <p className="text-sm text-[#94a3b8] font-mono">
                60 seconds. Compete for the highest score.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ScoreBoard score={score} combo={combo} />
              <MusicControls
                muted={muted}
                volume={volume}
                onToggleMute={toggleMute}
                onVolumeChange={setVolume}
                sfxMuted={sfxMuted}
                onToggleSfx={toggleSfxMute}
              />
            </div>
          </div>

          {gameOver ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold font-mono mb-2">
                Time&apos;s Up!
              </h2>
              <p className="text-5xl font-bold text-[#f59e0b] font-mono mb-2">
                {finalScore.toLocaleString()}
              </p>
              <p className="text-sm text-[#94a3b8] font-mono mb-8">
                final score
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleRestart}
                  className="px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white font-bold rounded-xl hover:from-[#2563eb] hover:to-[#7c3aed] transition-all text-lg font-mono"
                >
                  Play Again
                </button>
                <a
                  href="/"
                  className="px-8 py-4 border border-[#334155] text-[#94a3b8] font-bold rounded-xl hover:text-white hover:border-[#475569] transition-all text-lg font-mono"
                >
                  Main Menu
                </a>
              </div>
            </div>
          ) : (
            <GameCanvas
              key={gameKey}
              mode="ranked"
              onScoreUpdate={handleScoreUpdate}
              onGameOver={handleGameOver}
              onClickSound={playClick}
              onSuccessSound={playSuccess}
              onErrorSound={playError}
            />
          )}
        </div>
      </div>
    </RequireWallet>
  );
}
