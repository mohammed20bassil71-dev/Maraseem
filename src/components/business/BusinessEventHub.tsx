import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Share2,
  Palette,
  RefreshCw,
  Briefcase,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  BusinessSector,
  BusinessServiceItem,
  InvitationData,
} from '../../types/invitation';
import { BUSINESS_SECTORS_META } from '../../data/platformData';
import { buildShareableInvitationUrl } from '../../utils/shareLink';
import { useLanguage } from '../../i18n/LanguageContext';

const SECTOR_TRANSLATIONS_EN: Record<string, { name: string; badge: string }> = {
  restaurant_cafe: { name: 'Restaurants & Cafes', badge: 'Hospitality' },
  company_launch: { name: 'Companies & Offices', badge: 'Corporate' },
  corporate_office: { name: 'Companies & Offices', badge: 'Corporate' },
  medical_clinic: { name: 'Medical & Dental Clinics', badge: 'Healthcare' },
  pharmacy: { name: 'Pharmacies & Labs', badge: 'Pharmacy' },
  flower_shop: { name: 'Flower & Gift Boutiques', badge: 'Floristry' },
  flower_gift: { name: 'Flower & Gift Boutiques', badge: 'Floristry' },
  clothing_store: { name: 'Fashion & Perfumes', badge: 'Boutique' },
  fashion_store: { name: 'Fashion & Perfumes', badge: 'Boutique' },
  beauty_center: { name: 'Beauty & Spa Centers', badge: 'Beauty' },
  real_estate: { name: 'Real Estate & Engineering', badge: 'Real Estate' },
  tech_company: { name: 'Tech & Training Centers', badge: 'Academy' },
  tech_academy: { name: 'Tech & Training Centers', badge: 'Academy' },
  education_center: { name: 'Educational & Training Centers', badge: 'Education' },
};

interface BusinessEventHubProps {
  onPublishBusinessInvite: (invitation: InvitationData) => void;
  onEditInStudio: (invitation: InvitationData) => void;
}

