import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Download, 
  Eraser, 
  Paintbrush, 
  Sliders, 
  Minus,
  Plus,
  CircleDot,
  ChevronDown,
  Image as ImageIcon,
  FileCode,
  Sparkles
} from 'lucide-react';
import { BrushItem, BrushDynamics } from '../types';
import { generateBrushAlphaStamp, generateIllustratorSvgBrush, triggerFileDownload } from '../utils/exportEngine';

interface CanvasStudioProps {
  currentBrush: BrushItem;
  dynamics: BrushDynamics;
  onUpdateDynamics: (dyn: Partial<BrushDynamics>) => void;
  onResetDynamics: () => void;
  currentColor: string;
  onChangeColor: (col: string) => void;
  onSelectBrush: (b: BrushItem) => void;
  allBrushes: BrushItem[];
}

const COLOR_PALETTES = [
  { name: 'Comic Inks', colors: ['#0f172a', '#334155', '#e11d48', '#2563eb', '#f59e0b', '#10b981'] },
  { name: 'Cyber Neon', colors: ['#38bdf8', '#f43f5e', '#a855f7', '#22c55e', '#fbbf24', '#ffffff'] },
  { name: 'Sumi & Earth', colors: ['#18181b', '#3f3f46', '#713f12', '#991b1b', '#14532d', '#fef08a'] },
  { name: 'Pastel Wash', colors: ['#fda4af', '#93c5fd', '#86efac', '#fde047', '#c4b5fd', '#fdba74'] },
];

const SIZE_PRESETS = [
  { label: '2px', value: 2, name: 'Hairline' },
  { label: '6px', value: 6, name: 'Detail' },
  { label: '14px', value: 14, name: 'Standard' },
  { label: '28px', value: 28, name: 'Medium' },
  { label: '48px', value: 48, name: 'Broad' },
  { label: '80px', value: 80, name: 'Macro / Moon' },
  { label: '130px', value: 130, name: 'Volumetric' },
];

