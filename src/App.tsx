/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Download, Zap, Sparkles, Wind, Gauge, Smartphone } from 'lucide-react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { ControlTabs } from './components/ControlTabs';
import { Timeline } from './components/Timeline';
import { ExportModal } from './components/ExportModal';
import { SamplePickerModal } from './components/SamplePickerModal';
import { MatrixInspectorModal } from './components/MatrixInspectorModal';
import { MobileInstallModal } from './components/MobileInstallModal';
import { 
  ColorSettings, 
  EffectSettings, 
  SlowMoSettings 
} from './types';
import { SAMPLE_VIDEOS } from './utils/sampleVideos';
import { buildCssFilterString } from './utils/colorMatrix';

export default function App() {
  // Video playback state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>(SAMPLE_VIDEOS[0].url);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10);

  // Flutter control states
  // 0: SlowMo, 1: Color Correction, 2: FX
  const [selectedTab, setSelectedTab] = useState<number>(0);

  // Control sliders
  const [slowMoSettings, setSlowMoSettings] = useState<SlowMoSettings>({
    speed: 0.5, // matching Flutter _slowMoSpeed = 0.5
    quality: 'ultra_optical', // 120 FPS Ultra Optical Flow
    showMotionVectors: false,
    speedRamp: 'constant',
    aiFrameInterpolation: true,
    ultraSmooth: true,
    smoothFactor: 2,
    targetFps: 120,
    afterEffectsMode: true,
    shutterAngle: 180,
  });

  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    saturation: 1.0, // matching Flutter _saturation = 1.0
    contrast: 1.0,   // matching Flutter _contrast = 1.0
    brightness: 0.0, // matching Flutter _brightness = 0.0
    exposure: 0.0,
    temperature: 0,
    tint: 0,
    vignette: 0.0,
  });

  const [effectSettings, setEffectSettings] = useState<EffectSettings>({
    cyanGlow: true,
    cyanGlowIntensity: 1.0,
    sharpen4K: false,
    sharpenAmount: 1.0,
    motionBlur: false,
    motionBlurSamples: 4,
    rgbSplit: false,
    filmGrain: false,
    filmGrainIntensity: 0.2,
    letterbox: 'none',
  });

  const [adjustmentLayerActive, setAdjustmentLayerActive] = useState<boolean>(true);
  const [splitView, setSplitView] = useState<boolean>(false);

  // Modals & Popups
  const [showSamplePicker, setShowSamplePicker] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showMatrixInspector, setShowMatrixInspector] = useState<boolean>(false);
  const [showMobileInstallModal, setShowMobileInstallModal] = useState<boolean>(false);
  const [snackMessage, setSnackMessage] = useState<string | null>(null);

  // Auto-dismiss snack message
  useEffect(() => {
    if (snackMessage) {
      const timer = setTimeout(() => setSnackMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [snackMessage]);

  // Video play / pause handler
  const handleTogglePlay = React.useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Video Seek
  const handleSeek = React.useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Reset adjustments
  const handleReset = React.useCallback(() => {
    setColorSettings({
      saturation: 1.0,
      contrast: 1.0,
      brightness: 0.0,
      exposure: 0.0,
      temperature: 0,
      tint: 0,
      vignette: 0.0,
    });
    setEffectSettings({
      cyanGlow: false,
      cyanGlowIntensity: 1.0,
      sharpen4K: false,
      sharpenAmount: 1.0,
      motionBlur: false,
      motionBlurSamples: 4,
      rgbSplit: false,
      filmGrain: false,
      filmGrainIntensity: 0.2,
      letterbox: 'none',
    });
    setSlowMoSettings(prev => ({
      ...prev,
      speed: 0.5,
      quality: 'ultra_optical',
      showMotionVectors: false,
      ultraSmooth: true,
      targetFps: 120,
    }));
    setSnackMessage('Parameters reset to DURANTO baseline.');
  }, []);

  // Snapshot Capture (Preserving exact original resolution up to 4K)
  const handleSnapshot = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 1920;
    canvas.height = v.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (adjustmentLayerActive) {
      ctx.filter = buildCssFilterString(colorSettings, {
        sharpen4K: effectSettings.sharpen4K || canvas.width >= 3840,
        cyanGlow: effectSettings.cyanGlow,
        cyanGlowIntensity: effectSettings.cyanGlowIntensity
      });
    }

    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Durango_Graded_${canvas.width}x${canvas.height}_Frame_${Math.floor(currentTime * 30)}.png`;
      a.click();
      setSnackMessage(`Original high-res snapshot (${canvas.width}×${canvas.height}) captured.`);
    }, 'image/png');
  };

  // AI SlowMo Initiate handler matching Flutter ScaffoldMessenger snackbar
  const handleRenderSlowMo = () => {
    setSnackMessage(`AI SlowMo rendering @ ${slowMoSettings.speed.toFixed(1)}x initiated...`);
    setShowExportModal(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#141414] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Durango Era Motion Engine Top Bar */}
      <Header
        onPickVideo={() => setShowSamplePicker(true)}
        onRenderSlowMo={handleRenderSlowMo}
        onExport={() => setShowExportModal(true)}
        onSnapshot={handleSnapshot}
        onReset={handleReset}
        onToggleMatrixInspector={() => setShowMatrixInspector(true)}
        splitView={splitView}
        onToggleSplitView={() => setSplitView(!splitView)}
        slowMoSpeed={slowMoSettings.speed}
        onOpenMobileInstall={() => setShowMobileInstallModal(true)}
      />

      {/* 2. Main Content Area (Scrollable so bottom controls are never cut off) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-16">
        {/* Live Preview Window (With Real Color Grading) */}
        <VideoPlayer
          videoRef={videoRef}
          videoSrc={videoSrc}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          currentTime={currentTime}
          duration={duration}
          onTimeUpdate={setCurrentTime}
          onDurationChange={setDuration}
          colorSettings={adjustmentLayerActive ? colorSettings : {
            saturation: 1.0,
            contrast: 1.0,
            brightness: 0.0,
            exposure: 0.0,
            temperature: 0,
            tint: 0,
            vignette: 0.0
          }}
          effectSettings={adjustmentLayerActive ? effectSettings : {
            cyanGlow: false,
            cyanGlowIntensity: 0,
            sharpen4K: false,
            sharpenAmount: 0,
            motionBlur: false,
            motionBlurSamples: 0,
            rgbSplit: false,
            filmGrain: false,
            filmGrainIntensity: 0,
            letterbox: 'none'
          }}
          slowMoSettings={slowMoSettings}
          onPickVideo={() => setShowSamplePicker(true)}
          splitView={splitView}
          onToggleSplitView={() => setSplitView(!splitView)}
          onExport={() => setShowExportModal(true)}
        />

        {/* Control Tabs & Sliders */}
        <ControlTabs
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
          slowMoSettings={slowMoSettings}
          onUpdateSlowMo={(updates) => setSlowMoSettings(prev => ({ ...prev, ...updates }))}
          colorSettings={colorSettings}
          onUpdateColors={(updates) => setColorSettings(prev => ({ ...prev, ...updates }))}
          effectSettings={effectSettings}
          onUpdateEffects={(updates) => setEffectSettings(prev => ({ ...prev, ...updates }))}
          onResetColors={() => setColorSettings({
            saturation: 1.0,
            contrast: 1.0,
            brightness: 0.0,
            exposure: 0.0,
            temperature: 0,
            tint: 0,
            vignette: 0.0,
          })}
          onOpenMatrixInspector={() => setShowMatrixInspector(true)}
          onExport={() => setShowExportModal(true)}
        />

        {/* Multi-Track Timeline */}
        <Timeline
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          slowMoSpeed={slowMoSettings.speed}
          effectSettings={effectSettings}
          adjustmentLayerActive={adjustmentLayerActive}
          onToggleAdjustmentLayer={() => setAdjustmentLayerActive(!adjustmentLayerActive)}
          onExport={() => setShowExportModal(true)}
        />
      </div>

      {/* 3. Permanent Fixed Bottom Bar (Sabse Niche - Speed & Motion Blur & Export) */}
      <div className="fixed bottom-0 left-0 right-0 min-h-14 bg-[#141414]/95 backdrop-blur-md border-t border-white/10 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 z-30 shadow-2xl">
        {/* Left Section: DURANTO Logo Badge & Speed (Slow Motion) Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-black/60 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] shrink-0">
              <img
                src="/assets/aistudio/ChatGPT_Image_Sep_23__2026__11_46_58_AM_304c70b5.png"
                alt="DURANTO"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-200 hidden sm:inline">
              DURANTO
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e1e1e] border border-white/10 text-neutral-300">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white">Speed:</span>
          </div>

          <div className="flex items-center bg-[#1e1e1e] p-0.5 rounded-lg border border-white/10">
            {([0.1, 0.25, 0.5, 0.75, 1.0] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  setSlowMoSettings(prev => ({
                    ...prev,
                    speed: spd,
                    ultraSmooth: spd < 1.0,
                    aiFrameInterpolation: spd < 1.0
                  }));
                  setSnackMessage(`Slow Motion speed set to ${spd}x (${spd < 1.0 ? 'After Effects Smooth' : 'Normal'})`);
                }}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  slowMoSettings.speed === spd
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-950 scale-105'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                title={`Set speed to ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Middle Section: Motion Blur Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !effectSettings.motionBlur;
              setEffectSettings(prev => ({ ...prev, motionBlur: next, motionBlurSamples: 4 }));
              setSnackMessage(next ? '🌪️ Motion Blur (180° Shutter) ON' : 'Motion Blur OFF');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              effectSettings.motionBlur
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                : 'bg-[#1e1e1e] text-neutral-400 border-white/10 hover:border-white/20 hover:text-white'
            }`}
            title="Toggle Cinematic Motion Blur (Shutter Angle 180°)"
          >
            <Wind className={`w-3.5 h-3.5 ${effectSettings.motionBlur ? 'text-emerald-400 animate-spin' : 'text-neutral-400'}`} />
            <span>Motion Blur: {effectSettings.motionBlur ? 'ON (180°)' : 'OFF'}</span>
          </button>

          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-800/40 hidden md:inline">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </span>
        </div>

        {/* Right Section: Mobile App Link & Prominent Export Button */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowMobileInstallModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#222222] hover:bg-[#2a2a2a] text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Apne mobile phone ki screen par app lagayein"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mobile Screen Link</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg shadow-emerald-950/80 transition-all active:scale-95 cursor-pointer border border-emerald-300/40 animate-pulse hover:animate-none"
            title="Export 100% full duration video at 120 FPS / 60 FPS up to 4K"
          >
            <Download className="w-4 h-4 stroke-[2.8]" />
            <span>EXPORT VIDEO (120 FPS)</span>
          </button>
        </div>
      </div>

      {/* Flutter Snackbar Notification Toast */}
      {snackMessage && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 bg-[#222222] text-white border border-white/20 px-4 py-2.5 rounded-lg shadow-2xl z-50 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{snackMessage}</span>
        </div>
      )}

      {/* Modals */}
      <SamplePickerModal
        isOpen={showSamplePicker}
        onClose={() => setShowSamplePicker(false)}
        onSelectVideo={(url, title) => {
          setVideoSrc(url);
          setCurrentTime(0);
          setSnackMessage(`Loaded clip: ${title || 'Selected Video'}`);
        }}
        currentVideoSrc={videoSrc}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        videoElement={videoRef.current}
        colorSettings={colorSettings}
        effectSettings={effectSettings}
        slowMoSettings={slowMoSettings}
        duration={duration}
      />

      <MatrixInspectorModal
        isOpen={showMatrixInspector}
        onClose={() => setShowMatrixInspector(false)}
        colorSettings={colorSettings}
      />

      <MobileInstallModal
        isOpen={showMobileInstallModal}
        onClose={() => setShowMobileInstallModal(false)}
      />
    </div>
  );
}
