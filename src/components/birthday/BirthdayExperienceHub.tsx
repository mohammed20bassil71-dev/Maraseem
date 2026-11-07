import React, { useState } from 'react';
import {
  Cake,
  Sparkles,
  Wand2,
  Heart,
  Gift,
  Lock,
  Camera,
  Music,
  Palette,
  Type,
  Layers,
  Share2,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Copy,
  Smartphone,
  Monitor,
  Play,
  Pause,
  Calendar,
  Sliders,
  ArrowRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Tablet,
  Box,
  Frame,
  Zap,
} from 'lucide-react';
import {
  BirthdayCategory,
  BirthdayGreetingData,
  BirthdayPageConfig,
  BirthdayPageType,
  BirthdayRelationship,
  BirthdayTemplate,
  CinematicColorFilter,
  CreativeElementAsset,
  DigitalGiftBoxItem,
  ElementAnimationType,
  ElementAssetCategory,
  GreetingOccasionType,
  MemoryBoxItem,
  OpeningMechanicType,
  PhotoFrameStyle,
  PlacedCanvasElement,
  ScratchFoilStyle,
  SecretMessageItem,
} from '../../types/birthdayExperience';
import {
  BIRTHDAY_CATEGORIES_META,
  BIRTHDAY_MUSIC_LIBRARY,
  BIRTHDAY_RELATIONSHIPS_META,
  BIRTHDAY_STICKERS,
  COLOR_FILTERS_LIBRARY,
  CREATIVE_ELEMENTS_LIBRARY,
  GREETING_OCCASIONS_META,
  PHOTO_FRAME_STYLES_META,
  buildShareableBirthdayUrl,
  createArtisticSvgDataUri,
  createBirthdayGreetingFromTemplate,
} from '../../data/birthdayTemplates';
import { BirthdayExperiencePlayer } from './BirthdayExperiencePlayer';
import { CreativeElementGraphic } from './CreativeElementRenderer';
import { soundEngine } from '../../utils/audio';
import { sanitizeInvitationSlug } from '../../utils/shareLink';
import { useLanguage } from '../../i18n/LanguageContext';

interface BirthdayExperienceHubProps {
  templates: BirthdayTemplate[];
  greetings: BirthdayGreetingData[];
  onSaveGreeting: (greeting: BirthdayGreetingData) => void;
  onDeleteGreeting: (id: string) => void;
  onPreviewStandalone: (greeting: BirthdayGreetingData) => void;
}

const AI_SAMPLE_PROMPTS_AR = [
  'أريد تهنئة عيد ميلاد لحبيبتي، رومانسية جداً، تحتوي على كلام عميق، صور وذكريات، رسالة سرية بكلمة مرور، وصندوق هدية وموسيقى هادئة',
  'أريد تهنئة عيد ميلاد لصديقي المقرب بطابع كوميدي ومضحك مع بطاقة اكشط واكتشف لعزيمة عشاء وتحدي لطيف',
  'أريد تهنئة عيد ميلاد لأمي الغالية بتصميم عائلي دافئ وكلمات مؤثرة مع صندوق ذكريات العائلة وموسيقى هادئة',
  'أريد تهنئة عيد ميلاد لزوجي بتصميم ملكي فخم باللون الذهبي مع سحب ستارة المسرح وهدية رقمية',
];

const AI_SAMPLE_PROMPTS_EN = [
  'I want a deeply romantic birthday greeting for my girlfriend with heartfelt words, memory box, password secret message, gift box, and calm music',
  'I want a funny comedy birthday experience for my best friend with a dinner voucher scratch card and playful jokes',
  'I want an emotional warm family birthday greeting for my mother with family memories and gentle piano music',
  'I want a luxury royal gold birthday greeting for my spouse with velvet curtain opening and VIP gift boxes',
];

