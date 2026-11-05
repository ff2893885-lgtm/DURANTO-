import { SampleVideo } from '../types';

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: 'skate_trick',
    title: 'Skater 360 Flip (SlowMo Action)',
    category: 'Extreme Sports',
    duration: 10,
    fps: 60,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: '🛹',
    description: 'High velocity skateboard trick ideal for testing optical flow interpolation and bullet-time ramping.'
  },
  {
    id: 'neon_drift',
    title: 'Night Neon Car Speedrun',
    category: 'Cinematic Drift',
    duration: 15,
    fps: 60,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: '🏎️',
    description: 'Vibrant neon reflections and rapid lighting shifts to showcase Durango 5x5 Color Matrix and Cyan Glow.'
  },
  {
    id: 'parkour_action',
    title: 'Rooftop Free Run & Leap',
    category: 'Urban Acrobatics',
    duration: 12,
    fps: 60,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: '🏃',
    description: 'Dynamic human motion vectors and trajectory tracking for ultra-smooth 0.2x speed deceleration.'
  },
  {
    id: 'cinematic_scifi',
    title: 'Sci-Fi Cyber Machinery',
    category: 'Visual FX',
    duration: 14,
    fps: 60,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: '🤖',
    description: 'Mechanical motion, deep shadows, and cinematic color gamut for Sharpen 4K and chromatic grading.'
  }
];

/**
 * Creates a synthetic procedural animated video via Canvas and MediaRecorder.
 * This guarantees 100% offline-working test footage even if network fails!
 */
export async function createProceduralVideoBlob(
  type: 'particle_flow' | 'neon_racer' | 'geometric_burst'
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  const totalFrames = 150; // 5 seconds at 30 fps
  let frame = 0;

  return new Promise((resolve) => {
    function renderFrame() {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const t = frame / 30;
      // Draw dark studio backdrop
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, 1280, 720);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1280; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 720);
        ctx.stroke();
      }
      for (let y = 0; y < 720; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }

      if (type === 'particle_flow' || type === 'neon_racer') {
        // High speed glowing orbs with motion trails
        const centerX = 640 + Math.sin(t * 2.5) * 400;
        const centerY = 360 + Math.cos(t * 3.8) * 220;

        // Motion trails
        for (let i = 8; i > 0; i--) {
          const trailT = t - i * 0.04;
          const tx = 640 + Math.sin(trailT * 2.5) * 400;
          const ty = 360 + Math.cos(trailT * 3.8) * 220;
          ctx.beginPath();
          ctx.arc(tx, ty, 35 - i * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 210, 255, ${0.15 - i * 0.015})`;
          ctx.fill();
        }

        // Main core
        const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 50);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#00d2ff');
        grad.addColorStop(0.7, '#0055ff');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        ctx.fill();

        // Speed burst particles
        for (let p = 0; p < 30; p++) {
          const angle = (p / 30) * Math.PI * 2 + t * 4;
          const dist = 60 + (p * 7 + frame * 5) % 180;
          const px = centerX + Math.cos(angle) * dist;
          const py = centerY + Math.sin(angle) * dist;
          ctx.fillStyle = p % 2 === 0 ? '#38bdf8' : '#f59e0b';
          ctx.fillRect(px, py, 4, 4);
        }

        // HUD overlay text
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillStyle = '#00d2ff';
        ctx.fillText('MOTIONLAB PRO // HIGH VELOCITY DYNAMICS', 60, 80);
        ctx.font = '16px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`FRAME: ${String(frame).padStart(4, '0')} · TIME: ${t.toFixed(2)}s · VECTORS: ACTIVE`, 60, 110);
      }

      frame++;
      setTimeout(renderFrame, 16);
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    renderFrame();
  });
}
