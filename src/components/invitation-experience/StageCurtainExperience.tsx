import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Crown, BookOpen, Compass } from 'lucide-react';
import { RoyalVisualDirection, OpenerStyle3D, InvitationSectionId } from '../../types/invitation';
import { soundEngine } from '../../utils/audio';

export interface RoyalDirectionPalette {
  id: RoyalVisualDirection;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  badgeAr: string;
  bgPrimary: string;
  bgSecondary: string;
  cardSurface: string;
  borderGold: string;
  accentGold: string;
  champagneLight: string;
  emeraldTone: string;
  textPrimary: string;
  textSecondary: string;
  isLightMode?: boolean;
  recommendedOpener: OpenerStyle3D;
}

export const ROYAL_VISUAL_DIRECTIONS: RoyalDirectionPalette[] = [
  {
    id: 'obsidian_champagne',
    nameAr: 'الاتجاه الأول: الأسود الملكي وذهب الشامبين',
    nameEn: 'Direction I: Royal Obsidian & Champagne Gold',
    taglineAr: 'تباين درامي فاخر يجمع الأسود الملكي العميق مع إطارات الذهب الشامبين وإضاءة المسرح الدافئة',
    badgeAr: 'فخامة القصور الملكية 👑',
    bgPrimary: '#0A0908',
    bgSecondary: '#14110E',
    cardSurface: 'rgba(18, 15, 12, 0.88)',
    borderGold: 'rgba(212, 175, 55, 0.42)',
    accentGold: '#D4AF37',
    champagneLight: '#F3E5AB',
    emeraldTone: '#0D3B2E',
    textPrimary: '#FAF6F0',
    textSecondary: '#D8CEBE',
    isLightMode: false,
    recommendedOpener: 'stage_curtains_3d',
  },
  {
    id: 'emerald_palace',
    nameAr: 'الاتجاه الثاني: القصر الزمردي والأبيض اللؤلؤي',
    nameEn: 'Direction II: Emerald Palace & Pearl Ivory',
    taglineAr: 'مخمل أخضر زمردي ملكي مطعّم برقائق الذهب الشامبين ونقاء اللؤلؤ العاجي بروح الديوان الأصيل',
    badgeAr: 'زمرد ملكي وذهب شامبين 💎',
    bgPrimary: '#07221B',
    bgSecondary: '#0D3B2E',
    cardSurface: 'rgba(9, 38, 30, 0.88)',
    borderGold: 'rgba(243, 229, 171, 0.42)',
    accentGold: '#E5C158',
    champagneLight: '#FFFDF8',
    emeraldTone: '#155240',
    textPrimary: '#FFFDF8',
    textSecondary: '#D7E8E1',
    isLightMode: false,
    recommendedOpener: 'royal_3d_book',
  },
  {
    id: 'pearl_atelier',
    nameAr: 'الاتجاه الثالث: الأتيليه اللؤلؤي والعاجي المذهّب',
    nameEn: 'Direction III: Pearl White & Ivory Gold Atelier',
    taglineAr: 'إشراقة الأبيض اللؤلؤي والعاجي الحريري مع زخارف ذهبية ناعمة وتفاصيل زمردية أنيقة',
    badgeAr: 'إشراقة اللؤلؤ والعاج ✨',
    bgPrimary: '#FAF6F0',
    bgSecondary: '#FFFDF8',
    cardSurface: 'rgba(255, 253, 248, 0.94)',
    borderGold: 'rgba(197, 160, 89, 0.48)',
    accentGold: '#B8860B',
    champagneLight: '#D4AF37',
    emeraldTone: '#1B4D3E',
    textPrimary: '#1A1714',
    textSecondary: '#5A5248',
    isLightMode: true,
    recommendedOpener: 'royal_envelope_wax',
  },
];

