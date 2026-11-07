import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Sparkles,
  Volume2,
  VolumeX,
  MapPin,
  Calendar,
  Phone,
  CheckCircle2,
  Share2,
  Maximize2,
  Minimize2,
  FastForward,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Languages,
  Heart,
  Navigation,
  GraduationCap,
  Award,
  MousePointerClick,
  MoveHorizontal,
  Gauge,
} from 'lucide-react';
import {
  InvitationCategory,
  InvitationData,
  RSVPRecord,
  GuestbookMessage,
  SingleInteractionMode,
} from '../../types/invitation';
import {
  Royal3DCollectionTemplateId,
  ROYAL_LUXURY_COLOR_SCHEMES,
  Royal3DColorScheme,
} from './Royal3DWebGLCanvas';
import { buildInvitationMonogram } from './photorealisticTextures';
import { CountdownTimer } from '../countdown/CountdownTimer';
import { soundEngine } from '../../utils/audio';
import { buildShareableInvitationUrl } from '../../utils/shareLink';

const LazyRoyal3DWebGLCanvas = React.lazy(() =>
  import('./Royal3DWebGLCanvas').then((m) => ({ default: m.Royal3DWebGLCanvas }))
);

export interface SingleInteractionModeOption {
  id: SingleInteractionMode;
  categories: InvitationCategory[];
  templateId: Royal3DCollectionTemplateId;
  numberLabel: string;
  objectNameAr: string;
  objectNameEn: string;
  titleEn: string;
  titleAr: string;
  descAr: string;
  descEn: string;
  clickHintAr: string;
  clickHintEn: string;
  isDarkScene?: boolean;
  defaultColorSchemeId?: string;
  isCinematicFlagship?: boolean;
  supportsTouchDrag?: boolean;
}

