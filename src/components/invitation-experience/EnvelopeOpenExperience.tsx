import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../../utils/audio';

interface EnvelopeProps {
  onOpen: () => void;
  title: string;
  sealText?: string;
  hostSubtitle?: string;
  themeColor?: string;
}

export const EnvelopeOpenExperience: React.FC<EnvelopeProps> = ({
  onOpen,
  title,
  sealText = 'ختم ملكي',
  hostSubtitle,
  themeColor = '#8a1d2e',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    soundEngine.playEnvelopeOpen();
    setTimeout(() => {
      onOpen();
    }, 900);
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] flex items-center justify-center cursor-pointer select-none" onClick={handleOpen}>
      {/* Envelope Outer Shadow Box */}
      <div className="relative w-full h-full bg-[#181920] rounded-2xl p-4 shadow-2xl border border-amber-500/20 flex flex-col justify-between overflow-hidden">
        {/* Decorative corner borders */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400/40 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400/40 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400/40 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400/40 pointer-events-none" />

        {/* Envelope Body Graphics */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b1e27] via-[#141720] to-[#0e1017] opacity-90" />

        {/* Subtle Floating Rose Petals & Gold Motes around Envelope */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
          {Array.from({ length: 8 }).map((_, idx) => (
            <motion.div
              key={`env-petal-${idx}`}
              initial={{ y: -20, opacity: 0, rotate: 0 }}
              animate={{
                y: ['-10%', '115%'],
                x: [0, idx % 2 === 0 ? 20 : -20, 0],
                opacity: [0, 0.75, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 6 + (idx % 4) * 1.5,
                repeat: Infinity,
                delay: idx * 0.7,
                ease: 'linear',
              }}
              style={{ left: `${10 + ((idx * 13) % 80)}%` }}
              className="absolute top-0 w-3 h-3.5"
            >
              <svg viewBox="0 0 24 28" fill="none" className="w-full h-full">
                <path
                  d="M12 2C7 2 2 7 2 14C2 21 8.5 26 12 27C15.5 26 22 21 22 14C22 7 17 2 12 2Z"
                  fill={idx % 3 === 0 ? '#f5d08a' : '#fb7185'}
                  fillOpacity="0.75"
                />
              </svg>
            </motion.div>
          ))}
        </div>

        {/* Diagonal Envelope Fold Triangles */}
        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-[#12141c] border-t border-amber-500/15 [clip-path:polygon(0_100%,50%_40%,100%_100%)] pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-[50%] bg-[#151822]/60 [clip-path:polygon(0_0,100%_50%,0_100%)] pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-[50%] bg-[#151822]/60 [clip-path:polygon(100%_0,0_50%,100%_100%)] pointer-events-none" />

        {/* Top Flap with Open Animation */}
        <motion.div
          animate={isOpen ? { rotateX: 180, zIndex: 0, opacity: 0.3 } : { rotateX: 0, zIndex: 10 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'top center' }}
          className="absolute inset-x-0 top-0 h-[55%] bg-[#1f2330] border-b border-amber-400/30 [clip-path:polygon(0_0,100%_0,50%_100%)] shadow-md"
        />

        {/* Letter Peeking Out animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isOpen ? { y: -60, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute inset-x-8 top-10 bottom-6 bg-[#fbf8f2] text-neutral-900 rounded-lg p-4 shadow-xl border border-amber-300/60 z-5 flex flex-col items-center justify-center text-center pointer-events-none"
        >
          <div className="text-amber-800 text-xs font-amiri tracking-wider mb-1">بسم الله الرحمن الرحيم</div>
          <div className="text-base font-bold font-cairo text-neutral-900">{title}</div>
          <div className="text-xs text-neutral-600 mt-1">تفتح الآن...</div>
        </motion.div>

        {/* Center Wax Seal Button */}
        <div className="relative z-20 my-auto flex flex-col items-center justify-center text-center">
          <AnimatePresence>
            {!isOpen && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-full shadow-[0_0_25px_rgba(212,175,55,0.4)] flex flex-col items-center justify-center border-2 border-amber-300 relative group"
                style={{ backgroundColor: themeColor }}
              >
                <div className="absolute inset-1 rounded-full border border-amber-200/40 pointer-events-none" />
                <span className="text-amber-200 text-[11px] font-bold font-cairo tracking-wide">
                  {sealText}
                </span>
                <span className="text-amber-300/80 text-[9px] mt-0.5">
                  انقر للفتح
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {!isOpen && (
            <div className="mt-4 text-center">
              <h3 className="text-amber-100/90 text-sm font-semibold font-cairo tracking-wide">
                {title}
              </h3>
              {hostSubtitle && (
                <p className="text-amber-300/60 text-xs mt-0.5 font-cairo">
                  {hostSubtitle}
                </p>
              )}
              <p className="text-neutral-400 text-[11px] mt-3 animate-pulse">
                اضغط على الختم لفتح الدعوة عيش التجربة ✨
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
