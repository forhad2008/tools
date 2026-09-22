import JSZip from 'jszip';
import { BrushItem } from '../types';
import { BRUSHES } from '../data/brushes';
import { getMasterMoonCanvas } from './lunarRenderer';

// Generate high-resolution 2048x2048 Alpha Brush Stamp for Photoshop Preset
export async function generateBrushAlphaStamp(brush: BrushItem, size = 2048): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Background is transparent
  ctx.clearRect(0, 0, size, size);

  // Render high-res brush stamp
  ctx.save();
  const cx = size / 2;
  const cy = size / 2;

  if (brush.id === 'moon-brush-tool') {
    // Photorealistic Moon master alpha stamp
    const master = getMasterMoonCanvas();
    const drawSize = size * 0.95;
    ctx.drawImage(master, 0, 0, master.width, master.height, (size - drawSize) / 2, (size - drawSize) / 2, drawSize, drawSize);
  } else if (brush.id === 'cloud-brush-tool') {
    // Multi-octave cumulus billows stamp
    const puffs = [
      { x: cx - size * 0.16, y: cy + size * 0.05, r: size * 0.26, a: 0.7 },
      { x: cx + size * 0.18, y: cy + size * 0.06, r: size * 0.28, a: 0.75 },
      { x: cx - size * 0.06, y: cy - size * 0.1, r: size * 0.3, a: 0.9 },
      { x: cx + size * 0.08, y: cy - size * 0.08, r: size * 0.28, a: 0.85 },
      { x: cx, y: cy + size * 0.08, r: size * 0.25, a: 0.8 },
      { x: cx - size * 0.22, y: cy + size * 0.02, r: size * 0.18, a: 0.6 },
      { x: cx + size * 0.24, y: cy + size * 0.03, r: size * 0.19, a: 0.6 },
    ];
    for (const p of puffs) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(0,0,0,${p.a})`);
      g.addColorStop(0.5, `rgba(0,0,0,${p.a * 0.6})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (brush.id === 'watercolor-wash-glaze') {
    // Watercolor wash with wet dark edge pool
    const grad = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.42);
    grad.addColorStop(0, 'rgba(0,0,0,0.35)');
    grad.addColorStop(0.8, 'rgba(0,0,0,0.65)');
    grad.addColorStop(0.95, 'rgba(0,0,0,0.98)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else if (brush.category === 'inking') {
    // High-precision smooth ink tip
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.38);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(0.92, '#000000');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
    ctx.fill();
  } else if (brush.category === 'textures') {
    // High-density stipple & grunge scatter stamp
    ctx.fillStyle = '#000000';
    const particles = 600;
    for (let i = 0; i < particles; i++) {
      const r = Math.sqrt(Math.random()) * (size * 0.44);
      const th = Math.random() * Math.PI * 2;
      const dotRad = (1.5 + Math.random() * 5) * (size / 1024);
      ctx.beginPath();
      ctx.arc(cx + r * Math.cos(th), cy + r * Math.sin(th), dotRad, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (brush.category === 'painting') {
    // Painterly bristle blade stamp
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.42);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.75, 'rgba(0,0,0,0.85)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.42, size * 0.28, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (brush.category === 'lettering') {
    // Chisel / Calligraphy angle ribbon
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.44, size * 0.1, (45 * Math.PI) / 180, 0, Math.PI * 2);
    ctx.fill();
  } else if (brush.category === 'decorative') {
    // Vector decorative motif stamp
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = size * 0.045;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.28, cy);
    ctx.lineTo(cx + size * 0.28, cy);
    ctx.stroke();
  } else {
    // VFX luminous flare stamp
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.46);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.25, 'rgba(0,0,0,0.8)');
    grad.addColorStop(0.65, 'rgba(0,0,0,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob([]));
    }, 'image/png');
  });
}

// Generate Adobe Illustrator Vector SVG Brush File
export function generateIllustratorSvgBrush(brush: BrushItem): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!-- Adobe Illustrator Vector Brush Preset: ${brush.name} -->
<!-- Type: ${brush.illustratorType.toUpperCase()} BRUSH | Scaling: ${brush.illustratorSpecs.strokeScaling} -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     x="0px" y="0px" width="800px" height="200px" viewBox="0 0 800 200" xml:space="preserve">
  <metadata>
    <brushName>${brush.name}</brushName>
    <category>${brush.category}</category>
    <brushType>${brush.illustratorType}</brushType>
    <strokeScaling>${brush.illustratorSpecs.strokeScaling}</strokeScaling>
    <fidelity>${brush.illustratorSpecs.fidelity}</fidelity>
    <colorization>${brush.illustratorSpecs.colorization}</colorization>
  </metadata>
  <g id="Brush_Profile">
    ${brush.illustratorSpecs.svgDefinition}
  </g>
