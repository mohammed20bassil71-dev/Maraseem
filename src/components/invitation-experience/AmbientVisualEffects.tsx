import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InvitationCategory, VisualEffectType } from '../../types/invitation';

export interface VisualEffectOption {
  id: VisualEffectType;
  label: string;
  badge: string;
  description: string;
}

export const VISUAL_EFFECT_OPTIONS: VisualEffectOption[] = [
  {
    id: 'auto',
    label: 'تلقائي ذكي حسب المناسبة',
    badge: 'تلقائي ✨',
    description: 'يختار المؤثر الأنسب لطبيعة القالب تلقائياً (نثر ورود للأعراس، توهج فوانيس للحناء والنجاح العائلي، إلخ)',
  },
  {
    id: 'rose_petals',
    label: 'نثر الورود المتحرك (Particle System)',
    badge: 'نثر الورود 🌸',
    description: 'بتلات ورد جوري وياسمين تتساقط بانسيابية ثلاثية الأبعاد مع تمايل هوائي ناعم',
  },
  {
    id: 'lantern_glow',
    label: 'توهج الفوانيس الدافئ (Glow Effects)',
    badge: 'توهج الفوانيس 🏮',
    description: 'هالات ضوئية كهرمانية متوهجة مع شذرات نور دافئة تتصاعد بهدوء شاعري',
  },
  {
    id: 'golden_sparkles',
    label: 'بريق الذهب الملكي (Royal Sparkles)',
    badge: 'بريق ملكي ✨',
    description: 'ذرات ذهب متلألئة ونجوم مضيئة تناسب حفلات الترقية الوظيفية والتخرج والافتتاحات',
  },
  {
    id: 'gallery_spotlight',
    label: 'إضاءة المعرض المتحفية (Gallery Glow)',
    badge: 'إضاءة متحفية 🎨',
    description: 'أشعة إضاءة فنية متحركة مع ذرات لونية دافئة مخصصة لافتتاح المعارض الفنية',
  },
  {
    id: 'confetti_stars',
    label: 'نجوم وأطياف الاحتفال (Festive Stars)',
    badge: 'نجوم الاحتفال 🎉',
    description: 'أطياف ملونة ونجوم مبهجة تطفو بنعومة لأعياد الميلاد والمناسبات السعيدة',
  },
  {
    id: 'none',
    label: 'إيقاف المؤثرات البصرية',
    badge: 'بدون مؤثر ⏸',
    description: 'عرض تصميم البطاقة بدون جزيئات أو هالات ضوئية متحركة',
  },
];

export function resolveVisualEffect(
  category: InvitationCategory,
  explicitEffect?: VisualEffectType
): Exclude<VisualEffectType, 'auto'> {
  if (explicitEffect && explicitEffect !== 'auto') {
    return explicitEffect;
  }

  switch (category) {
    case 'wedding':
    case 'engagement':
      return 'rose_petals';
    case 'henna':
    case 'family_success':
      return 'lantern_glow';
    case 'art_exhibition':
      return 'gallery_spotlight';
    case 'birthday':
      return 'confetti_stars';
    case 'career_promotion':
    case 'graduation':
    case 'business_opening':
    default:
      return 'golden_sparkles';
  }
}

interface AmbientVisualEffectsProps {
  category: InvitationCategory;
  effect?: VisualEffectType;
  intensity?: 'normal' | 'rich';
}

