import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface EngagementRingProps {
  onOpen: () => void;
  title: string;
  groomName?: string;
  brideName?: string;
  hostSubtitle?: string;
  eventDate?: string;
}

export const EngagementRingExperience: React.FC<EngagementRingProps> = ({
  onOpen,
  title,
  groomName = 'علي',
  brideName = 'تبارك',
  hostSubtitle,
  eventDate,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleRingClick = () => {
    if (isOpening) return;
    setIsOpening(true);
    soundEngine.playChime(784.0, 1.2);
    try {
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F4C2C2', '#FFFDF8', '#B9CCA0'],
      });
    } catch {
      // ignore confetti errors
    }
    setTimeout(() => {
      onOpen();
    }, 950);
  };

  return (
    <div
      onClick={handleRingClick}
      className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-3xl bg-gradient-to-b from-[#24161D] via-[#180E13] to-[#0E080B] border border-amber-400/35 p-6 flex flex-col items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.75)] cursor-pointer select-none overflow-hidden font-cairo group"
    >
      {/* Ambient Romantic Rose & Gold Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(212,175,55,0.22),_rgba(232,165,152,0.08)_45%,_transparent_75%)]" />

      {/* Top Header & Couple Names Preview */}
      <div className="relative z-10 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-amber-300/90 text-[11px] font-semibold tracking-wider">
          <Sparkles size={12} className="text-amber-300" />
          <span>مراسيم الخطوبة المباركة • لكل دعوة حكاية</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-amiri text-amber-100">
          {groomName} <span className="text-rose-300 mx-1">♥</span> {brideName}
        </h3>
        <p className="text-xs text-rose-200/75">
          {hostSubtitle || title}
          {eventDate ? ` · ${eventDate}` : ''}
        </p>
      </div>

      {/* Animated Floating Solitaire Diamond Engagement Ring */}
      <motion.div
        animate={
          isOpening
            ? { scale: [1, 1.35, 1.6], rotate: [0, 12, -8, 0], opacity: [1, 1, 0] }
            : { y: [0, -8, 0], rotate: [-3, 3, -3] }
        }
        transition={
          isOpening
            ? { duration: 0.9, ease: 'easeInOut' }
            : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative z-10 my-2 flex items-center justify-center"
      >
        {/* Outer Golden Halo Ring */}
        <div className="absolute w-32 h-32 rounded-full border border-amber-400/30 animate-ping opacity-20" />
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-amber-500/15 via-rose-500/10 to-transparent border border-amber-300/30 flex items-center justify-center shadow-[0_0_35px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform">
          <svg
            viewBox="0 0 120 120"
            className="w-24 h-24 drop-shadow-[0_0_16px_rgba(212,175,55,0.55)]"
          >
            {/* Diamond Crown & Facets */}
            <polygon
              points="60,12 42,28 60,44 78,28"
              fill="#FFFDF8"
              stroke="#D4AF37"
              strokeWidth="1.5"
            />
            <polygon
              points="42,28 50,14 70,14 78,28"
              fill="#E0F2FE"
              fillOpacity="0.85"
              stroke="#D4AF37"
              strokeWidth="1.2"
            />
            <line x1="50" y1="14" x2="60" y2="44" stroke="#93C5FD" strokeWidth="1" />
            <line x1="70" y1="14" x2="60" y2="44" stroke="#93C5FD" strokeWidth="1" />
            <line x1="42" y1="28" x2="78" y2="28" stroke="#D4AF37" strokeWidth="1" />

            {/* Diamond Sparkle Star */}
            <path
              d="M60 4 L61.5 9.5 L67 11 L61.5 12.5 L60 18 L58.5 12.5 L53 11 L58.5 9.5 Z"
              fill="#FFFDF8"
            />

            {/* Golden Prongs */}
            <path
              d="M49 35 L54 46 L66 46 L71 35"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Intertwined Rose-Gold & 24K Gold Ring Band */}
            <circle
              cx="60"
              cy="72"
              r="28"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="72"
              r="25"
              fill="none"
              stroke="#F3E5AB"
              strokeWidth="1.6"
              strokeDasharray="6 4"
            />
          </svg>
        </div>
      </motion.div>

      {/* Romantic CTA Button */}
      <div className="relative z-10 text-center space-y-1.5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 font-bold text-xs shadow-[0_0_24px_rgba(212,175,55,0.45)] flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Heart size={14} className="fill-rose-600 text-rose-600" />
          <span>
            {isOpening
              ? 'تُفتح الآن حكاية الخطوبة...'
              : 'اضغط على خاتم الخطوبة لفتح الدعوة 💍'}
          </span>
        </motion.button>
        <p className="text-[10px] text-amber-200/65">
          انقر على الخاتم المضيء للكشف عن أسماء العروسين وتفاصيل الحفل
        </p>
      </div>
    </div>
  );
};
