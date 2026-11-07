import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MiniCard3DCanvasProps {
  mode: string;
  category?: string;
  themeColor?: string;
}

export const MiniCard3DCanvas: React.FC<MiniCard3DCanvasProps> = ({
  mode,
  category = '',
  themeColor = '#123D32',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { rootMargin: '80px', threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    const parent = containerRef.current;
    if (!canvas || !parent) return;

    const w = parent.clientWidth || 300;
    const h = parent.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
    camera.position.set(0, 0.15, 4.3);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch {
      return;
    }

    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    const dirLight = new THREE.DirectionalLight(0xffdf9e, 1.6);
    dirLight.position.set(3, 3, 3);
    scene.add(dirLight);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd6b574,
      metalness: 0.82,
      roughness: 0.2,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0b1938,
      metalness: 0.3,
      roughness: 0.5,
    });
    const ivoryMat = new THREE.MeshStandardMaterial({
      color: 0xf8f1e5,
      metalness: 0.15,
      roughness: 0.25,
    });
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(themeColor || '#123D32'),
      metalness: 0.25,
      roughness: 0.45,
    });

    const group = new THREE.Group();
    scene.add(group);

    const combinedMode = `${mode} ${category}`.toLowerCase();

    if (combinedMode.includes('graduation')) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 1.45), darkMat);
      cap.position.y = 0.2;
      const skull = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.44, 0.38, 20), darkMat);
      skull.position.y = -0.02;
      const button = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16), goldMat);
      button.position.y = 0.26;
      const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.95, 16), ivoryMat);
      scroll.rotation.z = Math.PI / 2.2;
      scroll.position.set(0, -0.45, 0.35);
      group.add(cap, skull, button, scroll);
      group.rotation.x = 0.22;
    } else if (combinedMode.includes('ring') || combinedMode.includes('engagement')) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.08, 16, 36), goldMat);
      const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), ivoryMat);
      diamond.position.y = 0.68;
      group.add(ring, diamond);
    } else if (combinedMode.includes('cake') || combinedMode.includes('birthday')) {
      const baseCake = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.84, 0.55, 24), ivoryMat);
      baseCake.position.y = -0.22;
      const topTier = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 0.42, 24), goldMat);
      topTier.position.y = 0.26;
      const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), goldMat);
      flame.position.y = 0.65;
      group.add(baseCake, topTier, flame);
    } else if (combinedMode.includes('lantern') || combinedMode.includes('henna')) {
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 1.15, 8), goldMat);
      const dome = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.4, 8), emeraldMat);
      dome.position.y = 0.75;
      group.add(lantern, dome);
    } else if (combinedMode.includes('curtain')) {
      const leftCurtain = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.25, 0.14), emeraldMat);
      leftCurtain.position.x = -0.48;
      const rightCurtain = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.25, 0.14), emeraldMat);
      rightCurtain.position.x = 0.48;
      const arch = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.18, 0.2), goldMat);
      arch.position.y = 0.62;
      group.add(leftCurtain, rightCurtain, arch);
    } else if (combinedMode.includes('book') || combinedMode.includes('scroll')) {
      const leftPage = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.1, 0.08), ivoryMat);
      leftPage.position.x = -0.36;
      leftPage.rotation.y = 0.22;
      const rightPage = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.1, 0.08), ivoryMat);
      rightPage.position.x = 0.36;
      rightPage.rotation.y = -0.22;
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.14, 12), goldMat);
      group.add(leftPage, rightPage, spine);
    } else {
      // الافتراضي (ظرف ملكي مصغر مع ختم ذهبي)
      const env = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.05, 0.12), ivoryMat);
      const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 24), goldMat);
      seal.rotation.x = Math.PI / 2;
      seal.position.z = 0.08;
      group.add(env, seal);
    }

    let rafId = 0;
    const animateMini = () => {
      rafId = requestAnimationFrame(animateMini);
      group.rotation.y += 0.015;
      renderer.render(scene, camera);
    };
    animateMini();

    return () => {
      cancelAnimationFrame(rafId);
      goldMat.dispose();
      darkMat.dispose();
      ivoryMat.dispose();
      emeraldMat.dispose();
      renderer.dispose();
    };
  }, [isVisible, mode, category, themeColor]);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
