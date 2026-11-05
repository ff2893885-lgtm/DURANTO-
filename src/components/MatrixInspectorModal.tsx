import React, { useState } from 'react';
import { X, Copy, Check, Binary, Info } from 'lucide-react';
import { ColorSettings } from '../types';
import { buildFlutterColorMatrix, buildSvgColorMatrixValues } from '../utils/colorMatrix';

interface MatrixInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorSettings: ColorSettings;
}

export const MatrixInspectorModal: React.FC<MatrixInspectorModalProps> = ({
  isOpen,
  onClose,
  colorSettings
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { contrast, brightness, saturation } = colorSettings;
  const matrixValues = buildFlutterColorMatrix(contrast, brightness, saturation);
  const svgString = buildSvgColorMatrixValues(colorSettings);

  const handleCopyDart = () => {
    const dartCode = `// Generated from MotionLab Pro Durango Engine
List<double> colorMatrix = <double>[
  ${matrixValues.slice(0, 5).map(v => v.toFixed(3)).join(', ')},
  ${matrixValues.slice(5, 10).map(v => v.toFixed(3)).join(', ')},
  ${matrixValues.slice(10, 15).map(v => v.toFixed(3)).join(', ')},
  ${matrixValues.slice(15, 20).map(v => v.toFixed(3)).join(', ')},
];`;
    navigator.clipboard.writeText(dartCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rows = [
    { label: 'R_out (Red)', slice: matrixValues.slice(0, 5), color: 'text-rose-400' },
    { label: 'G_out (Green)', slice: matrixValues.slice(5, 10), color: 'text-emerald-400' },
    { label: 'B_out (Blue)', slice: matrixValues.slice(10, 15), color: 'text-cyan-400' },
    { label: 'A_out (Alpha)', slice: matrixValues.slice(15, 20), color: 'text-purple-400' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-white/10 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                5x5 Color Matrix Inspector
              </h3>
              <p className="text-[11px] text-neutral-400">
                Real-time linear color transformation tensors (Durango REC.709)
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

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Active parameters */}
          <div className="grid grid-cols-3 gap-2 bg-[#141414] p-3 rounded-lg border border-white/5 font-mono text-xs">
            <div>
              <span className="text-neutral-500 text-[10px] block">CONTRAST (c)</span>
              <span className="text-cyan-400 font-bold">{contrast.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">BRIGHTNESS (b)</span>
              <span className="text-cyan-400 font-bold">{brightness.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">SATURATION (s)</span>
              <span className="text-cyan-400 font-bold">{saturation.toFixed(2)}</span>
            </div>
          </div>

          {/* 5x5 Matrix Display */}
          <div className="bg-[#141414] p-3 rounded-lg border border-white/5 space-y-2">
            <div className="grid grid-cols-6 gap-2 text-[10px] font-mono font-bold text-neutral-400 border-b border-white/10 pb-1 text-center">
              <span className="text-left">CHANNEL</span>
              <span>R_in</span>
              <span>G_in</span>
              <span>B_in</span>
              <span>A_in</span>
              <span>OFFSET</span>
            </div>

            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-2 text-xs font-mono items-center text-center">
                <span className={`text-[10px] font-semibold text-left ${row.color}`}>
                  {row.label.split(' ')[0]}
                </span>
                {row.slice.map((val, colIdx) => (
                  <span 
                    key={colIdx} 
                    className={`py-1 px-1 rounded bg-[#1c1c1c] border border-white/5 tabular-nums ${
                      colIdx === 4 ? 'text-amber-300 font-semibold' : 'text-neutral-200'
                    }`}
                  >
                    {val.toFixed(2)}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Mathematical explanation */}
          <div className="bg-[#181818] p-3 rounded border border-white/5 text-[11px] text-neutral-400 space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transformation Formulation:</span>
            </div>
            <p className="font-mono text-[10px] text-cyan-400/90">
              t = (1.0 - contrast) * 128.0 + (brightness * 255.0)
            </p>
            <p className="font-mono text-[10px] text-cyan-400/90">
              Luminance weights: lr=0.2126, lg=0.7152, lb=0.0722 (ITU-R BT.709)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181818] border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleCopyDart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#252525] hover:bg-[#2e2e2e] text-xs font-mono text-neutral-200 border border-white/10 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Dart Code!' : 'Copy Flutter/Dart Matrix'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
