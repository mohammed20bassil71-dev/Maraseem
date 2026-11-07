import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { SingleInteractionMode } from '../../types/invitation';
import {
  buildInvitationMonogram,
  createCottonPaperPBRTextures,
  createPersonalizedInvitationCardTexture,
  createWaxSealMonogramTextures,
  createVelvetMicrofiberBumpMap,
  createRoyalPalaceDoorTextures,
  createSilkSatinWeaveTexture,
} from './photorealisticTextures';
import { soundEngine } from '../../utils/audio';

export type Royal3DCollectionTemplateId =
  | 'tpl-royal-3d-envelope'
  | 'tpl-royal-3d-theatre'
  | 'tpl-royal-3d-palace-book'
  | 'tpl-royal-3d-swan-lake'
  | 'tpl-grad-3d-celebration'
  | 'tpl-grad-3d-golden-diploma'
  | 'tpl-grad-3d-graduation-night'
  | 'tpl-grad-3d-popup-book';

export interface Royal3DColorScheme {
  id: string;
  nameAr: string;
  nameEn: string;
  champagneGold: string;
  antiqueGold: string;
  ivory: string;
  pearlWhite: string;
  emeraldGreen: string;
  royalBlack: string;
  romanticBlush: string;
}

export const ROYAL_LUXURY_COLOR_SCHEMES: Royal3DColorScheme[] = [
  {
    id: 'imperial_signature',
    nameAr: 'الهوية الملكية الأصلية (Champagne & Emerald)',
    nameEn: 'Maraseem Royal Signature',
    champagneGold: '#D6B574',
    antiqueGold: '#A98445',
    ivory: '#F8F1E5',
    pearlWhite: '#FFFDF8',
    emeraldGreen: '#123D32',
    royalBlack: '#17130F',
    romanticBlush: '#EBCBC1',
  },
  {
    id: 'blush_pearl_palace',
    nameAr: 'قصر اللؤلؤ والبلش الرومانسي (Pearl & Blush)',
    nameEn: 'Romantic Blush & Pearl Gold',
    champagneGold: '#DFC184',
    antiqueGold: '#B38E4C',
    ivory: '#FAF4EC',
    pearlWhite: '#FFFDF8',
    emeraldGreen: '#2A4B3C',
    royalBlack: '#1D1614',
    romanticBlush: '#EBCBC1',
  },
  {
    id: 'emerald_obsidian_velvet',
    nameAr: 'مخمل الزمرد والذهب العتيق (Emerald & Antique Gold)',
    nameEn: 'Emerald Velvet & Antique Gold',
    champagneGold: '#D6B574',
    antiqueGold: '#9B7637',
    ivory: '#F4ECE0',
    pearlWhite: '#FFFDF8',
    emeraldGreen: '#0E3329',
    royalBlack: '#120E0B',
    romanticBlush: '#E4BFAF',
  },
  {
    id: 'royal_navy_graduation',
    nameAr: 'الكحلي الملكي وذهب التخرج (Royal Navy & Gold)',
    nameEn: 'Royal Navy & Champagne Gold',
    champagneGold: '#D6B574',
    antiqueGold: '#B89146',
    ivory: '#F8F1E5',
    pearlWhite: '#FFFFFF',
    emeraldGreen: '#0B1938',
    royalBlack: '#071026',
    romanticBlush: '#D8DEE9',
  },
  {
    id: 'oriental_burgundy_henna',
    nameAr: 'العنابي الشرقي والذهب المعتّق (Burgundy & Gold)',
    nameEn: 'Oriental Burgundy & Gold',
    champagneGold: '#D6B574',
    antiqueGold: '#A98445',
    ivory: '#F8F1E5',
    pearlWhite: '#FFFDF8',
    emeraldGreen: '#5A1222',
    royalBlack: '#1D090E',
    romanticBlush: '#E6B8AF',
  },
  {
    id: 'festive_pastel_birthday',
    nameAr: 'الوردي الاحتفالي والذهب (Festive Pastel & Gold)',
    nameEn: 'Festive Pastel & Gold',
    champagneGold: '#D6B574',
    antiqueGold: '#B68F4C',
    ivory: '#FFFDF8',
    pearlWhite: '#FFFFFF',
    emeraldGreen: '#DCD0EE',
    royalBlack: '#1F1A24',
    romanticBlush: '#F4C7D0',
  },
];

export interface Royal3DWebGLCanvasProps {
  templateId?: Royal3DCollectionTemplateId;
  interactionMode?: SingleInteractionMode;
  major?: string;
  isOpened: boolean;
  enableParticles?: boolean;
  colorScheme?: Royal3DColorScheme;
  monogramText?: string;
  namesHeadline?: string;
  eventTitle?: string;
  eventDateText?: string;
  venueText?: string;
  enableSfx?: boolean;
  liteMode?: boolean;
  onObjectClick?: () => void;
  onAnimationComplete?: () => void;
  onTimelineProgress?: (progress: number, phaseAr: string, phaseEn: string) => void;
}

// Detect software WebGL per Three.js skill instructions
const isSoftwareGl = (() => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
})();

const prefersReducedMotion = (() => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
})();

function createVelvetPleatsTexture(
  renderer: THREE.WebGLRenderer,
  primaryHex: string,
  goldHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  for (let i = 0; i <= 16; i++) {
    const stop = i / 16;
    grad.addColorStop(stop, i % 2 === 0 ? primaryHex : '#081814');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = goldHex;
  ctx.fillRect(0, 488, 512, 16);
  ctx.fillRect(492, 0, 14, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function build3DRoseGroup(
  petalMat: THREE.Material,
  goldMat: THREE.Material,
  scale = 1
): THREE.Group {
  const rose = new THREE.Group();
  const centerGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const centerMesh = new THREE.Mesh(centerGeo, goldMat);
  rose.add(centerMesh);

  const petalGeo = new THREE.SphereGeometry(0.12, 12, 10);
  petalGeo.scale(1.1, 0.35, 0.8);

  for (let ring = 0; ring < 2; ring++) {
    const count = ring === 0 ? 5 : 8;
    const radius = ring === 0 ? 0.09 : 0.16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + ring * 0.4;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(
        Math.cos(angle) * radius,
        0.02 * ring,
        Math.sin(angle) * radius
      );
      petal.rotation.y = -angle;
      petal.rotation.z = 0.45 + ring * 0.25;
      rose.add(petal);
    }
  }
  rose.scale.setScalar(scale);
  return rose;
}

function build3DLaurelWreath(goldMat: THREE.Material, scale = 1): THREE.Group {
  const wreath = new THREE.Group();
  const leafGeo = new THREE.SphereGeometry(0.09, 10, 8);
  leafGeo.scale(1.8, 0.3, 0.65);

  const branchCount = 14;
  [-1, 1].forEach((side) => {
    for (let i = 0; i < branchCount; i++) {
      const t = i / (branchCount - 1);
      const angle = -Math.PI * 0.42 + t * Math.PI * 0.82;
      const rad = 0.92;
      const leaf = new THREE.Mesh(leafGeo, goldMat);
      leaf.position.set(
        side * Math.cos(angle) * rad,
        Math.sin(angle) * rad,
        0
      );
      leaf.rotation.z = side * (angle + Math.PI * 0.35);
      wreath.add(leaf);
    }
  });

  const ribbonBow = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.032, 10, 20),
    goldMat
  );
  ribbonBow.position.set(0, -0.88, 0.04);
  wreath.add(ribbonBow);
  wreath.scale.setScalar(scale);
  return wreath;
}

function build3DGraduationCap(
  navyMat: THREE.Material,
  goldMat: THREE.Material,
  scale = 1
): { capGroup: THREE.Group; tasselPivot: THREE.Group } {
  const capGroup = new THREE.Group();

  const skullGeo = new THREE.CylinderGeometry(0.58, 0.66, 0.42, 24);
  const skullMesh = new THREE.Mesh(skullGeo, navyMat);
  skullMesh.position.y = -0.18;
  capGroup.add(skullMesh);

  const bandRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.665, 0.665, 0.06, 28),
    goldMat
  );
  bandRing.position.y = -0.36;
  capGroup.add(bandRing);

  const boardGeo = new THREE.BoxGeometry(1.85, 0.07, 1.85);
  const boardMesh = new THREE.Mesh(boardGeo, navyMat);
  boardMesh.rotation.y = Math.PI / 4;
  boardMesh.position.y = 0.05;
  capGroup.add(boardMesh);

  const borderRim = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.035, 1.9),
    goldMat
  );
  borderRim.rotation.y = Math.PI / 4;
  borderRim.position.y = 0.05;
  capGroup.add(borderRim);

  const topButton = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16),
    goldMat
  );
  topButton.position.y = 0.1;
  capGroup.add(topButton);

  const tasselPivot = new THREE.Group();
  tasselPivot.position.set(0, 0.1, 0);

  const cordCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.45, 0.02, 0.35),
    new THREE.Vector3(0.88, -0.05, 0.55),
    new THREE.Vector3(0.92, -0.58, 0.58)
  );
  const cordGeo = new THREE.TubeGeometry(cordCurve, 20, 0.022, 8, false);
  const cordMesh = new THREE.Mesh(cordGeo, goldMat);
  tasselPivot.add(cordMesh);

  const fringeMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.085, 0.28, 14),
    goldMat
  );
  fringeMesh.position.set(0.92, -0.68, 0.58);
  tasselPivot.add(fringeMesh);

  capGroup.add(tasselPivot);
  capGroup.scale.setScalar(scale);

  return { capGroup, tasselPivot };
}

function buildMajor3DEmblem(
  major: string | undefined,
  goldMat: THREE.Material,
  pearlMat: THREE.Material,
  accentMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  const m = (major || 'ai_tech').toLowerCase();

  if (
    m.includes('med') ||
    m.includes('dent') ||
    m.includes('pharm') ||
    m.includes('طب') ||
    m.includes('صيدل') ||
    m.includes('مختبر')
  ) {
    for (let i = 0; i < 10; i++) {
      const y = (i - 4.5) * 0.12;
      const angle = i * 0.65;
      const x1 = Math.cos(angle) * 0.28;
      const z1 = Math.sin(angle) * 0.28;
      const x2 = Math.cos(angle + Math.PI) * 0.28;
      const z2 = Math.sin(angle + Math.PI) * 0.28;

      const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), goldMat);
      s1.position.set(x1, y, z1);
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), pearlMat);
      s2.position.set(x2, y, z2);

      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.56, 8),
        accentMat
      );
      rung.position.set(0, y, 0);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -angle;
      group.add(s1, s2, rung);
    }
  } else if (
    (m.includes('eng') && !m.includes('comp')) ||
    m.includes('هندس') ||
    m.includes('معمار')
  ) {
    const gear = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.06, 12, 24),
      goldMat
    );
    group.add(gear);
    for (let t = 0; t < 8; t++) {
      const ang = (t / 8) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), goldMat);
      tooth.position.set(Math.cos(ang) * 0.44, Math.sin(ang) * 0.44, 0);
      tooth.rotation.z = ang;
      group.add(tooth);
    }
    const archPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.14, 0.85, 6),
      pearlMat
    );
    group.add(archPillar);
  } else if (
    m.includes('bus') ||
    m.includes('law') ||
    m.includes('إدار') ||
    m.includes('قانون')
  ) {
    for (let b = 0; b < 4; b++) {
      const h = 0.28 + b * 0.16;
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, h, 0.12),
        b === 3 ? goldMat : pearlMat
      );
      bar.position.set((b - 1.5) * 0.18, h / 2 - 0.35, 0);
      group.add(bar);
    }
    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.02, 12, 32),
      goldMat
    );
    orbit.rotation.x = 0.55;
    group.add(orbit);
  } else {
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), goldMat);
    group.add(core);
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.44, 0.02, 10, 32),
        r === 0 ? goldMat : pearlMat
      );
      ring.rotation.x = (r * Math.PI) / 3;
      ring.rotation.y = (r * Math.PI) / 4;
      group.add(ring);
    }
  }

  return group;
}

