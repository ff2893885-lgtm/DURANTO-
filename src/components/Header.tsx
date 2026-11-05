import React from 'react';
import { 
  Video, 
  Zap, 
  Download, 
  Camera, 
  Columns, 
  Binary, 
  FolderOpen,
  RotateCcw,
  Smartphone
} from 'lucide-react';

interface HeaderProps {
  onPickVideo: () => void;
  onRenderSlowMo: () => void;
  onExport: () => void;
  onSnapshot: () => void;
  onReset: () => void;
  onToggleMatrixInspector: () => void;
  splitView: boolean;
  onToggleSplitView: () => void;
  slowMoSpeed: number;
  onOpenMobileInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  onPickVideo,
  onRenderSlowMo,
  onExport,
  onSnapshot,
  onReset,
  onToggleMatrixInspector,
  splitView,
  onToggleSplitView,
  slowMoSpeed,
  onOpenMobileInstall
}) => {
  return (
    <header className="h-14 bg-[#181818] border-b border-white/10 px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Brand Zone */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-400/60 shadow-[0_0_14px_rgba(0,210,255,0.4)] shrink-0 bg-black">
          <img 
            src="/assets/aistudio/ChatGPT_Image_Sep_23__2026__11_46_58_AM_304c70b5.png" 
            alt="DURANTO" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-300 via-white to-cyan-400 bg-clip-text text-transparent">
              DURANTO
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/50 shadow-[0_0_8px_rgba(0,210,255,0.25)]">
              Motion Engine
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 hidden sm:block">
            After Effects SlowMo · 120 FPS · 4K UHD · Optical Flow
          </p>
        </div>
      </div>

      {/* Middle Tools */}
      <div className="hidden md:flex items-center gap-1.5 bg-[#141414] p-1 rounded-lg border border-white/5">
        <button
          onClick={onToggleSplitView}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            splitView 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          title="Split screen compare Original vs Durango Graded"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Before / After</span>
        </button>

        <button
          onClick={onToggleMatrixInspector}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Inspect 5x5 Color Matrix Values"
        >
          <Binary className="w-3.5 h-3.5 text-purple-400" />
          <span>Matrix Inspector</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Reset all grades and effects to default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Primary Actions matching Flutter AppBar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPickVideo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#252525] hover:bg-[#2e2e2e] text-cyan-400 border border-cyan-500/30 transition-all shadow-sm active:scale-95"
          title="Load Sample or Pick Video from Disk"
        >
          <FolderOpen className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Pick Video</span>
        </button>

        {onOpenMobileInstall && (
          <button
            onClick={onOpenMobileInstall}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-md bg-gradient-to-r from-cyan-950 to-blue-950 hover:border-cyan-400 text-cyan-300 border border-cyan-500/40 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Mobile screen par add karein (Get App Link / PWA)"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Mobile Screen Link</span>
          </button>
        )}

        <button
          onClick={onSnapshot}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          title="Capture High-Res Graded Snapshot (PNG)"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 transition-all active:scale-95 cursor-pointer border border-emerald-400/40"
          title="Export complete video with 120 FPS, 4K, and 5x5 color matrix applied"
        >
          <Download className="w-4 h-4 fill-white/20" />
          <span>Export Video (120 FPS)</span>
        </button>
      </div>
    </header>
  );
});