export const BirthdayExperienceHub: React.FC<BirthdayExperienceHubProps> = ({
  templates,
  greetings,
  onSaveGreeting,
  onDeleteGreeting,
  onPreviewStandalone,
}) => {
  const { lang, tr } = useLanguage();

  // Mode: 'hub' (Template Library & Saved Greetings) | 'studio' (Full Multi-Page Interactive Editor)
  const [mode, setMode] = useState<'hub' | 'studio'>('hub');
  const [editorComplexityMode, setEditorComplexityMode] = useState<'easy' | 'advanced'>('advanced');
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState<
    GreetingOccasionType | 'all'
  >('all');
  const [selectedRelationshipFilter, setSelectedRelationshipFilter] = useState<
    BirthdayRelationship | 'all'
  >('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    BirthdayCategory | 'all'
  >('all');
  const [selectedElementCategory, setSelectedElementCategory] = useState<
    ElementAssetCategory | 'all'
  >('all');
  const [activeCanvasElementId, setActiveCanvasElementId] = useState<string | null>(null);

  // AI Birthday Designer Modal/Section State
  const [showAIDesigner, setShowAIDesigner] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(AI_SAMPLE_PROMPTS_AR[0]);
  const [aiRecipientName, setAiRecipientName] = useState('نور');
  const [aiSenderName, setAiSenderName] = useState('علي');
  const [aiSecretPassword, setAiSecretPassword] = useState('بغداد');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Studio Active Draft State
  const [draft, setDraft] = useState<BirthdayGreetingData>(() =>
    greetings[0] || createBirthdayGreetingFromTemplate(templates[0])
  );
  const [studioTab, setStudioTab] = useState<
    | 'pages_recipient'
    | 'text_editor'
    | 'elements_frames'
    | 'interactions'
    | 'design_music'
    | 'publish_share'
  >('pages_recipient');
  const [previewViewport, setPreviewViewport] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [auditioningMusic, setAuditioningMusic] = useState(false);

  const filteredTemplates = templates.filter((tpl) => {
    if (
      selectedOccasionFilter !== 'all' &&
      (tpl.occasionType || 'birthday') !== selectedOccasionFilter
    ) {
      return false;
    }
    if (
      selectedCategoryFilter !== 'all' &&
      tpl.category !== selectedCategoryFilter
    ) {
      return false;
    }
    if (
      selectedRelationshipFilter !== 'all' &&
      !tpl.supportedRelationships.includes(selectedRelationshipFilter)
    ) {
      return false;
    }
    return true;
  });

  const handleStartWithTemplate = (tpl: BirthdayTemplate) => {
    const rel =
      selectedRelationshipFilter !== 'all'
        ? selectedRelationshipFilter
        : tpl.supportedRelationships[0] || 'lover';
    const fresh = createBirthdayGreetingFromTemplate(tpl, {
      relationship: rel,
      recipientName: draft.recipientName || 'نور',
      senderName: draft.senderName || 'علي',
    });
    setDraft(fresh);
    setMode('studio');
    setStudioTab('pages_recipient');
  };

  const handleEditExistingGreeting = (g: BirthdayGreetingData) => {
    setDraft({ ...g });
    setMode('studio');
    setStudioTab('pages_recipient');
  };

  // Smart AI Birthday Designer Generator
  const handleGenerateWithAI = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiGenerating(true);

    setTimeout(() => {
      const p = aiPrompt.toLowerCase();
      let chosenCategory: BirthdayCategory = 'romantic';
      let chosenRelationship: BirthdayRelationship = 'lover';

      if (p.includes('كوميد') || p.includes('مضحك') || p.includes('funny') || p.includes('joke')) {
        chosenCategory = 'funny';
        chosenRelationship = 'friend';
      } else if (p.includes('أم') || p.includes('أب') || p.includes('عائل') || p.includes('mother') || p.includes('family')) {
        chosenCategory = 'family';
        chosenRelationship = 'parent';
      } else if (p.includes('فخم') || p.includes('ملكي') || p.includes('ذهب') || p.includes('luxury') || p.includes('royal')) {
        chosenCategory = 'luxury';
        chosenRelationship = 'spouse';
      } else if (p.includes('سينما') || p.includes('cinematic')) {
        chosenCategory = 'cinematic';
      } else if (p.includes('صديق') || p.includes('friend')) {
        chosenCategory = 'friendship';
        chosenRelationship = 'friend';
      } else if (p.includes('لطيف') || p.includes('طفل') || p.includes('ابني') || p.includes('cute')) {
        chosenCategory = 'cute';
        chosenRelationship = 'child';
      } else if (p.includes('عاطف') || p.includes('مؤثر') || p.includes('emotional')) {
        chosenCategory = 'emotional';
      }

      const matchedTemplate =
        templates.find((t) => t.category === chosenCategory) || templates[0];

      const recName = aiRecipientName.trim() || 'نور';
      const sndName = aiSenderName.trim() || 'علي';
      const pw = aiSecretPassword.trim() || 'بغداد';

      const generatedDraft = createBirthdayGreetingFromTemplate(matchedTemplate, {
        relationship: chosenRelationship,
        recipientName: recName,
        senderName: sndName,
        mainGreetingTitle:
          lang === 'ar'
            ? `إلى ${recName}.. كل عام وأنتِ أجمل أقداري ✨`
            : `To ${recName}.. Happy Birthday to My Favorite Soul ✨`,
        mainGreetingBody:
          chosenCategory === 'funny'
            ? `كل عام وأنت بخير يا ${recName}! كبرت سنة جديدة بس لا تخاف بعدك شباب بعيوننا 😂🎉 نتمنى لك سنة مليانة ضحك ونجاح وعزائم على حسابك!`
            : chosenCategory === 'family'
            ? `إلى بركة حياتنا ونور بيتنا ${recName}.. كل عام وأنتِ بألف خير وصحة وعافية، ربي يحفظك لنا ويديم ضحكتك الحنونة التي تملأ الدنيا أماناً.`
            : `يوم ميلادك يا ${recName} ليس مجرد يوم عادي، بل هو اليوم الذي أشرقت فيه البهجة في حياتي. جمعت لك في هذه الصفحات ذكرياتنا، وكلمات من أعماق القلب، ومفاجآت صُممت خصيصاً لترسم الابتسامة على وجهك الجميل.`,
        secretMessages: [
          {
            id: `sec-ai-${Date.now()}`,
            title: 'رسالة سرية خاصة بيننا 🔐',
            promptText: 'عندك رسالة سرية، بس لازم تعرف كلمة السر المرتبطة بذكرى بيننا!',
            password: pw,
            hint: `كلمة السر هي (${pw})`,
            revealType: 'full_card',
            secretBody: `لأنك عرفت كلمة السر يا ${recName}.. أردت أن أقول لك إن كل لحظة معك هي عمر جديد من الفرح، وهذه السنة ستكون أجمل سنواتنا معاً بإذن الله ❤️`,
            mediaUrl: matchedTemplate.thumbnailUrl,
          },
        ],
      });

      setDraft(generatedDraft);
      setIsAiGenerating(false);
      setShowAIDesigner(false);
      setMode('studio');
      setStudioTab('pages_recipient');
    }, 550);
  };

  const handleSaveAndPublish = () => {
    onSaveGreeting(draft);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  // Page Reordering & Toggling Helpers
  const handleTogglePage = (pageId: string) => {
    setDraft((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId ? { ...p, enabled: !p.enabled } : p
      ),
    }));
  };

  const handleMovePage = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= draft.pages.length) return;
    const copy = [...draft.pages];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setDraft((prev) => ({ ...prev, pages: copy }));
  };

  const handleAddCustomPage = (type: BirthdayPageType, titleAr: string) => {
    const newPage: BirthdayPageConfig = {
      id: `pg-custom-${Date.now()}`,
      type,
      enabled: true,
      title: titleAr,
      subtitle: 'صفحة مخصصة ضمن قصة يوم الميلاد',
      buttonLabel: 'متابعة القصة ✨',
      badgeText: 'صفحة إضافية',
    };
    setDraft((prev) => ({ ...prev, pages: [...prev.pages, newPage] }));
  };

  const handleDeletePage = (pageId: string) => {
    if (draft.pages.length <= 2) return;
    setDraft((prev) => ({
      ...prev,
      pages: prev.pages.filter((p) => p.id !== pageId),
    }));
  };

  // Add/Remove Secret Messages
  const handleAddSecretMessage = () => {
    const item: SecretMessageItem = {
      id: `sec-${Date.now()}`,
      title: `رسالة سرية #${draft.secretMessages.length + 1} 🔐`,
      promptText: 'عندك رسالة سرية، بس لازم تعرف كلمة السر!',
      password: 'حب',
      hint: 'كلمة من حرفين تجمعنا (حب)',
      revealType: 'full_card',
      secretBody: `رسالة سرية خاصة إلى ${draft.recipientName}: كل عام وأنت أغلى إنسان بحياتي!`,
    };
    setDraft((prev) => ({
      ...prev,
      secretMessages: [...prev.secretMessages, item],
    }));
  };

  // Add/Remove Memory Box Item
  const handleAddMemoryItem = () => {
    const item: MemoryBoxItem = {
      id: `mem-${Date.now()}`,
      type: 'photo',
      mediaUrl: createArtisticSvgDataUri(
        draft.themeColors.background,
        draft.themeColors.cardBg,
        draft.themeColors.primary,
        'polaroid_leaves',
        draft.recipientName || 'Memory Snapshot'
      ),
      teaserQuestion: 'تتذكر هذا اليوم الجميل؟ ✨',
      title: 'ذكرى جديدة مميزة',
      story: 'لحظة جميلة لا تُنسى قضيناها معاً وتستحق أن تبقى في صندوق الذكريات.',
      date: new Date().toISOString().split('T')[0],
    };
    setDraft((prev) => ({
      ...prev,
      memoryBoxItems: [item, ...prev.memoryBoxItems],
    }));
  };

  // Add/Update/Delete 2D & 3D Canvas Elements
  const handleAddCanvasElement = (asset: CreativeElementAsset) => {
    const currentList = draft.canvasElements || [];
    const newEl: PlacedCanvasElement = {
      id: `cel-${Date.now()}`,
      assetId: asset.id,
      svgType: asset.svgType,
      nameAr: asset.nameAr,
      nameEn: asset.nameEn,
      category: asset.category,
      dimension: asset.dimension,
      x: 15 + ((currentList.length * 23) % 70),
      y: 14 + ((currentList.length * 19) % 68),
      size: 64,
      opacity: 0.9,
      color: asset.defaultColor,
      secondaryColor: asset.secondaryColor,
      animationType: asset.dimension === '3d' ? 'float' : 'pulse',
      animationDuration: 3.4,
      animationDelay: Number(((currentList.length * 0.3) % 1.5).toFixed(1)),
      targetPage: 'all',
    };
    setDraft((prev) => ({
      ...prev,
      canvasElements: [...(prev.canvasElements || []), newEl],
    }));
    setActiveCanvasElementId(newEl.id);
  };

  const handleUpdateCanvasElement = (
    elId: string,
    patch: Partial<PlacedCanvasElement>
  ) => {
    setDraft((prev) => ({
      ...prev,
      canvasElements: (prev.canvasElements || []).map((el) =>
        el.id === elId ? { ...el, ...patch } : el
      ),
    }));
  };

  const handleDeleteCanvasElement = (elId: string) => {
    setDraft((prev) => ({
      ...prev,
      canvasElements: (prev.canvasElements || []).filter((el) => el.id !== elId),
    }));
    if (activeCanvasElementId === elId) {
      setActiveCanvasElementId(null);
    }
  };

  // Add/Remove Gift Box
  const handleAddGiftBox = () => {
    const item: DigitalGiftBoxItem = {
      id: `gift-${Date.now()}`,
      label: `صندوق مفاجأة #${draft.giftBoxes.length + 1} 🎁`,
      boxColor: draft.themeColors.primary,
      ribbonColor: draft.themeColors.secondary,
      surpriseType: 'voucher',
      surpriseTitle: 'مفاجأة خاصة ليوم ميلادك 🎉',
      surpriseMessage: `هدية مميزة مخصصة إلى ${draft.recipientName} بمناسبة هذا اليوم السعيد!`,
      voucherCode: 'BDAY-SURPRISE',
    };
    setDraft((prev) => ({
      ...prev,
      giftBoxes: [...prev.giftBoxes, item],
    }));
  };

  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onUrlReady: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUrlReady(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentRelMeta =
    BIRTHDAY_RELATIONSHIPS_META.find((r) => r.id === draft.relationship) ||
    BIRTHDAY_RELATIONSHIPS_META[0];

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#566B49] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ===============================================================
            TOP HEADER BANNER
        =============================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] shadow-[0_8px_30px_rgba(86,107,73,0.06)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DCE8CB] border border-[#B9CCA0] text-[#566B49] text-xs font-bold">
              <Cake size={14} className="text-[#566B49]" />
              <span>
                {tr(
                  'قسم تهنئة عيد الميلاد التفاعلية • تجربة متعددة الصفحات',
                  'Interactive Birthday Experience • Multi-Page Story'
                )}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#566B49]">
              {tr(
                'اصنع قصة تهنئة عيد ميلاد تفاعلية لا تُنسى 🎂🎁',
                'Create an Unforgettable Interactive Birthday Story 🎂🎁'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E8261] leading-relaxed">
              {tr(
                'ليست مجرد بطاقة تقليدية! صمم رحلة متعددة الصفحات تتضمن فتح ظرف أو سحب ستارة، إطفاء شموع الكعكة، رسائل سرية بكلمة مرور، صندوق ذكريات، بطاقة اكشط واكتشف باللمس، وصناديق هدايا ثلاثية الأبعاد برابط خاص.',
                'More than a card! Design a multi-page interactive story featuring envelope/curtain opening, candle-blowing cake, password secret messages, memory box, touch scratch cards, and 3D gift boxes.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowAIDesigner((v) => !v)}
              className="px-5 py-3 rounded-2xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
            >
              <Wand2 size={16} />
              <span>{tr('اصنع تهنئتي بالذكاء الاصطناعي ✨', 'Create with AI Birthday Designer ✨')}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === 'hub' ? 'studio' : 'hub')}
              className="px-5 py-3 rounded-2xl bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              {mode === 'hub' ? (
                <>
                  <Sliders size={15} />
                  <span>{tr('فتح استوديو التخصيص المتقدم', 'Open Interactive Studio')}</span>
                </>
              ) : (
                <>
                  <ArrowRight size={15} />
                  <span>{tr('العودة لمكتبة القوالب والتهاني', 'Back to Template Library')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===============================================================
            AI BIRTHDAY DESIGNER COLLAPSIBLE PANEL
        =============================================================== */}
        {showAIDesigner && (
          <form
            onSubmit={handleGenerateWithAI}
            className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border-2 border-[#B9CCA0] shadow-lg space-y-5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#DCE8CB] flex items-center justify-center text-[#566B49]">
                  <Wand2 size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#566B49]">
                    {tr('المصمم الذكي لتهنئة عيد الميلاد', 'AI Birthday Experience Designer')}
                  </h2>
                  <p className="text-xs text-[#6E8261]">
                    {tr(
                      'اكتب طلبك وسيقوم الذكاء الاصطناعي باقتراح القالب، ترتيب الصفحات، النصوص، الرسالة السرية، والموسيقى كمسودة قابلة للتعديل بالكامل.',
                      'Describe your birthday greeting idea and AI will generate a complete editable multi-page draft.'
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAIDesigner(false)}
                className="text-xs text-[#6E8261] hover:text-[#566B49] font-bold cursor-pointer"
              >
                {tr('إغلاق ✕', 'Close ✕')}
              </button>
            </div>

            {/* Sample Prompts */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#91A77D]">
                {tr('أمثلة سريعة (اضغط للتجربة):', 'Quick Examples (Tap to try):')}
              </span>
              <div className="flex flex-wrap gap-2">
                {(lang === 'ar' ? AI_SAMPLE_PROMPTS_AR : AI_SAMPLE_PROMPTS_EN).map((sp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAiPrompt(sp)}
                    className="px-3 py-1.5 rounded-xl bg-[#F8F6EF] hover:bg-[#DCE8CB] border border-[#E9DDC9] text-[11px] text-[#566B49] text-start cursor-pointer transition-all"
                  >
                    {sp.slice(0, 75)}...
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={tr(
                'مثال: أريد تهنئة عيد ميلاد لحبيبتي، رومانسية جداً، تحتوي على كلام عميق، صور وذكريات، رسالة سرية بكلمة مرور، وصندوق هدية وموسيقى هادئة...',
                'e.g., I want a romantic birthday greeting with deep heartfelt text, memory box, password secret message, gift box, and calm music...'
              )}
              className="w-full px-4 py-3 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs sm:text-sm text-[#566B49] outline-none focus:border-[#566B49]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                  {tr('اسم صاحب عيد الميلاد:', 'Recipient Name:')}
                </label>
                <input
                  type="text"
                  value={aiRecipientName}
                  onChange={(e) => setAiRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                  {tr('اسم المرسل:', 'Sender Name:')}
                </label>
                <input
                  type="text"
                  value={aiSenderName}
                  onChange={(e) => setAiSenderName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                  {tr('كلمة السر للرسالة السرية:', 'Secret Message Password:')}
                </label>
                <input
                  type="text"
                  value={aiSecretPassword}
                  onChange={(e) => setAiSecretPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isAiGenerating}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#566B49] hover:bg-[#6E8261] text-[#FFFDF8] font-bold text-xs cursor-pointer shadow-sm transition-all"
                >
                  {isAiGenerating
                    ? tr('جاري تصميم القصة التفاعلية...', 'Generating Interactive Story...')
                    : tr('توليد المسودة التفاعلية الآن ✨', 'Generate Interactive Draft ✨')}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ===============================================================
            MODE 1: HUB (RELATIONSHIP SELECTOR + 8 CATEGORIES + TEMPLATES + SAVED GREETINGS)
        =============================================================== */}
        {mode === 'hub' && (
          <div className="space-y-10">
            {/* 0. Independent Occasion Library Selector */}
            <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#566B49]">
                    {tr('١. اختر نوع المناسبة (مكتبة قوالب مستقلة لكل مناسبة):', '1. Choose Occasion Type (Independent Template Library):')}
                  </h2>
                  <p className="text-xs text-[#6E8261]">
                    {tr(
                      'لكل مناسبة وقالب هوية بصرية وشخصية معمارية مختلفة فعلياً وليس مجرد اختلاف ألوان',
                      'Each occasion and template features a genuinely distinct visual architecture and personality'
                    )}
                  </p>
                </div>
                {selectedOccasionFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedOccasionFilter('all')}
                    className="text-xs font-bold text-[#91A77D] hover:text-[#566B49] cursor-pointer"
                  >
                    {tr('عرض كل المناسبات', 'All Occasions')}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOccasionFilter('all')}
                  className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedOccasionFilter === 'all'
                      ? 'bg-[#566B49] text-[#FFFDF8] border-[#566B49]'
                      : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49] hover:bg-[#DCE8CB]/50'
                  }`}
                >
                  <span>✨</span>
                  <span>{tr('كل المناسبات', 'All Occasions')}</span>
                </button>
                {GREETING_OCCASIONS_META.map((occ) => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setSelectedOccasionFilter(occ.id)}
                    className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedOccasionFilter === occ.id
                        ? 'bg-[#566B49] text-[#FFFDF8] border-[#566B49]'
                        : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49] hover:bg-[#DCE8CB]/50'
                    }`}
                  >
                    <span>🎉</span>
                    <span>{lang === 'ar' ? occ.nameAr : occ.nameEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Choose Recipient Relationship */}
            <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#566B49]">
                    {tr('٢. اختر صلة القرابة أو الشخص المرسل إليه:', '2. Choose Who You Are Celebrating:')}
                  </h2>
                  <p className="text-xs text-[#6E8261]">
                    {tr(
                      'يتغير أسلوب النصوص والعبارات الجاهزة والقوالب المقترحة تلقائياً حسب علاقتك بصاحب المناسبة',
                      'Suggested templates and ready-made phrases adapt automatically to your relationship'
                    )}
                  </p>
                </div>
                {selectedRelationshipFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedRelationshipFilter('all')}
                    className="text-xs font-bold text-[#91A77D] hover:text-[#566B49] cursor-pointer"
                  >
                    {tr('عرض الكل', 'Show All')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRelationshipFilter('all')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedRelationshipFilter === 'all'
                      ? 'bg-[#B9CCA0] border-[#566B49] text-[#566B49] shadow-xs'
                      : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49] hover:bg-[#DCE8CB]/50'
                  }`}
                >
                  <span className="text-base">🎂</span>
                  <span>{tr('جميع العلاقات', 'All Relationships')}</span>
                </button>
                {BIRTHDAY_RELATIONSHIPS_META.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => setSelectedRelationshipFilter(rel.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      selectedRelationshipFilter === rel.id
                        ? 'bg-[#B9CCA0] border-[#566B49] text-[#566B49] shadow-xs'
                        : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49] hover:bg-[#DCE8CB]/50'
                    }`}
                  >
                    <span className="text-base">{rel.emoji}</span>
                    <span>{lang === 'ar' ? rel.labelAr : rel.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Template Categories Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#566B49]">
                  {tr('٢. تصنيفات القوالب التفاعلية (٨ أنماط مختلفة):', '2. Interactive Template Categories (8 Distinct Styles):')}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-[#566B49] text-[#FFFDF8]'
                        : 'bg-[#FFFDF8] border border-[#E9DDC9] text-[#566B49]'
                    }`}
                  >
                    {tr('كل التصنيفات', 'All Categories')}
                  </button>
                  {BIRTHDAY_CATEGORIES_META.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCategoryFilter === cat.id
                          ? 'bg-[#566B49] text-[#FFFDF8]'
                          : 'bg-[#FFFDF8] border border-[#E9DDC9] text-[#566B49] hover:bg-[#DCE8CB]/50'
                      }`}
                    >
                      {lang === 'ar' ? cat.nameAr : cat.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredTemplates.map((tpl) => {
                  const catMeta = BIRTHDAY_CATEGORIES_META.find((c) => c.id === tpl.category);
                  return (
                    <div
                      key={tpl.id}
                      className="rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="aspect-16/10 relative overflow-hidden bg-[#F8F6EF]">
                          <img
                            src={tpl.thumbnailUrl}
                            alt={lang === 'ar' ? tpl.nameAr : tpl.nameEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FFFDF8]/95 text-[#566B49] text-[10px] font-bold shadow">
                            {lang === 'ar' ? tpl.badgeAr : tpl.badgeEn}
                          </span>
                          <span
                            className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: tpl.themeColors.primary }}
                          >
                            {tpl.tier === 'free'
                              ? tr('مجاني', 'Free')
                              : tpl.tier === 'vip'
                              ? tr('ملكي VIP', 'Royal VIP')
                              : `${tpl.priceIQD.toLocaleString('en-US')} ${tr('د.ع', 'IQD')}`}
                          </span>
                          <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                            <span className="text-sm font-bold">
                              {lang === 'ar' ? tpl.nameAr : tpl.nameEn}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                              {lang === 'ar' ? catMeta?.nameAr : catMeta?.nameEn}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2.5">
                          <p className="text-xs text-[#6E8261] leading-relaxed line-clamp-2">
                            {lang === 'ar' ? tpl.descriptionAr : tpl.descriptionEn}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-[#566B49]">
                              {tr('٩ صفحات تفاعلية', '9 Story Pages')}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-[#566B49]">
                              {tr('رسالة سرية + اكشط', 'Secret + Scratch')}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-[#566B49]">
                              {tr('صندوق هدايا 3D', '3D Gift Box')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartWithTemplate(tpl)}
                          className="flex-1 py-2.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-xs font-bold cursor-pointer transition-all shadow-xs"
                        >
                          {tr('تخصيص هذا القالب ✨', 'Customize Template ✨')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const sample = createBirthdayGreetingFromTemplate(tpl);
                            onPreviewStandalone(sample);
                          }}
                          className="p-2.5 rounded-xl bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] cursor-pointer"
                          title={tr('معاينة حية للقالب', 'Live Preview')}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Published / Saved Birthday Experiences */}
            <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#566B49]">
                    {tr(
                      `٣. التهاني المنشورة والروابط التفاعلية الجاهزة (${greetings.length}):`,
                      `3. Published Birthday Experiences & Active Links (${greetings.length}):`
                    )}
                  </h2>
                  <p className="text-xs text-[#6E8261]">
                    {tr(
                      'يمكنك تعديل أي تهنئة في أي وقت بعد نشرها مع بقاء رابط المشاركة نفسه دون تغيير!',
                      'You can edit any greeting anytime after publishing while keeping the exact same shareable link!'
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {greetings.map((g) => {
                  const shareUrl = buildShareableBirthdayUrl(g);
                  return (
                    <div
                      key={g.id}
                      className="p-5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                            {tr('إلى:', 'To:')} {g.recipientName}
                          </span>
                          <span className="text-[11px] font-mono text-[#91A77D]">
                            👁️ {g.viewsCount} | 🔗 {g.sharesCount}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#566B49]">{g.mainGreetingTitle}</h3>
                        <p className="text-xs text-[#6E8261] line-clamp-2">{g.mainGreetingBody}</p>
                        <div className="text-[11px] font-mono text-[#91A77D] truncate dir-ltr text-left">
                          ?bday={g.slug}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E9DDC9]">
                        <button
                          type="button"
                          onClick={() => onPreviewStandalone(g)}
                          className="px-3 py-1.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Eye size={13} />
                          <span>{tr('فتح التجربة', 'Open Experience')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditExistingGreeting(g)}
                          className="px-3 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#DCE8CB] border border-[#E9DDC9] text-[#566B49] text-xs font-bold cursor-pointer"
                        >
                          {tr('تعديل', 'Edit')}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            setCopiedId(g.id);
                            setTimeout(() => setCopiedId(null), 2500);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#DCE8CB] border border-[#E9DDC9] text-[#566B49] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === g.id ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedId === g.id ? tr('تم النسخ ✓', 'Copied ✓') : tr('نسخ الرابط', 'Copy Link')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteGreeting(g.id)}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-500/10 cursor-pointer ms-auto"
                          title={tr('حذف', 'Delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            MODE 2: INTERACTIVE STUDIO EDITOR + LIVE MULTI-PAGE PREVIEW
        =============================================================== */}
        {mode === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Easy Editor OR Advanced 6-Tab Studio Controls */}
            <div className="lg:col-span-5 space-y-5">
              {/* Easy Editor vs Advanced Editor Switcher */}
              <div className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] flex items-center justify-between gap-2 shadow-xs">
                <span className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                  <Zap size={14} className="text-[#91A77D]" />
                  <span>{tr('نمط المحرر:', 'Editor Mode:')}</span>
                </span>
                <div className="flex items-center gap-1 bg-[#F8F6EF] p-1 rounded-xl border border-[#E9DDC9]">
                  <button
                    type="button"
                    onClick={() => setEditorComplexityMode('easy')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorComplexityMode === 'easy'
                        ? 'bg-[#566B49] text-[#FFFDF8] shadow-xs'
                        : 'text-[#6E8261] hover:text-[#566B49]'
                    }`}
                  >
                    {tr('⚡ المحرر السريع (Easy Editor)', '⚡ Easy Editor')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorComplexityMode('advanced')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorComplexityMode === 'advanced'
                        ? 'bg-[#566B49] text-[#FFFDF8] shadow-xs'
                        : 'text-[#6E8261] hover:text-[#566B49]'
                    }`}
                  >
                    {tr('🎨 المحرر المتقدم (Advanced)', '🎨 Advanced Editor')}
                  </button>
                </div>
              </div>

              {/* Studio Tabs Navigation (shown in Advanced Mode) */}
              {editorComplexityMode === 'advanced' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E9DDC9]">
                  {[
                    { id: 'pages_recipient', label: tr('١. المستلم والصفحات', '1. Pages'), icon: <Layers size={14} /> },
                    { id: 'text_editor', label: tr('٢. النصوص والخطوط', '2. Typography'), icon: <Type size={14} /> },
                    { id: 'elements_frames', label: tr('٣. عناصر 2D/3D والإطارات', '3. 2D/3D & Frames'), icon: <Box size={14} /> },
                    { id: 'interactions', label: tr('٤. المفاجآت والهدايا', '4. Surprises'), icon: <Gift size={14} /> },
                    { id: 'design_music', label: tr('٥. الهوية والموسيقى', '5. Theme & Audio'), icon: <Palette size={14} /> },
                    { id: 'publish_share', label: tr('٦. النشر والرابط', '6. Publish'), icon: <Share2 size={14} /> },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setStudioTab(t.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        studioTab === t.id
                          ? 'bg-[#B9CCA0] text-[#566B49] shadow-xs'
                          : 'bg-[#FFFDF8] text-[#6E8261] hover:text-[#566B49] border border-[#E9DDC9]'
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {savedToast && (
                <div className="p-3 rounded-2xl bg-[#DCE8CB] border border-[#91A77D] text-[#566B49] text-xs font-bold flex items-center justify-between">
                  <span>
                    {tr(
                      '✅ تم حفظ ونشر التهنئة التفاعلية! الرابط جاهز للمشاركة فوراً.',
                      '✅ Interactive Birthday Greeting saved & published!'
                    )}
                  </span>
                </div>
              )}

              {/* Studio Active Tab Body */}
              <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-5 shadow-xs">
                {/* ---------------------------------------------------------
                    EASY EDITOR MODE (Guided 1-Page Express Customization)
                --------------------------------------------------------- */}
                {editorComplexityMode === 'easy' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-[#DCE8CB]/45 border border-[#B9CCA0] text-xs text-[#566B49]">
                      <strong>{tr('المحرر السريع السهل (Easy Editor):', 'Easy Editor Mode:')}</strong>{' '}
                      {tr(
                        'خصّص اسم المستلم، غلاف الفتح، الرسالة، إطار الصور، والموسيقى في خطوة واحدة سريعة.',
                        'Customize recipient, opening cover, message, photo frame, and music in one streamlined view.'
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('اسم المستلم:', 'Recipient Name:')}
                        </label>
                        <input
                          type="text"
                          value={draft.recipientName}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, recipientName: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('اسم المرسل:', 'Sender Name:')}
                        </label>
                        <input
                          type="text"
                          value={draft.senderName}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, senderName: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('غلاف الافتتاح الإبداعي:', 'Opening Cover:')}
                        </label>
                        <select
                          value={draft.openingMechanic}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              openingMechanic: e.target.value as OpeningMechanicType,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          <option value="envelope">{tr('💌 الظرف الشمعي', '💌 Wax Envelope')}</option>
                          <option value="gift_tap">{tr('🎁 صندوق الهدية', '🎁 Gift Box')}</option>
                          <option value="curtain">{tr('🎭 ستارة المسرح', '🎭 Stage Curtain')}</option>
                          <option value="door">{tr('🚪 باب المفاجأة', '🚪 Surprise Door')}</option>
                          <option value="cake_cover">{tr('🎂 غلاف الكعكة المضيئة', '🎂 Birthday Cake Cover')}</option>
                          <option value="heart_tap">{tr('💖 القلب النابض', '💖 Glowing Heart')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('إطار الصور والذكريات:', 'Photo Frame Style:')}
                        </label>
                        <select
                          value={draft.photoFrameStyle || 'polaroid'}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              photoFrameStyle: e.target.value as PhotoFrameStyle,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          {PHOTO_FRAME_STYLES_META.map((frm) => (
                            <option key={frm.id} value={frm.id}>
                              🖼️ {lang === 'ar' ? frm.nameAr : frm.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr(
                            '🎨 فلتر المزاج اللوني لصور المعرض والسينما (Color Filters):',
                            '🎨 Cinematic Gallery Color Filter (Mood Grading):'
                          )}
                        </label>
                        <select
                          value={draft.photoColorFilter || 'original'}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              photoColorFilter: e.target.value as CinematicColorFilter,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          {COLOR_FILTERS_LIBRARY.map((flt) => (
                            <option key={flt.id} value={flt.id}>
                              {flt.badge} — {lang === 'ar' ? flt.nameAr : flt.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#6E8261] mb-1">
                        {tr('عنوان التهنئة الرئيسية:', 'Main Greeting Title:')}
                      </label>
                      <input
                        type="text"
                        value={draft.mainGreetingTitle}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, mainGreetingTitle: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#6E8261] mb-1">
                        {tr('رسالة التهنئة الأساسية:', 'Main Greeting Message:')}
                      </label>
                      <textarea
                        rows={4}
                        value={draft.mainGreetingBody}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, mainGreetingBody: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('كلمة سر الرسالة السرية:', 'Secret Message Password:')}
                        </label>
                        <input
                          type="text"
                          value={draft.secretMessages[0]?.password || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => ({
                              ...prev,
                              secretMessages: prev.secretMessages.map((s, i) =>
                                i === 0 ? { ...s, password: val } : s
                              ),
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('الموسيقى الخلفية:', 'Background Music:')}
                        </label>
                        <select
                          value={draft.musicTrackId}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, musicTrackId: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          {BIRTHDAY_MUSIC_LIBRARY.map((trk) => (
                            <option key={trk.id} value={trk.id}>
                              {lang === 'ar' ? trk.nameAr : trk.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------
                    TAB 1: RECIPIENT, RELATIONSHIP & MULTI-PAGE MANAGER
                --------------------------------------------------------- */}
                {editorComplexityMode === 'advanced' && studioTab === 'pages_recipient' && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-[#566B49]">
                      {tr('بيانات صاحب المناسبة والغلاف الافتتاحي الإبداعي:', 'Recipient Details & Creative Opening Cover:')}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('صلة القرابة / العلاقة:', 'Relationship:')}
                        </label>
                        <select
                          value={draft.relationship}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              relationship: e.target.value as BirthdayRelationship,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          {BIRTHDAY_RELATIONSHIPS_META.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.emoji} {lang === 'ar' ? r.labelAr : r.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('غلاف الافتتاح التفاعلي:', 'Creative Opening Cover:')}
                        </label>
                        <select
                          value={draft.openingMechanic}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              openingMechanic: e.target.value as OpeningMechanicType,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          <option value="envelope">{tr('💌 فتح ظرف رسالة شمعي', '💌 Open Wax Envelope')}</option>
                          <option value="curtain">{tr('🎭 سحب ستارة المسرح', '🎭 Pull Stage Curtains')}</option>
                          <option value="door">{tr('🚪 فتح باب المفاجأة', '🚪 Open Surprise Door')}</option>
                          <option value="gift_tap">{tr('🎁 الضغط على صندوق هدية', '🎁 Tap Shaking Gift Box')}</option>
                          <option value="cake_cover">{tr('🎂 غلاف الكعكة التفاعلية', '🎂 Interactive Cake Cover')}</option>
                          <option value="heart_tap">{tr('💖 الضغط على قلب نابض', '💖 Tap Beating Heart')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('اسم صاحب عيد الميلاد:', 'Recipient Name:')}
                        </label>
                        <input
                          type="text"
                          value={draft.recipientName}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, recipientName: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('اللقب المحبب (اختياري):', 'Affectionate Nickname:')}
                        </label>
                        <input
                          type="text"
                          value={draft.recipientNickname || ''}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, recipientNickname: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('اسم المرسل (أنت):', 'Sender Name (You):')}
                        </label>
                        <input
                          type="text"
                          value={draft.senderName}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, senderName: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('العمر الجديد (اختياري):', 'Age Milestone (Optional):')}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={draft.recipientAge || 24}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              recipientAge: Number(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-mono font-bold text-[#566B49]"
                        />
                      </div>
                    </div>

                    {/* Multi-Page Story Manager (Add, Delete, Reorder, Enable/Disable) */}
                    <div className="pt-4 border-t border-[#E9DDC9] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#566B49]">
                          {tr(
                            `ترتيب وإدارة صفحات القصة التفاعلية (${draft.pages.filter((p) => p.enabled).length} مفعّلة):`,
                            `Story Pages Order & Visibility (${draft.pages.filter((p) => p.enabled).length} active):`
                          )}
                        </h4>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {draft.pages.map((pg, idx) => (
                          <div
                            key={pg.id}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                              pg.enabled
                                ? 'bg-[#F8F6EF] border-[#B9CCA0]'
                                : 'bg-[#F8F6EF]/40 border-[#E9DDC9] opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={pg.enabled}
                                onChange={() => handleTogglePage(pg.id)}
                                className="w-4 h-4 accent-[#566B49] cursor-pointer"
                              />
                              <div className="min-w-0">
                                <input
                                  type="text"
                                  value={pg.title}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setDraft((prev) => ({
                                      ...prev,
                                      pages: prev.pages.map((item) =>
                                        item.id === pg.id ? { ...item, title: val } : item
                                      ),
                                    }));
                                  }}
                                  className="text-xs font-bold text-[#566B49] bg-transparent border-b border-transparent focus:border-[#91A77D] outline-none w-full"
                                />
                                <span className="text-[10px] text-[#91A77D] font-mono">
                                  #{idx + 1} • {pg.type}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMovePage(idx, -1)}
                                disabled={idx === 0}
                                className="p-1 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-[#566B49] disabled:opacity-30 cursor-pointer"
                                title={tr('تحريك لأعلى', 'Move Up')}
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMovePage(idx, 1)}
                                disabled={idx === draft.pages.length - 1}
                                className="p-1 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-[#566B49] disabled:opacity-30 cursor-pointer"
                                title={tr('تحريك لأسفل', 'Move Down')}
                              >
                                <ArrowDown size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePage(pg.id)}
                                className="p-1 rounded-lg text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                                title={tr('حذف الصفحة', 'Delete Page')}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Extra Page Buttons */}
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddCustomPage('main_greeting', 'صفحة رسالة إضافية 💌')}
                          className="px-2.5 py-1.5 rounded-xl bg-[#DCE8CB]/70 hover:bg-[#B9CCA0] text-[#566B49] text-[11px] font-bold cursor-pointer"
                        >
                          {tr('+ إضافة صفحة رسالة', '+ Add Message Page')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCustomPage('secret_message', 'صفحة رسالة سرية 🔐')}
                          className="px-2.5 py-1.5 rounded-xl bg-[#DCE8CB]/70 hover:bg-[#B9CCA0] text-[#566B49] text-[11px] font-bold cursor-pointer"
                        >
                          {tr('+ صفحة سرية', '+ Add Secret Page')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCustomPage('gift_box', 'صفحة هدايا 🎁')}
                          className="px-2.5 py-1.5 rounded-xl bg-[#DCE8CB]/70 hover:bg-[#B9CCA0] text-[#566B49] text-[11px] font-bold cursor-pointer"
                        >
                          {tr('+ صفحة صندوق هدايا', '+ Add Gift Page')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------
                    TAB 2: RICH TEXT & TYPOGRAPHY EDITOR
                --------------------------------------------------------- */}
                {editorComplexityMode === 'advanced' && studioTab === 'text_editor' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#566B49]">
                        {tr('محرر النصوص والرسائل والخطوط:', 'Rich Text, Phrases & Typography Editor:')}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            mainGreetingBody: `${prev.mainGreetingBody} {name}`,
                          }))
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#DCE8CB] text-[#566B49] text-[11px] font-bold cursor-pointer"
                      >
                        {tr('+ إدراج اسم الشخص تلقائياً {name}', '+ Auto-Insert {name}')}
                      </button>
                    </div>

                    {/* Ready-to-Use Phrases for Selected Relationship */}
                    <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-2">
                      <div className="text-[11px] font-bold text-[#566B49]">
                        {tr(
                          `عبارات جاهزة مقترحة لـ (${currentRelMeta.labelAr}) - اضغط لإدراجها وتعديلها:`,
                          `Ready-to-use phrases for (${currentRelMeta.labelEn}) - tap to insert:`
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {(lang === 'ar'
                          ? currentRelMeta.readyPhrasesAr
                          : currentRelMeta.readyPhrasesEn
                        ).map((phrase, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                mainGreetingBody: phrase.replace(
                                  /\{name\}/g,
                                  prev.recipientName
                                ),
                              }))
                            }
                            className="w-full text-start p-2 rounded-xl bg-[#FFFDF8] hover:bg-[#DCE8CB]/50 border border-[#E9DDC9] text-[11px] text-[#566B49] cursor-pointer transition-all"
                          >
                            «{phrase.replace(/\{name\}/g, draft.recipientName)}»
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('عبارة الشاشة الافتتاحية التشويقية:', 'Opening Teaser Headline:')}
                        </label>
                        <input
                          type="text"
                          value={draft.coverTeaserText}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, coverTeaserText: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('عنوان صفحة التهنئة الرئيسية:', 'Main Greeting Title:')}
                        </label>
                        <input
                          type="text"
                          value={draft.mainGreetingTitle}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, mainGreetingTitle: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('نص رسالة التهنئة الرئيسية (عربي / إنجليزي):', 'Main Greeting Message Body:')}
                        </label>
                        <textarea
                          rows={4}
                          value={draft.mainGreetingBody}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, mainGreetingBody: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] leading-relaxed"
                        />
                      </div>

                      {/* Quick Emoji Bar */}
                      <div className="flex flex-wrap gap-1.5">
                        {BIRTHDAY_STICKERS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                mainGreetingBody: `${prev.mainGreetingBody} ${em}`,
                              }))
                            }
                            className="w-8 h-8 rounded-lg bg-[#F8F6EF] hover:bg-[#DCE8CB] border border-[#E9DDC9] flex items-center justify-center text-sm cursor-pointer"
                          >
                            {em}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('الرسالة المخفية عند الضغط على القلب ❤️:', 'Hidden Message When Heart is Tapped ❤️:')}
                        </label>
                        <textarea
                          rows={2}
                          value={draft.hiddenHeartMessage}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, hiddenHeartMessage: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('رسالة زر «اكتشف شكد أنت غالي» 💎:', '“Discover How Precious You Are” Text 💎:')}
                        </label>
                        <input
                          type="text"
                          value={draft.howPreciousScoreText}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              howPreciousScoreText: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('الرسالة الختامية والأمنيات (الغلاف الأخير):', 'Final Wishes Quote (Back Cover):')}
                        </label>
                        <textarea
                          rows={2}
                          value={draft.finalCoverQuote}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, finalCoverQuote: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                        />
                      </div>
                    </div>

                    {/* Font, Size, Color, Alignment & RTL/LTR Direction Controls */}
                    <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E8261] mb-1">
                          {tr('نوع الخط (عربي/لاتيني):', 'Font Family:')}
                        </label>
                        <select
                          value={draft.textStyle.fontFamily}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              textStyle: {
                                ...prev.textStyle,
                                fontFamily: e.target.value as any,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49]"
                        >
                          <option value="cairo">Cairo (عصري احترافي)</option>
                          <option value="tajawal">Tajawal (ناعم وحديث)</option>
                          <option value="amiri">Amiri (خط أميري ملكي)</option>
                          <option value="cormorant">Cormorant Garamond (Serif)</option>
                          <option value="plus_jakarta">Plus Jakarta Sans (Modern)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#6E8261] mb-1">
                          {tr('حجم النص:', 'Font Size:')}
                        </label>
                        <select
                          value={draft.textStyle.fontSize}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              textStyle: {
                                ...prev.textStyle,
                                fontSize: e.target.value as any,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49]"
                        >
                          <option value="sm">{tr('صغير', 'Small')}</option>
                          <option value="md">{tr('متوسط', 'Medium')}</option>
                          <option value="lg">{tr('كبير', 'Large')}</option>
                          <option value="xl">{tr('كبير جداً', 'Extra Large')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#6E8261] mb-1">
                          {tr('اتجاه النص (RTL / LTR):', 'Text Direction:')}
                        </label>
                        <select
                          value={draft.textStyle.direction || 'auto'}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              textStyle: {
                                ...prev.textStyle,
                                direction: e.target.value as 'auto' | 'rtl' | 'ltr',
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          <option value="auto">{tr('تلقائي (Auto)', 'Auto')}</option>
                          <option value="rtl">{tr('يمين إلى يسار (RTL)', 'Right-to-Left (RTL)')}</option>
                          <option value="ltr">{tr('يسار إلى يمين (LTR)', 'Left-to-Right (LTR)')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#6E8261] mb-1">
                          {tr('المحاذاة:', 'Alignment:')}
                        </label>
                        <div className="flex items-center gap-1">
                          {(['right', 'center', 'left'] as const).map((al) => (
                            <button
                              key={al}
                              type="button"
                              onClick={() =>
                                setDraft((prev) => ({
                                  ...prev,
                                  textStyle: { ...prev.textStyle, textAlign: al },
                                }))
                              }
                              className={`flex-1 py-1.5 rounded-lg border flex justify-center cursor-pointer ${
                                draft.textStyle.textAlign === al
                                  ? 'bg-[#B9CCA0] text-[#566B49] border-[#566B49]'
                                  : 'bg-[#FFFDF8] border-[#E9DDC9]'
                              }`}
                            >
                              {al === 'right' ? (
                                <AlignRight size={13} />
                              ) : al === 'center' ? (
                                <AlignCenter size={13} />
                              ) : (
                                <AlignLeft size={13} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#6E8261] mb-1">
                          {tr('لون النص:', 'Text Color:')}
                        </label>
                        <input
                          type="color"
                          value={draft.textStyle.textColor || '#4A1C24'}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              textStyle: { ...prev.textStyle, textColor: e.target.value },
                            }))
                          }
                          className="w-full h-8 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------
                    TAB 3: 2D & 3D ELEMENTS LIBRARY + PHOTO FRAMES + ANIMATION STUDIO
                --------------------------------------------------------- */}
                {editorComplexityMode === 'advanced' && studioTab === 'elements_frames' && (
                  <div className="space-y-5 max-h-[640px] overflow-y-auto pr-1">
                    {/* A. PHOTO FRAME LIBRARY (Polaroid, Scrapbook, Timeline, Cinematic Gallery) */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-3">
                      <h4 className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                        <Frame size={14} className="text-[#91A77D]" />
                        <span>{tr('١. مكتبة إطارات الصور والذكريات:', '1. Photo Frame Styles Library:')}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {PHOTO_FRAME_STYLES_META.map((frm) => {
                          const isSelected = (draft.photoFrameStyle || 'polaroid') === frm.id;
                          return (
                            <button
                              key={frm.id}
                              type="button"
                              onClick={() =>
                                setDraft((prev) => ({ ...prev, photoFrameStyle: frm.id }))
                              }
                              className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#DCE8CB] border-[#566B49] shadow-xs'
                                  : 'bg-[#FFFDF8] border-[#E9DDC9] hover:bg-[#DCE8CB]/40'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold text-[#566B49]">
                                <span>{lang === 'ar' ? frm.nameAr : frm.nameEn}</span>
                                <span>🖼️</span>
                              </div>
                              <p className="text-[10px] text-[#6E8261] mt-1">
                                {lang === 'ar' ? frm.descAr : frm.descEn}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* A2. CINEMATIC COLOR FILTERS LIBRARY (مكتبة الفلاتر اللونية السينمائية) */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                          <Palette size={14} className="text-[#91A77D]" />
                          <span>
                            {tr(
                              '٢. مكتبة الفلاتر اللونية لصور المعرض وقوالب السينما (Color Filters):',
                              '2. Cinematic Color Filters Library (Gallery Mood Grading):'
                            )}
                          </span>
                        </h4>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                          {tr('٨ فلاتر سينمائية احترافية', '8 Cinema LUT Filters')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6E8261]">
                        {tr(
                          'اختر المزاج اللوني والـ LUT السينمائي لتطبيقه فوراً على صور المعرض وصندوق الذكريات:',
                          'Select a cinematic color filter to transform the visual mood of gallery photos:'
                        )}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {COLOR_FILTERS_LIBRARY.map((flt) => {
                          const isSelected = (draft.photoColorFilter || 'original') === flt.id;
                          return (
                            <button
                              key={flt.id}
                              type="button"
                              onClick={() =>
                                setDraft((prev) => ({ ...prev, photoColorFilter: flt.id }))
                              }
                              className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#DCE8CB] border-[#566B49] shadow-xs'
                                  : 'bg-[#FFFDF8] border-[#E9DDC9] hover:bg-[#DCE8CB]/40'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-5 h-5 rounded-full border border-white shadow-xs shrink-0"
                                    style={{ background: flt.swatchGradient }}
                                  />
                                  <span className="text-xs font-bold text-[#566B49]">
                                    {lang === 'ar' ? flt.nameAr : flt.nameEn}
                                  </span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8F6EF] border border-[#E9DDC9] text-[#566B49] font-bold shrink-0">
                                  {flt.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#6E8261] mt-1.5 leading-relaxed">
                                {lang === 'ar' ? flt.descAr : flt.descEn}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* B. 2D & 3D ELEMENTS LIBRARY (Cakes, Hearts, Roses, Gifts, Balloons, Candles) */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                          <Box size={14} className="text-[#91A77D]" />
                          <span>{tr('٢. مكتبة عناصر 2D و 3D التفاعلية (اضغط للإضافة):', '2. 2D & 3D Elements Library (Tap to Add):')}</span>
                        </h4>
                      </div>

                      {/* Category Filter Buttons */}
                      <div className="flex flex-wrap gap-1">
                        {[
                          { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                          { id: 'cakes', labelAr: '🎂 الكعكات', labelEn: '🎂 Cakes' },
                          { id: 'hearts', labelAr: '💖 القلوب', labelEn: '💖 Hearts' },
                          { id: 'roses', labelAr: '🌹 الورود', labelEn: '🌹 Roses' },
                          { id: 'gifts', labelAr: '🎁 الهدايا', labelEn: '🎁 Gifts' },
                          { id: 'balloons', labelAr: '🎈 البالونات', labelEn: '🎈 Balloons' },
                          { id: 'candles', labelAr: '🕯️ الشموع', labelEn: '🕯️ Candles' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedElementCategory(cat.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                              selectedElementCategory === cat.id
                                ? 'bg-[#566B49] text-[#FFFDF8]'
                                : 'bg-[#FFFDF8] border border-[#E9DDC9] text-[#566B49]'
                            }`}
                          >
                            {lang === 'ar' ? cat.labelAr : cat.labelEn}
                          </button>
                        ))}
                      </div>

                      {/* Elements Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {CREATIVE_ELEMENTS_LIBRARY.filter(
                          (el) =>
                            selectedElementCategory === 'all' ||
                            el.category === selectedElementCategory
                        ).map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => handleAddCanvasElement(asset)}
                            className="p-2.5 rounded-xl bg-[#FFFDF8] hover:bg-[#DCE8CB]/50 border border-[#E9DDC9] flex flex-col items-center gap-1.5 cursor-pointer transition-all group"
                          >
                            <div className="h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <CreativeElementGraphic
                                svgType={asset.svgType}
                                dimension={asset.dimension}
                                size={42}
                                color={asset.defaultColor}
                                secondaryColor={asset.secondaryColor}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-[#566B49] text-center line-clamp-1">
                              {lang === 'ar' ? asset.nameAr : asset.nameEn}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F8F6EF] border border-[#E9DDC9] font-mono uppercase text-[#91A77D]">
                              {asset.dimension.toUpperCase()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* C. INDEPENDENT PER-ELEMENT CUSTOMIZATION (Position, Size, Color, Opacity, Animation Timing) */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-3">
                      <h4 className="text-xs font-bold text-[#566B49]">
                        {tr(
                          `٣. تخصيص وتحريك العناصر المضافة (${(draft.canvasElements || []).length}):`,
                          `3. Customize Placed Elements (${(draft.canvasElements || []).length}):`
                        )}
                      </h4>

                      {(draft.canvasElements || []).length === 0 ? (
                        <p className="text-xs text-[#6E8261]">
                          {tr(
                            'لم تقم بإضافة عناصر بعد. اضغط على أي كعكة أو قلب أو وردة أو هدية أعلاه لإضافتها وتخصيص حركتها!',
                            'No elements placed yet. Tap any 2D/3D element above to add and animate it!'
                          )}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {(draft.canvasElements || []).map((cel) => (
                            <div
                              key={cel.id}
                              className="p-3 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CreativeElementGraphic
                                    svgType={cel.svgType}
                                    dimension={cel.dimension}
                                    size={28}
                                    color={cel.color}
                                    secondaryColor={cel.secondaryColor}
                                  />
                                  <div>
                                    <div className="text-xs font-bold text-[#566B49]">
                                      {lang === 'ar' ? cel.nameAr : cel.nameEn}
                                    </div>
                                    <div className="text-[10px] font-mono text-[#91A77D]">
                                      {cel.dimension.toUpperCase()} • X:{cel.x}% Y:{cel.y}%
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCanvasElement(cel.id)}
                                  className="text-rose-600 hover:bg-rose-500/10 p-1 rounded-lg cursor-pointer"
                                  title={tr('حذف العنصر', 'Delete Element')}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Position X, Y, Size, Opacity Sliders */}
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div>
                                  <label className="block font-bold text-[#6E8261]">
                                    {tr(`الموقع الأفقي X (${cel.x}%):`, `Horizontal X (${cel.x}%):`)}
                                  </label>
                                  <input
                                    type="range"
                                    min={5}
                                    max={95}
                                    value={cel.x}
                                    onChange={(e) =>
                                      handleUpdateCanvasElement(cel.id, {
                                        x: Number(e.target.value),
                                      })
                                    }
                                    className="w-full accent-[#566B49]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-[#6E8261]">
                                    {tr(`الموقع العمودي Y (${cel.y}%):`, `Vertical Y (${cel.y}%):`)}
                                  </label>
                                  <input
                                    type="range"
                                    min={6}
                                    max={92}
                                    value={cel.y}
                                    onChange={(e) =>
                                      handleUpdateCanvasElement(cel.id, {
                                        y: Number(e.target.value),
                                      })
                                    }
                                    className="w-full accent-[#566B49]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-[#6E8261]">
                                    {tr(`الحجم (${cel.size}px):`, `Size (${cel.size}px):`)}
                                  </label>
                                  <input
                                    type="range"
                                    min={28}
                                    max={130}
                                    value={cel.size}
                                    onChange={(e) =>
                                      handleUpdateCanvasElement(cel.id, {
                                        size: Number(e.target.value),
                                      })
                                    }
                                    className="w-full accent-[#566B49]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-[#6E8261]">
                                    {tr(
                                      `الشفافية (${Math.round(cel.opacity * 100)}%):`,
                                      `Opacity (${Math.round(cel.opacity * 100)}%):`
                                    )}
                                  </label>
                                  <input
                                    type="range"
                                    min={20}
                                    max={100}
                                    value={Math.round(cel.opacity * 100)}
                                    onChange={(e) =>
                                      handleUpdateCanvasElement(cel.id, {
                                        opacity: Number(e.target.value) / 100,
                                      })
                                    }
                                    className="w-full accent-[#566B49]"
                                  />
                                </div>
                              </div>

                              {/* Color, Animation Effect, Duration & Delay */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                <div>
                                  <label className="block text-[10px] font-bold text-[#6E8261] mb-0.5">
                                    {tr('اللون:', 'Color:')}
                                  </label>
                                  <input
                                    type="color"
                                    value={cel.color}
                                    onChange={(e) =>
                                      handleUpdateCanvasElement(cel.id, { color: e.target.value })
                                    }
                                    className="w-full h-7 rounded cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-[#6E8261] mb-0.5">
                                    {tr('تأثير الحركة:', 'Animation:')}
                                  </label>
                                  <select
                                    value={cel.animationType}
                                    onChange={(e) =>
                                      handleUpdateCanvasElement(cel.id, {
                                        animationType: e.target.value as ElementAnimationType,
                                      })
                                    }
                                    className="w-full px-1.5 py-1 rounded bg-[#F8F6EF] border border-[#E9DDC9] text-[10px] text-[#566B49]"
                                  >
                                    <option value="float">{tr('طفو ناعم', 'Float')}</option>
                                    <option value="pulse">{tr('نبض متوهج', 'Pulse')}</option>
                                    <option value="spin_3d">{tr('دوران 3D', '3D Spin')}</option>
                                    <option value="bounce">{tr('قفز حيوي', 'Bounce')}</option>
                                    <option value="swing">{tr('تأرجح', 'Swing')}</option>
                                    <option value="glow">{tr('توهج ضوئي', 'Glow')}</option>
                                    <option value="none">{tr('ثابت', 'Static')}</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-[#6E8261] mb-0.5">
                                    {tr('المدة (ث):', 'Duration (s):')}
                                  </label>
                                  <input
                                    type="number"
                                    step={0.5}
                                    min={1}
                                    max={12}
                                    value={cel.animationDuration}
                                    onChange={(e) =>
                                      handleUpdateCanvasElement(cel.id, {
                                        animationDuration: Number(e.target.value),
                                      })
                                    }
                                    className="w-full px-2 py-1 rounded bg-[#F8F6EF] border border-[#E9DDC9] text-[10px] font-mono text-[#566B49]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-[#6E8261] mb-0.5">
                                    {tr('التأخير (ث):', 'Delay (s):')}
                                  </label>
                                  <input
                                    type="number"
                                    step={0.2}
                                    min={0}
                                    max={8}
                                    value={cel.animationDelay}
                                    onChange={(e) =>
                                      handleUpdateCanvasElement(cel.id, {
                                        animationDelay: Number(e.target.value),
                                      })
                                    }
                                    className="w-full px-2 py-1 rounded bg-[#F8F6EF] border border-[#E9DDC9] text-[10px] font-mono text-[#566B49]"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------
                    TAB 4: SPECIAL INTERACTIVE MODULES EDITOR
                    (Secret Message, Memory Box, Scratch Card, 3D Gift Box, Cake)
                --------------------------------------------------------- */}
                {editorComplexityMode === 'advanced' && studioTab === 'interactions' && (
                  <div className="space-y-6 max-h-[620px] overflow-y-auto pr-1">
                    {/* A. SECRET MESSAGES WITH PASSWORD */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                          <Lock size={14} className="text-[#91A77D]" />
                          <span>{tr('أ. الرسائل السرية بكلمة مرور (Secret Message)', 'A. Password Secret Messages')}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddSecretMessage}
                          className="px-2.5 py-1 rounded-lg bg-[#B9CCA0] text-[#566B49] text-[11px] font-bold cursor-pointer"
                        >
                          {tr('+ إضافة رسالة سرية', '+ Add Secret')}
                        </button>
                      </div>

                      {draft.secretMessages.map((sec, idx) => (
                        <div
                          key={sec.id}
                          className="p-3 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#566B49]">
                              {tr(`رسالة سرية #${idx + 1}`, `Secret Message #${idx + 1}`)}
                            </span>
                            {draft.secretMessages.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    secretMessages: prev.secretMessages.filter(
                                      (s) => s.id !== sec.id
                                    ),
                                  }))
                                }
                                className="text-rose-600 text-[11px]"
                              >
                                {tr('حذف', 'Remove')}
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={sec.password}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((prev) => ({
                                  ...prev,
                                  secretMessages: prev.secretMessages.map((s) =>
                                    s.id === sec.id ? { ...s, password: val } : s
                                  ),
                                }));
                              }}
                              placeholder={tr('كلمة السر (مثال: بغداد)', 'Password')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                            />
                            <input
                              type="text"
                              value={sec.hint}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((prev) => ({
                                  ...prev,
                                  secretMessages: prev.secretMessages.map((s) =>
                                    s.id === sec.id ? { ...s, hint: val } : s
                                  ),
                                }));
                              }}
                              placeholder={tr('تلميح كلمة السر...', 'Password Hint...')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={sec.secretBody}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft((prev) => ({
                                ...prev,
                                secretMessages: prev.secretMessages.map((s) =>
                                  s.id === sec.id ? { ...s, secretBody: val } : s
                                ),
                              }));
                            }}
                            placeholder={tr('نص الرسالة السرية التي تظهر بعد إدخال كلمة المرور...', 'Secret message revealed after password...')}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                          />
                        </div>
                      ))}
                    </div>

                    {/* B. MEMORY BOX */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                          <Camera size={14} className="text-[#91A77D]" />
                          <span>
                            {tr(
                              `ب. صندوق الذكريات (${draft.memoryBoxItems.length} ذكريات)`,
                              `B. Memory Box (${draft.memoryBoxItems.length} items)`
                            )}
                          </span>
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddMemoryItem}
                          className="px-2.5 py-1 rounded-lg bg-[#B9CCA0] text-[#566B49] text-[11px] font-bold cursor-pointer"
                        >
                          {tr('+ إضافة ذكرى', '+ Add Memory')}
                        </button>
                      </div>

                      {draft.memoryBoxItems.map((mem, idx) => (
                        <div
                          key={mem.id}
                          className="p-3 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold">
                              {tr(`ذكرى #${idx + 1}`, `Memory #${idx + 1}`)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((prev) => ({
                                  ...prev,
                                  memoryBoxItems: prev.memoryBoxItems.filter(
                                    (m) => m.id !== mem.id
                                  ),
                                }))
                              }
                              className="text-rose-600 text-[11px]"
                            >
                              {tr('حذف', 'Remove')}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={mem.teaserQuestion}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft((prev) => ({
                                ...prev,
                                memoryBoxItems: prev.memoryBoxItems.map((m) =>
                                  m.id === mem.id ? { ...m, teaserQuestion: val } : m
                                ),
                              }));
                            }}
                            placeholder={tr('سؤال قبل الكشف (مثال: تتذكر هذا اليوم؟)', 'Pre-reveal question (e.g., Remember this day?)')}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={mem.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((prev) => ({
                                  ...prev,
                                  memoryBoxItems: prev.memoryBoxItems.map((m) =>
                                    m.id === mem.id ? { ...m, title: val } : m
                                  ),
                                }));
                              }}
                              placeholder={tr('عنوان الذكرى', 'Memory Title')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                            />
                            <input
                              type="date"
                              value={mem.date}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((prev) => ({
                                  ...prev,
                                  memoryBoxItems: prev.memoryBoxItems.map((m) =>
                                    m.id === mem.id ? { ...m, date: val } : m
                                  ),
                                }));
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-mono text-[#566B49]"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={mem.story}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft((prev) => ({
                                ...prev,
                                memoryBoxItems: prev.memoryBoxItems.map((m) =>
                                  m.id === mem.id ? { ...m, story: val } : m
                                ),
                              }));
                            }}
                            placeholder={tr('قصة هذه الصورة أو الذكرى...', 'Story behind this memory...')}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageFileUpload(e, (url) => {
                                  setDraft((prev) => ({
                                    ...prev,
                                    memoryBoxItems: prev.memoryBoxItems.map((m) =>
                                      m.id === mem.id ? { ...m, mediaUrl: url } : m
                                    ),
                                  }));
                                })
                              }
                              className="text-[10px] file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-[#DCE8CB] file:text-[#566B49] file:font-bold"
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-[#6E8261]">
                                {tr('فلتر الصورة:', 'Photo Filter:')}
                              </span>
                              <select
                                value={mem.colorFilter || ''}
                                onChange={(e) => {
                                  const val = e.target.value as CinematicColorFilter | '';
                                  setDraft((prev) => ({
                                    ...prev,
                                    memoryBoxItems: prev.memoryBoxItems.map((m) =>
                                      m.id === mem.id
                                        ? {
                                            ...m,
                                            colorFilter: val ? (val as CinematicColorFilter) : undefined,
                                          }
                                        : m
                                    ),
                                  }));
                                }}
                                className="px-2 py-1 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-[10px] font-bold text-[#566B49]"
                              >
                                <option value="">
                                  {tr('افتراضي المعرض', 'Gallery Default')}
                                </option>
                                {COLOR_FILTERS_LIBRARY.map((flt) => (
                                  <option key={flt.id} value={flt.id}>
                                    {flt.badge} {lang === 'ar' ? flt.nameAr.split(' (')[0] : flt.nameEn}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* C. SCRATCH & REVEAL CARD */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-3">
                      <h4 className="text-xs font-bold text-[#566B49]">
                        {tr('ج. بطاقة اكشط واكتشف (Scratch & Reveal):', 'C. Scratch & Reveal Card:')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-[#6E8261] mb-1">
                            {tr('لون طبقة الكشط:', 'Scratch Foil Layer:')}
                          </label>
                          <select
                            value={draft.scratchCard.foilStyle}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                scratchCard: {
                                  ...prev.scratchCard,
                                  foilStyle: e.target.value as ScratchFoilStyle,
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49]"
                          >
                            <option value="gold_foil">{tr('ذهبي ملكي لامع', 'Royal Gold Foil')}</option>
                            <option value="rose_shimmer">{tr('وردي رومانسي', 'Rose Shimmer')}</option>
                            <option value="silver_stars">{tr('فضي النجوم', 'Silver Stars')}</option>
                            <option value="pistachio_velvet">{tr('فستقي مخملي', 'Pistachio Velvet')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-[#6E8261] mb-1">
                            {tr('عنوان المفاجأة تحت الكشط:', 'Hidden Title:')}
                          </label>
                          <input
                            type="text"
                            value={draft.scratchCard.hiddenTitle}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                scratchCard: {
                                  ...prev.scratchCard,
                                  hiddenTitle: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                          />
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={draft.scratchCard.hiddenMessage}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            scratchCard: {
                              ...prev.scratchCard,
                              hiddenMessage: e.target.value,
                            },
                          }))
                        }
                        placeholder={tr('الرسالة أو الهدية التي تظهر بعد كشط البطاقة...', 'Hidden message revealed after scratching...')}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49]"
                      />

                      <input
                        type="text"
                        value={draft.scratchCard.voucherCodeOrPlace || ''}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            scratchCard: {
                              ...prev.scratchCard,
                              voucherCodeOrPlace: e.target.value,
                            },
                          }))
                        }
                        placeholder={tr('كود القسيمة أو اسم المكان (اختياري)...', 'Voucher code or restaurant/place name...')}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs font-mono text-[#566B49]"
                      />
                    </div>

                    {/* D. DIGITAL GIFT BOXES */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                          <Gift size={14} className="text-[#91A77D]" />
                          <span>
                            {tr(
                              `د. صناديق الهدايا الرقمية (${draft.giftBoxes.length})`,
                              `D. 3D Digital Gift Boxes (${draft.giftBoxes.length})`
                            )}
                          </span>
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddGiftBox}
                          className="px-2.5 py-1 rounded-lg bg-[#B9CCA0] text-[#566B49] text-[11px] font-bold cursor-pointer"
                        >
                          {tr('+ إضافة صندوق هدية', '+ Add Gift Box')}
                        </button>
                      </div>

                      {draft.giftBoxes.map((box, idx) => (
                        <div
                          key={box.id}
                          className="p-3 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={box.label}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((prev) => ({
                                  ...prev,
                                  giftBoxes: prev.giftBoxes.map((b) =>
                                    b.id === box.id ? { ...b, label: val } : b
                                  ),
                                }));
                              }}
                              className="text-xs font-bold text-[#566B49] bg-transparent border-b border-[#E9DDC9] outline-none"
                            />
                            {draft.giftBoxes.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    giftBoxes: prev.giftBoxes.filter((b) => b.id !== box.id),
                                  }))
                                }
                                className="text-rose-600 text-[11px]"
                              >
                                {tr('حذف', 'Remove')}
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            value={box.surpriseTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft((prev) => ({
                                ...prev,
                                giftBoxes: prev.giftBoxes.map((b) =>
                                  b.id === box.id ? { ...b, surpriseTitle: val } : b
                                ),
                              }));
                            }}
                            placeholder={tr('عنوان المفاجأة داخل الصندوق', 'Surprise Title')}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                          />

                          <textarea
                            rows={2}
                            value={box.surpriseMessage}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft((prev) => ({
                                ...prev,
                                giftBoxes: prev.giftBoxes.map((b) =>
                                  b.id === box.id ? { ...b, surpriseMessage: val } : b
                                ),
                              }));
                            }}
                            placeholder={tr('وصف الهدية أو الأمنية أو التحدي...', 'Gift message or challenge...')}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                          />
                        </div>
                      ))}
                    </div>

                    {/* E. CAKE CANDLES COUNT */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#566B49]">
                        {tr('عدد الشموع التفاعلية على الكعكة:', 'Interactive Candles on Cake:')}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={draft.candlesCount}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            candlesCount: Math.max(1, Math.min(12, Number(e.target.value))),
                          }))
                        }
                        className="w-20 px-3 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] text-xs font-mono font-bold text-[#566B49] text-center"
                      />
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------
                    TAB 4: DESIGN, COLORS, MOTION & LICENSED MUSIC
                --------------------------------------------------------- */}
                {editorComplexityMode === 'advanced' && studioTab === 'design_music' && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-[#566B49]">
                      {tr('تخصيص الألوان والحركات والموسيقى المرخصة:', 'Colors, Motion & Licensed Music Library:')}
                    </h3>

                    {/* Color Pickers */}
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9]">
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E8261] mb-1">
                          {tr('لون الخلفية:', 'Background:')}
                        </label>
                        <input
                          type="color"
                          value={draft.themeColors.background}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              themeColors: { ...prev.themeColors, background: e.target.value },
                            }))
                          }
                          className="w-full h-9 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E8261] mb-1">
                          {tr('اللون الرئيسي:', 'Primary Accent:')}
                        </label>
                        <input
                          type="color"
                          value={draft.themeColors.primary}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              themeColors: { ...prev.themeColors, primary: e.target.value },
                            }))
                          }
                          className="w-full h-9 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E8261] mb-1">
                          {tr('لون البطاقة:', 'Card Surface:')}
                        </label>
                        <input
                          type="color"
                          value={draft.themeColors.cardBg}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              themeColors: { ...prev.themeColors, cardBg: e.target.value },
                            }))
                          }
                          className="w-full h-9 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Transition & Particle Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('حركة انتقال الصفحات:', 'Page Transition:')}
                        </label>
                        <select
                          value={draft.transitionStyle}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              transitionStyle: e.target.value as any,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          <option value="flip_3d">{tr('تقليب ثلاثي الأبعاد 3D', '3D Card Flip')}</option>
                          <option value="slide">{tr('انزلاق ناعم', 'Smooth Slide')}</option>
                          <option value="fade_scale">{tr('تلاشي وتكبير سينمائي', 'Cinematic Fade & Scale')}</option>
                          <option value="curtain_reveal">{tr('كشف مسرحي', 'Stage Reveal')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('سرعة الحركات:', 'Animation Speed:')}
                        </label>
                        <select
                          value={draft.animationSpeed}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              animationSpeed: e.target.value as any,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          <option value="slow">{tr('هادئة وبطيئة', 'Slow & Dreamy')}</option>
                          <option value="normal">{tr('متوازنة (افتراضي)', 'Balanced')}</option>
                          <option value="fast">{tr('سريعة وحيوية', 'Fast & Snappy')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('المؤثرات الطائرة:', 'Floating Particles:')}
                        </label>
                        <select
                          value={draft.particleEffect}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              particleEffect: e.target.value as any,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49]"
                        >
                          <option value="hearts">{tr('❤️ قلوب رومانسية', '❤️ Romantic Hearts')}</option>
                          <option value="confetti">{tr('🎉 كونفيتي احتفالي', '🎉 Party Confetti')}</option>
                          <option value="balloons">{tr('🎈 بالونات ملونة', '🎈 Floating Balloons')}</option>
                          <option value="stars">{tr('🌟 نجوم متلألئة', '🌟 Sparkling Stars')}</option>
                          <option value="funny_emojis">{tr('😂 إيموجي مرحة', '😂 Funny Emojis')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Licensed Music Library */}
                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                          <Music size={14} className="text-[#91A77D]" />
                          <span>{tr('مكتبة الموسيقى المرخصة والمؤثرات الصوتية:', 'Licensed Music & Sound FX:')}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (auditioningMusic) {
                              soundEngine.stopAmbientMusic();
                              setAuditioningMusic(false);
                            } else {
                              const trk = BIRTHDAY_MUSIC_LIBRARY.find(
                                (m) => m.id === draft.musicTrackId
                              );
                              soundEngine.startAmbientMusic(
                                draft.customAudioUrl
                                  ? 'custom_upload'
                                  : trk?.synthGenre || 'bday_romantic',
                                draft.customAudioUrl
                              );
                              setAuditioningMusic(true);
                            }
                          }}
                          className="px-3 py-1 rounded-xl bg-[#B9CCA0] text-[#566B49] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {auditioningMusic ? <Pause size={12} /> : <Play size={12} />}
                          <span>{auditioningMusic ? tr('إيقاف الاستماع', 'Stop') : tr('تجربة الموسيقى', 'Audition')}</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {BIRTHDAY_MUSIC_LIBRARY.map((trk) => (
                          <button
                            key={trk.id}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                musicTrackId: trk.id,
                                customAudioUrl: undefined,
                              }))
                            }
                            className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                              draft.musicTrackId === trk.id && !draft.customAudioUrl
                                ? 'bg-[#DCE8CB] border-[#566B49] font-bold text-[#566B49]'
                                : 'bg-[#FFFDF8] border-[#E9DDC9] text-[#566B49]'
                            }`}
                          >
                            <span>{lang === 'ar' ? trk.nameAr : trk.nameEn}</span>
                            <span className="text-[10px] font-mono text-[#91A77D]">
                              {trk.durationLabel}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Audio Upload */}
                      <div className="pt-2 border-t border-[#E9DDC9]">
                        <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                          {tr('أو ارفع ملف صوتي / أغنية خاصة (MP3):', 'Or Upload Custom Song / Audio (MP3):')}
                        </label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setDraft((prev) => ({
                                  ...prev,
                                  customAudioUrl: reader.result as string,
                                  customAudioName: file.name,
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="w-full text-xs file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#B9CCA0] file:text-[#566B49] file:font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------
                    TAB 5: PUBLISHING, UNIQUE LINK & SCHEDULING
                --------------------------------------------------------- */}
                {editorComplexityMode === 'advanced' && studioTab === 'publish_share' && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-[#566B49]">
                      {tr('النشر، الرابط المستقل، وجدولة التهنئة:', 'Publish, Unique Link & Scheduling:')}
                    </h3>

                    <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DCE8CB] space-y-3">
                      <label className="block text-xs font-bold text-[#566B49]">
                        {tr(
                          'اسم الرابط الخاص بالتهنئة (يفتح للمستلم مباشرة بدون تسجيل دخول):',
                          'Unique Greeting Link Slug (Opens directly without login):'
                        )}
                      </label>
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 flex items-center rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] px-3 py-2"
                          dir="ltr"
                        >
                          <span className="text-xs font-mono text-[#91A77D]">?bday=</span>
                          <input
                            type="text"
                            value={draft.slug}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                slug: sanitizeInvitationSlug(e.target.value),
                              }))
                            }
                            className="w-full bg-transparent text-xs font-mono font-bold text-[#566B49] outline-none px-1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const url = buildShareableBirthdayUrl(draft);
                            navigator.clipboard.writeText(url);
                            setCopiedId('studio-slug');
                            setTimeout(() => setCopiedId(null), 2500);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-xs font-bold cursor-pointer transition-all"
                        >
                          {copiedId === 'studio-slug' ? tr('تم النسخ ✓', 'Copied ✓') : tr('نسخ الرابط', 'Copy Link')}
                        </button>
                      </div>
                    </div>

                    {/* Schedule Availability & Expiry Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('تاريخ ووقت إتاحة التهنئة (اختياري):', 'Available From Date/Time (Optional):')}
                        </label>
                        <input
                          type="datetime-local"
                          value={draft.availableFrom || ''}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, availableFrom: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-mono text-[#566B49]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6E8261] mb-1">
                          {tr('تاريخ انتهاء صلاحية الرابط (اختياري):', 'Link Expiration Date (Optional):')}
                        </label>
                        <input
                          type="date"
                          value={draft.expiresAt || ''}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, expiresAt: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-mono text-[#566B49]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 space-y-2.5">
                      <button
                        type="button"
                        onClick={handleSaveAndPublish}
                        className="w-full py-3.5 rounded-2xl bg-[#566B49] hover:bg-[#6E8261] text-[#FFFDF8] font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles size={16} />
                        <span>{tr('حفظ ونشر التهنئة التفاعلية الآن 🎉', 'Save & Publish Interactive Birthday Greeting 🎉')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSaveGreeting(draft);
                          onPreviewStandalone(draft);
                        }}
                        className="w-full py-3 rounded-2xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={15} />
                        <span>{tr('معاينة التهنئة بملء الشاشة كما يراها المستلم', 'Preview Full-Screen as Recipient')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Studio Save Action */}
                <div className="pt-4 border-t border-[#E9DDC9] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSaveAndPublish}
                    className="flex-1 py-2.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer transition-all"
                  >
                    {tr('حفظ التعديلات ونشر الرابط ✓', 'Save Changes & Update Link ✓')}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW (Mobile, Tablet, Desktop) */}
            <div className="lg:col-span-7 space-y-3 lg:sticky lg:top-24">
              <div className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] flex items-center justify-between flex-wrap gap-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#566B49]">
                  <Eye size={15} className="text-[#91A77D]" />
                  <span>{tr('معاينة تفاعلية متجاوبة مباشرة:', 'Live Responsive Preview:')}</span>
                </div>

                <div className="flex items-center gap-1 bg-[#F8F6EF] p-1 rounded-xl border border-[#E9DDC9]">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      previewViewport === 'mobile'
                        ? 'bg-[#B9CCA0] text-[#566B49]'
                        : 'text-[#6E8261]'
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>{tr('موبايل', 'Mobile')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('tablet')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      previewViewport === 'tablet'
                        ? 'bg-[#B9CCA0] text-[#566B49]'
                        : 'text-[#6E8261]'
                    }`}
                  >
                    <Tablet size={13} />
                    <span>{tr('تابلت', 'Tablet')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      previewViewport === 'desktop'
                        ? 'bg-[#B9CCA0] text-[#566B49]'
                        : 'text-[#6E8261]'
                    }`}
                  >
                    <Monitor size={13} />
                    <span>{tr('كمبيوتر', 'Desktop')}</span>
                  </button>
                </div>
              </div>

              {previewViewport === 'mobile' ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-[415px] rounded-[42px] border-[8px] border-[#566B49]/90 bg-[#1A1A1A] shadow-2xl overflow-hidden">
                    <div className="max-h-[740px] overflow-y-auto">
                      <BirthdayExperiencePlayer greeting={draft} isEmbeddedPreview={true} />
                    </div>
                  </div>
                </div>
              ) : previewViewport === 'tablet' ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-[640px] rounded-[34px] border-[6px] border-[#566B49]/85 bg-[#1A1A1A] shadow-2xl overflow-hidden">
                    <div className="max-h-[760px] overflow-y-auto">
                      <BirthdayExperiencePlayer greeting={draft} isEmbeddedPreview={true} />
                    </div>
                  </div>
                </div>
              ) : (
                <BirthdayExperiencePlayer greeting={draft} isEmbeddedPreview={true} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