export const Royal3DWebGLCanvas: React.FC<Royal3DWebGLCanvasProps> = ({
  templateId = 'tpl-royal-3d-envelope',
  interactionMode,
  major,
  isOpened,
  enableParticles = true,
  colorScheme = ROYAL_LUXURY_COLOR_SCHEMES[0],
  monogramText,
  namesHeadline = 'أحمد ✦ سارة',
  eventTitle = 'دعوة خاصة مباركة',
  eventDateText = '2026-12-01',
  venueText = 'القاعة الملكية الكبرى',
  enableSfx = true,
  liteMode = false,
  onObjectClick,
  onAnimationComplete,
  onTimelineProgress,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const isOpenedRef = useRef<boolean>(isOpened);
  const enableParticlesRef = useRef<boolean>(enableParticles);
  const enableSfxRef = useRef<boolean>(enableSfx);
  const completionFiredRef = useRef<boolean>(false);
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const onObjectClickRef = useRef(onObjectClick);
  const onTimelineProgressRef = useRef(onTimelineProgress);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isHoveringObject, setIsHoveringObject] = useState<boolean>(false);
  const [dofBlurStrength, setDofBlurStrength] = useState<number>(0);

  // GSAP Timeline Reference
  const gsapTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const startTimelineFnRef = useRef<((fromProgress?: number) => void) | null>(null);
  const resetTimelineFnRef = useRef<(() => void) | null>(null);

  const activeMode: SingleInteractionMode = (() => {
    if (interactionMode) return interactionMode;
    if (templateId === 'tpl-royal-3d-theatre') return 'curtain_3d';
    if (templateId === 'tpl-royal-3d-palace-book') return 'popup_book_3d';
    if (templateId === 'tpl-royal-3d-swan-lake') return 'scene_reveal_3d';
    if (templateId === 'tpl-grad-3d-celebration') return 'graduation_cap_3d';
    if (templateId === 'tpl-grad-3d-golden-diploma') return 'graduation_diploma_3d';
    if (templateId === 'tpl-grad-3d-graduation-night') return 'graduation_night_fireworks_3d';
    if (templateId === 'tpl-grad-3d-popup-book') return 'graduation_popup_book_3d';
    return 'envelope_3d';
  })();

  const effectiveMonogram =
    monogramText || buildInvitationMonogram(namesHeadline, undefined, namesHeadline);

  useEffect(() => {
    enableSfxRef.current = enableSfx;
    soundEngine.setSfxEnabled(enableSfx);
  }, [enableSfx]);

  useEffect(() => {
    isOpenedRef.current = isOpened;
    if (!isOpened) {
      completionFiredRef.current = false;
      setDofBlurStrength(0);
      resetTimelineFnRef.current?.();
    } else {
      startTimelineFnRef.current?.();
    }
  }, [isOpened]);

  useEffect(() => {
    enableParticlesRef.current = enableParticles;
  }, [enableParticles]);

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    onObjectClickRef.current = onObjectClick;
  }, [onObjectClick]);

  useEffect(() => {
    onTimelineProgressRef.current = onTimelineProgress;
  }, [onTimelineProgress]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isLowPower = isSoftwareGl || liteMode;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isLowPower,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 390;
    const height = container.clientHeight || 760;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(isLowPower ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isLowPower;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.52, 6.25);
    camera.lookAt(0, 0, 0);

    // ---------------------------------------------------------
    // CINEMATIC LIGHTING & AMBIENT SHADOW RIG
    // ---------------------------------------------------------
    const hemiLight = new THREE.HemisphereLight(0xfffdf8, 0x17130f, 0.92);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4d6, 2.45);
    keyLight.position.set(3.4, 6.2, 5.2);
    if (!isLowPower) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 20;
      const d = 4.2;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.radius = 4;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.SpotLight(0xd6b574, 3.1, 18, Math.PI / 4, 0.55);
    rimLight.position.set(-3.6, 4.4, 3.4);
    scene.add(rimLight);

    // Dynamic Specular Glint Light (sweeps across gold, wax, silk & diamond during GSAP timeline)
    const glintPointLight = new THREE.PointLight(0xfff7dc, 2.6, 9, 1.8);
    glintPointLight.position.set(-2.2, 1.4, 2.5);
    scene.add(glintPointLight);

    // Soft Ambient Shadow Receiver Plane beneath 3D Hero Objects
    const shadowReceiverPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    shadowReceiverPlane.rotation.x = -Math.PI / 2;
    shadowReceiverPlane.position.y = -1.65;
    shadowReceiverPlane.receiveShadow = true;
    scene.add(shadowReceiverPlane);

    // ---------------------------------------------------------
    // PHOTOREALISTIC PBR TEXTURES & MATERIALS
    // ---------------------------------------------------------
    const texSize = isLowPower ? 512 : 1024;
    const cottonPaperPBR = createCottonPaperPBRTextures(
      renderer,
      colorScheme.ivory,
      colorScheme.champagneGold,
      isLowPower ? 512 : 512
    );
    const personalizedCardTex = createPersonalizedInvitationCardTexture(
      renderer,
      colorScheme.ivory,
      colorScheme.champagneGold,
      colorScheme.royalBlack,
      {
        monogram: effectiveMonogram,
        eventTitle,
        namesHeadline,
        eventDateText,
        venueText,
      },
      texSize
    );
    const waxSealPBR = createWaxSealMonogramTextures(
      renderer,
      colorScheme.antiqueGold,
      colorScheme.champagneGold,
      effectiveMonogram,
      512
    );
    const velvetBumpTex = createVelvetMicrofiberBumpMap(renderer, 256);
    const silkWeaveTex = createSilkSatinWeaveTexture(
      renderer,
      colorScheme.champagneGold,
      colorScheme.antiqueGold,
      256
    );
    const palaceDoorPBR = createRoyalPalaceDoorTextures(
      renderer,
      colorScheme.emeraldGreen,
      colorScheme.champagneGold,
      512
    );

    // 24K Brushed Champagne Gold Material
    const champagneGoldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorScheme.champagneGold),
      metalness: 0.94,
      roughness: 0.15,
      clearcoat: 0.72,
      clearcoatRoughness: 0.1,
    });

    const antiqueGoldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorScheme.antiqueGold),
      metalness: 0.89,
      roughness: 0.24,
      clearcoat: 0.48,
    });

    const pearlWhiteMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorScheme.pearlWhite),
      metalness: 0.06,
      roughness: 0.18,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
    });

    // Plush Velvet Material with Micro-Fiber Bump & Sheen
    const blushPetalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorScheme.romanticBlush),
      bumpMap: velvetBumpTex,
      bumpScale: 0.015,
      metalness: 0.04,
      roughness: 0.52,
      sheen: 1.0,
      sheenRoughness: 0.32,
      sheenColor: new THREE.Color(colorScheme.pearlWhite),
    });

    const royalVelvetBoxMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(
        activeMode === 'engagement_jewelry_box_3d' || activeMode === 'engagement_ring_3d'
          ? '#6E1423'
          : colorScheme.emeraldGreen
      ),
      bumpMap: velvetBumpTex,
      bumpScale: 0.018,
      metalness: 0.06,
      roughness: 0.58,
      sheen: 1.0,
      sheenRoughness: 0.28,
      sheenColor: new THREE.Color(colorScheme.champagneGold),
    });

    // Woven Satin Silk Ribbon Material
    const silkRibbonMat = new THREE.MeshPhysicalMaterial({
      map: silkWeaveTex,
      color: new THREE.Color(colorScheme.champagneGold),
      metalness: 0.35,
      roughness: 0.22,
      sheen: 1.0,
      sheenRoughness: 0.18,
      sheenColor: new THREE.Color('#FFFDF8'),
      clearcoat: 0.45,
      clearcoatRoughness: 0.15,
      side: THREE.DoubleSide,
    });

    // Monogram Wax Seal Material
    const monogramWaxMat = new THREE.MeshPhysicalMaterial({
      map: waxSealPBR.map,
      bumpMap: waxSealPBR.bumpMap,
      bumpScale: 0.035,
      metalness: 0.38,
      roughness: 0.28,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2,
    });

    // Heavyweight Cotton Rag Paper Material (for Envelope & Card Back)
    const ivoryPaperMat = new THREE.MeshPhysicalMaterial({
      map: cottonPaperPBR.map,
      bumpMap: cottonPaperPBR.bumpMap,
      bumpScale: 0.014,
      roughness: 0.62,
      metalness: 0.05,
      clearcoat: 0.12,
      side: THREE.DoubleSide,
    });

    // Personalized 3D Invitation Card Face Material (with Real Names & Date)
    const personalizedCardFaceMat = new THREE.MeshPhysicalMaterial({
      map: personalizedCardTex,
      bumpMap: cottonPaperPBR.bumpMap,
      bumpScale: 0.01,
      roughness: 0.42,
      metalness: 0.14,
      clearcoat: 0.38,
      clearcoatRoughness: 0.15,
    });

    // Carved Palace Door Material
    const carvedPalaceDoorMat = new THREE.MeshPhysicalMaterial({
      map: palaceDoorPBR.map,
      bumpMap: palaceDoorPBR.bumpMap,
      bumpScale: 0.04,
      roughness: 0.32,
      metalness: 0.35,
      clearcoat: 0.68,
      clearcoatRoughness: 0.18,
    });

    // Brilliant-Cut Diamond Crystal Material
    const diamondCrystalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      metalness: 0.08,
      roughness: 0.02,
      transmission: isLowPower ? 0 : 0.94,
      transparent: true,
      opacity: isLowPower ? 0.88 : 1,
      ior: 2.417,
      thickness: 1.8,
      iridescence: 0.65,
      iridescenceIOR: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    const royalNavyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0B1938'),
      bumpMap: velvetBumpTex,
      bumpScale: 0.012,
      roughness: 0.42,
      metalness: 0.15,
      sheen: 0.9,
      sheenColor: new THREE.Color(colorScheme.champagneGold),
      side: THREE.DoubleSide,
    });

    const burgundyVelvetMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#5A1222'),
      bumpMap: velvetBumpTex,
      bumpScale: 0.014,
      roughness: 0.48,
      metalness: 0.12,
      sheen: 0.95,
      sheenColor: new THREE.Color(colorScheme.champagneGold),
      side: THREE.DoubleSide,
    });

    const pastelPinkMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F4C7D0'),
      roughness: 0.3,
      metalness: 0.05,
      clearcoat: 0.5,
    });

    const lavenderMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#DCD0EE'),
      roughness: 0.3,
      metalness: 0.08,
      clearcoat: 0.5,
    });

    const velvetTex = createVelvetPleatsTexture(
      renderer,
      colorScheme.emeraldGreen,
      colorScheme.champagneGold
    );
    const emeraldVelvetMat = new THREE.MeshPhysicalMaterial({
      map: velvetTex,
      bumpMap: velvetBumpTex,
      bumpScale: 0.015,
      color: new THREE.Color(colorScheme.emeraldGreen),
      roughness: 0.65,
      metalness: 0.08,
      sheen: 1.0,
      sheenRoughness: 0.32,
      sheenColor: new THREE.Color(colorScheme.champagneGold),
      side: THREE.DoubleSide,
    });

    // Helper: Build a Multi-Layered 3D Gold-Foiled Invitation Card Mesh with Personalized Front Face
    const buildPersonalized3DCard = (w = 3.05, h = 2.1, d = 0.036): THREE.Group => {
      const cardGroup = new THREE.Group();
      // Gold beveled outer slab
      const goldRim = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.06, h + 0.06, d * 0.85),
        champagneGoldMat
      );
      goldRim.castShadow = true;
      goldRim.receiveShadow = true;
      cardGroup.add(goldRim);

      // Front face with personalized calligraphy texture
      const cardMaterials = [
        champagneGoldMat,
        champagneGoldMat,
        champagneGoldMat,
        champagneGoldMat,
        personalizedCardFaceMat,
        ivoryPaperMat,
      ];
      const cardBody = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cardMaterials);
      cardBody.castShadow = true;
      cardBody.receiveShadow = true;
      cardGroup.add(cardBody);
      return cardGroup;
    };

    // Root Group & Clickable 3D Hero Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const clickableHeroGroup = new THREE.Group();
    rootGroup.add(clickableHeroGroup);

    // Invisible generous Hit Proxy Sphere inside clickableHeroGroup for effortless mobile/desktop touch & drag
    const hitProxyGeo = new THREE.SphereGeometry(2.35, 16, 16);
    const hitProxyMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const hitProxyMesh = new THREE.Mesh(hitProxyGeo, hitProxyMat);
    clickableHeroGroup.add(hitProxyMesh);

    // ---------------------------------------------------------
    // SEQUENCED CHOREOGRAPHY STATE OBJECT (Driven by GSAP Timeline!)
    // ---------------------------------------------------------
    const animState = {
      // Master timeline progress (0 -> 1)
      master: 0,
      // Scene 1: Luxury Envelope phases
      waxPress: 0,
      waxCrack: 0,
      ribbonUntie: 0,
      flapOpen: 0,
      cardRise: 0,
      cardTiltAndForward: 0,
      // Scene 2: Engagement Ring Box phases
      boxClaspUnlatch: 0,
      boxLidOpen: 0,
      ringElevate: 0,
      ringSpin: 0,
      diamondSparkle: 0,
      // Scene 3: Royal Doors phases
      doorHandlesPress: 0,
      doorsSwingOpen: 0,
      warmBacklightIntensity: 0,
      sanctuaryCardReveal: 0,
      // Scene 4: Silk Ribbon phases
      bowKnotLoosen: 0,
      ribbonSlideAside: 0,
      cardUnveilElevate: 0,
      // Shared Camera & Light Sweep
      cameraZoom: 0,
      cameraLift: 0,
      lightSweepX: -2.2,
    };

    // Animated Sub-References across all modes
    let envelopeFlapPivot: THREE.Group | null = null;
    let envelopeRibbonGroup: THREE.Group | null = null;
    let envelopeWaxSealGroup: THREE.Group | null = null;
    let waxSealLeftHalf: THREE.Object3D | null = null;
    let waxSealRightHalf: THREE.Object3D | null = null;
    const waxFractureShards: { mesh: THREE.Object3D; vx: number; vy: number; vz: number }[] = [];
    let envelopeRisingCard: THREE.Group | null = null;

    // Scene 2: Engagement Ring Box Refs
    let engagementRingGroup: THREE.Group | null = null;
    let jewelryBoxLidPivot: THREE.Group | null = null;
    let jewelryBoxClasp: THREE.Object3D | null = null;
    let diamondGlintStarGroup: THREE.Group | null = null;

    // Scene 3: Royal Doors Refs
    let leftRoyalDoorPivot: THREE.Group | null = null;
    let rightRoyalDoorPivot: THREE.Group | null = null;
    let leftDoorHandlePivot: THREE.Group | null = null;
    let rightDoorHandlePivot: THREE.Group | null = null;
    let royalDoorsBacklight: THREE.SpotLight | null = null;
    let royalDoorsWarmPortalMesh: THREE.Mesh | null = null;
    let royalDoorsCardGroup: THREE.Group | null = null;

    // Scene 4: Silk Ribbon Refs
    let silkCardRootGroup: THREE.Group | null = null;
    let silkLeftStrap: THREE.Object3D | null = null;
    let silkRightStrap: THREE.Object3D | null = null;
    let silkVerticalStrap: THREE.Object3D | null = null;
    let silkBowKnotCenter: THREE.Object3D | null = null;
    let silkBowLeftLoop: THREE.Object3D | null = null;
    let silkBowRightLoop: THREE.Object3D | null = null;
    let silkRibbonTailLeft: THREE.Object3D | null = null;
    let silkRibbonTailRight: THREE.Object3D | null = null;

    // Other Occasion Refs
    let leftCurtainPivot: THREE.Group | null = null;
    let rightCurtainPivot: THREE.Group | null = null;
    let theatreChandelier: THREE.Group | null = null;
    let theatreSpotlightCone: THREE.Mesh | null = null;

    let bookCoverPivot: THREE.Group | null = null;
    let palacePopUpGroup: THREE.Group | null = null;
    let fountainDropsMesh: THREE.InstancedMesh | null = null;
    const fountainDropData: { angle: number; speed: number; phase: number; radius: number }[] = [];

    let leftSwanGroup: THREE.Group | null = null;
    let rightSwanGroup: THREE.Group | null = null;
    let swanGoldenFrame: THREE.Group | null = null;

    let carriageGroup: THREE.Group | null = null;
    let carriageDoorPivot: THREE.Group | null = null;
    const carriageWheels: THREE.Object3D[] = [];

    const bloomingRosePetals: { mesh: THREE.Object3D; baseRotZ: number; ring: number }[] = [];
    let giftBoxLidGroup: THREE.Group | null = null;
    let giftBoxBowGroup: THREE.Group | null = null;

    let hennaChestLidPivot: THREE.Group | null = null;
    let hennaInnerGlowMesh: THREE.Mesh | null = null;
    let lanternBodyGroup: THREE.Group | null = null;
    let lanternCoreLight: THREE.PointLight | null = null;
    let mabkharaSmokeInstanced: THREE.InstancedMesh | null = null;

    let birthdayCakeGroup: THREE.Group | null = null;
    const candleFlames: THREE.Object3D[] = [];
    const balloonClusters: { mesh: THREE.Object3D; speed: number; baseX: number; baseY: number }[] = [];

    let gradCapMainGroup: THREE.Group | null = null;
    let gradTasselPivot: THREE.Group | null = null;
    let gradConfettiInstanced: THREE.InstancedMesh | null = null;
    const gradConfettiSeeds: { vx: number; vy: number; vz: number; rotSpeed: number }[] = [];

    let diplomaLeftRoll: THREE.Object3D | null = null;
    let diplomaRightRoll: THREE.Object3D | null = null;
    let diplomaCenterSheet: THREE.Object3D | null = null;
    let diplomaRibbonBow: THREE.Object3D | null = null;
    let diplomaLaurelWreath: THREE.Object3D | null = null;

    let fireworksInstanced: THREE.InstancedMesh | null = null;
    const fireworkSeeds: { dirX: number; dirY: number; dirZ: number; originX: number; originY: number }[] = [];

    let projectLaptopLidPivot: THREE.Group | null = null;
    let projectMajorEmblemGroup: THREE.Group | null = null;

    // =========================================================
    // BUILD 3D SCENE BY ACTIVE INTERACTION MODE
    // =========================================================
    if (activeMode === 'envelope_3d') {
      // ---------------------------------------------------------
      // SCENE 1: LUXURY ENVELOPE (الظرف الورقي الفاخر بختم الشمع المنقوش بالأحرف الأولى)
      // ---------------------------------------------------------
      scene.background = new THREE.Color(colorScheme.ivory);
      scene.fog = new THREE.FogExp2(colorScheme.ivory, 0.055);

      const envGroup = new THREE.Group();
      envGroup.position.set(0, -0.08, 0);
      clickableHeroGroup.add(envGroup);

      // 1. Back Envelope Body with Beveled Gold Edges
      const backMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.48, 2.38, 0.07),
        ivoryPaperMat
      );
      backMesh.castShadow = true;
      backMesh.receiveShadow = true;
      envGroup.add(backMesh);

      // Gold-Foil Inner Lining inside the Envelope
      const innerGoldLining = new THREE.Mesh(
        new THREE.PlaneGeometry(3.32, 2.22),
        champagneGoldMat
      );
      innerGoldLining.position.set(0, 0, 0.038);
      envGroup.add(innerGoldLining);

      // Beveled Gold Frame around Envelope
      const borderTop = new THREE.Mesh(
        new THREE.BoxGeometry(3.54, 0.045, 0.09),
        champagneGoldMat
      );
      borderTop.position.set(0, 1.18, 0.01);
      const borderBot = borderTop.clone();
      borderBot.position.set(0, -1.18, 0.01);
      const borderLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 2.4, 0.09),
        champagneGoldMat
      );
      borderLeft.position.set(-1.74, 0, 0.01);
      const borderRight = borderLeft.clone();
      borderRight.position.set(1.74, 0, 0.01);
      envGroup.add(borderTop, borderBot, borderLeft, borderRight);

      // 2. Personalized 3D Invitation Card Inside the Envelope
      envelopeRisingCard = buildPersonalized3DCard(3.06, 2.04, 0.036);
      envelopeRisingCard.position.set(0, -0.06, 0.055);
      envGroup.add(envelopeRisingCard);

      // 3. Left, Right & Bottom Folded Envelope Flaps (Forming a Realistic 3D Pocket)
      const pocketGroup = new THREE.Group();
      pocketGroup.position.set(0, 0, 0.095);

      // Left folded triangle flap
      const leftFlapShape = new THREE.Shape();
      leftFlapShape.moveTo(-1.72, 1.16);
      leftFlapShape.lineTo(-0.35, -0.05);
      leftFlapShape.lineTo(-1.72, -1.16);
      leftFlapShape.closePath();
      const sideFlapExtrude = {
        depth: 0.018,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 2,
      };
      const leftPocketFlap = new THREE.Mesh(
        new THREE.ExtrudeGeometry(leftFlapShape, sideFlapExtrude),
        ivoryPaperMat
      );
      leftPocketFlap.castShadow = true;
      leftPocketFlap.receiveShadow = true;

      // Right folded triangle flap
      const rightFlapShape = new THREE.Shape();
      rightFlapShape.moveTo(1.72, 1.16);
      rightFlapShape.lineTo(0.35, -0.05);
      rightFlapShape.lineTo(1.72, -1.16);
      rightFlapShape.closePath();
      const rightPocketFlap = new THREE.Mesh(
        new THREE.ExtrudeGeometry(rightFlapShape, sideFlapExtrude),
        ivoryPaperMat
      );
      rightPocketFlap.castShadow = true;
      rightPocketFlap.receiveShadow = true;

      // Bottom trapezoidal pocket flap overlapping the side flaps
      const botFlapShape = new THREE.Shape();
      botFlapShape.moveTo(-1.72, -1.17);
      botFlapShape.lineTo(1.72, -1.17);
      botFlapShape.lineTo(0.48, 0.12);
      botFlapShape.lineTo(-0.48, 0.12);
      botFlapShape.closePath();
      const botPocketFlap = new THREE.Mesh(
        new THREE.ExtrudeGeometry(botFlapShape, sideFlapExtrude),
        ivoryPaperMat
      );
      botPocketFlap.position.z = 0.015;
      botPocketFlap.castShadow = true;
      botPocketFlap.receiveShadow = true;

      pocketGroup.add(leftPocketFlap, rightPocketFlap, botPocketFlap);
      envGroup.add(pocketGroup);

      // 4. Hinged Top Triangular Envelope Flap (Rotates naturally on top crease)
      envelopeFlapPivot = new THREE.Group();
      envelopeFlapPivot.position.set(0, 1.17, 0.12);
      const topFlapShape = new THREE.Shape();
      topFlapShape.moveTo(-1.72, 0);
      topFlapShape.lineTo(1.72, 0);
      topFlapShape.lineTo(0, -1.36);
      topFlapShape.closePath();
      const topFlapGeo = new THREE.ExtrudeGeometry(topFlapShape, {
        depth: 0.022,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 3,
      });
      const topFlapMesh = new THREE.Mesh(topFlapGeo, ivoryPaperMat);
      topFlapMesh.castShadow = true;
      topFlapMesh.receiveShadow = true;

      // Gold trim along the V-edge of the top flap
      const vTrimLeft = new THREE.Mesh(
        new THREE.BoxGeometry(2.18, 0.032, 0.03),
        champagneGoldMat
      );
      vTrimLeft.position.set(-0.86, -0.68, 0.016);
      vTrimLeft.rotation.z = -0.67;
      const vTrimRight = new THREE.Mesh(
        new THREE.BoxGeometry(2.18, 0.032, 0.03),
        champagneGoldMat
      );
      vTrimRight.position.set(0.86, -0.68, 0.016);
      vTrimRight.rotation.z = 0.67;

      envelopeFlapPivot.add(topFlapMesh, vTrimLeft, vTrimRight);
      envGroup.add(envelopeFlapPivot);

      // 5. Satin Silk Ribbon Cross-Bands
      envelopeRibbonGroup = new THREE.Group();
      const horizRibbon = new THREE.Mesh(
        new THREE.BoxGeometry(3.54, 0.22, 0.18),
        silkRibbonMat
      );
      horizRibbon.position.set(0, -0.14, 0.07);
      const vertRibbon = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 2.44, 0.18),
        silkRibbonMat
      );
      vertRibbon.position.set(0, 0, 0.07);
      envelopeRibbonGroup.add(horizRibbon, vertRibbon);
      envGroup.add(envelopeRibbonGroup);

      // 6. Fracturable 3D Monogram Wax Seal (Left Half + Right Half + Fracture Shards)
      envelopeWaxSealGroup = new THREE.Group();
      envelopeWaxSealGroup.position.set(0, -0.14, 0.19);

      const leftSealGroup = new THREE.Group();
      const leftOuter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.43, 0.075, 32, 1, false, 0, Math.PI),
        antiqueGoldMat
      );
      leftOuter.rotation.x = Math.PI / 2;
      const leftInner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.095, 32, 1, false, 0, Math.PI),
        monogramWaxMat
      );
      leftInner.rotation.x = Math.PI / 2;
      leftSealGroup.add(leftOuter, leftInner);
      waxSealLeftHalf = leftSealGroup;

      const rightSealGroup = new THREE.Group();
      const rightOuter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.43, 0.075, 32, 1, false, Math.PI, Math.PI),
        antiqueGoldMat
      );
      rightOuter.rotation.x = Math.PI / 2;
      const rightInner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.095, 32, 1, false, Math.PI, Math.PI),
        monogramWaxMat
      );
      rightInner.rotation.x = Math.PI / 2;
      rightSealGroup.add(rightOuter, rightInner);
      waxSealRightHalf = rightSealGroup;

      envelopeWaxSealGroup.add(leftSealGroup, rightSealGroup);

      // 8 tiny wax fracture shards that burst outward when the seal cracks
      const shardGeo = new THREE.DodecahedronGeometry(0.038, 0);
      for (let s = 0; s < 8; s++) {
        const ang = (s / 8) * Math.PI * 2;
        const shard = new THREE.Mesh(shardGeo, antiqueGoldMat);
        shard.scale.setScalar(0.001);
        envelopeWaxSealGroup.add(shard);
        waxFractureShards.push({
          mesh: shard,
          vx: Math.cos(ang) * (0.45 + (s % 3) * 0.18),
          vy: Math.sin(ang) * (0.45 + (s % 2) * 0.2),
          vz: 0.35 + (s % 3) * 0.15,
        });
      }

      envGroup.add(envelopeWaxSealGroup);

      // Surrounding 3D White Roses & Golden Pearls
      [
        [-2.02, 1.12, 0.15],
        [2.02, 1.08, 0.15],
        [-1.92, -1.16, 0.2],
        [1.95, -1.12, 0.2],
      ].forEach(([rx, ry, rz]) => {
        const r = build3DRoseGroup(pearlWhiteMat, champagneGoldMat, 1.08);
        r.position.set(rx, ry, rz);
        r.rotation.x = 0.48;
        rootGroup.add(r);
      });
    } else if (
      activeMode === 'engagement_jewelry_box_3d' ||
      activeMode === 'engagement_ring_3d'
    ) {
      // ---------------------------------------------------------
      // SCENE 2: ENGAGEMENT RING BOX (علبة الخاتم المخملية بحركة مفصل واقعية وخاتم ألماسي)
      // ---------------------------------------------------------
      scene.background = new THREE.Color('#191114');
      scene.fog = new THREE.FogExp2('#191114', 0.055);

      const boxRoot = new THREE.Group();
      boxRoot.position.set(0, -0.42, 0);
      boxRoot.rotation.x = 0.16;
      clickableHeroGroup.add(boxRoot);

      // Plush Velvet Jewelry Box Base with Chamfered Gold Molding
      const baseBox = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.85, 2.35),
        royalVelvetBoxMat
      );
      baseBox.position.y = -0.38;
      baseBox.castShadow = true;
      baseBox.receiveShadow = true;

      const lowerGoldBaseRim = new THREE.Mesh(
        new THREE.BoxGeometry(2.44, 0.08, 2.44),
        champagneGoldMat
      );
      lowerGoldBaseRim.position.y = -0.78;

      const midGoldSeamRim = new THREE.Mesh(
        new THREE.BoxGeometry(2.42, 0.09, 2.42),
        champagneGoldMat
      );
      midGoldSeamRim.position.y = 0.02;

      // Tufted Velvet Ring Cushion with Recessed Center Slot
      const cushionLeft = new THREE.Mesh(
        new THREE.BoxGeometry(1.98, 0.28, 0.88),
        pearlWhiteMat
      );
      cushionLeft.position.set(0, 0.04, -0.48);
      const cushionRight = new THREE.Mesh(
        new THREE.BoxGeometry(1.98, 0.28, 0.88),
        pearlWhiteMat
      );
      cushionRight.position.set(0, 0.04, 0.48);

      // Front Golden Clasp Lock
      jewelryBoxClasp = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.22, 0.12),
        champagneGoldMat
      );
      jewelryBoxClasp.position.set(0, 0.04, 1.22);

      // Rear Brass Hinge Barrel
      const brassHinge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 1.4, 16),
        antiqueGoldMat
      );
      brassHinge.rotation.z = Math.PI / 2;
      brassHinge.position.set(0, 0.06, -1.18);

      boxRoot.add(
        baseBox,
        lowerGoldBaseRim,
        midGoldSeamRim,
        cushionLeft,
        cushionRight,
        jewelryBoxClasp,
        brassHinge
      );

      // Hinged Upper Velvet Lid (Rotates realistically around the rear brass hinge!)
      jewelryBoxLidPivot = new THREE.Group();
      jewelryBoxLidPivot.position.set(0, 0.06, -1.18);

      const lidOuterShell = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.62, 2.35),
        royalVelvetBoxMat
      );
      lidOuterShell.position.set(0, 0.31, 1.18);
      lidOuterShell.castShadow = true;

      const lidGoldTopFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2.15, 0.05, 2.15),
        champagneGoldMat
      );
      lidGoldTopFrame.position.set(0, 0.62, 1.18);

      // Monogram Medallion on Top of Lid
      const lidMonogramSeal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.06, 32),
        monogramWaxMat
      );
      lidMonogramSeal.position.set(0, 0.64, 1.18);

      // Silk Satin Interior Lining + Personalized Couple Nameplate inside the Lid!
      const lidSilkInterior = new THREE.Mesh(
        new THREE.BoxGeometry(2.12, 0.06, 2.12),
        pearlWhiteMat
      );
      lidSilkInterior.position.set(0, 0.03, 1.18);

      const insideCardPlaque = new THREE.Mesh(
        new THREE.PlaneGeometry(1.75, 1.22),
        personalizedCardFaceMat
      );
      insideCardPlaque.rotation.x = Math.PI / 2;
      insideCardPlaque.position.set(0, -0.01, 1.18);

      jewelryBoxLidPivot.add(
        lidOuterShell,
        lidGoldTopFrame,
        lidMonogramSeal,
        lidSilkInterior,
        insideCardPlaque
      );
      boxRoot.add(jewelryBoxLidPivot);

      // 3D Solitaire Brilliant-Cut Diamond & 24K Gold Ring
      engagementRingGroup = new THREE.Group();
      engagementRingGroup.position.set(0, 0.32, 0);

      const ringBand = new THREE.Mesh(
        new THREE.TorusGeometry(0.54, 0.068, 24, 64),
        champagneGoldMat
      );
      ringBand.castShadow = true;
      engagementRingGroup.add(ringBand);

      // Gallery Rail & 6 Tapered Gold Prongs
      const galleryRail = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.018, 12, 32),
        champagneGoldMat
      );
      galleryRail.rotation.x = Math.PI / 2;
      galleryRail.position.set(0, 0.64, 0);
      engagementRingGroup.add(galleryRail);

      for (let p = 0; p < 6; p++) {
        const ang = (p / 6) * Math.PI * 2;
        const prong = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.012, 0.3, 10),
          champagneGoldMat
        );
        prong.position.set(Math.cos(ang) * 0.18, 0.66, Math.sin(ang) * 0.18);
        prong.rotation.z = -Math.cos(ang) * 0.26;
        prong.rotation.x = Math.sin(ang) * 0.26;
        engagementRingGroup.add(prong);
      }

      // Multi-Faceted Brilliant Diamond Crown + Pavilion
      const diamondCrown = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.32, 2),
        diamondCrystalMat
      );
      diamondCrown.scale.set(1.12, 0.86, 1.12);
      diamondCrown.position.set(0, 0.76, 0);
      engagementRingGroup.add(diamondCrown);

      // Optical Dispersion Glint Star Rays on the Diamond
      diamondGlintStarGroup = new THREE.Group();
      diamondGlintStarGroup.position.set(0, 0.88, 0.18);
      const glintMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
      });
      const ray1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.018, 0.018), glintMat);
      const ray2 = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.75, 0.018), glintMat);
      const ray3 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.014, 0.014), glintMat);
      ray3.rotation.z = Math.PI / 4;
      const ray4 = ray3.clone();
      ray4.rotation.z = -Math.PI / 4;
      diamondGlintStarGroup.add(ray1, ray2, ray3, ray4);
      diamondGlintStarGroup.scale.setScalar(0.001);
      engagementRingGroup.add(diamondGlintStarGroup);

      boxRoot.add(engagementRingGroup);
    } else if (activeMode === 'royal_doors_3d') {
      // ---------------------------------------------------------
      // SCENE 3: ROYAL DOORS (البابان الملكيان الفاخران بمقابض معدنية وإضاءة دافئة خلفية)
      // ---------------------------------------------------------
      scene.background = new THREE.Color('#120E0B');
      scene.fog = new THREE.FogExp2('#120E0B', 0.055);

      const portalRoot = new THREE.Group();
      portalRoot.position.set(0, -0.15, 0);
      clickableHeroGroup.add(portalRoot);

      // Polished Palace Marble Floor
      const marbleFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 12),
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#1A1410'),
          roughness: 0.12,
          metalness: 0.3,
          clearcoat: 0.92,
        })
      );
      marbleFloor.rotation.x = -Math.PI / 2;
      marbleFloor.position.y = -2.05;
      marbleFloor.receiveShadow = true;
      rootGroup.add(marbleFloor);

      // Architectural Fluted Columns & Grand Royal Pediment Arch
      [-2.18, 2.18].forEach((colX) => {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.26, 4.35, 24),
          pearlWhiteMat
        );
        pillar.position.set(colX, 0.12, 0.35);
        pillar.castShadow = true;

        const basePlinth = new THREE.Mesh(
          new THREE.BoxGeometry(0.68, 0.35, 0.68),
          champagneGoldMat
        );
        basePlinth.position.set(colX, -1.9, 0.35);

        const capital = new THREE.Mesh(
          new THREE.BoxGeometry(0.66, 0.28, 0.66),
          champagneGoldMat
        );
        capital.position.set(colX, 2.22, 0.35);

        portalRoot.add(pillar, basePlinth, capital);
      });

      // Top Royal Architrave & Monogram Crest
      const architrave = new THREE.Mesh(
        new THREE.BoxGeometry(5.1, 0.42, 0.58),
        champagneGoldMat
      );
      architrave.position.set(0, 2.48, 0.38);
      const topCrestSeal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.12, 32),
        monogramWaxMat
      );
      topCrestSeal.rotation.x = Math.PI / 2;
      topCrestSeal.position.set(0, 2.52, 0.68);
      portalRoot.add(architrave, topCrestSeal);

      // Warm Golden Backlight & Sanctuary Glow behind the Royal Doors
      royalDoorsBacklight = new THREE.SpotLight(0xffe4a0, 0.35, 16, Math.PI / 2.5, 0.65);
      royalDoorsBacklight.position.set(0, 0.4, -2.4);
      royalDoorsBacklight.target.position.set(0, 0.1, 2.5);
      portalRoot.add(royalDoorsBacklight);
      portalRoot.add(royalDoorsBacklight.target);

      const portalGlowMat = new THREE.MeshBasicMaterial({
        color: 0xffebb3,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      });
      royalDoorsWarmPortalMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.95, 4.15),
        portalGlowMat
      );
      royalDoorsWarmPortalMesh.position.set(0, 0.12, -0.55);
      portalRoot.add(royalDoorsWarmPortalMesh);

      // 3D Personalized Invitation Card Waiting Behind the Royal Doors
      royalDoorsCardGroup = buildPersonalized3DCard(3.0, 2.04, 0.04);
      royalDoorsCardGroup.position.set(0, 0.12, -0.35);
      royalDoorsCardGroup.scale.setScalar(0.84);
      portalRoot.add(royalDoorsCardGroup);

      // Helper to build each Carved Palace Door Wing + Articulated Metallic Handle
      const buildDoorWing = (isLeft: boolean): { doorPivot: THREE.Group; handlePivot: THREE.Group } => {
        const dir = isLeft ? 1 : -1;
        const doorPivot = new THREE.Group();
        doorPivot.position.set(isLeft ? -1.92 : 1.92, 0.12, 0.32);

        // Main Carved Door Leaf
        const doorLeaf = new THREE.Mesh(
          new THREE.BoxGeometry(1.9, 4.12, 0.14),
          carvedPalaceDoorMat
        );
        doorLeaf.position.set(dir * 0.95, 0, 0);
        doorLeaf.castShadow = true;
        doorLeaf.receiveShadow = true;
        doorPivot.add(doorLeaf);

        // Gold Leaf Beveled Inner Moulding Frame
        const goldFrameOuter = new THREE.Mesh(
          new THREE.BoxGeometry(1.62, 3.82, 0.16),
          champagneGoldMat
        );
        goldFrameOuter.position.set(dir * 0.95, 0, 0);
        const innerRecess = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 3.7, 0.165),
          carvedPalaceDoorMat
        );
        innerRecess.position.set(dir * 0.95, 0, 0);
        doorPivot.add(goldFrameOuter, innerRecess);

        // Raised Royal Arabesque Medallion in Middle of Door
        const doorMedallion = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.35, 0.06, 24),
          champagneGoldMat
        );
        doorMedallion.rotation.x = Math.PI / 2;
        doorMedallion.position.set(dir * 0.95, 0.48, 0.09);
        doorPivot.add(doorMedallion);

        // Escutcheon Lock Plate near Center Seam
        const handleX = isLeft ? 1.66 : -1.66;
        const lockPlate = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.58, 0.04),
          antiqueGoldMat
        );
        lockPlate.position.set(handleX, -0.12, 0.09);
        doorPivot.add(lockPlate);

        // Articulated 3D Cast-Gold Lever Handle (rotates downward on touch!)
        const handlePivot = new THREE.Group();
        handlePivot.position.set(handleX, -0.05, 0.12);

        const spindle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.045, 0.12, 16),
          champagneGoldMat
        );
        spindle.rotation.x = Math.PI / 2;
        const leverArm = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 0.055, 0.055),
          champagneGoldMat
        );
        leverArm.position.set(-dir * 0.14, 0, 0.05);
        const leverKnob = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 14, 14),
          champagneGoldMat
        );
        leverKnob.position.set(-dir * 0.3, 0, 0.05);

        handlePivot.add(spindle, leverArm, leverKnob);
        doorPivot.add(handlePivot);

        return { doorPivot, handlePivot };
      };

      const leftDoor = buildDoorWing(true);
      const rightDoor = buildDoorWing(false);
      leftRoyalDoorPivot = leftDoor.doorPivot;
      rightRoyalDoorPivot = rightDoor.doorPivot;
      leftDoorHandlePivot = leftDoor.handlePivot;
      rightDoorHandlePivot = rightDoor.handlePivot;

      portalRoot.add(leftRoyalDoorPivot, rightRoyalDoorPivot);
    } else if (activeMode === 'silk_ribbon_3d') {
      // ---------------------------------------------------------
      // SCENE 4: SILK RIBBON (بطاقة الدعوة المغلفة بشريط حريري مع تفاعل السحب باللمس وانفكاك العقدة)
      // ---------------------------------------------------------
      scene.background = new THREE.Color(colorScheme.ivory);
      scene.fog = new THREE.FogExp2(colorScheme.ivory, 0.05);

      silkCardRootGroup = new THREE.Group();
      silkCardRootGroup.position.set(0, -0.04, 0);
      clickableHeroGroup.add(silkCardRootGroup);

      // 1. Luxury Heavyweight Personalized 3D Invitation Card
      const mainCard = buildPersonalized3DCard(3.38, 2.28, 0.055);
      silkCardRootGroup.add(mainCard);

      // 2. Left & Right Horizontal Satin Silk Ribbon Straps
      silkLeftStrap = new THREE.Mesh(
        new THREE.BoxGeometry(1.74, 0.28, 0.075),
        silkRibbonMat
      );
      silkLeftStrap.position.set(-0.86, 0, 0.01);
      silkLeftStrap.castShadow = true;

      silkRightStrap = new THREE.Mesh(
        new THREE.BoxGeometry(1.74, 0.28, 0.075),
        silkRibbonMat
      );
      silkRightStrap.position.set(0.86, 0, 0.01);
      silkRightStrap.castShadow = true;

      // 3. Vertical Satin Silk Ribbon Wrap
      silkVerticalStrap = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 2.34, 0.078),
        silkRibbonMat
      );
      silkVerticalStrap.position.set(0, 0, 0.012);
      silkVerticalStrap.castShadow = true;

      silkCardRootGroup.add(silkLeftStrap, silkRightStrap, silkVerticalStrap);

      // 4. Sculpted 3D Silk Bow Knot & Loops + Flowing Ribbon Tails
      const bowGroup = new THREE.Group();
      bowGroup.position.set(0, 0, 0.068);

      // Center gathered silk knot
      const knotGeo = new THREE.SphereGeometry(0.19, 20, 16);
      knotGeo.scale(1.15, 0.95, 0.65);
      silkBowKnotCenter = new THREE.Mesh(knotGeo, silkRibbonMat);
      bowGroup.add(silkBowKnotCenter);

      // Left & Right 3D Satin Bow Loops
      const loopGeo = new THREE.TorusGeometry(0.36, 0.095, 16, 36);
      loopGeo.scale(1.25, 0.72, 0.55);

      const leftLoopPivot = new THREE.Group();
      const leftLoopMesh = new THREE.Mesh(loopGeo, silkRibbonMat);
      leftLoopMesh.position.set(-0.38, 0.06, 0);
      leftLoopMesh.rotation.z = 0.22;
      leftLoopPivot.add(leftLoopMesh);
      silkBowLeftLoop = leftLoopPivot;

      const rightLoopPivot = new THREE.Group();
      const rightLoopMesh = new THREE.Mesh(loopGeo, silkRibbonMat);
      rightLoopMesh.position.set(0.38, 0.06, 0);
      rightLoopMesh.rotation.z = -0.22;
      rightLoopPivot.add(rightLoopMesh);
      silkBowRightLoop = rightLoopPivot;

      // Flowing Silk Ribbon Tails (for Touch Dragging!)
      const leftTailCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.08, -0.08, 0),
        new THREE.Vector3(-0.32, -0.45, 0.08),
        new THREE.Vector3(-0.48, -0.88, 0.04),
        new THREE.Vector3(-0.68, -1.25, 0.09)
      );
      silkRibbonTailLeft = new THREE.Mesh(
        new THREE.TubeGeometry(leftTailCurve, 24, 0.085, 10, false),
        silkRibbonMat
      );
      silkRibbonTailLeft.scale.set(1.2, 1, 0.35);

      const rightTailCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0.08, -0.08, 0),
        new THREE.Vector3(0.32, -0.45, 0.08),
        new THREE.Vector3(0.48, -0.88, 0.04),
        new THREE.Vector3(0.68, -1.25, 0.09)
      );
      silkRibbonTailRight = new THREE.Mesh(
        new THREE.TubeGeometry(rightTailCurve, 24, 0.085, 10, false),
        silkRibbonMat
      );
      silkRibbonTailRight.scale.set(1.2, 1, 0.35);

      bowGroup.add(
        leftLoopPivot,
        rightLoopPivot,
        silkRibbonTailLeft,
        silkRibbonTailRight
      );
      silkCardRootGroup.add(bowGroup);
    } else if (activeMode === 'curtain_3d') {
      scene.background = new THREE.Color(colorScheme.royalBlack);
      scene.fog = new THREE.FogExp2(colorScheme.royalBlack, 0.065);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 10),
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#1A120E'),
          roughness: 0.15,
          metalness: 0.35,
          clearcoat: 0.9,
        })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.85;
      rootGroup.add(floor);

      theatreChandelier = new THREE.Group();
      theatreChandelier.position.set(0, 1.85, -0.2);
      for (let ring = 0; ring < 3; ring++) {
        const radius = 0.55 - ring * 0.15;
        const ringMesh = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.025, 12, 32),
          champagneGoldMat
        );
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = -ring * 0.18;
        theatreChandelier.add(ringMesh);
      }
      rootGroup.add(theatreChandelier);

      const coneGeo = new THREE.ConeGeometry(2.2, 4.5, 32, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorScheme.champagneGold),
        transparent: true,
        opacity: 0.09,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      theatreSpotlightCone = new THREE.Mesh(coneGeo, coneMat);
      theatreSpotlightCone.position.set(0, 0.2, -0.3);
      rootGroup.add(theatreSpotlightCone);

      // Personalized 3D Card on Stage behind Curtains
      const stageCard = buildPersonalized3DCard(2.9, 1.95, 0.04);
      stageCard.position.set(0, -0.05, -0.25);
      rootGroup.add(stageCard);

      const curtainGeo = new THREE.PlaneGeometry(2.45, 4.4, 24, 16);
      const posAttr = curtainGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        posAttr.setZ(i, Math.sin(posAttr.getX(i) * 10) * 0.11);
      }
      curtainGeo.computeVertexNormals();

      leftCurtainPivot = new THREE.Group();
      leftCurtainPivot.position.set(-2.35, 0.1, 0.55);
      const leftCurtainMesh = new THREE.Mesh(curtainGeo, emeraldVelvetMat);
      leftCurtainMesh.position.set(1.18, 0, 0);
      leftCurtainPivot.add(leftCurtainMesh);

      rightCurtainPivot = new THREE.Group();
      rightCurtainPivot.position.set(2.35, 0.1, 0.55);
      const rightCurtainMesh = new THREE.Mesh(curtainGeo, emeraldVelvetMat);
      rightCurtainMesh.position.set(-1.18, 0, 0);
      rightCurtainPivot.add(rightCurtainMesh);

      clickableHeroGroup.add(leftCurtainPivot, rightCurtainPivot);

      const archBar = new THREE.Mesh(
        new THREE.BoxGeometry(5.1, 0.32, 0.25),
        champagneGoldMat
      );
      archBar.position.set(0, 2.15, 0.68);
      clickableHeroGroup.add(archBar);
    } else if (activeMode === 'popup_book_3d' || activeMode === 'graduation_popup_book_3d') {
      const isGradBook = activeMode === 'graduation_popup_book_3d';
      const bgHex = isGradBook ? '#0B1938' : colorScheme.ivory;
      scene.background = new THREE.Color(bgHex);
      scene.fog = new THREE.FogExp2(bgHex, 0.055);

      const bookCoverMaterial = isGradBook ? royalNavyMat : emeraldVelvetMat;

      const bookRoot = new THREE.Group();
      bookRoot.position.set(0, -0.95, 0);
      bookRoot.rotation.x = 0.32;
      clickableHeroGroup.add(bookRoot);

      const baseCover = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 2.6), bookCoverMaterial);
      const goldPageBlock = new THREE.Mesh(
        new THREE.BoxGeometry(3.64, 0.18, 2.46),
        champagneGoldMat
      );
      goldPageBlock.position.y = 0.1;
      const parchmentSurface = new THREE.Mesh(
        new THREE.BoxGeometry(3.56, 0.04, 2.38),
        ivoryPaperMat
      );
      parchmentSurface.position.y = 0.2;
      bookRoot.add(baseCover, goldPageBlock, parchmentSurface);

      bookCoverPivot = new THREE.Group();
      bookCoverPivot.position.set(-1.85, 0.22, 0);
      const topCoverMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.1, 2.6),
        bookCoverMaterial
      );
      topCoverMesh.position.set(1.85, 0.06, 0);
      const topGoldFrame = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.12, 2.3),
        champagneGoldMat
      );
      topGoldFrame.position.set(1.85, 0.07, 0);
      bookCoverPivot.add(topCoverMesh, topGoldFrame);
      bookRoot.add(bookCoverPivot);

      palacePopUpGroup = new THREE.Group();
      palacePopUpGroup.position.set(0, 0.22, -0.15);
      palacePopUpGroup.scale.set(1, 0.01, 1);
      bookRoot.add(palacePopUpGroup);

      const centralHall = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 1.35, 0.65),
        pearlWhiteMat
      );
      centralHall.position.set(0, 0.68, -0.45);
      palacePopUpGroup.add(centralHall);

      for (let col = -3; col <= 3; col++) {
        const colX = col * 0.24;
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.05, 1.25, 16),
          pearlWhiteMat
        );
        pillar.position.set(colX, 0.63, -0.08);
        palacePopUpGroup.add(pillar);
      }

      const mainDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.46, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        champagneGoldMat
      );
      mainDome.position.set(0, 1.35, -0.45);
      palacePopUpGroup.add(mainDome);

      if (isGradBook) {
        const { capGroup } = build3DGraduationCap(royalNavyMat, champagneGoldMat, 0.55);
        capGroup.position.set(0, 1.92, -0.2);
        palacePopUpGroup.add(capGroup);

        const wreath = build3DLaurelWreath(champagneGoldMat, 0.65);
        wreath.position.set(0, 0.75, 0.35);
        palacePopUpGroup.add(wreath);

        const miniScroll = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.85, 18),
          ivoryPaperMat
        );
        miniScroll.rotation.z = Math.PI / 2;
        miniScroll.position.set(0, 0.22, 0.55);
        palacePopUpGroup.add(miniScroll);
      } else {
        const dropCount = 32;
        const dropGeo = new THREE.SphereGeometry(0.026, 8, 8);
        const dropMat = new THREE.MeshPhysicalMaterial({
          color: 0xdff9fb,
          roughness: 0.1,
          clearcoat: 1.0,
        });
        fountainDropsMesh = new THREE.InstancedMesh(dropGeo, dropMat, dropCount);
        fountainDropsMesh.frustumCulled = false;
        for (let i = 0; i < dropCount; i++) {
          fountainDropData.push({
            angle: (i / (dropCount / 2)) * Math.PI * 2,
            speed: 1.2 + (i % 5) * 0.15,
            phase: (i / dropCount) * Math.PI * 2,
            radius: 0.18,
          });
        }
        palacePopUpGroup.add(fountainDropsMesh);
      }
    } else if (activeMode === 'scene_reveal_3d') {
      scene.background = new THREE.Color(colorScheme.ivory);
      scene.fog = new THREE.FogExp2(colorScheme.ivory, 0.05);

      const lake = new THREE.Mesh(
        new THREE.CircleGeometry(4.6, 64),
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#D8E6E7'),
          roughness: 0.08,
          metalness: 0.25,
          clearcoat: 1.0,
        })
      );
      lake.rotation.x = -Math.PI / 2;
      lake.position.set(0, -1.05, 0);
      rootGroup.add(lake);

      const create3DSwan = (facingRight: boolean): THREE.Group => {
        const swan = new THREE.Group();
        const dir = facingRight ? 1 : -1;
        const bodyGeo = new THREE.SphereGeometry(0.34, 24, 18);
        bodyGeo.scale(1.45, 0.82, 0.95);
        const body = new THREE.Mesh(bodyGeo, pearlWhiteMat);
        body.position.set(-dir * 0.22, 0.15, 0);
        swan.add(body);

        const neckCurve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(dir * 0.08, 0.25, 0),
          new THREE.Vector3(dir * 0.42, 0.65, 0),
          new THREE.Vector3(dir * 0.32, 1.12, 0),
          new THREE.Vector3(dir * 0.04, 0.86, 0)
        );
        swan.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(neckCurve, 24, 0.068, 14, false),
            pearlWhiteMat
          )
        );
        return swan;
      };

      leftSwanGroup = create3DSwan(true);
      rightSwanGroup = create3DSwan(false);
      leftSwanGroup.position.set(-0.85, -1.02, 0.25);
      rightSwanGroup.position.set(0.85, -1.02, 0.25);
      clickableHeroGroup.add(leftSwanGroup, rightSwanGroup);

      swanGoldenFrame = new THREE.Group();
      swanGoldenFrame.position.set(0, 0.35, -0.65);
      swanGoldenFrame.add(
        new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.045, 16, 64), champagneGoldMat)
      );
      clickableHeroGroup.add(swanGoldenFrame);
    } else if (activeMode === 'wedding_carriage_3d') {
      scene.background = new THREE.Color(colorScheme.ivory);
      scene.fog = new THREE.FogExp2(colorScheme.ivory, 0.055);

      carriageGroup = new THREE.Group();
      carriageGroup.position.set(0, -0.2, 0);
      clickableHeroGroup.add(carriageGroup);

      const cabinBody = new THREE.Mesh(
        new THREE.SphereGeometry(1.15, 28, 22),
        pearlWhiteMat
      );
      cabinBody.scale.set(1.25, 1.0, 0.85);
      cabinBody.position.set(0, 0.35, 0);
      carriageGroup.add(cabinBody);

      const archRingFront = new THREE.Mesh(
        new THREE.TorusGeometry(1.12, 0.04, 14, 40),
        champagneGoldMat
      );
      archRingFront.scale.set(1.2, 0.96, 1);
      archRingFront.position.set(0, 0.35, 0.5);
      carriageGroup.add(archRingFront);

      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.2, 0.22, 16),
        champagneGoldMat
      );
      crown.position.set(0, 1.42, 0);
      carriageGroup.add(crown);

      carriageDoorPivot = new THREE.Group();
      carriageDoorPivot.position.set(-0.38, 0.32, 0.88);
      const doorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.76, 1.05, 0.06),
        champagneGoldMat
      );
      doorMesh.position.set(0.38, 0, 0);
      carriageDoorPivot.add(doorMesh);
      carriageGroup.add(carriageDoorPivot);

      [
        [-1.15, -0.65, 0.75],
        [1.15, -0.65, 0.75],
        [-1.15, -0.65, -0.75],
        [1.15, -0.65, -0.75],
      ].forEach(([wx, wy, wz], idx) => {
        const r = idx % 2 === 0 ? 0.52 : 0.62;
        const wheel = new THREE.Group();
        wheel.position.set(wx, wy, wz);
        wheel.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 12, 32), antiqueGoldMat));
        for (let s = 0; s < 6; s++) {
          const spoke = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, r * 2, 8),
            champagneGoldMat
          );
          spoke.rotation.z = (s / 6) * Math.PI;
          wheel.add(spoke);
        }
        carriageGroup!.add(wheel);
        carriageWheels.push(wheel);
      });
    } else if (activeMode === 'engagement_rose_3d') {
      scene.background = new THREE.Color(colorScheme.ivory);
      scene.fog = new THREE.FogExp2(colorScheme.ivory, 0.05);

      const roseRoot = new THREE.Group();
      roseRoot.position.set(0, -0.1, 0);
      roseRoot.rotation.x = 0.42;
      clickableHeroGroup.add(roseRoot);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 1.8, 16),
        champagneGoldMat
      );
      stem.position.y = -1.05;
      const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.04, 14, 36),
        champagneGoldMat
      );
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = -1.85;
      roseRoot.add(stem, baseRing);

      const pearlCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 24, 24),
        champagneGoldMat
      );
      pearlCore.position.y = 0.12;
      roseRoot.add(pearlCore);

      const petalGeo = new THREE.SphereGeometry(0.38, 18, 14);
      petalGeo.scale(1.15, 0.28, 0.85);

      for (let ring = 0; ring < 3; ring++) {
        const count = 6 + ring * 3;
        const radius = 0.24 + ring * 0.22;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + ring * 0.35;
          const pivot = new THREE.Group();
          pivot.position.set(
            Math.cos(angle) * radius,
            0.05 * ring,
            Math.sin(angle) * radius
          );
          pivot.rotation.y = -angle;
          const baseRotZ = 0.85 - ring * 0.12;
          pivot.rotation.z = baseRotZ;

          const petalMesh = new THREE.Mesh(
            petalGeo,
            ring === 0 ? pearlWhiteMat : blushPetalMat
          );
          petalMesh.position.set(0.25, 0.1, 0);
          pivot.add(petalMesh);
          roseRoot.add(pivot);

          bloomingRosePetals.push({ mesh: pivot, baseRotZ, ring });
        }
      }
    } else if (
      activeMode === 'engagement_gift_box_3d' ||
      activeMode === 'birthday_gift_box_3d'
    ) {
      const isBday = activeMode === 'birthday_gift_box_3d';
      scene.background = new THREE.Color(colorScheme.ivory);
      scene.fog = new THREE.FogExp2(colorScheme.ivory, 0.05);

      const giftRoot = new THREE.Group();
      giftRoot.position.set(0, -0.35, 0);
      clickableHeroGroup.add(giftRoot);

      const boxMat = isBday ? pastelPinkMat : pearlWhiteMat;
      const boxBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.65, 2.1), boxMat);
      const ribbonV1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 1.68, 2.14),
        silkRibbonMat
      );
      const ribbonV2 = new THREE.Mesh(
        new THREE.BoxGeometry(2.14, 1.68, 0.28),
        silkRibbonMat
      );
      giftRoot.add(boxBody, ribbonV1, ribbonV2);

      giftBoxLidGroup = new THREE.Group();
      giftBoxLidGroup.position.set(0, 0.88, 0);
      const lidBox = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.36, 2.24), boxMat);
      const lidRib1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.38, 2.28),
        silkRibbonMat
      );
      const lidRib2 = new THREE.Mesh(
        new THREE.BoxGeometry(2.28, 0.38, 0.3),
        silkRibbonMat
      );
      giftBoxLidGroup.add(lidBox, lidRib1, lidRib2);

      giftBoxBowGroup = new THREE.Group();
      giftBoxBowGroup.position.set(0, 0.25, 0);
      for (let b = 0; b < 4; b++) {
        const loop = new THREE.Mesh(
          new THREE.TorusGeometry(0.28, 0.065, 12, 24),
          silkRibbonMat
        );
        loop.rotation.y = (b * Math.PI) / 2 + Math.PI / 4;
        loop.rotation.x = 0.45;
        giftBoxBowGroup.add(loop);
      }
      giftBoxLidGroup.add(giftBoxBowGroup);
      giftRoot.add(giftBoxLidGroup);
    } else if (
      activeMode === 'henna_box_3d' ||
      activeMode === 'henna_gift_chest_3d'
    ) {
      scene.background = new THREE.Color('#1D090E');
      scene.fog = new THREE.FogExp2('#1D090E', 0.06);

      const chestRoot = new THREE.Group();
      chestRoot.position.set(0, -0.35, 0);
      clickableHeroGroup.add(chestRoot);

      const chestMat =
        activeMode === 'henna_box_3d' ? burgundyVelvetMat : emeraldVelvetMat;

      const baseChest = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.2, 1.75),
        chestMat
      );
      const goldFrameBottom = new THREE.Mesh(
        new THREE.BoxGeometry(2.58, 0.14, 1.82),
        champagneGoldMat
      );
      goldFrameBottom.position.y = -0.55;
      const goldFrameTop = goldFrameBottom.clone();
      goldFrameTop.position.y = 0.55;
      chestRoot.add(baseChest, goldFrameBottom, goldFrameTop);

      for (let i = -2; i <= 2; i++) {
        const medallion = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 0.06, 16),
          champagneGoldMat
        );
        medallion.rotation.x = Math.PI / 2;
        medallion.position.set(i * 0.45, 0, 0.9);
        chestRoot.add(medallion);
      }

      hennaInnerGlowMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.45, 0.35, 24),
        champagneGoldMat
      );
      hennaInnerGlowMesh.position.set(0, 0.45, 0);
      chestRoot.add(hennaInnerGlowMesh);

      hennaChestLidPivot = new THREE.Group();
      hennaChestLidPivot.position.set(0, 0.6, -0.88);
      const lidVault = new THREE.Mesh(
        new THREE.CylinderGeometry(0.88, 0.88, 2.5, 20, 1, false, 0, Math.PI),
        chestMat
      );
      lidVault.rotation.z = Math.PI / 2;
      lidVault.rotation.y = Math.PI / 2;
      lidVault.position.set(0, 0, 0.88);
      const lidFinial = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        champagneGoldMat
      );
      lidFinial.position.set(0, 0.92, 0.88);
      hennaChestLidPivot.add(lidVault, lidFinial);
      chestRoot.add(hennaChestLidPivot);
    } else if (activeMode === 'henna_lantern_3d') {
      scene.background = new THREE.Color('#1D090E');
      scene.fog = new THREE.FogExp2('#1D090E', 0.055);

      lanternBodyGroup = new THREE.Group();
      lanternBodyGroup.position.set(0, -0.1, 0);
      clickableHeroGroup.add(lanternBodyGroup);

      const hexBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.95, 0.32, 6),
        antiqueGoldMat
      );
      hexBase.position.y = -1.25;
      lanternBodyGroup.add(hexBase);

      const glassChamber = new THREE.Mesh(
        new THREE.CylinderGeometry(0.88, 0.72, 1.75, 6),
        new THREE.MeshPhysicalMaterial({
          color: 0xffd57e,
          transparent: true,
          opacity: 0.72,
          roughness: 0.15,
          emissive: new THREE.Color(0xd68910),
          emissiveIntensity: 0.65,
        })
      );
      glassChamber.position.y = -0.2;
      lanternBodyGroup.add(glassChamber);

      for (let c = 0; c < 6; c++) {
        const ang = (c / 6) * Math.PI * 2 + Math.PI / 6;
        const strut = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 1.82, 8),
          champagneGoldMat
        );
        strut.position.set(Math.cos(ang) * 0.82, -0.2, Math.sin(ang) * 0.82);
        lanternBodyGroup.add(strut);
      }

      const lanternDome = new THREE.Mesh(
        new THREE.ConeGeometry(0.96, 0.85, 6),
        champagneGoldMat
      );
      lanternDome.position.y = 1.08;
      const topRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.035, 12, 24),
        champagneGoldMat
      );
      topRing.position.y = 1.62;
      lanternBodyGroup.add(lanternDome, topRing);

      lanternCoreLight = new THREE.PointLight(0xffb74d, 2.2, 8);
      lanternCoreLight.position.set(0, -0.2, 0);
      lanternBodyGroup.add(lanternCoreLight);
    } else if (activeMode === 'henna_mabkhara_3d') {
      scene.background = new THREE.Color('#1D090E');
      scene.fog = new THREE.FogExp2('#1D090E', 0.055);

      const mabkharaGroup = new THREE.Group();
      mabkharaGroup.position.set(0, -0.35, 0);
      clickableHeroGroup.add(mabkharaGroup);

      const baseFoot = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.25, 1.45),
        champagneGoldMat
      );
      baseFoot.position.y = -1.1;
      const stemPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.48, 1.15, 8),
        antiqueGoldMat
      );
      stemPillar.position.y = -0.45;
      const burnerBowl = new THREE.Mesh(
        new THREE.BoxGeometry(1.55, 0.78, 1.55),
        champagneGoldMat
      );
      burnerBowl.position.y = 0.45;
      mabkharaGroup.add(baseFoot, stemPillar, burnerBowl);

      const smokeGeo = new THREE.SphereGeometry(0.16, 12, 12);
      const smokeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorScheme.champagneGold),
        transparent: true,
        opacity: 0.32,
      });
      mabkharaSmokeInstanced = new THREE.InstancedMesh(smokeGeo, smokeMat, 28);
      mabkharaSmokeInstanced.frustumCulled = false;
      mabkharaGroup.add(mabkharaSmokeInstanced);
    } else if (
      activeMode === 'birthday_cake_3d' ||
      activeMode === 'birthday_candles_3d'
    ) {
      scene.background = new THREE.Color(colorScheme.ivory);
      scene.fog = new THREE.FogExp2(colorScheme.ivory, 0.05);

      birthdayCakeGroup = new THREE.Group();
      birthdayCakeGroup.position.set(0, -0.55, 0);
      clickableHeroGroup.add(birthdayCakeGroup);

      const standPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(1.75, 1.55, 0.12, 36),
        champagneGoldMat
      );
      standPlate.position.y = -0.68;
      birthdayCakeGroup.add(standPlate);

      const tier1 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.42, 1.42, 0.72, 36),
        pearlWhiteMat
      );
      tier1.position.y = -0.26;
      const tier2 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.04, 1.04, 0.65, 36),
        pastelPinkMat
      );
      tier2.position.y = 0.42;
      const tier3 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.68, 0.55, 32),
        lavenderMat
      );
      tier3.position.y = 1.02;
      birthdayCakeGroup.add(tier1, tier2, tier3);

      const candlePositions = [
        [0, 1.45, 0],
        [-0.32, 1.42, 0.22],
        [0.32, 1.42, 0.22],
        [-0.28, 1.42, -0.25],
        [0.28, 1.42, -0.25],
      ];
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
      candlePositions.forEach(([cx, cy, cz]) => {
        const candleStick = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.045, 0.42, 14),
          pearlWhiteMat
        );
        candleStick.position.set(cx, cy, cz);
        birthdayCakeGroup!.add(candleStick);

        const flame = new THREE.Mesh(
          new THREE.SphereGeometry(0.075, 12, 12),
          flameMat
        );
        flame.scale.set(0.75, 1.6, 0.75);
        flame.position.set(cx, cy + 0.28, cz);
        birthdayCakeGroup!.add(flame);
        candleFlames.push(flame);
      });
    } else if (activeMode === 'birthday_balloons_3d') {
      scene.background = new THREE.Color(colorScheme.ivory);
      scene.fog = new THREE.FogExp2(colorScheme.ivory, 0.05);

      const balloonGroup = new THREE.Group();
      clickableHeroGroup.add(balloonGroup);

      const balloonSpecs = [
        { x: 0, y: 0.45, z: 0.2, mat: champagneGoldMat, s: 1.15 },
        { x: -0.78, y: 0.15, z: -0.1, mat: pastelPinkMat, s: 0.98 },
        { x: 0.78, y: 0.2, z: -0.1, mat: lavenderMat, s: 1.02 },
        { x: -0.42, y: -0.45, z: 0.3, mat: pearlWhiteMat, s: 0.88 },
        { x: 0.45, y: -0.4, z: 0.25, mat: champagneGoldMat, s: 0.92 },
      ];
      balloonSpecs.forEach((b, idx) => {
        const bItem = new THREE.Group();
        bItem.position.set(b.x, b.y, b.z);
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.55 * b.s, 28, 24),
          b.mat
        );
        sphere.scale.set(0.92, 1.14, 0.92);
        const stringMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.008, 1.4, 8),
          champagneGoldMat
        );
        stringMesh.position.y = -1.1;
        bItem.add(sphere, stringMesh);
        balloonGroup.add(bItem);
        balloonClusters.push({
          mesh: bItem,
          speed: 1.2 + idx * 0.2,
          baseX: b.x,
          baseY: b.y,
        });
      });
    } else if (
      activeMode === 'graduation_cap_3d' ||
      activeMode === 'graduation_night_fireworks_3d'
    ) {
      const isNightCampus = activeMode === 'graduation_night_fireworks_3d';
      scene.background = new THREE.Color('#071026');
      scene.fog = new THREE.FogExp2('#071026', 0.052);

      const stagePedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(2.3, 2.6, 0.28, 48),
        royalNavyMat
      );
      stagePedestal.position.set(0, -1.55, 0);
      const stageGoldRim = new THREE.Mesh(
        new THREE.TorusGeometry(2.32, 0.04, 14, 64),
        champagneGoldMat
      );
      stageGoldRim.rotation.x = Math.PI / 2;
      stageGoldRim.position.set(0, -1.41, 0);
      rootGroup.add(stagePedestal, stageGoldRim);

      if (isNightCampus) {
        const campusGroup = new THREE.Group();
        campusGroup.position.set(0, -1.35, -1.85);
        rootGroup.add(campusGroup);

        const mainBuilding = new THREE.Mesh(
          new THREE.BoxGeometry(4.2, 1.85, 0.9),
          royalNavyMat
        );
        mainBuilding.position.y = 0.92;
        campusGroup.add(mainBuilding);

        const winMat = new THREE.MeshBasicMaterial({ color: 0xffe082 });
        for (let r = 0; r < 2; r++) {
          for (let c = -4; c <= 4; c++) {
            if (Math.abs(c) <= 1) continue;
            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.28), winMat);
            win.position.set(c * 0.42, 0.55 + r * 0.65, 0.46);
            campusGroup.add(win);
          }
        }

        for (let p = -2; p <= 2; p++) {
          const col = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.07, 1.75, 14),
            champagneGoldMat
          );
          col.position.set(p * 0.35, 0.88, 0.52);
          campusGroup.add(col);
        }

        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.68, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          champagneGoldMat
        );
        dome.position.set(0, 1.85, 0);
        campusGroup.add(dome);

        const fwCount = 54;
        const fwGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const fwMat = new THREE.MeshBasicMaterial({ color: 0xffdf85 });
        fireworksInstanced = new THREE.InstancedMesh(fwGeo, fwMat, fwCount);
        fireworksInstanced.frustumCulled = false;
        for (let i = 0; i < fwCount; i++) {
          const cluster = i % 3;
          const originX = cluster === 0 ? -1.4 : cluster === 1 ? 1.4 : 0;
          const originY = cluster === 2 ? 1.85 : 1.35;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const speed = 0.7 + Math.random() * 1.1;
          fireworkSeeds.push({
            originX,
            originY,
            dirX: Math.sin(phi) * Math.cos(theta) * speed,
            dirY: Math.sin(phi) * Math.sin(theta) * speed,
            dirZ: Math.cos(phi) * speed * 0.5,
          });
        }
        rootGroup.add(fireworksInstanced);
      } else {
        const wreathBackdrop = build3DLaurelWreath(champagneGoldMat, 1.65);
        wreathBackdrop.position.set(0, 0.15, -0.95);
        rootGroup.add(wreathBackdrop);
      }

      const builtCap = build3DGraduationCap(royalNavyMat, champagneGoldMat, 1.25);
      gradCapMainGroup = builtCap.capGroup;
      gradTasselPivot = builtCap.tasselPivot;
      gradCapMainGroup.position.set(0, 0.1, 0.25);
      gradCapMainGroup.rotation.x = 0.26;
      clickableHeroGroup.add(gradCapMainGroup);

      const confettiCount = 48;
      const confGeo = new THREE.OctahedronGeometry(0.055, 0);
      gradConfettiInstanced = new THREE.InstancedMesh(
        confGeo,
        champagneGoldMat,
        confettiCount
      );
      gradConfettiInstanced.frustumCulled = false;
      for (let i = 0; i < confettiCount; i++) {
        const angle = (i / confettiCount) * Math.PI * 2;
        const speed = 0.8 + Math.random() * 1.6;
        gradConfettiSeeds.push({
          vx: Math.cos(angle) * speed,
          vy: 0.8 + Math.random() * 1.8,
          vz: Math.sin(angle) * speed * 0.6,
          rotSpeed: 2 + Math.random() * 4,
        });
      }
      rootGroup.add(gradConfettiInstanced);
    } else if (activeMode === 'graduation_diploma_3d') {
      scene.background = new THREE.Color('#071026');
      scene.fog = new THREE.FogExp2('#071026', 0.052);

      diplomaLaurelWreath = build3DLaurelWreath(champagneGoldMat, 1.55);
      diplomaLaurelWreath.position.set(0, 0.08, -0.45);
      clickableHeroGroup.add(diplomaLaurelWreath);

      const scrollGroup = new THREE.Group();
      scrollGroup.position.set(0, 0.05, 0.2);
      clickableHeroGroup.add(scrollGroup);

      const rollGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.95, 28);
      const leftRoll = new THREE.Mesh(rollGeo, ivoryPaperMat);
      leftRoll.position.set(-0.12, 0, 0);
      const rightRoll = new THREE.Mesh(rollGeo, ivoryPaperMat);
      rightRoll.position.set(0.12, 0, 0);
      diplomaLeftRoll = leftRoll;
      diplomaRightRoll = rightRoll;
      scrollGroup.add(leftRoll, rightRoll);

      const sheetMesh = buildPersonalized3DCard(2.4, 1.82, 0.025);
      sheetMesh.scale.set(0.05, 1, 1);
      diplomaCenterSheet = sheetMesh;
      scrollGroup.add(sheetMesh);

      const bowGroup = new THREE.Group();
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.24, 28),
        silkRibbonMat
      );
      band.rotation.z = Math.PI / 2;
      const seal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.08, 24),
        monogramWaxMat
      );
      seal.rotation.x = Math.PI / 2;
      seal.position.z = 0.26;
      bowGroup.add(band, seal);
      diplomaRibbonBow = bowGroup;
      scrollGroup.add(bowGroup);
    } else if (activeMode === 'graduation_achievement_box_3d') {
      scene.background = new THREE.Color('#071026');
      scene.fog = new THREE.FogExp2('#071026', 0.055);

      const boxRoot = new THREE.Group();
      boxRoot.position.set(0, -0.35, 0);
      clickableHeroGroup.add(boxRoot);

      const baseBox = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.85, 2.0),
        royalNavyMat
      );
      baseBox.position.y = -0.35;
      const goldTrim = new THREE.Mesh(
        new THREE.BoxGeometry(2.48, 0.12, 2.08),
        champagneGoldMat
      );
      goldTrim.position.y = 0.04;
      boxRoot.add(baseBox, goldTrim);

      jewelryBoxLidPivot = new THREE.Group();
      jewelryBoxLidPivot.position.set(0, 0.08, -1.0);
      const lidMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.45, 2.0),
        royalNavyMat
      );
      lidMesh.position.set(0, 0.22, 1.0);
      jewelryBoxLidPivot.add(lidMesh);
      boxRoot.add(jewelryBoxLidPivot);

      engagementRingGroup = new THREE.Group();
      engagementRingGroup.position.set(0, 0.35, 0);
      const medalDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.08, 32),
        champagneGoldMat
      );
      medalDisc.rotation.x = Math.PI / 2;
      const wreath = build3DLaurelWreath(champagneGoldMat, 0.65);
      engagementRingGroup.add(medalDisc, wreath);
      boxRoot.add(engagementRingGroup);
    } else if (
      activeMode === 'project_dossier_3d' ||
      activeMode === 'project_academic_book_3d' ||
      activeMode === 'project_laptop_3d' ||
      activeMode === 'project_display_board_3d'
    ) {
      scene.background = new THREE.Color('#071026');
      scene.fog = new THREE.FogExp2('#071026', 0.055);

      const silverMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#D8DEE9'),
        metalness: 0.85,
        roughness: 0.2,
        clearcoat: 0.6,
      });

      projectMajorEmblemGroup = buildMajor3DEmblem(
        major,
        champagneGoldMat,
        pearlWhiteMat,
        silverMat
      );

      if (activeMode === 'project_laptop_3d') {
        const laptopRoot = new THREE.Group();
        laptopRoot.position.set(0, -0.55, 0);
        laptopRoot.rotation.x = 0.28;
        clickableHeroGroup.add(laptopRoot);

        const kbBase = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 0.1, 1.9),
          silverMat
        );
        const kbWell = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 0.11, 1.1),
          royalNavyMat
        );
        kbWell.position.set(0, 0.01, -0.15);
        laptopRoot.add(kbBase, kbWell);

        projectLaptopLidPivot = new THREE.Group();
        projectLaptopLidPivot.position.set(0, 0.05, -0.92);
        projectLaptopLidPivot.rotation.x = Math.PI * 0.46;

        const lidShell = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 1.85, 0.08),
          silverMat
        );
        lidShell.position.set(0, 0.92, 0);
        const screenGlow = new THREE.Mesh(
          new THREE.BoxGeometry(2.58, 1.65, 0.09),
          personalizedCardFaceMat
        );
        screenGlow.position.set(0, 0.92, 0.01);
        const goldBorder = new THREE.Mesh(
          new THREE.BoxGeometry(2.64, 1.7, 0.085),
          champagneGoldMat
        );
        goldBorder.position.set(0, 0.92, 0.005);
        projectLaptopLidPivot.add(lidShell, goldBorder, screenGlow);
        laptopRoot.add(projectLaptopLidPivot);

        projectMajorEmblemGroup.position.set(0, 0.85, 0.15);
        projectMajorEmblemGroup.scale.setScalar(0.01);
        laptopRoot.add(projectMajorEmblemGroup);
      } else {
        const folderRoot = new THREE.Group();
        folderRoot.position.set(0, -0.45, 0);
        folderRoot.rotation.x = 0.3;
        clickableHeroGroup.add(folderRoot);

        const baseBoard = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.12, 2.2),
          royalNavyMat
        );
        const innerPage = new THREE.Mesh(
          new THREE.BoxGeometry(3.0, 0.14, 2.0),
          personalizedCardFaceMat
        );
        innerPage.position.y = 0.05;
        folderRoot.add(baseBoard, innerPage);

        bookCoverPivot = new THREE.Group();
        bookCoverPivot.position.set(-1.58, 0.14, 0);
        const topCover = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.09, 2.2),
          royalNavyMat
        );
        topCover.position.set(1.58, 0.05, 0);
        const goldSeal = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.32, 0.12, 24),
          monogramWaxMat
        );
        goldSeal.position.set(1.58, 0.08, 0);
        bookCoverPivot.add(topCover, goldSeal);
        folderRoot.add(bookCoverPivot);

        projectMajorEmblemGroup.position.set(0, 0.95, 0);
        projectMajorEmblemGroup.scale.setScalar(0.01);
        folderRoot.add(projectMajorEmblemGroup);
      }
    }

    // =========================================================
    // FLOATING AMBIENT BOKEH PARTICLES
    // =========================================================
    const particleCount = isLowPower ? 18 : 32;
    const petalGeo = new THREE.SphereGeometry(0.04, 8, 8);
    petalGeo.scale(1.2, 0.3, 0.8);
    const petalsInstanced = new THREE.InstancedMesh(
      petalGeo,
      champagneGoldMat,
      particleCount
    );
    petalsInstanced.frustumCulled = false;
    rootGroup.add(petalsInstanced);

    const particleSeeds = Array.from({ length: particleCount }).map((_, i) => ({
      x: (Math.random() - 0.5) * 4.8,
      y: (Math.random() - 0.5) * 4.2,
      z: (Math.random() - 0.5) * 2.2 + 0.5,
      speedY: 0.2 + (i % 5) * 0.05,
      phase: Math.random() * Math.PI * 2,
    }));

    // =========================================================
    // GSAP TIMELINE SEQUENCED CHOREOGRAPHY BUILDER
    // =========================================================
    const buildSequencedGSAPTimeline = () => {
      if (gsapTimelineRef.current) {
        gsapTimelineRef.current.kill();
      }

      const timeScale = prefersReducedMotion ? 1.8 : 1.0;

      const tl = gsap.timeline({
        paused: true,
        onUpdate: () => {
          const p = tl.progress();
          if (p > 0.72) {
            setDofBlurStrength(Math.min(6, ((p - 0.72) / 0.28) * 5));
          }
        },
        onComplete: () => {
          if (!completionFiredRef.current) {
            completionFiredRef.current = true;
            onAnimationCompleteRef.current?.();
          }
        },
      });
      tl.timeScale(timeScale);

      if (activeMode === 'envelope_3d') {
        // -----------------------------------------------------
        // SCENE 1 GSAP TIMELINE: LUXURY ENVELOPE (Sequential, Non-Simultaneous!)
        // -----------------------------------------------------
        // Phase 1 (0.00s - 0.42s): Touch & Crack the Monogram Wax Seal
        tl.call(() => {
          onTimelineProgressRef.current?.(0.15, 'كسر ختم الشمع الملكي...', 'Breaking the Monogram Wax Seal...');
          if (enableSfxRef.current) soundEngine.playWaxSealCrack();
        }, [], 0);
        tl.to(animState, { waxPress: 1, duration: 0.14, ease: 'power2.in' }, 0);
        tl.to(animState, { waxCrack: 1, duration: 0.42, ease: 'power3.out' }, 0.12);

        // Phase 2 (0.34s - 0.82s): Silk Ribbon Loosens & Glides Off
        tl.call(() => {
          onTimelineProgressRef.current?.(0.38, 'انفكاك الشريط الحريري...', 'Untying the Silk Ribbon...');
        }, [], 0.34);
        tl.to(animState, { ribbonUntie: 1, duration: 0.52, ease: 'power2.inOut' }, 0.34);

        // Phase 3 (0.68s - 1.32s): Top Envelope Flap Hinges Open Naturally
        tl.call(() => {
          onTimelineProgressRef.current?.(0.62, 'فتح غطاء الظرف الفاخر...', 'Opening the Luxury Envelope...');
          if (enableSfxRef.current) soundEngine.playEnvelopePaperUnfold();
        }, [], 0.68);
        tl.to(animState, { flapOpen: 1, duration: 0.68, ease: 'power2.inOut' }, 0.68);

        // Phase 4 (1.12s - 1.95s): Gold-Foiled Invitation Card Slides Out & Tilts
        tl.call(() => {
          onTimelineProgressRef.current?.(0.85, 'ظهور بطاقة الدعوة...', 'Revealing the Invitation Card...');
        }, [], 1.12);
        tl.to(animState, { cardRise: 1, duration: 0.65, ease: 'power3.out' }, 1.12);
        tl.to(animState, { cardTiltAndForward: 1, duration: 0.68, ease: 'power2.inOut' }, 1.38);

        // Phase 5 (1.35s - 2.25s): Specular Light Sweep + Cinematic Camera Zoom-In
        tl.to(animState, { lightSweepX: 2.6, duration: 1.1, ease: 'sine.inOut' }, 0.95);
        tl.to(animState, { cameraZoom: 1, cameraLift: 1, master: 1, duration: 0.9, ease: 'power3.inOut' }, 1.35);
      } else if (
        activeMode === 'engagement_jewelry_box_3d' ||
        activeMode === 'engagement_ring_3d'
      ) {
        // -----------------------------------------------------
        // SCENE 2 GSAP TIMELINE: ENGAGEMENT RING BOX
        // -----------------------------------------------------
        // Phase 1 (0.00s - 0.32s): Unlatch Golden Clasp
        tl.call(() => {
          onTimelineProgressRef.current?.(0.15, 'فتح قفل علبة المخمل...', 'Unlatching the Velvet Ring Box...');
          if (enableSfxRef.current) soundEngine.playRingBoxOpen();
        }, [], 0);
        tl.to(animState, { boxClaspUnlatch: 1, duration: 0.28, ease: 'power2.out' }, 0);

        // Phase 2 (0.22s - 1.05s): Velvet Lid Hinges Open with Realistic Spring Physics
        tl.call(() => {
          onTimelineProgressRef.current?.(0.45, 'فتح غطاء علبة الخاتم...', 'Opening the Velvet Lid...');
        }, [], 0.22);
        tl.to(animState, { boxLidOpen: 1, duration: 0.85, ease: 'back.out(1.18)' }, 0.22);

        // Phase 3 (0.72s - 1.75s): 24K Gold & Diamond Ring Elevates & Reflects Light
        tl.call(() => {
          onTimelineProgressRef.current?.(0.78, 'تألق خاتم الخطوبة وأسماء العروسين...', 'Revealing the Diamond Ring & Names...');
        }, [], 0.72);
        tl.to(animState, { ringElevate: 1, duration: 0.85, ease: 'power3.out' }, 0.72);
        tl.to(animState, { ringSpin: 1, duration: 1.25, ease: 'power2.inOut' }, 0.72);
        tl.to(animState, { diamondSparkle: 1, lightSweepX: 2.6, duration: 0.95, ease: 'sine.inOut' }, 0.95);

        // Phase 4 (1.35s - 2.25s): Camera Zoom-In onto Ring & Names Plaque
        tl.to(animState, { cameraZoom: 1, cameraLift: 1, master: 1, duration: 0.9, ease: 'power3.inOut' }, 1.35);
      } else if (activeMode === 'royal_doors_3d') {
        // -----------------------------------------------------
        // SCENE 3 GSAP TIMELINE: ROYAL DOORS
        // -----------------------------------------------------
        // Phase 1 (0.00s - 0.38s): Golden Lever Handles Press Downward to Unlatch
        tl.call(() => {
          onTimelineProgressRef.current?.(0.15, 'تحريك المقابض الملكية المذهّبة...', 'Turning the Golden Door Handles...');
          if (enableSfxRef.current) soundEngine.playRoyalDoorsOpen();
        }, [], 0);
        tl.to(animState, { doorHandlesPress: 1, duration: 0.34, ease: 'power2.out' }, 0);
        tl.to(animState, { doorHandlesPress: 0.2, duration: 0.28, ease: 'power2.inOut' }, 0.38);

        // Phase 2 (0.32s - 1.48s): Grand Carved Palace Doors Swing Open Gradually
        tl.call(() => {
          onTimelineProgressRef.current?.(0.5, 'انفتاح الأبواب الملكية وإشراق الإضاءة الدافئة...', 'Opening the Royal Palace Doors...');
        }, [], 0.32);
        tl.to(animState, { doorsSwingOpen: 1, duration: 1.18, ease: 'power2.inOut' }, 0.32);
        tl.to(animState, { warmBacklightIntensity: 1, duration: 1.1, ease: 'sine.out' }, 0.38);

        // Phase 3 (1.05s - 2.25s): Invitation Card Emerges in Warm Light + Camera Dolly-In
        tl.call(() => {
          onTimelineProgressRef.current?.(0.85, 'ظهور بطاقة الدعوة الملكية...', 'Revealing the Royal Invitation...');
        }, [], 1.05);
        tl.to(animState, { sanctuaryCardReveal: 1, duration: 0.95, ease: 'power3.out' }, 1.05);
        tl.to(animState, { cameraZoom: 1.25, cameraLift: 0.6, master: 1, duration: 1.15, ease: 'power3.inOut' }, 1.1);
      } else if (activeMode === 'silk_ribbon_3d') {
        // -----------------------------------------------------
        // SCENE 4 GSAP TIMELINE: SILK RIBBON (Touch Drag & Untie)
        // -----------------------------------------------------
        // Phase 1 (0.00s - 0.58s): Silk Bow Knot Loosens & Loops Flatten
        tl.call(() => {
          onTimelineProgressRef.current?.(0.2, 'انفكاك عقدة الشريط الحريري...', 'Untying the Silk Ribbon Knot...');
          if (enableSfxRef.current) soundEngine.playSilkRibbonSlide();
        }, [], 0);
        tl.to(animState, { bowKnotLoosen: 1, duration: 0.58, ease: 'power2.inOut' }, 0);

        // Phase 2 (0.42s - 1.28s): Silk Straps Glide Smoothly Aside
        tl.call(() => {
          onTimelineProgressRef.current?.(0.58, 'انزلاق الشريط الحريري جانباً...', 'Sliding the Silk Ribbon Aside...');
        }, [], 0.42);
        tl.to(animState, { ribbonSlideAside: 1, duration: 0.86, ease: 'power3.inOut' }, 0.42);

        // Phase 3 (1.02s - 2.15s): Unveiled Card Elevates with Golden Light Sweep & Camera Zoom
        tl.call(() => {
          onTimelineProgressRef.current?.(0.88, 'ظهور بطاقة الدعوة بتفاصيلها...', 'Revealing the Invitation Card...');
        }, [], 1.02);
        tl.to(animState, { cardUnveilElevate: 1, lightSweepX: 2.6, duration: 0.92, ease: 'power3.out' }, 1.02);
        tl.to(animState, { cameraZoom: 1, cameraLift: 0.8, master: 1, duration: 0.95, ease: 'power3.inOut' }, 1.15);
      } else {
        // -----------------------------------------------------
        // OTHER OCCASION 3D SCENES (Curtains, Pop-Up Book, Graduation Cap, Diploma, Henna, Birthday)
        // -----------------------------------------------------
        tl.call(() => {
          onTimelineProgressRef.current?.(0.35, 'فتح المشهد ثلاثي الأبعاد...', 'Opening 3D Scene...');
          if (enableSfxRef.current) {
            if (activeMode === 'curtain_3d') soundEngine.playCurtainDoorOpen();
            else if (activeMode === 'birthday_candles_3d') soundEngine.playCandleBlow();
            else if (
              activeMode === 'graduation_cap_3d' ||
              activeMode === 'graduation_night_fireworks_3d'
            ) {
              soundEngine.playCelebrationFanfare();
            } else {
              soundEngine.playEnvelopePaperUnfold();
            }
          }
        }, [], 0);
        tl.to(animState, { master: 1, lightSweepX: 2.6, duration: 1.55, ease: 'power2.inOut' }, 0);
        tl.to(animState, { cameraZoom: 1, cameraLift: 0.8, duration: 1.15, ease: 'power3.inOut' }, 0.55);
      }

      gsapTimelineRef.current = tl;
      return tl;
    };

    const masterTimeline = buildSequencedGSAPTimeline();

    startTimelineFnRef.current = (fromProgress?: number) => {
      if (typeof fromProgress === 'number' && fromProgress > 0) {
        masterTimeline.progress(fromProgress);
      }
      masterTimeline.play();
    };

    resetTimelineFnRef.current = () => {
      masterTimeline.pause(0);
      Object.keys(animState).forEach((k) => {
        (animState as any)[k] = k === 'lightSweepX' ? -2.2 : 0;
      });
    };

    if (isOpenedRef.current) {
      masterTimeline.play(0);
    }

    // =========================================================
    // RAYCASTING, CAMERA PARALLAX & TOUCH-DRAG GESTURE INTERACTION
    // =========================================================
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const parallaxTarget = { x: 0, y: 0 };
    const parallaxCurrent = { x: 0, y: 0 };
    let pointerDownPos = { x: 0, y: 0 };
    let isDraggingObject = false;
    let dragProgress = 0;
    let isHoveredLocal = false;
    let lastHoverCheck = 0;

    const updatePointerCoords = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      parallaxTarget.x = pointer.x * 0.24;
      parallaxTarget.y = pointer.y * 0.16;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isOpenedRef.current) return;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      updatePointerCoords(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableHeroGroup.children, true);
      if (hits.length > 0) {
        isDraggingObject = true;
        dragProgress = 0;
        if (activeMode === 'silk_ribbon_3d' && enableSfxRef.current) {
          soundEngine.playSilkRibbonSlide();
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointerCoords(e.clientX, e.clientY);

      // Interactive Touch-Drag Scrubbing (for Silk Ribbon, Wax Seal, Ring Box Lid, Royal Doors)
      if (isDraggingObject && !isOpenedRef.current) {
        const dx = e.clientX - pointerDownPos.x;
        const dy = e.clientY - pointerDownPos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 8) {
          dragProgress = Math.min(0.65, dist / 180);
          masterTimeline.pause();
          masterTimeline.progress(dragProgress);
          if (dragProgress > 0.46) {
            isDraggingObject = false;
            onObjectClickRef.current?.();
            masterTimeline.play();
          }
          return;
        }
      }

      const now = performance.now();
      if (now - lastHoverCheck < 45) return;
      lastHoverCheck = now;

      if (isOpenedRef.current) {
        if (isHoveredLocal) {
          isHoveredLocal = false;
          setIsHoveringObject(false);
        }
        return;
      }

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableHeroGroup.children, true);
      const hit = hits.length > 0;
      if (hit !== isHoveredLocal) {
        isHoveredLocal = hit;
        setIsHoveringObject(hit);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isOpenedRef.current) return;
      const dist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );

      if (isDraggingObject) {
        isDraggingObject = false;
        if (dragProgress > 0.14 || dist <= 28) {
          onObjectClickRef.current?.();
          masterTimeline.play();
          return;
        } else {
          gsap.to(masterTimeline, { progress: 0, duration: 0.3, ease: 'power2.out' });
        }
      }

      if (dist > 28) return;

      updatePointerCoords(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableHeroGroup.children, true);
      if (hits.length > 0) {
        onObjectClickRef.current?.();
        masterTimeline.play();
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', handlePointerDown);
    domElem.addEventListener('pointermove', handlePointerMove);
    domElem.addEventListener('pointerup', handlePointerUp);

    // =========================================================
    // RENDER LOOP (Synchronized with GSAP Timeline State + Camera Parallax)
    // =========================================================
    const dummyObj = new THREE.Object3D();
    const clock = new THREE.Clock();
    let hoverScale = 1;
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      const openProgress = animState.master;

      // Smooth Camera Parallax & Hover Scale
      parallaxCurrent.x = THREE.MathUtils.damp(
        parallaxCurrent.x,
        parallaxTarget.x,
        4.5,
        delta
      );
      parallaxCurrent.y = THREE.MathUtils.damp(
        parallaxCurrent.y,
        parallaxTarget.y,
        4.5,
        delta
      );

      const targetHoverScale =
        !isOpenedRef.current && isHoveredLocal ? 1.042 : 1.0;
      hoverScale = THREE.MathUtils.damp(hoverScale, targetHoverScale, 6.0, delta);
      clickableHeroGroup.scale.setScalar(hoverScale);

      // Gentle breathing idle motion before user touches the 3D object
      if (!isOpenedRef.current && dragProgress === 0 && !prefersReducedMotion) {
        clickableHeroGroup.position.y = Math.sin(elapsed * 1.65) * 0.04;
        clickableHeroGroup.rotation.y =
          Math.sin(elapsed * 0.85) * 0.05 + parallaxCurrent.x * 0.35;
        clickableHeroGroup.rotation.x = -parallaxCurrent.y * 0.22;
      } else {
        clickableHeroGroup.position.y = THREE.MathUtils.damp(
          clickableHeroGroup.position.y,
          0,
          5,
          delta
        );
        clickableHeroGroup.rotation.y = THREE.MathUtils.damp(
          clickableHeroGroup.rotation.y,
          0,
          5,
          delta
        );
        clickableHeroGroup.rotation.x = THREE.MathUtils.damp(
          clickableHeroGroup.rotation.x,
          0,
          5,
          delta
        );
      }

      // Dynamic Specular Light Sweep Position
      glintPointLight.position.x = animState.lightSweepX + Math.sin(elapsed * 1.2) * 0.35;

      // Cinematic Camera Zoom-In & Parallax
      const idleCamX = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.42) * 0.09;
      const idleCamY = prefersReducedMotion ? 0 : Math.cos(elapsed * 0.34) * 0.05;
      camera.position.x = idleCamX + parallaxCurrent.x * (1 - animState.cameraZoom * 0.6);
      camera.position.y =
        0.52 +
        idleCamY +
        parallaxCurrent.y * 0.5 -
        animState.cameraLift * 0.18;
      camera.position.z = 6.25 - animState.cameraZoom * 1.85;
      camera.lookAt(0, 0.06 + animState.cameraLift * 0.14, 0);

      // =====================================================
      // APPLY SEQUENCED GSAP TIMELINE VALUES TO 3D MESHES
      // =====================================================
      if (activeMode === 'envelope_3d') {
        // Scene 1: Luxury Envelope
        if (envelopeWaxSealGroup && waxSealLeftHalf && waxSealRightHalf) {
          envelopeWaxSealGroup.position.z =
            0.19 - animState.waxPress * 0.025 + animState.waxCrack * 0.45;
          // Left and right halves fracture and split apart!
          waxSealLeftHalf.position.x = -animState.waxCrack * 0.62;
          waxSealLeftHalf.position.y = -animState.waxCrack * 0.22;
          waxSealLeftHalf.rotation.z = animState.waxCrack * 0.65;
          waxSealLeftHalf.rotation.y = -animState.waxCrack * 0.55;

          waxSealRightHalf.position.x = animState.waxCrack * 0.62;
          waxSealRightHalf.position.y = -animState.waxCrack * 0.25;
          waxSealRightHalf.rotation.z = -animState.waxCrack * 0.68;
          waxSealRightHalf.rotation.y = animState.waxCrack * 0.55;

          const sealScale = Math.max(0.001, 1 - Math.max(0, animState.waxCrack - 0.35) * 1.45);
          waxSealLeftHalf.scale.setScalar(sealScale);
          waxSealRightHalf.scale.setScalar(sealScale);

          waxFractureShards.forEach((sh) => {
            if (animState.waxCrack <= 0.02) {
              sh.mesh.scale.setScalar(0.001);
            } else {
              const t = animState.waxCrack;
              sh.mesh.position.set(
                sh.vx * t,
                sh.vy * t - 0.5 * t * t,
                sh.vz * t
              );
              sh.mesh.rotation.set(t * 5, t * 4, t * 3);
              sh.mesh.scale.setScalar(Math.max(0.001, (1 - t) * 1.25));
            }
          });
        }

        if (envelopeRibbonGroup) {
          envelopeRibbonGroup.position.y = -0.14 + animState.ribbonUntie * 1.95;
          envelopeRibbonGroup.scale.set(
            1 + animState.ribbonUntie * 0.25,
            Math.max(0.001, 1 - animState.ribbonUntie * 1.05),
            1
          );
        }

        if (envelopeFlapPivot) {
          envelopeFlapPivot.rotation.x = -animState.flapOpen * Math.PI * 0.89;
        }

        if (envelopeRisingCard) {
          envelopeRisingCard.position.y =
            -0.06 + animState.cardRise * 1.08 - animState.cardTiltAndForward * 0.42;
          envelopeRisingCard.position.z =
            0.055 + animState.cardRise * 0.18 + animState.cardTiltAndForward * 0.92;
          envelopeRisingCard.rotation.x = -animState.cardTiltAndForward * 0.14;
          envelopeRisingCard.scale.setScalar(1 + animState.cardTiltAndForward * 0.14);
        }
      } else if (
        activeMode === 'engagement_jewelry_box_3d' ||
        activeMode === 'engagement_ring_3d'
      ) {
        // Scene 2: Engagement Ring Box
        if (jewelryBoxClasp) {
          jewelryBoxClasp.rotation.x = animState.boxClaspUnlatch * 0.65;
          jewelryBoxClasp.position.y = 0.04 - animState.boxClaspUnlatch * 0.05;
        }
        if (jewelryBoxLidPivot) {
          jewelryBoxLidPivot.rotation.x = -animState.boxLidOpen * Math.PI * 0.62;
        }
        if (engagementRingGroup) {
          engagementRingGroup.position.y = 0.32 + animState.ringElevate * 0.68;
          engagementRingGroup.position.z = animState.ringElevate * 0.32;
          engagementRingGroup.rotation.y =
            elapsed * 0.55 + animState.ringSpin * Math.PI * 2;
          engagementRingGroup.scale.setScalar(1 + animState.ringElevate * 0.26);
        }
        if (diamondGlintStarGroup) {
          const pulse = 0.85 + Math.sin(elapsed * 8) * 0.22;
          diamondGlintStarGroup.scale.setScalar(
            Math.max(0.001, animState.diamondSparkle * 1.35 * pulse)
          );
          diamondGlintStarGroup.rotation.z = elapsed * 1.4;
        }
      } else if (activeMode === 'royal_doors_3d') {
        // Scene 3: Royal Doors
        if (leftDoorHandlePivot && rightDoorHandlePivot) {
          leftDoorHandlePivot.rotation.z = -animState.doorHandlesPress * 0.58;
          rightDoorHandlePivot.rotation.z = animState.doorHandlesPress * 0.58;
        }
        if (leftRoyalDoorPivot && rightRoyalDoorPivot) {
          leftRoyalDoorPivot.rotation.y = -animState.doorsSwingOpen * Math.PI * 0.64;
          rightRoyalDoorPivot.rotation.y = animState.doorsSwingOpen * Math.PI * 0.64;
        }
        if (royalDoorsBacklight) {
          royalDoorsBacklight.intensity =
            0.35 + animState.warmBacklightIntensity * 6.8;
        }
        if (royalDoorsWarmPortalMesh) {
          const mat = royalDoorsWarmPortalMesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.1 + animState.warmBacklightIntensity * 0.48;
        }
        if (royalDoorsCardGroup) {
          royalDoorsCardGroup.position.z =
            -0.35 + animState.sanctuaryCardReveal * 1.45;
          royalDoorsCardGroup.scale.setScalar(
            0.84 + animState.sanctuaryCardReveal * 0.26
          );
        }
      } else if (activeMode === 'silk_ribbon_3d') {
        // Scene 4: Silk Ribbon
        if (silkBowLeftLoop && silkBowRightLoop && silkBowKnotCenter) {
          const loopScale = Math.max(0.001, 1 - animState.bowKnotLoosen * 0.92);
          silkBowLeftLoop.scale.set(
            1 + animState.bowKnotLoosen * 0.45,
            loopScale,
            loopScale
          );
          silkBowRightLoop.scale.set(
            1 + animState.bowKnotLoosen * 0.45,
            loopScale,
            loopScale
          );
          silkBowKnotCenter.scale.setScalar(
            Math.max(0.001, 1 - animState.ribbonSlideAside * 1.05)
          );
        }
        if (silkRibbonTailLeft && silkRibbonTailRight) {
          silkRibbonTailLeft.position.x = -animState.ribbonSlideAside * 2.4;
          silkRibbonTailLeft.position.y = -animState.bowKnotLoosen * 0.35;
          silkRibbonTailRight.position.x = animState.ribbonSlideAside * 2.4;
          silkRibbonTailRight.position.y = -animState.bowKnotLoosen * 0.35;
        }
        if (silkLeftStrap && silkRightStrap && silkVerticalStrap) {
          silkLeftStrap.position.x = -0.86 - animState.ribbonSlideAside * 2.85;
          silkRightStrap.position.x = 0.86 + animState.ribbonSlideAside * 2.85;
          silkVerticalStrap.position.y = animState.ribbonSlideAside * 2.65;
          const strapOpacity = Math.max(0.001, 1 - animState.ribbonSlideAside * 1.05);
          silkVerticalStrap.scale.set(strapOpacity, 1, 1);
        }
        if (silkCardRootGroup) {
          silkCardRootGroup.position.z = animState.cardUnveilElevate * 0.82;
          silkCardRootGroup.rotation.x = -animState.cardUnveilElevate * 0.08;
        }
      } else if (activeMode === 'curtain_3d') {
        if (leftCurtainPivot && rightCurtainPivot) {
          leftCurtainPivot.scale.x = 1 - openProgress * 0.74;
          leftCurtainPivot.rotation.y = -openProgress * 0.38;
          rightCurtainPivot.scale.x = 1 - openProgress * 0.74;
          rightCurtainPivot.rotation.y = openProgress * 0.38;
        }
        if (theatreChandelier) {
          theatreChandelier.rotation.y = elapsed * 0.25;
        }
        if (theatreSpotlightCone) {
          const mat = theatreSpotlightCone.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.06 + openProgress * 0.14;
        }
      } else if (
        activeMode === 'popup_book_3d' ||
        activeMode === 'graduation_popup_book_3d'
      ) {
        if (bookCoverPivot) {
          bookCoverPivot.rotation.z = openProgress * Math.PI * 0.92;
        }
        if (palacePopUpGroup) {
          const popUp = Math.max(0.02, (openProgress - 0.2) / 0.8);
          const clampedPop = Math.min(1, Math.max(0.02, popUp));
          palacePopUpGroup.scale.set(1, clampedPop, 1);
          palacePopUpGroup.rotation.y =
            Math.sin(elapsed * 0.35) * 0.08 * clampedPop;
        }
        if (fountainDropsMesh) {
          for (let i = 0; i < fountainDropData.length; i++) {
            const d = fountainDropData[i];
            const fx = i < fountainDropData.length / 2 ? -0.85 : 0.85;
            const t = (elapsed * d.speed + d.phase) % 1;
            const arcY = Math.sin(t * Math.PI) * 0.55 * openProgress;
            const rad = t * d.radius;
            dummyObj.position.set(
              fx + Math.cos(d.angle) * rad,
              0.12 + arcY,
              0.45 + Math.sin(d.angle) * rad
            );
            dummyObj.scale.setScalar(openProgress > 0.25 ? 1 : 0.001);
            dummyObj.updateMatrix();
            fountainDropsMesh.setMatrixAt(i, dummyObj.matrix);
          }
          fountainDropsMesh.instanceMatrix.needsUpdate = true;
        }
      } else if (activeMode === 'scene_reveal_3d') {
        if (leftSwanGroup && rightSwanGroup) {
          const glide = 1 - openProgress;
          leftSwanGroup.position.x = -0.14 - glide * 0.85;
          rightSwanGroup.position.x = 0.14 + glide * 0.85;
        }
        if (swanGoldenFrame) {
          swanGoldenFrame.scale.setScalar(0.85 + openProgress * 0.18);
        }
      } else if (activeMode === 'wedding_carriage_3d') {
        if (carriageDoorPivot) {
          carriageDoorPivot.rotation.y = -openProgress * Math.PI * 0.68;
        }
        carriageWheels.forEach((w) => {
          w.rotation.z = -openProgress * Math.PI * 2.5;
        });
      } else if (activeMode === 'graduation_achievement_box_3d') {
        if (jewelryBoxLidPivot) {
          jewelryBoxLidPivot.rotation.x = -openProgress * Math.PI * 0.68;
        }
        if (engagementRingGroup) {
          engagementRingGroup.position.y = 0.35 + openProgress * 0.78;
          engagementRingGroup.rotation.y =
            elapsed * 0.8 + openProgress * Math.PI * 2.5;
          engagementRingGroup.scale.setScalar(1 + openProgress * 0.28);
        }
      } else if (activeMode === 'engagement_rose_3d') {
        bloomingRosePetals.forEach((p) => {
          p.mesh.rotation.z =
            p.baseRotZ - openProgress * (0.45 + p.ring * 0.22);
        });
      } else if (
        activeMode === 'engagement_gift_box_3d' ||
        activeMode === 'birthday_gift_box_3d'
      ) {
        if (giftBoxLidGroup) {
          giftBoxLidGroup.position.y = 0.88 + openProgress * 1.65;
          giftBoxLidGroup.rotation.z = openProgress * 0.38;
        }
        if (giftBoxBowGroup) {
          giftBoxBowGroup.rotation.y = openProgress * Math.PI * 1.5;
        }
      } else if (
        activeMode === 'henna_box_3d' ||
        activeMode === 'henna_gift_chest_3d'
      ) {
        if (hennaChestLidPivot) {
          hennaChestLidPivot.rotation.x = -openProgress * Math.PI * 0.68;
        }
        if (hennaInnerGlowMesh) {
          hennaInnerGlowMesh.position.y = 0.45 + openProgress * 0.65;
          hennaInnerGlowMesh.rotation.y = elapsed * 0.9;
        }
      } else if (activeMode === 'henna_lantern_3d') {
        if (lanternBodyGroup) {
          lanternBodyGroup.rotation.y =
            elapsed * 0.4 + openProgress * Math.PI * 1.8;
          lanternBodyGroup.position.y = openProgress * 0.45;
        }
        if (lanternCoreLight) {
          lanternCoreLight.intensity = 2.0 + openProgress * 3.8;
        }
      } else if (activeMode === 'henna_mabkhara_3d') {
        if (mabkharaSmokeInstanced) {
          for (let i = 0; i < 28; i++) {
            const t = (elapsed * (0.45 + openProgress * 0.6) + i / 28) % 1;
            const y = 0.85 + t * (1.6 + openProgress * 1.2);
            const rad = t * (0.25 + openProgress * 0.45);
            const ang = t * 6.0 + i;
            dummyObj.position.set(
              Math.cos(ang) * rad,
              y,
              Math.sin(ang) * rad
            );
            dummyObj.scale.setScalar(
              (1 - t * 0.5) * (0.5 + openProgress * 0.8)
            );
            dummyObj.updateMatrix();
            mabkharaSmokeInstanced.setMatrixAt(i, dummyObj.matrix);
          }
          mabkharaSmokeInstanced.instanceMatrix.needsUpdate = true;
        }
      } else if (
        activeMode === 'birthday_cake_3d' ||
        activeMode === 'birthday_candles_3d'
      ) {
        if (birthdayCakeGroup) {
          birthdayCakeGroup.rotation.y =
            elapsed * 0.35 + openProgress * Math.PI * 2;
        }
        candleFlames.forEach((fl, idx) => {
          if (activeMode === 'birthday_candles_3d') {
            fl.scale.setScalar(
              Math.max(
                0.001,
                (1 - openProgress * 1.15) *
                  (0.9 + Math.sin(elapsed * 10 + idx) * 0.15)
              )
            );
          } else {
            fl.scale.setScalar(0.9 + Math.sin(elapsed * 10 + idx) * 0.15);
          }
        });
      } else if (activeMode === 'birthday_balloons_3d') {
        balloonClusters.forEach((b, idx) => {
          b.mesh.position.y =
            b.baseY +
            Math.sin(elapsed * b.speed + idx) * 0.08 +
            openProgress * (1.8 + (idx % 3) * 0.4);
          b.mesh.position.x = b.baseX * (1 + openProgress * 0.35);
        });
      } else if (
        activeMode === 'graduation_cap_3d' ||
        activeMode === 'graduation_night_fireworks_3d'
      ) {
        if (gradCapMainGroup) {
          gradCapMainGroup.position.y =
            0.1 +
            Math.sin(openProgress * Math.PI) * 1.25 +
            openProgress * 0.45;
          gradCapMainGroup.rotation.y = openProgress * Math.PI * 2.5;
          gradCapMainGroup.rotation.z =
            Math.sin(openProgress * Math.PI) * 0.22;
        }
        if (gradTasselPivot) {
          gradTasselPivot.rotation.z =
            Math.sin(elapsed * 2.5) * 0.12 + openProgress * 0.45;
        }
        if (gradConfettiInstanced) {
          for (let i = 0; i < gradConfettiSeeds.length; i++) {
            const s = gradConfettiSeeds[i];
            if (openProgress < 0.05) {
              dummyObj.scale.setScalar(0.001);
            } else {
              const t = openProgress;
              dummyObj.position.set(
                s.vx * t,
                0.2 + s.vy * t - 1.4 * t * t,
                s.vz * t
              );
              dummyObj.rotation.set(
                elapsed * s.rotSpeed,
                elapsed * s.rotSpeed * 0.8,
                elapsed * 1.5
              );
              dummyObj.scale.setScalar(1);
            }
            dummyObj.updateMatrix();
            gradConfettiInstanced.setMatrixAt(i, dummyObj.matrix);
          }
          gradConfettiInstanced.instanceMatrix.needsUpdate = true;
        }
        if (fireworksInstanced) {
          for (let i = 0; i < fireworkSeeds.length; i++) {
            const fw = fireworkSeeds[i];
            if (openProgress < 0.1) {
              dummyObj.scale.setScalar(0.001);
            } else {
              const burst = (openProgress - 0.1) * 1.8;
              dummyObj.position.set(
                fw.originX + fw.dirX * burst,
                fw.originY + fw.dirY * burst,
                -1.2 + fw.dirZ * burst
              );
              dummyObj.scale.setScalar(
                Math.max(0.001, 1.2 - openProgress * 0.5)
              );
            }
            dummyObj.updateMatrix();
            fireworksInstanced.setMatrixAt(i, dummyObj.matrix);
          }
          fireworksInstanced.instanceMatrix.needsUpdate = true;
        }
      } else if (activeMode === 'graduation_diploma_3d') {
        if (diplomaRibbonBow) {
          diplomaRibbonBow.position.y = openProgress * 1.8;
          diplomaRibbonBow.scale.setScalar(
            Math.max(0.001, 1 - openProgress * 1.2)
          );
        }
        if (diplomaLeftRoll && diplomaRightRoll) {
          diplomaLeftRoll.position.x = -0.12 - openProgress * 1.18;
          diplomaRightRoll.position.x = 0.12 + openProgress * 1.18;
        }
        if (diplomaCenterSheet) {
          diplomaCenterSheet.scale.x = Math.max(0.05, openProgress);
        }
        if (diplomaLaurelWreath) {
          diplomaLaurelWreath.rotation.z = Math.sin(elapsed * 0.5) * 0.04;
          diplomaLaurelWreath.scale.setScalar(1.45 + openProgress * 0.15);
        }
      } else if (
        activeMode === 'project_dossier_3d' ||
        activeMode === 'project_academic_book_3d' ||
        activeMode === 'project_laptop_3d' ||
        activeMode === 'project_display_board_3d'
      ) {
        if (projectLaptopLidPivot) {
          projectLaptopLidPivot.rotation.x =
            Math.PI * 0.46 - openProgress * Math.PI * 0.54;
        }
        if (bookCoverPivot) {
          bookCoverPivot.rotation.z = openProgress * Math.PI * 0.9;
        }
        if (projectMajorEmblemGroup) {
          const popScale = Math.max(0.01, (openProgress - 0.18) / 0.82);
          projectMajorEmblemGroup.scale.setScalar(Math.min(1, popScale));
          projectMajorEmblemGroup.rotation.y = elapsed * 0.95;
        }
      }

      // Floating Ambient Golden Particles
      petalsInstanced.visible = enableParticlesRef.current;
      if (enableParticlesRef.current && !prefersReducedMotion) {
        for (let i = 0; i < particleCount; i++) {
          const p = particleSeeds[i];
          const py = ((p.y - elapsed * p.speedY + 2.2) % 4.4) - 2.2;
          const px = p.x + Math.sin(elapsed * 0.8 + p.phase) * 0.25;
          dummyObj.position.set(px, py, p.z);
          dummyObj.rotation.set(
            elapsed * 0.6 + p.phase,
            elapsed * 0.4 + p.phase,
            elapsed * 0.3
          );
          dummyObj.updateMatrix();
          petalsInstanced.setMatrixAt(i, dummyObj.matrix);
        }
        petalsInstanced.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 390;
      const h = container.clientHeight || 760;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      domElem.removeEventListener('pointermove', handlePointerMove);
      domElem.removeEventListener('pointerup', handlePointerUp);
      if (gsapTimelineRef.current) {
        gsapTimelineRef.current.kill();
      }
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      envTexture.dispose();
      cottonPaperPBR.map.dispose();
      cottonPaperPBR.bumpMap.dispose();
      personalizedCardTex.dispose();
      waxSealPBR.map.dispose();
      waxSealPBR.bumpMap.dispose();
      velvetBumpTex.dispose();
      silkWeaveTex.dispose();
      palaceDoorPBR.map.dispose();
      palaceDoorPBR.bumpMap.dispose();
      velvetTex.dispose();
      renderer.dispose();
    };
  }, [
    activeMode,
    major,
    colorScheme,
    effectiveMonogram,
    namesHeadline,
    eventTitle,
    eventDateText,
    venueText,
    liteMode,
  ]);

  if (!webglSupported) {
    return (
      <div
        onClick={() => onObjectClick?.()}
        className="w-full h-full flex items-center justify-center p-8 text-center cursor-pointer"
        style={{ backgroundColor: colorScheme.ivory, color: colorScheme.royalBlack }}
      >
        <div className="max-w-xs space-y-2 border-2 border-[#D6B574] rounded-3xl p-6 bg-[#FFFDF8]">
          <div className="text-lg font-bold font-amiri text-[#A98445]">
            مراسيم الملكية • MARASEEM
          </div>
          <p className="text-xs">اضغط لفتح الدعوة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      <div
        ref={mountRef}
        className={`w-full h-full relative overflow-hidden select-none ${
          !isOpened && isHoveringObject ? 'cursor-pointer' : 'cursor-pointer'
        }`}
        style={{
          filter: dofBlurStrength > 0.2 ? `blur(${dofBlurStrength.toFixed(1)}px)` : undefined,
          transition: 'filter 0.35s ease-out',
        }}
        aria-label="Maraseem Cinematic 3D Opening Scene"
      />
      {/* Subtle Optical Depth-of-Field Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, transparent 56%, rgba(12, 9, 7, 0.32) 100%)',
        }}
      />
    </div>
  );
};
