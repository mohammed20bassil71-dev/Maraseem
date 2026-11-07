import * as THREE from 'three';

export interface CardTypographyData {
  monogram: string;
  eventTitle: string;
  namesHeadline: string;
  eventDateText: string;
  venueText: string;
}

/**
 * Extracts a 1-2 character royal monogram from the invitation names
 */
export function buildInvitationMonogram(
  groomName?: string,
  brideName?: string,
  singleHonoree?: string,
  fallbackTitle?: string
): string {
  const clean = (s?: string) => (s || '').trim().replace(/^ال/, '');
  const g = clean(groomName);
  const b = clean(brideName);
  if (g && b) {
    return `${g.charAt(0)} ✦ ${b.charAt(0)}`;
  }
  const s = clean(singleHonoree) || clean(fallbackTitle);
  if (s) {
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)} ✦ ${parts[1].charAt(0)}`;
    }
    return s.charAt(0) || 'م';
  }
  return 'م ✦ س';
}

/**
 * 1. Photorealistic Heavyweight Cotton Rag Paper Albedo + Bump Map
 */
export function createCottonPaperPBRTextures(
  renderer: THREE.WebGLRenderer,
  baseHex: string,
  goldHex: string,
  size = 512
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const ctx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Warm radial paper illumination
  const radGrad = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.08,
    size * 0.5,
    size * 0.5,
    size * 0.72
  );
  radGrad.addColorStop(0, baseHex);
  radGrad.addColorStop(1, '#EFE5D4');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Fine organic cotton rag linen fibers
  const fiberCount = Math.floor((size / 512) * 5200);
  for (let i = 0; i < fiberCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 3 + Math.random() * 9;
    const angle = Math.random() * Math.PI;
    ctx.strokeStyle =
      i % 2 === 0 ? 'rgba(255, 253, 248, 0.07)' : 'rgba(169, 132, 69, 0.045)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();

    bCtx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(40,40,40,0.12)';
    bCtx.lineWidth = 1.2;
    bCtx.beginPath();
    bCtx.moveTo(x, y);
    bCtx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    bCtx.stroke();
  }

  // Embossed double gold-foil border
  const pad1 = Math.round(size * 0.036);
  const pad2 = Math.round(size * 0.056);
  ctx.strokeStyle = goldHex;
  ctx.lineWidth = Math.max(2, Math.round(size * 0.009));
  ctx.strokeRect(pad1, pad1, size - pad1 * 2, size - pad1 * 2);

  ctx.lineWidth = Math.max(1, Math.round(size * 0.0035));
  ctx.strokeRect(pad2, pad2, size - pad2 * 2, size - pad2 * 2);

  // Raised gold border in bump map
  bCtx.strokeStyle = '#FFFFFF';
  bCtx.lineWidth = Math.max(2, Math.round(size * 0.01));
  bCtx.strokeRect(pad1, pad1, size - pad1 * 2, size - pad1 * 2);
  bCtx.lineWidth = Math.max(1, Math.round(size * 0.004));
  bCtx.strokeRect(pad2, pad2, size - pad2 * 2, size - pad2 * 2);

  // Corner arabesque rosettes
  const corners = [
    [pad2 + 12, pad2 + 12],
    [size - pad2 - 12, pad2 + 12],
    [pad2 + 12, size - pad2 - 12],
    [size - pad2 - 12, size - pad2 - 12],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.round(size * 0.025), 0, Math.PI * 2);
    ctx.strokeStyle = goldHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    bCtx.beginPath();
    bCtx.arc(cx, cy, Math.round(size * 0.025), 0, Math.PI * 2);
    bCtx.strokeStyle = '#FFFFFF';
    bCtx.lineWidth = 2.5;
    bCtx.stroke();
  });

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const map = new THREE.CanvasTexture(albedoCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = maxAniso;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = maxAniso;

  return { map, bumpMap };
}

/**
 * 2. Photorealistic 3D Invitation Card Texture Stamped with Real Names, Date & Monogram
 */
export function createPersonalizedInvitationCardTexture(
  renderer: THREE.WebGLRenderer,
  baseHex: string,
  goldHex: string,
  darkHex: string,
  cardData: CardTypographyData,
  size = 1024
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.72);
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d')!;

  // Soft luxury cotton cardstock gradient
  const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.05, w * 0.5, h * 0.5, w * 0.65);
  bgGrad.addColorStop(0, '#FFFDF9');
  bgGrad.addColorStop(0.7, baseHex);
  bgGrad.addColorStop(1, '#EDE2CF');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle cotton fiber texture
  for (let i = 0; i < 3800; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(169, 132, 69, 0.038)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Metallic Gold Foil Gradient for Borders & Calligraphy
  const goldGrad = ctx.createLinearGradient(0, 0, w, h);
  goldGrad.addColorStop(0, '#B38E4C');
  goldGrad.addColorStop(0.3, '#E8CE92');
  goldGrad.addColorStop(0.5, goldHex);
  goldGrad.addColorStop(0.7, '#F3DFAC');
  goldGrad.addColorStop(1, '#9E7836');

  // Outer & Inner Beveled Gold Foil Borders
  const m1 = Math.round(w * 0.042);
  const m2 = Math.round(w * 0.058);
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = Math.max(3, Math.round(w * 0.006));
  ctx.strokeRect(m1, m1, w - m1 * 2, h - m1 * 2);

  ctx.lineWidth = Math.max(1.5, Math.round(w * 0.0025));
  ctx.strokeRect(m2, m2, w - m2 * 2, h - m2 * 2);

  // Ornate Corner Filigree Flourishes
  const cornerRadius = Math.round(w * 0.028);
  [
    [m2, m2],
    [w - m2, m2],
    [m2, h - m2],
    [w - m2, h - m2],
  ].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, cornerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, cornerRadius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = goldGrad;
    ctx.fill();
  });

  // Top Royal Monogram Medallion
  const crestY = Math.round(h * 0.2);
  ctx.beginPath();
  ctx.arc(w * 0.5, crestY, Math.round(h * 0.075), 0, Math.PI * 2);
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = goldGrad;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(h * 0.052)}px "Amiri", "Cairo", serif`;
  ctx.fillText(cardData.monogram || 'م ✦ س', w * 0.5, crestY + 2);

  // Bismillah / Royal Header
  ctx.fillStyle = '#8C6930';
  ctx.font = `600 ${Math.round(h * 0.038)}px "Amiri", "Cairo", serif`;
  ctx.fillText('بسم الله الرحمن الرحيم', w * 0.5, Math.round(h * 0.34));

  // Event Title Subtitle
  if (cardData.eventTitle) {
    ctx.fillStyle = '#7A5B2B';
    ctx.font = `bold ${Math.round(h * 0.036)}px "Cairo", "Amiri", sans-serif`;
    ctx.fillText(cardData.eventTitle.slice(0, 48), w * 0.5, Math.round(h * 0.43));
  }

  // Main Couple / Honoree Names in Embossed Gold & Royal Ink
  ctx.save();
  ctx.shadowColor = 'rgba(169, 132, 69, 0.32)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = darkHex || '#17130F';
  ctx.font = `bold ${Math.round(h * 0.095)}px "Amiri", "Cairo", serif`;
  ctx.fillText(cardData.namesHeadline || 'أحمد ✦ سارة', w * 0.5, Math.round(h * 0.57));
  ctx.restore();

  // Decorative Gold Divider Line with Diamond Center
  const divY = Math.round(h * 0.69);
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, divY);
  ctx.lineTo(w * 0.72, divY);
  ctx.stroke();

  // Event Date & Venue Footer
  ctx.fillStyle = '#6E5226';
  ctx.font = `bold ${Math.round(h * 0.038)}px "Cairo", monospace`;
  const footerLine = [cardData.eventDateText, cardData.venueText]
    .filter(Boolean)
    .join('  •  ');
  ctx.fillText(footerLine.slice(0, 56), w * 0.5, Math.round(h * 0.79));

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

