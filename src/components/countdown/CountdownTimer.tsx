import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Clock, PartyPopper, CalendarCheck } from 'lucide-react';
import { CountdownDigitFont, CountdownNumeralSystem } from '../../types/invitation';
import { INITIAL_TEMPLATES } from '../../data/templates';

export type CountdownStyle =
  | 'gold_luxury'
  | 'obsidian_dark'
  | 'rose_champagne'
  | 'emerald_heritage'
  | 'minimal_glass';

export interface CountdownFontOption {
  id: CountdownDigitFont;
  nameAr: string;
  descAr: string;
  sampleAr: string;
  sampleEn: string;
  fontClass: string;
  fontFamilyCss: string;
}

export const COUNTDOWN_FONT_OPTIONS: CountdownFontOption[] = [
  {
    id: 'amiri_royal',
    nameAr: 'الأميري الديواني الملكي',
    descAr: 'خط عربي كلاسيكي فخم يليق بالقصور والمناسبات الملكية',
    sampleAr: '٢٤ : ٠٨',
    sampleEn: '24 : 08',
    fontClass: 'font-amiri',
    fontFamilyCss: "'Amiri', serif",
  },
  {
    id: 'aref_calligraphy',
    nameAr: 'خط الرقعة العربي الأصيل',
    descAr: 'حروف وأرقام عربية مرسومة بريشة خطاط تراثية ساحرة',
    sampleAr: '٢٤ : ٠٨',
    sampleEn: '24 : 08',
    fontClass: 'font-ruqaa',
    fontFamilyCss: "'Aref Ruqaa', 'Amiri', serif",
  },
  {
    id: 'cinzel_roman',
    nameAr: 'سينزل المنحوت (Cinzel)',
    descAr: 'تصميم أرقام روماني وسينمائي فاخر بأناقة الساعات السويسرية',
    sampleAr: '٢٤ : ٠٨',
    sampleEn: '24 : 08',
    fontClass: 'font-cinzel',
    fontFamilyCss: "'Cinzel', serif",
  },
  {
    id: 'cormorant_atelier',
    nameAr: 'الأتيليه الإيطالي (Cormorant)',
    descAr: 'أرقام رشيقة عالية التباين تناسب دعوات الخطوبة والمعارض الفنية',
    sampleAr: '٢٤ : ٠٨',
    sampleEn: '24 : 08',
    fontClass: 'font-cormorant',
    fontFamilyCss: "'Cormorant Garamond', 'Amiri', serif",
  },
  {
    id: 'cairo_geometric',
    nameAr: 'كايرو الهندسي العصري',
    descAr: 'أرقام واضحة ومتوازنة بتصميم هندسي حديث وأنيق',
    sampleAr: '٢٤ : ٠٨',
    sampleEn: '24 : 08',
    fontClass: 'font-cairo',
    fontFamilyCss: "'Cairo', sans-serif",
  },
  {
    id: 'mono_digital',
    nameAr: 'الرقمي الدقيق (JetBrains Mono)',
    descAr: 'عداد رقمي متساوي العرض بأسلوب الساعات الذكية والحديثة',
    sampleAr: '٢٤ : ٠٨',
    sampleEn: '24 : 08',
    fontClass: 'font-jetbrains',
    fontFamilyCss: "'JetBrains Mono', monospace",
  },
];

export interface CountdownColorPreset {
  id: string;
  nameAr: string;
  previewBg: string;
  isGradient?: boolean;
  hexFallback: string;
}

