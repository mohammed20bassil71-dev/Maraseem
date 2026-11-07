export type BirthdayRelationship =
  | 'lover'      // حبيب أو حبيبة
  | 'spouse'     // زوج أو زوجة
  | 'friend'     // صديق أو صديقة
  | 'sibling'    // أخ أو أخت
  | 'parent'     // أم أو أب
  | 'child'      // ابن أو ابنة
  | 'relative'   // قريب أو قريبة
  | 'colleague'  // زميل أو زميلة
  | 'general';   // تهنئة عامة لأي شخص

export type GreetingOccasionType =
  | 'birthday'            // عيد ميلاد
  | 'anniversary'         // ذكرى زواج أو خطوبة
  | 'engagement_wishes'   // مباركة خطوبة أو زفاف
  | 'graduation_congrats' // تهنئة تخرج ونجاح
  | 'promotion'           // ترقية وظيفية وإنجاز
  | 'new_baby'            // قدوم مولود جديد
  | 'family_reunion'      // لمّة عائلة ومناسبة عائلية
  | 'general_celebration';// تهنئة ومفاجأة خاصة

export type BirthdayCategory =
  | 'romantic'   // Romantic – رومانسي
  | 'funny'      // Funny & Comedy – كوميدي ومضحك
  | 'emotional'  // Emotional & Heartfelt – عاطفي ومؤثر
  | 'family'     // Family Love – حب العائلة
  | 'friendship' // Friendship – الصداقة
  | 'luxury'     // Elegant & Luxury – فخم وراقي
  | 'cinematic'  // Creative & Cinematic – سينمائي وإبداعي
  | 'cute';      // Cute & Playful – لطيف ومرح

export type TemplateVisualArchitecture =
  | 'royal_stage'          // مسرح ملكي فاخر بإطارات هندسية مذهبة
  | 'polaroid_journal'     // دفتر مذكرات وقصاصات فورية دافئة
  | 'cinematic_widescreen' // شاشة سينمائية عريضة بإضاءة درامية وشريط فيلم
  | 'playful_pop'          // بطاقات مرحة نابضة بالحياة وزوايا ديناميكية
  | 'botanical_manuscript' // مخطوطة نباتية كلاسيكية بنقوش هادئة
  | 'velvet_minimal';      // فخامة مخملية هادئة بتباين عالٍ

export type PhotoFrameStyle =
  | 'polaroid'          // Polaroid – إطارات بولارويد فورية مع تعليق يدوي
  | 'scrapbook'         // Scrapbook – قصاصات ألبوم فني مع شريط لاصق وطوابع
  | 'timeline'          // Timeline – خط زمني متسلسل يروي القصة بالتواريخ
  | 'cinematic_gallery';// Cinematic Gallery – معرض سينمائي بإطارات 16:9 وشريط أفلام

export type CinematicColorFilter =
  | 'original'          // الأصلي الطبيعي (Original Natural)
  | 'golden_cinema'     // سينمائي دافئ 35mm (Golden Hour 35mm)
  | 'film_noir'         // كلاسيك نوار أبيض وأسود (Classic Film Noir B&W)
  | 'vintage_sepia'     // حنين الماضي الدافئ (Vintage Nostalgia Sepia)
  | 'teal_orange'       // هوليوود درامي (Hollywood Teal & Orange)
  | 'velvet_rose'       // مخمل رومانسي حالم (Velvet Rose Dream)
  | 'moonlight_blue'    // ليلي أزرق بارد (Moonlight Cinema Blue)
  | 'emerald_editorial';// فستقي زمردي فاخر (Emerald Prestige)

export interface ColorFilterMeta {
  id: CinematicColorFilter;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  badge: string;
  cssFilter: string;
  tintOverlay: string;
  swatchGradient: string;
}

export type ElementAssetCategory =
  | 'cakes'    // الكعكات
  | 'hearts'   // القلوب
  | 'roses'    // الورود والأزهار
  | 'gifts'    // صناديق الهدايا
  | 'balloons' // البالونات
  | 'candles'; // الشموع المضيئة

export type ElementRenderDimension = '2d' | '3d';

export type ElementAnimationType =
  | 'none'
  | 'float'    // طفو ناعم بالهواء
  | 'pulse'    // نبض متوهج
  | 'spin_3d'  // دوران ثلاثي الأبعاد
  | 'bounce'   // قفز حيوي
  | 'swing'    // تأرجح بندولي
  | 'glow';    //وميض ضوئي سينمائي