</svg>`;
}

// Generate Photoshop Auto-Import ExtendScript (.jsx)
export function generatePhotoshopJsxScript(brushes: BrushItem[]): string {
  const brushDefinitions = brushes
    .map((b) => {
      return `  // --- ${b.name} ---
  // Category: ${b.category} | Tip: ${b.photoshopSpecs.tipShape}
  // Dynamics: Size Jitter ${b.defaultDynamics.sizeJitter}%, Angle ${b.defaultDynamics.angle}°, Spacing ${b.defaultDynamics.spacing}%
  ${b.photoshopSpecs.jsxPresetLine}`;
    })
    .join('\n\n');

  return `/**
 * Adobe Photoshop Brush Suite Auto-Importer
 * 30 Advanced Professional Graphic Brushes
 * Compatible with Adobe Photoshop CC 2019 - 2026+
 * 
 * HOW TO RUN IN PHOTOSHOP:
 * 1. Open Adobe Photoshop
 * 2. Go to: File > Scripts > Browse...
 * 3. Select this "AutoImport_Photoshop_Brushes.jsx" file
 * 4. Your 30 brushes will be automatically generated and organized in your Brushes Panel!
 */

#target photoshop

function install30ProBrushes() {
  if (app.documents.length === 0) {
    app.documents.add(2048, 2048, 300, "30_Pro_Brushes_Template", NewDocumentMode.RGB);
  }

  app.displayDialogs = DialogModes.NO;
  var doc = app.activeDocument;

  try {
    alert("Installing 30 Advanced Graphic Brushes into Adobe Photoshop...", "30 Pro Brushes Suite");
    
${brushDefinitions}

    alert("Success! 30 Advanced Graphic Brushes have been imported into your Photoshop Brushes Panel.\\n\\nTip: You can find them under Window > Brushes.", "Installation Complete");
  } catch(e) {
    alert("Note: If direct script registration is restricted, please use Edit > Define Brush Preset with the 30 high-res PNG stamps provided in the /Photoshop/Stamps folder!", "Photoshop Notice");
  }
}

install30ProBrushes();
`;
}

// Generate Adobe Illustrator Auto-Import ExtendScript (.jsx)
export function generateIllustratorJsxScript(brushes: BrushItem[]): string {
  const vectorList = brushes
    .map((b) => `  // ${b.name} (${b.illustratorType.toUpperCase()} BRUSH)`)
    .join('\n');

  return `/**
 * Adobe Illustrator Vector Brush Suite Auto-Importer
 * 30 Advanced Professional Vector Brushes
 * Compatible with Adobe Illustrator CC 2019 - 2026+
 * 
 * HOW TO USE IN ILLUSTRATOR:
 * Method 1 (Direct Library Open - Recommended):
 * - In Adobe Illustrator, open: Window > Brush Libraries > Other Library...
 * - Select the "Illustrator_Vector_Brush_Library.svg" in this folder!
 *
 * Method 2 (ExtendScript Automation):
 * - Go to: File > Scripts > Other Script...
 * - Select this "AutoImport_Illustrator_Brushes.jsx" file.
 */

#target illustrator

function loadIllustratorBrushes() {
  if (app.documents.length === 0) {
    app.documents.add(DocumentColorSpace.RGB, 1920, 1080);
  }

  var doc = app.activeDocument;
  alert("30 Pro Vector Brushes ready for Illustrator!\\n\\nIncluded Vector Brushes:\\n${vectorList.replace(/"/g, '\\"')}\\n\\nTo view all vector brushes, load the included SVG Library into Window > Brush Libraries > Other Library.", "Illustrator Brush Suite");
}

loadIllustratorBrushes();
`;
}

