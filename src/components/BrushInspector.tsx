import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileCode, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  Info,
  Image as ImageIcon
} from 'lucide-react';
import { BrushItem } from '../types';
import { generateBrushAlphaStamp, generateIllustratorSvgBrush, triggerFileDownload } from '../utils/exportEngine';
import { safeCopyToClipboard } from '../utils/clipboard';

interface BrushInspectorProps {
  brush: BrushItem | null;
  onClose: () => void;
  onSelectForCanvas: (b: BrushItem) => void;
}

export const BrushInspector: React.FC<BrushInspectorProps> = ({
  brush,
  onClose,
  onSelectForCanvas,
}) => {
  const [copiedJsx, setCopiedJsx] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [activeTab, setActiveTab] = useState<'photoshop' | 'illustrator' | 'dynamics'>('photoshop');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!brush) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    brush.drawThumbnail(ctx, canvas.width, canvas.height, '#38bdf8');
  }, [brush]);

  if (!brush) return null;

  const handleCopyJsx = async () => {
    await safeCopyToClipboard(brush.photoshopSpecs.jsxPresetLine);
    setCopiedJsx(true);
    setTimeout(() => setCopiedJsx(false), 2000);
  };

  const handleCopySvg = async () => {
    const svgStr = generateIllustratorSvgBrush(brush);
    await safeCopyToClipboard(svgStr);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const handleDownloadStamp = async () => {
    const stampBlob = await generateBrushAlphaStamp(brush, 2048);
    triggerFileDownload(stampBlob, `${brush.id}_stamp_2048px.png`);
  };

  const handleDownloadSvg = () => {
    const svgStr = generateIllustratorSvgBrush(brush);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    triggerFileDownload(blob, `${brush.id}_vector_brush.svg`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-neutral-900/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xs font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-500/30 font-bold shrink-0">
              {brush.name.split('.')[0]}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {brush.name.split('.')[1] || brush.name}
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">{brush.tagline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Tabs */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Stroke Preview Canvas */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 sm:p-4">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Stroke Simulation Preview
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-cyan-400">
                Preset Size: {brush.defaultDynamics.size}px
              </span>
            </div>
            <div className="h-20 sm:h-24 w-full rounded-lg overflow-hidden border border-neutral-800 bg-[#0a0d14]">
              <canvas
                ref={canvasRef}
                width={700}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-800 text-[11px] sm:text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('photoshop')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'photoshop'
                  ? 'border-blue-400 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Adobe Photoshop Specs
            </button>
            <button
              onClick={() => setActiveTab('illustrator')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'illustrator'
                  ? 'border-orange-400 text-orange-400 bg-orange-500/10'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Illustrator Vector Brush
            </button>
            <button
              onClick={() => setActiveTab('dynamics')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'dynamics'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Calibrated Dynamics
            </button>
          </div>

          {/* Tab Content: Photoshop */}
          {activeTab === 'photoshop' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 font-semibold block mb-1">Tip Shape &amp; Texture</span>
                  <p className="text-neutral-200 font-mono">{brush.photoshopSpecs.tipShape}</p>
                </div>
                <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 font-semibold block mb-1">Transfer &amp; Pressure Mode</span>
                  <p className="text-neutral-200">{brush.photoshopSpecs.transferMode}</p>
                </div>
                <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 font-semibold block mb-1">Smoothing &amp; Streamline</span>
                  <p className="text-neutral-200">{brush.photoshopSpecs.smoothing}</p>
                </div>
                <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 font-semibold block mb-1">Recommended Artwork Application</span>
                  <p className="text-neutral-200">{brush.photoshopSpecs.recommendedUse}</p>
                </div>
              </div>

              {/* Photoshop Script command */}
              <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-neutral-400 font-semibold">ExtendScript Automation Hook</span>
                  <button
                    onClick={handleCopyJsx}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                  >
                    {copiedJsx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJsx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="block bg-neutral-950 p-2.5 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {brush.photoshopSpecs.jsxPresetLine}
                </code>
              </div>
            </div>
          )}

          {/* Tab Content: Illustrator */}
          {activeTab === 'illustrator' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 font-semibold block mb-1">Illustrator Brush Type</span>
                  <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800 font-semibold uppercase">
                    {brush.illustratorSpecs.brushKind}
                  </span>
                </div>
                <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 font-semibold block mb-1">Stroke Scaling Method</span>
                  <p className="text-neutral-200 uppercase font-mono">{brush.illustratorSpecs.strokeScaling}</p>
                </div>
                <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 font-semibold block mb-1">Colorization Method</span>
                  <p className="text-neutral-200">{brush.illustratorSpecs.colorization}</p>
                </div>
                <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 font-semibold block mb-1">Recommended Vector Work</span>
                  <p className="text-neutral-200">{brush.illustratorSpecs.recommendedUse}</p>
                </div>
              </div>

              {/* SVG Vector Code */}
              <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-neutral-400 font-semibold">SVG Vector Brush Definition</span>
                  <button
                    onClick={handleCopySvg}
                    className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-[11px]"
                  >
                    {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSvg ? 'Copied' : 'Copy SVG'}</span>
                  </button>
                </div>
                <code className="block bg-neutral-950 p-2.5 rounded-lg text-orange-300 font-mono text-[11px] overflow-x-auto max-h-24">
                  {brush.illustratorSpecs.svgDefinition}
                </code>
              </div>
            </div>
          )}

          {/* Tab Content: Dynamics */}
          {activeTab === 'dynamics' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block">Default Size</span>
                <span className="text-neutral-200 font-bold font-mono">{brush.defaultDynamics.size}px</span>
              </div>
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block">Opacity</span>
                <span className="text-neutral-200 font-bold font-mono">{brush.defaultDynamics.opacity}%</span>
              </div>
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block">Flow</span>
                <span className="text-neutral-200 font-bold font-mono">{brush.defaultDynamics.flow}%</span>
              </div>
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block">Hardness</span>
                <span className="text-neutral-200 font-bold font-mono">{brush.defaultDynamics.hardness}%</span>
              </div>
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block">Spacing</span>
                <span className="text-neutral-200 font-bold font-mono">{brush.defaultDynamics.spacing}%</span>
              </div>
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block">Angle Jitter</span>
                <span className="text-neutral-200 font-bold font-mono">{brush.defaultDynamics.angleJitter}°</span>
              </div>
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block">Scatter Amount</span>
                <span className="text-neutral-200 font-bold font-mono">{brush.defaultDynamics.scatter}%</span>
              </div>
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block">Streamline Smoothing</span>
                <span className="text-neutral-200 font-bold font-mono">{brush.defaultDynamics.smoothing}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between gap-2.5 flex-wrap">
          <button
            onClick={() => {
              onSelectForCanvas(brush);
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 text-neutral-950 font-bold text-xs hover:from-cyan-300 hover:to-indigo-300 transition-colors shadow-md shadow-cyan-500/20 text-center"
          >
            Load in Drawing Studio
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadStamp}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] sm:text-xs font-medium transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>PS Stamp (PNG)</span>
            </button>
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] sm:text-xs font-medium transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-orange-400" />
              <span>AI Brush (SVG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
