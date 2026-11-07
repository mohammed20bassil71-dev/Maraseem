import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gift,
  Heart,
  Lock,
  Unlock,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Cake,
  Camera,
  Eye,
  Share2,
  RotateCcw,
  FastForward,
  Check,
  HelpCircle,
  ExternalLink,
  Calendar,
  Flame,
  PartyPopper,
} from 'lucide-react';
import {
  BirthdayGreetingData,
  BirthdayPageConfig,
  CinematicColorFilter,
  PhotoFrameStyle,
  ScratchFoilStyle,
} from '../../types/birthdayExperience';
import {
  BIRTHDAY_MUSIC_LIBRARY,
  COLOR_FILTERS_LIBRARY,
  PHOTO_FRAME_STYLES_META,
  buildShareableBirthdayUrl,
  getColorFilterMeta,
} from '../../data/birthdayTemplates';
import { CanvasElementsLayer, CreativeElementGraphic } from './CreativeElementRenderer';
import { soundEngine } from '../../utils/audio';
import { useLanguage } from '../../i18n/LanguageContext';

interface BirthdayExperiencePlayerProps {
  greeting: BirthdayGreetingData;
  isEmbeddedPreview?: boolean;
  onShareCountIncrement?: () => void;
}

const FOIL_PALETTES: Record<ScratchFoilStyle, { c1: string; c2: string; text: string }> = {
  gold_foil: { c1: '#D4AF37', c2: '#F3E5AB', text: '#3B2B1E' },
  rose_shimmer: { c1: '#D96B7B', c2: '#FAD2E1', text: '#4A1C24' },
  silver_stars: { c1: '#94A3B8', c2: '#E2E8F0', text: '#1E293B' },
  pistachio_velvet: { c1: '#91A77D', c2: '#DCE8CB', text: '#566B49' },
};

