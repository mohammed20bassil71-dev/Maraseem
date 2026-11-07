export type InvitationCategory = 
  | 'all'
  | 'engagement'
  | 'henna'
  | 'wedding'
  | 'birthday'
  | 'graduation'
  | 'graduation_project'
  | 'special_events'
  | 'business_opening'
  | 'art_exhibition'
  | 'career_promotion'
  | 'family_success';

export type TemplateStyle = 
  | 'royal'
  | 'cinematic'
  | 'movie_trailer'
  | 'henna_traditional'
  | 'minimalist'
  | 'floral'
  | 'modern'
  | 'interactive_cake'
  | 'academic_tech'
  | 'academic_medical'
  | 'academic_classic'
  | 'atelier_rosette'
  | 'atelier_botanical'
  | 'atelier_astrolabe'
  | 'atelier_orchid'
  | 'atelier_mirage'
  | 'atelier_diwan'
  | 'art_gallery'
  | 'executive_prestige'
  | 'family_celebration';

export type MovieTitleAnimationStyle =
  | 'epic_zoom_flare'
  | 'letter_reveal_glow'
  | 'shatter_gold'
  | 'noir_typewriter';

export type MovieTransitionStyle =
  | 'anamorphic_flare_wipe'
  | 'dramatic_fade_through_black'
  | 'shutter_cut'
  | 'zoom_impact';

export interface MovieCastMember {
  name: string;
  role: string;
}

export type AtelierThemeVariant =
  | 'rosette_polaroid'
  | 'botanical_clock'
  | 'emerald_compass'
  | 'velvet_orchid'
  | 'sapphire_mirage'
  | 'abbasid_diwan';

export type VisualEffectType =
  | 'auto'
  | 'rose_petals'
  | 'lantern_glow'
  | 'golden_sparkles'
  | 'gallery_spotlight'
  | 'confetti_stars'
  | 'none';

export type ClickInteractionEffectType =
  | 'none'
  | 'heartbeat'
  | 'magic_sparkles'
  | 'rose_petals'
  | 'butterflies'
  | 'heart_drawing'
  | 'fairy_dust'
  | 'constellation'
  | 'bloom_effect'
  | 'shooting_star'
  | 'bubble_effect'
  | 'magic_ripple'
  | 'hidden_messages'
  | 'auto_cycle';

export type ClickEffectSpeed = 'slow' | 'medium' | 'fast';

export type RoyalVisualDirection =
  | 'obsidian_champagne'
  | 'emerald_palace'
  | 'pearl_atelier';

export type OpenerStyle3D =
  | 'auto'
  | 'royal_envelope_wax'
  | 'stage_curtains_3d'
  | 'royal_3d_book'
  | 'engagement_ring_3d';

export type SingleInteractionMode =
  // 4 Flagship Cinematic Opening Scenes (Luxury Envelope, Engagement Ring Box, Royal Doors, Silk Ribbon) + Occasion 3D Scenes
  | 'envelope_3d'
  | 'engagement_jewelry_box_3d'
  | 'royal_doors_3d'
  | 'silk_ribbon_3d'
  // Wedding 3D Interactions
  | 'curtain_3d'
  | 'popup_book_3d'
  | 'scene_reveal_3d'
  | 'wedding_carriage_3d'
  // Engagement 3D Interactions
  | 'engagement_ring_3d'
  | 'engagement_rose_3d'
  | 'engagement_gift_box_3d'
  // Henna 3D Interactions
  | 'henna_box_3d'
  | 'henna_lantern_3d'
  | 'henna_mabkhara_3d'
  | 'henna_gift_chest_3d'
  // Birthday 3D Interactions
  | 'birthday_cake_3d'
  | 'birthday_candles_3d'
  | 'birthday_gift_box_3d'
  | 'birthday_balloons_3d'
  // Graduation 3D Interactions & Collection
  | 'graduation_cap_3d'
  | 'graduation_diploma_3d'
  | 'graduation_night_fireworks_3d'
  | 'graduation_popup_book_3d'
  | 'graduation_achievement_box_3d'
  // Project Graduation 3D Interactions
  | 'project_dossier_3d'
  | 'project_academic_book_3d'
  | 'project_laptop_3d'
  | 'project_display_board_3d';

export type InvitationSectionId =
  | 'opener'
  | 'card'
  | 'datetime'
  | 'location'
  | 'rsvp'
  | 'guestbook';

export type CountdownDigitFont =
  | 'amiri_royal'
  | 'aref_calligraphy'
  | 'cinzel_roman'
  | 'cormorant_atelier'
  | 'cairo_geometric'
  | 'mono_digital';

export type CountdownNumeralSystem = 'arabic_indic' | 'western';

export type GraduationMajor =
  | 'medicine'
  | 'dentistry'
  | 'pharmacy'
  | 'medical_lab'
  | 'civil_eng'
  | 'computer_eng'
  | 'ai_tech'
  | 'law'
  | 'business'
  | 'arts'
  | 'sciences';

