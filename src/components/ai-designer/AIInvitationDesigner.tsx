import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Palette,
  Type,
  Layers,
  Play,
  Check,
  Edit3,
  Eye,
} from 'lucide-react';
import {
  AtelierThemeVariant,
  CountdownDigitFont,
  InvitationCategory,
  InvitationData,
  VisualEffectType,
} from '../../types/invitation';
import { INITIAL_TEMPLATES } from '../../data/templates';
import { InteractiveInvitationView } from '../invitation-experience/InteractiveInvitationView';
import { useLanguage } from '../../i18n/LanguageContext';

interface AIInvitationDesignerProps {
  onAdoptDesign: (invitation: InvitationData) => void;
  onPublishDirect: (invitation: InvitationData) => void;
}

interface AIDesignProposal {
  id: string;
  proposalTitle: string;
  proposalTitleEn: string;
  proposalBadge: string;
  proposalBadgeEn: string;
  templateId: string;
  category: InvitationCategory;
  atelierTheme?: AtelierThemeVariant;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  colorPaletteName: string;
  colorPaletteNameEn: string;
  fontName: string;
  fontNameEn: string;
  countdownFont: CountdownDigitFont;
  visualElementsLabel: string;
  visualElementsLabelEn: string;
  visualEffect: VisualEffectType;
  openingAnimationLabel: string;
  openingAnimationLabelEn: string;
  layoutStyleLabel: string;
  layoutStyleLabelEn: string;
  invitationData: InvitationData;
}

const SAMPLE_PROMPTS_AR = [
  'أريد دعوة خطوبة فخمة باللون الكريمي والفستقي مع خاتم متحرك وورود بيضاء',
  'أريد دعوة زفاف ملكية في بغداد بلون أخضر ميرمي وذهبي مع فوانيس مضيئة وخط أميري',
  'أريد دعوة تخرج كلية الطب بجامعة بغداد بتصميم أكاديمي أنيق وعد تنازلي مذهب',
  'أريد دعوة افتتاح مقهى مختص في الجادرية بهوية كريمية دافئة وقص شريط تفاعلي',
];

const SAMPLE_PROMPTS_EN = [
  'Luxury engagement invitation in creamy white & pistachio with animated ring and white roses',
  'Royal wedding invitation in Baghdad in sage green & gold with glowing lanterns',
  'Baghdad Medical School graduation invitation with academic styling and golden countdown',
  'Specialty cafe grand opening in Al-Jadriya with warm creamy palette and ribbon cutting',
];