export interface CreativeElementAsset {
  id: string;
  nameAr: string;
  nameEn: string;
  category: ElementAssetCategory;
  dimension: ElementRenderDimension;
  defaultColor: string;
  secondaryColor: string;
  svgType:
    | 'royal_cake'
    | 'tiered_cake'
    | 'cupcake_sparkle'
    | 'velvet_heart'
    | 'crystal_heart'
    | 'winged_heart'
    | 'damask_rose'
    | 'golden_bouquet'
    | 'cherry_blossom'
    | 'luxury_gift_box'
    | 'surprise_chest'
    | 'ribbon_parcel'
    | 'metallic_balloon'
    | 'heart_balloon'
    | 'confetti_balloon'
    | 'wax_candle'
    | 'golden_candelabra'
    | 'wish_flame';
}

export interface PlacedCanvasElement {
  id: string;
  assetId: string;
  svgType: CreativeElementAsset['svgType'];
  nameAr: string;
  nameEn: string;
  category: ElementAssetCategory;
  dimension: ElementRenderDimension;
  color: string;
  secondaryColor?: string;
  size: number;              // 36 to 160 px
  x: number;                 // 5% to 92% horizontal position
  y: number;                 // 5% to 88% vertical position
  opacity: number;           // 0.15 to 1.0
  animationType: ElementAnimationType;
  animationDuration: number; // 1.0s to 8.0s
  animationDelay: number;    // 0.0s to 5.0s
  targetPage: 'all' | BirthdayPageType;
}

export type BirthdayPageType =
  | 'teaser'         // ١. شاشة افتتاحية تشويقية («عندك رسالة خاصة»)
  | 'reveal'         // ٢. شاشة كشف المفاجأة وظهور اسم الشخص
  | 'main_greeting'  // ٣. صفحة التهنئة الرئيسية والقلب التفاعلي
  | 'memory_box'     // ٤. صفحة الصور وصندوق الذكريات (Memory Box)
  | 'cake_candles'   // ٥. صفحة كعكة عيد الميلاد التفاعلية والشموع
  | 'secret_message' // ٦. صفحة الرسائل السرية بكلمة مرور (Secret Message)
  | 'scratch_reveal' // ٧. صفحة اكشط واكتشف (Scratch & Reveal)
  | 'gift_box'       // ٨. صفحة صندوق الهدايا ثلاثي الأبعاد (Digital Gift Box)
  | 'final_wishes';  // ٩. صفحة الرسالة الأخيرة والأمنيات والغلاف الختامي

export type OpeningMechanicType =
  | 'envelope'   // فتح ظرف شمعي تظهر بداخله رسالة
  | 'curtain'    // سحب ستارة المسرح لكشف التهنئة
  | 'door'       // فتح باب المفاجأة الملكي
  | 'gift_tap'   // الضغط على صندوق هدية ثلاثي الأبعاد حتى يفتح
  | 'cake_cover' // غلاف الكعكة الاحتفالية التفاعلية
  | 'heart_tap'; // الضغط على قلب مضيء نابض

export type ScratchFoilStyle =
  | 'gold_foil'
  | 'rose_shimmer'
  | 'silver_stars'
  | 'pistachio_velvet';

export type ScratchContentType =
  | 'love_note'      // رسالة حب مخفية
  | 'surprise_photo' // صورة مفاجأة
  | 'special_wish'   // أمنية خاصة
  | 'place_invite'   // دعوة لمكان معين
  | 'gift_voucher'   // هدية أو قسيمة
  | 'funny_joke';    // رسالة كوميدية

export type GiftSurpriseType =
  | 'video'          // فيديو خاص
  | 'letter'         // رسالة مكتوبة
  | 'photo'          // صورة
  | 'voucher'        // قسيمة هدية
  | 'external_link'  // رابط هدية خارجية
  | 'song'           // أغنية مختارة
  | 'wish_challenge' // أمنية أو تحدٍ لطيف
  | 'multi_surprise';// أكثر من مفاجأة داخل صندوق واحد

export interface SecretMessageItem {
  id: string;
  title: string;
  promptText: string; // مثال: «عندك رسالة سرية، بس لازم تعرف كلمة السر»
  password: string;
  hint: string;
  revealType: 'text' | 'image' | 'video' | 'full_card';
  secretBody: string;
  mediaUrl?: string;
}

export interface MemoryBoxItem {
  id: string;
  type: 'photo' | 'video';
  mediaUrl: string;
  teaserQuestion: string; // مثال: «تتذكر هذا اليوم؟»
  title: string;
  story: string;
  date: string;
  colorFilter?: CinematicColorFilter;
}

export interface ScratchCardConfig {
  enabled: boolean;
  foilStyle: ScratchFoilStyle;
  contentType: ScratchContentType;
  promptTitle: string;
  hiddenTitle: string;
  hiddenMessage: string;
  voucherCodeOrPlace?: string;
  hiddenImageUrl?: string;
}

