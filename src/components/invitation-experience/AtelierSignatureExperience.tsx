import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  MessageCircle,
  Copy,
  Check,
  CalendarPlus,
  Navigation,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  Share2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  ScrollText,
  Eye,
  X,
  Play,
  Pause,
  Video,
  Rotate3d,
} from 'lucide-react';
import { InvitationData, RSVPRecord, GuestbookMessage, AtelierThemeVariant, VisualEffectType } from '../../types/invitation';
import { MOHAMMED_NOURA_COVER_BG, MOHAMMED_NOURA_PHOTO, ALI_TABARAK_PHOTO } from '../../data/attachedPhotos';
import { soundEngine } from '../../utils/audio';
import { getGoogleCalendarUrl } from '../../utils/calendar';
import { buildShareableInvitationUrl } from '../../utils/shareLink';
import { get3DCardFlipVariants } from '../engine/motion-mapper';
import {
  formatCountdownNumber,
  getCountdownDigitFontClass,
  getCountdownDigitStyle,
} from '../countdown/CountdownTimer';
import {
  AmbientVisualEffects,
  resolveVisualEffect,
  VISUAL_EFFECT_OPTIONS,
} from './AmbientVisualEffects';

interface AtelierSignatureExperienceProps {
  invitation: InvitationData;
  onSaveRSVP?: (rsvp: Omit<RSVPRecord, 'id' | 'createdAt'>) => void;
  onAddGuestbook?: (message: Omit<GuestbookMessage, 'id' | 'createdAt'>) => void;
  guestbookMessages?: GuestbookMessage[];
  isEmbeddedPreview?: boolean;
  isStandaloneGuest?: boolean;
}

interface BurstParticle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  rot: number;
  symbol: string;
  color: string;
  size: number;
}

interface TapHeart {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const toArabicNumerals = (num: number | string): string =>
  String(num).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)] || d);

// 24 Border rose positions matching attachment 2
const BORDER_ROSE_POSITIONS = [
  [0, 0, 66], [16, 0, 38], [34, 0, 34], [52, 0, 44], [70, 0, 34], [86, 0, 40], [100, 0, 66],
  [0, 100, 66], [16, 100, 40], [34, 100, 34], [52, 100, 44], [70, 100, 36], [86, 100, 38], [100, 100, 66],
  [0, 18, 36], [0, 38, 42], [0, 58, 34], [0, 78, 42],
  [100, 18, 38], [100, 38, 34], [100, 58, 42], [100, 78, 36],
];

interface ThemeConfig {
  id: AtelierThemeVariant;
  nameAr: string;
  isDark: boolean;
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  inkColor: string;
  softColor: string;
  goldPrimary: string;
  goldSecondary: string;
  accentRose: string;
  btnGradient: string;
  btnText: string;
  defaultLayout: 'scenes' | 'scroll';
  openerStyle: 'rosette' | 'ruby_heart' | 'astrolabe' | 'vinyl_orchid' | 'crescent_palace' | 'shanasheel_star';
  frameStyle: 'double_gold_corners' | 'blooming_roses' | 'emerald_stars' | 'velvet_orchids' | 'sapphire_lanterns' | 'abbasid_illuminated';
  particles: string[];
}

const THEME_CONFIGS: Record<AtelierThemeVariant, ThemeConfig> = {
  rosette_polaroid: {
    id: 'rosette_polaroid',
    nameAr: 'روزة الذهب واللؤلؤ',
    isDark: false,
    bgGradient: 'radial-gradient(45% 40% at 20% 18%, #fffefb, transparent 70%), radial-gradient(45% 40% at 82% 78%, #eadfcb, transparent 72%), linear-gradient(160deg, #fcfaf5, #f0e8d9)',
    cardBg: 'rgba(255, 255, 255, 0.72)',
    cardBorder: '#e6dac4',
    inkColor: '#3a3340',
    softColor: '#7d7684',
    goldPrimary: '#a98243',
    goldSecondary: '#d6b878',
    accentRose: '#c9a3a0',
    btnGradient: 'linear-gradient(135deg, #b8934f, #a07a3a)',
    btnText: '#ffffff',
    defaultLayout: 'scenes',
    openerStyle: 'rosette',
    frameStyle: 'double_gold_corners',
    particles: ['✦', '❀', '✧', '♡'],
  },
  botanical_clock: {
    id: 'botanical_clock',
    nameAr: 'إكليل الورد والساعة الملكية',
    isDark: false,
    bgGradient: 'radial-gradient(circle at 25% 15%, #fffdf8, transparent 55%), linear-gradient(160deg, #f8f2e8, #efe4d0)',
    cardBg: 'rgba(255, 255, 255, 0.88)',
    cardBorder: '#e6d9c0',
    inkColor: '#4a3b2c',
    softColor: '#7d6852',
    goldPrimary: '#9a7a3e',
    goldSecondary: '#c4aa72',
    accentRose: '#d81f3d',
    btnGradient: 'linear-gradient(135deg, #d4b074, #9a7a3e)',
    btnText: '#ffffff',
    defaultLayout: 'scroll',
    openerStyle: 'ruby_heart',
    frameStyle: 'blooming_roses',
    particles: ['❀', '♥', '✦', '✧'],
  },
  emerald_compass: {
    id: 'emerald_compass',
    nameAr: 'أسطرلاب الزمرد والبوصلة الملكية',
    isDark: true,
    bgGradient: 'radial-gradient(circle at 30% 20%, #134e3a, transparent 60%), radial-gradient(circle at 80% 80%, #0d3b2e, transparent 65%), linear-gradient(160deg, #061a14, #09261e)',
    cardBg: 'rgba(13, 48, 37, 0.75)',
    cardBorder: 'rgba(229, 193, 88, 0.35)',
    inkColor: '#f8f5ec',
    softColor: '#b5cbbd',
    goldPrimary: '#e5c158',
    goldSecondary: '#f3d886',
    accentRose: '#34d399',
    btnGradient: 'linear-gradient(135deg, #e5c158, #b38728)',
    btnText: '#061a14',
    defaultLayout: 'scenes',
    openerStyle: 'astrolabe',
    frameStyle: 'emerald_stars',
    particles: ['✦', '✧', '❖', '⋆'],
  },
  velvet_orchid: {
    id: 'velvet_orchid',
    nameAr: 'أوركيدا المخمل والأسطوانة الذهبية',
    isDark: true,
    bgGradient: 'radial-gradient(circle at 25% 20%, #521226, transparent 60%), radial-gradient(circle at 75% 80%, #3d0c1c, transparent 65%), linear-gradient(160deg, #1f050d, #2d0a16)',
    cardBg: 'rgba(62, 14, 30, 0.72)',
    cardBorder: 'rgba(234, 182, 118, 0.35)',
    inkColor: '#fdf6f0',
    softColor: '#dcb8c2',
    goldPrimary: '#eab676',
    goldSecondary: '#f5cfa0',
    accentRose: '#fb7185',
    btnGradient: 'linear-gradient(135deg, #eab676, #c28442)',
    btnText: '#1f050d',
    defaultLayout: 'scenes',
    openerStyle: 'vinyl_orchid',
    frameStyle: 'velvet_orchids',
    particles: ['♪', '❀', '♥', '✦'],
  },
  sapphire_mirage: {
    id: 'sapphire_mirage',
    nameAr: 'قصر المرايا والهلال الماسي',
    isDark: true,
    bgGradient: 'radial-gradient(circle at 50% 15%, #1d2d50, transparent 60%), radial-gradient(circle at 80% 85%, #133b5c, transparent 65%), linear-gradient(160deg, #070c1c, #0f1b38)',
    cardBg: 'rgba(20, 35, 68, 0.75)',
    cardBorder: 'rgba(243, 208, 120, 0.35)',
    inkColor: '#f8fafc',
    softColor: '#94a3b8',
    goldPrimary: '#f3d078',
    goldSecondary: '#fde68a',
    accentRose: '#60a5fa',
    btnGradient: 'linear-gradient(135deg, #f3d078, #c29838)',
    btnText: '#070c1c',
    defaultLayout: 'scroll',
    openerStyle: 'crescent_palace',
    frameStyle: 'sapphire_lanterns',
    particles: ['✧', '✦', '☾', '⋆'],
  },
  abbasid_diwan: {
    id: 'abbasid_diwan',
    nameAr: 'الديوان العباسي واللؤلؤ المذهب',
    isDark: false,
    bgGradient: 'radial-gradient(circle at 20% 20%, #fffdf9, transparent 60%), radial-gradient(circle at 80% 80%, #e8d8b9, transparent 65%), linear-gradient(160deg, #f7f1e3, #ebe0c8)',
    cardBg: 'rgba(255, 252, 245, 0.85)',
    cardBorder: '#d5bd8a',
    inkColor: '#1d3557',
    softColor: '#5c6b73',
    goldPrimary: '#b0822c',
    goldSecondary: '#d4af37',
    accentRose: '#9e2a2b',
    btnGradient: 'linear-gradient(135deg, #c59b27, #9a7418)',
    btnText: '#ffffff',
    defaultLayout: 'scenes',
    openerStyle: 'shanasheel_star',
    frameStyle: 'abbasid_illuminated',
    particles: ['❖', '✦', '❀', '✧'],
  },
};