export const OPENER_3D_STYLE_OPTIONS: {
  id: OpenerStyle3D;
  labelAr: string;
  descAr: string;
  badge: string;
}[] = [
  {
    id: 'auto',
    labelAr: 'تلقائي حسب طبيعة المناسبة',
    descAr: 'يختار تجربة الفتح الأنسب تلقائياً (ظرف، خاتم، لفيفة، أو كيكة)',
    badge: 'ذكي ✨',
  },
  {
    id: 'stage_curtains_3d',
    labelAr: 'ستائر المسرح الملكية ثلاثية الأبعاد',
    descAr: 'ستائر مخملية فاخرة بربطات ذهبية تنفتح بعمق ثلاثي الأبعاد مع أضواء مسرح',
    badge: '3D Curtains 🎭',
  },
  {
    id: 'royal_3d_book',
    labelAr: 'الكتاب والرسالة الملكية ثلاثية الأبعاد',
    descAr: 'مجلد ملكي مذهّب بختم شمعي ينفتح غلافه بزاوية 3D ليكشف مخطوطة الدعوة',
    badge: '3D Book 📖',
  },
  {
    id: 'royal_envelope_wax',
    labelAr: 'الظرف الملكي ثلاثي الأبعاد والختم الشمعي',
    descAr: 'ظرف شامبين ثلاثي الأبعاد مع ختم شمعي تفاعلي ينكسر وينفتح بنعومة',
    badge: '3D Envelope ✉️',
  },
  {
    id: 'engagement_ring_3d',
    labelAr: 'علبة الخاتم الماسي ثلاثية الأبعاد',
    descAr: 'علبة مخملية ملكية تفتح لتكشف خاتم الخطوبة المتوهج وبريق الألماس',
    badge: '3D Ring 💍',
  },
];

export const DEFAULT_INVITATION_SECTION_ORDER: InvitationSectionId[] = [
  'opener',
  'card',
  'datetime',
  'location',
  'rsvp',
  'guestbook',
];

export const INVITATION_SECTION_META: Record<
  InvitationSectionId,
  { titleAr: string; titleEn: string; descAr: string }
> = {
  opener: {
    titleAr: 'المشهد الإفتتاحي ثلاثي الأبعاد',
    titleEn: '3D Cover Reveal',
    descAr: 'فتح الظرف أو الستائر أو الكتاب ثلاثي الأبعاد',
  },
  card: {
    titleAr: 'بطاقة الدعوة الملكية والأسماء',
    titleEn: 'Royal Invitation Card',
    descAr: 'البسملة، الأسماء، نص الدعوة، ومعرض الصور',
  },
  datetime: {
    titleAr: 'الموعد والعد التنازلي الحي',
    titleEn: 'Date & Countdown',
    descAr: 'التاريخ الميلادي والهجري، الوقت، والعداد التنازلي',
  },
  location: {
    titleAr: 'الموقع الجغرافي والخرائط التفاعلية',
    titleEn: 'Location & Maps',
    descAr: 'اسم القاعة، العنوان، وروابط Google Maps و Waze',
  },
  rsvp: {
    titleAr: 'تأكيد الحضور وإصدار بطاقة QR',
    titleEn: 'RSVP & QR Pass',
    descAr: 'استمارة تأكيد الحضور وتحديد عدد المرافقين',
  },
  guestbook: {
    titleAr: 'سجل التهاني والذكريات',
    titleEn: 'Guestbook & Wishes',
    descAr: 'كلمات التبريكات وإرفاق الصور التذكارية',
  },
};

interface StageCurtainExperienceProps {
  onOpen: () => void;
  title: string;
  coupleOrHostName?: string;
  subtitle?: string;
  visualDirection?: RoyalVisualDirection;
}

/**
 * Interactive 3D Stage Curtains Opener (ستائر مسرح تنفتح ثلاثية الأبعاد)
 */
