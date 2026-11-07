/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Share2,
  Eye,
  ArrowRight,
  Users,
  Menu,
  X,
  Wand2,
  Building2,
  QrCode,
  Crown,
  Camera,
  Cake,
  LogIn,
  UserCheck,
  SlidersHorizontal,
  Play,
  Check,
  Moon,
  Sun,
} from 'lucide-react';

import {
  InvitationCategory,
  Template,
  InvitationData,
  RSVPRecord,
  GuestbookMessage,
  SeatingTable,
  InvitedGuest,
  PricingPackage,
  DiscountCoupon,
  PartnerAccount,
  CustomerReview,
  PlatformUserRole,
} from './types/invitation';
import {
  BirthdayGreetingData,
  BirthdayTemplate,
} from './types/birthdayExperience';
import {
  INITIAL_TEMPLATES,
  INITIAL_INVITATIONS,
  INITIAL_RSVPS,
  INITIAL_GUESTBOOK,
  INITIAL_SEATING_TABLES,
} from './data/templates';
import {
  INITIAL_BIRTHDAY_TEMPLATES,
  INITIAL_BIRTHDAY_GREETINGS,
  buildShareableBirthdayUrl,
  isStandaloneBirthdayUrl,
  parseSharedBirthdayFromLocation,
} from './data/birthdayTemplates';
import {
  INITIAL_INVITED_GUESTS,
  INITIAL_PRICING_PACKAGES,
  INITIAL_DISCOUNT_COUPONS,
  INITIAL_PARTNERS,
  INITIAL_CUSTOMER_REVIEWS,
  getTemplateMarketplaceMeta,
} from './data/platformData';

import { InteractiveInvitationView } from './components/invitation-experience/InteractiveInvitationView';
import { InvitationEditor } from './components/editor/InvitationEditor';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { TemplateSchemaExplorer } from './components/schema/TemplateSchemaExplorer';
import { ReceptionistScannerView } from './components/receptionist/ReceptionistScannerView';
import { BusinessEventHub } from './components/business/BusinessEventHub';
import { AIInvitationDesigner } from './components/ai-designer/AIInvitationDesigner';
import { WeddingMemoriesView } from './components/memories/WeddingMemoriesView';
import { PartnerPortal } from './components/partners/PartnerPortal';
import { PricingAndMarketingView } from './components/marketing/PricingAndMarketingView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BirthdayExperienceHub } from './components/birthday/BirthdayExperienceHub';
import { BirthdayExperiencePlayer } from './components/birthday/BirthdayExperiencePlayer';
import { LoginPortalView, MaraseemAuthUser } from './components/auth/LoginPortalView';
import { CustomDomainAndSeoHub } from './components/domain/CustomDomainAndSeoHub';
import {
  MaraseemRouteView,
  getRoutePathForView,
  parseViewFromPathname,
  syncDocumentSeoForRoute,
} from './utils/seoAndRouting';
import {
  buildShareableInvitationUrl,
  isStandaloneInvitationUrl,
  parseSharedInvitationFromLocation,
  PersonalizedGuestContext,
} from './utils/shareLink';
import { useLanguage, LanguageSwitcher } from './i18n/LanguageContext';
import { MaraseemMagicEffectsSystem } from './components/engine/MaraseemMagicEffectsSystem';
import { useRoyalDarkMode } from './utils/royalDarkMode';
import { MiniCard3DCanvas } from './components/invitation/MiniCard3DCanvas';

const COMPACT_DATA_URL_LIMIT = 120000;

function compactInvitationsForStorage(invitations: InvitationData[]): InvitationData[] {
  const defaultMap = new Map(INITIAL_INVITATIONS.map((inv) => [inv.id, inv]));

  return invitations.map((inv) => {
    const def = defaultMap.get(inv.id);
    const clone: InvitationData = { ...inv };

    if (
      clone.coverImage &&
      (clone.coverImage === def?.coverImage || clone.coverImage.length > COMPACT_DATA_URL_LIMIT)
    ) {
      clone.coverImage = clone.coverImage === def?.coverImage ? '__DEFAULT_COVER__' : undefined;
    }

    if (
      clone.couplePortraitImage &&
      (clone.couplePortraitImage === def?.couplePortraitImage ||
        clone.couplePortraitImage.length > COMPACT_DATA_URL_LIMIT)
    ) {
      clone.couplePortraitImage =
        clone.couplePortraitImage === def?.couplePortraitImage ? '__DEFAULT_PORTRAIT__' : undefined;
    }

    if (
      clone.customAudioUrl &&
      clone.customAudioUrl.startsWith('data:') &&
      clone.customAudioUrl.length > COMPACT_DATA_URL_LIMIT
    ) {
      clone.customAudioUrl = undefined;
    }

    if (
      clone.backgroundVideoUrl &&
      (clone.backgroundVideoUrl.startsWith('data:') || clone.backgroundVideoUrl.startsWith('blob:'))
    ) {
      clone.backgroundVideoUrl = undefined;
    }

    return clone;
  });
}

function rehydrateInvitationsFromStorage(parsed: InvitationData[]): InvitationData[] {
  const defaultMap = new Map(INITIAL_INVITATIONS.map((inv) => [inv.id, inv]));

  return parsed.map((inv) => {
    const def = defaultMap.get(inv.id);
    if (!def) return inv;
    return {
      ...def,
      ...inv,
      coverImage:
        inv.coverImage === '__DEFAULT_COVER__' || !inv.coverImage ? def.coverImage : inv.coverImage,
      couplePortraitImage:
        inv.couplePortraitImage === '__DEFAULT_PORTRAIT__' || !inv.couplePortraitImage
          ? def.couplePortraitImage
          : inv.couplePortraitImage,
    };
  });
}

function safeSetLocalStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    try {
      localStorage.removeItem(key);
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Storage quota reached for ${key}; keeping state in memory.`);
    }
  }
}

const OCCASION_CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  all: { ar: 'جميع القوالب', en: 'All Templates' },
  engagement: { ar: 'الخطوبة', en: 'Engagement' },
  wedding: { ar: 'الزفاف', en: 'Wedding' },
  henna: { ar: 'الحناء', en: 'Henna' },
  birthday: { ar: 'أعياد الميلاد', en: 'Birthday' },
  graduation: { ar: 'التخرج', en: 'Graduation' },
  graduation_project: { ar: 'مشاريع التخرج', en: 'Graduation Projects' },
  special_events: { ar: 'المناسبات الخاصة', en: 'Special Events' },
  business_opening: { ar: 'افتتاح المشاريع', en: 'Business Openings' },
  art_exhibition: { ar: 'المعارض الفنية', en: 'Art Exhibitions' },
  career_promotion: { ar: 'الترقية الوظيفية', en: 'Career Promotion' },
  family_success: { ar: 'نجاح العائلة', en: 'Family Celebrations' },
};

export default function App() {
  const { lang, dir, isRTL, tr, translateTemplateDesc } = useLanguage();
  const [isRoyalDark, toggleRoyalDark] = useRoyalDarkMode();

  // Persistence state
  const [invitations, setInvitations] = useState<InvitationData[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_invitations_v2');
      if (!saved) return INITIAL_INVITATIONS;
      const parsed: InvitationData[] = rehydrateInvitationsFromStorage(JSON.parse(saved));
      const existingIds = new Set(parsed.map((i) => i.id));
      const missingDefaults = INITIAL_INVITATIONS.filter((i) => !existingIds.has(i.id));
      return [...missingDefaults, ...parsed];
    } catch {
      return INITIAL_INVITATIONS;
    }
  });

  const [rsvps, setRsvps] = useState<RSVPRecord[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_rsvps_v2');
      return saved ? JSON.parse(saved) : INITIAL_RSVPS;
    } catch {
      return INITIAL_RSVPS;
    }
  });

  const [guestbook, setGuestbook] = useState<GuestbookMessage[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_guestbook_v2');
      return saved ? JSON.parse(saved) : INITIAL_GUESTBOOK;
    } catch {
      return INITIAL_GUESTBOOK;
    }
  });

  const [tables, setTables] = useState<SeatingTable[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_tables_v2');
      return saved ? JSON.parse(saved) : INITIAL_SEATING_TABLES;
    } catch {
      return INITIAL_SEATING_TABLES;
    }
  });

  const [invitedGuests, setInvitedGuests] = useState<InvitedGuest[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_invited_guests_v2');
      return saved ? JSON.parse(saved) : INITIAL_INVITED_GUESTS;
    } catch {
      return INITIAL_INVITED_GUESTS;
    }
  });

  const [pricingPackages, setPricingPackages] = useState<PricingPackage[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_pricing_v2');
      if (!saved) return INITIAL_PRICING_PACKAGES;
      const parsed: PricingPackage[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((p) => p.id));
      const merged = [
        ...INITIAL_PRICING_PACKAGES.filter((p) => !existingIds.has(p.id)),
        ...parsed,
      ];
      return merged.map((pkg) => ({
        ...pkg,
        priceIQD: 0,
        priceUSD: 0,
        billingPeriod: 'مجانية ١٠٠٪ مدى الحياة',
      }));
    } catch {
      return INITIAL_PRICING_PACKAGES;
    }
  });

  const [discountCoupons, setDiscountCoupons] = useState<DiscountCoupon[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_coupons_v2');
      return saved ? JSON.parse(saved) : INITIAL_DISCOUNT_COUPONS;
    } catch {
      return INITIAL_DISCOUNT_COUPONS;
    }
  });

  const [partners, setPartners] = useState<PartnerAccount[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_partners_v2');
      return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
    } catch {
      return INITIAL_PARTNERS;
    }
  });

  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_reviews_v2');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_REVIEWS;
    } catch {
      return INITIAL_CUSTOMER_REVIEWS;
    }
  });

  const [birthdayTemplates, setBirthdayTemplates] = useState<BirthdayTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_bday_templates_v2');
      return saved ? JSON.parse(saved) : INITIAL_BIRTHDAY_TEMPLATES;
    } catch {
      return INITIAL_BIRTHDAY_TEMPLATES;
    }
  });

  const [birthdayGreetings, setBirthdayGreetings] = useState<BirthdayGreetingData[]>(() => {
    try {
      const saved = localStorage.getItem('maraseem_bday_greetings_v2');
      if (!saved) return INITIAL_BIRTHDAY_GREETINGS;
      const parsed: BirthdayGreetingData[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((g) => g.id));
      const missingDefaults = INITIAL_BIRTHDAY_GREETINGS.filter((g) => !existingIds.has(g.id));
      return [...missingDefaults, ...parsed];
    } catch {
      return INITIAL_BIRTHDAY_GREETINGS;
    }
  });

  const [siteSlogan, setSiteSlogan] = useState<string>('«مراسيم – لكل دعوة حكاية»');
  const [personalizedGuestOverride, setPersonalizedGuestOverride] =
    useState<PersonalizedGuestContext | null>(null);
  const [currentUser, setCurrentUser] = useState<MaraseemAuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('maraseem_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const initialSharedInvite = parseSharedInvitationFromLocation(invitations);
  const initialSharedBirthday = parseSharedBirthdayFromLocation(birthdayGreetings);
  const isUrlReceptionistMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('mode') === 'receptionist';
  const initialPathRoute =
    typeof window !== 'undefined'
      ? parseViewFromPathname(window.location.pathname)
      : { view: 'home' as MaraseemRouteView };

  const [currentView, setCurrentView] = useState<MaraseemRouteView>(() => {
    if (isUrlReceptionistMode) return 'receptionist';
    if (initialSharedBirthday || isStandaloneBirthdayUrl()) return 'view_birthday';
    if (initialSharedInvite || isStandaloneInvitationUrl()) return 'view_invitation';
    if (initialPathRoute.view && initialPathRoute.view !== 'home') return initialPathRoute.view;
    return 'home';
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>(
    INITIAL_TEMPLATES[0]
  );
  // PART 1 & PART 2: Independent Template Preview State (shows cover, short desc, "افتح الدعوة", "استخدم هذا القالب")
  const [previewingTemplateCard, setPreviewingTemplateCard] = useState<Template | null>(null);
  const [footerInfoModal, setFooterInfoModal] = useState<
    'about' | 'contact' | 'privacy' | 'terms' | null
  >(null);

  const [selectedInvitation, setSelectedInvitation] = useState<InvitationData | undefined>(() => {
    if (initialSharedInvite) return initialSharedInvite;
    if (initialPathRoute.view === 'view_invitation' && initialPathRoute.slug) {
      const matched = invitations.find(
        (inv) => inv.slug === initialPathRoute.slug || inv.id === initialPathRoute.slug
      );
      if (matched) return matched;
    }
    return INITIAL_INVITATIONS[0];
  });
  const [selectedBirthdayGreeting, setSelectedBirthdayGreeting] = useState<BirthdayGreetingData>(
    () => {
      if (initialSharedBirthday) return initialSharedBirthday;
      if (initialPathRoute.view === 'view_birthday' && initialPathRoute.slug) {
        const matched = birthdayGreetings.find(
          (g) => g.slug === initialPathRoute.slug || g.id === initialPathRoute.slug
        );
        if (matched) return matched;
      }
      return INITIAL_BIRTHDAY_GREETINGS[0];
    }
  );
  const [editingInvitation, setEditingInvitation] = useState<InvitationData | undefined>(undefined);
  const [isCreatorPreviewing, setIsCreatorPreviewing] = useState<boolean>(false);
  const [hideCreatorFloatingBar, setHideCreatorFloatingBar] = useState<boolean>(false);
  const [copiedStandaloneToast, setCopiedStandaloneToast] = useState<boolean>(false);

  // Template Gallery Filters + Mobile Responsive Bottom Sheet (PART 2 & PART 5)
  const [selectedCategory, setSelectedCategory] = useState<InvitationCategory>('all');
  const [onlyMovieInspired, setOnlyMovieInspired] = useState(false);
  const [graduationMajorFilter, setGraduationMajorFilter] = useState<string>('all');
  const [marketplaceTierFilter, setMarketplaceTierFilter] = useState<
    'all' | 'free' | 'paid' | 'vip'
  >('all');
  const [marketplaceColorFilter, setMarketplaceColorFilter] = useState<string>('all');
  const [marketplaceDesignerFilter, setMarketplaceDesignerFilter] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterSheetOpen, setMobileFilterSheetOpen] = useState(false);

  // Sync to local storage safely
  useEffect(() => {
    safeSetLocalStorage('maraseem_invitations_v2', compactInvitationsForStorage(invitations));
  }, [invitations]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_rsvps_v2', rsvps);
  }, [rsvps]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_guestbook_v2', guestbook);
  }, [guestbook]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_tables_v2', tables);
  }, [tables]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_invited_guests_v2', invitedGuests);
  }, [invitedGuests]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_pricing_v2', pricingPackages);
  }, [pricingPackages]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_coupons_v2', discountCoupons);
  }, [discountCoupons]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_partners_v2', partners);
  }, [partners]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_reviews_v2', customerReviews);
  }, [customerReviews]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_bday_templates_v2', birthdayTemplates);
  }, [birthdayTemplates]);

  useEffect(() => {
    safeSetLocalStorage('maraseem_bday_greetings_v2', birthdayGreetings);
  }, [birthdayGreetings]);

  const handleAddTable = (newTable: Omit<SeatingTable, 'id'>) => {
    const tableWithId: SeatingTable = {
      ...newTable,
      id: `table-${Date.now()}`,
    };
    setTables((prev) => [...prev, tableWithId]);
  };

  const handleDeleteTable = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    setRsvps((prev) =>
      prev.map((r) => (r.assignedTableId === tableId ? { ...r, assignedTableId: undefined } : r))
    );
  };

  const handleAssignGuest = (rsvpId: string, tableId: string | undefined) => {
    setRsvps((prev) =>
      prev.map((r) => (r.id === rsvpId ? { ...r, assignedTableId: tableId } : r))
    );
  };

  const handleAddInvitedGuest = (
    guestData: Omit<InvitedGuest, 'id' | 'createdAt' | 'qrCodeToken'>
  ) => {
    const newGuest: InvitedGuest = {
      ...guestData,
      id: `guest-${Date.now()}`,
      qrCodeToken: `MRSM-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    setInvitedGuests((prev) => [newGuest, ...prev]);
  };

  const handleDeleteInvitedGuest = (guestId: string) => {
    setInvitedGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const handleCheckInGuest = (guestId: string, checkedIn: boolean) => {
    const timeStr = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setInvitedGuests((prev) =>
      prev.map((g) =>
        g.id === guestId
          ? {
              ...g,
              checkedIn,
              checkedInAt: checkedIn ? timeStr : undefined,
              rsvpStatus: checkedIn ? 'attending' : g.rsvpStatus,
              confirmedSeats:
                checkedIn && g.confirmedSeats === 0 ? g.allocatedSeats : g.confirmedSeats,
            }
          : g
      )
    );
  };

  const handleAssignInvitedGuestTable = (guestId: string, tableNumber: number | undefined) => {
    setInvitedGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, tableNumber } : g))
    );
  };

  const handleMarkReminderSent = (guestId: string) => {
    setInvitedGuests((prev) =>
      prev.map((g) =>
        g.id === guestId ? { ...g, lastReminderSentAt: new Date().toISOString() } : g
      )
    );
  };

  const invitationsRef = useRef(invitations);
  invitationsRef.current = invitations;

  const birthdayGreetingsRef = useRef(birthdayGreetings);
  birthdayGreetingsRef.current = birthdayGreetings;

  useEffect(() => {
    const handleUrlInvitation = () => {
      const sharedBirthday = parseSharedBirthdayFromLocation(birthdayGreetingsRef.current);
      if (sharedBirthday) {
        setBirthdayGreetings((prev) => {
          const exists = prev.some(
            (g) => g.slug === sharedBirthday.slug || g.id === sharedBirthday.id
          );
          if (exists) {
            return prev.map((g) =>
              g.slug === sharedBirthday.slug || g.id === sharedBirthday.id
                ? { ...g, ...sharedBirthday, viewsCount: (g.viewsCount || 0) + 1 }
                : g
            );
          }
          return [sharedBirthday, ...prev];
        });
        setSelectedBirthdayGreeting(sharedBirthday);
        setCurrentView('view_birthday');
        return;
      }

      const sharedInvite = parseSharedInvitationFromLocation(invitationsRef.current);
      if (sharedInvite) {
        setInvitations((prev) => {
          const exists = prev.some(
            (inv) => inv.slug === sharedInvite.slug || inv.id === sharedInvite.id
          );
          if (exists) {
            return prev.map((inv) =>
              inv.slug === sharedInvite.slug || inv.id === sharedInvite.id
                ? { ...inv, ...sharedInvite, viewCount: (inv.viewCount || 0) + 1 }
                : inv
            );
          }
          return [sharedInvite, ...prev];
        });
        setSelectedInvitation(sharedInvite);
        setCurrentView('view_invitation');
        return;
      }

      const parsedPath = parseViewFromPathname(window.location.pathname);
      if (parsedPath.view === 'view_invitation' && parsedPath.slug) {
        const matched = invitationsRef.current.find(
          (inv) => inv.slug === parsedPath.slug || inv.id === parsedPath.slug
        );
        if (matched) {
          setSelectedInvitation(matched);
          setCurrentView('view_invitation');
          return;
        }
      }
      if (parsedPath.view === 'view_birthday' && parsedPath.slug) {
        const matchedBday = birthdayGreetingsRef.current.find(
          (g) => g.slug === parsedPath.slug || g.id === parsedPath.slug
        );
        if (matchedBday) {
          setSelectedBirthdayGreeting(matchedBday);
          setCurrentView('view_birthday');
          return;
        }
      }
      if (parsedPath.view) {
        setCurrentView(parsedPath.view);
      }
    };

    handleUrlInvitation();
    window.addEventListener('hashchange', handleUrlInvitation);
    window.addEventListener('popstate', handleUrlInvitation);
    return () => {
      window.removeEventListener('hashchange', handleUrlInvitation);
      window.removeEventListener('popstate', handleUrlInvitation);
    };
  }, []);

  useEffect(() => {
    const customTitle =
      currentView === 'view_birthday' && selectedBirthdayGreeting
        ? `${selectedBirthdayGreeting.mainGreetingTitle || tr('تهنئة عيد ميلاد تفاعلية', 'Interactive Birthday Experience')} | مراسيم MARASEEM`
        : currentView === 'view_invitation' && selectedInvitation
        ? `${selectedInvitation.title || tr('دعوة خاصة ومباركة', 'Special Digital Invitation')} | مراسيم MARASEEM`
        : undefined;

    const customDescription =
      currentView === 'view_birthday' && selectedBirthdayGreeting
        ? selectedBirthdayGreeting.mainGreetingBody
        : currentView === 'view_invitation' && selectedInvitation
        ? selectedInvitation.invitationBody || selectedInvitation.welcomeQuote
        : undefined;

    const activeSlug =
      currentView === 'view_birthday'
        ? selectedBirthdayGreeting?.slug
        : currentView === 'view_invitation'
        ? selectedInvitation?.slug
        : undefined;

    syncDocumentSeoForRoute(currentView, lang, customTitle, customDescription, activeSlug);

    try {
      const hasStandaloneQuery =
        isStandaloneInvitationUrl() || isStandaloneBirthdayUrl() || isUrlReceptionistMode;
      if (!hasStandaloneQuery && currentView !== 'view_invitation' && currentView !== 'view_birthday') {
        const cleanPath = getRoutePathForView(currentView);
        if (window.location.pathname !== cleanPath) {
          window.history.pushState({ view: currentView }, '', cleanPath);
        }
      }
    } catch {
      // Ignore history security errors in restricted sandboxes
    }
  }, [currentView, selectedInvitation, selectedBirthdayGreeting, lang, isUrlReceptionistMode]);

  const handleOpenEditorForTemplate = (tpl: Template) => {
    setPreviewingTemplateCard(null);
    setSelectedTemplate(tpl);
    setEditingInvitation(undefined);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditorForExisting = (inv: InvitationData) => {
    setPreviewingTemplateCard(null);
    setEditingInvitation(inv);
    setSelectedTemplate(INITIAL_TEMPLATES.find((t) => t.id === inv.templateId));
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveInvitation = (data: InvitationData) => {
    setInvitations((prev) => {
      const exists = prev.some((i) => i.id === data.id);
      if (exists) {
        return prev.map((i) => (i.id === data.id ? data : i));
      }
      return [data, ...prev];
    });
    setSelectedInvitation(data);
    setCurrentView('dashboard');
  };

  const handleDeleteInvitation = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
    setRsvps((prev) => prev.filter((r) => r.invitationId !== id));
    setGuestbook((prev) => prev.filter((g) => g.invitationId !== id));
  };

  const handlePreviewInvitation = (
    inv: InvitationData,
    guestCtx: PersonalizedGuestContext | null = null
  ) => {
    setPreviewingTemplateCard(null);
    setSelectedInvitation(inv);
    setPersonalizedGuestOverride(guestCtx);
    setIsCreatorPreviewing(true);
    setHideCreatorFloatingBar(false);
    const shareUrl = buildShareableInvitationUrl(inv);
    try {
      window.history.pushState({}, '', shareUrl);
    } catch {
      window.location.hash = `invitation-${inv.slug}`;
    }
    setCurrentView('view_invitation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildDemoInvitationFromTemplate = (tpl: Template): InvitationData => ({
    id: `preview-${tpl.id}`,
    slug: `preview-${tpl.id}`,
    templateId: tpl.id,
    templateStyle: tpl.defaultValues.templateStyle || tpl.style,
    atelierTheme: tpl.atelierTheme || tpl.defaultValues.atelierTheme,
    originalHtmlPath: tpl.defaultValues.originalHtmlPath,
    category: tpl.category,
    title: tpl.defaultValues.title || tpl.name,
    movieTitle: tpl.defaultValues.movieTitle,
    movieTagline: tpl.defaultValues.movieTagline,
    movieDirector: tpl.defaultValues.movieDirector,
    movieKeyCast: tpl.defaultValues.movieKeyCast,
    movieRatingBadge: tpl.defaultValues.movieRatingBadge,
    movieTitleAnimation: tpl.defaultValues.movieTitleAnimation,
    movieTransitionStyle: tpl.defaultValues.movieTransitionStyle,
    groomName: tpl.defaultValues.groomName || 'أحمد',
    groomFamily: tpl.defaultValues.groomFamily || 'السامرائي',
    brideName: tpl.defaultValues.brideName || 'سارة',
    brideFamily: tpl.defaultValues.brideFamily || 'التميمي',
    hostNames: tpl.defaultValues.hostNames || 'عائلتا العروسين',
    graduateName: tpl.defaultValues.graduateName,
    university: tpl.defaultValues.university,
    college: tpl.defaultValues.college,
    departmentName: tpl.defaultValues.departmentName,
    academicDegree: tpl.defaultValues.academicDegree,
    projectTitle: tpl.defaultValues.projectTitle,
    supervisorName: tpl.defaultValues.supervisorName,
    defenseHall: tpl.defaultValues.defenseHall,
    major: tpl.defaultValues.major,
    honorsTitle: tpl.defaultValues.honorsTitle,
    birthdayStarName: tpl.defaultValues.birthdayStarName,
    age: tpl.defaultValues.age,
    businessName: tpl.defaultValues.businessName,
    businessType: tpl.defaultValues.businessType,
    welcomeQuote:
      tpl.defaultValues.welcomeQuote ||
      '«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا»',
    invitationBody:
      tpl.defaultValues.invitationBody ||
      'نتشرف بدعوتكم لحضور حفلنا المبارك ومشاركتنا أبهى لحظات العمر.',
    eventDate: tpl.defaultValues.eventDate || '2026-12-01',
    eventTime: tpl.defaultValues.eventTime || '08:00 PM',
    venueName: tpl.defaultValues.venueName || 'القاعة الملكية الكبرى',
    city: tpl.defaultValues.city || 'بغداد، العراق',
    addressDetails: tpl.defaultValues.addressDetails || 'الكرادة مريم',
    startPointName: tpl.defaultValues.startPointName,
    startPointUrl: tpl.defaultValues.startPointUrl,
    wazeUrl: tpl.defaultValues.wazeUrl,
    googleMapsUrl: tpl.defaultValues.googleMapsUrl || 'https://maps.google.com',
    contactPhone: tpl.defaultValues.contactPhone,
    ceremonyScheduleText: tpl.defaultValues.ceremonyScheduleText,
    dressCode: tpl.defaultValues.dressCode,
    notes: tpl.defaultValues.notes,
    coverImage: tpl.defaultValues.coverImage,
    couplePortraitImage: tpl.defaultValues.couplePortraitImage,
    galleryImages: [],
    musicTrack: tpl.defaultValues.musicTrack || 'romantic_piano',
    customPrimaryColor: tpl.defaultValues.customPrimaryColor,
    customSecondaryColor: tpl.defaultValues.customSecondaryColor,
    singleInteractionMode: tpl.defaultValues.singleInteractionMode,
    rsvpEnabled: true,
    maxGuestsPerInvite: 3,
    guestbookEnabled: true,
    viewCount: 1,
    createdAt: new Date().toISOString(),
  });

  const handlePreviewBirthdayGreeting = (greeting: BirthdayGreetingData) => {
    setSelectedBirthdayGreeting(greeting);
    setIsCreatorPreviewing(true);
    setHideCreatorFloatingBar(false);
    const shareUrl = buildShareableBirthdayUrl(greeting);
    try {
      window.history.pushState({}, '', shareUrl);
    } catch {
      window.location.hash = `birthday-${greeting.slug}`;
    }
    setCurrentView('view_birthday');
  };

  const handleSaveRSVP = (newRsvp: Omit<RSVPRecord, 'id' | 'createdAt'>) => {
    const record: RSVPRecord = {
      ...newRsvp,
      id: `rsvp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRsvps((prev) => [record, ...prev]);

    setInvitedGuests((prev) =>
      prev.map((g) => {
        if (
          (newRsvp.guestId && g.id === newRsvp.guestId) ||
          g.name === newRsvp.guestName ||
          g.familyTitle === newRsvp.guestName
        ) {
          return {
            ...g,
            rsvpStatus: newRsvp.status,
            confirmedSeats: newRsvp.status === 'attending' ? newRsvp.companionsCount : 0,
            companionNames: newRsvp.companionNames?.length
              ? newRsvp.companionNames
              : g.companionNames,
          };
        }
        return g;
      })
    );
  };

  const handleAddGuestbook = (newMsg: Omit<GuestbookMessage, 'id' | 'createdAt'>) => {
    const record: GuestbookMessage = {
      ...newMsg,
      id: `gb-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setGuestbook((prev) => [record, ...prev]);
  };

  const handleDeleteGuestbookMessage = (id: string) => {
    setGuestbook((prev) => prev.filter((g) => g.id !== id));
  };

  const handleApproveGuestbookMessage = (id: string) => {
    setGuestbook((prev) =>
      prev.map((g) => (g.id === id ? { ...g, approved: true } : g))
    );
  };

  const handleSwitchRole = (role: PlatformUserRole) => {
    if (role === 'host') setCurrentView('dashboard');
    else if (role === 'guest') handlePreviewInvitation(invitations[0]);
    else if (role === 'receptionist') setCurrentView('receptionist');
    else if (role === 'partner') setCurrentView('partners');
    else if (role === 'admin') setCurrentView('admin');
  };

  const filteredTemplates = INITIAL_TEMPLATES.filter((tpl) => {
    if (onlyMovieInspired && !tpl.isMovieInspired) return false;
    if (selectedCategory !== 'all' && tpl.category !== selectedCategory) return false;
    if (
      selectedCategory === 'graduation' &&
      graduationMajorFilter !== 'all' &&
      tpl.defaultValues.major !== graduationMajorFilter
    ) {
      return false;
    }

    const meta = getTemplateMarketplaceMeta(tpl);
    if (marketplaceTierFilter !== 'all' && meta.tier !== marketplaceTierFilter) return false;
    if (marketplaceColorFilter !== 'all' && !meta.colorTags.includes(marketplaceColorFilter)) {
      return false;
    }
    if (
      marketplaceDesignerFilter !== 'all' &&
      meta.designerName !== marketplaceDesignerFilter
    ) {
      return false;
    }

    return true;
  });

  // Clean Template Cover Card Component with Live 3D Miniature Preview
  const renderCleanTemplateCard = (tpl: Template) => {
    const occasionLabel =
      lang === 'en'
        ? OCCASION_CATEGORY_LABELS[tpl.category]?.en || 'Invitation'
        : OCCASION_CATEGORY_LABELS[tpl.category]?.ar || 'دعوة ملكية';
    const openingMode =
      tpl.defaultValues.singleInteractionMode ||
      tpl.defaultValues.openerStyle3D ||
      tpl.experienceType ||
      tpl.style ||
      'envelope_3d';

    return (
      <div
        key={tpl.id}
        onClick={() => setPreviewingTemplateCard(tpl)}
        className="group rounded-3xl bg-[#FFFDF8] border border-[#D6B574]/45 hover:border-[#A98445] transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl cursor-pointer"
      >
        {/* Template Cover Visual with Live Miniature 3D Canvas */}
        <div
          className="relative w-full aspect-[4/3] overflow-hidden flex flex-col items-center justify-center p-2 text-center"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${
              tpl.secondaryColor || '#123D32'
            } 0%, ${tpl.themeColor} 70%, #090A0F 100%)`,
          }}
        >
          {tpl.defaultValues.coverImage ? (
            <img
              src={tpl.defaultValues.coverImage}
              alt={lang === 'ar' ? tpl.name : tpl.nameEn}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
            />
          ) : null}

          {/* Subtle Royal Ornamental Frame */}
          <div className="absolute inset-3 rounded-2xl border border-[#D6B574]/40 pointer-events-none z-10" />

          {/* Occasion Category Badge */}
          <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-[#17130F]/85 border border-[#D6B574]/50 text-[#D6B574] text-[10px] font-bold">
            {occasionLabel}
          </span>

          {/* Live 3D Indicator Badge */}
          <span className="absolute top-4 left-4 z-20 px-2 py-0.5 rounded-full bg-[#17130F]/75 border border-[#D6B574]/40 text-[#D6B574] text-[9px] font-bold">
            {tr('✨ 3D حي', '✨ Live 3D')}
          </span>

          {/* Live Miniature 3D Three.js Canvas */}
          <MiniCard3DCanvas
            mode={openingMode}
            category={tpl.category}
            themeColor={tpl.themeColor}
          />

          {/* Bottom Opening Experience Pill */}
          <div className="relative z-20 mt-auto pb-3">
            <span className="px-3 py-1 rounded-full bg-[#17130F]/80 text-[#F8F1E5] text-[10px] font-semibold border border-[#D6B574]/40 backdrop-blur-sm">
              {tpl.badge || occasionLabel}
            </span>
          </div>
        </div>

        {/* Card Footer: ONLY Design Name, Occasion Type, and 3D Preview Button */}
        <div className="p-4 flex items-center justify-between gap-3 bg-[#FFFDF8]">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#17130F] font-amiri truncate">
              {lang === 'ar' ? tpl.name : tpl.nameEn}
            </h3>
            <p className="text-[11px] text-[#A98445] font-semibold mt-0.5 truncate">
              {occasionLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewingTemplateCard(tpl);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#F8F1E5] group-hover:bg-[#17130F] text-[#17130F] group-hover:text-[#D6B574] border border-[#D6B574]/50 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            {tr('معاينة 3D', '3D Preview')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      dir={dir}
      className="maraseem-platform-theme min-h-screen bg-[#F8F1E5] text-[#17130F] font-cairo selection:bg-[#D6B574]/30 selection:text-[#17130F] overflow-x-hidden"
    >
      {/* In-Invitation Click Effects Engine (Disabled on website browsing pages per PART 3) */}
      <MaraseemMagicEffectsSystem />

      {/* 1. ROYAL LUXURY HEADER */}
      {currentView !== 'view_invitation' &&
        currentView !== 'view_birthday' &&
        !isUrlReceptionistMode && (
        <header
          className={`sticky top-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#D6B574]/35 shadow-[0_4px_20px_rgba(23,19,15,0.04)] ${
            isRoyalDark && (currentView === 'editor' || currentView === 'dashboard')
              ? 'maraseem-royal-dark'
              : ''
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
            {/* Brand Logo */}
            <button
              onClick={() => {
                window.location.hash = '';
                setPreviewingTemplateCard(null);
                setCurrentView('home');
              }}
              className="flex items-center gap-2.5 text-start whitespace-nowrap shrink-0 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#17130F] border border-[#D6B574] flex items-center justify-center shadow-sm">
                <span className="font-amiri text-xl font-bold text-[#D6B574]">
                  {tr('م', 'M')}
                </span>
              </div>
              <div>
                <div className="text-xl font-bold font-amiri tracking-wide text-[#17130F]">
                  {tr('مراسيم', 'MARASEEM')}
                </div>
                <div className="text-[10px] text-[#A98445] font-semibold -mt-1">
                  {tr('لكل دعوة حكاية', 'Royal Digital Invitations')}
                </div>
              </div>
            </button>

            {/* Primary Navigation */}
            <nav className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#17130F]">
              <button
                onClick={() => {
                  setPreviewingTemplateCard(null);
                  setCurrentView('home');
                }}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-[#17130F] text-[#D6B574]'
                    : 'hover:bg-[#F8F1E5] text-[#17130F]/80'
                }`}
              >
                {tr('الرئيسية', 'Home')}
              </button>

              <button
                onClick={() => {
                  setPreviewingTemplateCard(null);
                  setOnlyMovieInspired(false);
                  setCurrentView('templates');
                }}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'templates'
                    ? 'bg-[#17130F] text-[#D6B574]'
                    : 'hover:bg-[#F8F1E5] text-[#17130F]/80'
                }`}
              >
                {tr('استكشف القوالب', 'Explore Templates')}
              </button>

              <button
                onClick={() => {
                  setPreviewingTemplateCard(null);
                  setSelectedTemplate(INITIAL_TEMPLATES[0]);
                  setEditingInvitation(undefined);
                  setCurrentView('editor');
                }}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'editor'
                    ? 'bg-[#17130F] text-[#D6B574]'
                    : 'hover:bg-[#F8F1E5] text-[#17130F]/80'
                }`}
              >
                {tr('أنشئ دعوتك', 'Create Invitation')}
              </button>

              <button
                onClick={() => {
                  setPreviewingTemplateCard(null);
                  setCurrentView('dashboard');
                }}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-[#17130F] text-[#D6B574]'
                    : 'hover:bg-[#F8F1E5] text-[#17130F]/80'
                }`}
              >
                <Users size={13} className="text-[#A98445]" />
                <span>{tr('إدارة الدعوات والضيوف', 'My Invitations')}</span>
              </button>

              <button
                onClick={() => {
                  setPreviewingTemplateCard(null);
                  setCurrentView('pricing');
                }}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'pricing'
                    ? 'bg-[#17130F] text-[#D6B574]'
                    : 'hover:bg-[#F8F1E5] text-[#17130F]/80'
                }`}
              >
                {tr('الباقات', 'Packages')}
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {(currentView === 'editor' || currentView === 'dashboard') && (
                <button
                  type="button"
                  onClick={toggleRoyalDark}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isRoyalDark
                      ? 'bg-[#123D32] text-[#D6B574] border-[#D6B574]'
                      : 'bg-[#F8F1E5] hover:bg-[#D6B574]/25 text-[#A98445] border-[#D6B574]/50'
                  }`}
                  title={tr('الوضع الليلي للمحرر ولوحة التحكم', 'Royal Dark Mode')}
                >
                  {isRoyalDark ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              )}

              <LanguageSwitcher />

              <button
                onClick={() => setCurrentView('login')}
                className="hidden sm:flex px-3.5 py-2 rounded-xl bg-[#F8F1E5] hover:bg-[#D6B574]/25 text-[#17130F] border border-[#D6B574]/40 font-bold text-xs items-center gap-1.5 transition-all cursor-pointer"
              >
                {currentUser ? <UserCheck size={14} /> : <LogIn size={14} />}
                <span>
                  {currentUser ? currentUser.fullName.split(' ')[0] : tr('دخول', 'Sign In')}
                </span>
              </button>

              <a
                href="/maraseem-platform-standalone.html"
                download="maraseem-royal-3d-platform.html"
                className="hidden sm:flex px-3.5 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#D6B574]/25 text-[#A98445] border border-[#D6B574]/60 font-bold text-xs items-center gap-1.5 transition-all cursor-pointer"
                title={tr('تحميل الموقع كملف HTML واحد متكامل', 'Download Full Standalone HTML')}
              >
                <span>{tr('تحميل HTML', 'Download HTML')}</span>
              </a>

              <button
                onClick={() => {
                  setPreviewingTemplateCard(null);
                  setSelectedTemplate(INITIAL_TEMPLATES[0]);
                  setEditingInvitation(undefined);
                  setCurrentView('editor');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#17130F] hover:bg-[#123D32] text-[#D6B574] border border-[#D6B574]/60 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>{tr('أنشئ دعوتك', 'Create Invitation')}</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/40 text-[#17130F]"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden px-4 py-4 bg-[#FFFDF8] border-b border-[#D6B574]/35 grid grid-cols-2 gap-2 text-xs font-bold overflow-hidden"
              >
                {[
                  { id: 'home', label: tr('الرئيسية', 'Home') },
                  { id: 'templates', label: tr('استكشف القوالب', 'Explore Templates') },
                  { id: 'editor', label: tr('أنشئ دعوتك', 'Create Invitation') },
                  { id: 'dashboard', label: tr('إدارة الدعوات والضيوف', 'Event & Guests') },
                  { id: 'birthday_experience', label: tr('تهنئة عيد الميلاد', 'Birthday Hub') },
                  { id: 'business_hub', label: tr('افتتاح الشركات', 'Business Events') },
                  { id: 'ai_designer', label: tr('المصمم الذكي', 'Smart Designer') },
                  { id: 'memories_hub', label: tr('ذكريات الحفل', 'Event Memories') },
                  { id: 'receptionist', label: tr('موظف الاستقبال QR', 'Receptionist QR') },
                  { id: 'pricing', label: tr('الباقات والأسعار', 'Packages') },
                  { id: 'partners', label: tr('برنامج الشركاء', 'Partners') },
                  { id: 'login', label: tr('تسجيل الدخول', 'Sign In') },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPreviewingTemplateCard(null);
                      setCurrentView(item.id as MaraseemRouteView);
                      setMobileMenuOpen(false);
                    }}
                    className="text-start py-2.5 px-3 rounded-xl bg-[#F8F1E5] hover:bg-[#D6B574]/25 text-[#17130F] border border-[#D6B574]/35 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      {/* INDEPENDENT TEMPLATE PREVIEW MODAL / PAGE (PART 1 & PART 2: Shows Template Cover, Short Description, "افتح الدعوة" button, and "استخدم هذا القالب" button without exposing couple/event details before opening) */}
      <AnimatePresence>
        {previewingTemplateCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#17130F]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setPreviewingTemplateCard(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[#FFFDF8] rounded-t-3xl sm:rounded-3xl border-2 border-[#D6B574] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.65)] pb-safe"
            >
              {/* Cover Visual */}
              <div
                className="relative w-full aspect-[16/10] flex items-center justify-center p-6 overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${previewingTemplateCard.themeColor} 0%, #17130F 100%)`,
                }}
              >
                {previewingTemplateCard.defaultValues.coverImage && (
                  <img
                    src={previewingTemplateCard.defaultValues.coverImage}
                    alt={
                      lang === 'ar'
                        ? previewingTemplateCard.name
                        : previewingTemplateCard.nameEn
                    }
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#17130F]/90 via-[#17130F]/35 to-transparent" />
                <div className="absolute inset-4 rounded-2xl border border-[#D6B574]/45 pointer-events-none" />

                <button
                  type="button"
                  onClick={() => setPreviewingTemplateCard(null)}
                  className="absolute top-5 left-5 z-20 w-9 h-9 rounded-full bg-[#17130F]/80 border border-[#D6B574]/50 text-[#F8F1E5] flex items-center justify-center hover:bg-[#17130F] cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <span className="absolute top-5 right-5 z-20 px-3.5 py-1 rounded-full bg-[#17130F]/85 border border-[#D6B574]/50 text-[#D6B574] text-xs font-bold">
                  {lang === 'en'
                    ? OCCASION_CATEGORY_LABELS[previewingTemplateCard.category]?.en ||
                      'Royal Template'
                    : OCCASION_CATEGORY_LABELS[previewingTemplateCard.category]?.ar ||
                      'قالب ملكي'}
                </span>

                <div className="relative z-10 text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-[#17130F]/90 border-2 border-[#D6B574] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(214,181,116,0.4)]">
                    <Crown size={26} className="text-[#D6B574]" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-amiri text-[#F8F1E5]">
                    {lang === 'ar'
                      ? previewingTemplateCard.name
                      : previewingTemplateCard.nameEn}
                  </h2>
                </div>
              </div>

              {/* Short Description & Primary Actions: "افتح الدعوة" + "استخدم هذا القالب" */}
              <div className="p-6 space-y-5 text-center">
                <p className="text-xs sm:text-sm text-[#5C5346] leading-relaxed max-w-md mx-auto">
                  {translateTemplateDesc(
                    previewingTemplateCard.id,
                    previewingTemplateCard.description
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const demoInv = buildDemoInvitationFromTemplate(previewingTemplateCard);
                      handlePreviewInvitation(demoInv);
                    }}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#17130F] hover:bg-[#123D32] text-[#D6B574] border border-[#D6B574] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Play size={16} className="fill-current" />
                    <span>{tr('افتح الدعوة', 'Open Invitation')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditorForTemplate(previewingTemplateCard)}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#D6B574] hover:bg-[#A98445] text-[#17130F] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles size={16} />
                    <span>{tr('استخدم هذا القالب', 'Use This Template')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN BODY ROUTER */}
      <main>
        {/* VIEW 1: HOMEPAGE REDESIGN (PART 1 — Minimal Royal Luxury, NO text above main headline, ONE main headline, short description below it, "اكتشف الدعوات" button, clean template grid without couple names/dates/venues, and NO 3D models loaded on homepage) */}
        {currentView === 'home' && (
          <div className="space-y-16 pb-20">
            {/* Minimal Royal Luxury Hero Section */}
            <section className="relative pt-14 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
              <div className="p-8 sm:p-14 rounded-[32px] bg-[#FFFFFF] border border-[#D6B574]/45 shadow-[0_16px_50px_rgba(23,19,15,0.06)] space-y-6 relative overflow-hidden">
                <div className="absolute inset-3 rounded-[24px] border border-[#D6B574]/25 pointer-events-none" />

                {/* 1 & 2: NO text above headline; ONE main headline only */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-amiri text-[#17130F] leading-tight">
                  {tr(
                    'مراسيم — دعوات إلكترونية ملكية تخلّد أجمل مناسباتكم',
                    'MARASEEM — Royal Digital Invitations for Unforgettable Moments'
                  )}
                </h1>

                {/* 3: Very short description below the headline */}
                <p className="text-sm sm:text-base text-[#5C5346] max-w-xl mx-auto leading-relaxed">
                  {tr(
                    'صمّم دعوتك الإلكترونية الفاخرة في دقائق وشاركها مع ضيوفك بتجربة تفاعلية راقية مصممة للهاتف المحمول.',
                    'Craft your luxury digital invitation in minutes and share a refined mobile-first interactive experience with your guests.'
                  )}
                </p>

                {/* 4: Main CTA button titled “اكتشف الدعوات” */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('home-templates-grid');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setCurrentView('templates');
                      }
                    }}
                    className="px-8 py-4 rounded-2xl bg-[#17130F] hover:bg-[#123D32] text-[#D6B574] border border-[#D6B574] font-bold text-sm sm:text-base shadow-[0_10px_30px_rgba(23,19,15,0.18)] transition-all cursor-pointer"
                  >
                    {tr('اكتشف الدعوات', 'Discover Invitations')}
                  </button>
                </div>
              </div>
            </section>

            {/* 5, 6, 7, 8, 9: Clean Organized Template Grid on Homepage (Shows ONLY Cover Visual, Template Name, and Occasion Category) */}
            <section
              id="home-templates-grid"
              className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8"
            >
              {/* Category Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6B574]/35 pb-4">
                <h2 className="text-2xl sm:text-3xl font-bold font-amiri text-[#17130F]">
                  {tr('مجموعة قوالب الدعوات الملكية', 'Royal Invitation Templates')}
                </h2>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all' as const, label: tr('جميع القوالب', 'All Templates') },
                    { id: 'engagement' as const, label: tr('الخطوبة', 'Engagement') },
                    { id: 'wedding' as const, label: tr('الزفاف', 'Wedding') },
                    { id: 'henna' as const, label: tr('الحناء', 'Henna') },
                    { id: 'birthday' as const, label: tr('أعياد الميلاد', 'Birthday') },
                    { id: 'graduation' as const, label: tr('التخرج', 'Graduation') },
                    {
                      id: 'graduation_project' as const,
                      label: tr('مشاريع التخرج', 'Graduation Projects'),
                    },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        selectedCategory === cat.id
                          ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                          : 'bg-[#FFFFFF] text-[#17130F] border-[#D6B574]/35 hover:border-[#A98445]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clean Grid of Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {INITIAL_TEMPLATES.filter(
                  (t) => selectedCategory === 'all' || t.category === selectedCategory
                )
                  .slice(0, 12)
                  .map((tpl) => renderCleanTemplateCard(tpl))}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentView('templates')}
                  className="px-7 py-3.5 rounded-2xl bg-[#FFFFFF] hover:bg-[#17130F] text-[#17130F] hover:text-[#D6B574] border border-[#D6B574] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
                >
                  {tr(
                    `عرض جميع القوالب في المعرض (${INITIAL_TEMPLATES.length})`,
                    `View All Templates (${INITIAL_TEMPLATES.length})`
                  )}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: TEMPLATE GALLERY (PART 2 & PART 5 — Clean Categories + Mobile Filter Bottom Sheet + Clean Cards) */}
        {currentView === 'templates' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6B574]/35">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-[#17130F]">
                  {tr(
                    `معرض قوالب الدعوات (${filteredTemplates.length})`,
                    `Template Gallery (${filteredTemplates.length})`
                  )}
                </h1>
                <p className="text-xs text-[#5C5346] mt-1">
                  {tr(
                    'اختر القالب المناسب لمناسبتك لمعاينته أو تخصيصه فوراً.',
                    'Select a template to preview or customize for your occasion.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Mobile Responsive Filter Bottom Sheet Trigger (PART 5) */}
                <button
                  type="button"
                  onClick={() => setMobileFilterSheetOpen(true)}
                  className="md:hidden px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D6B574]/50 text-[#17130F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal size={14} className="text-[#A98445]" />
                  <span>{tr('خيارات التصفية', 'Filter Options')}</span>
                </button>

                <button
                  onClick={() => setCurrentView('ai_designer')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#17130F] text-[#D6B574] border border-[#D6B574]/60 flex items-center gap-1.5 cursor-pointer"
                >
                  <Wand2 size={14} />
                  <span>{tr('المصمم الذكي', 'Smart Designer')}</span>
                </button>
              </div>
            </div>

            {/* Required Categories Bar (PART 2): جميع القوالب • الخطوبة • الزفاف • الحناء • أعياد الميلاد • التخرج • مشاريع التخرج */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'all' as const, label: tr('جميع القوالب', 'All Templates') },
                { id: 'engagement' as const, label: tr('الخطوبة', 'Engagement') },
                { id: 'wedding' as const, label: tr('الزفاف', 'Wedding') },
                { id: 'henna' as const, label: tr('الحناء', 'Henna') },
                { id: 'birthday' as const, label: tr('أعياد الميلاد', 'Birthday') },
                { id: 'graduation' as const, label: tr('التخرج', 'Graduation') },
                {
                  id: 'graduation_project' as const,
                  label: tr('مشاريع التخرج', 'Graduation Projects'),
                },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === c.id
                      ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574] shadow-xs'
                      : 'bg-[#FFFFFF] text-[#17130F] hover:border-[#A98445] border-[#D6B574]/35'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Desktop Secondary Filters */}
            <div className="hidden md:grid grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#D6B574]/35">
              <div>
                <label className="text-[11px] font-bold text-[#17130F] block mb-1">
                  {tr('الفئة:', 'Tier:')}
                </label>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'all' as const, label: tr('الكل', 'All') },
                    { id: 'free' as const, label: tr('مجاني', 'Free') },
                    { id: 'vip' as const, label: tr('ملكي', 'Royal') },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setMarketplaceTierFilter(tier.id)}
                      className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        marketplaceTierFilter === tier.id
                          ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                          : 'bg-[#F8F1E5] border-[#D6B574]/30 text-[#17130F]'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#17130F] block mb-1">
                  {tr('لوحة الألوان:', 'Color Palette:')}
                </label>
                <select
                  value={marketplaceColorFilter}
                  onChange={(e) => setMarketplaceColorFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/40 text-xs text-[#17130F] font-bold outline-none"
                >
                  <option value="all">{tr('جميع الألوان', 'All Colors')}</option>
                  <option value="ذهبي ملكي">{tr('ذهبي ملكي', 'Royal Gold')}</option>
                  <option value="أبيض دافئ">{tr('عاجي وأبيض لؤلؤي', 'Ivory & Pearl')}</option>
                  <option value="زمردي تراثي">{tr('أخضر زمردي', 'Emerald Green')}</option>
                  <option value="أسود سينمائي">{tr('أسود ملكي', 'Royal Black')}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#17130F] block mb-1">
                  {tr('التخصص الأكاديمي (للتخرج):', 'Academic Major:')}
                </label>
                <select
                  value={graduationMajorFilter}
                  onChange={(e) => setGraduationMajorFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/40 text-xs text-[#17130F] font-bold outline-none"
                >
                  <option value="all">{tr('جميع التخصصات', 'All Majors')}</option>
                  <option value="medicine">{tr('الطب البشري', 'Medicine')}</option>
                  <option value="dentistry">{tr('طب الأسنان', 'Dentistry')}</option>
                  <option value="ai_tech">{tr('الهندسة والذكاء الاصطناعي', 'Engineering & AI')}</option>
                  <option value="law">{tr('القانون', 'Law')}</option>
                </select>
              </div>
            </div>

            {/* Clean Template Cards Grid (Cover + Name + Occasion + Preview Button ONLY) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((tpl) => renderCleanTemplateCard(tpl))}
            </div>

            {/* PART 5: Mobile Filter Bottom Sheet */}
            {mobileFilterSheetOpen && (
              <div
                className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex flex-col justify-end"
                onClick={() => setMobileFilterSheetOpen(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#FFFDF8] rounded-t-3xl border-t-2 border-[#D6B574] p-5 space-y-4 pb-safe max-h-[80vh] overflow-y-auto shadow-2xl"
                >
                  <div className="w-12 h-1.5 bg-[#D6B574]/60 rounded-full mx-auto" />
                  <div className="flex items-center justify-between pb-2 border-b border-[#D6B574]/30">
                    <span className="text-sm font-bold text-[#17130F]">
                      {tr('تصفية القوالب', 'Filter Templates')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobileFilterSheetOpen(false)}
                      className="p-1.5 rounded-full bg-[#F8F1E5] text-[#17130F]"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#17130F] block">
                      {tr('نوع المناسبة:', 'Occasion:')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'all' as const, label: tr('جميع القوالب', 'All Templates') },
                        { id: 'engagement' as const, label: tr('الخطوبة', 'Engagement') },
                        { id: 'wedding' as const, label: tr('الزفاف', 'Wedding') },
                        { id: 'henna' as const, label: tr('الحناء', 'Henna') },
                        { id: 'birthday' as const, label: tr('أعياد الميلاد', 'Birthday') },
                        { id: 'graduation' as const, label: tr('التخرج', 'Graduation') },
                        {
                          id: 'graduation_project' as const,
                          label: tr('مشاريع التخرج', 'Graduation Projects'),
                        },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCategory(c.id)}
                          className={`p-2.5 rounded-xl text-xs font-bold border text-right flex items-center justify-between ${
                            selectedCategory === c.id
                              ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]'
                              : 'bg-[#F8F1E5] text-[#17130F] border-[#D6B574]/35'
                          }`}
                        >
                          <span>{c.label}</span>
                          {selectedCategory === c.id && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#17130F] block">
                      {tr('لوحة الألوان:', 'Color Palette:')}
                    </label>
                    <select
                      value={marketplaceColorFilter}
                      onChange={(e) => setMarketplaceColorFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] font-bold outline-none"
                    >
                      <option value="all">{tr('جميع الألوان', 'All Colors')}</option>
                      <option value="ذهبي ملكي">{tr('ذهبي ملكي', 'Royal Gold')}</option>
                      <option value="أبيض دافئ">{tr('عاجي وأبيض لؤلؤي', 'Ivory & Pearl')}</option>
                      <option value="زمردي تراثي">{tr('أخضر زمردي', 'Emerald Green')}</option>
                      <option value="أسود سينمائي">{tr('أسود ملكي', 'Royal Black')}</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileFilterSheetOpen(false)}
                    className="w-full py-3 rounded-2xl bg-[#17130F] text-[#D6B574] font-bold text-xs"
                  >
                    {tr('عرض النتائج', 'Apply Filters')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: INVITATION LIVE EDITOR */}
        {currentView === 'editor' && (
          <InvitationEditor
            template={selectedTemplate}
            initialData={editingInvitation}
            onSave={handleSaveInvitation}
            onCancel={() => setCurrentView('templates')}
          />
        )}

        {/* VIEW 4: USER DASHBOARD */}
        {currentView === 'dashboard' && (
          <UserDashboard
            invitations={invitations}
            rsvps={rsvps}
            guestbook={guestbook}
            tables={tables}
            invitedGuests={invitedGuests}
            onCreateNew={() => {
              setSelectedTemplate(INITIAL_TEMPLATES[0]);
              setEditingInvitation(undefined);
              setCurrentView('editor');
            }}
            onEdit={handleOpenEditorForExisting}
            onDelete={handleDeleteInvitation}
            onPreview={handlePreviewInvitation}
            onDeleteGuestbookMessage={handleDeleteGuestbookMessage}
            onAddTable={handleAddTable}
            onDeleteTable={handleDeleteTable}
            onAssignGuest={handleAssignGuest}
            onAddInvitedGuest={handleAddInvitedGuest}
            onDeleteInvitedGuest={handleDeleteInvitedGuest}
            onCheckInGuest={handleCheckInGuest}
            onAssignInvitedGuestTable={handleAssignInvitedGuestTable}
            onMarkReminderSent={handleMarkReminderSent}
            onOpenReceptionistMode={() => setCurrentView('receptionist')}
            onPreviewPersonalGuest={(inv, guest) => handlePreviewInvitation(inv, guest)}
            onUpdateInvitation={handleSaveInvitation}
            onApproveGuestbookMessage={handleApproveGuestbookMessage}
          />
        )}

        {/* VIEW 5: TEMPLATE SCHEMA EXPLORER */}
        {currentView === 'schema_explorer' && <TemplateSchemaExplorer />}

        {/* VIEW 6: AI INVITATION DESIGNER */}
        {currentView === 'ai_designer' && (
          <AIInvitationDesigner
            onAdoptDesign={(generatedInv) => {
              setInvitations((prev) => [generatedInv, ...prev]);
              setSelectedTemplate(
                INITIAL_TEMPLATES.find((t) => t.id === generatedInv.templateId) ||
                  INITIAL_TEMPLATES[0]
              );
              setEditingInvitation(generatedInv);
              setCurrentView('editor');
            }}
            onPublishDirect={(generatedInv) => {
              setInvitations((prev) => [generatedInv, ...prev]);
              handlePreviewInvitation(generatedInv);
            }}
          />
        )}

        {/* VIEW 7: BUSINESS EVENT PAGES HUB */}
        {currentView === 'business_hub' && (
          <BusinessEventHub
            onPublishBusinessInvite={(bizInv) => {
              setInvitations((prev) => {
                const exists = prev.some((i) => i.id === bizInv.id);
                return exists
                  ? prev.map((i) => (i.id === bizInv.id ? bizInv : i))
                  : [bizInv, ...prev];
              });
              handlePreviewInvitation(bizInv);
            }}
            onEditInStudio={(bizInv) => {
              setInvitations((prev) => {
                const exists = prev.some((i) => i.id === bizInv.id);
                return exists
                  ? prev.map((i) => (i.id === bizInv.id ? bizInv : i))
                  : [bizInv, ...prev];
              });
              handleOpenEditorForExisting(bizInv);
            }}
          />
        )}

        {/* VIEW 8: WEDDING MEMORIES HUB */}
        {currentView === 'memories_hub' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#D6B574]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-[#17130F] flex items-center gap-2">
                  <Camera size={18} className="text-[#A98445]" />
                  <span>{tr('مساحة ذكريات المناسبة بعد الحفل', 'Post-Event Wedding Memories')}</span>
                </h2>
                <p className="text-xs text-[#5C5346] mt-0.5">
                  {tr(
                    'اختر المناسبة لمعاينة وإدارة ألبوم الصور والفيديوهات ورسالة الشكر ودفتر الضيوف.',
                    'Select an event to preview and manage the photo album, videos, thank-you message, and guestbook.'
                  )}
                </p>
              </div>
              <select
                value={(selectedInvitation || invitations[0] || INITIAL_INVITATIONS[0]).id}
                onChange={(e) => {
                  const found = invitations.find((i) => i.id === e.target.value);
                  if (found) setSelectedInvitation(found);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#F8F1E5] border border-[#D6B574]/45 text-xs text-[#17130F] font-bold outline-none"
              >
                {invitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.title}
                  </option>
                ))}
              </select>
            </div>

            <WeddingMemoriesView
              invitation={selectedInvitation || invitations[0] || INITIAL_INVITATIONS[0]}
              guestbook={guestbook.filter(
                (g) =>
                  g.invitationId ===
                  (selectedInvitation || invitations[0] || INITIAL_INVITATIONS[0]).id
              )}
              onAddGuestbook={handleAddGuestbook}
              onUpdateInvitation={(updated) => {
                setSelectedInvitation(updated);
                setInvitations((prev) =>
                  prev.map((i) => (i.id === updated.id ? updated : i))
                );
              }}
              isHostMode={true}
            />
          </div>
        )}

        {/* VIEW 9: DEDICATED RECEPTIONIST QR SCANNER VIEW */}
        {currentView === 'receptionist' && (
          <ReceptionistScannerView
            invitations={invitations}
            invitedGuests={invitedGuests}
            onCheckInGuest={handleCheckInGuest}
            onAssignGuestTable={handleAssignInvitedGuestTable}
            onExitReceptionistMode={
              isUrlReceptionistMode ? undefined : () => setCurrentView('dashboard')
            }
            isStandaloneReceptionist={isUrlReceptionistMode}
          />
        )}

        {/* VIEW 10: PARTNER PROGRAM PORTAL */}
        {currentView === 'partners' && (
          <PartnerPortal
            partners={partners}
            onRegisterPartner={(newPartner) => {
              const record: PartnerAccount = {
                ...newPartner,
                id: `partner-${Date.now()}`,
                totalReferrals: 0,
                activeOrders: 0,
                totalSalesIQD: 0,
                totalCommissionIQD: 0,
                status: 'active',
                orders: [],
              };
              setPartners((prev) => [record, ...prev]);
            }}
            onAddPartnerOrder={(partnerId, clientName, eventTitle, packageName, amountIQD) => {
              setPartners((prev) =>
                prev.map((p) => {
                  if (p.id !== partnerId) return p;
                  const commissionAmountIQD = Math.round(
                    (amountIQD * p.commissionRatePercent) / 100
                  );
                  const newOrder = {
                    id: `ord-${Date.now()}`,
                    clientName,
                    eventTitle,
                    packageName,
                    orderAmountIQD: amountIQD,
                    commissionAmountIQD,
                    status: 'completed' as const,
                    date: new Date().toISOString().split('T')[0],
                  };
                  return {
                    ...p,
                    totalReferrals: p.totalReferrals + 1,
                    activeOrders: p.activeOrders + 1,
                    totalSalesIQD: p.totalSalesIQD + amountIQD,
                    totalCommissionIQD: p.totalCommissionIQD + commissionAmountIQD,
                    orders: [newOrder, ...p.orders],
                  };
                })
              );
            }}
          />
        )}

        {/* VIEW 11: PRICING PACKAGES, COUPONS & MARKETING */}
        {currentView === 'pricing' && (
          <PricingAndMarketingView
            packages={pricingPackages}
            coupons={discountCoupons}
            reviews={customerReviews}
            sampleInvitation={invitations[0] || INITIAL_INVITATIONS[0]}
            onSelectPackage={(pkg) => {
              if (pkg.id === 'business') {
                setCurrentView('business_hub');
              } else {
                setSelectedTemplate(INITIAL_TEMPLATES[0]);
                setEditingInvitation(undefined);
                setCurrentView('editor');
              }
            }}
            onPreviewTestInvitation={(guestName, seats) =>
              handlePreviewInvitation(invitations[0] || INITIAL_INVITATIONS[0], {
                guestName,
                allocatedSeats: seats,
                isFamilyInvite: seats > 2,
              })
            }
            onAddReview={(rev) =>
              setCustomerReviews((prev) => [
                {
                  ...rev,
                  id: `rev-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  isFeatured: true,
                },
                ...prev,
              ])
            }
          />
        )}

        {/* VIEW 12: CENTRAL ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard
            invitations={invitations}
            templates={INITIAL_TEMPLATES}
            invitedGuests={invitedGuests}
            packages={pricingPackages}
            coupons={discountCoupons}
            partners={partners}
            reviews={customerReviews}
            siteSlogan={siteSlogan}
            onUpdateSlogan={setSiteSlogan}
            onUpdatePackagePrice={(pkgId, newPriceIQD, newPriceUSD) => {
              setPricingPackages((prev) =>
                prev.map((p) =>
                  p.id === pkgId ? { ...p, priceIQD: newPriceIQD, priceUSD: newPriceUSD } : p
                )
              );
            }}
            onAddCoupon={(newCoupon) => {
              setDiscountCoupons((prev) => [
                { ...newCoupon, id: `cpn-${Date.now()}`, usageCount: 0 },
                ...prev,
              ]);
            }}
            onToggleCoupon={(id) => {
              setDiscountCoupons((prev) =>
                prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
              );
            }}
            onDeleteCoupon={(id) => {
              setDiscountCoupons((prev) => prev.filter((c) => c.id !== id));
            }}
            onDeleteReview={(id) => {
              setCustomerReviews((prev) => prev.filter((r) => r.id !== id));
            }}
            onDeleteInvitation={handleDeleteInvitation}
            onPreviewInvitation={(inv) => handlePreviewInvitation(inv)}
            onSwitchRole={handleSwitchRole}
            birthdayTemplates={birthdayTemplates}
            birthdayGreetings={birthdayGreetings}
            onAddBirthdayTemplate={(newTpl) => {
              setBirthdayTemplates((prev) => [newTpl, ...prev]);
            }}
            onUpdateBirthdayTemplate={(tplId, tier, priceIQD, priceUSD) => {
              setBirthdayTemplates((prev) =>
                prev.map((t) =>
                  t.id === tplId ? { ...t, tier, priceIQD, priceUSD } : t
                )
              );
            }}
            onDeleteBirthdayTemplate={(tplId) => {
              setBirthdayTemplates((prev) => prev.filter((t) => t.id !== tplId));
            }}
            onDeleteBirthdayGreeting={(id) => {
              setBirthdayGreetings((prev) => prev.filter((g) => g.id !== id));
            }}
            onPreviewBirthdayGreeting={(greeting) => handlePreviewBirthdayGreeting(greeting)}
          />
        )}

        {/* VIEW 12B: INTERACTIVE BIRTHDAY EXPERIENCE HUB */}
        {currentView === 'birthday_experience' && (
          <BirthdayExperienceHub
            templates={birthdayTemplates}
            greetings={birthdayGreetings}
            onSaveGreeting={(greeting) => {
              setBirthdayGreetings((prev) => {
                const exists = prev.some((g) => g.id === greeting.id);
                return exists
                  ? prev.map((g) => (g.id === greeting.id ? greeting : g))
                  : [greeting, ...prev];
              });
              setSelectedBirthdayGreeting(greeting);
            }}
            onDeleteGreeting={(id) => {
              setBirthdayGreetings((prev) => prev.filter((g) => g.id !== id));
            }}
            onPreviewStandalone={(greeting) => handlePreviewBirthdayGreeting(greeting)}
          />
        )}

        {/* VIEW 12C: STANDALONE RECIPIENT BIRTHDAY EXPERIENCE VIEW */}
        {currentView === 'view_birthday' && selectedBirthdayGreeting && (
          <div className="invitation-isolated min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center px-3 sm:px-6 py-6 sm:py-10 relative overflow-hidden">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_15%,_rgba(212,175,55,0.14),_transparent_65%)]" />

            <div className="w-full max-w-3xl relative z-10 my-auto">
              <BirthdayExperiencePlayer
                greeting={selectedBirthdayGreeting}
                isEmbeddedPreview={false}
                onShareCountIncrement={() => {
                  setBirthdayGreetings((prev) =>
                    prev.map((g) =>
                      g.id === selectedBirthdayGreeting.id
                        ? { ...g, sharesCount: (g.sharesCount || 0) + 1 }
                        : g
                    )
                  );
                }}
              />
            </div>

            {isCreatorPreviewing && !hideCreatorFloatingBar && (
              <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 flex flex-wrap items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-2xl bg-[#FFFDF8]/95 backdrop-blur-md border border-[#D6B574] shadow-xl text-xs text-[#17130F]">
                <span className="text-[11px] font-bold flex items-center gap-1.5">
                  <Cake size={13} className="text-[#A98445]" />
                  <span>{tr('شريط المنشئ:', 'Creator Bar:')}</span>
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const url = buildShareableBirthdayUrl(selectedBirthdayGreeting);
                      navigator.clipboard.writeText(url);
                      setCopiedStandaloneToast(true);
                      setTimeout(() => setCopiedStandaloneToast(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#17130F] text-[#D6B574] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={13} />
                    <span>
                      {copiedStandaloneToast
                        ? tr('تم النسخ ✓', 'Copied ✓')
                        : tr('نسخ رابط التهنئة', 'Copy Link')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHideCreatorFloatingBar(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F8F1E5] text-[#17130F] border border-[#D6B574]/45 text-[11px] font-semibold cursor-pointer"
                  >
                    {tr('معاينة كمستلم', 'Recipient View')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.history.pushState({}, '', window.location.pathname);
                      } catch {
                        window.location.hash = '';
                      }
                      setIsCreatorPreviewing(false);
                      setCurrentView('birthday_experience');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F8F1E5] text-[#17130F] border border-[#D6B574]/45 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight size={13} className={isRTL ? '' : 'rotate-180'} />
                    <span>{tr('العودة', 'Back')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 13: DEDICATED STANDALONE GUEST INVITATION VIEW (PART 7) */}
        {currentView === 'view_invitation' && selectedInvitation && (
          <div className="invitation-isolated min-h-screen w-full bg-[#17130F] flex flex-col items-center justify-center px-2 sm:px-6 py-4 sm:py-8 relative overflow-hidden">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_15%,_rgba(214,181,116,0.12),_transparent_65%)]" />

            <div className="w-full max-w-3xl relative z-10 my-auto">
              <InteractiveInvitationView
                invitation={selectedInvitation}
                isEmbeddedPreview={false}
                isStandaloneGuest={!isCreatorPreviewing || hideCreatorFloatingBar}
                onSaveRSVP={handleSaveRSVP}
                onAddGuestbook={handleAddGuestbook}
                guestbookMessages={guestbook.filter(
                  (g) => g.invitationId === selectedInvitation.id
                )}
                personalizedGuestOverride={personalizedGuestOverride}
                onUpdateInvitation={(updated) => {
                  setSelectedInvitation(updated);
                  setInvitations((prev) =>
                    prev.map((i) => (i.id === updated.id ? updated : i))
                  );
                }}
              />
            </div>

            {isCreatorPreviewing && !hideCreatorFloatingBar && (
              <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 flex flex-wrap items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-2xl bg-[#FFFDF8]/95 backdrop-blur-md border border-[#D6B574] shadow-xl text-xs text-[#17130F]">
                <span className="text-[11px] font-bold flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#A98445]" />
                  <span>
                    {tr('معاينة الدعوة:', 'Preview Mode:')}
                  </span>
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenEditorForExisting(selectedInvitation)}
                    className="px-3 py-1.5 rounded-xl bg-[#D6B574] text-[#17130F] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>{tr('تخصيص هذا القالب', 'Use & Customize')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const url = buildShareableInvitationUrl(selectedInvitation);
                      navigator.clipboard.writeText(url);
                      setCopiedStandaloneToast(true);
                      setTimeout(() => setCopiedStandaloneToast(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#17130F] text-[#D6B574] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={13} />
                    <span>
                      {copiedStandaloneToast
                        ? tr('تم النسخ ✓', 'Copied ✓')
                        : tr('نسخ رابط الدعوة', 'Copy Link')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHideCreatorFloatingBar(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F8F1E5] text-[#17130F] border border-[#D6B574]/45 text-[11px] font-semibold cursor-pointer"
                  >
                    {tr('عرض كضيف', 'Guest View')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.history.pushState({}, '', window.location.pathname);
                      } catch {
                        window.location.hash = '';
                      }
                      setIsCreatorPreviewing(false);
                      setPersonalizedGuestOverride(null);
                      setCurrentView('templates');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F8F1E5] text-[#17130F] border border-[#D6B574]/45 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight size={13} className={isRTL ? '' : 'rotate-180'} />
                    <span>{tr('العودة للقوالب', 'Back')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 14: OFFICIAL LOGIN PORTAL */}
        {currentView === 'login' && (
          <LoginPortalView
            currentUser={currentUser}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              safeSetLocalStorage('maraseem_auth_user', user);
            }}
            onLogout={() => {
              setCurrentUser(null);
              try {
                localStorage.removeItem('maraseem_auth_user');
              } catch {
                // ignore
              }
            }}
            onNavigateToView={(view: MaraseemRouteView) => setCurrentView(view)}
          />
        )}

        {/* VIEW 15: CUSTOM DOMAIN & SEO HUB */}
        {currentView === 'domain_hub' && (
          <CustomDomainAndSeoHub
            onNavigateToView={(view: MaraseemRouteView) => setCurrentView(view)}
          />
        )}
      </main>

      {/* 3. PART 8 – FOOTER REDESIGN (Minimal Royal Luxury Footer: MARASEEM, “نحوّل مناسباتكم إلى ذكريات لا تُنسى.”, 7 Links, © 2026 MARASEEM. All Rights Reserved.) */}
      {currentView !== 'view_invitation' &&
        currentView !== 'view_birthday' &&
        !isUrlReceptionistMode && (
        <footer className="border-t border-[#D6B574]/40 bg-[#17130F] text-[#F8F1E5] py-12 font-cairo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold font-amiri tracking-widest text-[#D6B574]">
                MARASEEM
              </div>
              <p className="text-sm text-[#F8F1E5]/90 font-amiri">
                {tr(
                  '“نحوّل مناسباتكم إلى ذكريات لا تُنسى.”',
                  '“Transforming your occasions into unforgettable memories.”'
                )}
              </p>
            </div>

            {/* Required 7 Footer Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold text-[#F8F1E5]/85">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#D6B574] transition-colors cursor-pointer"
              >
                {tr('الرئيسية', 'Home')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('templates');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#D6B574] transition-colors cursor-pointer"
              >
                {tr('استكشف القوالب', 'Explore Templates')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate(INITIAL_TEMPLATES[0]);
                  setEditingInvitation(undefined);
                  setCurrentView('editor');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#D6B574] transition-colors cursor-pointer"
              >
                {tr('أنشئ دعوتك', 'Create Your Invitation')}
              </button>

              <button
                type="button"
                onClick={() => setFooterInfoModal('about')}
                className="hover:text-[#D6B574] transition-colors cursor-pointer"
              >
                {tr('من نحن', 'About Us')}
              </button>

              <button
                type="button"
                onClick={() => setFooterInfoModal('contact')}
                className="hover:text-[#D6B574] transition-colors cursor-pointer"
              >
                {tr('تواصل معنا', 'Contact Us')}
              </button>

              <button
                type="button"
                onClick={() => setFooterInfoModal('privacy')}
                className="hover:text-[#D6B574] transition-colors cursor-pointer"
              >
                {tr('سياسة الخصوصية', 'Privacy Policy')}
              </button>

              <button
                type="button"
                onClick={() => setFooterInfoModal('terms')}
                className="hover:text-[#D6B574] transition-colors cursor-pointer"
              >
                {tr('شروط الاستخدام', 'Terms of Use')}
              </button>
            </nav>

            <div className="pt-6 border-t border-[#D6B574]/20 text-xs text-[#D6B574]/80 font-mono">
              © 2026 MARASEEM. All Rights Reserved.
            </div>
          </div>
        </footer>
      )}

      {/* Clean Info Modal for Footer Links (من نحن / تواصل معنا / سياسة الخصوصية / شروط الاستخدام — No fake info) */}
      <AnimatePresence>
        {footerInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFooterInfoModal(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-[#FFFDF8] border-2 border-[#D6B574] p-6 space-y-4 text-[#17130F] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#D6B574]/30 pb-3">
                <h3 className="text-lg font-bold font-amiri text-[#17130F]">
                  {footerInfoModal === 'about' && tr('من نحن — MARASEEM', 'About MARASEEM')}
                  {footerInfoModal === 'contact' && tr('تواصل معنا', 'Contact Us')}
                  {footerInfoModal === 'privacy' && tr('سياسة الخصوصية', 'Privacy Policy')}
                  {footerInfoModal === 'terms' && tr('شروط الاستخدام', 'Terms of Use')}
                </h3>
                <button
                  type="button"
                  onClick={() => setFooterInfoModal(null)}
                  className="p-1.5 rounded-full bg-[#F8F1E5] text-[#17130F] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-[#5C5346] leading-relaxed space-y-2">
                {footerInfoModal === 'about' && (
                  <p>
                    مراسيم (MARASEEM) منصة متخصصة في تصميم وإنشاء الدعوات الإلكترونية الملكية والتجارب التفاعلية ثلاثية الأبعاد لمناسبات الزفاف، الخطوبة، الحناء، أعياد الميلاد، وحفلات التخرج، مع نظام متكامل لإدارة المدعوين وتأكيد الحضور.
                  </p>
                )}
                {footerInfoModal === 'contact' && (
                  <p>
                    يسعدنا استقبال استفساراتكم وطلبات تصميم الدعوات المخصصة مباشرة عبر حسابكم في المنصة أو من خلال لوحة إدارة المناسبات الخاصة بكم.
                  </p>
                )}
                {footerInfoModal === 'privacy' && (
                  <p>
                    تحترم منصة مراسيم خصوصية بيانات مناسباتكم وصوركم وقوائم ضيوفكم؛ تُستخدم البيانات حصرياً لعرض دعوتكم التفاعلية لمن تشاركون معهم رابط الدعوة، مع إمكانية حماية أي دعوة بكلمة مرور خاصة.
                  </p>
                )}
                {footerInfoModal === 'terms' && (
                  <p>
                    باستخدامك لمنصة مراسيم، يمكنك إنشاء وتخصيص ومشاركة دعواتك الإلكترونية بحرية مع ضيوفك، مع الالتزام باستخدام المحتوى والصور الملائمة للمناسبات الاجتماعية والرسمية.
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setFooterInfoModal(null)}
                  className="px-5 py-2 rounded-xl bg-[#17130F] text-[#D6B574] text-xs font-bold cursor-pointer"
                >
                  {tr('إغلاق', 'Close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
