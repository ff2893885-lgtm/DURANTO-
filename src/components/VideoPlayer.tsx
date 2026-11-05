import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Repeat, 
  Video as VideoIcon,
  Sparkles,
  Sliders,
  Download,
  Wind
} from 'lucide-react';
import { ColorSettings, EffectSettings, SlowMoSettings } from '../types';
import { buildSvgColorMatrixValues, buildCssFilterString } from '../utils/colorMatrix';
import { MotionVectorAnalyzer } from '../utils/motionVectors';

interface VideoPlayerProps {
  videoSrc: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  colorSettings: ColorSettings;
  effectSettings: EffectSettings;
  slowMoSettings: SlowMoSettings;
  onPickVideo: () => void;
  splitView: boolean;
  onToggleSplitView: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onExport?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({
  videoSrc,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onTimeUpdate,
  onDurationChange,
  colorSettings,
  effectSettings,
  slowMoSettings,
  onPickVideo,
  splitView,
  onToggleSplitView,
  videoRef,
  onExport
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vectorCanvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<MotionVectorAnalyzer>(new MotionVectorAnalyzer());
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0-100
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  // Memoized SVG matrix calculation to eliminate CPU recalculation lag
  const svgMatrixValues = useMemo(() => buildSvgColorMatrixValues(colorSettings), [colorSettings]);
  const cssFallbackFilter = useMemo(() => buildCssFilterString(colorSettings, {
    sharpen4K: effectSettings.sharpen4K,
    cyanGlow: effectSettings.cyanGlow,
    cyanGlowIntensity: effectSettings.cyanGlowIntensity,
    motionBlur: effectSettings.motionBlur,
    motionBlurAmount: effectSettings.motionBlur ? 2.5 : 0
  }), [colorSettings, effectSettings]);

  // Keep playback rate in sync with slowMoSpeed
  useEffect(() => {
    if (videoRef.current) {
      const safeSpeed = Math.max(0.1, Math.min(2.0, slowMoSettings.speed));
      videoRef.current.playbackRate = safeSpeed;
    }
  }, [slowMoSettings.speed, videoRef]);

  // Handle Motion Vector overlay loop - ONLY runs when active
  useEffect(() => {
    if (!slowMoSettings.showMotionVectors) {
      if (vectorCanvasRef.current) {
        const ctx = vectorCanvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, vectorCanvasRef.current.width, vectorCanvasRef.current.height);
      }
      return; // Do NOT start animation frame when vectors are disabled!
    }

    let animId: number;
    const renderLoop = () => {
      if (
        vectorCanvasRef.current && 
        videoRef.current && 
        !videoRef.current.paused
      ) {
        analyzerRef.current.drawVectors(
          vectorCanvasRef.current,
          videoRef.current,
          slowMoSettings.speed
        );
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [slowMoSettings.showMotionVectors, slowMoSettings.speed, videoRef]);

  // Handle Split Screen Drag
  const handleSplitMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!isDraggingSplit || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPos(percent);
  }, [isDraggingSplit]);

  useEffect(() => {
    const onMouseUp = () => setIsDraggingSplit(false);
    const onMouseMove = (e: MouseEvent) => handleSplitMouseMove(e);

    if (isDraggingSplit) {
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    }
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isDraggingSplit, handleSplitMouseMove]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTimecode = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const currentFrame = Math.floor(currentTime * 30);

  const [videoDims, setVideoDims] = useState<{ width: number; height: number; aspectRatio: number }>({
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9
  });

  const handleMetadataLoaded = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const v = e.currentTarget;
    onDurationChange(v.duration);
    if (v.videoWidth && v.videoHeight) {
      setVideoDims({
        width: v.videoWidth,
        height: v.videoHeight,
        aspectRatio: v.videoWidth / v.videoHeight
      });
    }
  };

  const isPortrait = videoDims.height > videoDims.width;
  const is4K = videoDims.width >= 3840 || videoDims.height >= 3840;

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 bg-black rounded-lg border border-white/10 m-2 flex items-center justify-center overflow-hidden select-none group min-h-[280px]"
    >
      {/* Hidden SVG Filter definition for 5x5 Color Matrix + Directional Motion Blur */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="durango-5x5-matrix" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={svgMatrixValues} />
          {effectSettings.motionBlur && (
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.8 0.6" />
          )}
        </filter>
      </svg>

      {/* Main Video Element */}
      {videoSrc ? (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* Dynamic Aspect Ratio Layer (Preserves original dimensions) */}
          <div 
            className="relative max-w-full max-h-full flex items-center justify-center shadow-2xl"
            style={{
              aspectRatio: `${videoDims.aspectRatio}`,
              height: isPortrait ? '100%' : 'auto',
              width: !isPortrait ? '100%' : 'auto',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              playsInline
              loop={isLooping}
              muted={isMuted}
              crossOrigin="anonymous"
              onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
              onLoadedMetadata={handleMetadataLoaded}
              onDurationChange={(e) => {
                const d = e.currentTarget.duration;
                if (d && isFinite(d) && d > 0) onDurationChange(d);
              }}
              onCanPlay={(e) => {
                const d = e.currentTarget.duration;
                if (d && isFinite(d) && d > 0) onDurationChange(d);
              }}
              onLoadedData={(e) => {
                const d = e.currentTarget.duration;
                if (d && isFinite(d) && d > 0) onDurationChange(d);
              }}
              onClick={onTogglePlay}
              className={`w-full h-full object-contain cursor-pointer transition-all ${
                effectSettings.sharpen4K ? 'contrast-105' : ''
              }`}
              style={{
                filter: `url(#durango-5x5-matrix) ${cssFallbackFilter}`,
                boxShadow: effectSettings.cyanGlow 
                  ? `0 0 ${25 * effectSettings.cyanGlowIntensity}px rgba(0, 210, 255, 0.45)` 
                  : 'none'
              }}
            />

            {/* Split Screen Original Comparison Layer */}
            {splitView && (
              <div 
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${splitPos}%` }}
              >
                <video
                  src={videoSrc}
                  playsInline
                  loop={isLooping}
                  muted
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain pointer-events-none"
                  style={{
                    width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                    maxWidth: 'none',
                    filter: 'none'
                  }}
                  ref={(el) => {
                    if (el && videoRef.current) {
                      el.currentTime = videoRef.current.currentTime;
                    }
                  }}
                />
                {/* Badge for Original Side */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur border border-white/20 text-[10px] font-mono px-2 py-0.5 rounded text-neutral-300">
                  RAW ORIGINAL
                </div>
              </div>
            )}

            {/* Split screen wipe divider handle */}
            {splitView && (
              <div 
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize z-20 flex items-center justify-center"
                style={{ left: `${splitPos}%` }}
                onMouseDown={() => setIsDraggingSplit(true)}
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg border border-white text-[10px] font-bold">
                  <Sliders className="w-3 h-3 rotate-90" />
                </div>
                <div className="absolute top-4 right-4 bg-cyan-950/80 backdrop-blur border border-cyan-500/40 text-[10px] font-mono px-2 py-0.5 rounded text-cyan-300">
                  DURANGO GRADED
                </div>
              </div>
            )}

            {/* Motion Vectors HUD Overlay Canvas */}
            <canvas
              ref={vectorCanvasRef}
              width={1280}
              height={720}
              className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
                slowMoSettings.showMotionVectors ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Film Grain Shader Overlay */}
            {effectSettings.filmGrain && (
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 z-10"
                style={{
                  backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)`,
                  backgroundSize: '4px 4px'
                }}
              />
            )}

            {/* Cinematic Letterbox Masking */}
            {effectSettings.letterbox === 'cinematic' && (
              <>
                <div className="absolute top-0 left-0 right-0 h-[10%] bg-black pointer-events-none z-10 border-b border-neutral-900" />
                <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black pointer-events-none z-10 border-t border-neutral-900" />
              </>
            )}

            {/* Vignette Shadow */}
            {colorSettings.vignette > 0 && (
              <div 
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  boxShadow: `inset 0 0 ${120 * colorSettings.vignette}px rgba(0,0,0,${colorSettings.vignette * 0.9})`
                }}
              />
            )}
          </div>

          {/* Centered Large Play/Pause Overlay Button (matching Flutter) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={onTogglePlay}
              className={`pointer-events-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white/90 hover:text-white hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-xl ${
                isPlaying ? 'opacity-0 group-hover:opacity-80' : 'opacity-100'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-1 fill-white" />
              )}
            </button>
          </div>

          {/* Bottom HUD Bar */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-neutral-300 opacity-90 hover:opacity-100 transition-opacity z-20">
            {/* Left: Timecode and frame */}
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold tabular-nums">
                {formatTimecode(currentTime)}
              </span>
              <span className="text-neutral-500">/</span>
              <span className="text-neutral-400 tabular-nums">
                {formatTimecode(duration)}
              </span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                FRM {currentFrame}
              </span>
            </div>

            {/* Center: Motion & Grade Badges */}
            <div className="hidden sm:flex items-center gap-2 text-[10px]">
              <span className="bg-purple-950/70 border border-purple-800/40 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                {videoDims.width}×{videoDims.height} {is4K ? '• 4K UHD' : ''}
              </span>
              <span className="bg-amber-950/70 border border-amber-800/40 text-amber-300 px-2 py-0.5 rounded font-bold font-mono">
                {slowMoSettings.speed.toFixed(2)}x · 120 FPS
              </span>
              {slowMoSettings.afterEffectsMode && (
                <span className="bg-gradient-to-r from-blue-950 via-purple-950 to-cyan-950 border border-cyan-400/50 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                  AE SMOOTH
                </span>
              )}
              {effectSettings.cyanGlow && (
                <span className="bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 px-2 py-0.5 rounded">
                  CYAN GLOW
                </span>
              )}
              {effectSettings.motionBlur && (
                <span className="bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <Wind className="w-2.5 h-2.5" />
                  MOTION BLUR 180°
                </span>
              )}
              {slowMoSettings.showMotionVectors && (
                <span className="bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  OPTICAL FLOW HUD
                </span>
              )}
            </div>

            {/* Right: Export, Audio, Loop, Fullscreen controls */}
            <div className="flex items-center gap-2">
              {onExport && (
                <button
                  onClick={onExport}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  title="Export Graded 120 FPS Video"
                >
                  <Download className="w-3 h-3 stroke-[2.5]" />
                  <span>Export</span>
                </button>
              )}

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-1 rounded transition-colors ${
                  isLooping ? 'text-cyan-400 bg-cyan-950/40' : 'text-neutral-400 hover:text-white'
                }`}
                title={isLooping ? 'Looping Enabled' : 'Looping Disabled'}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State matching Flutter inkwell */
        <div 
          onClick={onPickVideo}
          className="flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-white/[0.02] transition-colors rounded-lg w-full h-full"
        >
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_24px_rgba(0,210,255,0.45)] mb-4 group-hover:scale-105 transition-transform bg-black">
            <img 
              src="/assets/aistudio/ChatGPT_Image_Sep_23__2026__11_46_58_AM_304c70b5.png" 
              alt="DURANTO Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Tap to pick a video for DURANTO
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm">
            Load an extreme sports, drift or action video to test 120 FPS After Effects optical slow-mo and motion blur.
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPickVideo();
            }}
            className="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/40 transition-all active:scale-95 cursor-pointer"
          >
            Browse Samples & Files
          </button>
        </div>
      )}
    </div>
  );
});
