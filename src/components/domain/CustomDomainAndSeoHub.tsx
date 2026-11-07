import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  Lock,
  Search,
  Copy,
  Check,
  ExternalLink,
  Server,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  FileCode,
  Smartphone,
  Monitor,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  MARASEEM_DOMAIN_SUGGESTIONS,
  MARASEEM_ROUTES_SEO,
  MaraseemDomainOption,
  MaraseemRouteView,
  getSavedPreferredDomain,
  setSavedPreferredDomain,
} from '../../utils/seoAndRouting';

interface CustomDomainAndSeoHubProps {
  onNavigateToView: (view: MaraseemRouteView) => void;
}

export const CustomDomainAndSeoHub: React.FC<CustomDomainAndSeoHubProps> = ({
  onNavigateToView,
}) => {
  const { lang, tr } = useLanguage();
  const [selectedDomain, setSelectedDomain] = useState<MaraseemDomainOption>(
    getSavedPreferredDomain()
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState<string>('');

  const handleSelectDomain = (domain: MaraseemDomainOption) => {
    setSelectedDomain(domain);
    setSavedPreferredDomain(domain);
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const apexDomain = selectedDomain.replace(/^www\./, '');
  const fullHttpsOrigin = `https://${selectedDomain}`;

  const coreStructuredRoutes = [
    {
      path: '/invitations',
      view: 'templates' as MaraseemRouteView,
      titleAr: 'قسم الدعوات الإلكترونية ومتجر القوالب',
      titleEn: 'Digital Invitations & Templates Store',
      descAr: 'جميع قوالب الزفاف، الخطوبة، الحنة، والتخرج بروابط مستقلة',
    },
    {
      path: '/birthday',
      view: 'birthday_experience' as MaraseemRouteView,
      titleAr: 'قسم تهنئة عيد الميلاد التفاعلية (Birthday Experience)',
      titleEn: 'Interactive Multi-Page Birthday Experience',
      descAr: 'تجربة عيد الميلاد متعددة الصفحات مع الكعكة وصندوق الهدايا والرسالة السرية',
    },
    {
      path: '/business',
      view: 'business_hub' as MaraseemRouteView,
      titleAr: 'قسم دعوات الشركات والافتتاحات الرسمية',
      titleEn: 'Corporate Events & Business Grand Openings',
      descAr: 'دعوات افتتاح المشاريع والعيادات والمعارض مع قص الشريط التفاعلي',
    },
    {
      path: '/login',
      view: 'login' as MaraseemRouteView,
      titleAr: 'بوابة تسجيل الدخول وإدارة الحساب',
      titleEn: 'Unified Login & Account Portal',
      descAr: 'دخول أصحاب المناسبات، الشركاء، وموظفي الاستقبال',
    },
    {
      path: '/dashboard',
      view: 'dashboard' as MaraseemRouteView,
      titleAr: 'لوحة إدارة المناسبة والعوائل العراقية',
      titleEn: 'Event Day & Family Groups Manager',
      descAr: 'تخصيص الدعوات بأسماء الضيوف وتحديد المقاعد وتوزيع الطاولات',
    },
    {
      path: '/ai-designer',
      view: 'ai_designer' as MaraseemRouteView,
      titleAr: 'المصمم الذكي للدعوات بالذكاء الاصطناعي',
      titleEn: 'AI Smart Invitation Designer',
      descAr: 'توليد ٣ تصاميم دعوات فورية مخصصة للمناسبة',
    },
  ];

  const dnsRecords = [
    {
      type: 'A',
      host: '@',
      value: '216.239.32.21',
      ttl: 'Auto / 3600',
      purposeAr: 'ربط النطاق الجذري (maraseem.com) بخوادم الاستضافة السحابية',
    },
    {
      type: 'A',
      host: '@',
      value: '216.239.34.21',
      ttl: 'Auto / 3600',
      purposeAr: 'خادم احتياطي ثانٍ لضمان استقرار الموقع ١٠٠٪ دون انقطاع',
    },
    {
      type: 'CNAME',
      host: 'www',
      value: `ghs.googlehosted.com.`,
      ttl: 'Auto / 3600',
      purposeAr: `توجيه النطاق الفرعي (${selectedDomain}) مع تفعيل شهادة SSL تلقائياً`,
    },
    {
      type: 'TXT',
      host: '@',
      value: `v=spf1 include:_spf.google.com ~all`,
      ttl: 'Auto / 3600',
      purposeAr: 'توثيق ملكية النطاق وحماية رسائل الدعوات الإلكترونية',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. HERO HEADER */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] shadow-[0_10px_35px_rgba(86,107,73,0.07)] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DCE8CB] text-[#566B49] text-xs font-bold">
              <Globe size={14} />
              <span>
                {tr(
                  'مركز النطاق المستقل المجاني ١٠٠٪ ($0) والروابط المنظمة وشهادة SSL و SEO',
                  '100% Free ($0) Custom Brand Domain, Structured Routes, SSL & SEO Center'
                )}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#566B49]">
              {tr(
                'الموقع والنطاق المستقل مجاناً بالكامل: مراسيم | MARASEEM',
                '100% Free Official Standalone Brand Domain: MARASEEM'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E8261] leading-relaxed">
              {tr(
                'جميع مزايا الموقع والروابط والنطاقات مفعّلة الآن مجاناً بالكامل ١٠٠٪ ($0 مدى الحياة بدون أي اشتراكات أو بطاقة دفع). يمكنك اعتماد النطاق الرسمي داخل النظام أو نشر الموقع مجاناً مدى الحياة باسم maraseem عبر Vercel أو Cloudflare Pages أو Firebase مع شهادة HTTPS/SSL مجانية.',
                'All platform features, clean routes, and brand domains are 100% FREE forever ($0, no credit card required). Activate your preferred MARASEEM domain instantly with free HTTPS/SSL and full SEO.'
              )}
            </p>
          </div>

          {/* Active Domain Live Badge */}
          <div className="p-4 rounded-2xl bg-[#F8F6EF] border-2 border-[#B9CCA0] space-y-1.5 min-w-[260px]">
            <div className="flex items-center justify-between text-[11px] text-[#6E8261] font-bold">
              <span className="flex items-center gap-1 text-[#566B49]">
                <Lock size={12} className="text-[#566B49]" />
                <span>SSL / HTTPS مجاني ✓</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] text-[10px]">
                مجاني ١٠٠٪ ($0)
              </span>
            </div>
            <div className="text-base sm:text-lg font-extrabold font-mono text-[#566B49]" dir="ltr">
              https://{selectedDomain}
            </div>
            <div className="text-[11px] text-[#91A77D] flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <Smartphone size={11} /> متجاوب للهاتف
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Monitor size={11} /> والكمبيوتر
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY DOMAIN & ALTERNATIVE DOMAINS SELECTOR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#566B49]">
              {tr(
                '١. اختر نطاق مراسيم المجاني ١٠٠٪ ($0 مدى الحياة بدون أي رسوم):',
                '1. Select Your 100% Free MARASEEM Domain ($0 Forever):'
              )}
            </h2>
            <p className="text-xs text-[#6E8261]">
              {tr(
                'جميع هذه النطاقات متاحة للتفعيل المجاني الفوري بضغطة زر واحدة بدون دفع أي مبلغ ($0):',
                'All domains below are available for instant 100% free activation with one click ($0):'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MARASEEM_DOMAIN_SUGGESTIONS.map((item) => {
            const isSelected = selectedDomain === item.domain;
            return (
              <div
                key={item.domain}
                onClick={() => handleSelectDomain(item.domain)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#DCE8CB]/55 border-[#566B49] shadow-md'
                    : 'bg-[#F8F6EF] border-[#E9DDC9] hover:border-[#B9CCA0]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFFDF8] border border-[#E9DDC9] text-[#566B49]">
                      {lang === 'ar' ? item.statusBadgeAr : item.statusBadgeEn}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#6E8261]">
                      {item.estimatedPriceYearly}
                    </span>
                  </div>

                  <div
                    className="text-lg font-extrabold font-mono text-[#566B49] flex items-center gap-1.5"
                    dir="ltr"
                  >
                    <Lock size={14} className="text-[#91A77D]" />
                    <span>{item.domain}</span>
                  </div>

                  <div className="text-xs font-bold text-[#566B49]">
                    {lang === 'ar' ? item.labelAr : item.labelEn}
                  </div>
                  <p className="text-[11px] text-[#6E8261] leading-relaxed">
                    {lang === 'ar' ? item.recommendedForAr : item.recommendedForEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E9DDC9] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#566B49]">
                    {isSelected
                      ? tr('✓ النطاق المعتمد حالياً في النظام', '✓ Currently Active Domain')
                      : tr('اضغط لاعتماد هذا النطاق', 'Click to set as active')}
                  </span>
                  {isSelected && <CheckCircle2 size={16} className="text-[#566B49]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ORGANIZED INTERNAL PAGES & CLEAN URL STRUCTURE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#566B49]">
              {tr(
                '٢. الروابط الداخلية المنظمة للموقع (Clean URL Structure):',
                '2. Organized Internal URL Structure:'
              )}
            </h2>
            <p className="text-xs text-[#6E8261]">
              {tr(
                'تم إعداد نظام التوجيه (Routing) ليدعم الروابط المباشرة المنظمة، بحيث يتغير الرابط في المتصفح تلقائياً ويعمل على الهواتف والكمبيوتر:',
                'The router supports clean direct paths that update the browser address bar and work across mobile and desktop:'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {coreStructuredRoutes.map((rt) => {
            const fullBrandUrl = `${fullHttpsOrigin}${rt.path}`;
            return (
              <div
                key={rt.path}
                className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#566B49]">
                      {lang === 'ar' ? rt.titleAr : rt.titleEn}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-mono font-bold">
                      200 OK • SSL
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E8261]">{rt.descAr}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#E9DDC9] flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-bold text-[#566B49] truncate" dir="ltr">
                    {fullBrandUrl}
                  </code>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(rt.path, fullBrandUrl)}
                      className="px-2.5 py-1 rounded-lg bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === rt.path ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedKey === rt.path ? tr('تم النسخ', 'Copied') : tr('نسخ', 'Copy')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToView(rt.view)}
                      className="px-2.5 py-1 rounded-lg bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>{tr('فتح المسار', 'Open Route')}</span>
                      <ArrowUpRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. STEP-BY-STEP GUIDE FOR PURCHASING & LINKING THE REAL DOMAIN + DNS RECORDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step-by-Step Guide */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-5 shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#91A77D]">
              {tr(
                'دليل الحصول على النطاق والاستضافة مجاناً ١٠٠٪ ($0 مدى الحياة)',
                '100% Free Forever Domain & Hosting Guide ($0)'
              )}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#566B49]">
              {tr(
                '٣. كيف تحصل على رابط واستضافة مجانية ١٠٠٪ باسم MARASEEM بدون دفع أي فلس:',
                '3. How to Get a 100% Free MARASEEM Domain & Hosting ($0 Forever):'
              )}
            </h2>
            <p className="text-xs text-[#6E8261] leading-relaxed">
              {tr(
                'لا تحتاج لدفع أي اشتراك شهري أو سنوي! يمكنك تشغيل الموقع بنطاق مجاني بالكامل مدى الحياة ($0 وبدون بطاقة بنكية) عبر إحدى الطرق المجانية التالية:',
                'You do not need to pay any monthly or yearly fees! Launch your standalone MARASEEM website 100% free forever ($0, no credit card needed) using any of these free methods:'
              )}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                step: '١',
                title: 'التفعيل المجاني الفوري داخل المنصة (جاهز ويعمل الآن مجاناً ١٠٠٪)',
                body: `تم تفعيل النطاق (${selectedDomain}) وجميع الروابط المنظمة (/invitations, /birthday, /business, /login) وشهادة SSL وبيانات محركات البحث SEO داخل موقعك مجاناً بالكامل بدون أي رسوم.`,
              },
              {
                step: '٢',
                title: 'حجز رابط عالمي مجاني مدى الحياة عبر Vercel أو Cloudflare Pages ($0)',
                body: 'ارفع كود المشروع مجاناً على حساب GitHub مجاني، ثم اربطه بـ Vercel.com أو Pages.Cloudflare.com (الخطة المجانية مدى الحياة بدون فيزا)، واكتب اسم المشروع (maraseem) لتحصل فوراً على الرابط الرسمي المجاني: https://maraseem.vercel.app أو https://maraseem.pages.dev مع شهادة HTTPS مجانية.',
              },
              {
                step: '٣',
                title: 'أو استخدام نطاق Google Firebase المجاني الرسمي (maraseem.web.app)',
                body: 'توفر شركة Google عبر خدمة Firebase Hosting (خطة Spark المجانية مدى الحياة) نطاقاً رسمياً أنيقاً ومجانياً ١٠٠٪ باسم: https://maraseem.web.app و https://maraseem.firebaseapp.com مع شهادة أمان SSL مجانية أوتوماتيكية.',
              },
              {
                step: '٤',
                title: 'نطاقات قصيرة مجانية بالكامل (EU.org / Is-a.dev / GitHub Student Pack)',
                body: 'إذا أردت نطاقاً مستقلاً مجانياً بدون اسم منصة، يمكنك التسجيل مجاناً في (nic.eu.org) للحصول على maraseem.eu.org مجاناً مدى الحياة، أو عبر حزمة الطلاب المجانية من GitHub للحصول على نطاق .me أو .live أو .tech مجاناً بالكامل وربطه بسجلات الـ DNS المقابلة.',
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-[#566B49] text-[#FFFDF8] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {st.step}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-[#566B49]">{st.title}</h3>
                  <p className="text-xs text-[#6E8261] leading-relaxed">{st.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DNS Records & SSL Box */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#566B49] flex items-center gap-1.5">
                <Server size={15} className="text-[#91A77D]" />
                <span>{tr('سجلات DNS الجاهزة للنسخ:', 'Ready-to-Copy DNS Records:')}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCE8CB] text-[#566B49] font-bold">
                {apexDomain}
              </span>
            </div>

            <div className="space-y-2.5">
              {dnsRecords.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono font-bold text-[#566B49]" dir="ltr">
                      <span className="px-2 py-0.5 rounded bg-[#DCE8CB] text-[#566B49] text-[10px]">
                        {rec.type}
                      </span>
                      <span>Host: {rec.host}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(`dns-${idx}`, rec.value)}
                      className="text-[10px] font-bold text-[#566B49] hover:text-[#91A77D] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `dns-${idx}` ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedKey === `dns-${idx}` ? 'تم النسخ' : 'نسخ القيمة'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] bg-[#FFFDF8] px-2.5 py-1 rounded border border-[#E9DDC9] text-[#566B49] truncate" dir="ltr">
                    {rec.value}
                  </div>
                  <p className="text-[10px] text-[#6E8261]">{rec.purposeAr}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SEO & Google Search Preview Box */}
          <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#566B49] flex items-center gap-1.5">
                <Search size={15} className="text-[#91A77D]" />
                <span>{tr('معاينة ظهور الموقع في بحث Google (SEO):', 'Google Search SEO Preview:')}</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                Schema.org JSON-LD ✓
              </span>
            </div>

            {/* Simulated Google SERP Snippet */}
            <div className="p-4 rounded-2xl bg-white border border-[#E9DDC9] space-y-1.5 text-right shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span className="w-6 h-6 rounded-full bg-[#DCE8CB] text-[#566B49] font-amiri font-bold flex items-center justify-center text-xs">
                  م
                </span>
                <div>
                  <div className="font-bold text-neutral-800 text-[11px]">مراسيم | MARASEEM</div>
                  <div className="text-[10px] text-emerald-700 font-mono" dir="ltr">
                    https://{selectedDomain}
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-[#1a0dab] hover:underline cursor-pointer">
                مراسيم | MARASEEM – منصة الدعوات الإلكترونية وإدارة المناسبات
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                مراسيم (MARASEEM) المنصة العربية الرائدة لتصميم الدعوات الإلكترونية التفاعلية، تهنئة عيد الميلاد، إدارة العوائل والمدعوين، ودعوات افتتاح الشركات.
              </p>
              {/* Sitelinks */}
              <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-neutral-100 text-[11px]">
                <div>
                  <span className="text-[#1a0dab] font-bold block">الدعوات ومتجر القوالب</span>
                  <span className="text-[10px] text-neutral-500 font-mono" dir="ltr">/invitations</span>
                </div>
                <div>
                  <span className="text-[#1a0dab] font-bold block">تهنئة عيد الميلاد</span>
                  <span className="text-[10px] text-neutral-500 font-mono" dir="ltr">/birthday</span>
                </div>
                <div>
                  <span className="text-[#1a0dab] font-bold block">دعوات الشركات</span>
                  <span className="text-[10px] text-neutral-500 font-mono" dir="ltr">/business</span>
                </div>
                <div>
                  <span className="text-[#1a0dab] font-bold block">تسجيل الدخول</span>
                  <span className="text-[10px] text-neutral-500 font-mono" dir="ltr">/login</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
