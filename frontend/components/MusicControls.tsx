'use client';

interface MusicControlsProps {
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (val: number) => void;
  sfxMuted: boolean;
  onToggleSfx: () => void;
}

export default function MusicControls({
  muted,
  volume,
  onToggleMute,
  onVolumeChange,
  sfxMuted,
  onToggleSfx,
}: MusicControlsProps) {
  return (
    <div className="flex items-center gap-3 bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2">
      <button
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute music' : 'Mute music'}
        className="text-lg hover:scale-110 transition-transform"
      >
        {muted ? '🔇' : '🎵'}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={muted ? 0 : volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        aria-label="Music volume"
        className="w-24 accent-[#3b82f6] cursor-pointer"
      />
      <span className="text-xs text-[#64748b] font-mono w-8">
        {muted ? '0%' : `${Math.round(volume * 100)}%`}
      </span>
      <div className="w-px h-5 bg-[#334155]" />
      <button
        onClick={onToggleSfx}
        aria-label={sfxMuted ? 'Unmute SFX' : 'Mute SFX'}
        title={sfxMuted ? 'SFX off' : 'SFX on'}
        className="text-lg hover:scale-110 transition-transform"
      >
        {sfxMuted ? '🔕' : '🔔'}
      </button>
    </div>
  );
}
