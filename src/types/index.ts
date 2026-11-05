export interface ColorSettings {
  saturation: number; // 0.0 to 2.0 (default 1.0)
  contrast: number;   // 0.5 to 2.0 (default 1.0)
  brightness: number; // -0.5 to 0.5 (default 0.0)
  exposure: number;   // -1.0 to 1.0 (default 0.0)
  temperature: number;// -50 to 50 (default 0, cool/warm)
  tint: number;       // -50 to 50 (default 0, green/magenta)
  vignette: number;   // 0.0 to 1.0 (default 0.0)
}

export interface EffectSettings {
  cyanGlow: boolean;
  cyanGlowIntensity: number; // 0.0 to 2.0
  sharpen4K: boolean;
  sharpenAmount: number;     // 0.0 to 2.0
  motionBlur: boolean;
  motionBlurSamples: number; // 2 to 8
  rgbSplit: boolean;
  filmGrain: boolean;
  filmGrainIntensity: number;
  letterbox: 'none' | 'cinematic' | 'square' | 'vertical';
}

export type SlowMoQuality = 'ultra_optical' | 'vector' | 'optical' | 'blend' | 'nearest';
export type SpeedRampPreset = 'constant' | 'ramp_down' | 'bullet_time' | 'action_burst';
export type ExportResolution = 'original' | '4k' | '1080p' | '720p';

export interface SlowMoSettings {
  speed: number; // 0.1 to 2.0
  quality: SlowMoQuality;
  showMotionVectors: boolean;
  speedRamp: SpeedRampPreset;
  aiFrameInterpolation: boolean;
  ultraSmooth: boolean; // Ultra Buttery Slow-Mo (Twixtor-style optical flow blending)
  smoothFactor: number; // 1 to 4x sub-frame motion synthesis
  targetFps: 30 | 60 | 120; // Up to 120 FPS
  afterEffectsMode: boolean; // After Effects Pixel Motion / Timewarp simulation
  shutterAngle: number; // 0 to 360 degrees motion blur
}

export interface SampleVideo {
  id: string;
  title: string;
  category: string;
  duration: number; // seconds
  fps: number;
  url: string;
  thumbnail: string;
  description: string;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'adjustment' | 'video' | 'audio';
  color: string;
  badge: string;
  enabled: boolean;
  opacity: number;
}