export const StageCurtainExperience: React.FC<StageCurtainExperienceProps> = ({
  onOpen,
  title,
  coupleOrHostName,
  subtitle,
  visualDirection = 'obsidian_champagne',
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenCurtains = () => {
    if (isOpening) return;
    setIsOpening(true);
    soundEngine.playEnvelopeOpen();
    setTimeout(() => {
      onOpen();
    }, 1150);
  };

  const isEmerald = visualDirection === 'emerald_palace';
  const curtainGradient = isEmerald
    ? 'linear-gradient(90deg, #041913 0%, #0D3B2E 28%, #07231B 55%, #0D3B2E 82%, #03140F 100%)'
    : 'linear-gradient(90deg, #160709 0%, #3A0D14 28%, #22070B 55%, #421119 82%, #120406 100%)';

  return (
    <div
      className="flex flex-col items-center justify-center py-6 px-3 select-none"
      style={{ perspective: '1400px' }}
    >
      <div
        onClick={handleOpenCurtains}
        className="relative w-full max-w-md h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(212,175,55,0.2)] cursor-pointer group bg-[#0A0908]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Top Gilded Pelmet / Royal Arch Header */}
        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#2A2012] via-[#17120A] to-transparent border-b border-[#D4AF37]/50 z-30 flex items-center justify-center">
          <div className="px-4 py-0.5 rounded-full bg-[#0A0908]/90 border border-[#D4AF37]/60 text-[10px] font-bold text-[#F3E5AB] tracking-widest flex items-center gap-1.5 shadow">
            <Crown size={11} className="text-[#D4AF37]" />
            <span>MARASEEM ROYAL STAGE • المسرح الملكي</span>
          </div>
        </div>

        {/* Stage Spotlight Beams behind curtains */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, rgba(243,229,171,0.28) 0%, rgba(212,175,55,0.12) 42%, rgba(10,9,8,0.96) 80%)',
          }}
        />

        {/* Inner Revealed Stage Preview */}
        <motion.div
          animate={
            isOpening
              ? { scale: 1.06, opacity: 1, rotateX: 0 }
              : { scale: 0.92, opacity: 0.85, rotateX: 6 }
          }
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-6 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#17130E] via-[#0F0C09] to-[#0A0908] flex flex-col items-center justify-center p-6 text-center z-10 shadow-inner"
        >
          <span className="text-[11px] text-[#D4AF37] font-amiri tracking-wider mb-1">
            بسم الله الرحمن الرحيم
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-amiri text-[#FAF6F0] mb-1">
            {coupleOrHostName || title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#F3E5AB]/85 max-w-xs line-clamp-2">{subtitle}</p>
          )}
          <div className="mt-4 px-4 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] text-[11px] font-bold">
            جاري فتح الستار الملكي... ✨
          </div>
        </motion.div>

        {/* Left 3D Velvet Curtain */}
        <motion.div
          initial={false}
          animate={
            isOpening
              ? { x: '-92%', rotateY: -28, scaleX: 0.65 }
              : { x: '0%', rotateY: 0, scaleX: 1 }
          }
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: curtainGradient,
            transformOrigin: 'left center',
          }}
          className="absolute inset-y-0 left-0 w-1/2 z-20 border-r-2 border-[#D4AF37]/70 shadow-[12px_0_30px_rgba(0,0,0,0.8)]"
        >
          {/* Curtain vertical pleat lines */}
          <div className="w-full h-full opacity-35 bg-[repeating-linear-gradient(90deg,transparent,transparent_14px,rgba(0,0,0,0.55)_15px,rgba(212,175,55,0.12)_22px)]" />
          {/* Golden tassel cord */}
          <div className="absolute top-1/2 right-3 -translate-y-1/2 w-3 h-20 rounded-full bg-gradient-to-b from-[#F3E5AB] via-[#D4AF37] to-[#8B6508] shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
        </motion.div>

        {/* Right 3D Velvet Curtain */}
        <motion.div
          initial={false}
          animate={
            isOpening
              ? { x: '92%', rotateY: 28, scaleX: 0.65 }
              : { x: '0%', rotateY: 0, scaleX: 1 }
          }
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: curtainGradient,
            transformOrigin: 'right center',
          }}
          className="absolute inset-y-0 right-0 w-1/2 z-20 border-l-2 border-[#D4AF37]/70 shadow-[-12px_0_30px_rgba(0,0,0,0.8)]"
        >
          <div className="w-full h-full opacity-35 bg-[repeating-linear-gradient(90deg,transparent,transparent_14px,rgba(0,0,0,0.55)_15px,rgba(212,175,55,0.12)_22px)]" />
          <div className="absolute top-1/2 left-3 -translate-y-1/2 w-3 h-20 rounded-full bg-gradient-to-b from-[#F3E5AB] via-[#D4AF37] to-[#8B6508] shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
        </motion.div>

        {/* Center Interactive Royal Wax Clasp */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.35, opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center pointer-events-none"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(212,175,55,0.35)',
                    '0 0 40px rgba(212,175,55,0.75)',
                    '0 0 20px rgba(212,175,55,0.35)',
                  ],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#8B6508] p-1 flex items-center justify-center border-2 border-[#FFFDF8]/70 shadow-2xl"
              >
                <div className="w-full h-full rounded-full bg-[#120E0A] border border-[#D4AF37] flex flex-col items-center justify-center text-[#F3E5AB] px-2">
                  <Sparkles size={18} className="text-[#D4AF37] mb-0.5" />
                  <span className="text-[10px] font-bold leading-tight">افتح الستار</span>
                  <span className="text-[8px] text-[#D4AF37]">3D STAGE</span>
                </div>
              </motion.div>

              <div className="mt-4 px-4 py-2 rounded-2xl bg-[#0A0908]/90 border border-[#D4AF37]/50 backdrop-blur-md shadow-xl max-w-xs">
                <div className="text-xs font-bold text-[#F3E5AB] font-amiri">{title}</div>
                {coupleOrHostName && (
                  <div className="text-sm font-bold text-white mt-0.5 font-amiri">
                    {coupleOrHostName}
                  </div>
                )}
                <div className="text-[10px] text-[#D4AF37] mt-1">
                  اضغط لفتح ستائر المسرح الملكية ثلاثية الأبعاد 🎭
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface Royal3DBookExperienceProps {
  onOpen: () => void;
  title: string;
  coupleOrHostName?: string;
  welcomeQuote?: string;
}

