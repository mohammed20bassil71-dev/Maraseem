import React, { useState } from 'react';
import {
  Handshake,
  Link2,
  Users,
  Wallet,
  TrendingUp,
  Plus,
  Copy,
  Check,
  Building,
  Camera,
  Sparkles,
  Flower2,
  PartyPopper,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { PartnerAccount, PartnerCategory } from '../../types/invitation';
import { useLanguage } from '../../i18n/LanguageContext';

interface PartnerPortalProps {
  partners: PartnerAccount[];
  onRegisterPartner: (partner: Omit<PartnerAccount, 'id' | 'orders' | 'totalReferrals' | 'activeOrders' | 'totalSalesIQD' | 'totalCommissionIQD' | 'status'>) => void;
  onAddPartnerOrder: (partnerId: string, clientName: string, eventTitle: string, packageName: string, amountIQD: number) => void;
}

export const PartnerPortal: React.FC<PartnerPortalProps> = ({
  partners,
  onRegisterPartner,
  onAddPartnerOrder,
}) => {
  const { tr } = useLanguage();

  const PARTNER_CATEGORIES: Array<{
    id: PartnerCategory;
    label: string;
    commission: number;
    icon: React.ReactNode;
  }> = [
    { id: 'wedding_hall', label: tr('قاعات الأعراس والمناسبات', 'Wedding & Event Halls'), commission: 25, icon: <Building size={16} /> },
    { id: 'photographer', label: tr('المصورين واستوديوهات التصوير', 'Photographers & Studios'), commission: 20, icon: <Camera size={16} /> },
    { id: 'event_planner', label: tr('منظمي المناسبات والأعراس', 'Wedding & Event Planners'), commission: 25, icon: <Sparkles size={16} /> },
    { id: 'flower_shop', label: tr('محلات الورود والكوشات', 'Florists & Stage Decor'), commission: 20, icon: <Flower2 size={16} /> },
    { id: 'event_company', label: tr('شركات تنظيم الحفلات والمؤتمرات', 'Event & Conference Agencies'), commission: 25, icon: <PartyPopper size={16} /> },
  ];

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    partners[0]?.id || 'prt-1'
  );
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regBusiness, setRegBusiness] = useState('');
  const [regCategory, setRegCategory] = useState<PartnerCategory>('wedding_hall');
  const [regCity, setRegCity] = useState('بغداد');
  const [regPhone, setRegPhone] = useState('');

  // Quick Order Referral Form
  const [clientName, setClientName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<'باقة VIP الملكية' | 'الباقة الاحترافية' | 'باقة الشركات'>('باقة VIP الملكية');

  const currentPartner =
    partners.find((p) => p.id === selectedPartnerId) || partners[0];

  const referralUrl = `${
    typeof window !== 'undefined' ? window.location.origin : 'https://maraseem.iq'
  }/?ref=${encodeURIComponent(currentPartner?.referralCode || 'PARTNER')}`;

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regBusiness.trim()) return;
    const catMeta = PARTNER_CATEGORIES.find((c) => c.id === regCategory);
    const code = `IQ-${regCategory.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    onRegisterPartner({
      name: regName.trim(),
      businessName: regBusiness.trim(),
      category: regCategory,
      city: regCity.trim(),
      phone: regPhone.trim() || '+9647700000000',
      referralCode: code,
      commissionRatePercent: catMeta?.commission || 20,
    });

    setRegName('');
    setRegBusiness('');
    setShowRegisterModal(false);
  };

  const handleCreateOrderReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !eventTitle.trim() || !currentPartner) return;
    const amount =
      selectedPkg === 'باقة الشركات'
        ? 120000
        : selectedPkg === 'باقة VIP الملكية'
        ? 95000
        : 55000;
    onAddPartnerOrder(currentPartner.id, clientName.trim(), eventTitle.trim(), selectedPkg, amount);
    setClientName('');
    setEventTitle('');
  };

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#566B49] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCE8CB]/65 border border-[#B9CCA0] text-[#566B49] text-xs font-bold">
              <Handshake size={14} className="text-[#91A77D]" />
              <span>{tr('برنامج شركاء النجاح في العراق', 'Iraq Success Partners Program')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#566B49]">
              {tr(
                'بوابة الشركاء: قاعات الأعراس، المصورين، منظمي الحفلات، ومحلات الورود',
                'Partner Portal: Wedding Halls, Photographers, Event Planners & Florists'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E8261] leading-relaxed">
              {tr(
                'احصل على حساب شريك معتمد ورابط إحالة خاص بك، وقدم لعملائك دعوات رقمية فاخرة بخصم حصري مع عمولة فورية تصل إلى ٢٥٪ عن كل طلب.',
                'Get a verified partner account and unique referral link. Offer your clients luxury digital invitations with an exclusive discount and earn up to 25% instant commission per order.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49] outline-none"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {tr('حساب الشريك:', 'Partner Account:')} {p.businessName} ({p.city})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowRegisterModal((v) => !v)}
              className="px-5 py-2.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
            >
              <Plus size={15} />
              <span>{tr('تسجيل شريك جديد', 'Register New Partner')}</span>
            </button>
          </div>
        </div>

        {/* Supported Partner Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PARTNER_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`p-4 rounded-2xl border transition-all ${
                currentPartner?.category === cat.id
                  ? 'bg-[#DCE8CB]/55 border-[#91A77D] shadow-xs'
                  : 'bg-[#FFFDF8] border-[#E9DDC9]'
              }`}
            >
              <div className="flex items-center justify-between text-[#566B49] mb-2">
                <span className="text-[#91A77D]">{cat.icon}</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49]">
                  {tr(`عمولة ${cat.commission}%`, `${cat.commission}% Comm.`)}
                </span>
              </div>
              <div className="text-xs font-bold text-[#566B49]">{cat.label}</div>
            </div>
          ))}
        </div>

        {/* New Partner Registration Form (Collapsible) */}
        {showRegisterModal && (
          <form
            onSubmit={handleRegisterSubmit}
            className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#B9CCA0] space-y-4 shadow-md"
          >
            <h3 className="text-base font-bold text-[#566B49]">
              {tr(
                'انضم إلى شبكة شركاء مراسيم في العراق واحصل على رابط الإحالة الفوري',
                'Join Maraseem Partner Network in Iraq and get your instant referral link'
              )}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder={tr('اسم المسؤول الثلاثي *', 'Contact Person Full Name *')}
                className="px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
              />
              <input
                type="text"
                required
                value={regBusiness}
                onChange={(e) => setRegBusiness(e.target.value)}
                placeholder={tr('اسم القاعة / الاستوديو / الشركة *', 'Hall / Studio / Agency Name *')}
                className="px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
              />
              <select
                value={regCategory}
                onChange={(e) => setRegCategory(e.target.value as PartnerCategory)}
                className="px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
              >
                {PARTNER_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={regCity}
                onChange={(e) => setRegCity(e.target.value)}
                placeholder={tr('المحافظة / المنطقة', 'City / Area')}
                className="px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer transition-all"
              >
                {tr('تفعيل حساب الشريك فوراً', 'Activate Partner Account')}
              </button>
            </div>
          </form>
        )}

        {/* Active Partner Dashboard */}
        {currentPartner && (
          <div className="space-y-6">
            {/* Referral Link & Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Referral Link Box */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col justify-between space-y-4 shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#91A77D]">
                    {tr('حساب الشريك النشط', 'Active Partner Account')} • {currentPartner.city}
                  </span>
                  <h2 className="text-xl font-bold text-[#566B49]">{currentPartner.businessName}</h2>
                  <p className="text-xs text-[#6E8261]">
                    {tr('بإدارة:', 'Managed by:')} {currentPartner.name} | {tr('نسبة العمولة المعتمدة:', 'Approved Commission Rate:')}{' '}
                    <strong className="text-[#566B49] font-mono">
                      {currentPartner.commissionRatePercent}%
                    </strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DCE8CB] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#566B49] font-bold flex items-center gap-1.5">
                      <Link2 size={14} className="text-[#91A77D]" /> {tr('رابط الإحالة الخاص بك:', 'Your Referral Link:')}
                    </span>
                    <span className="font-mono text-[#566B49] text-[11px] font-bold">
                      {tr('كود:', 'Code:')} {currentPartner.referralCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC9] text-[11px] font-mono text-[#566B49] truncate dir-ltr text-left">
                      {referralUrl}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyReferralLink}
                      className="px-3 py-1.5 rounded-lg bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-all"
                    >
                      {copiedRef ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedRef ? tr('تم النسخ ✓', 'Copied ✓') : tr('نسخ الرابط', 'Copy Link')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Financial & Referral Metric Cards */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#6E8261]">
                    <span>{tr('العملاء المحالون', 'Referred Clients')}</span>
                    <Users size={16} className="text-[#91A77D]" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#566B49] tabular-nums my-2">
                    {currentPartner.totalReferrals}
                  </div>
                  <div className="text-[11px] text-[#91A77D]">{tr('عريس وعروس وصاحب مناسبة', 'Couples & event hosts')}</div>
                </div>

                <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#6E8261]">
                    <span>{tr('الطلبات النشطة', 'Active Orders')}</span>
                    <Clock size={16} className="text-[#91A77D]" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#566B49] tabular-nums my-2">
                    {currentPartner.activeOrders}
                  </div>
                  <div className="text-[11px] text-[#91A77D]">{tr('مناسبات قادمة قيد التجهيز', 'Upcoming active events')}</div>
                </div>

                <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#6E8261]">
                    <span>{tr('إجمالي المبيعات', 'Total Sales')}</span>
                    <TrendingUp size={16} className="text-[#566B49]" />
                  </div>
                  <div className="text-xl font-bold font-mono text-[#566B49] tabular-nums my-2">
                    {currentPartner.totalSalesIQD.toLocaleString('en-US')}
                  </div>
                  <div className="text-[11px] text-[#91A77D]">{tr('دينار عراقي', 'Iraqi Dinar (IQD)')}</div>
                </div>

                <div className="p-5 rounded-3xl bg-[#DCE8CB]/65 border border-[#B9CCA0] flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#566B49] font-bold">
                    <span>{tr('أرباح وعمولات الشريك', 'Partner Earnings')}</span>
                    <Wallet size={16} className="text-[#566B49]" />
                  </div>
                  <div className="text-xl font-bold font-mono text-[#566B49] tabular-nums my-2">
                    {currentPartner.totalCommissionIQD.toLocaleString('en-US')}
                  </div>
                  <div className="text-[11px] text-[#6E8261]">{tr('دينار عراقي صافي', 'Net IQD Commission')}</div>
                </div>
              </div>
            </div>

            {/* Add New Client Referral Order + Orders Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleCreateOrderReferral}
                className="lg:col-span-4 p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs"
              >
                <h3 className="text-sm font-bold text-[#566B49] flex items-center gap-2">
                  <Plus size={16} className="text-[#91A77D]" />
                  <span>{tr('تسجيل طلب عميل جديد (واحتساب العمولة فوراً)', 'Register New Client Order (Instant Commission)')}</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#6E8261] mb-1">
                      {tr('اسم العميل (العروسين):', 'Client Name (Couple/Host):')}
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={tr('مثال: أحمد العبيدي و نور', 'e.g., Ahmed Al-Obaidi & Noor')}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#6E8261] mb-1">
                      {tr('عنوان المناسبة:', 'Event Title:')}
                    </label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder={tr('مثال: حفل زفاف قاعة النخيل', 'e.g., Al-Nakheel Hall Wedding')}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#6E8261] mb-1">
                      {tr('الباقة المختارة:', 'Selected Package:')}
                    </label>
                    <select
                      value={selectedPkg}
                      onChange={(e) => setSelectedPkg(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49]"
                    >
                      <option value="باقة VIP الملكية">{tr('باقة التميز الملكية (95,000 د.ع)', 'Royal VIP Package (95,000 IQD)')}</option>
                      <option value="الباقة الاحترافية">{tr('الباقة الاحترافية (55,000 د.ع)', 'Professional Package (55,000 IQD)')}</option>
                      <option value="باقة الشركات">{tr('باقة الشركات (120,000 د.ع)', 'Corporate Package (120,000 IQD)')}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer shadow-xs transition-all"
                  >
                    {tr(
                      `إضافة الطلب واحتساب العمولة (${currentPartner.commissionRatePercent}%)`,
                      `Add Order & Calculate Commission (${currentPartner.commissionRatePercent}%)`
                    )}
                  </button>
                </div>
              </form>

              {/* Partner Orders Table */}
              <div className="lg:col-span-8 p-5 rounded-3xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#566B49]">
                  {tr('سجل طلبات العملاء والعمولات المستحقة', 'Client Orders & Earned Commissions')} ({currentPartner.orders.length})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead className="bg-[#F8F6EF] text-[#6E8261] border-b border-[#E9DDC9]">
                      <tr>
                        <th className="py-3 px-4">{tr('اسم العميل', 'Client Name')}</th>
                        <th className="py-3 px-4">{tr('المناسبة', 'Event')}</th>
                        <th className="py-3 px-4">{tr('الباقة', 'Package')}</th>
                        <th className="py-3 px-4">{tr('قيمة الطلب', 'Order Amount')}</th>
                        <th className="py-3 px-4">{tr('عمولة الشريك', 'Commission')}</th>
                        <th className="py-3 px-4">{tr('الحالة', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9DDC9]">
                      {currentPartner.orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#91A77D]">
                            {tr(
                              'لا توجد طلبات مسجلة بعد لهذا الشريك. يمكنك إضافة أول طلب من النموذج المجاور.',
                              'No orders recorded yet for this partner. Add your first order using the adjacent form.'
                            )}
                          </td>
                        </tr>
                      ) : (
                        currentPartner.orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#F8F6EF]">
                            <td className="py-3 px-4 font-bold text-[#566B49]">{ord.clientName}</td>
                            <td className="py-3 px-4 text-[#6E8261]">{ord.eventTitle}</td>
                            <td className="py-3 px-4 text-[#566B49] font-semibold">
                              {ord.packageName}
                            </td>
                            <td className="py-3 px-4 font-mono text-[#566B49]">
                              {ord.orderAmountIQD.toLocaleString('en-US')} {tr('د.ع', 'IQD')}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#566B49]">
                              +{ord.commissionAmountIQD.toLocaleString('en-US')} {tr('د.ع', 'IQD')}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] text-[10px] font-bold">
                                <CheckCircle2 size={11} /> {tr('مكتمل', 'Completed')}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
