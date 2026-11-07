import React, { useState } from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface RibbonProps {
  onOpen: () => void;
  title: string;
  businessName?: string;
}

export const RibbonCutExperience: React.FC<RibbonProps> = ({
  onOpen,
  title,
  businessName,
}) => {
  const [cut, setCut] = useState(false);

  const handleCut = () => {
    if (cut) return;
    setCut(true);
    soundEngine.playCelebrationFanfare();
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#d4af37', '#ffffff'],
      });
    } catch {}
    setTimeout(() => {
      onOpen();
    }, 1000);
  };

  return (
    <div
      onClick={handleCut}
      className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#101726] via-[#0b101b] to-[#060910] border border-amber-500/30 p-6 flex flex-col items-center justify-between shadow-2xl cursor-pointer select-none overflow-hidden"
    >
      {/* Decorative Gold Dust Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

      {/* Top Proclamation */}
      <div className="relative z-10 text-center">
        <span className="text-amber-400 font-cairo text-xs font-semibold tracking-widest uppercase">
          مراسم الافتتاح الرسمي VIP
        </span>
        <h3 className="text-white font-cairo text-lg font-bold mt-0.5">
          {businessName || title}
        </h3>
      </div>

      {/* Center Satin Ribbon with Scissors */}
      <div className="relative z-10 w-full flex items-center justify-center my-auto">
        {/* Left Ribbon Half */}
        <motion.div
          animate={cut ? { x: -60, opacity: 0.4, rotate: -10 } : { x: 0 }}
          transition={{ duration: 0.6 }}
          className="h-9 flex-1 bg-gradient-to-r from-red-800 via-red-600 to-red-500 shadow-lg border-y border-amber-300/40"
        />

        {/* Center Ribbon Bow & Scissors */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={cut ? { scale: 0, opacity: 0 } : { scale: 1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-amber-200 shadow-[0_0_20px_rgba(234,179,8,0.5)] z-20 flex flex-col items-center justify-center -mx-2"
        >
          <span className="text-xl">✂️</span>
          <span className="text-[9px] text-neutral-950 font-bold font-cairo">قص الشريط</span>
        </motion.div>

        {/* Right Ribbon Half */}
        <motion.div
          animate={cut ? { x: 60, opacity: 0.4, rotate: 10 } : { x: 0 }}
          transition={{ duration: 0.6 }}
          className="h-9 flex-1 bg-gradient-to-r from-red-500 via-red-600 to-red-800 shadow-lg border-y border-amber-300/40"
        />
      </div>

      {/* Action Button */}
      <div className="relative z-10 text-center pb-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 font-bold font-cairo text-xs shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-amber-200 flex items-center gap-2 mx-auto"
        >
          <span>✂️ انقر لقص شريط الافتتاح ومتابعة التفاصيل</span>
        </motion.button>
        <div className="text-amber-200/60 text-[10px] mt-1.5 font-cairo">
          اضغط لفتح بطاقة الدعوة الرسمية وجدول الفعاليات
        </div>
      </div>
    </div>
  );
};
