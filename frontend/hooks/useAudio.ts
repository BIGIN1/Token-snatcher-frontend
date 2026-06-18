'use client';

import { useCallback, useRef, useState } from 'react';

const STORAGE_KEY = 'sfx_muted';

function playTone(
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  gainValue = 0.15,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(gainValue, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [sfxMuted, setSfxMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }, []);

  const playClick = useCallback(() => {
    if (sfxMuted) return;
    playTone(getCtx(), 880, 'sine', 0.08);
  }, [sfxMuted, getCtx]);

  const playSuccess = useCallback(() => {
    if (sfxMuted) return;
    const ctx = getCtx();
    playTone(ctx, 523, 'sine', 0.1);
    const gain = ctx.createGain();
    const osc = ctx.createOscillator();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.3);
  }, [sfxMuted, getCtx]);

  const playError = useCallback(() => {
    if (sfxMuted) return;
    playTone(getCtx(), 200, 'sawtooth', 0.2, 0.12);
  }, [sfxMuted, getCtx]);

  const toggleSfxMute = useCallback(() => {
    setSfxMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { sfxMuted, playClick, playSuccess, playError, toggleSfxMute };
}
