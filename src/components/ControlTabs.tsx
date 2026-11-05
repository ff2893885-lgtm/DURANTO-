import React from 'react';
import { 
  Zap, 
  Palette, 
  Sparkles, 
  Activity, 
  Cpu, 
  Film, 
  RotateCcw,
  Sliders,
  Eye,
  Check,
  Download
} from 'lucide-react';
import { 
  ColorSettings, 
  EffectSettings, 
  SlowMoSettings, 
  SlowMoQuality, 
  SpeedRampPreset 
} from '../types';
import { COLOR_PRESETS } from '../utils/colorMatrix';

interface ControlTabsProps {
  selectedTab: number;
  onSelectTab: (tab: number) => void;
  slowMoSettings: SlowMoSettings;
  onUpdateSlowMo: (settings: Partial<SlowMoSettings>) => void;
  colorSettings: ColorSettings;
  onUpdateColors: (settings: Partial<ColorSettings>) => void;
  effectSettings: EffectSettings;
  onUpdateEffects: (settings: Partial<EffectSettings>) => void;
  onResetColors: () => void;
  onOpenMatrixInspector: () => void;
  onExport: () => void;
}

export const ControlTabs: React.FC<ControlTabsProps> = React.memo(({
  selectedTab,
  onSelectTab,
  slowMoSettings,
  onUpdateSlowMo,
  colorSettings,
  onUpdateColors,
  effectSettings,
  onUpdateEffects,
  onResetColors,
  onOpenMatrixInspector,
  onExport
}) => {
  const tabs = [
    { label: 'Smooth Slow Motion', icon: Zap, id: 0 },
    { label: 'Color Correction', icon: Palette, id: 1 },
    { label: 'Effects & Glow', icon: Sparkles, id: 2 },
  ];

  const speedPresets = [
    { value: 0.1, label: '0.1x Bullet' },
    { value: 0.2, label: '0.2x Ultra' },
    { value: 0.25, label: '0.25x Super' },
    { value: 0.5, label: '0.5x Smooth' },
    { value: 0.75, label: '0.75x Flow' },
    { value: 1.0, label: '1.0x Real' },
  ];

  const qualityOptions: { id: SlowMoQuality; label: string; desc: string }[] = [
    { id: 'ultra_optical', label: '120 FPS Ultra Optical Flow (Acche Se Smooth)', desc: 'Twixtor-grade sub-frame motion synthesis' },
    { id: 'vector', label: 'Ultra Smooth Motion Vector', desc: 'Durango optical vector flow' },
    { id: 'optical', label: 'AI Frame Interpolation', desc: 'Bi-directional optical blending' },
    { id: 'blend', label: 'Linear Frame Blending', desc: 'Sub-frame exposure dissolve' },
    { id: 'nearest', label: 'Nearest Frame Hold', desc: 'Direct sampling' },
  ];

  const rampOptions: { id: SpeedRampPreset; label: string }[] = [
    { id: 'constant', label: 'Constant Speed' },
    { id: 'ramp_down', label: 'Impact Ramp-Down' },
    { id: 'bullet_time', label: 'Bullet-Time Freeze' },
    { id: 'action_burst', label: 'Action Burst (Slow-Fast)' },
  ];

  return (
    <div className="bg-[#1e1e1e] border-t border-white/10 flex flex-col h-56 shrink-0 select-none">
      {/* 1. Tab Headers matching Flutter */}
      <div className="flex items-center justify-around border-b border-white/10 px-2 bg-[#181818]/60">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Active Control Panel Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* TAB 0: SMOOTH SLOW-MO */}
        {selectedTab === 0 && (
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Optical Flow / Playback Speed
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Precision time-remapping with sub-frame optical motion compensation
                </p>
              </div>

              {/* Quick speed buttons */}
              <div className="flex items-center gap-1">
                {speedPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onUpdateSlowMo({ speed: preset.value })}
                    className={`px-2 py-1 text-[11px] font-mono font-medium rounded border transition-colors ${
                      Math.abs(slowMoSettings.speed - preset.value) < 0.02
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-[#141414] text-neutral-300 border-white/10 hover:border-cyan-500/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Row matching Flutter */}
            <div className="flex items-center gap-4 bg-[#141414] p-2.5 rounded-lg border border-white/5">
              <span className="text-xs font-mono text-neutral-400 w-12 text-right">0.1x</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={slowMoSettings.speed}
                onChange={(e) => onUpdateSlowMo({ speed: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-mono text-neutral-400 w-12">1.0x</span>

              <div className="min-w-20 px-2.5 py-1 bg-cyan-950/80 rounded border border-cyan-500/40 text-center">
                <span className="text-sm font-bold font-mono text-cyan-300">
                  {slowMoSettings.speed.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Quality & Vector Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              {/* Quality mode */}
              <div className="bg-[#141414] p-2 rounded border border-white/5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Quality Mode
                </label>
                <select
                  value={slowMoSettings.quality}
                  onChange={(e) => onUpdateSlowMo({ quality: e.target.value as SlowMoQuality })}
                  className="w-full bg-[#1e1e1e] text-xs text-white border border-white/10 rounded px-2 py-1 font-mono focus:outline-none focus:border-cyan-500"
                >
                  {qualityOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-cyan-400/80 block mt-1 font-mono">
                  {qualityOptions.find(q => q.id === slowMoSettings.quality)?.desc}
                </span>
              </div>

              {/* Speed Ramp */}
              <div className="bg-[#141414] p-2 rounded border border-white/5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Dynamic Speed Curve
                </label>
                <select
                  value={slowMoSettings.speedRamp}
                  onChange={(e) => onUpdateSlowMo({ speedRamp: e.target.value as SpeedRampPreset })}
                  className="w-full bg-[#1e1e1e] text-xs text-white border border-white/10 rounded px-2 py-1 font-mono focus:outline-none focus:border-cyan-500"
                >
                  {rampOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  Automated deceleration curve
                </span>
              </div>

              {/* Toggles */}
              <div className="bg-[#141414] p-2 rounded border border-white/5 flex flex-col justify-center gap-1.5">
                <label className="flex items-center justify-between cursor-pointer text-xs text-neutral-200">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    Motion Vectors HUD
                  </span>
                  <input
                    type="checkbox"
                    checked={slowMoSettings.showMotionVectors}
                    onChange={(e) => onUpdateSlowMo({ showMotionVectors: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer text-xs text-neutral-200">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    AI Optical Interpolation
                  </span>
                  <input
                    type="checkbox"
                    checked={slowMoSettings.aiFrameInterpolation}
                    onChange={(e) => onUpdateSlowMo({ aiFrameInterpolation: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Picture Illustration & After Effects Smooth Slow Motion Section */}
            <div className="bg-gradient-to-r from-[#181818] via-[#1c1c1c] to-[#161616] p-3 rounded-lg border border-cyan-500/30 space-y-2.5 shadow-lg">
              {/* Picture / Schematic Diagram illustrating After Effects Optical Flow */}
              <div className="bg-[#121212] p-2.5 rounded border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Visual Picture Badge / Canvas Schematic */}
                  <div className="relative w-28 h-12 bg-black rounded border border-cyan-500/40 flex items-center justify-around px-1 overflow-hidden shrink-0 shadow-inner">
                    <div className="w-6 h-8 rounded bg-cyan-950/80 border border-cyan-500/50 flex flex-col items-center justify-center text-[8px] font-mono text-cyan-300">
                      <span>F1</span>
                      <span className="text-[6px] text-neutral-400">0.00s</span>
                    </div>

                    {/* Flow arrow and optical vector wave */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-0.5 bg-gradient-to-r from-cyan-400 via-amber-400 to-purple-400 animate-pulse" />
                      <span className="text-[7px] text-amber-300 font-mono font-bold mt-0.5">AE 120 FPS</span>
                    </div>

                    <div className="w-6 h-8 rounded bg-purple-950/80 border border-purple-500/50 flex flex-col items-center justify-center text-[8px] font-mono text-purple-300">
                      <span>F2</span>
                      <span className="text-[6px] text-neutral-400">0.05s</span>
                    </div>

                    {/* Shutter Angle overlay rays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Smooth Slow Motion (After Effects Ke Jaisa)
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-gradient-to-r from-amber-500 to-cyan-500 text-slate-950 px-1.5 py-0.2 rounded">
                        PIXEL MOTION
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      Twixtor & Adobe After Effects style optical flow interpolation — zero stutter, completely liquid slow motion.
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={() => onUpdateSlowMo({
                    speed: 0.2,
                    ultraSmooth: true,
                    targetFps: 120,
                    quality: 'ultra_optical',
                    aiFrameInterpolation: true,
                    afterEffectsMode: true,
                    shutterAngle: 180
                  })}
                  className="px-3.5 py-2 rounded-md bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/60 transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  title="Make video ultra smooth like Adobe After Effects"
                >
                  <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Make Smooth (After Effects 120 FPS)</span>
                </button>
              </div>

              {/* After Effects Shutter Angle & Motion Smoothing controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="flex items-center gap-2 bg-[#141414] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-neutral-400 text-[11px] w-32">Shutter Angle (AE Blur):</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="45"
                    value={slowMoSettings.shutterAngle || 180}
                    onChange={(e) => onUpdateSlowMo({ shutterAngle: parseInt(e.target.value) })}
                    className="flex-1 h-1.5 bg-[#2a2a2a] rounded appearance-none cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-cyan-400 w-10 text-right">
                    {slowMoSettings.shutterAngle || 180}°
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#141414] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-neutral-400 text-[11px]">Interpolation Engine:</span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                      Pixel Motion 120fps
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                      Bi-Directional
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Export Card in Smooth Slow Motion Tab */}
            <div className="bg-gradient-to-r from-emerald-950/30 via-[#181818] to-cyan-950/30 p-2.5 rounded-lg border border-emerald-500/40 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Download className="w-4 h-4 fill-emerald-400/20" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Export Pura Video (Download)
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                      120 FPS · 4K
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    Full duration guaranteed with zero cutoff · Original size preservation.
                  </p>
                </div>
              </div>

              <button
                onClick={onExport}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 border border-emerald-400/40"
              >
                <Download className="w-3.5 h-3.5 fill-white" />
                <span>Export Video</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: COLOR CORRECTION (5x5 COLOR MATRIX) */}
        {selectedTab === 1 && (
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Presets Bar */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  LUT Presets:
                </span>
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onUpdateColors(preset.settings)}
                    className="px-2 py-1 rounded bg-[#141414] hover:bg-[#252525] border border-white/10 hover:border-cyan-500/50 text-neutral-300 hover:text-white text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer"
                    title={preset.description}
                  >
                    {preset.name.split(' (')[0]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMatrixInspector}
                  className="px-2 py-1 rounded bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/40 text-[11px] font-mono flex items-center gap-1 transition-colors"
                  title="View calculated 5x5 Color Matrix transformation array"
                >
                  <Sliders className="w-3 h-3 text-purple-400" />
                  <span>5x5 Matrix</span>
                </button>

                <button
                  onClick={onResetColors}
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                  title="Reset color sliders"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sliders Grid matching Flutter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 bg-[#141414] p-3 rounded-lg border border-white/5">
              {/* Saturation: 0.0 to 2.0 */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-neutral-300 font-medium">Saturation</span>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={colorSettings.saturation}
                  onChange={(e) => onUpdateColors({ saturation: parseFloat(e.target.value) })}
                  className="flex-1 h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-xs font-mono text-neutral-400 text-right tabular-nums">
                  {colorSettings.saturation.toFixed(2)}
                </span>
              </div>

              {/* Contrast: 0.5 to 2.0 */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-neutral-300 font-medium">Contrast</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={colorSettings.contrast}
                  onChange={(e) => onUpdateColors({ contrast: parseFloat(e.target.value) })}
                  className="flex-1 h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-xs font-mono text-neutral-400 text-right tabular-nums">
                  {colorSettings.contrast.toFixed(2)}
                </span>
              </div>

              {/* Brightness: -0.5 to 0.5 */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-neutral-300 font-medium">Brightness</span>
                <input
                  type="range"
                  min="-0.5"
                  max="0.5"
                  step="0.02"
                  value={colorSettings.brightness}
                  onChange={(e) => onUpdateColors({ brightness: parseFloat(e.target.value) })}
                  className="flex-1 h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-xs font-mono text-neutral-400 text-right tabular-nums">
                  {colorSettings.brightness > 0 ? `+${colorSettings.brightness.toFixed(2)}` : colorSettings.brightness.toFixed(2)}
                </span>
              </div>

              {/* Exposure: -1.0 to 1.0 */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-neutral-300 font-medium">Exposure EV</span>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={colorSettings.exposure}
                  onChange={(e) => onUpdateColors({ exposure: parseFloat(e.target.value) })}
                  className="flex-1 h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-xs font-mono text-neutral-400 text-right tabular-nums">
                  {colorSettings.exposure > 0 ? `+${colorSettings.exposure.toFixed(2)}` : colorSettings.exposure.toFixed(2)}
                </span>
              </div>

              {/* Temperature (Cool/Warm) */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-neutral-300 font-medium">Temperature</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={colorSettings.temperature}
                  onChange={(e) => onUpdateColors({ temperature: parseInt(e.target.value) })}
                  className="flex-1 h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-xs font-mono text-neutral-400 text-right tabular-nums">
                  {colorSettings.temperature > 0 ? `+${colorSettings.temperature}` : colorSettings.temperature}K
                </span>
              </div>

              {/* Vignette */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-neutral-300 font-medium">Vignette</span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={colorSettings.vignette}
                  onChange={(e) => onUpdateColors({ vignette: parseFloat(e.target.value) })}
                  className="flex-1 h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-xs font-mono text-neutral-400 text-right tabular-nums">
                  {Math.round(colorSettings.vignette * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EFFECTS & GLOW */}
        {selectedTab === 2 && (
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Visual FX & Optical Shaders
              </span>
            </div>

            {/* Chips matching Flutter Wrap */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              {/* Cyan Glow Chip */}
              <button
                onClick={() => onUpdateEffects({ cyanGlow: !effectSettings.cyanGlow })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  effectSettings.cyanGlow
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-sm shadow-cyan-500/20'
                    : 'bg-cyan-950/20 text-cyan-400/70 border-cyan-900/40 hover:border-cyan-500/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cyan Glow</span>
                {effectSettings.cyanGlow && <Check className="w-3 h-3 text-cyan-400" />}
              </button>

              {/* Sharpen 4K Chip */}
              <button
                onClick={() => onUpdateEffects({ sharpen4K: !effectSettings.sharpen4K })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  effectSettings.sharpen4K
                    ? 'bg-blue-500/25 text-blue-300 border-blue-400 shadow-sm shadow-blue-500/20'
                    : 'bg-blue-950/20 text-blue-400/70 border-blue-900/40 hover:border-blue-500/30'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>Sharpen 4K</span>
                {effectSettings.sharpen4K && <Check className="w-3 h-3 text-blue-400" />}
              </button>

              {/* Motion Blur Chip */}
              <button
                onClick={() => onUpdateEffects({ motionBlur: !effectSettings.motionBlur })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  effectSettings.motionBlur
                    ? 'bg-purple-500/25 text-purple-300 border-purple-400 shadow-sm shadow-purple-500/20'
                    : 'bg-purple-950/20 text-purple-400/70 border-purple-900/40 hover:border-purple-500/30'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>Motion Blur</span>
                {effectSettings.motionBlur && <Check className="w-3 h-3 text-purple-400" />}
              </button>

              {/* RGB Split */}
              <button
                onClick={() => onUpdateEffects({ rgbSplit: !effectSettings.rgbSplit })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  effectSettings.rgbSplit
                    ? 'bg-rose-500/25 text-rose-300 border-rose-400 shadow-sm'
                    : 'bg-rose-950/20 text-rose-400/70 border-rose-900/40 hover:border-rose-500/30'
                }`}
              >
                <span>RGB Aberration</span>
                {effectSettings.rgbSplit && <Check className="w-3 h-3 text-rose-400" />}
              </button>

              {/* 35mm Film Grain */}
              <button
                onClick={() => onUpdateEffects({ filmGrain: !effectSettings.filmGrain })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  effectSettings.filmGrain
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-sm'
                    : 'bg-amber-950/20 text-amber-400/70 border-amber-900/40 hover:border-amber-500/30'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>35mm Film Grain</span>
                {effectSettings.filmGrain && <Check className="w-3 h-3 text-amber-400" />}
              </button>
            </div>

            {/* Extended Effect Modifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#141414] p-3 rounded-lg border border-white/5">
              {/* Cyan Glow Intensity */}
              <div className="flex items-center gap-3">
                <span className="w-28 text-xs text-neutral-300">Glow Intensity</span>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={effectSettings.cyanGlowIntensity}
                  disabled={!effectSettings.cyanGlow}
                  onChange={(e) => onUpdateEffects({ cyanGlowIntensity: parseFloat(e.target.value) })}
                  className="flex-1 h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                />
                <span className="w-10 text-xs font-mono text-cyan-400 text-right">
                  {effectSettings.cyanGlowIntensity.toFixed(1)}x
                </span>
              </div>

              {/* Aspect / Letterbox */}
              <div className="flex items-center gap-3">
                <span className="w-28 text-xs text-neutral-300">Letterbox Mask</span>
                <select
                  value={effectSettings.letterbox}
                  onChange={(e) => onUpdateEffects({ letterbox: e.target.value as any })}
                  className="flex-1 bg-[#1e1e1e] text-xs text-white border border-white/10 rounded px-2 py-1 font-mono focus:outline-none"
                >
                  <option value="none">Full 16:9 Frame</option>
                  <option value="cinematic">2.39:1 Anamorphic Scope</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