export const AIInvitationDesigner: React.FC<AIInvitationDesignerProps> = ({
  onAdoptDesign,
  onPublishDirect,
}) => {
  const { lang, tr } = useLanguage();
  const samplePrompts = lang === 'ar' ? SAMPLE_PROMPTS_AR : SAMPLE_PROMPTS_EN;
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS_AR[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposals, setProposals] = useState<AIDesignProposal[]>(() =>
    generateThreeSmartProposals(SAMPLE_PROMPTS_AR[0])
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const activeProposal = proposals[selectedIdx] || proposals[0];
  const [customTitle, setCustomTitle] = useState(activeProposal.invitationData.title);
  const [customGroom, setCustomGroom] = useState(
    activeProposal.invitationData.groomName || 'علي محمد'
  );
  const [customBride, setCustomBride] = useState(
    activeProposal.invitationData.brideName || 'تبارك سعد'
  );
  const [customVenue, setCustomVenue] = useState(activeProposal.invitationData.venueName);
  const [customDate, setCustomDate] = useState(activeProposal.invitationData.eventDate);

  const [aiCreativeAdvice, setAiCreativeAdvice] = useState<{
    suggestedTitle: string;
    welcomeQuote: string;
    invitationBody: string;
    romanticOrFormalQuotes: string[];
    recommendedStyle: string;
    colorAndFontAdvice: string;
    creativeEventIdeas: string[];
  } | null>(null);

  const handleRunAIDesigner = async (e?: React.FormEvent, customPromptText?: string) => {
    if (e) e.preventDefault();
    const targetPrompt = (customPromptText ?? prompt).trim();
    if (!targetPrompt) return;

    setIsGenerating(true);
    const generated = generateThreeSmartProposals(targetPrompt);
    setProposals(generated);
    setSelectedIdx(0);
    setCustomTitle(generated[0].invitationData.title);
    setCustomGroom(generated[0].invitationData.groomName || 'علي محمد');
    setCustomBride(generated[0].invitationData.brideName || 'تبارك سعد');
    setCustomVenue(generated[0].invitationData.venueName);
    setCustomDate(generated[0].invitationData.eventDate);

    try {
      const response = await fetch('/api/ai/invitation-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: generated[0].category,
          names: `${generated[0].invitationData.groomName || ''} & ${generated[0].invitationData.brideName || ''}`,
          tone: targetPrompt,
          details: targetPrompt,
          lang,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiCreativeAdvice(data);
        if (data.suggestedTitle) {
          setCustomTitle(data.suggestedTitle);
        }
      }
    } catch {
      // Fallback gracefully to local smart proposals if offline
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectProposal = (idx: number) => {
    setSelectedIdx(idx);
    const p = proposals[idx];
    if (p) {
      setCustomTitle(p.invitationData.title);
      setCustomGroom(p.invitationData.groomName || 'علي محمد');
      setCustomBride(p.invitationData.brideName || 'تبارك سعد');
      setCustomVenue(p.invitationData.venueName);
      setCustomDate(p.invitationData.eventDate);
    }
  };

  const liveInvitation: InvitationData = {
    ...activeProposal.invitationData,
    title: customTitle,
    groomName: customGroom,
    brideName: customBride,
    venueName: customVenue,
    eventDate: customDate,
  };

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#566B49] font-cairo py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DCE8CB] border border-[#B9CCA0] text-[#566B49] text-xs font-bold">
            <Wand2 size={14} className="text-[#566B49]" />
            <span>
              {tr('مساعد التصميم الذكي للدعوات', 'Smart Invitation Design Assistant')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#566B49] leading-tight">
            {tr(
              'صِف مناسبتك بكلماتك… والمساعد الذكي يصمم لك ٣ دعوات تفاعلية فوراً',
              'Describe Your Occasion… And Receive 3 Interactive Invitation Designs Instantly'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#566B49]/80 leading-relaxed">
            {tr(
              'اكتب نوع المناسبة والألوان والعناصر البصرية التي تحلم بها، وسيقوم النظام باقتراح ٣ تصاميم تفاعلية كاملة (مع القالب، الألوان، الخطوط، والحركة الافتتاحية) لتعاينها وتعدلها مباشرة.',
              'Write the occasion type, colors, and visual elements you envision, and our system will generate 3 complete interactive concepts (template, palette, typography, and opening animation) ready for live preview and editing.'
            )}
          </p>
        </div>

        {/* Prompt Input Box */}
        <form
          onSubmit={handleRunAIDesigner}
          className="max-w-4xl mx-auto p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] shadow-[0_8px_30px_rgba(86,107,73,0.07)] space-y-4"
        >
          <label className="block text-xs font-bold text-[#566B49]">
            {tr('اكتب وصف الدعوة التي تتخيلها:', 'Describe the invitation you envision:')}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={tr(
                'مثال: أريد دعوة خطوبة فخمة باللون الكريمي والفستقي مع خاتم متحرك وورود بيضاء...',
                'Example: Luxury engagement invitation in creamy white and pistachio with animated ring and white roses...'
              )}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] focus:border-[#91A77D] text-sm text-[#566B49] placeholder-[#91A77D] outline-none resize-none"
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-3 rounded-2xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] border border-[#91A77D] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Sparkles size={17} />
              <span>
                {isGenerating
                  ? tr('جارٍ هندسة ٣ تصاميم...', 'Generating 3 Designs...')
                  : tr('توليد ٣ اقتراحات تفاعلية', 'Generate 3 Interactive Concepts')}
              </span>
            </button>
          </div>

          {/* Sample Prompts Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-[#91A77D]">
              {tr('أمثلة سريعة:', 'Quick Examples:')}
            </span>
            {samplePrompts.map((sp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPrompt(sp);
                  handleRunAIDesigner(undefined, sp);
                }}
                className="px-3 py-1 rounded-full bg-[#F8F6EF] hover:bg-[#DCE8CB] border border-[#E9DDC9] text-[11px] text-[#566B49] transition-all cursor-pointer truncate max-w-xs"
              >
                «{sp}»
              </button>
            ))}
          </div>
        </form>

        {/* Gemini AI Copywriting, Quotes & Creative Ideas Panel */}
        {aiCreativeAdvice && (
          <div className="max-w-5xl mx-auto p-6 rounded-3xl bg-[#FFFDF8] border-2 border-[#B9CCA0] shadow-[0_8px_28px_rgba(86,107,73,0.08)] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E9DDC9] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#566B49]" />
                <h3 className="text-sm sm:text-base font-bold text-[#566B49]">
                  {tr(
                    'اقتراحات المساعد الذكي للنصوص والاقتباسات وتنسيق الحفل',
                    'AI Assistant Wording, Quotes & Event Styling Recommendations'
                  )}
                </h3>
              </div>
              <span className="text-[11px] px-3 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                {aiCreativeAdvice.recommendedStyle}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-2">
                <div className="font-bold text-[#566B49]">
                  {tr('النص المقترح لبطاقة الدعوة:', 'Suggested Invitation Wording:')}
                </div>
                <p className="text-[#566B49]/90 font-amiri text-sm leading-relaxed">
                  «{aiCreativeAdvice.welcomeQuote}»
                </p>
                <p className="text-[#566B49]/85 leading-relaxed">
                  {aiCreativeAdvice.invitationBody}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-2">
                <div className="font-bold text-[#566B49]">
                  {tr('عبارات واقتباسات رومانسية ورسمية مقترحة:', 'Suggested Quotes & Blessings:')}
                </div>
                <ul className="space-y-1.5 text-[#566B49]/85">
                  {aiCreativeAdvice.romanticOrFormalQuotes?.map((q, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#91A77D] font-bold">✦</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#DCE8CB]/45 border border-[#B9CCA0]">
                <strong className="text-[#566B49] block mb-1">
                  {tr('تنسيق الألوان والخطوط المقترح:', 'Recommended Colors & Typography:')}
                </strong>
                <span className="text-[#566B49]/90">{aiCreativeAdvice.colorAndFontAdvice}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#DCE8CB]/45 border border-[#B9CCA0]">
                <strong className="text-[#566B49] block mb-1">
                  {tr('أفكار إبداعية لتجربة الضيوف في المناسبة:', 'Creative Guest Experience Ideas:')}
                </strong>
                <ul className="space-y-1 text-[#566B49]/90">
                  {aiCreativeAdvice.creativeEventIdeas?.map((idea, i) => (
                    <li key={i}>• {idea}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3 AI Proposals Selector Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#566B49] flex items-center gap-2">
              <Sparkles size={18} className="text-[#91A77D]" />
              <span>
                {tr(
                  'الاقتراحات الثلاثة المصممة حسب طلبك (اختر اقتراحاً لمعاينته وتعديله):',
                  'Your 3 Tailored Design Proposals (Select a concept to preview and customize):'
                )}
              </span>
            </h2>
            <span className="text-xs text-[#91A77D] font-bold">
              {tr(
                'دعوات تفاعلية حية بالكامل وليست صوراً ثابتة',
                '100% Live Interactive Invitations'
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {proposals.map((prop, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <div
                  key={prop.id}
                  onClick={() => handleSelectProposal(idx)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-[#FFFDF8] border-2 border-[#566B49] shadow-[0_10px_30px_rgba(86,107,73,0.12)]'
                      : 'bg-[#FFFDF8] border-[#E9DDC9] hover:border-[#B9CCA0] shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-3 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] border border-[#B9CCA0] font-bold">
                        {tr(`الاقتراح ${idx + 1}`, `Concept ${idx + 1}`)} •{' '}
                        {lang === 'ar' ? prop.proposalBadge : prop.proposalBadgeEn}
                      </span>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-[#566B49] text-[#FFFDF8] flex items-center justify-center">
                          <Check size={14} />
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#566B49]">
                      {lang === 'ar' ? prop.proposalTitle : prop.proposalTitleEn}
                    </h3>

                    {/* AI Spec Breakdown */}
                    <div className="space-y-2 text-xs pt-2 border-t border-[#E9DDC9]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#91A77D] flex items-center gap-1.5 font-semibold">
                          <Palette size={13} /> {tr('الألوان:', 'Palette:')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: prop.primaryColor }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: prop.secondaryColor }}
                          />
                          <span className="font-bold text-[#566B49]">
                            {lang === 'ar' ? prop.colorPaletteName : prop.colorPaletteNameEn}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#91A77D] flex items-center gap-1.5 font-semibold">
                          <Type size={13} /> {tr('الخطوط:', 'Typography:')}
                        </span>
                        <span className="font-bold text-[#566B49]">
                          {lang === 'ar' ? prop.fontName : prop.fontNameEn}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#91A77D] flex items-center gap-1.5 font-semibold">
                          <Sparkles size={13} /> {tr('العناصر البصرية:', 'Visuals:')}
                        </span>
                        <span className="font-bold text-[#566B49]">
                          {lang === 'ar'
                            ? prop.visualElementsLabel
                            : prop.visualElementsLabelEn}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#91A77D] flex items-center gap-1.5 font-semibold">
                          <Play size={13} /> {tr('الحركة الافتتاحية:', 'Opening Motion:')}
                        </span>
                        <span className="font-bold text-[#566B49]">
                          {lang === 'ar'
                            ? prop.openingAnimationLabel
                            : prop.openingAnimationLabelEn}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#91A77D] flex items-center gap-1.5 font-semibold">
                          <Layers size={13} /> {tr('عرض المعلومات:', 'Layout:')}
                        </span>
                        <span className="font-bold text-[#566B49]">
                          {lang === 'ar' ? prop.layoutStyleLabel : prop.layoutStyleLabelEn}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProposal(idx);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#566B49] text-[#FFFDF8]'
                        : 'bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8]'
                    }`}
                  >
                    {isSelected
                      ? tr('قيد المعاينة التفاعلية أدناه ✓', 'Active in Live Preview Below ✓')
                      : tr('معاينة هذا التصميم التفاعلي', 'Preview This Interactive Concept')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Interactive Preview & Instant Customization Before Adopting */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-[#E9DDC9]">
          {/* Quick Editor Sidebar */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-5 shadow-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-[#91A77D] font-bold">
                {tr('تعديل سريع قبل اعتماد التصميم', 'Quick Edit Before Adopting')}
              </span>
              <h3 className="text-base font-bold text-[#566B49]">
                {tr(
                  `تخصيص بيانات (${activeProposal.proposalTitle})`,
                  `Customize (${activeProposal.proposalTitleEn})`
                )}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#566B49] mb-1">
                  {tr('عنوان المناسبة:', 'Event Title:')}
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] focus:border-[#91A77D] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#566B49] mb-1">
                    {tr('الاسم الأول (العريس):', 'First Name (Groom):')}
                  </label>
                  <input
                    type="text"
                    value={customGroom}
                    onChange={(e) => setCustomGroom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#566B49] mb-1">
                    {tr('الاسم الثاني (العروس):', 'Second Name (Bride):')}
                  </label>
                  <input
                    type="text"
                    value={customBride}
                    onChange={(e) => setCustomBride(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#566B49] mb-1">
                    {tr('تاريخ المناسبة:', 'Event Date:')}
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#566B49] mb-1">
                    {tr('القاعة / المكان:', 'Venue / Hall:')}
                  </label>
                  <input
                    type="text"
                    value={customVenue}
                    onChange={(e) => setCustomVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 space-y-2.5 border-t border-[#E9DDC9]">
              <button
                type="button"
                onClick={() => onAdoptDesign(liveInvitation)}
                className="w-full py-3 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] border border-[#91A77D] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Edit3 size={15} />
                <span>
                  {tr(
                    'اعتماد التصميم وفتحه في المحرر الكامل',
                    'Adopt Concept & Open in Full Studio'
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onPublishDirect(liveInvitation)}
                className="w-full py-3 rounded-xl bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Check size={15} />
                <span>
                  {tr(
                    'نشر الدعوة فوراً وإدارة قائمة الضيوف',
                    'Publish Immediately & Manage Guests'
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Live Interactive Invitation Viewport */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9]">
              <span className="text-xs font-bold text-[#566B49] flex items-center gap-2">
                <Eye size={15} className="text-[#91A77D]" />
                <span>
                  {tr(
                    `معاينة تفاعلية حية لـ (${activeProposal.proposalTitle}) — جرب فتح الدعوة وتقليب المشاهد:`,
                    `Live Interactive Preview of (${activeProposal.proposalTitleEn}) — Try opening & flipping scenes:`
                  )}
                </span>
              </span>
              <span className="text-[11px] text-[#91A77D] font-bold">
                {lang === 'ar'
                  ? activeProposal.colorPaletteName
                  : activeProposal.colorPaletteNameEn}
              </span>
            </div>

            <InteractiveInvitationView
              key={activeProposal.id}
              invitation={liveInvitation}
              isEmbeddedPreview={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function generateThreeSmartProposals(rawPrompt: string): AIDesignProposal[] {
  const p = rawPrompt.toLowerCase();

  const isEngagement =
    p.includes('خطوب') || p.includes('خاتم') || p.includes('حلقات') || p.includes('engagement');
  const isGraduation =
    p.includes('تخرج') ||
    p.includes('طب') ||
    p.includes('هندسة') ||
    p.includes('جامع') ||
    p.includes('graduation');
  const isBusiness =
    p.includes('افتتاح') ||
    p.includes('شرك') ||
    p.includes('كافيه') ||
    p.includes('مقهى') ||
    p.includes('مطعم') ||
    p.includes('عياد') ||
    p.includes('opening');
  const isHenna = p.includes('حنة') || p.includes('حنه') || p.includes('henna');

  const category: InvitationCategory = isGraduation
    ? 'graduation'
    : isBusiness
    ? 'business_opening'
    : isHenna
    ? 'henna'
    : isEngagement
    ? 'engagement'
    : 'wedding';

  const wantsPistachioCream =
    p.includes('فستق') ||
    p.includes('كريم') ||
    p.includes('ميرم') ||
    p.includes('ورود بيضاء') ||
    p.includes('pistachio') ||
    !p.includes('أزرق');

  const baseDate = '2026-11-20';
  const baseVenue = isBusiness
    ? 'الجادرية - تقاطع جامعة بغداد'
    : 'قاعة قصر النخيل الملكية - بغداد';

  const tpl1 =
    INITIAL_TEMPLATES.find((t) => t.id === 'tpl-atelier-botanical-clock') || INITIAL_TEMPLATES[0];
  const prop1: AIDesignProposal = {
    id: `ai-prop-1-${Date.now()}`,
    proposalTitle: isEngagement
      ? 'الحديقة الفستقية والكريمية الدافئة'
      : 'إصدار الميرمية والفستق الملكي',
    proposalTitleEn: isEngagement
      ? 'Warm Creamy & Pistachio Botanical Garden'
      : 'Royal Sage & Pistachio Edition',
    proposalBadge: 'الأكثر تطابقاً مع وصفك',
    proposalBadgeEn: 'Best Match for Your Prompt',
    templateId: tpl1.id,
    category,
    atelierTheme: 'botanical_clock',
    primaryColor: '#B9CCA0',
    secondaryColor: '#FFFDF8',
    bgColor: '#16241B',
    colorPaletteName: wantsPistachioCream ? 'كريمي دافئ وفستقي ميرمي' : 'زمردي ملكي وعاجي',
    colorPaletteNameEn: wantsPistachioCream
      ? 'Warm Cream & Pistachio Sage'
      : 'Royal Emerald & Ivory',
    fontName: 'خط أميري الملكي + خط القاهرة',
    fontNameEn: 'Amiri Royal Serif + Cormorant Atelier',
    countdownFont: 'cormorant_atelier',
    visualElementsLabel: 'خاتم متحرك + نثر ورود بيضاء وفستقية',
    visualElementsLabelEn: 'Animated Ring + Floating White & Pistachio Petals',
    visualEffect: 'rose_petals',
    openingAnimationLabel: 'الساعة الزهرية المتحركة + ختم الشمع',
    openingAnimationLabelEn: 'Botanical Wreath Clock + Wax Seal',
    layoutStyleLabel: 'مشاهد سينمائية متتابعة مع عداد مذهب',
    layoutStyleLabelEn: 'Sequential Scenes with Gilded Countdown',
    invitationData: {
      id: `ai-inv-1-${Date.now()}`,
      slug: 'ai-pistachio-cream-1',
      templateId: tpl1.id,
      category,
      atelierTheme: 'botanical_clock',
      title: isEngagement
        ? 'حفل خطوبة مباركة باللون الكريمي والفستقي'
        : isGraduation
        ? 'حفل تخرج جامعي مبارك'
        : isBusiness
        ? 'حفل الافتتاح الرسمي المبارك'
        : 'حفل زفاف ملكي مبارك',
      groomName: 'علي محمد',
      brideName: 'تبارك سعد',
      hostNames: 'عائلتا العروسين الكريمتان',
      eventDate: baseDate,
      eventTime: '08:00 PM',
      venueName: baseVenue,
      city: 'بغداد، العراق',
      addressDetails: 'بغداد - المنصور / الجادرية',
      googleMapsUrl: 'https://maps.google.com',
      welcomeQuote:
        '«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا»',
      invitationBody:
        'بقلوب تفيض بالمحبة والسرور، نتشرف بدعوتكم لمشاركتنا فرحة العمر وتبديل الحلقات في أمسية تجمع الأهل والأحبة.',
      galleryImages: [],
      musicTrack: 'romantic_piano',
      visualEffect: 'rose_petals',
      pageTransitionMode: '3d-flip',
      countdownStyle: 'emerald_heritage',
      countdownDigitFont: 'cormorant_atelier',
      countdownDigitColor: '#C5E1A5',
      countdownNumeralSystem: 'arabic_indic',
      showSecondsInCountdown: true,
      rsvpEnabled: true,
      maxGuestsPerInvite: 5,
      guestbookEnabled: true,
      viewCount: 1,
      createdAt: new Date().toISOString(),
    },
  };

  const tpl2 =
    INITIAL_TEMPLATES.find((t) => t.id === 'tpl-royal-engagement') || INITIAL_TEMPLATES[0];
  const prop2: AIDesignProposal = {
    id: `ai-prop-2-${Date.now()}`,
    proposalTitle: 'الظرف الملكي ثلاثي الأبعاد',
    proposalTitleEn: '3D Royal Wax-Sealed Envelope',
    proposalBadge: 'تقليب ثلاثي الأبعاد تفاعلي',
    proposalBadgeEn: 'Interactive 3D Card Flip',
    templateId: tpl2.id,
    category,
    primaryColor: '#DCE8CB',
    secondaryColor: '#D4AF37',
    bgColor: '#121D16',
    colorPaletteName: 'فستقي فاتح وذهبي شامبانيا مع أبيض دافئ',
    colorPaletteNameEn: 'Light Pistachio, Champagne Gold & Warm White',
    fontName: 'خط القاهرة الهندسي + خط عارف رقعة',
    fontNameEn: 'Cairo Geometric + Aref Ruqaa Calligraphy',
    countdownFont: 'aref_calligraphy',
    visualElementsLabel: 'بريق الذهب + نثر الورود المتحركة',
    visualElementsLabelEn: 'Golden Shimmer + Floating Rose Petals',
    visualEffect: 'golden_sparkles',
    openingAnimationLabel: 'فضّ الظرف المختوم + تقليب البطاقة في الهواء',
    openingAnimationLabelEn: 'Unsealing Envelope + Mid-Air 3D Flip',
    layoutStyleLabel: 'بطاقة مقسمة إلى ٦ مشاهد تفاعلية',
    layoutStyleLabelEn: '6-Scene Interactive Card Layout',
    invitationData: {
      ...prop1.invitationData,
      id: `ai-inv-2-${Date.now()}`,
      slug: 'ai-royal-3d-2',
      templateId: tpl2.id,
      atelierTheme: undefined,
      visualEffect: 'golden_sparkles',
      countdownDigitFont: 'aref_calligraphy',
      countdownDigitColor: '#FDE68A',
      customBgColor: '#111B14',
    },
  };

  const tpl3 =
    INITIAL_TEMPLATES.find((t) => t.id === 'tpl-atelier-rosette-polaroid') || INITIAL_TEMPLATES[0];
  const prop3: AIDesignProposal = {
    id: `ai-prop-3-${Date.now()}`,
    proposalTitle: 'الإطار الرومانسي وأغصان الورد',
    proposalTitleEn: 'Romantic Rosette & Botanical Frame',
    proposalBadge: 'تصميم فني عصري',
    proposalBadgeEn: 'Artistic Modern Layout',
    templateId: tpl3.id,
    category,
    atelierTheme: 'rosette_polaroid',
    primaryColor: '#FFFDF8',
    secondaryColor: '#91A77D',
    bgColor: '#1F1A1C',
    colorPaletteName: 'بيج دافئ وكريمي مع أخضر ميرمي',
    colorPaletteNameEn: 'Warm Beige & Creamy White with Sage Green',
    fontName: 'خط أميري الكلاسيكي + خط تجول',
    fontNameEn: 'Amiri Classic + Cinzel Roman',
    countdownFont: 'amiri_royal',
    visualElementsLabel: 'إطار صور تذكاري + ورود بيضاء متناثرة',
    visualElementsLabelEn: 'Keepsake Portrait Frame + White Rose Petals',
    visualEffect: 'rose_petals',
    openingAnimationLabel: 'البوابة المقوسة والختم المذهب',
    openingAnimationLabelEn: 'Arched Gate & Gilded Wax Seal',
    layoutStyleLabel: 'قصة مصورة متدرجة مع جدول فقرات الحفل',
    layoutStyleLabelEn: 'Storybook Flow with Ceremony Timeline',
    invitationData: {
      ...prop1.invitationData,
      id: `ai-inv-3-${Date.now()}`,
      slug: 'ai-rosette-3',
      templateId: tpl3.id,
      atelierTheme: 'rosette_polaroid',
      visualEffect: 'rose_petals',
      countdownDigitFont: 'amiri_royal',
      countdownDigitColor: '#FAF6F0',
    },
  };

  return [prop1, prop2, prop3];
}
