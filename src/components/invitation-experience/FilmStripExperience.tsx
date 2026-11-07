import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clapperboard, Film, Sparkles, Ticket } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface FilmStripProps {
  onOpen: () => void;
  title: string;
  groomName?: string;
  brideName?: string;
  tagline?: string;
}

export const FilmStripExperience: React.FC<FilmStripProps> = ({
  onOpen,
  title,
  groomName = 'علي الساعدي',
  brideName = 'فاطمة البغدادي',
  tagline = 'عندما تبتسم الأقدار... لتجمع قلبين في مسار واحد',
}) => {
  const [clapped, setClapped] = useState(false);

  const handleClap = () => {
    if (clapped) return;
    setClapped(true);
    soundEngine.playChime(440, 0.4);
    soundEngine.playChime(880, 0.8);
    setTimeout(() => {
      onOpen();
    }, 950);
  };

  return (
    <div
      onClick={handleClap}
      className="relative w-full max-w-lg mx-auto aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-[#090a0d] border border-amber-500/30 shadow-2xl cursor-pointer select-none overflow-hidden flex flex-col justify-between p-4 sm:p-6"
    >
      {/* 35mm Film Strip Perforations Along Left & Right Edges */}
      <div className="absolute inset-y-0 left-0 w-8 bg-[#050608] border-r border-neutral-800 flex flex-col justify-between py-2 items-center pointer-events-none z-10">
        {[...Array(9)].map((_, i) => (
          <div
            key={`left-${i}`}
            className="w-3.5 h-4.5 rounded-sm bg-neutral-900 border border-neutral-700/60 shadow-inner"
          />
        ))}
      </div>

      <div className="absolute inset-y-0 right-0 w-8 bg-[#050608] border-l border-neutral-800 flex flex-col justify-between py-2 items-center pointer-events-none z-10">
        {[...Array(9)].map((_, i) => (
          <div
            key={`right-${i}`}
            className="w-3.5 h-4.5 rounded-sm bg-neutral-900 border border-neutral-700/60 shadow-inner"
          />
        ))}
      </div>

      {/* Cinematic Widescreen Letterbox Bars */}
      <div className="absolute inset-x-8 top-0 h-4 bg-black/90 z-10" />
      <div className="absolute inset-x-8 bottom-0 h-4 bg-black/90 z-10" />

      {/* Grain / Noise Filter Effect */}
      <div className="absolute inset-x-8 inset-y-4 opacity-25 bg-[radial-gradient(#f59e0b_0.75px,transparent_0.75px)] [background-size:12px_12px] pointer-events-none" />

      {/* Clapperboard Opener Header */}
      <div className="relative z-20 px-8 pt-3 text-center">
        <motion.div
          animate={clapped ? { rotateX: [0, -35, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900/90 border border-amber-500/40 text-[11px] font-mono text-amber-300 shadow-md"
        >
          <Clapperboard size={14} className="text-amber-400" />
          <span>SCENE: 01 · TAKE: 01 · ROLL: PREMIERE-2026</span>
        </motion.div>
      </div>

      {/* Center Film Poster Billing Content */}
      <div className="relative z-20 px-8 my-auto text-center space-y-2">
        <span className="text-[10px] sm:text-xs text-amber-400 font-mono tracking-widest uppercase">
          A LOVE STORY PRESENTATION
        </span>

        <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-white tracking-wide">
          {title}
        </h3>

        <div className="text-xs sm:text-sm text-neutral-300 font-cairo italic max-w-sm mx-auto line-clamp-2">
          {tagline}
        </div>

        {/* Lead Actors Presentation */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs sm:text-sm font-bold font-cairo">
          <span className="text-amber-300">{groomName}</span>
          <span className="text-neutral-500">· بطولة مشتركة مع ·</span>
          <span className="text-amber-300">{brideName}</span>
        </div>
      </div>

      {/* Action CTA Button Styled as Golden Clapper Action */}
      <div className="relative z-20 px-8 pb-3 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold font-cairo text-xs shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-200 flex items-center gap-2 mx-auto"
        >
          <Film size={14} />
          <span>🎬 ACTION! انقر لبدء العرض وحجز تذكرتك</span>
        </motion.button>
        <div className="text-neutral-500 text-[10px] mt-1.5 font-mono">
          SOUNDTRACK ENABLED · 35MM CINEMASCOPE
        </div>
      </div>
    </div>
  );
};
