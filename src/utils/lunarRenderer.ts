/**
 * Ultra-High-Definition Photorealistic Lunar Surface Synthesizer
 * Renders the authentic Earth-facing Full Moon matching real astronomical photography:
 * - Tycho Crater & extensive Southern ray ejecta system
 * - Copernicus & Kepler ray networks
 * - Brightest Aristarchus plateau albedo point
 * - Exact Lunar Maria Basalt Seas: Oceanus Procellarum, Mare Imbrium,
 *   Mare Serenitatis, Mare Tranquillitatis, Mare Crisium, Mare Fecunditatis,
 *   Mare Nectaris, Mare Nubium & Mare Humorum
 * - High-frequency highland regolith cratered texture & crisp spherical limb
 */

let cachedMasterMoonCanvas: HTMLCanvasElement | null = null;

export function getMasterMoonCanvas(): HTMLCanvasElement {
  if (cachedMasterMoonCanvas) {
    return cachedMasterMoonCanvas;
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.47; // Crisp full lunar disk radius

  ctx.save();
  ctx.clearRect(0, 0, size, size);

  // -------------------------------------------------------------
  // 1. SUBTLE LUNAR CORONA ATMOSPHERIC HAZE
  // -------------------------------------------------------------
  const outerCorona = ctx.createRadialGradient(cx, cy, r * 0.94, cx, cy, r * 1.08);
  outerCorona.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  outerCorona.addColorStop(0.5, 'rgba(226, 232, 240, 0.08)');
  outerCorona.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = outerCorona;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.08, 0, Math.PI * 2);
  ctx.fill();

  // -------------------------------------------------------------
  // 2. BASE LUNAR SPHERICAL REGOLITH (Highlands Base)
  // -------------------------------------------------------------
  const sphereGrad = ctx.createRadialGradient(cx - r * 0.05, cy - r * 0.05, r * 0.02, cx, cy, r);
  sphereGrad.addColorStop(0, '#f8fafc');
  sphereGrad.addColorStop(0.45, '#e2e8f0');
  sphereGrad.addColorStop(0.8, '#cbd5e1');
  sphereGrad.addColorStop(0.96, '#94a3b8');
  sphereGrad.addColorStop(1, '#64748b');

  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Strict spherical clip for all surface topography
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // -------------------------------------------------------------
  // 3. PHOTOREALISTIC DENSE REGOLITH & CRATERED MICRO-TEXTURE
  // -------------------------------------------------------------
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  const prng = (seed: number) => {
    const x = Math.sin(seed) * 43758.5453123;
    return x - Math.floor(x);
  };

  for (let py = 0; py < size; py += 2) {
    for (let px = 0; px < size; px += 2) {
      const dx = px - cx;
      const dy = py - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq < r * r) {
        const n1 = prng(px * 12.9898 + py * 78.233);
        const n2 = prng(px * 39.34 + py * 11.23);
        const n3 = prng(px * 91.12 + py * 45.67);
        const noise = (n1 + n2 * 0.5 + n3 * 0.25 - 0.875) * 16;

        const idx = (py * size + px) * 4;
        data[idx] = Math.max(0, Math.min(255, data[idx] + noise));
        data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + noise));
        data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + noise));

        if (px + 1 < size) {
          const idxR = (py * size + (px + 1)) * 4;
          data[idxR] = data[idx];
          data[idxR + 1] = data[idx + 1];
          data[idxR + 2] = data[idx + 2];
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Helper to draw realistic organic maria basalt sea
  const drawBasaltSea = (
    bx: number,
    by: number,
    rx: number,
    ry: number,
    angle: number,
    darkness: number
  ) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(angle);

    const g = ctx.createRadialGradient(0, 0, rx * 0.1, 0, 0, Math.max(rx, ry));
    g.addColorStop(0, `rgba(32, 38, 48, ${darkness})`);
    g.addColorStop(0.5, `rgba(45, 52, 65, ${darkness * 0.92})`);
    g.addColorStop(0.8, `rgba(68, 78, 94, ${darkness * 0.55})`);
    g.addColorStop(1, 'rgba(100, 116, 139, 0)');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // -------------------------------------------------------------
  // 4. AUTHENTIC LUNAR MARIA (Dark Basaltic Seas Matching Real Photo)
  // -------------------------------------------------------------
  // A. Oceanus Procellarum (Sprawling west plains)
  drawBasaltSea(cx - r * 0.46, cy - r * 0.04, r * 0.38, r * 0.48, -0.12, 0.78);
  drawBasaltSea(cx - r * 0.56, cy + r * 0.16, r * 0.26, r * 0.32, 0.25, 0.72);
  drawBasaltSea(cx - r * 0.35, cy + r * 0.05, r * 0.24, r * 0.35, 0.1, 0.68);

  // B. Mare Imbrium (Giant circular sea in North-West)
  drawBasaltSea(cx - r * 0.2, cy - r * 0.4, r * 0.34, r * 0.29, 0.18, 0.82);
  // Sinus Iridum (Bay of Rainbows on Imbrium edge)
  drawBasaltSea(cx - r * 0.34, cy - r * 0.54, r * 0.13, r * 0.09, -0.38, 0.75);

  // C. Mare Serenitatis (Upper Center-East)
  drawBasaltSea(cx + r * 0.16, cy - r * 0.32, r * 0.24, r * 0.2, -0.08, 0.84);

  // D. Mare Tranquillitatis (East-Center / Sea of Tranquility)
  drawBasaltSea(cx + r * 0.36, cy - r * 0.06, r * 0.28, r * 0.25, 0.32, 0.85);

  // E. Mare Crisium (Distinct isolated elliptical sea on far East edge)
  drawBasaltSea(cx + r * 0.68, cy - r * 0.24, r * 0.15, r * 0.11, 0.35, 0.88);

  // F. Mare Fecunditatis & Mare Nectaris (Lower-East)
  drawBasaltSea(cx + r * 0.5, cy + r * 0.14, r * 0.24, r * 0.19, -0.22, 0.76);
  drawBasaltSea(cx + r * 0.32, cy + r * 0.28, r * 0.16, r * 0.14, 0.18, 0.78);

  // G. Mare Nubium & Mare Humorum (South-West)
  drawBasaltSea(cx - r * 0.22, cy + r * 0.32, r * 0.26, r * 0.22, 0.3, 0.74);
  drawBasaltSea(cx - r * 0.5, cy + r * 0.38, r * 0.16, r * 0.14, -0.15, 0.72);

  // Mare Vaporum & Sinus Medii (Central connections)
  drawBasaltSea(cx - r * 0.02, cy - r * 0.12, r * 0.14, r * 0.11, 0.4, 0.75);
  drawBasaltSea(cx + r * 0.02, cy + r * 0.02, r * 0.12, r * 0.09, -0.2, 0.7);

  // -------------------------------------------------------------
  // 5. BRIGHT MOUNTAIN CHAINS (Montes Apenninus bordering Imbrium)
  // -------------------------------------------------------------
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.02, cy - r * 0.16);
  ctx.bezierCurveTo(
    cx - r * 0.1, cy - r * 0.28,
    cx - r * 0.18, cy - r * 0.38,
    cx - r * 0.32, cy - r * 0.42
  );
  ctx.stroke();

  // Montes Caucasus & Alpes
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.02, cy - r * 0.42);
  ctx.lineTo(cx + r * 0.06, cy - r * 0.54);
  ctx.stroke();

  // -------------------------------------------------------------
  // 6. TYCHO CRATER & RADIANT EJECTA RAY SYSTEM (Matching Real Photo)
  // -------------------------------------------------------------
  const tychoX = cx - r * 0.08;
  const tychoY = cy + r * 0.68;

  // Real Moon Tycho ray angles spreading out in all directions
  const tychoRayCount = 48;
  for (let i = 0; i < tychoRayCount; i++) {
    const angle = (i / tychoRayCount) * Math.PI * 2;
    const lenVar = 0.6 + ((i * 7) % 13) * 0.07;
    const len = r * lenVar;
    const endX = tychoX + Math.cos(angle) * len;
    const endY = tychoY + Math.sin(angle) * len;

    const rayGrad = ctx.createLinearGradient(tychoX, tychoY, endX, endY);
    rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    rayGrad.addColorStop(0.2, 'rgba(250, 252, 255, 0.8)');
    rayGrad.addColorStop(0.6, 'rgba(230, 240, 255, 0.35)');
    rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.strokeStyle = rayGrad;
    ctx.lineWidth = 1.0 + ((i * 3) % 4) * 0.6;
    ctx.beginPath();
    ctx.moveTo(tychoX, tychoY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // Tycho Bright High-Albedo Center Halo
  const tychoHalo = ctx.createRadialGradient(tychoX, tychoY, r * 0.01, tychoX, tychoY, r * 0.15);
  tychoHalo.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
  tychoHalo.addColorStop(0.4, 'rgba(255, 255, 255, 0.85)');
  tychoHalo.addColorStop(0.75, 'rgba(230, 240, 255, 0.3)');
  tychoHalo.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = tychoHalo;
  ctx.beginPath();
  ctx.arc(tychoX, tychoY, r * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Tycho Crater Central Peak & Shadowed Interior
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(tychoX, tychoY, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(tychoX, tychoY, r * 0.04, Math.PI * 0.75, Math.PI * 1.95);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(tychoX - r * 0.006, tychoY - r * 0.006, r * 0.014, 0, Math.PI * 2);
  ctx.fill();

  // -------------------------------------------------------------
  // 7. COPERNICUS CRATER (Center-Left) & RAY WEB
  // -------------------------------------------------------------
  const copX = cx - r * 0.38;
  const copY = cy - r * 0.05;

  const copRays = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.2, 4.5, 4.8, 5.1, 5.4, 5.7, 6.0];
  for (const ca of copRays) {
    const rLen = r * 0.32;
    const cGrad = ctx.createLinearGradient(copX, copY, copX + Math.cos(ca) * rLen, copY + Math.sin(ca) * rLen);
    cGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    cGrad.addColorStop(0.5, 'rgba(240, 246, 255, 0.45)');
    cGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.strokeStyle = cGrad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(copX, copY);
    ctx.lineTo(copX + Math.cos(ca) * rLen, copY + Math.sin(ca) * rLen);
    ctx.stroke();
  }

  // Copernicus Crater Pit & Bright Rim
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(copX, copY, r * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(copX, copY, r * 0.042, Math.PI * 0.75, Math.PI * 1.9);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(copX - r * 0.008, copY - r * 0.008, r * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // -------------------------------------------------------------
  // 8. KEPLER & ARISTARCHUS HIGH-ALBEDO SPOTS
  // -------------------------------------------------------------
  // Kepler (West of Copernicus)
  const kepX = cx - r * 0.62;
  const kepY = cy - r * 0.05;
  const kepHalo = ctx.createRadialGradient(kepX, kepY, r * 0.005, kepX, kepY, r * 0.08);
  kepHalo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  kepHalo.addColorStop(0.5, 'rgba(240, 246, 255, 0.4)');
  kepHalo.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = kepHalo;
  ctx.beginPath();
  ctx.arc(kepX, kepY, r * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Aristarchus (Brightest pinpoint on the Moon in NW Oceanus Procellarum)
  const ariX = cx - r * 0.54;
  const ariY = cy - r * 0.28;
  const ariHalo = ctx.createRadialGradient(ariX, ariY, r * 0.003, ariX, ariY, r * 0.06);
  ariHalo.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  ariHalo.addColorStop(0.4, 'rgba(255, 255, 255, 0.85)');
  ariHalo.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = ariHalo;
  ctx.beginPath();
  ctx.arc(ariX, ariY, r * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // -------------------------------------------------------------
  // 9. PROMINENT IMPACT CRATERS ACROSS THE LUNAR GLOBE
  // -------------------------------------------------------------
  const craters = [
    { x: cx - r * 0.08, y: cy + r * 0.82, rad: r * 0.065, isDarkFloor: false, hasPeak: true }, // Clavius
    { x: cx - r * 0.16, y: cy - r * 0.58, rad: r * 0.05, isDarkFloor: true, hasPeak: false }, // Plato (Dark floor)
    { x: cx - r * 0.06, y: cy - r * 0.32, rad: r * 0.042, isDarkFloor: false, hasPeak: false }, // Archimedes
    { x: cx + r * 0.65, y: cy + r * 0.08, rad: r * 0.048, isDarkFloor: false, hasPeak: true }, // Langrenus
    { x: cx + r * 0.62, y: cy + r * 0.28, rad: r * 0.042, isDarkFloor: false, hasPeak: true }, // Petavius
    { x: cx + r * 0.44, y: cy - r * 0.44, rad: r * 0.038, isDarkFloor: false, hasPeak: false }, // Cleomedes
    { x: cx - r * 0.68, y: cy + r * 0.18, rad: r * 0.046, isDarkFloor: true, hasPeak: false }, // Grimaldi
    { x: cx - r * 0.24, y: cy + r * 0.15, rad: r * 0.036, isDarkFloor: false, hasPeak: false }, // Bullialdus
    { x: cx + r * 0.18, y: cy + r * 0.12, rad: r * 0.032, isDarkFloor: false, hasPeak: false },
    { x: cx - r * 0.08, y: cy + r * 0.48, rad: r * 0.038, isDarkFloor: false, hasPeak: true },
    { x: cx + r * 0.38, y: cy + r * 0.65, rad: r * 0.045, isDarkFloor: false, hasPeak: true },
    { x: cx + r * 0.22, y: cy - r * 0.18, rad: r * 0.035, isDarkFloor: false, hasPeak: true }, // Theophilus
  ];

  for (const c of craters) {
    ctx.fillStyle = c.isDarkFloor ? '#334155' : '#1e293b';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.rad, 0, Math.PI * 2);
    ctx.fill();

    // Illuminated upper-left rim
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.2, c.rad * 0.28);
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.rad, Math.PI * 0.75, Math.PI * 1.85);
    ctx.stroke();

    // Shadow lower-right rim
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(1, c.rad * 0.22);
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.rad, -Math.PI * 0.15, Math.PI * 0.8);
    ctx.stroke();

    if (c.hasPeak) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(c.x - c.rad * 0.15, c.y - c.rad * 0.15, Math.max(1, c.rad * 0.22), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // -------------------------------------------------------------
  // 10. CRISP PHOTOGRAPHIC SPHERICAL SILHOUETTE EDGE
  // -------------------------------------------------------------
  ctx.strokeStyle = 'rgba(60, 70, 85, 0.9)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore(); // Undo spherical clip
  ctx.restore(); // Undo main state

  cachedMasterMoonCanvas = canvas;
  return canvas;
}

/**
 * High-performance 1-click photorealistic Moon renderer
 */
export function renderRealMoonStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity = 1
): void {
  const master = getMasterMoonCanvas();
  ctx.save();
  ctx.globalAlpha = opacity;
  // Size represents the full diameter
  const drawSize = size * 1.1;
  ctx.drawImage(
    master,
    0,
    0,
    master.width,
    master.height,
    x - drawSize / 2,
    y - drawSize / 2,
    drawSize,
    drawSize
  );
  ctx.restore();
}

