import { ColorSettings } from '../types';

/**
 * Calculates the exact 5x5 color matrix from MotionLab Pro Durango Era:
 * Flutter specification:
 * c = contrast
 * b = brightness * 255.0
 * t = (1.0 - c) * 128.0 + b
 * s = saturation
 * lr = 0.2126, lg = 0.7152, lb = 0.0722 (Rec. 709 luminance weights)
 */
export function buildFlutterColorMatrix(contrast: number, brightness: number, saturation: number): number[] {
  const c = contrast;
  const b = brightness * 255.0;
  const t = (1.0 - c) * 128.0 + b;

  const s = saturation;
  const lr = 0.2126;
  const lg = 0.7152;
  const lb = 0.0722;

  const sr = (1 - s) * lr;
  const sg = (1 - s) * lg;
  const sb = (1 - s) * lb;

  return [
    c * (sr + s), c * sg,       c * sb,       0, t,
    c * sr,       c * (sg + s), c * sb,       0, t,
    c * sr,       c * sg,       c * (sb + s), 0, t,
    0,            0,            0,            1, 0,
  ];
}

/**
 * Builds the SVG feColorMatrix 4x5 normalized string for hardware-accelerated video filtering.
 * SVG feColorMatrix expects the 5th column offset normalized to [0, 1] (divide t by 255).
 * Also integrates temperature, tint, and exposure compensation.
 */
export function buildSvgColorMatrixValues(colors: ColorSettings): string {
  const { contrast, brightness, saturation, exposure, temperature, tint } = colors;

  // Base contrast & saturation
  const c = contrast * (1 + exposure * 0.3);
  const b = brightness + exposure * 0.2;
  // normalized offset in 0..1 range
  const tNorm = ((1.0 - c) * 0.5) + b;

  const s = saturation;
  const lr = 0.2126;
  const lg = 0.7152;
  const lb = 0.0722;

  const sr = (1 - s) * lr;
  const sg = (1 - s) * lg;
  const sb = (1 - s) * lb;

  // Temperature shift: warm increases Red, lowers Blue; cool does opposite
  const tempFactor = temperature / 100;
  const rTemp = 1 + tempFactor * 0.2;
  const bTemp = 1 - tempFactor * 0.2;

  // Tint shift: magenta increases Red and Blue, green increases Green
  const tintFactor = tint / 100;
  const gTint = 1 - tintFactor * 0.2;

  const r0 = (c * (sr + s) * rTemp).toFixed(4);
  const r1 = (c * sg).toFixed(4);
  const r2 = (c * sb).toFixed(4);
  const r4 = tNorm.toFixed(4);

  const g0 = (c * sr).toFixed(4);
  const g1 = (c * (sg + s) * gTint).toFixed(4);
  const g2 = (c * sb).toFixed(4);
  const g4 = tNorm.toFixed(4);

  const b0 = (c * sr).toFixed(4);
  const b1 = (c * sg).toFixed(4);
  const b2 = (c * (sb + s) * bTemp).toFixed(4);
  const b4 = tNorm.toFixed(4);

  return [
    `${r0} ${r1} ${r2} 0 ${r4}`,
    `${g0} ${g1} ${g2} 0 ${g4}`,
    `${b0} ${b1} ${b2} 0 ${b4}`,
    `0 0 0 1 0`
  ].join(' ');
}

/**
 * Generate CSS filter string as a secondary fallback / companion for standard browser layers
 */
export function buildCssFilterString(
  colors: ColorSettings, 
  effects: { 
    sharpen4K: boolean; 
    cyanGlow: boolean; 
    cyanGlowIntensity: number;
    motionBlur?: boolean;
    motionBlurAmount?: number;
  }
): string {
  const { contrast, brightness, saturation } = colors;
  // CSS brightness: 1 is neutral, 0 is black, 2 is bright
  const cssBrightness = Math.max(0.1, 1 + brightness * 2);
  const cssContrast = Math.max(0.1, contrast);
  const cssSaturate = Math.max(0.0, saturation);

  const filters = [
    `brightness(${cssBrightness})`,
    `contrast(${cssContrast})`,
    `saturate(${cssSaturate})`
  ];

  if (effects.cyanGlow) {
    const intensity = effects.cyanGlowIntensity || 1.0;
    filters.push(`drop-shadow(0 0 ${8 * intensity}px rgba(0, 210, 255, ${0.4 * intensity}))`);
  }

  if (effects.motionBlur) {
    const amount = effects.motionBlurAmount ?? 1.5;
    filters.push(`blur(${amount}px)`);
  }

  return filters.join(' ');
}

export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  settings: ColorSettings;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'default',
    name: 'Durango Studio (Default)',
    description: 'Neutral cinematic baseline matrix with balanced skin tones',
    badge: '1.0x REC.709',
    settings: {
      saturation: 1.0,
      contrast: 1.0,
      brightness: 0.0,
      exposure: 0.0,
      temperature: 0,
      tint: 0,
      vignette: 0.0
    }
  },
  {
    id: 'durango_cyan',
    name: 'Durango Teal & Orange',
    description: 'High contrast Hollywood action grade with cyan punch',
    badge: 'CINEMATIC',
    settings: {
      saturation: 1.35,
      contrast: 1.25,
      brightness: 0.05,
      exposure: 0.1,
      temperature: 12,
      tint: -8,
      vignette: 0.35
    }
  },
  {
    id: 'cyber_neon',
    name: 'Cyberpunk Neon Drift',
    description: 'Electric saturation boost with deep blacks and cool shadows',
    badge: 'NEON FX',
    settings: {
      saturation: 1.6,
      contrast: 1.35,
      brightness: -0.05,
      exposure: 0.0,
      temperature: -24,
      tint: 15,
      vignette: 0.45
    }
  },
  {
    id: 'kodak_chrome',
    name: 'Kodak Chrome 64',
    description: 'Warm analog richness with compressed organic highlights',
    badge: 'FILM STOCK',
    settings: {
      saturation: 1.15,
      contrast: 1.12,
      brightness: 0.02,
      exposure: 0.05,
      temperature: 18,
      tint: 4,
      vignette: 0.2
    }
  },
  {
    id: 'noir_hard',
    name: 'Monochrome High-Contrast',
    description: 'Dramatic black & white with punchy optical contrast',
    badge: 'NOIR',
    settings: {
      saturation: 0.0,
      contrast: 1.65,
      brightness: -0.02,
      exposure: 0.05,
      temperature: 0,
      tint: 0,
      vignette: 0.5
    }
  },
  {
    id: 'vintage_16mm',
    name: 'Vintage 16mm Super',
    description: 'Desaturated retro look with lifted shadows and warm patina',
    badge: 'RETRO',
    settings: {
      saturation: 0.85,
      contrast: 0.95,
      brightness: 0.08,
      exposure: 0.0,
      temperature: 15,
      tint: 10,
      vignette: 0.3
    }
  }
];
