import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Award, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface GradProps {
  onOpen: () => void;
  title: string;
  graduateName?: string;
  major?: string;
  university?: string;
  college?: string;
  departmentName?: string;
  projectTitle?: string;
  supervisorName?: string;
  isGraduationProject?: boolean;
}

export const GraduationScrollExperience: React.FC<GradProps> = ({
  onOpen,
  title,
  graduateName,
  major = 'medicine',
  university,
  college,
  departmentName,
  projectTitle,
  supervisorName,
  isGraduationProject = false,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    soundEngine.playCelebrationFanfare();
    try {
      confetti({
        particleCount: 65,
        spread: 65,
        origin: { y: 0.62 },
        colors: ['#38bdf8', '#d4af37', '#ffffff', '#B9CCA0'],
      });
    } catch {
      // ignore confetti error
    }
    setTimeout(() => {
      onOpen();
    }, 900);
  };

  const getMajorLabel = () => {
    switch (major) {
      case 'medicine':
        return { badge: '🩺 كلية الطب البشري', color: 'text-cyan-300' };
      case 'dentistry':
        return { badge: '🦷 طب وجراحة الفم والأسنان', color: 'text-sky-300' };
      case 'pharmacy':
        return { badge: '💊 كلية الصيدلة والعلوم الدوائية', color: 'text-emerald-300' };
      case 'ai_tech':
      case 'computer_eng':
        return { badge: '💻 هندسة الذكاء الاصطناعي والحاسوب', color: 'text-cyan-300' };
      case 'civil_eng':
        return { badge: '🏗️ كلية الهندسة والعمارة', color: 'text-amber-300' };
      case 'law':
        return { badge: '⚖️ كلية القانون والحقوق', color: 'text-amber-300' };
      default:
        return {
          badge: isGraduationProject
            ? '🔬 مناقشة مشروع التخرج الأكاديمي'
            : '🎓 فرحة التخرج والشهادة الجامعية',
          color: 'text-amber-300',
        };
    }
  };

  const majorMeta = getMajorLabel();

  return (
    <div
      onClick={handleOpen}
      className="relative w-full max-w-md mx-auto rounded-3xl bg-gradient-to-b from-[#0b1b2b] via-[#081320] to-[#040810] border border-amber-400/35 p-6 flex flex-col items-center justify-between gap-4 shadow-2xl cursor-pointer select-none overflow-hidden font-cairo group"
    >
      {/* Background Academic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center space-y-1">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${majorMeta.color}`}>
          <Sparkles size={12} />
          <span>{majorMeta.badge}</span>
        </span>
        <h3 className="text-white text-lg sm:text-xl font-bold">
          {graduateName ? `${isGraduationProject ? 'الباحث: ' : 'تخرج '}${graduateName}` : title}
        </h3>
        {(university || college || departmentName) && (
          <p className="text-cyan-200/80 text-xs">
            {[university, college, departmentName].filter(Boolean).join(' • ')}
          </p>
        )}
        {projectTitle && (
          <div className="mt-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-200 text-xs font-bold max-w-xs mx-auto">
            مشروع التخرج: «{projectTitle}»
          </div>
        )}
        {supervisorName && (
          <p className="text-[11px] text-amber-300/80">بإشراف: {supervisorName}</p>
        )}
      </div>

      {/* Animated 3D-style Mortarboard Graduation Cap + Books + Diploma Scroll */}
      <div className="relative z-10 flex flex-col items-center my-1">
        <motion.div
          animate={
            isOpening
              ? { y: [-4, -36, -12], rotate: [0, -14, 10, 0], scale: [1, 1.2, 1.05] }
              : { y: [0, -7, 0], rotate: [-2, 2, -2] }
          }
          transition={
            isOpening
              ? { duration: 0.85, ease: 'easeOut' }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }
          className="relative"
        >
          {/* SVG Animated Graduation Cap (قبعة التخرج المتحركة) */}
          <svg
            viewBox="0 0 140 95"
            className="w-32 h-22 drop-shadow-[0_10px_20px_rgba(212,175,55,0.3)]"
          >
            {/* Mortarboard Diamond Top */}
            <polygon
              points="70,10 130,34 70,58 10,34"
              fill="#112236"
              stroke="#D4AF37"
              strokeWidth="2.2"
            />
            <polygon
              points="70,15 120,34 70,53 20,34"
              fill="#1A324C"
              stroke="#38BDF8"
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
            {/* Skull Cap Base */}
            <path
              d="M38 46 V68 C38 77, 102 77, 102 68 V46"
              fill="#0D1B2A"
              stroke="#D4AF37"
              strokeWidth="1.8"
            />
            {/* Center Gold Button & Animated Tassel */}
            <circle cx="70" cy="34" r="4.5" fill="#D4AF37" />
            <path
              d="M70 34 Q96 42 106 68"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <polygon points="103,66 109,66 112,80 100,80" fill="#F5D77F" />
          </svg>
        </motion.div>

        {/* Rolled Diploma Scroll & Academic Books */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mt-1 relative w-40 h-9 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-200 rounded-lg shadow-lg border border-amber-300 flex items-center justify-center overflow-hidden"
        >
          <div className="w-6 h-full bg-red-700 shadow-md flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-200" />
          </div>
          <div className="flex-1 px-3 flex items-center justify-between text-[10px] font-bold text-amber-950">
            <span>{isGraduationProject ? 'ملف المشروع' : 'وثيقة التخرج'}</span>
            <BookOpen size={12} className="text-amber-800" />
          </div>
        </motion.div>
      </div>

      {/* Action Button */}
      <div className="relative z-10 text-center">
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 font-bold text-xs shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Award size={15} />
          <span>
            {isGraduationProject
              ? 'افتح دعوة مناقشة مشروع التخرج 🎓'
              : 'اضغط على قبعة التخرج لفتح الدعوة 🎓'}
          </span>
        </motion.button>
        <div className="text-cyan-200/65 text-[10px] mt-1.5">
          {isGraduationProject
            ? 'انقر للاطلاع على تفاصيل المشروع والقاعة وموعد المناقشة'
            : 'انقر لمشاهدة تفاصيل حفل التخرج وتأكيد الحضور'}
        </div>
      </div>
    </div>
  );
};
