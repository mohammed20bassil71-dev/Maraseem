import React, { useState } from 'react';
import {
  Palette,
  Calendar,
  MapPin,
  Music,
  Eye,
  Sliders,
  Type,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Monitor,
  Smartphone,
  Play,
  Pause,
  Upload,
  Volume2,
  VolumeX,
  FileAudio,
  Trash2,
  Check,
  Timer,
  Video,
  Rotate3d,
  MousePointerClick,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Layers,
  X,
} from 'lucide-react';

import {
  InvitationData,
  Template,
  ClickInteractionEffectType,
  ClickEffectSpeed,
  InvitationSectionId,
  SingleInteractionMode,
  MovieTitleAnimationStyle,
  MovieTransitionStyle,
} from '../../types/invitation';
import {
  MOVIE_TITLE_ANIMATION_OPTIONS,
  MOVIE_TRANSITION_STYLE_OPTIONS,
  isMovieTrailerInvitation,
} from '../invitation-experience/MovieTrailerInvitationExperience';
import {
  INVITATION_CLICK_EFFECT_OPTIONS,
  CLICK_EFFECT_SPEED_OPTIONS,
  dispatchClickEffectPreview,
} from '../engine/MaraseemMagicEffectsSystem';
import { CinematicColorFilter } from '../../types/birthdayExperience';
import { COLOR_FILTERS_LIBRARY } from '../../data/birthdayTemplates';
import { InteractiveInvitationView } from '../invitation-experience/InteractiveInvitationView';
import { VISUAL_EFFECT_OPTIONS } from '../invitation-experience/AmbientVisualEffects';
import {
  DEFAULT_INVITATION_SECTION_ORDER,
  INVITATION_SECTION_META,
} from '../invitation-experience/StageCurtainExperience';
import {
  SINGLE_INTERACTION_MODE_OPTIONS,
  getOpeningExperiencesForCategory,
  resolveSingleInteractionMode,
} from '../royal3d/Royal3DLuxuryInvitationExperience';
import { soundEngine } from '../../utils/audio';
import { buildShareableInvitationUrl, sanitizeInvitationSlug } from '../../utils/shareLink';
import {
  CountdownTimer,
  CountdownStyle,
  COUNTDOWN_FONT_OPTIONS,
  COUNTDOWN_COLOR_PRESETS,
} from '../countdown/CountdownTimer';
import { useLanguage } from '../../i18n/LanguageContext';

interface InvitationEditorProps {
  initialData?: InvitationData;
  template?: Template;
  onSave: (data: InvitationData) => void;
  onCancel: () => void;
}

type EditorStepId =
  | 'event_data'
  | 'design_colors'
  | 'photos'
  | 'opening_interaction'
  | 'music_effects'
  | 'preview_publish';

