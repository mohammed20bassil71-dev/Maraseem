import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Share2,
  QrCode,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Navigation,
  Clapperboard,
  Film,
  Ticket,
  Play,
  Pause,
  Video,
  Rotate3d,
} from 'lucide-react';
import {
  InvitationTemplateSchema,
  TemplateSceneDefinition,
} from '../../types/template-schema';
import { FILM_STRIP_TEMPLATE_SCHEMA } from '../../data/template-schemas';
import {
  mapAnimationSequenceToMotion,
  get3DCardFlipVariants,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from './motion-mapper';
import { EnvelopeOpenExperience } from '../invitation-experience/EnvelopeOpenExperience';
import { FilmStripExperience } from '../invitation-experience/FilmStripExperience';
import { HennaExperience } from '../invitation-experience/HennaExperience';
import { BirthdayCakeExperience } from '../invitation-experience/BirthdayCakeExperience';
import { GraduationScrollExperience } from '../invitation-experience/GraduationScrollExperience';
import { RibbonCutExperience } from '../invitation-experience/RibbonCutExperience';
import { soundEngine } from '../../utils/audio';
import { CountdownTimer } from '../countdown/CountdownTimer';
import QRCodeLib from 'qrcode';

export interface InvitationEngineProps {
  /**
   * JSON Template schema object or raw JSON string definition
   */
  schema?: InvitationTemplateSchema | string;
  /**
   * Custom field values supplied by the user/host
   */
  data?: Record<string, any>;
  /**
   * Callback when guest submits RSVP
   */
  onSaveRSVP?: (rsvp: {
    guestName: string;
    phone: string;
    status: 'attending' | 'declined' | 'tentative';
    companionsCount: number;
    note?: string;
  }) => void;
  /**
   * Callback when guest submits congratulations message
   */
  onAddGuestbook?: (message: { senderName: string; message: string }) => void;
  /**
   * Existing guestbook comments to display
   */
  guestbookMessages?: Array<{
    id: string;
    senderName: string;
    message: string;
    createdAt: string;
  }>;
  /**
   * Callback fired on scene transition
   */
  onSceneChange?: (sceneIndex: number, sceneDef: TemplateSceneDefinition) => void;
  isEmbeddedPreview?: boolean;
  initialSceneIndex?: number;
}

const EMPTY_DATA: Record<string, any> = {};
const EMPTY_GUESTBOOK: Array<{
  id: string;
  senderName: string;
  message: string;
  createdAt: string;
}> = [];

export const InvitationEngine: React.FC<InvitationEngineProps> = ({
  schema: schemaProp,
  data = EMPTY_DATA,
  onSaveRSVP,
  onAddGuestbook,
  guestbookMessages = EMPTY_GUESTBOOK,
  onSceneChange,
  isEmbeddedPreview = false,
  initialSceneIndex = 0,
}) => {
  // 1. Safely parse and resolve Schema
  const resolvedSchema: InvitationTemplateSchema = useMemo(() => {
    if (!schemaProp) return FILM_STRIP_TEMPLATE_SCHEMA;
    if (typeof schemaProp === 'string') {
      try {
        return JSON.parse(schemaProp);
      } catch (err) {
        console.error('Failed to parse invitation JSON schema, using fallback:', err);
        return FILM_STRIP_TEMPLATE_SCHEMA;
      }
    }
    return schemaProp;
  }, [schemaProp]);

  // Combined Data Helper: retrieves custom input with fallback to schema default
  const getValue = (key: string, fallback: any = '') => {
    if (data[key] !== undefined && data[key] !== '') return data[key];
    if (resolvedSchema.defaultData && resolvedSchema.defaultData[key] !== undefined) {
      return resolvedSchema.defaultData[key];
    }
    return fallback;
  };

  // State Management
  const [currentSceneIndex, setCurrentSceneIndex] = useState(initialSceneIndex);
  const [direction, setDirection] = useState(1);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [enable3DFlip, setEnable3DFlip] = useState(true);

  // Background Video State & Ref
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isBgVideoPlaying, setIsBgVideoPlaying] = useState<boolean>(
    data.backgroundVideoPlaying !== false
  );
  const [isBgVideoMuted, setIsBgVideoMuted] = useState<boolean>(
    data.backgroundVideoMuted ?? true
  );

  // Sync external editor controls for background video
  useEffect(() => {
    if (data.backgroundVideoPlaying !== undefined) {
      setIsBgVideoPlaying(data.backgroundVideoPlaying);
    }
  }, [data.backgroundVideoPlaying]);

  useEffect(() => {
    if (data.backgroundVideoMuted !== undefined) {
      setIsBgVideoMuted(data.backgroundVideoMuted);
    }
  }, [data.backgroundVideoMuted]);

  useEffect(() => {
    const vid = bgVideoRef.current;
    if (!vid) return;
    vid.muted = isBgVideoMuted;
    const vol = typeof data.backgroundVideoVolume === 'number' ? data.backgroundVideoVolume : 60;
    vid.volume = Math.max(0, Math.min(1, vol / 100));
    if (isBgVideoPlaying) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [
    data.backgroundVideoUrl,
    isBgVideoPlaying,
    isBgVideoMuted,
    data.backgroundVideoVolume,
  ]);

  // RSVP Form State
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | 'tentative'>('attending');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [companionsCount, setCompanionsCount] = useState(1);
  const [rsvpNote, setRsvpNote] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Guestbook Form State
  const [gbSender, setGbSender] = useState('');
  const [gbText, setGbText] = useState('');
  const [gbSubmitted, setGbSubmitted] = useState(false);

  const scenes = resolvedSchema.scenes || [];
  const currentSceneDef = scenes[currentSceneIndex] || scenes[0];

  const onSceneChangeRef = useRef(onSceneChange);
  onSceneChangeRef.current = onSceneChange;

  // Map motion/react animation definition for current scene with 3D Flip priority
  const motionVariants = useMemo(() => {
    const requestedMode = data.pageTransitionMode;
    if (requestedMode === 'fade-in-out') {
      return mapAnimationSequenceToMotion('fade-in-out', currentSceneDef?.animationSequence, direction);
    }
    if (requestedMode === 'book-unfold') {
      return mapAnimationSequenceToMotion('book-unfold', currentSceneDef?.animationSequence, direction);
    }
    if (enable3DFlip || requestedMode === '3d-flip') {
      return get3DCardFlipVariants(direction, currentSceneDef?.animationSequence?.springStiffness || 115);
    }
    return mapAnimationSequenceToMotion(
      currentSceneDef?.transition || '3d-flip',
      currentSceneDef?.animationSequence,
      direction
    );
  }, [currentSceneDef, direction, enable3DFlip, data.pageTransitionMode]);

  // Play scene-specific sound effects on scene change
  useEffect(() => {
    const sfx = currentSceneDef?.animationSequence?.soundEffect;
    if (sfx) {
      if (sfx === 'camera_shutter') {
        soundEngine.playChime(440, 0.3);
        setTimeout(() => soundEngine.playChime(880, 0.6), 80);
      } else if (sfx === 'paper_rustle') {
        soundEngine.playEnvelopeOpen();
      } else if (sfx === 'candle_blow') {
        soundEngine.playCandleBlow();
      } else if (sfx === 'fanfare') {
        soundEngine.playCelebrationFanfare();
      } else if (sfx === 'gentle_chime') {
        soundEngine.playChime(659.25, 1.0);
      }
    }

    if (onSceneChangeRef.current && currentSceneDef) {
      onSceneChangeRef.current(currentSceneIndex, currentSceneDef);
    }
  }, [currentSceneIndex, currentSceneDef]);

  // Generate QR Code for sharing
  useEffect(() => {
    const inviteUrl = window.location.href;
    QRCodeLib.toDataURL(inviteUrl, { width: 280, margin: 2 })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => {});
  }, []);

  // Pager navigation handlers
  const goToScene = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= scenes.length) return;
    setDirection(newIndex > currentSceneIndex ? 1 : -1);
    setCurrentSceneIndex(newIndex);
  };

  const nextScene = () => goToScene(currentSceneIndex + 1);
  const prevScene = () => goToScene(currentSceneIndex - 1);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopAmbientMusic();
    };
  }, []);

  // Audio Toggle
  const toggleMusic = () => {
    if (isMusicPlaying) {
      soundEngine.stopAmbientMusic();
      setIsMusicPlaying(false);
    } else {
      const track = data.musicTrack || resolvedSchema.soundtrack?.defaultTrack || 'romantic_piano';
      soundEngine.startAmbientMusic(track, data.customAudioUrl);
      setIsMusicPlaying(true);
    }
  };

  // Handler to start experience and autoplay selected music track
  const handleStartExperience = () => {
    nextScene();
    const shouldAutoplay = data.autoPlayMusic !== false && resolvedSchema.soundtrack?.autoPlay !== false;
    const track = data.musicTrack || resolvedSchema.soundtrack?.defaultTrack || 'romantic_piano';
    if (shouldAutoplay && track !== 'none' && !isMusicPlaying) {
      soundEngine.startAmbientMusic(track, data.customAudioUrl);
      setIsMusicPlaying(true);
    }
  };

  const handleShareWhatsApp = () => {
    const title = getValue('movieTitle', getValue('title', 'دعوة فاخرة'));
    const date = getValue('eventDate', getValue('premiereDate', '2026-12-25'));
    const venue = getValue('venueName', getValue('cinemaTheater', 'القاعة الكبرى'));
    const text = `دعوة خاصة وبكل المودة 💌\nيسعدنا دعوتكم لحضور: ${title}\nالموعد: ${date}\nالمكان: ${venue}\n\nيمكنكم مشاهدة تفاصيل الدعوة وتأكيد الحضور عبر الرابط:\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    if (onSaveRSVP) {
      onSaveRSVP({
        guestName: guestName.trim(),
        phone: guestPhone.trim(),
        status: rsvpStatus,
        companionsCount: rsvpStatus === 'attending' ? companionsCount : 0,
        note: rsvpNote.trim(),
      });
    }
    setRsvpSubmitted(true);
    soundEngine.playChime(659.25, 1.2);
  };

  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbSender.trim() || !gbText.trim()) return;

    if (onAddGuestbook) {
      onAddGuestbook({
        senderName: gbSender.trim(),
        message: gbText.trim(),
      });
    }
    setGbSender('');
    setGbText('');
    setGbSubmitted(true);
    soundEngine.playChime(880.0, 1.0);
    setTimeout(() => setGbSubmitted(false), 3000);
  };

  // Render Background Texture based on Schema
  const renderBackgroundTexture = () => {
    switch (resolvedSchema.backgroundTexture) {
      case 'film_perforations':
        return (
          <>
            {/* 35mm Sprocket Holes Along Edges */}
            <div className="absolute inset-y-0 left-0 w-7 bg-[#050608] border-r border-neutral-800/80 flex flex-col justify-between py-3 items-center pointer-events-none z-10">
              {[...Array(11)].map((_, i) => (
                <div
                  key={`sprocket-l-${i}`}
                  className="w-3.5 h-4.5 rounded-sm bg-neutral-900 border border-neutral-700/60 shadow-inner"
                />
              ))}
            </div>
            <div className="absolute inset-y-0 right-0 w-7 bg-[#050608] border-l border-neutral-800/80 flex flex-col justify-between py-3 items-center pointer-events-none z-10">
              {[...Array(11)].map((_, i) => (
                <div
                  key={`sprocket-r-${i}`}
                  className="w-3.5 h-4.5 rounded-sm bg-neutral-900 border border-neutral-700/60 shadow-inner"
                />
              ))}
            </div>
            {/* Film Grain Mesh */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_0.75px,transparent_0.75px)] [background-size:12px_12px] pointer-events-none" />
          </>
        );

      case 'arabic_arabesque':
        return (
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
        );

      case 'blueprint_grid':
        return (
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        );

      case 'starry_night':
        return (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        );

      case 'marble_obsidian':
      default:
        return (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-neutral-950 to-neutral-950 pointer-events-none" />
        );
    }
  };

  // Render Interactive Opener Component
  const renderInteractiveOpener = () => {
    switch (resolvedSchema.experienceMode) {
      case 'film-strip':
        return (
          <FilmStripExperience
            onOpen={handleStartExperience}
            title={getValue('movieTitle', getValue('title', 'العرض الأول'))}
            groomName={getValue('groomName', 'علي الساعدي')}
            brideName={getValue('brideName', 'فاطمة البغدادي')}
            tagline={getValue('tagline', getValue('welcomeQuote', 'عندما تبتسم الأقدار'))}
          />
        );

      case 'oriental-lantern':
        return (
          <HennaExperience
            onOpen={handleStartExperience}
            title={getValue('title', 'ليلة الحنة المباركة')}
            brideName={getValue('brideName', 'العروس')}
          />
        );

      case 'birthday-cake':
        return (
          <BirthdayCakeExperience
            onOpen={handleStartExperience}
            title={getValue('title', 'عيد ميلاد سعيد')}
            name={getValue('birthdayStarName', 'جود')}
            age={getValue('age', 7)}
          />
        );

      case 'academic-scroll':
        return (
          <GraduationScrollExperience
            onOpen={handleStartExperience}
            title={getValue('title', 'حفل التخرج المبارك')}
            graduateName={getValue('graduateName', 'الخريج')}
            major={getValue('major', 'medicine')}
            university={getValue('university', 'الجامعة')}
          />
        );

      case 'ribbon-cutting':
        return (
          <RibbonCutExperience
            onOpen={handleStartExperience}
            title={getValue('title', 'مراسم الافتتاح الرسمي')}
            businessName={getValue('businessName', 'المشروع الجديد')}
          />
        );

      case 'envelope-reveal':
      default:
        return (
          <EnvelopeOpenExperience
            onOpen={handleStartExperience}
            title={getValue('title', 'دعوة كريمة ومباركة')}
            sealText="ختم ملكي"
            hostSubtitle={getValue('hostNames', `${getValue('groomName', '')} & ${getValue('brideName', '')}`)}
            themeColor={resolvedSchema.palette?.primary || '#8a1d2e'}
          />
        );
    }
  };

  // Render Scene Body Based on sceneType defined in Schema with Staggered Entrance
  const renderSceneBody = (scene: TemplateSceneDefinition) => {
    switch (scene.sceneType) {
      case 'interactive_opener':
        return (
          <motion.div
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            className="my-auto py-2"
          >
            <motion.div variants={STAGGER_ITEM_VARIANTS.scaleReveal}>
              {renderInteractiveOpener()}
            </motion.div>
          </motion.div>
        );

      case 'hero_proclamation':
        if (resolvedSchema.experienceMode === 'film-strip') {
          return (
            <motion.div
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              className="max-w-xl mx-auto my-auto w-full text-center space-y-5"
            >
              {/* Hollywood Clapperboard Header */}
              <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 border border-amber-500/30 text-xs font-mono text-amber-300">
                  <Clapperboard size={14} className="text-amber-400" />
                  <span>PREMIERE · MAIN BILLING · ACT I</span>
                </div>
              </motion.div>

              <motion.div
                variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                className="p-6 rounded-2xl bg-neutral-900/80 border border-amber-500/20 shadow-2xl space-y-4"
              >
                <motion.span
                  variants={STAGGER_ITEM_VARIANTS.fadeUp}
                  className="block text-xs text-amber-400/90 font-mono tracking-widest uppercase"
                >
                  A TRUE LOVE STORY
                </motion.span>

                <motion.h2
                  variants={STAGGER_ITEM_VARIANTS.fadeUp}
                  className="text-2xl sm:text-3xl font-bold font-cinzel text-white tracking-wide"
                >
                  {getValue('movieTitle', getValue('title', 'العرض الأول'))}
                </motion.h2>

                {getValue('coverImage', '') && (
                  <motion.div
                    variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                    className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-[0_0_25px_rgba(212,175,55,0.25)]"
                  >
                    <img
                      src={getValue('coverImage', '')}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}

                <motion.p
                  variants={STAGGER_ITEM_VARIANTS.fadeUp}
                  className="text-sm text-neutral-300 italic font-cairo max-w-md mx-auto leading-relaxed"
                >
                  {getValue('tagline', getValue('welcomeQuote', 'عندما تبتسم الأقدار'))}
                </motion.p>

                {/* Stars Lead Box */}
                <motion.div
                  variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                  className="py-3 px-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-center gap-4 text-sm font-bold font-cairo"
                >
                  <span className="text-amber-300">{getValue('groomName', 'علي الساعدي')}</span>
                  <Film size={16} className="text-amber-400" />
                  <span className="text-amber-300">{getValue('brideName', 'فاطمة البغدادي')}</span>
                </motion.div>

                <motion.div
                  variants={STAGGER_ITEM_VARIANTS.fadeUp}
                  className="text-xs text-neutral-400 font-mono pt-1"
                >
                  {getValue('directorCredit', 'برعاية ومباركة العائلتين الكريمتين')}
                </motion.div>
              </motion.div>

              <motion.button
                variants={STAGGER_ITEM_VARIANTS.actionButton}
                onClick={nextScene}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 mx-auto hover:brightness-110 transition-all font-cairo"
              >
                <span>متابعة تفاصيل موعد العرض (Showtime)</span>
                <ChevronLeft size={16} />
              </motion.button>
            </motion.div>
          );
        }

        // Royal or Traditional Proclamation with Staggered Entrance
        return (
          <motion.div
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto my-auto w-full text-center space-y-6"
          >
            <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="space-y-2">
              <div className="text-amber-400 font-amiri text-lg tracking-wider">
                بسم الله الرحمن الرحيم
              </div>
              <div className="text-neutral-300/80 font-amiri text-sm sm:text-base italic leading-relaxed px-4">
                {getValue('welcomeVerse', getValue('welcomeQuote', '«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا»'))}
              </div>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto pt-2" />
            </motion.div>

            {getValue('coverImage', '') && (
              <motion.div
                variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-2 border-amber-400/50 shadow-[0_0_25px_rgba(212,175,55,0.25)]"
              >
                <img
                  src={getValue('coverImage', '')}
                  alt="Event Portrait"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            <motion.div
              variants={STAGGER_ITEM_VARIANTS.scaleReveal}
              className="py-5 px-6 rounded-2xl bg-neutral-900/70 border border-amber-500/20 shadow-inner space-y-4"
            >
              <motion.div
                variants={STAGGER_ITEM_VARIANTS.fadeUp}
                className="text-xs text-amber-400/90 font-cairo"
              >
                {getValue('hostNames', 'عائلتا العروسين تتشرفان بدعوتكم')}
              </motion.div>

              <motion.div
                variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                className="flex items-center justify-center gap-4 text-2xl sm:text-3xl font-bold font-amiri gold-gradient-text"
              >
                <span>{getValue('groomName', '')}</span>
                <Heart size={20} className="text-amber-400 fill-amber-400/40 animate-pulse" />
                <span>{getValue('brideName', '')}</span>
              </motion.div>

              <motion.p
                variants={STAGGER_ITEM_VARIANTS.fadeUp}
                className="text-neutral-300 text-xs sm:text-sm leading-relaxed font-cairo pt-2"
              >
                {getValue('invitationBody', 'نتشرف بحضوركم لمشاركتنا فرحة العمر ومباركة هذا الرباط المقدس.')}
              </motion.p>
            </motion.div>

            <motion.button
              variants={STAGGER_ITEM_VARIANTS.actionButton}
              onClick={nextScene}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 mx-auto hover:brightness-110 transition-all font-cairo"
            >
              <span>متابعة تفاصيل الموعد والعد التنازلي</span>
              <ChevronLeft size={16} />
            </motion.button>
          </motion.div>
        );

      case 'timeline_countdown':
        return (
          <motion.div
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto my-auto w-full text-center space-y-6"
          >
            <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="space-y-1">
              <span className="text-amber-400 text-xs font-semibold tracking-wider font-cairo">
                {resolvedSchema.experienceMode === 'film-strip' ? 'PREMIERE SHOWTIME' : 'موعدنا الذي ننتظره بشوق'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-cairo">
                تاريخ وتوقيت المناسبة
              </h3>
            </motion.div>

            {/* Date & Time Badges */}
            <motion.div
              variants={STAGGER_ITEM_VARIANTS.fadeUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-amber-500/20 flex items-center justify-center gap-3">
                <Calendar className="text-amber-400 shrink-0" size={24} />
                <div className="text-right">
                  <div className="text-xs text-neutral-400 font-cairo">تاريخ العرض الأول</div>
                  <div className="text-base font-bold text-white font-mono">
                    {getValue('eventDate', getValue('premiereDate', '2026-12-25'))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/80 border border-amber-500/20 flex items-center justify-center gap-3">
                <Clock className="text-amber-400 shrink-0" size={24} />
                <div className="text-right">
                  <div className="text-xs text-neutral-400 font-cairo">توقيت بدء الفعالية</div>
                  <div className="text-base font-bold text-white font-mono">
                    {getValue('eventTime', getValue('premiereTime', '08:30 PM'))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Animated Customizable Countdown Component */}
            <motion.div variants={STAGGER_ITEM_VARIANTS.scaleReveal}>
              <CountdownTimer
                eventDate={getValue('eventDate', getValue('premiereDate', '2026-12-25'))}
                eventTime={getValue('eventTime', getValue('premiereTime', '08:30 PM'))}
                stylePreset={data.countdownStyle || 'gold_luxury'}
                title={data.countdownTitle || 'العد التنازلي المباشر حتى موعد الحفل'}
                showSeconds={data.showSecondsInCountdown !== false}
                celebrationText={data.countdownCelebrationText || 'حان موعد الحفل المبارك! أهلاً وسهلاً بكم 🎉'}
                size="md"
              />
            </motion.div>

            <motion.button
              variants={STAGGER_ITEM_VARIANTS.actionButton}
              onClick={nextScene}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 mx-auto hover:brightness-110 transition-all font-cairo"
            >
              <span>مشاهدة الموقع الجغرافي وخريطة الوصول</span>
              <ChevronLeft size={16} />
            </motion.button>
          </motion.div>
        );

      case 'location_navigation':
        return (
          <motion.div
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto my-auto w-full text-center space-y-6"
          >
            <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="space-y-1">
              <span className="text-amber-400 text-xs font-semibold tracking-wider font-cairo">
                {resolvedSchema.experienceMode === 'film-strip' ? 'THEATER LOCATION' : 'موقع ومكان الحفل'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-cairo">
                {getValue('venueName', getValue('cinemaTheater', 'القاعة الملكية'))}
              </h3>
              <p className="text-neutral-400 text-xs font-cairo">
                {getValue('city', 'العراق')} - {getValue('addressDetails', 'شارع الاحتفالات')}
              </p>
            </motion.div>

            <motion.div
              variants={STAGGER_ITEM_VARIANTS.scaleReveal}
              className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-[#121620] p-6 shadow-inner text-center space-y-4"
            >
              <motion.div
                variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                <MapPin size={32} />
              </motion.div>

              <motion.div variants={STAGGER_ITEM_VARIANTS.fadeUp} className="space-y-1">
                <div className="text-sm font-bold text-amber-100 font-cairo">
                  {getValue('venueName', getValue('cinemaTheater', 'القاعة الكبرى'))}
                </div>
                <div className="text-xs text-neutral-400 font-cairo">
                  {getValue('addressDetails', 'الموقع المحدد على الخريطة')}
                </div>
              </motion.div>

              <motion.div
                variants={STAGGER_ITEM_VARIANTS.actionButton}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
              >
                <a
                  href={getValue('googleMapsUrl', 'https://maps.google.com')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md font-cairo"
                >
                  <Navigation size={15} />
                  <span>فتح في خرائط Google Maps</span>
                  <ExternalLink size={13} />
                </a>
              </motion.div>
            </motion.div>

            <motion.button
              variants={STAGGER_ITEM_VARIANTS.actionButton}
              onClick={nextScene}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 mx-auto hover:brightness-110 transition-all font-cairo"
            >
              <span>{resolvedSchema.experienceMode === 'film-strip' ? 'حجز تذكرة الـ VIP (RSVP)' : 'تأكيد الحضور (RSVP)'}</span>
              <ChevronLeft size={16} />
            </motion.button>
          </motion.div>
        );

      case 'rsvp_portal':
        return (
          <motion.div
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            className="max-w-md mx-auto my-auto w-full space-y-5"
          >
            <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="text-center space-y-1">
              <span className="text-amber-400 text-xs font-semibold tracking-wider font-cairo">
                {resolvedSchema.experienceMode === 'film-strip' ? 'VIP CINEMA PASS' : 'تأكيد الحضور (RSVP)'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-cairo">
                {resolvedSchema.experienceMode === 'film-strip' ? 'تأكيد حجز التذكرة وحضور العرض' : 'يسعدنا تأكيد حضوركم الكريم'}
              </h3>
            </motion.div>

            {/* VIP Ticket Stub Header if Film-Strip */}
            {resolvedSchema.experienceMode === 'film-strip' && (
              <motion.div
                variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 text-amber-300">
                  <Ticket size={16} />
                  <span>CODE: {getValue('ticketPassCode', 'PASS-2026')}</span>
                </div>
                <span className="text-neutral-400">SEAT: ROW A · VIP</span>
              </motion.div>
            )}

            {rsvpSubmitted ? (
              <motion.div
                variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 font-cairo"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-bold text-emerald-200">
                  تم استلام تأكيدكم بنجاح!
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  شكراً لكم {guestName}، ونتطلع لمشاركتكم هذه اللحظات السعيدة.
                </p>
                <button
                  onClick={nextScene}
                  className="px-5 py-2 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs shadow"
                >
                  الانتقال لسجل التهاني والتبريكات ✍️
                </button>
              </motion.div>
            ) : (
              <motion.form
                variants={STAGGER_ITEM_VARIANTS.fadeUp}
                onSubmit={handleRsvpSubmit}
                className="space-y-4 font-cairo"
              >
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus('attending')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      rsvpStatus === 'attending'
                        ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                    <span>سأحضر بكل سرور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRsvpStatus('declined')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      rsvpStatus === 'declined'
                        ? 'bg-rose-600/30 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <XCircle size={18} />
                    <span>أعتذر عن الحضور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRsvpStatus('tentative')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      rsvpStatus === 'tentative'
                        ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <HelpCircle size={18} />
                    <span>ربما سأحضر</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1 text-right">
                    الاسم الكريم *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="اكتب اسمك الثلاثي"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1 text-right">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+964 7XX XXX XXXX"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-neutral-500 outline-none transition-all dir-ltr text-right"
                  />
                </div>

                {rsvpStatus === 'attending' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1 text-right">
                      عدد الأشخاص المرافقين (شاملاً حضرتك)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCompanionsCount(Math.max(1, companionsCount - 1))}
                        className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold hover:bg-neutral-700"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center font-bold text-amber-300 text-lg font-mono">
                        {companionsCount} {companionsCount === 1 ? 'فرد' : 'أفراد'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCompanionsCount(Math.min(5, companionsCount + 1))}
                        className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold hover:bg-neutral-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1 text-right">
                    ملاحظة أو تمنيات خاصة (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={rsvpNote}
                    onChange={(e) => setRsvpNote(e.target.value)}
                    placeholder="أية ملاحظات أو تهنئة خاصة..."
                    className="w-full px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs text-white placeholder-neutral-500 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all"
                >
                  {resolvedSchema.experienceMode === 'film-strip' ? 'تأكيد حجز التذكرة الآن' : 'إرسال تأكيد الحضور الآن'}
                </button>
              </motion.form>
            )}
          </motion.div>
        );

      case 'guestbook_registry':
        return (
          <motion.div
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto my-auto w-full space-y-5 font-cairo"
          >
            <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="text-center space-y-1">
              <span className="text-amber-400 text-xs font-semibold tracking-wider">
                {resolvedSchema.experienceMode === 'film-strip' ? 'AUDIENCE REVIEWS' : 'سجل التهاني والتبريكات'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {resolvedSchema.experienceMode === 'film-strip' ? 'انطباعات وتهاني الأصدقاء' : 'شارك بكلمة طيبة تخلّد الذكرى'}
              </h3>
            </motion.div>

            <motion.form
              variants={STAGGER_ITEM_VARIANTS.scaleReveal}
              onSubmit={handleGuestbookSubmit}
              className="p-4 rounded-2xl bg-neutral-900/80 border border-amber-500/20 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={gbSender}
                  onChange={(e) => setGbSender(e.target.value)}
                  placeholder="اسمك الكريم"
                  className="sm:col-span-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  required
                  value={gbText}
                  onChange={(e) => setGbText(e.target.value)}
                  placeholder="اكتب أرق التهاني والتباريك..."
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
                >
                  <MessageSquare size={13} />
                  <span>إرسال التهنئة</span>
                </button>
              </div>
              {gbSubmitted && (
                <p className="text-emerald-400 text-xs text-center font-medium animate-pulse">
                  تمت إضافة تهنئتكم العطرة بنجاح ✨
                </p>
              )}
            </motion.form>

            <motion.div
              variants={STAGGER_ITEM_VARIANTS.fadeUp}
              className="space-y-3 max-h-56 overflow-y-auto pr-1"
            >
              {guestbookMessages.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                  كن أول من يهنئ ويترك بصمة فرح هنا! 💌
                </div>
              ) : (
                guestbookMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-right space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                      <span>{msg.senderName}</span>
                      <span className="text-neutral-500 font-normal">
                        {new Date(msg.createdAt).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-200 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative w-full ${
        isEmbeddedPreview ? 'max-w-2xl' : 'max-w-3xl'
      } mx-auto bg-neutral-950/95 text-neutral-100 rounded-3xl border border-amber-500/20 shadow-2xl overflow-hidden font-cairo`}
    >
      {/* Background Video Layer (MP4 / WebM) if configured */}
      {data.backgroundVideoUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={bgVideoRef}
            src={data.backgroundVideoUrl}
            autoPlay={isBgVideoPlaying}
            loop
            muted={isBgVideoMuted}
            playsInline
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-neutral-950 transition-opacity duration-300"
            style={{
              opacity:
                typeof data.backgroundVideoOverlayOpacity === 'number'
                  ? data.backgroundVideoOverlayOpacity / 100
                  : 0.55,
            }}
          />
        </div>
      ) : (
        /* Background Texture Element */
        renderBackgroundTexture()
      )}

      {/* Floating Top Control Bar */}
      <div className="relative z-30 flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/80 bg-neutral-900/70 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Ambient Music Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-full border transition-all flex items-center gap-1.5 text-xs ${
              isMusicPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-neutral-200'
            }`}
            title="تشغيل / كتم الموسيقى"
          >
            {isMusicPlaying ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="hidden sm:inline text-[11px]">
              {isMusicPlaying ? 'الموسيقى تعمل' : 'تشغيل الموسيقى'}
            </span>
          </button>

          {/* Background Video Controls if Video is Active */}
          {data.backgroundVideoUrl && (
            <div className="flex items-center gap-1 bg-neutral-950/80 px-2 py-1 rounded-full border border-amber-500/30">
              <Video size={13} className="text-amber-400 mr-0.5" />
              <button
                type="button"
                onClick={() => setIsBgVideoPlaying((p) => !p)}
                className="p-1 rounded-full hover:bg-neutral-800 text-amber-300 transition-colors"
                title={isBgVideoPlaying ? 'إيقاف خلفية الفيديو' : 'تشغيل خلفية الفيديو'}
              >
                {isBgVideoPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                type="button"
                onClick={() => setIsBgVideoMuted((m) => !m)}
                className="p-1 rounded-full hover:bg-neutral-800 text-amber-300 transition-colors"
                title={isBgVideoMuted ? 'تشغيل صوت الفيديو' : 'كتم صوت الفيديو'}
              >
                {isBgVideoMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            </div>
          )}

          {/* 3D Flip Toggle Badge */}
          <button
            type="button"
            onClick={() => setEnable3DFlip((f) => !f)}
            className={`px-2.5 py-1.5 rounded-full border transition-all flex items-center gap-1 text-[11px] font-semibold ${
              enable3DFlip
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
            }`}
            title="تبديل تأثير تقليب البطاقة ثلاثي الأبعاد (3D Card Flip)"
          >
            <Rotate3d size={13} />
            <span className="hidden md:inline">3D Flip</span>
          </button>

          {/* QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-colors"
            title="رمز الاستجابة السريعة QR"
          >
            <QrCode size={15} />
          </button>
        </div>

        {/* Scene Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {scenes.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToScene(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentSceneIndex === idx
                  ? 'w-6 bg-gradient-to-r from-amber-400 to-amber-200 shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                  : 'w-1.5 bg-neutral-700 hover:bg-neutral-500'
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">واتساب</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
          >
            نسخ الرابط
          </button>
        </div>
      </div>

      {/* Share Toast Notification */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs shadow-lg"
          >
            تم نسخ رابط الدعوة بنجاح! جاهز للمشاركة 📋
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Scene Viewport with 3D Card Flip Perspective */}
      <div
        style={{ perspective: '1400px' }}
        className="relative z-20 min-h-[500px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`scene-${currentSceneIndex}`}
            custom={direction}
            initial={motionVariants.initial}
            animate={motionVariants.animate}
            exit={motionVariants.exit}
            transition={motionVariants.transition}
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
            className="relative w-full flex-1 flex flex-col justify-center rounded-2xl border border-amber-500/15 bg-neutral-950/45 backdrop-blur-xs p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_25px_rgba(212,175,55,0.08)]"
          >
            {/* Dynamic 3D Specular Light Sweep across the card as it flips in the air */}
            <motion.div
              initial={{ opacity: 0.45, x: direction > 0 ? '-60%' : '60%' }}
              animate={{ opacity: 0, x: direction > 0 ? '100%' : '-100%' }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-amber-200/15 to-transparent z-30"
            />
            {currentSceneDef && renderSceneBody(currentSceneDef)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Scene Pager Navigation */}
      <div className="relative z-30 px-6 py-4 border-t border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={prevScene}
          disabled={currentSceneIndex === 0}
          className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition-colors"
        >
          <ChevronRight size={15} />
          <span>المشهد السابق</span>
        </button>

        <span className="text-xs text-amber-300/80 font-medium flex items-center gap-1.5">
          <span>
            {currentSceneDef?.title} ({currentSceneIndex + 1} من {scenes.length})
          </span>
        </span>

        <button
          onClick={nextScene}
          disabled={currentSceneIndex === scenes.length - 1}
          className="px-4 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors"
        >
          <span>المشهد التالي</span>
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-xs w-full bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl"
            >
              <h4 className="text-base font-bold text-white">
                رمز الدخول السريع (QR Code)
              </h4>
              <p className="text-xs text-neutral-400">
                امسح الرمز بكاميرا الهاتف لفتح بطاقة الدعوة التفاعلية مباشرة
              </p>

              {qrCodeDataUrl ? (
                <div className="p-3 bg-white rounded-2xl mx-auto inline-block shadow-inner">
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-neutral-800 rounded-2xl animate-pulse mx-auto" />
              )}

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
