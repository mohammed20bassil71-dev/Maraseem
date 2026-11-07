import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Film,
  Sparkles,
  Volume2,
  VolumeX,
  Calendar,
  MapPin,
  Clock,
  Star,
  Ticket,
  Play,
  RotateCcw,
  Share2,
  ChevronLeft,
  ChevronRight,
  Award,
  Users,
  Clapperboard,
  Check,
  Wand2,
  Layers,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  InvitationData,
  RSVPRecord,
  GuestbookMessage,
  MovieTitleAnimationStyle,
  MovieTransitionStyle,
  MovieCastMember,
} from '../../types/invitation';
import { soundEngine } from '../../utils/audio';
import { CountdownTimer } from '../countdown/CountdownTimer';
import { getGoogleCalendarUrl } from '../../utils/calendar';
import { buildShareableInvitationUrl } from '../../utils/shareLink';

export interface MovieTrailerInvitationExperienceProps {
  invitation: InvitationData;
  onRSVPSubmit?: (rsvp: Omit<RSVPRecord, 'id' | 'createdAt'>) => void;
  onGuestbookSubmit?: (msg: Omit<GuestbookMessage, 'id' | 'createdAt'>) => void;
  guestbookMessages?: GuestbookMessage[];
  personalizedGuest?: {
    id?: string;
    name: string;
    familyTitle?: string;
    welcomeNote?: string;
    maxCompanions?: number;
  } | null;
}

export const MOVIE_TITLE_ANIMATION_OPTIONS: {
  id: MovieTitleAnimationStyle;
  nameAr: string;
  nameEn: string;
  descAr: string;
}[] = [
  {
    id: 'epic_zoom_flare',
    nameAr: 'تكبير سينمائي ملحمي مع وهج أنامورفيك',
    nameEn: 'Epic Widescreen Zoom & Lens Flare',
    descAr: 'حركة اقتراب سينمائية فخمة للعنوان مع شعاع عدسة ذهبي يمسح الشاشة',
  },
  {
    id: 'letter_reveal_glow',
    nameAr: 'ظهور متتابع للأحرف بتوهج ذهبي',
    nameEn: 'Cinematic Letter-by-Letter Gold Glow',
    descAr: 'ظهور درامي متسلسل لكلمات وعنوان الفيلم مع هالة ضوئية ملكية',
  },
  {
    id: 'shatter_gold',
    nameAr: 'تجمّع ثلاثي الأبعاد برقائق الذهب',
    nameEn: '3D Gold Foil Convergence',
    descAr: 'انبثاق العنوان من عمق الكاميرا بتأثير منظور ثلاثي الأبعاد لامع',
  },
  {
    id: 'noir_typewriter',
    nameAr: 'تشويق كلاسيكي متقطع (Teaser Cut)',
    nameEn: 'Suspense Teaser Typewriter & Flash',
    descAr: 'إيقاع تشويقي سريع مع ومضات سينمائية على غرار إعلانات هوليوود',
  },
];

export const MOVIE_TRANSITION_STYLE_OPTIONS: {
  id: MovieTransitionStyle;
  nameAr: string;
  nameEn: string;
  descAr: string;
}[] = [
  {
    id: 'anamorphic_flare_wipe',
    nameAr: 'مسحة شعاع العدسة السينمائي (Anamorphic Flare Wipe)',
    nameEn: 'Anamorphic Lens Flare Wipe',
    descAr: 'انتقال درامي بشعاع ضوئي ذهبي/أزرق يمسح المشهد نحو الفصل التالي',
  },
  {
    id: 'dramatic_fade_through_black',
    nameAr: 'تلاشي سينمائي عبر السواد (Dip to Black)',
    nameEn: 'Dramatic Fade Through Black',
    descAr: 'تعتيم سينمائي عميق متبوع بوميض عدسة عند ظهور المشهد الجديد',
  },
  {
    id: 'shutter_cut',
    nameAr: 'مصراع الكاميرا 35mm (Aperture Shutter Cut)',
    nameEn: '35mm Shutter Blade Cut',
    descAr: 'إغلاق وفتح بوابات العدسة السينمائية مع مؤثر صوتي درامي',
  },
  {
    id: 'zoom_impact',
    nameAr: 'اندفاع الكاميرا الملحمي (Blockbuster Zoom Cut)',
    nameEn: 'Blockbuster Camera Zoom Impact',
    descAr: 'اندفاع بصري سريع في عمق الكادر للانتقال بين فصول الإعلان',
  },
];

type TrailerStage = 'rating_slate' | 'teaser_sequence' | 'main_feature';
type TrailerActId = 'act_synopsis' | 'act_cast' | 'act_release' | 'act_box_office';

const TRAILER_ACTS: {
  id: TrailerActId;
  actNumber: string;
  titleAr: string;
  titleEn: string;
  icon: React.FC<{ size?: number; className?: string }>;
}[] = [
  {
    id: 'act_synopsis',
    actNumber: 'ACT I',
    titleAr: 'الإعلان الرسمي والقصة',
    titleEn: 'Official Teaser & Synopsis',
    icon: Film,
  },
  {
    id: 'act_cast',
    actNumber: 'ACT II',
    titleAr: 'أبطال العمل وطاقم البطولة',
    titleEn: 'Key Cast & Billing',
    icon: Users,
  },
  {
    id: 'act_release',
    actNumber: 'ACT III',
    titleAr: 'موعد العرض الأول والمسرح',
    titleEn: 'Release Date & Premiere Venue',
    icon: Calendar,
  },
  {
    id: 'act_box_office',
    actNumber: 'ACT IV',
    titleAr: 'شباك التذاكر الملكي RSVP',
    titleEn: 'VIP Box Office & Guestbook',
    icon: Ticket,
  },
];

export function isMovieTrailerInvitation(invitation: InvitationData): boolean {
  return (
    invitation.templateStyle === 'movie_trailer' ||
    Boolean(invitation.templateId && invitation.templateId.includes('movie-trailer')) ||
    Boolean(invitation.movieTitle && invitation.movieTitle.trim().length > 0) ||
    Boolean(invitation.movieTitleAnimation)
  );
}