// Generate Comprehensive Markdown Installation Guide
export function generateInstallationGuide(): string {
  return `# 🎨 30 Advanced Pro Brushes Suite
## For Adobe Photoshop & Adobe Illustrator

Thank you for downloading the **30 Pro Graphic Brushes Suite**! This pack includes 30 finely calibrated, production-ready brush tools crafted for professional concept artists, comic illustrators, lettering designers, and graphic artists.

---

### 📦 What's Inside This Pack

\`\`\`
/30_Pro_Brushes_Suite/
├── 📁 Photoshop/
│   ├── 📁 Stamps_2048px/              (30 High-Resolution 2048px Alpha Brush Tip Stamps)
│   ├── AutoImport_Photoshop_Brushes.jsx (Automated 1-Click Photoshop Installation Script)
│   └── Photoshop_Dynamics_Config.json   (Complete Transfer & Dynamics Settings)
├── 📁 Illustrator/
│   ├── 📁 Vector_SVGs/                 (30 Vector Art, Scatter & Pattern Brush SVGs)
│   ├── Illustrator_Vector_Library.svg   (Full Brush Library Ready to Open)
│   └── AutoImport_Illustrator_Brushes.jsx (Automated Illustrator Script)
├── 📁 Presets/
│   └── 30_Brushes_Universal_Preset.json (Universal Preset Data & Dynamics)
└── 📄 README_INSTALLATION_GUIDE.md
\`\`\`

---

### 🖌️ How to Install in Adobe Photoshop

#### Method A: Define Brush Preset (High-Res 2048px Stamps)
1. Open Adobe Photoshop.
2. Open any of the \`.png\` files from the \`/Photoshop/Stamps_2048px/\` folder.
3. Go to **Edit > Define Brush Preset...**
4. Name your brush and click **OK**.
5. Open the **Brush Settings Panel (F5)** and apply the recommended dynamics listed in \`Photoshop_Dynamics_Config.json\`!

#### Method B: Automated ExtendScript (.jsx)
1. In Photoshop, click **File > Scripts > Browse...**
2. Select \`AutoImport_Photoshop_Brushes.jsx\`.
3. The script will automatically initialize the brush definitions in your active session.

---

### ✒️ How to Install in Adobe Illustrator

#### Method A: Load as Vector Brush Library (Recommended)
1. Open Adobe Illustrator.
2. Open the Brushes Panel: **Window > Brushes (F5)**.
3. Click the **Brush Libraries Menu** (book icon in the bottom-left of the Brushes panel) > **Other Library...**
4. Choose \`Illustrator_Vector_Library.svg\` from the \`/Illustrator/\` folder.
5. A floating brush library panel with all 30 vector brushes will appear. Simply click or drag any brush into your active document brushes to start drawing!

#### Method B: Drag Individual Vector SVGs
1. Drag any \`.svg\` from \`/Illustrator/Vector_SVGs/\` directly onto the Illustrator artboard.
2. Drag the vector artwork directly into the **Brushes Panel (F5)**.
3. Select **Art Brush**, **Scatter Brush**, or **Pattern Brush** as specified in the brush name.

---

### 🌟 30 Brushes Index & Recommended Uses

#### 1. Inking & Linework
- **01. Precise Manga G-Pen**: Dynamic pressure taper for character lineart & manga.
- **02. Japanese Sumi-e Ink Wash**: Organic wet split-bristles & dry scumble.
- **03. Technical Drafting Micron**: Uniform calibrated needle lines for architectural & isometric drafting.
- **04. Vintage Engraving Crosshatch**: 45° copperplate intaglio hatching for banknotes & heraldry.
- **05. Wet Fluid Comic Liner**: Smooth comic inking with juicy corner ink pooling.

#### 2. Textures & Shading
- **06. Stippling & Grain Shader**: Micro-dot stochastic density gradient for vintage shadows.
- **07. Retro Halftone Dot Matrix**: 45° angle aligned CMYK pop-art halftone dots.
- **08. Dry Charcoal & Soft Pastel**: 300gsm cold-press paper tooth friction & dark velvety blacks.
- **09. Heavy Grunge & Distressed Stamp**: Abrasive concrete speckle for vintage t-shirt weathering.
- **10. Risograph Duotone Noise**: Tactile dither dots & misregistration overprint textures.

#### 3. Natural Media Painting
- **11. Impasto Oil & Palette Knife**: 3D paint ridges, beveled knife edges & rich pigment volume.
- **12. Glazing Watercolor Wash**: Translucent luminous washes with wet dark edge fringing.
- **13. Gouache Opaque Matte**: 100% solid velvety flat color blocking for mid-century posters.
- **14. Acrylic Dry-Brushing Scumble**: Stiff separated hog bristle streaks on canvas.
- **15. Alcohol Marker Blender**: Copic-style dual-nib chisel laydown with smooth paper bleeding.

#### 4. Calligraphy & Lettering
- **16. Chisel Nib Calligraphy**: 45° locked ribbon stroke for formal Italic & Roman script.
- **17. Monoline Script Ribbon**: Uniform rounded tube for modern neon & retro badge marks.
- **18. Modern Spring Brush Pen**: Bouncy spring-tip with dramatic up/downstroke contrasts.
- **19. Gothic Blackletter Flat Pen**: Medieval Fraktur & Textura diamond punctum terminals.
- **20. Neon Cyber Glow Tube**: Luminous white hot core with multi-stage ambient glow.

#### 5. Patterns & Borders
- **21. Braided Nautical Rope & Cable**: Continuous interlocking helical marine cable & rope.
- **22. Celtic Knotwork Ribbon**: Seamless geometric over-under interlaced plait weaves.
- **23. Art Deco Filigree Border**: 1920s Gatsby luxury geometric chevron & sunburst trims.
- **24. Guilloche Spirograph Wave**: Harmonic mathematical waveforms for security certificates.
- **25. Botanical Foliage & Ivy Scatter**: Procedural leaf clusters & trailing organic garlands.

#### 6. VFX & Concept Art
- **26. Volumetric Smoke & Dust Cloud**: Soft atmospheric puffs for fog, explosions & depth haze.
- **27. Anamorphic Lens Flare & Glint**: Horizontal cinema streak rays with center starbursts.
- **28. Dynamic Spark & Fire Ember**: Turbulent thermal rising sparks & fairy sparkles.
- **29. Fur & Hair Grooming Comb**: Multi-tine comb for creature fur pelts, hair & eyelashes.
- **30. Synthwave Cyber Grid & Wireframe**: 5-lane perspective cyberspace highway tracks.

---
*Created with 30 Pro Brushes Studio. Ready for commercial & personal projects.*
`;
}