export interface Template {
  id: string;
  name: string;
  nameEn: string;
  category: InvitationCategory;
  style: TemplateStyle;
  badge?: 'new' | 'popular' | 'vip' | 'movie';
  tier?: 'free' | 'paid' | 'vip';
  priceIQD?: number;
  designerName?: string;
  colorTags?: string[];
  isMovieInspired?: boolean;
  isAtelierSignature?: boolean;
  atelierTheme?: AtelierThemeVariant;
  description: string;
  descriptionEn: string;
  themeColor: string;
  secondaryColor: string;
  experienceType:
    | 'envelope_reveal'
    | 'engagement_ring'
    | 'oriental_lantern'
    | 'cinematic_story'
    | 'movie_trailer'
    | 'birthday_candles'
    | 'graduation_scroll'
    | 'ribbon_cut'
    | 'atelier_signature';
  defaultValues: Partial<InvitationData>;
}

export interface InvitationData {
  id: string;
  slug: string;
  templateId: string;
  templateStyle?: TemplateStyle;
  category: InvitationCategory;
  title: string;
  atelierTheme?: AtelierThemeVariant;
  originalHtmlPath?: string;

  // Movie Trailer Customization Fields
  movieTitle?: string;
  movieTagline?: string;
  movieDirector?: string;
  movieKeyCast?: MovieCastMember[];
  movieRatingBadge?: string;
  movieTitleAnimation?: MovieTitleAnimationStyle;
  movieTransitionStyle?: MovieTransitionStyle;
  
  // Couple / Hosts info
  groomName?: string;
  groomFamily?: string;
  brideName?: string;
  brideFamily?: string;
  hostNames?: string;
  
  // Graduation & Graduation Project specific
  graduateName?: string;
  university?: string;
  college?: string;
  departmentName?: string;
  academicDegree?: string;
  projectTitle?: string;
  supervisorName?: string;
  defenseHall?: string;
  major?: GraduationMajor | string;
  graduationYear?: string;
  honorsTitle?: string;
  
  // Birthday specific
  birthdayStarName?: string;
  age?: number | string;
  birthdayTheme?: string;
  
  // Business Opening
  businessName?: string;
  businessType?: string;
  vipInviteNote?: string;
  
  // General event info
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // e.g., "08:00 PM"
  hijriDate?: string;
  venueName: string;
  city: string;
  addressDetails: string;
  googleMapsUrl: string;
  startPointName?: string;
  startPointUrl?: string;
  wazeUrl?: string;
  contactPhone?: string;
  ceremonyScheduleText?: string;
  
  // Text & Quotes
  welcomeQuote: string;
  invitationBody: string;
  dressCode?: string;
  notes?: string;
  
  // Photos, Background Video (MP4/WebM) & Media
  coverImage?: string;
  couplePortraitImage?: string;
  galleryImages: string[];
  galleryColorFilter?:
    | 'original'
    | 'golden_cinema'
    | 'film_noir'
    | 'vintage_sepia'
    | 'teal_orange'
    | 'velvet_rose'
    | 'moonlight_blue'
    | 'emerald_editorial';
  backgroundVideoUrl?: string;
  backgroundVideoName?: string;
  backgroundVideoPlaying?: boolean;
  backgroundVideoMuted?: boolean;
  backgroundVideoVolume?: number;
  backgroundVideoOverlayOpacity?: number;
  pageTransitionMode?: '3d-flip' | 'fade-in-out' | 'book-unfold';
  visualEffect?: VisualEffectType;
  clickEffect?: ClickInteractionEffectType;
  clickEffectSpeed?: ClickEffectSpeed;
  musicTrack:
    | 'none'
    | 'royal_oud'
    | 'romantic_piano'
    | 'festive_traditional'
    | 'cinematic_strings'
    | 'epic_trailer_score'
    | 'romantic_cinema_orchestra'
    | 'calm_acoustic'
    | 'zen_harp'
    | 'custom_upload';
  customAudioUrl?: string;
  customAudioName?: string;
  autoPlayMusic?: boolean;
  enableOpeningSfx?: boolean;

  
  // Countdown customization
  countdownTitle?: string;
  countdownStyle?: 'gold_luxury' | 'obsidian_dark' | 'rose_champagne' | 'emerald_heritage' | 'minimal_glass';
  countdownDigitColor?: string;
  countdownDigitFont?: CountdownDigitFont;
  countdownNumeralSystem?: CountdownNumeralSystem;
  showSecondsInCountdown?: boolean;
  countdownCelebrationText?: string;

  // Personalized Guest & Iraqi Family features
  customPrimaryColor?: string;
  customSecondaryColor?: string;
  customBgColor?: string;
  customFontFamily?: string;
  visualDirection?: RoyalVisualDirection;
  openerStyle3D?: OpenerStyle3D;
  singleInteractionMode?: SingleInteractionMode;
  sectionOrder?: InvitationSectionId[];
  enable3DFlowersAndButterflies?: boolean;