export const MovieTrailerInvitationExperience: React.FC<MovieTrailerInvitationExperienceProps> = ({
  invitation,
  onRSVPSubmit,
  onGuestbookSubmit,
  guestbookMessages = [],
  personalizedGuest,
}) => {
  const [stage, setStage] = useState<TrailerStage>('rating_slate');
  const [teaserBeat, setTeaserBeat] = useState<number>(0);
  const [activeAct, setActiveAct] = useState<TrailerActId>('act_synopsis');
  const [isTransitioningAct, setIsTransitioningAct] = useState<boolean>(false);
  const [isPlayingScore, setIsPlayingScore] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live customizable overrides inside preview bar
  const [titleAnimOverride, setTitleAnimOverride] = useState<MovieTitleAnimationStyle | null>(null);
  const [transitionOverride, setTransitionOverride] = useState<MovieTransitionStyle | null>(null);

  const activeTitleAnimation: MovieTitleAnimationStyle =
    titleAnimOverride || invitation.movieTitleAnimation || 'epic_zoom_flare';
  const activeTransitionStyle: MovieTransitionStyle =
    transitionOverride || invitation.movieTransitionStyle || 'anamorphic_flare_wipe';

  // RSVP State
  const [guestName, setGuestName] = useState(personalizedGuest?.name || '');
  const [status, setStatus] = useState<'attending' | 'declined' | 'tentative'>('attending');
  const [companionsCount, setCompanionsCount] = useState(1);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [ticketCode, setTicketCode] = useState('');

  // Guestbook State
  const [gbName, setGbName] = useState(personalizedGuest?.name || '');
  const [gbMessage, setGbMessage] = useState('');
  const [gbSubmitted, setGbSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Derived Movie Title, Tagline, and Key Cast
  const movieTitle = useMemo(() => {
    if (invitation.movieTitle && invitation.movieTitle.trim()) {
      return invitation.movieTitle.trim();
    }
    if (invitation.category === 'graduation' || invitation.category === 'graduation_project') {
      return invitation.graduateName
        ? `العهد الجديد: ${invitation.graduateName}`
        : invitation.title || 'فجر التميز الملكي';
    }
    if (invitation.category === 'birthday') {
      return invitation.birthdayStarName
        ? `نجم العام: ${invitation.birthdayStarName}`
        : invitation.title || 'ليلة النجوم السينمائية';
    }
    if (invitation.groomName && invitation.brideName) {
      return `${invitation.groomName} & ${invitation.brideName}`;
    }
    return invitation.title || 'العرض الملكي الأول';
  }, [invitation]);

  const movieTagline = useMemo(() => {
    if (invitation.movieTagline && invitation.movieTagline.trim()) {
      return invitation.movieTagline.trim();
    }
    return (
      invitation.welcomeQuote ||
      'قصة كُتبت فصولها بالحب والوفاء.. وتكتمل بحضوركم في ليلة العرض الكبير'
    );
  }, [invitation]);

  const keyCastList: MovieCastMember[] = useMemo(() => {
    if (invitation.movieKeyCast && invitation.movieKeyCast.length > 0) {
      return invitation.movieKeyCast.filter((c) => c.name.trim().length > 0);
    }

    const list: MovieCastMember[] = [];
    if (invitation.category === 'graduation' || invitation.category === 'graduation_project') {
      if (invitation.graduateName) {
        list.push({
          name: invitation.graduateName,
          role: 'البطل الرئيسي • الخريج المحتفى به (Lead Honoree)',
        });
      }
      if (invitation.supervisorName) {
        list.push({
          name: invitation.supervisorName,
          role: 'الإشراف الأكاديمي (Executive Academic Advisor)',
        });
      }
      if (invitation.hostNames) {
        list.push({
          name: invitation.hostNames,
          role: 'المنتجون الفخريون • العائلة الكريمة (Executive Producers)',
        });
      }
    } else if (invitation.category === 'birthday') {
      if (invitation.birthdayStarName) {
        list.push({
          name: invitation.birthdayStarName,
          role: 'نجم العرض الأول (Star of the Night)',
        });
      }
      if (invitation.hostNames) {
        list.push({
          name: invitation.hostNames,
          role: 'إنتاج وتقديم (Presented By)',
        });
      }
    } else {
      if (invitation.groomName) {
        list.push({
          name: `${invitation.groomName} ${invitation.groomFamily || ''}`.trim(),
          role: 'البطولة الأولى • العريس (Leading Groom)',
        });
      }
      if (invitation.brideName) {
        list.push({
          name: `${invitation.brideName} ${invitation.brideFamily || ''}`.trim(),
          role: 'البطولة الأولى • العروس (Leading Bride)',
        });
      }
      if (invitation.hostNames) {
        list.push({
          name: invitation.hostNames,
          role: 'المنتجون الفخريون • الداعون (Executive Hosts)',
        });
      }
    }

    if (list.length === 0) {
      list.push({
        name: invitation.hostNames || 'أصحاب الدعوة الكرام',
        role: 'البطولة الرئيسية (Starring Hosts)',
      });
    }
    return list;
  }, [invitation]);

  const directorCredit =
    invitation.movieDirector || invitation.hostNames || 'استوديوهات مراسيم الملكية MARASEEM IMAX';
  const ratingBadge = invitation.movieRatingBadge || 'VIP PREMIERE • ALL AGES WELCOME';

  // Teaser sequence timer
  useEffect(() => {
    if (stage !== 'teaser_sequence') return;

    setTeaserBeat(0);
    if (invitation.enableOpeningSfx !== false) {
      soundEngine.playTrailerBraaam();
    }

    const t1 = setTimeout(() => {
      setTeaserBeat(1);
      if (invitation.enableOpeningSfx !== false) soundEngine.playTrailerWhooshHit();
    }, 2400);

    const t2 = setTimeout(() => {
      setTeaserBeat(2);
      if (invitation.enableOpeningSfx !== false) soundEngine.playTrailerWhooshHit();
    }, 4900);

    const t3 = setTimeout(() => {
      setTeaserBeat(3);
      if (invitation.enableOpeningSfx !== false) soundEngine.playTrailerBraaam();
    }, 7400);

    const t4 = setTimeout(() => {
      setStage('main_feature');
      if (invitation.enableOpeningSfx !== false) soundEngine.playTrailerWhooshHit();
    }, 10800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [stage, invitation.enableOpeningSfx]);

  useEffect(() => {
    return () => {
      soundEngine.stopAmbientMusic();
    };
  }, []);

  const startScoreIfNeeded = () => {
    const scoreTrack =
      invitation.musicTrack && invitation.musicTrack !== 'none'
        ? invitation.musicTrack
        : 'epic_trailer_score';
    soundEngine.startAmbientMusic(scoreTrack, invitation.customAudioUrl);
    setIsPlayingScore(true);
  };

  const handleToggleScore = () => {
    if (isPlayingScore) {
      soundEngine.stopAmbientMusic();
      setIsPlayingScore(false);
    } else {
      startScoreIfNeeded();
    }
  };

  const handleLaunchTrailer = () => {
    startScoreIfNeeded();
    setStage('teaser_sequence');
  };

  const handleSkipToFeature = () => {
    if (!isPlayingScore && invitation.musicTrack !== 'none') {
      startScoreIfNeeded();
    }
    if (invitation.enableOpeningSfx !== false) {
      soundEngine.playTrailerWhooshHit();
    }
    setStage('main_feature');
  };

  const handleSwitchAct = (targetAct: TrailerActId) => {
    if (targetAct === activeAct || isTransitioningAct) return;
    if (invitation.enableOpeningSfx !== false) {
      soundEngine.playTrailerWhooshHit();
    }
    setIsTransitioningAct(true);
    setTimeout(() => {
      setActiveAct(targetAct);
    }, 280);
    setTimeout(() => {
      setIsTransitioningAct(false);
    }, 760);
  };

  const handleStepAct = (dir: -1 | 1) => {
    const idx = TRAILER_ACTS.findIndex((a) => a.id === activeAct);
    const nextIdx = (idx + dir + TRAILER_ACTS.length) % TRAILER_ACTS.length;
    handleSwitchAct(TRAILER_ACTS[nextIdx].id);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSubmitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    const generatedCode = `IMAX-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketCode(generatedCode);
    onRSVPSubmit?.({
      invitationId: invitation.id,
      guestId: personalizedGuest?.id,
      guestName: guestName.trim(),
      phone: '',
      status,
      companionsCount: status === 'attending' ? companionsCount : 0,
      note: dietaryNotes,
    });
    setRsvpSubmitted(true);
    if (status === 'attending') {
      soundEngine.playCelebrationFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#D6B574', '#FFFDF8', '#A98445', '#38BDF8'],
      });
    }
  };

  const handleSubmitGuestbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbName.trim() || !gbMessage.trim()) return;
    onGuestbookSubmit?.({
      invitationId: invitation.id,
      senderName: gbName.trim(),
      message: gbMessage.trim(),
    });
    setGbMessage('');
    setGbSubmitted(true);
    soundEngine.playChime(659.25, 1.1);
  };

  // Helper to render animated movie title according to selected effect
  const renderAnimatedMovieTitle = (
    text: string,
    subtext?: string,
    isHeroSize = true
  ) => {
    const words = text.split(' ');

    if (activeTitleAnimation === 'letter_reveal_glow') {
      return (
        <div className="relative text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {words.map((word, wIdx) => (
              <motion.span
                key={`${word}-${wIdx}`}
                initial={{ opacity: 0, y: 26, filter: 'blur(12px)', scale: 0.85 }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                transition={{
                  duration: 0.75,
                  delay: wIdx * 0.16,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`inline-block font-bold font-serif-ar bg-gradient-to-b from-[#FFFDF8] via-[#F3D899] to-[#A98445] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(214,181,116,0.65)] ${
                  isHeroSize
                    ? 'text-3xl sm:text-5xl md:text-6xl leading-tight'
                    : 'text-2xl sm:text-4xl leading-snug'
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>
          {subtext && (
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.05em' }}
              animate={{ opacity: 1, letterSpacing: '0.18em' }}
              transition={{ duration: 1.2, delay: words.length * 0.14 + 0.2 }}
              className="mt-3 text-xs sm:text-sm text-[#D6B574] uppercase font-mono"
            >
              {subtext}
            </motion.p>
          )}
        </div>
      );
    }

    if (activeTitleAnimation === 'shatter_gold') {
      return (
        <div className="relative text-center" style={{ perspective: '900px' }}>
          <motion.h1
            initial={{ opacity: 0, rotateX: 55, scale: 1.45, z: 220, filter: 'blur(14px)' }}
            animate={{ opacity: 1, rotateX: 0, scale: 1, z: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className={`font-bold font-serif-ar bg-gradient-to-r from-[#A98445] via-[#FFFDF8] to-[#D6B574] bg-clip-text text-transparent drop-shadow-[0_14px_35px_rgba(0,0,0,0.9)] ${
              isHeroSize
                ? 'text-3xl sm:text-5xl md:text-6xl leading-tight'
                : 'text-2xl sm:text-4xl leading-snug'
            }`}
          >
            {text}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mx-auto mt-3 h-[2px] w-48 sm:w-72 bg-gradient-to-r from-transparent via-[#D6B574] to-transparent shadow-[0_0_20px_#D6B574]"
          />
          {subtext && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-2.5 text-xs sm:text-sm text-[#F8F1E5]/85 font-medium"
            >
              {subtext}
            </motion.p>
          )}
        </div>
      );
    }

    if (activeTitleAnimation === 'noir_typewriter') {
      return (
        <div className="relative text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 1] }}
            transition={{ duration: 0.45 }}
            className="inline-block px-3 py-0.5 mb-2 rounded border border-[#D6B574]/50 bg-[#D6B574]/10 text-[10px] font-mono tracking-[0.3em] text-[#D6B574] uppercase"
          >
            35MM ANAMORPHIC TEASER
          </motion.div>
          <motion.h1
            initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0.3 }}
            animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
            transition={{ duration: 1.05, ease: 'easeInOut' }}
            className={`font-bold font-serif-ar text-[#FFFDF8] tracking-wide drop-shadow-[0_0_24px_rgba(214,181,116,0.5)] ${
              isHeroSize
                ? 'text-3xl sm:text-5xl md:text-6xl leading-tight'
                : 'text-2xl sm:text-4xl leading-snug'
            }`}
          >
            {text}
          </motion.h1>
          {subtext && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-3 text-xs sm:text-sm text-[#D6B574] font-mono tracking-widest"
            >
              {subtext}
            </motion.p>
          )}
        </div>
      );
    }

    // Default: 'epic_zoom_flare'
    return (
      <div className="relative text-center overflow-visible">
        <motion.h1
          initial={{ opacity: 0, scale: 0.72, filter: 'blur(16px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
          className={`relative z-10 font-bold font-serif-ar bg-gradient-to-b from-[#FFFFFF] via-[#F6E2B3] to-[#B68D46] bg-clip-text text-transparent drop-shadow-[0_10px_40px_rgba(214,181,116,0.55)] ${
            isHeroSize
              ? 'text-3xl sm:text-5xl md:text-6xl leading-tight'
              : 'text-2xl sm:text-4xl leading-snug'
          }`}
        >
          {text}
        </motion.h1>

        {/* Horizontal Anamorphic Blue/Gold Lens Flare Sweep */}
        <motion.div
          initial={{ x: '-120%', opacity: 0 }}
          animate={{ x: '120%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.6, delay: 0.2, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1.5 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent blur-[1px] z-20"
        />
        <motion.div
          initial={{ scaleX: 0.2, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.85 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="mx-auto mt-3 h-[1px] w-56 sm:w-80 bg-gradient-to-r from-transparent via-[#D6B574] to-transparent shadow-[0_0_25px_#38BDF8]"
        />

        {subtext && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-3 text-xs sm:text-sm text-[#F8F1E5]/90 tracking-wide"
          >
            {subtext}
          </motion.p>
        )}
      </div>
    );
  };

  // Dramatic Section Transition Variants
  const getActMotionProps = () => {
    switch (activeTransitionStyle) {
      case 'dramatic_fade_through_black':
        return {
          initial: { opacity: 0, filter: 'brightness(0) blur(8px)' },
          animate: { opacity: 1, filter: 'brightness(1) blur(0px)' },
          exit: { opacity: 0, filter: 'brightness(0) blur(8px)' },
          transition: { duration: 0.55, ease: 'easeInOut' as const },
        };
      case 'shutter_cut':
        return {
          initial: { clipPath: 'inset(50% 0% 50% 0%)', opacity: 0.2 },
          animate: { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 },
          exit: { clipPath: 'inset(50% 0% 50% 0%)', opacity: 0.2 },
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
        };
      case 'zoom_impact':
        return {
          initial: { opacity: 0, scale: 1.28, filter: 'blur(12px)' },
          animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, scale: 0.82, filter: 'blur(10px)' },
          transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        };
      case 'anamorphic_flare_wipe':
      default:
        return {
          initial: { opacity: 0, x: 40, filter: 'blur(6px)' },
          animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, x: -40, filter: 'blur(6px)' },
          transition: { duration: 0.5, ease: 'easeOut' as const },
        };
    }
  };

  const actMotion = getActMotionProps();

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className="relative min-h-screen w-full bg-[#07060A] text-[#F8F1E5] overflow-x-hidden flex flex-col justify-between select-none"
    >
      {/* Top Cinema Widescreen Letterbox Bar */}
      <div className="sticky top-0 z-40 h-11 sm:h-12 bg-black/95 border-b border-[#D6B574]/30 px-3 sm:px-6 flex items-center justify-between text-[11px] font-mono text-[#D6B574]">
        <div className="flex items-center gap-2">
          <Clapperboard size={14} className="text-[#D6B574]" />
          <span className="tracking-[0.2em] uppercase font-bold">MARASEEM IMAX 70MM</span>
          <span className="hidden sm:inline text-[#F8F1E5]/40">|</span>
          <span className="hidden sm:inline text-[#F8F1E5]/75 truncate max-w-[220px]">
            {movieTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {stage === 'main_feature' && (
            <button
              type="button"
              onClick={() => {
                setStage('teaser_sequence');
                if (!isPlayingScore && invitation.musicTrack !== 'none') {
                  startScoreIfNeeded();
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-[#D6B574]/15 hover:bg-[#D6B574]/30 border border-[#D6B574]/40 text-[#D6B574] flex items-center gap-1 text-[10px] font-sans font-bold cursor-pointer transition-colors"
            >
              <RotateCcw size={11} />
              <span>إعادة التتر التشويقي</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleScore}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-[10px] font-sans font-bold cursor-pointer transition-all ${
              isPlayingScore
                ? 'bg-[#D6B574] text-[#17130F] border-white shadow-[0_0_15px_rgba(214,181,116,0.5)]'
                : 'bg-white/5 text-[#F8F1E5]/80 border-[#D6B574]/40 hover:border-[#D6B574]'
            }`}
          >
            {isPlayingScore ? <Volume2 size={12} /> : <VolumeX size={12} />}
            <span>{isPlayingScore ? 'الموسيقى التصويرية: تعمل' : 'تشغيل الموسيقى التصويرية'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[#D6B574]/30 text-[#D6B574] cursor-pointer"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Subtle Ambient Film Grain + Projector Dust + Anamorphic Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[320px] rounded-full opacity-25 blur-[110px]"
          style={{
            background:
              'radial-gradient(circle, rgba(214,181,116,0.65) 0%, rgba(56,189,248,0.25) 55%, transparent 80%)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[560px] h-[260px] rounded-full opacity-20 blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(169,132,69,0.55) 0%, rgba(18,61,50,0.25) 60%, transparent 80%)',
          }}
        />
      </div>

      {/* Transition Overlay Effect when switching acts */}
      <AnimatePresence>
        {isTransitioningAct && (
          <motion.div
            key="act-transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          >
            {activeTransitionStyle === 'anamorphic_flare_wipe' && (
              <motion.div
                initial={{ x: '-110%' }}
                animate={{ x: '110%' }}
                transition={{ duration: 0.68, ease: 'easeInOut' }}
                className="w-full h-32 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent blur-md opacity-90 flex items-center justify-center"
              >
                <div className="w-full h-3 bg-gradient-to-r from-transparent via-[#FFFDF8] to-transparent shadow-[0_0_50px_#D6B574]" />
              </motion.div>
            )}
            {activeTransitionStyle === 'dramatic_fade_through_black' && (
              <div className="inset-0 absolute bg-black/95 flex items-center justify-center">
                <div className="w-40 h-[1px] bg-[#D6B574]/60 shadow-[0_0_30px_#D6B574]" />
              </div>
            )}
            {activeTransitionStyle === 'shutter_cut' && (
              <div className="inset-0 absolute flex flex-col justify-between bg-black/80">
                <motion.div
                  initial={{ height: '0%' }}
                  animate={{ height: '50%' }}
                  exit={{ height: '0%' }}
                  className="w-full bg-[#07060A] border-b border-[#D6B574]/50"
                />
                <motion.div
                  initial={{ height: '0%' }}
                  animate={{ height: '50%' }}
                  exit={{ height: '0%' }}
                  className="w-full bg-[#07060A] border-t border-[#D6B574]/50"
                />
              </div>
            )}
            {activeTransitionStyle === 'zoom_impact' && (
              <div className="w-96 h-96 rounded-full border-2 border-[#D6B574]/60 animate-ping opacity-40" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAGE 1: MPAA / ROYAL GOLD-BAND RATING SLATE & CLAPPERBOARD OPENER */}
      {stage === 'rating_slate' && (
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-3xl border-2 border-[#D6B574]/70 bg-gradient-to-b from-[#131915] via-[#0B110E] to-[#07060A] p-6 sm:p-10 shadow-[0_25px_90px_rgba(0,0,0,0.95)] text-center space-y-6 relative overflow-hidden"
          >
            {/* Gold Corner Filigree accents */}
            <div className="w-10 h-10 border-t-2 border-r-2 border-[#D6B574] absolute top-4 right-4 opacity-70" />
            <div className="w-10 h-10 border-t-2 border-l-2 border-[#D6B574] absolute top-4 left-4 opacity-70" />
            <div className="w-10 h-10 border-b-2 border-r-2 border-[#D6B574] absolute bottom-4 right-4 opacity-70" />
            <div className="w-10 h-10 border-b-2 border-l-2 border-[#D6B574] absolute bottom-4 left-4 opacity-70" />

            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D6B574]/15 border border-[#D6B574]/50 text-[#D6B574] text-[11px] font-mono tracking-[0.2em] uppercase">
              <Film size={13} />
              <span>OFFICIAL MOTION PICTURE TRAILER PREVIEW</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono tracking-[0.25em] text-[#D6B574]/80 uppercase">
                THE FOLLOWING PREVIEW HAS BEEN APPROVED FOR
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-[#FFFDF8] tracking-wide font-serif-ar">
                {personalizedGuest?.name
                  ? `الضيف الكريم: ${personalizedGuest.name}`
                  : 'جميع الضيوف الكرام وأحباب العائلة'}
              </h2>
              <p className="text-xs text-[#F8F1E5]/70 max-w-lg mx-auto leading-relaxed">
                الفيلم التشويقي المصاحب لهذه الدعوة مصمم بتقنية الصوت السينمائي المحيطي وحركات العناوين الدرامية.
              </p>
            </div>

            {/* Official Rating Box */}
            <div className="max-w-md mx-auto rounded-2xl border border-[#D6B574]/60 bg-black/60 p-4 flex items-center justify-between gap-4">
              <div className="px-3.5 py-2 rounded-xl border-2 border-[#D6B574] bg-[#D6B574]/10 text-[#D6B574] font-mono font-bold text-lg tracking-widest shrink-0">
                VIP
              </div>
              <div className="text-right flex-1 min-w-0">
                <div className="text-xs font-bold text-[#FFFDF8] truncate">{movieTitle}</div>
                <div className="text-[10px] font-mono text-[#D6B574] truncate">{ratingBadge}</div>
                <div className="text-[10px] text-[#F8F1E5]/65 mt-0.5">
                  إخراج وتقديم: {directorCredit}
                </div>
              </div>
            </div>

            {/* Interactive Clapperboard Launch Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLaunchTrailer}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D6B574] via-[#F3D899] to-[#A98445] text-[#17130F] font-bold text-sm sm:text-base shadow-[0_0_35px_rgba(214,181,116,0.5)] hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Play size={18} className="fill-current" />
                <span>تشغيل الإعلان السينمائي التشويقي • Play Trailer</span>
              </button>

              <button
                type="button"
                onClick={handleSkipToFeature}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-[#D6B574]/40 text-[#F8F1E5]/85 text-xs font-bold cursor-pointer transition-colors"
              >
                تخطي المقدمة إلى تفاصيل الفيلم ←
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* STAGE 2: MULTI-BEAT ANIMATED MOVIE TITLE TEASER SEQUENCE */}
      {stage === 'teaser_sequence' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
          <AnimatePresence mode="wait">
            {teaserBeat === 0 && (
              <motion.div
                key="beat-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.12, filter: 'blur(10px)' }}
                transition={{ duration: 0.7 }}
                className="text-center space-y-4 max-w-2xl"
              >
                <div className="text-xs font-mono tracking-[0.35em] text-[#D6B574] uppercase">
                  MARASEEM ROYAL STUDIOS PRESENTS
                </div>
                {renderAnimatedMovieTitle(
                  'في عالمٍ تُصنع فيه الذكريات الخالدة...',
                  'IN A WORLD WHERE TIMELESS MEMORIES ARE BORN',
                  false
                )}
              </motion.div>
            )}

            {teaserBeat === 1 && (
              <motion.div
                key="beat-1"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.12, filter: 'blur(10px)' }}
                transition={{ duration: 0.7 }}
                className="text-center space-y-4 max-w-2xl"
              >
                <div className="text-xs font-mono tracking-[0.35em] text-[#38BDF8] uppercase">
                  STARRING THE HONOREES OF THE NIGHT
                </div>
                {renderAnimatedMovieTitle(
                  keyCastList.map((c) => c.name).join('  ✦  '),
                  directorCredit,
                  false
                )}
              </motion.div>
            )}

            {teaserBeat === 2 && (
              <motion.div
                key="beat-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.12, filter: 'blur(10px)' }}
                transition={{ duration: 0.7 }}
                className="text-center space-y-4 max-w-2xl"
              >
                <div className="text-xs font-mono tracking-[0.35em] text-[#D6B574] uppercase">
                  COMING TO THE GRAND THEATRE ON
                </div>
                {renderAnimatedMovieTitle(
                  invitation.eventDate || '2026-12-01',
                  `${invitation.venueName} • ${invitation.city}`,
                  false
                )}
              </motion.div>
            )}

            {teaserBeat >= 3 && (
              <motion.div
                key="beat-3"
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
                className="text-center space-y-5 max-w-3xl"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D6B574]/20 border border-[#D6B574] text-[#D6B574] text-[11px] font-mono tracking-[0.25em] uppercase">
                  <Sparkles size={12} />
                  <span>OFFICIAL PREMIERE TITLE</span>
                </div>
                {renderAnimatedMovieTitle(movieTitle, movieTagline, true)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Teaser Progress & Skip */}
          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((b) => (
                <div
                  key={b}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    teaserBeat === b ? 'w-10 bg-[#D6B574]' : 'w-2.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleSkipToFeature}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-[#D6B574]/40 text-[11px] text-[#D6B574] font-bold cursor-pointer"
            >
              الدخول المباشر إلى فصول الفيلم ←
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: MAIN INTERACTIVE MOVIE TRAILER FEATURE (4 DRAMATIC ACTS) */}
      {stage === 'main_feature' && (
        <div className="relative z-10 flex-1 flex flex-col justify-between max-w-5xl w-full mx-auto px-3 sm:px-6 py-5 gap-6">
          {/* Top Act Selector Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/70 p-2 rounded-2xl border border-[#D6B574]/35 backdrop-blur-md">
            {TRAILER_ACTS.map((act) => {
              const Icon = act.icon;
              const isSelected = activeAct === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handleSwitchAct(act.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-gradient-to-l from-[#D6B574] to-[#A98445] text-[#17130F] border-white font-bold shadow-[0_0_20px_rgba(214,181,116,0.4)]'
                      : 'bg-[#121016]/90 text-[#F8F1E5]/80 border-[#D6B574]/25 hover:border-[#D6B574]/60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#17130F] text-[#D6B574]' : 'bg-[#D6B574]/15 text-[#D6B574]'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-[9px] font-mono tracking-widest uppercase ${
                        isSelected ? 'text-[#17130F]/80' : 'text-[#D6B574]'
                      }`}
                    >
                      {act.actNumber}
                    </div>
                    <div className="text-xs font-bold truncate">{act.titleAr}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Animated Act Viewport */}
          <div className="relative min-h-[460px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {/* ACT I: OFFICIAL TRAILER TITLE, POSTER & SYNOPSIS */}
              {activeAct === 'act_synopsis' && (
                <motion.div
                  key="act_synopsis"
                  initial={actMotion.initial}
                  animate={actMotion.animate}
                  exit={actMotion.exit}
                  transition={actMotion.transition}
                  className="w-full rounded-3xl border border-[#D6B574]/50 bg-gradient-to-b from-[#141118]/95 via-[#0B090E]/95 to-[#07060A]/95 p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-7 relative overflow-hidden"
                >
                  {invitation.coverImage && (
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <img
                        src={invitation.coverImage}
                        alt=""
                        className="w-full h-full object-cover filter contrast-125"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07060A] via-[#07060A]/80 to-transparent" />
                    </div>
                  )}

                  <div className="relative z-10 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D6B574]/15 border border-[#D6B574]/50 text-[#D6B574] text-[10px] font-mono tracking-[0.25em] uppercase">
                      <Film size={12} />
                      <span>A MARASEEM ORIGINAL BLOCKBUSTER PRODUCTION</span>
                    </div>

                    {/* Main Animated Movie Title */}
                    <div className="py-2">
                      {renderAnimatedMovieTitle(movieTitle, movieTagline, true)}
                    </div>

                    {/* Synopsis / Invitation Body */}
                    <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-black/65 border border-[#D6B574]/35 backdrop-blur-md space-y-3">
                      <div className="text-[11px] font-mono text-[#D6B574] tracking-widest uppercase">
                        OFFICIAL STORYLINE • ملخص القصة والدعوة
                      </div>
                      <p className="text-sm sm:text-base text-[#F8F1E5]/95 leading-relaxed font-serif-ar">
                        {invitation.invitationBody}
                      </p>
                      {invitation.ceremonyScheduleText && (
                        <p className="text-xs text-[#D6B574]/90 pt-2 border-t border-[#D6B574]/20">
                          ✦ برنامج العرض: {invitation.ceremonyScheduleText}
                        </p>
                      )}
                    </div>

                    {/* Quick Cast Billing Preview */}
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      {keyCastList.map((member, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-[#D6B574]/40 text-center"
                        >
                          <div className="text-[10px] font-mono text-[#D6B574] uppercase">
                            {member.role}
                          </div>
                          <div className="text-sm font-bold text-[#FFFDF8] font-serif-ar">
                            {member.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ACT II: KEY CAST & HOLLYWOOD BILLING BLOCK */}
              {activeAct === 'act_cast' && (
                <motion.div
                  key="act_cast"
                  initial={actMotion.initial}
                  animate={actMotion.animate}
                  exit={actMotion.exit}
                  transition={actMotion.transition}
                  className="w-full rounded-3xl border border-[#D6B574]/50 bg-gradient-to-b from-[#141118]/95 via-[#0B090E]/95 to-[#07060A]/95 p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-6"
                >
                  <div className="text-center space-y-2">
                    <span className="text-[11px] font-mono tracking-[0.3em] text-[#D6B574] uppercase">
                      ACT II • STARRING & KEY CAST
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-bold font-serif-ar text-[#FFFDF8]">
                      أبطال الليلة وطاقم البطولة
                    </h2>
                    <p className="text-xs text-[#F8F1E5]/70">
                      النجوم وأصحاب الدعوة الذين يتشرفون بمشاركتكم هذا العرض التاريخي
                    </p>
                  </div>

                  {/* Key Cast Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {keyCastList.map((cast, index) => (
                      <motion.div
                        key={`${cast.name}-${index}`}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.12 }}
                        className="p-5 rounded-2xl bg-gradient-to-b from-[#1E1924] to-[#0D0B10] border border-[#D6B574]/50 shadow-lg flex flex-col justify-between gap-3 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#D6B574]/20 border border-[#D6B574]/50 text-[#D6B574] text-[10px] font-mono">
                            STAR #{index + 1}
                          </span>
                          <Star size={15} className="text-[#D6B574] fill-[#D6B574]" />
                        </div>

                        <div className="space-y-1 my-1">
                          <div className="text-xl font-bold text-[#FFFDF8] font-serif-ar">
                            {cast.name}
                          </div>
                          <div className="text-xs text-[#D6B574] font-medium">{cast.role}</div>
                        </div>

                        <div className="pt-2 border-t border-[#D6B574]/20 flex items-center justify-between text-[10px] font-mono text-[#F8F1E5]/60">
                          <span>FEATURED HONOREE</span>
                          <span>{ movieTitle }</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Classic Hollywood Movie Poster Billing Block */}
                  <div className="mt-6 p-5 rounded-2xl bg-black/80 border border-[#D6B574]/30 text-center space-y-2">
                    <div className="text-[10px] font-mono tracking-[0.25em] text-[#D6B574] uppercase">
                      OFFICIAL MOTION PICTURE BILLING BLOCK
                    </div>
                    <p className="text-[11px] sm:text-xs font-mono tracking-wider text-[#F8F1E5]/70 uppercase leading-relaxed">
                      MARASEEM STUDIOS PRESENTS A ROYAL PRODUCTION &ldquo;{movieTitle}&rdquo; STARRING{' '}
                      {keyCastList.map((c) => c.name).join(' • ')} — DIRECTED & HOSTED BY{' '}
                      {directorCredit} — PREMIERING AT {invitation.venueName} ({invitation.city}) ON{' '}
                      {invitation.eventDate} AT {invitation.eventTime}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ACT III: PREMIERE RELEASE DATE, COUNTDOWN & IMAX VENUE */}
              {activeAct === 'act_release' && (
                <motion.div
                  key="act_release"
                  initial={actMotion.initial}
                  animate={actMotion.animate}
                  exit={actMotion.exit}
                  transition={actMotion.transition}
                  className="w-full rounded-3xl border border-[#D6B574]/50 bg-gradient-to-b from-[#141118]/95 via-[#0B090E]/95 to-[#07060A]/95 p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-6"
                >
                  <div className="text-center space-y-2">
                    <span className="text-[11px] font-mono tracking-[0.3em] text-[#D6B574] uppercase">
                      ACT III • WORLD PREMIERE & THEATRE LOCATION
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-bold font-serif-ar text-[#FFFDF8]">
                      موعد العرض الأول وموقع المسرح الملكي
                    </h2>
                  </div>

                  {/* Release Date Slate */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-black/65 border border-[#D6B574]/40 text-center space-y-1">
                      <Calendar size={20} className="mx-auto text-[#D6B574]" />
                      <div className="text-[10px] font-mono text-[#D6B574] uppercase">
                        RELEASE DATE • تاريخ العرض
                      </div>
                      <div className="text-lg font-bold text-[#FFFDF8]">{invitation.eventDate}</div>
                      {invitation.hijriDate && (
                        <div className="text-xs text-[#F8F1E5]/70">{invitation.hijriDate}</div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-black/65 border border-[#D6B574]/40 text-center space-y-1">
                      <Clock size={20} className="mx-auto text-[#D6B574]" />
                      <div className="text-[10px] font-mono text-[#D6B574] uppercase">
                        RED CARPET TIME • السجادة الحمراء
                      </div>
                      <div className="text-lg font-bold text-[#FFFDF8]">{invitation.eventTime}</div>
                      {invitation.dressCode && (
                        <div className="text-xs text-[#D6B574]">الزي: {invitation.dressCode}</div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-black/65 border border-[#D6B574]/40 text-center space-y-1">
                      <MapPin size={20} className="mx-auto text-[#D6B574]" />
                      <div className="text-[10px] font-mono text-[#D6B574] uppercase">
                        PREMIERE THEATRE • قاعة العرض
                      </div>
                      <div className="text-base font-bold text-[#FFFDF8]">
                        {invitation.venueName}
                      </div>
                      <div className="text-xs text-[#F8F1E5]/75">
                        {invitation.city} — {invitation.addressDetails}
                      </div>
                    </div>
                  </div>

                  {/* Live Countdown */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-[#D6B574]/30">
                    <CountdownTimer
                      eventDate={invitation.eventDate}
                      eventTime={invitation.eventTime}
                      title={invitation.countdownTitle || 'العد التنازلي لانطلاق العرض الأول'}
                      stylePreset={invitation.countdownStyle || 'gold_luxury'}
                      digitColor={invitation.countdownDigitColor || 'champagne_gold'}
                      digitFont={invitation.countdownDigitFont || 'amiri_royal'}
                      numeralSystem={invitation.countdownNumeralSystem || 'arabic_indic'}
                      showSeconds={invitation.showSecondsInCountdown !== false}
                      celebrationText={
                        invitation.countdownCelebrationText ||
                        'انطلق العرض السينمائي الكبير! أهلاً بكم على السجادة الحمراء 🎬'
                      }
                    />
                  </div>

                  {/* Maps & Calendar Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {invitation.googleMapsUrl && (
                      <a
                        href={invitation.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 rounded-xl bg-[#D6B574] text-[#17130F] font-bold text-xs flex items-center gap-2 shadow-md hover:brightness-110 transition-all"
                      >
                        <MapPin size={15} />
                        <span>فتح موقع القاعة على خرائط Google</span>
                      </a>
                    )}

                    <a
                      href={getGoogleCalendarUrl(invitation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-[#D6B574]/50 text-[#FFFDF8] font-bold text-xs flex items-center gap-2 transition-all"
                    >
                      <Calendar size={15} className="text-[#D6B574]" />
                      <span>حفظ موعد العرض في تقويم Google</span>
                    </a>
                  </div>
                </motion.div>
              )}

              {/* ACT IV: VIP BOX OFFICE TICKET RSVP & CRITICS GUESTBOOK */}
              {activeAct === 'act_box_office' && (
                <motion.div
                  key="act_box_office"
                  initial={actMotion.initial}
                  animate={actMotion.animate}
                  exit={actMotion.exit}
                  transition={actMotion.transition}
                  className="w-full rounded-3xl border border-[#D6B574]/50 bg-gradient-to-b from-[#141118]/95 via-[#0B090E]/95 to-[#07060A]/95 p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-7"
                >
                  <div className="text-center space-y-2">
                    <span className="text-[11px] font-mono tracking-[0.3em] text-[#D6B574] uppercase">
                      ACT IV • VIP BOX OFFICE & PREMIERE TICKETS
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-bold font-serif-ar text-[#FFFDF8]">
                      شباك تذاكر كبار الشخصيات (VIP RSVP)
                    </h2>
                    <p className="text-xs text-[#F8F1E5]/75">
                      احجز تذكرتك الذهبية للعرض الأول أو اترك تهنئتك في سجل النقاد والضيوف
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Box Office Ticket Form / Issued Golden Ticket */}
                    <div className="p-5 rounded-2xl bg-black/70 border border-[#D6B574]/45 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#D6B574]/25 pb-3">
                        <div className="flex items-center gap-2 text-[#D6B574] font-bold text-sm">
                          <Ticket size={17} />
                          <span>إصدار تذكرة الحضور الملكية</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#D6B574]">ADMIT VIP</span>
                      </div>

                      {rsvpSubmitted ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 rounded-2xl bg-gradient-to-r from-[#D6B574] via-[#F5DFAA] to-[#A98445] text-[#17130F] shadow-[0_12px_40px_rgba(214,181,116,0.45)] space-y-3 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between border-b border-[#17130F]/20 pb-2 text-[10px] font-mono font-bold">
                            <span>MARASEEM IMAX PREMIERE PASS</span>
                            <span>{ticketCode}</span>
                          </div>
                          <div className="text-lg font-bold font-serif-ar">{movieTitle}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="opacity-70 block text-[10px]">اسم الضيف VIP:</span>
                              <span className="font-bold">{guestName}</span>
                            </div>
                            <div>
                              <span className="opacity-70 block text-[10px]">عدد المقاعد:</span>
                              <span className="font-bold">
                                {status === 'attending' ? `${companionsCount} مقعد ملكي` : 'اعتذار عن الحضور'}
                              </span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-dashed border-[#17130F]/30 flex items-center justify-between text-[10px] font-mono">
                            <span>{invitation.eventDate} • {invitation.eventTime}</span>
                            <span className="font-bold flex items-center gap-1">
                              <Check size={12} /> تم الحجز بنجاح
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSubmitRSVP} className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-[#D6B574] mb-1">
                              اسم الضيف (يُطبع على تذكرة العرض) *
                            </label>
                            <input
                              type="text"
                              required
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              placeholder="الاسم الكامل..."
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141118] border border-[#D6B574]/40 text-sm text-[#FFFDF8] outline-none focus:border-[#D6B574]"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'attending' as const, label: 'سأحضر العرض 🎬' },
                              { id: 'tentative' as const, label: 'ربما' },
                              { id: 'declined' as const, label: 'أعتذر' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setStatus(opt.id)}
                                className={`py-2 px-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                  status === opt.id
                                    ? 'bg-[#D6B574] text-[#17130F] border-white'
                                    : 'bg-[#141118] text-[#F8F1E5]/80 border-[#D6B574]/30'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          {status === 'attending' && (
                            <div>
                              <label className="block text-xs font-bold text-[#D6B574] mb-1">
                                عدد المقاعد المطلوبة (شاملاً شخصكم الكريم)
                              </label>
                              <select
                                value={companionsCount}
                                onChange={(e) => setCompanionsCount(Number(e.target.value))}
                                className="w-full px-3.5 py-2 rounded-xl bg-[#141118] border border-[#D6B574]/40 text-sm text-[#FFFDF8] outline-none"
                              >
                                {Array.from(
                                  { length: invitation.maxGuestsPerInvite || 4 },
                                  (_, i) => i + 1
                                ).map((n) => (
                                  <option key={n} value={n}>
                                    {n} {n === 1 ? 'مقعد VIP واحد' : `مقاعد (${n})`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-bold text-[#F8F1E5]/75 mb-1">
                              ملاحظات خاصة لشباك التذاكر (اختياري)
                            </label>
                            <input
                              type="text"
                              value={dietaryNotes}
                              onChange={(e) => setDietaryNotes(e.target.value)}
                              placeholder="مثال: مقاعد قريبة من المسرح..."
                              className="w-full px-3.5 py-2 rounded-xl bg-[#141118] border border-[#D6B574]/30 text-xs text-[#FFFDF8] outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D6B574] to-[#A98445] text-[#17130F] font-bold text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer"
                          >
                            إصدار تذكرة العرض الأول الآن 🎟️
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Right: Audience & Critics Guestbook */}
                    <div className="p-5 rounded-2xl bg-black/70 border border-[#D6B574]/45 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#D6B574]/25 pb-3">
                          <div className="flex items-center gap-2 text-[#D6B574] font-bold text-sm">
                            <Award size={17} />
                            <span>سجل التهاني وإشادات الضيوف</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#D6B574]">
                            ★★★★★ 100% FRESH
                          </span>
                        </div>

                        <form onSubmit={handleSubmitGuestbook} className="space-y-2.5">
                          <input
                            type="text"
                            required
                            value={gbName}
                            onChange={(e) => setGbName(e.target.value)}
                            placeholder="اسمك الكريم..."
                            className="w-full px-3 py-2 rounded-xl bg-[#141118] border border-[#D6B574]/35 text-xs text-[#FFFDF8] outline-none"
                          />
                          <textarea
                            rows={2}
                            required
                            value={gbMessage}
                            onChange={(e) => setGbMessage(e.target.value)}
                            placeholder="اكتب كلمة تهنئة لأبطال الليلة..."
                            className="w-full px-3 py-2 rounded-xl bg-[#141118] border border-[#D6B574]/35 text-xs text-[#FFFDF8] outline-none resize-none"
                          />
                          <button
                            type="submit"
                            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-[#D6B574]/50 text-[#D6B574] text-xs font-bold cursor-pointer"
                          >
                            {gbSubmitted ? 'تمت إضافة التهنئة ✨ إرسال أخرى' : 'نشر التهنئة على شاشة العرض'}
                          </button>
                        </form>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 pt-2 border-t border-[#D6B574]/20">
                        {guestbookMessages.length === 0 ? (
                          <p className="text-[11px] text-[#F8F1E5]/50 text-center py-2">
                            كن أول من يكتب إشادة وتهنئة لأبطال هذا العرض السينمائي!
                          </p>
                        ) : (
                          guestbookMessages.map((m) => (
                            <div
                              key={m.id}
                              className="p-2.5 rounded-xl bg-[#141118] border border-[#D6B574]/25 text-xs"
                            >
                              <div className="flex items-center justify-between text-[#D6B574] font-bold mb-0.5">
                                <span>{m.senderName}</span>
                                <span className="text-[10px]">★★★★★</span>
                              </div>
                              <p className="text-[#F8F1E5]/85 text-[11px]">{m.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Cinema FX Switcher & Act Controls Bar */}
          <div className="rounded-2xl bg-black/85 border border-[#D6B574]/35 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Prev / Next Act Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
              <button
                type="button"
                onClick={() => handleStepAct(-1)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#D6B574]/35 text-xs font-bold text-[#F8F1E5] flex items-center gap-1 cursor-pointer"
              >
                <ChevronRight size={14} />
                <span>الفصل السابق</span>
              </button>

              <button
                type="button"
                onClick={() => handleStepAct(1)}
                className="px-3.5 py-2 rounded-xl bg-[#D6B574] text-[#17130F] text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>الفصل التالي</span>
                <ChevronLeft size={14} />
              </button>
            </div>

            {/* Live Title Effect & Dramatic Transition Switchers */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 bg-[#141118] px-2.5 py-1.5 rounded-xl border border-[#D6B574]/35">
                <Wand2 size={13} className="text-[#D6B574]" />
                <span className="text-[#F8F1E5]/70">تأثير العنوان:</span>
                <select
                  value={activeTitleAnimation}
                  onChange={(e) => {
                    setTitleAnimOverride(e.target.value as MovieTitleAnimationStyle);
                    if (invitation.enableOpeningSfx !== false) soundEngine.playTrailerBraaam();
                  }}
                  className="bg-transparent text-[#D6B574] font-bold outline-none cursor-pointer"
                >
                  {MOVIE_TITLE_ANIMATION_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-[#17130F] text-[#F8F1E5]">
                      {opt.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#141118] px-2.5 py-1.5 rounded-xl border border-[#D6B574]/35">
                <Layers size={13} className="text-[#D6B574]" />
                <span className="text-[#F8F1E5]/70">انتقال المشاهد:</span>
                <select
                  value={activeTransitionStyle}
                  onChange={(e) => {
                    setTransitionOverride(e.target.value as MovieTransitionStyle);
                    if (invitation.enableOpeningSfx !== false) soundEngine.playTrailerWhooshHit();
                  }}
                  className="bg-transparent text-[#D6B574] font-bold outline-none cursor-pointer"
                >
                  {MOVIE_TRANSITION_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-[#17130F] text-[#F8F1E5]">
                      {opt.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🎬 يسرنا دعوتكم لحضور العرض الأول: ${movieTitle}\n${buildShareableInvitationUrl(invitation)}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-700/90 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5"
              >
                <Share2 size={12} />
                <span>مشاركة الإعلان</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Cinema Widescreen Letterbox Bar */}
      <div className="h-9 bg-black/95 border-t border-[#D6B574]/25 px-4 flex items-center justify-between text-[10px] font-mono text-[#F8F1E5]/50">
        <span>DOLBY ATMOS • ANAMORPHIC 2.39:1</span>
        <span>MARASEEM MOTION PICTURE INVITATION SYSTEM</span>
      </div>
    </div>
  );
};
