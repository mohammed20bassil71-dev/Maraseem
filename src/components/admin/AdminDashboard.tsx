import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  DollarSign,
  Tag,
  Handshake,
  Star,
  LayoutGrid,
  Settings,
  Trash2,
  TrendingUp,
  Eye,
  Cake,
  Plus,
  Music,
  Lock,
  Gift,
  Sparkles,
} from 'lucide-react';
import {
  CustomerReview,
  DiscountCoupon,
  InvitationData,
  InvitedGuest,
  PartnerAccount,
  PlatformUserRole,
  PricingPackage,
  Template,
} from '../../types/invitation';
import {
  BirthdayCategory,
  BirthdayGreetingData,
  BirthdayTemplate,
} from '../../types/birthdayExperience';
import {
  BIRTHDAY_CATEGORIES_META,
  BIRTHDAY_MUSIC_LIBRARY,
  createArtisticSvgDataUri,
} from '../../data/birthdayTemplates';
import { useLanguage } from '../../i18n/LanguageContext';

interface AdminDashboardProps {
  invitations: InvitationData[];
  templates: Template[];
  invitedGuests: InvitedGuest[];
  packages: PricingPackage[];
  coupons: DiscountCoupon[];
  partners: PartnerAccount[];
  reviews: CustomerReview[];
  siteSlogan: string;
  onUpdateSlogan: (slogan: string) => void;
  onUpdatePackagePrice: (pkgId: PricingPackage['id'], newPriceIQD: number, newPriceUSD: number) => void;
  onAddCoupon: (coupon: Omit<DiscountCoupon, 'id' | 'usageCount'>) => void;
  onToggleCoupon: (id: string) => void;
  onDeleteCoupon: (id: string) => void;
  onDeleteReview: (id: string) => void;
  onDeleteInvitation: (id: string) => void;
  onPreviewInvitation: (inv: InvitationData) => void;
  onSwitchRole: (role: PlatformUserRole) => void;
  birthdayTemplates?: BirthdayTemplate[];
  birthdayGreetings?: BirthdayGreetingData[];
  onAddBirthdayTemplate?: (tpl: BirthdayTemplate) => void;
  onUpdateBirthdayTemplate?: (tplId: string, tier: 'free' | 'paid' | 'vip', priceIQD: number, priceUSD: number) => void;
  onDeleteBirthdayTemplate?: (tplId: string) => void;
  onDeleteBirthdayGreeting?: (id: string) => void;
  onPreviewBirthdayGreeting?: (greeting: BirthdayGreetingData) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  invitations,
  templates,
  packages,
  coupons,
  partners,
  reviews,
  siteSlogan,
  onUpdateSlogan,
  onUpdatePackagePrice,
  onAddCoupon,
  onToggleCoupon,
  onDeleteCoupon,
  onDeleteReview,
  onDeleteInvitation,
  onPreviewInvitation,
  onSwitchRole,
  birthdayTemplates = [],
  birthdayGreetings = [],
  onAddBirthdayTemplate,
  onUpdateBirthdayTemplate,
  onDeleteBirthdayTemplate,
  onDeleteBirthdayGreeting,
  onPreviewBirthdayGreeting,
}) => {
  const { lang, tr } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'birthday_admin'
    | 'pricing_coupons'
    | 'invitations_templates'
    | 'partners_users'
    | 'reviews_content'
  >('overview');

  // New Coupon State
  const [newCode, setNewCode] = useState('');
  const [newPercent, setNewPercent] = useState(20);
  const [newDesc, setNewDesc] = useState('');

  // Editable Slogan
  const [sloganDraft, setSloganDraft] = useState(siteSlogan);
  const [savedSloganNotice, setSavedSloganNotice] = useState(false);

  // New Birthday Template Form State
  const [newBdayNameAr, setNewBdayNameAr] = useState('');
  const [newBdayNameEn, setNewBdayNameEn] = useState('');
  const [newBdayCategory, setNewBdayCategory] = useState<BirthdayCategory>('romantic');
  const [newBdayTier, setNewBdayTier] = useState<'free' | 'paid' | 'vip'>('paid');
  const [newBdayPriceIQD, setNewBdayPriceIQD] = useState(25000);
  const [newBdayThemeColor, setNewBdayThemeColor] = useState('#2A1215');
  const [newBdayAccentColor, setNewBdayAccentColor] = useState('#D4AF37');

  // Analytics
  const totalPartnerSalesIQD = partners.reduce((s, p) => s + p.totalSalesIQD, 0);
  const directPlatformSalesIQD = invitations.length * 75000;
  const totalRevenueIQD = totalPartnerSalesIQD + directPlatformSalesIQD;
  const totalViews = invitations.reduce((s, i) => s + (i.viewCount || 0), 0);

  const totalBirthdayViews = birthdayGreetings.reduce((s, g) => s + (g.viewsCount || 0), 0);
  const totalBirthdayShares = birthdayGreetings.reduce((s, g) => s + (g.sharesCount || 0), 0);

  const handleAddBirthdayTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBdayNameAr.trim() || !onAddBirthdayTemplate) return;
    const baseTpl = birthdayTemplates[0];
    const created: BirthdayTemplate = {
      id: `bday-tpl-${Date.now()}`,
      nameAr: newBdayNameAr.trim(),
      nameEn: newBdayNameEn.trim() || newBdayNameAr.trim(),
      category: newBdayCategory,
      occasionType: 'birthday',
      visualArchitecture: 'royal_stage',
      defaultPhotoFrameStyle: 'polaroid',
      supportedRelationships: ['lover', 'spouse', 'friend', 'sibling', 'parent', 'general'],
      descriptionAr: `قالب تهنئة عيد ميلاد تفاعلي مخصص (${newBdayNameAr.trim()}) مع صفحات متعددة ومفاجآت تفاعلية.`,
      descriptionEn: `Interactive multi-page birthday template (${newBdayNameEn.trim() || newBdayNameAr.trim()}) with custom surprises.`,
      badgeAr: newBdayTier === 'vip' ? 'إصدار ملكي خاص' : newBdayTier === 'paid' ? 'قالب احترافي' : 'قالب مجاني',
      badgeEn: newBdayTier === 'vip' ? 'Royal VIP Edition' : newBdayTier === 'paid' ? 'Pro Template' : 'Free Template',
      tier: newBdayTier,
      priceIQD: newBdayTier === 'free' ? 0 : newBdayPriceIQD,
      thumbnailUrl: createArtisticSvgDataUri(
        newBdayThemeColor,
        '#1C0D12',
        newBdayAccentColor,
        'stage_curtain',
        (newBdayNameEn.trim() || 'MARASEEM VIP').toUpperCase()
      ),
      themeColors: {
        background: newBdayThemeColor,
        cardBg: '#3D1E24',
        primary: newBdayAccentColor,
        secondary: '#F5E6D3',
        textColor: '#FFFDF8',
        accentGlow: 'rgba(212,175,55,0.25)',
        border: 'rgba(212,175,55,0.35)',
      },
      defaultOpeningMechanic: 'envelope',
      defaultParticleEffect: 'hearts',
      defaultTransitionStyle: 'flip_3d',
      defaultMusicTrackId: 'bday_romantic',
      defaultTextStyle: baseTpl?.defaultTextStyle || {
        fontFamily: 'amiri',
        fontSize: 'lg',
        textAlign: 'center',
        textColor: '#FFFDF8',
      },
      defaultPages: baseTpl?.defaultPages || [],
      defaultGreetingData: baseTpl?.defaultGreetingData || {},
    };
    onAddBirthdayTemplate(created);
    setNewBdayNameAr('');
    setNewBdayNameEn('');
  };

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    onAddCoupon({
      code: newCode.trim().toUpperCase(),
      discountPercent: newPercent,
      description: newDesc.trim() || tr(`خصم خاص ${newPercent}%`, `Special ${newPercent}% Discount`),
      expiryDate: '2026-12-31',
      maxUses: 300,
      isActive: true,
    });
    setNewCode('');
    setNewDesc('');
  };

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#566B49] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Admin Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E9DDC9]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8CB] border border-[#B9CCA0] flex items-center justify-center text-[#566B49]">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#566B49]">
                  {tr('لوحة التحكم المركزية للإدارة', 'Central Executive Admin Console')}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#B9CCA0] text-[#566B49] font-bold">
                  {tr('صلاحية المدير العام', 'General Admin Access')}
                </span>
              </div>
              <p className="text-xs text-[#6E8261] mt-1">
                {tr(
                  'إدارة المستخدمين، الدعوات، المبيعات والأرباح، أسعار الباقات، كوبونات الخصم، الشركاء، القوالب، ومحتوى المنصة.',
                  'Manage users, invitations, sales & revenue, package pricing, discount coupons, partners, templates, and site content.'
                )}
              </p>
            </div>
          </div>

          {/* Role Switcher Simulator */}
          <div className="flex items-center gap-1.5 bg-[#FFFDF8] p-1.5 rounded-2xl border border-[#E9DDC9] flex-wrap shadow-xs">
            <span className="text-[11px] text-[#6E8261] px-2">
              {tr('معاينة صلاحيات النظام:', 'Preview System Roles:')}
            </span>
            {[
              { id: 'host', label: tr('صاحب المناسبة', 'Event Host') },
              { id: 'receptionist', label: tr('موظف الاستقبال', 'Receptionist') },
              { id: 'partner', label: tr('الشريك', 'Partner') },
              { id: 'admin', label: tr('المدير', 'Admin') },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSwitchRole(r.id as PlatformUserRole)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  r.id === 'admin'
                    ? 'bg-[#566B49] text-[#FFFDF8]'
                    : 'bg-[#F8F6EF] text-[#566B49] hover:bg-[#DCE8CB]/60 border border-[#E9DDC9]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Executive KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6E8261]">
              <span>{tr('إجمالي المبيعات والإيرادات', 'Total Revenue')}</span>
              <DollarSign size={16} className="text-[#91A77D]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#566B49] tabular-nums">
              {totalRevenueIQD.toLocaleString('en-US')}
            </div>
            <div className="text-[11px] text-[#91A77D]">{tr('دينار عراقي (مباشر + شركاء)', 'IQD (Direct + Partners)')}</div>
          </div>

          <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6E8261]">
              <span>{tr('الدعوات النشطة', 'Active Invitations')}</span>
              <FileText size={16} className="text-[#91A77D]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#566B49] tabular-nums">
              {invitations.length}
            </div>
            <div className="text-[11px] text-[#91A77D]">
              {tr(`بإجمالي ${totalViews} مشاهدة`, `${totalViews} total views`)}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6E8261]">
              <span>{tr('القوالب المتاحة بالمتجر', 'Available Templates')}</span>
              <LayoutGrid size={16} className="text-[#91A77D]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#566B49] tabular-nums">
              {templates.length}
            </div>
            <div className="text-[11px] text-[#91A77D]">{tr('مجانية واحترافية وملكية', 'Free, Pro & Royal VIP')}</div>
          </div>

          <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6E8261]">
              <span>{tr('الشركاء المعتمدون', 'Verified Partners')}</span>
              <Handshake size={16} className="text-[#91A77D]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#566B49] tabular-nums">
              {partners.length}
            </div>
            <div className="text-[11px] text-[#91A77D]">{tr('قاعات ومصورين ومنظمين', 'Halls, studios & planners')}</div>
          </div>

          <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6E8261]">
              <span>{tr('الكوبونات الفعالة', 'Active Coupons')}</span>
              <Tag size={16} className="text-[#91A77D]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#566B49] tabular-nums">
              {coupons.filter((c) => c.isActive).length}
            </div>
            <div className="text-[11px] text-[#91A77D]">
              {tr(`من أصل ${coupons.length} كوبون`, `Out of ${coupons.length} coupons`)}
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E9DDC9] pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: tr('نظرة عامة وإحصائيات الاستخدام', 'Overview & Usage Analytics') },
            { id: 'birthday_admin', label: tr('إدارة قسم تهنئة عيد الميلاد التفاعلية', 'Birthday Experience Admin') },
            { id: 'pricing_coupons', label: tr('تعديل أسعار الباقات وإدارة الكوبونات', 'Package Pricing & Coupons') },
            { id: 'invitations_templates', label: tr('إدارة الدعوات والقوالب', 'Manage Invitations & Templates') },
            { id: 'partners_users', label: tr('إدارة الشركاء والمستخدمين والصلاحيات', 'Partners, Users & Roles') },
            { id: 'reviews_content', label: tr('إدارة التقييمات ومحتوى الموقع', 'Reviews & Site Content') },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#B9CCA0] text-[#566B49] shadow-xs'
                  : 'text-[#6E8261] hover:text-[#566B49] bg-[#FFFDF8] border border-[#E9DDC9]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Birthday Experience Admin */}
        {activeTab === 'birthday_admin' && (
          <div className="space-y-6">
            {/* Birthday Experience KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#6E8261]">
                  <span>{tr('قوالب أعياد الميلاد التفاعلية', 'Birthday Templates')}</span>
                  <Cake size={15} className="text-[#91A77D]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#566B49]">
                  {birthdayTemplates.length}
                </div>
                <div className="text-[11px] text-[#91A77D]">
                  {tr('موزعة على ٨ تصنيفات إبداعية', 'Across 8 creative categories')}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#6E8261]">
                  <span>{tr('التهاني التفاعلية المنشأة', 'Created Greetings')}</span>
                  <Gift size={15} className="text-[#91A77D]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#566B49]">
                  {birthdayGreetings.length}
                </div>
                <div className="text-[11px] text-[#91A77D]">
                  {tr('روابط مستقلة جاهزة للمشاركة', 'Standalone shareable links')}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#6E8261]">
                  <span>{tr('إجمالي مشاهدات التهاني', 'Total Greeting Views')}</span>
                  <Eye size={15} className="text-[#91A77D]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#566B49]">
                  {totalBirthdayViews.toLocaleString('en-US')}
                </div>
                <div className="text-[11px] text-[#91A77D]">
                  {tr('تفاعل المستلمين مع القصص', 'Recipient story interactions')}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#6E8261]">
                  <span>{tr('إجمالي المشاركات عبر الروابط', 'Total Link Shares')}</span>
                  <Sparkles size={15} className="text-[#91A77D]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#566B49]">
                  {totalBirthdayShares.toLocaleString('en-US')}
                </div>
                <div className="text-[11px] text-[#91A77D]">
                  {tr('عبر واتساب وتيليجرام وإنستغرام', 'Via WhatsApp, Telegram & Instagram')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Add New Birthday Template Form */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-[#566B49] flex items-center gap-2">
                  <Plus size={18} className="text-[#91A77D]" />
                  <span>{tr('إضافة قالب عيد ميلاد تفاعلي جديد', 'Add New Interactive Birthday Template')}</span>
                </h3>

                <form onSubmit={handleAddBirthdayTemplateSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                      {tr('اسم القالب (بالعربية):', 'Template Name (Arabic):')}
                    </label>
                    <input
                      type="text"
                      required
                      value={newBdayNameAr}
                      onChange={(e) => setNewBdayNameAr(e.target.value)}
                      placeholder={tr('مثال: مفاجأة النجوم الوردية', 'e.g., Pink Starlight Surprise')}
                      className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-[#566B49]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                      {tr('اسم القالب (بالإنجليزية):', 'Template Name (English):')}
                    </label>
                    <input
                      type="text"
                      value={newBdayNameEn}
                      onChange={(e) => setNewBdayNameEn(e.target.value)}
                      placeholder="e.g., Pink Starlight Surprise"
                      className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-[#566B49]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                        {tr('تصنيف القالب:', 'Category:')}
                      </label>
                      <select
                        value={newBdayCategory}
                        onChange={(e) => setNewBdayCategory(e.target.value as BirthdayCategory)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-[#566B49] font-bold"
                      >
                        {BIRTHDAY_CATEGORIES_META.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {lang === 'ar' ? cat.nameAr : cat.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                        {tr('فئة القالب:', 'Tier:')}
                      </label>
                      <select
                        value={newBdayTier}
                        onChange={(e) => setNewBdayTier(e.target.value as 'free' | 'paid' | 'vip')}
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-[#566B49] font-bold"
                      >
                        <option value="free">{tr('مجاني', 'Free')}</option>
                        <option value="paid">{tr('احترافي مدفوع', 'Paid Pro')}</option>
                        <option value="vip">{tr('ملكي VIP', 'Royal VIP')}</option>
                      </select>
                    </div>
                  </div>

                  {newBdayTier !== 'free' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                        {tr('السعر (دينار عراقي):', 'Price (IQD):')}
                      </label>
                      <input
                        type="number"
                        step={5000}
                        min={0}
                        value={newBdayPriceIQD}
                        onChange={(e) => setNewBdayPriceIQD(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-[#566B49] font-mono font-bold"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                        {tr('لون خلفية القالب:', 'Theme Background:')}
                      </label>
                      <input
                        type="color"
                        value={newBdayThemeColor}
                        onChange={(e) => setNewBdayThemeColor(e.target.value)}
                        className="w-full h-9 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] p-1 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#6E8261] mb-1">
                        {tr('اللون المميز (Accent):', 'Accent Color:')}
                      </label>
                      <input
                        type="color"
                        value={newBdayAccentColor}
                        onChange={(e) => setNewBdayAccentColor(e.target.value)}
                        className="w-full h-9 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] p-1 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer transition-all"
                  >
                    {tr('+ إضافة القالب إلى مكتبة أعياد الميلاد', '+ Add Template to Birthday Library')}
                  </button>
                </form>

                {/* Licensed Music & Interactive Modules Status */}
                <div className="pt-4 border-t border-[#E9DDC9] space-y-2.5">
                  <div className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                    <Music size={14} className="text-[#91A77D]" />
                    <span>
                      {tr(
                        `مكتبة الموسيقى المرخصة والعناصر التفاعلية (${BIRTHDAY_MUSIC_LIBRARY.length} مقطوعات)`,
                        `Licensed Music & Interactive Modules (${BIRTHDAY_MUSIC_LIBRARY.length} Tracks)`
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between">
                      <span className="font-bold text-[#566B49] flex items-center gap-1">
                        <Lock size={12} className="text-[#91A77D]" />
                        {tr('رسالة سرية بكلمة مرور', 'Password Secret Msg')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                        {tr('مفعّل', 'Active')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between">
                      <span className="font-bold text-[#566B49] flex items-center gap-1">
                        <Sparkles size={12} className="text-[#91A77D]" />
                        {tr('بطاقة اكشط واكتشف', 'Scratch & Reveal')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                        {tr('مفعّل', 'Active')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between">
                      <span className="font-bold text-[#566B49] flex items-center gap-1">
                        <Gift size={12} className="text-[#91A77D]" />
                        {tr('صندوق الهدايا ثلاثي الأبعاد', '3D Digital Gift Box')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                        {tr('مفعّل', 'Active')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between">
                      <span className="font-bold text-[#566B49] flex items-center gap-1">
                        <Cake size={12} className="text-[#91A77D]" />
                        {tr('صندوق الذكريات والكيكة', 'Memory Box & Cake')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                        {tr('مفعّل', 'Active')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manage Existing Birthday Templates & Pricing */}
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
                  <h3 className="text-base font-bold text-[#566B49]">
                    {tr('إدارة قوالب تهنئة عيد الميلاد وتحديد الأسعار', 'Manage Birthday Templates & Pricing')} ({birthdayTemplates.length})
                  </h3>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {birthdayTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl shrink-0 border border-black/10"
                            style={{
                              background: `linear-gradient(135deg, ${tpl.themeColors.background}, ${tpl.themeColors.primary})`,
                            }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#566B49] truncate">
                              {lang === 'ar' ? tpl.nameAr : tpl.nameEn}
                            </div>
                            <div className="text-[11px] text-[#6E8261] truncate">
                              {lang === 'ar' ? tpl.badgeAr : tpl.badgeEn} • {tpl.category}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <select
                            value={tpl.tier}
                            onChange={(e) => {
                              const nextTier = e.target.value as 'free' | 'paid' | 'vip';
                              const nextPrice =
                                nextTier === 'free' ? 0 : tpl.priceIQD === 0 ? 25000 : tpl.priceIQD;
                              onUpdateBirthdayTemplate?.(
                                tpl.id,
                                nextTier,
                                nextPrice,
                                Math.round(nextPrice / 1300)
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] text-[11px] font-bold text-[#566B49]"
                          >
                            <option value="free">{tr('مجاني', 'Free')}</option>
                            <option value="paid">{tr('احترافي', 'Paid')}</option>
                            <option value="vip">{tr('ملكي VIP', 'VIP')}</option>
                          </select>

                          {tpl.tier !== 'free' && (
                            <input
                              type="number"
                              step={5000}
                              value={tpl.priceIQD}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value));
                                onUpdateBirthdayTemplate?.(
                                  tpl.id,
                                  tpl.tier,
                                  val,
                                  Math.round(val / 1300)
                                );
                              }}
                              className="w-24 px-2 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] text-xs font-mono font-bold text-[#566B49]"
                            />
                          )}

                          {birthdayTemplates.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteBirthdayTemplate?.(tpl.id)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 cursor-pointer"
                              title={tr('حذف القالب', 'Delete Template')}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Published Birthday Greetings List */}
                <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
                  <h3 className="text-base font-bold text-[#566B49]">
                    {tr('التهاني التفاعلية المنشورة والروابط الخاصة', 'Published Birthday Greetings & Links')} ({birthdayGreetings.length})
                  </h3>

                  <div className="space-y-2.5">
                    {birthdayGreetings.map((g) => (
                      <div
                        key={g.id}
                        className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#566B49] truncate">
                            {g.mainGreetingTitle} — {g.recipientName}
                          </div>
                          <div className="text-[11px] text-[#6E8261]">
                            {tr('المرسل:', 'From:')} {g.senderName} • {g.viewsCount} {tr('مشاهدة', 'views')} • {g.sharesCount} {tr('مشاركة', 'shares')}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onPreviewBirthdayGreeting?.(g)}
                            className="p-2 rounded-xl bg-[#DCE8CB] hover:bg-[#B9CCA0] text-[#566B49] cursor-pointer"
                            title={tr('معاينة التهنئة', 'Preview Greeting')}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteBirthdayGreeting?.(g.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 cursor-pointer"
                            title={tr('حذف التهنئة', 'Delete Greeting')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: Overview & Sales Breakdown */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-[#566B49] flex items-center gap-2">
                <TrendingUp size={18} className="text-[#91A77D]" />
                <span>{tr('تقرير الطلبات والمبيعات الأخيرة في العراق', 'Recent Orders & Sales Report in Iraq')}</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#F8F6EF] text-[#6E8261] border-b border-[#E9DDC9]">
                    <tr>
                      <th className="py-3 px-4">{tr('المناسبة / العميل', 'Event / Client')}</th>
                      <th className="py-3 px-4">{tr('المدينة', 'City')}</th>
                      <th className="py-3 px-4">{tr('المشاهدات', 'Views')}</th>
                      <th className="py-3 px-4">{tr('الباقة', 'Package')}</th>
                      <th className="py-3 px-4">{tr('إجراء', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9DDC9]">
                    {invitations.slice(0, 8).map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F8F6EF]">
                        <td className="py-3 px-4 font-bold text-[#566B49]">{inv.title}</td>
                        <td className="py-3 px-4 text-[#6E8261]">{inv.city}</td>
                        <td className="py-3 px-4 font-mono text-[#566B49]">{inv.viewCount}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] text-[10px] font-bold">
                            {tr('باقة ملكية', 'Royal VIP')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => onPreviewInvitation(inv)}
                            className="text-[#566B49] font-bold hover:underline cursor-pointer"
                          >
                            {tr('معاينة', 'Preview')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Roles & Permissions Matrix */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-[#566B49] flex items-center gap-2">
                <Users size={18} className="text-[#91A77D]" />
                <span>{tr('مصفوفة صلاحيات المستخدمين', 'User Roles & Permissions Matrix')}</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                {[
                  {
                    role: tr('١. صاحب المناسبة', '1. Event Host'),
                    desc: tr(
                      'إنشاء وتعديل الدعوات، تقسيم العوائل العراقية، تحديد المقاعد، وإرسال تذكيرات واتساب.',
                      'Create & edit invitations, organize Iraqi family groups, assign seats, and send WhatsApp reminders.'
                    ),
                    actionRole: 'host' as PlatformUserRole,
                  },
                  {
                    role: tr('٢. الضيف', '2. Guest'),
                    desc: tr(
                      'فتح الرابط الشخصي المستقل، تأكيد الحضور وإضافة المرافقين ضمن الحد المسموح، ومشاركة الذكريات.',
                      'Open dedicated personal link, confirm RSVP & companions within limit, and share memories.'
                    ),
                    actionRole: 'guest' as PlatformUserRole,
                  },
                  {
                    role: tr('٣. موظف الاستقبال', '3. Receptionist'),
                    desc: tr(
                      'واجهة معزولة للهاتف لمسح رمز الدخول، البحث عن اسم الضيف، ومعرفة رقم الطاولة وتسجيل الدخول الفعلي.',
                      'Isolated mobile screen to scan QR passes, search guests, view table numbers, and record live check-in.'
                    ),
                    actionRole: 'receptionist' as PlatformUserRole,
                  },
                  {
                    role: tr('٤. الشريك', '4. Partner'),
                    desc: tr(
                      'لوحة خاصة لقاعات الأعراس والمصورين ومنظمي الحفلات لمتابعة رابط الإحالة والعمولات.',
                      'Dedicated portal for wedding halls, photographers, and planners to track referrals and commissions.'
                    ),
                    actionRole: 'partner' as PlatformUserRole,
                  },
                  {
                    role: tr('٥. المدير العام', '5. General Admin'),
                    desc: tr(
                      'تحكم كامل بالأسعار، الباقات، الكوبونات، القوالب، الشركاء، والتقارير المالية.',
                      'Full control over pricing, packages, coupons, templates, partners, and financial reports.'
                    ),
                    actionRole: 'admin' as PlatformUserRole,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-[#566B49]">{item.role}</div>
                      <p className="text-[11px] text-[#6E8261] mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSwitchRole(item.actionRole)}
                      className="px-3 py-1.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-[11px] font-bold shrink-0 cursor-pointer transition-all"
                    >
                      {tr('تفعيل الواجهة', 'Switch View')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Live Package Prices Editor & Coupons Manager */}
        {activeTab === 'pricing_coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Package Prices Editor */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-[#566B49] flex items-center gap-2">
                <DollarSign size={18} className="text-[#91A77D]" />
                <span>{tr('تعديل أسعار الباقات والاشتراكات (تحديث فوري في الموقع)', 'Edit Package Prices (Instant Live Site Update)')}</span>
              </h3>

              <div className="space-y-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#566B49]">{pkg.name}</div>
                      <div className="text-[11px] text-[#6E8261]">
                        {tr('الحد الأقصى:', 'Max Guests:')} {pkg.maxGuests} {tr('ضيف/عائلة', 'guests/families')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div>
                        <label className="block text-[10px] text-[#6E8261]">{tr('السعر (د.ع)', 'Price (IQD)')}</label>
                        <input
                          type="number"
                          step={5000}
                          value={pkg.priceIQD}
                          onChange={(e) =>
                            onUpdatePackagePrice(
                              pkg.id,
                              Math.max(0, Number(e.target.value)),
                              pkg.priceUSD
                            )
                          }
                          className="w-28 px-2.5 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] text-xs font-mono font-bold text-[#566B49]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#6E8261]">{tr('السعر ($)', 'Price (USD)')}</label>
                        <input
                          type="number"
                          value={pkg.priceUSD}
                          onChange={(e) =>
                            onUpdatePackagePrice(
                              pkg.id,
                              pkg.priceIQD,
                              Math.max(0, Number(e.target.value))
                            )
                          }
                          className="w-20 px-2.5 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] text-xs font-mono font-bold text-[#566B49]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Coupons Manager */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-[#566B49] flex items-center gap-2">
                <Tag size={18} className="text-[#91A77D]" />
                <span>{tr('إدارة كوبونات الخصم والعروض الموسمية', 'Manage Discount Coupons & Seasonal Offers')}</span>
              </h3>

              <form onSubmit={handleAddCouponSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder={tr('كود الكوبون (مثال: EID30)', 'Coupon Code (e.g., EID30)')}
                  className="px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] font-mono uppercase"
                />
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={newPercent}
                  onChange={(e) => setNewPercent(Number(e.target.value))}
                  placeholder={tr('نسبة الخصم %', 'Discount %')}
                  className="px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] font-mono font-bold"
                />
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer transition-all"
                >
                  {tr('+ إنشاء كوبون خصم', '+ Create Coupon')}
                </button>
              </form>

              <div className="space-y-2.5">
                {coupons.map((cp) => (
                  <div
                    key={cp.id}
                    className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#566B49]">
                          {cp.code}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                          {tr(`خصم ${cp.discountPercent}%`, `${cp.discountPercent}% OFF`)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6E8261] mt-0.5">{cp.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleCoupon(cp.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          cp.isActive
                            ? 'bg-[#DCE8CB] text-[#566B49]'
                            : 'bg-[#E9DDC9] text-[#6E8261]'
                        }`}
                      >
                        {cp.isActive ? tr('فعّال ✓', 'Active ✓') : tr('متوقف', 'Paused')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCoupon(cp.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Manage Invitations & Templates */}
        {activeTab === 'invitations_templates' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-[#566B49]">
                {tr('جميع الدعوات المنشورة في المنصة', 'All Published Invitations on Platform')} ({invitations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#566B49] truncate">{inv.title}</div>
                      <div className="text-[11px] text-[#6E8261] truncate">
                        {inv.venueName} • {inv.eventDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onPreviewInvitation(inv)}
                        className="p-2 rounded-xl bg-[#DCE8CB] hover:bg-[#B9CCA0] text-[#566B49] cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteInvitation(inv.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Partners & Users */}
        {activeTab === 'partners_users' && (
          <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#566B49]">
              {tr('إدارة حسابات الشركاء والعمولات', 'Manage Partner Accounts & Commissions')} ({partners.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-[#F8F6EF] text-[#6E8261] border-b border-[#E9DDC9]">
                  <tr>
                    <th className="py-3 px-4">{tr('اسم الجهة الشريكة', 'Partner Business')}</th>
                    <th className="py-3 px-4">{tr('المدير المسؤول', 'Contact Person')}</th>
                    <th className="py-3 px-4">{tr('المحافظة', 'City')}</th>
                    <th className="py-3 px-4">{tr('كود الإحالة', 'Referral Code')}</th>
                    <th className="py-3 px-4">{tr('نسبة العمولة', 'Commission %')}</th>
                    <th className="py-3 px-4">{tr('إجمالي المبيعات', 'Total Sales')}</th>
                    <th className="py-3 px-4">{tr('إجمالي العمولة', 'Total Commission')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDC9]">
                  {partners.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-bold text-[#566B49]">{p.businessName}</td>
                      <td className="py-3 px-4 text-[#6E8261]">{p.name}</td>
                      <td className="py-3 px-4 text-[#6E8261]">{p.city}</td>
                      <td className="py-3 px-4 font-mono text-[#566B49] font-bold">{p.referralCode}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#566B49]">
                        {p.commissionRatePercent}%
                      </td>
                      <td className="py-3 px-4 font-mono text-[#566B49]">
                        {p.totalSalesIQD.toLocaleString('en-US')} {tr('د.ع', 'IQD')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#566B49]">
                        {p.totalCommissionIQD.toLocaleString('en-US')} {tr('د.ع', 'IQD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Reviews & Content Management */}
        {activeTab === 'reviews_content' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-[#566B49] flex items-center gap-2">
                <Settings size={18} className="text-[#91A77D]" />
                <span>{tr('إدارة محتوى الموقع والشعار التسويقي', 'Manage Site Content & Marketing Slogan')}</span>
              </h3>
              <div className="space-y-3">
                <label className="block text-xs text-[#6E8261] font-bold">
                  {tr('الشعار التسويقي الرئيسي للمنصة:', 'Main Platform Tagline:')}
                </label>
                <input
                  type="text"
                  value={sloganDraft}
                  onChange={(e) => setSloganDraft(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                />
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSlogan(sloganDraft);
                    setSavedSloganNotice(true);
                    setTimeout(() => setSavedSloganNotice(false), 2500);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer transition-all"
                >
                  {savedSloganNotice
                    ? tr('تم تحديث الشعار في الموقع ✓', 'Tagline Updated ✓')
                    : tr('حفظ وتحديث محتوى الموقع', 'Save & Update Site Content')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-[#566B49] flex items-center gap-2">
                <Star size={18} className="text-[#91A77D]" />
                <span>{tr('إدارة تقييمات وآراء العملاء', 'Manage Customer Reviews')} ({reviews.length})</span>
              </h3>
              <div className="space-y-2.5">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#566B49]">
                        {rev.clientName} ({rev.city})
                      </div>
                      <p className="text-[11px] text-[#6E8261] mt-0.5">«{rev.comment}»</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteReview(rev.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-500/10 cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
