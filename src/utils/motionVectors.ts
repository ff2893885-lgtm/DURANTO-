import { SpeedRampPreset } from '../types';

/**
 * Calculates current effective playback rate based on time and speed ramp profile.
 */
export function calculateSpeedAtTime(
  currentTime: number,
  duration: number,
  baseSpeed: number,
  ramp: SpeedRampPreset
): number {
  if (duration <= 0) return baseSpeed;
  const progress = (currentTime % duration) / duration;

  switch (ramp) {
    case 'ramp_down':
      // Starts at 1.0x, ramps down to baseSpeed (e.g. 0.2x) at peak 40%-80%
      if (progress < 0.3) return 1.0;
      if (progress < 0.4) {
        const t = (progress - 0.3) / 0.1;
        return 1.0 - t * (1.0 - baseSpeed);
      }
      if (progress < 0.75) return baseSpeed;
      // Ramps back up
      const tUp = (progress - 0.75) / 0.25;
      return baseSpeed + tUp * (1.0 - baseSpeed);

    case 'bullet_time':
      // Dramatic freeze: sudden drop to 0.1x between 35% and 65%
      if (progress > 0.35 && progress < 0.65) {
        return Math.min(baseSpeed, 0.15);
      }
      return 1.0;

    case 'action_burst':
      // Fast -> Slow -> Fast
      const sineMod = Math.sin(progress * Math.PI);
      return Math.max(0.1, 1.0 - sineMod * (1.0 - baseSpeed));

    case 'constant':
    default:
      return baseSpeed;
  }
}

/**
 * Draw animated Optical Flow Motion Vectors on top of the live video stream.
 * Renders vector field lines showing direction and velocity of motion.
 */
export class MotionVectorAnalyzer {
  private prevImageData: ImageData | null = null;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D | null;

  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = 64;
    this.offscreenCanvas.height = 36;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
  }

  drawVectors(
    overlayCanvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    speed: number
  ) {
    if (!this.offscreenCtx || video.readyState < 2) return;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    const width = overlayCanvas.width;
    const height = overlayCanvas.height;
    ctx.clearRect(0, 0, width, height);

    // Downsample current video frame
    this.offscreenCtx.drawImage(video, 0, 0, 64, 36);
    const currImageData = this.offscreenCtx.getImageData(0, 0, 64, 36);

    if (this.prevImageData) {
      const curr = currImageData.data;
      const prev = this.prevImageData.data;
      const cols = 16;
      const rows = 9;
      const blockW = width / cols;
      const blockH = height / rows;
      const stepX = Math.floor(64 / cols);
      const stepY = Math.floor(36 / rows);

      ctx.lineWidth = 1.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sampleX = c * stepX;
          const sampleY = r * stepY;
          const idx = (sampleY * 64 + sampleX) * 4;

          // Compute luminance delta
          const lumCurr = 0.299 * curr[idx] + 0.587 * curr[idx + 1] + 0.114 * curr[idx + 2];
          const lumPrev = 0.299 * prev[idx] + 0.587 * prev[idx + 1] + 0.114 * prev[idx + 2];
          const diff = (lumCurr - lumPrev);

          // Approximate local spatial gradient
          const rightIdx = idx + 4 < curr.length ? idx + 4 : idx;
          const downIdx = idx + 64 * 4 < curr.length ? idx + 64 * 4 : idx;
          const gradX = curr[rightIdx] - curr[idx];
          const gradY = curr[downIdx] - curr[idx];

          const vx = (diff * gradX * 0.05) / (speed + 0.2);
          const vy = (diff * gradY * 0.05) / (speed + 0.2);
          const mag = Math.sqrt(vx * vx + vy * vy);

          if (mag > 1.5) {
            const startX = c * blockW + blockW / 2;
            const startY = r * blockH + blockH / 2;
            const endX = startX + Math.max(-25, Math.min(25, vx * 4));
            const endY = startY + Math.max(-25, Math.min(25, vy * 4));

            // Cyan for forward velocity, Amber for high acceleration
            const isHighEnergy = mag > 8;
            ctx.strokeStyle = isHighEnergy ? 'rgba(251, 191, 36, 0.85)' : 'rgba(0, 210, 255, 0.8)';
            ctx.fillStyle = ctx.strokeStyle;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Arrow head
            const angle = Math.atan2(endY - startY, endX - startX);
            ctx.beginPath();
            ctx.arc(endX, endY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    this.prevImageData = currImageData;
  }
}
