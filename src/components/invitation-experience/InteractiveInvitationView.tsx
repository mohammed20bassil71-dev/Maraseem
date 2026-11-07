import React, { useState, useEffect, useRef } from 'react';
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
  FileImage,
  CalendarPlus,
  Languages,
  Download,
  Play,
  Pause,
  Video,
  Rotate3d,
  MousePointerClick,
  Smartphone,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  InvitationData,
  RSVPRecord,
  GuestbookMessage,
  VisualEffectType,
  ClickInteractionEffectType,
  ClickEffectSpeed,
  RoyalVisualDirection,
  OpenerStyle3D,
  InvitationSectionId,
} from '../../types/invitation';
import {
  MovieTrailerInvitationExperience,
  isMovieTrailerInvitation,
} from './MovieTrailerInvitationExperience';
import {
  INVITATION_CLICK_EFFECT_OPTIONS,
  CLICK_EFFECT_SPEED_OPTIONS,
  dispatchClickEffectPreview,
} from '../engine/MaraseemMagicEffectsSystem';
import { CinematicColorFilter } from '../../types/birthdayExperience';
import {
  COLOR_FILTERS_LIBRARY,
  createArtisticSvgDataUri,
  getColorFilterMeta,
} from '../../data/birthdayTemplates';
import { EnvelopeOpenExperience } from './EnvelopeOpenExperience';
import { FilmStripExperience } from './FilmStripExperience';
import { HennaExperience } from './HennaExperience';
import { BirthdayCakeExperience } from './BirthdayCakeExperience';
import { GraduationScrollExperience } from './GraduationScrollExperience';
import { RibbonCutExperience } from './RibbonCutExperience';
import { AtelierSignatureExperience } from './AtelierSignatureExperience';
import { EngagementRingExperience } from './EngagementRingExperience';
import {
  StageCurtainExperience,
  Royal3DBookExperience,
  Royal3DFlowersButterfliesLayer,
  ROYAL_VISUAL_DIRECTIONS,
  DEFAULT_INVITATION_SECTION_ORDER,
  INVITATION_SECTION_META,
} from './StageCurtainExperience';
import {
  Royal3DLuxuryInvitationExperience,
  isRoyal3DCollectionTemplate,
} from '../royal3d/Royal3DLuxuryInvitationExperience';
import { Lock, Upload, Image as ImageIcon } from 'lucide-react';
import {
  AmbientVisualEffects,
  resolveVisualEffect,
  VISUAL_EFFECT_OPTIONS,
} from './AmbientVisualEffects';
import { soundEngine } from '../../utils/audio';
import { downloadInvitationCard } from '../../utils/cardGenerator';
import { downloadIcsFile, getGoogleCalendarUrl } from '../../utils/calendar';
import {
  buildShareableInvitationUrl,
  parsePersonalizedGuestFromLocation,
  PersonalizedGuestContext,
} from '../../utils/shareLink';
import { CountdownTimer } from '../countdown/CountdownTimer';
import { WeddingMemoriesView } from '../memories/WeddingMemoriesView';
import {
  get3DCardFlipVariants,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from '../engine/motion-mapper';
import QRCodeLib from 'qrcode';
import html2canvas from 'html2canvas';

interface InteractiveInvitationViewProps {
  invitation: InvitationData;
  onSaveRSVP?: (rsvp: Omit<RSVPRecord, 'id' | 'createdAt'>) => void;
  onAddGuestbook?: (message: Omit<GuestbookMessage, 'id' | 'createdAt'>) => void;
  onUpdateInvitation?: (updated: InvitationData) => void;
  guestbookMessages?: GuestbookMessage[];
  existingRSVPs?: RSVPRecord[];
  isEmbeddedPreview?: boolean;
  isStandaloneGuest?: boolean;
  personalizedGuestOverride?: PersonalizedGuestContext | null;
}

export const InteractiveInvitationView: React.FC<InteractiveInvitationViewProps> = ({
  invitation,
  onSaveRSVP,
  onAddGuestbook,
  onUpdateInvitation,
  guestbookMessages = [],
  existingRSVPs = [],
  isEmbeddedPreview = false,
  isStandaloneGuest = false,
  personalizedGuestOverride = null,
}) => {
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [enable3DFlip, setEnable3DFlip] = useState<boolean>(true);
  const [visualEffectOverride, setVisualEffectOverride] = useState<VisualEffectType | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showImageSavedToast, setShowImageSavedToast] = useState(false);
  const frontCardRef = useRef<HTMLDivElement | null>(null);
  const exportCardCaptureRef = useRef<HTMLDivElement | null>(null);
  const [showMemoriesMode, setShowMemoriesMode] = useState<boolean>(
    Boolean(invitation.memoriesConfig?.isPostEventActive)
  );
  const [isMobileFullscreenMode, setIsMobileFullscreenMode] = useState<boolean>(false);
  const [show3DModelsOverride, setShow3DModelsOverride] = useState<boolean | null>(null);
  const [opener3DOverride, setOpener3DOverride] = useState<OpenerStyle3D | null>(null);
  const [visualDirectionOverride, setVisualDirectionOverride] =
    useState<RoyalVisualDirection | null>(null);

  useEffect(() => {
    setShow3DModelsOverride(null);
  }, [invitation.enable3DFlowersAndButterflies]);

  useEffect(() => {
    setOpener3DOverride(null);
  }, [invitation.openerStyle3D]);

  useEffect(() => {
    setVisualDirectionOverride(null);
  }, [invitation.visualDirection]);

  const activeVisualDirection: RoyalVisualDirection =
    visualDirectionOverride || invitation.visualDirection || 'obsidian_champagne';
  const activeDirectionPalette =
    ROYAL_VISUAL_DIRECTIONS.find((d) => d.id === activeVisualDirection) ||
    ROYAL_VISUAL_DIRECTIONS[0];
  const active3DModelsEnabled =
    show3DModelsOverride ?? (invitation.enable3DFlowersAndButterflies !== false);
  const activeOpenerStyle3D: OpenerStyle3D =
    opener3DOverride || invitation.openerStyle3D || 'auto';

  // Sync memories mode when invitation prop changes
  useEffect(() => {
    setShowMemoriesMode(Boolean(invitation.memoriesConfig?.isPostEventActive));
  }, [invitation.memoriesConfig?.isPostEventActive]);

  // Cinema Gallery Color Filter state
  const [activeGalleryFilter, setActiveGalleryFilter] = useState<CinematicColorFilter>(
    invitation.galleryColorFilter ||
      (invitation.templateId?.includes('cinema') ? 'golden_cinema' : 'original')
  );

  useEffect(() => {
    if (invitation.galleryColorFilter) {
      setActiveGalleryFilter(invitation.galleryColorFilter);
    } else if (invitation.templateId?.includes('cinema')) {
      setActiveGalleryFilter('golden_cinema');
    }
  }, [invitation.galleryColorFilter, invitation.templateId]);

  const cinemaGalleryFrames: string[] =
    invitation.galleryImages && invitation.galleryImages.length > 0
      ? invitation.galleryImages
      : invitation.templateId?.includes('cinema') || Boolean(invitation.galleryColorFilter)
      ? [
          invitation.coverImage ||
            createArtisticSvgDataUri('#1A1410', '#0D0A08', '#D4AF37', 'cinema_stars', 'Scene I • Premiere'),
          createArtisticSvgDataUri('#2B1D14', '#140E0A', '#F3E5AB', 'stage_curtain', 'Scene II • Spotlight'),
          createArtisticSvgDataUri('#131629', '#090B16', '#94D2BD', 'rose_seal', 'Scene III • Forever'),
        ]
      : [];

  // Personalized Guest Context from URL or override
  const [personalGuest] = useState<PersonalizedGuestContext | null>(() => {
    return personalizedGuestOverride || parsePersonalizedGuestFromLocation();
  });

  const maxAllowedSeats =
    personalGuest?.allocatedSeats || invitation.maxGuestsPerInvite || 5;

  // Sync override reset when editor changes invitation.visualEffect
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

  // Click Interaction Effect (Hearts, Stars, Rose Petals, Butterflies, ..., or 'none' to disable)
  const [clickEffectOverride, setClickEffectOverride] =
    useState<ClickInteractionEffectType | null>(null);
  const [clickSpeedOverride, setClickSpeedOverride] = useState<ClickEffectSpeed | null>(null);
  const [showClickEffectMenu, setShowClickEffectMenu] = useState(false);

  useEffect(() => {
    setClickEffectOverride(null);
  }, [invitation.clickEffect]);

  useEffect(() => {
    setClickSpeedOverride(null);
  }, [invitation.clickEffectSpeed]);

  const activeClickEffect: ClickInteractionEffectType =
    clickEffectOverride ?? invitation.clickEffect ?? 'heartbeat';

  const activeClickSpeed: ClickEffectSpeed =
    clickSpeedOverride ?? invitation.clickEffectSpeed ?? 'medium';

  const currentClickEffectMeta =
    INVITATION_CLICK_EFFECT_OPTIONS.find((opt) => opt.id === activeClickEffect) ||
    INVITATION_CLICK_EFFECT_OPTIONS[1];

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

  const navigateScene = (targetIdx: number) => {
    setDirection(targetIdx >= currentScene ? 1 : -1);
    setCurrentScene(targetIdx);
  };

  // RSVP Form state
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | 'tentative'>('attending');
  const [guestName, setGuestName] = useState(personalGuest?.guestName || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [companionsCount, setCompanionsCount] = useState(
    personalGuest ? Math.min(2, personalGuest.allocatedSeats) : 1
  );
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [mealPreference, setMealPreference] = useState('قوزي لحم عراقي فاخر');
  const [rsvpNote, setRsvpNote] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Guestbook Form state
  const [gbSender, setGbSender] = useState(personalGuest?.guestName || '');
  const [gbText, setGbText] = useState('');
  const [gbPhotoUrl, setGbPhotoUrl] = useState<string>('');
  const [gbSubmitted, setGbSubmitted] = useState(false);

  // Password Protection Gate state
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState<boolean>(
    !invitation.passwordProtected || !invitation.invitationPassword || isEmbeddedPreview
  );

  useEffect(() => {
    setIsPasswordUnlocked(
      !invitation.passwordProtected || !invitation.invitationPassword || isEmbeddedPreview
    );
  }, [invitation.passwordProtected, invitation.invitationPassword, isEmbeddedPreview]);

  const handleGuestbookPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setGbPhotoUrl(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate QR Code for sharing or personal check-in
  useEffect(() => {
    const inviteUrl = personalGuest?.qrCodeToken
      ? `MARASEEM-CHECKIN:${personalGuest.qrCodeToken}:${personalGuest.guestName}:${companionsCount}`
      : buildShareableInvitationUrl(invitation);
    QRCodeLib.toDataURL(inviteUrl, { width: 280, margin: 2 })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => {});
  }, [invitation, personalGuest, companionsCount]);

  // Cleanup music when leaving view
  useEffect(() => {
    return () => {
      soundEngine.stopAmbientMusic();
    };
  }, []);

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

  const handleOpenerTrigger = () => {
    navigateScene(1);
    if (invitation.autoPlayMusic !== false && invitation.musicTrack !== 'none' && !isMusicPlaying) {
      soundEngine.startAmbientMusic(
        invitation.musicTrack || 'romantic_piano',
        invitation.customAudioUrl
      );
      setIsMusicPlaying(true);
    }
  };

  const handleShareWhatsApp = () => {
    const currentUrl = buildShareableInvitationUrl(invitation);
    const text = `دعوة خاصة وبكل المودة 💌\nيسعدنا دعوتكم لحضور: ${invitation.title}\nالموعد: ${invitation.eventDate}\nالمكان: ${invitation.venueName} - ${invitation.city}\n\nيمكنكم مشاهدة تفاصيل الدعوة التفاعلية وتأكيد الحضور عبر الرابط:\n${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    const currentUrl = buildShareableInvitationUrl(invitation);
    navigator.clipboard.writeText(currentUrl);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  const handleSaveAsImage = async () => {
    if (isDownloadingCard) return;
    setIsDownloadingCard(true);
    try {
      const targetElement = exportCardCaptureRef.current || frontCardRef.current;
      if (targetElement) {
        const canvas = await html2canvas(targetElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: invitation.customBgColor || '#0F0D0A',
          logging: false,
        });
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `maraseem-invitation-${invitation.slug || invitation.id}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        await downloadInvitationCard(invitation);
      }
      setShowImageSavedToast(true);
      setTimeout(() => setShowImageSavedToast(false), 3200);
    } catch {
      // Fallback to canvas card generator if html2canvas encounters external CORS image constraints
      await downloadInvitationCard(invitation);
      setShowImageSavedToast(true);
      setTimeout(() => setShowImageSavedToast(false), 3200);
    } finally {
      setIsDownloadingCard(false);
    }
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    if (onSaveRSVP) {
      onSaveRSVP({
        invitationId: invitation.id,
        guestId: personalGuest?.guestId,
        guestName: guestName.trim(),
        phone: guestPhone.trim(),
        group: (personalGuest?.group as any) || undefined,
        status: rsvpStatus,
        allocatedSeats: maxAllowedSeats,
        companionsCount: rsvpStatus === 'attending' ? companionsCount : 0,
        companionNames:
          rsvpStatus === 'attending'
            ? companionNames.filter((n) => n.trim().length > 0)
            : [],
        tableNumber: personalGuest?.tableNumber,
        mealPreference: rsvpStatus === 'attending' ? mealPreference : undefined,
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
        invitationId: invitation.id,
        senderName: gbSender.trim(),
        message: gbText.trim(),
        photoUrl: gbPhotoUrl || undefined,
        approved: !invitation.requireGuestbookApproval,
      });
    }
    setGbSender('');
    setGbText('');
    setGbPhotoUrl('');
    setGbSubmitted(true);
    soundEngine.playChime(880.0, 1.0);
    setTimeout(() => setGbSubmitted(false), 3500);
  };

  const activeSectionOrder: InvitationSectionId[] =
    invitation.sectionOrder && invitation.sectionOrder.length > 0
      ? invitation.sectionOrder
      : DEFAULT_INVITATION_SECTION_ORDER;

  const scenes = activeSectionOrder.map((secId, idx) => ({
    id: idx,
    sectionId: secId,
    title: isEnglish
      ? INVITATION_SECTION_META[secId]?.titleEn || 'Scene'
      : INVITATION_SECTION_META[secId]?.titleAr || 'مشهد',
  }));

  const activeSectionId: InvitationSectionId =
    scenes[currentScene]?.sectionId || 'opener';

  const coupleOrMainHostTitle =
    invitation.groomName && invitation.brideName
      ? `${invitation.groomName} & ${invitation.brideName}`
      : invitation.graduateName ||
        invitation.birthdayStarName ||
        invitation.businessName ||
        invitation.hostNames ||
        invitation.title;

  // Render proper opener experience
  const renderOpener = () => {
    // Explicit 3D Opener override if configured in Editor or live bar
    if (activeOpenerStyle3D === 'stage_curtains_3d') {
      return (
        <StageCurtainExperience
          onOpen={handleOpenerTrigger}
          title={invitation.title}
          coupleOrHostName={coupleOrMainHostTitle}
          subtitle={invitation.welcomeQuote}
          visualDirection={activeVisualDirection}
        />
      );
    }
    if (activeOpenerStyle3D === 'royal_3d_book') {
      return (
        <Royal3DBookExperience
          onOpen={handleOpenerTrigger}
          title={invitation.title}
          coupleOrHostName={coupleOrMainHostTitle}
          welcomeQuote={invitation.welcomeQuote}
        />
      );
    }
    if (activeOpenerStyle3D === 'royal_envelope_wax') {
      return (
        <EnvelopeOpenExperience
          onOpen={handleOpenerTrigger}
          title={invitation.title}
          sealText="ختم مراسيم الملكي"
          hostSubtitle={coupleOrMainHostTitle}
          themeColor={activeDirectionPalette.bgSecondary}
        />
      );
    }
    if (activeOpenerStyle3D === 'engagement_ring_3d') {
      return (
        <EngagementRingExperience
          onOpen={handleOpenerTrigger}
          title={invitation.title}
          groomName={invitation.groomName}
          brideName={invitation.brideName}
          hostSubtitle={invitation.hostNames}
        />
      );
    }

    // If cinematic or movie inspired
    if (
      invitation.templateId.includes('cinema') ||
      invitation.templateId.includes('film') ||
      invitation.title.includes('سينما') ||
      invitation.title.includes('فيلم')
    ) {
      return (
        <FilmStripExperience
          onOpen={handleOpenerTrigger}
          title={invitation.title}
          groomName={invitation.groomName}
          brideName={invitation.brideName}
          tagline={invitation.welcomeQuote}
        />
      );
    }

    switch (invitation.category) {
      case 'henna':
        return (
          <HennaExperience
            onOpen={handleOpenerTrigger}
            title={invitation.title}
            brideName={invitation.brideName}
          />
        );
      case 'birthday':
        return (
          <BirthdayCakeExperience
            onOpen={handleOpenerTrigger}
            title={invitation.title}
            name={invitation.birthdayStarName}
            age={invitation.age}
          />
        );
      case 'graduation':
      case 'graduation_project':
        return (
          <GraduationScrollExperience
            onOpen={handleOpenerTrigger}
            title={invitation.title}
            graduateName={invitation.graduateName}
            major={invitation.major as string}
            university={invitation.university}
            departmentName={invitation.departmentName || invitation.college}
            projectTitle={invitation.projectTitle}
            supervisorName={invitation.supervisorName}
            isGraduationProject={
              invitation.category === 'graduation_project' || Boolean(invitation.projectTitle)
            }
          />
        );
      case 'business_opening':
      case 'special_events':
        return (
          <RibbonCutExperience
            onOpen={handleOpenerTrigger}
            title={invitation.title}
            businessName={invitation.businessName || invitation.hostNames || invitation.title}
          />
        );
      case 'art_exhibition':
        if (invitation.templateId?.includes('calligraphy')) {
          return (
            <EnvelopeOpenExperience
              onOpen={handleOpenerTrigger}
              title={invitation.title}
              sealText="ختم المعرض الفني"
              hostSubtitle={invitation.hostNames || invitation.businessName}
              themeColor="#101824"
            />
          );
        }
        return (
          <RibbonCutExperience
            onOpen={handleOpenerTrigger}
            title={invitation.title}
            businessName={invitation.businessName}
          />
        );
      case 'career_promotion':
        if (invitation.templateId?.includes('dinner')) {
          return (
            <EnvelopeOpenExperience
              onOpen={handleOpenerTrigger}
              title={invitation.title}
              sealText="وسام الترقية"
              hostSubtitle={invitation.graduateName || invitation.hostNames}
              themeColor="#09152b"
            />
          );
        }
        return (
          <GraduationScrollExperience
            onOpen={handleOpenerTrigger}
            title={invitation.title}
            graduateName={invitation.graduateName}
            major="business"
            university={invitation.university}
          />
        );
      case 'family_success':
        if (invitation.templateId?.includes('diwan')) {
          return (
            <EnvelopeOpenExperience
              onOpen={handleOpenerTrigger}
              title={invitation.title}
              sealText="نجاح العائلة"
              hostSubtitle={invitation.hostNames}
              themeColor="#281018"
            />
          );
        }
        return (
          <HennaExperience
            onOpen={handleOpenerTrigger}
            title={invitation.title}
            brideName={invitation.hostNames}
          />
        );
      case 'engagement':
        if (
          invitation.templateId?.includes('ring') ||
          invitation.templateId === 'tpl-engagement-diamond-ring' ||
          !invitation.templateId?.includes('envelope')
        ) {
          return (
            <EngagementRingExperience
              onOpen={handleOpenerTrigger}
              title={invitation.title}
              groomName={invitation.groomName}
              brideName={invitation.brideName}
              hostSubtitle={invitation.hostNames}
            />
          );
        }
        return (
          <EnvelopeOpenExperience
            onOpen={handleOpenerTrigger}
            title={invitation.title}
            sealText="خاتم الخطوبة"
            hostSubtitle={invitation.hostNames || `${invitation.groomName || ''} & ${invitation.brideName || ''}`}
          />
        );
      case 'wedding':
      default:
        return (
          <EnvelopeOpenExperience
            onOpen={handleOpenerTrigger}
            title={invitation.title}
            sealText="دعوة ملكية"
            hostSubtitle={invitation.hostNames || `${invitation.groomName || ''} & ${invitation.brideName || ''}`}
          />
        );
    }
  };

  if (showMemoriesMode) {
    return (
      <div className={`w-full ${isEmbeddedPreview ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}>
        <WeddingMemoriesView
          invitation={invitation}
          guestbook={guestbookMessages}
          onAddGuestbook={onAddGuestbook}
          onUpdateInvitation={onUpdateInvitation}
          onBackToInvitation={() => setShowMemoriesMode(false)}
          isHostMode={!isStandaloneGuest}
        />
      </div>
    );
  }

  const renderExportableFrontCardSnapshot = () => (
    <div
      style={{
        position: 'fixed',
        left: '-9999px',
        top: '0px',
        width: '680px',
        zIndex: -1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <div
        ref={exportCardCaptureRef}
        dir="rtl"
        style={{
          width: '680px',
          minHeight: '860px',
          backgroundColor: invitation.customBgColor || '#110E0B',
          backgroundImage:
            'radial-gradient(circle at 50% 15%, rgba(212, 175, 55, 0.18), rgba(17, 14, 11, 0.98) 70%)',
          color: '#FAF6F0',
          padding: '44px 40px',
          borderRadius: '28px',
          border: '2px solid rgba(212, 175, 55, 0.45)',
          boxShadow: 'inset 0 0 0 1px rgba(212, 175, 55, 0.22)',
          fontFamily: "'Cairo', 'Amiri', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Inner Ornamental Border */}
        <div
          style={{
            position: 'absolute',
            inset: '14px',
            borderRadius: '20px',
            border: '1px solid rgba(212, 175, 55, 0.28)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Header: Basmala & Welcome Quote */}
        <div style={{ width: '100%', zIndex: 2 }}>
          <div
            style={{
              color: '#D4AF37',
              fontFamily: "'Amiri', serif",
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '10px',
              letterSpacing: '0.03em',
            }}
          >
            بسم الله الرحمن الرحيم
          </div>
          {invitation.welcomeQuote && (
            <div
              style={{
                color: '#E6DEC8',
                fontFamily: "'Amiri', serif",
                fontSize: '17px',
                fontStyle: 'italic',
                lineHeight: 1.7,
                maxWidth: '520px',
                margin: '0 auto 14px',
              }}
            >
              {invitation.welcomeQuote}
            </div>
          )}
          <div
            style={{
              width: '120px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Cover Portrait if available */}
        {invitation.coverImage && (
          <div
            style={{
              width: '132px',
              height: '132px',
              borderRadius: '9999px',
              overflow: 'hidden',
              border: '3px solid #D4AF37',
              boxShadow: '0 0 25px rgba(212, 175, 55, 0.3)',
              margin: '18px auto',
              zIndex: 2,
            }}
          >
            <img
              src={invitation.coverImage}
              alt={invitation.title}
              crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Main Names & Celebration Box */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(26, 22, 18, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '22px',
            padding: '28px 26px',
            margin: '12px 0',
            zIndex: 2,
          }}
        >
          <div
            style={{
              color: '#D4AF37',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
            }}
          >
            {invitation.hostNames || 'يتشرف الأهل والأحباب بدعوتكم لحضور'}
          </div>

          {invitation.category === 'graduation' ? (
            <div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#F5D77F',
                  fontFamily: "'Amiri', serif",
                  marginBottom: '6px',
                }}
              >
                {invitation.graduateName || invitation.title}
              </div>
              {invitation.university && (
                <div style={{ fontSize: '15px', color: '#E2E8F0' }}>{invitation.university}</div>
              )}
              {invitation.honorsTitle && (
                <div style={{ fontSize: '13px', color: '#D4AF37', marginTop: '4px' }}>
                  {invitation.honorsTitle}
                </div>
              )}
            </div>
          ) : invitation.category === 'birthday' ? (
            <div>
              <div
                style={{
                  fontSize: '34px',
                  fontWeight: 800,
                  color: '#F5D77F',
                  marginBottom: '6px',
                }}
              >
                {invitation.birthdayStarName || invitation.title}
              </div>
              {invitation.age && (
                <div style={{ fontSize: '16px', color: '#F4C2C2' }}>
                  احتفالية العام الـ {invitation.age} 🎈
                </div>
              )}
            </div>
          ) : invitation.category === 'business_opening' ||
            invitation.category === 'art_exhibition' ||
            invitation.category === 'career_promotion' ||
            invitation.category === 'family_success' ? (
            <div>
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 800,
                  color: '#F5D77F',
                  fontFamily: "'Amiri', serif",
                  marginBottom: '6px',
                }}
              >
                {invitation.businessName || invitation.graduateName || invitation.title}
              </div>
              {invitation.businessType && (
                <div style={{ fontSize: '14px', color: '#E6DEC8' }}>
                  {invitation.businessType}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                fontSize: '34px',
                fontWeight: 700,
                fontFamily: "'Amiri', serif",
                color: '#F5D77F',
                margin: '10px 0',
              }}
            >
              <span>
                {invitation.groomName} {invitation.groomFamily || ''}
              </span>
              <span style={{ color: '#D4AF37', fontSize: '24px' }}>♥</span>
              <span>
                {invitation.brideName} {invitation.brideFamily || ''}
              </span>
            </div>
          )}

          <p
            style={{
              color: '#EAE3D2',
              fontSize: '15px',
              lineHeight: 1.85,
              marginTop: '16px',
              padding: '0 10px',
            }}
          >
            {invitation.invitationBody}
          </p>
        </div>

        {/* Event Date, Time & Venue Footer inside Card */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '10px',
            zIndex: 2,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(26, 22, 18, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.28)',
              borderRadius: '16px',
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#D4AF37', marginBottom: '4px' }}>
              تاريخ وتوقيت المناسبة
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
              {invitation.eventDate} • {invitation.eventTime}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(26, 22, 18, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.28)',
              borderRadius: '16px',
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#D4AF37', marginBottom: '4px' }}>
              المكان والعنوان
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
              {invitation.venueName} — {invitation.city}
            </div>
          </div>
        </div>

        {/* Brand Signature */}
        <div
          style={{
            marginTop: '18px',
            fontSize: '11px',
            color: 'rgba(212, 175, 55, 0.75)',
            letterSpacing: '0.06em',
            zIndex: 2,
          }}
        >
          ✦ مراسيم | MARASEEM — {invitation.title} ✦
        </div>
      </div>
    </div>
  );

  if (
    invitation.passwordProtected &&
    invitation.invitationPassword &&
    !isPasswordUnlocked &&
    !isEmbeddedPreview
  ) {
    return (
      <div className="invitation-isolated max-w-md mx-auto my-8 p-8 rounded-3xl bg-neutral-950 border border-amber-500/35 text-center space-y-5 shadow-2xl font-cairo">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
          <Lock size={28} />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 font-bold">
            دعوة خاصة محمية بكلمة مرور
          </span>
          <h3 className="text-xl font-bold text-white font-amiri">{invitation.title}</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            يرجى إدخال كلمة المرور الخاصة بالدعوة التي أرسلها لك صاحب المناسبة لفتح البطاقة التفاعلية:
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (enteredPassword.trim() === invitation.invitationPassword?.trim()) {
              setIsPasswordUnlocked(true);
              setPasswordError(false);
            } else {
              setPasswordError(true);
            }
          }}
          className="space-y-3"
        >
          <input
            type="password"
            value={enteredPassword}
            onChange={(e) => {
              setEnteredPassword(e.target.value);
              setPasswordError(false);
            }}
            placeholder="أدخل كلمة مرور الدعوة..."
            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-amber-500/30 text-sm text-center text-white outline-none focus:border-amber-400"
          />
          {passwordError && (
            <p className="text-xs text-rose-400 font-bold">
              كلمة المرور غير صحيحة، يرجى التأكد والمحاولة مرة أخرى.
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            فتح بطاقة الدعوة التفاعلية 🔓
          </button>
        </form>
      </div>
    );
  }

  if (isMovieTrailerInvitation(invitation)) {
    return (
      <div
        className="invitation-isolated space-y-2 relative"
        data-invitation-click-effect={activeClickEffect}
        data-invitation-click-speed={activeClickSpeed}
      >
        {renderExportableFrontCardSnapshot()}

        {!isEmbeddedPreview && (
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-2xl bg-[#17130F] border border-[#D6B574]/40 text-[#FFFDF8] shadow-md font-cairo relative z-40">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Sparkles size={14} className="text-[#D6B574]" />
              <span>
                {personalGuest
                  ? `تذكرة عرض خاصة لـ: ${personalGuest.familyTitle || personalGuest.guestName} (${personalGuest.allocatedSeats} مقاعد)`
                  : 'مراسيم • MARASEEM Movie Trailer Invitation'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSaveAsImage}
                disabled={isDownloadingCard}
                className="px-3 py-1.5 rounded-xl bg-[#D6B574] hover:bg-[#A98445] text-[#17130F] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <FileImage size={13} />
                <span>{isDownloadingCard ? 'جارٍ الحفظ...' : 'حفظ البوستر كصورة'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-[#241E18] hover:bg-[#2F271F] border border-[#D6B574]/40 text-[#F8F1E5] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 size={13} className="text-[#D6B574]" />
                <span>نسخ رابط الإعلان</span>
              </button>
            </div>
          </div>
        )}

        {showImageSavedToast && (
          <div className="max-w-md mx-auto px-4 py-2 rounded-xl bg-emerald-900 border border-emerald-400/50 text-emerald-100 text-xs font-bold text-center">
            تم حفظ بوستر الدعوة السينمائي كصورة بنجاح! 📸
          </div>
        )}

        {showShareToast && (
          <div className="max-w-md mx-auto px-4 py-2 rounded-xl bg-amber-900 border border-amber-400/50 text-amber-100 text-xs font-bold text-center">
            تم نسخ رابط الإعلان السينمائي بنجاح! 🔗
          </div>
        )}

        <MovieTrailerInvitationExperience
          invitation={invitation}
          onRSVPSubmit={onSaveRSVP}
          onGuestbookSubmit={onAddGuestbook}
          guestbookMessages={guestbookMessages}
          personalizedGuest={
            personalGuest
              ? {
                  name: personalGuest.guestName,
                  familyTitle: personalGuest.familyTitle,
                  maxCompanions: personalGuest.allocatedSeats,
                }
              : null
          }
        />
      </div>
    );
  }

  if (
    Boolean(invitation.singleInteractionMode) ||
    isRoyal3DCollectionTemplate(invitation.templateId) ||
    !invitation.atelierTheme
  ) {
    return (
      <div
        className="invitation-isolated space-y-2 relative"
        data-invitation-click-effect={activeClickEffect}
        data-invitation-click-speed={activeClickSpeed}
      >
        {renderExportableFrontCardSnapshot()}

        {/* Compact Top Bar for Export Image & Share Link (Never exposes couple/event details before opening) */}
        {!isEmbeddedPreview && (
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-2xl bg-[#17130F] border border-[#D6B574]/40 text-[#FFFDF8] shadow-md font-cairo relative z-40">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Sparkles size={14} className="text-[#D6B574]" />
              <span>
                {personalGuest
                  ? `دعوة خاصة لـ: ${personalGuest.familyTitle || personalGuest.guestName} (${personalGuest.allocatedSeats} مقاعد)`
                  : 'مراسيم • MARASEEM Royal Invitation'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSaveAsImage}
                disabled={isDownloadingCard}
                className="px-3 py-1.5 rounded-xl bg-[#D6B574] hover:bg-[#A98445] text-[#17130F] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <FileImage size={13} />
                <span>{isDownloadingCard ? 'جارٍ الحفظ...' : 'حفظ كصورة'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-[#241E18] hover:bg-[#2F271F] border border-[#D6B574]/40 text-[#F8F1E5] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 size={13} className="text-[#D6B574]" />
                <span>نسخ الرابط</span>
              </button>
            </div>
          </div>
        )}

        {showImageSavedToast && (
          <div className="max-w-md mx-auto px-4 py-2 rounded-xl bg-emerald-900 border border-emerald-400/50 text-emerald-100 text-xs font-bold text-center">
            تم حفظ بطاقة الدعوة كصورة عالية الجودة بنجاح! 📸
          </div>
        )}

        {showShareToast && (
          <div className="max-w-md mx-auto px-4 py-2 rounded-xl bg-amber-900 border border-amber-400/50 text-amber-100 text-xs font-bold text-center">
            تم نسخ رابط الدعوة المباشر بنجاح! 🔗
          </div>
        )}

        <Royal3DLuxuryInvitationExperience
          invitation={invitation}
          onSaveRSVP={onSaveRSVP}
          onAddGuestbook={onAddGuestbook}
          isEmbeddedPreview={isEmbeddedPreview}
        />
      </div>
    );
  }

  if (invitation.atelierTheme || invitation.templateId?.startsWith('tpl-atelier-')) {
    return (
      <div
        className="invitation-isolated space-y-3 relative"
        data-invitation-click-effect={activeClickEffect}
        data-invitation-click-speed={activeClickSpeed}
      >
        {renderExportableFrontCardSnapshot()}

        {/* Top Export & Personal Guest Strip for Atelier Templates */}
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-[#FFFDF8]/95 border border-[#E9DDC9] text-[#566B49] shadow-sm font-cairo relative z-40">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Sparkles size={14} className="text-[#D4AF37]" />
            <span>
              {personalGuest
                ? `دعوة خاصة لـ: ${personalGuest.familyTitle || personalGuest.guestName} (${personalGuest.allocatedSeats} مقاعد)`
                : invitation.title}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Click Interaction Selector Dropdown */}
            <div className="relative" data-no-magic="true">
              <button
                type="button"
                onClick={() => setShowClickEffectMenu((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeClickEffect !== 'none'
                    ? 'bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border-[#B9CCA0]'
                    : 'bg-neutral-100 text-[#91A77D] border-[#E9DDC9]'
                }`}
                title="اختيار نوع وسرعة التفاعل عند النقر داخل الدعوة (قلوب، نجوم، ورود، أو بدون تفاعل)"
              >
                <MousePointerClick size={13} className="text-[#D4AF37]" />
                <span>تفاعل النقر: {currentClickEffectMeta.shortAr}</span>
              </button>

              {showClickEffectMenu && (
                <div
                  className="absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] shadow-2xl p-2 z-50 space-y-1.5 text-right"
                  data-no-magic="true"
                >
                  <div className="px-2.5 py-1.5 border-b border-[#E9DDC9] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#566B49]">
                      اختر تفاعل النقر داخل الدعوة
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowClickEffectMenu(false)}
                      className="text-[10px] text-[#91A77D] hover:text-[#566B49] font-bold cursor-pointer"
                    >
                      إغلاق ✕
                    </button>
                  </div>

                  {/* Speed Slider inside Popover */}
                  <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#566B49]">
                      <span>سرعة ظهور وتلاشي التفاعلات:</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#DCE8CB] text-[#566B49]">
                        {
                          (
                            CLICK_EFFECT_SPEED_OPTIONS.find((s) => s.id === activeClickSpeed) ||
                            CLICK_EFFECT_SPEED_OPTIONS[1]
                          ).shortAr
                        }
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={1}
                      value={
                        activeClickSpeed === 'slow' ? 0 : activeClickSpeed === 'fast' ? 2 : 1
                      }
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        const nextSpeed: ClickEffectSpeed =
                          idx === 0 ? 'slow' : idx === 2 ? 'fast' : 'medium';
                        setClickSpeedOverride(nextSpeed);
                        if (activeClickEffect !== 'none') {
                          dispatchClickEffectPreview(
                            activeClickEffect,
                            undefined,
                            undefined,
                            nextSpeed
                          );
                        }
                      }}
                      className="w-full accent-[#566B49] cursor-pointer h-1.5 bg-[#E9DDC9] rounded-lg"
                    />
                    <div className="flex items-center justify-between text-[9px] font-bold text-[#91A77D]">
                      <span>بطيء</span>
                      <span>متوسط</span>
                      <span>سريع</span>
                    </div>
                  </div>

                  {INVITATION_CLICK_EFFECT_OPTIONS.map((opt) => {
                    const isSelected = activeClickEffect === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={(e) => {
                          setClickEffectOverride(opt.id as ClickInteractionEffectType);
                          setShowClickEffectMenu(false);
                          if (opt.id !== 'none') {
                            dispatchClickEffectPreview(
                              opt.id,
                              e.clientX,
                              e.clientY,
                              activeClickSpeed
                            );
                          }
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl border text-right flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#DCE8CB] border-[#566B49] text-[#566B49] font-bold'
                            : 'bg-[#F8F6EF]/60 hover:bg-[#DCE8CB]/50 border-transparent text-[#566B49]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] flex items-center justify-center text-xs shrink-0">
                            {opt.symbol}
                          </span>
                          <div className="truncate">
                            <div className="text-[11px] font-bold truncate">{opt.labelAr}</div>
                            <div className="text-[9px] text-[#91A77D] truncate">{opt.descAr}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#566B49] text-[#FFFDF8] shrink-0">
                            مفعّل
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveAsImage}
              disabled={isDownloadingCard}
              className="px-3.5 py-1.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] border border-[#91A77D] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="حفظ الواجهة الأمامية لبطاقة الدعوة كملف صورة عالي الجودة"
            >
              <Download size={13} />
              <span>{isDownloadingCard ? 'جاري الحفظ...' : 'حفظ كصورة'}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showImageSavedToast && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#566B49] text-[#FFFDF8] font-bold text-xs shadow-xl border border-[#B9CCA0]"
            >
              تم حفظ بطاقة الدعوة كصورة عالية الجودة بنجاح! 📸
            </motion.div>
          )}
        </AnimatePresence>

        <AtelierSignatureExperience
          invitation={invitation}
          onSaveRSVP={onSaveRSVP}
          onAddGuestbook={onAddGuestbook}
          guestbookMessages={guestbookMessages}
          isEmbeddedPreview={isEmbeddedPreview}
          isStandaloneGuest={isStandaloneGuest}
        />
      </div>
    );
  }

  const is3DFlipActive =
    enable3DFlip && invitation.pageTransitionMode !== 'fade-in-out';

  const cardFlipVariants = get3DCardFlipVariants(direction, 115);

  const resolvedFontClass =
    invitation.customFontFamily === 'amiri'
      ? 'font-amiri'
      : invitation.customFontFamily === 'aref'
      ? 'font-aref'
      : 'font-cairo';

  return (
    <div
      data-invitation-click-effect={activeClickEffect}
      data-invitation-click-speed={activeClickSpeed}
      className={`invitation-isolated relative w-full ${
        isMobileFullscreenMode
          ? 'fixed inset-0 z-50 max-w-[430px] max-h-[96vh] my-auto mx-auto rounded-[40px] border-4 border-[#D4AF37]/60 shadow-[0_0_90px_rgba(0,0,0,0.95)] flex flex-col justify-between'
          : isEmbeddedPreview
          ? 'max-w-2xl rounded-3xl'
          : 'max-w-3xl rounded-3xl'
      } mx-auto bg-neutral-950/95 text-neutral-100 border border-amber-500/25 shadow-2xl overflow-hidden ${resolvedFontClass}`}
      style={{
        backgroundColor:
          invitation.customBgColor ||
          (invitation.visualDirection ? activeDirectionPalette.bgPrimary : undefined),
        borderColor: invitation.customPrimaryColor || activeDirectionPalette.borderGold,
      }}
    >
      {/* Background Video Layer (MP4 / WebM) if uploaded or configured */}
      {invitation.backgroundVideoUrl ? (
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
            className="absolute inset-0 bg-neutral-950 transition-opacity duration-300"
            style={{
              opacity:
                typeof invitation.backgroundVideoOverlayOpacity === 'number'
                  ? invitation.backgroundVideoOverlayOpacity / 100
                  : 0.55,
            }}
          />
        </div>
      ) : (
        /* Ambient Royal Luxury background decoration */
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              activeVisualDirection === 'emerald_palace'
                ? 'radial-gradient(ellipse at top, rgba(212,175,55,0.22) 0%, rgba(13,59,46,0.95) 55%, rgba(7,34,27,1) 100%)'
                : activeVisualDirection === 'pearl_atelier'
                ? 'radial-gradient(ellipse at top, rgba(212,175,55,0.25) 0%, rgba(25,22,18,0.92) 60%, rgba(12,10,8,0.98) 100%)'
                : 'radial-gradient(ellipse at top, rgba(212,175,55,0.2) 0%, rgba(18,15,12,0.96) 55%, rgba(10,9,8,1) 100%)',
          }}
        />
      )}

      {/* 3D Sculpted Flowers & Butterflies Layer */}
      <Royal3DFlowersButterfliesLayer
        enabled={active3DModelsEnabled}
        visualDirection={activeVisualDirection}
      />

      {/* Custom Framer Motion Visual Effects Layer (Rose Petals / Lantern Glow / Sparkles / Spotlight) */}
      <AmbientVisualEffects
        category={invitation.category}
        effect={activeVisualEffect}
      />

      {/* Personalized Guest Greeting Strip (When opened via Personal Link) */}
      {personalGuest && (
        <div className="relative z-30 px-5 py-2.5 bg-gradient-to-r from-[#2D4635] via-[#3A5A40] to-[#2D4635] border-b border-[#C5E1A5]/30 flex flex-wrap items-center justify-between gap-2 text-[#FAF6F0]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#93C572] text-[#1A2920] font-bold">
              دعوة مخصصة باسمكم
            </span>
            <span className="text-xs sm:text-sm font-bold">
              أهلاً وسهلاً بـ: {personalGuest.familyTitle || personalGuest.guestName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#C5E1A5] font-semibold">
            <span>عدد المقاعد المسموح بها: {personalGuest.allocatedSeats} مقاعد</span>
            {personalGuest.tableNumber && (
              <span className="px-2 py-0.5 rounded-md bg-black/30 text-amber-300 font-mono">
                طاولة رقم {personalGuest.tableNumber}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Floating Control Bar for Guest Actions */}
      <div className="relative z-30 flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Music Toggle */}
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
          {invitation.backgroundVideoUrl && (
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

          {/* 3D Flip Toggle */}
          <button
            type="button"
            onClick={() => setEnable3DFlip((f) => !f)}
            className={`px-2.5 py-1.5 rounded-full border transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
              is3DFlipActive
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
            }`}
            title="تبديل تأثير تقليب البطاقة ثلاثي الأبعاد (3D Flip)"
          >
            <Rotate3d size={13} />
            <span className="hidden md:inline">3D Flip</span>
          </button>

          {/* 3D Opener Quick Switcher (Envelope / Stage Curtains / Royal Book) */}
          <button
            type="button"
            onClick={() => {
              const order: OpenerStyle3D[] = [
                'auto',
                'stage_curtains_3d',
                'royal_3d_book',
                'royal_envelope_wax',
                'engagement_ring_3d',
              ];
              const next = order[(order.indexOf(activeOpenerStyle3D) + 1) % order.length];
              setOpener3DOverride(next);
              const openerIdx = scenes.findIndex((s) => s.sectionId === 'opener');
              if (openerIdx >= 0) navigateScene(openerIdx);
            }}
            className="px-2.5 py-1.5 rounded-full border bg-amber-500/15 text-[#F3E5AB] border-[#D4AF37]/45 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer hover:bg-amber-500/25"
            title="تبديل تجربة الفتح ثلاثية الأبعاد (ستائر مسرح 🎭 / كتاب ملكي 📖 / ظرف بختم شمعي ✉️ / خاتم 💍)"
          >
            <span>
              {activeOpenerStyle3D === 'stage_curtains_3d'
                ? '🎭 ستائر 3D'
                : activeOpenerStyle3D === 'royal_3d_book'
                ? '📖 كتاب 3D'
                : activeOpenerStyle3D === 'royal_envelope_wax'
                ? '✉️ ظرف شمعي 3D'
                : activeOpenerStyle3D === 'engagement_ring_3d'
                ? '💍 خاتم 3D'
                : '✨ فتح 3D'}
            </span>
          </button>

          {/* 3D Flowers & Butterflies Toggle */}
          <button
            type="button"
            onClick={() => setShow3DModelsOverride(!active3DModelsEnabled)}
            className={`px-2.5 py-1.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              active3DModelsEnabled
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
            }`}
            title="إظهار / إخفاء مجسمات الزهور والفراشات المضيئة ثلاثية الأبعاد"
          >
            <span>🦋 زهور وفراشات 3D</span>
          </button>

          {/* Mobile-First Fullscreen Phone Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileFullscreenMode((m) => !m)}
            className={`px-2.5 py-1.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isMobileFullscreenMode
                ? 'bg-[#D4AF37] text-neutral-950 border-[#F3E5AB] font-bold'
                : 'bg-neutral-800/80 text-amber-200 border-amber-500/30 hover:bg-neutral-800'
            }`}
            title="معاينة بملء شاشة الهاتف (Mobile-First Fullscreen)"
          >
            {isMobileFullscreenMode ? <Minimize2 size={12} /> : <Smartphone size={12} />}
            <span className="hidden sm:inline">
              {isMobileFullscreenMode ? 'إغلاق شاشة الهاتف' : 'ملء شاشة الهاتف'}
            </span>
          </button>

          {/* Visual Effect Switcher (Rose Petals / Lantern Glow / Sparkles) */}
          <button
            type="button"
            onClick={cycleVisualEffect}
            className={`px-2.5 py-1.5 rounded-full border transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
              activeVisualEffect !== 'none'
                ? 'bg-rose-500/15 text-amber-200 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
            }`}
            title="تغيير المؤثر البصري المتحرك (نثر الورود / توهج الفوانيس / بريق الذهب)"
          >
            <Sparkles size={13} className="text-amber-300" />
            <span>{currentEffectMeta.badge}</span>
          </button>

          {/* Click Interaction Selector Dropdown (Optional: Hearts, Stars, Rose Petals, or Off) */}
          <div className="relative" data-no-magic="true">
            <button
              type="button"
              onClick={() => setShowClickEffectMenu((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-full border transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                activeClickEffect !== 'none'
                  ? 'bg-amber-500/15 text-amber-200 border-amber-400/40 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                  : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
              }`}
              title="تخصيص تفاعل النقر وسرعته داخل الدعوة (قلوب، نجوم، بتلات ورد، أو إيقاف)"
            >
              <MousePointerClick size={13} className="text-amber-300" />
              <span>تفاعل النقر: {currentClickEffectMeta.shortAr}</span>
            </button>

            {showClickEffectMenu && (
              <div
                className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] shadow-2xl p-2 z-50 space-y-1.5 text-right text-[#566B49]"
                data-no-magic="true"
              >
                <div className="px-2.5 py-1.5 border-b border-[#E9DDC9] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#566B49]">
                    تفاعل النقر داخل الدعوة (اختياري)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowClickEffectMenu(false)}
                    className="text-[10px] text-[#91A77D] hover:text-[#566B49] font-bold cursor-pointer"
                  >
                    إغلاق ✕
                  </button>
                </div>

                {/* Speed Slider inside Popover */}
                <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#566B49]">
                    <span>سرعة ظهور وتلاشي التفاعلات:</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#DCE8CB] text-[#566B49]">
                      {
                        (
                          CLICK_EFFECT_SPEED_OPTIONS.find((s) => s.id === activeClickSpeed) ||
                          CLICK_EFFECT_SPEED_OPTIONS[1]
                        ).shortAr
                      }
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={1}
                    value={
                      activeClickSpeed === 'slow' ? 0 : activeClickSpeed === 'fast' ? 2 : 1
                    }
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      const nextSpeed: ClickEffectSpeed =
                        idx === 0 ? 'slow' : idx === 2 ? 'fast' : 'medium';
                      setClickSpeedOverride(nextSpeed);
                      if (activeClickEffect !== 'none') {
                        dispatchClickEffectPreview(
                          activeClickEffect,
                          undefined,
                          undefined,
                          nextSpeed
                        );
                      }
                    }}
                    className="w-full accent-[#566B49] cursor-pointer h-1.5 bg-[#E9DDC9] rounded-lg"
                  />
                  <div className="flex items-center justify-between text-[9px] font-bold text-[#91A77D]">
                    <span>بطيء</span>
                    <span>متوسط</span>
                    <span>سريع</span>
                  </div>
                </div>

                {INVITATION_CLICK_EFFECT_OPTIONS.map((opt) => {
                  const isSelected = activeClickEffect === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={(e) => {
                        setClickEffectOverride(opt.id as ClickInteractionEffectType);
                        setShowClickEffectMenu(false);
                        if (opt.id !== 'none') {
                          dispatchClickEffectPreview(
                            opt.id,
                            e.clientX,
                            e.clientY,
                            activeClickSpeed
                          );
                        }
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl border text-right flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#DCE8CB] border-[#566B49] text-[#566B49] font-bold'
                          : 'bg-[#F8F6EF]/70 hover:bg-[#DCE8CB]/50 border-transparent text-[#566B49]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] flex items-center justify-center text-xs shrink-0">
                          {opt.symbol}
                        </span>
                        <div className="truncate">
                          <div className="text-[11px] font-bold truncate">{opt.labelAr}</div>
                          <div className="text-[9px] text-[#91A77D] truncate">{opt.descAr}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#566B49] text-[#FFFDF8] shrink-0">
                          مفعّل
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Wedding Memories Post-Event Space Button */}
          <button
            type="button"
            onClick={() => setShowMemoriesMode(true)}
            className="px-2.5 py-1.5 rounded-full bg-[#5E8C6A]/25 hover:bg-[#5E8C6A]/40 text-[#C5E1A5] border border-[#93C572]/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="فتح مساحة ذكريات المناسبة (الصور والفيديو والتهاني)"
          >
            <Heart size={12} className="text-[#93C572]" />
            <span>ذكريات الحفل</span>
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
              onClick={() => navigateScene(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentScene === idx
                  ? 'w-6 bg-gradient-to-r from-amber-400 to-amber-200 shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                  : 'w-1.5 bg-neutral-700 hover:bg-neutral-500'
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Share & Save as Image buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSaveAsImage}
            disabled={isDownloadingCard}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="تصدير وحفظ الواجهة الأمامية لبطاقة الدعوة كصورة عالية الجودة (PNG)"
          >
            <Download size={13} className="text-amber-300" />
            <span>{isDownloadingCard ? 'جاري الحفظ...' : 'حفظ كصورة'}</span>
          </button>
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

      {/* Hidden high-res snapshot target for html2canvas */}
      {renderExportableFrontCardSnapshot()}

      {/* Share & Save Image Toasts */}
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
        {showImageSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-500 text-neutral-950 font-bold text-xs shadow-lg"
          >
            تم حفظ بطاقة الدعوة كصورة عالية الجودة بنجاح! 📸
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Scene Display with 3D Card Flip Perspective */}
      <div
        style={{ perspective: '1400px' }}
        className="relative z-20 min-h-[500px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`flip-card-${currentScene}`}
            custom={direction}
            initial={
              is3DFlipActive
                ? cardFlipVariants.initial
                : { opacity: 0, scale: 0.98, filter: 'blur(3px)' }
            }
            animate={
              is3DFlipActive
                ? cardFlipVariants.animate
                : { opacity: 1, scale: 1, filter: 'blur(0px)' }
            }
            exit={
              is3DFlipActive
                ? cardFlipVariants.exit
                : { opacity: 0, scale: 0.98, filter: 'blur(3px)' }
            }
            transition={
              is3DFlipActive
                ? cardFlipVariants.transition
                : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
            }
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
            className="relative w-full flex-1 flex flex-col justify-center rounded-2xl border border-amber-500/15 bg-neutral-950/45 backdrop-blur-xs p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_25px_rgba(212,175,55,0.08)]"
          >
            {/* Dynamic 3D Specular Light Sweep across the card as it flips in mid-air */}
            {is3DFlipActive && (
              <motion.div
                initial={{ opacity: 0.45, x: direction > 0 ? '-60%' : '60%' }}
                animate={{ opacity: 0, x: direction > 0 ? '100%' : '-100%' }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-amber-200/15 to-transparent z-30"
              />
            )}

            {/* SCENE: Interactive Opener */}
            {activeSectionId === 'opener' && (
              <div className="my-auto py-4 space-y-4">
                {renderOpener()}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleOpenerTrigger}
                    className="px-4 py-2 rounded-xl bg-black/50 hover:bg-black/75 border border-[#D6B574]/40 text-[#F8F1E5] text-xs font-bold transition-all cursor-pointer"
                  >
                    تخطي الحركة وعرض تفاصيل الدعوة فوراً • Skip Animation
                  </button>
                </div>
              </div>
            )}

          {/* SCENE: Invitation Card & Royal Calligraphy */}
          {activeSectionId === 'card' && (
            <motion.div
              ref={frontCardRef}
              key="scene-1"
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(3px)' }}
              className="max-w-xl mx-auto my-auto w-full text-center space-y-6"
            >
              {/* Decorative Basmala & Quote */}
              <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="space-y-2">
                <div className="text-amber-400 font-amiri text-lg tracking-wider">
                  بسم الله الرحمن الرحيم
                </div>
                <div className="text-neutral-300/80 font-amiri text-sm sm:text-base italic leading-relaxed px-4">
                  {invitation.welcomeQuote}
                </div>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto pt-2" />
              </motion.div>

              {invitation.coverImage && (
                <motion.div
                  variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                  className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-2 border-amber-400/50 shadow-[0_0_25px_rgba(212,175,55,0.25)]"
                >
                  <img
                    src={invitation.coverImage}
                    alt={invitation.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              {/* Names presentation */}
              <motion.div
                variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                className="py-4 px-6 rounded-2xl bg-neutral-900/60 border border-amber-500/20 shadow-inner"
              >
                {invitation.category === 'graduation' ||
                invitation.category === 'graduation_project' ? (
                  <div className="space-y-2.5">
                    <motion.span
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="block text-cyan-400 text-xs font-semibold uppercase tracking-widest"
                    >
                      {invitation.category === 'graduation_project' || invitation.projectTitle
                        ? '🎓 مناقشة مشروع التخرج الأكاديمي'
                        : 'تتويج مسيرة النجاح والتفوق'}
                    </motion.span>
                    <motion.h2
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="text-2xl sm:text-3xl font-bold font-cairo gold-gradient-text"
                    >
                      {invitation.graduateName}
                    </motion.h2>
                    {invitation.projectTitle && (
                      <motion.div
                        variants={STAGGER_ITEM_VARIANTS.fadeUp}
                        className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-bold leading-relaxed"
                      >
                        «{invitation.projectTitle}»
                      </motion.div>
                    )}
                    <motion.p
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="text-neutral-300 text-sm font-medium"
                    >
                      {invitation.university}
                      {(invitation.departmentName || invitation.college) &&
                        ` — ${invitation.departmentName || invitation.college}`}
                    </motion.p>
                    {invitation.supervisorName && (
                      <motion.p
                        variants={STAGGER_ITEM_VARIANTS.fadeUp}
                        className="text-cyan-300/90 text-xs font-semibold"
                      >
                        بإشراف: {invitation.supervisorName}
                      </motion.p>
                    )}
                    {invitation.defenseHall && (
                      <motion.p
                        variants={STAGGER_ITEM_VARIANTS.fadeUp}
                        className="text-neutral-400 text-xs"
                      >
                        قاعة المناقشة: {invitation.defenseHall}
                      </motion.p>
                    )}
                    {invitation.honorsTitle && (
                      <motion.p
                        variants={STAGGER_ITEM_VARIANTS.fadeUp}
                        className="text-amber-300/90 text-xs"
                      >
                        {invitation.honorsTitle}
                      </motion.p>
                    )}
                  </div>
                ) : invitation.category === 'birthday' ? (
                  <div className="space-y-2">
                    <motion.span
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="block text-pink-400 text-xs font-semibold tracking-wider"
                    >
                      احتفالية ميلاد سعيدة
                    </motion.span>
                    <motion.h2
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="text-3xl sm:text-4xl font-bold font-cairo text-white"
                    >
                      {invitation.birthdayStarName}
                    </motion.h2>
                    <motion.p variants={STAGGER_ITEM_VARIANTS.fadeUp} className="text-amber-300 text-sm">
                      يكمل عامه الـ {invitation.age} 🎈
                    </motion.p>
                  </div>
                ) : invitation.category === 'business_opening' ? (
                  <div className="space-y-2">
                    <motion.span
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="block text-amber-400 text-xs font-semibold tracking-widest"
                    >
                      الافتتاح الرسمي المبارك
                    </motion.span>
                    <motion.h2
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="text-2xl sm:text-3xl font-bold font-cairo gold-gradient-text"
                    >
                      {invitation.businessName}
                    </motion.h2>
                    <motion.p variants={STAGGER_ITEM_VARIANTS.fadeUp} className="text-neutral-400 text-xs">
                      {invitation.businessType}
                    </motion.p>
                  </div>
                ) : invitation.category === 'art_exhibition' ? (
                  <div className="space-y-2.5 py-2 px-3 rounded-xl bg-gradient-to-b from-[#1f0d1d]/80 to-neutral-950/90 border border-[#e29578]/35">
                    <motion.span
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="block text-[#e29578] text-xs font-semibold tracking-widest uppercase"
                    >
                      🎨 الأمسية الافتتاحية للمعرض الفني • Vernissage
                    </motion.span>
                    <motion.h2
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="text-2xl sm:text-3xl font-bold font-amiri text-amber-100"
                    >
                      {invitation.businessName || invitation.title}
                    </motion.h2>
                    {invitation.businessType && (
                      <motion.p variants={STAGGER_ITEM_VARIANTS.fadeUp} className="text-[#e29578]/90 text-xs font-medium">
                        {invitation.businessType}
                      </motion.p>
                    )}
                    {invitation.hostNames && (
                      <motion.p variants={STAGGER_ITEM_VARIANTS.fadeUp} className="text-neutral-400 text-xs">
                        بتنظيم واستضافة: {invitation.hostNames}
                      </motion.p>
                    )}
                  </div>
                ) : invitation.category === 'career_promotion' ? (
                  <div className="space-y-2.5 py-2 px-3 rounded-xl bg-gradient-to-b from-[#09152b]/90 to-neutral-950/90 border border-amber-400/35">
                    <motion.span
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="block text-amber-400 text-xs font-semibold tracking-widest uppercase"
                    >
                      🏆 احتفالية الترقية الوظيفية والاستحقاق القيادي
                    </motion.span>
                    <motion.h2
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="text-2xl sm:text-3xl font-bold font-cairo gold-gradient-text"
                    >
                      {invitation.graduateName || invitation.hostNames}
                    </motion.h2>
                    {invitation.honorsTitle && (
                      <motion.p variants={STAGGER_ITEM_VARIANTS.fadeUp} className="text-amber-300 text-sm font-semibold">
                        {invitation.honorsTitle}
                      </motion.p>
                    )}
                    {invitation.university && (
                      <motion.p variants={STAGGER_ITEM_VARIANTS.fadeUp} className="text-sky-200/90 text-xs">
                        {invitation.university}
                      </motion.p>
                    )}
                    {invitation.college && (
                      <motion.p variants={STAGGER_ITEM_VARIANTS.fadeUp} className="text-neutral-400 text-xs">
                        {invitation.college}
                      </motion.p>
                    )}
                  </div>
                ) : invitation.category === 'family_success' ? (
                  <div className="space-y-2.5 py-2 px-3 rounded-xl bg-gradient-to-b from-[#062c21]/85 to-neutral-950/90 border border-emerald-400/35">
                    <motion.span
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="block text-emerald-300 text-xs font-semibold tracking-widest"
                    >
                      🌟 فرحة النجاح والإنجاز العائلي المبارك
                    </motion.span>
                    <motion.h2
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="text-2xl sm:text-3xl font-bold font-amiri gold-gradient-text"
                    >
                      {invitation.businessName || invitation.title}
                    </motion.h2>
                    {invitation.hostNames && (
                      <motion.p variants={STAGGER_ITEM_VARIANTS.fadeUp} className="text-emerald-200 text-sm font-semibold">
                        بدعوة كريمة من: {invitation.hostNames}
                      </motion.p>
                    )}
                    {invitation.businessType && (
                      <motion.p variants={STAGGER_ITEM_VARIANTS.fadeUp} className="text-amber-300/90 text-xs">
                        {invitation.businessType}
                      </motion.p>
                    )}
                  </div>
                ) : (
                  // Wedding or Engagement
                  <div className="space-y-4">
                    <motion.div
                      variants={STAGGER_ITEM_VARIANTS.fadeUp}
                      className="text-amber-400/90 text-xs tracking-wider"
                    >
                      {invitation.hostNames || 'يتشرف الأهل والأحباب بدعوتكم'}
                    </motion.div>
                    <motion.div
                      variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                      className="flex items-center justify-center gap-4 text-2xl sm:text-3xl font-bold font-amiri gold-gradient-text"
                    >
                      <span>{invitation.groomName} {invitation.groomFamily}</span>
                      <Heart size={20} className="text-amber-400 fill-amber-400/40 animate-pulse" />
                      <span>{invitation.brideName} {invitation.brideFamily}</span>
                    </motion.div>
                  </div>
                )}

                {/* Invitation Body */}
                <motion.p
                  variants={STAGGER_ITEM_VARIANTS.fadeUp}
                  className="text-neutral-300 text-sm leading-relaxed mt-4 font-cairo px-2"
                >
                  {invitation.invitationBody}
                </motion.p>
              </motion.div>

              {/* Cinema Gallery & Interactive Color Filters Library (معرض صور السينما ومكتبة الفلاتر اللونية) */}
              {cinemaGalleryFrames.length > 0 && (
                <motion.div
                  variants={STAGGER_ITEM_VARIANTS.fadeUp}
                  className="p-4 rounded-2xl bg-neutral-950/90 border border-amber-500/30 space-y-3 text-right shadow-xl"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-sm">🎬</span>
                      <span className="text-xs font-bold text-amber-200">
                        معرض اللقطات السينمائية وفلاتر المزاج البصري (Color Filters)
                      </span>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
                      {getColorFilterMeta(activeGalleryFilter).nameAr}
                    </span>
                  </div>

                  {/* Interactive Color Filters Pill Strip */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {COLOR_FILTERS_LIBRARY.map((flt) => {
                      const isSelected = activeGalleryFilter === flt.id;
                      return (
                        <button
                          key={flt.id}
                          type="button"
                          onClick={() => setActiveGalleryFilter(flt.id)}
                          className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow'
                              : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:border-amber-500/40'
                          }`}
                          title={flt.descAr}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/50 shrink-0"
                            style={{ background: flt.swatchGradient }}
                          />
                          <span>{flt.nameAr.split(' (')[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Film Strip Photo Gallery Grid */}
                  <div className="rounded-xl overflow-hidden bg-black border border-white/15">
                    <div className="h-3.5 bg-neutral-950 flex items-center justify-between px-2.5">
                      {Array.from({ length: 14 }).map((_, idx) => (
                        <span key={idx} className="w-2.5 h-1.5 rounded-xs bg-amber-200/25" />
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-neutral-950/80">
                      {cinemaGalleryFrames.map((imgUrl, idx) => {
                        const fltMeta = getColorFilterMeta(activeGalleryFilter);
                        return (
                          <div
                            key={idx}
                            className="relative aspect-16/10 rounded-lg overflow-hidden border border-amber-500/25 group"
                          >
                            <img
                              src={imgUrl}
                              alt={`Cinema Frame ${idx + 1}`}
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                              style={{ filter: fltMeta.cssFilter }}
                            />
                            {fltMeta.id !== 'original' && (
                              <div
                                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                                style={{ background: fltMeta.tintOverlay }}
                              />
                            )}
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-amber-300 text-[9px] font-mono">
                              FRAME 0{idx + 1} • {fltMeta.badge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="h-3.5 bg-neutral-950 flex items-center justify-between px-2.5">
                      {Array.from({ length: 14 }).map((_, idx) => (
                        <span key={idx} className="w-2.5 h-1.5 rounded-xs bg-amber-200/25" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation & Save as Image buttons */}
              <motion.div
                variants={STAGGER_ITEM_VARIANTS.actionButton}
                className="flex flex-wrap items-center justify-center gap-3 pt-1"
              >
                <button
                  type="button"
                  onClick={handleSaveAsImage}
                  disabled={isDownloadingCard}
                  className="px-5 py-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-500/40 font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileImage size={15} />
                  <span>{isDownloadingCard ? 'جاري تصدير الصورة...' : 'حفظ كصورة'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateScene(Math.min(scenes.length - 1, currentScene + 1))}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>متابعة القسم التالي من الدعوة</span>
                  <ChevronLeft size={16} />
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* SCENE: Date, Time & Live Countdown */}
          {activeSectionId === 'datetime' && (
            <motion.div
              key="scene-2"
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(3px)' }}
              className="max-w-xl mx-auto my-auto w-full text-center space-y-6"
            >
              <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="space-y-1">
                <span className="text-amber-400 text-xs font-semibold tracking-wider">
                  موعدنا الذي ننتظره بشوق
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  تاريخ وموعد المناسبة
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
                    <div className="text-xs text-neutral-400">التاريخ الميلادي</div>
                    <div className="text-base font-bold text-white font-mono">
                      {invitation.eventDate}
                    </div>
                    {invitation.hijriDate && (
                      <div className="text-[11px] text-amber-300/80 font-amiri">
                        {invitation.hijriDate}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/80 border border-amber-500/20 flex items-center justify-center gap-3">
                  <Clock className="text-amber-400 shrink-0" size={24} />
                  <div className="text-right">
                    <div className="text-xs text-neutral-400">توقيت الحفل</div>
                    <div className="text-base font-bold text-white font-mono">
                      {invitation.eventTime}
                    </div>
                    <div className="text-[11px] text-neutral-400">مساءً بتوقيت بغداد</div>
                  </div>
                </div>
              </motion.div>

              {/* Live Animated Countdown Timer */}
              <motion.div variants={STAGGER_ITEM_VARIANTS.scaleReveal}>
                <CountdownTimer
                  eventDate={invitation.eventDate}
                  eventTime={invitation.eventTime}
                  stylePreset={invitation.countdownStyle || 'gold_luxury'}
                  digitColor={invitation.countdownDigitColor}
                  digitFont={invitation.countdownDigitFont}
                  numeralSystem={invitation.countdownNumeralSystem}
                  templateId={invitation.templateId}
                  title={invitation.countdownTitle || (isEnglish ? 'Event Countdown' : 'العد التنازلي للحفل المبارك')}
                  showSeconds={invitation.showSecondsInCountdown !== false}
                  celebrationText={invitation.countdownCelebrationText || (isEnglish ? 'The celebration has begun! Welcome! 🎉' : 'حان موعد الحفل المبارك! أهلاً وسهلاً بكم 🎉')}
                  size="md"
                />
              </motion.div>

              {/* Dress code & special notes */}
              {(invitation.dressCode || invitation.notes) && (
                <motion.div
                  variants={STAGGER_ITEM_VARIANTS.fadeUp}
                  className="text-xs text-neutral-400 space-y-1"
                >
                  {invitation.dressCode && (
                    <p>
                      <strong className="text-amber-400/90">الزي المقترح: </strong>
                      {invitation.dressCode}
                    </p>
                  )}
                  {invitation.notes && (
                    <p className="text-neutral-400/80 italic">{invitation.notes}</p>
                  )}
                </motion.div>
              )}

              {/* Add to Calendar Actions (Google Calendar & ICS File) */}
              <motion.div
                variants={STAGGER_ITEM_VARIANTS.fadeUp}
                className="flex flex-wrap items-center justify-center gap-2.5 pt-1"
              >
                <a
                  href={getGoogleCalendarUrl(invitation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/35 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <CalendarPlus size={14} />
                  <span>إضافة إلى تقويم Google</span>
                </a>
                <button
                  type="button"
                  onClick={() => downloadIcsFile(invitation)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Calendar size={14} className="text-amber-400" />
                  <span>حفظ في تقويم الهاتف (.ICS)</span>
                </button>
              </motion.div>

              <motion.button
                variants={STAGGER_ITEM_VARIANTS.actionButton}
                onClick={() => navigateScene(Math.min(scenes.length - 1, currentScene + 1))}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 mx-auto hover:brightness-110 transition-all"
              >
                <span>متابعة القسم التالي</span>
                <ChevronLeft size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* SCENE: Venue & Maps Navigation */}
          {activeSectionId === 'location' && (
            <motion.div
              key="scene-3"
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(3px)' }}
              className="max-w-xl mx-auto my-auto w-full text-center space-y-6"
            >
              <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="space-y-1">
                <span className="text-amber-400 text-xs font-semibold tracking-wider">
                  موقع ومكان الحفل
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {invitation.venueName}
                </h3>
                <p className="text-neutral-400 text-xs">
                  {invitation.city} - {invitation.addressDetails}
                </p>
              </motion.div>

              {/* Interactive Map Visual Simulator */}
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
                  <div className="text-sm font-bold text-amber-100">{invitation.venueName}</div>
                  <div className="text-xs text-neutral-400">{invitation.addressDetails}</div>
                </motion.div>

                {/* Route Actions */}
                <motion.div
                  variants={STAGGER_ITEM_VARIANTS.actionButton}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
                >
                  <a
                    href={invitation.googleMapsUrl || 'https://maps.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Navigation size={15} />
                    <span>فتح في خرائط Google Maps</span>
                    <ExternalLink size={13} />
                  </a>

                  {invitation.wazeUrl && (
                    <a
                      href={invitation.wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-medium text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <span>تطبيق Waze للقيادة</span>
                    </a>
                  )}
                </motion.div>

                {invitation.startPointUrl && (
                  <motion.div
                    variants={STAGGER_ITEM_VARIANTS.fadeUp}
                    className="pt-2 text-[11px] text-amber-300/70"
                  >
                    📍 تم تحديد نقطة الانطلاق ونقطة الوصول لسهولة وصول الضيوف
                  </motion.div>
                )}
              </motion.div>

              <motion.button
                variants={STAGGER_ITEM_VARIANTS.actionButton}
                onClick={() => navigateScene(Math.min(scenes.length - 1, currentScene + 1))}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 mx-auto hover:brightness-110 transition-all"
              >
                <span>متابعة تأكيد الحضور (RSVP)</span>
                <ChevronLeft size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* SCENE: RSVP Form */}
          {activeSectionId === 'rsvp' && (
            <motion.div
              key="scene-4"
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-md mx-auto my-auto w-full space-y-5"
            >
              <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="text-center space-y-1">
                <span className="text-amber-400 text-xs font-semibold tracking-wider">
                  تأكيد الحضور (RSVP)
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {personalGuest
                    ? `تأكيد حضور ${personalGuest.familyTitle || personalGuest.guestName}`
                    : 'يسعدنا تأكيد حضوركم الكريم'}
                </h3>
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                    المقاعد المخصصة لهذه الدعوة: {maxAllowedSeats} {maxAllowedSeats === 1 ? 'مقعد' : 'مقاعد'}
                  </span>
                  {personalGuest?.tableNumber && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                      طاولة رقم #{personalGuest.tableNumber}
                    </span>
                  )}
                </div>
                {invitation.rsvpDeadline && (
                  <p className="text-neutral-400 text-xs">
                    يرجى تأكيد الحضور قبل تاريخ: {invitation.rsvpDeadline}
                  </p>
                )}
              </motion.div>

              {rsvpSubmitted ? (
                <motion.div
                  variants={STAGGER_ITEM_VARIANTS.scaleReveal}
                  className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-200">
                    {rsvpStatus === 'attending'
                      ? 'تم تأكيد حضوركم وإصدار بطاقة الدخول بنجاح!'
                      : 'تم تسجيل ردكم بنجاح، شكراً لكم'}
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    شكراً لكم <strong className="text-white">{guestName}</strong>
                    {rsvpStatus === 'attending'
                      ? ` (${companionsCount} مقاعد محجوزة باسمكم). يرجى إبراز رمز QR أدناه لموظف الاستقبال عند الوصول للقاعة:`
                      : '، نتمنى لكم دوام الأفراح والمسرات.'}
                  </p>

                  {rsvpStatus === 'attending' && qrCodeDataUrl && (
                    <div className="p-3 bg-white rounded-2xl mx-auto inline-block shadow-lg space-y-1">
                      <img src={qrCodeDataUrl} alt="Personal Entry QR" className="w-36 h-36 mx-auto" />
                      <div className="text-[10px] font-bold text-neutral-900 font-mono">
                        {personalGuest?.qrCodeToken || `PASS-${invitation.id.toUpperCase()}`}
                        {personalGuest?.tableNumber ? ` • طاولة #${personalGuest.tableNumber}` : ''}
                      </div>
                    </div>
                  )}

                  <div>
                    <button
                      onClick={() => navigateScene(5)}
                      className="px-5 py-2.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs shadow cursor-pointer"
                    >
                      الانتقال لسجل التهاني والتبريكات ✍️
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  variants={STAGGER_CONTAINER_VARIANTS}
                  onSubmit={handleRsvpSubmit}
                  className="space-y-4"
                >
                  {/* Status Options */}
                  <motion.div variants={STAGGER_ITEM_VARIANTS.scaleReveal} className="grid grid-cols-3 gap-2">
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
                  </motion.div>

                  {/* Name Input */}
                  <motion.div variants={STAGGER_ITEM_VARIANTS.fadeUp}>
                    <label className="block text-xs font-medium text-neutral-300 mb-1 text-right">
                      الاسم الكريم أو اسم العائلة *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="اكتب اسمك الثلاثي أو اسم العائلة"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                    />
                  </motion.div>

                  {/* Phone Input */}
                  <motion.div variants={STAGGER_ITEM_VARIANTS.fadeUp}>
                    <label className="block text-xs font-medium text-neutral-300 mb-1 text-right">
                      رقم الهاتف (لإرسال بطاقة الدخول والتذكير)
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+964 7XX XXX XXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-neutral-500 outline-none transition-all dir-ltr text-right"
                    />
                  </motion.div>

                  {/* Companions count & names if attending */}
                  {rsvpStatus === 'attending' && (
                    <motion.div variants={STAGGER_ITEM_VARIANTS.fadeUp} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-neutral-300">
                          عدد المقاعد المطلوبة (بحد أقصى {maxAllowedSeats})
                        </label>
                        <span className="text-[11px] text-amber-400 font-mono">
                          {companionsCount} / {maxAllowedSeats} مقاعد
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.max(1, companionsCount - 1);
                            setCompanionsCount(next);
                            setCompanionNames((prev) => prev.slice(0, Math.max(0, next - 1)));
                          }}
                          className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold hover:bg-neutral-700"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center font-bold text-amber-300 text-lg font-mono">
                          {companionsCount} {companionsCount === 1 ? 'مقعد' : 'مقاعد'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.min(maxAllowedSeats, companionsCount + 1);
                            setCompanionsCount(next);
                          }}
                          className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold hover:bg-neutral-700"
                        >
                          +
                        </button>
                      </div>

                      {/* Companion names fields */}
                      {companionsCount > 1 && (
                        <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2">
                          <div className="text-[11px] text-amber-300 font-bold">
                            أسماء المرافقين ({companionsCount - 1} مرافقين مسموح بهم):
                          </div>
                          {Array.from({ length: companionsCount - 1 }).map((_, idx) => (
                            <input
                              key={idx}
                              type="text"
                              value={companionNames[idx] || ''}
                              onChange={(e) => {
                                const updated = [...companionNames];
                                updated[idx] = e.target.value;
                                setCompanionNames(updated);
                              }}
                              placeholder={`اسم المرافق ${idx + 1} (اختياري)`}
                              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Notes / Special remarks */}
                  <motion.div variants={STAGGER_ITEM_VARIANTS.fadeUp}>
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
                  </motion.div>

                  <motion.button
                    variants={STAGGER_ITEM_VARIANTS.actionButton}
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all cursor-pointer"
                  >
                    إرسال تأكيد الحضور الآن
                  </motion.button>
                </motion.form>
              )}
            </motion.div>
          )}

          {/* SCENE: Guestbook & Congratulations */}
          {activeSectionId === 'guestbook' && (
            <motion.div
              key="scene-5"
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-xl mx-auto my-auto w-full space-y-5"
            >
              <motion.div variants={STAGGER_ITEM_VARIANTS.royalHeader} className="text-center space-y-1">
                <span className="text-amber-400 text-xs font-semibold tracking-wider">
                  سجل التهاني والتبريكات
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  شارك بكلمة طيبة تخلّد الذكرى
                </h3>
              </motion.div>

              {/* Guestbook Submission Form */}
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
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Upload size={12} />
                      <span>{gbPhotoUrl ? 'تم إرفاق صورة تذكارية ✓' : 'إرفاق صورة تذكارية (اختياري)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGuestbookPhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {gbPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setGbPhotoUrl('')}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                      >
                        إزالة الصورة
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>إرسال التهنئة</span>
                  </button>
                </div>
                {gbSubmitted && (
                  <p className="text-emerald-400 text-xs text-center font-medium animate-pulse">
                    {invitation.requireGuestbookApproval
                      ? 'تم إرسال تهنئتكم بنجاح! ستظهر فور موافقة صاحب المناسبة ✨'
                      : 'تمت إضافة تهنئتكم العطرة بنجاح ✨'}
                  </p>
                )}
              </motion.form>

              {/* Guestbook Messages List */}
              <motion.div
                variants={STAGGER_ITEM_VARIANTS.fadeUp}
                className="space-y-3 max-h-60 overflow-y-auto pr-1"
              >
                {guestbookMessages.filter(
                  (m) => !invitation.requireGuestbookApproval || m.approved !== false
                ).length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                    كن أول من يهنئ ويترك بصمة فرح هنا! 💌
                  </div>
                ) : (
                  guestbookMessages
                    .filter((m) => !invitation.requireGuestbookApproval || m.approved !== false)
                    .map((msg) => (
                      <motion.div
                        key={msg.id}
                        variants={STAGGER_ITEM_VARIANTS.fadeUp}
                        className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-right space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                          <span>{msg.senderName}</span>
                          <span className="text-neutral-500 font-normal">
                            {new Date(msg.createdAt).toLocaleDateString('ar-IQ')}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 leading-relaxed font-cairo">
                          {msg.message}
                        </p>
                        {msg.photoUrl && (
                          <div className="pt-1">
                            <img
                              src={msg.photoUrl}
                              alt={msg.senderName}
                              className="max-h-36 rounded-xl border border-amber-500/25 object-cover"
                            />
                          </div>
                        )}
                      </motion.div>
                    ))
                )}
              </motion.div>
            </motion.div>
          )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Scene Pager Navigation Footer */}
      <div className="relative z-30 px-6 py-4 border-t border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={() => navigateScene(Math.max(0, currentScene - 1))}
          disabled={currentScene === 0}
          className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition-colors"
        >
          <ChevronRight size={15} />
          <span>المشهد السابق</span>
        </button>

        <span className="text-xs text-amber-300/80 font-medium">
          {scenes[currentScene]?.title} ({currentScene + 1} من {scenes.length})
        </span>

        <button
          onClick={() => navigateScene(Math.min(scenes.length - 1, currentScene + 1))}
          disabled={currentScene === scenes.length - 1}
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
