// صور ولوحات فنية افتراضية فاخرة بهوية مراسيم الملكية (تستبدل الصور الشخصية بصور رمزية مشابهة في الطابع والفخامة)

const svgToDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

// خلفية غلاف فاخرة لطابع روزة الذهب واللؤلؤ (بديل فاخر لخلفية الغلاف)
export const MOHAMMED_NOURA_COVER_BG = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="900" height="1200">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#FFFDF9"/>
      <stop offset="50%" stop-color="#F6EFE2"/>
      <stop offset="100%" stop-color="#E4D3B5"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E5C888"/>
      <stop offset="50%" stop-color="#B89047"/>
      <stop offset="100%" stop-color="#8A6623"/>
    </linearGradient>
    <radialGradient id="orb" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="1200" fill="url(#bgGlow)"/>
  <circle cx="450" cy="380" r="320" fill="url(#orb)"/>
  <circle cx="450" cy="860" r="260" fill="url(#orb)"/>
  <!-- إطارات معمارية ملكية -->
  <rect x="48" y="48" width="804" height="1104" rx="36" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-opacity="0.55"/>
  <rect x="68" y="68" width="764" height="1064" rx="28" fill="none" stroke="url(#goldGrad)" stroke-width="1" stroke-dasharray="8 8" stroke-opacity="0.45"/>
  <!-- قوس ملكي إسلامي ناعم -->
  <path d="M160,1080 L160,440 C160,240 290,120 450,120 C610,120 740,240 740,440 L740,1080" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-opacity="0.5"/>
  <path d="M190,1080 L190,455 C190,275 305,160 450,160 C595,160 710,275 710,455 L710,1080" fill="none" stroke="url(#goldGrad)" stroke-width="1.2" stroke-opacity="0.35"/>
  <!-- زخرفة روزة ذهبية في الأعلى -->
  <g transform="translate(450, 260)" opacity="0.65">
    <circle r="74" fill="none" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <circle r="54" fill="none" stroke="url(#goldGrad)" stroke-width="1" stroke-dasharray="4 6"/>
    <path d="M0,-74 L16,-22 L70,-22 L26,8 L42,60 L0,28 L-42,60 L-26,8 L-70,-22 L-16,-22 Z" fill="none" stroke="url(#goldGrad)" stroke-width="1.2"/>
  </g>
