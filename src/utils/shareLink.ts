import { InvitationData } from '../types/invitation';
import { INITIAL_INVITATIONS, INITIAL_TEMPLATES } from '../data/templates';

function toBase64Url(str: string): string {
  try {
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return '';
  }
}

function fromBase64Url(base64Url: string): string {
  try {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

/**
 * Sanitizes a slug so the invitation URL is neat, readable, and URL-friendly.
 */
export function sanitizeInvitationSlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || 'special-invite';
}

/**
 * Returns true if the current browser URL is a direct standalone invitation link (`?i=...`, `?invite=...`, or `#invitation-...`).
 */
export function isStandaloneInvitationUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';
  return (
    params.has('i') ||
    params.has('invite') ||
    params.has('d') ||
    hash.startsWith('#invitation-')
  );
}

/**
 * Builds a neat, short, standalone guest-only URL that opens ONLY the invitation experience
 * (completely isolated from the platform website).
 * Uses delta-encoding against the template's default values so only customized fields are added.
 */
export function buildShareableInvitationUrl(invitation: InvitationData): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  const cleanSlug = sanitizeInvitationSlug(invitation.slug || invitation.id);
  const tpl =
    INITIAL_TEMPLATES.find((t) => t.id === invitation.templateId) || INITIAL_TEMPLATES[0];
  const presetInvite = INITIAL_INVITATIONS.find(
    (inv) => inv.slug === cleanSlug || inv.id === invitation.id
  );
  const baseDefaults: Partial<InvitationData> = {
    ...(tpl?.defaultValues || {}),
    ...(presetInvite || {}),
  };

  // Field mapping: short key -> property name on InvitationData
  const fieldMap: Array<[string, keyof InvitationData]> = [
    ['c', 'category'],
    ['ti', 'title'],
    ['at', 'atelierTheme'],
    ['gn', 'groomName'],
    ['gf', 'groomFamily'],
    ['bn', 'brideName'],
    ['bf', 'brideFamily'],
    ['hn', 'hostNames'],
    ['grn', 'graduateName'],
    ['uni', 'university'],
    ['col', 'college'],
    ['maj', 'major'],
    ['gy', 'graduationYear'],
    ['ht', 'honorsTitle'],
    ['bsn', 'birthdayStarName'],
    ['age', 'age'],
    ['bzn', 'businessName'],
    ['bzt', 'businessType'],
    ['ed', 'eventDate'],
    ['et', 'eventTime'],
    ['hd', 'hijriDate'],
    ['vn', 'venueName'],
    ['ct', 'city'],
    ['ad', 'addressDetails'],
    ['gm', 'googleMapsUrl'],
    ['spn', 'startPointName'],
    ['spu', 'startPointUrl'],
    ['wz', 'wazeUrl'],
    ['cp', 'contactPhone'],
    ['cs', 'ceremonyScheduleText'],
    ['wq', 'welcomeQuote'],
    ['ib', 'invitationBody'],
    ['dc', 'dressCode'],
    ['nt', 'notes'],
    ['mt', 'musicTrack'],
    ['ve', 'visualEffect'],
    ['pt', 'pageTransitionMode'],
    ['ctT', 'countdownTitle'],
    ['ctS', 'countdownStyle'],
    ['ctC', 'countdownDigitColor'],
    ['ctF', 'countdownDigitFont'],
    ['ctN', 'countdownNumeralSystem'],
    ['cP', 'customPrimaryColor'],
    ['cS', 'customSecondaryColor'],
    ['cB', 'customBgColor'],
    ['bzS', 'businessSector'],
    ['bzP', 'isPermanentBusinessPage'],
    ['bzW', 'businessWorkingHours'],
    ['bzI', 'businessInstagram'],
  ];

  const deltaPayload: Record<string, unknown> = {};

  // Always include templateId if this slug isn't one of the built-in INITIAL_INVITATIONS
  if (!presetInvite || presetInvite.templateId !== invitation.templateId) {
    deltaPayload.t = invitation.templateId;
  }

  for (const [shortKey, propKey] of fieldMap) {
    const val = invitation[propKey];
    const baseVal = baseDefaults[propKey];
    if (val !== undefined && val !== '' && val !== baseVal) {
      deltaPayload[shortKey] = val;
    }
  }

  if (invitation.memoriesConfig?.isPostEventActive) {
    deltaPayload.mem = 1;
  }

  if (
    invitation.coverImage &&
    invitation.coverImage !== baseDefaults.coverImage &&
    !invitation.coverImage.startsWith('data:') &&
    !invitation.coverImage.startsWith('blob:')
  ) {
    deltaPayload.ci = invitation.coverImage;
  }

  if (
    invitation.couplePortraitImage &&
    invitation.couplePortraitImage !== baseDefaults.couplePortraitImage &&
    !invitation.couplePortraitImage.startsWith('data:') &&
    !invitation.couplePortraitImage.startsWith('blob:')
  ) {
    deltaPayload.cpi = invitation.couplePortraitImage;
  }

  if (
    invitation.backgroundVideoUrl &&
    invitation.backgroundVideoUrl !== baseDefaults.backgroundVideoUrl &&
    !invitation.backgroundVideoUrl.startsWith('data:') &&
    !invitation.backgroundVideoUrl.startsWith('blob:')
  ) {
    deltaPayload.bvu = invitation.backgroundVideoUrl;
  }

  const deltaKeys = Object.keys(deltaPayload);

  // If no customizations differ from the preset invitation, return a super clean `?i=slug` link!
  if (deltaKeys.length === 0 && presetInvite) {
    return `${origin}${pathname}?i=${encodeURIComponent(cleanSlug)}`;
  }

  // If only templateId is needed and everything else matches template defaults
  if (deltaKeys.length === 1 && deltaPayload.t) {
    return `${origin}${pathname}?i=${encodeURIComponent(cleanSlug)}&t=${encodeURIComponent(
      String(deltaPayload.t)
    )}`;
  }

  const encoded = toBase64Url(JSON.stringify(deltaPayload));
  return `${origin}${pathname}?i=${encodeURIComponent(cleanSlug)}&d=${encoded}`;
}

