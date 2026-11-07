import React, { useState } from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../../utils/audio';

interface HennaProps {
  onOpen: () => void;
  title: string;
  brideName?: string;
}

export const HennaExperience: React.FC<HennaProps> = ({ onOpen, title, brideName }) => {
  const [lit, setLit] = useState(false);

  const handleLight = () => {
    setLit(true);
    soundEngine.playCelebrationFanfare();
    setTimeout(() => {
      onOpen();
    }, 1000);
  };

  return (
    <div
      onClick={handleLight}
      className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#082017] via-[#05150f] to-[#030d0a] border border-amber-500/30 p-6 flex flex-col items-center justify-between shadow-2xl cursor-pointer select-none overflow-hidden"
    >
      {/* Oriental Arabesque Background Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Ambient Lantern Glow Halo Rings (توهج الفوانيس) */}
      <motion.div
        animate={{
          scale: lit ? [1.1, 1.45, 1.25] : [0.95, 1.15, 0.95],
          opacity: lit ? [0.55, 0.85, 0.65] : [0.25, 0.45, 0.25],
        }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.42)_0%,rgba(217,119,6,0.16)_50%,transparent_75%)] blur-xl pointer-events-none"
      />

      {/* Rising Lantern Firefly Sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, idx) => (
          <motion.div
            key={`henna-spark-${idx}`}
            initial={{ y: 20, opacity: 0, scale: 0.5 }}
            animate={{
              y: [10, -140],
              x: [0, idx % 2 === 0 ? 18 : -18, 0],
              opacity: [0, 0.9, 0],
              scale: [0.5, 1.2, 0.4],
            }}
            transition={{
              duration: 3.5 + (idx % 4) * 0.8,
              repeat: Infinity,
              delay: idx * 0.35,
              ease: 'easeOut',
            }}
            style={{
              left: `${15 + ((idx * 17) % 70)}%`,
              bottom: '18%',
            }}
            className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_12px_3px_rgba(251,191,36,0.8)]"
          />
        ))}
      </div>

      {/* Top Header */}
      <div className="relative z-10 text-center">
        <div className="text-amber-400 font-amiri text-sm tracking-widest">ليلة الحنة المباركة</div>
        <div className="text-amber-200/90 font-cairo text-lg font-bold mt-1">
          {brideName ? `حنة العروس ${brideName}` : title}
        </div>
      </div>

      {/* Center Fanous Lantern Graphic */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Lantern Hanging Chain */}
        <div className="w-0.5 h-6 bg-gradient-to-b from-amber-200 to-amber-500" />
        
        {/* Lantern Body */}
        <motion.div
          animate={
            lit
              ? { scale: [1, 1.15, 1.1], rotate: [0, -3, 3, 0] }
              : { rotate: [-1.5, 1.5, -1.5] }
          }
          transition={
            lit
              ? { duration: 0.6 }
              : { repeat: Infinity, duration: 4, ease: 'easeInOut' }
          }
          style={{ transformOrigin: 'top center' }}
          className="relative w-28 h-36 flex flex-col items-center"
        >
          {/* Outer Pulsing Lantern Glow Ring */}
          <motion.div
            animate={{
              scale: lit ? [1.1, 1.35, 1.15] : [0.95, 1.12, 0.95],
              opacity: lit ? [0.6, 0.95, 0.7] : [0.3, 0.55, 0.3],
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl pointer-events-none"
          />

          {/* Top Dome */}
          <div className="w-20 h-8 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700 rounded-t-full border-t border-amber-300 shadow-md flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-amber-200 shadow-[0_0_8px_#ffd700]" />
          </div>

          {/* Glass Chamber */}
          <div className="relative w-24 h-20 bg-emerald-950/80 border-x-2 border-amber-500/60 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.35)]">
            {/* Candle Inside */}
            <div className="relative w-5 h-12 bg-amber-100 rounded-t-sm shadow-inner flex flex-col items-center justify-start">
              {/* Flame */}
              <motion.div
                animate={{
                  scale: lit ? [1.2, 1.6, 1.3] : [0.9, 1.15, 0.95],
                  opacity: lit ? 1 : 0.9,
                }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className={`w-4 h-6 rounded-full -mt-4 shadow-lg ${
                  lit
                    ? 'bg-gradient-to-t from-orange-500 via-yellow-300 to-white shadow-[0_0_30px_#ff9900]'
                    : 'bg-gradient-to-t from-amber-600 to-amber-300 shadow-[0_0_18px_#fbbf24]'
                }`}
              />
            </div>

            {/* Glowing aura */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                lit ? 'bg-amber-400/35' : 'bg-amber-400/10'
              }`}
            />
          </div>

          {/* Bottom Base */}
          <div className="w-22 h-6 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 rounded-b-lg border-b border-amber-300" />
        </motion.div>
      </div>

      {/* Action Prompt */}
      <div className="relative z-10 text-center pb-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold font-cairo text-xs shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-amber-200 flex items-center gap-2 mx-auto"
        >
          <span>✨ أوقد الفانوس وادخل الاحتفال</span>
        </motion.button>
        <div className="text-emerald-400/70 text-[10px] mt-2 font-cairo">
          انقر لمشاهدة نقوش الحناء وتفاصيل الليلة
        </div>
      </div>
    </div>
  );
};