</svg>
`);

// صورة بورتريه افتراضية فاخرة للعروسين (بديل فاخر للصورة الأولى بطابع دافئ ورومانسي)
export const MOHAMMED_NOURA_PHOTO = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FDF9F1"/>
      <stop offset="45%" stop-color="#F3E5CE"/>
      <stop offset="100%" stop-color="#DEC6A0"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E7C986"/>
      <stop offset="50%" stop-color="#B88E42"/>
      <stop offset="100%" stop-color="#7D5B1E"/>
    </linearGradient>
    <linearGradient id="suit" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2C2623"/>
      <stop offset="100%" stop-color="#171311"/>
    </linearGradient>
    <linearGradient id="dress" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9"/>
      <stop offset="60%" stop-color="#F7EFE2"/>
      <stop offset="100%" stop-color="#E5D5BC"/>
    </linearGradient>
    <radialGradient id="sunHalo" cx="50%" cy="38%" r="48%">
      <stop offset="0%" stop-color="#FFFDF7" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="#E7C986" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#E7C986" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="800" height="1000" fill="url(#sky)"/>
  <circle cx="400" cy="380" r="360" fill="url(#sunHalo)"/>

  <!-- قوس الورد والذهب الخلفي -->
  <path d="M140,920 L140,390 C140,210 255,100 400,100 C545,100 660,210 660,390 L660,920" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <path d="M165,920 L165,400 C165,235 268,130 400,130 C532,130 635,235 635,400 L635,920" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="6 6"/>

  <!-- أوراق وزهور ذهبية وعاجية أعلى القوس -->
  <g transform="translate(400, 125)">
    <circle cx="-110" cy="30" r="24" fill="#F9F2E7" stroke="url(#gold)" stroke-width="2"/>
    <circle cx="-60" cy="8" r="30" fill="#FFFDF9" stroke="url(#gold)" stroke-width="2"/>
    <circle cx="0" cy="0" r="36" fill="#FFFDF9" stroke="url(#gold)" stroke-width="2.5"/>
    <circle cx="60" cy="8" r="30" fill="#FFFDF9" stroke="url(#gold)" stroke-width="2"/>
    <circle cx="110" cy="30" r="24" fill="#F9F2E7" stroke="url(#gold)" stroke-width="2"/>
    <circle cx="0" cy="0" r="10" fill="url(#gold)"/>
  </g>

  <!-- سيلويت فني أنيق للعريس والعروس (طابع رمزي راقٍ) -->
  <!-- العريس -->
  <g transform="translate(335, 310)">
    <circle cx="0" cy="0" r="46" fill="#D5B28A"/>
    <path d="M-46,-10 C-46,-45 46,-45 46,-10 C32,-26 -32,-26 -46,-10 Z" fill="#2A211B"/>
    <path d="M-95,290 C-95,120 -55,68 0,68 C55,68 95,120 95,290 L95,580 L-95,580 Z" fill="url(#suit)"/>
    <!-- ياقة وربطة عنق -->
    <polygon points="-24,68 0,145 24,68" fill="#FFFDF9"/>
    <polygon points="-6,95 0,148 6,95 3,76 -3,76" fill="url(#gold)"/>
  </g>

  <!-- العروس -->
  <g transform="translate(465, 345)">
    <!-- طرحة التول الملكية -->
    <path d="M10,-35 C85,-20 145,120 165,420 L-40,420 Z" fill="#FFFDF9" fill-opacity="0.65" stroke="url(#gold)" stroke-width="1"/>
    <circle cx="0" cy="0" r="42" fill="#DFBFA0"/>
    <!-- تاج ذهبي صغير -->
    <path d="M-24,-36 L-12,-54 L0,-40 L12,-54 L24,-36 Z" fill="url(#gold)"/>
    <!-- فستان الزفاف الملكي -->
    <path d="M-70,255 C-60,115 -35,65 0,65 C35,65 65,115 85,255 L145,545 L-135,545 Z" fill="url(#dress)" stroke="url(#gold)" stroke-width="2"/>
    <!-- باقة الورد في اليد -->
    <g transform="translate(-35, 195)">
      <circle cx="0" cy="0" r="34" fill="#F5E6D0" stroke="url(#gold)" stroke-width="2"/>
      <circle cx="-14" cy="-8" r="14" fill="#FFFDF9" stroke="url(#gold)" stroke-width="1.5"/>
      <circle cx="14" cy="-6" r="14" fill="#E8C7B8" stroke="url(#gold)" stroke-width="1.5"/>
      <circle cx="0" cy="12" r="15" fill="#FFFDF9" stroke="url(#gold)" stroke-width="1.5"/>
    </g>
  </g>

  <!-- خاتمان متداخلان في الأسفل مع شريط اسم افتراضي -->
  <g transform="translate(400, 770)">
    <circle cx="-22" cy="0" r="34" fill="none" stroke="url(#gold)" stroke-width="5"/>
    <circle cx="22" cy="0" r="34" fill="none" stroke="url(#gold)" stroke-width="5"/>
    <polygon points="22,-42 32,-54 22,-64 12,-54" fill="#FFFDF9" stroke="url(#gold)" stroke-width="2"/>
  </g>

  <rect x="170" y="845" width="460" height="64" rx="32" fill="#FFFDF9" fill-opacity="0.92" stroke="url(#gold)" stroke-width="2"/>
  <text x="400" y="886" text-anchor="middle" fill="#6E501F" font-family="serif" font-size="26" font-weight="bold">صورة رمزية للعروسين · قابلة للتخصيص</text>
</svg>
`);

