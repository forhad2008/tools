import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileArchive, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  FolderArchive,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { buildFullSuiteZip, triggerFileDownload } from '../utils/exportEngine';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalBrushes: number;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  totalBrushes,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const handleStartDownload = async () => {
    try {
      setIsGenerating(true);
      setIsComplete(false);
      setProgress(5);
      setStatusText('Preparing 30 brush definitions...');

      const zipBlob = await buildFullSuiteZip((percent, status) => {
        setProgress(percent);
        setStatusText(status);
      });

      triggerFileDownload(zipBlob, `30_Pro_Brushes_Photoshop_and_Illustrator_Suite.zip`);

      setIsComplete(true);
      setIsGenerating(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setStatusText('Error generating archive. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-neutral-900/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
              <FolderArchive className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Download 30-Brush Suite</h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">For Adobe Photoshop &amp; Illustrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 text-xs overflow-y-auto">
          {/* Package breakdown */}
          <div className="bg-neutral-900 rounded-xl p-3 sm:p-4 border border-neutral-800 space-y-2.5 sm:space-y-3">
            <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[10px] sm:text-[11px] block">
              Package Contents ({totalBrushes} Brushes Included)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              <div className="flex items-start gap-2 bg-neutral-950/60 p-2 sm:p-2.5 rounded-lg border border-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-200 block text-xs">Adobe Photoshop Suite</strong>
                  <span className="text-neutral-400 text-[11px]">
                    30x High-Res 2048px PNG Alpha Stamps + ExtendScript Auto-Importer (.jsx)
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-neutral-950/60 p-2 sm:p-2.5 rounded-lg border border-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-200 block text-xs">Adobe Illustrator Suite</strong>
                  <span className="text-neutral-400 text-[11px]">
                    30x Vector SVGs (Art, Scatter &amp; Pattern Brushes) + Combined SVG Library
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-neutral-950/60 p-2 sm:p-2.5 rounded-lg border border-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-200 block text-xs">Universal Preset Manifest</strong>
                  <span className="text-neutral-400 text-[11px]">
                    Calibrated Dynamics (Flow, Jitter, Angle, Scatter) in JSON format
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-neutral-950/60 p-2 sm:p-2.5 rounded-lg border border-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-200 block text-xs">Full Installation Guide</strong>
                  <span className="text-neutral-400 text-[11px]">
                    Step-by-step markdown setup instructions for Mac &amp; Windows
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar while generating */}
          {isGenerating && (
            <div className="space-y-2 bg-neutral-900/90 p-3 sm:p-4 rounded-xl border border-cyan-500/30">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-cyan-300">{statusText}</span>
                <span className="font-mono text-cyan-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success state */}
          {isComplete && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 sm:p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-300 text-xs sm:text-sm">Download Started!</h4>
                <p className="text-neutral-300 text-[11px] sm:text-xs">
                  Your ZIP archive has been generated. Check your browser downloads.
                </p>
              </div>
            </div>
          )}

          {/* Notice */}
          <div className="flex items-center gap-2 text-neutral-400 text-[10px] sm:text-[11px] bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-800/60">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>100% Free for personal and commercial graphic works. Royalty-free license.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-800 bg-neutral-900 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
          <button
            id="start-download-zip-btn"
            disabled={isGenerating}
            onClick={handleStartDownload}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-950" />
            <span>{isGenerating ? 'Packaging...' : 'Download Suite (ZIP)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
