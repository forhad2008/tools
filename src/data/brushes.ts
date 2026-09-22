import { BrushItem, BrushCategory } from '../types';
import { renderRealMoonStamp, getMasterMoonCanvas } from '../utils/lunarRenderer';

export const BRUSH_CATEGORIES: { id: BrushCategory; label: string; count: number; iconName: string }[] = [
  { id: 'inking', label: 'Inking & Linework', count: 5, iconName: 'PenTool' },
  { id: 'textures', label: 'Textures & Shading', count: 5, iconName: 'Grid' },
  { id: 'painting', label: 'Natural Media Painting', count: 5, iconName: 'Palette' },
  { id: 'lettering', label: 'Calligraphy & Lettering', count: 5, iconName: 'Feather' },
  { id: 'decorative', label: 'Patterns & Borders', count: 5, iconName: 'Sparkles' },
  { id: 'vfx', label: 'VFX & Concept Art', count: 5, iconName: 'Zap' },
];

// Helper: parse hex color to rgb safely
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (!hex || typeof hex !== 'string') {
    return { r: 56, g: 189, b: 248 };
  }
  let c = hex.replace('#', '').trim();
  if (c.startsWith('rgb')) {
    const match = c.match(/\d+/g);
    if (match && match.length >= 3) {
      return { r: Number(match[0]), g: Number(match[1]), b: Number(match[2]) };
    }
  }
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) {
    return { r: 56, g: 189, b: 248 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper: draw smooth curved thumbnail preview stroke
function drawBaseStrokeThumbnail(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  strokeFunc: (ctx: CanvasRenderingContext2D, t: number, x: number, y: number) => void
) {
  ctx.save();
  const points = 40;
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    // S-curve preview path
    const x = 20 + t * (w - 40);
    const y = h / 2 + Math.sin(t * Math.PI * 2) * (h * 0.28);
    strokeFunc(ctx, t, x, y);
  }
  ctx.restore();
}

export const BRUSHES: BrushItem[] = [
  // ==========================================
  // 1. INKING & LINEWORK (5 Brushes)
  // ==========================================
  {
    id: 'manga-g-pen',
    name: '01. Precise Manga G-Pen',
    category: 'inking',
    tagline: 'Razor-sharp pressure taper & crisp ink pooling for comic inking',
    description: 'Emulates the iconic Japanese zebra G-pen metal nib with extreme dynamic pressure response, ultra-sharp tapered stroke ends, and anti-aliased solid core.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 14,
      minSize: 2,
      opacity: 100,
      flow: 100,
      hardness: 95,
      spacing: 1,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 60,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Dynamic pressure taper', 'High line-weight modulation', 'Crisp anime contouring', 'Fast response curve'],
    photoshopSpecs: {
      tipShape: 'Hard Round 2048px (100% Hardness, 1% Spacing)',
      transferMode: 'Size Dynamics: Pen Pressure (100%), Control: Pen Pressure',
      smoothing: '60% Streamline Smoothing',
      recommendedUse: 'Character linework, action lines, mangaka lineart',
      jsxPresetLine: 'app.activeDocument.brushes.add("Manga G-Pen", 14, "PressureTaper");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Pointed Taper Profile 1)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 4.0',
      colorization: 'Tints',
      recommendedUse: 'Variable width strokes in Vector Linework',
      svgDefinition: '<svg viewBox="0 0 400 30"><path d="M0,15 Q200,-5 400,15 Q200,35 0,15 Z" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      ctx.lineWidth = effSize;
      ctx.strokeStyle = color;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (c, t, x, y) => {
        const rad = Math.sin(t * Math.PI) * 7 + 1.5;
        c.fillStyle = color;
        c.beginPath();
        c.arc(x, y, rad, 0, Math.PI * 2);
        c.fill();
      });
    },
  },

  {
    id: 'sumi-ink-brush',
    name: '02. Japanese Sumi-e Ink Wash',
    category: 'inking',
    tagline: 'Organic wet bristle friction with authentic natural dry ink streaks',
    description: 'Simulates traditional oriental horsehair brushes with authentic split bristles, wet bleeding at heavy pressure, and dry fiber separation on quick strokes.',
    targetSoftware: 'both',
    illustratorType: 'bristle',
    defaultDynamics: {
      size: 28,
      minSize: 4,
      opacity: 90,
      flow: 85,
      hardness: 40,
      spacing: 5,
      angle: 30,
      angleJitter: 5,
      sizeJitter: 10,
      scatter: 2,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 40,
      colorJitter: 0,
      blendMode: 'multiply',
    },
    features: ['Multi-bristle strand simulation', 'Dry ink edge scumble', 'Wet pooling bleed', 'Expressive calligraphy response'],
    photoshopSpecs: {
      tipShape: 'Sumi-e Bristle Splatter 2048px (Scattered Fiber Tip)',
      transferMode: 'Dual Brush (Chalk 36px) + Wet Edges',
      smoothing: '40% Natural Stroke',
      recommendedUse: 'Kanji, traditional oriental ink art, concept sketch contours',
      jsxPresetLine: 'app.activeDocument.brushes.add("Sumi-e Wash", 28, "BristleSplit");',
    },
    illustratorSpecs: {
      brushKind: 'Bristle Brush (Round Fan Bristle, 75% Density)',
      strokeScaling: 'stretch',
      fidelity: 'Accurate 2.5',
      colorization: 'Tints and Shades',
      recommendedUse: 'Organic textured vector brush strokes',
      svgDefinition: '<svg viewBox="0 0 400 50"><path d="M0,25 C80,5 140,45 200,20 C260,-5 320,40 400,25 C340,30 240,40 0,25 Z" fill="#000"/><circle cx="120" cy="18" r="2" fill="#000"/><circle cx="280" cy="32" r="3" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const bristleCount = 7;
      const dx = x - prevX;
      const dy = y - prevY;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      ctx.lineCap = 'round';
      for (let i = 0; i < bristleCount; i++) {
        const offset = ((i - (bristleCount - 1) / 2) / bristleCount) * effSize;
        const bristleAlpha = ((dyn.opacity / 100) * (0.2 + (1 - Math.abs(offset) / effSize) * 0.4) * (dyn.flow / 100)).toFixed(2);
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bristleAlpha})`;
        ctx.lineWidth = Math.max(1, (effSize / bristleCount) * (0.8 + Math.random() * 0.4));
        ctx.beginPath();
        ctx.moveTo(prevX + nx * offset, prevY + ny * offset);
        ctx.lineTo(x + nx * offset + (Math.random() - 0.5) * 2, y + ny * offset + (Math.random() - 0.5) * 2);
        ctx.stroke();
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      const rgb = hexToRgb(color);
      drawBaseStrokeThumbnail(ctx, w, h, color, (c, t, x, y) => {
        for (let b = -4; b <= 4; b++) {
          const rad = Math.sin(t * Math.PI) * (1.2 + Math.abs(b) * 0.3);
          c.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 + (1 - Math.abs(b) / 5) * 0.4})`;
          c.beginPath();
          c.arc(x + b * 2, y + b * 1.5, rad, 0, Math.PI * 2);
          c.fill();
        }
      });
    },
  },

  {
    id: 'technical-micron',
    name: '03. Technical Drafting Micron',
    category: 'inking',
    tagline: 'Ultra-uniform calibrated needle point for architectural & vector drafting',
    description: 'Precision 0.25mm - 0.8mm technical fineliner pen with zero size variation, zero bleeding, and ultra-crisp mathematical vector rendering.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 4,
      minSize: 4,
      opacity: 100,
      flow: 100,
      hardness: 100,
      spacing: 1,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: false,
      smoothing: 75,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Fixed line-weight precision', 'Isometric drafting standard', 'Zero jitter mathematical curve', 'Blueprint drafting ready'],
    photoshopSpecs: {
      tipShape: 'Hard Round 4px (100% Hardness, 1% Spacing)',
      transferMode: 'Off (Constant Calibrated Needle)',
      smoothing: '80% High Precision Mode',
      recommendedUse: 'Isometric illustration, icon design, schematic drafting',
      jsxPresetLine: 'app.activeDocument.brushes.add("Drafting Micron 05", 4, "ConstantWidth");',
    },
    illustratorSpecs: {
      brushKind: 'Uniform Basic Stroke / Calligraphic 4pt Round',
      strokeScaling: 'stretch',
      fidelity: 'Accurate 1.0',
      colorization: 'None',
      recommendedUse: 'Technical vector drafting lines and schematics',
      svgDefinition: '<svg viewBox="0 0 100 20"><line x1="0" y1="10" x2="100" y2="10" stroke="#000" stroke-width="4" stroke-linecap="round"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, _pressure, dyn, color) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = dyn.size;
      ctx.strokeStyle = color;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (c, _t, x, y) => {
        c.fillStyle = color;
        c.beginPath();
        c.arc(x, y, 2.5, 0, Math.PI * 2);
        c.fill();
      });
    },
  },

  {
    id: 'engraving-crosshatch',
    name: '04. Vintage Engraving Crosshatch',
    category: 'inking',
    tagline: 'Parallel copperplate etching & vintage bank-note shading lines',
    description: 'Generates authentic 18th-century copperplate intaglio line-engraving strokes with dynamic parallel micro-hatching that responds to stroke angle and velocity.',
    targetSoftware: 'both',
    illustratorType: 'pattern',
    defaultDynamics: {
      size: 24,
      minSize: 8,
      opacity: 95,
      flow: 95,
      hardness: 90,
      spacing: 6,
      angle: 45,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 50,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Historical intaglio effect', 'Banknote currency shading', 'Angle-locked micro-lines', 'Rich vintage density'],
    photoshopSpecs: {
      tipShape: 'Engraver Slit 45-deg Stamp 2048px',
      transferMode: 'Size Dynamics locked to angle orientation',
      smoothing: '50% Clean Glide',
      recommendedUse: 'Vintage heraldry, antique woodcuts, financial document graphics',
      jsxPresetLine: 'app.activeDocument.brushes.add("Copperplate Etching", 24, "AngleSlit");',
    },
    illustratorSpecs: {
      brushKind: 'Pattern Brush (Engraving Slit Hatch Tile)',
      strokeScaling: 'tile',
      fidelity: 'Smooth 3.0',
      colorization: 'Tints',
      recommendedUse: 'Classic vintage packaging and etched heraldry banners',
      svgDefinition: '<svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0" stroke="#000" stroke-width="2.5"/><line x1="-10" y1="30" x2="30" y2="-10" stroke="#000" stroke-width="2.5"/><line x1="10" y1="50" x2="50" y2="10" stroke="#000" stroke-width="2.5"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, pressure, dyn, color) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const radAngle = ((dyn.angle || 45) * Math.PI) / 180;
      const cosA = Math.cos(radAngle) * (effSize / 2);
      const sinA = Math.sin(radAngle) * (effSize / 2);

      ctx.beginPath();
      ctx.moveTo(x - cosA, y - sinA);
      ctx.lineTo(x + cosA, y + sinA);
      ctx.stroke();

      if (pressure > 0.6) {
        ctx.beginPath();
        ctx.moveTo(x - cosA + 3, y - sinA - 3);
        ctx.lineTo(x + cosA + 3, y + sinA - 3);
        ctx.stroke();
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (c, t, x, y) => {
        c.strokeStyle = color;
        c.lineWidth = 1.8;
        const len = Math.sin(t * Math.PI) * 12 + 4;
        c.beginPath();
        c.moveTo(x - len / 2, y - len / 2);
        c.lineTo(x + len / 2, y + len / 2);
        c.stroke();
      });
    },
  },

  {
    id: 'wet-comic-liner',
    name: '05. Wet Fluid Comic Liner',
    category: 'inking',
    tagline: 'High-speed comic brush liner with juicy ink pooling in sharp corners',
    description: 'Designed for western comic book illustrators. Produces bold, punchy strokes with dynamic ink puddle concentration where the brush slows down.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 18,
      minSize: 3,
      opacity: 100,
      flow: 100,
      hardness: 90,
      spacing: 2,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 70,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Ink velocity pooling', 'Thick-to-thin dynamic contrast', 'Smooth bezier interpolation', 'Bold graphic weight'],
    photoshopSpecs: {
      tipShape: 'Organic Teardrop Nib 2048px',
      transferMode: 'Size Dynamics: Pen Pressure + Flow Dynamics',
      smoothing: '70% Comic Line Stabilizer',
      recommendedUse: 'Superhero comics, graphic novels, graffiti character art',
      jsxPresetLine: 'app.activeDocument.brushes.add("Comic Fluid Liner", 18, "JuicyPooling");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Oval Taper Profile 2)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 5.0',
      colorization: 'Tints',
      recommendedUse: 'High dynamic vector outlines for character illustrations',
      svgDefinition: '<svg viewBox="0 0 300 40"><path d="M0,20 C50,2 100,38 200,38 C260,38 290,26 300,20 C290,14 260,2 200,2 C100,2 50,38 0,20 Z" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const dx = x - prevX;
      const dy = y - prevY;
      const speed = Math.hypot(dx, dy);
      // Slower speed = slightly more ink pooling
      const poolFactor = Math.max(0.8, 1.4 - speed * 0.02);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1) * poolFactor);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = effSize;
      ctx.strokeStyle = color;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (c, t, x, y) => {
        const rad = Math.sin(t * Math.PI) * 8 + 2;
        c.fillStyle = color;
        c.beginPath();
        c.arc(x, y, rad, 0, Math.PI * 2);
        c.fill();
      });
    },
  },

  // ==========================================
  // 2. TEXTURES & SHADING (5 Brushes)
  // ==========================================
  {
    id: 'stipple-grain-shader',
    name: '06. Stippling & Grain Shader',
    category: 'textures',
    tagline: 'Micro-dot density gradient for retro editorial shading & drop shadows',
    description: 'Generates thousands of micro-dots with authentic organic stochastic dispersion. Perfect for creating silky shadows, depth, and vintage editorial textures.',
    targetSoftware: 'both',
    illustratorType: 'scatter',
    defaultDynamics: {
      size: 45,
      minSize: 10,
      opacity: 85,
      flow: 75,
      hardness: 20,
      spacing: 15,
      angle: 0,
      angleJitter: 180,
      sizeJitter: 40,
      scatter: 60,
      scatterCount: 18,
      pressureEnabled: true,
      smoothing: 30,
      colorJitter: 0,
      blendMode: 'multiply',
    },
    features: ['Stochastic particle dispersion', 'Gradient pressure density', 'Retro vintage grain', 'Zero banding transitions'],
    photoshopSpecs: {
      tipShape: 'Stipple Cluster Stamp 2048px (Scattered Micro Dots)',
      transferMode: 'Scatter (250%), Count (3), Jitter (50%)',
      smoothing: 'Off for maximum grit crispness',
      recommendedUse: 'Vintage editorial illustration, poster shading, stipple portraits',
      jsxPresetLine: 'app.activeDocument.brushes.add("Stipple Grain", 45, "StochasticScatter");',
    },
    illustratorSpecs: {
      brushKind: 'Scatter Brush (Random Size 40-100%, Random Scatter 80%)',
      strokeScaling: 'proportional',
      fidelity: 'Smooth 2.0',
      colorization: 'Tints',
      recommendedUse: 'Vector grain shading, vintage packaging highlights',
      svgDefinition: '<svg viewBox="0 0 100 100"><circle cx="20" cy="30" r="2" fill="#000"/><circle cx="45" cy="15" r="1.5" fill="#000"/><circle cx="80" cy="40" r="3" fill="#000"/><circle cx="35" cy="70" r="2.5" fill="#000"/><circle cx="65" cy="85" r="1.8" fill="#000"/><circle cx="50" cy="50" r="3.2" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const radius = (dyn.size / 2) * (dyn.pressureEnabled ? pressure : 1);
      const count = Math.floor(dyn.scatterCount * (dyn.pressureEnabled ? pressure : 1));

      for (let i = 0; i < count; i++) {
        const r = Math.sqrt(Math.random()) * radius;
        const theta = Math.random() * Math.PI * 2;
        const px = x + r * Math.cos(theta);
        const py = y + r * Math.sin(theta);
        const dotSize = 0.8 + Math.random() * 1.6;
        const alpha = ((dyn.opacity / 100) * (0.3 + Math.random() * 0.7) * (dyn.flow / 100)).toFixed(2);

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      const rgb = hexToRgb(color);
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        for (let i = 0; i < 8; i++) {
          const r = Math.random() * 14;
          const th = Math.random() * Math.PI * 2;
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 + Math.random() * 0.6})`;
          ctx.beginPath();
          ctx.arc(x + r * Math.cos(th), y + r * Math.sin(th), 1 + Math.random() * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    },
  },

  {
    id: 'retro-halftone-matrix',
    name: '07. Retro Halftone Dot Matrix',
    category: 'textures',
    tagline: 'Screen-printed 45° angle aligned CMYK halftone dot patterns',
    description: 'Generates aligned pop-art halftone dots like 1960s comic books, Roy Lichtenstein paintings, and vintage newspaper offset printing.',
    targetSoftware: 'both',
    illustratorType: 'pattern',
    defaultDynamics: {
      size: 50,
      minSize: 15,
      opacity: 95,
      flow: 90,
      hardness: 85,
      spacing: 12,
      angle: 45,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 40,
      colorJitter: 0,
      blendMode: 'multiply',
    },
    features: ['45-degree angle grid lock', 'Pressure-sensitive dot radius', 'Pop art aesthetic', 'Authentic print screen tone'],
    photoshopSpecs: {
      tipShape: 'Halftone Screen Tip 2048px (Dot Matrix)',
      transferMode: 'Size Dynamics based on screen frequency',
      smoothing: '40% Grid Aligned',
      recommendedUse: 'Pop art illustration, silkscreen posters, comic screen-tones',
      jsxPresetLine: 'app.activeDocument.brushes.add("Halftone Matrix", 50, "ScreenToneGrid");',
    },
    illustratorSpecs: {
      brushKind: 'Pattern Brush (Geometric Halftone Tile)',
      strokeScaling: 'tile',
      fidelity: 'Accurate 1.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Pop art backgrounds, comic shading, screen print apparel',
      svgDefinition: '<svg viewBox="0 0 60 60"><circle cx="15" cy="15" r="7" fill="#000"/><circle cx="45" cy="15" r="7" fill="#000"/><circle cx="15" cy="45" r="7" fill="#000"/><circle cx="45" cy="45" r="7" fill="#000"/><circle cx="30" cy="30" r="9" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const gridSize = 14;
      const radius = (dyn.size / 2) * (dyn.pressureEnabled ? pressure : 1);
      const dotRad = Math.max(1, 6 * (dyn.pressureEnabled ? pressure : 0.8));

      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dyn.opacity / 100) * (dyn.flow / 100)})`;

      const startX = Math.floor((x - radius) / gridSize) * gridSize;
      const endX = Math.ceil((x + radius) / gridSize) * gridSize;
      const startY = Math.floor((y - radius) / gridSize) * gridSize;
      const endY = Math.ceil((y + radius) / gridSize) * gridSize;

      for (let gx = startX; gx <= endX; gx += gridSize) {
        for (let gy = startY; gy <= endY; gy += gridSize) {
          const d = Math.hypot(gx - x, gy - y);
          if (d <= radius) {
            const scaledRad = dotRad * (1 - d / (radius * 1.2));
            if (scaledRad > 0.5) {
              ctx.beginPath();
              ctx.arc(gx, gy, scaledRad, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const dotR = Math.sin(t * Math.PI) * 4.5 + 1;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 6, y - 6, dotR * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },

  {
    id: 'dry-charcoal-pastel',
    name: '08. Dry Charcoal & Soft Pastel',
    category: 'textures',
    tagline: 'Rough paper tooth friction, crumbly dust & expressive velvety shadows',
    description: 'Captures the raw physical texture of compressed vine charcoal dragging across heavy 300gsm cold-press paper. Produces dusty edges and rich dark blacks.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 32,
      minSize: 6,
      opacity: 85,
      flow: 80,
      hardness: 50,
      spacing: 8,
      angle: 15,
      angleJitter: 25,
      sizeJitter: 15,
      scatter: 4,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 35,
      colorJitter: 0,
      blendMode: 'multiply',
    },
    features: ['Paper tooth grain interaction', 'Crumbly charcoal edges', 'Velvety dark layering', 'Life drawing texture'],
    photoshopSpecs: {
      tipShape: 'Charcoal Grain Block 2048px (Cold-press paper texture)',
      transferMode: 'Dual Brush (Heavy Grain 80px) + Texture Multiply',
      smoothing: '30% Natural Friction',
      recommendedUse: 'Figure sketching, expressive charcoal portraits, textured illustrations',
      jsxPresetLine: 'app.activeDocument.brushes.add("Dry Charcoal", 32, "PaperFriction");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Chalk / Charcoal Vector Contour)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 3.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Organic textured vector illustrations, chalk lettering',
      svgDefinition: '<svg viewBox="0 0 400 40"><path d="M0,20 Q50,5 100,22 Q150,38 200,18 Q250,2 300,24 Q350,38 400,20 Q350,14 300,16 Q250,30 200,24 Q150,10 100,18 Q50,30 0,20 Z" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const particles = 12;

      for (let i = 0; i < particles; i++) {
        const offset = (Math.random() - 0.5) * effSize;
        const px = x + offset;
        const py = y + (Math.random() - 0.5) * (effSize * 0.6);
        const pSize = 1 + Math.random() * (effSize * 0.18);
        const alpha = ((dyn.opacity / 100) * (0.15 + Math.random() * 0.35) * (dyn.flow / 100)).toFixed(2);

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.fillRect(px, py, pSize, pSize * (0.8 + Math.random() * 0.6));
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      const rgb = hexToRgb(color);
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const sz = Math.sin(t * Math.PI) * 12 + 3;
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.25 + Math.random() * 0.5})`;
          ctx.fillRect(x + (Math.random() - 0.5) * sz, y + (Math.random() - 0.5) * sz, 2 + Math.random() * 2, 2);
        }
      });
    },
  },

  {
    id: 'heavy-grunge-distressed',
    name: '09. Heavy Grunge & Distressed Stamp',
    category: 'textures',
    tagline: 'Abrasive speckle, eroded surfaces & concrete weathering masks',
    description: 'Distresses graphics with heavy abrasive peeling, concrete grit, and distressed stamp marks. Essential for vintage t-shirt graphics, skate art, and distressed typography.',
    targetSoftware: 'both',
    illustratorType: 'scatter',
    defaultDynamics: {
      size: 55,
      minSize: 20,
      opacity: 90,
      flow: 85,
      hardness: 80,
      spacing: 25,
      angle: 0,
      angleJitter: 180,
      sizeJitter: 45,
      scatter: 40,
      scatterCount: 6,
      pressureEnabled: true,
      smoothing: 20,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Eroded paint flaking', 'Distressed vintage apparel look', 'High contrast grit chunks', 'Random rotational scatter'],
    photoshopSpecs: {
      tipShape: 'Grunge Speckle Stamp 2048px (Eroded Concrete)',
      transferMode: 'Shape Dynamics: Size Jitter (40%), Angle Jitter (100%)',
      smoothing: 'Off (Ultra Crisp Grit)',
      recommendedUse: 'Apparel graphic weathering, poster distressing, grunge borders',
      jsxPresetLine: 'app.activeDocument.brushes.add("Grunge Distressed", 55, "ErodedGrit");',
    },
    illustratorSpecs: {
      brushKind: 'Scatter Brush (Random Angle 360°, Random Size 50-130%)',
      strokeScaling: 'proportional',
      fidelity: 'Smooth 1.5',
      colorization: 'Tints',
      recommendedUse: 'Vector distressing masks, vintage streetwear t-shirts',
      svgDefinition: '<svg viewBox="0 0 120 120"><path d="M10,20 L35,15 L25,35 Z M50,60 L80,55 L70,80 Z M90,15 L110,25 L105,40 Z M20,85 L45,95 L30,110 Z" fill="#000"/><circle cx="55" cy="25" r="4" fill="#000"/><circle cx="15" cy="60" r="3" fill="#000"/><circle cx="95" cy="85" r="5" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const radius = (dyn.size / 2) * (dyn.pressureEnabled ? pressure : 1);
      const chunks = 5 + Math.floor(Math.random() * 5);

      for (let i = 0; i < chunks; i++) {
        const cx = x + (Math.random() - 0.5) * radius * 2;
        const cy = y + (Math.random() - 0.5) * radius * 2;
        const chunkW = 2 + Math.random() * 8;
        const chunkH = 2 + Math.random() * 8;
        const alpha = ((dyn.opacity / 100) * (0.4 + Math.random() * 0.6) * (dyn.flow / 100)).toFixed(2);

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + chunkW, cy + (Math.random() - 0.5) * 4);
        ctx.lineTo(cx + chunkW * 0.8, cy + chunkH);
        ctx.lineTo(cx - 2, cy + chunkH * 0.9);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const rad = Math.sin(t * Math.PI) * 14;
        ctx.fillStyle = color;
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x + (Math.random() - 0.5) * rad, y + (Math.random() - 0.5) * rad, 3 + Math.random() * 4, 3 + Math.random() * 3);
        }
      });
    },
  },

  {
    id: 'moon-brush-tool',
    name: '10. Real-View Moon & Lunar Crater Texture Brush',
    category: 'textures',
    tagline: 'Photorealistic lunar surface with impact craters, ray ejecta, dark basalt maria & glowing corona',
    description: 'Renders photorealistic lunar celestial spheres and cratered topography. Procedurally generates Tycho/Copernicus radiant impact crater rays, dark basaltic maria seas (Sea of Tranquility), 3D spherical limb falloff, and glowing atmospheric corona.',
    targetSoftware: 'both',
    illustratorType: 'scatter',
    defaultDynamics: {
      size: 70,
      minSize: 20,
      opacity: 95,
      flow: 90,
      hardness: 85,
      spacing: 25,
      angle: 0,
      angleJitter: 360,
      sizeJitter: 20,
      scatter: 10,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 50,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Real-view lunar crater topography', 'Tycho radiant ray ejecta lines', 'Basaltic dark maria seas pattern', '3D spherical limb falloff & glowing corona'],
    photoshopSpecs: {
      tipShape: 'Photorealistic Lunar Disk Stamp 2048px (Crater Elevation & Maria Map)',
      transferMode: 'Size Dynamics: Pen Pressure + Dual Brush Lunar Grain (120px)',
      smoothing: '50% Celestial Orbit Stabilizer',
      recommendedUse: 'Space concept art, sci-fi matte painting, nighttime skies, fantasy celestial bodies',
      jsxPresetLine: 'app.activeDocument.brushes.add("RealView Moon", 70, "LunarCraterMaria");',
    },
    illustratorSpecs: {
      brushKind: 'Scatter Brush (Volumetric Lunar Sphere with Crater Geometries)',
      strokeScaling: 'proportional',
      fidelity: 'Smooth 4.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Vector space art, celestial astronomy illustrations, moon badges',
      svgDefinition: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="moonSphere" cx="45%" cy="45%" r="55%"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#e2e8f0"/><stop offset="85%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></radialGradient><radialGradient id="tychoG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="92" fill="url(#moonSphere)" stroke="#475569" stroke-width="1.5"/><g fill="#334155" opacity="0.65"><ellipse cx="65" cy="65" rx="28" ry="24" transform="rotate(15 65 65)"/><ellipse cx="48" cy="95" rx="26" ry="36" transform="rotate(-10 48 95)"/><ellipse cx="118" cy="72" rx="20" ry="16" transform="rotate(-5 118 72)"/><ellipse cx="136" cy="95" rx="22" ry="18" transform="rotate(25 136 95)"/><ellipse cx="162" cy="78" rx="12" ry="9" transform="rotate(30 162 78)"/><ellipse cx="145" cy="115" rx="18" ry="14" transform="rotate(-15 145 115)"/><ellipse cx="78" cy="132" rx="22" ry="18" transform="rotate(25 78 132)"/></g><g stroke="#ffffff" stroke-opacity="0.75" stroke-width="1"><line x1="92" y1="162" x2="30" y2="120"/><line x1="92" y1="162" x2="40" y2="90"/><line x1="92" y1="162" x2="60" y2="50"/><line x1="92" y1="162" x2="95" y2="30"/><line x1="92" y1="162" x2="135" y2="55"/><line x1="92" y1="162" x2="165" y2="95"/><line x1="92" y1="162" x2="160" y2="140"/><line x1="92" y1="162" x2="120" y2="185"/><line x1="92" y1="162" x2="65" y2="185"/></g><circle cx="92" cy="162" r="14" fill="url(#tychoG)"/><circle cx="92" cy="162" r="3.5" fill="#1e293b" stroke="#ffffff" stroke-width="1.2"/><circle cx="62" cy="95" r="4" fill="#1e293b" stroke="#ffffff" stroke-width="1.2"/><circle cx="48" cy="38" r="3" fill="#1e293b" stroke="#ffffff" stroke-width="1"/><circle cx="160" cy="108" r="3.5" fill="#1e293b" stroke="#ffffff" stroke-width="1"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, pressure, dyn, _color) => {
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const alpha = (dyn.opacity / 100) * (dyn.flow / 100);
      renderRealMoonStamp(ctx, x, y, effSize, alpha);
    },
    drawThumbnail: (ctx, w, h, _color) => {
      const master = getMasterMoonCanvas();
      const drawSize = Math.min(w, h) * 0.95;
      const x = (w - drawSize) / 2;
      const y = (h - drawSize) / 2;
      ctx.drawImage(master, 0, 0, master.width, master.height, x, y, drawSize, drawSize);
    },
  },

  // ==========================================
  // 3. NATURAL MEDIA PAINTING (5 Brushes)
  // ==========================================
  {
    id: 'impasto-oil-knife',
    name: '11. Impasto Oil & Palette Knife',
    category: 'painting',
    tagline: 'Sculptural 3D paint buildup with beveled ridge highlights and thick body',
    description: 'Simulates heavy-body oil paint applied with a flexible steel palette knife. Produces directional ridges, sharp knife edges, and physical impasto volume.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 36,
      minSize: 10,
      opacity: 98,
      flow: 95,
      hardness: 75,
      spacing: 4,
      angle: 35,
      angleJitter: 5,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 55,
      colorJitter: 3,
      blendMode: 'source-over',
    },
    features: ['Thick pigment body', 'Beveled knife edge transitions', 'Sculptural directional stroke', 'Expressive painterly strokes'],
    photoshopSpecs: {
      tipShape: 'Palette Knife Blade 2048px (Beveled Steel Edge)',
      transferMode: 'Mixer Brush Wetness (10%), Load (90%), Mix (80%)',
      smoothing: '55% Impasto Glide',
      recommendedUse: 'Fine art painting, landscape textures, expressive portraits',
      jsxPresetLine: 'app.activeDocument.brushes.add("Impasto Knife", 36, "MixerOilBevel");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Chiseled Palette Knife Vector Stroke)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 4.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Vector fine art paintings, expressive branding illustrations',
      svgDefinition: '<svg viewBox="0 0 400 60"><path d="M0,30 L40,10 L120,8 L280,12 L360,18 L400,30 L360,42 L280,48 L120,52 L40,50 Z" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const dx = x - prevX;
      const dy = y - prevY;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      // Base body stroke
      ctx.lineCap = 'butt';
      ctx.lineWidth = effSize;
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dyn.opacity / 100) * (dyn.flow / 100)})`;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Top ridge highlight (lighter rim)
      ctx.lineWidth = Math.max(1.5, effSize * 0.25);
      const hr = Math.min(255, rgb.r + 45);
      const hg = Math.min(255, rgb.g + 45);
      const hb = Math.min(255, rgb.b + 45);
      ctx.strokeStyle = `rgba(${hr}, ${hg}, ${hb}, 0.75)`;
      ctx.beginPath();
      ctx.moveTo(prevX + nx * (effSize * 0.35), prevY + ny * (effSize * 0.35));
      ctx.lineTo(x + nx * (effSize * 0.35), y + ny * (effSize * 0.35));
      ctx.stroke();

      // Bottom shadow groove (darker ridge)
      const sr = Math.max(0, rgb.r - 40);
      const sg = Math.max(0, rgb.g - 40);
      const sb = Math.max(0, rgb.b - 40);
      ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, 0.6)`;
      ctx.beginPath();
      ctx.moveTo(prevX - nx * (effSize * 0.35), prevY - ny * (effSize * 0.35));
      ctx.lineTo(x - nx * (effSize * 0.35), y - ny * (effSize * 0.35));
      ctx.stroke();

      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      const rgb = hexToRgb(color);
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const rad = Math.sin(t * Math.PI) * 10 + 3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        // Highlight ridge
        const hr = Math.min(255, rgb.r + 50);
        const hg = Math.min(255, rgb.g + 50);
        const hb = Math.min(255, rgb.b + 50);
        ctx.fillStyle = `rgb(${hr}, ${hg}, ${hb})`;
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, rad * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },

  {
    id: 'watercolor-wash-glaze',
    name: '12. Glazing Watercolor Wash',
    category: 'painting',
    tagline: 'Translucent luminous washes with wet dark edge fringing & pigment granulations',
    description: 'Replicates transparent watercolor glazes on cold-press paper. Successive overlapping strokes accumulate density while leaving crisp wet pigment pool borders.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 42,
      minSize: 12,
      opacity: 45,
      flow: 60,
      hardness: 20,
      spacing: 5,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 65,
      colorJitter: 0,
      blendMode: 'multiply',
    },
    features: ['Transparent glazing build-up', 'Wet edge pigment pooling border', 'Cold-press paper texture grain', 'Luminous water diffusion effect'],
    photoshopSpecs: {
      tipShape: 'Soft Mop Watercolor 2048px (Rough Cold-Press Grain)',
      transferMode: 'Wet Edges: Active (100%), Blend Mode: Multiply',
      smoothing: '65% Watercolor Flow',
      recommendedUse: 'Botanical illustration, landscape washes, soft concept art backgrounds',
      jsxPresetLine: 'app.activeDocument.brushes.add("Glazing Watercolor", 42, "WetEdgesWash");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Soft Wash Gradient Edge Profile)',
      strokeScaling: 'proportional',
      fidelity: 'Smooth 5.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Vector watercolor washes, soft editorial backgrounds, organic packaging art',
      svgDefinition: '<svg viewBox="0 0 400 80"><defs><radialGradient id="wcWash" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000" stop-opacity="0.3"/><stop offset="85%" stop-color="#000" stop-opacity="0.6"/><stop offset="100%" stop-color="#000" stop-opacity="0.9"/></radialGradient></defs><ellipse cx="200" cy="40" rx="190" ry="35" fill="url(#wcWash)"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const rad = effSize / 2;
      const alpha = (dyn.opacity / 100) * (dyn.flow / 100) * 0.35;

      // Soft diffused body fill
      const grad = ctx.createRadialGradient(x, y, rad * 0.1, x, y, rad);
      grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
      grad.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.75})`);
      grad.addColorStop(0.92, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 1.6})`);
      grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();

      // Granulation speckle
      ctx.fillStyle = `rgba(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)}, ${alpha * 0.6})`;
      for (let i = 0; i < 4; i++) {
        const offA = Math.random() * Math.PI * 2;
        const offR = Math.random() * rad * 0.8;
        ctx.fillRect(x + Math.cos(offA) * offR, y + Math.sin(offA) * offR, 1.5, 1.5);
      }

      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      const rgb = hexToRgb(color);
      const cx = w / 2;
      const cy = h / 2;
      ctx.save();
      for (let r = 26; r >= 6; r -= 6) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
        grad.addColorStop(0.85, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
        grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx - (26 - r) * 0.4, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
  },

  {
    id: 'gouache-matte-opaque',
    name: '13. Gouache Opaque Matte',
    category: 'painting',
    tagline: 'Velvety flat coverage with chalky matte edges & rich graphic vibrancy',
    description: 'Designed for graphic painters and mid-century editorial illustration. Provides solid opacity, matte texture, and crisp color blocking with minimal blending.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 26,
      minSize: 8,
      opacity: 100,
      flow: 95,
      hardness: 85,
      spacing: 3,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 60,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['100% solid color blocking', 'Chalky velvety matte finish', 'Mid-century editorial aesthetic', 'Crisp perimeter shape control'],
    photoshopSpecs: {
      tipShape: 'Gouache Flat Chisel 2048px (Velvety Edge)',
      transferMode: 'Flow: 95%, Hardness: 85%',
      smoothing: '60% Editorial Precision',
      recommendedUse: 'Book covers, packaging illustration, children book art, poster design',
      jsxPresetLine: 'app.activeDocument.brushes.add("Gouache Matte", 26, "OpaqueFlat");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Flat Gouache Stroke Silhouette)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 3.5',
      colorization: 'Tints',
      recommendedUse: 'Mid-century vector shapes, retro flat-graphic editorial artwork',
      svgDefinition: '<svg viewBox="0 0 300 35"><path d="M0,17 C30,3 80,32 150,32 C220,32 270,4 300,17 C270,30 220,2 150,2 C80,2 30,31 0,17 Z" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = effSize;
      ctx.strokeStyle = color;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const rad = Math.sin(t * Math.PI) * 9 + 3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },

  {
    id: 'acrylic-dry-scumble',
    name: '14. Acrylic Dry-Brushing Scumble',
    category: 'painting',
    tagline: 'Stiff hog bristle streaks with broken dry pigment trails',
    description: 'Emulates stiff synthetic hog bristles loaded with low moisture acrylic. Leaves broken fibrous lines, expressive dry scumbles, and vibrant canvas interaction.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 38,
      minSize: 12,
      opacity: 88,
      flow: 80,
      hardness: 45,
      spacing: 6,
      angle: 20,
      angleJitter: 10,
      sizeJitter: 20,
      scatter: 2,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 40,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Separated bristle fibers', 'Dry broken scumble texture', 'Expressive painterly energy', 'Impressionist brushwork'],
    photoshopSpecs: {
      tipShape: 'Hog Bristle Fan Tip 2048px (Separated Filaments)',
      transferMode: 'Dual Brush (Scrumble Grain 60px)',
      smoothing: '40% Expressive Hand',
      recommendedUse: 'Impressionist paintings, rough concept backgrounds, highlights',
      jsxPresetLine: 'app.activeDocument.brushes.add("Acrylic Dry Brush", 38, "HogBristleFan");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Dry Bristle Multi-Fiber Stroke)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 2.5',
      colorization: 'Tints and Shades',
      recommendedUse: 'Expressive painterly vector strokes and textured backgrounds',
      svgDefinition: '<svg viewBox="0 0 400 45"><path d="M0,10 L400,8 M0,20 L400,22 M0,30 L400,28 M0,38 L400,40" stroke="#000" stroke-width="2.5" stroke-dasharray="15,6,35,8"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const fibers = 8;
      const dx = x - prevX;
      const dy = y - prevY;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      ctx.lineCap = 'butt';
      for (let i = 0; i < fibers; i++) {
        if (Math.random() > 0.15) {
          const off = ((i - (fibers - 1) / 2) / fibers) * effSize;
          const alpha = ((dyn.opacity / 100) * (0.3 + Math.random() * 0.5) * (dyn.flow / 100)).toFixed(2);
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
          ctx.lineWidth = 1.2 + Math.random() * 1.5;
          ctx.beginPath();
          ctx.moveTo(prevX + nx * off, prevY + ny * off);
          ctx.lineTo(x + nx * off, y + ny * off);
          ctx.stroke();
        }
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      const rgb = hexToRgb(color);
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const sz = Math.sin(t * Math.PI) * 10 + 2;
        for (let f = -3; f <= 3; f++) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.3 + Math.random() * 0.4})`;
          ctx.fillRect(x + f * (sz * 0.28), y + f * 1.5, 2, 2);
        }
      });
    },
  },

  {
    id: 'alcohol-marker-blender',
    name: '15. Alcohol Marker Blender',
    category: 'painting',
    tagline: 'Dual-nib chisel flow with seamless paper bleed & rich translucent blending',
    description: 'Faithfully emulates professional Japanese dual-nib alcohol markers (Copic style). Features characteristic streaking on quick passes and seamless translucent tinting.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 28,
      minSize: 10,
      opacity: 60,
      flow: 70,
      hardness: 70,
      spacing: 3,
      angle: 45,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 50,
      colorJitter: 0,
      blendMode: 'multiply',
    },
    features: ['Copic alcohol marker diffusion', 'Chisel flat angle stroke', 'Translucent dye layering', 'Industrial design sketching standard'],
    photoshopSpecs: {
      tipShape: 'Chisel Nib 2048px (45 Degree Angled Slit)',
      transferMode: 'Multiply Mode with Flow Dynamics',
      smoothing: '50% Design Glide',
      recommendedUse: 'Concept art sketching, product design rendering, fashion illustration',
      jsxPresetLine: 'app.activeDocument.brushes.add("Alcohol Marker", 28, "ChiselDyeLayer");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Broad Chisel Ribbon)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 4.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Product sketches, concept fashion vector rendering',
      svgDefinition: '<svg viewBox="0 0 300 40"><path d="M0,35 L20,5 L300,5 L280,35 Z" fill="#000" opacity="0.6"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      ctx.lineCap = 'square';
      ctx.lineWidth = effSize;
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dyn.opacity / 100) * 0.45})`;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      const rgb = hexToRgb(color);
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const rad = Math.sin(t * Math.PI) * 11 + 3;
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
        ctx.fillRect(x - rad / 2, y - rad / 2, rad, rad);
      });
    },
  },

  // ==========================================
  // 4. CALLIGRAPHY & LETTERING (5 Brushes)
  // ==========================================
  {
    id: 'chisel-nib-calligraphy',
    name: '16. Chisel Nib Calligraphy',
    category: 'lettering',
    tagline: '45° angle locked ribbon stroke for classic formal italic & broad-pen scripts',
    description: 'Precision broad-edge calligraphy nib locked to standard 45-degree angle. Creates dramatic contrast between hairline cross strokes and broad vertical stems.',
    targetSoftware: 'both',
    illustratorType: 'calligraphic',
    defaultDynamics: {
      size: 30,
      minSize: 30,
      opacity: 100,
      flow: 100,
      hardness: 95,
      spacing: 1,
      angle: 45,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: false,
      smoothing: 70,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Strict 45° angle orientation', 'Dramatic thick-to-thin ratio', 'Formal Italic & Roman script', 'Sharp crisp cut terminals'],
    photoshopSpecs: {
      tipShape: 'Broad Nib Oval 2048px (Angle 45, Roundness 10%)',
      transferMode: 'Size Off, Angle Fixed (45 deg)',
      smoothing: '70% Calligraphic Flow',
      recommendedUse: 'Formal wedding calligraphy, certificates, traditional lettering',
      jsxPresetLine: 'app.activeDocument.brushes.add("Chisel Calligraphy", 30, "FixedAngle45");',
    },
    illustratorSpecs: {
      brushKind: 'Calligraphic Brush (Angle 45°, Roundness 5%, Size 30pt)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 4.0',
      colorization: 'Tints',
      recommendedUse: 'Vector formal calligraphy, italic lettering logos',
      svgDefinition: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="4" transform="rotate(-45 50 50)" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, _pressure, dyn, color) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      const angleRad = ((dyn.angle || 45) * Math.PI) / 180;
      const cosA = Math.cos(angleRad) * (dyn.size / 2);
      const sinA = Math.sin(angleRad) * (dyn.size / 2);

      ctx.beginPath();
      ctx.moveTo(x - cosA, y - sinA);
      ctx.lineTo(x + cosA, y + sinA);
      ctx.stroke();
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        const cosA = Math.cos((45 * Math.PI) / 180) * 12;
        const sinA = Math.sin((45 * Math.PI) / 180) * 12;
        ctx.beginPath();
        ctx.moveTo(x - cosA, y - sinA);
        ctx.lineTo(x + cosA, y + sinA);
        ctx.stroke();
      });
    },
  },

  {
    id: 'monoline-script-ribbon',
    name: '17. Monoline Script Ribbon',
    category: 'lettering',
    tagline: 'Smooth rounded tubular vector path for modern neon & retro script badges',
    description: 'Perfect for contemporary neon sign lettering, retro badge logos, and clean continuous monoline signatures. Features perfect cylindrical cap curves.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 16,
      minSize: 16,
      opacity: 100,
      flow: 100,
      hardness: 100,
      spacing: 1,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: false,
      smoothing: 85,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['100% constant uniform radius', 'Ultra-high bezier streamline', 'Clean round endcaps', 'Modern script lettering standard'],
    photoshopSpecs: {
      tipShape: 'Hard Round 16px (100% Hardness, 1% Spacing)',
      transferMode: 'Constant Flow, Streamline 85%',
      smoothing: '85% Super Smooth',
      recommendedUse: 'Modern script lettering, apparel emblems, badge monograms',
      jsxPresetLine: 'app.activeDocument.brushes.add("Monoline Ribbon", 16, "SmoothTube");',
    },
    illustratorSpecs: {
      brushKind: 'Uniform Stroke (Round Cap, Round Join 16pt)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 5.0',
      colorization: 'Tints',
      recommendedUse: 'Monoline vector script lettering and badge marks',
      svgDefinition: '<svg viewBox="0 0 100 20"><line x1="10" y1="10" x2="90" y2="10" stroke="#000" stroke-width="16" stroke-linecap="round"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, _pressure, dyn, color) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = dyn.size;
      ctx.strokeStyle = color;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },

  {
    id: 'modern-spring-brush-pen',
    name: '18. Modern Spring Brush Pen',
    category: 'lettering',
    tagline: 'Bouncy flexible brush lettering tip for bouncy quotes & hand-drawn logos',
    description: 'Simulates modern flexible nylon brush pens (Tombow style). Offers ultra-responsive swell transitions on downstrokes and effortless hairline upstrokes.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 24,
      minSize: 3,
      opacity: 100,
      flow: 100,
      hardness: 90,
      spacing: 2,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 75,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Bouncy responsive spring tip', 'Hairline upstroke to bold swell', 'Modern calligraphy quotes', 'Smooth bezier curve smoothing'],
    photoshopSpecs: {
      tipShape: 'Nylon Brush Tip 2048px (Pointed Teardrop)',
      transferMode: 'Size Dynamics: Pen Pressure (100% Modulation)',
      smoothing: '75% Brush Pen Stabilizer',
      recommendedUse: 'Hand-lettered quotes, social media graphics, greeting cards',
      jsxPresetLine: 'app.activeDocument.brushes.add("Modern Brush Pen", 24, "SpringNib");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Pointed Teardrop Profile 3)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 4.5',
      colorization: 'Tints',
      recommendedUse: 'Hand-lettering vector logos and decorative quote artwork',
      svgDefinition: '<svg viewBox="0 0 350 40"><path d="M0,20 Q100,2 180,38 Q260,38 350,20 Q260,2 180,2 Q100,38 0,20 Z" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = effSize;
      ctx.strokeStyle = color;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const rad = Math.sin(t * Math.PI) * 9 + 1.5;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },

  {
    id: 'gothic-blackletter-flat',
    name: '19. Gothic Blackletter Flat Pen',
    category: 'lettering',
    tagline: 'Parallel edge stroke for medieval Fraktur, Textura & modern streetwear marks',
    description: 'Classic medieval parallel pen nib calibrated for Textura Quadrata and Fraktur blackletter calligraphy. Delivers razor-sharp 40-degree diamond serifs.',
    targetSoftware: 'both',
    illustratorType: 'calligraphic',
    defaultDynamics: {
      size: 32,
      minSize: 32,
      opacity: 100,
      flow: 100,
      hardness: 100,
      spacing: 1,
      angle: 40,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: false,
      smoothing: 65,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['40° medieval nib geometry', 'Diamond punctum terminals', 'Fraktur & Textura Gothic scripts', 'Modern streetwear typography'],
    photoshopSpecs: {
      tipShape: 'Gothic Flat Nib 2048px (Angle 40, Roundness 4%)',
      transferMode: 'Size Off, Angle Fixed',
      smoothing: '65% Gothic Precision',
      recommendedUse: 'Blackletter logos, tattoo typography, band apparel lettering',
      jsxPresetLine: 'app.activeDocument.brushes.add("Gothic Blackletter", 32, "FrakturAngle40");',
    },
    illustratorSpecs: {
      brushKind: 'Calligraphic Brush (Angle 40°, Roundness 3%, Size 32pt)',
      strokeScaling: 'stretch',
      fidelity: 'Accurate 2.0',
      colorization: 'Tints',
      recommendedUse: 'Vector blackletter typography, tattoo lettering graphics',
      svgDefinition: '<svg viewBox="0 0 100 100"><rect x="10" y="47" width="80" height="6" transform="rotate(-40 50 50)" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, _pressure, dyn, color) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      const angleRad = ((dyn.angle || 40) * Math.PI) / 180;
      const cosA = Math.cos(angleRad) * (dyn.size / 2);
      const sinA = Math.sin(angleRad) * (dyn.size / 2);

      ctx.beginPath();
      ctx.moveTo(x - cosA, y - sinA);
      ctx.lineTo(x + cosA, y + sinA);
      ctx.stroke();
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        const cosA = Math.cos((40 * Math.PI) / 180) * 14;
        const sinA = Math.sin((40 * Math.PI) / 180) * 14;
        ctx.beginPath();
        ctx.moveTo(x - cosA, y - sinA);
        ctx.lineTo(x + cosA, y + sinA);
        ctx.stroke();
      });
    },
  },

  {
    id: 'neon-cyber-glow-tube',
    name: '20. Neon Cyber Glow Tube',
    category: 'lettering',
    tagline: 'Multi-layer luminous core with vibrant ambient light halo falloff',
    description: 'Creates hyper-luminous 80s neon tube typography and cyberpunk light trails. Features a brilliant pure white optical core enveloped in multi-stage colored ambient glows.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 22,
      minSize: 8,
      opacity: 100,
      flow: 100,
      hardness: 60,
      spacing: 2,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 80,
      colorJitter: 0,
      blendMode: 'screen',
    },
    features: ['Hyper-luminous white hot center', 'Soft colored ambient halo', 'Screen & Linear Dodge glow', 'Cyberpunk & synthwave lettering'],
    photoshopSpecs: {
      tipShape: 'Neon Glow Core 2048px (Soft Outer Diffusion)',
      transferMode: 'Blending: Linear Dodge (Add) or Screen',
      smoothing: '80% Smooth Glass Bend',
      recommendedUse: 'Cyberpunk neon signs, night club flyers, sci-fi HUD lettering',
      jsxPresetLine: 'app.activeDocument.brushes.add("Neon Glow Tube", 22, "ScreenLuminousHalo");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Multi-Stroke Radial Luminous Glow Profile)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 5.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Vector neon signs and synthwave logo artwork',
      svgDefinition: '<svg viewBox="0 0 300 40"><line x1="0" y1="20" x2="300" y2="20" stroke="#000" stroke-width="24" opacity="0.25" stroke-linecap="round"/><line x1="0" y1="20" x2="300" y2="20" stroke="#000" stroke-width="12" opacity="0.6" stroke-linecap="round"/><line x1="0" y1="20" x2="300" y2="20" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));

      // Layer 1: Ambient wide soft halo
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = effSize * 2.2;
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Layer 2: Vivid color glow
      ctx.lineWidth = effSize * 1.2;
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Layer 3: Hot white center core
      ctx.lineWidth = Math.max(2, effSize * 0.35);
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      const rgb = hexToRgb(color);
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        // Outer halo
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
        // Inner vivid
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        // White core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },

  // ==========================================
  // 5. PATTERNS & BORDERS (5 Brushes)
  // ==========================================
  {
    id: 'braided-rope-cable',
    name: '21. Braided Nautical Rope & Cable',
    category: 'decorative',
    tagline: 'Interlocking seamless helical woven vector rope & heavy marine cable',
    description: 'Generates continuous interlocking twisted strands of nautical rope, industrial wire ropes, and braided trim along any freeform vector path.',
    targetSoftware: 'both',
    illustratorType: 'pattern',
    defaultDynamics: {
      size: 26,
      minSize: 10,
      opacity: 100,
      flow: 100,
      hardness: 90,
      spacing: 14,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 70,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Seamless helical strand repeat', 'Twisted yarn fiber details', 'Nautical & marine border graphics', 'Corner auto-miter in Illustrator'],
    photoshopSpecs: {
      tipShape: 'Rope Segment Stamp 2048px (Directional Helical Strand)',
      transferMode: 'Angle: Direction / Initial Direction',
      smoothing: '70% Cable Stabilizer',
      recommendedUse: 'Nautical framing borders, maritime logos, pirate & naval graphics',
      jsxPresetLine: 'app.activeDocument.brushes.add("Nautical Rope", 26, "HelicalInterlock");',
    },
    illustratorSpecs: {
      brushKind: 'Pattern Brush (Seamless Rope Weave Tile)',
      strokeScaling: 'tile',
      fidelity: 'Smooth 4.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Continuous vector rope borders, maritime branding emblems',
      svgDefinition: '<svg viewBox="0 0 60 30"><path d="M0,15 Q15,0 30,15 Q45,30 60,15" stroke="#000" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M0,15 Q15,30 30,15 Q45,0 60,15" stroke="#000" stroke-width="8" stroke-linecap="round" fill="none"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const dx = x - prevX;
      const dy = y - prevY;
      const angle = Math.atan2(dy, dx);
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);

      // Draw slanted interlocking oval link
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dyn.opacity / 100) * (dyn.flow / 100)})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, effSize * 0.45, effSize * 0.28, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(0,0,0,0.4)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 3.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },

  {
    id: 'celtic-knotwork-ribbon',
    name: '22. Celtic Knotwork Ribbon',
    category: 'decorative',
    tagline: 'Seamless geometric over-under interlaced ribbon weaves',
    description: 'Produces intricate Celtic interlacing borders with authentic over-under path crossovers. Perfect for heraldic crests, fantasy cartography, and Irish cultural graphics.',
    targetSoftware: 'both',
    illustratorType: 'pattern',
    defaultDynamics: {
      size: 32,
      minSize: 15,
      opacity: 100,
      flow: 100,
      hardness: 95,
      spacing: 16,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 75,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Authentic over-under crossover math', 'Geometric knotwork repetition', 'Fantasy cartography borders', 'Heraldic trim standard'],
    photoshopSpecs: {
      tipShape: 'Celtic Knot Stamp 2048px (Interlacing Plait)',
      transferMode: 'Angle: Direction Lock',
      smoothing: '75% Geometric Glide',
      recommendedUse: 'Fantasy map borders, medieval crests, Celtic tattoo art',
      jsxPresetLine: 'app.activeDocument.brushes.add("Celtic Knotwork", 32, "OverUnderPlait");',
    },
    illustratorSpecs: {
      brushKind: 'Pattern Brush (Celtic Knot Repeating Tile with Corner Tiles)',
      strokeScaling: 'tile',
      fidelity: 'Accurate 2.0',
      colorization: 'Tints',
      recommendedUse: 'Vector Celtic frames, book illumination borders, craft laser engraving',
      svgDefinition: '<svg viewBox="0 0 80 40"><path d="M0,20 C20,0 20,40 40,20 C60,0 60,40 80,20" stroke="#000" stroke-width="6" fill="none"/><path d="M0,20 C20,40 20,0 40,20 C60,40 60,0 80,20" stroke="#000" stroke-width="6" fill="none"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const dx = x - prevX;
      const dy = y - prevY;
      const angle = Math.atan2(dy, dx);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.strokeStyle = color;
      ctx.lineWidth = effSize * 0.25;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-effSize * 0.2, 0, effSize * 0.3, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(effSize * 0.2, 0, effSize * 0.3, Math.PI / 2, -Math.PI / 2);
      ctx.stroke();

      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI);
        ctx.stroke();
      });
    },
  },

  {
    id: 'art-deco-filigree-border',
    name: '23. Art Deco Filigree Border',
    category: 'decorative',
    tagline: '1920s Gatsby luxury geometric chevron & sunburst repeating trims',
    description: 'Recreates the opulent roaring twenties Art Deco aesthetic with repeating chevrons, geometric fan sunbursts, and stepped linear trims for luxury brand packaging.',
    targetSoftware: 'both',
    illustratorType: 'pattern',
    defaultDynamics: {
      size: 38,
      minSize: 18,
      opacity: 100,
      flow: 100,
      hardness: 95,
      spacing: 20,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 60,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Geometric chevron & fan sunburst', '1920s Great Gatsby luxury vibe', 'Stepped corner trim alignment', 'Premium liquor & cosmetics packaging'],
    photoshopSpecs: {
      tipShape: 'Art Deco Fan Stamp 2048px (Stepped Chevron)',
      transferMode: 'Angle: Direction Lock',
      smoothing: '60% Architectural Precision',
      recommendedUse: 'Luxury liquor labels, wedding invitations, vintage speakeasy menus',
      jsxPresetLine: 'app.activeDocument.brushes.add("Art Deco Filigree", 38, "DecoChevronTile");',
    },
    illustratorSpecs: {
      brushKind: 'Pattern Brush (Art Deco Sunburst Chevron Repeating Border)',
      strokeScaling: 'tile',
      fidelity: 'Accurate 1.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Luxury vector packaging frames, gold foil stamp borders',
      svgDefinition: '<svg viewBox="0 0 60 40"><path d="M0,40 L30,5 L60,40 M10,40 L30,15 L50,40 M20,40 L30,25 L40,40" stroke="#000" stroke-width="2.5" fill="none"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const dx = x - prevX;
      const dy = y - prevY;
      const angle = Math.atan2(dy, dx);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-effSize * 0.4, -effSize * 0.3);
      ctx.lineTo(0, effSize * 0.35);
      ctx.lineTo(effSize * 0.4, -effSize * 0.3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-effSize * 0.25, -effSize * 0.3);
      ctx.lineTo(0, effSize * 0.15);
      ctx.lineTo(effSize * 0.25, -effSize * 0.3);
      ctx.stroke();

      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 6);
        ctx.lineTo(x, y + 6);
        ctx.lineTo(x + 5, y - 6);
        ctx.stroke();
      });
    },
  },

  {
    id: 'guilloche-spirograph-wave',
    name: '24. Guilloche Spirograph Wave',
    category: 'decorative',
    tagline: 'Harmonic mathematical oscillating waves for bank security & guilloche certificates',
    description: 'Generates complex harmonic mathematical waveforms and interlocking spirograph rosettes modeled after security printing on currency, passports, and stock certificates.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 40,
      minSize: 15,
      opacity: 90,
      flow: 90,
      hardness: 90,
      spacing: 2,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 60,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Multi-frequency sine harmonic waves', 'Anti-counterfeit banknote look', 'Mathematical precision ribbons', 'Symmetric decorative crests'],
    photoshopSpecs: {
      tipShape: 'Guilloche Wave Ribbon 2048px (Multi-Harmonic Sinusoid)',
      transferMode: 'Size Dynamics: Pen Pressure',
      smoothing: '60% Harmonic Glide',
      recommendedUse: 'Certificate diplomas, currency design, security guilloche patterns',
      jsxPresetLine: 'app.activeDocument.brushes.add("Guilloche Spirograph", 40, "HarmonicSineWave");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Guilloche Complex Sine Oscillator Vector)',
      strokeScaling: 'stretch',
      fidelity: 'Accurate 1.5',
      colorization: 'Tints',
      recommendedUse: 'High security vector certificates, diploma borders, banknote graphics',
      svgDefinition: '<svg viewBox="0 0 400 60"><path d="M0,30 Q50,5 100,30 T200,30 T300,30 T400,30" stroke="#000" stroke-width="1.5" fill="none"/><path d="M0,30 Q50,55 100,30 T200,30 T300,30 T400,30" stroke="#000" stroke-width="1.5" fill="none"/><path d="M0,30 Q25,10 50,30 T100,30 T150,30 T200,30 T250,30 T300,30 T350,30 T400,30" stroke="#000" stroke-width="1" fill="none"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color, time) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const dx = x - prevX;
      const dy = y - prevY;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dyn.opacity / 100) * 0.7})`;
      ctx.lineWidth = 1.2;

      for (let wave = -2; wave <= 2; wave++) {
        const freq = time * 0.08 + wave * 0.8;
        const amp = (effSize / 2) * Math.sin(freq);
        ctx.beginPath();
        ctx.moveTo(prevX + nx * amp, prevY + ny * amp);
        ctx.lineTo(x + nx * amp, y + ny * amp);
        ctx.stroke();
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        const off1 = Math.sin(t * Math.PI * 8) * 6;
        const off2 = Math.cos(t * Math.PI * 8) * 6;
        ctx.beginPath();
        ctx.moveTo(x - off1, y - off2);
        ctx.lineTo(x + off1, y + off2);
        ctx.stroke();
      });
    },
  },

  {
    id: 'botanical-foliage-scatter',
    name: '25. Botanical Foliage & Ivy Scatter',
    category: 'decorative',
    tagline: 'Procedural leaf clusters, blooming florets & trailing organic vine strands',
    description: 'Instantly paints living botanical garlands, lush forest ivy, and organic floral wreaths with dynamic leaf rotation and natural size variation along your stroke.',
    targetSoftware: 'both',
    illustratorType: 'scatter',
    defaultDynamics: {
      size: 34,
      minSize: 12,
      opacity: 95,
      flow: 90,
      hardness: 85,
      spacing: 18,
      angle: 0,
      angleJitter: 60,
      sizeJitter: 35,
      scatter: 25,
      scatterCount: 3,
      pressureEnabled: true,
      smoothing: 65,
      colorJitter: 8,
      blendMode: 'source-over',
    },
    features: ['Dynamic leaf angle rotation', 'Floret & botanical scatter', 'Natural organic size variation', 'Wedding invitations & floral borders'],
    photoshopSpecs: {
      tipShape: 'Botanical Leaf Stamp 2048px (Monstera & Laurel Leaf)',
      transferMode: 'Scatter (120%), Angle: Direction Jitter (30%)',
      smoothing: '65% Garden Glide',
      recommendedUse: 'Botanical wedding crests, nature illustrations, tea packaging',
      jsxPresetLine: 'app.activeDocument.brushes.add("Botanical Foliage", 34, "LeafScatterJitter");',
    },
    illustratorSpecs: {
      brushKind: 'Scatter Brush (Random Leaf Size 60-120%, Random Rotation ±45°)',
      strokeScaling: 'proportional',
      fidelity: 'Smooth 4.0',
      colorization: 'Hue Shift',
      recommendedUse: 'Vector floral wreaths, botanical garland packaging',
      svgDefinition: '<svg viewBox="0 0 100 100"><path d="M50,10 C20,30 20,70 50,90 C80,70 80,30 50,10 Z M50,15 L50,85" stroke="#000" stroke-width="3" fill="#000" fill-opacity="0.8"/><path d="M15,50 C30,35 45,45 50,50 C45,55 30,65 15,50 Z" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const dx = x - prevX;
      const dy = y - prevY;
      const baseAngle = Math.atan2(dy, dx);
      const count = 2;

      for (let i = 0; i < count; i++) {
        const offX = (Math.random() - 0.5) * (effSize * 0.8);
        const offY = (Math.random() - 0.5) * (effSize * 0.8);
        const leafAngle = baseAngle + ((Math.random() - 0.5) * dyn.angleJitter * Math.PI) / 180;
        const leafLen = effSize * (0.5 + Math.random() * 0.4);

        ctx.save();
        ctx.translate(x + offX, y + offY);
        ctx.rotate(leafAngle);

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dyn.opacity / 100) * (dyn.flow / 100)})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(leafLen * 0.5, -leafLen * 0.4, leafLen, 0);
        ctx.quadraticCurveTo(leafLen * 0.5, leafLen * 0.4, 0, 0);
        ctx.fill();

        ctx.restore();
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 7, 3.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },

  // ==========================================
  // 6. VFX & CONCEPT ART (5 Brushes)
  // ==========================================
  {
    id: 'cloud-brush-tool',
    name: '26. Volumetric Real-View Fluffy Cloud & Vapor Brush',
    category: 'vfx',
    tagline: 'Multi-octave cumulus billow clusters with cotton fluff texture, sunlight scatter & atmospheric depth',
    description: 'Paints realistic 3D volumetric cumulus clouds, fluffy cotton vapor billows, and airy atmospheric mist. Procedurally builds layered cloud density with illuminated sunlit puffy crowns, soft ambient undersides, and micro-vapor wisps.',
    targetSoftware: 'both',
    illustratorType: 'scatter',
    defaultDynamics: {
      size: 75,
      minSize: 30,
      opacity: 65,
      flow: 60,
      hardness: 20,
      spacing: 16,
      angle: 0,
      angleJitter: 360,
      sizeJitter: 35,
      scatter: 25,
      scatterCount: 5,
      pressureEnabled: true,
      smoothing: 55,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Multi-octave volumetric cumulus billows', 'Soft cotton fluff perimeter micro-vapor', 'Sunlit top highlight & ambient belly shading', 'Aerial atmospheric depth & cloud layering'],
    photoshopSpecs: {
      tipShape: 'Volumetric Cumulus Puff Stamp 2048px (Layered Noise Billow)',
      transferMode: 'Dual Brush (Cloud Noise 250px) + Wet Edge Feathering',
      smoothing: '55% Cloud Glide Stream',
      recommendedUse: 'Sky paintings, matte backgrounds, concept landscapes, atmospheric vapor',
      jsxPresetLine: 'app.activeDocument.brushes.add("RealView Cloud", 75, "CumulusBillowVolume");',
    },
    illustratorSpecs: {
      brushKind: 'Scatter Brush (Multi-Puff Volumetric Cloud Radial Clusters)',
      strokeScaling: 'proportional',
      fidelity: 'Smooth 4.5',
      colorization: 'Tints and Shades',
      recommendedUse: 'Vector cloudscapes, dreamy sky backgrounds, fantasy weather art',
      svgDefinition: '<svg viewBox="0 0 160 100"><ellipse cx="50" cy="65" rx="35" ry="25" fill="#e2e8f0" opacity="0.6"/><ellipse cx="110" cy="65" rx="38" ry="25" fill="#cbd5e1" opacity="0.5"/><ellipse cx="80" cy="45" rx="42" ry="32" fill="#f8fafc" opacity="0.9"/><ellipse cx="55" cy="40" rx="28" ry="22" fill="#ffffff" opacity="0.95"/><circle cx="100" cy="42" r="26" fill="#f1f5f9" opacity="0.85"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, pressure, dyn, _color) => {
      ctx.save();
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const rad = effSize / 2;
      const alpha = (dyn.opacity / 100) * (dyn.flow / 100);

      // 1. Ambient Underside Cloud Belly Shading (Fixed Natural Slate-Blue Aerial Atmosphere)
      const shadowPuffs = 4;
      for (let i = 0; i < shadowPuffs; i++) {
        const sx = x + (Math.random() - 0.5) * (rad * 0.85);
        const sy = y + rad * (0.18 + Math.random() * 0.38);
        const sr = rad * (0.55 + Math.random() * 0.45);

        const sGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
        // Realistic atmospheric shadow tone (Slate gray-blue)
        sGrad.addColorStop(0, `rgba(71, 85, 105, ${alpha * 0.52})`);
        sGrad.addColorStop(0.5, `rgba(100, 116, 139, ${alpha * 0.35})`);
        sGrad.addColorStop(0.8, `rgba(148, 163, 184, ${alpha * 0.15})`);
        sGrad.addColorStop(1, `rgba(148, 163, 184, 0)`);

        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Primary Volumetric Cumulus Billows (Fluffy Multi-Puff Dense Body)
      const primaryPuffs = 6;
      for (let i = 0; i < primaryPuffs; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * (rad * 0.52);
        const px = x + Math.cos(ang) * dist;
        const py = y + Math.sin(ang) * dist;
        const pr = rad * (0.5 + Math.random() * 0.52);

        // Volumetric billow gradient
        const bGrad = ctx.createRadialGradient(px - pr * 0.22, py - pr * 0.22, 0, px, py, pr);
        bGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
        bGrad.addColorStop(0.4, `rgba(248, 250, 252, ${alpha * 0.85})`);
        bGrad.addColorStop(0.75, `rgba(226, 232, 240, ${alpha * 0.55})`);
        bGrad.addColorStop(0.92, `rgba(203, 213, 225, ${alpha * 0.2})`);
        bGrad.addColorStop(1, `rgba(203, 213, 225, 0)`);

        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Sunlit Cloud Top Highlights (Luminous Pure White Crowns facing upper sky)
      const highlightPuffs = 4;
      for (let i = 0; i < highlightPuffs; i++) {
        const hx = x + (Math.random() - 0.5) * (rad * 0.75);
        const hy = y - rad * (0.18 + Math.random() * 0.38);
        const hr = rad * (0.38 + Math.random() * 0.42);

        const hGrad = ctx.createRadialGradient(hx - hr * 0.28, hy - hr * 0.28, 0, hx, hy, hr);
        hGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.98})`);
        hGrad.addColorStop(0.55, `rgba(255, 255, 255, ${alpha * 0.75})`);
        hGrad.addColorStop(0.85, `rgba(241, 245, 249, ${alpha * 0.25})`);
        hGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Micro Cotton-Fluff Perimeter Particles (Airy Vapor Texture)
      const fluffCount = 16;
      for (let i = 0; i < fluffCount; i++) {
        const fang = Math.random() * Math.PI * 2;
        const fdist = rad * (0.68 + Math.random() * 0.52);
        const fx = x + Math.cos(fang) * fdist;
        const fy = y + Math.sin(fang) * fdist;
        const fr = 2 + Math.random() * (rad * 0.18);

        const fGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
        fGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.65})`);
        fGrad.addColorStop(0.6, `rgba(241, 245, 249, ${alpha * 0.35})`);
        fGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, _color) => {
      const cx = w / 2;
      const cy = h / 2 + 2;

      ctx.save();
      // Multi-puff cloud shape in fixed natural silver-white & slate cumulus shades
      const puffs = [
        { x: cx - 22, y: cy + 6, r: 16, a: 0.7, color: 'rgba(100, 116, 139, 0.45)' },
        { x: cx + 24, y: cy + 6, r: 18, a: 0.7, color: 'rgba(100, 116, 139, 0.45)' },
        { x: cx, y: cy + 8, r: 16, a: 0.65, color: 'rgba(148, 163, 184, 0.5)' },
        { x: cx - 12, y: cy - 4, r: 20, a: 0.95, color: '#ffffff' },
        { x: cx + 12, y: cy - 2, r: 18, a: 0.9, color: '#f8fafc' },
        { x: cx - 2, y: cy - 8, r: 16, a: 1, color: '#ffffff' },
      ];

      for (const p of puffs) {
        const grad = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, p.r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.6, p.color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
  },

  {
    id: 'anamorphic-lens-flare',
    name: '27. Anamorphic Lens Flare & Glint',
    category: 'vfx',
    tagline: 'Horizontal cinematic streak rays with prismatic center starbursts',
    description: 'Generates Hollywood cinema-style anamorphic blue streaks, optical starburst glints, and brilliant specular weapon highlights for cinematic posters.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 50,
      minSize: 20,
      opacity: 100,
      flow: 90,
      hardness: 70,
      spacing: 8,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 20,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 60,
      colorJitter: 0,
      blendMode: 'lighter',
    },
    features: ['Anamorphic cinema streak', 'Optical starburst glints', 'Specular jewel highlights', 'Additive color blending (Linear Dodge)'],
    photoshopSpecs: {
      tipShape: 'Anamorphic Streak Flare 2048px (Horizontal Optical Streak)',
      transferMode: 'Linear Dodge (Add) Mode + Glow Intensity',
      smoothing: '60% Cinema Tracking',
      recommendedUse: 'Movie posters, sci-fi spacecraft engines, jewelry sparkle highlights',
      jsxPresetLine: 'app.activeDocument.brushes.add("Anamorphic Flare", 50, "CinematicStreak");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Horizontal Optical Ray Glint Flare Profile)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 4.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Vector cinematic lighting, jewelry glints, luxury logos',
      svgDefinition: '<svg viewBox="0 0 400 50"><ellipse cx="200" cy="25" rx="190" ry="2" fill="#000" opacity="0.4"/><ellipse cx="200" cy="25" rx="60" ry="6" fill="#000" opacity="0.8"/><circle cx="200" cy="25" r="8" fill="#fff"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const streakLen = effSize * 2.8;

      // Horizontal streak
      const gradH = ctx.createLinearGradient(x - streakLen, y, x + streakLen, y);
      gradH.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
      gradH.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
      gradH.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      ctx.strokeStyle = gradH;
      ctx.lineWidth = Math.max(1.5, effSize * 0.12);
      ctx.beginPath();
      ctx.moveTo(x - streakLen, y);
      ctx.lineTo(x + streakLen, y);
      ctx.stroke();

      // Vertical mini glint
      const gradV = ctx.createLinearGradient(x, y - effSize * 0.8, x, y + effSize * 0.8);
      gradV.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
      gradV.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
      gradV.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      ctx.strokeStyle = gradV;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y - effSize * 0.8);
      ctx.lineTo(x, y + effSize * 0.8);
      ctx.stroke();

      // White center star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.5, effSize * 0.1), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x - 12, y);
        ctx.lineTo(x + 12, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x, y + 6);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },

  {
    id: 'dynamic-spark-ember',
    name: '28. Dynamic Spark & Fire Ember',
    category: 'vfx',
    tagline: 'Turbulent floating luminous embers, hot fire sparks & magical sparkles',
    description: 'Paints realistic hot welding sparks, campfire embers rising on thermal air currents, and golden magical fairy dust with dynamic size variation and glowing trails.',
    targetSoftware: 'both',
    illustratorType: 'scatter',
    defaultDynamics: {
      size: 40,
      minSize: 15,
      opacity: 100,
      flow: 90,
      hardness: 80,
      spacing: 12,
      angle: 0,
      angleJitter: 180,
      sizeJitter: 60,
      scatter: 60,
      scatterCount: 8,
      pressureEnabled: true,
      smoothing: 40,
      colorJitter: 15,
      blendMode: 'lighter',
    },
    features: ['Turbulent thermal particle drift', 'Additive glowing embers', 'Micro spark streaks', 'Magic fairy dust & pyrotechnics'],
    photoshopSpecs: {
      tipShape: 'Ember Sparkle Tip 2048px (Diamond Hot Spot)',
      transferMode: 'Scatter (300%), Color Dynamics: Hue Jitter (15%)',
      smoothing: '40% Particle Stream',
      recommendedUse: 'Fantasy magic spells, campfire scenes, welding metal sparks',
      jsxPresetLine: 'app.activeDocument.brushes.add("Fire Embers", 40, "ThermalSparkScatter");',
    },
    illustratorSpecs: {
      brushKind: 'Scatter Brush (Random Size 30-140%, Random Scatter 120%)',
      strokeScaling: 'proportional',
      fidelity: 'Smooth 3.0',
      colorization: 'Hue Shift',
      recommendedUse: 'Vector fantasy magic particles, pyrotechnic poster effects',
      svgDefinition: '<svg viewBox="0 0 100 100"><circle cx="20" cy="20" r="3" fill="#000"/><circle cx="50" cy="35" r="5" fill="#000"/><circle cx="80" cy="25" r="2" fill="#000"/><circle cx="35" cy="70" r="4" fill="#000"/><circle cx="65" cy="80" r="3.5" fill="#000"/><path d="M50,45 L52,55 L50,65 L48,55 Z" fill="#000"/></svg>',
    },
    renderEngine: (ctx, x, y, _prevX, _prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const rad = (dyn.size / 2) * (dyn.pressureEnabled ? pressure : 1);
      const count = dyn.scatterCount;

      for (let i = 0; i < count; i++) {
        const px = x + (Math.random() - 0.5) * rad * 2;
        const py = y + (Math.random() - 0.5) * rad * 2;
        const sparkR = 1 + Math.random() * 2.8;

        // Ember halo
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
        ctx.beginPath();
        ctx.arc(px, py, sparkR * 2, 0, Math.PI * 2);
        ctx.fill();

        // White core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, sparkR * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      const rgb = hexToRgb(color);
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, _t, x, y) => {
        for (let i = 0; i < 3; i++) {
          const px = x + (Math.random() - 0.5) * 14;
          const py = y + (Math.random() - 0.5) * 14;
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    },
  },

  {
    id: 'fur-hair-grooming-comb',
    name: '29. Fur & Hair Grooming Comb',
    category: 'vfx',
    tagline: 'Multi-strand organic micro-fiber flow for animal fur, hair & eyelashes',
    description: 'Paints parallel strands of flowing animal pelt fur, human hair locks, and delicate feathered eyelashes with organic length and direction jitter.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 32,
      minSize: 10,
      opacity: 90,
      flow: 85,
      hardness: 65,
      spacing: 5,
      angle: 0,
      angleJitter: 5,
      sizeJitter: 15,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 60,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['Multi-tine hair comb profile', 'Organic strand curvature', 'Animal pelt & grooming brush', 'Hairline eyelash precision'],
    photoshopSpecs: {
      tipShape: 'Hair Comb Multi-Strand Tip 2048px (12 Tine Filament)',
      transferMode: 'Size Dynamics: Pen Pressure',
      smoothing: '60% Hair Grooming Flow',
      recommendedUse: 'Creature concept art, realistic animal fur painting, portrait hair',
      jsxPresetLine: 'app.activeDocument.brushes.add("Hair Grooming Comb", 32, "MultiTineStrands");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (Multi-Strand Hair Fiber Bundle)',
      strokeScaling: 'stretch',
      fidelity: 'Smooth 4.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Vector hair locks, animal mascot fur details',
      svgDefinition: '<svg viewBox="0 0 350 40"><path d="M0,5 Q150,0 350,15 M0,15 Q170,12 350,20 M0,25 Q180,26 350,25 M0,35 Q190,38 350,30" stroke="#000" stroke-width="1.8" fill="none"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const rgb = hexToRgb(color);
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const tines = 7;
      const dx = x - prevX;
      const dy = y - prevY;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      ctx.lineCap = 'round';
      for (let i = 0; i < tines; i++) {
        const off = ((i - (tines - 1) / 2) / tines) * effSize;
        const alpha = ((dyn.opacity / 100) * (0.35 + Math.random() * 0.45) * (dyn.flow / 100)).toFixed(2);
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.lineWidth = Math.max(1, (effSize / tines) * 0.6);
        ctx.beginPath();
        ctx.moveTo(prevX + nx * off, prevY + ny * off);
        ctx.lineTo(x + nx * off, y + ny * off);
        ctx.stroke();
      }
      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const sz = Math.sin(t * Math.PI) * 8 + 2;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(x + k * (sz * 0.3), y - 3);
          ctx.lineTo(x + k * (sz * 0.3) + 2, y + 3);
          ctx.stroke();
        }
      });
    },
  },

  {
    id: 'synthwave-cyber-grid',
    name: '30. Synthwave Cyber Grid & Wireframe',
    category: 'vfx',
    tagline: 'Multi-lane vector perspective highway grid coordinate ribbons',
    description: 'Draws retro 80s synthwave perspective wireframe grids, tron cyberspace speed trails, and coordinate wireframe tunnels for retro-futuristic artworks.',
    targetSoftware: 'both',
    illustratorType: 'art',
    defaultDynamics: {
      size: 36,
      minSize: 14,
      opacity: 95,
      flow: 90,
      hardness: 95,
      spacing: 4,
      angle: 0,
      angleJitter: 0,
      sizeJitter: 0,
      scatter: 0,
      scatterCount: 1,
      pressureEnabled: true,
      smoothing: 70,
      colorJitter: 0,
      blendMode: 'source-over',
    },
    features: ['5-lane parallel wireframe ribbon', 'Cross-rung perspective markers', '80s Outrun synthwave vibe', 'Vector cyberspace speed tracks'],
    photoshopSpecs: {
      tipShape: 'Cyber Grid Track Tip 2048px (Parallel Multi-Lane Ribbon)',
      transferMode: 'Size Dynamics: Pen Pressure',
      smoothing: '70% Grid Stabilizer',
      recommendedUse: 'Synthwave album covers, 80s retro sci-fi illustrations, game HUDs',
      jsxPresetLine: 'app.activeDocument.brushes.add("Synthwave Grid", 36, "CyberLaneRibbon");',
    },
    illustratorSpecs: {
      brushKind: 'Art Brush (5-Lane Cyber Wireframe Track Profile)',
      strokeScaling: 'stretch',
      fidelity: 'Accurate 2.0',
      colorization: 'Tints and Shades',
      recommendedUse: 'Vector synthwave grids, retro game speed tracks',
      svgDefinition: '<svg viewBox="0 0 350 40"><line x1="0" y1="5" x2="350" y2="5" stroke="#000" stroke-width="2"/><line x1="0" y1="15" x2="350" y2="15" stroke="#000" stroke-width="2"/><line x1="0" y1="25" x2="350" y2="25" stroke="#000" stroke-width="2"/><line x1="0" y1="35" x2="350" y2="35" stroke="#000" stroke-width="2"/><line x1="50" y1="5" x2="50" y2="35" stroke="#000" stroke-width="1.5"/><line x1="150" y1="5" x2="150" y2="35" stroke="#000" stroke-width="1.5"/><line x1="250" y1="5" x2="250" y2="35" stroke="#000" stroke-width="1.5"/></svg>',
    },
    renderEngine: (ctx, x, y, prevX, prevY, pressure, dyn, color) => {
      ctx.save();
      const effSize = Math.max(dyn.minSize, dyn.size * (dyn.pressureEnabled ? pressure : 1));
      const dx = x - prevX;
      const dy = y - prevY;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      ctx.strokeStyle = color;
      ctx.globalAlpha = (dyn.opacity / 100) * (dyn.flow / 100);
      ctx.lineWidth = 1.4;

      // 4 parallel rail lines
      for (let rail = -2; rail <= 2; rail++) {
        const off = (rail / 2) * (effSize / 2);
        ctx.beginPath();
        ctx.moveTo(prevX + nx * off, prevY + ny * off);
        ctx.lineTo(x + nx * off, y + ny * off);
        ctx.stroke();
      }

      ctx.restore();
    },
    drawThumbnail: (ctx, w, h, color) => {
      drawBaseStrokeThumbnail(ctx, w, h, color, (_c, t, x, y) => {
        const sz = Math.sin(t * Math.PI) * 9 + 2;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - sz / 2, y - 4);
        ctx.lineTo(x + sz / 2, y + 4);
        ctx.stroke();
      });
    },
  },
];