export interface PersonalizedGuestContext {
  guestId?: string;
  guestName: string;
  familyTitle?: string;
  isFamilyInvite: boolean;
  allocatedSeats: number;
  group?: string;
  tableNumber?: number;
  qrCodeToken?: string;
}

/**
 * Builds a unique personalized invitation link for a specific guest or family
 * with their name, allocated seat count, family group, table number, and QR check-in token.
 */
export function buildPersonalizedGuestUrl(
  invitation: InvitationData,
  guest: {
    id?: string;
    name: string;
    familyTitle?: string;
    isFamilyInvite?: boolean;
    allocatedSeats: number;
    group?: string;
    tableNumber?: number;
    qrCodeToken?: string;
  }
): string {
  const baseUrl = buildShareableInvitationUrl(invitation);
  const sep = baseUrl.includes('?') ? '&' : '?';
  const params = new URLSearchParams();
  params.set('g', guest.familyTitle || guest.name);
  params.set('seats', String(guest.allocatedSeats || 1));
  if (guest.isFamilyInvite) params.set('fam', '1');
  if (guest.group) params.set('grp', guest.group);
  if (guest.tableNumber) params.set('tbl', String(guest.tableNumber));
  if (guest.id) params.set('gid', guest.id);
  if (guest.qrCodeToken) params.set('qr', guest.qrCodeToken);
  return `${baseUrl}${sep}${params.toString()}`;
}

/**
 * Extracts personalized guest context if the current URL contains `?g=...` or `&seats=...`
 */
export function parsePersonalizedGuestFromLocation(): PersonalizedGuestContext | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const guestName = params.get('g') || params.get('guest') || '';
  if (!guestName) return null;

  const seatsRaw = parseInt(params.get('seats') || '2', 10);
  const tblRaw = params.get('tbl') ? parseInt(params.get('tbl')!, 10) : undefined;

  return {
    guestId: params.get('gid') || undefined,
    guestName,
    familyTitle: guestName,
    isFamilyInvite: params.get('fam') === '1' || guestName.includes('عائلة'),
    allocatedSeats: Number.isNaN(seatsRaw) || seatsRaw < 1 ? 2 : seatsRaw,
    group: params.get('grp') || undefined,
    tableNumber: tblRaw && !Number.isNaN(tblRaw) ? tblRaw : undefined,
    qrCodeToken: params.get('qr') || undefined,
  };
}

/**
 * Parses the current browser URL (`?i=...`, `?invite=...`, or `#invitation-...`) and returns
 * the matching or reconstructed InvitationData so any guest opening the link sees ONLY the invitation immediately.
 */
