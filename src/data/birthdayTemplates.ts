import {
  BirthdayCategory,
  BirthdayGreetingData,
  BirthdayMusicTrack,
  BirthdayPageConfig,
  BirthdayRelationship,
  BirthdayTemplate,
  CinematicColorFilter,
  ColorFilterMeta,
  CreativeElementAsset,
  GreetingOccasionType,
  PhotoFrameStyle,
  PlacedCanvasElement,
} from '../types/birthdayExperience';
import { sanitizeInvitationSlug } from '../utils/shareLink';

/**
 * Generates high-resolution, zero-dependency SVG artwork data URLs
 * so every template card and memory photo renders instantaneously and reliably.
 */
export function createArtisticSvgDataUri(
  bg1: string,
  bg2: string,
  accent: string,
  motif: 'rose_seal' | 'cake_candles' | 'stage_curtain' | 'polaroid_leaves' | 'cinema_stars' | 'gift_confetti',
  titleText = 'Maraseem Atelier'
): string {
  let centerGraphic = '';
  if (motif === 'rose_seal') {
    centerGraphic = `
      <circle cx="400" cy="240" r="88" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-width="2"/>
      <path d="M400 295 C400 295 335 250 335 205 C335 180 356 165 376 165 C389 165 396 173 400 182 C404 173 411 165 424 165 C444 165 465 180 465 205 C465 250 400 295 400 295 Z" fill="${accent}" opacity="0.88"/>
      <circle cx="400" cy="230" r="115" fill="none" stroke="${accent}" stroke-width="1" stroke-dasharray="6 6" opacity="0.5"/>
    `;
  } else if (motif === 'cake_candles') {
    centerGraphic = `
      <ellipse cx="400" cy="315" rx="115" ry="18" fill="${accent}" opacity="0.35"/>
      <rect x="315" y="235" width="170" height="75" rx="18" fill="${accent}" opacity="0.85"/>
      <rect x="345" y="180" width="110" height="58" rx="14" fill="#FFFDF8" opacity="0.92"/>
      <rect x="372" y="142" width="10" height="38" rx="5" fill="${accent}"/>
      <rect x="395" y="136" width="10" height="44" rx="5" fill="${accent}"/>
      <rect x="418" y="142" width="10" height="38" rx="5" fill="${accent}"/>
      <circle cx="377" cy="132" r="9" fill="#FBBF24"/>
      <circle cx="400" cy="126" r="10" fill="#FBBF24"/>
      <circle cx="423" cy="132" r="9" fill="#FBBF24"/>
    `;
  } else if (motif === 'stage_curtain') {
    centerGraphic = `
      <rect x="250" y="120" width="300" height="220" rx="20" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.75"/>
      <path d="M250 120 Q320 220 270 340 L250 340 Z" fill="${accent}" opacity="0.4"/>
      <path d="M550 120 Q480 220 530 340 L550 340 Z" fill="${accent}" opacity="0.4"/>
      <polygon points="400,165 414,198 450,198 420,218 432,252 400,232 368,252 380,218 350,198 386,198" fill="${accent}" opacity="0.9"/>
    `;
  } else if (motif === 'polaroid_leaves') {
    centerGraphic = `
      <g transform="rotate(-6 370 230)">
        <rect x="305" y="140" width="140" height="170" rx="8" fill="#FFFDF8" stroke="${accent}" stroke-width="2"/>
        <rect x="318" y="154" width="114" height="114" rx="4" fill="${bg2}"/>
      </g>
      <g transform="rotate(8 435 235)">
        <rect x="355" y="145" width="140" height="170" rx="8" fill="#FFFDF8" stroke="${accent}" stroke-width="2"/>
        <rect x="368" y="159" width="114" height="114" rx="4" fill="${accent}" fill-opacity="0.35"/>
      </g>
    `;
  } else if (motif === 'cinema_stars') {
    centerGraphic = `
      <rect x="260" y="145" width="280" height="170" rx="14" fill="none" stroke="${accent}" stroke-width="2.5"/>
      <line x1="260" y1="175" x2="540" y2="175" stroke="${accent}" stroke-width="2" stroke-dasharray="14 10"/>
      <line x1="260" y1="285" x2="540" y2="285" stroke="${accent}" stroke-width="2" stroke-dasharray="14 10"/>
      <circle cx="400" cy="230" r="34" fill="${accent}" opacity="0.85"/>
    `;
  } else {
    centerGraphic = `
      <rect x="340" y="195" width="120" height="105" rx="14" fill="${accent}" opacity="0.85"/>
      <rect x="330" y="172" width="140" height="28" rx="8" fill="#FFFDF8" opacity="0.9"/>
      <rect x="390" y="172" width="20" height="128" fill="#FFFDF8"/>
      <circle cx="310" cy="160" r="12" fill="${accent}" opacity="0.6"/>
      <circle cx="495" cy="175" r="9" fill="#FFFDF8" opacity="0.7"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${bg2}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    <rect width="800" height="500" fill="url(#glow)"/>
    <rect x="32" y="32" width="736" height="436" rx="24" fill="none" stroke="${accent}" stroke-opacity="0.32" stroke-width="1.5"/>
    ${centerGraphic}
    <text x="400" y="415" text-anchor="middle" fill="${accent}" font-family="serif" font-size="22" font-weight="bold" opacity="0.9">${titleText}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const GREETING_OCCASIONS_META: Array<{
  id: GreetingOccasionType;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
}> = [
  {
    id: 'birthday',
    nameAr: 'عيد ميلاد تفاعلي',
    nameEn: 'Birthday Experience',
    descAr: 'قصص متعددة الصفحات مع كعكة الشموع، صندوق الهدايا، وبطاقة الكشط.',
    descEn: 'Multi-page story with interactive candle cake, gift boxes, and scratch card.',
  },
  {
    id: 'anniversary',
    nameAr: 'ذكرى زواج أو حب',
    nameEn: 'Anniversary & Love',
    descAr: 'خط زمني للذكريات المشتركة، رسائل حب سرية بكلمة مرور، وأغلفة شمعية.',
    descEn: 'Shared memory timeline, password-protected love letters, and wax seal covers.',
  },
  {
    id: 'engagement_wishes',
    nameAr: 'مباركة خطوبة أو زفاف',
    nameEn: 'Engagement & Wedding Wishes',
    descAr: 'تهنئة فخمة للعروسين مع ألبوم بولارويد وأمنيات الحياة السعيدة.',
    descEn: 'Luxury congratulations for the couple with polaroid frames and heartfelt wishes.',
  },
  {
    id: 'graduation_congrats',
    nameAr: 'تهنئة تخرج ونجاح',
    nameEn: 'Graduation & Achievement',
    descAr: 'احتفالية التخرج والتفوق الدراسي مع هدايا رقمية وقسائم مكافآت.',
    descEn: 'Academic milestone celebration with digital gift boxes and reward vouchers.',
  },
  {
    id: 'promotion',
    nameAr: 'ترقية وظيفية وإنجاز',
    nameEn: 'Career Promotion',
    descAr: 'تصاميم راقية ومهنية للاحتفاء بالترقية والنجاحات القيادية.',
    descEn: 'Refined executive designs celebrating career promotions and leadership.',
  },
  {
    id: 'new_baby',
    nameAr: 'قدوم مولود جديد',
    nameEn: 'New Baby Arrival',
    descAr: 'تصاميم باستيل ناعمة ولطيفة للترحيب بالمولود الجديد وتهنئة الوالدين.',
    descEn: 'Soft pastel interactive cards welcoming a newborn baby and congratulating parents.',
  },
  {
    id: 'family_reunion',
    nameAr: 'تهنئة ومناسبة عائلية',
    nameEn: 'Family Celebration',
    descAr: 'بطاقات عائلية دافئة تجمع صور العائلة والذكريات الأصيلة.',
    descEn: 'Warm family cards bringing together cherished family photos and stories.',
  },
  {
    id: 'general_celebration',
    nameAr: 'مفاجأة وتهنئة خاصة',
    nameEn: 'Special Surprise',
    descAr: 'قصة تفاعلية حرة تناسب أي مناسبة أو مفاجأة غير متوقعة.',
    descEn: 'Freestyle interactive story adaptable to any special surprise.',
  },
];

export const PHOTO_FRAME_STYLES_META: Array<{
  id: PhotoFrameStyle;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
}> = [
  {
    id: 'polaroid',
    nameAr: 'إطارات بولارويد فورية (Polaroid)',
    nameEn: 'Instant Polaroid Frames',
    descAr: 'صور مؤطرة بحواف بيضاء كلاسيكية مع ميلان فني وتعليق مكتوب بخط اليد.',
    descEn: 'Classic white-bordered instant frames with artistic tilt and handwritten captions.',
  },
  {
    id: 'scrapbook',
    nameAr: 'ألبوم قصاصات فني (Scrapbook)',
    nameEn: 'Artistic Scrapbook Collage',
    descAr: 'صور مثبتة بشريط لاصق دافئ وطوابع بريدية وملاحظات ورقية حميمية.',
    descEn: 'Photos pinned with warm masking tape, vintage stamps, and paper notes.',
  },
  {
    id: 'timeline',
    nameAr: 'الخط الزمني للذكريات (Timeline)',
    nameEn: 'Chronological Story Timeline',
    descAr: 'سرد متسلسل يربط كل صورة بتاريخها وقصتها على مسار زمني أنيق.',
    descEn: 'Sequential narrative connecting each photo to its date and story along a timeline.',
  },
  {
    id: 'cinematic_gallery',
    nameAr: 'المعرض السينمائي (Cinematic Gallery)',
    nameEn: 'Widescreen Cinematic Gallery',
    descAr: 'عرض سينمائي عريض 16:9 مع إضاءة خلفية وشريط فيلم كلاسيكي.',
    descEn: 'Widescreen 16:9 cinema frames with ambient lighting and classic film perforations.',
  },
];

export const COLOR_FILTERS_LIBRARY: ColorFilterMeta[] = [
  {
    id: 'original',
    nameAr: 'الأصلي الطبيعي (Original)',
    nameEn: 'Original Natural',
    descAr: 'الألوان الطبيعية الأصلية للصورة دون أي تعديل لوني.',
    descEn: 'True-to-life natural colors without color grading.',
    badge: '🎞️ طبيعي',
    cssFilter: 'none',
    tintOverlay: 'transparent',
    swatchGradient: 'linear-gradient(135deg, #F8F6EF 0%, #B9CCA0 50%, #566B49 100%)',
  },
  {
    id: 'golden_cinema',
    nameAr: 'سينمائي دافئ 35mm (Golden Hour)',
    nameEn: 'Golden Hour 35mm',
    descAr: 'توهج كهرماني دافئ مستوحى من أفلام السينما الكلاسيكية 35mm ساعة الغروب.',
    descEn: 'Warm amber glow inspired by classic 35mm golden hour cinema film.',
    badge: '🎬 35mm دافئ',
    cssFilter: 'contrast(1.12) saturate(1.18) sepia(0.22) brightness(1.03)',
    tintOverlay: 'linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(180, 83, 9, 0.14))',
    swatchGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #78350F 100%)',
  },
  {
    id: 'film_noir',
    nameAr: 'كلاسيك نوار أبيض وأسود (Film Noir)',
    nameEn: 'Classic Film Noir B&W',
    descAr: 'تباين درامي عميق بالأبيض والأسود الفضي على طريقة السينما الكلاسيكية الخالدة.',
    descEn: 'High-contrast silver monochrome inspired by timeless classic cinema.',
    badge: '🖤 نوار كلاسيك',
    cssFilter: 'grayscale(1) contrast(1.28) brightness(0.96)',
    tintOverlay: 'radial-gradient(circle, transparent 55%, rgba(15, 23, 42, 0.35) 100%)',
    swatchGradient: 'linear-gradient(135deg, #F8FAFC 0%, #64748B 50%, #0F172A 100%)',
  },
  {
    id: 'vintage_sepia',
    nameAr: 'حنين الماضي الدافئ (Vintage Sepia)',
    nameEn: 'Vintage Nostalgia Sepia',
    descAr: 'درجات السيبيا والبرونز العتيق التي تمنح الصور طابع الذكريات الأصيلة.',
    descEn: 'Antique sepia and warm bronze tones evoking cherished nostalgic memories.',
    badge: '📜 سيبيا دافئ',
    cssFilter: 'sepia(0.65) contrast(1.08) brightness(0.96) saturate(0.88)',
    tintOverlay: 'linear-gradient(135deg, rgba(146, 100, 55, 0.18), rgba(69, 26, 3, 0.16))',
    swatchGradient: 'linear-gradient(135deg, #E6CCB2 0%, #B08968 50%, #7F5539 100%)',
  },
  {
    id: 'teal_orange',
    nameAr: 'هوليوود درامي (Teal & Orange)',
    nameEn: 'Hollywood Teal & Orange',
    descAr: 'تدرج لوني سينمائي احترافي يجمع بين ظلال التركواز الباردة وإضاءة العنبر الدافئة.',
    descEn: 'Blockbuster cinema color grading blending cool teal shadows and warm amber highlights.',
    badge: '🎥 هوليوود',
    cssFilter: 'contrast(1.18) saturate(1.26) hue-rotate(-6deg)',
    tintOverlay: 'linear-gradient(135deg, rgba(14, 116, 144, 0.22) 0%, rgba(234, 88, 12, 0.20) 100%)',
    swatchGradient: 'linear-gradient(135deg, #0E7490 0%, #0891B2 45%, #EA580C 100%)',
  },
  {
    id: 'velvet_rose',
    nameAr: 'مخمل رومانسي حالم (Velvet Rose)',
    nameEn: 'Velvet Rose Dream',
    descAr: 'طيف وردي مخملي ناعم يضفي أجواء شاعرية حالمة على لقطات المناسبات السعيدة.',
    descEn: 'Soft velvet rose-pink bloom creating a dreamy romantic atmosphere.',
    badge: '🌹 مخمل وردي',
    cssFilter: 'contrast(1.06) saturate(1.16) brightness(1.04) hue-rotate(348deg)',
    tintOverlay: 'linear-gradient(135deg, rgba(217, 107, 123, 0.20), rgba(244, 172, 183, 0.15))',
    swatchGradient: 'linear-gradient(135deg, #FDA4AF 0%, #E11D48 55%, #881337 100%)',
  },
  {
    id: 'moonlight_blue',
    nameAr: 'ليلي أزرق بارد (Moonlight Blue)',
    nameEn: 'Moonlight Cinema Blue',
    descAr: 'إضاءة ليلية زرقاء هادئة تحاكي ضوء القمر والنجوم في المشاهد السينمائية الليلية.',
    descEn: 'Cool sapphire night grading reminiscent of moonlit cinema scenes.',
    badge: '🌙 ليلي أزرق',
    cssFilter: 'contrast(1.14) saturate(0.88) brightness(0.95) hue-rotate(190deg)',
    tintOverlay: 'linear-gradient(135deg, rgba(30, 58, 138, 0.24), rgba(56, 189, 248, 0.14))',
    swatchGradient: 'linear-gradient(135deg, #38BDF8 0%, #1D4ED8 50%, #0F172A 100%)',
  },
  {
    id: 'emerald_editorial',
    nameAr: 'فستقي زمردي فاخر (Emerald Editorial)',
    nameEn: 'Emerald Pistachio Prestige',
    descAr: 'فلتر زمردي وفستقي ملكي متناغم مع هوية «مراسيم» الراقية والمجلات العالمية.',
    descEn: 'Editorial emerald & pistachio tone tailored to Maraseem’s luxury aesthetic.',
    badge: '🌿 زمردي فاخر',
    cssFilter: 'contrast(1.10) saturate(1.08) sepia(0.14) hue-rotate(38deg)',
    tintOverlay: 'linear-gradient(135deg, rgba(86, 107, 73, 0.22), rgba(220, 232, 203, 0.14))',
    swatchGradient: 'linear-gradient(135deg, #DCE8CB 0%, #91A77D 50%, #566B49 100%)',
  },
];

export function getColorFilterMeta(filterId?: CinematicColorFilter): ColorFilterMeta {
  return (
    COLOR_FILTERS_LIBRARY.find((f) => f.id === filterId) ||
    COLOR_FILTERS_LIBRARY[0]
  );
}

export const CREATIVE_ELEMENTS_LIBRARY: CreativeElementAsset[] = [
  // 1. Cakes (الكعكات)
  {
    id: 'el-cake-royal-3d',
    nameAr: 'كعكة ملكية بطبقتين (3D)',
    nameEn: 'Royal Two-Tier Cake (3D)',
    category: 'cakes',
    dimension: '3d',
    defaultColor: '#D96B7B',
    secondaryColor: '#F3E5AB',
    svgType: 'royal_cake',
  },
  {
    id: 'el-cake-pistachio-2d',
    nameAr: 'كعكة الفستق والحليب (2D)',
    nameEn: 'Pistachio Cream Cake (2D)',
    category: 'cakes',
    dimension: '2d',
    defaultColor: '#91A77D',
    secondaryColor: '#FFFDF8',
    svgType: 'tiered_cake',
  },
  {
    id: 'el-cupcake-3d',
    nameAr: 'كب كيك الشمعة المضيئة (3D)',
    nameEn: 'Sparkle Wish Cupcake (3D)',
    category: 'cakes',
    dimension: '3d',
    defaultColor: '#E07A9B',
    secondaryColor: '#FAD2E1',
    svgType: 'cupcake_sparkle',
  },
  // 2. Hearts (القلوب)
  {
    id: 'el-heart-velvet-3d',
    nameAr: 'قلب مخملي ثلاثي الأبعاد (3D)',
    nameEn: 'Velvet 3D Heart',
    category: 'hearts',
    dimension: '3d',
    defaultColor: '#C84B61',
    secondaryColor: '#F4ACB7',
    svgType: 'velvet_heart',
  },
  {
    id: 'el-heart-crystal-3d',
    nameAr: 'قلب كريستال مذهّب (3D)',
    nameEn: 'Golden Crystal Heart (3D)',
    category: 'hearts',
    dimension: '3d',
    defaultColor: '#D4AF37',
    secondaryColor: '#FFFDF8',
    svgType: 'crystal_heart',
  },
  {
    id: 'el-heart-winged-2d',
    nameAr: 'قلب بأجنحة ملائكية (2D)',
    nameEn: 'Winged Love Heart (2D)',
    category: 'hearts',
    dimension: '2d',
    defaultColor: '#E07A9B',
    secondaryColor: '#FFFDF8',
    svgType: 'winged_heart',
  },
  // 3. Roses (الورود)
  {
    id: 'el-rose-damask-3d',
    nameAr: 'وردة جورية دمشقية (3D)',
    nameEn: 'Damask Velvet Rose (3D)',
    category: 'roses',
    dimension: '3d',
    defaultColor: '#B83B5E',
    secondaryColor: '#F4ACB7',
    svgType: 'damask_rose',
  },
  {
    id: 'el-rose-gold-3d',
    nameAr: 'زهرة الأتيليه الذهبية (3D)',
    nameEn: 'Atelier Golden Rose (3D)',
    category: 'roses',
    dimension: '3d',
    defaultColor: '#C9A24D',
    secondaryColor: '#F3E5AB',
    svgType: 'golden_bouquet',
  },
  {
    id: 'el-rose-blossom-2d',
    nameAr: 'زهرة الكرز الناعمة (2D)',
    nameEn: 'Soft Cherry Blossom (2D)',
    category: 'roses',
    dimension: '2d',
    defaultColor: '#F4ACB7',
    secondaryColor: '#FFFDF8',
    svgType: 'cherry_blossom',
  },
  // 4. Gifts (الهدايا)
  {
    id: 'el-gift-luxury-3d',
    nameAr: 'صندوق هدية ملكي بشريط (3D)',
    nameEn: 'Luxury Ribbon Gift Box (3D)',
    category: 'gifts',
    dimension: '3d',
    defaultColor: '#566B49',
    secondaryColor: '#E9DDC9',
    svgType: 'luxury_gift_box',
  },
  {
    id: 'el-gift-crimson-3d',
    nameAr: 'صندوق مفاجآت ياقوتي (3D)',
    nameEn: 'Ruby Surprise Chest (3D)',
    category: 'gifts',
    dimension: '3d',
    defaultColor: '#9E2A3B',
    secondaryColor: '#D4AF37',
    svgType: 'surprise_chest',
  },
  {
    id: 'el-gift-parcel-2d',
    nameAr: 'طرد هدية كلاسيكي (2D)',
    nameEn: 'Classic Gift Parcel (2D)',
    category: 'gifts',
    dimension: '2d',
    defaultColor: '#B9CCA0',
    secondaryColor: '#566B49',
    svgType: 'ribbon_parcel',
  },
  // 5. Balloons (البالونات)
  {
    id: 'el-balloon-metallic-3d',
    nameAr: 'بالون ذهبي معدني لامع (3D)',
    nameEn: 'Metallic Gold Balloon (3D)',
    category: 'balloons',
    dimension: '3d',
    defaultColor: '#D4AF37',
    secondaryColor: '#FFFDF8',
    svgType: 'metallic_balloon',
  },
  {
    id: 'el-balloon-rose-3d',
    nameAr: 'بالون الاحتفال الوردي (3D)',
    nameEn: 'Rose Confetti Balloon (3D)',
    category: 'balloons',
    dimension: '3d',
    defaultColor: '#D96B7B',
    secondaryColor: '#FAD2E1',
    svgType: 'confetti_balloon',
  },
  {
    id: 'el-balloon-sage-2d',
    nameAr: 'بالون فستقي هادئ (2D)',
    nameEn: 'Sage Pistachio Balloon (2D)',
    category: 'balloons',
    dimension: '2d',
    defaultColor: '#91A77D',
    secondaryColor: '#DCE8CB',
    svgType: 'heart_balloon',
  },
  // 6. Candles (الشموع)
  {
    id: 'el-candle-wax-3d',
    nameAr: 'شمعة الأمنيات الدافئة (3D)',
    nameEn: 'Warm Wish Pillar Candle (3D)',
    category: 'candles',
    dimension: '3d',
    defaultColor: '#FFFDF8',
    secondaryColor: '#D4AF37',
    svgType: 'wax_candle',
  },
  {
    id: 'el-candle-gold-3d',
    nameAr: 'شمعدان ملكي مذهّب (3D)',
    nameEn: 'Royal Gold Candle (3D)',
    category: 'candles',
    dimension: '3d',
    defaultColor: '#C9A24D',
    secondaryColor: '#FFFDF8',
    svgType: 'golden_candelabra',
  },
  {
    id: 'el-candle-flame-2d',
    nameAr: 'شعلة الأمل المضيئة (2D)',
    nameEn: 'Glowing Hope Candle (2D)',
    category: 'candles',
    dimension: '2d',
    defaultColor: '#E9DDC9',
    secondaryColor: '#91A77D',
    svgType: 'wish_flame',
  },
];

export const BIRTHDAY_RELATIONSHIPS_META: Array<{
  id: BirthdayRelationship;
  labelAr: string;
  labelEn: string;
  emoji: string;
  defaultCategory: BirthdayCategory;
  readyPhrasesAr: string[];
  readyPhrasesEn: string[];
}> = [
  {
    id: 'lover',
    labelAr: 'حبيب أو حبيبة',
    labelEn: 'Lover / Partner',
    emoji: '❤️',
    defaultCategory: 'romantic',
    readyPhrasesAr: [
      'يوم ميلادك يا {name} مو مجرد تاريخ بالرزنامة، هذا اليوم اللي انخلقت بيه فرحة عمري وضحكة أيامي.',
      'كل عام وأنتِ أجمل صدفة، وأغلى نعمة، وأحلى قدر جمعني بيه رب العالمين يا {name}.',
      'لو بيدي أهديكِ النجوم وحدة وحدة ما توفي غلاتك بقلبي.. عيد ميلاد سعيد يا نبض روحي.',
    ],
    readyPhrasesEn: [
      'Your birthday, {name}, is not just a date on the calendar—it is the day the joy of my life was born.',
      'Happy Birthday to my favorite person, my safe haven, and my forever love, {name}.',
    ],
  },
  {
    id: 'spouse',
    labelAr: 'زوج أو زوجة',
    labelEn: 'Husband / Wife',
    emoji: '💍',
    defaultCategory: 'luxury',
    readyPhrasesAr: [
      'إلى شريك عمري وسندي وأماني {name}.. كل سنة وإحنا سوة، وكل عام وضحكتك تنور بيتنا وحياتنا.',
      'وجودك بحياتي خلى لكل يوم طعم مختلف.. كل عام وأنتَ/أنتِ الوطن والقلب والروح.',
    ],
    readyPhrasesEn: [
      'To my life partner and soulmate {name}, may every year bring us closer in love and happiness.',
    ],
  },
  {
    id: 'friend',
    labelAr: 'صديق أو صديقة',
    labelEn: 'Best Friend',
    emoji: '✨',
    defaultCategory: 'friendship',
    readyPhrasesAr: [
      'للصديق اللي يساوي ألف أخ وسند {name}.. كل عام وأنت بخير وصحة وضحكة ما تفارق وجهك أبد!',
      'أحلى الذكريات وأصدق الضحكات عشتها وياك يا {name}.. سنة جديدة مليانة نجاحات ومغامرات سوة!',
      'كل عام وأنت الصديق الصدوق اللي ما تغيره الأيام ولا المسافات.',
    ],
    readyPhrasesEn: [
      'To the friend who feels like family, {name}—wishing you a year full of laughter, success, and unforgettable memories!',
    ],
  },
  {
    id: 'sibling',
    labelAr: 'أخ أو أخت',
    labelEn: 'Brother / Sister',
    emoji: '🤍',
    defaultCategory: 'family',
    readyPhrasesAr: [
      'عضيدي وسندي وقطعة من روحي {name}.. كل عام وأنت بألف خير وربي يحفظك إلنا ذخر وفرحة.',
      'الأخ/الأخت نعمة عظيمة، وأنت يا {name} أحلى نعمة بحياتنا.. عيد ميلاد سعيد ومبارك!',
    ],
    readyPhrasesEn: [
      'To my dearest sibling and lifelong friend {name}, wishing you endless happiness and bright days ahead!',
    ],
  },
  {
    id: 'parent',
    labelAr: 'أم أو أب',
    labelEn: 'Mother / Father',
    emoji: '👑',
    defaultCategory: 'emotional',
    readyPhrasesAr: [
      'إلى تاج راسنا وبركة بيتنا وجنتنا بالدنيا {name}.. كل عام وأنتوا بخير وصحة وعافية وطول عمر.',
      'ربي يديم ضحكتكم وصوتكم اللي يملي البيت أمان وحنان.. كل عام وأنتوا أغلى ما نملك.',
    ],
    readyPhrasesEn: [
      'To the heart and soul of our family, {name}—may you be blessed with health, peace, and endless joy.',
    ],
  },
  {
    id: 'child',
    labelAr: 'ابن أو ابنة',
    labelEn: 'Son / Daughter',
    emoji: '🎈',
    defaultCategory: 'cute',
    readyPhrasesAr: [
      'فرحة عمرنا ونور عيوننا {name}.. كبرت سنة وكبر وياها حبنا وفخرنا بيك! كل عام وأنت بألف خير.',
      'يا أحلى هدية من رب العالمين، نتمنى لك سنة مليانة تفوق وفرح وأحلام تتحقق.',
    ],
    readyPhrasesEn: [
      'To our little star and biggest joy {name}, happy birthday! Keep shining bright every single day.',
    ],
  },
  {
    id: 'relative',
    labelAr: 'قريب أو قريبة',
    labelEn: 'Relative',
    emoji: '🌸',
    defaultCategory: 'family',
    readyPhrasesAr: [
      'كل عام وأنت بألف خير يا {name}، سنة سعيدة ومباركة مليئة بالخير والبركة وتحقيق الأماني.',
    ],
    readyPhrasesEn: [
      'Wishing you a wonderful birthday, {name}, filled with blessings, health, and family warmth.',
    ],
  },
  {
    id: 'colleague',
    labelAr: 'زميل أو زميلة',
    labelEn: 'Colleague',
    emoji: '🌟',
    defaultCategory: 'luxury',
    readyPhrasesAr: [
      'زميلنا المميز {name}، كل عام وأنت بخير وتألق ونجاح مستمر في مسيرتك المهنية والشخصية.',
    ],
    readyPhrasesEn: [
      'Happy Birthday, {name}! Wishing you continued excellence, growth, and success in the year ahead.',
    ],
  },
  {
    id: 'general',
    labelAr: 'تهنئة عامة لأي شخص',
    labelEn: 'General Greeting',
    emoji: '🎂',
    defaultCategory: 'cinematic',
    readyPhrasesAr: [
      'كل عام وأنت بألف خير يا {name}! نتمنى لك عاماً جديداً يشبه جمال روحك ويحقق كل أحلامك.',
    ],
    readyPhrasesEn: [
      'Happy Birthday, {name}! Wishing you a magical year filled with joy, health, and fulfilled dreams.',
    ],
  },
];

export const BIRTHDAY_CATEGORIES_META: Array<{
  id: BirthdayCategory;
  nameAr: string;
  nameEn: string;
  badgeAr: string;
  badgeEn: string;
  descAr: string;
  descEn: string;
  accentColor: string;
}> = [
  {
    id: 'romantic',
    nameAr: 'رومانسي حالم',
    nameEn: 'Romantic',
    badgeAr: 'قلوب ورسائل حب سرية',
    badgeEn: 'Hearts & Secret Love Notes',
    descAr: 'إضاءة دافئة، بتلات ورد وقلوب طائرة، رسالة سرية بكلمة مرور، وفتح ظرف شمعي.',
    descEn: 'Warm candlelight glow, floating hearts, password secret message, and wax envelope opening.',
    accentColor: '#D96B7B',
  },
  {
    id: 'funny',
    nameAr: 'كوميدي ومضحك',
    nameEn: 'Funny & Comedy',
    badgeAr: 'مفاجآت مرحة وكشط كوميدي',
    badgeEn: 'Playful Pranks & Comedy Scratch',
    descAr: 'حركات بهلوانية مرحة، بطاقة اكشط واكتشف كوميدية، وعداد العمر بطابع فكاهي.',
    descEn: 'Bouncy animations, hilarious scratch-to-reveal jokes, and playful age teasing.',
    accentColor: '#E59528',
  },
  {
    id: 'luxury',
    nameAr: 'أنيق وملكي (Elegant)',
    nameEn: 'Elegant & Luxury',
    badgeAr: 'ذهبي ملكي وسبائك فاخرة',
    badgeEn: 'Royal Gold & Velvet',
    descAr: 'هوية ملكية بالأسود الكحلي والذهبي مع سحب ستارة المسرح وصندوق هدية فاخر.',
    descEn: 'Regal obsidian & champagne gold with velvet stage curtains and luxury gift boxes.',
    accentColor: '#C9A24D',
  },
  {
    id: 'cinematic',
    nameAr: 'سينمائي وإبداعي',
    nameEn: 'Creative & Cinematic',
    badgeAr: 'مشاهد سينمائية ثلاثية الأبعاد',
    badgeEn: '3D Cinematic Scenes',
    descAr: 'انتقالات سينمائية ثلاثية الأبعاد، نجوم متلألئة، وباب مفاجآت يفتح على عالم الاحتفال.',
    descEn: '3D flip transitions, starry cosmos, and a magical door opening into celebration.',
    accentColor: '#6C5CE7',
  },
  {
    id: 'cute',
    nameAr: 'لطيف ومرح',
    nameEn: 'Cute & Playful',
    badgeAr: 'بالونات وكعكة تفاعلية',
    badgeEn: 'Balloons & Sweet Cake',
    descAr: 'ألوان باستيل ناعمة، بالونات طائرة، كعكة عيد ميلاد تفاعلية لإطفاء الشموع، وهدايا ملونة.',
    descEn: 'Soft pastel colors, floating balloons, interactive candle-blowing cake, and gift boxes.',
    accentColor: '#E07A9B',
  },
  {
    id: 'family',
    nameAr: 'حب العائلة',
    nameEn: 'Family Love',
    badgeAr: 'دفء العائلة والذكريات',
    badgeEn: 'Warm Family Heritage',
    descAr: 'تصميم حليبي وفستقي دافئ يناسب الوالدين والإخوة والأبناء مع ألبوم صور العائلة.',
    descEn: 'Warm milky & pistachio aesthetic tailored for parents, siblings, and family albums.',
    accentColor: '#566B49',
  },
  {
    id: 'emotional',
    nameAr: 'عاطفي ومؤثر',
    nameEn: 'Emotional & Heartfelt',
    badgeAr: 'كلمات عميقة تلامس القلب',
    badgeEn: 'Deep Heartfelt Story',
    descAr: 'سرد قصصي هادئ، موسيقى بيانو دافئة، وصندوق ذكريات يروي أجمل اللحظات معاً.',
    descEn: 'Poetic storytelling, warm piano chords, and an intimate memory box journey.',
    accentColor: '#8B7355',
  },
  {
    id: 'friendship',
    nameAr: 'الصداقة والوفاء',
    nameEn: 'Friendship',
    badgeAr: 'مغامرات الأصدقاء',
    badgeEn: 'Best Friends Forever',
    descAr: 'طاقة إيجابية، كروت «تتذكر هذا اليوم؟»، وتحديات وهدايا رقمية بين الأصدقاء.',
    descEn: 'Vibrant energy, "Remember this day?" flashcards, and digital friendship gift boxes.',
    accentColor: '#3D848B',
  },
];

export const BIRTHDAY_MUSIC_LIBRARY: BirthdayMusicTrack[] = [
  {
    id: 'bday_romantic',
    nameAr: 'موسيقى رومانسية حالمة (بيانو وكمان)',
    nameEn: 'Dreamy Romantic Piano & Strings',
    category: 'romantic',
    durationLabel: '03:15',
    synthGenre: 'bday_romantic',
    isLicensed: true,
  },
  {
    id: 'bday_calm',
    nameAr: 'موسيقى هادئة ودافئة للذكريات',
    nameEn: 'Warm Calm Acoustic Memories',
    category: 'calm',
    durationLabel: '02:50',
    synthGenre: 'bday_calm',
    isLicensed: true,
  },
  {
    id: 'bday_playful',
    nameAr: 'موسيقى عيد ميلاد مرحة ومبهجة',
    nameEn: 'Joyful & Playful Birthday Melody',
    category: 'playful',
    durationLabel: '02:20',
    synthGenre: 'bday_playful',
    isLicensed: true,
  },
  {
    id: 'bday_cinematic',
    nameAr: 'موسيقى سينمائية ملحمية للمفاجآت',
    nameEn: 'Cinematic Orchestra Surprise',
    category: 'cinematic',
    durationLabel: '03:40',
    synthGenre: 'bday_cinematic',
    isLicensed: true,
  },
  {
    id: 'bday_music_box',
    nameAr: 'صندوق الموسيقى الكلاسيكي الساحر',
    nameEn: 'Enchanted Classic Music Box',
    category: 'classic',
    durationLabel: '02:10',
    synthGenre: 'bday_music_box',
    isLicensed: true,
  },
];

export const BIRTHDAY_STICKERS = [
  '🎂', '🕯️', '🎁', '🎈', '🎉', '✨', '❤️', '👑', '🌹', '🦋', '💌', '🥳', '🍫', '🌟', '🎶', '🧸',
];

const DEFAULT_PAGES_FULL: BirthdayPageConfig[] = [
  {
    id: 'pg-teaser',
    type: 'teaser',
    enabled: true,
    title: 'عندك رسالة ومفاجأة خاصة جداً 💌',
    subtitle: 'هذه ليست بطاقة عادية.. هناك قصة صُممت خصيصاً من أجلك',
    buttonLabel: 'افتح المفاجأة الآن ✨',
    badgeText: 'مفاجأة خاصة',
  },
  {
    id: 'pg-reveal',
    type: 'reveal',
    enabled: true,
    title: 'كل عام وأنت أجمل ما في الحياة',
    subtitle: 'اليوم نحتفل بذكرى ميلاد شخص استثنائي لا يشبه أحداً',
    buttonLabel: 'ابدأ رحلة التهنئة',
    badgeText: 'يوم ميلاد سعيد',
  },
  {
    id: 'pg-greeting',
    type: 'main_greeting',
    enabled: true,
    title: 'رسالة من القلب إليك',
    subtitle: 'اضغط على القلب المضيء لتقرأ الرسالة المخفية وتكتشف شكد أنت غالي',
    buttonLabel: 'انتقل إلى صندوق الذكريات',
    badgeText: 'كلمات من القلب',
  },
  {
    id: 'pg-memories',
    type: 'memory_box',
    enabled: true,
    title: 'صندوق الذكريات الجميلة 📸',
    subtitle: 'تتذكر هذه اللحظات؟ كل صورة هنا تحمل قصة لا تُنسى',
    buttonLabel: 'وقت كعكة عيد الميلاد 🎂',
    badgeText: 'صندوق الذكريات',
  },
  {
    id: 'pg-cake',
    type: 'cake_candles',
    enabled: true,
    title: 'كعكة عيد الميلاد التفاعلية 🎂',
    subtitle: 'تمنَّ أمنية جميلة في قلبك ثم اضغط على الشموع لإطفائها!',
    buttonLabel: 'اكشط بطاقة المفاجأة ✨',
    badgeText: 'أمنية العام الجديد',
  },
  {
    id: 'pg-scratch',
    type: 'scratch_reveal',
    enabled: true,
    title: 'اكشط واكتشف مفاجأتك 🪙',
    subtitle: 'مرر إصبعك أو الماوس على الطبقة الذهبية لكشف ما بداخلها',
    buttonLabel: 'افتح الرسالة السرية 🔒',
    badgeText: 'اكشط واكتشف',
  },
  {
    id: 'pg-secret',
    type: 'secret_message',
    enabled: true,
    title: 'رسالة سرية بكلمة مرور 🔐',
    subtitle: 'عندك رسالة سرية خاصة، بس لازم تعرف كلمة السر حتى تفتحها!',
    buttonLabel: 'افتح صندوق الهدايا 🎁',
    badgeText: 'للعيون الخاصة فقط',
  },
  {
    id: 'pg-gifts',
    type: 'gift_box',
    enabled: true,
    title: 'صندوق الهدايا الرقمي 🎁',
    subtitle: 'اضغط على كل صندوق هدية لفتحه تدريجياً واكتشاف المفاجآت بداخله',
    buttonLabel: 'الرسالة الختامية والأمنيات',
    badgeText: 'هداياك الخاصة',
  },
  {
    id: 'pg-final',
    type: 'final_wishes',
    enabled: true,
    title: 'أجمل الأمنيات لعامك الجديد 🌟',
    subtitle: 'دمتَ محاطاً بالحب والفرح والنجاح في كل خطوة',
    buttonLabel: 'إعادة عيش التجربة من البداية',
    badgeText: 'كل عام وأنت بخير',
  },
];

const DEFAULT_ROMANTIC_ELEMENTS: PlacedCanvasElement[] = [
  {
    id: 'cel-rom-1',
    assetId: 'el-heart-velvet-3d',
    svgType: 'velvet_heart',
    nameAr: 'قلب مخملي (3D)',
    nameEn: 'Velvet Heart (3D)',
    category: 'hearts',
    dimension: '3d',
    color: '#C84B61',
    secondaryColor: '#F4ACB7',
    size: 54,
    x: 12,
    y: 18,
    opacity: 0.85,
    animationType: 'float',
    animationDuration: 3.5,
    animationDelay: 0,
    targetPage: 'all',
  },
  {
    id: 'cel-rom-2',
    assetId: 'el-rose-damask-3d',
    svgType: 'damask_rose',
    nameAr: 'وردة جورية (3D)',
    nameEn: 'Damask Rose (3D)',
    category: 'roses',
    dimension: '3d',
    color: '#B83B5E',
    secondaryColor: '#F4ACB7',
    size: 52,
    x: 88,
    y: 22,
    opacity: 0.85,
    animationType: 'swing',
    animationDuration: 4.2,
    animationDelay: 0.5,
    targetPage: 'all',
  },
];

const DEFAULT_ROYAL_ELEMENTS: PlacedCanvasElement[] = [
  {
    id: 'cel-roy-1',
    assetId: 'el-candle-gold-3d',
    svgType: 'golden_candelabra',
    nameAr: 'شمعدان ملكي (3D)',
    nameEn: 'Royal Gold Candle (3D)',
    category: 'candles',
    dimension: '3d',
    color: '#D4AF37',
    secondaryColor: '#FFFDF8',
    size: 56,
    x: 11,
    y: 20,
    opacity: 0.9,
    animationType: 'glow',
    animationDuration: 3.2,
    animationDelay: 0,
    targetPage: 'all',
  },
  {
    id: 'cel-roy-2',
    assetId: 'el-gift-crimson-3d',
    svgType: 'surprise_chest',
    nameAr: 'صندوق ملكي (3D)',
    nameEn: 'Royal Gift Chest (3D)',
    category: 'gifts',
    dimension: '3d',
    color: '#D4AF37',
    secondaryColor: '#FFFDF8',
    size: 52,
    x: 88,
    y: 78,
    opacity: 0.85,
    animationType: 'float',
    animationDuration: 4,
    animationDelay: 0.4,
    targetPage: 'all',
  },
];

export const INITIAL_BIRTHDAY_TEMPLATES: BirthdayTemplate[] = [
  {
    id: 'bday-tpl-romantic-velvet',
    nameAr: 'همسة حب رومانسية — ألبوم بولارويد والختم الشمعي',
    nameEn: 'Romantic Velvet Whisper — Wax Seal & Polaroids',
    occasionType: 'birthday',
    visualArchitecture: 'polaroid_journal',
    category: 'romantic',
    supportedRelationships: ['lover', 'spouse'],
    descriptionAr: 'تجربة رومانسية حالمة بفتح ظرف شمعي، إطارات صور بولارويد فورية، ورود ثلاثية الأبعاد، ورسالة سرية بكلمة مرور.',
    descriptionEn: 'Dreamy romantic journey with wax envelope opening, instant Polaroid photo frames, 3D velvet roses, and password love note.',
    badgeAr: 'الأكثر طلباً للعشاق · Polaroid',
    badgeEn: 'Top Pick for Lovers · Polaroid',
    tier: 'vip',
    priceIQD: 25000,
    thumbnailUrl: createArtisticSvgDataUri('#3D1018', '#1F070B', '#F4ACB7', 'rose_seal', 'Romantic Velvet Whisper'),
    themeColors: {
      background: '#FFF7F8',
      cardBg: '#FFFFFF',
      primary: '#C84B61',
      secondary: '#F4ACB7',
      textColor: '#4A1C24',
      accentGlow: 'rgba(200, 75, 97, 0.22)',
      border: '#F3D1D7',
    },
    defaultOpeningMechanic: 'envelope',
    defaultPhotoFrameStyle: 'polaroid',
    defaultCanvasElements: DEFAULT_ROMANTIC_ELEMENTS,
    defaultParticleEffect: 'hearts',
    defaultTransitionStyle: 'flip_3d',
    defaultMusicTrackId: 'bday_romantic',
    defaultTextStyle: {
      fontFamily: 'amiri',
      fontSize: 'lg',
      textAlign: 'center',
      textColor: '#4A1C24',
      direction: 'auto',
    },
    defaultPages: DEFAULT_PAGES_FULL,
    defaultGreetingData: {
      coverTeaserText: 'عندك رسالة حب خاصة جداً 💌',
      coverSubtitle: 'إلى الشخص الذي غيّر حياتي وجعل لكل يوم معنى أجمل',
      coverButtonText: 'افتح ظرف الرسالة ❤️',
      hiddenHeartMessage: 'كل نبضة بقلبي تقولك: شكراً لأنك بحياتي، وشكراً لأنك أنت الأمان والحب كله.',
      howPreciousScoreText: 'غلاتك عندي: ١٠٠٠٪ فوق حدود الكون والنجوم ✨',
    },
  },
  {
    id: 'bday-tpl-funny-comedy',
    nameAr: 'كوميديا ومقالب الأصدقاء — قصاصات Scrapbook',
    nameEn: 'Comedy & Playful Roasts — Scrapbook Edition',
    occasionType: 'birthday',
    visualArchitecture: 'playful_pop',
    category: 'funny',
    supportedRelationships: ['friend', 'sibling', 'colleague', 'general'],
    descriptionAr: 'تصميم مرح ومضحك بهوية Scrapbook التفاعلية مع بطاقة كشط كوميدية، عداد الكبر بالعمر، وصناديق مفاجآت!',
    descriptionEn: 'Hilarious Scrapbook interactive journey with comedy scratch card, playful age counter, and surprise boxes!',
    badgeAr: 'كوميدي · Scrapbook',
    badgeEn: 'Funny · Scrapbook',
    tier: 'free',
    priceIQD: 0,
    thumbnailUrl: createArtisticSvgDataUri('#451A03', '#78350F', '#FCD34D', 'gift_confetti', 'Comedy & Scrapbook Fun'),
    themeColors: {
      background: '#FFFDF4',
      cardBg: '#FFFFFF',
      primary: '#D97706',
      secondary: '#FCD34D',
      textColor: '#451A03',
      accentGlow: 'rgba(245, 158, 11, 0.22)',
      border: '#FDE68A',
    },
    defaultOpeningMechanic: 'gift_tap',
    defaultPhotoFrameStyle: 'scrapbook',
    defaultParticleEffect: 'funny_emojis',
    defaultTransitionStyle: 'slide',
    defaultMusicTrackId: 'bday_playful',
    defaultTextStyle: {
      fontFamily: 'cairo',
      fontSize: 'md',
      textAlign: 'center',
      textColor: '#451A03',
      direction: 'auto',
    },
    defaultPages: DEFAULT_PAGES_FULL,
    defaultGreetingData: {
      coverTeaserText: 'تحذير هام: أحدهم كبر سنة اليوم! 🚨😂',
      coverSubtitle: 'اضغط على الصندوق قبل أن تنفجر المفاجأة الكوميدية',
      coverButtonText: 'افتح على مسؤوليتك 🎁',
      hiddenHeartMessage: 'رغم كل المقالب والضحك، تبقى أعز وأوفى صديق بالدنيا وما أبدلك بكنوز الأرض!',
      howPreciousScoreText: 'مستوى المعزة: أسطوري (بس لا تطلب عزيمة غالية 😂)',
    },
  },
  {
    id: 'bday-tpl-emotional-story',
    nameAr: 'حكاية وفاء ومشاعر صادقة — الخط الزمني Timeline',
    nameEn: 'Heartfelt Poetic Story — Memory Timeline',
    occasionType: 'anniversary',
    visualArchitecture: 'botanical_manuscript',
    category: 'emotional',
    supportedRelationships: ['parent', 'spouse', 'lover', 'friend', 'sibling'],
    descriptionAr: 'تصميم شاعري مؤثر بهوية المخطوطة والخط الزمني Timeline يركز على الكلمات العميقة والموسيقى الهادئة.',
    descriptionEn: 'Deeply touching poetic manuscript template with chronological Memory Timeline and gentle piano music.',
    badgeAr: 'عاطفي · Timeline',
    badgeEn: 'Emotional · Timeline',
    tier: 'paid',
    priceIQD: 15000,
    thumbnailUrl: createArtisticSvgDataUri('#3B2B1E', '#1F160F', '#D4BFA8', 'polaroid_leaves', 'Heartfelt Timeline Story'),
    themeColors: {
      background: '#FBF9F5',
      cardBg: '#FFFDF9',
      primary: '#7C5E44',
      secondary: '#D4BFA8',
      textColor: '#3B2B1E',
      accentGlow: 'rgba(124, 94, 68, 0.18)',
      border: '#E6D9C8',
    },
    defaultOpeningMechanic: 'door',
    defaultPhotoFrameStyle: 'timeline',
    defaultParticleEffect: 'sparkles',
    defaultTransitionStyle: 'fade_scale',
    defaultMusicTrackId: 'bday_calm',
    defaultTextStyle: {
      fontFamily: 'amiri',
      fontSize: 'lg',
      textAlign: 'center',
      textColor: '#3B2B1E',
      direction: 'auto',
    },
    defaultPages: DEFAULT_PAGES_FULL,
    defaultGreetingData: {
      coverTeaserText: 'هنالك كلمات لا تُقال كل يوم.. لكنها كُتبت لك اليوم 🕯️',
      coverSubtitle: 'افتح الباب لتدخل إلى مساحة مليئة بالامتنان والذكريات الصادقة',
      coverButtonText: 'افتح باب الذكريات ✨',
    },
  },
  {
    id: 'bday-tpl-family-pistachio',
    nameAr: 'دفء العائلة الحليبي والفستقي — ألبوم العائلة',
    nameEn: 'Family Warmth Pistachio & Cream — Family Album',
    occasionType: 'family_reunion',
    visualArchitecture: 'botanical_manuscript',
    category: 'family',
    supportedRelationships: ['parent', 'sibling', 'child', 'relative'],
    descriptionAr: 'مستوحى من الهوية الحليبية والفستقية الراقية لمراسيم، مخصص لتهنئة الأم والأب والإخوة والعائلة الكريمة.',
    descriptionEn: 'Inspired by Maraseem’s signature Milky & Pistachio palette, crafted for parents, siblings, and cherished family.',
    badgeAr: 'هوية العائلة · Scrapbook',
    badgeEn: 'Family Theme · Scrapbook',
    tier: 'free',
    priceIQD: 0,
    thumbnailUrl: createArtisticSvgDataUri('#566B49', '#2E3B26', '#DCE8CB', 'polaroid_leaves', 'Maraseem Pistachio Heritage'),
    themeColors: {
      background: '#F8F6EF',
      cardBg: '#FFFDF8',
      primary: '#566B49',
      secondary: '#B9CCA0',
      textColor: '#566B49',
      accentGlow: 'rgba(145, 167, 125, 0.25)',
      border: '#E9DDC9',
    },
    defaultOpeningMechanic: 'envelope',
    defaultPhotoFrameStyle: 'scrapbook',
    defaultParticleEffect: 'sparkles',
    defaultTransitionStyle: 'flip_3d',
    defaultMusicTrackId: 'bday_calm',
    defaultTextStyle: {
      fontFamily: 'cairo',
      fontSize: 'lg',
      textAlign: 'center',
      textColor: '#566B49',
      direction: 'auto',
    },
    defaultPages: DEFAULT_PAGES_FULL,
    defaultGreetingData: {
      coverTeaserText: 'إلى أغلى الناس وبركة حياتنا وعائلتنا 🌿',
      coverSubtitle: 'تهنئة قلبية خاصة بمناسبة يوم ميلادك المبارك',
      coverButtonText: 'افتح التهنئة العائلية 🤍',
    },
  },
  {
    id: 'bday-tpl-friendship-adventure',
    nameAr: 'رفاق العمر والمغامرات — بولارويد الأصدقاء',
    nameEn: 'Lifelong Friends & Adventures — Polaroid Deck',
    occasionType: 'graduation_congrats',
    visualArchitecture: 'polaroid_journal',
    category: 'friendship',
    supportedRelationships: ['friend', 'colleague', 'sibling'],
    descriptionAr: 'مصمم للأصدقاء المقربين والتخرج مع ألبوم بولارويد «تتذكر هذا اليوم؟»، قسائم هدايا، ورسائل سرية.',
    descriptionEn: 'Designed for best friends and graduation milestones with Polaroid flashcards, gift vouchers, and secret notes.',
    badgeAr: 'للأصدقاء · Polaroid',
    badgeEn: 'Best Friends · Polaroid',
    tier: 'paid',
    priceIQD: 15000,
    thumbnailUrl: createArtisticSvgDataUri('#194549', '#0E292B', '#94D2BD', 'gift_confetti', 'Lifelong Friends Polaroid'),
    themeColors: {
      background: '#F2F9F9',
      cardBg: '#FFFFFF',
      primary: '#2A6F75',
      secondary: '#94D2BD',
      textColor: '#194549',
      accentGlow: 'rgba(42, 111, 117, 0.2)',
      border: '#CBE8E8',
    },
    defaultOpeningMechanic: 'gift_tap',
    defaultPhotoFrameStyle: 'polaroid',
    defaultParticleEffect: 'confetti',
    defaultTransitionStyle: 'slide',
    defaultMusicTrackId: 'bday_playful',
    defaultTextStyle: {
      fontFamily: 'tajawal',
      fontSize: 'md',
      textAlign: 'center',
      textColor: '#194549',
      direction: 'auto',
    },
    defaultPages: DEFAULT_PAGES_FULL,
    defaultGreetingData: {
      coverTeaserText: 'رسالة خاصة لأعز صديق وعشرة عمر ✨',
      coverSubtitle: 'جمعنا لك أحلى الذكريات والمفاجآت بمكان واحد',
      coverButtonText: 'افتح مفاجأة الصداقة 🎉',
    },
  },
  {
    id: 'bday-tpl-luxury-royal',
    nameAr: 'الفخامة الملكية المذهّبة — المسرح الملكي',
    nameEn: 'Royal Obsidian & Gold — Velvet Stage',
    occasionType: 'promotion',
    visualArchitecture: 'royal_stage',
    category: 'luxury',
    supportedRelationships: ['spouse', 'lover', 'parent', 'colleague', 'general'],
    descriptionAr: 'تجربة ملكية فاخرة بسحب ستارة المسرح المذهّبة، معرض صور سينمائي، طبقة كشط ذهبية، وصناديق هدايا VIP.',
    descriptionEn: 'Regal luxury experience with golden stage curtains, cinematic gallery frames, gold foil scratch card, and VIP gifts.',
    badgeAr: 'فخامة ملكية · Royal Stage',
    badgeEn: 'Royal VIP · Velvet Stage',
    tier: 'vip',
    priceIQD: 30000,
    thumbnailUrl: createArtisticSvgDataUri('#141311', '#2B2418', '#D4AF37', 'stage_curtain', 'Royal Obsidian & Gold'),
    themeColors: {
      background: '#141311',
      cardBg: '#1E1C18',
      primary: '#D4AF37',
      secondary: '#F3E5AB',
      textColor: '#FAF6F0',
      accentGlow: 'rgba(212, 175, 55, 0.25)',
      border: '#3D3526',
    },
    defaultOpeningMechanic: 'curtain',
    defaultPhotoFrameStyle: 'cinematic_gallery',
    defaultPhotoColorFilter: 'golden_cinema',
    defaultCanvasElements: DEFAULT_ROYAL_ELEMENTS,
    defaultParticleEffect: 'stars',
    defaultTransitionStyle: 'curtain_reveal',
    defaultMusicTrackId: 'bday_cinematic',
    defaultTextStyle: {
      fontFamily: 'amiri',
      fontSize: 'xl',
      textAlign: 'center',
      textColor: '#FAF6F0',
      direction: 'auto',
    },
    defaultPages: DEFAULT_PAGES_FULL,
    defaultGreetingData: {
      coverTeaserText: 'أمسية ملكية خاصة للاحتفال بك 👑',
      coverSubtitle: 'اسحب ستارة المسرح المذهّبة لتبدأ مراسم التهنئة الخاصة بك',
      coverButtonText: 'اسحب الستارة الملكية ✨',
    },
  },
  {
    id: 'bday-tpl-cinematic-cosmos',
    nameAr: 'العرض السينمائي والنجوم — Cinematic Gallery',
    nameEn: 'Cinematic Starlight Odyssey — Widescreen Gallery',
    occasionType: 'general_celebration',
    visualArchitecture: 'cinematic_widescreen',
    category: 'cinematic',
    supportedRelationships: ['lover', 'friend', 'spouse', 'sibling', 'general'],
    descriptionAr: 'قصة سينمائية متعددة المشاهد بتأثير تقليب ثلاثي الأبعاد، معرض صور سينمائي 16:9، وإضاءة نجوم الليل الساحرة.',
    descriptionEn: 'Multi-scene cinematic story with 3D page flip transitions, 16:9 Cinematic Gallery, and starry night ambiance.',
    badgeAr: 'سينمائي · Cinematic 16:9',
    badgeEn: '3D Cinematic · 16:9 Gallery',
    tier: 'vip',
    priceIQD: 25000,
    thumbnailUrl: createArtisticSvgDataUri('#131629', '#090B16', '#A29BFE', 'cinema_stars', 'Cinematic Starlight 16:9'),
    themeColors: {
      background: '#131629',
      cardBg: '#1C213B',
      primary: '#A29BFE',
      secondary: '#74B9FF',
      textColor: '#F5F6FA',
      accentGlow: 'rgba(162, 155, 254, 0.26)',
      border: '#2F365F',
    },
    defaultOpeningMechanic: 'door',
    defaultPhotoFrameStyle: 'cinematic_gallery',
    defaultPhotoColorFilter: 'teal_orange',
    defaultParticleEffect: 'stars',
    defaultTransitionStyle: 'flip_3d',
    defaultMusicTrackId: 'bday_cinematic',
    defaultTextStyle: {
      fontFamily: 'cairo',
      fontSize: 'lg',
      textAlign: 'center',
      textColor: '#F5F6FA',
      direction: 'auto',
    },
    defaultPages: DEFAULT_PAGES_FULL,
    defaultGreetingData: {
      coverTeaserText: 'في مثل هذا اليوم.. أشرقت نجمة غيرت كل شيء 🌟',
      coverSubtitle: 'عرض سينمائي تفاعلي صُمم ليحكي قصتك في يوم ميلادك',
      coverButtonText: 'ابدأ العرض السينمائي 🎬',
    },
  },
  {
    id: 'bday-tpl-cute-pastel',
    nameAr: 'كرنفال الكعكة والبالونات — غلاف الكعكة التفاعلي',
    nameEn: 'Sweet Pastel Carnival — Interactive Cake Cover',
    occasionType: 'new_baby',
    visualArchitecture: 'playful_pop',
    category: 'cute',
    supportedRelationships: ['child', 'sibling', 'friend', 'lover'],
    descriptionAr: 'غلاف افتتاحي على شكل كعكة احتفالية تفاعلية، بالونات ثلاثية الأبعاد، وإطارات صور بولارويد مبهجة.',
    descriptionEn: 'Interactive birthday cake opening cover, 3D floating balloons, and cheerful Polaroid frames.',
    badgeAr: 'غلاف الكعكة التفاعلي 🎂',
    badgeEn: 'Interactive Cake Cover 🎂',
    tier: 'free',
    priceIQD: 0,
    thumbnailUrl: createArtisticSvgDataUri('#4F2435', '#2E121D', '#F9B8D0', 'cake_candles', 'Sweet Cake Cover Edition'),
    themeColors: {
      background: '#FFF5F9',
      cardBg: '#FFFFFF',
      primary: '#D95B8A',
      secondary: '#F9B8D0',
      textColor: '#4F2435',
      accentGlow: 'rgba(217, 91, 138, 0.2)',
      border: '#FAD2E1',
    },
    defaultOpeningMechanic: 'cake_cover',
    defaultPhotoFrameStyle: 'polaroid',
    defaultParticleEffect: 'balloons',
    defaultTransitionStyle: 'fade_scale',
    defaultMusicTrackId: 'bday_music_box',
    defaultTextStyle: {
      fontFamily: 'tajawal',
      fontSize: 'lg',
      textAlign: 'center',
      textColor: '#4F2435',
      direction: 'auto',
    },
    defaultPages: DEFAULT_PAGES_FULL,
    defaultGreetingData: {
      coverTeaserText: 'أشعلنا شموع الكعكة خصيصاً من أجلك! 🎂🕯️',
      coverSubtitle: 'اضغط على كعكة الاحتفال لإطفاء شمعة الغلاف وفتح المفاجأة',
      coverButtonText: 'احتفل وافتح الكعكة 🎂',
    },
  },
];

export function createBirthdayGreetingFromTemplate(
  template: BirthdayTemplate,
  overrides?: Partial<BirthdayGreetingData>
): BirthdayGreetingData {
  const recipientName = overrides?.recipientName || 'اسم المحتفى به';
  const relationship = overrides?.relationship || template.supportedRelationships[0] || 'lover';
  const relMeta =
    BIRTHDAY_RELATIONSHIPS_META.find((r) => r.id === relationship) ||
    BIRTHDAY_RELATIONSHIPS_META[0];
  const defaultPhrase = relMeta.readyPhrasesAr[0].replace(/\{name\}/g, recipientName);

  const cleanSlug = sanitizeInvitationSlug(
    overrides?.slug || `bday-default-${Math.floor(100 + Math.random() * 900)}`
  );

  return {
    id: overrides?.id || `bday-${Date.now()}`,
    slug: cleanSlug,
    templateId: template.id,
    occasionType: overrides?.occasionType || template.occasionType || 'birthday',
    visualArchitecture:
      overrides?.visualArchitecture || template.visualArchitecture || 'polaroid_journal',
    category: template.category,
    relationship,
    recipientName,
    recipientNickname: overrides?.recipientNickname || 'اللقب المحبب',
    senderName: overrides?.senderName || 'اسم المُهدي',
    recipientAge: overrides?.recipientAge || 25,
    birthDate: overrides?.birthDate || '2026-11-15',

    openingMechanic:
      overrides?.openingMechanic || template.defaultOpeningMechanic || 'envelope',
    coverTeaserText:
      overrides?.coverTeaserText ||
      template.defaultGreetingData.coverTeaserText ||
      'عندك رسالة خاصة جداً 💌',
    coverSubtitle:
      overrides?.coverSubtitle ||
      template.defaultGreetingData.coverSubtitle ||
      'افتح الرسالة لتبدأ رحلة مفاجآت يوم ميلادك',
    coverButtonText:
      overrides?.coverButtonText ||
      template.defaultGreetingData.coverButtonText ||
      'افتح المفاجأة الآن ✨',
    finalCoverQuote:
      overrides?.finalCoverQuote ||
      'كل عام وأنت بخير وصحة وسعادة لا تنتهي.. صُممت هذه التجربة بكل حب خصيصاً من أجلك.',

    mainGreetingTitle:
      overrides?.mainGreetingTitle || `كل عام وأنت بألف خير يا ${recipientName} ✨`,
    mainGreetingBody: overrides?.mainGreetingBody || defaultPhrase,
    hiddenHeartMessage:
      overrides?.hiddenHeartMessage ||
      template.defaultGreetingData.hiddenHeartMessage ||
      `إلى ${recipientName}.. وجودك في حياتي هو أجمل هدية، وأتمنى أن تحمل لك هذه السنة كل الفرح الذي يستحقه قلبك النقي.`,
    howPreciousScoreText:
      overrides?.howPreciousScoreText ||
      template.defaultGreetingData.howPreciousScoreText ||
      'مقياس الغلاوة: ١٠٠٪ (شخص استثنائي لا يتكرر أبداً 💎)',

    cakeFlavorColor: overrides?.cakeFlavorColor || '#F4ACB7',
    candlesCount: overrides?.candlesCount || 5,
    cakeWishPrompt:
      overrides?.cakeWishPrompt ||
      'أغمض عينيك وتمنَّ أمنية جميلة، ثم اضغط على الشموع لإطفائها!',
    cakeCelebrationMessage:
      overrides?.cakeCelebrationMessage ||
      `يارب تتحقق كل أمنياتك هذا العام يا ${recipientName}! 🎉🎂`,

    photoFrameStyle:
      overrides?.photoFrameStyle || template.defaultPhotoFrameStyle || 'polaroid',
    photoColorFilter:
      overrides?.photoColorFilter ||
      template.defaultPhotoColorFilter ||
      (template.category === 'cinematic' || template.visualArchitecture === 'cinematic_widescreen'
        ? 'teal_orange'
        : template.defaultPhotoFrameStyle === 'cinematic_gallery'
        ? 'golden_cinema'
        : 'original'),
    canvasElements: overrides?.canvasElements
      ? overrides.canvasElements.map((el) => ({ ...el }))
      : (template.defaultCanvasElements || DEFAULT_ROMANTIC_ELEMENTS).map((el) => ({ ...el })),

    secretMessages: overrides?.secretMessages || [
      {
        id: 'sec-1',
        title: 'رسالة سرية خاصة بيننا 🔐',
        promptText: 'عندك رسالة سرية، بس لازم تعرف كلمة السر المرتبطة بذكرى بيننا!',
        password: 'مراسيم',
        hint: 'كلمة السر الافتراضية للتجربة (مراسيم)',
        revealType: 'full_card',
        secretBody: `لأنك عرفت كلمة السر يا ${recipientName}.. أردت أن أقول لك سراً: أنت أجمل فصل في قصة حياتي، ولا شيء يضاهي لحظة واحدة نقضيها بضحكة صادقة معاً. كل عام وأنت الأغلى!`,
        mediaUrl: createArtisticSvgDataUri('#3D1018', '#1F070B', '#F4ACB7', 'rose_seal', 'Secret Memory'),
      },
    ],

    memoryBoxItems: overrides?.memoryBoxItems || [
      {
        id: 'mem-bday-1',
        type: 'photo',
        mediaUrl: createArtisticSvgDataUri('#566B49', '#2E3B26', '#DCE8CB', 'polaroid_leaves', 'Memory Chapter I'),
        teaserQuestion: 'تتذكر هذا اليوم المميز؟ ✨',
        title: 'لحظة لا تُنسى من البدايات',
        story: 'كان يوماً مليئاً بالضحك العفوي والتفاصيل الجميلة التي لا تزال محفورة في الذاكرة.',
        date: '2025-05-14',
      },
      {
        id: 'mem-bday-2',
        type: 'photo',
        mediaUrl: createArtisticSvgDataUri('#3B2B1E', '#1F160F', '#D4BFA8', 'gift_confetti', 'Memory Chapter II'),
        teaserQuestion: 'تتذكر شكد ضحكنا بهذا اليوم؟ 😊',
        title: 'أجمل جمعة وأحلى الأوقات',
        story: 'الأيام الحلوة تزداد جمالاً بوجودك، وهذه اللقطة تختصر ألف كلمة من المودة.',
        date: '2025-09-22',
      },
      {
        id: 'mem-bday-3',
        type: 'photo',
        mediaUrl: createArtisticSvgDataUri('#131629', '#090B16', '#A29BFE', 'cinema_stars', 'Memory Chapter III'),
        teaserQuestion: 'تتذكر أمنيتنا في ذلك المساء؟ 🌟',
        title: 'ذكرى تبقى في القلب دائماً',
        story: 'وعدنا أن تبقى أيامنا عامرة بالفرح، واليوم نحتفل بعام جديد وأجمل.',
        date: '2026-02-10',
      },
    ],
    memoryBoxSortByDate: overrides?.memoryBoxSortByDate ?? true,
    memoryBoxDisplayMode: overrides?.memoryBoxDisplayMode || 'one_by_one',

    scratchCard: overrides?.scratchCard || {
      enabled: true,
      foilStyle: 'gold_foil',
      contentType: 'place_invite',
      promptTitle: 'اكشط البطاقة الذهبية بإصبعك لتكتشف مفاجأتك! 🪙',
      hiddenTitle: 'دعوة عشاء ومفاجأة خاصة لك! 🍽️✨',
      hiddenMessage: `هذه القسيمة تمنح ${recipientName} دعوة خاصة في مكانك المفضل هذا الأسبوع!`,
      voucherCodeOrPlace: 'كود الهدية: BDAY-VIP-2026 | المكان الافتراضي للاحتفال',
    },

    giftBoxes: overrides?.giftBoxes || [
      {
        id: 'gift-1',
        label: 'الصندوق الأول: رسالة وهدية 🎁',
        boxColor: '#C84B61',
        ribbonColor: '#F3E5AB',
        surpriseType: 'voucher',
        surpriseTitle: 'قسيمة هدية خاصة ليوم ميلادك 🎀',
        surpriseMessage: `كل عام وأنت بخير يا ${recipientName}! جهزت لك هدية حقيقية بانتظارك، مع قسيمة تسوق خاصة.`,
        voucherCode: 'GIFT-LOVE-99',
        secondarySurpriseText: 'مفاجأة إضافية: مشروبك وحلوياتك المفضلة جاهزة اليوم!',
      },
      {
        id: 'gift-2',
        label: 'الصندوق الثاني: أمنية وتحدٍ لطيف 🌟',
        boxColor: '#566B49',
        ribbonColor: '#E9DDC9',
        surpriseType: 'wish_challenge',
        surpriseTitle: 'تحدي وأمنية العام الجديد ✨',
        surpriseMessage:
          'التحدي اللطيف: التقط سيلفي بابتسامتك الجميلة الآن وأرسلها لي لنوثق أول لحظة في عامك الجديد!',
      },
    ],

    pages: overrides?.pages
      ? overrides.pages.map((p) => ({ ...p }))
      : template.defaultPages.map((p) => ({ ...p })),
    textStyle: overrides?.textStyle || { ...template.defaultTextStyle },
    themeColors: overrides?.themeColors || { ...template.themeColors },
    selectedStickers: overrides?.selectedStickers || ['🎂', '🎁', '✨', '❤️'],

    transitionStyle: overrides?.transitionStyle || template.defaultTransitionStyle || 'flip_3d',
    animationSpeed: overrides?.animationSpeed || 'normal',
    skipAnimationsDefault: overrides?.skipAnimationsDefault || false,
    particleEffect: overrides?.particleEffect || template.defaultParticleEffect || 'hearts',
    musicTrackId: overrides?.musicTrackId || template.defaultMusicTrackId || 'bday_romantic',
    soundEffectsEnabled: overrides?.soundEffectsEnabled ?? true,

    availableFrom: overrides?.availableFrom || '',
    expiresAt: overrides?.expiresAt || '',
    viewsCount: overrides?.viewsCount ?? 18,
    sharesCount: overrides?.sharesCount ?? 5,
    createdAt: overrides?.createdAt || new Date().toISOString(),
  };
}

export const INITIAL_BIRTHDAY_GREETINGS: BirthdayGreetingData[] = [
  createBirthdayGreetingFromTemplate(INITIAL_BIRTHDAY_TEMPLATES[0], {
    id: 'bday-demo-1',
    slug: 'default-birthday-love',
    recipientName: 'اسم المحتفى به',
    recipientNickname: 'اللقب المحبب',
    senderName: 'اسم المُهدي',
    recipientAge: 24,
    viewsCount: 42,
    sharesCount: 9,
  }),
  createBirthdayGreetingFromTemplate(INITIAL_BIRTHDAY_TEMPLATES[3], {
    id: 'bday-demo-2',
    slug: 'default-family-birthday',
    relationship: 'parent',
    recipientName: 'اسم الوالد / الوالدة',
    recipientNickname: 'تاج الراس',
    senderName: 'العائلة الكريمة',
    recipientAge: 50,
    viewsCount: 67,
    sharesCount: 14,
  }),
  createBirthdayGreetingFromTemplate(INITIAL_BIRTHDAY_TEMPLATES[1], {
    id: 'bday-demo-3',
    slug: 'default-friend-birthday',
    relationship: 'friend',
    recipientName: 'اسم الصديق',
    recipientNickname: 'رفيق الدرب',
    senderName: 'الأصدقاء',
    recipientAge: 26,
    viewsCount: 31,
    sharesCount: 7,
  }),
];

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

export function isStandaloneBirthdayUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('bday') || params.has('bd');
}

export function buildShareableBirthdayUrl(greeting: BirthdayGreetingData): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const cleanSlug = sanitizeInvitationSlug(greeting.slug || greeting.id);

  const compactPayload = {
    t: greeting.templateId,
    oc: greeting.occasionType,
    pf: greeting.photoFrameStyle,
    cf: greeting.photoColorFilter,
    r: greeting.relationship,
    rn: greeting.recipientName,
    rk: greeting.recipientNickname,
    sn: greeting.senderName,
    ag: greeting.recipientAge,
    om: greeting.openingMechanic,
    ct: greeting.coverTeaserText,
    cs: greeting.coverSubtitle,
    mt: greeting.mainGreetingTitle,
    mb: greeting.mainGreetingBody,
    hm: greeting.hiddenHeartMessage,
    hp: greeting.howPreciousScoreText,
    cc: greeting.candlesCount,
    mu: greeting.musicTrackId,
    af: greeting.availableFrom,
    ex: greeting.expiresAt,
    sc: greeting.scratchCard
      ? {
          e: greeting.scratchCard.enabled,
          f: greeting.scratchCard.foilStyle,
          ht: greeting.scratchCard.hiddenTitle,
          hm: greeting.scratchCard.hiddenMessage,
          vc: greeting.scratchCard.voucherCodeOrPlace,
        }
      : undefined,
    sm: greeting.secretMessages?.[0]
      ? {
          pw: greeting.secretMessages[0].password,
          h: greeting.secretMessages[0].hint,
          b: greeting.secretMessages[0].secretBody,
        }
      : undefined,
  };

  const encoded = toBase64Url(JSON.stringify(compactPayload));
  return `${origin}${pathname}?bday=${encodeURIComponent(cleanSlug)}&bd=${encoded}`;
}

export function parseSharedBirthdayFromLocation(
  existingGreetings: BirthdayGreetingData[],
  templates: BirthdayTemplate[] = INITIAL_BIRTHDAY_TEMPLATES
): BirthdayGreetingData | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('bday') || '';
  const bd = params.get('bd') || '';
  if (!slug && !bd) return null;

  const localMatch =
    existingGreetings.find((g) => g.slug === slug || g.id === slug) ||
    INITIAL_BIRTHDAY_GREETINGS.find((g) => g.slug === slug || g.id === slug);

  if (!bd) {
    return localMatch || null;
  }

  const decoded = fromBase64Url(bd);
  if (!decoded) return localMatch || null;

  try {
    const p = JSON.parse(decoded);
    const tpl =
      templates.find((t) => t.id === p.t) ||
      INITIAL_BIRTHDAY_TEMPLATES.find((t) => t.id === p.t) ||
      INITIAL_BIRTHDAY_TEMPLATES[0];

    const base = localMatch || createBirthdayGreetingFromTemplate(tpl, { slug });
    return {
      ...base,
      slug: slug || base.slug,
      templateId: tpl.id,
      occasionType: p.oc || base.occasionType,
      photoFrameStyle: p.pf || base.photoFrameStyle,
      photoColorFilter: p.cf || base.photoColorFilter,
      category: tpl.category,
      relationship: p.r || base.relationship,
      recipientName: p.rn || base.recipientName,
      recipientNickname: p.rk || base.recipientNickname,
      senderName: p.sn || base.senderName,
      recipientAge: p.ag || base.recipientAge,
      openingMechanic: p.om || base.openingMechanic,
      coverTeaserText: p.ct || base.coverTeaserText,
      coverSubtitle: p.cs || base.coverSubtitle,
      mainGreetingTitle: p.mt || base.mainGreetingTitle,
      mainGreetingBody: p.mb || base.mainGreetingBody,
      hiddenHeartMessage: p.hm || base.hiddenHeartMessage,
      howPreciousScoreText: p.hp || base.howPreciousScoreText,
      candlesCount: p.cc || base.candlesCount,
      musicTrackId: p.mu || base.musicTrackId,
      availableFrom: p.af ?? base.availableFrom,
      expiresAt: p.ex ?? base.expiresAt,
      scratchCard: p.sc
        ? {
            ...base.scratchCard,
            enabled: p.sc.e !== false,
            foilStyle: p.sc.f || base.scratchCard.foilStyle,
            hiddenTitle: p.sc.ht || base.scratchCard.hiddenTitle,
            hiddenMessage: p.sc.hm || base.scratchCard.hiddenMessage,
            voucherCodeOrPlace: p.sc.vc || base.scratchCard.voucherCodeOrPlace,
          }
        : base.scratchCard,
      secretMessages: p.sm
        ? [
            {
              ...(base.secretMessages[0] || {
                id: 'sec-shared',
                title: 'رسالة سرية خاصة 🔐',
                promptText: 'عندك رسالة سرية، بس لازم تعرف كلمة السر!',
                revealType: 'full_card' as const,
              }),
              password: p.sm.pw || 'بغداد',
              hint: p.sm.h || '',
              secretBody: p.sm.b || '',
            },
            ...base.secretMessages.slice(1),
          ]
        : base.secretMessages,
    };
  } catch {
    return localMatch || null;
  }
}
