import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Heart,
  GraduationCap,
  Cake,
  Flame,
  Building2,
  Film,
  Compass,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Eye,
  Sliders,
  Share2,
  Calendar,
  MapPin,
  Star,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Template, InvitationCategory, TemplateStyle, InvitationData } from '../../types/invitation';

interface HomePageProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  onPreviewTemplate: (template: Template) => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onOpenDirectInvitation: (invitationId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  templates,
  onSelectTemplate,
  onPreviewTemplate,
  onOpenDashboard,
  onOpenAdmin,
  onOpenDirectInvitation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InvitationCategory>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories definitions
  const categoriesList: { id: InvitationCategory; name: string; icon: string; count: number; desc: string }[] = [
    {
      id: 'all',
      name: 'جميع المناسبات',
      icon: '✨',
      count: templates.length,
      desc: 'استكشف كافة التجارب التفاعلية المتاحة'
    },
    {
      id: 'wedding',
      name: 'حفلات الزواج',
      icon: '💍',
      count: templates.filter(t => t.category === 'wedding').length,
      desc: 'كتب ملكية مذهبة، أفلام سينمائية، وتجارب حب استثنائية'
    },
    {
      id: 'engagement',
      name: 'الخطوبة وعقد القران',
      icon: '💎',
      count: templates.filter(t => t.category === 'engagement').length,
      desc: 'أظرف شمعية فاخرة، بطاقات منزلقة، ومواعيد مباركة'
    },
    {
      id: 'henna',
      name: 'ليلة الحنة التراثية',
      icon: '🪔',
      count: templates.filter(t => t.category === 'henna').length,
      desc: 'أصالة بغدادية، فوانيس مضيئة، صواني شموع ونقوش زمردية'
    },
    {
      id: 'graduation',
      name: 'حفلات التخرج الجامعي',
      icon: '🎓',
      count: templates.filter(t => t.category === 'graduation').length,
      desc: 'مخصصة حسب التخصص: طب، طب أسنان، ذكاء اصطناعي، قانون، هندسة'
    },
    {
      id: 'birthday',
      name: 'أعياد الميلاد',
      icon: '🎂',
      count: templates.filter(t => t.category === 'birthday').length,
      desc: 'كيكة تفاعلية مع إطفاء الشموع وانطلاق الألعاب النارية'
    },
    {
      id: 'business_opening',
      name: 'افتتاح المشاريع والفعاليات',
      icon: '🏢',
      count: templates.filter(t => t.category === 'business_opening').length,
      desc: 'قص شريط ذهبي رسمي، ومراسم افتتاح VIP للشركات'
    },
    {
      id: 'art_exhibition',
      name: 'افتتاح معرض فني',
      icon: '🎨',
      count: templates.filter(t => t.category === 'art_exhibition').length,
      desc: 'هوية متحفية لأروقة الفنون التشكيلية، الخط العربي، وأمسيات الافتتاح الثقافية'
    },
    {
      id: 'career_promotion',
      name: 'حفل ترقية وظيفية',
      icon: '🏆',
      count: templates.filter(t => t.category === 'career_promotion').length,
      desc: 'هوية قيادية مهيبة للترقيات الإدارية والعلمية وتولي المناصب العليا'
    },
    {
      id: 'family_success',
      name: 'دعوة نجاح عائلي',
      icon: '🌟',
      count: templates.filter(t => t.category === 'family_success').length,
      desc: 'احتفاليات تفوق الأبناء، لمّ الشمل المبارك، ومآدب الفرح العائلية الدافئة'
    },
  ];

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedStyle !== 'all') {
      if (selectedStyle === 'movie' && !t.isMovieInspired) return false;
      if (selectedStyle !== 'movie' && t.style !== selectedStyle) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const movieInspiredTemplates = templates.filter(t => t.isMovieInspired);

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 font-cairo">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-neutral-800/80">
        {/* Glow & Backdrop Ornaments */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left/Main Column: Proposition */}
            <div className="lg:col-span-7 space-y-6 text-right">
              {/* Clean editorial label - NO PILL */}
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <span>المنصة العربية الأولى للدعوات التفاعلية</span>
                <span aria-hidden="true">·</span>
                <span>تجارب متعددة المشاهد</span>
                <span aria-hidden="true">·</span>
                <span>تأكيد حضور مباشر</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                دعوات إلكترونية فاخرة <br />
                <span className="gold-gradient-text">تُعاش كذكرى... لا مجرد صورة</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
                حوّل مناسبتك إلى حكاية تبهر ضيوفك: أظرف ملكية تُفتح بختم شمعي، فوانيس حنة تتوهج، كيكة ميلاد تُطفأ شموعها تفاعلياً، وعد تنازلي وخرائط وصول ذكية برابط فريد خاص بك.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    const firstTpl = templates[0];
                    if (firstTpl) onSelectTemplate(firstTpl);
                  }}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center gap-2.5"
                >
                  <Sparkles size={16} />
                  <span>اصنع دعوتك الآن مجاناً</span>
                </button>

                <a
                  href="#templates-gallery"
                  className="px-6 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-sm transition-all"
                >
                  استكشف القوالب الحية
                </a>
              </div>

              {/* Proof stats row */}
              <div className="pt-6 border-t border-neutral-800/80 flex items-center gap-8 text-xs text-neutral-400">
                <div>
                  <span className="text-base font-bold text-white font-mono tabular-nums">+14,000</span>
                  <div className="text-[11px] text-neutral-500">دعوة تم إنشاؤها</div>
                </div>
                <div className="w-px h-8 bg-neutral-800" />
                <div>
                  <span className="text-base font-bold text-white font-mono tabular-nums">99.8%</span>
                  <div className="text-[11px] text-neutral-500">نسبة رضا العملاء</div>
                </div>
                <div className="w-px h-8 bg-neutral-800" />
                <div>
                  <span className="text-base font-bold text-white font-mono tabular-nums">100%</span>
                  <div className="text-[11px] text-neutral-500">روابط سريعة بدون إعلانات</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#181920] to-[#0f1118] border border-amber-500/30 shadow-2xl space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-400 pb-3 border-b border-neutral-800">
                  <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    تجربة حية تفاعلية
                  </span>
                  <span>رابط فريد لكل مدعو</span>
                </div>

                {/* Hero Interactive Mini-Card Demonstration */}
                <div className="rounded-2xl bg-neutral-950 p-6 border border-amber-500/20 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    <Sparkles size={28} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white font-amiri gold-gradient-text">
                      دعوة زفاف أحمد & سارة الملكية
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      فندق بابل روتانا - القاعة الملكية الكبرى
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="font-bold text-amber-300 font-mono">10</div>
                      <div className="text-[10px] text-neutral-500">أيام متبقية</div>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="font-bold text-emerald-300 font-mono">148</div>
                      <div className="text-[10px] text-neutral-500">مؤكد حضورهم</div>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="font-bold text-sky-300 font-mono">خرائط</div>
                      <div className="text-[10px] text-neutral-500">مسار مباشر</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenDirectInvitation('inv-demo-1')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} />
                    <span>جرّب فتح هذه الدعوة الآن كمدعو</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-1">
                  <span>✨ يدعم تشغيل الموسيقى</span>
                  <span>📍 ارتباط مباشر بـ Google Maps</span>
                  <span>✍️ سجل تهاني وتأكيد حضور</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION (أقسام المناسبات) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-amber-400 tracking-wider">
              لكل مناسبة هويتها وتجربتها
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              أقسام المناسبات المستقلة
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              كل قسم صُمم بهوية بصرية ومؤثرات خاصة: من الختم الشمعي للخطوبة، إلى الفوانيس الشرقية لليلة الحنة، وروب التخرج وشهادات الطب والذكاء الاصطناعي.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesList.filter(c => c.id !== 'all').map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const el = document.getElementById('templates-gallery');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/40 hover:bg-neutral-900 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-3 rounded-2xl bg-neutral-950 border border-neutral-800 group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                      {cat.count} قوالب متاحة
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed font-cairo">
                    {cat.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 pt-3 border-t border-neutral-800/80">
                  <span>تصفح تصاميم هذا القسم</span>
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MOVIE INSPIRED INVITATIONS (قسم خاص مميز) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-950 via-[#10121a] to-neutral-950 border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Film size={14} />
                <span>Movie Inspired Invitations</span>
                <span aria-hidden="true">·</span>
                <span>تصاميم بوسترات السينما</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                دعوات مستوحاة من الأجواء السينمائية العالمية
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                دعوتك كأفيش فيلم سينمائي رومانسي! خطوط درامية ساحرة، تذاكر VIP، ومشاهد متتالية تروي قصة لقائكم وأجمل فصول حياتكم.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedStyle('movie');
                const el = document.getElementById('templates-gallery');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors self-start md:self-auto"
            >
              عرض جميع القوالب السينمائية
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {movieInspiredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-6 rounded-3xl bg-neutral-900/80 border border-amber-500/30 hover:border-amber-400 transition-all flex flex-col justify-between space-y-5 shadow-2xl relative overflow-hidden group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                      <Film size={13} /> CINEMATIC PREMIERE
                    </span>
                    <span className="text-xs text-neutral-500">{tpl.category}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    {tpl.name}
                  </h3>

                  <p className="text-xs text-neutral-300 leading-relaxed font-cairo">
                    {tpl.description}
                  </p>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                    <div className="text-amber-300 font-semibold">مميزات التجربة السينمائية:</div>
                    <div>🎬 تذكرة دخول VIP مع رمز باركود</div>
                    <div>🎻 موسيقى تصويرية كلاسيكية مع فتح الدعوة</div>
                    <div>⏳ مؤقت عد تنازلي لشاشة العرض الأول</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
                  <button
                    onClick={() => onPreviewTemplate(tpl)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye size={14} />
                    <span>معاينة العرض السينمائي</span>
                  </button>

                  <button
                    onClick={() => onSelectTemplate(tpl)}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                  >
                    <Sparkles size={14} />
                    <span>تخصيص القالب الآن</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TEMPLATES GALLERY & FILTER SYSTEM */}
      <section id="templates-gallery" className="py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-400 tracking-wider">
                مكتبة التصاميم التفاعلية
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                اختر القالب وابدأ بالتخصيص فوراً
              </h2>
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم القالب أو نوع المناسبة..."
              className="w-full md:w-72 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedStyle('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-neutral-950 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full py-16 text-center text-neutral-500 text-sm">
                لم يتم العثور على قوالب مطابقة لبحثك. جرب اختيار قسم آخر.
              </div>
            ) : (
              filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-3xl bg-neutral-900/70 border border-neutral-800 hover:border-amber-500/40 transition-all p-6 flex flex-col justify-between space-y-4 shadow-xl group"
                >
                  <div className="space-y-3">
                    {/* Header tags: unboxed text with separators + visual identity swatch */}
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 shadow-xs inline-block"
                          style={{
                            background: `linear-gradient(135deg, ${tpl.themeColor}, ${tpl.secondaryColor})`,
                          }}
                          title={`الهوية اللونية: ${tpl.themeColor} / ${tpl.secondaryColor}`}
                        />
                        <span className="text-amber-400 font-semibold">
                          {tpl.category === 'wedding'
                            ? 'زواج'
                            : tpl.category === 'engagement'
                            ? 'خطوبة'
                            : tpl.category === 'henna'
                            ? 'ليلة حنة'
                            : tpl.category === 'graduation'
                            ? 'تخرج جامعي'
                            : tpl.category === 'birthday'
                            ? 'عيد ميلاد'
                            : tpl.category === 'art_exhibition'
                            ? 'افتتاح معرض فني'
                            : tpl.category === 'career_promotion'
                            ? 'حفل ترقية وظيفية'
                            : tpl.category === 'family_success'
                            ? 'دعوة نجاح عائلي'
                            : 'افتتاح مشروع'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{tpl.style}</span>
                      </div>

                      {tpl.badge && (
                        <span className="text-[11px] font-bold text-amber-300 font-mono">
                          {tpl.badge === 'popular'
                            ? 'الأكثر طلباً ⭐'
                            : tpl.badge === 'new'
                            ? 'جديد ✨'
                            : tpl.badge === 'movie'
                            ? 'سينمائي 🎬'
                            : 'VIP'}
                        </span>
                      )}
                    </div>

                    {/* Card Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {tpl.name}
                    </h3>
                    <div className="text-xs text-neutral-500 font-sans">
                      {tpl.nameEn}
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed font-cairo">
                      {tpl.description}
                    </p>

                    {/* Experience Highlights */}
                    <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                      <div className="text-amber-300/90 font-medium">نوع الحركة والتفاعل:</div>
                      <div>
                        {tpl.experienceType === 'envelope_reveal' && '✉️ ظرف ملكي يفتح بختم شمعي وبطاقة منزلقة'}
                        {tpl.experienceType === 'oriental_lantern' && '🪔 فانوس شرقي يضاء تفاعلياً مع نقش حناء'}
                        {tpl.experienceType === 'birthday_candles' && '🎂 كيكة تفاعلية مع إطفاء الشموع ومفرقعات'}
                        {tpl.experienceType === 'graduation_scroll' && '📜 شهادة تخرج وروب وشعار الكلية الأكاديمي'}
                        {tpl.experienceType === 'ribbon_cut' && '✂️ قص شريط ذهبي رسمي لافتتاح المشروع'}
                        {tpl.experienceType === 'cinematic_story' && '🎬 مشاهد فيلم رومانسي وتذكرة VIP'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800">
                    <button
                      onClick={() => onPreviewTemplate(tpl)}
                      className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye size={14} />
                      <span>معاينة التجربة</span>
                    </button>

                    <button
                      onClick={() => onSelectTemplate(tpl)}
                      className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                    >
                      <Sparkles size={14} />
                      <span>تخصيص القالب</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION (طريقة إنشاء الدعوة) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-semibold text-amber-400 tracking-wider">
              بساطة وسرعة وإبهار
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              كيف تصنع دعوتك في 3 خطوات بسيطة؟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 relative">
              <div className="text-3xl font-extrabold text-amber-400 font-mono">01.</div>
              <h3 className="text-base font-bold text-white">اختر القالب والتجربة التفاعلية</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                تصفح تشكيلة المناسبات (خطوبة، حنة، زواج، تخرج، ميلاد، افتتاح) واختر القالب الذي يناسب ذوقك ورؤيتك.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 relative">
              <div className="text-3xl font-extrabold text-amber-400 font-mono">02.</div>
              <h3 className="text-base font-bold text-white">خصص الأسماء والموقع بالمحرر المباشر</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                أدخل أسماء العروسين أو الخريج، موعد وتوقيت الحفل، رابط Google Maps للقاعة، واختر الموسيقى بضغطة زر.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 relative">
              <div className="text-3xl font-extrabold text-amber-400 font-mono">03.</div>
              <h3 className="text-base font-bold text-white">احصل على رابطك وشاركه وتابع الردود</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                شارك الرابط مباشرة عبر واتساب مع رسالة جاهزة، وتابع تأكيدات الحضور (RSVP) ورسائل المهنئين في لوحة تحكمك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING & TIERS (الأسعار والباقات) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-semibold text-amber-400 tracking-wider">
              أسعار تنافسية وشفافة
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              باقات تناسب جميع المناسبات
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              دفع مرة واحدة لكل دعوة أو اشتراكات مرنة لقاعات الأفراح والمصورين.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free / Preview Tier */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-neutral-400 font-semibold">التجربة المجانية</span>
                  <div className="text-3xl font-bold text-white mt-1">مجاناً</div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  تجربة تصميم الدعوة ومعاينتها بالمحرر المباشر بالكامل قبل اتخاذ قرار النشر.
                </p>
                <div className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>معاينة حية لجميع القوالب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>تعديل الأسماء والتواريخ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>توليد كود تجريبي</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (templates[0]) onSelectTemplate(templates[0]);
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors"
              >
                ابدأ التجربة المجانية
              </button>
            </div>

            {/* Premium Single Invite */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-amber-500/50 flex flex-col justify-between space-y-6 relative shadow-2xl">
              <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px]">
                الأكثر اختياراً للمناسبات
              </span>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-amber-400 font-semibold">باقة الدعوة الملكية الفاخرة</span>
                  <div className="text-3xl font-bold text-white mt-1">
                    $29 <span className="text-xs text-neutral-500 font-normal">/ للدعوة</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  دعوة إلكترونية كاملة مفتوحة لعدد غير محدود من الضيوف مع كامل الخصائص التفاعلية.
                </p>
                <div className="space-y-2 text-xs text-neutral-200 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    <span>رابط خاص فريد بدون إعلانات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    <span>نظام تأكيد الحضور (RSVP) حتى 500 ضيف</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    <span>تصدير قائمة الحضور إلى Excel / CSV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    <span>سجل التهاني والمباركات التفاعلي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    <span>رمز QR Code سريع + مسار خرائط دقيق</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (templates[0]) onSelectTemplate(templates[0]);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 text-xs font-bold shadow-lg hover:brightness-110 transition-all"
              >
                اختر هذه الباقة وابدأ
              </button>
            </div>

            {/* Studio / B2B Partner */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-neutral-400 font-semibold">اشتراك القاعات والمصورين</span>
                  <div className="text-3xl font-bold text-white mt-1">
                    $199 <span className="text-xs text-neutral-500 font-normal">/ شهرياً</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  حل متكامل لشركات تنظيم الحفلات واستوديوهات التصوير لإنشاء دعوات لجميع عملائهم.
                </p>
                <div className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400" />
                    <span>عدد غير محدود من الدعوات شهرياً</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400" />
                    <span>لوحة تحكم مركزية متعددة العملاء</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400" />
                    <span>إمكانية إضافة شعار القاعة أو الاستوديو</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  window.open('https://api.whatsapp.com/send?text=مرحبا، أود الاستفسار عن باقة الاستوديوهات وقاعات الأفراح في منصة مراسيم', '_blank');
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors"
              >
                تواصل معنا للاشتراك التجاري
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS (تقييمات وآراء العملاء) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-semibold text-amber-400 tracking-wider">
              تجارب حقيقية
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              ماذا يقول أصحاب المناسبات عن مراسيم؟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#d4af37" />
                ))}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-cairo">
                «دعوة زفافنا بالقالب الملكي المذهب كانت حديث جميع المدعوين! فتح الظرف بالختم الشمعي والموسيقى الهادئة خلت الكل يعيش أجواء الحفل قبل حتى ما يبدأ.»
              </p>
              <div className="pt-2 border-t border-neutral-800/80 text-xs">
                <div className="font-bold text-white">المهندس حيدر والآنسة ريم</div>
                <div className="text-neutral-500 text-[11px]">حفل زفاف - فندق بابل روتانا</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#d4af37" />
                ))}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-cairo">
                «قالب ليلة الحنة البغدادية بالفوانيس ونقوش الحناء كان تحفة فنية، ووفر علينا عناء تأكيد الحضور، عرفنا العدد المضبوط للقاعة من لوحة التحكم!»
              </p>
              <div className="pt-2 border-t border-neutral-800/80 text-xs">
                <div className="font-bold text-white">أم مصطفى الكعبي</div>
                <div className="text-neutral-500 text-[11px]">ليلة حنة - البصرة</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#d4af37" />
                ))}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-cairo">
                «دعوة تخرجي من كلية الطب البشري مع السماعة وقسم أبقراط كانت فخمة لأبعد حد. كل زملائي وأساتذتي أشادوا بالفكرة والابتكار.»
              </p>
              <div className="pt-2 border-t border-neutral-800/80 text-xs">
                <div className="font-bold text-white">د. ليث كمال</div>
                <div className="text-neutral-500 text-[11px]">تخرج كلية الطب - جامعة بغداد</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-400">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
            <span className="text-base font-bold text-white tracking-wider font-cairo">
              مراسيم | MARASEEM
            </span>
            <span className="text-neutral-500">
              المنصة العربية الرائدة للدعوات الإلكترونية التفاعلية الفاخرة © 2026
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenDashboard}
              className="hover:text-amber-300 transition-colors"
            >
              لوحة تحكم المستخدم
            </button>
            <span>·</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-amber-300 transition-colors"
            >
              بوابة الإدارة (Admin)
            </button>
            <span>·</span>
            <a
              href="https://api.whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              الدعم عبر واتساب
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