export const BirthdayExperiencePlayer: React.FC<BirthdayExperiencePlayerProps> = ({
  greeting,
  isEmbeddedPreview = false,
  onShareCountIncrement,
}) => {
  const { lang, tr, isRTL } = useLanguage();

  const enabledPages: BirthdayPageConfig[] =
    greeting.pages.filter((p) => p.enabled).length > 0
      ? greeting.pages.filter((p) => p.enabled)
      : greeting.pages;

  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [skipAnimations, setSkipAnimations] = useState(greeting.skipAnimationsDefault || false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [soundFxOn, setSoundFxOn] = useState(greeting.soundEffectsEnabled !== false);
  const [volume, setVolume] = useState(0.65);

  // Page 1: Opening Mechanic State
  const [isOpeningUnlocked, setIsOpeningUnlocked] = useState(false);

  // Page 2 & General Confetti Burst
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);

  // Page 3: Main Greeting Interactive Heart & Preciousness Meter
  const [isHeartMessageRevealed, setIsHeartMessageRevealed] = useState(false);
  const [isPreciousScoreRevealed, setIsPreciousScoreRevealed] = useState(false);

  // Page 4: Memory Box State
  const [revealedMemoryIds, setRevealedMemoryIds] = useState<Record<string, boolean>>({});
  const [activeMemoryIdx, setActiveMemoryIdx] = useState(0);
  const [memoryMode, setMemoryMode] = useState<'one_by_one' | 'grid'>(
    greeting.memoryBoxDisplayMode || 'one_by_one'
  );
  const [activePhotoFrame, setActivePhotoFrame] = useState<PhotoFrameStyle>(
    greeting.photoFrameStyle || 'polaroid'
  );
  const [activeColorFilter, setActiveColorFilter] = useState<CinematicColorFilter>(
    greeting.photoColorFilter ||
      (greeting.category === 'cinematic' || greeting.visualArchitecture === 'cinematic_widescreen'
        ? 'teal_orange'
        : greeting.photoFrameStyle === 'cinematic_gallery'
        ? 'golden_cinema'
        : 'original')
  );

  // Page 5: Cake & Candles State
  const [litCandles, setLitCandles] = useState<boolean[]>(() =>
    Array.from({ length: Math.max(1, Math.min(12, greeting.candlesCount || 5)) }, () => true)
  );
  const [isCakeSliced, setIsCakeSliced] = useState(false);

  // Page 6: Scratch & Reveal Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratchRevealed, setIsScratchRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const isDrawingRef = useRef(false);

  // Page 7: Secret Messages State
  const [secretInputs, setSecretInputs] = useState<Record<string, string>>({});
  const [unlockedSecrets, setUnlockedSecrets] = useState<Record<string, boolean>>({});
  const [shownHints, setShownHints] = useState<Record<string, boolean>>({});
  const [secretErrorId, setSecretErrorId] = useState<string | null>(null);

  // Page 8: Digital Gift Boxes State (0 = closed, 1 = shaking, 2 = opened)
  const [giftStates, setGiftBoxesState] = useState<Record<string, number>>({});

  // Sharing state
  const [copiedLink, setCopiedLink] = useState(false);
  const [bypassScheduleLock, setBypassScheduleLock] = useState(false);

  // Re-sync candles when count changes in editor
  useEffect(() => {
    setLitCandles(
      Array.from({ length: Math.max(1, Math.min(12, greeting.candlesCount || 5)) }, () => true)
    );
  }, [greeting.candlesCount]);

  useEffect(() => {
    setMemoryMode(greeting.memoryBoxDisplayMode || 'one_by_one');
  }, [greeting.memoryBoxDisplayMode]);

  useEffect(() => {
    if (greeting.photoFrameStyle) {
      setActivePhotoFrame(greeting.photoFrameStyle);
    }
  }, [greeting.photoFrameStyle]);

  useEffect(() => {
    if (greeting.photoColorFilter) {
      setActiveColorFilter(greeting.photoColorFilter);
    }
  }, [greeting.photoColorFilter]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (!isEmbeddedPreview) {
        soundEngine.stopAmbientMusic();
      }
    };
  }, [isEmbeddedPreview]);

  const currentPage = enabledPages[currentPageIdx] || enabledPages[0];

  // Initialize Scratch Canvas when entering 'scratch_reveal' page
  useEffect(() => {
    if (currentPage?.type !== 'scratch_reveal' || isScratchRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const foil = FOIL_PALETTES[greeting.scratchCard.foilStyle || 'gold_foil'];

    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, foil.c1);
    grad.addColorStop(0.5, foil.c2);
    grad.addColorStop(1, foil.c1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative shimmer dots
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    for (let i = 0; i < 45; i++) {
      const x = (i * 67) % width;
      const y = (i * 43) % height;
      ctx.beginPath();
      ctx.arc(x, y, (i % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Prompt text on foil
    ctx.fillStyle = foil.text;
    ctx.font = 'bold 16px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      tr('✨ امسح بإصبعك أو الماوس هنا لكشف المفاجأة ✨', '✨ Scratch here with finger or mouse ✨'),
      width / 2,
      height / 2 - 6
    );
    ctx.font = '12px Cairo, sans-serif';
    ctx.fillText(
      greeting.scratchCard.promptTitle || tr('اكشط الطبقة اللامعة الآن', 'Scratch the foil layer now'),
      width / 2,
      height / 2 + 20
    );
  }, [currentPage?.type, greeting.scratchCard.foilStyle, greeting.scratchCard.promptTitle, isScratchRevealed, lang]);

  const handleScratchMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratchRevealed) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    // Estimate scratched area
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentPixels = 0;
    const totalPixels = imgData.length / 4;
    for (let i = 3; i < imgData.length; i += 16) {
      if (imgData[i] < 128) transparentPixels++;
    }
    const ratio = Math.min(100, Math.round((transparentPixels / (totalPixels / 4)) * 100));
    setScratchPercent(ratio);
    if (ratio >= 42 && !isScratchRevealed) {
      setIsScratchRevealed(true);
      if (soundFxOn) soundEngine.playCelebrationFanfare();
    }
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      soundEngine.stopAmbientMusic();
      setIsMusicPlaying(false);
    } else {
      const track = BIRTHDAY_MUSIC_LIBRARY.find((t) => t.id === greeting.musicTrackId);
      soundEngine.setVolume(volume);
      soundEngine.startAmbientMusic(
        greeting.customAudioUrl ? 'custom_upload' : track?.synthGenre || 'bday_romantic',
        greeting.customAudioUrl
      );
      setIsMusicPlaying(true);
    }
  };

  const goToNextPage = () => {
    if (currentPageIdx < enabledPages.length - 1) {
      if (soundFxOn) soundEngine.playChime(587.33, 0.5, 0.5);
      setCurrentPageIdx((i) => i + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIdx > 0) {
      if (soundFxOn) soundEngine.playChime(440, 0.4, 0.4);
      setCurrentPageIdx((i) => i - 1);
    }
  };

  const handleOpenCoverSurprise = () => {
    setIsOpeningUnlocked(true);
    if (soundFxOn) {
      if (greeting.openingMechanic === 'envelope') soundEngine.playEnvelopeOpen();
      else if (greeting.openingMechanic === 'gift_tap') soundEngine.playGiftOpen();
      else if (greeting.openingMechanic === 'heart_tap') soundEngine.playHeartPop();
      else soundEngine.playCurtainDoorOpen();
    }
    if (!isMusicPlaying && greeting.musicTrackId !== 'none') {
      toggleMusic();
    }
    setTimeout(() => {
      goToNextPage();
    }, skipAnimations ? 80 : 650);
  };

  const handleBlowCandle = (idx: number) => {
    if (!litCandles[idx]) return;
    if (soundFxOn) soundEngine.playCandleBlow();
    const updated = litCandles.map((c, i) => (i === idx ? false : c));
    setLitCandles(updated);
    if (updated.every((c) => !c)) {
      if (soundFxOn) setTimeout(() => soundEngine.playCelebrationFanfare(), 250);
      setConfettiBurstKey((k) => k + 1);
    }
  };

  const handleBlowAllCandles = () => {
    if (soundFxOn) {
      soundEngine.playCandleBlow();
      setTimeout(() => soundEngine.playCelebrationFanfare(), 300);
    }
    setLitCandles(litCandles.map(() => false));
    setConfettiBurstKey((k) => k + 1);
  };

  const allCandlesBlown = litCandles.every((c) => !c);

  const handleUnlockSecret = (secId: string, expectedPassword: string) => {
    const entered = (secretInputs[secId] || '').trim().toLowerCase();
    const target = (expectedPassword || '').trim().toLowerCase();
    if (!target || entered === target) {
      setUnlockedSecrets((prev) => ({ ...prev, [secId]: true }));
      setSecretErrorId(null);
      if (soundFxOn) soundEngine.playSecretUnlock();
    } else {
      setSecretErrorId(secId);
    }
  };

  const handleTriggerGiftBox = (giftId: string) => {
    const current = giftStates[giftId] || 0;
    if (current === 0) {
      if (soundFxOn) soundEngine.playChime(523.25, 0.4, 0.7);
      if (skipAnimations) {
        setGiftBoxesState((prev) => ({ ...prev, [giftId]: 2 }));
        if (soundFxOn) soundEngine.playGiftOpen();
        return;
      }
      setGiftBoxesState((prev) => ({ ...prev, [giftId]: 1 }));
      setTimeout(() => {
        setGiftBoxesState((prev) => ({ ...prev, [giftId]: 2 }));
        if (soundFxOn) soundEngine.playGiftOpen();
        setConfettiBurstKey((k) => k + 1);
      }, 550);
    }
  };

  const handleCopyShareLink = () => {
    const url = buildShareableBirthdayUrl(greeting);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    onShareCountIncrement?.();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = buildShareableBirthdayUrl(greeting);
    const text = `${tr('مفاجأة وتهنئة عيد ميلاد خاصة إلى', 'Special Birthday Surprise for')} ${greeting.recipientName} 🎂🎁✨\n${url}`;
    onShareCountIncrement?.();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // Replace {name} placeholder dynamically
  const formatText = (raw?: string) => {
    if (!raw) return '';
    return raw.replace(/\{name\}/g, greeting.recipientName || '');
  };

  const fontClass =
    greeting.textStyle.fontFamily === 'amiri'
      ? 'font-amiri'
      : greeting.textStyle.fontFamily === 'tajawal'
      ? 'font-tajawal'
      : greeting.textStyle.fontFamily === 'cormorant'
      ? 'font-serif'
      : greeting.textStyle.fontFamily === 'plus_jakarta'
      ? 'font-sans'
      : 'font-cairo';

  const resolvedDirection =
    greeting.textStyle.direction === 'rtl'
      ? 'rtl'
      : greeting.textStyle.direction === 'ltr'
      ? 'ltr'
      : undefined;

  const architectureCardClass =
    greeting.visualArchitecture === 'polaroid_journal'
      ? 'rounded-2xl border-2 shadow-[0_14px_34px_rgba(0,0,0,0.12)]'
      : greeting.visualArchitecture === 'cinematic_widescreen'
      ? 'rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.45)] tracking-wide'
      : greeting.visualArchitecture === 'playful_pop'
      ? 'rounded-[32px] border-2 shadow-[0_12px_0_rgba(0,0,0,0.08)]'
      : greeting.visualArchitecture === 'botanical_manuscript'
      ? 'rounded-3xl border-2 shadow-lg'
      : 'rounded-3xl border shadow-xl';

  const textSizeClass =
    greeting.textStyle.fontSize === 'xl'
      ? 'text-xl sm:text-2xl'
      : greeting.textStyle.fontSize === 'lg'
      ? 'text-lg sm:text-xl'
      : greeting.textStyle.fontSize === 'sm'
      ? 'text-xs sm:text-sm'
      : 'text-sm sm:text-base';

  const textAlignClass =
    greeting.textStyle.textAlign === 'right'
      ? 'text-right'
      : greeting.textStyle.textAlign === 'left'
      ? 'text-left'
      : 'text-center';

  // Check Scheduled Availability & Expiry
  const now = new Date();
  const isScheduledFuture =
    !bypassScheduleLock &&
    greeting.availableFrom &&
    !Number.isNaN(Date.parse(greeting.availableFrom)) &&
    new Date(greeting.availableFrom) > now;

  const isExpired =
    !bypassScheduleLock &&
    greeting.expiresAt &&
    !Number.isNaN(Date.parse(greeting.expiresAt)) &&
    new Date(greeting.expiresAt).getTime() + 86400000 < now.getTime();

  const sortedMemories = greeting.memoryBoxSortByDate
    ? [...greeting.memoryBoxItems].sort((a, b) => a.date.localeCompare(b.date))
    : greeting.memoryBoxItems;

  const animDuration =
    skipAnimations
      ? 0.05
      : greeting.animationSpeed === 'slow'
      ? 0.75
      : greeting.animationSpeed === 'fast'
      ? 0.25
      : 0.45;

  const getPageTransitionVariants = () => {
    if (skipAnimations) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      };
    }
    if (greeting.transitionStyle === 'flip_3d') {
      return {
        initial: { opacity: 0, rotateY: -65, scale: 0.94 },
        animate: { opacity: 1, rotateY: 0, scale: 1 },
        exit: { opacity: 0, rotateY: 65, scale: 0.94 },
      };
    }
    if (greeting.transitionStyle === 'curtain_reveal') {
      return {
        initial: { opacity: 0, scaleY: 0.85, y: 24 },
        animate: { opacity: 1, scaleY: 1, y: 0 },
        exit: { opacity: 0, scaleY: 0.85, y: -24 },
      };
    }
    if (greeting.transitionStyle === 'fade_scale') {
      return {
        initial: { opacity: 0, scale: 0.92 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
      };
    }
    return {
      initial: { opacity: 0, x: isRTL ? -40 : 40 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: isRTL ? 40 : -40 },
    };
  };

  const particleEmojis =
    greeting.particleEffect === 'hearts'
      ? ['❤️', '💖', '💕', '✨']
      : greeting.particleEffect === 'balloons'
      ? ['🎈', '🎀', '🎉', '✨']
      : greeting.particleEffect === 'stars'
      ? ['🌟', '✨', '⭐', '💫']
      : greeting.particleEffect === 'funny_emojis'
      ? ['😂', '🥳', '🎉', '🍕', '👑']
      : ['🎉', '✨', '🎊', '🌟'];

  return (
    <div
      className={`invitation-isolated relative w-full rounded-3xl overflow-hidden shadow-2xl border transition-colors ${fontClass}`}
      style={{
        backgroundColor: greeting.themeColors.background,
        color: greeting.themeColors.textColor,
        borderColor: greeting.themeColors.border,
        minHeight: isEmbeddedPreview ? '680px' : '82vh',
      }}
    >
      {/* Background Video or Cover Image Overlay if provided */}
      {greeting.customBackgroundVideo && (
        <video
          src={greeting.customBackgroundVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      )}
      {greeting.customCoverImage && !greeting.customBackgroundVideo && (
        <img
          src={greeting.customCoverImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
        />
      )}

      {/* Ambient Floating Particles (unless skipAnimations is active) */}
      {!skipAnimations && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {Array.from({ length: 12 }).map((_, idx) => (
            <motion.div
              key={`${idx}-${confettiBurstKey}`}
              initial={{
                y: '105%',
                x: `${(idx * 9 + 5) % 95}%`,
                opacity: 0.15,
                scale: 0.8,
              }}
              animate={{
                y: '-10%',
                opacity: [0.2, 0.65, 0.15],
                rotate: [0, idx % 2 === 0 ? 25 : -25, 0],
              }}
              transition={{
                duration: 7 + (idx % 5) * 1.6,
                repeat: Infinity,
                delay: idx * 0.45,
                ease: 'easeInOut',
              }}
              className="absolute text-lg sm:text-xl select-none"
            >
              {particleEmojis[idx % particleEmojis.length]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Independent 2D & 3D Creative Canvas Elements Layer */}
      {greeting.canvasElements && greeting.canvasElements.length > 0 && (
        <CanvasElementsLayer
          elements={greeting.canvasElements}
          currentPageType={currentPage?.type}
          skipAnimations={skipAnimations}
        />
      )}

      {/* Top Interactive Bar: Progress Steps + Audio + Skip Animations */}
      <div
        className="relative z-20 px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-2 backdrop-blur-md"
        style={{
          backgroundColor: `${greeting.themeColors.cardBg}E6`,
          borderColor: greeting.themeColors.border,
        }}
      >
        {/* Story Page Dots */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {enabledPages.map((pg, idx) => (
            <button
              key={pg.id}
              type="button"
              onClick={() => setCurrentPageIdx(idx)}
              className="h-2.5 rounded-full transition-all cursor-pointer"
              style={{
                width: idx === currentPageIdx ? '28px' : '10px',
                backgroundColor:
                  idx === currentPageIdx
                    ? greeting.themeColors.primary
                    : `${greeting.themeColors.primary}40`,
              }}
              title={pg.title}
            />
          ))}
          <span className="text-[11px] font-mono opacity-75 mx-1">
            {currentPageIdx + 1} / {enabledPages.length}
          </span>
        </div>

        {/* Audio & Accessibility Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Skip Animations Toggle */}
          <button
            type="button"
            onClick={() => setSkipAnimations((v) => !v)}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition-all cursor-pointer"
            style={{
              backgroundColor: skipAnimations
                ? greeting.themeColors.primary
                : greeting.themeColors.background,
              color: skipAnimations ? greeting.themeColors.cardBg : greeting.themeColors.textColor,
              borderColor: greeting.themeColors.border,
            }}
            title={tr('تخطي الحركات والمؤثرات للعرض الفوري', 'Skip animations for instant display')}
          >
            <FastForward size={12} />
            <span>{tr('تخطي الحركات', 'Skip Motion')}</span>
          </button>

          {/* Sound Effects Toggle */}
          <button
            type="button"
            onClick={() => setSoundFxOn((v) => !v)}
            className="p-1.5 rounded-xl border transition-all cursor-pointer"
            style={{
              backgroundColor: greeting.themeColors.background,
              borderColor: greeting.themeColors.border,
              color: greeting.themeColors.textColor,
            }}
            title={soundFxOn ? tr('كتم المؤثرات الصوتية', 'Mute Sound FX') : tr('تفعيل المؤثرات الصوتية', 'Enable Sound FX')}
          >
            {soundFxOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Music Play/Pause Button */}
          <button
            type="button"
            onClick={toggleMusic}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            style={{
              backgroundColor: greeting.themeColors.primary,
              color: '#FFFFFF',
            }}
          >
            {isMusicPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isMusicPlaying ? tr('إيقاف الموسيقى', 'Pause Music') : tr('تشغيل الموسيقى', 'Play Music')}</span>
          </button>
        </div>
      </div>

      {/* Scheduled Lock or Expiration Screen */}
      {isScheduledFuture || isExpired ? (
        <div className="relative z-10 p-8 sm:p-14 flex flex-col items-center justify-center text-center min-h-[520px] space-y-5">
          <div
            className="w-18 h-18 rounded-3xl flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: `${greeting.themeColors.primary}20`,
              color: greeting.themeColors.primary,
            }}
          >
            <Calendar size={34} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {isScheduledFuture
              ? tr('هذه المفاجأة مجدولة ليوم الميلاد! ⏳🎂', 'This Surprise is Scheduled for Birthday! ⏳🎂')
              : tr('انتهت صلاحية رابط التهنئة', 'This Greeting Link Has Expired')}
          </h2>
          <p className="text-sm opacity-80 max-w-md leading-relaxed">
            {isScheduledFuture
              ? tr(
                  `صُممت هذه التهنئة الخاصة إلى (${greeting.recipientName}) وستُفتح تلقائياً بتاريخ: ${greeting.availableFrom}`,
                  `This special birthday experience for (${greeting.recipientName}) will unlock on: ${greeting.availableFrom}`
                )
              : tr(
                  'انتهت المدة المحددة لعرض هذا الرابط. يمكن لمنشئ التهنئة تمديد الصلاحية من المحرر.',
                  'The scheduled display window for this link has ended.'
                )}
          </p>
          <button
            type="button"
            onClick={() => setBypassScheduleLock(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all"
            style={{
              borderColor: greeting.themeColors.primary,
              color: greeting.themeColors.primary,
            }}
          >
            {tr('معاينة التهنئة الآن (للمنشئ)', 'Preview Greeting Now (Creator Override)')}
          </button>
        </div>
      ) : (
        /* Main Multi-Page Story Viewport */
        <div className="relative z-10 p-5 sm:p-10 flex flex-col justify-between min-h-[560px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage?.id || currentPageIdx}
              variants={getPageTransitionVariants()}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: animDuration, ease: 'easeOut' }}
              className="my-auto w-full max-w-2xl mx-auto"
            >
              {/* =========================================================
                  PAGE TYPE 1: TEASER & INTERACTIVE OPENING MECHANIC
              ========================================================= */}
              {currentPage?.type === 'teaser' && (
                <div
                  className="p-6 sm:p-10 rounded-3xl border text-center space-y-6 shadow-xl"
                  style={{
                    backgroundColor: greeting.themeColors.cardBg,
                    borderColor: greeting.themeColors.border,
                  }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${greeting.themeColors.primary}18`,
                      color: greeting.themeColors.primary,
                    }}
                  >
                    <Sparkles size={13} />
                    <span>{currentPage.badgeText || tr('رسالة خاصة', 'Special Surprise')}</span>
                  </span>

                  <h1 className="text-2xl sm:text-4xl font-bold leading-snug">
                    {formatText(greeting.coverTeaserText || currentPage.title)}
                  </h1>
                  <p className="text-sm sm:text-base opacity-80 max-w-lg mx-auto leading-relaxed">
                    {formatText(greeting.coverSubtitle || currentPage.subtitle)}
                  </p>

                  {/* Interactive Opening Visual Mechanic */}
                  <div className="py-4 flex justify-center">
                    {greeting.openingMechanic === 'envelope' && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleOpenCoverSurprise}
                        className="relative w-64 h-44 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg cursor-pointer overflow-hidden group"
                        style={{
                          backgroundColor: greeting.themeColors.background,
                          borderColor: greeting.themeColors.primary,
                        }}
                      >
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center shadow-md mb-2 transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: greeting.themeColors.primary,
                            color: '#FFFFFF',
                          }}
                        >
                          <span className="text-2xl">💌</span>
                        </div>
                        <span className="text-xs font-bold">
                          {tr('اضغط لفضّ الختم وفتح الظرف', 'Tap to break the seal & open envelope')}
                        </span>
                        <span className="text-[11px] opacity-70 mt-1">
                          {tr('مرسل من:', 'From:')} {greeting.senderName}
                        </span>
                      </motion.button>
                    )}

                    {greeting.openingMechanic === 'curtain' && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        onClick={handleOpenCoverSurprise}
                        className="relative w-72 h-44 rounded-2xl border-2 overflow-hidden flex items-center justify-center cursor-pointer shadow-xl"
                        style={{
                          backgroundColor: '#1A1412',
                          borderColor: greeting.themeColors.primary,
                        }}
                      >
                        <motion.div
                          animate={isOpeningUnlocked ? { x: '-90%' } : { x: 0 }}
                          className="absolute inset-y-0 left-0 w-1/2 border-r"
                          style={{
                            backgroundColor: greeting.themeColors.primary,
                            borderColor: greeting.themeColors.secondary,
                          }}
                        />
                        <motion.div
                          animate={isOpeningUnlocked ? { x: '90%' } : { x: 0 }}
                          className="absolute inset-y-0 right-0 w-1/2 border-l"
                          style={{
                            backgroundColor: greeting.themeColors.primary,
                            borderColor: greeting.themeColors.secondary,
                          }}
                        />
                        <div className="relative z-10 px-4 py-2 rounded-full bg-black/75 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                          <span>🎭</span>
                          <span>{tr('اضغط لسحب ستارة المسرح', 'Tap to Pull Stage Curtains')}</span>
                        </div>
                      </motion.button>
                    )}

                    {greeting.openingMechanic === 'door' && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        onClick={handleOpenCoverSurprise}
                        className="w-52 h-56 rounded-t-full rounded-b-2xl border-4 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-xl relative"
                        style={{
                          backgroundColor: `${greeting.themeColors.primary}15`,
                          borderColor: greeting.themeColors.primary,
                        }}
                      >
                        <span className="text-4xl">🚪✨</span>
                        <span className="text-xs font-bold px-3">
                          {tr('اضغط لفتح باب المفاجأة', 'Tap to Open the Surprise Door')}
                        </span>
                      </motion.button>
                    )}

                    {greeting.openingMechanic === 'gift_tap' && (
                      <motion.button
                        type="button"
                        animate={{ rotate: [0, -4, 4, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        onClick={handleOpenCoverSurprise}
                        className="w-48 h-48 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-xl"
                        style={{
                          backgroundColor: `${greeting.themeColors.primary}15`,
                          borderColor: greeting.themeColors.primary,
                        }}
                      >
                        <span className="text-6xl">🎁</span>
                        <span className="text-xs font-bold">
                          {tr('اضغط على الهدية لفتحها!', 'Tap the Gift to Open!')}
                        </span>
                      </motion.button>
                    )}

                    {greeting.openingMechanic === 'heart_tap' && (
                      <motion.button
                        type="button"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        onClick={handleOpenCoverSurprise}
                        className="w-44 h-44 rounded-full border-2 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-xl"
                        style={{
                          backgroundColor: `${greeting.themeColors.primary}18`,
                          borderColor: greeting.themeColors.primary,
                        }}
                      >
                        <span className="text-5xl">💖</span>
                        <span className="text-xs font-bold">
                          {tr('اضغط على القلب النابض', 'Tap the Glowing Heart')}
                        </span>
                      </motion.button>
                    )}

                    {greeting.openingMechanic === 'cake_cover' && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity }}
                        onClick={handleOpenCoverSurprise}
                        className="w-56 h-52 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-xl p-4"
                        style={{
                          backgroundColor: `${greeting.themeColors.primary}16`,
                          borderColor: greeting.themeColors.primary,
                        }}
                      >
                        <CreativeElementGraphic
                          svgType="royal_cake"
                          dimension="3d"
                          size={88}
                          color={greeting.themeColors.primary}
                          secondaryColor={greeting.themeColors.secondary}
                        />
                        <span className="text-xs font-bold">
                          {tr('اضغط لإضاءة كعكة الاحتفال وفتح القصة 🎂🕯️', 'Tap to Light the Cake & Start Story 🎂🕯️')}
                        </span>
                      </motion.button>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleOpenCoverSurprise}
                      className="px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
                      style={{
                        backgroundColor: greeting.themeColors.primary,
                        color: '#FFFFFF',
                      }}
                    >
                      {formatText(greeting.coverButtonText || currentPage.buttonLabel || 'افتح المفاجأة الآن ✨')}
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE TYPE 2: SURPRISE REVEAL & RECIPIENT NAME
              ========================================================= */}
              {currentPage?.type === 'reveal' && (
                <div
                  className="p-6 sm:p-10 rounded-3xl border text-center space-y-6 shadow-xl"
                  style={{
                    backgroundColor: greeting.themeColors.cardBg,
                    borderColor: greeting.themeColors.border,
                  }}
                >
                  <div className="flex justify-center gap-2 text-2xl">
                    {greeting.selectedStickers.slice(0, 5).map((st, idx) => (
                      <motion.span
                        key={idx}
                        animate={skipAnimations ? {} : { y: [0, -8, 0] }}
                        transition={{ duration: 1.8, delay: idx * 0.2, repeat: Infinity }}
                      >
                        {st}
                      </motion.span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <span
                      className="inline-block px-3.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `${greeting.themeColors.primary}20`,
                        color: greeting.themeColors.primary,
                      }}
                    >
                      {tr('اليوم كله على شرفك', 'Today is All About You')}
                    </span>

                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                      {greeting.recipientName}
                    </h2>

                    {greeting.recipientNickname && (
                      <p
                        className="text-base sm:text-lg font-bold"
                        style={{ color: greeting.themeColors.primary }}
                      >
                        «{greeting.recipientNickname}»
                      </p>
                    )}
                  </div>

                  {greeting.recipientAge && (
                    <div
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border"
                      style={{
                        backgroundColor: greeting.themeColors.background,
                        borderColor: greeting.themeColors.border,
                      }}
                    >
                      <Cake size={22} style={{ color: greeting.themeColors.primary }} />
                      <div className="text-start">
                        <div className="text-[11px] opacity-75">
                          {tr('نحتفل بعامك المميز', 'Celebrating Your Milestone')}
                        </div>
                        <div className="text-lg font-bold font-mono">
                          {greeting.recipientAge} {tr('سنة من التألق والجمال ✨', 'Wonderful Years ✨')}
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-sm sm:text-base opacity-85 max-w-lg mx-auto leading-relaxed">
                    {formatText(currentPage.subtitle)}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setConfettiBurstKey((k) => k + 1);
                        if (soundFxOn) soundEngine.playCelebrationFanfare();
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all"
                      style={{
                        borderColor: greeting.themeColors.primary,
                        color: greeting.themeColors.primary,
                      }}
                    >
                      <PartyPopper size={15} />
                      <span>{tr('إطلاق مفرقعات الاحتفال 🎉', 'Launch Confetti Burst 🎉')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={goToNextPage}
                      className="px-7 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                      style={{
                        backgroundColor: greeting.themeColors.primary,
                        color: '#FFFFFF',
                      }}
                    >
                      {currentPage.buttonLabel || tr('اقرأ رسالتك الخاصة ←', 'Read Your Message →')}
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE TYPE 3: MAIN GREETING + HIDDEN HEART + PRECIOUS METER
              ========================================================= */}
              {currentPage?.type === 'main_greeting' && (
                <div
                  className="p-6 sm:p-10 rounded-3xl border space-y-6 shadow-xl"
                  style={{
                    backgroundColor: greeting.themeColors.cardBg,
                    borderColor: greeting.themeColors.border,
                  }}
                >
                  <div className="text-center space-y-2">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `${greeting.themeColors.primary}18`,
                        color: greeting.themeColors.primary,
                      }}
                    >
                      {currentPage.badgeText || tr('كلمات من القلب', 'From the Heart')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      {formatText(greeting.mainGreetingTitle)}
                    </h2>
                  </div>

                  {/* Main Customizable Message */}
                  <div
                    dir={resolvedDirection}
                    className={`p-5 sm:p-7 ${architectureCardClass} leading-relaxed ${textSizeClass} ${textAlignClass}`}
                    style={{
                      backgroundColor: greeting.themeColors.background,
                      borderColor: greeting.themeColors.border,
                      color: greeting.textStyle.textColor || greeting.themeColors.textColor,
                    }}
                  >
                    {formatText(greeting.mainGreetingBody)}
                  </div>

                  {/* Interactive Hidden Heart & "Discover How Precious You Are" */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. Tap Heart to Reveal Hidden Message */}
                    <div
                      className="p-4 rounded-2xl border text-center space-y-3"
                      style={{
                        backgroundColor: greeting.themeColors.background,
                        borderColor: greeting.themeColors.border,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsHeartMessageRevealed((v) => !v);
                          if (soundFxOn) soundEngine.playHeartPop();
                        }}
                        className="mx-auto w-14 h-14 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                        style={{
                          backgroundColor: `${greeting.themeColors.primary}20`,
                          color: greeting.themeColors.primary,
                        }}
                      >
                        <Heart
                          size={26}
                          className={isHeartMessageRevealed ? 'fill-current' : ''}
                        />
                      </button>
                      <div className="text-xs font-bold">
                        {isHeartMessageRevealed
                          ? tr('الرسالة المخفية داخل القلب ❤️:', 'Hidden Message Inside the Heart ❤️:')
                          : tr('اضغط على القلب لكشف الرسالة المخفية', 'Tap the Heart to Reveal Hidden Note')}
                      </div>
                      {isHeartMessageRevealed && (
                        <motion.p
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs leading-relaxed p-3 rounded-xl border"
                          style={{
                            backgroundColor: greeting.themeColors.cardBg,
                            borderColor: greeting.themeColors.border,
                          }}
                        >
                          {formatText(greeting.hiddenHeartMessage)}
                        </motion.p>
                      )}
                    </div>

                    {/* 2. "Discover How Precious You Are" Button */}
                    <div
                      className="p-4 rounded-2xl border text-center space-y-3 flex flex-col justify-center"
                      style={{
                        backgroundColor: greeting.themeColors.background,
                        borderColor: greeting.themeColors.border,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsPreciousScoreRevealed((v) => !v);
                          if (soundFxOn) soundEngine.playGiftOpen();
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all mx-auto flex items-center gap-1.5"
                        style={{
                          backgroundColor: greeting.themeColors.primary,
                          color: '#FFFFFF',
                        }}
                      >
                        <Sparkles size={14} />
                        <span>{tr('اكتشف شكد أنت غالي 💎', 'Discover How Precious You Are 💎')}</span>
                      </button>

                      {isPreciousScoreRevealed ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 rounded-xl border text-xs font-bold space-y-1.5"
                          style={{
                            backgroundColor: greeting.themeColors.cardBg,
                            borderColor: greeting.themeColors.primary,
                          }}
                        >
                          <div className="w-full h-2 rounded-full overflow-hidden bg-black/10">
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.8 }}
                              className="h-full"
                              style={{ backgroundColor: greeting.themeColors.primary }}
                            />
                          </div>
                          <p>{formatText(greeting.howPreciousScoreText)}</p>
                        </motion.div>
                      ) : (
                        <p className="text-[11px] opacity-75">
                          {tr('اضغط على الزر لقياس غلاوتك ومعزتك الحقيقية!', 'Tap to measure how truly special you are!')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE TYPE 4: MEMORY BOX (صندوق الذكريات)
              ========================================================= */}
              {currentPage?.type === 'memory_box' && (
                <div
                  className="p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl"
                  style={{
                    backgroundColor: greeting.themeColors.cardBg,
                    borderColor: greeting.themeColors.border,
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <Camera size={22} style={{ color: greeting.themeColors.primary }} />
                        <span>{currentPage.title || tr('صندوق الذكريات الجميلة', 'Memory Box')}</span>
                      </h2>
                      <p className="text-xs opacity-75 mt-0.5">
                        {currentPage.subtitle ||
                          tr('اضغط على سؤال الذكرى لكشف الصورة والقصة المرتبطة بها', 'Tap each memory prompt to reveal its photo and story')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {/* Photo Frame Switcher */}
                      <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ borderColor: greeting.themeColors.border, backgroundColor: greeting.themeColors.background }}>
                        {PHOTO_FRAME_STYLES_META.map((frm) => (
                          <button
                            key={frm.id}
                            type="button"
                            onClick={() => setActivePhotoFrame(frm.id)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            style={{
                              backgroundColor:
                                activePhotoFrame === frm.id
                                  ? greeting.themeColors.primary
                                  : 'transparent',
                              color:
                                activePhotoFrame === frm.id
                                  ? '#FFFFFF'
                                  : greeting.themeColors.textColor,
                            }}
                            title={lang === 'ar' ? frm.descAr : frm.descEn}
                          >
                            🖼️ {lang === 'ar' ? frm.nameAr.split(' ')[0] : frm.nameEn.split(' ')[0]}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setMemoryMode('one_by_one')}
                        className="px-3 py-1.5 rounded-xl font-bold border cursor-pointer"
                        style={{
                          backgroundColor:
                            memoryMode === 'one_by_one'
                              ? greeting.themeColors.primary
                              : greeting.themeColors.background,
                          color:
                            memoryMode === 'one_by_one'
                              ? '#FFFFFF'
                              : greeting.themeColors.textColor,
                          borderColor: greeting.themeColors.border,
                        }}
                      >
                        {tr('واحدة تلو الأخرى', 'One by One')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMemoryMode('grid')}
                        className="px-3 py-1.5 rounded-xl font-bold border cursor-pointer"
                        style={{
                          backgroundColor:
                            memoryMode === 'grid'
                              ? greeting.themeColors.primary
                              : greeting.themeColors.background,
                          color:
                            memoryMode === 'grid' ? '#FFFFFF' : greeting.themeColors.textColor,
                          borderColor: greeting.themeColors.border,
                        }}
                      >
                        {tr('عرض الألبوم', 'Album Grid')}
                      </button>
                    </div>
                  </div>

                  {/* Interactive Cinematic Color Filters Library Bar (مكتبة الفلاتر اللونية السينمائية) */}
                  <div
                    className="p-3.5 rounded-2xl border space-y-2.5"
                    style={{
                      backgroundColor: greeting.themeColors.background,
                      borderColor: greeting.themeColors.border,
                    }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span>🎨</span>
                        <span>
                          {tr(
                            'مكتبة الفلاتر اللونية السينمائية (Color Filters — تغيير المزاج البصري للصور):',
                            'Cinematic Color Filters Library (Change Visual Mood):'
                          )}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${greeting.themeColors.primary}20`,
                          color: greeting.themeColors.primary,
                        }}
                      >
                        {lang === 'ar'
                          ? getColorFilterMeta(activeColorFilter).nameAr
                          : getColorFilterMeta(activeColorFilter).nameEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {COLOR_FILTERS_LIBRARY.map((flt) => {
                        const isSelected = activeColorFilter === flt.id;
                        return (
                          <button
                            key={flt.id}
                            type="button"
                            onClick={() => setActiveColorFilter(flt.id)}
                            className="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                            style={{
                              backgroundColor: isSelected
                                ? greeting.themeColors.primary
                                : greeting.themeColors.cardBg,
                              color: isSelected ? '#FFFFFF' : greeting.themeColors.textColor,
                              borderColor: isSelected
                                ? greeting.themeColors.primary
                                : greeting.themeColors.border,
                            }}
                            title={lang === 'ar' ? flt.descAr : flt.descEn}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/50 shrink-0 shadow-xs"
                              style={{ background: flt.swatchGradient }}
                            />
                            <span>
                              {lang === 'ar'
                                ? flt.nameAr.split(' (')[0]
                                : flt.nameEn}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {sortedMemories.length === 0 ? (
                    <div className="p-8 text-center text-xs opacity-70">
                      {tr('لا توجد ذكريات مضافة بعد.', 'No memories added yet.')}
                    </div>
                  ) : memoryMode === 'one_by_one' ? (
                    /* One-by-One Interactive Memory Reveal with Selected Photo Frame & Color Filter */
                    (() => {
                      const mem = sortedMemories[activeMemoryIdx] || sortedMemories[0];
                      const isRevealed = !!revealedMemoryIds[mem.id];
                      const appliedFilter = getColorFilterMeta(
                        mem.colorFilter || activeColorFilter
                      );
                      return (
                        <div className="space-y-4">
                          <div
                            className="p-5 rounded-2xl border overflow-hidden"
                            style={{
                              backgroundColor: greeting.themeColors.background,
                              borderColor: greeting.themeColors.border,
                            }}
                          >
                            {!isRevealed ? (
                              <div className="py-12 text-center space-y-4">
                                <div className="text-4xl">📦✨</div>
                                <h3 className="text-lg sm:text-xl font-bold">
                                  «{mem.teaserQuestion || tr('تتذكر هذا اليوم؟', 'Remember this day?')}»
                                </h3>
                                <p className="text-xs font-mono opacity-75">{mem.date}</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRevealedMemoryIds((prev) => ({ ...prev, [mem.id]: true }));
                                    if (soundFxOn) soundEngine.playHeartPop();
                                  }}
                                  className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                                  style={{
                                    backgroundColor: greeting.themeColors.primary,
                                    color: '#FFFFFF',
                                  }}
                                >
                                  {tr('اكشف هذه الذكرى 📸', 'Reveal This Memory 📸')}
                                </button>
                              </div>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                              >
                                {/* Frame Renderer with Active Color Filter & Tint Overlay */}
                                {activePhotoFrame === 'polaroid' && (
                                  <div className="mx-auto max-w-md bg-[#FFFDF9] text-[#2B2623] p-3.5 pb-6 rounded-xl shadow-[0_14px_30px_rgba(0,0,0,0.28)] border border-[#E5DEC9] -rotate-1 transition-transform hover:rotate-0">
                                    <div className="aspect-16/10 rounded-lg overflow-hidden bg-black/10 relative">
                                      {mem.type === 'video' ? (
                                        <video
                                          src={mem.mediaUrl}
                                          controls
                                          className="w-full h-full object-cover transition-all duration-500"
                                          style={{ filter: appliedFilter.cssFilter }}
                                        />
                                      ) : (
                                        <img
                                          src={mem.mediaUrl}
                                          alt={mem.title}
                                          className="w-full h-full object-cover transition-all duration-500"
                                          style={{ filter: appliedFilter.cssFilter }}
                                        />
                                      )}
                                      {appliedFilter.id !== 'original' && (
                                        <div
                                          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                                          style={{ background: appliedFilter.tintOverlay }}
                                        />
                                      )}
                                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                                        {appliedFilter.badge}
                                      </span>
                                    </div>
                                    <div className="pt-3 px-1 flex items-center justify-between">
                                      <span className="font-bold text-sm">{mem.title}</span>
                                      <span className="text-[11px] font-mono opacity-70">{mem.date}</span>
                                    </div>
                                    <p className="text-xs opacity-80 mt-1 px-1 text-start">{mem.story}</p>
                                  </div>
                                )}

                                {activePhotoFrame === 'scrapbook' && (
                                  <div className="relative mx-auto max-w-lg p-5 rounded-2xl bg-[#F7F1E3] text-[#3D322C] border-2 border-dashed border-[#C8B69E] shadow-lg">
                                    {/* Decorative Tape Strips */}
                                    <div className="w-20 h-5 bg-[#E6D5B8]/85 border border-[#C8B69E] -rotate-6 absolute -top-2.5 left-6 shadow-xs" />
                                    <div className="w-20 h-5 bg-[#E6D5B8]/85 border border-[#C8B69E] rotate-6 absolute -top-2.5 right-6 shadow-xs" />
                                    <div className="aspect-16/10 rounded-xl overflow-hidden border-4 border-white shadow-md relative">
                                      <img
                                        src={mem.mediaUrl}
                                        alt={mem.title}
                                        className="w-full h-full object-cover transition-all duration-500"
                                        style={{ filter: appliedFilter.cssFilter }}
                                      />
                                      {appliedFilter.id !== 'original' && (
                                        <div
                                          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                                          style={{ background: appliedFilter.tintOverlay }}
                                        />
                                      )}
                                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                                        {appliedFilter.badge}
                                      </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49]">
                                        📎 {mem.teaserQuestion}
                                      </span>
                                      <span className="text-[11px] font-mono">{mem.date}</span>
                                    </div>
                                    <h4 className="text-base font-bold mt-2 text-start">{mem.title}</h4>
                                    <p className="text-xs leading-relaxed opacity-85 text-start mt-1">{mem.story}</p>
                                  </div>
                                )}

                                {activePhotoFrame === 'timeline' && (
                                  <div className="relative pl-6 border-l-2 space-y-3" style={{ borderColor: greeting.themeColors.primary }}>
                                    <div
                                      className="w-4 h-4 rounded-full absolute -left-[9px] top-2 ring-4"
                                      style={{
                                        backgroundColor: greeting.themeColors.primary,
                                        boxShadow: `0 0 12px ${greeting.themeColors.primary}`,
                                      }}
                                    />
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: `${greeting.themeColors.primary}22`, color: greeting.themeColors.primary }}>
                                      ⏳ {mem.date} — {mem.teaserQuestion}
                                    </div>
                                    <div className="aspect-16/10 rounded-2xl overflow-hidden border relative" style={{ borderColor: greeting.themeColors.border }}>
                                      <img
                                        src={mem.mediaUrl}
                                        alt={mem.title}
                                        className="w-full h-full object-cover transition-all duration-500"
                                        style={{ filter: appliedFilter.cssFilter }}
                                      />
                                      {appliedFilter.id !== 'original' && (
                                        <div
                                          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                                          style={{ background: appliedFilter.tintOverlay }}
                                        />
                                      )}
                                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                                        {appliedFilter.badge}
                                      </span>
                                    </div>
                                    <h4 className="text-base font-bold text-start">{mem.title}</h4>
                                    <p className="text-xs sm:text-sm opacity-85 leading-relaxed text-start">{mem.story}</p>
                                  </div>
                                )}

                                {activePhotoFrame === 'cinematic_gallery' && (
                                  <div className="rounded-2xl overflow-hidden bg-[#0B0C10] text-white border border-white/15 shadow-2xl">
                                    {/* Top Film Perforation Bar */}
                                    <div className="h-5 bg-black flex items-center justify-between px-3">
                                      {Array.from({ length: 12 }).map((_, i) => (
                                        <span key={i} className="w-3 h-2 rounded-xs bg-white/25" />
                                      ))}
                                    </div>
                                    <div className="aspect-16/9 relative overflow-hidden">
                                      <img
                                        src={mem.mediaUrl}
                                        alt={mem.title}
                                        className="w-full h-full object-cover transition-all duration-500"
                                        style={{ filter: appliedFilter.cssFilter }}
                                      />
                                      {appliedFilter.id !== 'original' && (
                                        <div
                                          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                                          style={{ background: appliedFilter.tintOverlay }}
                                        />
                                      )}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />
                                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 border border-amber-400/40 text-amber-300 text-[10px] font-bold backdrop-blur-xs">
                                        LUT • {lang === 'ar' ? appliedFilter.nameAr.split(' (')[0] : appliedFilter.nameEn}
                                      </span>
                                      <div className="absolute bottom-3 inset-x-4 text-start space-y-0.5">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                                          SCENE {activeMemoryIdx + 1} • {mem.date}
                                        </span>
                                        <h4 className="text-base sm:text-lg font-bold">{mem.title}</h4>
                                        <p className="text-xs text-white/80 line-clamp-2">{mem.story}</p>
                                      </div>
                                    </div>
                                    {/* Bottom Film Perforation Bar */}
                                    <div className="h-5 bg-black flex items-center justify-between px-3">
                                      {Array.from({ length: 12 }).map((_, i) => (
                                        <span key={i} className="w-3 h-2 rounded-xs bg-white/25" />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              disabled={activeMemoryIdx === 0}
                              onClick={() => setActiveMemoryIdx((i) => Math.max(0, i - 1))}
                              className="px-4 py-2 rounded-xl text-xs font-bold border disabled:opacity-40 cursor-pointer"
                              style={{ borderColor: greeting.themeColors.border }}
                            >
                              {tr('الذكرى السابقة', 'Previous Memory')}
                            </button>
                            <span className="text-xs font-mono">
                              {activeMemoryIdx + 1} / {sortedMemories.length}
                            </span>
                            <button
                              type="button"
                              disabled={activeMemoryIdx === sortedMemories.length - 1}
                              onClick={() =>
                                setActiveMemoryIdx((i) =>
                                  Math.min(sortedMemories.length - 1, i + 1)
                                )
                              }
                              className="px-4 py-2 rounded-xl text-xs font-bold border disabled:opacity-40 cursor-pointer"
                              style={{ borderColor: greeting.themeColors.border }}
                            >
                              {tr('الذكرى التالية', 'Next Memory')}
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* Album / Timeline Grid Mode with Photo Frame Style & Color Filter */
                    <div
                      className={
                        activePhotoFrame === 'timeline'
                          ? 'relative pl-6 border-l-2 space-y-5'
                          : 'grid grid-cols-1 sm:grid-cols-2 gap-5'
                      }
                      style={
                        activePhotoFrame === 'timeline'
                          ? { borderColor: greeting.themeColors.primary }
                          : undefined
                      }
                    >
                      {sortedMemories.map((mem, idx) => {
                        const isRevealed = !!revealedMemoryIds[mem.id];
                        const appliedFilter = getColorFilterMeta(
                          mem.colorFilter || activeColorFilter
                        );
                        return (
                          <div
                            key={mem.id}
                            className={
                              activePhotoFrame === 'polaroid'
                                ? `p-3.5 pb-5 rounded-xl bg-[#FFFDF9] text-[#2B2623] border border-[#E5DEC9] shadow-lg ${
                                    idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
                                  }`
                                : activePhotoFrame === 'scrapbook'
                                ? 'relative p-4 rounded-2xl bg-[#F7F1E3] text-[#3D322C] border-2 border-dashed border-[#C8B69E] shadow-md'
                                : activePhotoFrame === 'cinematic_gallery'
                                ? 'rounded-2xl overflow-hidden bg-[#0B0C10] text-white border border-white/15 shadow-xl p-3'
                                : 'relative p-4 rounded-2xl border space-y-3'
                            }
                            style={
                              activePhotoFrame === 'timeline'
                                ? {
                                    backgroundColor: greeting.themeColors.background,
                                    borderColor: greeting.themeColors.border,
                                  }
                                : undefined
                            }
                          >
                            {!isRevealed ? (
                              <div className="py-8 text-center space-y-3">
                                <div className="text-2xl">📸</div>
                                <div className="text-sm font-bold">«{mem.teaserQuestion}»</div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRevealedMemoryIds((prev) => ({ ...prev, [mem.id]: true }));
                                    if (soundFxOn) soundEngine.playHeartPop();
                                  }}
                                  className="px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                                  style={{
                                    backgroundColor: greeting.themeColors.primary,
                                    color: '#FFFFFF',
                                  }}
                                >
                                  {tr('كشف الذكرى', 'Reveal')}
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="relative rounded-lg overflow-hidden">
                                  <img
                                    src={mem.mediaUrl}
                                    alt={mem.title}
                                    className="w-full h-40 object-cover transition-all duration-500"
                                    style={{ filter: appliedFilter.cssFilter }}
                                  />
                                  {appliedFilter.id !== 'original' && (
                                    <div
                                      className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                                      style={{ background: appliedFilter.tintOverlay }}
                                    />
                                  )}
                                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/65 text-white text-[9px] font-bold backdrop-blur-xs">
                                    {appliedFilter.badge}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] opacity-80 pt-2">
                                  <span className="font-bold">{mem.title}</span>
                                  <span className="font-mono">{mem.date}</span>
                                </div>
                                <p className="text-xs opacity-85 pt-1 text-start">{mem.story}</p>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================
                  PAGE TYPE 5: INTERACTIVE BIRTHDAY CAKE & CANDLES
              ========================================================= */}
              {currentPage?.type === 'cake_candles' && (
                <div
                  className="p-6 sm:p-10 rounded-3xl border text-center space-y-6 shadow-xl"
                  style={{
                    backgroundColor: greeting.themeColors.cardBg,
                    borderColor: greeting.themeColors.border,
                  }}
                >
                  <div className="space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      {currentPage.title || tr('كعكة عيد الميلاد التفاعلية 🎂', 'Interactive Birthday Cake 🎂')}
                    </h2>
                    <p className="text-xs sm:text-sm opacity-80">
                      {formatText(greeting.cakeWishPrompt)}
                    </p>
                  </div>

                  {/* Interactive Multi-Tier Cake SVG / Illustration with Touchable Candles */}
                  <div className="py-6 flex flex-col items-center justify-center">
                    {/* Candles Row */}
                    <div className="flex items-end justify-center gap-3 sm:gap-4 mb-1 z-10">
                      {litCandles.map((isLit, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleBlowCandle(idx)}
                          className="flex flex-col items-center group cursor-pointer"
                          title={tr('اضغط لإطفاء الشمعة', 'Tap to blow out candle')}
                        >
                          {/* Flame */}
                          <div className="h-7 flex items-center justify-center">
                            {isLit ? (
                              <motion.div
                                animate={{
                                  scale: [1, 1.18, 0.95, 1.1, 1],
                                  rotate: [-4, 4, -2, 3, 0],
                                }}
                                transition={{ duration: 0.9, repeat: Infinity }}
                                className="w-4 h-6 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 shadow-[0_0_14px_#F59E0B]"
                              />
                            ) : (
                              <span className="text-xs opacity-50">💨</span>
                            )}
                          </div>
                          {/* Candle Stick */}
                          <div className="w-3.5 h-12 rounded-t-md bg-gradient-to-b from-white to-amber-100 border border-amber-300 shadow-xs relative overflow-hidden">
                            <div
                              className="w-full h-2 mt-2"
                              style={{ backgroundColor: greeting.themeColors.primary }}
                            />
                            <div
                              className="w-full h-2 mt-2"
                              style={{ backgroundColor: greeting.themeColors.secondary }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Cake Top Tier */}
                    <motion.div
                      animate={isCakeSliced ? { scale: 1.04 } : {}}
                      className="w-52 sm:w-64 h-16 rounded-t-2xl border-2 relative shadow-md flex items-center justify-center"
                      style={{
                        backgroundColor: greeting.cakeFlavorColor || '#F4ACB7',
                        borderColor: greeting.themeColors.primary,
                      }}
                    >
                      <span className="text-xs font-bold text-white drop-shadow">
                        {greeting.recipientName} ✨
                      </span>
                    </motion.div>

                    {/* Cake Base Tier */}
                    <div
                      className="w-64 sm:w-80 h-20 rounded-b-2xl border-2 border-t-0 shadow-lg flex items-center justify-center gap-3"
                      style={{
                        backgroundColor: greeting.themeColors.primary,
                        borderColor: greeting.themeColors.primary,
                        color: '#FFFFFF',
                      }}
                    >
                      <span>🍓</span>
                      <span className="text-xs font-bold">
                        {allCandlesBlown
                          ? tr('تحققت الأمنية! 🎉', 'Wish Made! 🎉')
                          : tr(`باقي ${litCandles.filter(Boolean).length} شموع مضاءة`, `${litCandles.filter(Boolean).length} candles lit`)}
                      </span>
                      <span>🍓</span>
                    </div>
                  </div>

                  {/* Blow All Candles / Slice Cake Actions */}
                  {!allCandlesBlown ? (
                    <button
                      type="button"
                      onClick={handleBlowAllCandles}
                      className="px-6 py-3 rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all inline-flex items-center gap-2"
                      style={{
                        backgroundColor: greeting.themeColors.primary,
                        color: '#FFFFFF',
                      }}
                    >
                      <Flame size={16} />
                      <span>{tr('انفخ جميع الشموع الآن وتمنَّ أمنيتك! 🕯️💨', 'Blow Out All Candles & Make a Wish! 🕯️💨')}</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 rounded-2xl border space-y-3"
                      style={{
                        backgroundColor: greeting.themeColors.background,
                        borderColor: greeting.themeColors.primary,
                      }}
                    >
                      <div className="text-2xl">🎉🎂🥳</div>
                      <h3 className="text-lg font-bold">
                        {formatText(greeting.cakeCelebrationMessage)}
                      </h3>
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCakeSliced(true)}
                          className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                          style={{
                            backgroundColor: greeting.themeColors.primary,
                            color: '#FFFFFF',
                          }}
                        >
                          {isCakeSliced
                            ? tr('تم تقطيع الكعكة وتوزيع الفرح 🍰✨', 'Cake Sliced & Served 🍰✨')
                            : tr('تقطيع كعكة العيد 🍰', 'Slice the Birthday Cake 🍰')}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setLitCandles(litCandles.map(() => true))
                          }
                          className="px-3 py-2 rounded-xl text-xs border cursor-pointer"
                          style={{ borderColor: greeting.themeColors.border }}
                        >
                          {tr('إعادة إشعال الشموع', 'Relight Candles')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* =========================================================
                  PAGE TYPE 6: SCRATCH & REVEAL (اكشط واكتشف)
              ========================================================= */}
              {currentPage?.type === 'scratch_reveal' && (
                <div
                  className="p-6 sm:p-10 rounded-3xl border text-center space-y-5 shadow-xl"
                  style={{
                    backgroundColor: greeting.themeColors.cardBg,
                    borderColor: greeting.themeColors.border,
                  }}
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      {currentPage.title || tr('اكشط واكتشف مفاجأتك 🪙', 'Scratch & Reveal Your Surprise 🪙')}
                    </h2>
                    <p className="text-xs sm:text-sm opacity-80">
                      {greeting.scratchCard.promptTitle}
                    </p>
                  </div>

                  {/* Interactive Scratch Card Container */}
                  <div
                    className="relative w-full max-w-md mx-auto h-56 rounded-2xl border-2 overflow-hidden shadow-inner flex flex-col items-center justify-center p-6 select-none"
                    style={{
                      backgroundColor: greeting.themeColors.background,
                      borderColor: greeting.themeColors.primary,
                    }}
                  >
                    {/* Hidden Content Underneath */}
                    <div className="space-y-2 text-center z-0">
                      <span className="text-3xl">🎁✨</span>
                      <h3
                        className="text-lg sm:text-xl font-bold"
                        style={{ color: greeting.themeColors.primary }}
                      >
                        {formatText(greeting.scratchCard.hiddenTitle)}
                      </h3>
                      <p className="text-xs sm:text-sm leading-relaxed">
                        {formatText(greeting.scratchCard.hiddenMessage)}
                      </p>
                      {greeting.scratchCard.voucherCodeOrPlace && (
                        <div
                          className="inline-block px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold border mt-1"
                          style={{
                            backgroundColor: greeting.themeColors.cardBg,
                            borderColor: greeting.themeColors.primary,
                          }}
                        >
                          {greeting.scratchCard.voucherCodeOrPlace}
                        </div>
                      )}
                    </div>

                    {/* HTML5 Scratchable Canvas Foil Overlay */}
                    {!isScratchRevealed && (
                      <canvas
                        ref={canvasRef}
                        width={420}
                        height={230}
                        onMouseDown={() => {
                          isDrawingRef.current = true;
                        }}
                        onMouseUp={() => {
                          isDrawingRef.current = false;
                        }}
                        onMouseLeave={() => {
                          isDrawingRef.current = false;
                        }}
                        onMouseMove={(e) => {
                          if (!isDrawingRef.current) return;
                          handleScratchMove(e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          isDrawingRef.current = true;
                          const touch = e.touches[0];
                          if (touch) handleScratchMove(touch.clientX, touch.clientY);
                        }}
                        onTouchMove={(e) => {
                          const touch = e.touches[0];
                          if (touch) handleScratchMove(touch.clientX, touch.clientY);
                        }}
                        onTouchEnd={() => {
                          isDrawingRef.current = false;
                        }}
                        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-10"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-3 text-xs">
                    {!isScratchRevealed ? (
                      <>
                        <span className="opacity-75 font-mono">
                          {tr(`تم كشط ${scratchPercent}%`, `Scratched ${scratchPercent}%`)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsScratchRevealed(true);
                            if (soundFxOn) soundEngine.playCelebrationFanfare();
                          }}
                          className="px-4 py-2 rounded-xl font-bold border cursor-pointer"
                          style={{
                            borderColor: greeting.themeColors.primary,
                            color: greeting.themeColors.primary,
                          }}
                        >
                          {tr('كشف البطاقة بالكامل فورا ✨', 'Reveal Card Instantly ✨')}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsScratchRevealed(false);
                          setScratchPercent(0);
                        }}
                        className="px-4 py-2 rounded-xl font-bold border cursor-pointer flex items-center gap-1.5"
                        style={{ borderColor: greeting.themeColors.border }}
                      >
                        <RotateCcw size={13} />
                        <span>{tr('إعادة تغطية البطاقة للكشط مجدداً', 'Reset Scratch Card')}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE TYPE 7: SECRET MESSAGE WITH PASSWORD (رسالة سرية)
              ========================================================= */}
              {currentPage?.type === 'secret_message' && (
                <div
                  className="p-6 sm:p-10 rounded-3xl border space-y-6 shadow-xl"
                  style={{
                    backgroundColor: greeting.themeColors.cardBg,
                    borderColor: greeting.themeColors.border,
                  }}
                >
                  <div className="text-center space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
                      <Lock size={22} style={{ color: greeting.themeColors.primary }} />
                      <span>{currentPage.title || tr('رسالة سرية بكلمة مرور 🔐', 'Password-Protected Secret Message 🔐')}</span>
                    </h2>
                    <p className="text-xs sm:text-sm opacity-80">
                      {tr(
                        'عندك رسالة سرية خاصة، بس لازم تعرف كلمة السر المرتبطة بذكرى بيننا!',
                        'You have a secret message—enter the shared memory password to unlock it!'
                      )}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {greeting.secretMessages.map((sec) => {
                      const isUnlocked = !!unlockedSecrets[sec.id];
                      const showHint = !!shownHints[sec.id];
                      return (
                        <div
                          key={sec.id}
                          className="p-5 rounded-2xl border space-y-4"
                          style={{
                            backgroundColor: greeting.themeColors.background,
                            borderColor: isUnlocked
                              ? greeting.themeColors.primary
                              : greeting.themeColors.border,
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 font-bold text-sm">
                              {isUnlocked ? (
                                <Unlock size={18} style={{ color: greeting.themeColors.primary }} />
                              ) : (
                                <Lock size={18} style={{ color: greeting.themeColors.primary }} />
                              )}
                              <span>{sec.title}</span>
                            </div>
                            <span
                              className="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
                              style={{
                                backgroundColor: `${greeting.themeColors.primary}20`,
                                color: greeting.themeColors.primary,
                              }}
                            >
                              {isUnlocked ? tr('مفتوحة ✓', 'Unlocked ✓') : tr('مقفلة بكلمة سر', 'Locked')}
                            </span>
                          </div>

                          {!isUnlocked ? (
                            <div className="space-y-3">
                              <p className="text-xs opacity-85">{sec.promptText}</p>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  value={secretInputs[sec.id] || ''}
                                  onChange={(e) =>
                                    setSecretInputs((prev) => ({
                                      ...prev,
                                      [sec.id]: e.target.value,
                                    }))
                                  }
                                  placeholder={tr('أدخل كلمة السر هنا...', 'Enter secret password...')}
                                  className="flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                                  style={{
                                    backgroundColor: greeting.themeColors.cardBg,
                                    borderColor: greeting.themeColors.border,
                                    color: greeting.themeColors.textColor,
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUnlockSecret(sec.id, sec.password)}
                                  className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                                  style={{
                                    backgroundColor: greeting.themeColors.primary,
                                    color: '#FFFFFF',
                                  }}
                                >
                                  {tr('فتح الرسالة السرية 🔓', 'Unlock Secret Message 🔓')}
                                </button>
                              </div>

                              {secretErrorId === sec.id && (
                                <p className="text-xs text-rose-500 font-bold">
                                  {tr('كلمة السر غير صحيحة! جرب التلميح أدناه 😊', 'Incorrect password! Check the hint below 😊')}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShownHints((prev) => ({ ...prev, [sec.id]: !prev[sec.id] }))
                                  }
                                  className="text-[11px] underline flex items-center gap-1 cursor-pointer opacity-80"
                                >
                                  <HelpCircle size={13} />
                                  <span>{tr('تلميح لمعرفة كلمة السر 💡', 'Show Password Hint 💡')}</span>
                                </button>
                              </div>

                              {showHint && (
                                <div
                                  className="p-2.5 rounded-xl text-xs border"
                                  style={{
                                    backgroundColor: greeting.themeColors.cardBg,
                                    borderColor: greeting.themeColors.border,
                                  }}
                                >
                                  {tr('التلميح:', 'Hint:')} <strong>{sec.hint}</strong>
                                </div>
                              )}
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-3 pt-2 border-t"
                              style={{ borderColor: greeting.themeColors.border }}
                            >
                              <p className="text-sm sm:text-base leading-relaxed font-semibold">
                                «{formatText(sec.secretBody)}»
                              </p>
                              {sec.mediaUrl && (
                                <img
                                  src={sec.mediaUrl}
                                  alt={sec.title}
                                  className="w-full max-h-60 object-cover rounded-xl"
                                />
                              )}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE TYPE 8: 3D DIGITAL GIFT BOXES (صندوق الهدايا)
              ========================================================= */}
              {currentPage?.type === 'gift_box' && (
                <div
                  className="p-6 sm:p-10 rounded-3xl border space-y-6 shadow-xl"
                  style={{
                    backgroundColor: greeting.themeColors.cardBg,
                    borderColor: greeting.themeColors.border,
                  }}
                >
                  <div className="text-center space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
                      <Gift size={24} style={{ color: greeting.themeColors.primary }} />
                      <span>{currentPage.title || tr('صندوق الهدايا الرقمي 🎁', '3D Digital Gift Boxes 🎁')}</span>
                    </h2>
                    <p className="text-xs sm:text-sm opacity-80">
                      {tr(
                        'اضغط على كل صندوق هدية لفتحه تدريجياً واكتشاف المفاجأة المخبأة بداخله!',
                        'Tap each gift box to unwrap it step-by-step and reveal the surprise inside!'
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {greeting.giftBoxes.map((box) => {
                      const state = giftStates[box.id] || 0; // 0 closed, 1 shaking, 2 opened
                      return (
                        <div
                          key={box.id}
                          className="p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all"
                          style={{
                            backgroundColor: greeting.themeColors.background,
                            borderColor:
                              state === 2
                                ? greeting.themeColors.primary
                                : greeting.themeColors.border,
                          }}
                        >
                          {state < 2 ? (
                            <div className="py-6 text-center space-y-4">
                              <motion.button
                                type="button"
                                animate={
                                  state === 1
                                    ? { rotate: [-10, 10, -10, 10, 0], scale: [1, 1.15, 1] }
                                    : { y: [0, -5, 0] }
                                }
                                transition={{
                                  duration: state === 1 ? 0.5 : 2,
                                  repeat: state === 1 ? 0 : Infinity,
                                }}
                                onClick={() => handleTriggerGiftBox(box.id)}
                                className="mx-auto w-24 h-24 rounded-2xl shadow-lg flex items-center justify-center relative cursor-pointer"
                                style={{
                                  backgroundColor: box.boxColor || greeting.themeColors.primary,
                                }}
                              >
                                {/* Ribbon Vertical & Horizontal */}
                                <div
                                  className="absolute inset-y-0 w-4"
                                  style={{ backgroundColor: box.ribbonColor || '#F3E5AB' }}
                                />
                                <div
                                  className="absolute inset-x-0 h-4"
                                  style={{ backgroundColor: box.ribbonColor || '#F3E5AB' }}
                                />
                                <span className="relative z-10 text-3xl">🎀</span>
                              </motion.button>

                              <div className="space-y-1">
                                <h3 className="text-sm font-bold">{box.label}</h3>
                                <p className="text-[11px] opacity-75">
                                  {state === 1
                                    ? tr('جاري فتح شريط الهدية...', 'Unwrapping ribbon...')
                                    : tr('اضغط على الصندوق لفتحه 🎁', 'Tap the box to unwrap 🎁')}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.92 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-3 text-start"
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: `${greeting.themeColors.primary}20`,
                                    color: greeting.themeColors.primary,
                                  }}
                                >
                                  {box.label}
                                </span>
                                <span className="text-lg">🎉</span>
                              </div>
                              <h4 className="text-base font-bold">{formatText(box.surpriseTitle)}</h4>
                              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                                {formatText(box.surpriseMessage)}
                              </p>

                              {box.voucherCode && (
                                <div
                                  className="p-2.5 rounded-xl border font-mono text-xs font-bold text-center"
                                  style={{
                                    backgroundColor: greeting.themeColors.cardBg,
                                    borderColor: greeting.themeColors.primary,
                                  }}
                                >
                                  {box.voucherCode}
                                </div>
                              )}

                              {box.secondarySurpriseText && (
                                <div
                                  className="p-2.5 rounded-xl text-xs border"
                                  style={{
                                    backgroundColor: greeting.themeColors.cardBg,
                                    borderColor: greeting.themeColors.border,
                                  }}
                                >
                                  ✨ {formatText(box.secondarySurpriseText)}
                                </div>
                              )}

                              {box.externalGiftUrl && (
                                <a
                                  href={box.externalGiftUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold underline"
                                  style={{ color: greeting.themeColors.primary }}
                                >
                                  <ExternalLink size={13} />
                                  <span>{tr('فتح رابط الهدية الخارجية', 'Open External Gift Link')}</span>
                                </a>
                              )}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE TYPE 9: FINAL WISHES & SHARE
              ========================================================= */}
              {currentPage?.type === 'final_wishes' && (
                <div
                  className="p-6 sm:p-10 rounded-3xl border text-center space-y-6 shadow-xl"
                  style={{
                    backgroundColor: greeting.themeColors.cardBg,
                    borderColor: greeting.themeColors.border,
                  }}
                >
                  <div className="text-4xl">🌟🎂💝</div>
                  <h2 className="text-2xl sm:text-4xl font-bold">
                    {formatText(currentPage.title || 'كل عام وأنت بألف خير!')}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed max-w-lg mx-auto opacity-90">
                    «{formatText(greeting.finalCoverQuote)}»
                  </p>

                  <div
                    className="inline-block px-5 py-2.5 rounded-2xl border text-xs font-bold"
                    style={{
                      backgroundColor: greeting.themeColors.background,
                      borderColor: greeting.themeColors.border,
                    }}
                  >
                    {tr('مع كل الحب والتقدير من:', 'With love from:')} {greeting.senderName}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPageIdx(0);
                        setIsOpeningUnlocked(false);
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer"
                      style={{
                        borderColor: greeting.themeColors.border,
                        color: greeting.themeColors.textColor,
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>{tr('إعادة عرض القصة من البداية', 'Replay Story from Start')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      style={{
                        backgroundColor: greeting.themeColors.primary,
                        color: '#FFFFFF',
                      }}
                    >
                      {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
                      <span>
                        {copiedLink
                          ? tr('تم نسخ رابط التهنئة ✓', 'Greeting Link Copied ✓')
                          : tr('نسخ رابط التهنئة للمشاركة', 'Copy Greeting Link')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>{tr('مشاركة عبر واتساب 💬', 'Share via WhatsApp 💬')}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Page Navigation Controls */}
          <div className="pt-6 flex items-center justify-between gap-4 max-w-2xl mx-auto w-full">
            <button
              type="button"
              disabled={currentPageIdx === 0}
              onClick={goToPrevPage}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 disabled:opacity-35 cursor-pointer transition-all"
              style={{
                backgroundColor: greeting.themeColors.cardBg,
                borderColor: greeting.themeColors.border,
                color: greeting.themeColors.textColor,
              }}
            >
              {isRTL ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              <span>{tr('الصفحة السابقة', 'Previous')}</span>
            </button>

            <div className="text-xs font-bold opacity-75 truncate">
              {currentPage?.title}
            </div>

            <button
              type="button"
              disabled={currentPageIdx === enabledPages.length - 1}
              onClick={goToNextPage}
              className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-35 cursor-pointer shadow-md transition-all"
              style={{
                backgroundColor: greeting.themeColors.primary,
                color: '#FFFFFF',
              }}
            >
              <span>{tr('الصفحة التالية', 'Next Page')}</span>
              {isRTL ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
