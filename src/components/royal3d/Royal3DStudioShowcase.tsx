import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Sparkles,
  Smartphone,
  Palette,
  Rotate3d,
  BookOpen,
  Heart,
  Award,
  Gift,
  Briefcase,
  Check,
  Wand2,
  Eye,
  X,
  Share2,
} from 'lucide-react';
import {
  InvitationCategory,
  InvitationData,
  OpenerStyle3D,
  RoyalVisualDirection,
} from '../../types/invitation';
import {
  ROYAL_VISUAL_DIRECTIONS,
  DEFAULT_INVITATION_SECTION_ORDER,
} from '../invitation-experience/StageCurtainExperience';
import { InteractiveInvitationView } from '../invitation-experience/InteractiveInvitationView';
import {
  ROYAL_3D_COLLECTION_SPECS,
  Royal3DTemplateSpec,
} from './Royal3DLuxuryInvitationExperience';
import { Royal3DCollectionTemplateId } from './Royal3DWebGLCanvas';
import { buildShareableInvitationUrl } from '../../utils/shareLink';

interface Royal3DStudioShowcaseProps {
  defaultInvitation: InvitationData;
  onCustomizeInEditor: (customizedInvitation: InvitationData) => void;
  onSelectCategoryInStore: (category: InvitationCategory) => void;
}

const SIX_CORE_OCCASIONS: {
  id: InvitationCategory;
  nameEn: string;
  nameAr: string;
  descAr: string;
  opener3D: OpenerStyle3D;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  sampleTitle: string;
  sampleCoupleOrHost: string;
}[] = [
  {
    id: 'engagement',
    nameEn: '1. Engagement',
    nameAr: '١. دعوات الخطوبة',
    descAr: 'خاتم خطوبة ماسي ثلاثي الأبعاد وأظرف شامبين بختم شمعي مذهّب',
    opener3D: 'engagement_ring_3d',
    icon: Heart,
    sampleTitle: 'حفل خطوبة مبارك',
    sampleCoupleOrHost: 'أحمد & زينب',
  },
  {
    id: 'wedding',
    nameEn: '2. Wedding',
    nameAr: '٢. دعوات الزفاف الملكي',
    descAr: '٤ قوالب زفاف ثلاثية الأبعاد (ظرف ملكي، مسرح مخملي، كتاب القصر، بحيرة البجعات)',
    opener3D: 'stage_curtains_3d',
    icon: Crown,
    sampleTitle: 'حفل الزفاف الملكي المبارك',
    sampleCoupleOrHost: 'أحمد & زينب',
  },
  {
    id: 'henna',
    nameEn: '3. Henna',
    nameAr: '٣. دعوات ليلة الحنّة',
    descAr: 'فوانيس تراثية مضيئة وأجواء القصر الزمردي والذهب الشامبين',
    opener3D: 'royal_3d_book',
    icon: Sparkles,
    sampleTitle: 'ليلة الحنّة البغدادية الملكية',
    sampleCoupleOrHost: 'العروس زينب',
  },
  {
    id: 'birthday',
    nameEn: '4. Birthday',
    nameAr: '٤. دعوات أعياد الميلاد',
    descAr: 'كيكة احتفالية تفاعلية وشموع مضيئة مع مؤثرات ضوئية وجسيمات ذهبية',
    opener3D: 'auto',
    icon: Gift,
    sampleTitle: 'احتفالية عيد الميلاد الملكي',
    sampleCoupleOrHost: 'الأميرة جود (٧ سنوات)',
  },
  {
    id: 'graduation',
    nameEn: '5. Graduation',
    nameAr: '٥. دعوات حفلات التخرج',
    descAr: 'وثيقة ومخطوطة تخرج ثلاثية الأبعاد بختم أكاديمي مذهّب',
    opener3D: 'royal_3d_book',
    icon: Award,
    sampleTitle: 'حفل تخرج الدفعة الملكية',
    sampleCoupleOrHost: 'د. علي كمال — كلية الطب',
  },
  {
    id: 'graduation_project',
    nameEn: '6. Project Graduation',
    nameAr: '٦. مناقشة مشاريع التخرج',
    descAr: 'دعوة أكاديمية رسمية لمناقشة مشروع التخرج مع اسم المشرف والقسم والقاعة',
    opener3D: 'royal_envelope_wax',
    icon: Briefcase,
    sampleTitle: 'مناقشة مشروع التخرج الأكاديمي',
    sampleCoupleOrHost: 'م. زيد العاني — هندسة الذكاء الاصطناعي',
  },
];

