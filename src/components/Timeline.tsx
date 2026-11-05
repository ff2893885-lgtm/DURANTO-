import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  Layers, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX,
  Sliders,
  Scissors,
  Download
} from 'lucide-react';
import { TimelineTrack, SlowMoSettings, EffectSettings } from '../types';

interface TimelineProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  slowMoSpeed: number;
  effectSettings: EffectSettings;
  onToggleAdjustmentLayer: () => void;
  adjustmentLayerActive: boolean;
  onExport: () => void;
}

const TimelineComponent: React.FC<TimelineProps> = ({
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  slowMoSpeed,
  effectSettings,
  onToggleAdjustmentLayer,
  adjustmentLayerActive,
  onExport
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const safeDuration = duration > 0 ? duration : 10;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));

  // Handle Scrub
  const handleScrub = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetTime = (x / rect.width) * safeDuration;
    onSeek(targetTime);
  }, [safeDuration, onSeek]);

  useEffect(() => {
    const onMouseUp = () => setIsScrubbing(false);
    const onMouseMove = (e: MouseEvent) => {
      if (isScrubbing) handleScrub(e);
    };

    if (isScrubbing) {
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    }
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isScrubbing, handleScrub]);

  // Frame Stepping
  const stepFrame = (frames: number) => {
    const target = Math.max(0, Math.min(safeDuration, currentTime + frames * (1 / 30)));
    onSeek(target);
  };

  // Generate ruler tick marks (memoized to prevent re-allocating array on every frame)
  const tickCount = 10;
  const ticks = React.useMemo(() => Array.from({ length: tickCount + 1 }), [tickCount]);

  return (
    <div className="h-[148px] bg-[#181818] border-t border-white/10 flex flex-col shrink-0 select-none">
      {/* Header Bar matching Flutter */}
      <div className="h-7 px-3 bg-[#222222] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[10px] font-bold text-neutral-400 tracking-wider">
            TIMELINE LAYERS
          </span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSeek(0)}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/5"
            title="Jump to Start"
          >
            <SkipBack className="w-3 h-3" />
          </button>

          <button
            onClick={() => stepFrame(-1)}
            className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 hover:text-white rounded hover:bg-white/5"
            title="Step Back 1 Frame"
          >
            -1F
          </button>

          <button
            onClick={onTogglePlay}
            className="p-1 text-cyan-400 hover:text-white rounded hover:bg-white/10"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-cyan-400" />}
          </button>

          <button
            onClick={() => stepFrame(1)}
            className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 hover:text-white rounded hover:bg-white/5"
            title="Step Forward 1 Frame"
          >
            +1F
          </button>

          <div className="h-3 w-px bg-white/10 mx-1" />

          <span className="text-[10px] font-mono text-cyan-400 font-semibold tabular-nums">
            {currentTime.toFixed(2)}s / {safeDuration.toFixed(2)}s
          </span>

          <div className="h-3 w-px bg-white/10 mx-1" />

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold shadow-sm transition-transform active:scale-95 cursor-pointer ml-1"
            title="Export Video (120 FPS / Full Duration)"
          >
            <Download className="w-3 h-3 stroke-[2.5]" />
            <span>Export (120 FPS)</span>
          </button>
        </div>
      </div>

      {/* Interactive Time Ruler */}
      <div 
        ref={rulerRef}
        onMouseDown={(e) => {
          setIsScrubbing(true);
          handleScrub(e);
        }}
        className="relative h-5 bg-[#1a1a1a] border-b border-white/5 cursor-pointer flex items-center px-2 group"
      >
        {/* Ricks */}
        {ticks.map((_, i) => {
          const t = (i / tickCount) * safeDuration;
          return (
            <div 
              key={i} 
              className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
              style={{ left: `${(i / tickCount) * 100}%` }}
            >
              <div className="w-px h-1.5 bg-neutral-600" />
              <span className="text-[8px] font-mono text-neutral-500 transform -translate-x-1/2">
                {t.toFixed(1)}s
              </span>
            </div>
          );
        })}

        {/* Playhead indicator on ruler */}
        <div 
          className="absolute top-0 bottom-0 w-2 -ml-1 bg-cyan-400 z-20 flex flex-col items-center pointer-events-none"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-cyan-400" />
        </div>
      </div>

      {/* Multi-Track Layers View matching Flutter tracks */}
      <div className="relative flex-1 p-2 flex flex-col gap-1.5 overflow-hidden">
        {/* Continuous Playhead Line across all tracks */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10 pointer-events-none shadow-sm shadow-cyan-400/80"
          style={{ left: `calc(${progressPercent}% + 8px)` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 -ml-[2px] -mt-[3px]" />
        </div>

        {/* Track 1: Adjustment Layer (CC Glow) */}
        <div 
          className={`h-7 px-3 rounded flex items-center justify-between border transition-all ${
            adjustmentLayerActive
              ? 'bg-purple-950/25 border-purple-500/40 text-purple-200'
              : 'bg-neutral-900/40 border-neutral-800 text-neutral-500 opacity-60'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAdjustmentLayer}
              className="p-0.5 hover:text-white rounded"
              title="Toggle Adjustment Layer"
            >
              {adjustmentLayerActive ? <Eye className="w-3 h-3 text-purple-400" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <span className="text-xs font-medium">Adjustment Layer (CC Glow)</span>
          </div>

          <div className="flex items-center gap-2">
            {effectSettings.cyanGlow && (
              <span className="text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-mono">
                GLOW ACTIVE
              </span>
            )}
            <div className="px-2 py-0.5 rounded bg-black/45 text-[9px] font-mono text-purple-300 border border-purple-900/50">
              {adjustmentLayerActive ? 'Applied' : 'Bypassed'}
            </div>
          </div>
        </div>

        {/* Track 2: Main Video Track */}
        <div 
          className="h-7 px-3 rounded flex items-center justify-between bg-blue-950/25 border border-blue-500/40 text-blue-200"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs font-medium text-white">Main Video Track</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-blue-300 font-mono hidden sm:inline">
              REC.709 • 120 FPS OPTICAL
            </span>
            <div className="px-2 py-0.5 rounded bg-black/45 text-[9px] font-mono text-cyan-300 border border-cyan-800/40 font-bold">
              {slowMoSpeed.toFixed(1)}x · 120 FPS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Timeline = React.memo(TimelineComponent);