export const SINGLE_INTERACTION_MODE_OPTIONS: SingleInteractionModeOption[] = [
  // =========================================================================
  // THE 4 FLAGSHIP CINEMATIC PRODUCTION OPENING SCENES (المشاهد السينمائية الأربعة)
  // =========================================================================
  {
    id: 'envelope_3d',
    categories: [
      'wedding',
      'engagement',
      'henna',
      'graduation',
      'graduation_project',
      'birthday',
      'special_events',
      'business_opening',
      'art_exhibition',
      'career_promotion',
      'family_success',
    ],
    templateId: 'tpl-royal-3d-envelope',
    numberLabel: 'SCENE 01',
    objectNameAr: 'المشهد الأول: الظرف الفاخر بختم الشمع (Luxury Envelope)',
    objectNameEn: 'Scene 01: Luxury Envelope & Monogram Wax Seal',
    titleEn: 'Luxury Envelope & Monogram Wax Seal',
    titleAr: 'المشهد الأول: الظرف الفاخر وختم الشمع المنقوش (Luxury Envelope)',
    descAr:
      'ظرف ورقي ثلاثي الأبعاد بخامة قطنية فاخرة وختم شمعي يحمل الأحرف الأولى للأسماء. عند لمس الختم ينكسر واقعياً وينفتح غطاء الظرف وتخرج بطاقة الدعوة تدريجياً مع انتقال كاميرا سينمائي.',
    descEn:
      'Photorealistic 3D cotton-rag envelope with a monogrammed wax seal. Touching the seal fractures it, opens the flap naturally, and slides out the personalized gold-foiled invitation card.',
    clickHintAr: 'المس ختم الشمع لكسره وفتح الظرف الفاخر',
    clickHintEn: 'Touch the Monogram Wax Seal to break it & open',
    isDarkScene: false,
    defaultColorSchemeId: 'imperial_signature',
    isCinematicFlagship: true,
    supportsTouchDrag: true,
  },
  {
    id: 'engagement_jewelry_box_3d',
    categories: [
      'engagement',
      'wedding',
      'henna',
      'birthday',
      'special_events',
      'family_success',
    ],
    templateId: 'tpl-royal-3d-envelope',
    numberLabel: 'SCENE 02',
    objectNameAr: 'المشهد الثاني: علبة الخاتم المخملية (Engagement Ring Box)',
    objectNameEn: 'Scene 02: Velvet Engagement Ring Box',
    titleEn: 'Velvet Engagement Ring Box',
    titleAr: 'المشهد الثاني: علبة الخاتم المخملية (Engagement Ring Box)',
    descAr:
      'علبة مخملية ثلاثية الأبعاد تفتح بحركة مفصل واقعية، ليظهر خاتم ذهبي وألماسي يعكس الضوء، مع ظهور أسماء العروسين والانتقال السينمائي إلى تفاصيل الدعوة.',
    descEn:
      'Plush 3D velvet ring box that opens on a realistic brass hinge, elevating a 24K gold and diamond ring with specular light dispersion and the couple’s names.',
    clickHintAr: 'المس علبة المخمل لفتح الغطاء وإظهار الخاتم',
    clickHintEn: 'Touch the Velvet Ring Box to hinge open & reveal',
    isDarkScene: true,
    defaultColorSchemeId: 'blush_pearl_palace',
    isCinematicFlagship: true,
    supportsTouchDrag: true,
  },
  {
    id: 'royal_doors_3d',
    categories: [
      'wedding',
      'engagement',
      'henna',
      'graduation',
      'graduation_project',
      'birthday',
      'special_events',
      'business_opening',
      'art_exhibition',
      'career_promotion',
      'family_success',
    ],
    templateId: 'tpl-royal-3d-theatre',
    numberLabel: 'SCENE 03',
    objectNameAr: 'المشهد الثالث: الأبواب الملكية (Royal Doors)',
    objectNameEn: 'Scene 03: Grand Royal Palace Doors',
    titleEn: 'Grand Royal Palace Doors',
    titleAr: 'المشهد الثالث: الأبواب الملكية المنقوشة (Royal Doors)',
    descAr:
      'بابان ملكيان فاخران بتفاصيل ونقوش بارزة ومقابض معدنية مذهّبة. عند اللمس تتحرك المقابض وتنفتح الأبواب تدريجياً لتشع إضاءة دافئة من خلفها وتظهر بطاقة الدعوة.',
    descEn:
      'Ornate carved double palace doors with articulated cast-gold handles that unlatch and swing open into warm golden backlight to reveal the invitation card.',
    clickHintAr: 'المس المقابض المذهّبة لفتح الأبواب الملكية',
    clickHintEn: 'Touch the Golden Handles to open the Royal Doors',
    isDarkScene: true,
    defaultColorSchemeId: 'emerald_obsidian_velvet',
    isCinematicFlagship: true,
    supportsTouchDrag: true,
  },
  {
    id: 'silk_ribbon_3d',
    categories: [
      'wedding',
      'engagement',
      'henna',
      'birthday',
      'graduation',
      'graduation_project',
      'special_events',
      'business_opening',
      'art_exhibition',
      'career_promotion',
      'family_success',
    ],
    templateId: 'tpl-royal-3d-envelope',
    numberLabel: 'SCENE 04',
    objectNameAr: 'المشهد الرابع: الشريط الحريري (Silk Ribbon)',
    objectNameEn: 'Scene 04: Satin Silk Ribbon Untie',
    titleEn: 'Silk Ribbon Drag & Untie',
    titleAr: 'المشهد الرابع: الشريط الحريري الفاخر (Silk Ribbon)',
    descAr:
      'بطاقة دعوة ملكية مغلفة بشريط حريري ثلاثي الأبعاد. عند السحب باللمس أو النقر تنفك العقدة الحريرية بشكل واقعي وينزلق الشريط جانباً لتظهر البطاقة بتفاصيلها.',
    descEn:
      'Gold-foiled invitation card wrapped in a 3D satin silk ribbon. Swipe/drag or tap to untie the sculpted knot and slide the silk straps aside.',
    clickHintAr: 'اسحب الشريط الحريري أو المس العقدة لفكها',
    clickHintEn: 'Drag or tap the Silk Ribbon to untie & reveal',
    isDarkScene: false,
    defaultColorSchemeId: 'imperial_signature',
    isCinematicFlagship: true,
    supportsTouchDrag: true,
  },

  // ========================
  // ADDITIONAL OCCASION-SPECIFIC 3D INTERACTIONS
  // ========================
  {
    id: 'engagement_ring_3d',
    categories: ['engagement', 'wedding'],
    templateId: 'tpl-royal-3d-envelope',
    numberLabel: '05',
    objectNameAr: 'خاتم الخطوبة ثلاثي الأبعاد',
    objectNameEn: '3D Engagement Ring',
    titleEn: '3D Diamond Ring Opening',
    titleAr: 'خاتم الخطوبة الألماسي ثلاثي الأبعاد',
    descAr: 'يضغط الضيف على الخاتم نفسه فيرتفع من وسادة المخمل ويدور بانعكاس ذهبي قبل ظهور الدعوة.',
    descEn: 'Guest taps the 3D ring directly; it rises from velvet and spins with golden reflections.',
    clickHintAr: 'اضغط على الخاتم لفتح الدعوة',
    clickHintEn: 'Tap the Ring to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'blush_pearl_palace',
  },
  {
    id: 'engagement_rose_3d',
    categories: ['engagement'],
    templateId: 'tpl-royal-3d-swan-lake',
    numberLabel: '06',
    objectNameAr: 'الوردة الرومانسية ثلاثية الأبعاد',
    objectNameEn: '3D Blooming Romantic Rose',
    titleEn: '3D Blooming Rose',
    titleAr: 'تفتّح الوردة الرومانسية ثلاثية الأبعاد',
    descAr: 'يضغط الضيف على الوردة فتتفتح بتلاتها تدريجياً مع ذرات ذهبية وتكشف بطاقة الدعوة.',
    descEn: 'Guest taps the 3D rose and its petals bloom outward to reveal the invitation.',
    clickHintAr: 'اضغط على الوردة لفتح الدعوة',
    clickHintEn: 'Tap the Rose to open invitation',
    isDarkScene: false,
    defaultColorSchemeId: 'blush_pearl_palace',
  },
  {
    id: 'engagement_gift_box_3d',
    categories: ['engagement'],
    templateId: 'tpl-royal-3d-envelope',
    numberLabel: '07',
    objectNameAr: 'صندوق الهدايا الملكي',
    objectNameEn: '3D Luxury Gift Box',
    titleEn: '3D Luxury Gift Box',
    titleAr: 'صندوق الهدايا الملكي بالشريط الذهبي',
    descAr: 'يضغط الضيف على صندوق الهدايا الفاخر فينفك الشريط الذهبي ويرتفع الغطاء لتظهر الدعوة.',
    descEn: 'Guest taps the luxury gift box to untie the golden ribbon and lift the lid.',
    clickHintAr: 'اضغط على صندوق الهدايا لفتح الدعوة',
    clickHintEn: 'Tap the Gift Box to open invitation',
    isDarkScene: false,
    defaultColorSchemeId: 'blush_pearl_palace',
  },
  {
    id: 'curtain_3d',
    categories: ['wedding', 'special_events', 'art_exhibition'],
    templateId: 'tpl-royal-3d-theatre',
    numberLabel: '08',
    objectNameAr: 'ستائر المسرح المخملية',
    objectNameEn: '3D Velvet Theatre Curtains',
    titleEn: '3D Theatre Curtain Opening',
    titleAr: 'ستائر المسرح المخملية ثلاثية الأبعاد',
    descAr: 'يضغط الضيف على الستارة المخملية فتتحرك الستائر للجانبين وتفتح المسرح الملكي.',
    descEn: 'Guest taps the emerald velvet curtains directly to part the stage under a golden spotlight.',
    clickHintAr: 'اضغط على الستارة لفتح الدعوة',
    clickHintEn: 'Tap the Curtains to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'emerald_obsidian_velvet',
  },
  {
    id: 'popup_book_3d',
    categories: ['wedding'],
    templateId: 'tpl-royal-3d-palace-book',
    numberLabel: '09',
    objectNameAr: 'كتاب الزفاف الملكي المنبثق',
    objectNameEn: '3D Royal Wedding Pop-Up Book',
    titleEn: '3D Pop-up Book Opening',
    titleAr: 'كتاب الزفاف الملكي المنبثق ثلاثي الأبعاد',
    descAr: 'يضغط الضيف على غلاف الكتاب فينفتح وتظهر منه حديقة وقصر ملكي ثلاثي الأبعاد.',
    descEn: 'Guest taps the book cover to unfold a 3D classical palace and royal garden.',
    clickHintAr: 'اضغط على الكتاب لفتح الدعوة',
    clickHintEn: 'Tap the Book to open invitation',
    isDarkScene: false,
    defaultColorSchemeId: 'imperial_signature',
  },
  {
    id: 'wedding_carriage_3d',
    categories: ['wedding'],
    templateId: 'tpl-royal-3d-swan-lake',
    numberLabel: '10',
    objectNameAr: 'عربة الزفاف الملكية',
    objectNameEn: '3D Royal Wedding Carriage',
    titleEn: '3D Royal Wedding Carriage',
    titleAr: 'عربة الزفاف الملكية ثلاثية الأبعاد',
    descAr: 'يضغط الضيف على عربة الزفاف الملكية فتدور عجلاتها المذهّبة وينفتح باب العربة ليكشف الدعوة.',
    descEn: 'Guest taps the 3D golden royal carriage to spin its wheels and open the carriage door.',
    clickHintAr: 'اضغط على العربة الملكية لفتح الدعوة',
    clickHintEn: 'Tap the Royal Carriage to open invitation',
    isDarkScene: false,
    defaultColorSchemeId: 'imperial_signature',
  },
  {
    id: 'scene_reveal_3d',
    categories: ['wedding', 'engagement'],
    templateId: 'tpl-royal-3d-swan-lake',
    numberLabel: '11',
    objectNameAr: 'بحيرة البجعتين الملكية',
    objectNameEn: '3D Swan Lake Scene',
    titleEn: '3D Swan Lake Reveal',
    titleAr: 'مشهد بحيرة البجعتين ثلاثي الأبعاد',
    descAr: 'يضغط الضيف على البجعتين فيقتربان ليشكلا قلباً وسط أزهار اللوتس وإطار الذهب الملكي.',
    descEn: 'Guest taps the 3D swans to glide together into a heart silhouette amidst floating lotus flowers.',
    clickHintAr: 'اضغط على المشهد لفتح الدعوة',
    clickHintEn: 'Tap the Scene to open invitation',
    isDarkScene: false,
    defaultColorSchemeId: 'imperial_signature',
  },
  {
    id: 'henna_box_3d',
    categories: ['henna', 'family_success'],
    templateId: 'tpl-royal-3d-theatre',
    numberLabel: '12',
    objectNameAr: 'صندوق الحناء المزخرف',
    objectNameEn: '3D Ornate Henna Box',
    titleEn: '3D Ornate Henna Box',
    titleAr: 'صندوق الحناء الشرقي المزخرف ثلاثي الأبعاد',
    descAr: 'يضغط الضيف على صندوق الحناء المزخرف فينفتح غطاؤه المقبب وتظهر نقوش الحناء الذهبية والشموع.',
    descEn: 'Guest taps the ornate burgundy & gold henna chest to open its domed lid and golden tray.',
    clickHintAr: 'اضغط على صندوق الحناء لفتح الدعوة',
    clickHintEn: 'Tap the Henna Box to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'oriental_burgundy_henna',
  },
  {
    id: 'henna_lantern_3d',
    categories: ['henna', 'family_success'],
    templateId: 'tpl-royal-3d-theatre',
    numberLabel: '13',
    objectNameAr: 'الفانوس الشرقي المضيء',
    objectNameEn: '3D Oriental Filigree Lantern',
    titleEn: '3D Oriental Lantern',
    titleAr: 'الفانوس الشرقي المذهّب ثلاثي الأبعاد',
    descAr: 'يضغط الضيف على الفانوس الشرقي فيضيء تدريجياً بوهج ذهبي دافئ ويدور ليكشف الدعوة.',
    descEn: 'Guest taps the oriental brass lantern to ignite its warm golden glow and reveal the invitation.',
    clickHintAr: 'اضغط على الفانوس الشرقي لفتح الدعوة',
    clickHintEn: 'Tap the Oriental Lantern to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'oriental_burgundy_henna',
  },
  {
    id: 'henna_mabkhara_3d',
    categories: ['henna', 'family_success'],
    templateId: 'tpl-royal-3d-theatre',
    numberLabel: '14',
    objectNameAr: 'المبخرة الملكية المزخرفة',
    objectNameEn: '3D Royal Mabkhara',
    titleEn: '3D Royal Mabkhara',
    titleAr: 'المبخرة الشرقية الملكية ثلاثية الأبعاد',
    descAr: 'يضغط الضيف على المبخرة الذهبية فيتصاعد منها دخان عطري زخرفي ناعم يكشف بطاقة الدعوة.',
    descEn: 'Guest taps the golden royal mabkhara as aromatic golden smoke swirls upward to reveal the card.',
    clickHintAr: 'اضغط على المبخرة لفتح الدعوة',
    clickHintEn: 'Tap the Mabkhara to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'oriental_burgundy_henna',
  },
  {
    id: 'henna_gift_chest_3d',
    categories: ['henna'],
    templateId: 'tpl-royal-3d-theatre',
    numberLabel: '15',
    objectNameAr: 'صندوق الهدايا التراثي',
    objectNameEn: '3D Traditional Bridal Chest',
    titleEn: '3D Traditional Gift Chest',
    titleAr: 'صندوق الهدايا الشرقي التقليدي',
    descAr: 'يضغط الضيف على الصندوق المخملي الزمردي المطعم بالذهب فينفتح ليكشف تفاصيل ليلة الحناء.',
    descEn: 'Guest taps the emerald & gold traditional bridal chest to open and reveal the Henna night details.',
    clickHintAr: 'اضغط على الصندوق التراثي لفتح الدعوة',
    clickHintEn: 'Tap the Traditional Chest to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'oriental_burgundy_henna',
  },
  {
    id: 'birthday_cake_3d',
    categories: ['birthday'],
    templateId: 'tpl-royal-3d-envelope',
    numberLabel: '16',
    objectNameAr: 'كيكة عيد الميلاد ثلاثية الأبعاد',
    objectNameEn: '3D Luxury Birthday Cake',
    titleEn: '3D Luxury Birthday Cake',
    titleAr: 'كيكة عيد الميلاد الملكية ثلاثية الأبعاد',
    descAr: 'يضغط الضيف على كيكة عيد الميلاد فتدور باحتفالية مع تناثر النجوم الذهبية وتظهر تهنئة الميلاد.',
    descEn: 'Guest taps the 3-tier luxury birthday cake to spin it and reveal the celebration details.',
    clickHintAr: 'اضغط على كيكة الميلاد لفتح الدعوة',
    clickHintEn: 'Tap the Birthday Cake to open invitation',
    isDarkScene: false,
    defaultColorSchemeId: 'festive_pastel_birthday',
  },
  {
    id: 'birthday_candles_3d',
    categories: ['birthday'],
    templateId: 'tpl-royal-3d-envelope',
    numberLabel: '17',
    objectNameAr: 'الشموع المضيئة التفاعلية',
    objectNameEn: '3D Interactive Birthday Candles',
    titleEn: '3D Glowing Birthday Candles',
    titleAr: 'إطفاء شموع عيد الميلاد المضيئة',
    descAr: 'يضغط الضيف على الشموع المضيئة فتنطفئ بطريقة احتفالية ساحرة وتظهر بطاقة الدعوة.',
    descEn: 'Guest taps the glowing 3D candles to blow them out in a burst of golden wishes.',
    clickHintAr: 'اضغط على الشموع لإطفائها وفتح الدعوة',
    clickHintEn: 'Tap the Candles to blow them out & open',
    isDarkScene: false,
    defaultColorSchemeId: 'festive_pastel_birthday',
  },
  {
    id: 'birthday_gift_box_3d',
    categories: ['birthday'],
    templateId: 'tpl-royal-3d-envelope',
    numberLabel: '18',
    objectNameAr: 'صندوق هدايا الميلاد',
    objectNameEn: '3D Festive Gift Box',
    titleEn: '3D Festive Gift Box',
    titleAr: 'صندوق هدايا عيد الميلاد الاحتفالي',
    descAr: 'يضغط الضيف على صندوق الهدايا فينفتح الغطاء للأعلى وتتطاير منه القصاصات الاحتفالية.',
    descEn: 'Guest taps the festive gift box to pop open the lid with celebratory confetti.',
    clickHintAr: 'اضغط على صندوق الهدية لفتح الدعوة',
    clickHintEn: 'Tap the Gift Box to open invitation',
    isDarkScene: false,
    defaultColorSchemeId: 'festive_pastel_birthday',
  },
  {
    id: 'birthday_balloons_3d',
    categories: ['birthday'],
    templateId: 'tpl-royal-3d-envelope',
    numberLabel: '19',
    objectNameAr: 'البالونات الاحتفالية ثلاثية الأبعاد',
    objectNameEn: '3D Celebratory Balloons',
    titleEn: '3D Celebratory Balloons',
    titleAr: 'باقة البالونات الملكية ثلاثية الأبعاد',
    descAr: 'يضغط الضيف على البالونات الذهبية والوردية فترتفع للأعلى وتكشف تفاصيل الحفل.',
    descEn: 'Guest taps the metallic gold and pastel 3D balloons to float upward and reveal the party.',
    clickHintAr: 'اضغط على البالونات لفتح الدعوة',
    clickHintEn: 'Tap the Balloons to open invitation',
    isDarkScene: false,
    defaultColorSchemeId: 'festive_pastel_birthday',
  },
  {
    id: 'graduation_cap_3d',
    categories: ['graduation', 'career_promotion'],
    templateId: 'tpl-grad-3d-celebration',
    numberLabel: '20',
    objectNameAr: 'قبعة التخرج ثلاثية الأبعاد',
    objectNameEn: '3D Graduation Cap',
    titleEn: '3D Graduation Cap Celebration',
    titleAr: 'قبعة التخرج الملكية والقصاصات الذهبية',
    descAr: 'يضغط الضيف على قبعة التخرج فترتفع وتدور وتطلق قصاصات ونجوماً ذهبية احتفالية ثم تظهر تفاصيل الحفل.',
    descEn: 'Guest taps the 3D graduation cap; it rises, spins, and bursts golden confetti and stars.',
    clickHintAr: 'اضغط على قبعة التخرج لفتح الدعوة',
    clickHintEn: 'Tap the Graduation Cap to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'royal_navy_graduation',
  },
  {
    id: 'graduation_diploma_3d',
    categories: ['graduation', 'career_promotion'],
    templateId: 'tpl-grad-3d-golden-diploma',
    numberLabel: '21',
    objectNameAr: 'شهادة التخرج الملفوفة وإكليل الغار',
    objectNameEn: '3D Golden Diploma & Laurel Wreath',
    titleEn: '3D Golden Diploma Unroll',
    titleAr: 'شهادة التخرج المذهّبة وإكليل الغار',
    descAr: 'يضغط الضيف على الشهادة الملفوفة فينفك الشريط الذهبي وتتمدد الشهادة تدريجياً ليكتمل مشهد الفخر.',
    descEn: 'Guest taps the rolled diploma to untie the golden ribbon and unroll the scroll inside a 3D laurel wreath.',
    clickHintAr: 'اضغط على شهادة التخرج لفتح الدعوة',
    clickHintEn: 'Tap the Diploma Scroll to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'royal_navy_graduation',
  },
  {
    id: 'graduation_night_fireworks_3d',
    categories: ['graduation'],
    templateId: 'tpl-grad-3d-graduation-night',
    numberLabel: '22',
    objectNameAr: 'ليلة التخرج والجامعة المضاءة',
    objectNameEn: '3D Graduation Night & Fireworks',
    titleEn: '3D Graduation Night & Fireworks',
    titleAr: 'ليلة التخرج والجامعة المضاءة بالألعاب النارية',
    descAr: 'يضغط الضيف على القبعة أمام مبنى الجامعة المضاء ليلاً فتنطلق للأعلى مع ألعاب نارية ذهبية.',
    descEn: 'Guest taps the graduation cap in front of the illuminated night university to launch golden fireworks.',
    clickHintAr: 'اضغط على قبعة التخرج لإطلاق الاحتفال',
    clickHintEn: 'Tap the Graduation Cap to launch fireworks',
    isDarkScene: true,
    defaultColorSchemeId: 'royal_navy_graduation',
  },
  {
    id: 'graduation_popup_book_3d',
    categories: ['graduation'],
    templateId: 'tpl-grad-3d-popup-book',
    numberLabel: '23',
    objectNameAr: 'كتاب التخرج المنبثق ومجسم الجامعة',
    objectNameEn: '3D Graduation Pop-Up Book',
    titleEn: '3D Graduation Pop-Up Book',
    titleAr: 'كتاب التخرج المنبثق ومجسم الجامعة ثلاثي الأبعاد',
    descAr: 'يضغط الضيف على كتاب التخرج الفاخر فينفتح ويظهر مبنى الجامعة والقبعة وإكليل الغار من داخله.',
    descEn: 'Guest taps the luxury graduation book to pop up a 3D university campus, cap, and laurel wreath.',
    clickHintAr: 'اضغط على كتاب التخرج لفتح الدعوة',
    clickHintEn: 'Tap the Graduation Book to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'royal_navy_graduation',
  },
  {
    id: 'graduation_achievement_box_3d',
    categories: ['graduation', 'career_promotion', 'family_success'],
    templateId: 'tpl-grad-3d-celebration',
    numberLabel: '24',
    objectNameAr: 'صندوق الإنجازات وميدالية الغار',
    objectNameEn: '3D Achievement Box & Medal',
    titleEn: '3D Achievement Chest & Medal',
    titleAr: 'صندوق الإنجازات ووسام الغار الذهبي',
    descAr: 'يضغط الضيف على صندوق الإنجازات فينفتح ويرتفع منه وسام التفوق وإكليل الغار الذهبي.',
    descEn: 'Guest taps the achievement chest to open it and elevate a 3D golden medal and laurel wreath.',
    clickHintAr: 'اضغط على صندوق الإنجازات لفتح الدعوة',
    clickHintEn: 'Tap the Achievement Box to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'royal_navy_graduation',
  },
  {
    id: 'project_dossier_3d',
    categories: ['graduation_project'],
    templateId: 'tpl-grad-3d-golden-diploma',
    numberLabel: '25',
    objectNameAr: 'ملف المشروع الأكاديمي الفاخر',
    objectNameEn: '3D Academic Project Dossier',
    titleEn: '3D Project Portfolio Opening',
    titleAr: 'ملف مشروع التخرج الفاخر ثلاثي الأبعاد',
    descAr: 'يضغط الضيف على ملف المشروع الأكاديمي فينفتح ويظهر مجسم ثلاثي الأبعاد مرتبط بالتخصص وبطاقة المناقشة.',
    descEn: 'Guest taps the luxury project dossier to open it and elevate a 3D model tailored to the academic major.',
    clickHintAr: 'اضغط على ملف المشروع لفتح الدعوة',
    clickHintEn: 'Tap the Project Dossier to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'royal_navy_graduation',
  },
  {
    id: 'project_academic_book_3d',
    categories: ['graduation_project'],
    templateId: 'tpl-grad-3d-popup-book',
    numberLabel: '26',
    objectNameAr: 'الكتاب الأكاديمي ومجسم التخصص',
    objectNameEn: '3D Academic Book & Major Model',
    titleEn: '3D Academic Book Reveal',
    titleAr: 'الكتاب الأكاديمي المنبثق حسب التخصص',
    descAr: 'يضغط الضيف على الكتاب الأكاديمي فينفتح وتظهر منه مجسمات ثلاثية الأبعاد (طب، هندسة، ذكاء اصطناعي، أو إدارة).',
    descEn: 'Guest taps the academic book to unfold 3D specialization models (Medical DNA, Engineering, AI, or Business).',
    clickHintAr: 'اضغط على الكتاب الأكاديمي لفتح الدعوة',
    clickHintEn: 'Tap the Academic Book to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'royal_navy_graduation',
  },
  {
    id: 'project_laptop_3d',
    categories: ['graduation_project'],
    templateId: 'tpl-grad-3d-celebration',
    numberLabel: '27',
    objectNameAr: 'الحاسوب المحمول ثلاثي الأبعاد',
    objectNameEn: '3D Interactive Laptop',
    titleEn: '3D Laptop Project Reveal',
    titleAr: 'الحاسوب المحمول ثلاثي الأبعاد وعرض المشروع',
    descAr: 'يضغط الضيف على الحاسوب المحمول فينفتح الغطاء وتضيء الشاشة مع هولوجرام ثلاثي الأبعاد للتخصص.',
    descEn: 'Guest taps the 3D laptop to hinge open the screen and project a 3D hologram of the specialization.',
    clickHintAr: 'اضغط على الحاسوب لفتح الدعوة',
    clickHintEn: 'Tap the 3D Laptop to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'royal_navy_graduation',
  },
  {
    id: 'project_display_board_3d',
    categories: ['graduation_project'],
    templateId: 'tpl-grad-3d-golden-diploma',
    numberLabel: '28',
    objectNameAr: 'لوحة عرض المشروع وشهادة الإنجاز',
    objectNameEn: '3D Project Display Board',
    titleEn: '3D Project Display Board',
    titleAr: 'منصة ولوحة عرض المشروع الأكاديمي',
    descAr: 'يضغط الضيف على لوحة عرض المشروع فتنفتح وتكشف تفاصيل البحث واللجنة وموعد المناقشة.',
    descEn: 'Guest taps the 3D project display board to reveal the research defense details and certificate.',
    clickHintAr: 'اضغط على لوحة العرض لفتح الدعوة',
    clickHintEn: 'Tap the Display Board to open invitation',
    isDarkScene: true,
    defaultColorSchemeId: 'royal_navy_graduation',
  },
];

