import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Tag,
  Send,
  Star,
  Gift,
  Smartphone,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import {
  CustomerReview,
  DiscountCoupon,
  InvitationData,
  PricingPackage,
} from '../../types/invitation';
import { buildPersonalizedGuestUrl } from '../../utils/shareLink';
import { useLanguage } from '../../i18n/LanguageContext';

interface PricingAndMarketingViewProps {
  packages: PricingPackage[];
  coupons: DiscountCoupon[];
  reviews: CustomerReview[];
  sampleInvitation: InvitationData;
  onSelectPackage: (pkg: PricingPackage) => void;
  onPreviewTestInvitation: (guestName: string, seats: number) => void;
  onAddReview?: (review: Omit<CustomerReview, 'id' | 'date' | 'isFeatured'>) => void;
}

const PACKAGE_TRANSLATIONS_EN: Record<
  string,
  {
    name: string;
    subtitle: string;
    billingPeriod: string;
    badge?: string;
    features: string[];
  }
> = {
  free_preview: {
    name: 'Free Preview Package',
    subtitle: 'Instant live trial of all interactive templates and editor tools',
    billingPeriod: '100% Free Forever',
    badge: 'Instant Preview',
    features: [
      'Live preview of all occasion & graduation project templates',
      'Full interactive invitation editor & live mobile/desktop view',
      'Direct shareable link with event countdown timer',
      'Up to 50 guest invitations & RSVP confirmations',
      'Export front invitation card as high-res PNG image',
    ],
  },
  basic: {
    name: 'Classic Package',
    subtitle: 'Ideal for family gatherings, birthdays, graduations, and thesis defenses',
    billingPeriod: 'One-time per occasion',
    badge: 'Classic',
    features: [
      'Choose any interactive template from standard collection',
      'Direct shareable link with event countdown timer',
      'Venue map link (Google Maps & Waze) + Add to Calendar',
      'Up to 150 guest invitations & RSVP confirmations',
      'Guestbook for family wishes and blessings',
    ],
  },
  pro: {
    name: 'Premium Package',
    subtitle: 'Most popular for engagements, weddings, and Iraqi Henna nights',
    billingPeriod: 'One-time per occasion',
    badge: 'Most Popular',
    features: [
      'Access to all premium & Atelier interactive templates',
      'Personal links with each guest or family name',
      'Iraqi family grouping & seat allocation per family',
      'Custom background music or video upload + password protection',
      'WhatsApp automated reminder messages & CSV export',
      'Up to 400 guest/family invitations',
    ],
  },
  vip: {
    name: 'Royal Package',
    subtitle: 'Complete luxury experience with reception QR check-in and memory album',
    billingPeriod: 'Full event lifecycle',
    badge: 'Royal Experience',
    features: [
      'All Premium features + up to 1,000 guests',
      'Dedicated Receptionist QR Scanner mobile interface',
      'Table seating chart & automatic table number on QR scan',
      'Smart AI Design Assistant custom styling',
      'Post-event Wedding Memories photo & video album',
    ],
  },
  custom_bespoke: {
    name: 'Bespoke Custom Design',
    subtitle: 'Tailor-made royal invitations, VIP events, and corporate openings',
    billingPeriod: 'Custom Design + Full Access',
    badge: 'Bespoke Design',
    features: [
      'Custom 3D/2D interactive opener crafted for your story',
      'Custom brand identity, calligraphy, and royal wax seals',
      'Supports www.maraseem.com custom domain & permanent business page',
      'Ready for Iraqi payment gateways (ZainCash, AsiaHawala, Qi Card)',
      'Up to 2,500 guests with full reception & seating management',
    ],
  },
  business: {
    name: 'Business & Openings Package',
    subtitle: 'Tailored for companies, clinics, restaurants, and grand openings',
    billingPeriod: 'Event + Permanent Page',
    badge: 'Corporate & Brands',
    features: [
      'Interactive grand opening ribbon-cutting experience',
      'Custom brand identity colors, logo, and event schedule',
      'VIP guest pass with QR reception check-in',
      'One-click conversion into a permanent business profile page',
      'Direct contact buttons (WhatsApp, Instagram, Maps, Booking)',
    ],
  },
};

