export type MaraseemRouteView =
  | 'home'
  | 'templates'
  | 'editor'
  | 'dashboard'
  | 'schema_explorer'
  | 'view_invitation'
  | 'birthday_experience'
  | 'view_birthday'
  | 'ai_designer'
  | 'business_hub'
  | 'memories_hub'
  | 'receptionist'
  | 'partners'
  | 'pricing'
  | 'admin'
  | 'login'
  | 'domain_hub';

export type MaraseemDomainOption =
  | 'www.maraseem.com'
  | 'maraseem.vercel.app'
  | 'maraseem.pages.dev'
  | 'maraseem.web.app'
  | 'maraseem.netlify.app'
  | 'maraseem.net'
  | 'maraseem.app'
  | 'maraseem.co'
  | 'maraseem.site';

export interface DomainSuggestionMeta {
  domain: MaraseemDomainOption;
  labelAr: string;
  labelEn: string;
  statusBadgeAr: string;
  statusBadgeEn: string;
  recommendedForAr: string;
  recommendedForEn: string;
  estimatedPriceYearly: string;
  isPrimary?: boolean;
  isFreeForever?: boolean;
}

export const MARASEEM_DOMAIN_SUGGESTIONS: DomainSuggestionMeta[] = [
  {
    domain: 'www.maraseem.com',
    labelAr: 'النطاق الرسمي للعلامة التجارية (مفعّل مجاناً داخل المنصة)',
    labelEn: 'Primary Brand Domain (Activated Free Inside Platform)',
    statusBadgeAr: '🎁 مجاني ١٠٠٪ داخل النظام',
    statusBadgeEn: '🎁 100% Free in Platform',
    recommendedForAr: 'الهوية الرسمية لعلامة مراسيم في جميع صفحات الدعوات والروابط بدون أي رسوم',
    recommendedForEn: 'Official flagship brand identity across all invitation links at zero cost',
    estimatedPriceYearly: 'مجاني ١٠٠٪ ($0)',
    isPrimary: true,
    isFreeForever: true,
  },
  {
    domain: 'maraseem.vercel.app',
    labelAr: 'نطاق Vercel السحابي المجاني مدى الحياة (بدون بطاقة دفع)',
    labelEn: 'Free Forever Vercel Cloud Domain (No Credit Card)',
    statusBadgeAr: '✅ مجاني ١٠٠٪ مدى الحياة + SSL',
    statusBadgeEn: '✅ 100% Free Forever + SSL',
    recommendedForAr: 'رابط حقيقي ومستقل باسم مراسيم يُحجز مجاناً بالكامل في دقيقة واحدة عبر Vercel',
    recommendedForEn: 'Real standalone MARASEEM link hosted 100% free forever on Vercel',
    estimatedPriceYearly: 'مجاني مدى الحياة ($0)',
    isFreeForever: true,
  },
  {
    domain: 'maraseem.pages.dev',
    labelAr: 'نطاق Cloudflare Pages المجاني مدى الحياة',
    labelEn: 'Free Forever Cloudflare Pages Domain',
    statusBadgeAr: '⚡ مجاني ١٠٠٪ + حماية Cloudflare',
    statusBadgeEn: '⚡ 100% Free + Cloudflare SSL',
    recommendedForAr: 'نطاق مجاني تماماً مع شهادة HTTPS/SSL أوتوماتيكية وسرعة فائقة في العراق والعالم',
    recommendedForEn: 'Completely free domain with automatic HTTPS/SSL and global CDN speed',
    estimatedPriceYearly: 'مجاني مدى الحياة ($0)',
    isFreeForever: true,
  },
  {
    domain: 'maraseem.web.app',
    labelAr: 'نطاق Google Firebase الرسمي المجاني (.web.app)',
    labelEn: 'Free Google Firebase Domain (.web.app)',
    statusBadgeAr: '🔒 مجاني ١٠٠٪ من Google',
    statusBadgeEn: '🔒 100% Free by Google',
    recommendedForAr: 'نطاق رسمي قصير ومجاني بالكامل مقدم من استضافة Google Firebase مع شهادة أمان SSL',
    recommendedForEn: 'Short, prestigious 100% free domain powered by Google Firebase Hosting',
    estimatedPriceYearly: 'مجاني مدى الحياة ($0)',
    isFreeForever: true,
  },
  {
    domain: 'maraseem.netlify.app',
    labelAr: 'نطاق Netlify المجاني المستقل (.netlify.app)',
    labelEn: 'Free Netlify Standalone Domain (.netlify.app)',
    statusBadgeAr: '🌟 مجاني ١٠٠٪ بدون شروط',
    statusBadgeEn: '🌟 100% Free No Limits',
    recommendedForAr: 'حجز اسم maraseem مجاناً بالكامل مع دعم الروابط المنظمة (/invitations, /birthday)',
    recommendedForEn: 'Reserve the maraseem name 100% free with clean route support',
    estimatedPriceYearly: 'مجاني مدى الحياة ($0)',
    isFreeForever: true,
  },
  {
    domain: 'maraseem.app',
    labelAr: 'نطاق التطبيقات الرقمية (.app)',
    labelEn: 'Modern Digital App Domain (.app)',
    statusBadgeAr: '🔒 مشفر بـ HTTPS افتراضياً',
    statusBadgeEn: '🔒 Built-in HTTPS Security',
    recommendedForAr: 'مفعّل مجاناً كرابط مشاركة داخل المنصة مع تشفير كامل',
    recommendedForEn: 'Enabled free inside the platform with full HTTPS support',
    estimatedPriceYearly: 'مجاني داخل المنصة ($0)',
    isFreeForever: true,
  },
  {
    domain: 'maraseem.net',
    labelAr: 'نطاق الشبكات والخدمات (.net)',
    labelEn: 'Network & Services Domain (.net)',
    statusBadgeAr: '✅ متاح مجاناً في إعدادات النظام',
    statusBadgeEn: '✅ Free in System Settings',
    recommendedForAr: 'بديل رسمي جاهز للاستخدام المجاني الفوري داخل المنصة',
    recommendedForEn: 'Ready for immediate free use inside the platform',
    estimatedPriceYearly: 'مجاني داخل المنصة ($0)',
    isFreeForever: true,
  },
  {
    domain: 'maraseem.co',
    labelAr: 'نطاق الشركات العصرية المختصر (.co)',
    labelEn: 'Short Modern Domain (.co)',
    statusBadgeAr: '✨ قصير ومجاني للمشاركة',
    statusBadgeEn: '✨ Short & Free for Sharing',
    recommendedForAr: 'مثالي لروابط الدعوات القصيرة على واتساب وإنستغرام مجاناً',
    recommendedForEn: 'Great for short invitation links on WhatsApp & Instagram for free',
    estimatedPriceYearly: 'مجاني داخل المنصة ($0)',
    isFreeForever: true,
  },
  {
    domain: 'maraseem.site',
    labelAr: 'نطاق المواقع المباشر (.site)',
    labelEn: 'Direct Web Presence (.site)',
    statusBadgeAr: '💡 مجاني بالكامل',
    statusBadgeEn: '💡 100% Free',
    recommendedForAr: 'خيار مجاني إضافي جاهز للتفعيل بضغطة زر',
    recommendedForEn: 'Additional free domain option ready with one click',
    estimatedPriceYearly: 'مجاني داخل المنصة ($0)',
    isFreeForever: true,
  },
];

