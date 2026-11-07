import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Search,
  CheckCircle2,
  UserCheck,
  Users,
  ShieldCheck,
  ScanLine,
  Sparkles,
  Table2,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { InvitationData, InvitedGuest } from '../../types/invitation';
import { IRAQI_FAMILY_GROUPS_META } from '../../data/platformData';
import { useLanguage } from '../../i18n/LanguageContext';

interface ReceptionistScannerViewProps {
  invitations: InvitationData[];
  invitedGuests: InvitedGuest[];
  onCheckInGuest: (guestId: string, checkedIn: boolean) => void;
  onAssignGuestTable?: (guestId: string, tableNumber: number | undefined) => void;
  onExitReceptionistMode?: () => void;
  isStandaloneReceptionist?: boolean;
}

const GROUP_LABELS_EN: Record<string, string> = {
  groom_family: 'Groom Family',
  bride_family: 'Bride Family',
  relatives: 'Relatives & Extended Family',
  friends: 'Close Friends',
  colleagues: 'Work Colleagues',
  vip: 'VIP Guests',
};

export const ReceptionistScannerView: React.FC<ReceptionistScannerViewProps> = ({
  invitations,
  invitedGuests,
  onCheckInGuest,
  onAssignGuestTable,
  onExitReceptionistMode,
  isStandaloneReceptionist = false,
}) => {
  const { lang, tr } = useLanguage();
  const [selectedInviteId, setSelectedInviteId] = useState<string>(
    invitations[0]?.id || 'inv-1'
  );
  const [qrInput, setQrInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [scannedGuest, setScannedGuest] = useState<InvitedGuest | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanningAnim, setIsScanningAnim] = useState(false);
  const [copiedStaffLink, setCopiedStaffLink] = useState(false);

  const currentInvite =
    invitations.find((i) => i.id === selectedInviteId) || invitations[0];

  const eventGuests = invitedGuests.filter((g) => g.invitationId === currentInvite?.id);

  // Live reception stats
  const totalInvitees = eventGuests.length;
  const totalConfirmedGuests = eventGuests.filter((g) => g.rsvpStatus === 'attending').length;
  const totalReservedSeats = eventGuests
    .filter((g) => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + (g.confirmedSeats || g.allocatedSeats), 0);
  const totalCheckedInFamilies = eventGuests.filter((g) => g.checkedIn).length;
  const totalActualAttendees = eventGuests
    .filter((g) => g.checkedIn)
    .reduce((sum, g) => sum + (g.confirmedSeats || g.allocatedSeats), 0);

  const getGroupName = (groupId: string) => {
    if (lang === 'en') return GROUP_LABELS_EN[groupId] || 'Honored Guests';
    return IRAQI_FAMILY_GROUPS_META.find((m) => m.id === groupId)?.label || 'ضيوف كرام';
  };

  const handleVerifyQrCode = (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    const targetCode = (codeOverride ?? qrInput).trim();
    if (!targetCode) return;

    setIsScanningAnim(true);
    setScanError(null);

    setTimeout(() => {
      setIsScanningAnim(false);
      const found = eventGuests.find(
        (g) =>
          g.qrCodeToken.toLowerCase() === targetCode.toLowerCase() ||
          targetCode.toLowerCase().includes(g.qrCodeToken.toLowerCase()) ||
          g.name.includes(targetCode)
      );

      if (found) {
        setScannedGuest(found);
        setScanError(null);
      } else {
        setScannedGuest(null);
        setScanError(
          tr(
            'لم يتم العثور على بطاقة دعوة مطابقة لهذا الرمز في قائمة الضيوف.',
            'No matching invitation pass found for this code in the guest list.'
          )
        );
      }
    }, 350);
  };

  const handleCopyReceptionistLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const url = `${origin}${pathname}?mode=receptionist&event=${encodeURIComponent(
      currentInvite?.id || 'inv-1'
    )}`;
    navigator.clipboard.writeText(url);
    setCopiedStaffLink(true);
    setTimeout(() => setCopiedStaffLink(false), 2500);
  };

  const filteredGuests = eventGuests.filter((g) => {
    if (filterStatus === 'checked_in' && !g.checkedIn) return false;
    if (filterStatus === 'not_checked_in' && g.checkedIn) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        (g.familyTitle || '').toLowerCase().includes(q) ||
        g.qrCodeToken.toLowerCase().includes(q) ||
        g.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#566B49] py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Security Header (Isolated Receptionist Mode) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#DCE8CB] border border-[#B9CCA0] flex items-center justify-center text-[#566B49]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-[#566B49]">
                  {tr('بوابة موظف الاستقبال ومسح رمز الدخول', 'Receptionist QR Check-In Portal')}
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] border border-[#B9CCA0] font-bold">
                  {tr('صلاحية استقبال فقط 🔒', 'Reception Access Only 🔒')}
                </span>
              </div>
              <p className="text-xs text-[#6E8261]">
                {tr(
                  'واجهة مخصصة لهاتف موظف الاستقبال لتسجيل دخول الضيوف ومسح الرمز دون الوصول لإعدادات صاحب المناسبة',
                  'Dedicated mobile interface for reception staff to scan QR passes and check in guests without host account access'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReceptionistLink}
              className="px-3 py-2 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {copiedStaffLink ? <Check size={14} /> : <Copy size={14} />}
              <span>
                {copiedStaffLink
                  ? tr('تم نسخ رابط الموظف ✓', 'Staff Link Copied ✓')
                  : tr('نسخ رابط هاتف الاستقبال', 'Copy Staff Phone Link')}
              </span>
            </button>

            {onExitReceptionistMode && !isStandaloneReceptionist && (
              <button
                type="button"
                onClick={onExitReceptionistMode}
                className="px-3 py-2 rounded-xl bg-[#F8F6EF] hover:bg-[#DCE8CB]/60 border border-[#E9DDC9] text-[#566B49] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight size={14} className={lang === 'en' ? 'rotate-180' : ''} />
                <span>{tr('العودة للمنصة', 'Back to Platform')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Event Selector & Live Gate Telemetry */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6E8261] font-bold">
              {tr('المناسبة الحالية:', 'Current Event:')}
            </span>
            <select
              value={selectedInviteId}
              onChange={(e) => {
                setSelectedInviteId(e.target.value);
                setScannedGuest(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs font-bold text-[#566B49] outline-none"
            >
              {invitations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.title} ({inv.eventDate})
                </option>
              ))}
            </select>
          </div>

          {currentInvite && (
            <div className="flex items-center gap-4 text-xs text-[#566B49] font-semibold">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-[#91A77D]" /> {currentInvite.venueName}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar size={13} className="text-[#91A77D]" /> {currentInvite.eventDate}
              </span>
            </div>
          )}
        </div>

        {/* Live Gate Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] text-center space-y-1 shadow-xs">
            <div className="text-[11px] text-[#6E8261]">{tr('إجمالي بطاقات الدعوة', 'Total Invitation Passes')}</div>
            <div className="text-2xl font-bold font-mono text-[#566B49] tabular-nums">
              {totalInvitees}
            </div>
            <div className="text-[10px] text-[#91A77D]">
              {tr('مؤكد منها:', 'Confirmed:')} {totalConfirmedGuests}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] text-center space-y-1 shadow-xs">
            <div className="text-[11px] text-[#6E8261]">{tr('المقاعد المحجوزة', 'Reserved Seats')}</div>
            <div className="text-2xl font-bold font-mono text-[#566B49] tabular-nums">
              {totalReservedSeats}
            </div>
            <div className="text-[10px] text-[#91A77D]">{tr('مقعد مخصص ومؤكد', 'Allocated & confirmed')}</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#B9CCA0] text-center space-y-1 shadow-xs">
            <div className="text-[11px] text-[#566B49] font-bold">
              {tr('العوائل الحاضرة فعلياً', 'Checked-In Families')}
            </div>
            <div className="text-2xl font-bold font-mono text-[#566B49] tabular-nums">
              {totalCheckedInFamilies} / {totalConfirmedGuests}
            </div>
            <div className="text-[10px] text-[#91A77D]">{tr('تم مسح الرمز عند الباب', 'Scanned at entrance')}</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#DCE8CB]/65 border border-[#B9CCA0] text-center space-y-1 shadow-xs">
            <div className="text-[11px] text-[#566B49] font-bold">
              {tr('إجمالي الحاضرين فعلياً', 'Total Inside Hall')}
            </div>
            <div className="text-2xl font-bold font-mono text-[#566B49] tabular-nums">
              {totalActualAttendees}
            </div>
            <div className="text-[10px] text-[#6E8261]">{tr('شخص داخل القاعة الآن', 'Guests currently inside')}</div>
          </div>
        </div>

        {/* Interactive QR Scanner & Verification Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-5 p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#566B49] flex items-center gap-2">
                <ScanLine size={18} className="text-[#91A77D]" />
                <span>{tr('ماسح رمز الدخول السريع', 'Fast QR Pass Scanner')}</span>
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                {tr('جاهز للمسح', 'Ready')}
              </span>
            </div>

            {/* Simulated Camera Viewport */}
            <div className="relative aspect-4/3 rounded-2xl bg-[#F8F6EF] border-2 border-dashed border-[#B9CCA0] flex flex-col items-center justify-center p-4 overflow-hidden">
              <motion.div
                animate={{ y: [-55, 55, -55] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-[#566B49] to-transparent shadow-[0_0_12px_#91A77D]"
              />
              <QrCode size={48} className="text-[#91A77D] my-2" />
              <p className="text-[11px] text-[#6E8261] text-center">
                {tr(
                  'وجّه كاميرا الهاتف نحو باركود الضيف أو أدخل رقم البطاقة أدناه للتحقق الفوري',
                  'Point phone camera at the guest QR pass or enter the pass code below for instant verification'
                )}
              </p>

              {/* Quick Demo Scan Chips */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                {eventGuests.slice(0, 3).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setQrInput(g.qrCodeToken);
                      handleVerifyQrCode(undefined, g.qrCodeToken);
                    }}
                    className="px-2 py-1 rounded-lg bg-[#DCE8CB]/65 hover:bg-[#B9CCA0] border border-[#B9CCA0] text-[10px] text-[#566B49] font-mono cursor-pointer transition-all"
                  >
                    {tr('تجربة مسح:', 'Test Scan:')} {g.qrCodeToken}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleVerifyQrCode} className="flex gap-2">
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder={tr('أدخل رمز البطاقة (مثال: MRSM-INV1-G103)...', 'Enter QR code (e.g., MRSM-INV1-G103)...')}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] font-mono outline-none focus:border-[#566B49]"
              />
              <button
                type="submit"
                disabled={isScanningAnim}
                className="px-4 py-2.5 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer transition-all shrink-0"
              >
                {tr('تحقق ومسح', 'Verify & Scan')}
              </button>
            </form>
          </div>

          {/* Scanned Guest Result Card */}
          <div className="md:col-span-7 p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col justify-center shadow-xs">
            <AnimatePresence mode="wait">
              {scanError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2"
                >
                  <AlertCircle size={36} className="text-rose-600 mx-auto" />
                  <h3 className="text-base font-bold text-rose-800">
                    {tr('بطاقة غير مسجلة', 'Unregistered Pass')}
                  </h3>
                  <p className="text-xs text-rose-700">{scanError}</p>
                </motion.div>
              ) : scannedGuest ? (
                <motion.div
                  key={scannedGuest.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E9DDC9]">
                    <div>
                      <span className="inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] border border-[#B9CCA0] mb-1">
                        {scannedGuest.qrCodeToken}
                      </span>
                      <h3 className="text-xl font-bold text-[#566B49]">
                        {scannedGuest.familyTitle || scannedGuest.name}
                      </h3>
                      <p className="text-xs text-[#6E8261]">
                        {tr('المجموعة:', 'Group:')}{' '}
                        <strong className="text-[#566B49]">
                          {getGroupName(scannedGuest.group)}
                        </strong>
                      </p>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        scannedGuest.checkedIn
                          ? 'bg-[#DCE8CB] text-[#566B49] border border-[#91A77D]'
                          : 'bg-[#F8F6EF] text-[#6E8261] border border-[#E9DDC9]'
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      <span>
                        {scannedGuest.checkedIn
                          ? `${tr('تم الدخول', 'Checked In')} (${scannedGuest.checkedInAt || tr('الآن', 'Now')})`
                          : tr('بانتظار تسجيل الدخول', 'Awaiting Check-In')}
                      </span>
                    </div>
                  </div>

                  {/* Seat & Table Details */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-center">
                      <div className="text-[11px] text-[#6E8261]">{tr('المقاعد المخصصة', 'Allocated Seats')}</div>
                      <div className="text-lg font-bold font-mono text-[#566B49]">
                        {scannedGuest.allocatedSeats} {tr('مقاعد', 'seats')}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-center">
                      <div className="text-[11px] text-[#6E8261]">{tr('المؤكد حضورهم', 'Confirmed')}</div>
                      <div className="text-lg font-bold font-mono text-[#566B49]">
                        {scannedGuest.confirmedSeats || scannedGuest.allocatedSeats} {tr('أشخاص', 'guests')}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#DCE8CB]/50 border border-[#B9CCA0] text-center">
                      <div className="text-[11px] text-[#566B49] font-bold">{tr('رقم الطاولة', 'Table Number')}</div>
                      <div className="text-lg font-bold font-mono text-[#566B49]">
                        {scannedGuest.tableNumber
                          ? `${tr('طاولة', 'Table')} #${scannedGuest.tableNumber}`
                          : tr('غير محدد', 'Unassigned')}
                      </div>
                    </div>
                  </div>

                  {/* Companion Names List */}
                  {scannedGuest.companionNames.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-1.5">
                      <div className="text-[11px] font-bold text-[#566B49]">
                        {tr('قائمة الأفراد المسجلين ضمن البطاقة:', 'Registered Companions on Pass:')}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {scannedGuest.companionNames.map((cName, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[#DCE8CB]/60 text-xs text-[#566B49] font-semibold"
                          >
                            {idx + 1}. {cName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirm Check-In Action Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextCheckIn = !scannedGuest.checkedIn;
                        onCheckInGuest(scannedGuest.id, nextCheckIn);
                        setScannedGuest({
                          ...scannedGuest,
                          checkedIn: nextCheckIn,
                          checkedInAt: nextCheckIn
                            ? new Date().toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : undefined,
                        });
                      }}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                        scannedGuest.checkedIn
                          ? 'bg-[#F8F6EF] hover:bg-[#E9DDC9] text-[#566B49] border border-[#E9DDC9]'
                          : 'bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8]'
                      }`}
                    >
                      <UserCheck size={17} />
                      <span>
                        {scannedGuest.checkedIn
                          ? tr('إلغاء تسجيل الدخول', 'Undo Check-In')
                          : tr('تأكيد دخول الضيف واستلام المقعد الآن ✓', 'Confirm Guest Entry & Seat Assignment ✓')}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8 space-y-2 text-[#6E8261]">
                  <Sparkles size={32} className="text-[#91A77D] mx-auto opacity-80" />
                  <h3 className="text-sm font-bold text-[#566B49]">
                    {tr(
                      'امسح باركود الضيف أو اختر اسماً من القائمة أدناه',
                      'Scan guest QR pass or select a name from the list below'
                    )}
                  </h3>
                  <p className="text-xs max-w-sm mx-auto">
                    {tr(
                      'ستظهر هنا فوراً بيانات الضيف أو العائلة، عدد المقاعد المسموح بها، أسماء المرافقين، ورقم الطاولة المخصصة لهم.',
                      'Guest or family details, allowed seat count, companion names, and assigned table number will appear here immediately.'
                    )}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Full Searchable Guest Check-In List */}
        <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#566B49] flex items-center gap-2">
              <Users size={17} className="text-[#91A77D]" />
              <span>
                {tr('قائمة الضيوف وتسجيل الدخول المباشر', 'Guest List & Live Check-In')} ({filteredGuests.length})
              </span>
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F8F6EF] p-1 rounded-xl border border-[#E9DDC9] text-xs">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-[#B9CCA0] text-[#566B49] font-bold'
                      : 'text-[#6E8261]'
                  }`}
                >
                  {tr('الكل', 'All')} ({eventGuests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('checked_in')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterStatus === 'checked_in'
                      ? 'bg-[#DCE8CB] text-[#566B49] font-bold'
                      : 'text-[#6E8261]'
                  }`}
                >
                  {tr('حاضر فعلياً', 'Checked In')} ({totalCheckedInFamilies})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('not_checked_in')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterStatus === 'not_checked_in'
                      ? 'bg-[#E9DDC9] text-[#566B49] font-bold'
                      : 'text-[#6E8261]'
                  }`}
                >
                  {tr('لم يصل بعد', 'Not Arrived')} ({eventGuests.length - totalCheckedInFamilies})
                </button>
              </div>

              <div className="relative">
                <Search
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#91A77D]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tr('ابحث باسم الضيف أو العائلة...', 'Search guest or family...')}
                  className="pr-9 pl-3 py-1.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] text-xs text-[#566B49] outline-none focus:border-[#566B49]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#F8F6EF] text-[#6E8261] border-b border-[#E9DDC9]">
                <tr>
                  <th className="py-3 px-4">{tr('اسم الضيف / العائلة', 'Guest / Family Name')}</th>
                  <th className="py-3 px-4">{tr('المجموعة', 'Group')}</th>
                  <th className="py-3 px-4">{tr('المقاعد (مؤكد / مخصص)', 'Seats (Conf. / Alloc.)')}</th>
                  <th className="py-3 px-4">{tr('رقم الطاولة', 'Table #')}</th>
                  <th className="py-3 px-4">{tr('حالة الحضور الفعلي', 'Check-In Status')}</th>
                  <th className="py-3 px-4">{tr('إجراء الاستقبال', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDC9]">
                {filteredGuests.map((guest) => (
                  <tr
                    key={guest.id}
                    onClick={() => setScannedGuest(guest)}
                    className="hover:bg-[#F8F6EF] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#566B49]">
                        {guest.familyTitle || guest.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#91A77D]">
                        {guest.qrCodeToken}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DCE8CB]/65 border border-[#B9CCA0] text-[#566B49] font-semibold">
                        {getGroupName(guest.group)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#566B49]">
                      {guest.confirmedSeats || guest.allocatedSeats} / {guest.allocatedSeats} {tr('مقاعد', 'seats')}
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Table2 size={13} className="text-[#91A77D]" />
                        <select
                          value={guest.tableNumber || ''}
                          onChange={(e) =>
                            onAssignGuestTable?.(
                              guest.id,
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                          className="bg-[#F8F6EF] border border-[#E9DDC9] rounded-lg px-2 py-1 text-xs text-[#566B49] font-mono"
                        >
                          <option value="">{tr('غير محدد', 'Unassigned')}</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                            <option key={num} value={num}>
                              {tr('طاولة', 'Table')} #{num}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {guest.checkedIn ? (
                        <span className="inline-flex items-center gap-1 text-[#566B49] font-bold">
                          <CheckCircle2 size={14} className="text-[#91A77D]" /> {tr('حاضر', 'Present')} ({guest.checkedInAt || tr('تم', 'Done')})
                        </span>
                      ) : (
                        <span className="text-[#91A77D]">{tr('لم يسجل دخول بعد', 'Not checked in yet')}</span>
                      )}
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onCheckInGuest(guest.id, !guest.checkedIn)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          guest.checkedIn
                            ? 'bg-[#F8F6EF] text-[#6E8261] border border-[#E9DDC9] hover:bg-[#E9DDC9]'
                            : 'bg-[#B9CCA0] text-[#566B49] hover:bg-[#566B49] hover:text-[#FFFDF8] shadow-xs'
                        }`}
                      >
                        {guest.checkedIn
                          ? tr('إلغاء الدخول', 'Undo')
                          : tr('تسجيل دخول ✓', 'Check In ✓')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