export interface DigitalGiftBoxItem {
  id: string;
  label: string;
  boxColor: string;
  ribbonColor: string;
  surpriseType: GiftSurpriseType;
  surpriseTitle: string;
  surpriseMessage: string;
  mediaUrl?: string;
  externalGiftUrl?: string;
  voucherCode?: string;
  secondarySurpriseText?: string;
}

export interface BirthdayPageConfig {
  id: string;
  type: BirthdayPageType;
  enabled: boolean;
  title: string;
  subtitle?: string;
  bodyText?: string;
  buttonLabel?: string;
  badgeText?: string;
}

export interface BirthdayTextStyle {
  fontFamily: 'cairo' | 'tajawal' | 'amiri' | 'cormorant' | 'plus_jakarta';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  textAlign: 'right' | 'center' | 'left';
  textColor: string;
  direction?: 'auto' | 'rtl' | 'ltr';
}

export interface BirthdayThemeColors {
  background: string;
  cardBg: string;
  primary: string;
  secondary: string;
  textColor: string;
  accentGlow: string;
  border: string;
}

export interface BirthdayGreetingData {
  id: string;
  slug: string;
  templateId: string;
  occasionType?: GreetingOccasionType;
  visualArchitecture?: TemplateVisualArchitecture;
  category: BirthdayCategory;
  relationship: BirthdayRelationship;
  recipientName: string;
  recipientNickname?: string;
  senderName: string;
  recipientAge?: number;
  birthDate?: string;

  // Cover & Opening
  openingMechanic: OpeningMechanicType;
  coverTeaserText: string;
  coverSubtitle: string;
  coverButtonText: string;
  finalCoverQuote: string;

  // Main Greeting & Interactive Heart
  mainGreetingTitle: string;
  mainGreetingBody: string;
  hiddenHeartMessage: string;
  howPreciousScoreText: string; // «اكتشف شكد أنت غالي»

  // Cake & Candles
  cakeFlavorColor: string;
  candlesCount: number;
  cakeWishPrompt: string;
  cakeCelebrationMessage: string;

  // Special Interactive Modules & Photo Frames
  photoFrameStyle?: PhotoFrameStyle;
  photoColorFilter?: CinematicColorFilter;
  canvasElements?: PlacedCanvasElement[];
  secretMessages: SecretMessageItem[];
  memoryBoxItems: MemoryBoxItem[];
  memoryBoxSortByDate: boolean;
  memoryBoxDisplayMode: 'one_by_one' | 'grid';
  scratchCard: ScratchCardConfig;
  giftBoxes: DigitalGiftBoxItem[];

  // Pages Order & Customization
  pages: BirthdayPageConfig[];
  textStyle: BirthdayTextStyle;
  themeColors: BirthdayThemeColors;
  customCoverImage?: string;
  customBackgroundVideo?: string;
  selectedStickers: string[];

  // Motion & Audio
  transitionStyle: 'slide' | 'flip_3d' | 'fade_scale' | 'curtain_reveal';
  animationSpeed: 'slow' | 'normal' | 'fast';
  skipAnimationsDefault: boolean;
  particleEffect: 'hearts' | 'confetti' | 'stars' | 'balloons' | 'sparkles' | 'funny_emojis';
  musicTrackId: string;
  customAudioUrl?: string;
  customAudioName?: string;
  soundEffectsEnabled: boolean;

  // Publishing & Scheduling
  availableFrom?: string; // ISO or datetime-local
  expiresAt?: string;     // ISO or date
  viewsCount: number;
  sharesCount: number;
  createdAt: string;
}

export interface BirthdayTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  occasionType?: GreetingOccasionType;
  visualArchitecture?: TemplateVisualArchitecture;
  category: BirthdayCategory;
  supportedRelationships: BirthdayRelationship[];
  descriptionAr: string;
  descriptionEn: string;
  badgeAr: string;
  badgeEn: string;
  tier: 'free' | 'paid' | 'vip';
  priceIQD: number;
  thumbnailUrl: string;
  themeColors: BirthdayThemeColors;
  defaultOpeningMechanic: OpeningMechanicType;
  defaultPhotoFrameStyle?: PhotoFrameStyle;
  defaultPhotoColorFilter?: CinematicColorFilter;
  defaultCanvasElements?: PlacedCanvasElement[];
  defaultParticleEffect: BirthdayGreetingData['particleEffect'];
  defaultTransitionStyle: BirthdayGreetingData['transitionStyle'];
  defaultMusicTrackId: string;
  defaultTextStyle: BirthdayTextStyle;
  defaultPages: BirthdayPageConfig[];
  defaultGreetingData: Partial<BirthdayGreetingData>;
}

export interface BirthdayMusicTrack {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'romantic' | 'calm' | 'playful' | 'cinematic' | 'classic';
  durationLabel: string;
  synthGenre: string;
  isLicensed: boolean;
}
