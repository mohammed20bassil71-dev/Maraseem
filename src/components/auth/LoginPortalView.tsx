import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Phone,
  User,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Crown,
  Users,
  QrCode,
  Handshake,
  LogOut,
  Globe,
} from 'lucide-react';
import { PlatformUserRole } from '../../types/invitation';
import { useLanguage } from '../../i18n/LanguageContext';
import { getSavedPreferredDomain } from '../../utils/seoAndRouting';

export interface MaraseemAuthUser {
  id: string;
  fullName: string;
  emailOrPhone: string;
  role: PlatformUserRole;
  loggedInAt: string;
}

interface LoginPortalViewProps {
  currentUser: MaraseemAuthUser | null;
  onLoginSuccess: (user: MaraseemAuthUser) => void;
  onLogout: () => void;
  onNavigateToView: (view: any) => void;
}

export const LoginPortalView: React.FC<LoginPortalViewProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onNavigateToView,
}) => {
  const { lang, tr } = useLanguage();
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('محمد باسل التميمي');
  const [emailOrPhone, setEmailOrPhone] = useState('mohammed@maraseem.com');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<PlatformUserRole>('host');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const preferredDomain = getSavedPreferredDomain();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: MaraseemAuthUser = {
      id: `usr-${Date.now()}`,
      fullName:
        authTab === 'register'
          ? fullName.trim() || tr('مستخدم مراسيم', 'Maraseem Member')
          : fullName.trim() || tr('محمد باسل', 'Mohammed Bassil'),
      emailOrPhone: emailOrPhone.trim() || 'info@maraseem.com',
      role: selectedRole,
      loggedInAt: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    onLoginSuccess(user);
    setAuthMessage(
      tr(
        'تم تسجيل الدخول بنجاح إلى حسابك في منصة مراسيم | MARASEEM ✨',
        'Successfully signed in to your MARASEEM account ✨'
      )
    );
  };

  const roleCards: Array<{
    role: PlatformUserRole;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    targetView: string;
    icon: React.ReactNode;
  }> = [
    {
      role: 'host',
      titleAr: 'صاحب المناسبة (العريس / العائلة / الشركة)',
      titleEn: 'Event Host (Couple / Family / Company)',
      descAr: 'إنشاء الدعوات، تقسيم العوائل العراقية، تحديد المقاعد، ومتابعة المعتذرين والمؤكدين.',
      descEn: 'Create invitations, organize family groups, set seat limits, and track RSVPs.',
      targetView: 'dashboard',
      icon: <Users size={18} className="text-[#566B49]" />,
    },
    {
      role: 'partner',
      titleAr: 'شريك معتمد (مطبعة / منظم حفلات / قاعة)',
      titleEn: 'Certified Partner (Planner / Venue / Studio)',
      descAr: 'إنشاء دعوات للزبائن، كود خصم خاص، ومتابعة الأرباح والعمولات.',
      descEn: 'Create client invitations, manage promo codes, and track partner commissions.',
      targetView: 'partners',
      icon: <Handshake size={18} className="text-[#566B49]" />,
    },
    {
      role: 'receptionist',
      titleAr: 'موظف الاستقبال والتنظيم (يوم الحفل)',
      titleEn: 'Event Receptionist (Door Check-in)',
      descAr: 'فحص رموز QR عند باب القاعة ومعرفة عدد المقاعد المسموح ورقم الطاولة فوراً.',
      descEn: 'Scan guest QR codes at the venue entrance and verify seat counts & table numbers.',
      targetView: 'receptionist',
      icon: <QrCode size={18} className="text-[#566B49]" />,
    },
    {
      role: 'admin',
      titleAr: 'إدارة منصة مراسيم (Admin)',
      titleEn: 'MARASEEM Platform Admin',
      descAr: 'إدارة القوالب، الباقات، النطاق الخاص www.maraseem.com، والإحصائيات الشاملة.',
      descEn: 'Manage templates, packages, custom domain www.maraseem.com, and analytics.',
      targetView: 'admin',
      icon: <Crown size={18} className="text-[#566B49]" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* URL Breadcrumb Banner */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold flex items-center gap-1.5">
            <Lock size={12} />
            <span dir="ltr">https://{preferredDomain}/login</span>
          </span>
          <span className="text-[#6E8261]">
            {tr(
              'بوابة الدخول الموحدة والمؤمّنة بشهادة SSL/HTTPS',
              'Unified Portal Secured with SSL/HTTPS'
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToView('domain_hub')}
          className="text-xs font-bold text-[#566B49] hover:text-[#91A77D] flex items-center gap-1.5 cursor-pointer"
        >
          <Globe size={14} />
          <span>{tr('إعدادات النطاق www.maraseem.com', 'Domain Settings')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] shadow-[0_12px_35px_rgba(86,107,73,0.08)] space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE8CB]/65 text-[#566B49] text-xs font-bold">
              <Sparkles size={13} />
              <span>{tr('حسابك الرسمي في مراسيم | MARASEEM', 'Official MARASEEM Account')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#566B49]">
              {currentUser
                ? tr(`أهلاً بك، ${currentUser.fullName}`, `Welcome back, ${currentUser.fullName}`)
                : authTab === 'login'
                ? tr('تسجيل الدخول إلى منصة مراسيم', 'Sign In to MARASEEM')
                : tr('إنشاء حساب جديد في مراسيم', 'Create a New MARASEEM Account')}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E8261]">
              {tr(
                'إدارة كافة دعوات الزفاف، الخطوبة، تهنئة عيد الميلاد التفاعلية، ودعوات الشركات من حساب واحد.',
                'Manage all your wedding invitations, interactive birthday stories, and business events in one place.'
              )}
            </p>
          </div>

          {authMessage && (
            <div className="p-3.5 rounded-2xl bg-[#DCE8CB] border border-[#91A77D] text-[#566B49] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{authMessage}</span>
            </div>
          )}

          {currentUser ? (
            <div className="p-5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#B9CCA0] text-[#566B49] flex items-center justify-center font-bold text-lg">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#566B49]">{currentUser.fullName}</div>
                    <div className="text-xs text-[#6E8261] font-mono">{currentUser.emailOrPhone}</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#DCE8CB] text-[#566B49] text-xs font-bold">
                  {tr('متصل الآن ✓', 'Active Session ✓')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToView('dashboard')}
                  className="py-3 px-4 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Users size={15} />
                  <span>{tr('الذهاب إلى لوحة إدارة المناسبات', 'Go to Event Dashboard')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToView('birthday_experience')}
                  className="py-3 px-4 rounded-xl bg-[#FFFDF8] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>{tr('قسم تهنئة عيد الميلاد', 'Birthday Experience')}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#E9DDC9] flex justify-end">
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl text-rose-700 hover:bg-rose-500/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>{tr('تسجيل الخروج', 'Sign Out')}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Login / Register Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9]">
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authTab === 'login'
                      ? 'bg-[#B9CCA0] text-[#566B49] shadow-xs'
                      : 'text-[#6E8261] hover:text-[#566B49]'
                  }`}
                >
                  {tr('تسجيل الدخول', 'Sign In')}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authTab === 'register'
                      ? 'bg-[#B9CCA0] text-[#566B49] shadow-xs'
                      : 'text-[#6E8261] hover:text-[#566B49]'
                  }`}
                >
                  {tr('إنشاء حساب جديد', 'Create Account')}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-[#566B49] mb-1.5">
                      {tr('الاسم الكامل أو اسم العائلة / الشركة:', 'Full Name or Organization:')}
                    </label>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute top-1/2 -translate-y-1/2 right-3.5 text-[#91A77D]"
                      />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={tr('مثال: محمد باسل التميمي', 'e.g., Mohammed Bassil')}
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49] outline-none focus:border-[#566B49]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#566B49] mb-1.5">
                    {tr(
                      'البريد الإلكتروني أو رقم الهاتف العراقي (+964):',
                      'Email Address or Phone Number (+964):'
                    )}
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute top-1/2 -translate-y-1/2 right-3.5 text-[#91A77D]"
                    />
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="name@maraseem.com / 0770 000 0000"
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49] outline-none focus:border-[#566B49]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#566B49] mb-1.5">
                    {tr('كلمة المرور:', 'Password:')}
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute top-1/2 -translate-y-1/2 right-3.5 text-[#91A77D]"
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49] outline-none focus:border-[#566B49]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#566B49] mb-1.5">
                    {tr('نوع الحساب والصلاحية:', 'Account Role:')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {roleCards.map((rc) => (
                      <button
                        key={rc.role}
                        type="button"
                        onClick={() => setSelectedRole(rc.role)}
                        className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-2 ${
                          selectedRole === rc.role
                            ? 'bg-[#DCE8CB] border-[#566B49] text-[#566B49] font-bold'
                            : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#6E8261]'
                        }`}
                      >
                        {rc.icon}
                        <span className="text-[11px] leading-tight">
                          {lang === 'ar' ? rc.titleAr.split(' (')[0] : rc.titleEn.split(' (')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] border border-[#91A77D] font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={17} />
                  <span>
                    {authTab === 'login'
                      ? tr('دخول آمن إلى حسابي في مراسيم', 'Secure Sign In to MARASEEM')
                      : tr('إنشاء الحساب والبدء فوراً', 'Create Account & Start Now')}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Right Column: Quick Role Access & Organized Routes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-[#566B49]">
              {tr('بوابات الدخول السريع حسب الصلاحية:', 'Quick Access by Role:')}
            </h2>
            <div className="space-y-2.5">
              {roleCards.map((rc) => (
                <div
                  key={rc.role}
                  className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#566B49] flex items-center gap-1.5">
                      {rc.icon}
                      <span>{lang === 'ar' ? rc.titleAr : rc.titleEn}</span>
                    </div>
                    <p className="text-[11px] text-[#6E8261]">
                      {lang === 'ar' ? rc.descAr : rc.descEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateToView(rc.targetView)}
                    className="px-3 py-1.5 rounded-xl bg-[#DCE8CB] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-[11px] font-bold shrink-0 cursor-pointer transition-all"
                  >
                    {tr('فتح', 'Open')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#DCE8CB]/45 border border-[#B9CCA0] space-y-2 text-xs text-[#566B49]">
            <div className="font-bold flex items-center gap-1.5">
              <Phone size={14} />
              <span>{tr('دعم العملاء وتوثيق حسابات الشركات:', 'Support & Corporate Verification:')}</span>
            </div>
            <p className="text-[11px] text-[#6E8261] leading-relaxed">
              {tr(
                'جميع الحسابات والروابط على نطاق مراسيم محمية بتشفير HTTPS/SSL كامل مع حفظ فوري لكافة التعديلات دون تغيير روابط الدعوات المنشورة.',
                'All accounts and links on MARASEEM are protected with full HTTPS/SSL encryption and instant cloud-ready updates without breaking shared links.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