// صورة بورتريه افتراضية ثانية بطابع إكليل الورد والزمرد الملكي (بديل فاخر للصورة الثانية)
export const ALI_TABARAK_PHOTO = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <radialGradient id="pearlBg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#FFFDFB"/>
      <stop offset="55%" stop-color="#F4EDE2"/>
      <stop offset="100%" stop-color="#DFCFAE"/>
    </radialGradient>
    <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E6C387"/>
      <stop offset="50%" stop-color="#BA8B4A"/>
      <stop offset="100%" stop-color="#7E5826"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2E5A44"/>
      <stop offset="100%" stop-color="#173325"/>
    </linearGradient>
  </defs>

  <rect width="800" height="1000" fill="url(#pearlBg)"/>

  <!-- إطار دائري نباتي مزدوج -->
  <circle cx="400" cy="450" r="290" fill="#FFFDF9" fill-opacity="0.7" stroke="url(#roseGold)" stroke-width="3"/>
  <circle cx="400" cy="450" r="268" fill="none" stroke="url(#roseGold)" stroke-width="1.5" stroke-dasharray="8 6"/>

  <!-- أغصان زيتون وورود على جانبي الإطار -->
  <g stroke="url(#emeraldGrad)" stroke-width="3" fill="none" opacity="0.85">
    <path d="M130,540 C95,410 140,260 250,185"/>
    <path d="M670,540 C705,410 660,260 550,185"/>
  </g>
  <g fill="#2E5A44" opacity="0.75">
    <ellipse cx="122" cy="460" rx="18" ry="8" transform="rotate(-35 122 460)"/>
    <ellipse cx="138" cy="390" rx="18" ry="8" transform="rotate(-25 138 390)"/>
    <ellipse cx="172" cy="320" rx="18" ry="8" transform="rotate(-15 172 320)"/>
    <ellipse cx="678" cy="460" rx="18" ry="8" transform="rotate(35 678 460)"/>
    <ellipse cx="662" cy="390" rx="18" ry="8" transform="rotate(25 662 390)"/>
    <ellipse cx="628" cy="320" rx="18" ry="8" transform="rotate(15 628 320)"/>
  </g>

  <!-- رسم رمزي أنيق ليدين متشابكتين مع خواتم الخطوبة والزفاف وبوكيه ورد -->
  <g transform="translate(400, 430)">
    <!-- هالة ذهبية خلفية -->
    <circle cx="0" cy="-20" r="165" fill="#F8EFE0" stroke="url(#roseGold)" stroke-width="1.5"/>
    <!-- بوكيه ورد ملكي فاخر -->
    <circle cx="-55" cy="-40" r="46" fill="#F3D6CE" stroke="url(#roseGold)" stroke-width="2"/>
    <circle cx="55" cy="-40" r="46" fill="#F9E9D8" stroke="url(#roseGold)" stroke-width="2"/>
    <circle cx="0" cy="-75" r="52" fill="#FFFDF9" stroke="url(#roseGold)" stroke-width="2.5"/>
    <circle cx="0" cy="-15" r="56" fill="#F7E1D7" stroke="url(#roseGold)" stroke-width="2.5"/>
    <!-- قلب الورود -->
    <circle cx="0" cy="-15" r="18" fill="url(#roseGold)"/>
    <circle cx="0" cy="-75" r="14" fill="url(#roseGold)"/>
    <!-- شريط حريري ذهبي في الأسفل -->
    <path d="M-30,38 L0,135 L30,38 Z" fill="url(#emeraldGrad)"/>
    <path d="M-25,40 C-75,75 -95,125 -55,155 C-25,135 -10,95 0,60 C10,95 25,135 55,155 C95,125 75,75 25,40 Z" fill="url(#roseGold)"/>
    <!-- خاتمان متعانقان -->
    <circle cx="-24" cy="115" r="32" fill="none" stroke="url(#roseGold)" stroke-width="5"/>
    <circle cx="24" cy="115" r="32" fill="none" stroke="url(#roseGold)" stroke-width="5"/>
  </g>

  <rect x="160" y="810" width="480" height="68" rx="34" fill="#FFFDF9" fill-opacity="0.94" stroke="url(#roseGold)" stroke-width="2"/>
  <text x="400" y="852" text-anchor="middle" fill="#5D4420" font-family="serif" font-size="26" font-weight="bold">لوحة خطوبة وزفاف افتراضية · مراسيم</text>