export const COUNTDOWN_COLOR_PRESETS: CountdownColorPreset[] = [
  {
    id: 'template_auto',
    nameAr: 'مطابق لهوية القالب تلقائياً',
    previewBg: 'linear-gradient(135deg, #d4af37, #f3e5ab, #aa7c11)',
    isGradient: true,
    hexFallback: '#fbbf24',
  },
  {
    id: 'gold_metallic',
    nameAr: 'بريق الذهب الملكي',
    previewBg: 'linear-gradient(135deg, #fff3b0 0%, #e0aa3e 45%, #b8860b 100%)',
    isGradient: true,
    hexFallback: '#f59e0b',
  },
  {
    id: 'rose_gold_metallic',
    nameAr: 'روز غولد مخملي',
    previewBg: 'linear-gradient(135deg, #ffe4e6 0%, #f4a28c 50%, #be6a5a 100%)',
    isGradient: true,
    hexFallback: '#fb7185',
  },
  {
    id: 'emerald_shimmer',
    nameAr: 'زمردي تراثي متوهج',
    previewBg: 'linear-gradient(135deg, #a7f3d0 0%, #34d399 50%, #059669 100%)',
    isGradient: true,
    hexFallback: '#34d399',
  },
  {
    id: 'silver_platinum',
    nameAr: 'بلاتين وفضة لامعة',
    previewBg: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 55%, #94a3b8 100%)',
    isGradient: true,
    hexFallback: '#e2e8f0',
  },
  {
    id: '#fbbf24',
    nameAr: 'كهرماني مضيء',
    previewBg: '#fbbf24',
    hexFallback: '#fbbf24',
  },
  {
    id: '#fda4af',
    nameAr: 'وردي اللؤلؤ',
    previewBg: '#fda4af',
    hexFallback: '#fda4af',
  },
  {
    id: '#38bdf8',
    nameAr: 'سماوي ياقوتي',
    previewBg: '#38bdf8',
    hexFallback: '#38bdf8',
  },
  {
    id: '#ffffff',
    nameAr: 'أبيض ناصع',
    previewBg: '#ffffff',
    hexFallback: '#ffffff',
  },
];

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function formatCountdownNumber(
  num: number | string,
  numeralSystem: CountdownNumeralSystem = 'western',
  padLength = 2
): string {
  const padded = String(num).padStart(padLength, '0');
  if (numeralSystem === 'arabic_indic') {
    return padded.replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)] || d);
  }
  return padded;
}

export function getCountdownDigitFontClass(font?: CountdownDigitFont): string {
  const found = COUNTDOWN_FONT_OPTIONS.find((f) => f.id === font);
  return found ? found.fontClass : 'font-jetbrains';
}

export function getCountdownDigitStyle(
  digitColor?: string,
  templateId?: string,
  fallbackHex?: string
): React.CSSProperties {
  if (!digitColor) {
    if (fallbackHex) return { color: fallbackHex };
    return {};
  }

  if (digitColor === 'template_auto') {
    const tpl = INITIAL_TEMPLATES.find((t) => t.id === templateId);
    const primary = tpl?.secondaryColor || fallbackHex || '#d4af37';
    return {
      color: primary,
      textShadow: `0 2px 14px ${primary}44`,
    };
  }

  if (digitColor === 'gold_metallic') {
    return {
      backgroundImage: 'linear-gradient(135deg, #fff6c5 0%, #e6b64c 48%, #b37e16 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.35))',
    };
  }

  if (digitColor === 'rose_gold_metallic') {
    return {
      backgroundImage: 'linear-gradient(135deg, #fff0f3 0%, #f3a694 50%, #c86d5c 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 8px rgba(244, 162, 140, 0.35))',
    };
  }

  if (digitColor === 'emerald_shimmer') {
    return {
      backgroundImage: 'linear-gradient(135deg, #d1fae5 0%, #34d399 50%, #059669 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 8px rgba(52, 211, 153, 0.35))',
    };
  }

  if (digitColor === 'silver_platinum') {
    return {
      backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 52%, #94a3b8 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 8px rgba(226, 232, 240, 0.3))',
    };
  }

  return {
    color: digitColor,
    textShadow: `0 2px 12px ${digitColor}40`,
  };
}