export function getOpeningExperiencesForCategory(
  category?: InvitationCategory
): SingleInteractionModeOption[] {
  const cat = category && category !== 'all' ? category : 'wedding';
  const filtered = SINGLE_INTERACTION_MODE_OPTIONS.filter((opt) =>
    opt.categories.includes(cat)
  );
  return filtered.length > 0
    ? filtered
    : SINGLE_INTERACTION_MODE_OPTIONS.filter((opt) => opt.categories.includes('wedding'));
}

export interface Royal3DTemplateSpec {
  id: Royal3DCollectionTemplateId;
  singleInteractionMode: SingleInteractionMode;
  numberLabel: string;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  ctaButtonAr: string;
  ctaButtonEn: string;
  isDarkTheme: boolean;
  featuresAr: string[];
}

export const ROYAL_3D_COLLECTION_SPECS: Record<
  Royal3DCollectionTemplateId,
  Royal3DTemplateSpec
> = {
  'tpl-royal-3d-envelope': {
    id: 'tpl-royal-3d-envelope',
    singleInteractionMode: 'envelope_3d',
    numberLabel: '01 • LUXURY 3D ENVELOPE',
    nameAr: 'الظرف الملكي الفاخر ثلاثي الأبعاد',
    nameEn: 'Luxury 3D Envelope Opening',
    subtitleAr:
      'ظرف ورق قطني عاجي فاخر بختم شمعي يحمل الأحرف الأولى للأسماء، ينكسر عند اللمس وتخرج بطاقة الدعوة تدريجياً.',
    subtitleEn:
      'Photorealistic cotton-rag Ivory envelope with monogrammed 3D wax seal & silk ribbon.',
    ctaButtonAr: 'المس ختم الشمع لفتح الدعوة',
    ctaButtonEn: 'Touch the Wax Seal to Open',
    isDarkTheme: false,
    featuresAr: [
      'ظرف ثلاثي الأبعاد بخامة ورق فاخرة',
      'ختم شمعي منقوش بالأحرف الأولى ينكسر باللمس',
      'شريط حريري ينفك بانسيابية',
      'خروج بطاقة الدعوة تدريجياً مع حركة الكاميرا',
    ],
  },
  'tpl-royal-3d-theatre': {
    id: 'tpl-royal-3d-theatre',
    singleInteractionMode: 'curtain_3d',
    numberLabel: '02 • 3D THEATRE CURTAIN',
    nameAr: 'المسرح الملكي بالستائر المخملية',
    nameEn: '3D Theatre Curtain Opening',
    subtitleAr:
      'ستائر مخملية زمردية بتطريزات ذهبية وثريا كريستالية مضيئة تنفتح عند لمس الستارة مباشرة.',
    subtitleEn:
      'Emerald Green 3D velvet stage curtains, crystal chandelier & golden spotlight.',
    ctaButtonAr: 'اضغط على الستارة لفتح الدعوة',
    ctaButtonEn: 'Tap the Curtains to Open',
    isDarkTheme: true,
    featuresAr: [
      'ستائر مخملية 3D قابلة للنقر المباشر',
      'ثريا كريستالية مضيئة',
      'إضاءة Spotlight ذهبية',
      'درج ملكي وزهور ثلاثية الأبعاد',
    ],
  },
  'tpl-royal-3d-palace-book': {
    id: 'tpl-royal-3d-palace-book',
    singleInteractionMode: 'popup_book_3d',
    numberLabel: '03 • 3D POP-UP BOOK',
    nameAr: 'كتاب القصر الملكي المنبثق',
    nameEn: '3D Pop-up Book Opening',
    subtitleAr:
      'كتاب ملكي بحواف ذهبية سميكة ينفتح عند النقر على غلافه ليتحول إلى قصر وحديقة ثلاثية الأبعاد.',
    subtitleEn:
      'Thick gold-edged royal book unfolding into a 3D Pop-Up classical white palace & garden.',
    ctaButtonAr: 'اضغط على الكتاب لفتح الدعوة',
    ctaButtonEn: 'Tap the Book to Open',
    isDarkTheme: false,
    featuresAr: [
      'غلاف كتاب 3D قابل للنقر المباشر',
      'تأثير Pop-Up 3D للقصر والأعمدة',
      'نوافير مياه متحركة',
      'صفحات سميكة بحواف ذهبية',
    ],
  },
  'tpl-royal-3d-swan-lake': {
    id: 'tpl-royal-3d-swan-lake',
    singleInteractionMode: 'scene_reveal_3d',
    numberLabel: '04 • 3D SCENE REVEAL',
    nameAr: 'بحيرة البجعتين الملكية',
    nameEn: '3D Scene Reveal',
    subtitleAr:
      'بحيرة هادئة مع بجعتين بيضاوين ثلاثيتي الأبعاد تقتربان عند النقر عليهما لتشكلا قلباً وسط اللوتس.',
    subtitleEn:
      'Serene lake with two 3D white swans forming a heart silhouette amidst floating lotus flowers.',
    ctaButtonAr: 'اضغط على المشهد لفتح الدعوة',
    ctaButtonEn: 'Tap the Scene to Open',
    isDarkTheme: false,
    featuresAr: [
      'بجعتان 3D قابلتان للنقر المباشر',
      'انعكاسات ضوئية واقعية على الماء',
      'أزهار اللوتس الطافية',
      'إطار ملكي ذهبي كبير',
    ],
  },
  'tpl-grad-3d-celebration': {
    id: 'tpl-grad-3d-celebration',
    singleInteractionMode: 'graduation_cap_3d',
    numberLabel: 'GRADUATION 01 • CELEBRATION STAGE',
    nameAr: 'حفل التخرج الملكي - مسرح القبعة الذهبية',
    nameEn: 'Graduation Celebration 3D Cap',
    subtitleAr:
      'مسرح تخرج فاخر بخلفية كحلية ملكية وإضاءة ذهبية وقبعة تخرج ثلاثية الأبعاد ترتفع وتدور وتطلق القصاصات عند الضغط عليها.',
    subtitleEn:
      'Royal Navy graduation stage with golden lighting and a clickable 3D mortarboard cap that spins with golden confetti.',
    ctaButtonAr: 'اضغط على قبعة التخرج لفتح الدعوة',
    ctaButtonEn: 'Tap the Graduation Cap to Open',
    isDarkTheme: true,
    featuresAr: [
      'قبعة تخرج 3D قابلة للنقر المباشر',
      'تناثر قصاصات ونجوم ذهبية احتفالية',
      'مسرح احتفالي كحلي وذهبي',
      'إضاءة سينمائية فاخرة',
    ],
  },
  'tpl-grad-3d-golden-diploma': {
    id: 'tpl-grad-3d-golden-diploma',
    singleInteractionMode: 'graduation_diploma_3d',
    numberLabel: 'GRADUATION 02 • GOLDEN DIPLOMA',
    nameAr: 'الوثيقة الذهبية وإكليل الغار - Golden Diploma',
    nameEn: 'Golden Diploma & 3D Laurel Wreath',
    subtitleAr:
      'شهادة تخرج ملفوفة بشريط ذهبي وسط إكليل غار ثلاثي الأبعاد على خلفية مخملية كحلية، تنفتح تدريجياً عند الضغط عليها.',
    subtitleEn:
      'Rolled graduation diploma with a golden ribbon and 3D laurel wreath on navy velvet that unrolls on click.',
    ctaButtonAr: 'اضغط على شهادة التخرج لفتح الدعوة',
    ctaButtonEn: 'Tap the Diploma to Open',
    isDarkTheme: true,
    featuresAr: [
      'شهادة تخرج ملفوفة 3D قابلة للنقر',
      'إكليل غار ذهبي ثلاثي الأبعاد',
      'انفكاك الشريط الذهبي وتمدد الوثيقة',
      'خلفية مخملية كحلية ملكية',
    ],
  },
  'tpl-grad-3d-graduation-night': {
    id: 'tpl-grad-3d-graduation-night',
    singleInteractionMode: 'graduation_night_fireworks_3d',
    numberLabel: 'GRADUATION 03 • GRADUATION NIGHT',
    nameAr: 'ليلة التخرج والجامعة المضاءة - Graduation Night',
    nameEn: 'Graduation Night & 3D Fireworks',
    subtitleAr:
      'جامعة مضاءة ليلاً تحت سماء زرقاء داكنة مع قبعة تخرج ثلاثية الأبعاد تنطلق للأعلى وتطلق ألعاباً نارية ذهبية عند الضغط عليها.',
    subtitleEn:
      'Illuminated 3D university at night with a clickable 3D graduation cap that launches golden fireworks.',
    ctaButtonAr: 'اضغط على قبعة التخرج لإطلاق الاحتفال',
    ctaButtonEn: 'Tap the Cap to Launch Fireworks',
    isDarkTheme: true,
    featuresAr: [
      'مجسم جامعة مضاءة ليلاً 3D',
      'قبعة تخرج تنطلق للأعلى عند النقر',
      'ألعاب نارية ذهبية ثلاثية الأبعاد',
      'أجواء ليلية احتفالية فاخرة',
    ],
  },
  'tpl-grad-3d-popup-book': {
    id: 'tpl-grad-3d-popup-book',
    singleInteractionMode: 'graduation_popup_book_3d',
    numberLabel: 'GRADUATION 04 • POP-UP BOOK',
    nameAr: 'كتاب التخرج المنبثق ثلاثي الأبعاد - Graduation Pop-Up Book',
    nameEn: 'Graduation 3D Pop-Up Book',
    subtitleAr:
      'كتاب تخرج فاخر بصفحات ذهبية ينفتح عند الضغط عليه ليظهر من داخله مجسم مبنى الجامعة والشهادة والقبعة وإكليل الغار.',
    subtitleEn:
      'Luxury graduation book with golden pages that unfolds into a 3D university campus, diploma, cap, and laurel wreath.',
    ctaButtonAr: 'اضغط على كتاب التخرج لفتح الدعوة',
    ctaButtonEn: 'Tap the Graduation Book to Open',
    isDarkTheme: true,
    featuresAr: [
      'كتاب تخرج فاخر بحواف ذهبية',
      'انبثاق مجسم الجامعة 3D من الصفحات',
      'قبعة وشهادة وإكليل غار ثلاثي الأبعاد',
      'هوية كحلية وذهبية وعاجية',
    ],
  },
};