export const PricingAndMarketingView: React.FC<PricingAndMarketingViewProps> = ({
  packages,
  coupons,
  reviews,
  sampleInvitation,
  onSelectPackage,
  onPreviewTestInvitation,
  onAddReview,
}) => {
  const { lang, tr } = useLanguage();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'IQD' | 'USD'>('IQD');

  // Test Invitation Sender State
  const [testGuestName, setTestGuestName] = useState('عائلة السيد أحمد المنصور الكريمة');
  const [testSeats, setTestSeats] = useState(4);
  const [testPhone] = useState('');
  const [copiedTestLink, setCopiedTestLink] = useState(false);

  // New Review Form
  const [revName, setRevName] = useState('');
  const [revCity, setRevCity] = useState('بغداد');
  const [revOccasion] = useState('حفل خطوبة');
  const [revComment, setRevComment] = useState('');
  const [revSubmitted, setRevSubmitted] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const found = coupons.find((c) => c.code.toUpperCase() === code && c.isActive);
    if (found) {
      setAppliedCoupon(found);
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setCouponError(
        tr(
          'رمز الخصم غير صالح أو منتهي الصلاحية. جرب الرمز: MARASEEM25',
          'Invalid or expired coupon code. Try code: MARASEEM25'
        )
      );
    }
  };

  const getDiscountedPrice = (price: number) => {
    if (!appliedCoupon) return price;
    return Math.round(price * (1 - appliedCoupon.discountPercent / 100));
  };

  const handleSendTestWhatsApp = () => {
    const personalTestUrl = buildPersonalizedGuestUrl(sampleInvitation, {
      name: testGuestName,
      familyTitle: testGuestName,
      isFamilyInvite: true,
      allocatedSeats: testSeats,
      group: 'vip',
      tableNumber: 1,
      qrCodeToken: 'TEST-PASS',
    });

    const msg =
      lang === 'ar'
        ? `✨ تجربة دعوة رقمية شخصية من منصة مراسيم ✨\n\n` +
          `مرحباً بـ: ${testGuestName}\n` +
          `🪑 عدد المقاعد المخصصة لكم في هذه التجربة: ${testSeats} مقاعد (طاولة رقم ١)\n\n` +
          `اضغط على الرابط لمشاهدة كيف ستفتح الدعوة باسمك مع رمز الدخول الخاص بك:\n` +
          `${personalTestUrl}`
        : `✨ Personal Digital Invitation Demo from Maraseem ✨\n\n` +
          `Welcome: ${testGuestName}\n` +
          `🪑 Allocated Seats in this demo: ${testSeats} seats (Table #1)\n\n` +
          `Tap the link to see how the invitation opens in your name with your QR entry pass:\n` +
          `${personalTestUrl}`;

    const cleanPhone = testPhone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyTestLink = () => {
    const personalTestUrl = buildPersonalizedGuestUrl(sampleInvitation, {
      name: testGuestName,
      familyTitle: testGuestName,
      isFamilyInvite: true,
      allocatedSeats: testSeats,
      group: 'vip',
      tableNumber: 1,
      qrCodeToken: 'TEST-PASS',
    });
    navigator.clipboard.writeText(personalTestUrl);
    setCopiedTestLink(true);
    setTimeout(() => setCopiedTestLink(false), 2500);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 font-cairo">
      {/* Free Forever Announcement Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#DCE8CB] border border-[#B9CCA0] text-[#566B49] flex flex-wrap items-center justify-between gap-4 shadow-[0_6px_24px_rgba(86,107,73,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFFDF8] border border-[#B9CCA0] text-[#566B49] flex items-center justify-center shrink-0">
            <Gift size={20} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#566B49]">
              {tr(
                '🎁 جميع باقات وقوالب ومميزات منصة مراسيم مجانية بالكامل ١٠٠٪ (0 د.ع)!',
                '🎁 All MARASEEM Packages, Templates & Features Are Now 100% FREE ($0)!'
              )}
            </div>
            <p className="text-xs text-[#566B49]/85 mt-0.5">
              {tr(
                'استمتع بكافة القوالب الملكية والسينمائية، وتهنئة عيد الميلاد، ونظام العوائل العراقية، ودعوات الشركات مجاناً تماماً بدون أي رسوم أو اشتراكات!',
                'Enjoy all Royal VIP, Cinematic, Birthday Experience, Iraqi Family Grouping, and Business Opening features completely free with zero fees!'
              )}
            </p>
          </div>
        </div>

        <span className="px-4 py-2.5 rounded-xl bg-[#566B49] text-[#FFFDF8] font-bold text-xs shadow-xs">
          {tr('مجاني ١٠٠٪ مدى الحياة ✓', '100% Free Forever ✓')}
        </span>
      </div>

      {/* Pricing Header & Coupon Bar */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="px-3.5 py-1 rounded-full bg-[#DCE8CB] text-[#566B49] border border-[#B9CCA0] text-xs font-bold">
          {tr('باقات المنصة (مجانية بالكامل ١٠٠٪)', 'Platform Packages (100% Free Forever)')}
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold text-[#566B49]">
          {tr(
            'جميع الباقات مفتوحة مجاناً… من الحفلات العائلية إلى الأعراس الملكية والشركات',
            'All Packages Unlocked for Free… From Family Gatherings to Royal Weddings & Corporate Events'
          )}
        </h2>
        <p className="text-xs sm:text-sm text-[#566B49]/80">
          {tr(
            'تم جعل كافة الباقات والقوالب التفاعلية مجانية ١٠٠٪ (0 دينار عراقي / $0) مع تفعيل فوري لجميع المزايا بدون الحاجة لبطاقة دفع.',
            'All interactive packages and templates are 100% FREE (0 IQD / $0) with instant access and no credit card required.'
          )}
        </p>

        {/* Currency Switcher & Coupon Form */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-1 bg-[#FFFDF8] p-1 rounded-xl border border-[#E9DDC9] text-xs">
            <button
              type="button"
              onClick={() => setCurrency('IQD')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                currency === 'IQD'
                  ? 'bg-[#B9CCA0] text-[#566B49]'
                  : 'text-[#566B49]/75 hover:text-[#566B49]'
              }`}
            >
              {tr('دينار عراقي (د.ع)', 'Iraqi Dinar (IQD)')}
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#B9CCA0] text-[#566B49]'
                  : 'text-[#566B49]/75 hover:text-[#566B49]'
              }`}
            >
              {tr('دولار أمريكي ($)', 'US Dollar ($)')}
            </button>
          </div>

          <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
            <div className="relative">
              <Tag
                size={14}
                className={`absolute ${
                  lang === 'ar' ? 'right-3' : 'left-3'
                } top-1/2 -translate-y-1/2 text-[#91A77D]`}
              />
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder={tr('رمز الكوبون (مثال: MARASEEM25)', 'Promo code (e.g. MARASEEM25)')}
                className={`${
                  lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
                } py-2 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49] font-bold uppercase outline-none focus:border-[#91A77D]`}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer transition-all"
            >
              {tr('تفعيل الكوبون', 'Apply Code')}
            </button>
          </form>
        </div>

        {appliedCoupon && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DCE8CB] border border-[#B9CCA0] text-[#566B49] text-xs font-bold">
            <CheckCircle2 size={14} />
            <span>
              {tr(
                `تم تطبيق الكوبون (${appliedCoupon.code}) — خصم ${appliedCoupon.discountPercent}٪ مفعّل الآن!`,
                `Coupon (${appliedCoupon.code}) applied — ${appliedCoupon.discountPercent}% discount active!`
              )}
            </span>
          </div>
        )}
        {couponError && <p className="text-xs text-rose-600 font-bold">{couponError}</p>}
      </div>

      {/* 4 Pricing Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => {
          const finalIQD = getDiscountedPrice(pkg.priceIQD);
          const finalUSD = getDiscountedPrice(pkg.priceUSD);
          const enPkg = PACKAGE_TRANSLATIONS_EN[pkg.id];

          const displayName =
            lang === 'ar'
              ? pkg.name.replace('VIP', 'الملكية').replace('Business', 'الأعمال')
              : enPkg?.name || pkg.name;
          const displaySubtitle = lang === 'ar' ? pkg.subtitle : enPkg?.subtitle || pkg.subtitle;
          const displayBadge =
            lang === 'ar'
              ? pkg.badge?.replace('VIP', 'ملكي')
              : enPkg?.badge || pkg.badge;
          const displayBilling =
            lang === 'ar' ? pkg.billingPeriod : enPkg?.billingPeriod || pkg.billingPeriod;
          const displayFeatures =
            lang === 'ar'
              ? pkg.features.map((f) =>
                  f
                    .replace('QR Code', 'رمز الدخول')
                    .replace('QR', 'رمز الدخول')
                    .replace('VIP', 'الملكية')
                    .replace('AI', 'الذكي')
                    .replace('Google Maps', 'الخريطة')
                )
              : enPkg?.features || pkg.features;

          return (
            <div
              key={pkg.id}
              className={`rounded-3xl p-6 flex flex-col justify-between space-y-6 border transition-all relative ${
                pkg.isPopular
                  ? 'bg-[#FFFDF8] border-2 border-[#91A77D] shadow-[0_12px_36px_rgba(86,107,73,0.12)]'
                  : 'bg-[#FFFDF8] border-[#E9DDC9] hover:border-[#B9CCA0] shadow-[0_6px_20px_rgba(86,107,73,0.05)]'
              }`}
            >
              {displayBadge && (
                <span
                  className={`absolute -top-3 ${
                    lang === 'ar' ? 'right-6' : 'left-6'
                  } px-3 py-1 rounded-full bg-[#B9CCA0] text-[#566B49] border border-[#91A77D] font-bold text-[11px] shadow-xs`}
                >
                  {displayBadge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#566B49]">{displayName}</h3>
                  <p className="text-xs text-[#566B49]/80 mt-1 leading-relaxed">
                    {displaySubtitle}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-3 border-y border-[#E9DDC9]">
                  {currency === 'IQD' ? (
                    <div className="space-y-0.5">
                      {pkg.originalPriceIQD && (
                        <div className="text-xs text-[#91A77D] line-through font-mono">
                          {pkg.originalPriceIQD.toLocaleString('en-US')}{' '}
                          {tr('د.ع', 'IQD')}
                        </div>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#566B49]">
                          {finalIQD === 0
                            ? tr('مجاني ١٠٠٪', '100% Free')
                            : finalIQD.toLocaleString('en-US')}
                        </span>
                        <span className="text-xs text-[#91A77D] font-bold">
                          {finalIQD === 0 ? tr('(0 د.ع)', '(0 IQD)') : tr('دينار عراقي', 'IQD')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#566B49]">
                        {finalUSD === 0 ? tr('مجاني ($0)', 'Free ($0)') : `$${finalUSD}`}
                      </span>
                    </div>
                  )}
                  <div className="text-[11px] text-[#91A77D] mt-1 font-medium">
                    {displayBilling} •{' '}
                    {tr(`حتى ${pkg.maxGuests} دعوة/عائلة`, `Up to ${pkg.maxGuests} invites`)}
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-[#566B49]">
                  {displayFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={15} className="text-[#91A77D] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectPackage(pkg)}
                className="w-full py-3 rounded-xl font-bold text-xs bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] border border-[#91A77D] transition-all cursor-pointer"
              >
                {tr(`ابدأ مجاناً ضمن ${displayName}`, `Start Free with ${displayName}`)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive "Send Test Invitation" Widget */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-[0_8px_30px_rgba(86,107,73,0.07)]">
        <div className="lg:col-span-5 space-y-2 text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCE8CB] text-[#566B49] border border-[#B9CCA0] text-xs font-bold">
            <Smartphone size={14} />
            <span>{tr('جرّب التجربة بنفسك مجاناً', 'Try It Yourself for Free')}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#566B49]">
            {tr(
              'أرسل دعوة تجريبية باسمك أو اسم عائلتك إلى هاتفك الآن!',
              'Send a Personalized Test Invitation to Your Phone Now!'
            )}
          </h3>
          <p className="text-xs text-[#566B49]/80 leading-relaxed">
            {tr(
              'اكتب اسمك وحدد عدد المقاعد، وجرّب كيف ستفتح الدعوة التفاعلية باسمك الشخصي مع رمز الدخول أو أرسلها لنفسك عبر واتساب.',
              'Enter your name and seat count to see how the interactive invitation opens with your personal greeting and entry QR pass, or send it to your WhatsApp.'
            )}
          </p>
        </div>

        <div className="lg:col-span-7 space-y-3 bg-[#F8F6EF] p-5 rounded-2xl border border-[#E9DDC9]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#566B49] mb-1">
                {tr(
                  'الاسم الذي سيظهر على بطاقة الدعوة التجريبية:',
                  'Guest or Family Name on the Demo Invitation:'
                )}
              </label>
              <input
                type="text"
                value={testGuestName}
                onChange={(e) => setTestGuestName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49] font-semibold focus:border-[#91A77D] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#566B49] mb-1">
                {tr('عدد المقاعد المخصصة:', 'Allocated Seats:')}
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={testSeats}
                onChange={(e) => setTestSeats(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] text-xs text-[#566B49] font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onPreviewTestInvitation(testGuestName, testSeats)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Sparkles size={15} />
              <span>
                {tr(
                  'فتح ومعاينة الدعوة التجريبية باسمك الآن',
                  'Open & Preview Demo Invitation Now'
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSendTestWhatsApp}
              className="py-2.5 px-4 rounded-xl bg-[#DCE8CB] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] border border-[#B9CCA0] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Send size={14} />
              <span>{tr('إرسال التجربة عبر واتساب', 'Send via WhatsApp')}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTestLink}
              className="py-2.5 px-3.5 rounded-xl bg-[#FFFDF8] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Share2 size={14} />
              <span>
                {copiedTestLink
                  ? tr('تم النسخ ✓', 'Copied ✓')
                  : tr('نسخ الرابط التجريبي', 'Copy Demo Link')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Testimonials Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#91A77D]">
              {tr('ثقة العوائل والشركات العراقية', 'Trusted by Families & Businesses')}
            </span>
            <h3 className="text-2xl font-bold text-[#566B49]">
              {tr(
                'آراء وتقييمات عملائنا في بغداد والمحافظات',
                'Client Reviews & Testimonials Across Iraq'
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[#566B49] text-sm font-bold bg-[#DCE8CB] px-3.5 py-1.5 rounded-full border border-[#B9CCA0]">
            <Star size={16} className="fill-[#566B49] text-[#566B49]" />
            <span>
              {tr(
                '٤.٩ / ٥.٠ من أكثر من ١,٤٠٠ مناسبة ناجحة',
                '4.9 / 5.0 from over 1,400 successful events'
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col justify-between space-y-4 shadow-[0_4px_18px_rgba(86,107,73,0.05)]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-[#91A77D]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={13} className="fill-[#91A77D]" />
                    ))}
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                    {rev.occasionType}
                  </span>
                </div>
                <p className="text-xs text-[#566B49]/90 leading-relaxed">«{rev.comment}»</p>
              </div>

              <div className="pt-3 border-t border-[#E9DDC9] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#566B49]">{rev.clientName}</div>
                  <div className="text-[10px] text-[#91A77D]">{rev.city}</div>
                </div>
                <span className="text-[10px] text-[#91A77D]">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Review Quick Form */}
        {onAddReview && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!revName.trim() || !revComment.trim()) return;
              onAddReview({
                clientName: revName.trim(),
                city: revCity.trim(),
                occasionType: revOccasion,
                rating: 5,
                comment: revComment.trim(),
              });
              setRevName('');
              setRevComment('');
              setRevSubmitted(true);
              setTimeout(() => setRevSubmitted(false), 3000);
            }}
            className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-3 shadow-xs"
          >
            <div className="text-xs font-bold text-[#566B49]">
              {tr(
                'شاركتنا مناسبتك؟ أضف تقييمك لتجربة منصة مراسيم:',
                'Celebrated with us? Share your review of Maraseem:'
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={revName}
                onChange={(e) => setRevName(e.target.value)}
                placeholder={tr('الاسم الكريم', 'Your Full Name')}
                className="px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] outline-none focus:border-[#91A77D]"
              />
              <input
                type="text"
                value={revCity}
                onChange={(e) => setRevCity(e.target.value)}
                placeholder={tr('المدينة (مثال: بغداد)', 'City (e.g. Baghdad)')}
                className="px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] outline-none focus:border-[#91A77D]"
              />
              <input
                type="text"
                required
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                placeholder={tr('اكتب رأيك وتجربتك مع الدعوة...', 'Write your experience...')}
                className="px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] outline-none focus:border-[#91A77D]"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer transition-all"
              >
                {revSubmitted
                  ? tr('شكراً لتقييمك ✓', 'Thank You ✓')
                  : tr('نشر التقييم', 'Submit Review')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