export const AtelierSignatureExperience: React.FC<AtelierSignatureExperienceProps> = ({
  invitation,
  onSaveRSVP,
  isEmbeddedPreview = false,
  isStandaloneGuest = false,
}) => {
  // Determine variant from invitation or templateId
  const resolveVariant = (): AtelierThemeVariant => {
    if (invitation.atelierTheme && THEME_CONFIGS[invitation.atelierTheme]) {
      return invitation.atelierTheme;
    }
    if (invitation.templateId.includes('botanical') || invitation.templateId.includes('ali-tabarak')) {
      return 'botanical_clock';
    }
    if (invitation.templateId.includes('emerald') || invitation.templateId.includes('compass')) {
      return 'emerald_compass';
    }
    if (invitation.templateId.includes('orchid') || invitation.templateId.includes('velvet')) {
      return 'velvet_orchid';
    }
    if (invitation.templateId.includes('sapphire') || invitation.templateId.includes('mirage')) {
      return 'sapphire_mirage';
    }
    if (invitation.templateId.includes('abbasid') || invitation.templateId.includes('diwan')) {
      return 'abbasid_diwan';
    }
    return 'rosette_polaroid';
  };

  const variant = resolveVariant();
  const theme = THEME_CONFIGS[variant];

  const [isOpened, setIsOpened] = useState(false);
  const [currentScene, setCurrentScene] = useState(0); // 0=cover, 1=hero, 2=countdown/dial, 3=details/route, 4=rsvp
  const [direction, setDirection] = useState(1);
  const [enable3DFlip, setEnable3DFlip] = useState(true);
  const [visualEffectOverride, setVisualEffectOverride] = useState<VisualEffectType | null>(null);
  const [layoutMode, setLayoutMode] = useState<'scenes' | 'scroll'>(theme.defaultLayout);
  const [activeDetailTab, setActiveDetailTab] = useState<'time' | 'route' | 'notes'>('time');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [dialTimeHighlighted, setDialTimeHighlighted] = useState(false);
  const [bloomingRoses, setBloomingRoses] = useState<Record<number, boolean>>({});
  const [showOriginalHtmlModal, setShowOriginalHtmlModal] = useState(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);

  useEffect(() => {
    setVisualEffectOverride(null);
  }, [invitation.visualEffect, invitation.category]);

  const activeVisualEffect = resolveVisualEffect(
    invitation.category,
    visualEffectOverride ?? invitation.visualEffect
  );

  const cycleVisualEffect = () => {
    const order: Exclude<VisualEffectType, 'auto'>[] = [
      'rose_petals',
      'lantern_glow',
      'golden_sparkles',
      'gallery_spotlight',
      'confetti_stars',
      'none',
    ];
    const currentIndex = order.indexOf(activeVisualEffect);
    const nextEffect = order[(currentIndex + 1) % order.length];
    setVisualEffectOverride(nextEffect);
  };

  const currentEffectMeta =
    VISUAL_EFFECT_OPTIONS.find((o) => o.id === activeVisualEffect) || VISUAL_EFFECT_OPTIONS[0];

  // Background Video State & Ref
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isBgVideoPlaying, setIsBgVideoPlaying] = useState<boolean>(
    invitation.backgroundVideoPlaying !== false
  );
  const [isBgVideoMuted, setIsBgVideoMuted] = useState<boolean>(
    invitation.backgroundVideoMuted ?? true
  );

  useEffect(() => {
    if (invitation.backgroundVideoPlaying !== undefined) {
      setIsBgVideoPlaying(invitation.backgroundVideoPlaying);
    }
  }, [invitation.backgroundVideoPlaying]);

  useEffect(() => {
    if (invitation.backgroundVideoMuted !== undefined) {
      setIsBgVideoMuted(invitation.backgroundVideoMuted);
    }
  }, [invitation.backgroundVideoMuted]);

  useEffect(() => {
    const vid = bgVideoRef.current;
    if (!vid) return;
    vid.muted = isBgVideoMuted;
    const vol =
      typeof invitation.backgroundVideoVolume === 'number'
        ? invitation.backgroundVideoVolume
        : 60;
    vid.volume = Math.max(0, Math.min(1, vol / 100));
    if (isBgVideoPlaying) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [
    invitation.backgroundVideoUrl,
    isBgVideoPlaying,
    isBgVideoMuted,
    invitation.backgroundVideoVolume,
  ]);

  const navigateAtelierScene = (targetIdx: number) => {
    setDirection(targetIdx >= currentScene ? 1 : -1);
    setCurrentScene(targetIdx);
  };

  // RSVP & Phone Card state
  const [guestName, setGuestName] = useState('');
  const [rsvpFeedback, setRsvpFeedback] = useState<string>('');
  const [showPhoneCard, setShowPhoneCard] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Particle bursts & tap hearts
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  const [tapHearts, setTapHearts] = useState<TapHeart[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Countdown state
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setLayoutMode(theme.defaultLayout);
  }, [variant, theme.defaultLayout]);

  useEffect(() => {
    const computeTime = () => {
      const targetStr = `${invitation.eventDate || '2026-10-30'}T15:00:00`;
      const targetDate = new Date(targetStr);
      const diff = Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000));
      setCountdown({
        days: Math.floor(diff / 86400),
        hours: Math.floor((diff % 86400) / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
      });
    };
    computeTime();
    const timer = setInterval(computeTime, 1000);
    return () => clearInterval(timer);
  }, [invitation.eventDate]);

  useEffect(() => {
    return () => {
      soundEngine.stopAmbientMusic();
    };
  }, []);

  // Trigger burst of particles around a coordinate
  const triggerBurst = (clientX?: number, clientY?: number, count = 16) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const originX = clientX && rect ? clientX - rect.left : (rect?.width || 400) / 2;
    const originY = clientY && rect ? clientY - rect.top : (rect?.height || 600) / 2;

    const newParticles: BurstParticle[] = Array.from({ length: count }).map((_, idx) => {
      const angle = (Math.PI * 2 * idx) / count + (Math.random() * 0.5 - 0.25);
      const dist = 55 + Math.random() * 95;
      return {
        id: Date.now() + Math.random() + idx,
        x: originX,
        y: originY,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist - 30,
        rot: Math.random() * 240 - 120,
        symbol: theme.particles[idx % theme.particles.length],
        color: idx % 2 === 0 ? theme.goldPrimary : theme.accentRose,
        size: 13 + Math.random() * 12,
      };
    });

    setBursts((prev) => [...prev.slice(-30), ...newParticles]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1250);
  };

  // Container pointer down for floating tap heart
  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea')) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const heart: TapHeart = {
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      symbol: variant === 'botanical_clock' || variant === 'rosette_polaroid' ? '♥' : '✦',
    };
    setTapHearts((prev) => [...prev.slice(-10), heart]);
    setTimeout(() => {
      setTapHearts((prev) => prev.filter((h) => h.id !== heart.id));
    }, 1200);
  };

  // Open invitation handler
  const handleOpenInvitation = (e: React.MouseEvent) => {
    triggerBurst(e.clientX, e.clientY, 28);
    setIsOpened(true);
    setCurrentScene(1);
    soundEngine.playChime(587.33, 1.1);
    if (invitation.autoPlayMusic !== false && invitation.musicTrack !== 'none' && !isMusicPlaying) {
      soundEngine.startAmbientMusic(
        invitation.musicTrack || 'romantic_piano',
        invitation.customAudioUrl
      );
      setIsMusicPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      soundEngine.stopAmbientMusic();
      setIsMusicPlaying(false);
    } else {
      soundEngine.startAmbientMusic(
        invitation.musicTrack || 'romantic_piano',
        invitation.customAudioUrl
      );
      setIsMusicPlaying(true);
    }
  };

  const handleRoseClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBloomingRoses((prev) => ({ ...prev, [index]: true }));
    triggerBurst(e.clientX, e.clientY, 14);
    soundEngine.playChime(783.99, 0.5);
    setTimeout(() => {
      setBloomingRoses((prev) => ({ ...prev, [index]: false }));
    }, 900);
  };

  // Resolved Couple Data
  const groomName = invitation.groomName || 'اسم العريس';
  const brideName = invitation.brideName || 'اسم العروس';
  const groomInitial = groomName.trim().charAt(0) || 'ع';
  const brideInitial = brideName.trim().charAt(0) || 'ع';

  // Resolved Images
  const portraitImg =
    invitation.couplePortraitImage ||
    invitation.coverImage ||
    (variant === 'botanical_clock' ? ALI_TABARAK_PHOTO : MOHAMMED_NOURA_PHOTO);
  const coverBackdrop = invitation.coverImage || MOHAMMED_NOURA_COVER_BG;

  // Resolved Date & Time Info
  const parsedDate = new Date(`${invitation.eventDate || '2026-10-16'}T14:00:00`);
  const formattedFullDate = !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString('ar-IQ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'الجمعة، ١٦ تشرين الأول ٢٠٢٦';
  const weekdayName = !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString('ar-IQ', { weekday: 'long' })
    : 'الجمعة';
  const dayNumberArabic = !isNaN(parsedDate.getTime())
    ? toArabicNumerals(parsedDate.getDate())
    : '٣٠';
  const monthYearArabic = !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString('ar-IQ', { month: 'long', year: 'numeric' })
    : 'تشرين الأول ٢٠٢٦';

  // Parse hour (1..12) for the clock dial
  const extractEventHour = (): number => {
    const match = (invitation.eventTime || '').match(/(\d{1,2})/);
    if (match) {
      const h = Number(match[1]) % 12;
      return h === 0 ? 12 : h;
    }
    return variant === 'botanical_clock' ? 3 : 2;
  };
  const highlightedHour = extractEventHour();

  // Resolved Route & Contact
  const startPointName =
    invitation.startPointName || 'نقطة انطلاق الموكب الافتراضية';
  const startPointUrl =
    invitation.startPointUrl || 'https://waze.com/ul';
  const destinationName =
    invitation.venueName || 'قاعة الاحتفالات الملكية الكبرى';
  const destinationUrl =
    invitation.wazeUrl || invitation.googleMapsUrl || 'https://maps.google.com';
  const contactPhoneDisplay =
    invitation.contactPhone || '+964 770 000 0000';
  const cleanPhoneDigits = contactPhoneDisplay.replace(/[^0-9]/g, '') || '9647700000000';
  const ceremonySchedule =
    invitation.ceremonyScheduleText ||
    'يبدأ الحفل باستقبال الضيوف، ثم مراسم الاحتفال وتبادل التهاني.';

  // RSVP Actions
  const handleRsvpDecision = (attending: boolean, e: React.MouseEvent<HTMLButtonElement>) => {
    const trimmed = guestName.trim();
    if (!trimmed && variant !== 'botanical_clock') {
      setRsvpFeedback('الرجاء كتابة اسمك الكريم أولاً ✍️');
      return;
    }
    const finalName = trimmed || 'ضيف كريم';

    if (onSaveRSVP) {
      onSaveRSVP({
        invitationId: invitation.id,
        guestName: finalName,
        phone: '',
        status: attending ? 'attending' : 'declined',
        companionsCount: attending ? 1 : 0,
      });
    }

    if (attending) {
      triggerBurst(e.clientX, e.clientY, 24);
      soundEngine.playChime(659.25, 1.2);
      setRsvpFeedback(`شكراً ${finalName}، ننتظركم بفارغ الشوق والسرور ♥`);
      setShowPhoneCard(true);
    } else {
      setShowPhoneCard(false);
      setRsvpFeedback(`نقدّر ذوقكم ولطفكم يا ${finalName}، وتبقون في القلب ♥`);
    }
  };

  const handleCopyPhone = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(contactPhoneDisplay).catch(() => {});
    setCopiedPhone(true);
    triggerBurst(e.clientX, e.clientY, 14);
    setTimeout(() => setCopiedPhone(false), 1800);
  };

  // Render Frame Decoration
  const renderBorderFrame = () => {
    if (theme.frameStyle === 'blooming_roses' || theme.frameStyle === 'velvet_orchids') {
      const petalFill1 = theme.frameStyle === 'velvet_orchids' ? '#4a1225' : '#faf4e8';
      const petalFill2 = theme.frameStyle === 'velvet_orchids' ? '#6b1d36' : '#f2e8d4';
      const petalStroke = theme.goldSecondary;
      const leafFill = theme.frameStyle === 'velvet_orchids' ? '#362229' : '#e3dfc6';

      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {BORDER_ROSE_POSITIONS.map(([leftPct, topPct, size], idx) => {
            const isBlooming = !!bloomingRoses[idx];
            const rot = (idx * 47) % 360;
            return (
              <div
                key={idx}
                onClick={(e) => handleRoseClick(idx, e)}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  marginLeft: `-${size / 2}px`,
                  marginTop: `-${size / 2}px`,
                }}
                className="absolute pointer-events-auto cursor-pointer transition-transform duration-500 hover:scale-125"
                title="المس الوردة لتتفتح"
              >
                {/* Flanking Leaves */}
                <svg
                  viewBox="0 0 60 30"
                  style={{
                    width: `${size * 0.75}px`,
                    height: `${size * 0.38}px`,
                    transform: `rotate(${rot + 45}deg) translateX(${size * 0.4}px)`,
                  }}
                  className="absolute inset-0 m-auto opacity-80"
                >
                  <path
                    d="M2 15C14 0 40 0 58 15 40 30 14 30 2 15Z"
                    fill={leafFill}
                    stroke={petalStroke}
                    strokeWidth="1.2"
                  />
                  <path d="M2 15H58" stroke={petalStroke} strokeWidth="0.8" />
                </svg>

                {/* Blooming Rose SVG */}
                <svg
                  viewBox="0 0 100 100"
                  className={`w-full h-full drop-shadow-md transition-transform duration-700 ${
                    isBlooming ? 'scale-150 rotate-90' : 'animate-pulse'
                  }`}
                  style={{ animationDuration: `${4 + (idx % 4)}s` }}
                >
                  <g fill={petalFill1} stroke={petalStroke} strokeWidth="1.4">
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <ellipse
                        key={deg}
                        cx="50"
                        cy="26"
                        rx="19"
                        ry="25"
                        transform={`rotate(${deg} 50 50)`}
                      />
                    ))}
                  </g>
                  <g fill={petalFill2} stroke={petalStroke} strokeWidth="1.2">
                    {[36, 108, 180, 252, 324].map((deg) => (
                      <ellipse
                        key={deg}
                        cx="50"
                        cy="35"
                        rx="14"
                        ry="17"
                        transform={`rotate(${deg} 50 50)`}
                      />
                    ))}
                  </g>
                  <circle cx="50" cy="50" r="15" fill={petalFill2} stroke={petalStroke} />
                  <path
                    d="M50 50m-5 0a5 5 0 1 1 5 5a9 9 0 1 1 -9 -9a13 13 0 1 1 13 13"
                    fill="none"
                    stroke={theme.goldPrimary}
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      );
    }

    // Default double golden frame with corner floral/arabesque ornaments
    const cornerSymbol =
      theme.frameStyle === 'emerald_stars'
        ? '❖'
        : theme.frameStyle === 'sapphire_lanterns'
        ? '✧'
        : theme.frameStyle === 'abbasid_illuminated'
        ? '۞'
        : '❦';

    return (
      <div
        className="absolute inset-3 rounded-2xl pointer-events-none z-10"
        style={{ border: `1px solid ${theme.goldSecondary}` }}
      >
        <div
          className="absolute inset-1.5 rounded-xl"
          style={{ border: `1px solid ${theme.cardBorder}` }}
        />
        {[
          'top-[-13px] right-3.5',
          'top-[-13px] left-3.5',
          'bottom-[-13px] right-3.5',
          'bottom-[-13px] left-3.5',
        ].map((pos, idx) => (
          <span
            key={idx}
            style={{ color: theme.goldPrimary }}
            className={`absolute ${pos} px-1.5 text-lg leading-none select-none animate-pulse`}
          >
            {cornerSymbol}
          </span>
        ))}
      </div>
    );
  };

  // Render Cover Seal / Heart / Astrolabe Opener (Scene 0)
  const renderOpenerCover = () => {
    return (
      <div className="relative w-full min-h-[560px] flex flex-col items-center justify-center text-center px-6 py-12 overflow-hidden">
        {/* Background cover photo for rosette_polaroid */}
        {variant === 'rosette_polaroid' && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 transition-transform duration-1000"
              style={{ backgroundImage: `url(${coverBackdrop})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(247,242,232,0.55), rgba(247,242,232,0.95) 72%)',
              }}
            />
          </>
        )}

        <div className="relative z-20 flex flex-col items-center max-w-md mx-auto">
          {/* Top Lead Caption for Ruby Heart / Palace styles */}
          {theme.openerStyle !== 'rosette' && (
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: theme.goldPrimary }}
              className="text-xl sm:text-2xl font-bold mb-6 tracking-wide font-amiri"
            >
              {invitation.welcomeQuote || 'بسم الله تبدأ الحكاية'}
            </motion.p>
          )}

          {/* Interactive Seal Button */}
          <motion.button
            type="button"
            onClick={handleOpenInvitation}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94, rotate: -4 }}
            className="relative group cursor-pointer focus:outline-none"
            aria-label="افتح الدعوة"
          >
            {/* 1. ROSETTE GOLD SEAL (Attachment 1: Mohammed & Noura) */}
            {theme.openerStyle === 'rosette' && (
              <div className="w-40 h-40 sm:w-44 sm:h-44 relative flex items-center justify-center drop-shadow-[0_14px_24px_rgba(140,105,50,0.4)]">
                <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                  <defs>
                    <radialGradient id="rosetteOuter" cx="35%" cy="28%" r="80%">
                      <stop offset="0%" stopColor="#f6e6bb" />
                      <stop offset="55%" stopColor="#cfa95e" />
                      <stop offset="100%" stopColor="#8f6b2e" />
                    </radialGradient>
                    <radialGradient id="rosetteInner" cx="38%" cy="30%" r="85%">
                      <stop offset="0%" stopColor="#e9cf93" />
                      <stop offset="60%" stopColor="#b98f46" />
                      <stop offset="100%" stopColor="#85602a" />
                    </radialGradient>
                  </defs>
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="#d6b878"
                    strokeWidth="1.4"
                    strokeDasharray="2 7"
                    strokeLinecap="round"
                    className=" origin-center animate-[spin_28s_linear_infinite_reverse]"
                  />
                  <g
                    fill="url(#rosetteOuter)"
                    stroke="#8f6b2e"
                    strokeOpacity="0.35"
                    strokeWidth="0.8"
                    className="origin-center animate-[spin_40s_linear_infinite]"
                  >
                    {Array.from({ length: 16 }).map((_, i) => (
                      <ellipse
                        key={i}
                        cx="100"
                        cy="30"
                        rx="15"
                        ry="22"
                        transform={`rotate(${i * 22.5} 100 100)`}
                      />
                    ))}
                  </g>
                  <circle cx="100" cy="100" r="68" fill="#8a6528" opacity="0.55" />
                  <circle cx="100" cy="100" r="64" fill="url(#rosetteInner)" />
                  <circle
                    cx="100"
                    cy="100"
                    r="57"
                    fill="none"
                    stroke="#fff6dc"
                    strokeOpacity="0.75"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="52"
                    fill="none"
                    stroke="#fff6dc"
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    strokeDasharray="1.5 4.5"
                  />
                  <text
                    x="130"
                    y="115"
                    textAnchor="middle"
                    fontFamily="Amiri, serif"
                    fontSize="52"
                    fontWeight="bold"
                    fill="#fffaf0"
                  >
                    {groomInitial}
                  </text>
                  <text
                    x="100"
                    y="108"
                    textAnchor="middle"
                    fontFamily="Amiri, serif"
                    fontSize="28"
                    fill="#fff0c8"
                  >
                    &amp;
                  </text>
                  <text
                    x="70"
                    y="115"
                    textAnchor="middle"
                    fontFamily="Amiri, serif"
                    fontSize="52"
                    fontWeight="bold"
                    fill="#fffaf0"
                  >
                    {brideInitial}
                  </text>
                  <path
                    d="M88 138q12 9 24 0"
                    fill="none"
                    stroke="#fff6dc"
                    strokeOpacity="0.8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}

            {/* 2. BEATING RUBY HEART (Attachment 2: Ali & Tabarak) */}
            {theme.openerStyle === 'ruby_heart' && (
              <motion.div
                animate={{ scale: [1, 1.1, 1, 1.07, 1] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
                className="w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center drop-shadow-[0_14px_20px_rgba(170,20,50,0.42)]"
              >
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <defs>
                    <linearGradient id="rubyHeartGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff6b7d" />
                      <stop offset="50%" stopColor="#d81f3d" />
                      <stop offset="100%" stopColor="#8f0f26" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#rubyHeartGrad)"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                  <text
                    x="12"
                    y="13.5"
                    textAnchor="middle"
                    fontFamily="Amiri, serif"
                    fontWeight="bold"
                    fontSize="6.2"
                    fill="#fff5e4"
                  >
                    {groomInitial} {brideInitial}
                  </text>
                </svg>
              </motion.div>
            )}

            {/* 3. CELESTIAL ASTROLABE & COMPASS (Emerald Compass) */}
            {theme.openerStyle === 'astrolabe' && (
              <div className="w-44 h-44 sm:w-48 sm:h-48 relative flex items-center justify-center drop-shadow-[0_0_30px_rgba(229,193,88,0.4)]">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <radialGradient id="emeraldCore" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#175943" />
                      <stop offset="75%" stopColor="#092b20" />
                      <stop offset="100%" stopColor="#04140f" />
                    </radialGradient>
                  </defs>
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="#e5c158"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    className="origin-center animate-[spin_35s_linear_infinite]"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5c158"
                    strokeOpacity="0.6"
                    strokeWidth="1"
                  />
                  <g
                    stroke="#e5c158"
                    strokeWidth="1.4"
                    fill="rgba(229,193,88,0.12)"
                    className="origin-center animate-[spin_24s_linear_infinite_reverse]"
                  >
                    {[0, 45, 90, 135].map((deg) => (
                      <rect
                        key={deg}
                        x="46"
                        y="46"
                        width="108"
                        height="108"
                        rx="8"
                        transform={`rotate(${deg} 100 100)`}
                      />
                    ))}
                  </g>
                  <circle cx="100" cy="100" r="56" fill="url(#emeraldCore)" stroke="#f3d886" strokeWidth="2.2" />
                  <text
                    x="100"
                    y="112"
                    textAnchor="middle"
                    fontFamily="Amiri, serif"
                    fontSize="38"
                    fontWeight="bold"
                    fill="#f3d886"
                  >
                    {groomInitial} ❖ {brideInitial}
                  </text>
                </svg>
              </div>
            )}

            {/* 4. VINYL ORCHID GRAMOPHONE DISC (Velvet Orchid) */}
            {theme.openerStyle === 'vinyl_orchid' && (
              <div className="w-44 h-44 sm:w-48 sm:h-48 relative flex items-center justify-center drop-shadow-[0_12px_28px_rgba(234,182,118,0.38)]">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="90" fill="#18060c" stroke="#eab676" strokeWidth="2.5" />
                  {[78, 68, 58].map((r) => (
                    <circle
                      key={r}
                      cx="100"
                      cy="100"
                      r={r}
                      fill="none"
                      stroke="#eab676"
                      strokeOpacity="0.28"
                      strokeWidth="1"
                      strokeDasharray="12 6"
                      className="origin-center animate-[spin_18s_linear_infinite]"
                    />
                  ))}
                  <circle cx="100" cy="100" r="44" fill="#6b152f" stroke="#f5cfa0" strokeWidth="2" />
                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    fontFamily="Amiri, serif"
                    fontSize="32"
                    fontWeight="bold"
                    fill="#fff5eb"
                  >
                    {groomInitial} ♪ {brideInitial}
                  </text>
                </svg>
              </div>
            )}

            {/* 5. CRESCENT PALACE MIRAGE (Sapphire Mirage) */}
            {theme.openerStyle === 'crescent_palace' && (
              <div className="w-44 h-44 sm:w-48 sm:h-48 relative flex items-center justify-center drop-shadow-[0_0_28px_rgba(243,208,120,0.45)]">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="rgba(22,36,71,0.85)"
                    stroke="#f3d078"
                    strokeWidth="2"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="78"
                    fill="none"
                    stroke="#fde68a"
                    strokeWidth="1"
                    strokeDasharray="3 6"
                    className="origin-center animate-[spin_30s_linear_infinite]"
                  />
                  <path
                    d="M115 48 A52 52 0 1 0 115 152 A42 42 0 1 1 115 48 Z"
                    fill="#f3d078"
                    opacity="0.9"
                  />
                  <text
                    x="92"
                    y="110"
                    textAnchor="middle"
                    fontFamily="Amiri, serif"
                    fontSize="34"
                    fontWeight="bold"
                    fill="#ffffff"
                  >
                    {groomInitial} ✧ {brideInitial}
                  </text>
                </svg>
              </div>
            )}

            {/* 6. SHANASHEEL STAR MEDALLION (Abbasid Diwan) */}
            {theme.openerStyle === 'shanasheel_star' && (
              <div className="w-44 h-44 sm:w-48 sm:h-48 relative flex items-center justify-center drop-shadow-[0_12px_24px_rgba(176,130,44,0.35)]">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <g
                    fill="#1d3557"
                    stroke="#d4af37"
                    strokeWidth="2.2"
                    className="origin-center animate-[spin_45s_linear_infinite]"
                  >
                    <rect x="42" y="42" width="116" height="116" rx="6" />
                    <rect
                      x="42"
                      y="42"
                      width="116"
                      height="116"
                      rx="6"
                      transform="rotate(45 100 100)"
                    />
                  </g>
                  <circle cx="100" cy="100" r="52" fill="#b0822c" stroke="#fffdf7" strokeWidth="2" />
                  <text
                    x="100"
                    y="112"
                    textAnchor="middle"
                    fontFamily="Amiri, serif"
                    fontSize="36"
                    fontWeight="bold"
                    fill="#fffdf7"
                  >
                    {groomInitial} و {brideInitial}
                  </text>
                </svg>
              </div>
            )}
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ color: theme.goldPrimary }}
            className="text-2xl sm:text-3xl font-bold mt-6 mb-1 font-amiri"
          >
            {invitation.title || 'دعوة خاصة'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{ color: theme.softColor }}
            className="text-sm font-medium mt-1"
          >
            {theme.openerStyle === 'ruby_heart'
              ? 'المس القلب لفتح الدعوة ♥'
              : 'المس الختم الملكي لفتح الدعوة ✦'}
          </motion.p>
        </div>
      </div>
    );
  };

  // SCENE 1: Couple Proclamation & Polaroid / Ring Portrait
  const renderScene1Proclamation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center px-6 py-8 max-w-lg mx-auto"
    >
      {/* Quranic / Welcome Verse */}
      {invitation.welcomeQuote && (
        <p
          style={{ color: theme.goldPrimary }}
          className="text-lg sm:text-xl font-amiri mb-2 leading-relaxed"
        >
          {invitation.welcomeQuote}
        </p>
      )}

      {/* Ornamental Star Divider */}
      <div className="flex items-center gap-3 w-44 my-2">
        <div
          className="flex-1 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.goldPrimary})` }}
        />
        <span style={{ color: theme.goldPrimary }} className="text-sm">
          ✦
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: `linear-gradient(270deg, transparent, ${theme.goldPrimary})` }}
        />
      </div>

      {/* Lead Text */}
      <p style={{ color: theme.softColor }} className="text-sm sm:text-base mt-1 mb-2 leading-relaxed">
        {invitation.invitationBody || 'يسرّنا دعوتكم لحضور حفل خطوبة'}
      </p>

      {/* Couple Names in Shimmering Calligraphy */}
      <h1
        style={{
          backgroundImage: `linear-gradient(120deg, ${theme.goldPrimary} 15%, ${theme.goldSecondary} 50%, ${theme.goldPrimary} 85%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        className="text-4xl sm:text-6xl font-bold font-amiri py-2 leading-tight select-none"
      >
        {groomName} <span className="text-2xl sm:text-4xl mx-1">&amp;</span> {brideName}
      </h1>

      {/* Interactive Floating Diamond Solitaire Ring (from Attachment 2) */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          triggerBurst(e.clientX, e.clientY, 22);
          soundEngine.playChime(880, 0.7);
        }}
        className="my-2 cursor-pointer"
        title="المس خاتم الخطوبة للاحتفال"
      >
        <svg viewBox="0 0 120 120" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto drop-shadow-md">
          <defs>
            <linearGradient id="ringBand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f2dca0" />
              <stop offset="50%" stopColor="#b8975a" />
              <stop offset="100%" stopColor="#8a6a32" />
            </linearGradient>
            <linearGradient id="diamondGem" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#bfe3f5" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="78" r="28" fill="none" stroke="url(#ringBand)" strokeWidth="6.5" />
          <path d="M52 50h16l-3 8H55z" fill="url(#ringBand)" />
          <polygon
            points="46,30 74,30 82,38 60,58 38,38"
            fill="url(#diamondGem)"
            stroke={theme.goldPrimary}
            strokeWidth="1.5"
          />
          <path
            d="M38 38h44M46 30l14 28 14-28M60 30v28"
            fill="none"
            stroke={theme.goldPrimary}
            strokeWidth="0.8"
            opacity="0.7"
          />
          <path
            d="M92 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
            fill={theme.goldPrimary}
            className="animate-ping"
            style={{ animationDuration: '2.5s' }}
          />
        </svg>
      </motion.div>

      {/* Polaroid / Framed Couple Portrait */}
      <motion.div
        whileHover={{ y: -4, rotate: 0.5 }}
        whileTap={{ scale: 0.97, rotate: -1 }}
        onClick={(e) => triggerBurst(e.clientX, e.clientY, 24)}
        style={{
          background: theme.isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
          borderColor: theme.cardBorder,
        }}
        className="mt-2 mb-4 p-2.5 pb-4 rounded-2xl border shadow-xl max-w-[260px] sm:max-w-[280px] mx-auto cursor-pointer transition-all"
        title="المس الصورة لنثر الورود"
      >
        <img
          src={portraitImg}
          alt={`${groomName} & ${brideName}`}
          referrerPolicy="no-referrer"
          className="w-full max-h-[270px] object-cover rounded-xl"
        />
        <span
          style={{ color: theme.goldPrimary }}
          className="block mt-2.5 font-amiri text-lg font-bold"
        >
          {groomName} &amp; {brideName}
        </span>
      </motion.div>

      {/* Full Formatted Date */}
      <div
        style={{ color: theme.softColor }}
        className="text-sm sm:text-base font-medium tracking-wide"
      >
        {formattedFullDate}
      </div>
    </motion.div>
  );

  // SCENE 2: Interactive Clock-Dial Date Wheel + 2x2 Frosted Glass Countdown
  const renderScene2ClockAndCountdown = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center px-6 py-8 max-w-lg mx-auto"
    >
      <h2 style={{ color: theme.goldPrimary }} className="text-2xl sm:text-3xl font-bold font-amiri mb-4">
        {invitation.countdownTitle || 'موعد الفرحة والعد التنازلي'}
      </h2>

      {/* Interactive 12-Hour Arabic Clock Dial (From Attachment 2) */}
      <div
        onClick={(e) => {
          triggerBurst(e.clientX, e.clientY, 26);
          setDialTimeHighlighted(true);
          soundEngine.playChime(740, 0.8);
        }}
        className="relative w-60 h-60 sm:w-64 sm:h-64 my-2 cursor-pointer select-none mx-auto"
        title="المس الساعة لإبراز موعد الحفل"
      >
        {/* Rotating Dashed Outer Ring */}
        <div
          style={{ borderColor: theme.goldPrimary }}
          className="absolute inset-0 rounded-full border-2 border-dashed animate-[spin_40s_linear_infinite]"
        />

        {/* Inner Dial Circle */}
        <div
          style={{
            background: theme.isDark
              ? 'radial-gradient(circle, rgba(255,255,255,0.12), rgba(0,0,0,0.4))'
              : 'radial-gradient(circle, #ffffff, #f6ecda)',
            borderColor: theme.cardBorder,
          }}
          className="absolute inset-8 rounded-full border shadow-xl"
        />

        {/* 12 Arabic Clock Numbers around perimeter */}
        {Array.from({ length: 12 }).map((_, idx) => {
          const hourNum = idx + 1;
          const angle = (hourNum * Math.PI) / 6;
          const radius = 102;
          const leftPx = 124 + radius * Math.sin(angle) - 14;
          const topPx = 124 - radius * Math.cos(angle) - 14;
          const isTargetHour = hourNum === highlightedHour;

          return (
            <span
              key={hourNum}
              style={{
                left: `${leftPx}px`,
                top: `${topPx}px`,
                background: isTargetHour ? theme.btnGradient : 'transparent',
                color: isTargetHour ? theme.btnText : theme.goldPrimary,
              }}
              className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                isTargetHour ? 'shadow-lg scale-110 ring-4 ring-amber-400/30 animate-pulse' : ''
              }`}
            >
              {toArabicNumerals(hourNum)}
            </span>
          );
        })}

        {/* Center Date Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <small style={{ color: theme.goldPrimary }} className="text-sm font-bold">
            {weekdayName}
          </small>
          <b
            style={getCountdownDigitStyle(
              invitation.countdownDigitColor,
              invitation.templateId,
              theme.inkColor
            )}
            className={`text-5xl sm:text-6xl font-bold leading-none my-1 ${
              invitation.countdownDigitFont
                ? getCountdownDigitFontClass(invitation.countdownDigitFont)
                : 'font-amiri'
            }`}
          >
            {invitation.countdownNumeralSystem === 'western'
              ? String(!isNaN(parsedDate.getTime()) ? parsedDate.getDate() : 30).padStart(2, '0')
              : dayNumberArabic}
          </b>
          <span style={{ color: theme.goldPrimary }} className="text-xs sm:text-sm font-semibold">
            {monthYearArabic}
          </span>
        </div>
      </div>

      {/* Highlighted Time Label */}
      <div
        style={{ color: theme.goldPrimary }}
        className={`text-lg sm:text-xl font-bold mt-2 mb-5 transition-all duration-500 ${
          dialTimeHighlighted ? 'scale-110 opacity-100' : 'opacity-85'
        }`}
      >
        الساعة {toArabicNumerals(highlightedHour)} {invitation.eventTime?.includes('AM') ? 'صباحاً' : 'عصراً / مساءً'} ✦
      </div>

      {/* 2x2 Frosted Glass Countdown Grid (From Attachment 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md mx-auto">
        {[
          { label: 'يوم', value: countdown.days },
          { label: 'ساعة', value: countdown.hours },
          { label: 'دقيقة', value: countdown.minutes },
          ...(invitation.showSecondsInCountdown !== false
            ? [{ label: 'ثانية', value: countdown.seconds }]
            : []),
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: theme.cardBg,
              borderColor: theme.cardBorder,
            }}
            className="rounded-2xl border p-3.5 shadow-md backdrop-blur-md transition-transform hover:-translate-y-1"
          >
            <b
              style={getCountdownDigitStyle(
                invitation.countdownDigitColor,
                invitation.templateId,
                theme.inkColor
              )}
              className={`block text-2xl sm:text-3xl font-bold tabular-nums leading-tight ${
                invitation.countdownDigitFont
                  ? getCountdownDigitFontClass(invitation.countdownDigitFont)
                  : 'font-amiri'
              }`}
            >
              {formatCountdownNumber(
                item.value,
                invitation.countdownNumeralSystem || 'arabic_indic',
                2
              )}
            </b>
            <span style={{ color: theme.softColor }} className="text-xs font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  // SCENE 3: 3-Tab Details (الموعد / الموكب / الحضور) + Animated SVG Route Path
  const renderScene3DetailsAndRoute = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center px-6 py-8 max-w-lg mx-auto w-full"
    >
      <h2 style={{ color: theme.goldPrimary }} className="text-2xl sm:text-3xl font-bold font-amiri mb-4">
        التفاصيل وطريقكم إلينا
      </h2>

      {/* Interactive 3-Tab Bar (From Attachment 1) */}
      <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
        {[
          { id: 'time', label: 'الموعد والمراسيم' },
          { id: 'route', label: 'الموكب والمسار' },
          { id: 'notes', label: 'تفاصيل الحضور' },
        ].map((tab) => {
          const isSelected = activeDetailTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDetailTab(tab.id as any)}
              style={{
                background: isSelected ? theme.goldPrimary : theme.cardBg,
                borderColor: isSelected ? theme.goldPrimary : theme.goldSecondary,
                color: isSelected ? '#ffffff' : theme.inkColor,
              }}
              className="px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 whitespace-nowrap"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panel Container */}
      <div
        style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
        className="w-full p-5 sm:p-6 rounded-3xl border shadow-lg backdrop-blur-md"
      >
        {activeDetailTab === 'time' && (
          <motion.div
            key="tab-time"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p style={{ color: theme.goldPrimary }} className="text-xl sm:text-2xl font-bold font-amiri">
              {formattedFullDate}
            </p>
            <p style={{ color: theme.inkColor }} className="text-sm sm:text-base font-semibold">
              التوقيت: {invitation.eventTime || 'الساعة الثانية ظهراً'}
            </p>
            <p style={{ color: theme.softColor }} className="text-sm leading-relaxed">
              {ceremonySchedule}
            </p>
            <div className="pt-2">
              <p style={{ color: theme.inkColor }} className="text-xs font-medium">
                📍 المكان: {destinationName} ({invitation.city || 'بغداد'})
              </p>
            </div>
          </motion.div>
        )}

        {activeDetailTab === 'route' && (
          <motion.div
            key="tab-route"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-2"
          >
            {/* Start Point Card */}
            <a
              href={startPointUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderColor: theme.goldSecondary, color: theme.inkColor }}
              className="w-full p-3.5 rounded-2xl border border-dashed hover:scale-[1.01] transition-transform block"
            >
              <small style={{ color: theme.goldPrimary }} className="block text-xs font-bold">
                نقطة الانطلاق
              </small>
              <b className="block text-base sm:text-lg font-bold my-0.5">{startPointName}</b>
              <span
                style={{ color: theme.softColor }}
                className="inline-flex items-center gap-1 text-xs font-semibold"
              >
                <span>افتح موقع الانطلاق في الخريطة</span>
                <ExternalLink size={12} />
              </span>
            </a>

            {/* Animated S-Curve SVG Route Path with Traveling Dot (From Attachment 2) */}
            <div className="py-1">
              <svg width="70" height="64" viewBox="0 0 100 90" className="mx-auto overflow-visible">
                <path
                  id="atelierRoutePath"
                  d="M50 0 C95 25 5 60 50 90"
                  fill="none"
                  stroke={theme.goldPrimary}
                  strokeWidth="2.5"
                  strokeDasharray="3 8"
                  strokeLinecap="round"
                />
                <circle r="6" fill={theme.goldPrimary}>
                  <animateMotion dur="2.8s" repeatCount="indefinite" path="M50 0 C95 25 5 60 50 90" />
                </circle>
              </svg>
            </div>

            {/* Destination Card */}
            <a
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderColor: theme.goldSecondary, color: theme.inkColor }}
              className="w-full p-3.5 rounded-2xl border border-dashed hover:scale-[1.01] transition-transform block"
            >
              <small style={{ color: theme.goldPrimary }} className="block text-xs font-bold">
                نقطة الوصول (قاعة الحفل)
              </small>
              <b className="block text-base sm:text-lg font-bold my-0.5">{destinationName}</b>
              <span
                style={{ color: theme.softColor }}
                className="inline-flex items-center gap-1 text-xs font-semibold"
              >
                <span>افتح موقع القاعة في Waze / Maps</span>
                <ExternalLink size={12} />
              </span>
            </a>

            <div className="pt-2">
              <a
                href={destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: theme.btnGradient, color: theme.btnText }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:brightness-110 transition-all"
              >
                <Navigation size={14} />
                <span>افتح المسار كاملاً</span>
              </a>
            </div>
          </motion.div>
        )}

        {activeDetailTab === 'notes' && (
          <motion.div
            key="tab-notes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5 text-sm"
            style={{ color: theme.inkColor }}
          >
            <p>الدعوة عامة للأهل والأحباب الكرام.</p>
            <p>يُفضّل الحضور قبل الموعد بربع ساعة لمشاركتنا لحظات الاستقبال.</p>
            {invitation.dressCode && (
              <p className="font-semibold" style={{ color: theme.goldPrimary }}>
                اللباس المقترح: {invitation.dressCode}
              </p>
            )}
            {invitation.notes && (
              <p style={{ color: theme.softColor }} className="text-xs pt-1">
                ملاحظة: {invitation.notes}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  // SCENE 4: Interactive RSVP + Digit-by-Digit Animated Phone Reveal Card
  const renderScene4RsvpAndPhoneCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center px-6 py-8 max-w-lg mx-auto w-full"
    >
      <h2 style={{ color: theme.goldPrimary }} className="text-2xl sm:text-3xl font-bold font-amiri mb-2">
        تأكيد الحضور
      </h2>
      <p style={{ color: theme.softColor }} className="text-xs sm:text-sm mb-4">
        وجودكم يكمل فرحتنا ويزيد ليلتنا بهجة
      </p>

      {/* Guest Name Input */}
      <input
        type="text"
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        placeholder="اكتب اسمك الكريم"
        style={{
          background: theme.cardBg,
          borderColor: theme.cardBorder,
          color: theme.inkColor,
        }}
        className="w-full max-w-xs px-5 py-3 rounded-full border text-center text-sm outline-none focus:ring-2 focus:ring-amber-500/40 transition-all mb-3"
      />

      {/* RSVP Decision Buttons */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={(e) => handleRsvpDecision(true, e)}
          style={{ background: theme.btnGradient, color: theme.btnText }}
          className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          سأحضر إن شاء الله
        </button>

        <button
          type="button"
          onClick={(e) => handleRsvpDecision(false, e)}
          style={{
            background: theme.cardBg,
            borderColor: theme.goldSecondary,
            color: theme.inkColor,
          }}
          className="px-5 py-2.5 rounded-full border text-xs sm:text-sm font-semibold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          أعتذر عن الحضور
        </button>
      </div>

      <p style={{ color: theme.softColor }} className="text-[11px] mt-2">
        عند الضغط على «سأحضر» يظهر لك رقم التواصل المباشر والواتساب
      </p>

      {/* Feedback Status */}
      {rsvpFeedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ color: theme.goldPrimary }}
          className="mt-3 text-sm font-bold"
        >
          {rsvpFeedback}
        </motion.div>
      )}

      {/* Animated Phone Reveal Card (From Attachment 1) */}
      <AnimatePresence>
        {showPhoneCard && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              background: theme.isDark
                ? 'linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))'
                : 'linear-gradient(160deg, rgba(255,255,255,0.92), rgba(246,236,214,0.92))',
              borderColor: theme.goldSecondary,
            }}
            className="w-full max-w-xs mt-4 p-5 rounded-3xl border shadow-xl relative overflow-hidden"
          >
            {/* Pulsing Phone Ripple Icon */}
            <div
              style={{ background: theme.btnGradient, color: theme.btnText }}
              className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center shadow-md relative"
            >
              <Phone size={20} />
              <span
                style={{ borderColor: theme.goldSecondary }}
                className="absolute inset-0 rounded-full border-2 animate-ping opacity-40"
              />
            </div>

            <div style={{ color: theme.softColor }} className="text-xs font-medium">
              للتواصل والتأكيد المباشر
            </div>

            {/* Digit-by-Digit Animated Phone Number */}
            <div
              dir="ltr"
              style={{ color: theme.inkColor }}
              className="text-xl sm:text-2xl font-bold tracking-wider my-2 font-mono"
            >
              {contactPhoneDisplay.split('').map((char, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 12, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.04 }}
                  className="inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>

            {/* Phone Card Actions: Call, WhatsApp, Copy */}
            <div className="flex items-center justify-center gap-2 flex-wrap mt-3">
              <a
                href={`tel:+${cleanPhoneDigits}`}
                style={{ background: theme.btnGradient, color: theme.btnText }}
                className="px-4 py-2 rounded-full text-xs font-bold shadow flex items-center gap-1.5"
              >
                <Phone size={13} />
                <span>اتصال</span>
              </a>

              <a
                href={`https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(
                  `✅ سأحضر إن شاء الله حفل ${groomName} و ${brideName} — الاسم: ${guestName || 'ضيف كريم'}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: theme.cardBg,
                  borderColor: theme.goldSecondary,
                  color: theme.inkColor,
                }}
                className="px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5"
              >
                <MessageCircle size={13} />
                <span>واتساب</span>
              </a>

              <button
                type="button"
                onClick={handleCopyPhone}
                style={{
                  background: theme.cardBg,
                  borderColor: theme.goldSecondary,
                  color: theme.inkColor,
                }}
                className="px-3.5 py-2 rounded-full border text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedPhone ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedPhone ? 'تم النسخ ✓' : 'نسخ الرقم'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Google Calendar Button */}
      <div className="mt-4">
        <a
          href={getGoogleCalendarUrl(invitation)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: theme.cardBg,
            borderColor: theme.goldSecondary,
            color: theme.inkColor,
          }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-semibold hover:scale-105 transition-transform"
        >
          <CalendarPlus size={14} style={{ color: theme.goldPrimary }} />
          <span>أضف الموعد إلى تقويم Google</span>
        </a>
      </div>

      <footer style={{ color: theme.softColor }} className="mt-6 font-amiri text-base">
        بحضوركم تكتمل فرحتنا ✦ {groomName} &amp; {brideName}
      </footer>
    </motion.div>
  );

  const atelierFlipVariants = get3DCardFlipVariants(direction, 115);
  const is3DFlipActive = enable3DFlip && invitation.pageTransitionMode !== 'fade-in-out';

  return (
    <div
      ref={containerRef}
      onPointerDown={handleContainerPointerDown}
      style={{
        background: theme.bgGradient,
        color: theme.inkColor,
      }}
      className={`relative w-full ${
        isEmbeddedPreview ? 'max-w-2xl' : 'max-w-3xl'
      } mx-auto rounded-3xl shadow-2xl overflow-hidden select-none font-cairo transition-colors duration-700`}
    >
      {/* Background Video Layer (MP4 / WebM) if uploaded/selected */}
      {invitation.backgroundVideoUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={bgVideoRef}
            src={invitation.backgroundVideoUrl}
            autoPlay={isBgVideoPlaying}
            loop
            muted={isBgVideoMuted}
            playsInline
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundColor: theme.isDark ? '#050810' : '#fcf8f0',
              opacity:
                typeof invitation.backgroundVideoOverlayOpacity === 'number'
                  ? invitation.backgroundVideoOverlayOpacity / 100
                  : 0.55,
            }}
          />
        </div>
      )}

      {/* Top Floating Controls Bar */}
      <div
        style={{
          background: theme.isDark ? 'rgba(10,15,25,0.65)' : 'rgba(255,252,245,0.75)',
          borderColor: theme.cardBorder,
        }}
        className="relative z-30 flex items-center justify-between px-4 py-2.5 border-b backdrop-blur-md"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={toggleMusic}
            style={{
              borderColor: theme.goldSecondary,
              color: theme.inkColor,
            }}
            className="px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {isMusicPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="hidden sm:inline">
              {isMusicPlaying ? 'الموسيقى تعمل' : 'تشغيل الموسيقى'}
            </span>
          </button>

          {/* Background Video Quick Controls */}
          {invitation.backgroundVideoUrl && (
            <div
              style={{ borderColor: theme.goldSecondary, color: theme.inkColor }}
              className="flex items-center gap-1 px-2 py-1 rounded-full border text-xs"
            >
              <Video size={13} style={{ color: theme.goldPrimary }} />
              <button
                type="button"
                onClick={() => setIsBgVideoPlaying((p) => !p)}
                className="p-1 rounded-full hover:opacity-75 cursor-pointer"
                title={isBgVideoPlaying ? 'إيقاف خلفية الفيديو' : 'تشغيل خلفية الفيديو'}
              >
                {isBgVideoPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                type="button"
                onClick={() => setIsBgVideoMuted((m) => !m)}
                className="p-1 rounded-full hover:opacity-75 cursor-pointer"
                title={isBgVideoMuted ? 'تشغيل صوت الفيديو' : 'كتم صوت الفيديو'}
              >
                {isBgVideoMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            </div>
          )}

          {/* Toggle between Scene Pager Mode and Vertical Scroll Deck Mode */}
          {isOpened && (
            <button
              type="button"
              onClick={() => setLayoutMode(layoutMode === 'scenes' ? 'scroll' : 'scenes')}
              style={{
                borderColor: theme.goldSecondary,
                color: theme.inkColor,
              }}
              className="px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              title="التبديل بين نظام الصفحات أو التمرير العمودي"
            >
              {layoutMode === 'scenes' ? <ScrollText size={14} /> : <Layers size={14} />}
              <span className="hidden sm:inline">
                {layoutMode === 'scenes' ? 'عرض التمرير الكامل' : 'عرض الصفحات'}
              </span>
            </button>
          )}

          {/* 3D Flip Toggle when in scenes mode */}
          {isOpened && layoutMode === 'scenes' && (
            <button
              type="button"
              onClick={() => setEnable3DFlip((f) => !f)}
              style={{
                borderColor: theme.goldSecondary,
                color: is3DFlipActive ? theme.goldPrimary : theme.softColor,
              }}
              className="px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              title="تبديل تأثير قلب البطاقة ثلاثي الأبعاد (3D Flip)"
            >
              <Rotate3d size={13} />
              <span className="hidden sm:inline">3D Flip</span>
            </button>
          )}

          {/* Custom Visual Effect Switcher (Rose Petals / Lantern Glow / Sparkles) */}
          <button
            type="button"
            onClick={cycleVisualEffect}
            style={{
              borderColor: theme.goldSecondary,
              color: activeVisualEffect !== 'none' ? theme.goldPrimary : theme.softColor,
            }}
            className="px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            title="تبديل المؤثر البصري (نثر الورود / توهج الفوانيس / بريق الذهب)"
          >
            <Sparkles size={12} />
            <span>{currentEffectMeta.badge}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const url = buildShareableInvitationUrl(invitation);
              navigator.clipboard.writeText(url);
              setCopiedInviteLink(true);
              setTimeout(() => setCopiedInviteLink(false), 2200);
            }}
            style={{
              borderColor: theme.goldSecondary,
              color: theme.inkColor,
            }}
            className="px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            title="نسخ رابط الدعوة المستقل"
          >
            {copiedInviteLink ? <Check size={12} /> : <Share2 size={12} />}
            <span>{copiedInviteLink ? 'تم نسخ الرابط' : 'مشاركة الدعوة'}</span>
          </button>

          {/* If original attached HTML exists and not in standalone guest mode, allow viewing raw HTML in modal */}
          {invitation.originalHtmlPath && !isStandaloneGuest && (
            <button
              type="button"
              onClick={() => setShowOriginalHtmlModal(true)}
              style={{
                background: theme.btnGradient,
                color: theme.btnText,
              }}
              className="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Eye size={12} />
              <span>النسخة الأصلية</span>
            </button>
          )}
        </div>
      </div>

      {/* Decorative Border Frame (Roses / Double Gold / Stars) */}
      {renderBorderFrame()}

      {/* Custom Framer Motion Visual Effects (Rose Petals / Lantern Glow / Sparkles / Spotlight) */}
      <AmbientVisualEffects
        category={invitation.category}
        effect={activeVisualEffect}
      />

      {/* Falling Ambient Petals / Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {Array.from({ length: 10 }).map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ y: -30, x: `${(idx * 11) % 95}%`, opacity: 0, rotate: 0 }}
            animate={{
              y: ['0%', '110%'],
              opacity: [0, 0.55, 0.55, 0],
              rotate: 300,
            }}
            transition={{
              duration: 11 + (idx % 6) * 2,
              repeat: Infinity,
              delay: idx * 1.1,
              ease: 'linear',
            }}
            style={{
              right: `${(idx * 10 + 5) % 92}%`,
              color: theme.goldSecondary,
              fontSize: `${12 + (idx % 3) * 4}px`,
            }}
            className="absolute top-0"
          >
            {theme.particles[idx % theme.particles.length]}
          </motion.div>
        ))}
      </div>

      {/* Interactive Burst Particles Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {bursts.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1, rotate: 0 }}
            animate={{
              x: p.x + p.tx,
              y: p.y + p.ty,
              scale: 0.35,
              opacity: 0,
              rotate: p.rot,
            }}
            transition={{ duration: 1.15, ease: 'easeOut' }}
            style={{ color: p.color, fontSize: `${p.size}px` }}
            className="absolute font-bold"
          >
            {p.symbol}
          </motion.div>
        ))}

        {tapHearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ x: h.x - 10, y: h.y - 10, opacity: 0.9, scale: 0.9 }}
            animate={{ y: h.y - 120, opacity: 0, scale: 1.25 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ color: theme.accentRose }}
            className="absolute text-xl font-bold"
          >
            {h.symbol}
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div
        style={{ perspective: '1400px' }}
        className="relative z-20 min-h-[560px] flex flex-col justify-between overflow-hidden"
      >
        {!isOpened || currentScene === 0 ? (
          renderOpenerCover()
        ) : layoutMode === 'scroll' ? (
          /* Vertical Scroll Deck Mode (All slides stacked like Attachment 2) */
          <div className="space-y-6 py-6 divide-y divide-amber-500/15 max-h-[680px] overflow-y-auto scroll-smooth">
            {renderScene1Proclamation()}
            {renderScene2ClockAndCountdown()}
            {renderScene3DetailsAndRoute()}
            {renderScene4RsvpAndPhoneCard()}
          </div>
        ) : (
          /* Scene-by-Scene Pager Mode with 3D Card Flip in the Air */
          <div className="my-auto py-4 px-2 sm:px-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`atelier-flip-${currentScene}`}
                custom={direction}
                initial={
                  is3DFlipActive
                    ? atelierFlipVariants.initial
                    : { opacity: 0, scale: 0.98 }
                }
                animate={
                  is3DFlipActive
                    ? atelierFlipVariants.animate
                    : { opacity: 1, scale: 1 }
                }
                exit={
                  is3DFlipActive
                    ? atelierFlipVariants.exit
                    : { opacity: 0, scale: 0.98 }
                }
                transition={
                  is3DFlipActive
                    ? atelierFlipVariants.transition
                    : { duration: 0.4 }
                }
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
                className="relative rounded-3xl"
              >
                {currentScene === 1 && renderScene1Proclamation()}
                {currentScene === 2 && renderScene2ClockAndCountdown()}
                {currentScene === 3 && renderScene3DetailsAndRoute()}
                {currentScene === 4 && renderScene4RsvpAndPhoneCard()}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Scene Navigation Controls when Opened in 'scenes' mode */}
        {isOpened && layoutMode === 'scenes' && (
          <div className="relative z-30 flex items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={() => navigateAtelierScene(Math.max(0, currentScene - 1))}
              style={{
                background: theme.cardBg,
                borderColor: theme.goldSecondary,
                color: theme.goldPrimary,
              }}
              className="w-10 h-10 rounded-full border flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="المشهد السابق"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsOpened(idx > 0);
                    navigateAtelierScene(idx);
                  }}
                  style={{
                    background: currentScene === idx ? theme.goldPrimary : theme.cardBorder,
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentScene === idx ? 'w-6' : 'w-2'
                  }`}
                  aria-label={`مشهد ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigateAtelierScene(Math.min(4, currentScene + 1))}
              disabled={currentScene === 4}
              style={{
                background: theme.cardBg,
                borderColor: theme.goldSecondary,
                color: theme.goldPrimary,
              }}
              className="w-10 h-10 rounded-full border flex items-center justify-center shadow-md hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-transform cursor-pointer"
              title="المشهد التالي"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Modal to view Original Attached HTML if user clicks "النسخة الأصلية" */}
      <AnimatePresence>
        {showOriginalHtmlModal && invitation.originalHtmlPath && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl h-[82vh] bg-neutral-900 rounded-3xl border border-amber-500/40 overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-3 bg-neutral-950 border-b border-neutral-800 text-white">
                <span className="text-xs font-bold text-amber-300">
                  معاينة الملف الأصلي المرفق ({invitation.title})
                </span>
                <button
                  type="button"
                  onClick={() => setShowOriginalHtmlModal(false)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <iframe
                src={invitation.originalHtmlPath}
                title={invitation.title}
                className="w-full flex-1 border-0 bg-white"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
