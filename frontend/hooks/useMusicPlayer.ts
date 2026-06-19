'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const DEFAULT_VOLUME = 0.4;
const STORAGE_KEY_MUTED = 'music_muted';
const STORAGE_KEY_VOLUME = 'music_volume';

export function useMusicPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
  });
  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_VOLUME;
    return parseFloat(localStorage.getItem(STORAGE_KEY_VOLUME) ?? String(DEFAULT_VOLUME));
  });

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = muted ? 0 : volume;
    audioRef.current = audio;

    audio.play().catch(() => {
      // Autoplay blocked — will play on first user interaction
      const resume = () => { audio.play(); document.removeEventListener('click', resume); };
      document.addEventListener('click', resume, { once: true });
    });

    return () => { audio.pause(); audio.src = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.volume = next ? 0 : volume;
      localStorage.setItem(STORAGE_KEY_MUTED, String(next));
      return next;
    });
  }, [volume]);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    localStorage.setItem(STORAGE_KEY_VOLUME, String(val));
    if (audioRef.current && !muted) audioRef.current.volume = val;
  }, [muted]);

  return { muted, volume, toggleMute, setVolume };
}