const ROYAL_3D_TEMPLATES_LIST: Royal3DTemplateSpec[] = Object.values(ROYAL_3D_COLLECTION_SPECS);

export const Royal3DStudioShowcase: React.FC<Royal3DStudioShowcaseProps> = ({
  defaultInvitation,
  onCustomizeInEditor,
  onSelectCategoryInStore,
}) => {
  const [selected3DTemplateId, setSelected3DTemplateId] =
    useState<Royal3DCollectionTemplateId>('tpl-royal-3d-envelope');
  const [standalonePreviewTemplateId, setStandalonePreviewTemplateId] =
    useState<Royal3DCollectionTemplateId | null>(null);
  const [selectedDirection, setSelectedDirection] =
    useState<RoyalVisualDirection>('obsidian_champagne');
  const [selectedOccasion, setSelectedOccasion] =
    useState<InvitationCategory>('wedding');
  const [enable3DFlowers, setEnable3DFlowers] = useState<boolean>(true);
  const [selectedFont, setSelectedFont] = useState<'amiri' | 'aref' | 'cairo'>('amiri');
  const [copiedSlugId, setCopiedSlugId] = useState<string | null>(null);

  const activeTemplateSpec: Royal3DTemplateSpec =
    ROYAL_3D_COLLECTION_SPECS[selected3DTemplateId] ||
    ROYAL_3D_COLLECTION_SPECS['tpl-royal-3d-envelope'];

  const buildTemplateInvitationData = (tplId: Royal3DCollectionTemplateId): InvitationData => {
    const spec =
      ROYAL_3D_COLLECTION_SPECS[tplId] || ROYAL_3D_COLLECTION_SPECS['tpl-royal-3d-envelope'];
    return {
      ...defaultInvitation,
      id: `royal-3d-${tplId}`,
      slug: `ahmed-zainab-${tplId.replace('tpl-royal-3d-', '')}`,
      category: 'wedding',
      title: 'حفل الزفاف الملكي المبارك',
      atelierTheme: undefined,
      templateId: tplId,
      groomName: 'أحمد',
      groomFamily: '',
      brideName: 'زينب',
      brideFamily: '',
      hostNames: 'عائلتا العروسين',
      eventDate: '2027-05-17',
      eventTime: '08:00 PM',
      venueName: 'قاعة الفيحاء للاحتفالات',
      city: 'بغداد، العراق',
      addressDetails: 'قاعة الفيحاء للاحتفالات - القاعة الملكية الكبرى',
      googleMapsUrl: 'https://maps.google.com/?q=Baghdad',
      contactPhone: '+964 771 166 3778',
      welcomeQuote: '«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا»',
      invitationBody:
        'بكل الحب والفرح، نتشرف بدعوتكم لمشاركتنا أجمل لحظات العمر والاحتفال بزفافنا.',
      visualDirection: selectedDirection,
      enable3DFlowersAndButterflies: enable3DFlowers,
      customBgColor: spec.isDarkTheme ? '#17130F' : '#F8F1E5',
      customPrimaryColor: '#D6B574',
      customFontFamily: selectedFont,
      sectionOrder: DEFAULT_INVITATION_SECTION_ORDER,
      musicTrack: tplId === 'tpl-royal-3d-theatre' ? 'royal_oud' : 'romantic_piano',
      rsvpEnabled: true,
      guestbookEnabled: true,
    };
  };

  const prototypeInvitation = buildTemplateInvitationData(selected3DTemplateId);

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Main Royal 3D Luxury Collection Container */}
      <div className="rounded-[32px] p-6 sm:p-10 bg-gradient-to-br from-[#17130F] via-[#1D1712] to-[#123D32] border-2 border-[#D6B574]/60 text-[#F8F1E5] shadow-[0_25px_70px_rgba(23,19,15,0.55)] relative overflow-hidden">
        {/* Decorative Gold Filigree Corner Frame */}
        <div className="pointer-events-none absolute inset-3 rounded-[24px] border border-[#D6B574]/25" />

        <div className="relative z-10 space-y-10">
          {/* Header & Official Color Identity Swatches */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6B574]/20 border border-[#D6B574]/50 text-[#F8F1E5] text-xs font-bold">
                <Crown size={14} className="text-[#D6B574]" />
                <span>MARASEEM – ROYAL 3D LUXURY INVITATION COLLECTION • 4 قوالب ثلاثية الأبعاد</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-amiri text-[#FFFDF8] leading-tight">
                مجموعة الدعوات الملكية ثلاثية الأبعاد{' '}
                <span className="text-[#D6B574]">بأسلوب The Digital Yes وهوية مراسيم</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#EBCBC1]/90 leading-relaxed">
                ٤ قوالب دعوات زفاف تفاعلية ثلاثية الأبعاد بالكامل (<strong className="text-[#D6B574]">WebGL 3D</strong>) مصممة أساساً للهواتف المحمولة (<strong className="text-[#D6B574]">Full Screen Mobile 100vh</strong>): الظرف الملكي بشريط حريري وختم شمعي، المسرح الملكي بستائر مخملية زمردية، كتاب القصر والحديقة المنبثق (Pop-Up 3D)، وبحيرة البجعات الرومانسية.
              </p>
            </div>

            {/* Official 7 Royal Luxury Color Swatches */}
            <div className="flex flex-wrap items-center gap-2 bg-[#17130F]/90 p-3.5 rounded-2xl border border-[#D6B574]/35 shrink-0">
              {[
                { name: 'Champagne Gold', ar: 'ذهبي شامبين', hex: '#D6B574' },
                { name: 'Antique Gold', ar: 'ذهبي عتيق', hex: '#A98445' },
                { name: 'Ivory', ar: 'عاجي فاخر', hex: '#F8F1E5' },
                { name: 'Pearl White', ar: 'أبيض لؤلؤي', hex: '#FFFDF8' },
                { name: 'Emerald Green', ar: 'أخضر زمردي', hex: '#123D32' },
                { name: 'Royal Black', ar: 'أسود ملكي', hex: '#17130F' },
                { name: 'Romantic Blush', ar: 'وردي رومانسي', hex: '#EBCBC1' },
              ].map((sw) => (
                <div
                  key={sw.hex}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#241E18] border border-[#D6B574]/25 text-[10px]"
                  title={`${sw.name} (${sw.hex})`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-[#D6B574]/70"
                    style={{ backgroundColor: sw.hex }}
                  />
                  <span className="text-[#F8F1E5] font-semibold">{sw.ar}</span>
                  <span className="text-[#D6B574] font-mono text-[9px]">{sw.hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 1: THE 4 ROYAL 3D WEDDING TEMPLATES (كل قالب تجربة مستقلة ومتكاملة) */}
          <div className="space-y-4 pt-4 border-t border-[#D6B574]/25">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Rotate3d size={20} className="text-[#D6B574]" />
                <h3 className="text-lg sm:text-2xl font-bold text-[#FFFDF8] font-amiri">
                  القوالب الأربعة ثلاثية الأبعاد (4 Independent 3D Interactive Wedding Templates)
                </h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#D6B574]/20 border border-[#D6B574]/45 text-[#F8F1E5] font-bold">
                أحمد & زينب • 17 مايو 2027 • قاعة الفيحاء للاحتفالات
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ROYAL_3D_TEMPLATES_LIST.map((tpl) => {
                const isSelected = selected3DTemplateId === tpl.id;
                const tplInvite = buildTemplateInvitationData(tpl.id);
                return (
                  <motion.div
                    key={tpl.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelected3DTemplateId(tpl.id)}
                    className={`rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-[#D6B574] bg-gradient-to-b from-[#261E17] to-[#17130F] shadow-[0_12px_35px_rgba(214,181,116,0.28)]'
                        : 'border-[#D6B574]/25 bg-[#17130F]/85 hover:border-[#D6B574]/60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D6B574]/20 border border-[#D6B574]/45 text-[#D6B574] font-bold">
                          {tpl.numberLabel}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-[#D6B574] text-[#17130F] font-bold">
                            <Check size={11} />
                            <span>قيد العرض</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-[10px] font-mono text-[#D6B574] uppercase tracking-wider">
                          {tpl.nameEn}
                        </div>
                        <h4 className="text-base font-bold font-amiri text-[#FFFDF8] mt-0.5">
                          {tpl.nameAr}
                        </h4>
                      </div>

                      <p className="text-xs text-[#F8F1E5]/80 leading-relaxed">
                        {tpl.subtitleAr}
                      </p>

                      {/* 3D Key Elements List */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tpl.featuresAr.map((h) => (
                          <span
                            key={h}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-[#241E18] border border-[#D6B574]/25 text-[#F8F1E5]"
                          >
                            ✦ {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Independent Actions for Each Template */}
                    <div className="space-y-2 pt-3 border-t border-[#D6B574]/20" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStandalonePreviewTemplateId(tpl.id)}
                          className="py-2 px-2.5 rounded-xl bg-[#D6B574] hover:bg-[#A98445] text-[#17130F] font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>معاينة مستقلة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onCustomizeInEditor(tplInvite)}
                          className="py-2 px-2.5 rounded-xl bg-[#123D32] hover:bg-[#195243] border border-[#D6B574]/45 text-[#FFFDF8] font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Wand2 size={12} className="text-[#D6B574]" />
                          <span>تخصيص القالب</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelected3DTemplateId(tpl.id)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#D6B574]/25 text-[#D6B574] border border-[#D6B574]/50'
                              : 'bg-[#241E18] text-[#F8F1E5]/80 hover:text-[#FFFDF8]'
                          }`}
                        >
                          {isSelected ? 'معروض في الهاتف أدناه' : 'عرض في الهاتف التفاعلي'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = buildShareableInvitationUrl(tplInvite);
                            navigator.clipboard.writeText(url);
                            setCopiedSlugId(tpl.id);
                            setTimeout(() => setCopiedSlugId(null), 2500);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#241E18] hover:bg-[#312820] border border-[#D6B574]/30 text-[#D6B574] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          title="نسخ رابط مشاركة مستقل لهذا القالب"
                        >
                          <Share2 size={11} />
                          <span>{copiedSlugId === tpl.id ? 'تم النسخ!' : 'الرابط'}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: LIVE 3D MOBILE-FIRST PROTOTYPE & CONTROLS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-[#D6B574]/25">
            {/* Left Column: Controls & Details */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#D6B574] tracking-wider">
                  معاينة حية بملء شاشة الهاتف (Full Screen Mobile-First 3D Experience)
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-amiri text-[#FFFDF8]">
                  {activeTemplateSpec.nameAr}
                </h3>
                <p className="text-xs text-[#F8F1E5]/85 leading-relaxed">
                  {activeTemplateSpec.subtitleAr} — اضغط على الزر الذهبي{' '}
                  <strong className="text-[#D6B574]">«{activeTemplateSpec.ctaButtonAr}»</strong> داخل
                  شاشة الهاتف لمشاهدة حركة الفتح ثلاثية الأبعاد، أو استخدم زر{' '}
                  <strong className="text-[#D6B574]">«تخطي الحركة»</strong> للانتقال المباشر لبيانات
                  العروسين والعد التنازلي وتأكيد الحضور.
                </p>
              </div>

              {/* Quick Switcher between the 4 Templates */}
              <div className="p-4 rounded-2xl bg-[#17130F]/90 border border-[#D6B574]/35 space-y-3">
                <label className="text-xs font-bold text-[#D6B574] flex items-center gap-1.5">
                  <Rotate3d size={14} />
                  <span>التبديل الفوري بين القوالب الأربعة ثلاثية الأبعاد:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROYAL_3D_TEMPLATES_LIST.map((spec) => {
                    const active = selected3DTemplateId === spec.id;
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => setSelected3DTemplateId(spec.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          active
                            ? 'bg-[#D6B574] border-[#FFFDF8] text-[#17130F] font-bold shadow'
                            : 'bg-[#241E18] border-[#D6B574]/25 text-[#F8F1E5] hover:border-[#D6B574]/60'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{spec.nameAr}</div>
                        <div
                          className={`text-[9px] font-mono ${
                            active ? 'text-[#17130F]/80' : 'text-[#D6B574]'
                          }`}
                        >
                          {spec.nameEn}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Typography & 3D Particles Toggles */}
                <div className="pt-2.5 border-t border-[#D6B574]/20 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setEnable3DFlowers((v) => !v)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                      enable3DFlowers
                        ? 'bg-[#123D32] border-[#D6B574] text-[#FFFDF8]'
                        : 'bg-[#241E18] border-white/10 text-neutral-400'
                    }`}
                  >
                    {enable3DFlowers
                      ? '🌸 البتلات والجسيمات الذهبية 3D: مفعّلة'
                      : '🌸 البتلات والجسيمات الذهبية 3D: متوقفة'}
                  </button>

                  <div className="flex items-center gap-1">
                    {[
                      { id: 'amiri' as const, label: 'أميري ملكي' },
                      { id: 'aref' as const, label: 'رقعة' },
                      { id: 'cairo' as const, label: 'كايرو' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFont(f.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                          selectedFont === f.id
                            ? 'bg-[#D6B574] text-[#17130F] border-[#FFFDF8]'
                            : 'bg-[#241E18] text-[#F8F1E5] border-[#D6B574]/25'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 Visual Directions Selector */}
              <div className="p-4 rounded-2xl bg-[#17130F]/90 border border-[#D6B574]/35 space-y-2.5">
                <label className="text-xs font-bold text-[#D6B574] flex items-center gap-1.5">
                  <Palette size={14} />
                  <span>الاتجاهات اللونية الملكية (Royal Color Directions):</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ROYAL_VISUAL_DIRECTIONS.map((dir) => {
                    const active = selectedDirection === dir.id;
                    return (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() => setSelectedDirection(dir.id)}
                        className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                          active
                            ? 'bg-[#D6B574]/25 border-[#D6B574] text-[#FFFDF8] font-bold'
                            : 'bg-[#241E18] border-white/10 text-[#F8F1E5]/80'
                        }`}
                      >
                        <div className="text-[10px] font-bold truncate">{dir.badgeAr}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[dir.bgPrimary, dir.accentGold, dir.emeraldTone].map((hex, idx) => (
                            <span
                              key={idx}
                              className="w-3 h-3 rounded-full border border-white/30"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6 Occasions Quick Access */}
              <div className="p-4 rounded-2xl bg-[#17130F]/90 border border-[#D6B574]/35 space-y-2.5">
                <label className="text-xs font-bold text-[#D6B574] flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>تصفح قوالب المناسبات الست (6 Core Occasions):</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SIX_CORE_OCCASIONS.map((occ) => {
                    const Icon = occ.icon;
                    const isSelected = selectedOccasion === occ.id;
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => {
                          setSelectedOccasion(occ.id);
                          onSelectCategoryInStore(occ.id);
                        }}
                        className={`p-2 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-1 ${
                          isSelected
                            ? 'bg-[#D6B574]/25 border-[#D6B574] text-[#FFFDF8]'
                            : 'bg-[#241E18] border-white/10 text-[#F8F1E5]/80 hover:border-[#D6B574]/45'
                        }`}
                      >
                        <span className="text-[10px] font-bold truncate">{occ.nameAr}</span>
                        <Icon size={12} className="text-[#D6B574] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary CTA Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onCustomizeInEditor(prototypeInvitation)}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#D6B574] via-[#F8F1E5] to-[#D6B574] text-[#17130F] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(214,181,116,0.35)] hover:brightness-105 transition-all cursor-pointer"
                >
                  <Wand2 size={15} />
                  <span>تخصيص «{activeTemplateSpec.nameAr}» في المحرر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStandalonePreviewTemplateId(selected3DTemplateId)}
                  className="py-3.5 px-4 rounded-2xl bg-[#123D32] hover:bg-[#195243] border border-[#D6B574]/55 text-[#FFFDF8] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye size={15} className="text-[#D6B574]" />
                  <span>معاينة بملء الشاشة 100vh</span>
                </button>
              </div>
            </div>

            {/* Right Column: Realistic Mobile-First 9:16 Smartphone Preview Frame */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-[430px] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#F8F1E5] px-3">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Smartphone size={13} className="text-[#D6B574]" />
                    <span>معاينة الهاتف التفاعلية (Full Screen Mobile 9:16)</span>
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D6B574]/20 border border-[#D6B574]/40 text-[#D6B574] font-bold">
                    {activeTemplateSpec.nameEn}
                  </span>
                </div>

                {/* Royal Gilded Smartphone Frame */}
                <div className="w-full rounded-[46px] p-2.5 bg-gradient-to-b from-[#D6B574] via-[#A98445] to-[#D6B574] shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(214,181,116,0.25)]">
                  <div className="w-full rounded-[38px] bg-[#17130F] overflow-hidden border border-black relative">
                    {/* Dynamic Island Notch */}
                    <div className="w-full h-7 bg-[#17130F] flex items-center justify-center border-b border-[#D6B574]/25">
                      <div className="w-24 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neutral-800" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6B574]/70" />
                      </div>
                    </div>

                    {/* Interactive 3D Invitation Live Inside Phone */}
                    <div className="max-h-[700px] overflow-y-auto">
                      <InteractiveInvitationView
                        key={`${selected3DTemplateId}-${selectedDirection}-${enable3DFlowers}-${selectedFont}`}
                        invitation={prototypeInvitation}
                        isEmbeddedPreview={true}
                      />
                    </div>

                    {/* Phone Home Indicator */}
                    <div className="w-full h-5 bg-[#17130F] flex items-center justify-center border-t border-[#D6B574]/25">
                      <div className="w-28 h-1 rounded-full bg-[#D6B574]/60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Full-Screen 100vh Modal for Independent Template Preview */}
      <AnimatePresence>
        {standalonePreviewTemplateId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#17130F] flex flex-col"
          >
            {/* Top Bar to Switch Templates, Customize in Editor, or Close */}
            <div className="px-4 py-2.5 bg-[#17130F] border-b border-[#D6B574]/35 flex items-center justify-between flex-wrap gap-2 z-50">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#D6B574] flex items-center gap-1.5">
                  <Crown size={14} />
                  <span>معاينة مستقلة بملء الشاشة (100vh):</span>
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {ROYAL_3D_TEMPLATES_LIST.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setStandalonePreviewTemplateId(spec.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        standalonePreviewTemplateId === spec.id
                          ? 'bg-[#D6B574] text-[#17130F]'
                          : 'bg-[#241E18] text-[#F8F1E5] hover:bg-[#312820]'
                      }`}
                    >
                      {spec.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const inv = buildTemplateInvitationData(standalonePreviewTemplateId);
                    setStandalonePreviewTemplateId(null);
                    onCustomizeInEditor(inv);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#D6B574] hover:bg-[#A98445] text-[#17130F] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Wand2 size={13} />
                  <span>تخصيص هذا القالب في المحرر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStandalonePreviewTemplateId(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#241E18] hover:bg-rose-950 border border-[#D6B574]/40 text-[#FFFDF8] font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <X size={14} />
                  <span>إغلاق المعاينة</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <InteractiveInvitationView
                key={`standalone-${standalonePreviewTemplateId}`}
                invitation={buildTemplateInvitationData(standalonePreviewTemplateId)}
                isEmbeddedPreview={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