export const AmbientVisualEffects: React.FC<AmbientVisualEffectsProps> = ({
  category,
  effect = 'auto',
  intensity = 'normal',
}) => {
  const activeEffect = resolveVisualEffect(category, effect);

  // Deterministic pseudo-random particle configs for smooth rendering without hydration/re-render jitter
  const rosePetals = useMemo(() => {
    const count = intensity === 'rich' ? 22 : 16;
    const palette = [
      { fill: '#f43f5e', stroke: '#fda4af', glow: 'rgba(244,63,94,0.35)' }, // Crimson Rose
      { fill: '#fb7185', stroke: '#fecdd3', glow: 'rgba(251,113,133,0.3)' }, // Blush Rose
      { fill: '#fda4af', stroke: '#fff1f2', glow: 'rgba(253,164,175,0.28)' }, // Soft Pink Petal
      { fill: '#e11d48', stroke: '#fb7185', glow: 'rgba(225,29,72,0.35)' }, // Deep Velvet Rose
      { fill: '#f5d08a', stroke: '#fef08a', glow: 'rgba(212,175,55,0.35)' }, // Golden Jasmine Accent
    ];

    return Array.from({ length: count }).map((_, i) => {
      const color = palette[i % palette.length];
      const startX = (i * 17 + 7) % 94;
      const sway = 28 + (i % 4) * 16;
      const size = 14 + (i % 5) * 4;
      const duration = 9 + (i % 6) * 2.2;
      const delay = (i * 0.65) % 8;
      const isBlurred = i % 5 === 0;

      return {
        id: `petal-${i}`,
        color,
        startX,
        sway: i % 2 === 0 ? sway : -sway,
        size,
        duration,
        delay,
        isBlurred,
        initialRotate: (i * 45) % 360,
      };
    });
  }, [intensity]);

  const lanternOrbs = useMemo(() => {
    const count = intensity === 'rich' ? 18 : 14;
    return Array.from({ length: count }).map((_, i) => ({
      id: `lantern-orb-${i}`,
      left: `${(i * 19 + 6) % 92}%`,
      bottom: `${(i * 13) % 45}%`,
      size: 6 + (i % 4) * 5,
      duration: 5.5 + (i % 5) * 1.6,
      delay: (i * 0.5) % 5,
      driftX: i % 2 === 0 ? 22 : -22,
      isWarmAmber: i % 3 !== 0,
    }));
  }, [intensity]);

  const goldenSparkles = useMemo(() => {
    const count = intensity === 'rich' ? 20 : 15;
    return Array.from({ length: count }).map((_, i) => ({
      id: `sparkle-${i}`,
      left: `${(i * 23 + 8) % 92}%`,
      top: `${(i * 17 + 10) % 88}%`,
      size: 10 + (i % 4) * 5,
      duration: 3.2 + (i % 4) * 1.1,
      delay: (i * 0.4) % 4,
    }));
  }, [intensity]);

  const galleryMotes = useMemo(() => {
    const count = 14;
    const colors = ['#f97316', '#f59e0b', '#fbbf24', '#fdba74', '#fcd34d'];
    return Array.from({ length: count }).map((_, i) => ({
      id: `gallery-${i}`,
      left: `${(i * 15 + 10) % 90}%`,
      top: `${(i * 21 + 8) % 85}%`,
      size: 8 + (i % 4) * 6,
      color: colors[i % colors.length],
      duration: 6 + (i % 4) * 1.8,
      delay: i * 0.45,
    }));
  }, []);

  const festiveStars = useMemo(() => {
    const count = 16;
    const colors = ['#f472b6', '#fbbf24', '#38bdf8', '#a78bfa', '#34d399'];
    return Array.from({ length: count }).map((_, i) => ({
      id: `festive-${i}`,
      left: `${(i * 16 + 5) % 92}%`,
      size: 11 + (i % 4) * 4,
      color: colors[i % colors.length],
      duration: 7 + (i % 5) * 1.5,
      delay: (i * 0.55) % 6,
      sway: i % 2 === 0 ? 24 : -24,
    }));
  }, []);

  if (activeEffect === 'none') {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-15 select-none"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {/* 1. ROSE PETALS PARTICLE SYSTEM ('نثر الورود المتحرك') */}
        {activeEffect === 'rose_petals' && (
          <motion.div
            key="effect-rose-petals"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Subtle top romantic ambient blush glow */}
            <motion.div
              animate={{
                opacity: [0.18, 0.32, 0.18],
                scale: [1, 1.08, 1],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[220px] rounded-full bg-gradient-to-b from-rose-500/25 via-pink-400/10 to-transparent blur-3xl"
            />

            {rosePetals.map((petal) => (
              <motion.div
                key={petal.id}
                initial={{
                  y: '-10%',
                  x: 0,
                  opacity: 0,
                  rotateZ: petal.initialRotate,
                  rotateX: 0,
                  rotateY: 0,
                }}
                animate={{
                  y: ['-8%', '112%'],
                  x: [0, petal.sway, -petal.sway * 0.6, petal.sway * 0.4, 0],
                  opacity: [0, 0.88, 0.85, 0.75, 0],
                  rotateZ: [
                    petal.initialRotate,
                    petal.initialRotate + 140,
                    petal.initialRotate + 290,
                  ],
                  rotateX: [0, 180, 360],
                  rotateY: [0, 140, 280],
                }}
                transition={{
                  duration: petal.duration,
                  repeat: Infinity,
                  delay: petal.delay,
                  ease: 'linear',
                }}
                style={{
                  left: `${petal.startX}%`,
                  width: petal.size,
                  height: petal.size * 1.15,
                  filter: petal.isBlurred
                    ? 'blur(1.5px)'
                    : `drop-shadow(0 2px 6px ${petal.color.glow})`,
                  transformStyle: 'preserve-3d',
                }}
                className="absolute top-0"
              >
                {/* Custom SVG Organic Rose Petal Shape */}
                <svg
                  viewBox="0 0 32 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    d="M16 2C9.5 2 3 8.5 3 17.5C3 26.5 11.5 33.5 16 34.5C20.5 33.5 29 26.5 29 17.5C29 8.5 22.5 2 16 2Z"
                    fill={petal.color.fill}
                    fillOpacity="0.88"
                    stroke={petal.color.stroke}
                    strokeWidth="1"
                  />
                  <path
                    d="M16 7C14 14 14.5 22 16 31"
                    stroke={petal.color.stroke}
                    strokeWidth="0.8"
                    strokeOpacity="0.55"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 2. LANTERN GLOW EFFECTS ('توهج الفوانيس') */}
        {activeEffect === 'lantern_glow' && (
          <motion.div
            key="effect-lantern-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Top Right Hanging Lantern Aura */}
            <motion.div
              animate={{
                scale: [1, 1.22, 1],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-12 right-8 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.42)_0%,rgba(217,119,6,0.18)_45%,transparent_72%)] blur-xl"
            />

            {/* Top Left Hanging Lantern Aura */}
            <motion.div
              animate={{
                scale: [1.1, 0.92, 1.1],
                opacity: [0.3, 0.58, 0.3],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute -top-8 left-8 w-52 h-52 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.38)_0%,rgba(180,83,9,0.15)_48%,transparent_72%)] blur-xl"
            />

            {/* Center Warm Breathing Hearth Halo */}
            <motion.div
              animate={{
                scale: [0.95, 1.12, 0.95],
                opacity: [0.18, 0.36, 0.18],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 h-64 rounded-full bg-[radial-gradient(circle,rgba(252,211,77,0.28)_0%,rgba(217,119,6,0.1)_55%,transparent_75%)] blur-2xl"
            />

            {/* Miniature Decorative Hanging Lantern Silhouettes at Top Corners */}
            {[
              { side: 'right-10', delay: 0, chainHeight: 'h-8' },
              { side: 'left-10', delay: 1.4, chainHeight: 'h-12' },
            ].map((lantern, idx) => (
              <motion.div
                key={`hanging-fanous-${idx}`}
                animate={{ rotate: [-2.5, 2.5, -2.5] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: lantern.delay,
                }}
                style={{ transformOrigin: 'top center' }}
                className={`absolute top-0 ${lantern.side} flex flex-col items-center opacity-75`}
              >
                <div className={`w-[1.5px] ${lantern.chainHeight} bg-gradient-to-b from-amber-300/70 to-amber-500`} />
                <div className="relative w-7 h-10 flex flex-col items-center">
                  {/* Lantern Dome */}
                  <div className="w-5 h-2.5 rounded-t-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 border-t border-amber-200" />
                  {/* Glowing Glass Body */}
                  <div className="relative w-6 h-5 bg-amber-950/60 border border-amber-400/80 flex items-center justify-center rounded-xs shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                    <motion.div
                      animate={{
                        scale: [0.85, 1.35, 0.95],
                        opacity: [0.75, 1, 0.8],
                      }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-2.5 h-3.5 rounded-full bg-gradient-to-t from-orange-500 via-amber-200 to-white shadow-[0_0_12px_#fde047]"
                    />
                  </div>
                  {/* Lantern Base */}
                  <div className="w-5 h-1.5 rounded-b-md bg-amber-600 border-b border-amber-300" />
                </div>
              </motion.div>
            ))}

            {/* Rising Warm Lantern Light Orbs / Fireflies */}
            {lanternOrbs.map((orb) => (
              <motion.div
                key={orb.id}
                initial={{
                  y: 40,
                  x: 0,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  y: [30, -280],
                  x: [0, orb.driftX, -orb.driftX * 0.5, 0],
                  opacity: [0, 0.9, 0.75, 0],
                  scale: [0.6, 1.25, 0.85, 0.4],
                }}
                transition={{
                  duration: orb.duration,
                  repeat: Infinity,
                  delay: orb.delay,
                  ease: 'easeInOut',
                }}
                style={{
                  left: orb.left,
                  bottom: orb.bottom,
                  width: orb.size,
                  height: orb.size,
                }}
                className={`absolute rounded-full ${
                  orb.isWarmAmber
                    ? 'bg-gradient-to-tr from-amber-500 via-yellow-300 to-white shadow-[0_0_16px_4px_rgba(251,191,36,0.75)]'
                    : 'bg-gradient-to-tr from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_14px_3px_rgba(249,115,22,0.65)]'
                }`}
              />
            ))}
          </motion.div>
        )}

        {/* 3. GOLDEN SPARKLES ('بريق الذهب الملكي') */}
        {activeEffect === 'golden_sparkles' && (
          <motion.div
            key="effect-golden-sparkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Subtle Royal Gold Crown Halo */}
            <motion.div
              animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.06, 0.98] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.26)_0%,transparent_70%)] blur-2xl"
            />

            {goldenSparkles.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.2, rotate: 0 }}
                animate={{
                  opacity: [0, 0.95, 0.3, 0.9, 0],
                  scale: [0.3, 1.15, 0.7, 1.05, 0.2],
                  rotate: [0, 90, 180],
                  y: [0, -18, -36],
                }}
                transition={{
                  duration: s.duration,
                  repeat: Infinity,
                  delay: s.delay,
                  ease: 'easeInOut',
                }}
                style={{
                  left: s.left,
                  top: s.top,
                  width: s.size,
                  height: s.size,
                }}
                className="absolute flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-full h-full drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]"
                >
                  <path
                    d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
                    fill="url(#goldGrad)"
                  />
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="24" y2="24">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fffbeb" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 4. GALLERY SPOTLIGHT ('إضاءة المعرض المتحفية') */}
        {activeEffect === 'gallery_spotlight' && (
          <motion.div
            key="effect-gallery-spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Sweeping Museum Spotlight Beam 1 */}
            <motion.div
              animate={{
                rotate: [-12, 8, -12],
                opacity: [0.22, 0.38, 0.22],
              }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: 'top center' }}
              className="absolute -top-16 left-1/3 w-64 h-[480px] bg-gradient-to-b from-amber-300/30 via-orange-400/10 to-transparent [clip-path:polygon(40%_0%,60%_0%,100%_100%,0%_100%)] blur-xl"
            />

            {/* Sweeping Museum Spotlight Beam 2 */}
            <motion.div
              animate={{
                rotate: [10, -10, 10],
                opacity: [0.18, 0.34, 0.18],
              }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              style={{ transformOrigin: 'top center' }}
              className="absolute -top-16 right-1/3 w-64 h-[480px] bg-gradient-to-b from-orange-300/25 via-amber-500/10 to-transparent [clip-path:polygon(40%_0%,60%_0%,100%_100%,0%_100%)] blur-xl"
            />

            {/* Floating Fine Art Dust Motes */}
            {galleryMotes.map((mote) => (
              <motion.div
                key={mote.id}
                animate={{
                  y: [0, -35, 10, 0],
                  x: [0, 20, -15, 0],
                  opacity: [0.15, 0.75, 0.25, 0.15],
                  scale: [0.8, 1.3, 0.9, 0.8],
                }}
                transition={{
                  duration: mote.duration,
                  repeat: Infinity,
                  delay: mote.delay,
                  ease: 'easeInOut',
                }}
                style={{
                  left: mote.left,
                  top: mote.top,
                  width: mote.size,
                  height: mote.size,
                  backgroundColor: mote.color,
                  boxShadow: `0 0 12px ${mote.color}`,
                }}
                className="absolute rounded-full blur-[0.5px]"
              />
            ))}
          </motion.div>
        )}

        {/* 5. CONFETTI STARS ('نجوم وأطياف الاحتفال') */}
        {activeEffect === 'confetti_stars' && (
          <motion.div
            key="effect-confetti-stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {festiveStars.map((item) => (
              <motion.div
                key={item.id}
                initial={{ y: '-10%', x: 0, opacity: 0, rotate: 0 }}
                animate={{
                  y: ['-8%', '110%'],
                  x: [0, item.sway, -item.sway * 0.7, 0],
                  opacity: [0, 0.85, 0.8, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: item.duration,
                  repeat: Infinity,
                  delay: item.delay,
                  ease: 'linear',
                }}
                style={{
                  left: item.left,
                  color: item.color,
                  fontSize: item.size,
                  textShadow: `0 0 10px ${item.color}`,
                }}
                className="absolute top-0 font-bold"
              >
                ✦
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