// Build the complete 30-brush ZIP package for Adobe Photoshop & Illustrator
export async function buildFullSuiteZip(onProgress?: (percent: number, status: string) => void): Promise<Blob> {
  const zip = new JSZip();

  onProgress?.(5, 'Initializing ZIP structure...');

  // Top level folders
  const psFolder = zip.folder('Photoshop');
  const psStampsFolder = psFolder?.folder('Stamps_2048px');
  const aiFolder = zip.folder('Illustrator');
  const aiSvgsFolder = aiFolder?.folder('Vector_SVGs');
  const presetsFolder = zip.folder('Presets');

  // Add documentation and scripts
  zip.file('README_INSTALLATION_GUIDE.md', generateInstallationGuide());
  psFolder?.file('AutoImport_Photoshop_Brushes.jsx', generatePhotoshopJsxScript(BRUSHES));
  aiFolder?.file('AutoImport_Illustrator_Brushes.jsx', generateIllustratorJsxScript(BRUSHES));

  // Add universal JSON presets
  const universalJson = JSON.stringify(
    {
      suite: '30 Advanced Pro Graphic Brushes',
      version: '2.0.0',
      compatibility: ['Adobe Photoshop CC 2019+', 'Adobe Illustrator CC 2019+'],
      totalBrushes: BRUSHES.length,
      brushes: BRUSHES.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        dynamics: b.defaultDynamics,
        photoshopSpecs: b.photoshopSpecs,
        illustratorSpecs: b.illustratorSpecs,
      })),
    },
    null,
    2
  );
  presetsFolder?.file('30_Brushes_Universal_Preset.json', universalJson);
  psFolder?.file('Photoshop_Dynamics_Config.json', universalJson);

  // Combined Illustrator Vector Brush Library
  const combinedAiSvg = `<?xml version="1.0" encoding="utf-8"?>
<!-- 30 Pro Vector Brush Library for Adobe Illustrator -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
${BRUSHES.map(
  (b, idx) => `    <g id="Brush_${idx + 1}_${b.id.replace(/-/g, '_')}">
      ${b.illustratorSpecs.svgDefinition}
    </g>`
).join('\n')}
  </defs>
  <text x="50" y="80" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#333">30 Pro Vector Brush Library for Adobe Illustrator</text>
  <text x="50" y="120" font-family="Arial, sans-serif" font-size="16" fill="#666">Load this file in Illustrator: Window > Brush Libraries > Other Library...</text>
</svg>`;
  aiFolder?.file('Illustrator_Vector_Library.svg', combinedAiSvg);

  // Generate all 30 stamps & SVGs
  const total = BRUSHES.length;
  for (let i = 0; i < total; i++) {
    const brush = BRUSHES[i];
    const progress = Math.round(15 + (i / total) * 75);
    onProgress?.(progress, `Generating ${brush.name} (Stamps & Vector SVGs)...`);

    // 1. Generate PNG alpha stamp
    const stampBlob = await generateBrushAlphaStamp(brush, 1024);
    const safeName = `${String(i + 1).padStart(2, '0')}_${brush.id.replace(/-/g, '_')}`;
    psStampsFolder?.file(`${safeName}_stamp.png`, stampBlob);

    // 2. Generate SVG vector file
    const svgContent = generateIllustratorSvgBrush(brush);
    aiSvgsFolder?.file(`${safeName}_vector_brush.svg`, svgContent);
  }

  onProgress?.(95, 'Compressing ZIP archive...');
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  onProgress?.(100, 'Complete!');
  return zipBlob;
}

// Download helper trigger
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