  // Business Event Page extensions
  businessSector?: BusinessSector;
  companyLogo?: string;
  businessServices?: BusinessServiceItem[];
  introVideoUrl?: string;
  isPermanentBusinessPage?: boolean;
  businessWorkingHours?: string;
  businessInstagram?: string;
  businessWebsite?: string;

  // Wedding Memories (Post-Event) extensions
  memoriesConfig?: WeddingMemoriesConfig;

  // Settings & Smart Security
  rsvpEnabled: boolean;
  rsvpDeadline?: string;
  maxGuestsPerInvite: number;
  guestbookEnabled: boolean;
  requireGuestbookApproval?: boolean;
  passwordProtected?: boolean;
  invitationPassword?: string;
  viewCount: number;
  createdAt: string;
}

export type IraqiFamilyGroup =
  | 'groom_family'
  | 'bride_family'
  | 'relatives'
  | 'friends'
  | 'colleagues'
  | 'vip';

export type BusinessSector =
  | 'restaurant_cafe'
  | 'company'
  | 'medical_clinic'
  | 'pharmacy'
  | 'flower_shop'
  | 'clothing_store'
  | 'beauty_salon'
  | 'exhibition'
  | 'product_launch';

export interface BusinessServiceItem {
  id: string;
  name: string;
  description: string;
  priceOrTag?: string;
  imageUrl?: string;
}

export interface WeddingMemoryMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
  uploadedBy: string;
  createdAt: string;
}

export interface WeddingMemoriesConfig {
  enabled: boolean;
  isPostEventActive: boolean;
  thankYouTitle: string;
  thankYouMessage: string;
  highlightVideoUrl?: string;
  mediaItems: WeddingMemoryMedia[];
  allowGuestUploads: boolean;
}

export interface InvitedGuest {
  id: string;
  invitationId: string;
  name: string;
  isFamilyInvite: boolean;
  familyTitle?: string; // e.g., "عائلة الحاج محمود الكرخي"
  group: IraqiFamilyGroup;
  phone: string;
  allocatedSeats: number;
  rsvpStatus: 'pending' | 'attending' | 'declined' | 'tentative';
  confirmedSeats: number;
  companionNames: string[];
  tableNumber?: number;
  checkedIn: boolean;
  checkedInAt?: string;
  qrCodeToken: string;
  personalNote?: string;
  lastReminderSentAt?: string;
  createdAt: string;
}

export interface RSVPRecord {
  id: string;
  invitationId: string;
  guestId?: string;
  guestName: string;
  phone: string;
  group?: IraqiFamilyGroup;
  status: 'attending' | 'declined' | 'tentative';
  allocatedSeats?: number;
  companionsCount: number;
  companionNames?: string[];
  mealPreference?: string;
  assignedTableId?: string;
  tableNumber?: number;
  checkedIn?: boolean;
  checkedInAt?: string;
  note?: string;
  createdAt: string;
}

export interface SeatingTable {
  id: string;
  invitationId: string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  category?: 'vip' | 'groom_family' | 'bride_family' | 'relatives' | 'friends' | 'colleagues' | 'general';
  notes?: string;
}

export interface GuestbookMessage {
  id: string;
  invitationId: string;
  senderName: string;
  message: string;
  photoUrl?: string;
  approved?: boolean;
  createdAt: string;
}

export type PartnerCategory =
  | 'wedding_hall'
  | 'photographer'
  | 'event_planner'
  | 'flower_shop'
  | 'event_company';

export interface PartnerOrderRecord {
  id: string;
  clientName: string;
  eventTitle: string;
  packageName: string;
  orderAmountIQD: number;
  commissionAmountIQD: number;
  status: 'completed' | 'pending' | 'paid_out';
  date: string;
}

export interface PartnerAccount {
  id: string;
  name: string;
  businessName: string;
  category: PartnerCategory;
  city: string;
  phone: string;
  referralCode: string;
  commissionRatePercent: number;
  totalReferrals: number;
  activeOrders: number;
  totalSalesIQD: number;
  totalCommissionIQD: number;
  orders: PartnerOrderRecord[];
  status: 'active' | 'pending';
}

export interface PricingPackage {
  id: 'free_preview' | 'basic' | 'pro' | 'vip' | 'business' | 'custom_bespoke';
  name: string;
  subtitle: string;
  priceIQD: number;
  originalPriceIQD?: number;
  priceUSD: number;
  billingPeriod: string;
  badge?: string;
  isPopular?: boolean;
  maxGuests: number;
  features: string[];
}

export interface DiscountCoupon {
  id: string;
  code: string;
  discountPercent: number;
  description: string;
  expiryDate: string;
  usageCount: number;
  maxUses: number;
  isActive: boolean;
}

export interface CustomerReview {
  id: string;
  clientName: string;
  city: string;
  occasionType: string;
  rating: number;
  comment: string;
  date: string;
  isFeatured: boolean;
}

export type PlatformUserRole =
  | 'host'
  | 'guest'
  | 'receptionist'
  | 'partner'
  | 'admin';