export function isRoyal3DCollectionTemplate(
  templateId?: string
): templateId is Royal3DCollectionTemplateId {
  return (
    templateId === 'tpl-royal-3d-envelope' ||
    templateId === 'tpl-royal-3d-theatre' ||
    templateId === 'tpl-royal-3d-palace-book' ||
    templateId === 'tpl-royal-3d-swan-lake' ||
    templateId === 'tpl-grad-3d-celebration' ||
    templateId === 'tpl-grad-3d-golden-diploma' ||
    templateId === 'tpl-grad-3d-graduation-night' ||
    templateId === 'tpl-grad-3d-popup-book'
  );
}

export function resolveSingleInteractionMode(
  invitation: Partial<InvitationData>
): SingleInteractionMode {
  if (invitation.singleInteractionMode) {
    return invitation.singleInteractionMode;
  }
  if (invitation.templateId === 'tpl-royal-3d-theatre') return 'curtain_3d';
  if (invitation.templateId === 'tpl-royal-3d-palace-book') return 'popup_book_3d';
  if (invitation.templateId === 'tpl-royal-3d-swan-lake') return 'scene_reveal_3d';
  if (invitation.templateId === 'tpl-grad-3d-celebration') return 'graduation_cap_3d';
  if (invitation.templateId === 'tpl-grad-3d-golden-diploma') return 'graduation_diploma_3d';
  if (invitation.templateId === 'tpl-grad-3d-graduation-night') return 'graduation_night_fireworks_3d';
  if (invitation.templateId === 'tpl-grad-3d-popup-book') return 'graduation_popup_book_3d';

  if (invitation.openerStyle3D === 'stage_curtains_3d') return 'curtain_3d';
  if (invitation.openerStyle3D === 'royal_3d_book') return 'popup_book_3d';
  if (invitation.openerStyle3D === 'engagement_ring_3d') return 'engagement_jewelry_box_3d';

  switch (invitation.category) {
    case 'engagement':
      return 'engagement_jewelry_box_3d';
    case 'henna':
      return 'henna_box_3d';
    case 'birthday':
      return 'birthday_cake_3d';
    case 'graduation':
      return 'graduation_cap_3d';
    case 'graduation_project':
      return 'project_dossier_3d';
    case 'wedding':
    default:
      return 'envelope_3d';
  }
}