export interface CountdownTimerProps {
  eventDate: string; // YYYY-MM-DD
  eventTime?: string; // e.g. "08:00 PM" or "20:00"
  stylePreset?: CountdownStyle;
  digitColor?: string;
  digitFont?: CountdownDigitFont;
  numeralSystem?: CountdownNumeralSystem;
  templateId?: string;
  title?: string;
  showSeconds?: boolean;
  celebrationText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCountdownEnd?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  eventDate,
  eventTime = '20:00',
  stylePreset = 'gold_luxury',
  digitColor,
  digitFont = 'mono_digital',
  numeralSystem = 'western',
  templateId,
  title = 'العد التنازلي للحفل المبارك',
  showSeconds = true,
  celebrationText = 'حان موعد الحفل المبارك! أهلاً وسهلاً بكم 🎉',
  size = 'md',
  className = '',
  onCountdownEnd,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isFinished: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: false });

  const onCountdownEndRef = useRef(onCountdownEnd);
  onCountdownEndRef.current = onCountdownEnd;
  const hasEndedFiredRef = useRef(false);

  useEffect(() => {
    hasEndedFiredRef.current = false;

    const parseTargetDate = () => {
      try {
        const cleanTime = (eventTime || '20:00').trim();
        let hours = 20;
        let minutes = 0;

        if (cleanTime.includes(':')) {
          const isPM = /pm|مساءً|م/i.test(cleanTime);
          const isAM = /am|صباحاً|ص/i.test(cleanTime);
          const cleanNumbers = cleanTime.replace(/[^\d:]/g, '');
          const parts = cleanNumbers.split(':');
          hours = parseInt(parts[0], 10) || 0;
          minutes = parseInt(parts[1], 10) || 0;

          if (isPM && hours < 12) hours += 12;
          if (isAM && hours === 12) hours = 0;
        }

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const parsed = new Date(`${eventDate}T${formattedHours}:${formattedMinutes}:00`);
        if (isNaN(parsed.getTime())) {
          return new Date(Date.now() + 7 * 86400000);
        }
        return parsed;
      } catch {
        return new Date(Date.now() + 7 * 86400000);
      }
    };

    const updateCountdown = () => {
      const target = parseTargetDate();
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft((prev) => {
          if (
            prev.isFinished &&
            prev.days === 0 &&
            prev.hours === 0 &&
            prev.minutes === 0 &&
            prev.seconds === 0
          ) {
            return prev;
          }
          return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
        });

        if (!hasEndedFiredRef.current) {
          hasEndedFiredRef.current = true;
          if (onCountdownEndRef.current) {
            onCountdownEndRef.current();
          }
        }
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft((prev) => {
          if (
            !prev.isFinished &&
            prev.days === days &&
            prev.hours === hours &&
            prev.minutes === minutes &&
            prev.seconds === seconds
          ) {
            return prev;
          }
          return { days, hours, minutes, seconds, isFinished: false };
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  // Themes & Color Palettes
  const getThemeClasses = () => {
    switch (stylePreset) {
      case 'obsidian_dark':
        return {
          wrapper: 'bg-neutral-950/90 border-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)]',
          title: 'text-neutral-200',
          accent: 'text-neutral-400',
          card: 'bg-neutral-900/90 border-neutral-800 text-white shadow-inner',
          number: 'text-white',
          label: 'text-neutral-400',
          glow: 'from-neutral-700/10 via-neutral-500/5 to-transparent',
        };
      case 'rose_champagne':
        return {
          wrapper: 'bg-rose-950/20 border-rose-500/30 shadow-[0_10px_35px_rgba(244,63,94,0.12)]',
          title: 'text-rose-200',
          accent: 'text-rose-400',
          card: 'bg-rose-950/40 border-rose-500/30 text-rose-100 shadow-inner',
          number: 'text-rose-200',
          label: 'text-rose-300/80',
          glow: 'from-rose-500/20 via-pink-500/10 to-transparent',
        };
      case 'emerald_heritage':
        return {
          wrapper: 'bg-emerald-950/25 border-emerald-500/30 shadow-[0_10px_35px_rgba(16,185,129,0.12)]',
          title: 'text-emerald-200',
          accent: 'text-emerald-400',
          card: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100 shadow-inner',
          number: 'text-emerald-300',
          label: 'text-emerald-300/80',
          glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        };
      case 'minimal_glass':
        return {
          wrapper: 'bg-white/[0.04] backdrop-blur-xl border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
          title: 'text-white',
          accent: 'text-white/70',
          card: 'bg-white/[0.07] border-white/15 text-white shadow-sm',
          number: 'text-white',
          label: 'text-white/60',
          glow: 'from-white/10 via-white/5 to-transparent',
        };
      case 'gold_luxury':
      default:
        return {
          wrapper: 'bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 border-amber-500/35 shadow-[0_12px_40px_rgba(212,175,55,0.18)] ring-1 ring-amber-500/20',
          title: 'text-amber-300',
          accent: 'text-amber-400',
          card: 'bg-neutral-900/90 border-amber-500/30 text-amber-200 shadow-inner',
          number: 'text-amber-300 drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]',
          label: 'text-amber-200/70',
          glow: 'from-amber-500/20 via-yellow-500/10 to-transparent',
        };
    }
  };

  const theme = getThemeClasses();
  const fontClass = getCountdownDigitFontClass(digitFont);
  const customDigitInlineStyle = getCountdownDigitStyle(digitColor, templateId);

  // Size scalers
  const sizeClasses = {
    sm: {
      padding: 'p-3.5',
      cardPad: 'p-2 sm:p-2.5',
      numText: 'text-lg sm:text-xl',
      labelText: 'text-[9px] sm:text-[10px]',
      titleText: 'text-[11px]',
      gap: 'gap-2',
    },
    md: {
      padding: 'p-5 sm:p-6',
      cardPad: 'p-2.5 sm:p-3.5',
      numText: 'text-2xl sm:text-3xl lg:text-4xl',
      labelText: 'text-[10px] sm:text-xs',
      titleText: 'text-xs sm:text-sm',
      gap: 'gap-2 sm:gap-3.5',
    },
    lg: {
      padding: 'p-6 sm:p-8',
      cardPad: 'p-3 sm:p-5',
      numText: 'text-3xl sm:text-4xl lg:text-5xl',
      labelText: 'text-xs sm:text-sm',
      titleText: 'text-sm sm:text-base',
      gap: 'gap-2.5 sm:gap-4',
    },
  }[size];

  const units = [
    { key: 'days', label: 'يوم', val: timeLeft.days },
    { key: 'hours', label: 'ساعة', val: timeLeft.hours },
    { key: 'minutes', label: 'دقيقة', val: timeLeft.minutes },
    ...(showSeconds ? [{ key: 'seconds', label: 'ثانية', val: timeLeft.seconds }] : []),
  ];

  return (
    <div
      className={`relative rounded-3xl border overflow-hidden ${theme.wrapper} ${sizeClasses.padding} ${className}`}
    >
      {/* Ambient Top Glow */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b ${theme.glow} blur-2xl pointer-events-none`}
      />

      {/* Header Title with animated Sparkles */}
      <div className="relative z-10 flex items-center justify-center gap-2 mb-4 text-center">
        <Sparkles size={16} className={`${theme.accent} animate-pulse`} />
        <span className={`font-bold font-cairo ${sizeClasses.titleText} ${theme.title}`}>
          {title}
        </span>
        <Clock size={15} className={theme.accent} />
      </div>

      {/* Finished Celebration Banner */}
      {timeLeft.isFinished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 py-6 px-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-center space-y-2"
        >
          <PartyPopper size={36} className="text-amber-400 mx-auto animate-bounce" />
          <h4 className="text-base sm:text-lg font-bold text-amber-200 font-cairo">
            {celebrationText}
          </h4>
          <p className="text-xs text-neutral-300 flex items-center justify-center gap-1.5 font-cairo">
            <CalendarCheck size={14} className="text-emerald-400" />
            <span>نورتونا وشرفتونا بحضوركم الكريم</span>
          </p>
        </motion.div>
      ) : (
        /* Digits Cards Grid */
        <div
          className={`relative z-10 grid ${
            showSeconds ? 'grid-cols-4' : 'grid-cols-3'
          } ${sizeClasses.gap} items-center`}
        >
          {units.map((unit) => (
            <div
              key={unit.key}
              className={`relative rounded-2xl border text-center transition-all ${theme.card} ${sizeClasses.cardPad}`}
            >
              {/* Subtle Card Gloss Highlight */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] rounded-t-2xl pointer-events-none" />

              {/* Animated Number Display with Custom Font & Color */}
              <div className="relative h-10 sm:h-12 lg:h-14 flex items-center justify-center overflow-hidden">
                <motion.div
                  key={`${unit.key}-${unit.val}`}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={customDigitInlineStyle}
                  className={`font-bold tabular-nums select-none leading-none ${fontClass} ${sizeClasses.numText} ${
                    digitColor ? '' : theme.number
                  }`}
                >
                  {formatCountdownNumber(unit.val, numeralSystem, 2)}
                </motion.div>
              </div>

              {/* Unit Label */}
              <div
                className={`mt-1 font-semibold tracking-wider font-cairo ${sizeClasses.labelText} ${theme.label}`}
              >
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Live Indicator Badge */}
      <div className="relative z-10 mt-4 flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>توقيت مباشر ومحدث حتى ثانية الحفل</span>
      </div>
    </div>
  );
};
