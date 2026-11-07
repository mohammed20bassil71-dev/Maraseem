import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';

interface BirthdayProps {
  onOpen: () => void;
  title: string;
  name?: string;
  age?: number | string;
}

export const BirthdayCakeExperience: React.FC<BirthdayProps> = ({
  onOpen,
  title,
  name,
  age = 7,
}) => {
  const [candlesBlown, setCandlesBlown] = useState(false);

  const handleBlowCandles = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (candlesBlown) return;

    setCandlesBlown(true);
    soundEngine.playCandleBlow();

    // Fire fireworks confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#eab308', '#06b6d4'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch {}

    soundEngine.playCelebrationFanfare();

    setTimeout(() => {
      onOpen();
    }, 1200);
  };

  return (
    <div
      onClick={handleBlowCandles}
      className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#241332] via-[#1a0e24] to-[#100717] border border-pink-500/30 p-6 flex flex-col items-center justify-between shadow-2xl cursor-pointer select-none overflow-hidden"
    >
      {/* Decorative Starry Burst Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

      {/* Floating balloons background */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute top-4 left-6 w-8 h-10 rounded-full bg-rose-500/40 border border-rose-400/60 shadow-md"
      />
      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="absolute top-8 right-6 w-7 h-9 rounded-full bg-amber-400/40 border border-amber-300/60 shadow-md"
      />

      {/* Header */}
      <div className="relative z-10 text-center">
        <span className="text-pink-400 font-cairo text-xs font-semibold tracking-wider">
          🎂 حفلة عيد ميلاد مميزة
        </span>
        <h3 className="text-white font-cairo text-lg font-bold mt-0.5">
          {name ? `عيد ميلاد ${name}` : title}
        </h3>
      </div>

      {/* Center Interactive Birthday Cake */}
      <div className="relative z-10 flex flex-col items-center mt-2">
        {/* Candles */}
        <div className="flex items-end justify-center gap-3 -mb-1">
          {[1, 2, 3].map((c) => (
            <div key={c} className="flex flex-col items-center">
              {/* Flame */}
              <AnimatePresence>
                {!candlesBlown ? (
                  <motion.div
                    key="flame"
                    animate={{
                      scaleY: [1, 1.25, 1],
                      scaleX: [1, 0.85, 1],
                      opacity: [0.9, 1, 0.9],
                    }}
                    transition={{ repeat: Infinity, duration: 0.6 + c * 0.2 }}
                    className="w-3 h-5 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_12px_#ffaa00]"
                  />
                ) : (
                  <motion.div
                    key="smoke"
                    initial={{ opacity: 0.8, y: 0, scale: 0.8 }}
                    animate={{ opacity: 0, y: -20, scale: 1.5 }}
                    transition={{ duration: 0.8 }}
                    className="w-2 h-2 rounded-full bg-neutral-400/70 blur-xs"
                  />
                )}
              </AnimatePresence>

              {/* Candle Stick */}
              <div className="w-1.5 h-6 bg-gradient-to-b from-pink-300 via-yellow-200 to-blue-300 rounded-t-sm shadow" />
            </div>
          ))}
        </div>

        {/* Top Cake Tier */}
        <div className="w-24 h-10 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-300 rounded-t-xl border border-pink-100 shadow-md flex items-center justify-center relative">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-neutral-900 font-bold text-xs flex items-center justify-center shadow">
            {age}
          </div>
          {/* Frosting drips */}
          <div className="absolute -bottom-1 inset-x-0 h-2 bg-pink-100 rounded-full" />
        </div>

        {/* Bottom Cake Tier */}
        <div className="w-36 h-12 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-b-xl border border-purple-200 shadow-lg flex items-center justify-around px-3">
          <span className="text-[10px]">✨</span>
          <span className="text-[10px]">🎉</span>
          <span className="text-[10px]">✨</span>
        </div>

        {/* Cake Platter */}
        <div className="w-44 h-2.5 bg-gradient-to-r from-neutral-200 via-white to-neutral-300 rounded-full shadow-md -mt-0.5" />
      </div>

      {/* Action Button */}
      <div className="relative z-10 text-center pb-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold font-cairo text-xs shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-pink-300 flex items-center gap-2 mx-auto"
        >
          <span>💨 انقر لإطفاء الشموع والاحتفال!</span>
        </motion.button>
        <div className="text-pink-300/70 text-[10px] mt-1.5 font-cairo">
          اضغط لمعرفة موعد ومكان الحفلة
        </div>
      </div>
    </div>
  );
};
