import React, { useRef, useState } from 'react';
import { 
  X, 
  Upload, 
  Film, 
  Sparkles, 
  Play, 
  Check, 
  Link as LinkIcon, 
  Loader2 
} from 'lucide-react';
import { SAMPLE_VIDEOS, createProceduralVideoBlob } from '../utils/sampleVideos';

interface SamplePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (url: string, title?: string) => void;
  currentVideoSrc: string;
}

export const SamplePickerModal: React.FC<SamplePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectVideo,
  currentVideoSrc
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isGeneratingProcedural, setIsGeneratingProcedural] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      onSelectVideo(objectUrl, file.name);
      onClose();
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onSelectVideo(urlInput.trim(), 'Custom Network Clip');
      onClose();
    }
  };

  const handleCreateProcedural = async (type: 'particle_flow' | 'neon_racer') => {
    setIsGeneratingProcedural(true);
    try {
      const blob = await createProceduralVideoBlob(type);
      const url = URL.createObjectURL(blob);
      onSelectVideo(url, type === 'particle_flow' ? 'High Velocity Particle Motion' : 'Neon Speed Runner');
      onClose();
    } catch (err) {
      console.error('Procedural generation error', err);
    } finally {
      setIsGeneratingProcedural(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pick Video / Motion Gallery
              </h3>
              <p className="text-[11px] text-neutral-400">
                Load gallery media, high-speed test footage, or generate procedural motion vectors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* 1. Device Upload Dropzone matching Flutter ImagePicker */}
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              From Gallery / Local Disk
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/ogg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-cyan-500/60 bg-[#141414] hover:bg-cyan-950/10 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-xs font-semibold text-white">
                Click to browse video files (MP4, WebM, MOV)
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Supports 60fps, 120fps, and 4K high bitrate footage
              </p>
            </div>
          </div>

          {/* 2. Curated Sample Footage */}
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              High-Speed Action Library (Ready to Test)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_VIDEOS.map((sample) => {
                const isSelected = currentVideoSrc === sample.url;
                return (
                  <div
                    key={sample.id}
                    onClick={() => {
                      onSelectVideo(sample.url, sample.title);
                      onClose();
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/30'
                        : 'bg-[#141414] border-white/5 hover:border-white/20 hover:bg-[#181818]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded bg-[#222] border border-white/10 flex items-center justify-center text-lg shrink-0">
                      {sample.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {sample.title}
                        </h4>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2">
                        {sample.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-cyan-400/80">
                        <span>{sample.category}</span>
                        <span>·</span>
                        <span>{sample.fps} FPS</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Offline Procedural Generator Option */}
          <div className="bg-[#141414] p-3 rounded-lg border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Generate Synthetic Dynamic Motion Clip
                </span>
                <span className="text-[10px] text-neutral-400">
                  100% offline canvas vector burst designed for testing slow-mo optical flow
                </span>
              </div>
            </div>
            <button
              onClick={() => handleCreateProcedural('particle_flow')}
              disabled={isGeneratingProcedural}
              className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {isGeneratingProcedural ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-amber-300" />
                  <span>Generate Clip</span>
                </>
              )}
            </button>
          </div>

          {/* 4. Direct URL input */}
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste direct MP4 or WebM video URL..."
                className="w-full bg-[#141414] border border-white/10 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="px-3 py-1.5 bg-[#252525] hover:bg-[#2e2e2e] text-neutral-200 text-xs font-semibold rounded-md border border-white/10 disabled:opacity-40 transition-colors"
            >
              Load URL
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#181818] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