export const CanvasStudio: React.FC<CanvasStudioProps> = ({
  currentBrush,
  dynamics,
  onUpdateDynamics,
  onResetDynamics,
  currentColor,
  onChangeColor,
  onSelectBrush,
  allBrushes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number; pressure: number; time: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyStepRef = useRef<number>(-1);
  const [isEraser, setIsEraser] = useState(false);
  const [canvasBg, setCanvasBg] = useState<'dark' | 'light' | 'grid' | 'parchment'>('dark');
  const [showDynamicsPanel, setShowDynamicsPanel] = useState(true);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  // Size step functions
  const handleDecreaseSize = useCallback(() => {
    const step = dynamics.size <= 10 ? 1 : dynamics.size <= 30 ? 2 : dynamics.size <= 70 ? 5 : 10;
    const newSize = Math.max(1, dynamics.size - step);
    onUpdateDynamics({ size: newSize });
  }, [dynamics.size, onUpdateDynamics]);

  const handleIncreaseSize = useCallback(() => {
    const step = dynamics.size < 10 ? 1 : dynamics.size < 30 ? 2 : dynamics.size < 70 ? 5 : 10;
    const newSize = Math.min(200, dynamics.size + step);
    onUpdateDynamics({ size: newSize });
  }, [dynamics.size, onUpdateDynamics]);

  // Keyboard shortcut listener for Size adjustment ('[' and ']') and undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === '[') {
        e.preventDefault();
        handleDecreaseSize();
      } else if (e.key === ']') {
        e.preventDefault();
        handleIncreaseSize();
      } else if (e.key === 'e' || e.key === 'E') {
        setIsEraser((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDecreaseSize, handleIncreaseSize]);

  // Initialize and resize canvas safely
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const width = Math.max(300, parent.clientWidth || 600);
    const height = Math.max(480, parent.clientHeight || 560);

    // Save existing contents if resizing
    let oldCanvas: HTMLCanvasElement | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
      try {
        oldCanvas = document.createElement('canvas');
        oldCanvas.width = canvas.width;
        oldCanvas.height = canvas.height;
        const oldCtx = oldCanvas.getContext('2d');
        if (oldCtx) {
          oldCtx.drawImage(canvas, 0, 0);
        }
      } catch (e) {
        // ignore
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    fillBackground(ctx, width, height, canvasBg);

    if (oldCanvas) {
      try {
        ctx.drawImage(oldCanvas, 0, 0);
      } catch (e) {
        // fallback
      }
    } else {
      saveHistory();
    }
  }, [canvasBg]);

  const fillBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, bgType: string) => {
    ctx.save();
    if (bgType === 'dark') {
      ctx.fillStyle = '#121215';
      ctx.fillRect(0, 0, w, h);
    } else if (bgType === 'light') {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);
    } else if (bgType === 'parchment') {
      ctx.fillStyle = '#f5f0e6';
      ctx.fillRect(0, 0, w, h);
      // subtle speckle
      ctx.fillStyle = 'rgba(120, 90, 40, 0.04)';
      for (let i = 0; i < 400; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
    } else if (bgType === 'grid') {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, w, h);
      // draw subtle isometric/cartesian grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const step = 24;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newStep = historyStepRef.current + 1;
      const newHistory = historyRef.current.slice(0, newStep);
      newHistory.push(data);
      if (newHistory.length > 25) {
        newHistory.shift();
      }
      historyStepRef.current = newHistory.length - 1;
      historyRef.current = newHistory;
    } catch (e) {
      // ignore
    }
  };

  const handleUndo = () => {
    if (historyStepRef.current > 0 && historyRef.current.length > 0) {
      const targetStep = historyStepRef.current - 1;
      const targetData = historyRef.current[targetStep];
      if (!targetData) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      try {
        ctx.putImageData(targetData, 0, 0);
        historyStepRef.current = targetStep;
      } catch (e) {
        // ignore
      }
    }
  };

  const handleRedo = () => {
    if (historyStepRef.current < historyRef.current.length - 1) {
      const targetStep = historyStepRef.current + 1;
      const targetData = historyRef.current[targetStep];
      if (!targetData) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      try {
        ctx.putImageData(targetData, 0, 0);
        historyStepRef.current = targetStep;
      } catch (e) {
        // ignore
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    fillBackground(ctx, canvas.width, canvas.height, canvasBg);
    saveHistory();
  };

  // Drawing event handlers with Pointer Event Pressure support
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Stylus pressure or fallback to 0.65
    let pressure = e.pressure;
    if (pressure === 0 || pressure === 0.5) {
      pressure = 0.7;
    }

    isDrawingRef.current = true;
    lastPointRef.current = { x, y, pressure, time: Date.now() };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const activeColor = isEraser ? (canvasBg === 'light' || canvasBg === 'parchment' ? '#f8fafc' : '#121215') : currentColor;
      try {
        currentBrush.renderEngine(
          ctx,
          x,
          y,
          x + 0.1,
          y + 0.1,
          pressure,
          dynamics,
          activeColor,
          Date.now()
        );
      } catch (err) {
        console.warn('renderEngine error:', err);
      }
    }
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPos({ x, y, visible: true });

    if (!isDrawingRef.current || !lastPointRef.current) return;

    const dist = Math.hypot(x - lastPointRef.current.x, y - lastPointRef.current.y);
    // For 1-click stamps (like Water, Moon, Cloud FX), ensure clean spacing when dragging
    if (isRealEffect && dist < Math.max(30, dynamics.size * 0.65)) {
      return;
    }

    let pressure = e.pressure;
    if (pressure === 0 || pressure === 0.5) {
      // Calculate speed-based pressure falloff
      const dt = Math.max(1, Date.now() - lastPointRef.current.time);
      const speed = dist / dt;
      pressure = Math.max(0.2, Math.min(1.0, 0.9 - speed * 0.12));
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const activeColor = isEraser ? (canvasBg === 'light' || canvasBg === 'parchment' ? '#f8fafc' : '#121215') : currentColor;
      try {
        currentBrush.renderEngine(
          ctx,
          x,
          y,
          lastPointRef.current.x,
          lastPointRef.current.y,
          pressure,
          dynamics,
          activeColor,
          Date.now()
        );
      } catch (err) {
        console.warn('renderEngine move error:', err);
      }
    }

    lastPointRef.current = { x, y, pressure, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    saveHistory();
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const handlePointerLeave = () => {
    setCursorPos((prev) => ({ ...prev, visible: false }));
  };

  const handleDownloadArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `artwork_${currentBrush.id}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const isRealEffect = currentBrush.id === 'moon-brush-tool' || currentBrush.id === 'cloud-brush-tool';

  // Get background style or preview color for the brush visualizer
  const getVisualizerStyle = () => {
    if (currentBrush.id === 'moon-brush-tool') {
      return {
        background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 55%, #475569 100%)',
        boxShadow: '0 0 12px rgba(224, 242, 254, 0.6)',
      };
    }
    if (currentBrush.id === 'cloud-brush-tool') {
      return {
        background: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #f1f5f9 60%, #94a3b8 100%)',
        boxShadow: '0 0 14px rgba(255, 255, 255, 0.7)',
      };
    }
    return {
      backgroundColor: currentColor,
    };
  };

  const handleDownloadActivePsStamp = async () => {
    const stampBlob = await generateBrushAlphaStamp(currentBrush, 2048);
    triggerFileDownload(stampBlob, `${currentBrush.id}_photoshop_stamp_2048px.png`);
  };

  const handleDownloadActiveAiSvg = () => {
    const svgStr = generateIllustratorSvgBrush(currentBrush);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    triggerFileDownload(blob, `${currentBrush.id}_illustrator_vector_brush.svg`);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl text-neutral-100">
      {/* Studio Toolbar Top */}
      <div className="flex items-center justify-between px-2.5 sm:px-3 py-2 border-b border-neutral-800 bg-neutral-900/90 text-xs gap-2 flex-wrap relative z-20">
        {/* Left Section: Active Brush, Eraser, and Real FX */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div className={`px-2 sm:px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 ${
            isRealEffect
              ? 'bg-amber-400/10 border-amber-500/40 text-amber-300'
              : 'bg-cyan-400/10 border-cyan-500/30 text-cyan-300'
          }`}>
            <Paintbrush className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[180px] font-semibold">{currentBrush.name}</span>
          </div>

          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isEraser
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-700'
            }`}
            title="Eraser Mode (Hot-key: E)"
          >
            <Eraser className="w-4 h-4" />
          </button>

          {/* Quick 1-Click Export Tools for Active Brush (Photoshop & Illustrator) */}
          <div className="flex items-center gap-1 bg-neutral-950/90 p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={handleDownloadActivePsStamp}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/60 transition-colors text-[11px] font-medium"
              title="Download Photoshop 2048px Stamp (PNG) for this brush"
            >
              <ImageIcon className="w-3 h-3 text-blue-400 shrink-0" />
              <span>PS</span>
            </button>
            <button
              onClick={handleDownloadActiveAiSvg}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-orange-950/60 hover:bg-orange-900 text-orange-300 border border-orange-800/60 transition-colors text-[11px] font-medium"
              title="Download Adobe Illustrator Vector Brush (SVG) for this brush"
            >
              <FileCode className="w-3 h-3 text-orange-400 shrink-0" />
              <span>AI</span>
            </button>
          </div>
        </div>

        {/* Middle Section: Size Controller & Color */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Size System */}
          <div className="flex items-center gap-1 bg-neutral-950 px-1.5 sm:px-2 py-1 rounded-lg border border-neutral-800 relative">
            <button
              onClick={handleDecreaseSize}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Decrease Brush Size (Key: [)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Size Popover Trigger */}
            <button
              onClick={() => setShowSizeDropdown(!showSizeDropdown)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-neutral-800 text-cyan-300 font-mono font-medium text-xs"
              title="Open Size Presets & Precision Selector"
            >
              <CircleDot className="w-3 h-3 text-cyan-400" />
              <span>{dynamics.size}px</span>
              <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${showSizeDropdown ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={handleIncreaseSize}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Increase Brush Size (Key: ])"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Size Selector Dropdown Dialog */}
            {showSizeDropdown && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-72 max-w-[calc(100vw-32px)] bg-neutral-900 border border-neutral-700 rounded-xl p-3.5 shadow-2xl z-50 text-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Brush Size System
                  </span>
                  <span className="text-cyan-400 font-mono font-bold text-xs">{dynamics.size} px</span>
                </div>

                {/* Live Diameter Visualizer */}
                <div className="h-14 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-center mb-3 overflow-hidden">
                  <div 
                    className="rounded-full transition-all duration-75 border border-cyan-400/50 shadow-sm"
                    style={{
                      width: `${Math.min(52, Math.max(4, dynamics.size))}px`,
                      height: `${Math.min(52, Math.max(4, dynamics.size))}px`,
                      opacity: dynamics.opacity / 100,
                      ...getVisualizerStyle(),
                    }}
                  />
                </div>

                {/* Precision Slider */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Diameter</span>
                    <span>1px - 200px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={dynamics.size}
                    onChange={(e) => onUpdateDynamics({ size: Number(e.target.value) })}
                    className="w-full accent-cyan-400 bg-neutral-800 rounded-lg cursor-pointer h-2"
                  />
                </div>

                {/* Quick Size Presets Grid */}
                <div className="text-[11px] text-neutral-400 mb-1.5 font-medium">Quick Presets:</div>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        onUpdateDynamics({ size: preset.value });
                        setShowSizeDropdown(false);
                      }}
                      className={`py-1 px-1.5 rounded text-center text-xs font-mono transition-all border ${
                        dynamics.size === preset.value
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800 pt-2">
                  <span>Shortcuts: <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-neutral-300">[</kbd> / <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-neutral-300">]</kbd></span>
                  <button 
                    onClick={() => setShowSizeDropdown(false)}
                    className="text-cyan-400 hover:underline"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Color Picker & Presets */}
          <div className="flex items-center gap-1 bg-neutral-950 px-1.5 sm:px-2 py-1 rounded-lg border border-neutral-800">
            <input
              id="color-picker-input"
              type="color"
              value={currentColor}
              onChange={(e) => onChangeColor(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
              title="Pick Custom Color"
            />
            <div className="flex items-center gap-1 ml-1 hidden sm:flex">
              {COLOR_PALETTES[0].colors.slice(0, 4).map((c) => (
                <button
                  key={c}
                  onClick={() => onChangeColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-3.5 h-3.5 rounded-full border border-neutral-700 transition-transform ${
                    currentColor.toLowerCase() === c.toLowerCase() ? 'scale-125 ring-1 ring-cyan-400' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Canvas Background & Actions */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Canvas Background Style */}
          <div className="flex items-center bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[11px]">
            <button
              onClick={() => { setCanvasBg('dark'); setTimeout(handleClear, 10); }}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[11px] ${canvasBg === 'dark' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'}`}
              title="Dark Studio Background"
            >
              Dark
            </button>
            <button
              onClick={() => { setCanvasBg('grid'); setTimeout(handleClear, 10); }}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[11px] ${canvasBg === 'grid' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'}`}
              title="Grid Blueprint"
            >
              Grid
            </button>
            <button
              onClick={() => { setCanvasBg('light'); setTimeout(handleClear, 10); }}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[11px] ${canvasBg === 'light' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'}`}
              title="Clean White Paper"
            >
              White
            </button>
            <button
              onClick={() => { setCanvasBg('parchment'); setTimeout(handleClear, 10); }}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[11px] hidden xs:inline ${canvasBg === 'parchment' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'}`}
              title="Vintage Parchment"
            >
              Kraft
            </button>
          </div>

          <button
            onClick={handleUndo}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950/60 text-neutral-300 hover:text-rose-300 border border-neutral-700 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownloadArtwork}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-500/30 transition-colors text-xs"
            title="Export Artwork Image (PNG)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">PNG</span>
          </button>
          <button
            onClick={() => setShowDynamicsPanel(!showDynamicsPanel)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showDynamicsPanel ? 'bg-cyan-400/20 text-cyan-300 border-cyan-500/40 shadow-sm' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
            title="Toggle Dynamics Adjusters"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="relative flex-1 bg-neutral-950 flex flex-col min-h-[220px] sm:min-h-[340px] overflow-hidden">
        {/* The Live Interactive Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className="w-full h-full flex-1 touch-none cursor-crosshair block"
        />

        {/* Interactive Brush Size Reticle Indicator */}
        {cursorPos.visible && (
          <div
            className={`pointer-events-none absolute rounded-full border transition-transform duration-0 transform -translate-x-1/2 -translate-y-1/2 ${
              isRealEffect
                ? 'border-amber-300/80 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                : 'border-cyan-400/60 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
            }`}
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              width: `${Math.max(4, dynamics.size)}px`,
              height: `${Math.max(4, dynamics.size)}px`,
              backgroundColor: isEraser
                ? 'rgba(244,63,94,0.1)'
                : isRealEffect
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(56,189,248,0.08)',
            }}
          />
        )}

        {/* Dynamics Quick Controls Floating HUD */}
        {showDynamicsPanel && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl p-2.5 sm:p-3 shadow-xl max-w-2xl mx-auto text-xs z-10 max-h-[70%] sm:max-h-[60%] overflow-y-auto">
            {/* Quick Size Preset Row */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80 gap-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-neutral-500 shrink-0">Size Presets:</span>
              <div className="flex items-center gap-1.5">
                {SIZE_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => onUpdateDynamics({ size: p.value })}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors border ${
                      dynamics.size === p.value
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Brush Size Slider */}
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Size</span>
                  <span className="text-cyan-400 font-mono font-bold">{dynamics.size}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={dynamics.size}
                  onChange={(e) => onUpdateDynamics({ size: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-neutral-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Opacity */}
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Opacity</span>
                  <span className="text-cyan-400 font-mono">{dynamics.opacity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={dynamics.opacity}
                  onChange={(e) => onUpdateDynamics({ opacity: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-neutral-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Flow */}
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Flow</span>
                  <span className="text-cyan-400 font-mono">{dynamics.flow}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={dynamics.flow}
                  onChange={(e) => onUpdateDynamics({ flow: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-neutral-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Pressure Toggle & Reset */}
              <div className="flex items-center justify-between gap-2 pt-2 sm:pt-0 col-span-2 sm:col-span-1">
                <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dynamics.pressureEnabled}
                    onChange={(e) => onUpdateDynamics({ pressureEnabled: e.target.checked })}
                    className="accent-cyan-400 rounded cursor-pointer"
                  />
                  <span>Pressure</span>
                </label>
                <button
                  onClick={onResetDynamics}
                  className="text-[11px] text-neutral-400 hover:text-cyan-300 underline"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Brush Selector Carousel at bottom */}
      <div className="p-1.5 sm:p-2 border-t border-neutral-800 bg-neutral-900/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 sm:gap-2 z-10">
        <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider pl-1.5 sm:pl-2 shrink-0">
          Switch:
        </span>
        {allBrushes.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelectBrush(b)}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 border transition-all ${
              currentBrush.id === b.id
                ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-neutral-950 border-cyan-300 shadow-md font-semibold'
                : 'bg-neutral-800/80 text-neutral-300 hover:text-white border-neutral-700'
            }`}
          >
            <span>{b.name.split('.')[0]}</span>
            <span className="truncate max-w-[90px] sm:max-w-[120px]">{b.name.split('.')[1] || b.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