export function resolveRoyal3DTemplateFromInteraction(
  invitation: Partial<InvitationData>
): Royal3DCollectionTemplateId {
  if (isRoyal3DCollectionTemplate(invitation.templateId)) {
    return invitation.templateId;
  }
  const mode = resolveSingleInteractionMode(invitation);
  const found = SINGLE_INTERACTION_MODE_OPTIONS.find((o) => o.id === mode);
  return found?.templateId || 'tpl-royal-3d-envelope';
}

interface Royal3DLuxuryInvitationExperienceProps {
  invitation: InvitationData;
  onSaveRSVP?: (rsvp: Omit<RSVPRecord, 'id' | 'createdAt'>) => void;
  onAddGuestbook?: (message: Omit<GuestbookMessage, 'id' | 'createdAt'>) => void;
  isEmbeddedPreview?: boolean;
}

export const Royal3DLuxuryInvitationExperience: React.FC<
  Royal3DLuxuryInvitationExperienceProps
> = ({ invitation, onSaveRSVP, isEmbeddedPreview = false }) => {
  const activeMode = resolveSingleInteractionMode(invitation);
  const modeOption =
    SINGLE_INTERACTION_MODE_OPTIONS.find((o) => o.id === activeMode) ||
    SINGLE_INTERACTION_MODE_OPTIONS[0];

  const templateId: Royal3DCollectionTemplateId =
    resolveRoyal3DTemplateFromInteraction(invitation);
  const spec = ROYAL_3D_COLLECTION_SPECS[templateId];

  const sessionKey = `maraseem_intro_completed_${invitation.id}_${activeMode}`;

  // Do not repeat the opening scene automatically if already completed in this guest session (unless in editor preview)
  const alreadyCompletedInSession = (() => {
    if (isEmbeddedPreview) return false;
    try {
      return sessionStorage.getItem(sessionKey) === '1';
    } catch {
      return false;
    }
  })();

  const [isOpened, setIsOpened] = useState<boolean>(alreadyCompletedInSession);
  const [showCardOverlay, setShowCardOverlay] = useState<boolean>(alreadyCompletedInSession);
  const [activeViewSection, setActiveViewSection] = useState<
    'card' | 'details_countdown' | 'rsvp'
  >('card');
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(
    invitation.enableOpeningSfx !== false
  );
  const [liteMode, setLiteMode] = useState<boolean>(false);
  const [enableParticles, setEnableParticles] = useState<boolean>(
    invitation.visualEffect !== 'none'
  );
  const [isEnglish, setIsEnglish] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [currentPhaseLabel, setCurrentPhaseLabel] = useState<{
    ar: string;
    en: string;
  } | null>(null);

  // Reset open state if the user switches the Opening Experience in the Editor so they can immediately test clicking the new 3D scene
  useEffect(() => {
    if (isEmbeddedPreview) {
      setIsOpened(false);
      setShowCardOverlay(false);
      setCurrentPhaseLabel(null);
    }
  }, [activeMode, isEmbeddedPreview]);

  // RSVP State
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined'>('attending');
  const [companions, setCompanions] = useState<number>(2);
  const [rsvpNote, setRsvpNote] = useState<string>('');
  const [rsvpSuccess, setRsvpSuccess] = useState<boolean>(false);

  // Resolve color scheme based on custom selection or occasion default
  const activeColorScheme: Royal3DColorScheme =
    ROYAL_LUXURY_COLOR_SCHEMES.find((c) => c.id === invitation.customSecondaryColor) ||
    ROYAL_LUXURY_COLOR_SCHEMES.find((c) => c.id === modeOption.defaultColorSchemeId) ||
    ROYAL_LUXURY_COLOR_SCHEMES[0];

  const isDarkTheme = Boolean(modeOption.isDarkScene ?? spec.isDarkTheme);

  const resolvedFontClass =
    invitation.customFontFamily === 'aref'
      ? 'font-ruqaa'
      : invitation.customFontFamily === 'cairo'
      ? 'font-cairo'
      : 'font-amiri';

  useEffect(() => {
    return () => {
      soundEngine.stopAmbientMusic();
    };
  }, []);

  const markIntroCompletedInSession = () => {
    if (!isEmbeddedPreview) {
      try {
        sessionStorage.setItem(sessionKey, '1');
      } catch {}
    }
  };

  const handleTriggerOpen = () => {
    if (isOpened) return;
    setIsOpened(true);
    // Start background music ONLY after user gesture (never autoplay before user interaction)
    if (
      invitation.autoPlayMusic !== false &&
      invitation.musicTrack !== 'none' &&
      !isMusicPlaying
    ) {
      soundEngine.startAmbientMusic(
        invitation.musicTrack || 'romantic_piano',
        invitation.customAudioUrl
      );
      setIsMusicPlaying(true);
    }
  };

  const handleAnimationComplete = () => {
    markIntroCompletedInSession();
    setShowCardOverlay(true);
    setCurrentPhaseLabel(null);
  };

  const handleSkipAnimation = () => {
    markIntroCompletedInSession();
    setIsOpened(true);
    setShowCardOverlay(true);
    setCurrentPhaseLabel(null);
  };

  const handleReplayAnimation = () => {
    try {
      sessionStorage.removeItem(sessionKey);
    } catch {}
    setShowCardOverlay(false);
    setIsOpened(false);
    setCurrentPhaseLabel(null);
    setActiveViewSection('card');
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      soundEngine.stopAmbientMusic();
      setIsMusicPlaying(false);
    } else {
      soundEngine.startAmbientMusic(
        invitation.musicTrack || 'romantic_piano',
        invitation.customAudioUrl
      );
      setIsMusicPlaying(true);
    }
  };

  const groomDisplay = invitation.groomName || (isEnglish ? 'Ahmed' : 'أحمد');
  const brideDisplay = invitation.brideName || (isEnglish ? 'Zainab' : 'زينب');
  const isGraduationOccasion =
    invitation.category === 'graduation' ||
    invitation.category === 'graduation_project';
  const isCoupleOccasion =
    !isGraduationOccasion &&
    (invitation.category === 'wedding' ||
      invitation.category === 'engagement' ||
      invitation.category === 'henna' ||
      Boolean(invitation.groomName && invitation.brideName));

  const singleHostOrHonoree =
    invitation.graduateName ||
    invitation.birthdayStarName ||
    invitation.businessName ||
    invitation.brideName ||
    invitation.groomName ||
    invitation.title;

  const headlineNames = isCoupleOccasion
    ? `${groomDisplay} ✦ ${brideDisplay}`
    : singleHostOrHonoree;

  const monogramText = buildInvitationMonogram(
    isCoupleOccasion ? groomDisplay : undefined,
    isCoupleOccasion ? brideDisplay : undefined,
    singleHostOrHonoree,
    invitation.title
  );

  const handleShareWhatsApp = () => {
    const shareUrl = buildShareableInvitationUrl(invitation);
    const headline = isCoupleOccasion
      ? `${groomDisplay} & ${brideDisplay}`
      : singleHostOrHonoree;
    const msg = isEnglish
      ? `Royal Invitation\n${headline}\nDate: ${invitation.eventDate}\nVenue: ${invitation.venueName}\nOpen Your Invitation:\n${shareUrl}`
      : `دعوة خاصة من مراسيم\n${headline}\nالتاريخ: ${invitation.eventDate}\nالمكان: ${invitation.venueName}\nافتح الدعوة التفاعلية عبر الرابط:\n${shareUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  const handleSubmitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    onSaveRSVP?.({
      invitationId: invitation.id,
      guestName: guestName.trim(),
      phone: guestPhone.trim(),
      status: rsvpStatus,
      companionsCount: rsvpStatus === 'attending' ? companions : 0,
      note: rsvpNote.trim(),
    });
    setRsvpSuccess(true);
    if (sfxEnabled) soundEngine.playChime(659.25, 1.1);
  };

  const bodyDisplay =
    invitation.invitationBody ||
    (isEnglish
      ? 'With all love and joy, we are honored to invite you to share our special celebration.'
      : 'بكل الحب والفرح، نتشرف بدعوتكم لمشاركتنا أجمل لحظات العمر.');
  const venueDisplay =
    invitation.venueName || (isEnglish ? 'Al-Fayhaa Royal Hall' : 'قاعة الفيحاء للاحتفالات');
  const dateDisplay = invitation.eventDate || '2027-05-17';
  const dayDisplay = invitation.hijriDate || dateDisplay;
  const timeDisplay = invitation.eventTime || '08:00 PM';

  return (
    <div
      dir={isEnglish ? 'ltr' : 'rtl'}
      className={`invitation-isolated relative w-full ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-[100dvh] w-screen rounded-none'
          : isEmbeddedPreview
          ? 'h-[680px] sm:h-[740px] max-w-[430px] mx-auto rounded-[32px]'
          : 'min-h-[88dvh] h-[820px] max-w-[440px] mx-auto rounded-[36px]'
      } overflow-hidden select-none border shadow-[0_20px_60px_rgba(23,19,15,0.35)] ${resolvedFontClass}`}
      style={{
        borderColor: activeColorScheme.champagneGold,
        backgroundColor: isDarkTheme
          ? activeColorScheme.royalBlack
          : activeColorScheme.ivory,
      }}
    >
      {/* 1. Lazy-Loaded Isolated Three.js + GSAP Cinematic WebGL 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div
              className="w-full h-full flex items-center justify-center text-xs"
              style={{
                backgroundColor: isDarkTheme ? '#0B1938' : '#F8F1E5',
                color: '#D6B574',
              }}
            >
              جارٍ تجهيز المشهد السينمائي ثلاثي الأبعاد...
            </div>
          }
        >
          <LazyRoyal3DWebGLCanvas
            templateId={templateId}
            interactionMode={activeMode}
            major={invitation.major}
            isOpened={isOpened}
            enableParticles={enableParticles}
            colorScheme={activeColorScheme}
            monogramText={monogramText}
            namesHeadline={headlineNames}
            eventTitle={invitation.hostNames || invitation.title}
            eventDateText={dateDisplay}
            venueText={venueDisplay}
            enableSfx={sfxEnabled}
            liteMode={liteMode}
            onObjectClick={handleTriggerOpen}
            onAnimationComplete={handleAnimationComplete}
            onTimelineProgress={(_prog, phaseAr, phaseEn) =>
              setCurrentPhaseLabel({ ar: phaseAr, en: phaseEn })
            }
          />
        </Suspense>
      </div>

      {/* Subtle Royal Gold Hairline Frame */}
      <div
        className="pointer-events-none absolute inset-3 rounded-[24px] border z-10"
        style={{ borderColor: 'rgba(214, 181, 116, 0.45)' }}
      />

      {/* 2. Top Minimal Header Bar (Brand Crest + Skip Intro + SFX Toggle + Language) */}
      <div className="relative z-20 px-4 pt-4 flex items-center justify-between gap-2">
        <div
          className="px-3 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5"
          style={{
            backgroundColor: isDarkTheme
              ? 'rgba(11, 25, 56, 0.9)'
              : 'rgba(255, 253, 248, 0.94)',
            borderColor: activeColorScheme.champagneGold,
            color: isDarkTheme
              ? activeColorScheme.ivory
              : activeColorScheme.royalBlack,
          }}
        >
          {isGraduationOccasion ? (
            <GraduationCap size={13} style={{ color: activeColorScheme.champagneGold }} />
          ) : (
            <Crown size={12} style={{ color: activeColorScheme.antiqueGold }} />
          )}
          <span>MARASEEM</span>
        </div>

        <div className="flex items-center gap-1.5">
          {!showCardOverlay && (
            <button
              type="button"
              onClick={handleSkipAnimation}
              className="px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
              style={{
                backgroundColor: 'rgba(23, 19, 15, 0.92)',
                borderColor: activeColorScheme.champagneGold,
                color: activeColorScheme.ivory,
              }}
              title="تخطي الافتتاحية والوصول إلى محتوى الدعوة مباشرة"
            >
              <FastForward size={12} style={{ color: activeColorScheme.champagneGold }} />
              <span>{isEnglish ? 'Skip Intro' : 'تخطي الافتتاحية'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEnglish((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            style={{
              backgroundColor: isDarkTheme
                ? 'rgba(11, 25, 56, 0.9)'
                : 'rgba(255, 253, 248, 0.94)',
              borderColor: activeColorScheme.champagneGold,
              color: isDarkTheme
                ? activeColorScheme.ivory
                : activeColorScheme.royalBlack,
            }}
          >
            <Languages size={12} style={{ color: activeColorScheme.antiqueGold }} />
            <span>{isEnglish ? 'عربي' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* 3. Unopened / Opening State: Direct 3D Object Touch & Drag Hint + Live GSAP Phase Subtitle */}
      <AnimatePresence>
        {!showCardOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-x-6 bottom-20 z-20 flex flex-col items-center text-center pointer-events-none gap-2"
          >
            {isOpened && currentPhaseLabel ? (
              <div
                className="px-4 py-2 rounded-2xl border text-xs font-bold shadow-lg"
                style={{
                  backgroundColor: 'rgba(23, 19, 15, 0.88)',
                  borderColor: activeColorScheme.champagneGold,
                  color: activeColorScheme.champagneGold,
                }}
              >
                {isEnglish ? currentPhaseLabel.en : currentPhaseLabel.ar}
              </div>
            ) : (
              <div
                onClick={handleTriggerOpen}
                className="pointer-events-auto px-5 py-2.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-transform hover:scale-102 active:scale-98 shadow-lg"
                style={{
                  backgroundColor: isDarkTheme
                    ? 'rgba(15, 23, 42, 0.88)'
                    : 'rgba(255, 253, 248, 0.92)',
                  borderColor: activeColorScheme.champagneGold,
                  color: isDarkTheme
                    ? activeColorScheme.ivory
                    : activeColorScheme.royalBlack,
                }}
              >
                {activeMode === 'silk_ribbon_3d' ? (
                  <MoveHorizontal
                    size={16}
                    style={{ color: activeColorScheme.champagneGold }}
                    className="shrink-0"
                  />
                ) : (
                  <MousePointerClick
                    size={15}
                    style={{ color: activeColorScheme.champagneGold }}
                    className="shrink-0"
                  />
                )}
                <div className="text-start">
                  <div className="text-xs font-bold">
                    {isEnglish ? modeOption.clickHintEn : modeOption.clickHintAr}
                  </div>
                  <div
                    className="text-[10px] opacity-85"
                    style={{ color: activeColorScheme.champagneGold }}
                  >
                    {headlineNames} · {dateDisplay}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Opened State: Event Details Revealed AFTER Cinematic 3D Opening Sequence */}
      <AnimatePresence>
        {showCardOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-4 top-16 bottom-20 z-20 flex flex-col justify-between overflow-y-auto rounded-3xl border p-5 sm:p-6 shadow-2xl"
            style={{
              backgroundColor: isDarkTheme
                ? 'rgba(11, 20, 38, 0.95)'
                : 'rgba(255, 253, 248, 0.96)',
              borderColor: activeColorScheme.champagneGold,
              color: isDarkTheme
                ? activeColorScheme.pearlWhite
                : activeColorScheme.royalBlack,
            }}
          >
            {/* Section Switcher Buttons inside Card */}
            <div className="flex items-center justify-center gap-1.5 pb-3 border-b border-[#D6B574]/30 shrink-0">
              {[
                {
                  id: 'card' as const,
                  labelAr: 'تفاصيل الدعوة',
                  labelEn: 'Invitation',
                },
                {
                  id: 'details_countdown' as const,
                  labelAr: 'العد التنازلي والموقع',
                  labelEn: 'Countdown & Map',
                },
                {
                  id: 'rsvp' as const,
                  labelAr: 'تأكيد الحضور RSVP',
                  labelEn: 'RSVP',
                },
              ].map((tab) => {
                const active = activeViewSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveViewSection(tab.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap"
                    style={{
                      backgroundColor: active
                        ? activeColorScheme.champagneGold
                        : 'transparent',
                      borderColor: activeColorScheme.champagneGold,
                      color: active
                        ? activeColorScheme.royalBlack
                        : isDarkTheme
                        ? activeColorScheme.ivory
                        : activeColorScheme.royalBlack,
                    }}
                  >
                    {isEnglish ? tab.labelEn : tab.labelAr}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Main Names, Graduate / Couple Info, Date, Venue & Invitation Body */}
            {activeViewSection === 'card' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="my-auto py-3 text-center space-y-3.5"
              >
                <div
                  className="text-xs font-bold tracking-widest"
                  style={{ color: activeColorScheme.champagneGold }}
                >
                  بسم الله الرحمن الرحيم
                </div>

                {invitation.welcomeQuote && (
                  <p className="text-xs italic opacity-90 max-w-xs mx-auto leading-relaxed">
                    «{invitation.welcomeQuote.replace(/[«»"]/g, '')}»
                  </p>
                )}

                {/* Portrait / Photo (Graduate Photo or Couple Portrait) */}
                {(invitation.couplePortraitImage || invitation.coverImage) && (
                  <div
                    className="w-24 h-24 rounded-full mx-auto overflow-hidden border-2 shadow-md"
                    style={{ borderColor: activeColorScheme.champagneGold }}
                  >
                    <img
                      src={invitation.couplePortraitImage || invitation.coverImage}
                      alt={singleHostOrHonoree}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Names & Academic / Celebration Frame */}
                <div
                  className="py-4 px-5 rounded-2xl border relative space-y-1.5"
                  style={{
                    borderColor: activeColorScheme.champagneGold,
                    backgroundColor: isDarkTheme
                      ? 'rgba(214, 181, 116, 0.1)'
                      : 'rgba(248, 241, 229, 0.85)',
                  }}
                >
                  <div
                    className="text-[11px] font-semibold"
                    style={{ color: activeColorScheme.champagneGold }}
                  >
                    {invitation.hostNames || invitation.title}
                  </div>

                  {isCoupleOccasion ? (
                    <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-3 flex-wrap">
                      <span>{groomDisplay}</span>
                      <Heart
                        size={18}
                        style={{
                          color: activeColorScheme.antiqueGold,
                          fill: activeColorScheme.champagneGold,
                        }}
                      />
                      <span>{brideDisplay}</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="text-2xl sm:text-3xl font-bold">
                        {singleHostOrHonoree}
                      </div>

                      {(invitation.academicDegree || invitation.honorsTitle) && (
                        <div
                          className="text-xs font-bold flex items-center justify-center gap-1.5"
                          style={{ color: activeColorScheme.champagneGold }}
                        >
                          <Award size={14} />
                          <span>
                            {[invitation.academicDegree, invitation.honorsTitle]
                              .filter(Boolean)
                              .join(' • ')}
                          </span>
                        </div>
                      )}

                      {(invitation.university ||
                        invitation.college ||
                        invitation.departmentName) && (
                        <div className="text-xs opacity-90 font-semibold">
                          {[
                            invitation.university,
                            invitation.college,
                            invitation.departmentName &&
                            invitation.departmentName !== invitation.college
                              ? invitation.departmentName
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      )}

                      {invitation.projectTitle && (
                        <div className="pt-1 text-xs font-bold opacity-95">
                          مشروع التخرج: {invitation.projectTitle}
                        </div>
                      )}
                      {invitation.supervisorName && (
                        <div className="text-[11px] opacity-80">
                          بإشراف: {invitation.supervisorName}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Invitation Body Text */}
                <p className="text-xs sm:text-sm leading-relaxed px-2">{bodyDisplay}</p>

                {/* Summary of Date & Venue */}
                <div
                  className="p-3 rounded-2xl border grid grid-cols-2 gap-2 text-xs"
                  style={{ borderColor: 'rgba(214, 181, 116, 0.45)' }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: activeColorScheme.champagneGold }}
                    >
                      {isEnglish ? 'Date & Time' : 'التاريخ والوقت'}
                    </span>
                    <span className="font-bold font-mono tabular-nums">{dateDisplay}</span>
                    <span className="text-[11px] opacity-80 font-mono tabular-nums">
                      {timeDisplay}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: activeColorScheme.champagneGold }}
                    >
                      {isEnglish ? 'Venue' : 'المكان'}
                    </span>
                    <span className="font-bold">{venueDisplay}</span>
                    <span className="text-[11px] opacity-80">{invitation.city}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveViewSection('details_countdown')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow"
                    style={{
                      backgroundColor: activeColorScheme.champagneGold,
                      color: activeColorScheme.royalBlack,
                    }}
                  >
                    {isEnglish ? 'Countdown & Map' : 'العد التنازلي والخريطة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewSection('rsvp')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer"
                    style={{ borderColor: activeColorScheme.champagneGold }}
                  >
                    {isEnglish ? 'Confirm RSVP' : 'تأكيد الحضور RSVP'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Countdown, Venue Address, Google Maps & Contact Phone */}
            {activeViewSection === 'details_countdown' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="my-auto py-3 space-y-4 text-center"
              >
                <CountdownTimer
                  eventDate={dateDisplay}
                  eventTime={timeDisplay}
                  stylePreset="gold_luxury"
                  title={
                    isEnglish
                      ? 'Countdown to the Celebration'
                      : 'العد التنازلي لموعد المناسبة'
                  }
                  size="sm"
                />

                <div
                  className="p-4 rounded-2xl border space-y-2.5 text-start"
                  style={{ borderColor: 'rgba(214, 181, 116, 0.5)' }}
                >
                  <div className="flex items-start gap-2.5">
                    <Calendar
                      size={16}
                      className="shrink-0 mt-0.5"
                      style={{ color: activeColorScheme.champagneGold }}
                    />
                    <div className="text-xs">
                      <div className="font-bold">{dayDisplay}</div>
                      <div className="opacity-80 font-mono tabular-nums">
                        {dateDisplay} · {timeDisplay}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin
                      size={16}
                      className="shrink-0 mt-0.5"
                      style={{ color: activeColorScheme.champagneGold }}
                    />
                    <div className="text-xs">
                      <div className="font-bold">{venueDisplay}</div>
                      <div className="opacity-80">
                        {invitation.city}{' '}
                        {invitation.addressDetails ? `— ${invitation.addressDetails}` : ''}
                      </div>
                    </div>
                  </div>

                  {invitation.contactPhone && (
                    <div className="flex items-center gap-2.5">
                      <Phone
                        size={15}
                        className="shrink-0"
                        style={{ color: activeColorScheme.champagneGold }}
                      />
                      <span className="text-xs font-mono tabular-nums" dir="ltr">
                        {invitation.contactPhone}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={invitation.googleMapsUrl || 'https://maps.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      style={{
                        backgroundColor: activeColorScheme.champagneGold,
                        color: activeColorScheme.royalBlack,
                      }}
                    >
                      <Navigation size={14} />
                      <span>
                        {isEnglish ? 'Location on Map' : 'الموقع على الخريطة'}
                      </span>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: RSVP Confirmation */}
            {activeViewSection === 'rsvp' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="my-auto py-2 space-y-3"
              >
                {rsvpSuccess ? (
                  <div className="p-5 rounded-2xl border border-emerald-500/50 bg-emerald-950/20 text-center space-y-2">
                    <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                    <h4 className="text-base font-bold">
                      {isEnglish
                        ? 'Thank you! Your RSVP has been recorded.'
                        : 'شكراً لكم! تم تسجيل تأكيد حضوركم بنجاح.'}
                    </h4>
                    <p className="text-xs opacity-80">
                      {isEnglish
                        ? `We look forward to welcoming you, ${guestName}.`
                        : `نسعد ونتشرف بلقائكم يا ${guestName}.`}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitRSVP} className="space-y-3 text-start">
                    <div className="text-center">
                      <h4 className="text-base font-bold">
                        {isEnglish ? 'Confirm Attendance (RSVP)' : 'تأكيد الحضور (RSVP)'}
                      </h4>
                      <p className="text-[11px] opacity-75">
                        {isEnglish
                          ? 'Please confirm your attendance below'
                          : 'يسعدنا تسجيل تأكيد حضوركم الكريم'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRsvpStatus('attending')}
                        className="py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer"
                        style={{
                          backgroundColor:
                            rsvpStatus === 'attending'
                              ? activeColorScheme.champagneGold
                              : 'transparent',
                          borderColor: activeColorScheme.champagneGold,
                          color:
                            rsvpStatus === 'attending'
                              ? activeColorScheme.royalBlack
                              : 'inherit',
                        }}
                      >
                        {isEnglish ? 'Attending ✓' : 'سأحضر ✓'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpStatus('declined')}
                        className="py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer"
                        style={{
                          backgroundColor:
                            rsvpStatus === 'declined'
                              ? activeColorScheme.romanticBlush
                              : 'transparent',
                          borderColor: activeColorScheme.champagneGold,
                          color:
                            rsvpStatus === 'declined'
                              ? activeColorScheme.royalBlack
                              : 'inherit',
                        }}
                      >
                        {isEnglish ? 'Decline' : 'أعتذر عن الحضور'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1">
                        {isEnglish ? 'Full Name *' : 'الاسم الكريم *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder={isEnglish ? 'Your full name' : 'اكتب اسمك الكريم...'}
                        className="w-full px-3.5 py-2 rounded-xl border text-xs bg-transparent outline-none"
                        style={{ borderColor: activeColorScheme.champagneGold }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold mb-1">
                          {isEnglish ? 'Phone Number' : 'رقم الهاتف'}
                        </label>
                        <input
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+964 7XX XXX XXXX"
                          className="w-full px-3 py-2 rounded-xl border text-xs bg-transparent outline-none"
                          style={{ borderColor: activeColorScheme.champagneGold }}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">
                          {isEnglish ? 'Guests Count' : 'عدد الحضور'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={invitation.maxGuestsPerInvite || 6}
                          value={companions}
                          onChange={(e) => setCompanions(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border text-xs bg-transparent outline-none"
                          style={{ borderColor: activeColorScheme.champagneGold }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1">
                        {isEnglish ? 'Congratulatory Note' : 'كلمة تهنئة (اختياري)'}
                      </label>
                      <input
                        type="text"
                        value={rsvpNote}
                        onChange={(e) => setRsvpNote(e.target.value)}
                        placeholder={
                          isEnglish ? 'Best wishes...' : 'ألف مبروك ودامت الأفراح...'
                        }
                        className="w-full px-3 py-2 rounded-xl border text-xs bg-transparent outline-none"
                        style={{ borderColor: activeColorScheme.champagneGold }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md"
                      style={{
                        backgroundColor: activeColorScheme.champagneGold,
                        color: activeColorScheme.royalBlack,
                      }}
                    >
                      {isEnglish ? 'Submit RSVP' : 'إرسال تأكيد الحضور'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* Replay Cinematic Opening Scene Link */}
            <div className="pt-2 border-t border-[#D6B574]/25 flex items-center justify-between text-[11px] shrink-0">
              <button
                type="button"
                onClick={handleReplayAnimation}
                className="flex items-center gap-1 font-bold cursor-pointer hover:underline"
                style={{ color: activeColorScheme.champagneGold }}
              >
                <RotateCcw size={12} />
                <span>
                  {isEnglish ? 'Replay Opening Scene' : 'إعادة عرض المشهد الافتتاحي'}
                </span>
              </button>
              <span className="opacity-75 font-mono text-[10px]">
                {modeOption.titleEn}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Unified Collapsible Bottom Control Dock */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-[410px]">
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setDockCollapsed((c) => !c)}
            className="px-3 py-0.5 rounded-t-xl border border-b-0 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            style={{
              backgroundColor: 'rgba(23, 19, 15, 0.94)',
              borderColor: activeColorScheme.champagneGold,
              color: activeColorScheme.champagneGold,
            }}
          >
            {dockCollapsed ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            <span>{dockCollapsed ? (isEnglish ? 'Controls' : 'الأدوات') : (isEnglish ? 'Hide' : 'إخفاء')}</span>
          </button>
        </div>

        {!dockCollapsed && (
          <div
            className="px-2.5 py-2 rounded-2xl border flex items-center justify-between gap-1 shadow-xl"
            style={{
              backgroundColor: 'rgba(23, 19, 15, 0.95)',
              borderColor: activeColorScheme.champagneGold,
              color: activeColorScheme.ivory,
            }}
          >
            <button
              type="button"
              onClick={toggleMusic}
              className="px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              style={{
                borderColor: isMusicPlaying
                  ? activeColorScheme.champagneGold
                  : 'rgba(255,255,255,0.15)',
                color: isMusicPlaying
                  ? activeColorScheme.champagneGold
                  : activeColorScheme.ivory,
              }}
              title="تشغيل / إيقاف الموسيقى الخلفية"
            >
              {isMusicPlaying ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{isEnglish ? 'Music' : 'الموسيقى'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSfxEnabled((s) => !s)}
              className="px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              style={{
                borderColor: sfxEnabled
                  ? activeColorScheme.champagneGold
                  : 'rgba(255,255,255,0.15)',
                color: sfxEnabled
                  ? activeColorScheme.champagneGold
                  : activeColorScheme.ivory,
              }}
              title="تشغيل / إيقاف المؤثرات الصوتية السينمائية"
            >
              <Sparkles size={12} />
              <span>{isEnglish ? 'SFX' : 'صوت التفاعل'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLiteMode((l) => !l)}
              className="px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              style={{
                borderColor: liteMode
                  ? activeColorScheme.champagneGold
                  : 'rgba(255,255,255,0.15)',
                color: liteMode
                  ? activeColorScheme.champagneGold
                  : activeColorScheme.ivory,
              }}
              title="النسخة الخفيفة للأجهزة الضعيفة"
            >
              <Gauge size={12} />
              <span>{isEnglish ? (liteMode ? 'Lite' : 'HD') : liteMode ? 'خفيف' : 'عالي'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              style={{
                borderColor: 'rgba(255,255,255,0.15)',
                color: activeColorScheme.ivory,
              }}
            >
              <Share2 size={12} />
              <span>{isEnglish ? 'Share' : 'مشاركة'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              className="px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              style={{
                backgroundColor: isFullscreen
                  ? activeColorScheme.champagneGold
                  : 'transparent',
                borderColor: activeColorScheme.champagneGold,
                color: isFullscreen
                  ? activeColorScheme.royalBlack
                  : activeColorScheme.champagneGold,
              }}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              <span>{isFullscreen ? (isEnglish ? 'Exit' : 'تصغير') : (isEnglish ? 'Full' : 'ملء الشاشة')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