export interface RouteSeoMeta {
  view: MaraseemRouteView;
  path: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

export const MARASEEM_ROUTES_SEO: RouteSeoMeta[] = [
  {
    view: 'home',
    path: '/',
    titleAr: 'مراسيم | MARASEEM – منصة الدعوات الإلكترونية وإدارة المناسبات',
    titleEn: 'MARASEEM | Luxury Digital Invitations & Event Management Platform',
    descAr:
      'مراسيم (MARASEEM) المنصة العربية الرائدة لتصميم الدعوات الإلكترونية التفاعلية، تهنئة عيد الميلاد، إدارة العوائل والمدعوين، ودعوات افتتاح الشركات.',
    descEn:
      'MARASEEM is the premier platform for interactive digital invitations, multi-page birthday experiences, guest & family management, and business openings.',
  },
  {
    view: 'templates',
    path: '/invitations',
    titleAr: 'الدعوات ومتجر القوالب | مراسيم MARASEEM',
    titleEn: 'Digital Invitations & Template Store | MARASEEM',
    descAr:
      'استعرض مكتبة قوالب الدعوات الإلكترونية الفاخرة للزفاف، الخطوبة، ليلة الحنة، التخرج، والافتتاحات الرسمية على منصة مراسيم MARASEEM.',
    descEn:
      'Browse luxury interactive invitation templates for weddings, engagements, henna nights, graduations, and VIP events on MARASEEM.',
  },
  {
    view: 'birthday_experience',
    path: '/birthday',
    titleAr: 'تهنئة عيد الميلاد التفاعلية | مراسيم MARASEEM',
    titleEn: 'Interactive Birthday Experience | MARASEEM',
    descAr:
      'صمم قصة تهنئة عيد ميلاد تفاعلية متعددة الصفحات مع كعكة الشموع، صندوق الهدايا ثلاثي الأبعاد، الرسائل السرية، وصندوق الذكريات.',
    descEn:
      'Create a multi-page interactive birthday story with candle blowing, 3D gift boxes, password secret messages, and memory frames.',
  },
  {
    view: 'business_hub',
    path: '/business',
    titleAr: 'دعوات الشركات والافتتاحات الرسمية | مراسيم MARASEEM',
    titleEn: 'Business Events & Grand Openings | MARASEEM',
    descAr:
      'دعوات رقمية احترافية لافتتاح الشركات، العيادات، المطاعم، والمعارض الفنية مع قص الشريط التفاعلي والتحول لصفحة أعمال دائمة.',
    descEn:
      'Executive digital invitations for company openings, clinics, restaurants, and exhibitions with interactive ribbon cutting.',
  },
  {
    view: 'login',
    path: '/login',
    titleAr: 'تسجيل الدخول وحسابي | مراسيم MARASEEM',
    titleEn: 'Login & Account Portal | MARASEEM',
    descAr:
      'سجل دخولك إلى منصة مراسيم MARASEEM لإدارة دعواتك، متابعة تأكيد حضور الضيوف والعوائل، والوصول إلى لوحة التحكم.',
    descEn:
      'Sign in to your MARASEEM account to manage your digital invitations, track guest RSVPs, and access your event dashboard.',
  },
  {
    view: 'domain_hub',
    path: '/domain',
    titleAr: 'إعداد النطاق الخاص www.maraseem.com و SSL و SEO | مراسيم MARASEEM',
    titleEn: 'Custom Domain www.maraseem.com, SSL & SEO Setup | MARASEEM',
    descAr:
      'مركز إدارة النطاق المستقل www.maraseem.com، شهادة الأمان HTTPS/SSL، الروابط المنظمة، وتهيئة محركات البحث SEO.',
    descEn:
      'Manage custom domain www.maraseem.com, HTTPS/SSL certificates, structured URLs, and Search Engine Optimization.',
  },
  {
    view: 'dashboard',
    path: '/dashboard',
    titleAr: 'لوحة إدارة المناسبة والعوائل | مراسيم MARASEEM',
    titleEn: 'Event & Family Manager Dashboard | MARASEEM',
    descAr:
      'لوحة تحكم شاملة لإدارة المدعوين، تقسيم العوائل، تخصيص المقاعد، وتوزيع الطاولات في منصة مراسيم.',
    descEn:
      'Comprehensive event dashboard for guest lists, family groups, seat allocations, and table seating charts.',
  },
  {
    view: 'ai_designer',
    path: '/ai-designer',
    titleAr: 'المصمم الذكي للدعوات | مراسيم MARASEEM',
    titleEn: 'Smart Invitation Designer | MARASEEM',
    descAr:
      'صمم دعوتك الإلكترونية في ثوانٍ مع المصمم الذكي في منصة مراسيم واحصل على ٣ مقترحات فورية قابلة للتعديل.',
    descEn:
      'Generate 3 instant customizable invitation concepts tailored to your occasion with the MARASEEM Smart Designer.',
  },
  {
    view: 'memories_hub',
    path: '/memories',
    titleAr: 'ذكريات الحفل وألبوم المناسبة | مراسيم MARASEEM',
    titleEn: 'Event Memories & Photo Album | MARASEEM',
    descAr:
      'وثّق أجمل لحظات وصور وفيديوهات الحفل وشاركها مع ضيوفك عبر ألبوم ذكريات مراسيم التفاعلي.',
    descEn:
      'Preserve and share post-event photos, videos, and heartfelt wishes with your guests on MARASEEM.',
  },
  {
    view: 'pricing',
    path: '/pricing',
    titleAr: 'الباقات والأسعار | مراسيم MARASEEM',
    titleEn: 'Packages & Pricing | MARASEEM',
    descAr:
      'تعرف على باقات منصة مراسيم MARASEEM للدعوات الإلكترونية وإدارة المناسبات للأفراد والشركات.',
    descEn:
      'Explore MARASEEM packages and pricing plans for personal celebrations, VIP weddings, and corporate events.',
  },
  {
    view: 'partners',
    path: '/partners',
    titleAr: 'بوابة الشركاء والمكاتب | مراسيم MARASEEM',
    titleEn: 'Partners & Agencies Portal | MARASEEM',
    descAr:
      'انضم إلى شبكة شركاء مراسيم MARASEEM لمنظمي الحفلات، القاعات، والمطابع واستفد من نظام العمولات.',
    descEn:
      'Join the MARASEEM Partner Program for event planners, venues, and printing studios.',
  },
  {
    view: 'receptionist',
    path: '/receptionist',
    titleAr: 'شاشة موظف الاستقبال وفحص QR | مراسيم MARASEEM',
    titleEn: 'Receptionist QR Check-in Scanner | MARASEEM',
    descAr:
      'نظام فحص رموز الاستجابة السريعة QR لتسجيل دخول الضيوف والتحقق من عدد المقاعد ورقم الطاولة عند باب القاعة.',
    descEn:
      'Real-time QR code check-in system to verify guest invitations, seats, and table numbers at the venue.',
  },
  {
    view: 'admin',
    path: '/admin',
    titleAr: 'لوحة الإدارة العامة | مراسيم MARASEEM',
    titleEn: 'System Administration | MARASEEM',
    descAr: 'لوحة تحكم الإدارة لإدارة القوالب، الباقات، الشركاء، وإعدادات منصة مراسيم.',
    descEn: 'System administration dashboard for managing templates, pricing, and platform settings.',
  },
  {
    view: 'editor',
    path: '/editor',
    titleAr: 'استوديو تصميم الدعوة | مراسيم MARASEEM',
    titleEn: 'Invitation Design Studio | MARASEEM',
    descAr: 'استوديو تخصيص الدعوات التفاعلية، الألوان، الخطوط، الموسيقى، والعد التنازلي.',
    descEn: 'Interactive studio to customize invitation templates, typography, music, and countdowns.',
  },
  {
    view: 'schema_explorer',
    path: '/schema',
    titleAr: 'معمارية القوالب | مراسيم MARASEEM',
    titleEn: 'Template Architecture | MARASEEM',
    descAr: 'مستكشف هيكلية القوالب والبيانات في منصة مراسيم.',
    descEn: 'Template data schema explorer for MARASEEM.',
  },
];

export function getSavedPreferredDomain(): MaraseemDomainOption {
  if (typeof window === 'undefined') return 'www.maraseem.com';
  try {
    const saved = localStorage.getItem('maraseem_preferred_domain') as MaraseemDomainOption | null;
    if (saved && MARASEEM_DOMAIN_SUGGESTIONS.some((d) => d.domain === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'www.maraseem.com';
}

export function setSavedPreferredDomain(domain: MaraseemDomainOption): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('maraseem_preferred_domain', domain);
  } catch {
    // ignore
  }
}

export function getRoutePathForView(
  view: MaraseemRouteView,
  slug?: string
): string {
  if (view === 'view_invitation' && slug) {
    return `/invitations/${encodeURIComponent(slug)}`;
  }
  if (view === 'view_birthday' && slug) {
    return `/birthday/${encodeURIComponent(slug)}`;
  }
  const found = MARASEEM_ROUTES_SEO.find((r) => r.view === view);
  return found ? found.path : '/';
}

/**
 * Resolves the current browser pathname into a MaraseemRouteView (and optional slug)
 * so clean URLs like:
 * - /invitations
 * - /birthday
 * - /business
 * - /login
 * - /domain
 * work seamlessly.
 */
export function parseViewFromPathname(pathname: string): {
  view: MaraseemRouteView | null;
  slug?: string;
} {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';

  if (clean === '/invitations' || clean === '/templates') {
    return { view: 'templates' };
  }
  if (clean.startsWith('/invitations/')) {
    const slug = decodeURIComponent(clean.slice('/invitations/'.length));
    return { view: 'view_invitation', slug };
  }
  if (clean === '/birthday') {
    return { view: 'birthday_experience' };
  }
  if (clean.startsWith('/birthday/')) {
    const slug = decodeURIComponent(clean.slice('/birthday/'.length));
    return { view: 'view_birthday', slug };
  }
  if (clean === '/business') {
    return { view: 'business_hub' };
  }
  if (clean === '/login' || clean === '/signin' || clean === '/account') {
    return { view: 'login' };
  }
  if (clean === '/domain' || clean === '/domains' || clean === '/seo') {
    return { view: 'domain_hub' };
  }
  if (clean === '/dashboard') {
    return { view: 'dashboard' };
  }
  if (clean === '/ai-designer') {
    return { view: 'ai_designer' };
  }
  if (clean === '/memories') {
    return { view: 'memories_hub' };
  }
  if (clean === '/pricing') {
    return { view: 'pricing' };
  }
  if (clean === '/partners') {
    return { view: 'partners' };
  }
  if (clean === '/receptionist') {
    return { view: 'receptionist' };
  }
  if (clean === '/admin') {
    return { view: 'admin' };
  }
  if (clean === '/editor') {
    return { view: 'editor' };
  }
  if (clean === '/') {
    return { view: 'home' };
  }
  return { view: null };
}

/**
 * Updates document title, meta description, OpenGraph, Twitter tags, and canonical URL
 * dynamically whenever the route or language changes.
 */
export function syncDocumentSeoForRoute(
  view: MaraseemRouteView,
  lang: 'ar' | 'en',
  customTitle?: string,
  customDescription?: string,
  slug?: string
): void {
  if (typeof document === 'undefined') return;

  const meta =
    MARASEEM_ROUTES_SEO.find((r) => r.view === view) || MARASEEM_ROUTES_SEO[0];
  const preferredDomain = getSavedPreferredDomain();
  const routePath = getRoutePathForView(view, slug);
  const canonicalUrl = `https://${preferredDomain}${routePath === '/' ? '' : routePath}`;

  const title =
    customTitle || (lang === 'ar' ? meta.titleAr : meta.titleEn);
  const description =
    customDescription || (lang === 'ar' ? meta.descAr : meta.descEn);

  document.title = title;

  const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'مراسيم | MARASEEM');
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

  let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);
}