/**
 * 3. Photorealistic Embossed Wax Seal Texture + Bump Map (with Couple/Honoree Monogram)
 */
export function createWaxSealMonogramTextures(
  renderer: THREE.WebGLRenderer,
  waxHex: string,
  goldHex: string,
  monogram: string,
  size = 512
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const cx = size * 0.5;
  const cy = size * 0.5;
  const r = size * 0.45;

  // Base wax radial shading
  const waxGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.05, cx, cy, r);
  waxGrad.addColorStop(0, goldHex);
  waxGrad.addColorStop(0.55, waxHex);
  waxGrad.addColorStop(0.88, '#5E4219');
  waxGrad.addColorStop(1, '#3D290D');
  ctx.fillStyle = waxGrad;
  ctx.fillRect(0, 0, size, size);

  // Bump map: raised outer rim, sunken inner well, raised monogram
  const bumpGrad = bCtx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  bumpGrad.addColorStop(0, '#555555');
  bumpGrad.addColorStop(0.68, '#484848');
  bumpGrad.addColorStop(0.76, '#E8E8E8');
  bumpGrad.addColorStop(0.92, '#B0B0B0');
  bumpGrad.addColorStop(1, '#303030');
  bCtx.fillStyle = bumpGrad;
  bCtx.fillRect(0, 0, size, size);

  // Beaded inner ring
  const beadCount = 36;
  const beadRad = r * 0.72;
  for (let i = 0; i < beadCount; i++) {
    const ang = (i / beadCount) * Math.PI * 2;
    const bx = cx + Math.cos(ang) * beadRad;
    const by = cy + Math.sin(ang) * beadRad;
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.012, 0, Math.PI * 2);
    ctx.fillStyle = '#F6E3BA';
    ctx.fill();

    bCtx.beginPath();
    bCtx.arc(bx, by, size * 0.014, 0, Math.PI * 2);
    bCtx.fillStyle = '#FFFFFF';
    bCtx.fill();
  }

  // Embossed Monogram in Center
  ctx.save();
  ctx.fillStyle = '#FCEFD2';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(size * 0.22)}px "Amiri", "Cairo", serif`;
  ctx.fillText(monogram || 'م ✦ س', cx, cy + 4);
  ctx.restore();

  bCtx.fillStyle = '#FFFFFF';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.font = `bold ${Math.round(size * 0.22)}px "Amiri", "Cairo", serif`;
  bCtx.fillText(monogram || 'م ✦ س', cx, cy + 4);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = maxAniso;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = maxAniso;

  return { map, bumpMap };
}

/**
 * 4. Plush Velvet Micro-Fiber Bump Map (for Engagement Ring Box & Cushions)
 */
export function createVelvetMicrofiberBumpMap(
  renderer: THREE.WebGLRenderer,
  size = 256
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = 90 + Math.floor(Math.random() * 85);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

/**
 * 5. Carved Royal Palace Door Texture + Bump Map (for Scene 3: Royal Doors)
 */
export function createRoyalPalaceDoorTextures(
  renderer: THREE.WebGLRenderer,
  panelHex: string,
  goldHex: string,
  size = 512
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size * 2;
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Rich lacquered palace door base
  const baseGrad = ctx.createLinearGradient(0, 0, w, h);
  baseGrad.addColorStop(0, panelHex);
  baseGrad.addColorStop(0.5, '#1E1712');
  baseGrad.addColorStop(1, '#120D0A');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, w, h);

  // Subtle vertical wood grain lines
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(214,181,116,0.03)';
    ctx.fillRect(x, y, 1.5, 18);
  }

  // 3 Architectural Recessed Coffer Panels (Top Arch Panel, Middle Medallion Panel, Bottom Panel)
  const drawCoffer = (x: number, y: number, cw: number, ch: number, withRosette: boolean) => {
    // Outer raised gold molding
    ctx.strokeStyle = goldHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(x, y, cw, ch);

    ctx.lineWidth = 3;
    ctx.strokeRect(x + 14, y + 14, cw - 28, ch - 28);

    bCtx.strokeStyle = '#FFFFFF';
    bCtx.lineWidth = 10;
    bCtx.strokeRect(x, y, cw, ch);
    bCtx.strokeStyle = '#383838';
    bCtx.lineWidth = 6;
    bCtx.strokeRect(x + 10, y + 10, cw - 20, ch - 20);

    if (withRosette) {
      const rcx = x + cw * 0.5;
      const rcy = y + ch * 0.5;
      const rad = Math.min(cw, ch) * 0.28;
      ctx.beginPath();
      ctx.arc(rcx, rcy, rad, 0, Math.PI * 2);
      ctx.strokeStyle = goldHex;
      ctx.lineWidth = 5;
      ctx.stroke();

      bCtx.beginPath();
      bCtx.arc(rcx, rcy, rad, 0, Math.PI * 2);
      bCtx.strokeStyle = '#FFFFFF';
      bCtx.lineWidth = 6;
      bCtx.stroke();

      // 8-point royal star inside rosette
      for (let p = 0; p < 8; p++) {
        const a = (p / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(rcx, rcy);
        ctx.lineTo(rcx + Math.cos(a) * rad * 0.85, rcy + Math.sin(a) * rad * 0.85);
        ctx.strokeStyle = goldHex;
        ctx.lineWidth = 3;
        ctx.stroke();

        bCtx.beginPath();
        bCtx.moveTo(rcx, rcy);
        bCtx.lineTo(rcx + Math.cos(a) * rad * 0.85, rcy + Math.sin(a) * rad * 0.85);
        bCtx.strokeStyle = '#FFFFFF';
        bCtx.lineWidth = 4;
        bCtx.stroke();
      }
    }
  };

  drawCoffer(36, 42, w - 72, 260, true);
  drawCoffer(36, 336, w - 72, 340, true);
  drawCoffer(36, 710, w - 72, 260, false);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = maxAniso;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = maxAniso;

  return { map, bumpMap };
}

/**
 * 6. Woven Satin Silk Ribbon Texture (for Scene 4: Silk Ribbon & Luxury Envelope)
 */
export function createSilkSatinWeaveTexture(
  renderer: THREE.WebGLRenderer,
  ribbonHex: string,
  goldHex: string,
  size = 256
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, ribbonHex);
  grad.addColorStop(0.5, '#FFFDF9');
  grad.addColorStop(1, ribbonHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Fine satin weave threads
  ctx.strokeStyle = 'rgba(214, 181, 116, 0.16)';
  ctx.lineWidth = 1;
  for (let y = 0; y < size; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Gold stitched selvedge edges
  ctx.fillStyle = goldHex;
  ctx.fillRect(0, 0, size, 6);
  ctx.fillRect(0, size - 6, size, 6);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}