export const InvitationEditor: React.FC<InvitationEditorProps> = ({
  initialData,
  template,
  onSave,
  onCancel,
}) => {
  const { lang, tr } = useLanguage();

  const [formData, setFormData] = useState<InvitationData>(() => {
    if (initialData) return initialData;

    const defaults = template?.defaultValues || {};
    const randomSlug = `invite-${Math.random().toString(36).substring(2, 8)}`;

    return {
      id: `inv-${Date.now()}`,
      slug: randomSlug,
      templateId: template?.id || 'tpl-royal-3d-envelope',
      templateStyle: defaults.templateStyle || template?.style,
      atelierTheme: defaults.atelierTheme || template?.atelierTheme,
      originalHtmlPath: defaults.originalHtmlPath,
      category: template?.category || 'wedding',
      title: defaults.title || 'دعوة زفاف ملكية مباركة',
      movieTitle: defaults.movieTitle || '',
      movieTagline: defaults.movieTagline || '',
      movieDirector: defaults.movieDirector || '',
      movieRatingBadge: defaults.movieRatingBadge || 'VIP PREMIERE • IMAX 70MM',
      movieTitleAnimation: defaults.movieTitleAnimation || 'epic_zoom_flare',
      movieTransitionStyle: defaults.movieTransitionStyle || 'anamorphic_flare_wipe',
      movieKeyCast: defaults.movieKeyCast || [
        { name: defaults.groomName || 'أحمد السامرائي', role: 'البطولة الأولى • العريس (Leading Groom)' },
        { name: defaults.brideName || 'سارة التميمي', role: 'البطولة الأولى • العروس (Leading Bride)' },
        { name: defaults.hostNames || 'عائلتا العروسين', role: 'المنتجون الفخريون • الداعون (Executive Hosts)' },
      ],
      groomName: defaults.groomName || 'أحمد',
      groomFamily: defaults.groomFamily ?? 'السامرائي',
      brideName: defaults.brideName || 'سارة',
      brideFamily: defaults.brideFamily ?? 'التميمي',
      hostNames: defaults.hostNames || 'عائلتا العروسين',
      graduateName: defaults.graduateName || 'د. علي كمال',
      university: defaults.university || 'جامعة بغداد',
      college: defaults.college || 'كلية الطب',
      departmentName: defaults.departmentName || defaults.college || 'قسم هندسة الحاسوب',
      academicDegree: defaults.academicDegree || 'بكالوريوس',
      projectTitle: defaults.projectTitle || '',
      supervisorName: defaults.supervisorName || '',
      defenseHall: defaults.defenseHall || '',
      major: defaults.major || 'medicine',
      graduationYear: defaults.graduationYear || '2026',
      honorsTitle: defaults.honorsTitle || 'بمرتبة الشرف',
      birthdayStarName: defaults.birthdayStarName || 'جود',
      age: defaults.age || 7,
      businessName: defaults.businessName || 'مجمع الأعمال الملكي',
      businessType: defaults.businessType || 'مجمع تجاري واستثماري',
      eventDate: defaults.eventDate || '2026-11-20',
      eventTime: defaults.eventTime || '08:00 PM',
      hijriDate: defaults.hijriDate || '١٠ جمادى الأولى ١٤٤٨ هـ',
      venueName: defaults.venueName || 'فندق بابل روتانا - القاعة الملكية',
      city: defaults.city || 'بغداد، العراق',
      addressDetails: defaults.addressDetails || 'شارع الكرادة مريم',
      googleMapsUrl: defaults.googleMapsUrl || 'https://maps.google.com',
      startPointName: defaults.startPointName || 'بيت العريس - بغداد',
      startPointUrl: defaults.startPointUrl || '',
      wazeUrl: defaults.wazeUrl || '',
      contactPhone: defaults.contactPhone || '+964 771 166 3778',
      ceremonyScheduleText:
        defaults.ceremonyScheduleText ||
        'يبدأ الحفل باستقبال الضيوف، ثم زفة العروسين وتبادل التهاني.',
      welcomeQuote:
        defaults.welcomeQuote ||
        '«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا»',
      invitationBody:
        defaults.invitationBody ||
        'نتشرف بدعوتكم لحضور حفلنا المبارك ومشاركتنا أبهى لحظات العمر.',
      dressCode: defaults.dressCode || 'رسمي فاخر',
      notes: defaults.notes || 'جنة الأطفال منازلهم',
      coverImage: defaults.coverImage,
      couplePortraitImage: defaults.couplePortraitImage,
      galleryImages: [],
      musicTrack: defaults.musicTrack || 'romantic_piano',
      countdownTitle: defaults.countdownTitle || 'العد التنازلي للحفل المبارك',
      countdownStyle: defaults.countdownStyle || 'gold_luxury',
      countdownDigitColor: defaults.countdownDigitColor || 'template_auto',
      countdownDigitFont: defaults.countdownDigitFont || 'amiri_royal',
      countdownNumeralSystem: defaults.countdownNumeralSystem || 'arabic_indic',
      showSecondsInCountdown: defaults.showSecondsInCountdown !== false,
      countdownCelebrationText:
        defaults.countdownCelebrationText || 'حان موعد الحفل المبارك! أهلاً وسهلاً بكم 🎉',
      rsvpEnabled: true,
      rsvpDeadline: '2026-11-15',
      maxGuestsPerInvite: defaults.maxGuestsPerInvite || 3,
      guestbookEnabled: true,
      requireGuestbookApproval: defaults.requireGuestbookApproval ?? false,
      passwordProtected: defaults.passwordProtected ?? false,
      invitationPassword: defaults.invitationPassword || '',
      backgroundVideoUrl: defaults.backgroundVideoUrl,
      backgroundVideoName: defaults.backgroundVideoName,
      backgroundVideoPlaying: defaults.backgroundVideoPlaying ?? true,
      backgroundVideoMuted: defaults.backgroundVideoMuted ?? true,
      backgroundVideoVolume: defaults.backgroundVideoVolume ?? 60,
      backgroundVideoOverlayOpacity: defaults.backgroundVideoOverlayOpacity ?? 55,
      pageTransitionMode: defaults.pageTransitionMode || '3d-flip',
      visualEffect: defaults.visualEffect || 'auto',
      clickEffect: defaults.clickEffect || 'none',
      clickEffectSpeed: defaults.clickEffectSpeed || 'medium',
      visualDirection: defaults.visualDirection || 'obsidian_champagne',
      openerStyle3D: defaults.openerStyle3D || 'auto',
      singleInteractionMode: defaults.singleInteractionMode,
      sectionOrder: defaults.sectionOrder || DEFAULT_INVITATION_SECTION_ORDER,
      enable3DFlowersAndButterflies: defaults.enable3DFlowersAndButterflies ?? true,
      customFontFamily: defaults.customFontFamily || 'amiri',
      customPrimaryColor: defaults.customPrimaryColor || '#D6B574',
      customBgColor: defaults.customBgColor || '#F8F1E5',
      viewCount: 0,
      createdAt: new Date().toISOString(),
    };
  });

  // PART 6: 6 Organized Accordion / Step Sections
  const [activeStep, setActiveStep] = useState<EditorStepId>('event_data');
  const [previewMode, setPreviewMode] = useState<'split' | 'preview_only'>('split');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'mobile'>('mobile');
  const [mobileViewTab, setMobileViewTab] = useState<'edit' | 'preview'>('edit');
  const [showMobileStepSheet, setShowMobileStepSheet] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [auditioningTrackId, setAuditioningTrackId] = useState<string | null>(null);
  const [musicVolume] = useState<number>(65);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState<string>('');

  const EDITOR_STEPS: {
    id: EditorStepId;
    num: number;
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    icon: React.FC<{ size?: number; className?: string }>;
  }[] = [
    {
      id: 'event_data',
      num: 1,
      titleAr: 'بيانات المناسبة',
      titleEn: 'Event Details',
      subtitleAr: 'الأسماء، التاريخ، الوقت، القاعة، وخرائط Google',
      icon: Type,
    },
    {
      id: 'design_colors',
      num: 2,
      titleAr: 'التصميم والألوان',
      titleEn: 'Design & Colors',
      subtitleAr: 'ألوان Royal Luxury، الخطوط العربية، والعد التنازلي',
      icon: Palette,
    },
    {
      id: 'photos',
      num: 3,
      titleAr: 'الصور',
      titleEn: 'Photos',
      subtitleAr: 'صورة الغلاف، صورة العروسين/المناسبة، ومعرض الصور',
      icon: ImageIcon,
    },
    {
      id: 'opening_interaction',
      num: 4,
      titleAr: 'تجربة الافتتاح • Opening Experience',
      titleEn: 'Opening Experience',
      subtitleAr: 'مجسم 3D قابل للنقر حسب نوع المناسبة (تفاعل واحد لكل دعوة)',
      icon: Rotate3d,
    },
    {
      id: 'music_effects',
      num: 5,
      titleAr: 'الموسيقى والمؤثرات',
      titleEn: 'Music & Effects',
      subtitleAr: 'المقاطع الصوتية، رفع MP3 خاص، والمؤثرات البصرية',
      icon: Music,
    },
    {
      id: 'preview_publish',
      num: 6,
      titleAr: 'المعاينة والنشر',
      titleEn: 'Preview & Publish',
      subtitleAr: 'تأكيد الحضور RSVP، الرابط المختصر، وحفظ ونشر الدعوة',
      icon: Sparkles,
    },
  ];

  // Stop music when leaving editor
  React.useEffect(() => {
    return () => {
      soundEngine.stopAmbientMusic();
    };
  }, []);

  const handleToggleAudition = (trackId: string, customUrl?: string) => {
    if (auditioningTrackId === trackId) {
      soundEngine.stopAmbientMusic();
      setAuditioningTrackId(null);
    } else {
      soundEngine.setVolume(musicVolume / 100);
      soundEngine.startAmbientMusic(trackId, customUrl || formData.customAudioUrl);
      setAuditioningTrackId(trackId);
    }
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError(
        'حجم الملف الصوتي كبير جداً (أكثر من 15 ميغابايت). يرجى اختيار ملف MP3 أخف حجماً.'
      );
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        musicTrack: 'custom_upload',
        customAudioUrl: dataUrl,
        customAudioName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSetCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      musicTrack: 'custom_upload',
      customAudioUrl: customUrlInput.trim(),
      customAudioName: customUrlInput.split('/').pop() || 'رابط صوتي خارجي',
    }));
    setCustomUrlInput('');
  };

  const handleRemoveCustomAudio = () => {
    if (auditioningTrackId === 'custom_upload') {
      soundEngine.stopAmbientMusic();
      setAuditioningTrackId(null);
    }
    setFormData((prev) => ({
      ...prev,
      musicTrack: 'romantic_piano',
      customAudioUrl: undefined,
      customAudioName: undefined,
    }));
  };

  const handleBackgroundVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['video/mp4', 'video/webm'];
    const isMp4OrWebm =
      validTypes.includes(file.type) ||
      file.name.toLowerCase().endsWith('.mp4') ||
      file.name.toLowerCase().endsWith('.webm');

    if (!isMp4OrWebm) {
      setVideoUploadError('يرجى اختيار ملف فيديو بصيغة MP4 أو WebM فقط.');
      return;
    }

    if (file.size > 40 * 1024 * 1024) {
      setVideoUploadError('حجم الفيديو كبير جداً (أكثر من 40 ميغابايت).');
      return;
    }

    setVideoUploadError(null);
    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      backgroundVideoUrl: objectUrl,
      backgroundVideoName: file.name,
      backgroundVideoPlaying: true,
      backgroundVideoMuted: prev.backgroundVideoMuted ?? true,
      backgroundVideoVolume: prev.backgroundVideoVolume ?? 60,
      backgroundVideoOverlayOpacity: prev.backgroundVideoOverlayOpacity ?? 55,
    }));
  };

  const handleSetCustomVideoUrl = () => {
    if (!customVideoUrlInput.trim()) return;
    setVideoUploadError(null);
    setFormData((prev) => ({
      ...prev,
      backgroundVideoUrl: customVideoUrlInput.trim(),
      backgroundVideoName: customVideoUrlInput.split('/').pop() || 'فيديو خلفية خارجي',
      backgroundVideoPlaying: true,
    }));
    setCustomVideoUrlInput('');
  };

  const handleRemoveBackgroundVideo = () => {
    setFormData((prev) => ({
      ...prev,
      backgroundVideoUrl: undefined,
      backgroundVideoName: undefined,
      backgroundVideoPlaying: false,
    }));
  };

  const updateField = (field: keyof InvitationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // PART 4: Selecting Single Interaction Mode updates ONLY the opening interaction
  // and does NOT overwrite names, photos, date, event details, or colors.
  const handleSelectSingleInteraction = (mode: SingleInteractionMode) => {
    setFormData((prev) => ({
      ...prev,
      singleInteractionMode: mode,
    }));
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const activeSingleInteraction: SingleInteractionMode = resolveSingleInteractionMode(formData);
  const currentStepMeta =
    EDITOR_STEPS.find((s) => s.id === activeStep) || EDITOR_STEPS[0];

  return (
    <div className="w-full min-h-screen bg-[#F8F1E5] text-[#17130F] overflow-x-hidden pb-24 lg:pb-12">
      {/* Top Royal Luxury Editor Toolbar */}
      <div className="sticky top-0 z-40 px-4 sm:px-6 py-3.5 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#D6B574]/40 flex items-center justify-between flex-wrap gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-[#F8F1E5] hover:bg-[#D6B574]/25 text-[#17130F] border border-[#D6B574]/40 transition-colors cursor-pointer shrink-0"
            title={tr('العودة', 'Back')}
          >
            <ArrowRight size={18} className={lang === 'en' ? 'rotate-180' : ''} />
          </button>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-[#17130F] flex items-center gap-2 flex-wrap truncate">
              <span>{tr('استوديو تصميم الدعوة الملكية', 'Royal Invitation Studio')}</span>
              <span className="text-[10px] text-[#17130F] px-2.5 py-0.5 rounded-full bg-[#D6B574]/30 border border-[#D6B574] font-bold">
                {lang === 'en'
                  ? template?.nameEn || template?.name || 'Royal Template'
                  : template?.name || 'قالب ملكي'}
              </span>
            </h2>
            <div className="text-[11px] text-[#5C5346] flex items-center gap-1.5 truncate">
              <span>{tr('رابط الدعوة:', 'Invite Link:')}</span>
              <span className="text-[#A98445] font-bold font-mono text-[11px]" dir="ltr">
                ?i={formData.slug}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Device Viewport Toggle */}
          <div className="hidden sm:flex items-center bg-[#F8F1E5] rounded-xl p-1 border border-[#D6B574]/40">
            <button
              type="button"
              onClick={() => setDeviceViewport('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceViewport === 'mobile'
                  ? 'bg-[#17130F] text-[#D6B574] shadow-xs'
                  : 'text-[#5C5346] hover:text-[#17130F]'
              }`}
            >
              <Smartphone size={14} />
              <span>{tr('شاشة الهاتف', 'Mobile')}</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceViewport('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceViewport === 'desktop'
                  ? 'bg-[#17130F] text-[#D6B574] shadow-xs'
                  : 'text-[#5C5346] hover:text-[#17130F]'
              }`}
            >
              <Monitor size={14} />
              <span>{tr('سطح المكتب', 'Desktop')}</span>
            </button>
          </div>

          {/* View Mode Toggle on Desktop */}
          <div className="hidden lg:flex items-center bg-[#F8F1E5] rounded-xl p-1 border border-[#D6B574]/40">
            <button
              onClick={() => setPreviewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewMode === 'split'
                  ? 'bg-[#17130F] text-[#D6B574]'
                  : 'text-[#5C5346] hover:text-[#17130F]'
              }`}
            >
              {tr('المحرّر والمعاينة', 'Editor & Preview')}
            </button>
            <button
              onClick={() => setPreviewMode('preview_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewMode === 'preview_only'
                  ? 'bg-[#17130F] text-[#D6B574]'
                  : 'text-[#5C5346] hover:text-[#17130F]'
              }`}
            >
              {tr('معاينة كاملة', 'Full Preview')}
            </button>
          </div>

          {/* Copy Direct Shareable Link Button */}
          <button
            type="button"
            onClick={() => {
              const shareUrl = buildShareableInvitationUrl(formData);
              navigator.clipboard.writeText(shareUrl);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 3000);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#F8F1E5] hover:bg-[#D6B574]/25 border border-[#D6B574]/50 text-[#17130F] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {linkCopied ? <Check size={14} className="text-[#123D32]" /> : <LinkIcon size={14} />}
            <span className="hidden sm:inline">
              {linkCopied ? tr('تم نسخ الرابط!', 'Copied!') : tr('نسخ الرابط', 'Copy Link')}
            </span>
          </button>

          <button
            onClick={handlePublish}
            className="px-5 py-2 rounded-xl bg-[#17130F] hover:bg-[#123D32] text-[#D6B574] border border-[#D6B574]/60 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>{tr('حفظ ونشر الدعوة', 'Save & Publish')}</span>
          </button>
        </div>
      </div>

      {(savedSuccess || linkCopied) && (
        <div className="bg-[#123D32] text-[#F8F1E5] border-b border-[#D6B574]/40 py-2.5 px-4 text-center text-xs font-bold">
          {linkCopied
            ? tr(
                '✅ تم نسخ رابط الدعوة المباشر بنجاح! يمكنك مشاركته فوراً عبر واتساب.',
                '✅ Direct invitation link copied!'
              )
            : tr(
                '✨ تم حفظ ونشر الدعوة بنجاح! الرابط التفاعلي جاهز للمشاركة.',
                '✨ Invitation saved and published!'
              )}
        </div>
      )}

      {/* Main Editor Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5">
        {/* Mobile Quick Bar: Step Picker Bottom Sheet Trigger + Edit/Preview Toggle (PART 5) */}
        <div className="lg:hidden mb-4 flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#FFFDF8] border border-[#D6B574]/45 shadow-xs">
          <button
            type="button"
            onClick={() => setShowMobileStepSheet(true)}
            className="flex-1 px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/40 text-right flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-6 h-6 rounded-lg bg-[#17130F] text-[#D6B574] text-xs font-bold flex items-center justify-center shrink-0">
                {currentStepMeta.num}
              </span>
              <span className="text-xs font-bold text-[#17130F] truncate">
                {lang === 'en' ? currentStepMeta.titleEn : currentStepMeta.titleAr}
              </span>
            </div>
            <ChevronDown size={15} className="text-[#A98445] shrink-0" />
          </button>

          <div className="flex items-center bg-[#F8F1E5] p-1 rounded-xl border border-[#D6B574]/35 shrink-0">
            <button
              type="button"
              onClick={() => setMobileViewTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileViewTab === 'edit'
                  ? 'bg-[#17130F] text-[#D6B574]'
                  : 'text-[#5C5346]'
              }`}
            >
              {tr('التعديل', 'Edit')}
            </button>
            <button
              type="button"
              onClick={() => setMobileViewTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileViewTab === 'preview'
                  ? 'bg-[#17130F] text-[#D6B574]'
                  : 'text-[#5C5346]'
              }`}
            >
              {tr('المعاينة', 'Preview')}
            </button>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 ${
            previewMode === 'split' ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'
          } gap-6 lg:gap-8 items-start`}
        >
          {/* LEFT/RIGHT CONTROLS PANEL: 6 Organized Accordion Sections (PART 6) */}
          {previewMode === 'split' && (
            <div
              className={`lg:col-span-5 space-y-3 ${
                mobileViewTab === 'preview' ? 'hidden lg:block' : 'block'
              }`}
            >
              {EDITOR_STEPS.map((step) => {
                const Icon = step.icon;
                const isOpen = activeStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isOpen
                        ? 'bg-[#FFFDF8] border-[#D6B574] shadow-[0_8px_30px_rgba(23,19,15,0.06)]'
                        : 'bg-[#FFFDF8]/80 border-[#D6B574]/30 hover:border-[#D6B574]/60'
                    }`}
                  >
                    {/* Accordion Section Header */}
                    <button
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-right cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isOpen
                              ? 'bg-[#17130F] text-[#D6B574] border border-[#D6B574]'
                              : 'bg-[#F8F1E5] text-[#A98445] border border-[#D6B574]/40'
                          }`}
                        >
                          {step.num}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#17130F] flex items-center gap-1.5">
                            <Icon size={14} className="text-[#A98445] shrink-0" />
                            <span className="truncate">
                              {lang === 'en' ? step.titleEn : step.titleAr}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5C5346] truncate">
                            {step.subtitleAr}
                          </div>
                        </div>
                      </div>
                      <div className="text-[#A98445] shrink-0">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="px-4 pb-5 pt-2 border-t border-[#D6B574]/25 space-y-4">
                        {/* SECTION 1: بيانات المناسبة (EVENT DATA) */}
                        {step.id === 'event_data' && (
                          <div className="space-y-4">
                            {/* Occasion Category Selector */}
                            <div>
                              <label className="block text-xs font-bold text-[#17130F] mb-1.5">
                                {tr('نوع المناسبة (يحدد عناصر الافتتاح ثلاثية الأبعاد)', 'Occasion Type')}
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                  { id: 'engagement' as const, label: 'الخطوبة' },
                                  { id: 'wedding' as const, label: 'الزفاف' },
                                  { id: 'henna' as const, label: 'الحناء' },
                                  { id: 'birthday' as const, label: 'عيد الميلاد' },
                                  { id: 'graduation' as const, label: 'التخرج' },
                                  { id: 'graduation_project' as const, label: 'مناقشة مشروع التخرج' },
                                ].map((occ) => {
                                  const active = formData.category === occ.id;
                                  return (
                                    <button
                                      key={occ.id}
                                      type="button"
                                      onClick={() => {
                                        const allowedModes = getOpeningExperiencesForCategory(occ.id);
                                        const keepCurrent = allowedModes.some(
                                          (m) => m.id === formData.singleInteractionMode
                                        );
                                        setFormData((prev) => ({
                                          ...prev,
                                          category: occ.id,
                                          singleInteractionMode: keepCurrent
                                            ? prev.singleInteractionMode
                                            : allowedModes[0]?.id,
                                        }));
                                      }}
                                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        active
                                          ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                                          : 'bg-[#F8F1E5] text-[#17130F] border-[#D6B574]/40 hover:border-[#D6B574]'
                                      }`}
                                    >
                                      {occ.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-[#17130F] mb-1">
                                {tr('عنوان الدعوة الرئيسي', 'Invitation Main Title')}
                              </label>
                              <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 focus:border-[#A98445] text-sm text-[#17130F] outline-none"
                              />
                            </div>

                            {/* MOVIE TRAILER STUDIO PANEL (تخصيص قالب الإعلان السينمائي التشويقي) */}
                            <div className="p-4 rounded-2xl bg-[#17130F] text-[#F8F1E5] border border-[#D6B574]/60 space-y-3.5 shadow-md">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Video size={15} className="text-[#D6B574]" />
                                  <span className="text-xs font-bold text-[#D6B574]">
                                    نمط الإعلان السينمائي التشويقي • Movie Trailer Style
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentlyMovie = isMovieTrailerInvitation(formData);
                                    if (currentlyMovie) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        templateStyle: 'royal',
                                        movieTitle: '',
                                        movieTitleAnimation: undefined,
                                      }));
                                    } else {
                                      setFormData((prev) => ({
                                        ...prev,
                                        templateStyle: 'movie_trailer',
                                        movieTitle:
                                          prev.movieTitle ||
                                          (prev.groomName && prev.brideName
                                            ? `${prev.groomName} & ${prev.brideName}: العرض الملكي الأول`
                                            : prev.title || 'العرض السينمائي الكبير'),
                                        movieTagline:
                                          prev.movieTagline ||
                                          'في ليلةٍ تُكتب فصولها بالحب والوفاء.. يبدأ العرض الأكبر بحضوركم',
                                        movieTitleAnimation:
                                          prev.movieTitleAnimation || 'epic_zoom_flare',
                                        movieTransitionStyle:
                                          prev.movieTransitionStyle || 'anamorphic_flare_wipe',
                                        musicTrack:
                                          prev.musicTrack === 'romantic_piano'
                                            ? 'epic_trailer_score'
                                            : prev.musicTrack,
                                      }));
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-xl text-[11px] font-bold border cursor-pointer transition-all ${
                                    isMovieTrailerInvitation(formData)
                                      ? 'bg-[#D6B574] text-[#17130F] border-white'
                                      : 'bg-white/10 text-[#F8F1E5] border-[#D6B574]/40 hover:border-[#D6B574]'
                                  }`}
                                >
                                  {isMovieTrailerInvitation(formData)
                                    ? 'نمط Movie Trailer مفعّل ✓'
                                    : 'تفعيل نمط Movie Trailer 🎬'}
                                </button>
                              </div>

                              {isMovieTrailerInvitation(formData) && (
                                <div className="space-y-3 pt-2 border-t border-[#D6B574]/25">
                                  <div>
                                    <label className="block text-[11px] font-bold text-[#D6B574] mb-1">
                                      عنوان الفيلم السينمائي (Movie Title) *
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.movieTitle || ''}
                                      onChange={(e) => updateField('movieTitle', e.target.value)}
                                      placeholder="مثال: أحمد & سارة: العهد الأبدي"
                                      className="w-full px-3 py-2 rounded-xl bg-[#241E18] border border-[#D6B574]/45 text-xs text-[#FFFDF8] outline-none focus:border-[#D6B574]"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                      <label className="block text-[11px] font-bold text-[#D6B574] mb-1">
                                        شعار الإعلان التشويقي (Movie Tagline)
                                      </label>
                                      <input
                                        type="text"
                                        value={formData.movieTagline || ''}
                                        onChange={(e) => updateField('movieTagline', e.target.value)}
                                        placeholder="في ليلةٍ تُكتب فصولها بالحب..."
                                        className="w-full px-3 py-2 rounded-xl bg-[#241E18] border border-[#D6B574]/40 text-xs text-[#FFFDF8] outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-bold text-[#D6B574] mb-1">
                                        إخراج وتقديم (Director / Presenter Credit)
                                      </label>
                                      <input
                                        type="text"
                                        value={formData.movieDirector || ''}
                                        onChange={(e) => updateField('movieDirector', e.target.value)}
                                        placeholder="عائلتا العروسين الكريمتان"
                                        className="w-full px-3 py-2 rounded-xl bg-[#241E18] border border-[#D6B574]/40 text-xs text-[#FFFDF8] outline-none"
                                      />
                                    </div>
                                  </div>

                                  {/* Key Cast Customization (Names of Hosts / Honorees) */}
                                  <div className="p-3 rounded-xl bg-[#241E18] border border-[#D6B574]/35 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-[#D6B574]">
                                        أبطال العمل وطاقم البطولة (Key Cast - Hosts / Honorees)
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentCast = formData.movieKeyCast || [];
                                          updateField('movieKeyCast', [
                                            ...currentCast,
                                            { name: 'نجم جديد', role: 'ضيف شرف / داعي' },
                                          ]);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-[#D6B574] text-[#17130F] text-[10px] font-bold cursor-pointer"
                                      >
                                        + إضافة نجم للبطولة
                                      </button>
                                    </div>

                                    <div className="space-y-2">
                                      {(formData.movieKeyCast || []).map((castMember, cIdx) => (
                                        <div
                                          key={cIdx}
                                          className="grid grid-cols-12 gap-1.5 items-center"
                                        >
                                          <input
                                            type="text"
                                            value={castMember.name}
                                            onChange={(e) => {
                                              const next = [...(formData.movieKeyCast || [])];
                                              next[cIdx] = { ...next[cIdx], name: e.target.value };
                                              updateField('movieKeyCast', next);
                                            }}
                                            placeholder="اسم البطل / صاحب الدعوة"
                                            className="col-span-5 px-2.5 py-1.5 rounded-lg bg-[#17130F] border border-[#D6B574]/35 text-[11px] text-[#FFFDF8] outline-none"
                                          />
                                          <input
                                            type="text"
                                            value={castMember.role}
                                            onChange={(e) => {
                                              const next = [...(formData.movieKeyCast || [])];
                                              next[cIdx] = { ...next[cIdx], role: e.target.value };
                                              updateField('movieKeyCast', next);
                                            }}
                                            placeholder="الدور (مثال: البطولة الأولى)"
                                            className="col-span-6 px-2.5 py-1.5 rounded-lg bg-[#17130F] border border-[#D6B574]/35 text-[11px] text-[#D6B574] outline-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = (formData.movieKeyCast || []).filter(
                                                (_, i) => i !== cIdx
                                              );
                                              updateField('movieKeyCast', next);
                                            }}
                                            className="col-span-1 text-rose-400 hover:text-rose-300 text-xs font-bold text-center cursor-pointer"
                                            title="حذف"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Animated Title Effect & Dramatic Section Transition Selectors */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                      <label className="block text-[11px] font-bold text-[#D6B574] mb-1">
                                        حركة عنوان الفيلم (Animated Title Effect)
                                      </label>
                                      <select
                                        value={formData.movieTitleAnimation || 'epic_zoom_flare'}
                                        onChange={(e) =>
                                          updateField(
                                            'movieTitleAnimation',
                                            e.target.value as MovieTitleAnimationStyle
                                          )
                                        }
                                        className="w-full px-2.5 py-2 rounded-xl bg-[#241E18] border border-[#D6B574]/45 text-xs text-[#FFFDF8] outline-none"
                                      >
                                        {MOVIE_TITLE_ANIMATION_OPTIONS.map((opt) => (
                                          <option key={opt.id} value={opt.id}>
                                            {opt.nameAr}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-bold text-[#D6B574] mb-1">
                                        الانتقال الدرامي بين الفصول (Section Transition)
                                      </label>
                                      <select
                                        value={
                                          formData.movieTransitionStyle || 'anamorphic_flare_wipe'
                                        }
                                        onChange={(e) =>
                                          updateField(
                                            'movieTransitionStyle',
                                            e.target.value as MovieTransitionStyle
                                          )
                                        }
                                        className="w-full px-2.5 py-2 rounded-xl bg-[#241E18] border border-[#D6B574]/45 text-xs text-[#FFFDF8] outline-none"
                                      >
                                        {MOVIE_TRANSITION_STYLE_OPTIONS.map((opt) => (
                                          <option key={opt.id} value={opt.id}>
                                            {opt.nameAr}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {formData.category === 'graduation' ||
                            formData.category === 'graduation_project' ? (
                              <div className="space-y-3 p-3.5 rounded-2xl bg-[#0B1938]/5 border border-[#D6B574]/50">
                                <div className="text-xs font-bold text-[#17130F] flex items-center justify-between">
                                  <span>بيانات الخريج والجامعة</span>
                                  <span className="text-[10px] text-[#A98445]">
                                    تخصيص مجموعة التخرج
                                  </span>
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    اسم الخريج / الباحث *
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.graduateName || ''}
                                    onChange={(e) => updateField('graduateName', e.target.value)}
                                    placeholder="مثال: المهندس علي الكناني"
                                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-sm text-[#17130F] outline-none"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      اسم الجامعة
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.university || ''}
                                      onChange={(e) => updateField('university', e.target.value)}
                                      placeholder="جامعة بغداد"
                                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      الكلية والقسم
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.departmentName || formData.college || ''}
                                      onChange={(e) => {
                                        updateField('college', e.target.value);
                                        updateField('departmentName', e.target.value);
                                      }}
                                      placeholder="كلية الهندسة - قسم العمارة"
                                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      الدرجة العلمية
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.academicDegree || ''}
                                      onChange={(e) => updateField('academicDegree', e.target.value)}
                                      placeholder="بكالوريوس / ماجستير / دكتوراه"
                                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      مرتبة الشرف / الدفعة
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.honorsTitle || ''}
                                      onChange={(e) => updateField('honorsTitle', e.target.value)}
                                      placeholder="مرتبة الشرف الأولى"
                                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Specialization Selector for Project Graduation 3D Secondary Elements */}
                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    التخصص الأكاديمي (يحدد المجسمات الثانوية ثلاثية الأبعاد)
                                  </label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {[
                                      { id: 'medicine', label: 'الطب والمختبرات (DNA ومختبر)' },
                                      { id: 'civil_eng', label: 'الهندسة والعمارة (مجسمات هندسية)' },
                                      { id: 'ai_tech', label: 'الحاسوب والذكاء الاصطناعي' },
                                      { id: 'business', label: 'الإدارة والأعمال والقانون' },
                                    ].map((specItem) => {
                                      const isSelected = (formData.major || 'ai_tech') === specItem.id;
                                      return (
                                        <button
                                          key={specItem.id}
                                          type="button"
                                          onClick={() => updateField('major', specItem.id)}
                                          className={`p-2 rounded-xl border text-right text-[11px] font-bold cursor-pointer ${
                                            isSelected
                                              ? 'bg-[#0B1938] text-[#D6B574] border-[#D6B574]'
                                              : 'bg-[#FFFDF8] text-[#17130F] border-[#D6B574]/40'
                                          }`}
                                        >
                                          {specItem.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {formData.category === 'graduation_project' && (
                                  <div className="space-y-2.5 pt-2 border-t border-[#D6B574]/30">
                                    <div>
                                      <label className="block text-xs font-bold text-[#A98445] mb-1">
                                        عنوان مشروع التخرج أو الأطروحة
                                      </label>
                                      <input
                                        type="text"
                                        value={formData.projectTitle || ''}
                                        onChange={(e) => updateField('projectTitle', e.target.value)}
                                        placeholder="مثال: منظومة ذكاء اصطناعي لتشخيص الصور الطبية"
                                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-[#17130F] mb-1">
                                        الأستاذ المشرف
                                      </label>
                                      <input
                                        type="text"
                                        value={formData.supervisorName || ''}
                                        onChange={(e) =>
                                          updateField('supervisorName', e.target.value)
                                        }
                                        placeholder="أ.د. محمد الهاشمي"
                                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Quick-Select Optional Graduation Quotes */}
                                <div className="pt-2 border-t border-[#D6B574]/30 space-y-1.5">
                                  <span className="block text-[11px] font-bold text-[#A98445]">
                                    عبارات تخرج احتفالية اختيارية (اضغط للاختيار):
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {[
                                      'رحلة تعب.. ونهاية فخر.',
                                      'اليوم نحصد ما زرعناه بالأمس.',
                                      'بفضل الله تحقق الحلم.',
                                      'خطوة جديدة نحو المستقبل.',
                                    ].map((quoteText) => {
                                      const activeQuote = formData.welcomeQuote === quoteText;
                                      return (
                                        <button
                                          key={quoteText}
                                          type="button"
                                          onClick={() => updateField('welcomeQuote', quoteText)}
                                          className={`p-2 rounded-xl border text-right text-[11px] font-bold transition-all cursor-pointer ${
                                            activeQuote
                                              ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                                              : 'bg-[#FFFDF8] text-[#17130F] border-[#D6B574]/40 hover:border-[#D6B574]'
                                          }`}
                                        >
                                          «{quoteText}»
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ) : formData.category === 'birthday' ? (
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    صاحب / صاحبة عيد الميلاد
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.birthdayStarName || ''}
                                    onChange={(e) =>
                                      updateField('birthdayStarName', e.target.value)
                                    }
                                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-sm text-[#17130F] outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    العمر
                                  </label>
                                  <input
                                    type="number"
                                    value={formData.age || ''}
                                    onChange={(e) => updateField('age', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-sm text-[#17130F] outline-none"
                                  />
                                </div>
                              </div>
                            ) : formData.category === 'business_opening' ||
                              formData.category === 'art_exhibition' ||
                              formData.category === 'career_promotion' ||
                              formData.category === 'family_success' ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    اسم الجهة / المشروع / المحتفى به
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.businessName || ''}
                                    onChange={(e) => updateField('businessName', e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-sm text-[#17130F] outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    التفاصيل / نوع النشاط
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.businessType || ''}
                                    onChange={(e) => updateField('businessType', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      اسم العريس
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.groomName || ''}
                                      onChange={(e) => updateField('groomName', e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      لقب أو عائلة العريس
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.groomFamily || ''}
                                      onChange={(e) => updateField('groomFamily', e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      اسم العروس
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.brideName || ''}
                                      onChange={(e) => updateField('brideName', e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      لقب أو عائلة العروس
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.brideFamily || ''}
                                      onChange={(e) => updateField('brideFamily', e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    أصحاب الدعوة (الداعون)
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.hostNames || ''}
                                    onChange={(e) => updateField('hostNames', e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                  />
                                </div>
                              </>
                            )}

                            <div>
                              <label className="block text-xs font-bold text-[#17130F] mb-1">
                                الآية الكريمة أو العبارة الترحيبية
                              </label>
                              <input
                                type="text"
                                value={formData.welcomeQuote}
                                onChange={(e) => updateField('welcomeQuote', e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-[#17130F] mb-1">
                                نص الدعوة الرئيسي
                              </label>
                              <textarea
                                rows={3}
                                value={formData.invitationBody}
                                onChange={(e) => updateField('invitationBody', e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none resize-none leading-relaxed"
                              />
                            </div>

                            {/* Date & Time */}
                            <div className="pt-3 border-t border-[#D6B574]/30 space-y-3">
                              <div className="text-xs font-bold text-[#A98445] flex items-center gap-1.5">
                                <Calendar size={14} />
                                <span>التاريخ والوقت</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    تاريخ المناسبة *
                                  </label>
                                  <input
                                    type="date"
                                    value={formData.eventDate}
                                    onChange={(e) => updateField('eventDate', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] font-mono outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    الوقت *
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.eventTime}
                                    onChange={(e) => updateField('eventTime', e.target.value)}
                                    placeholder="08:00 PM"
                                    className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] font-mono outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Venue & Google Maps */}
                            <div className="pt-3 border-t border-[#D6B574]/30 space-y-3">
                              <div className="text-xs font-bold text-[#A98445] flex items-center gap-1.5">
                                <MapPin size={14} />
                                <span>المكان وخرائط Google</span>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-[#17130F] mb-1">
                                  اسم القاعة أو المكان *
                                </label>
                                <input
                                  type="text"
                                  value={formData.venueName}
                                  onChange={(e) => updateField('venueName', e.target.value)}
                                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    المدينة
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => updateField('city', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-[#17130F] mb-1">
                                    تفاصيل العنوان
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.addressDetails}
                                    onChange={(e) =>
                                      updateField('addressDetails', e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-[#17130F] mb-1">
                                  رابط خرائط Google (Google Maps URL)
                                </label>
                                <input
                                  type="url"
                                  dir="ltr"
                                  value={formData.googleMapsUrl}
                                  onChange={(e) => updateField('googleMapsUrl', e.target.value)}
                                  placeholder="https://maps.google.com/..."
                                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] font-mono outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SECTION 2: التصميم والألوان (DESIGN & COLORS) */}
                        {step.id === 'design_colors' && (
                          <div className="space-y-4">
                            <div className="p-3.5 rounded-2xl bg-[#17130F] text-[#F8F1E5] border border-[#D6B574]/50 space-y-3">
                              <div className="text-xs font-bold text-[#D6B574] flex items-center gap-1.5">
                                <Palette size={14} />
                                <span>لوحة ألوان الهوية الملكية (Royal Luxury Palette)</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                  {
                                    label: 'Ivory & Champagne Gold',
                                    labelAr: 'عاجي ملكي وذهبي شامبين',
                                    primary: '#D6B574',
                                    bg: '#F8F1E5',
                                  },
                                  {
                                    label: 'Royal Black & Champagne',
                                    labelAr: 'أسود ملكي وذهبي شامبين',
                                    primary: '#D6B574',
                                    bg: '#17130F',
                                  },
                                  {
                                    label: 'Emerald Palace & Gold',
                                    labelAr: 'زمردي ملكي وذهبي معتّق',
                                    primary: '#D6B574',
                                    bg: '#123D32',
                                  },
                                  {
                                    label: 'Pearl White & Antique Gold',
                                    labelAr: 'أبيض لؤلؤي وذهبي عتيق',
                                    primary: '#A98445',
                                    bg: '#FFFFFF',
                                  },
                                ].map((preset) => {
                                  const isSelected =
                                    formData.customBgColor === preset.bg &&
                                    formData.customPrimaryColor === preset.primary;
                                  return (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => {
                                        updateField('customPrimaryColor', preset.primary);
                                        updateField('customBgColor', preset.bg);
                                      }}
                                      className={`p-2.5 rounded-xl border text-right flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#D6B574] text-[#17130F] border-[#FFFFFF] font-bold'
                                          : 'bg-[#241E18] text-[#F8F1E5] border-[#D6B574]/30 hover:border-[#D6B574]'
                                      }`}
                                    >
                                      <span className="text-[11px] truncate">{preset.labelAr}</span>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span
                                          className="w-4 h-4 rounded-full border border-white/40"
                                          style={{ backgroundColor: preset.bg }}
                                        />
                                        <span
                                          className="w-4 h-4 rounded-full border border-white/40"
                                          style={{ backgroundColor: preset.primary }}
                                        />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Arabic Typography */}
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-[#17130F]">
                                الخط العربي للدعوة
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: 'amiri' as const, label: 'خط أميري الملكي' },
                                  { id: 'aref' as const, label: 'خط الرقعة الديواني' },
                                  { id: 'cairo' as const, label: 'خط كايرو العصري' },
                                ].map((font) => (
                                  <button
                                    key={font.id}
                                    type="button"
                                    onClick={() => updateField('customFontFamily', font.id)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                      formData.customFontFamily === font.id
                                        ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                                        : 'bg-[#F8F1E5] text-[#17130F] border-[#D6B574]/40'
                                    }`}
                                  >
                                    {font.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Countdown Timer Style */}
                            <div className="pt-3 border-t border-[#D6B574]/30 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#17130F] flex items-center gap-1.5">
                                  <Timer size={14} className="text-[#A98445]" />
                                  <span>تصميم العد التنازلي</span>
                                </span>
                                <div className="flex items-center gap-1 bg-[#F8F1E5] p-1 rounded-lg border border-[#D6B574]/35">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateField('countdownNumeralSystem', 'arabic_indic')
                                    }
                                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                      formData.countdownNumeralSystem === 'arabic_indic'
                                        ? 'bg-[#17130F] text-[#D6B574]'
                                        : 'text-[#5C5346]'
                                    }`}
                                  >
                                    ٢٤ : ٠٨
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateField('countdownNumeralSystem', 'western')
                                    }
                                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                      formData.countdownNumeralSystem !== 'arabic_indic'
                                        ? 'bg-[#17130F] text-[#D6B574]'
                                        : 'text-[#5C5346]'
                                    }`}
                                  >
                                    24 : 08
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                {COUNTDOWN_FONT_OPTIONS.slice(0, 4).map((fontOpt) => {
                                  const isSelected =
                                    (formData.countdownDigitFont || 'amiri_royal') === fontOpt.id;
                                  return (
                                    <button
                                      key={fontOpt.id}
                                      type="button"
                                      onClick={() => updateField('countdownDigitFont', fontOpt.id)}
                                      className={`p-2 rounded-xl border text-right cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                                          : 'bg-[#F8F1E5] text-[#17130F] border-[#D6B574]/40'
                                      }`}
                                    >
                                      <div className="text-xs font-bold">{fontOpt.nameAr}</div>
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                {COUNTDOWN_COLOR_PRESETS.slice(0, 6).map((preset) => {
                                  const isSelected =
                                    (formData.countdownDigitColor || 'template_auto') ===
                                    preset.id;
                                  return (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      onClick={() =>
                                        updateField('countdownDigitColor', preset.id)
                                      }
                                      className={`p-2 rounded-xl border text-right flex items-center gap-1.5 cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                                          : 'bg-[#F8F1E5] text-[#17130F] border-[#D6B574]/40'
                                      }`}
                                    >
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                                        style={{ background: preset.previewBg }}
                                      />
                                      <span className="text-[10px] font-bold truncate">
                                        {preset.nameAr}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="p-2 rounded-2xl bg-[#17130F] border border-[#D6B574]/40">
                                <CountdownTimer
                                  eventDate={formData.eventDate}
                                  eventTime={formData.eventTime}
                                  stylePreset={
                                    (formData.countdownStyle as CountdownStyle) || 'gold_luxury'
                                  }
                                  digitColor={formData.countdownDigitColor}
                                  digitFont={formData.countdownDigitFont}
                                  numeralSystem={formData.countdownNumeralSystem}
                                  templateId={formData.templateId}
                                  title={formData.countdownTitle || 'العد التنازلي للحفل المبارك'}
                                  showSeconds={formData.showSecondsInCountdown !== false}
                                  size="sm"
                                />
                              </div>
                            </div>

                            {/* Section Order */}
                            <div className="pt-3 border-t border-[#D6B574]/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#17130F] flex items-center gap-1.5">
                                  <Layers size={14} className="text-[#A98445]" />
                                  <span>ترتيب أقسام الدعوة</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateField('sectionOrder', DEFAULT_INVITATION_SECTION_ORDER)
                                  }
                                  className="text-[10px] text-[#A98445] font-bold cursor-pointer hover:underline"
                                >
                                  استعادة الافتراضي
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {(formData.sectionOrder && formData.sectionOrder.length > 0
                                  ? formData.sectionOrder
                                  : DEFAULT_INVITATION_SECTION_ORDER
                                ).map((secId: InvitationSectionId, idx: number, arr: InvitationSectionId[]) => {
                                  const meta = INVITATION_SECTION_META[secId];
                                  return (
                                    <div
                                      key={secId}
                                      className="px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/35 flex items-center justify-between gap-2"
                                    >
                                      <span className="text-xs font-bold text-[#17130F] truncate">
                                        {idx + 1}. {meta?.titleAr || secId}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => {
                                            const next = [...arr];
                                            const temp = next[idx - 1];
                                            next[idx - 1] = next[idx];
                                            next[idx] = temp;
                                            updateField('sectionOrder', next);
                                          }}
                                          className="px-2 py-0.5 rounded bg-[#FFFDF8] border border-[#D6B574]/40 text-xs font-bold disabled:opacity-30 cursor-pointer"
                                        >
                                          ↑
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === arr.length - 1}
                                          onClick={() => {
                                            const next = [...arr];
                                            const temp = next[idx + 1];
                                            next[idx + 1] = next[idx];
                                            next[idx] = temp;
                                            updateField('sectionOrder', next);
                                          }}
                                          className="px-2 py-0.5 rounded bg-[#FFFDF8] border border-[#D6B574]/40 text-xs font-bold disabled:opacity-30 cursor-pointer"
                                        >
                                          ↓
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SECTION 3: الصور (PHOTOS) */}
                        {step.id === 'photos' && (
                          <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-[#F8F1E5] border border-[#D6B574]/45 space-y-3">
                              <label className="block text-xs font-bold text-[#17130F] flex items-center gap-1.5">
                                <Upload size={14} className="text-[#A98445]" />
                                <span>صورة العروسين / المناسبة الرئيسية داخل الإطار الملكي</span>
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const objectUrl = URL.createObjectURL(file);
                                  updateField('couplePortraitImage', objectUrl);
                                  updateField('coverImage', objectUrl);
                                }}
                                className="block w-full text-xs text-[#5C5346] file:mr-0 file:ml-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#17130F] file:text-[#D6B574] cursor-pointer"
                              />
                              {(formData.couplePortraitImage || formData.coverImage) && (
                                <div className="flex items-center gap-3 pt-2">
                                  <img
                                    src={formData.couplePortraitImage || formData.coverImage}
                                    alt="Preview"
                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D6B574]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateField('couplePortraitImage', undefined);
                                      updateField('coverImage', undefined);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 border border-rose-500/30 text-xs font-bold cursor-pointer"
                                  >
                                    حذف الصورة
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Gallery Photos */}
                            <div className="p-4 rounded-2xl bg-[#F8F1E5] border border-[#D6B574]/45 space-y-3">
                              <label className="block text-xs font-bold text-[#17130F]">
                                معرض صور المناسبة ({formData.galleryImages?.length || 0} صور)
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  if (files.length === 0) return;
                                  const urls = files.map((f) => URL.createObjectURL(f));
                                  updateField('galleryImages', [
                                    ...(formData.galleryImages || []),
                                    ...urls,
                                  ]);
                                }}
                                className="block w-full text-xs text-[#5C5346] file:mr-0 file:ml-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#17130F] file:text-[#D6B574] cursor-pointer"
                              />
                              {formData.galleryImages && formData.galleryImages.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap pt-1">
                                  {formData.galleryImages.map((img, i) => (
                                    <div
                                      key={i}
                                      className="relative w-16 h-12 rounded-xl overflow-hidden border border-[#D6B574]"
                                    >
                                      <img
                                        src={img}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateField(
                                            'galleryImages',
                                            formData.galleryImages.filter((_, idx) => idx !== i)
                                          )
                                        }
                                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Color Filter */}
                              <div className="pt-2 border-t border-[#D6B574]/30 space-y-2">
                                <span className="text-[11px] font-bold text-[#5C5346] block">
                                  فلتر الألوان للصور:
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                  {COLOR_FILTERS_LIBRARY.slice(0, 4).map((flt) => {
                                    const currentFilter =
                                      formData.galleryColorFilter || 'original';
                                    const isSelected = currentFilter === flt.id;
                                    return (
                                      <button
                                        key={flt.id}
                                        type="button"
                                        onClick={() =>
                                          updateField(
                                            'galleryColorFilter',
                                            flt.id as CinematicColorFilter
                                          )
                                        }
                                        className={`p-2 rounded-xl border text-right text-[11px] font-bold cursor-pointer ${
                                          isSelected
                                            ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                                            : 'bg-[#FFFDF8] text-[#17130F] border-[#D6B574]/35'
                                        }`}
                                      >
                                        {flt.nameAr.split(' (')[0]}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SECTION 4: OPENING EXPERIENCE (CINEMATIC 3D PRODUCTION SCENES) */}
                        {step.id === 'opening_interaction' && (
                          <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-[#17130F] text-[#F8F1E5] border border-[#D6B574]/60 space-y-3 shadow-md">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-[#D6B574] flex items-center gap-1.5">
                                  <Rotate3d size={15} />
                                  <span>Opening Experience • المشهد الافتتاحي السينمائي 3D</span>
                                </span>
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D6B574] text-[#17130F] font-bold">
                                  خامات PBR + GSAP Timeline
                                </span>
                              </div>
                              <p className="text-[11px] text-[#F8F1E5]/85 leading-relaxed">
                                اختر المشهد الافتتاحي السينمائي للدعوة (الظرف الفاخر بختم الشمع، علبة الخاتم المخملية، الأبواب الملكية، أو الشريط الحريري). تُطبع أسماء أصحاب المناسبة والأحرف الأولى والتاريخ واقعياً داخل المشهد ثلاثي الأبعاد دون تغيير بيانات الدعوة:
                              </p>

                              {/* Synchronized Opening Sound Effects Toggle */}
                              <div className="p-3 rounded-xl bg-[#241E18] border border-[#D6B574]/35 flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-xs font-bold text-[#D6B574]">
                                    المؤثرات الصوتية السينمائية المتزامنة
                                  </div>
                                  <div className="text-[10px] text-[#F8F1E5]/75">
                                    صوت كسر ختم الشمع، فتح الظرف، مفصل علبة الخاتم، فتح الأبواب، وانزلاق الشريط (تعمل عند لمس المستخدم فقط)
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateField(
                                      'enableOpeningSfx',
                                      formData.enableOpeningSfx === false ? true : false
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer shrink-0 ${
                                    formData.enableOpeningSfx !== false
                                      ? 'bg-[#D6B574] text-[#17130F] border-white'
                                      : 'bg-transparent text-[#F8F1E5]/70 border-[#D6B574]/40'
                                  }`}
                                >
                                  {formData.enableOpeningSfx !== false ? 'مفعّل ✓' : 'صامت'}
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-2.5 pt-1">
                                {getOpeningExperiencesForCategory(formData.category).map(
                                  (opt, idx) => {
                                    const isSelected = activeSingleInteraction === opt.id;
                                    return (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleSelectSingleInteraction(opt.id)}
                                        className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                          isSelected
                                            ? 'bg-[#D6B574] text-[#17130F] border-[#FFFFFF] shadow-lg'
                                            : 'bg-[#241E18] text-[#F8F1E5] border-[#D6B574]/35 hover:border-[#D6B574]'
                                        }`}
                                      >
                                        <div className="space-y-1 min-w-0">
                                          <div className="text-xs font-bold flex items-center gap-2 flex-wrap">
                                            <span
                                              className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono shrink-0 ${
                                                isSelected
                                                  ? 'bg-[#17130F] text-[#D6B574]'
                                                  : 'bg-[#17130F]/80 text-[#D6B574]'
                                              }`}
                                            >
                                              {idx + 1}
                                            </span>
                                            <span>{opt.titleAr}</span>
                                            {opt.isCinematicFlagship && (
                                              <span
                                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                                  isSelected
                                                    ? 'bg-[#17130F] text-[#D6B574]'
                                                    : 'bg-[#D6B574]/20 text-[#D6B574] border border-[#D6B574]/40'
                                                }`}
                                              >
                                                إنتاج سينمائي واقعي
                                              </span>
                                            )}
                                          </div>
                                          <div
                                            className={`text-[10px] font-mono ${
                                              isSelected ? 'text-[#17130F]/80' : 'text-[#D6B574]'
                                            }`}
                                          >
                                            {opt.objectNameAr} · {opt.titleEn}
                                          </div>
                                          <p
                                            className={`text-[11px] leading-relaxed ${
                                              isSelected
                                                ? 'text-[#17130F]/90'
                                                : 'text-[#F8F1E5]/75'
                                            }`}
                                          >
                                            {opt.descAr}
                                          </p>
                                          <div
                                            className={`text-[10px] font-bold pt-0.5 ${
                                              isSelected ? 'text-[#17130F]' : 'text-[#D6B574]'
                                            }`}
                                          >
                                            ✦ {opt.clickHintAr}
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <span className="px-2 py-0.5 rounded-full bg-[#17130F] text-[#D6B574] text-[10px] font-bold shrink-0">
                                            مفعّل ✓
                                          </span>
                                        )}
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SECTION 5: الموسيقى والمؤثرات (MUSIC & EFFECTS) */}
                        {step.id === 'music_effects' && (
                          <div className="space-y-4">
                            {/* Music Tracks */}
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-[#17130F]">
                                الموسيقى المصاحبة لفتح الدعوة (اختيارية)
                              </label>
                              <div className="space-y-2">
                                {[
                                  {
                                    id: 'epic_trailer_score',
                                    title: '🎬 موسيقى إعلان سينمائي ملحمي (Epic Movie Trailer Score)',
                                    genre: 'نحاسيات وأوركسترا سينمائية ملحمية - IMAX Score',
                                  },
                                  {
                                    id: 'romantic_cinema_orchestra',
                                    title: '🎻 أوركسترا السينما الرومانسية (Romantic Cinema Score)',
                                    genre: 'وتريات سينمائية حالمة وعاطفية',
                                  },
                                  {
                                    id: 'romantic_piano',
                                    title: 'بيانو رومانسي ملكي هادئ',
                                    genre: 'بيانو كلاسيكي',
                                  },
                                  {
                                    id: 'royal_oud',
                                    title: 'عود شرقي ملكي أصيل',
                                    genre: 'تراث راقٍ',
                                  },
                                  {
                                    id: 'cinematic_strings',
                                    title: 'أوركسترا سينمائية فاخرة',
                                    genre: 'سيمفونية ملكية',
                                  },
                                  {
                                    id: 'zen_harp',
                                    title: 'قيثارة ملائكية ناعمة',
                                    genre: 'هارب هادئ',
                                  },
                                  {
                                    id: 'none',
                                    title: 'بدون موسيقى (صامت)',
                                    genre: 'إيقاف الموسيقى',
                                  },
                                ].map((track) => {
                                  const isSelected = formData.musicTrack === track.id;
                                  const isAuditioning = auditioningTrackId === track.id;
                                  return (
                                    <div
                                      key={track.id}
                                      onClick={() => updateField('musicTrack', track.id)}
                                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                        isSelected
                                          ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                                          : 'bg-[#F8F1E5] text-[#17130F] border-[#D6B574]/40'
                                      }`}
                                    >
                                      <div>
                                        <div className="text-xs font-bold">{track.title}</div>
                                        <div
                                          className={`text-[10px] ${
                                            isSelected ? 'text-[#F8F1E5]/75' : 'text-[#5C5346]'
                                          }`}
                                        >
                                          {track.genre}
                                        </div>
                                      </div>
                                      {track.id !== 'none' && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleAudition(track.id);
                                          }}
                                          className={`p-2 rounded-xl border cursor-pointer ${
                                            isAuditioning
                                              ? 'bg-[#D6B574] text-[#17130F] border-[#FFFFFF]'
                                              : 'bg-[#FFFDF8] text-[#17130F] border-[#D6B574]/50'
                                          }`}
                                        >
                                          {isAuditioning ? (
                                            <Pause size={13} />
                                          ) : (
                                            <Play size={13} />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Custom Audio Upload */}
                            <div className="p-3.5 rounded-2xl bg-[#F8F1E5] border border-[#D6B574]/45 space-y-2.5">
                              <label className="block text-xs font-bold text-[#17130F] flex items-center gap-1.5">
                                <FileAudio size={14} className="text-[#A98445]" />
                                <span>رفع ملف موسيقي خاص (MP3 / WAV)</span>
                              </label>
                              <input
                                type="file"
                                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                                onChange={handleCustomAudioUpload}
                                className="block w-full text-xs text-[#5C5346] file:mr-0 file:ml-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#17130F] file:text-[#D6B574] cursor-pointer"
                              />
                              {uploadError && (
                                <p className="text-[11px] text-rose-600 font-bold">{uploadError}</p>
                              )}
                              {formData.customAudioUrl && (
                                <div className="flex items-center justify-between gap-2 pt-1">
                                  <span className="text-xs font-bold text-[#123D32] truncate">
                                    ✓ {formData.customAudioName || 'ملف صوتي مرفوع'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleRemoveCustomAudio}
                                    className="text-xs text-rose-700 font-bold cursor-pointer"
                                  >
                                    إزالة
                                  </button>
                                </div>
                              )}
                              <div className="flex gap-2 pt-1">
                                <input
                                  type="url"
                                  dir="ltr"
                                  value={customUrlInput}
                                  onChange={(e) => setCustomUrlInput(e.target.value)}
                                  placeholder="https://example.com/music.mp3"
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/40 text-xs text-[#17130F] outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleSetCustomUrl}
                                  className="px-3 py-1.5 rounded-xl bg-[#17130F] text-[#D6B574] text-xs font-bold cursor-pointer"
                                >
                                  تطبيق
                                </button>
                              </div>
                            </div>

                            {/* Ambient Visual Effects */}
                            <div className="space-y-2 pt-2 border-t border-[#D6B574]/30">
                              <label className="block text-xs font-bold text-[#17130F]">
                                المؤثرات البصرية الهادئة داخل الدعوة
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {VISUAL_EFFECT_OPTIONS.map((effectOpt) => {
                                  const isSelected =
                                    (formData.visualEffect || 'auto') === effectOpt.id;
                                  return (
                                    <button
                                      key={effectOpt.id}
                                      type="button"
                                      onClick={() => updateField('visualEffect', effectOpt.id)}
                                      className={`p-2.5 rounded-xl border text-right text-xs font-bold cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                                          : 'bg-[#F8F1E5] text-[#17130F] border-[#D6B574]/40'
                                      }`}
                                    >
                                      {effectOpt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Optional In-Invitation Click Symbol & Speed */}
                            <div className="p-3.5 rounded-2xl bg-[#F8F1E5] border border-[#D6B574]/45 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#17130F] flex items-center gap-1.5">
                                  <MousePointerClick size={14} className="text-[#A98445]" />
                                  <span>تفاعل النقر الاختياري داخل الدعوة</span>
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { id: 'none', label: 'بدون تفاعل نقر (موصى به)' },
                                  { id: 'magic_sparkles', label: 'نجوم ذهبية ناعمة ✨' },
                                  { id: 'rose_petals', label: 'بتلات ورد 🌸' },
                                  { id: 'heartbeat', label: 'قلوب رومانسية ❤️' },
                                ].map((opt) => {
                                  const isSelected = (formData.clickEffect || 'none') === opt.id;
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={(e) => {
                                        updateField(
                                          'clickEffect',
                                          opt.id as ClickInteractionEffectType
                                        );
                                        if (opt.id !== 'none') {
                                          dispatchClickEffectPreview(
                                            opt.id as ClickInteractionEffectType,
                                            e.clientX,
                                            e.clientY,
                                            formData.clickEffectSpeed || 'medium'
                                          );
                                        }
                                      }}
                                      className={`p-2 rounded-xl border text-right text-[11px] font-bold cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                                          : 'bg-[#FFFDF8] text-[#17130F] border-[#D6B574]/40'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>

                              {formData.clickEffect && formData.clickEffect !== 'none' && (
                                <div className="space-y-1.5 pt-2 border-t border-[#D6B574]/30">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-[#17130F]">
                                    <span>سرعة ظهور وتلاشي المؤثر:</span>
                                    <span className="text-[#A98445]">
                                      {
                                        (
                                          CLICK_EFFECT_SPEED_OPTIONS.find(
                                            (s) => s.id === (formData.clickEffectSpeed || 'medium')
                                          ) || CLICK_EFFECT_SPEED_OPTIONS[1]
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
                                      (formData.clickEffectSpeed || 'medium') === 'slow'
                                        ? 0
                                        : (formData.clickEffectSpeed || 'medium') === 'fast'
                                        ? 2
                                        : 1
                                    }
                                    onChange={(e) => {
                                      const idx = Number(e.target.value);
                                      const nextSpeed: ClickEffectSpeed =
                                        idx === 0 ? 'slow' : idx === 2 ? 'fast' : 'medium';
                                      updateField('clickEffectSpeed', nextSpeed);
                                    }}
                                    className="w-full accent-[#17130F] cursor-pointer h-2 bg-[#D6B574]/30 rounded-lg"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Optional Short Background Video */}
                            <div className="p-3.5 rounded-2xl bg-[#F8F1E5] border border-[#D6B574]/45 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#17130F] flex items-center gap-1.5">
                                  <Video size={14} className="text-[#A98445]" />
                                  <span>فيديو خلفية قصير (اختياري MP4 / WebM)</span>
                                </span>
                                {formData.backgroundVideoUrl && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveBackgroundVideo}
                                    className="text-[11px] text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                    <span>إزالة</span>
                                  </button>
                                )}
                              </div>
                              <input
                                type="file"
                                accept="video/mp4,video/webm,.mp4,.webm"
                                onChange={handleBackgroundVideoUpload}
                                className="block w-full text-xs text-[#5C5346] file:mr-0 file:ml-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#17130F] file:text-[#D6B574] cursor-pointer"
                              />
                              {videoUploadError && (
                                <p className="text-[11px] text-rose-600 font-bold">
                                  {videoUploadError}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  dir="ltr"
                                  value={customVideoUrlInput}
                                  onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                                  placeholder="https://.../video.mp4"
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/40 text-xs text-[#17130F] outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleSetCustomVideoUrl}
                                  className="px-3 py-1.5 rounded-xl bg-[#17130F] text-[#D6B574] text-xs font-bold cursor-pointer"
                                >
                                  تطبيق
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SECTION 6: المعاينة والنشر (PREVIEW & PUBLISH) */}
                        {step.id === 'preview_publish' && (
                          <div className="space-y-4">
                            {/* Custom Slug Link */}
                            <div className="p-3.5 rounded-2xl bg-[#F8F1E5] border border-[#D6B574]/50 space-y-2">
                              <label className="block text-xs font-bold text-[#17130F] flex items-center gap-1.5">
                                <LinkIcon size={14} className="text-[#A98445]" />
                                <span>الرابط المستقل الخاص بالمعازيم</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex-1 flex items-center rounded-xl bg-[#FFFDF8] border border-[#D6B574]/50 px-3 py-2"
                                  dir="ltr"
                                >
                                  <span className="text-xs text-[#A98445] font-mono select-none">
                                    ?i=
                                  </span>
                                  <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) =>
                                      updateField('slug', sanitizeInvitationSlug(e.target.value))
                                    }
                                    className="w-full bg-transparent text-xs text-[#17130F] font-bold font-mono outline-none px-1"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const shareUrl = buildShareableInvitationUrl(formData);
                                    navigator.clipboard.writeText(shareUrl);
                                    setLinkCopied(true);
                                    setTimeout(() => setLinkCopied(false), 3000);
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-[#17130F] text-[#D6B574] font-bold text-xs cursor-pointer shrink-0"
                                >
                                  {linkCopied ? 'تم النسخ ✓' : 'نسخ الرابط'}
                                </button>
                              </div>
                            </div>

                            {/* RSVP Settings */}
                            <div className="p-3.5 rounded-2xl bg-[#F8F1E5] border border-[#D6B574]/45 space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-bold text-[#17130F]">
                                    تفعيل نموذج تأكيد الحضور (RSVP)
                                  </div>
                                  <div className="text-[11px] text-[#5C5346]">
                                    السماح للضيوف بتسجيل حضورهم وعدد المرافقين
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={formData.rsvpEnabled}
                                  onChange={(e) => updateField('rsvpEnabled', e.target.checked)}
                                  className="w-5 h-5 accent-[#17130F] cursor-pointer"
                                />
                              </div>

                              {formData.rsvpEnabled && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D6B574]/30">
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      الحد الأقصى للمرافقين
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      max={10}
                                      value={formData.maxGuestsPerInvite}
                                      onChange={(e) =>
                                        updateField('maxGuestsPerInvite', Number(e.target.value))
                                      }
                                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-xs text-[#17130F] outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-[#17130F] mb-1">
                                      رقم التواصل (واتساب)
                                    </label>
                                    <input
                                      type="text"
                                      dir="ltr"
                                      value={formData.contactPhone || ''}
                                      onChange={(e) =>
                                        updateField('contactPhone', e.target.value)
                                      }
                                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-xs text-[#17130F] font-mono outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Guestbook & Password */}
                            <div className="p-3.5 rounded-2xl bg-[#F8F1E5] border border-[#D6B574]/45 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#17130F]">
                                  تفعيل سجل التهاني والمباركات
                                </span>
                                <input
                                  type="checkbox"
                                  checked={formData.guestbookEnabled}
                                  onChange={(e) =>
                                    updateField('guestbookEnabled', e.target.checked)
                                  }
                                  className="w-5 h-5 accent-[#17130F] cursor-pointer"
                                />
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-[#D6B574]/30">
                                <span className="text-xs font-bold text-[#17130F]">
                                  حماية الدعوة بكلمة مرور خاصة 🔒
                                </span>
                                <input
                                  type="checkbox"
                                  checked={Boolean(formData.passwordProtected)}
                                  onChange={(e) =>
                                    updateField('passwordProtected', e.target.checked)
                                  }
                                  className="w-5 h-5 accent-[#17130F] cursor-pointer"
                                />
                              </div>

                              {formData.passwordProtected && (
                                <input
                                  type="text"
                                  value={formData.invitationPassword || ''}
                                  onChange={(e) =>
                                    updateField('invitationPassword', e.target.value)
                                  }
                                  placeholder="أدخل كلمة المرور..."
                                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF8] border border-[#D6B574]/45 text-xs text-[#17130F] font-mono outline-none"
                                />
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={handlePublish}
                              className="w-full py-3.5 rounded-2xl bg-[#17130F] hover:bg-[#123D32] text-[#D6B574] border border-[#D6B574] font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Sparkles size={16} />
                              <span>{tr('حفظ ونشر الدعوة الآن', 'Save & Publish Invitation Now')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* LIVE PREVIEW PANEL */}
          <div
            className={`${previewMode === 'split' ? 'lg:col-span-7' : 'w-full'} ${
              mobileViewTab === 'edit' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="sticky top-20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#FFFDF8] border border-[#D6B574]/45 shadow-xs">
                <div className="flex items-center gap-2">
                  <Eye size={15} className="text-[#A98445]" />
                  <span className="text-xs font-bold text-[#17130F]">
                    {tr('المعاينة الحية للدعوة', 'Live Invitation Preview')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D6B574]/25 text-[#17130F] font-bold">
                    {
                      (
                        SINGLE_INTERACTION_MODE_OPTIONS.find(
                          (o) => o.id === activeSingleInteraction
                        ) || SINGLE_INTERACTION_MODE_OPTIONS[0]
                      ).titleAr
                    }
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#F8F1E5] p-1 rounded-xl border border-[#D6B574]/35">
                  <button
                    type="button"
                    onClick={() => setDeviceViewport('mobile')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      deviceViewport === 'mobile'
                        ? 'bg-[#17130F] text-[#D6B574]'
                        : 'text-[#5C5346]'
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>{tr('موبايل', 'Mobile')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceViewport('desktop')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      deviceViewport === 'desktop'
                        ? 'bg-[#17130F] text-[#D6B574]'
                        : 'text-[#5C5346]'
                    }`}
                  >
                    <Monitor size={13} />
                    <span>{tr('كامل', 'Full')}</span>
                  </button>
                </div>
              </div>

              {deviceViewport === 'mobile' ? (
                <div className="flex justify-center py-1">
                  <div className="w-full max-w-[395px] rounded-[42px] border-[8px] border-[#17130F] bg-[#17130F] shadow-[0_20px_60px_rgba(23,19,15,0.35)] overflow-hidden relative">
                    <div className="w-full h-6 bg-[#17130F] flex items-center justify-center pt-1 z-30 relative">
                      <div className="w-20 h-3.5 bg-black rounded-full" />
                    </div>
                    <div className="overflow-y-auto max-h-[720px]">
                      <InteractiveInvitationView
                        invitation={formData}
                        isEmbeddedPreview={true}
                      />
                    </div>
                    <div className="w-full h-5 bg-[#17130F] flex items-center justify-center py-1">
                      <div className="w-28 h-1 bg-[#D6B574]/50 rounded-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <InteractiveInvitationView
                    invitation={formData}
                    isEmbeddedPreview={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PART 5: Mobile Responsive Bottom Sheet for Selecting Editor Steps */}
      {showMobileStepSheet && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full bg-[#FFFDF8] rounded-t-3xl border-t-2 border-[#D6B574] p-5 space-y-3 pb-safe max-h-[82vh] overflow-y-auto shadow-2xl">
            <div className="w-12 h-1.5 bg-[#D6B574]/60 rounded-full mx-auto mb-1" />
            <div className="flex items-center justify-between pb-2 border-b border-[#D6B574]/30">
              <span className="text-sm font-bold text-[#17130F]">
                {tr('أقسام محرر الدعوة (6 خطوات)', 'Editor Sections (6 Steps)')}
              </span>
              <button
                type="button"
                onClick={() => setShowMobileStepSheet(false)}
                className="p-1.5 rounded-full bg-[#F8F1E5] text-[#17130F]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {EDITOR_STEPS.map((s) => {
                const Icon = s.icon;
                const isCurrent = activeStep === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setActiveStep(s.id);
                      setMobileViewTab('edit');
                      setShowMobileStepSheet(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-right flex items-center justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                        : 'bg-[#F8F1E5] text-[#17130F] border-[#D6B574]/35'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-[#D6B574] text-[#17130F]'
                            : 'bg-[#FFFDF8] text-[#A98445]'
                        }`}
                      >
                        {s.num}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <Icon size={13} />
                          <span>{lang === 'en' ? s.titleEn : s.titleAr}</span>
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            isCurrent ? 'text-[#F8F1E5]/80' : 'text-[#5C5346]'
                          }`}
                        >
                          {s.subtitleAr}
                        </div>
                      </div>
                    </div>
                    {isCurrent && <Check size={15} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