export const BusinessEventHub: React.FC<BusinessEventHubProps> = ({
  onPublishBusinessInvite,
  onEditInStudio,
}) => {
  const { lang, tr } = useLanguage();
  const [selectedSector, setSelectedSector] = useState<BusinessSector>('restaurant_cafe');
  const sectorMeta =
    BUSINESS_SECTORS_META.find((s) => s.id === selectedSector) || BUSINESS_SECTORS_META[0];

  const [businessName, setBusinessName] = useState(sectorMeta.defaultBusinessName);
  const [city, setCity] = useState(sectorMeta.defaultCity);
  const [venueAddress, setVenueAddress] = useState(sectorMeta.defaultVenue);
  const [openingDate, setOpeningDate] = useState('2026-11-15');
  const [openingTime, setOpeningTime] = useState('07:00 PM');
  const [brandPrimaryColor, setBrandPrimaryColor] = useState(sectorMeta.accentColor);
  const [brandSecondaryColor, setBrandSecondaryColor] = useState(sectorMeta.secondaryColor);
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(sectorMeta.defaultCoverImage);
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://maps.google.com/?q=Baghdad');
  const [workingHours, setWorkingHours] = useState(sectorMeta.defaultWorkingHours);
  const [instagramHandle, setInstagramHandle] = useState(sectorMeta.defaultInstagram);
  const [welcomeQuote, setWelcomeQuote] = useState(sectorMeta.defaultWelcomeQuote);
  const [invitationBody, setInvitationBody] = useState(sectorMeta.defaultBody);
  const [services, setServices] = useState<BusinessServiceItem[]>(sectorMeta.defaultServices);

  // New Service Item Inputs
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');

  // Mode Toggle: Opening Invitation vs Permanent Business Profile Page
  const [isPermanentProfileMode, setIsPermanentProfileMode] = useState(false);

  // Live VIP RSVP inside Business Page Preview
  const [vipGuestName, setVipGuestName] = useState('');
  const [vipGuestCompany, setVipGuestCompany] = useState('');
  const [vipRsvpConfirmed, setVipRsvpConfirmed] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleSectorChange = (sectorId: BusinessSector) => {
    setSelectedSector(sectorId);
    const meta =
      BUSINESS_SECTORS_META.find((s) => s.id === sectorId) || BUSINESS_SECTORS_META[0];
    setBusinessName(meta.defaultBusinessName);
    setCity(meta.defaultCity);
    setVenueAddress(meta.defaultVenue);
    setBrandPrimaryColor(meta.accentColor);
    setBrandSecondaryColor(meta.secondaryColor);
    setCoverImageUrl(meta.defaultCoverImage);
    setWorkingHours(meta.defaultWorkingHours);
    setInstagramHandle(meta.defaultInstagram);
    setWelcomeQuote(meta.defaultWelcomeQuote);
    setInvitationBody(meta.defaultBody);
    setServices(meta.defaultServices);
    setVipRsvpConfirmed(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setCompanyLogoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setCoverImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName.trim()) return;
    setServices((prev) => [
      ...prev,
      {
        id: `srv-${Date.now()}`,
        name: newSrvName.trim(),
        description:
          newSrvDesc.trim() || tr('خدمة مميزة لعملائنا الكرام', 'Featured service for our clients'),
        priceOrTag: newSrvPrice.trim() || tr('متوفر', 'Available'),
      },
    ]);
    setNewSrvName('');
    setNewSrvDesc('');
    setNewSrvPrice('');
  };

  const buildInvitationObject = (): InvitationData => ({
    id: `biz-${selectedSector}-${Date.now()}`,
    slug: `opening-${selectedSector}`,
    templateId: 'tpl-business-grand',
    category: 'business_opening',
    title: isPermanentProfileMode
      ? `${businessName} - ${tr('الصفحة الرسمية', 'Official Page')}`
      : `${tr('حفل افتتاح', 'Grand Opening of')} ${businessName}`,
    businessName,
    businessType: sectorMeta.name,
    businessSector: selectedSector,
    companyLogo: companyLogoUrl,
    businessServices: services,
    introVideoUrl,
    isPermanentBusinessPage: isPermanentProfileMode,
    businessWorkingHours: workingHours,
    businessInstagram: instagramHandle,
    eventDate: openingDate,
    eventTime: openingTime,
    venueName: venueAddress,
    city,
    addressDetails: venueAddress,
    googleMapsUrl,
    welcomeQuote,
    invitationBody,
    coverImage: coverImageUrl,
    galleryImages: [coverImageUrl],
    backgroundVideoUrl: introVideoUrl || undefined,
    musicTrack: 'calm_acoustic',
    visualEffect: 'golden_sparkles',
    pageTransitionMode: '3d-flip',
    customPrimaryColor: brandPrimaryColor,
    customSecondaryColor: brandSecondaryColor,
    rsvpEnabled: true,
    maxGuestsPerInvite: 4,
    guestbookEnabled: true,
    viewCount: 1,
    createdAt: new Date().toISOString(),
  });

  const handleCopyShareLink = () => {
    const inv = buildInvitationObject();
    const url = buildShareableInvitationUrl(inv);
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const getSectorName = (sec: (typeof BUSINESS_SECTORS_META)[number]) =>
    lang === 'ar' ? sec.name : SECTOR_TRANSLATIONS_EN[sec.id]?.name || sec.name;

  const getSectorBadge = (sec: (typeof BUSINESS_SECTORS_META)[number]) =>
    lang === 'ar' ? sec.badge : SECTOR_TRANSLATIONS_EN[sec.id]?.badge || sec.badge;

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#566B49] font-cairo py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E9DDC9]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#DCE8CB] text-[#566B49] border border-[#B9CCA0] text-xs font-bold">
                {tr('صفحات افتتاح الشركات والمشاريع', 'Business Event & Profile Pages')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#566B49]">
                {tr(
                  'دعوات افتتاح المشاريع والشركات والصفحات التعريفية الدائمة',
                  'Corporate Grand Openings & Permanent Business Pages'
                )}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#566B49]/80 mt-1.5">
              {tr(
                'صمم دعوة افتتاح احترافية تتكيف مع مجال نشاطك التجاري وهويتك البصرية، ثم حوّل نفس الرابط بعد الافتتاح إلى صفحة تعريفية دائمة لشركتك وخدماتك.',
                'Design a tailored grand opening invitation matching your brand colors, then convert the exact same link into a permanent business profile page after the event.'
              )}
            </p>
          </div>

          {/* Mode Switcher: Opening Event vs Permanent Business Page */}
          <div className="flex items-center gap-2 bg-[#FFFDF8] p-1.5 rounded-2xl border border-[#E9DDC9] self-start shadow-xs">
            <button
              type="button"
              onClick={() => setIsPermanentProfileMode(false)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isPermanentProfileMode
                  ? 'bg-[#B9CCA0] text-[#566B49] border border-[#91A77D]'
                  : 'text-[#566B49]/75 hover:text-[#566B49]'
              }`}
            >
              {tr('وضع دعوة حفل الافتتاح', 'Grand Opening Invitation Mode')}
            </button>
            <button
              type="button"
              onClick={() => setIsPermanentProfileMode(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isPermanentProfileMode
                  ? 'bg-[#566B49] text-[#FFFDF8]'
                  : 'text-[#566B49]/75 hover:text-[#566B49]'
              }`}
            >
              <RefreshCw size={13} />
              <span>
                {tr('تحويل لصفحة تعريفية دائمة للشركة', 'Convert to Permanent Business Page')}
              </span>
            </button>
          </div>
        </div>

        {/* 9 Commercial Sectors Selector */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#566B49]">
            {tr(
              '١. اختر مجال النشاط التجاري (تتكيف الهوية والخدمات تلقائياً مع مجالك):',
              '1. Select Business Sector (Brand palette and services adapt automatically):'
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
            {BUSINESS_SECTORS_META.map((sec) => {
              const isSelected = sec.id === selectedSector;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSectorChange(sec.id)}
                  className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#DCE8CB] border-[#566B49] shadow-xs'
                      : 'bg-[#FFFDF8] border-[#E9DDC9] hover:border-[#B9CCA0]'
                  }`}
                >
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold self-start"
                    style={{
                      backgroundColor: `${sec.accentColor}25`,
                      color: '#566B49',
                    }}
                  >
                    {getSectorBadge(sec)}
                  </span>
                  <div className="text-xs font-bold text-[#566B49] leading-snug">
                    {getSectorName(sec)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-Column Workspace: Customizer Controls + Interactive Live Business Page */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Business Customizer Controls */}
          <div className="lg:col-span-5 space-y-5 bg-[#FFFDF8] p-6 rounded-3xl border border-[#E9DDC9] shadow-xs">
            <h2 className="text-base font-bold text-[#566B49] flex items-center gap-2 border-b border-[#E9DDC9] pb-3">
              <Briefcase size={18} className="text-[#91A77D]" />
              <span>
                {tr(
                  'تخصيص الهوية التجارية ومعلومات الافتتاح',
                  'Customize Brand Identity & Opening Details'
                )}
              </span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#566B49] font-bold mb-1">
                  {tr('اسم الشركة / المشروع التجاري:', 'Company / Business Name:')}
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] focus:border-[#91A77D] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#566B49] font-bold mb-1">
                    {tr('تاريخ الافتتاح:', 'Opening Date:')}
                  </label>
                  <input
                    type="date"
                    value={openingDate}
                    onChange={(e) => setOpeningDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#566B49] font-bold mb-1">
                    {tr('وقت الافتتاح:', 'Opening Time:')}
                  </label>
                  <input
                    type="text"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#566B49] font-bold mb-1">
                    {tr('المدينة / المحافظة:', 'City / Province:')}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#566B49] font-bold mb-1">
                    {tr('العنوان التفصيلي:', 'Detailed Address:')}
                  </label>
                  <input
                    type="text"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                  />
                </div>
              </div>

              {/* Brand Colors */}
              <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-2">
                <div className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                  <Palette size={14} className="text-[#91A77D]" />
                  <span>{tr('ألوان الهوية التجارية:', 'Brand Identity Colors:')}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs text-[#566B49] font-semibold">
                    <input
                      type="color"
                      value={brandPrimaryColor}
                      onChange={(e) => setBrandPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span>{tr('اللون الأساسي', 'Primary Color')}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#566B49] font-semibold">
                    <input
                      type="color"
                      value={brandSecondaryColor}
                      onChange={(e) => setBrandSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span>{tr('اللون الثانوي', 'Secondary Color')}</span>
                  </label>
                </div>
              </div>

              {/* Upload Company Logo & Cover Photo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#566B49]">
                    {tr('رفع شعار الشركة:', 'Upload Brand Logo:')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-[10px] file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-[#B9CCA0] file:text-[#566B49] file:font-bold"
                  />
                </div>
                <div className="p-3 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#566B49]">
                    {tr('رفع صورة المشروع:', 'Upload Cover Photo:')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="w-full text-[10px] file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-[#DCE8CB] file:text-[#566B49] file:font-bold"
                  />
                </div>
              </div>

              {/* Intro Video & Map URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#566B49] mb-1">
                    {tr('رابط فيديو تعريفي:', 'Intro Video URL:')}
                  </label>
                  <input
                    type="url"
                    value={introVideoUrl}
                    onChange={(e) => setIntroVideoUrl(e.target.value)}
                    placeholder="https://.../intro.mp4"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] dir-ltr"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#566B49] mb-1">
                    {tr('الموقع على الخريطة:', 'Map Location URL:')}
                  </label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] dir-ltr"
                  />
                </div>
              </div>

              {/* Add Service / Product */}
              <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-2.5">
                <div className="text-xs font-bold text-[#566B49]">
                  {tr(
                    `إضافة خدمة أو منتج لعرضه في الصفحة (${services.length}):`,
                    `Add Service or Product to Showcase (${services.length}):`
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newSrvName}
                    onChange={(e) => setNewSrvName(e.target.value)}
                    placeholder={tr('اسم الخدمة أو المنتج', 'Service or product name')}
                    className="px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49]"
                  />
                  <input
                    type="text"
                    value={newSrvPrice}
                    onChange={(e) => setNewSrvPrice(e.target.value)}
                    placeholder={tr('السعر أو الميزة (خصم ٢٠٪)', 'Price or tag (20% Off)')}
                    className="px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49]"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSrvDesc}
                    onChange={(e) => setNewSrvDesc(e.target.value)}
                    placeholder={tr('وصف مختصر للخدمة...', 'Brief description...')}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49]"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-1.5 rounded-lg bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer shrink-0 transition-all"
                  >
                    {tr('+ إضافة', '+ Add')}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => onPublishBusinessInvite(buildInvitationObject())}
                  className="flex-1 py-3 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] border border-[#91A77D] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles size={15} />
                  <span>{tr('اعتماد ونشر صفحة المشروع الآن', 'Publish Business Page Now')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEditInStudio(buildInvitationObject())}
                  className="px-4 py-3 rounded-xl bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] font-bold text-xs cursor-pointer transition-all"
                >
                  {tr('فتح بالمحرر المتقدم', 'Open in Full Studio')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Business Event / Permanent Profile Preview (Isolated so it preserves custom brand colors!) */}
          <div className="lg:col-span-7">
            <div
              className={`invitation-isolated rounded-3xl border border-white/15 bg-gradient-to-b ${sectorMeta.bgGradient} overflow-hidden shadow-2xl`}
            >
              {/* Preview Top Bar */}
              <div className="px-6 py-3.5 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{ backgroundColor: brandPrimaryColor }}
                  />
                  <span className="text-xs font-bold text-white">
                    {isPermanentProfileMode
                      ? tr(
                          'معاينة حية: الصفحة التعريفية الدائمة للشركة (بعد الافتتاح)',
                          'Live Preview: Permanent Business Profile Page'
                        )
                      : tr(
                          'معاينة حية: بطاقة دعوة حفل الافتتاح الرسمي',
                          'Live Preview: Official Grand Opening Invitation'
                        )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedUrl ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Share2 size={13} />
                  )}
                  <span>
                    {copiedUrl
                      ? tr('تم نسخ الرابط المستقل ✓', 'Standalone Link Copied ✓')
                      : tr('نسخ رابط الدعوة', 'Copy Invitation Link')}
                  </span>
                </button>
              </div>

              {/* Hero Cover & Brand Logo */}
              <div className="relative h-64 sm:h-72 overflow-hidden">
                {introVideoUrl ? (
                  <video
                    src={introVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={coverImageUrl}
                    alt={businessName}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute bottom-5 right-6 left-6 flex items-end justify-between gap-4">
                  <div className="space-y-1.5">
                    <span
                      className="inline-block text-[11px] px-3 py-0.5 rounded-full font-bold"
                      style={{
                        backgroundColor: brandPrimaryColor,
                        color: '#0D1510',
                      }}
                    >
                      {isPermanentProfileMode
                        ? `${getSectorName(sectorMeta)} • ${tr('الصفحة الرسمية الدائمة', 'Official Profile')}`
                        : `${tr('دعوة افتتاح رسمي', 'Grand Opening')} • ${getSectorName(sectorMeta)}`}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{businessName}</h2>
                    <p className="text-xs text-neutral-300 flex items-center gap-1.5">
                      <MapPin size={13} style={{ color: brandPrimaryColor }} />
                      <span>
                        {venueAddress} — {city}
                      </span>
                    </p>
                  </div>

                  {/* Company Logo Badge */}
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-950/90 border-2 flex items-center justify-center overflow-hidden shrink-0 shadow-xl"
                    style={{ borderColor: brandPrimaryColor }}
                  >
                    {companyLogoUrl ? (
                      <img src={companyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span
                        className="text-[10px] font-bold text-center px-1 font-mono"
                        style={{ color: brandPrimaryColor }}
                      >
                        {sectorMeta.defaultLogoText}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Welcome Quote & Description */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                  <p
                    className="text-base sm:text-lg font-bold font-amiri"
                    style={{ color: brandPrimaryColor }}
                  >
                    {welcomeQuote}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {isPermanentProfileMode
                      ? tr(
                          `أهلاً بكم في الصفحة الرسمية الدائمة لـ (${businessName}). تصفحوا قائمة خدماتنا ومنتجاتنا الحصرية وأوقات العمل وموقعنا على الخريطة.`,
                          `Welcome to the official permanent profile of (${businessName}). Browse our featured services, working hours, and map location.`
                        )
                      : invitationBody}
                  </p>
                </div>

                {/* Event Date/Time OR Permanent Working Hours */}
                {!isPermanentProfileMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
                      <Calendar size={20} style={{ color: brandPrimaryColor }} />
                      <div>
                        <div className="text-[10px] text-neutral-400">
                          {tr('تاريخ الافتتاح', 'Opening Date')}
                        </div>
                        <div className="text-xs font-bold font-mono text-white">{openingDate}</div>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
                      <Clock size={20} style={{ color: brandPrimaryColor }} />
                      <div>
                        <div className="text-[10px] text-neutral-400">
                          {tr('ساعة قص الشريط', 'Ribbon Cutting')}
                        </div>
                        <div className="text-xs font-bold font-mono text-white">{openingTime}</div>
                      </div>
                    </div>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/15 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={18} style={{ color: brandPrimaryColor }} />
                        <span className="text-xs font-bold text-white">
                          {tr('الموقع على الخريطة', 'Map Location')}
                        </span>
                      </div>
                      <ExternalLink size={14} className="text-neutral-400" />
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="text-[11px] text-neutral-400">
                        {tr('أوقات الدوام الرسمي', 'Official Working Hours')}
                      </div>
                      <div className="text-xs font-bold text-white">{workingHours}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="text-[11px] text-neutral-400">
                        {tr('الحساب الرسمي والموقع', 'Official Account & Map')}
                      </div>
                      <div className="text-xs font-bold font-mono text-amber-300 flex items-center justify-between">
                        <span>{instagramHandle}</span>
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-white"
                        >
                          {tr('فتح الخريطة ↗', 'Open Map ↗')}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Services & Products Showcase */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      {tr('أبرز الخدمات والمنتجات المقدمة:', 'Featured Services & Products:')}
                    </h3>
                    <span className="text-[11px] text-neutral-400">
                      {services.length} {tr('خدمات مميزة', 'featured items')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-2"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-white">{srv.name}</div>
                          <p className="text-[11px] text-neutral-400 leading-relaxed">
                            {srv.description}
                          </p>
                        </div>
                        {srv.priceOrTag && (
                          <span
                            className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg self-start"
                            style={{
                              backgroundColor: `${brandPrimaryColor}20`,
                              color: brandPrimaryColor,
                            }}
                          >
                            {srv.priceOrTag}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* VIP Attendance Confirmation Box */}
                <div className="p-5 rounded-2xl bg-black/45 border border-white/15 space-y-3">
                  <h4 className="text-sm font-bold text-white">
                    {isPermanentProfileMode
                      ? tr('طلب حجز موعد أو استفسار مباشر', 'Request Appointment or Inquiry')
                      : tr('تأكيد حضور حفل الافتتاح الرسمي', 'Confirm Grand Opening Attendance')}
                  </h4>

                  {vipRsvpConfirmed ? (
                    <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      <span>
                        {tr(
                          `تم تسجيل تأكيد حضوركم (${vipGuestName}) بنجاح! نتشرف بلقائكم في حفل الافتتاح.`,
                          `Your attendance (${vipGuestName}) has been confirmed! We look forward to welcoming you.`
                        )}
                      </span>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!vipGuestName.trim()) return;
                        setVipRsvpConfirmed(true);
                      }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                    >
                      <input
                        type="text"
                        required
                        value={vipGuestName}
                        onChange={(e) => setVipGuestName(e.target.value)}
                        placeholder={tr('الاسم الكريم...', 'Your Full Name...')}
                        className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={vipGuestCompany}
                        onChange={(e) => setVipGuestCompany(e.target.value)}
                        placeholder={tr(
                          'الصفة أو جهة العمل (اختياري)...',
                          'Title or Company (optional)...'
                        )}
                        className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="py-2 px-4 rounded-xl font-bold text-xs text-neutral-950 cursor-pointer shadow"
                        style={{ backgroundColor: brandPrimaryColor }}
                      >
                        {isPermanentProfileMode
                          ? tr('إرسال طلب الحجز', 'Submit Request')
                          : tr('تأكيد حضور الافتتاح ✓', 'Confirm Attendance ✓')}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