</svg>
`);

// غلاف افتراضي فاخر لمناسبات التخرج ومشاريع التخرج
export const DEFAULT_GRADUATION_COVER = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <radialGradient id="gradBg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#1A2744"/>
      <stop offset="60%" stop-color="#0E1526"/>
      <stop offset="100%" stop-color="#070B14"/>
    </radialGradient>
    <linearGradient id="gradGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5DF98"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#8C6B1F"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#gradBg)"/>
  <rect x="45" y="45" width="710" height="910" rx="30" fill="none" stroke="url(#gradGold)" stroke-width="2" stroke-opacity="0.6"/>
  <!-- قبعة تخرج ملكية ثلاثية الأبعاد الطابع -->
  <g transform="translate(400, 420)">
    <polygon points="0,-130 220,-35 0,60 -220,-35" fill="#131C31" stroke="url(#gradGold)" stroke-width="4"/>
    <path d="M-115,15 L-115,95 C-115,140 115,140 115,95 L115,15" fill="#1A2642" stroke="url(#gradGold)" stroke-width="3"/>
    <circle cx="0" cy="-35" r="14" fill="url(#gradGold)"/>
    <path d="M0,-35 Q130,10 155,135" fill="none" stroke="url(#gradGold)" stroke-width="5"/>
    <polygon points="155,135 140,185 170,185" fill="url(#gradGold)"/>
    <!-- شهادة ملفوفة -->
    <g transform="translate(0, 210) rotate(-8)">
      <rect x="-130" y="-26" width="260" height="52" rx="16" fill="#FFF9EA" stroke="url(#gradGold)" stroke-width="3"/>
      <rect x="-22" y="-30" width="44" height="60" rx="6" fill="url(#gradGold)"/>
    </g>
  </g>
</svg>
`);

// غلاف افتراضي فاخر لأعياد الميلاد الملكية
export const DEFAULT_BIRTHDAY_COVER = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <radialGradient id="bdayBg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#3B1D38"/>
      <stop offset="60%" stop-color="#1E0E20"/>
      <stop offset="100%" stop-color="#0E0710"/>
    </radialGradient>
    <linearGradient id="bdayGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F7E2A4"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#9A7424"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bdayBg)"/>
  <rect x="45" y="45" width="710" height="910" rx="30" fill="none" stroke="url(#bdayGold)" stroke-width="2" stroke-opacity="0.6"/>
  <g transform="translate(400, 480)">
    <!-- كعكة ملكية من 3 طبقات -->
    <rect x="-150" y="90" width="300" height="95" rx="20" fill="#FFF8EE" stroke="url(#bdayGold)" stroke-width="3"/>
    <rect x="-110" y="0" width="220" height="90" rx="18" fill="#F9E9D8" stroke="url(#bdayGold)" stroke-width="3"/>
    <rect x="-70" y="-80" width="140" height="80" rx="16" fill="#FFF8EE" stroke="url(#bdayGold)" stroke-width="3"/>
    <!-- شموع ذهبية مضيئة -->
    <rect x="-35" y="-130" width="12" height="50" rx="4" fill="url(#bdayGold)"/>
    <rect x="-6" y="-140" width="12" height="60" rx="4" fill="url(#bdayGold)"/>
    <rect x="23" y="-130" width="12" height="50" rx="4" fill="url(#bdayGold)"/>
    <circle cx="-29" cy="-145" r="10" fill="#FFE484"/>
    <circle cx="0" cy="-155" r="12" fill="#FFE484"/>
    <circle cx="29" cy="-145" r="10" fill="#FFE484"/>
  </g>
</svg>
`);