export function parseSharedInvitationFromLocation(
  existingInvitations: InvitationData[]
): InvitationData | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';

  let slug = params.get('i') || params.get('invite') || '';
  let templateParam = params.get('t') || '';
  let encodedData = params.get('d') || '';

  if (hash.startsWith('#invitation-')) {
    const hashContent = hash.replace('#invitation-', '');
    const [hashSlug, hashQuery] = hashContent.split('?');
    if (!slug && hashSlug) {
      slug = decodeURIComponent(hashSlug);
    }
    if (!encodedData && hashQuery) {
      const hashParams = new URLSearchParams(hashQuery);
      encodedData = hashParams.get('d') || '';
      if (!templateParam) {
        templateParam = hashParams.get('t') || '';
      }
    }
  }

  if (!slug && !encodedData && !templateParam) {
    return null;
  }

  const localMatch =
    existingInvitations.find((i) => i.slug === slug || i.id === slug) ||
    INITIAL_INVITATIONS.find((i) => i.slug === slug || i.id === slug);

  // If there's no encoded delta payload, check if templateParam or localMatch can build the invitation
  if (!encodedData) {
    if (localMatch) return localMatch;
    if (templateParam) {
      const tpl =
        INITIAL_TEMPLATES.find((t) => t.id === templateParam) || INITIAL_TEMPLATES[0];
      const d = tpl.defaultValues;
      return {
        id: `shared-${slug || tpl.id}`,
        slug: slug || tpl.id,
        templateId: tpl.id,
        category: tpl.category,
        atelierTheme: tpl.atelierTheme || d.atelierTheme,
        originalHtmlPath: d.originalHtmlPath,
        title: d.title || tpl.name,
        groomName: d.groomName,
        groomFamily: d.groomFamily,
        brideName: d.brideName,
        brideFamily: d.brideFamily,
        hostNames: d.hostNames,
        graduateName: d.graduateName,
        university: d.university,
        college: d.college,
        major: d.major,
        graduationYear: d.graduationYear,
        honorsTitle: d.honorsTitle,
        birthdayStarName: d.birthdayStarName,
        age: d.age,
        businessName: d.businessName,
        businessType: d.businessType,
        eventDate: d.eventDate || '2026-11-20',
        eventTime: d.eventTime || '08:00 PM',
        hijriDate: d.hijriDate,
        venueName: d.venueName || 'القاعة الملكية',
        city: d.city || 'بغداد، العراق',
        addressDetails: d.addressDetails || '',
        googleMapsUrl: d.googleMapsUrl || 'https://maps.google.com',
        startPointName: d.startPointName,
        startPointUrl: d.startPointUrl,
        wazeUrl: d.wazeUrl,
        contactPhone: d.contactPhone,
        ceremonyScheduleText: d.ceremonyScheduleText,
        welcomeQuote: d.welcomeQuote || '',
        invitationBody: d.invitationBody || '',
        dressCode: d.dressCode,
        notes: d.notes,
        coverImage: d.coverImage,
        couplePortraitImage: d.couplePortraitImage,
        galleryImages: [],
        backgroundVideoUrl: d.backgroundVideoUrl,
        musicTrack: d.musicTrack || 'romantic_piano',
        visualEffect: d.visualEffect || 'auto',
        pageTransitionMode: d.pageTransitionMode || '3d-flip',
        countdownTitle: d.countdownTitle,
        countdownStyle: d.countdownStyle,
        showSecondsInCountdown: true,
        rsvpEnabled: true,
        maxGuestsPerInvite: d.maxGuestsPerInvite || 3,
        guestbookEnabled: true,
        viewCount: 1,
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  }

  const jsonStr = fromBase64Url(encodedData);
  if (!jsonStr) {
    return localMatch || null;
  }

  try {
    const p = JSON.parse(jsonStr);
    const tplId = p.t || templateParam || localMatch?.templateId;
    const tpl =
      INITIAL_TEMPLATES.find((t) => t.id === tplId) || INITIAL_TEMPLATES[0];
    const defaults = tpl?.defaultValues || {};

    const reconstructed: InvitationData = {
      id: p.id || localMatch?.id || `shared-${slug || Date.now()}`,
      slug: p.s || slug || 'shared-invite',
      templateId: tpl.id,
      category: p.c || localMatch?.category || tpl.category || 'wedding',
      title: p.ti || localMatch?.title || defaults.title || 'دعوة خاصة ومباركة',
      atelierTheme: p.at || localMatch?.atelierTheme || tpl.atelierTheme || defaults.atelierTheme,
      originalHtmlPath: localMatch?.originalHtmlPath || defaults.originalHtmlPath,
      groomName: p.gn ?? localMatch?.groomName ?? defaults.groomName,
      groomFamily: p.gf ?? localMatch?.groomFamily ?? defaults.groomFamily,
      brideName: p.bn ?? localMatch?.brideName ?? defaults.brideName,
      brideFamily: p.bf ?? localMatch?.brideFamily ?? defaults.brideFamily,
      hostNames: p.hn ?? localMatch?.hostNames ?? defaults.hostNames,
      graduateName: p.grn ?? localMatch?.graduateName ?? defaults.graduateName,
      university: p.uni ?? localMatch?.university ?? defaults.university,
      college: p.col ?? localMatch?.college ?? defaults.college,
      major: p.maj ?? localMatch?.major ?? defaults.major,
      graduationYear: p.gy ?? localMatch?.graduationYear ?? defaults.graduationYear,
      honorsTitle: p.ht ?? localMatch?.honorsTitle ?? defaults.honorsTitle,
      birthdayStarName: p.bsn ?? localMatch?.birthdayStarName ?? defaults.birthdayStarName,
      age: p.age ?? localMatch?.age ?? defaults.age,
      businessName: p.bzn ?? localMatch?.businessName ?? defaults.businessName,
      businessType: p.bzt ?? localMatch?.businessType ?? defaults.businessType,
      businessSector: p.bzS ?? localMatch?.businessSector ?? defaults.businessSector,
      isPermanentBusinessPage: p.bzP ?? localMatch?.isPermanentBusinessPage ?? false,
      businessWorkingHours: p.bzW ?? localMatch?.businessWorkingHours,
      businessInstagram: p.bzI ?? localMatch?.businessInstagram,
      eventDate: p.ed || localMatch?.eventDate || defaults.eventDate || '2026-11-20',
      eventTime: p.et || localMatch?.eventTime || defaults.eventTime || '08:00 PM',
      hijriDate: p.hd ?? localMatch?.hijriDate ?? defaults.hijriDate,
      venueName: p.vn || localMatch?.venueName || defaults.venueName || 'القاعة الملكية',
      city: p.ct || localMatch?.city || defaults.city || 'بغداد، العراق',
      addressDetails: p.ad || localMatch?.addressDetails || defaults.addressDetails || '',
      googleMapsUrl:
        p.gm || localMatch?.googleMapsUrl || defaults.googleMapsUrl || 'https://maps.google.com',
      startPointName: p.spn ?? localMatch?.startPointName ?? defaults.startPointName,
      startPointUrl: p.spu ?? localMatch?.startPointUrl ?? defaults.startPointUrl,
      wazeUrl: p.wz ?? localMatch?.wazeUrl ?? defaults.wazeUrl,
      contactPhone: p.cp ?? localMatch?.contactPhone ?? defaults.contactPhone,
      ceremonyScheduleText:
        p.cs ?? localMatch?.ceremonyScheduleText ?? defaults.ceremonyScheduleText,
      welcomeQuote: p.wq || localMatch?.welcomeQuote || defaults.welcomeQuote || '',
      invitationBody: p.ib || localMatch?.invitationBody || defaults.invitationBody || '',
      dressCode: p.dc ?? localMatch?.dressCode ?? defaults.dressCode,
      notes: p.nt ?? localMatch?.notes ?? defaults.notes,
      coverImage: p.ci || localMatch?.coverImage || defaults.coverImage,
      couplePortraitImage:
        p.cpi || localMatch?.couplePortraitImage || defaults.couplePortraitImage,
      galleryImages: localMatch?.galleryImages || [],
      backgroundVideoUrl: p.bvu || localMatch?.backgroundVideoUrl || defaults.backgroundVideoUrl,
      musicTrack: p.mt || localMatch?.musicTrack || defaults.musicTrack || 'romantic_piano',
      visualEffect: p.ve || localMatch?.visualEffect || defaults.visualEffect || 'auto',
      pageTransitionMode:
        p.pt || localMatch?.pageTransitionMode || defaults.pageTransitionMode || '3d-flip',
      countdownTitle: p.ctT || localMatch?.countdownTitle || defaults.countdownTitle,
      countdownStyle: p.ctS || localMatch?.countdownStyle || defaults.countdownStyle,
      countdownDigitColor:
        p.ctC || localMatch?.countdownDigitColor || defaults.countdownDigitColor,
      countdownDigitFont:
        p.ctF || localMatch?.countdownDigitFont || defaults.countdownDigitFont,
      countdownNumeralSystem:
        p.ctN || localMatch?.countdownNumeralSystem || defaults.countdownNumeralSystem,
      customPrimaryColor: p.cP || localMatch?.customPrimaryColor,
      customSecondaryColor: p.cS || localMatch?.customSecondaryColor,
      customBgColor: p.cB || localMatch?.customBgColor,
      memoriesConfig: p.mem
        ? {
            ...(localMatch?.memoriesConfig || {
              enabled: true,
              isPostEventActive: true,
              thankYouTitle: 'شكراً لكل من شاركنا فرحة العمر 🤍',
              thankYouMessage: 'بحضوركم اكتملت بهجتنا وأضاءت ليلتنا.. نشارككم أجمل الذكريات.',
              mediaItems: [],
              allowGuestUploads: true,
            }),
            isPostEventActive: true,
          }
        : localMatch?.memoriesConfig,
      showSecondsInCountdown: true,
      rsvpEnabled: true,
      maxGuestsPerInvite: localMatch?.maxGuestsPerInvite || 3,
      guestbookEnabled: true,
      viewCount: (localMatch?.viewCount || 0) + 1,
      createdAt: localMatch?.createdAt || new Date().toISOString(),
    };

    return reconstructed;
  } catch {
    return localMatch || null;
  }
}

