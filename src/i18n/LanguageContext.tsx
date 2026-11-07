import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

export type Language = 'ar' | 'en';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  tr: (arText: string, enText: string) => string;
  translateDesigner: (arDesigner: string) => string;
  translateColorTag: (arTag: string) => string;
  translateTemplateDesc: (templateId: string, arDesc: string) => string;
}

const DESIGNER_EN_MAP: Record<string, string> = {
  'أتيليه مراسيم الملكي': 'Maraseem Royal Atelier',
  'المصممة ريم العبيدي': 'Designer Reem Al-Obaidi',
  'استوديو بغداد الإبداعي': 'Baghdad Creative Studio',
  'المصمم زيد الكاظمي': 'Designer Zaid Al-Kadhimi',
  'أتيليه دجلة للفنون': 'Tigris Fine Arts Atelier',
};

const COLOR_TAG_EN_MAP: Record<string, string> = {
  'كريمي وفستقي': 'Creamy & Pistachio',
  'أخضر ميرمية وبيج': 'Sage Green & Warm Beige',
  'ذهبي ملكي': 'Royal Gold & Burgundy',
  'أبيض دافئ': 'Warm Creamy White',
  'زمردي تراثي': 'Heritage Emerald',
  'أسود سينمائي': 'Cinematic Obsidian & Gold',
  'كحلي وذهبي': 'Academic Navy & Gold',
  'وردي وعاجي': 'Blush Rose & Ivory',
  'عنابي وذهبي': 'Burgundy & Gold',
};

const TEMPLATE_DESC_EN_MAP: Record<string, string> = {
  'tpl-atelier-mohammed-noura':
    'Rotating floral wax seal with floating rose petals, interactive timeline, route starting point, Waze & Google Maps navigation, and custom romantic audio.',
  'tpl-atelier-ali-tabarak':
    'Botanical wreath gate with animated hands, vintage Roman numeral clock at 3:00 PM, interactive phone number reveal, and live RSVP confirmation.',
  'tpl-atelier-royal-convoy':
    'Interactive convoy timeline from the gathering point to the celebration hall with animated vehicle marker and direct navigation links.',
  'tpl-atelier-celestial-clock':
    'Rotating celestial astrolabe and golden clock hands synchronized with the ceremony hour and shimmering starlight.',
  'tpl-atelier-velvet-petals':
    'Interactive rose-petal scattering on touch with velvet gold embossing, live countdown, and family blessing book.',
  'tpl-atelier-secret-cipher':
    'Interactive golden cipher card that reveals the ceremony password, private contact number, and VIP invitation pass.',
  'tpl-eng-wax-burgundy':
    'Luxury burgundy envelope sealed with a golden wax stamp; opens on tap to slide out the couple’s engagement card with romantic piano.',
  'tpl-eng-floral-arch':
    'Soft pastel watercolor floral arch with delicate gold frames, countdown timer, and instant RSVP confirmation.',
  'tpl-henna-baghdadi-lantern':
    'Authentic Iraqi Baghdadi Henna night atmosphere with glowing brass lanterns, candle trays, and golden henna motifs.',
  'tpl-henna-moroccan-emerald':
    'Royal emerald and gold geometric arches with warm lantern glow and traditional celebration rhythms.',
  'tpl-wed-royal-book':
    '3D royal velvet wedding book whose gilded pages flip smoothly in mid-air to reveal the couple’s story, schedule, and hall map.',
  'tpl-wed-movie-35mm':
    'Cinematic 35mm film strip experience with director clapperboard, romantic trailer scenes, and VIP premiere admission pass.',
  'tpl-wed-classic-palace':
    'Grand ballroom chandelier aesthetics with champagne gold typography, family reception groups, and table seating assignment.',
  'tpl-bday-interactive-cake':
    'Interactive birthday cake where guests blow or tap to extinguish the candles and launch celebratory confetti and fireworks.',
  'tpl-bday-royal-first':
    'Joyful first birthday celebration with floating pastel balloons, golden crown, and memory photo gallery.',
  'tpl-grad-medicine':
    'Tailored for medical graduates featuring a golden stethoscope crest, Hippocratic oath scroll, and ceremony details.',
  'tpl-grad-ai-tech':
    'Modern academic template for AI, computer science, and engineering graduates with neural constellation graphics.',
  'tpl-grad-dentistry':
    'Dedicated dental school graduation invitation with refined pearl-and-gold emblem and celebration schedule.',
  'tpl-grad-law':
    'Distinguished law faculty graduation scroll featuring the golden scales of justice and formal academic typography.',
  'tpl-biz-ribbon-cut':
    'Interactive VIP grand opening ceremony where guests cut the golden ribbon to unveil the company profile, agenda, and location.',
  'tpl-art-gallery-opening':
    'Refined fine-art exhibition opening invitation with gallery spotlight ambiance, curator note, and VIP preview pass.',
  'tpl-career-promotion':
    'Executive celebration invitation for career promotions and leadership milestones with sophisticated olive-and-gold styling.',
  'tpl-family-milestone':
    'Warm family celebration template for academic achievements, blessed returns, and joyful family gatherings.',
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('maraseem_lang');
      if (saved === 'ar' || saved === 'en') return saved;
      return 'ar'; // Arabic is the default primary language
    } catch {
      return 'ar';
    }
  });

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    try {
      localStorage.setItem('maraseem_lang', nextLang);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr';
  const isRTL = lang === 'ar';

  const tr = (arText: string, enText: string): string => {
    return lang === 'ar' ? arText : enText;
  };

  const translateDesigner = (arDesigner: string): string => {
    if (lang === 'ar') return arDesigner;
    return DESIGNER_EN_MAP[arDesigner] || arDesigner;
  };

  const translateColorTag = (arTag: string): string => {
    if (lang === 'ar') return arTag;
    return COLOR_TAG_EN_MAP[arTag] || arTag;
  };

  const translateTemplateDesc = (templateId: string, arDesc: string): string => {
    if (lang === 'ar') return arDesc;
    return TEMPLATE_DESC_EN_MAP[templateId] || arDesc;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        dir,
        isRTL,
        tr,
        translateDesigner,
        translateColorTag,
        translateTemplateDesc,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { code: Language; label: string; sub: string }[] = [
    { code: 'ar', label: 'العربية 🇮🇶', sub: 'اللغة الافتراضية' },
    { code: 'en', label: 'English 🇬🇧', sub: 'English Interface' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] text-xs font-bold flex items-center gap-1.5 shadow-[0_2px_10px_rgba(86,107,73,0.06)] transition-all cursor-pointer whitespace-nowrap"
        aria-label={lang === 'ar' ? 'تغيير اللغة' : 'Change Language'}
      >
        <Globe size={14} className="text-[#91A77D]" />
        <span>{lang === 'ar' ? 'العربية 🇮🇶' : 'English 🇬🇧'}</span>
        <ChevronDown
          size={13}
          className={`text-[#91A77D] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 ${
            lang === 'ar' ? 'left-0' : 'right-0'
          } w-44 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] shadow-[0_12px_32px_rgba(86,107,73,0.14)] p-1.5 z-50 space-y-1`}
        >
          {options.map((opt) => {
            const isSelected = lang === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLang(opt.code);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#DCE8CB] text-[#566B49] border border-[#B9CCA0]'
                    : 'text-[#566B49] hover:bg-[#F8F6EF]'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-[#91A77D] font-normal">{opt.sub}</span>
                </div>
                {isSelected && <Check size={14} className="text-[#566B49]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