/**
 * Interactive 3D Royal Book & Scroll Opener (كتب ورسائل ثلاثية الأبعاد)
 */
export const Royal3DBookExperience: React.FC<Royal3DBookExperienceProps> = ({
  onOpen,
  title,
  coupleOrHostName,
  welcomeQuote,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenBook = () => {
    if (isOpening) return;
    setIsOpening(true);
    soundEngine.playEnvelopeOpen();
    setTimeout(() => {
      onOpen();
    }, 1150);
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-6 px-3 select-none"
      style={{ perspective: '1500px' }}
    >
      <div
        onClick={handleOpenBook}
        className="relative w-64 sm:w-72 h-80 sm:h-96 cursor-pointer group"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Inside Parchment Page (Right/Back Base of the 3D Book) */}
        <div className="absolute inset-0 rounded-l-2xl rounded-r-lg bg-gradient-to-br from-[#FFFDF8] via-[#FAF6F0] to-[#EFE6D5] border-2 border-[#D4AF37] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-6 flex flex-col items-center justify-between text-center text-[#1A1714]">
          <div className="w-full border-b border-[#D4AF37]/40 pb-2">
            <span className="text-[11px] font-amiri text-[#8B6508] font-bold">
              بسم الله الرحمن الرحيم
            </span>
          </div>
          <div className="space-y-2 my-auto">
            <BookOpen size={24} className="text-[#D4AF37] mx-auto" />
            <h4 className="text-lg font-bold font-amiri text-[#0D3B2E]">
              {coupleOrHostName || title}
            </h4>
            <p className="text-[11px] text-[#5A5248] font-amiri leading-relaxed line-clamp-3">
              {welcomeQuote || 'لكل دعوة حكاية تخلدها الذكريات الملكية'}
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#8B6508] tracking-wider">
            ✦ MARASEEM ROYAL BOOK ✦
          </div>
        </div>

        {/* 3D Book Spine thickness */}
        <div
          className="absolute top-0 bottom-0 right-0 w-5 bg-gradient-to-l from-[#8B6508] via-[#D4AF37] to-[#5C4004] rounded-r-md z-30"
          style={{ transform: 'translateZ(4px)' }}
        />

        {/* Front Hardbound Gilded Cover that flips open in 3D */}
        <motion.div
          initial={false}
          animate={
            isOpening
              ? { rotateY: 145, scale: 1.03 }
              : { rotateY: 0, scale: 1 }
          }
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transformOrigin: 'right center',
            transformStyle: 'preserve-3d',
          }}
          className="absolute inset-0 rounded-l-2xl rounded-r-md bg-gradient-to-br from-[#0D3B2E] via-[#08261E] to-[#061A14] border-2 border-[#D4AF37] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-5 flex flex-col items-center justify-between text-center z-20"
        >
          {/* Classic Royal Corner Ornaments */}
          <div className="absolute inset-3 border border-[#D4AF37]/45 rounded-xl pointer-events-none" />
          <div className="absolute inset-5 border border-[#F3E5AB]/20 rounded-lg pointer-events-none" />

          <div className="relative z-10 pt-2">
            <span className="px-3 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] text-[10px] font-bold">
              مخطوطة مراسيم الملكية
            </span>
          </div>

          {/* Embossed Center Medallion */}
          <div className="relative z-10 my-auto space-y-3">
            <motion.div
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#8B6508] p-0.5 shadow-[0_0_30px_rgba(212,175,55,0.45)] flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-[#07221B] flex flex-col items-center justify-center border border-[#FFFDF8]/40">
                <Crown size={20} className="text-[#F3E5AB]" />
                <span className="text-[9px] text-[#D4AF37] font-bold mt-0.5">ختم ملكي</span>
              </div>
            </motion.div>

            <h3 className="text-lg sm:text-xl font-bold font-amiri text-[#FFFDF8] px-2">
              {title}
            </h3>
            {coupleOrHostName && (
              <p className="text-sm font-bold font-amiri text-[#F3E5AB]">
                {coupleOrHostName}
              </p>
            )}
          </div>

          <div className="relative z-10 pb-1">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D4AF37] text-[#0A0908] font-bold text-[11px] shadow-lg group-hover:scale-105 transition-transform">
              <Compass size={13} />
              <span>اضغط لفتح الكتاب الملكي 3D</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * 3D Sculpted Flowers & Luminous Butterflies Ambient Layer (مجسمات زهور وفراشات ثلاثية الأبعاد)
 */
export const Royal3DFlowersButterfliesLayer: React.FC<{
  enabled?: boolean;
  visualDirection?: RoyalVisualDirection;
}> = ({ enabled = true, visualDirection = 'obsidian_champagne' }) => {
  if (!enabled) return null;

  const isLight = visualDirection === 'pearl_atelier';
  const goldStroke = isLight ? '#B8860B' : '#F3E5AB';

  const butterflies = [
    { id: 1, top: '12%', left: '8%', delay: 0, duration: 9, scale: 0.9 },
    { id: 2, top: '22%', right: '9%', delay: 1.8, duration: 11, scale: 0.75 },
    { id: 3, bottom: '18%', left: '12%', delay: 0.9, duration: 10, scale: 0.8 },
  ];

  const flowers3D = [
    { id: 'fl-1', top: '6%', right: '5%', size: 46, delay: 0 },
    { id: 'fl-2', bottom: '8%', right: '7%', size: 42, delay: 1.5 },
    { id: 'fl-3', bottom: '10%', left: '5%', size: 40, delay: 2.2 },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-10"
      style={{ perspective: '900px' }}
      aria-hidden="true"
    >
      {/* 3D Sculpted Rosettes in corners */}
      {flowers3D.map((fl) => (
        <motion.div
          key={fl.id}
          initial={{ opacity: 0.5, rotateZ: 0, rotateX: 18, rotateY: -15 }}
          animate={{
            opacity: [0.45, 0.8, 0.45],
            rotateZ: [0, 360],
            y: [0, -6, 0],
          }}
          transition={{
            rotateZ: { duration: 28, repeat: Infinity, ease: 'linear' },
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: fl.delay },
            opacity: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: fl.delay },
          }}
          style={{
            top: fl.top,
            bottom: fl.bottom,
            left: fl.left,
            right: fl.right,
            width: fl.size,
            height: fl.size,
            transformStyle: 'preserve-3d',
          }}
          className="absolute"
        >
          <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_6px_14px_rgba(212,175,55,0.35)]">
            <defs>
              <radialGradient id={`royal-flower-${fl.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFDF8" />
                <stop offset="55%" stopColor="#F3E5AB" />
                <stop offset="100%" stopColor="#D4AF37" />
              </radialGradient>
            </defs>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <ellipse
                key={deg}
                cx="32"
                cy="16"
                rx="7"
                ry="13"
                fill={`url(#royal-flower-${fl.id})`}
                fillOpacity="0.72"
                stroke={goldStroke}
                strokeWidth="0.9"
                transform={`rotate(${deg} 32 32)`}
              />
            ))}
            <circle cx="32" cy="32" r="6.5" fill="#D4AF37" stroke="#FFFDF8" strokeWidth="1.2" />
          </svg>
        </motion.div>
      ))}

      {/* 3D Luminous Golden Butterflies */}
      {butterflies.map((b) => (
        <motion.div
          key={b.id}
          animate={{
            y: [0, -18, -4, -14, 0],
            x: [0, 12, -8, 6, 0],
            rotateZ: [-6, 8, -4, 6, -6],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            top: b.top,
            bottom: b.bottom,
            left: b.left,
            right: b.right,
            scale: b.scale,
            transformStyle: 'preserve-3d',
          }}
          className="absolute w-9 h-9"
        >
          <motion.svg
            viewBox="0 0 48 48"
            className="w-full h-full drop-shadow-[0_0_12px_rgba(243,229,171,0.75)]"
            animate={{ scaleX: [1, 0.45, 1, 0.5, 1] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d="M24 22 C16 8, 2 10, 6 23 C8 30, 17 29, 24 26 C17 31, 10 38, 15 42 C19 45, 23 37, 24 31 Z"
              fill="rgba(243, 229, 171, 0.75)"
              stroke="#D4AF37"
              strokeWidth="1.2"
            />
            <path
              d="M24 22 C32 8, 46 10, 42 23 C40 30, 31 29, 24 26 C31 31, 38 38, 33 42 C29 45, 25 37, 24 31 Z"
              fill="rgba(212, 175, 55, 0.75)"
              stroke="#FFFDF8"
              strokeWidth="1.2"
            />
            <line x1="24" y1="16" x2="24" y2="34" stroke="#FFFDF8" strokeWidth="1.6" strokeLinecap="round" />
          </motion.svg>
        </motion.div>
      ))}
    </div>
  );
};
