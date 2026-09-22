import React, { useRef, useEffect } from 'react';
import { 
  Paintbrush, 
  Download, 
  FileCode, 
  Layers, 
  Sliders, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { BrushItem } from '../types';
import { generateBrushAlphaStamp, generateIllustratorSvgBrush, triggerFileDownload } from '../utils/exportEngine';

interface BrushGalleryProps {
  brushes: BrushItem[];
  selectedBrush: BrushItem;
  onSelectBrush: (b: BrushItem) => void;
  onOpenInspector: (b: BrushItem) => void;
  currentColor: string;
}

// Single brush preview card with animated thumbnail
const BrushCard: React.FC<{
  brush: BrushItem;
  isSelected: boolean;
  onSelect: () => void;
  onInspect: () => void;
  currentColor: string;
}> = ({ brush, isSelected, onSelect, onInspect, currentColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Dark preview background
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render brush stroke thumbnail
    brush.drawThumbnail(ctx, canvas.width, canvas.height, '#38bdf8');
  }, [brush]);

  const handleDownloadSingleStamp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const stampBlob = await generateBrushAlphaStamp(brush, 2048);
    triggerFileDownload(stampBlob, `${brush.id}_photoshop_stamp_2048px.png`);
  };

  const handleDownloadSingleSvg = (e: React.MouseEvent) => {
    e.stopPropagation();
    const svgStr = generateIllustratorSvgBrush(brush);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    triggerFileDownload(blob, `${brush.id}_illustrator_vector_brush.svg`);
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-neutral-900/90 hover:bg-neutral-900 border rounded-xl p-3.5 sm:p-4 transition-all cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-cyan-400 ring-1 ring-cyan-400/50 shadow-xl shadow-cyan-950/30'
          : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <div>
        {/* Header tags */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
            {brush.name.split('.')[0]}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60" title="Photoshop Ready (2048px Alpha Tip)">
              PS
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800/60" title="Illustrator Vector SVG Ready">
              AI ({brush.illustratorType})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-1">
          {brush.name.split('.')[1] || brush.name}
        </h3>
        <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
          {brush.tagline}
        </p>

        {/* Live Canvas Stroke Preview */}
        <div className="relative rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 h-20 mb-3 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={280}
            height={80}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1.5 right-1.5 text-[9px] font-mono text-neutral-500 bg-neutral-950/70 px-1.5 py-0.5 rounded">
            {brush.defaultDynamics.size}px
          </div>
        </div>

        {/* Features list */}
        <div className="flex flex-wrap gap-1 mb-3">
          {brush.features.slice(0, 2).map((f, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800/80 text-neutral-400 border border-neutral-700/60"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2.5 border-t border-neutral-800/80 flex items-center justify-between gap-1.5 text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect();
          }}
          className="text-neutral-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors p-1"
          title="Inspect Specs & Dynamics"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Specs</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleDownloadSingleStamp}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-800/60 transition-colors text-[11px] font-medium"
            title="Download Photoshop 2048px Stamp (PNG)"
          >
            <ImageIcon className="w-3 h-3 text-blue-400" />
            <span>PS</span>
          </button>
          <button
            onClick={handleDownloadSingleSvg}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-950/70 hover:bg-orange-900 text-orange-300 border border-orange-800/60 transition-colors text-[11px] font-medium"
            title="Download Illustrator Vector Brush (SVG)"
          >
            <FileCode className="w-3 h-3 text-orange-400" />
            <span>AI</span>
          </button>
          <button
            onClick={onSelect}
            className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors flex items-center gap-1 ${
              isSelected
                ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-neutral-950 font-semibold shadow-sm'
                : 'bg-neutral-800 hover:bg-neutral-700 text-cyan-300'
            }`}
          >
            <Paintbrush className="w-3 h-3" />
            <span>{isSelected ? 'Active' : 'Test'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const BrushGallery: React.FC<BrushGalleryProps> = ({
  brushes,
  selectedBrush,
  onSelectBrush,
  onOpenInspector,
  currentColor,
}) => {
  if (brushes.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-400">
        <Paintbrush className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-200 mb-1">No brushes found</h3>
        <p className="text-xs text-neutral-500">
          Try clearing your search query or selecting a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {brushes.map((brush) => (
        <BrushCard
          key={brush.id}
          brush={brush}
          isSelected={selectedBrush.id === brush.id}
          onSelect={() => onSelectBrush(brush)}
          onInspect={() => onOpenInspector(brush)}
          currentColor={currentColor}
        />
      ))}
    </div>
  );
};
