import React, { useState } from 'react';
import {
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  Share2,
  Edit3,
  Trash2,
  Download,
  Search,
  Sparkles,
  MapPin,
  MessageCircle,
  FileImage,
  QrCode,
  UserCheck,
  BellRing,
  Table2,
  Heart,
  Crown,
  Copy,
  Check,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react';
import {
  InvitationData,
  RSVPRecord,
  GuestbookMessage,
  SeatingTable,
  InvitedGuest,
  IraqiFamilyGroup,
} from '../../types/invitation';
import { SeatingManager } from './SeatingManager';
import { WhatsAppInviter } from './WhatsAppInviter';
import { downloadInvitationCard } from '../../utils/cardGenerator';
import {
  buildPersonalizedGuestUrl,
  buildShareableInvitationUrl,
  PersonalizedGuestContext,
} from '../../utils/shareLink';
import { IRAQI_FAMILY_GROUPS_META } from '../../data/platformData';
import { useLanguage } from '../../i18n/LanguageContext';
import { useRoyalDarkMode } from '../../utils/royalDarkMode';

const FAMILY_GROUP_EN: Record<IraqiFamilyGroup, { label: string; desc: string }> = {
  groom_family: {
    label: "Groom's Family",
    desc: 'Immediate family, uncles, and close relatives of the groom',
  },
  bride_family: {
    label: "Bride's Family",
    desc: 'Immediate family, uncles, and close relatives of the bride',
  },
  relatives: {
    label: 'Extended Relatives',
    desc: 'Extended family members and respected elders',
  },
  friends: {
    label: 'Close Friends',
    desc: 'Friends of the groom, bride, and family',
  },
  colleagues: {
    label: 'Work & Study Colleagues',
    desc: 'University peers, doctors, engineers, and coworkers',
  },
  vip: {
    label: 'Distinguished Guests',
    desc: 'Special guests of honor and dignitaries',
  },
};

interface UserDashboardProps {
  invitations: InvitationData[];
  rsvps: RSVPRecord[];
  guestbook: GuestbookMessage[];
  tables?: SeatingTable[];
  invitedGuests?: InvitedGuest[];
  onCreateNew: () => void;
  onEdit: (invitation: InvitationData) => void;
  onDelete: (id: string) => void;
  onPreview: (invitation: InvitationData) => void;
  onPreviewPersonalGuest?: (
    invitation: InvitationData,
    guestCtx: PersonalizedGuestContext
  ) => void;
  onDeleteGuestbookMessage?: (id: string) => void;
  onAddTable?: (table: Omit<SeatingTable, 'id'>) => void;
  onDeleteTable?: (tableId: string) => void;
  onAssignGuest?: (rsvpId: string, tableId: string | undefined) => void;
  onAddInvitedGuest?: (
    guest: Omit<InvitedGuest, 'id' | 'createdAt' | 'qrCodeToken'>
  ) => void;
  onDeleteInvitedGuest?: (guestId: string) => void;
  onCheckInGuest?: (guestId: string, checkedIn: boolean) => void;
  onAssignInvitedGuestTable?: (guestId: string, tableNumber: number | undefined) => void;
  onMarkReminderSent?: (guestId: string) => void;
  onOpenReceptionistMode?: () => void;
  onUpdateInvitation?: (updated: InvitationData) => void;
  onApproveGuestbookMessage?: (id: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  invitations,
  rsvps,
  guestbook,
  tables = [],
  invitedGuests = [],
  onCreateNew,
  onEdit,
  onDelete,
  onPreview,
  onPreviewPersonalGuest,
  onDeleteGuestbookMessage,
  onAddTable,
  onDeleteTable,
  onAssignGuest,
  onAddInvitedGuest,
  onDeleteInvitedGuest,
  onCheckInGuest,
  onAssignInvitedGuestTable,
  onMarkReminderSent,
  onOpenReceptionistMode,
  onUpdateInvitation,
  onApproveGuestbookMessage,
}) => {
  const { lang, tr } = useLanguage();
  const [isRoyalDark, toggleRoyalDark] = useRoyalDarkMode();
  const [activeTab, setActiveTab] = useState<
    | 'event_day'
    | 'iraqi_families'
    | 'invitations'
    | 'rsvps'
    | 'seating'
    | 'whatsapp'
    | 'guestbook'
  >('event_day');

  const [selectedInviteId, setSelectedInviteId] = useState<string>(
    invitations[0]?.id || 'inv-1'
  );
  const [downloadingCardId, setDownloadingCardId] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [copiedGuestLinkId, setCopiedGuestLinkId] = useState<string | null>(null);
  const [rsvpFilter] = useState<'all' | 'attending' | 'declined' | 'tentative'>('all');
  const [familyGroupFilter, setFamilyGroupFilter] = useState<IraqiFamilyGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Personalized Guest / Iraqi Family Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newIsFamily, setNewIsFamily] = useState(true);
  const [newGroup, setNewGroup] = useState<IraqiFamilyGroup>('groom_family');
  const [newPhone, setNewPhone] = useState('');
  const [newAllocatedSeats, setNewAllocatedSeats] = useState(4);
  const [newTableNumber, setNewTableNumber] = useState<number | ''>(1);

  const currentInvite =
    invitations.find((i) => i.id === selectedInviteId) || invitations[0];

  const eventInvitedGuests = invitedGuests.filter(
    (g) => g.invitationId === (currentInvite?.id || 'inv-1')
  );

  // Event Day Manager 6 Core Metrics
  const totalInvitedCards = eventInvitedGuests.length;
  const totalAllocatedSeats = eventInvitedGuests.reduce(
    (sum, g) => sum + g.allocatedSeats,
    0
  );
  const confirmedGuestsList = eventInvitedGuests.filter(
    (g) => g.rsvpStatus === 'attending'
  );
  const declinedGuestsList = eventInvitedGuests.filter(
    (g) => g.rsvpStatus === 'declined'
  );
  const pendingGuestsList = eventInvitedGuests.filter(
    (g) => g.rsvpStatus === 'pending' || g.rsvpStatus === 'tentative'
  );
  const checkedInGuestsList = eventInvitedGuests.filter((g) => g.checkedIn);

  const totalReservedSeats = confirmedGuestsList.reduce(
    (sum, g) => sum + (g.confirmedSeats || g.allocatedSeats),
    0
  );
  const totalActualAttendees = checkedInGuestsList.reduce(
    (sum, g) => sum + (g.confirmedSeats || g.allocatedSeats),
    0
  );

  // Filtered RSVPs
  const currentInviteRSVPs = rsvps.filter((r) => {
    if (selectedInviteId && r.invitationId !== selectedInviteId) return false;
    if (rsvpFilter !== 'all' && r.status !== rsvpFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.guestName.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Iraqi Family Guests
  const filteredEventGuests = eventInvitedGuests.filter((g) => {
    if (familyGroupFilter !== 'all' && g.group !== familyGroupFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        (g.familyTitle || '').toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        g.qrCodeToken.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getGroupLabel = (grpId: IraqiFamilyGroup) => {
    const ar = IRAQI_FAMILY_GROUPS_META.find((m) => m.id === grpId)?.label || grpId;
    if (lang === 'ar') return ar.replace('(VIP)', '').trim();
    return FAMILY_GROUP_EN[grpId]?.label || grpId;
  };

  const getGroupDesc = (grpId: IraqiFamilyGroup) => {
    const ar = IRAQI_FAMILY_GROUPS_META.find((m) => m.id === grpId)?.description || '';
    if (lang === 'ar') return ar.replace('VIP', '').trim();
    return FAMILY_GROUP_EN[grpId]?.desc || '';
  };

  const handleCreatePersonalizedGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !currentInvite || !onAddInvitedGuest) return;

    const cleanName = newGuestName.trim();
    const formattedFamilyTitle = newIsFamily
      ? lang === 'ar'
        ? cleanName.startsWith('عائلة')
          ? `${cleanName} الكريمة`
          : `عائلة ${cleanName} الكريمة`
        : cleanName
      : cleanName;

    onAddInvitedGuest({
      invitationId: currentInvite.id,
      name: cleanName,
      isFamilyInvite: newIsFamily,
      familyTitle: formattedFamilyTitle,
      group: newGroup,
      phone: newPhone.trim() || '+9647700000000',
      allocatedSeats: newAllocatedSeats,
      rsvpStatus: 'pending',
      confirmedSeats: 0,
      companionNames: [],
      tableNumber: newTableNumber ? Number(newTableNumber) : undefined,
      checkedIn: false,
    });

    setNewGuestName('');
    setNewPhone('');
  };

  const handleSendWhatsAppReminder = (guest: InvitedGuest) => {
    if (!currentInvite) return;
    const personalUrl = buildPersonalizedGuestUrl(currentInvite, guest);
    const cleanPhone = guest.phone.replace(/[^0-9]/g, '');
    const text =
      lang === 'ar'
        ? `السلام عليكم ورحمة الله وبركاته 🌸\n\n` +
          `تذكير ودي خاص إلى: ${guest.familyTitle || guest.name}\n` +
          `يسعدنا جداً تشريفكم في (${currentInvite.title}) يوم ${currentInvite.eventDate} في ${currentInvite.venueName}.\n` +
          `🪑 عدد المقاعد المخصصة لكم: ${guest.allocatedSeats} مقاعد${
            guest.tableNumber ? ` (طاولة رقم ${guest.tableNumber})` : ''
          }\n\n` +
          `يرجى فتح رابط دعوتكم الشخصية لتأكيد الحضور واستلام رمز الدخول:\n` +
          `${personalUrl}`
        : `Warm Greetings 🌸\n\n` +
          `Friendly reminder for: ${guest.familyTitle || guest.name}\n` +
          `We would be honored by your presence at (${currentInvite.title}) on ${currentInvite.eventDate} at ${currentInvite.venueName}.\n` +
          `🪑 Allocated seats: ${guest.allocatedSeats}${
            guest.tableNumber ? ` (Table #${guest.tableNumber})` : ''
          }\n\n` +
          `Please open your personal invitation link to confirm attendance and receive your entry pass:\n` +
          `${personalUrl}`;

    onMarkReminderSent?.(guest.id);
    const targetUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(targetUrl, '_blank');
  };

  const exportCsv = () => {
    const headers =
      lang === 'ar'
        ? [
            'اسم الضيف / العائلة',
            'المجموعة',
            'رقم الهاتف',
            'الحالة',
            'المقاعد المخصصة',
            'المقاعد المؤكدة',
            'رقم الطاولة',
            'حالة الدخول',
          ]
        : [
            'Guest / Family Name',
            'Group',
            'Phone',
            'Status',
            'Allocated Seats',
            'Confirmed Seats',
            'Table Number',
            'Check-In Status',
          ];
    const rows = eventInvitedGuests.map((g) => [
      `"${g.familyTitle || g.name}"`,
      getGroupLabel(g.group),
      g.phone,
      g.rsvpStatus === 'attending'
        ? tr('مؤكد الحضور', 'Attending')
        : g.rsvpStatus === 'declined'
        ? tr('معتذر', 'Declined')
        : tr('لم يجب بعد', 'Pending'),
      g.allocatedSeats,
      g.confirmedSeats,
      g.tableNumber || tr('غير محدد', 'Unassigned'),
      g.checkedIn ? tr('حاضر فعلياً', 'Checked In') : tr('لم يصل بعد', 'Not Arrived'),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `event-guests-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`w-full min-h-screen font-cairo py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isRoyalDark
          ? 'maraseem-royal-dark bg-[#110E0B] text-[#F8F1E5]'
          : 'bg-[#F8F6EF] text-[#566B49]'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div
          className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b transition-colors duration-300 ${
            isRoyalDark ? 'border-[#D6B574]/25' : 'border-[#E9DDC9]'
          }`}
        >
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className={`text-2xl sm:text-3xl font-bold transition-colors ${
                  isRoyalDark ? 'text-[#F8F1E5]' : 'text-[#566B49]'
                }`}
              >
                {tr(
                  'مركز إدارة المناسبة والعوائل العراقية',
                  'Event Day & Family Guest Manager'
                )}
              </h1>
              <span
                className={`text-xs px-3 py-1 rounded-full border font-bold transition-colors ${
                  isRoyalDark
                    ? 'bg-[#123D32]/75 text-[#D6B574] border-[#D6B574]/45'
                    : 'bg-[#DCE8CB] text-[#566B49] border-[#B9CCA0]'
                }`}
              >
                {tr('الإدارة الشاملة ليوم الحفل', 'Event Day Manager')}
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm mt-1 transition-colors ${
                isRoyalDark ? 'text-[#D6B574]/85' : 'text-[#566B49]/80'
              }`}
            >
              {tr(
                'إنشاء دعوات شخصية لكل ضيف أو عائلة، تحديد عدد المقاعد، متابعة الحضور الفعلي برمز الدخول، وإرسال التذكيرات.',
                'Create personalized guest or family invitations, allocate seat limits, track live QR check-ins, and send reminders.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Royal Dark Mode Tactile Toggle Switch (الوضع الليلي الملكي للوحة التحكم) */}
            <button
              type="button"
              role="switch"
              aria-checked={isRoyalDark}
              onClick={toggleRoyalDark}
              className={`group px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer shadow-xs ${
                isRoyalDark
                  ? 'bg-[#123D32] text-[#F8F1E5] border-[#D6B574] shadow-[0_0_16px_rgba(214,181,116,0.22)]'
                  : 'bg-[#FFFDF8] hover:bg-[#DCE8CB] text-[#566B49] border-[#E9DDC9]'
              }`}
              title={tr('تبديل الوضع الليلي المريح للعين', 'Toggle Royal Dark Mode')}
            >
              {isRoyalDark ? (
                <Sun size={15} className="text-[#D6B574]" />
              ) : (
                <Moon size={15} className="text-[#A98445]" />
              )}
              <span>
                {isRoyalDark
                  ? tr('الوضع الليلي الملكي', 'Royal Dark Mode')
                  : tr('الوضع النهاري', 'Light Mode')}
              </span>
              <span
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  isRoyalDark
                    ? 'bg-[#17130F] border border-[#D6B574]/60'
                    : 'bg-[#E9DDC9] border border-[#A98445]/30'
                }`}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 transform rounded-full transition-transform ${
                    isRoyalDark
                      ? 'translate-x-0.5 bg-[#D6B574]'
                      : 'translate-x-3.5 bg-[#566B49]'
                  }`}
                />
              </span>
            </button>

            {onOpenReceptionistMode && (
              <button
                type="button"
                onClick={onOpenReceptionistMode}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                  isRoyalDark
                    ? 'bg-[#1E1914] hover:bg-[#123D32]/60 text-[#F8F1E5] border-[#D6B574]/30'
                    : 'bg-[#FFFDF8] hover:bg-[#DCE8CB] text-[#566B49] border-[#E9DDC9]'
                }`}
              >
                <ShieldCheck
                  size={16}
                  className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
                />
                <span>
                  {tr(
                    'فتح شاشة موظف الاستقبال (مسح رمز الدخول)',
                    'Open Receptionist QR Scanner'
                  )}
                </span>
              </button>
            )}

            <button
              onClick={onCreateNew}
              className={`px-5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                isRoyalDark
                  ? 'bg-[#D6B574] hover:bg-[#e3c687] text-[#17130F] border-[#F8F1E5]/30'
                  : 'bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] border-[#91A77D]'
              }`}
            >
              <Plus size={16} />
              <span>{tr('إنشاء دعوة جديدة', 'Create New Invitation')}</span>
            </button>
          </div>
        </div>

        {/* Active Event Selector Bar */}
        {invitations.length > 0 && (
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-colors ${
              isRoyalDark
                ? 'bg-[#1E1914] border-[#D6B574]/30'
                : 'bg-[#FFFDF8] border-[#E9DDC9]'
            }`}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`text-xs font-bold ${
                  isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
                }`}
              >
                {tr('المناسبة النشطة حالياً:', 'Active Event:')}
              </span>
              <select
                value={selectedInviteId}
                onChange={(e) => setSelectedInviteId(e.target.value)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold outline-none transition-colors ${
                  isRoyalDark
                    ? 'bg-[#17130F] border-[#D6B574]/35 text-[#F8F1E5] focus:border-[#D6B574]'
                    : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49] focus:border-[#91A77D]'
                }`}
              >
                {invitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.title} — ({inv.eventDate})
                  </option>
                ))}
              </select>
              {currentInvite && (
                <span
                  className={`text-xs flex items-center gap-1 ${
                    isRoyalDark ? 'text-[#D6B574]/85' : 'text-[#91A77D]'
                  }`}
                >
                  <MapPin
                    size={13}
                    className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
                  />
                  {currentInvite.venueName} - {currentInvite.city}
                </span>
              )}
            </div>

            {currentInvite && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onEdit(currentInvite)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isRoyalDark
                      ? 'bg-[#17130F] hover:bg-[#123D32]/50 text-[#F8F1E5] border-[#D6B574]/30'
                      : 'bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border-[#E9DDC9]'
                  }`}
                  title={tr(
                    'تعديل تفاصيل المناسبة دون تغيير رابط الدعوة',
                    'Edit event details without changing the invitation link'
                  )}
                >
                  <Edit3
                    size={13}
                    className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
                  />
                  <span>
                    {tr('تعديل التفاصيل (مع بقاء نفس الرابط)', 'Edit Details (Keep Same Link)')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onPreview(currentInvite)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isRoyalDark
                      ? 'bg-[#123D32] hover:bg-[#195243] text-[#D6B574] border border-[#D6B574]/45'
                      : 'bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8]'
                  }`}
                >
                  <Eye size={13} />
                  <span>{tr('معاينة الدعوة', 'Preview Invitation')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Event Day Manager 6 Live Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div
            className={`p-4 rounded-2xl border space-y-1.5 shadow-xs transition-colors ${
              isRoyalDark
                ? 'bg-[#1E1914] border-[#D6B574]/25'
                : 'bg-[#FFFDF8] border-[#E9DDC9]'
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] font-bold ${
                isRoyalDark ? 'text-[#F8F1E5]/90' : 'text-[#566B49]'
              }`}
            >
              <span>{tr('إجمالي المدعوين', 'Total Invited')}</span>
              <Users
                size={15}
                className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
              />
            </div>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                isRoyalDark ? 'text-[#F8F1E5]' : 'text-[#566B49]'
              }`}
            >
              {totalInvitedCards}
            </div>
            <div className={`text-[10px] ${isRoyalDark ? 'text-[#D6B574]/85' : 'text-[#91A77D]'}`}>
              {tr(`بإجمالي ${totalAllocatedSeats} مقعد مخصص`, `${totalAllocatedSeats} total allocated seats`)}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border space-y-1.5 shadow-xs transition-colors ${
              isRoyalDark
                ? 'bg-[#1E1914] border-[#D6B574]/25'
                : 'bg-[#FFFDF8] border-[#E9DDC9]'
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] font-bold ${
                isRoyalDark ? 'text-[#F8F1E5]/90' : 'text-[#566B49]'
              }`}
            >
              <span>{tr('عدد المؤكدين', 'Confirmed')}</span>
              <CheckCircle2
                size={15}
                className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
              />
            </div>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
              }`}
            >
              {confirmedGuestsList.length}
            </div>
            <div className={`text-[10px] ${isRoyalDark ? 'text-[#D6B574]/85' : 'text-[#91A77D]'}`}>
              {tr('عائلة / ضيف أكدوا الحضور', 'Confirmed attendance')}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border space-y-1.5 shadow-xs transition-colors ${
              isRoyalDark
                ? 'bg-[#1E1914] border-[#D6B574]/25'
                : 'bg-[#FFFDF8] border-[#E9DDC9]'
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] font-bold ${
                isRoyalDark ? 'text-[#F8F1E5]/90' : 'text-[#566B49]'
              }`}
            >
              <span>{tr('عدد المعتذرين', 'Declined')}</span>
              <XCircle
                size={15}
                className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
              />
            </div>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                isRoyalDark ? 'text-[#F8F1E5]' : 'text-[#566B49]'
              }`}
            >
              {declinedGuestsList.length}
            </div>
            <div className={`text-[10px] ${isRoyalDark ? 'text-[#D6B574]/85' : 'text-[#91A77D]'}`}>
              {tr('قدموا اعتذاراً مسبقاً', 'Sent apologies')}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border space-y-1.5 shadow-xs transition-colors ${
              isRoyalDark
                ? 'bg-[#1E1914] border-[#D6B574]/25'
                : 'bg-[#FFFDF8] border-[#E9DDC9]'
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] font-bold ${
                isRoyalDark ? 'text-[#F8F1E5]/90' : 'text-[#566B49]'
              }`}
            >
              <span>{tr('لم يجيبوا بعد', 'No Response Yet')}</span>
              <HelpCircle
                size={15}
                className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
              />
            </div>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                isRoyalDark ? 'text-[#F8F1E5]' : 'text-[#566B49]'
              }`}
            >
              {pendingGuestsList.length}
            </div>
            <div className={`text-[10px] ${isRoyalDark ? 'text-[#D6B574]/85' : 'text-[#91A77D]'}`}>
              {tr('يمكن إرسال تذكير واتساب لهم', 'Can send WhatsApp reminder')}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border space-y-1.5 shadow-xs transition-colors ${
              isRoyalDark
                ? 'bg-[#1E1914] border-[#D6B574]/30'
                : 'bg-[#FFFDF8] border-[#DCE8CB]'
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] font-bold ${
                isRoyalDark ? 'text-[#F8F1E5]/90' : 'text-[#566B49]'
              }`}
            >
              <span>{tr('المقاعد المحجوزة', 'Reserved Seats')}</span>
              <Table2
                size={15}
                className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
              />
            </div>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
              }`}
            >
              {totalReservedSeats}
            </div>
            <div className={`text-[10px] ${isRoyalDark ? 'text-[#D6B574]/85' : 'text-[#91A77D]'}`}>
              {tr('مقعد مؤكد في القاعة', 'Confirmed hall seats')}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border space-y-1.5 shadow-xs transition-colors ${
              isRoyalDark
                ? 'bg-[#123D32]/75 border-[#D6B574]/45'
                : 'bg-[#DCE8CB] border-[#B9CCA0]'
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] font-bold ${
                isRoyalDark ? 'text-[#F8F1E5]' : 'text-[#566B49]'
              }`}
            >
              <span>{tr('الحاضرون فعلياً', 'Checked In Live')}</span>
              <UserCheck
                size={15}
                className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'}
              />
            </div>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
              }`}
            >
              {totalActualAttendees}
            </div>
            <div
              className={`text-[10px] ${
                isRoyalDark ? 'text-[#F8F1E5]/85' : 'text-[#566B49]/85'
              }`}
            >
              {tr(
                `من أصل ${checkedInGuestsList.length} بطاقة تم مسحها`,
                `From ${checkedInGuestsList.length} scanned passes`
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`flex items-center gap-2 border-b pb-2 overflow-x-auto transition-colors ${
            isRoyalDark ? 'border-[#D6B574]/25' : 'border-[#E9DDC9]'
          }`}
        >
          <button
            onClick={() => setActiveTab('event_day')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'event_day'
                ? isRoyalDark
                  ? 'bg-[#123D32] text-[#F8F1E5] border-[#D6B574] shadow-[0_0_12px_rgba(214,181,116,0.2)]'
                  : 'bg-[#B9CCA0] text-[#566B49] border-[#91A77D]'
                : isRoyalDark
                ? 'bg-[#1E1914] text-[#F8F1E5]/80 hover:bg-[#123D32]/40 border-[#D6B574]/25'
                : 'bg-[#FFFDF8] text-[#566B49]/80 hover:bg-[#DCE8CB] border-[#E9DDC9]'
            }`}
          >
            <QrCode size={14} className={activeTab === 'event_day' && isRoyalDark ? 'text-[#D6B574]' : ''} />
            <span>
              {tr(
                `إدارة يوم المناسبة والدعوات الشخصية (${eventInvitedGuests.length})`,
                `Personal Invitations & Check-In (${eventInvitedGuests.length})`
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('iraqi_families')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'iraqi_families'
                ? isRoyalDark
                  ? 'bg-[#123D32] text-[#F8F1E5] border-[#D6B574] shadow-[0_0_12px_rgba(214,181,116,0.2)]'
                  : 'bg-[#B9CCA0] text-[#566B49] border-[#91A77D]'
                : isRoyalDark
                ? 'bg-[#1E1914] text-[#F8F1E5]/80 hover:bg-[#123D32]/40 border-[#D6B574]/25'
                : 'bg-[#FFFDF8] text-[#566B49]/80 hover:bg-[#DCE8CB] border-[#E9DDC9]'
            }`}
          >
            <Crown size={14} className={activeTab === 'iraqi_families' && isRoyalDark ? 'text-[#D6B574]' : ''} />
            <span>{tr('نظام العوائل العراقية والمجموعات', 'Family Groups & Allocations')}</span>
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeTab === 'invitations'
                ? isRoyalDark
                  ? 'bg-[#123D32] text-[#F8F1E5] border-[#D6B574] shadow-[0_0_12px_rgba(214,181,116,0.2)]'
                  : 'bg-[#B9CCA0] text-[#566B49] border-[#91A77D]'
                : isRoyalDark
                ? 'bg-[#1E1914] text-[#F8F1E5]/80 hover:bg-[#123D32]/40 border-[#D6B574]/25'
                : 'bg-[#FFFDF8] text-[#566B49]/80 hover:bg-[#DCE8CB] border-[#E9DDC9]'
            }`}
          >
            {tr(
              `دعواتي المنشورة (${invitations.length})`,
              `Published Invitations (${invitations.length})`
            )}
          </button>

          <button
            onClick={() => setActiveTab('seating')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'seating'
                ? isRoyalDark
                  ? 'bg-[#123D32] text-[#F8F1E5] border-[#D6B574] shadow-[0_0_12px_rgba(214,181,116,0.2)]'
                  : 'bg-[#B9CCA0] text-[#566B49] border-[#91A77D]'
                : isRoyalDark
                ? 'bg-[#1E1914] text-[#F8F1E5]/80 hover:bg-[#123D32]/40 border-[#D6B574]/25'
                : 'bg-[#FFFDF8] text-[#566B49]/80 hover:bg-[#DCE8CB] border-[#E9DDC9]'
            }`}
          >
            <Users size={14} className={activeTab === 'seating' && isRoyalDark ? 'text-[#D6B574]' : ''} />
            <span>{tr('مخطط الطاولات والجلوس', 'Seating Chart')}</span>
          </button>

          <button
            onClick={() => setActiveTab('rsvps')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeTab === 'rsvps'
                ? isRoyalDark
                  ? 'bg-[#123D32] text-[#F8F1E5] border-[#D6B574] shadow-[0_0_12px_rgba(214,181,116,0.2)]'
                  : 'bg-[#B9CCA0] text-[#566B49] border-[#91A77D]'
                : isRoyalDark
                ? 'bg-[#1E1914] text-[#F8F1E5]/80 hover:bg-[#123D32]/40 border-[#D6B574]/25'
                : 'bg-[#FFFDF8] text-[#566B49]/80 hover:bg-[#DCE8CB] border-[#E9DDC9]'
            }`}
          >
            {tr(`سجل الردود المباشرة (${rsvps.length})`, `RSVP Responses (${rsvps.length})`)}
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'whatsapp'
                ? isRoyalDark
                  ? 'bg-[#123D32] text-[#F8F1E5] border-[#D6B574] shadow-[0_0_12px_rgba(214,181,116,0.2)]'
                  : 'bg-[#B9CCA0] text-[#566B49] border-[#91A77D]'
                : isRoyalDark
                ? 'bg-[#1E1914] text-[#F8F1E5]/80 hover:bg-[#123D32]/40 border-[#D6B574]/25'
                : 'bg-[#FFFDF8] text-[#566B49]/80 hover:bg-[#DCE8CB] border-[#E9DDC9]'
            }`}
          >
            <MessageCircle size={14} className={activeTab === 'whatsapp' && isRoyalDark ? 'text-[#D6B574]' : ''} />
            <span>{tr('دعوات واتساب الذكية', 'WhatsApp Inviter')}</span>
          </button>

          <button
            onClick={() => setActiveTab('guestbook')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeTab === 'guestbook'
                ? isRoyalDark
                  ? 'bg-[#123D32] text-[#F8F1E5] border-[#D6B574] shadow-[0_0_12px_rgba(214,181,116,0.2)]'
                  : 'bg-[#B9CCA0] text-[#566B49] border-[#91A77D]'
                : isRoyalDark
                ? 'bg-[#1E1914] text-[#F8F1E5]/80 hover:bg-[#123D32]/40 border-[#D6B574]/25'
                : 'bg-[#FFFDF8] text-[#566B49]/80 hover:bg-[#DCE8CB] border-[#E9DDC9]'
            }`}
          >
            {tr(`سجل التهاني (${guestbook.length})`, `Guestbook (${guestbook.length})`)}
          </button>
        </div>

        {/* TAB: Event Day Manager & Personalized Guest Links */}
        {activeTab === 'event_day' && (
          <div className="space-y-6">
            {/* Create Personalized Guest / Family Invitation Form */}
            <form
              onSubmit={handleCreatePersonalizedGuest}
              className={`p-5 rounded-2xl border space-y-4 shadow-xs transition-colors ${
                isRoyalDark
                  ? 'bg-[#1E1914] border-[#D6B574]/25'
                  : 'bg-[#FFFDF8] border-[#E9DDC9]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3
                    className={`text-sm sm:text-base font-bold flex items-center gap-2 ${
                      isRoyalDark ? 'text-[#F8F1E5]' : 'text-[#566B49]'
                    }`}
                  >
                    <Sparkles
                      size={16}
                      className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
                    />
                    <span>
                      {tr(
                        'إنشاء دعوة شخصية أو عائلية برابط خاص ومقاعد محددة',
                        'Create Personalized Guest or Family Invitation Link'
                      )}
                    </span>
                  </h3>
                  <p
                    className={`text-xs ${
                      isRoyalDark ? 'text-[#D6B574]/85' : 'text-[#566B49]/80'
                    }`}
                  >
                    {tr(
                      'سيحصل كل مدعو أو عائلة على رابط خاص يرحب بهم بالاسم ويحدد عدد المقاعد المسموح لهم بتأكيدها ورقم طاولتهم.',
                      'Each guest or family receives a unique link welcoming them by name with their allocated seat limit and table number.'
                    )}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
                    isRoyalDark
                      ? 'bg-[#17130F] border-[#D6B574]/25'
                      : 'bg-[#F8F6EF] border-[#E9DDC9]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setNewIsFamily(true);
                      setNewAllocatedSeats(5);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      newIsFamily
                        ? isRoyalDark
                          ? 'bg-[#123D32] text-[#D6B574] border border-[#D6B574]/40'
                          : 'bg-[#B9CCA0] text-[#566B49]'
                        : isRoyalDark
                        ? 'text-[#F8F1E5]/70 hover:text-[#F8F1E5]'
                        : 'text-[#566B49]/75 hover:text-[#566B49]'
                    }`}
                  >
                    {tr('دعوة عائلية (باسم العائلة)', 'Family Invitation')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewIsFamily(false);
                      setNewAllocatedSeats(2);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      !newIsFamily
                        ? isRoyalDark
                          ? 'bg-[#123D32] text-[#D6B574] border border-[#D6B574]/40'
                          : 'bg-[#B9CCA0] text-[#566B49]'
                        : isRoyalDark
                        ? 'text-[#F8F1E5]/70 hover:text-[#F8F1E5]'
                        : 'text-[#566B49]/75 hover:text-[#566B49]'
                    }`}
                  >
                    {tr('دعوة شخصية فردية', 'Individual Guest')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2">
                  <label
                    className={`block text-[11px] font-bold mb-1 ${
                      isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
                    }`}
                  >
                    {newIsFamily
                      ? tr('اسم العائلة الكريمة *', 'Family Name *')
                      : tr('اسم الضيف الكريم *', 'Guest Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder={
                      newIsFamily
                        ? tr('مثال: عائلة الحاج عباس الربيعي', 'e.g. Al-Rubaie Family')
                        : tr('مثال: الدكتور حيدر الكاظمي', 'e.g. Dr. Haider Al-Kadhimi')
                    }
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors ${
                      isRoyalDark
                        ? 'bg-[#17130F] border-[#D6B574]/30 text-[#F8F1E5] focus:border-[#D6B574]'
                        : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49] focus:border-[#91A77D]'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-[11px] font-bold mb-1 ${
                      isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
                    }`}
                  >
                    {tr('المجموعة', 'Family Group')}
                  </label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value as IraqiFamilyGroup)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-colors ${
                      isRoyalDark
                        ? 'bg-[#17130F] border-[#D6B574]/30 text-[#F8F1E5] focus:border-[#D6B574]'
                        : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49] focus:border-[#91A77D]'
                    }`}
                  >
                    {IRAQI_FAMILY_GROUPS_META.map((grp) => (
                      <option key={grp.id} value={grp.id}>
                        {getGroupLabel(grp.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-[11px] font-bold mb-1 ${
                      isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
                    }`}
                  >
                    {tr('عدد المقاعد المسموح بها', 'Allowed Seats')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={newAllocatedSeats}
                    onChange={(e) => setNewAllocatedSeats(Math.max(1, Number(e.target.value)))}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold outline-none transition-colors ${
                      isRoyalDark
                        ? 'bg-[#17130F] border-[#D6B574]/30 text-[#F8F1E5] focus:border-[#D6B574]'
                        : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49]'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-[11px] font-bold mb-1 ${
                      isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
                    }`}
                  >
                    {tr('رقم الطاولة + هاتف الواتساب', 'Table # + WhatsApp')}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newTableNumber}
                      onChange={(e) =>
                        setNewTableNumber(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder={tr('طاولة', 'Tbl')}
                      className={`w-20 px-2.5 py-2 rounded-xl border text-xs font-mono outline-none transition-colors ${
                        isRoyalDark
                          ? 'bg-[#17130F] border-[#D6B574]/30 text-[#F8F1E5] focus:border-[#D6B574]'
                          : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49]'
                      }`}
                    />
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+96477..."
                      className={`flex-1 min-w-0 px-2.5 py-2 rounded-xl border text-xs font-mono outline-none transition-colors ${
                        isRoyalDark
                          ? 'bg-[#17130F] border-[#D6B574]/30 text-[#F8F1E5] focus:border-[#D6B574]'
                          : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49]'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isRoyalDark
                        ? 'bg-[#D6B574] hover:bg-[#e4c686] text-[#17130F]'
                        : 'bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8]'
                    }`}
                  >
                    <Plus size={15} />
                    <span>{tr('توليد رابط الدعوة', 'Generate Invite Link')}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Filter & Search Bar */}
            <div
              className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl border transition-colors ${
                isRoyalDark
                  ? 'bg-[#1E1914] border-[#D6B574]/25'
                  : 'bg-[#FFFDF8] border-[#E9DDC9]'
              }`}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFamilyGroupFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    familyGroupFilter === 'all'
                      ? isRoyalDark
                        ? 'bg-[#123D32] text-[#D6B574] border-[#D6B574]'
                        : 'bg-[#B9CCA0] text-[#566B49] border-[#91A77D]'
                      : isRoyalDark
                      ? 'bg-[#17130F] text-[#F8F1E5]/80 hover:bg-[#123D32]/40 border-[#D6B574]/25'
                      : 'bg-[#F8F6EF] text-[#566B49]/80 hover:bg-[#DCE8CB] border-[#E9DDC9]'
                  }`}
                >
                  {tr(
                    `جميع المجموعات (${eventInvitedGuests.length})`,
                    `All Groups (${eventInvitedGuests.length})`
                  )}
                </button>
                {IRAQI_FAMILY_GROUPS_META.map((grp) => {
                  const count = eventInvitedGuests.filter((g) => g.group === grp.id).length;
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setFamilyGroupFilter(grp.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        familyGroupFilter === grp.id
                          ? isRoyalDark
                            ? 'bg-[#123D32] text-[#D6B574] border-[#D6B574]'
                            : 'bg-[#B9CCA0] text-[#566B49] border-[#91A77D]'
                          : isRoyalDark
                          ? 'bg-[#17130F] text-[#F8F1E5]/80 hover:bg-[#123D32]/40 border-[#D6B574]/25'
                          : 'bg-[#F8F6EF] text-[#566B49]/80 hover:bg-[#DCE8CB] border-[#E9DDC9]'
                      }`}
                    >
                      {getGroupLabel(grp.id)} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <Search
                    size={14}
                    className={`absolute ${
                      lang === 'ar' ? 'right-3' : 'left-3'
                    } top-1/2 -translate-y-1/2 ${
                      isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'
                    }`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={tr(
                      'بحث باسم الضيف أو العائلة...',
                      'Search by guest or family...'
                    )}
                    className={`w-full ${
                      lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    } py-1.5 rounded-xl border text-xs outline-none transition-colors ${
                      isRoyalDark
                        ? 'bg-[#17130F] border-[#D6B574]/30 text-[#F8F1E5] focus:border-[#D6B574]'
                        : 'bg-[#F8F6EF] border-[#E9DDC9] text-[#566B49] focus:border-[#91A77D]'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={exportCsv}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                    isRoyalDark
                      ? 'bg-[#123D32] hover:bg-[#184f41] text-[#D6B574] border-[#D6B574]/45'
                      : 'bg-[#DCE8CB] hover:bg-[#B9CCA0] text-[#566B49] border-[#B9CCA0]'
                  }`}
                >
                  <Download size={13} />
                  <span>{tr('تصدير القائمة', 'Export CSV')}</span>
                </button>
              </div>
            </div>

            {/* Personalized Guests Table */}
            <div
              className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
                isRoyalDark
                  ? 'bg-[#1E1914] border-[#D6B574]/25'
                  : 'bg-[#FFFDF8] border-[#E9DDC9]'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead
                    className={`border-b transition-colors ${
                      isRoyalDark
                        ? 'bg-[#17130F] text-[#D6B574] border-[#D6B574]/25'
                        : 'bg-[#F8F6EF] text-[#566B49] border-[#E9DDC9]'
                    }`}
                  >
                    <tr>
                      <th className="py-3.5 px-4 text-start">
                        {tr('الضيف / العائلة المدعوة', 'Invited Guest / Family')}
                      </th>
                      <th className="py-3.5 px-4 text-start">{tr('المجموعة', 'Group')}</th>
                      <th className="py-3.5 px-4 text-start">
                        {tr('المقاعد (المؤكدة / المسموحة)', 'Seats (Confirmed / Allowed)')}
                      </th>
                      <th className="py-3.5 px-4 text-start">
                        {tr('حالة الرد', 'RSVP Status')}
                      </th>
                      <th className="py-3.5 px-4 text-start">
                        {tr('رقم الطاولة', 'Table #')}
                      </th>
                      <th className="py-3.5 px-4 text-start">
                        {tr('الحضور الفعلي', 'Check-In')}
                      </th>
                      <th className="py-3.5 px-4 text-start">
                        {tr('الرابط الشخصي والتذكير', 'Personal Link & Reminder')}
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isRoyalDark ? 'divide-[#D6B574]/15' : 'divide-[#E9DDC9]'
                    }`}
                  >
                    {filteredEventGuests.map((guest) => {
                      const personalUrl = currentInvite
                        ? buildPersonalizedGuestUrl(currentInvite, guest)
                        : '';

                      return (
                        <tr
                          key={guest.id}
                          className={`transition-colors ${
                            isRoyalDark ? 'hover:bg-[#17130F]/70' : 'hover:bg-[#F8F6EF]'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div
                              className={`font-bold ${
                                isRoyalDark ? 'text-[#F8F1E5]' : 'text-[#566B49]'
                              }`}
                            >
                              {guest.familyTitle || guest.name}
                            </div>
                            <div
                              className={`text-[10px] font-mono flex items-center gap-2 mt-0.5 ${
                                isRoyalDark ? 'text-[#D6B574]/85' : 'text-[#91A77D]'
                              }`}
                            >
                              <span>{guest.qrCodeToken}</span>
                              <span>•</span>
                              <span>{guest.phone}</span>
                            </div>
                            {guest.companionNames.length > 0 && (
                              <div
                                className={`text-[10px] mt-1 font-semibold ${
                                  isRoyalDark ? 'text-[#F8F1E5]/85' : 'text-[#566B49]'
                                }`}
                              >
                                {tr('المرافقون:', 'Companions:')}{' '}
                                {guest.companionNames.join('، ')}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
                                isRoyalDark
                                  ? 'bg-[#123D32]/70 text-[#D6B574] border-[#D6B574]/40'
                                  : 'bg-[#DCE8CB] text-[#566B49] border-[#B9CCA0]'
                              }`}
                            >
                              {getGroupLabel(guest.group)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <span
                              className={`font-bold ${
                                isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
                              }`}
                            >
                              {guest.confirmedSeats}
                            </span>{' '}
                            <span className={isRoyalDark ? 'text-[#D6B574]/60' : 'text-[#91A77D]'}>
                              /
                            </span>{' '}
                            <span
                              className={`font-bold ${
                                isRoyalDark ? 'text-[#F8F1E5]' : 'text-[#566B49]'
                              }`}
                            >
                              {guest.allocatedSeats} {tr('مقاعد', 'seats')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {guest.rsvpStatus === 'attending' ? (
                              <span
                                className={`inline-flex items-center gap-1 font-bold ${
                                  isRoyalDark ? 'text-[#D6B574]' : 'text-[#566B49]'
                                }`}
                              >
                                <CheckCircle2
                                  size={13}
                                  className={isRoyalDark ? 'text-[#D6B574]' : 'text-[#91A77D]'}
                                />{' '}
                                {tr('مؤكد الحضور', 'Confirmed')}
                              </span>
                            ) : guest.rsvpStatus === 'declined' ? (
                              <span
                                className={`inline-flex items-center gap-1 font-bold ${
                                  isRoyalDark ? 'text-rose-400' : 'text-rose-700'
                                }`}
                              >
                                <XCircle size={13} /> {tr('معتذر', 'Declined')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#91A77D] font-bold">
                                <HelpCircle size={13} /> {tr('لم يؤكد بعد', 'Pending')}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={guest.tableNumber || ''}
                              onChange={(e) =>
                                onAssignInvitedGuestTable?.(
                                  guest.id,
                                  e.target.value ? Number(e.target.value) : undefined
                                )
                              }
                              className="bg-[#F8F6EF] border border-[#E9DDC9] rounded-lg px-2 py-1 text-xs text-[#566B49] font-mono font-bold"
                            >
                              <option value="">{tr('غير محدد', 'Unassigned')}</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                                <option key={n} value={n}>
                                  {tr(`طاولة رقم ${n}`, `Table #${n}`)}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => onCheckInGuest?.(guest.id, !guest.checkedIn)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                guest.checkedIn
                                  ? 'bg-[#DCE8CB] text-[#566B49] border border-[#91A77D]'
                                  : 'bg-[#F8F6EF] text-[#566B49]/80 hover:bg-[#DCE8CB] border border-[#E9DDC9]'
                              }`}
                            >
                              <QrCode size={12} />
                              <span>
                                {guest.checkedIn
                                  ? tr(
                                      `حاضر (${guest.checkedInAt || 'تم'})`,
                                      `Checked In (${guest.checkedInAt || 'Done'})`
                                    )
                                  : tr('تسجيل حضور', 'Check In')}
                              </span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Copy Personal Link */}
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(personalUrl);
                                  setCopiedGuestLinkId(guest.id);
                                  setTimeout(() => setCopiedGuestLinkId(null), 2000);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                              >
                                {copiedGuestLinkId === guest.id ? (
                                  <Check size={12} />
                                ) : (
                                  <Copy size={12} />
                                )}
                                <span>
                                  {copiedGuestLinkId === guest.id
                                    ? tr('تم النسخ ✓', 'Copied ✓')
                                    : tr('رابط الضيف', 'Guest Link')}
                                </span>
                              </button>

                              {/* Preview Personalized Invitation */}
                              {currentInvite && onPreviewPersonalGuest && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onPreviewPersonalGuest(currentInvite, {
                                      guestId: guest.id,
                                      guestName: guest.familyTitle || guest.name,
                                      familyTitle: guest.familyTitle,
                                      isFamilyInvite: guest.isFamilyInvite,
                                      allocatedSeats: guest.allocatedSeats,
                                      group: guest.group,
                                      tableNumber: guest.tableNumber,
                                      qrCodeToken: guest.qrCodeToken,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye size={12} />
                                  <span>{tr('معاينة', 'Preview')}</span>
                                </button>
                              )}

                              {/* Send WhatsApp Reminder */}
                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppReminder(guest)}
                                className="px-2.5 py-1 rounded-lg bg-[#DCE8CB] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] border border-[#B9CCA0] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <BellRing size={11} />
                                <span>
                                  {guest.rsvpStatus === 'pending'
                                    ? tr('تذكير واتساب', 'Reminder')
                                    : tr('إرسال', 'Send')}
                                </span>
                              </button>

                              {onDeleteInvitedGuest && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteInvitedGuest(guest.id)}
                                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                                  title={tr('حذف', 'Delete')}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Iraqi Families System Overview */}
        {activeTab === 'iraqi_families' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-[#566B49] flex items-center gap-2">
                  <Crown size={20} className="text-[#91A77D]" />
                  <span>
                    {tr(
                      'نظام تقسيم العوائل العراقية والمقاعد المخصصة',
                      'Iraqi Family Groups & Seat Allocation System'
                    )}
                  </span>
                </h2>
                <p className="text-xs text-[#566B49]/80 mt-1">
                  {tr(
                    'توزيع منظم يراعي تقاليد الأعراس والمناسبات العراقية (أهل العريس، أهل العروس، الأقارب والعشيرة، الأصدقاء، زملاء العمل، وكبار الشخصيات).',
                    'Structured organization tailored for family traditions: Groom’s Family, Bride’s Family, Extended Relatives, Friends, Colleagues, and Distinguished Guests.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('event_day')}
                className="px-4 py-2 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs cursor-pointer shrink-0 transition-all"
              >
                {tr('+ إضافة عائلة جديدة', '+ Add New Family')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {IRAQI_FAMILY_GROUPS_META.map((grp) => {
                const groupGuests = eventInvitedGuests.filter((g) => g.group === grp.id);
                const groupAllocated = groupGuests.reduce((s, g) => s + g.allocatedSeats, 0);
                const groupConfirmed = groupGuests
                  .filter((g) => g.rsvpStatus === 'attending')
                  .reduce((s, g) => s + (g.confirmedSeats || g.allocatedSeats), 0);
                const groupCheckedIn = groupGuests
                  .filter((g) => g.checkedIn)
                  .reduce((s, g) => s + (g.confirmedSeats || g.allocatedSeats), 0);

                return (
                  <div
                    key={grp.id}
                    className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] hover:border-[#B9CCA0] transition-all space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#DCE8CB] text-[#566B49] border border-[#B9CCA0] font-bold">
                          {getGroupLabel(grp.id)}
                        </span>
                        <p className="text-[11px] text-[#566B49]/80 mt-1.5">
                          {getGroupDesc(grp.id)}
                        </p>
                      </div>
                      <span className="text-lg font-bold font-mono text-[#566B49]">
                        {groupGuests.length} {tr('دعوة', 'invites')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E9DDC9] text-center">
                      <div className="p-2 rounded-xl bg-[#F8F6EF]">
                        <div className="text-[10px] text-[#91A77D]">
                          {tr('المقاعد المخصصة', 'Allocated')}
                        </div>
                        <div className="text-sm font-bold font-mono text-[#566B49]">
                          {groupAllocated}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F8F6EF]">
                        <div className="text-[10px] text-[#91A77D]">
                          {tr('المؤكد حضورهم', 'Confirmed')}
                        </div>
                        <div className="text-sm font-bold font-mono text-[#566B49]">
                          {groupConfirmed}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#DCE8CB]">
                        <div className="text-[10px] text-[#566B49]">
                          {tr('الحاضرون فعلياً', 'Checked In')}
                        </div>
                        <div className="text-sm font-bold font-mono text-[#566B49]">
                          {groupCheckedIn}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {groupGuests.length === 0 ? (
                        <div className="text-[11px] text-[#91A77D] text-center py-3">
                          {tr(
                            'لا توجد عوائل مضافة في هذه المجموعة بعد',
                            'No families added to this group yet'
                          )}
                        </div>
                      ) : (
                        groupGuests.map((g) => (
                          <div
                            key={g.id}
                            className="px-3 py-2 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-[#566B49] truncate">
                              {g.familyTitle || g.name}
                            </span>
                            <span className="text-[11px] font-mono text-[#91A77D] font-bold shrink-0">
                              {g.confirmedSeats || g.allocatedSeats}/{g.allocatedSeats}{' '}
                              {tr('مقاعد', 'seats')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1: Invitations List */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invitations.map((inv) => {
                const isMemoriesOn = Boolean(inv.memoriesConfig?.isPostEventActive);

                return (
                  <div
                    key={inv.id}
                    className="rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] hover:border-[#B9CCA0] transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] border border-[#B9CCA0] text-[11px] font-bold">
                          {inv.category === 'wedding'
                            ? tr('حفل زواج', 'Wedding')
                            : inv.category === 'engagement'
                            ? tr('حفل خطوبة', 'Engagement')
                            : inv.category === 'henna'
                            ? tr('ليلة حنة', 'Henna Night')
                            : inv.category === 'graduation'
                            ? tr('تخرج جامعي', 'Graduation')
                            : inv.category === 'graduation_project'
                            ? tr('مناقشة مشروع تخرج', 'Graduation Project')
                            : inv.category === 'birthday'
                            ? tr('عيد ميلاد', 'Birthday')
                            : inv.category === 'special_events'
                            ? tr('مناسبة خاصة', 'Special Event')
                            : tr('افتتاح مشروع', 'Business Opening')}
                        </span>
                        <span className="text-[#91A77D] text-[11px] font-mono">
                          {inv.eventDate}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#566B49]">{inv.title}</h3>

                      <div className="text-xs text-[#566B49]/80 flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#91A77D] shrink-0" />
                        <span className="truncate">
                          {inv.venueName} - {inv.city}
                        </span>
                      </div>

                      {/* Post-event Memories Toggle */}
                      {onUpdateInvitation && (
                        <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DCE8CB] flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] text-[#566B49] font-bold">
                            <Heart size={13} className="text-[#91A77D]" />
                            <span>
                              {tr(
                                'تحويل الرابط إلى ألبوم ذكريات الحفل',
                                'Convert Link to Memories Album'
                              )}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateInvitation({
                                ...inv,
                                memoriesConfig: {
                                  ...(inv.memoriesConfig || {
                                    enabled: true,
                                    isPostEventActive: false,
                                    thankYouTitle: 'شكراً لكل من شاركنا فرحة العمر 🤍',
                                    thankYouMessage: 'بحضوركم اكتملت بهجتنا وأضاءت ليلتنا.',
                                    mediaItems: [],
                                    allowGuestUploads: true,
                                  }),
                                  isPostEventActive: !isMemoriesOn,
                                },
                              })
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              isMemoriesOn
                                ? 'bg-[#566B49] text-[#FFFDF8]'
                                : 'bg-[#DCE8CB] text-[#566B49]'
                            }`}
                          >
                            {isMemoriesOn
                              ? tr('مفعّل الآن ✓', 'Active ✓')
                              : tr('تفعيل بعد الحفل', 'Activate')}
                          </button>
                        </div>
                      )}

                      {/* Link preview & One-Click Copy */}
                      <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#E9DDC9] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-[#566B49] font-bold">
                            {tr(
                              'رابط الدعوة العام (يبقى ثابتاً عند التعديل):',
                              'Public Invitation Link (Unchanged on Edit):'
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const url = buildShareableInvitationUrl(inv);
                              navigator.clipboard.writeText(url);
                              setCopiedInviteId(inv.id);
                              setTimeout(() => setCopiedInviteId(null), 2500);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Share2 size={11} />
                            <span>
                              {copiedInviteId === inv.id
                                ? tr('تم نسخ الرابط ✓', 'Copied ✓')
                                : tr('نسخ الرابط', 'Copy Link')}
                            </span>
                          </button>
                        </div>
                        <div className="text-[10px] text-[#91A77D] font-mono truncate dir-ltr text-left">
                          {buildShareableInvitationUrl(inv)}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E9DDC9]">
                      <button
                        onClick={() => onPreview(inv)}
                        className="flex-1 py-2 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>{tr('فتح الدعوة', 'Open Invitation')}</span>
                      </button>

                      <button
                        onClick={async () => {
                          setDownloadingCardId(inv.id);
                          await downloadInvitationCard(inv);
                          setDownloadingCardId(null);
                        }}
                        disabled={downloadingCardId === inv.id}
                        className="p-2 rounded-xl bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] transition-colors"
                        title={tr('تحميل كصورة فاخرة', 'Download Card Image')}
                      >
                        <FileImage size={15} />
                      </button>

                      <button
                        onClick={() => onEdit(inv)}
                        className="p-2 rounded-xl bg-[#F8F6EF] hover:bg-[#DCE8CB] text-[#566B49] border border-[#E9DDC9] transition-colors"
                        title={tr('تعديل بالمحرر', 'Edit in Studio')}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => onDelete(inv.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border border-rose-500/20 transition-colors"
                        title={tr('حذف الدعوة', 'Delete Invitation')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: RSVPs Manager */}
        {activeTab === 'rsvps' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E9DDC9] bg-[#FFFDF8] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#F8F6EF] text-[#566B49] border-b border-[#E9DDC9]">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-start">
                        {tr('اسم الضيف', 'Guest Name')}
                      </th>
                      <th className="py-3 px-4 font-semibold text-start">
                        {tr('رقم الهاتف', 'Phone Number')}
                      </th>
                      <th className="py-3 px-4 font-semibold text-start">
                        {tr('حالة الحضور', 'Status')}
                      </th>
                      <th className="py-3 px-4 font-semibold text-start">
                        {tr('المرافقين', 'Companions')}
                      </th>
                      <th className="py-3 px-4 font-semibold text-start">
                        {tr('ملاحظات وتهنئة', 'Message / Note')}
                      </th>
                      <th className="py-3 px-4 font-semibold text-start">
                        {tr('تاريخ الرد', 'Response Date')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9DDC9]">
                    {currentInviteRSVPs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#91A77D]">
                          {tr(
                            'لا توجد تأكيدات حضور مطابقة لخيارات البحث الحالية.',
                            'No matching RSVP records found.'
                          )}
                        </td>
                      </tr>
                    ) : (
                      currentInviteRSVPs.map((r) => (
                        <tr key={r.id} className="hover:bg-[#F8F6EF] transition-colors">
                          <td className="py-3 px-4 font-bold text-[#566B49]">{r.guestName}</td>
                          <td className="py-3 px-4 font-mono text-[#566B49] dir-ltr">
                            {r.phone || '—'}
                          </td>
                          <td className="py-3 px-4">
                            {r.status === 'attending' ? (
                              <span className="inline-flex items-center gap-1 text-[#566B49] font-semibold">
                                <CheckCircle2 size={13} className="text-[#91A77D]" />{' '}
                                {tr('مؤكد الحضور', 'Attending')}
                              </span>
                            ) : r.status === 'declined' ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                                <XCircle size={13} /> {tr('معتذر', 'Declined')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#91A77D] font-semibold">
                                <HelpCircle size={13} /> {tr('ربما', 'Tentative')}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#566B49]">
                            {r.status === 'attending'
                              ? `${r.companionsCount} ${tr('أفراد', 'guests')}`
                              : '0'}
                          </td>
                          <td className="py-3 px-4 text-[#566B49]/85 max-w-xs truncate">
                            {r.note || '—'}
                          </td>
                          <td className="py-3 px-4 text-[#91A77D] font-mono text-[11px]">
                            {new Date(r.createdAt).toLocaleDateString(
                              lang === 'ar' ? 'ar-IQ' : 'en-US'
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Guestbook Moderation */}
        {activeTab === 'guestbook' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guestbook.map((gb) => (
              <div
                key={gb.id}
                className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#566B49]">{gb.senderName}</span>
                      {gb.approved === false ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-bold">
                          {tr('بانتظار الموافقة', 'Pending Approval')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#DCE8CB] text-[#566B49] text-[10px] font-bold">
                          {tr('منشور ✓', 'Published ✓')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#91A77D] font-mono">
                      {new Date(gb.createdAt).toLocaleDateString(
                        lang === 'ar' ? 'ar-IQ' : 'en-US'
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-[#566B49]/90 leading-relaxed font-cairo">
                    «{gb.message}»
                  </p>
                  {gb.photoUrl && (
                    <img
                      src={gb.photoUrl}
                      alt={gb.senderName}
                      className="max-h-36 rounded-xl border border-[#E9DDC9] object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E9DDC9]">
                  {gb.approved === false && onApproveGuestbookMessage ? (
                    <button
                      type="button"
                      onClick={() => onApproveGuestbookMessage(gb.id)}
                      className="px-3 py-1 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>{tr('موافقة على النشر', 'Approve & Publish')}</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  {onDeleteGuestbookMessage && (
                    <button
                      onClick={() => onDeleteGuestbookMessage(gb.id)}
                      className="text-xs text-rose-700 hover:text-rose-800 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>{tr('حذف التعليق', 'Delete Message')}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Seating Plan Manager */}
        {activeTab === 'seating' && currentInvite && (
          <SeatingManager
            invitation={currentInvite}
            rsvps={rsvps.filter((r) => r.invitationId === currentInvite.id)}
            tables={tables.filter((t) => t.invitationId === currentInvite.id)}
            onAddTable={onAddTable || (() => {})}
            onDeleteTable={onDeleteTable || (() => {})}
            onAssignGuest={onAssignGuest || (() => {})}
          />
        )}

        {/* TAB 5: WhatsApp Direct Inviter */}
        {activeTab === 'whatsapp' && currentInvite && (
          <WhatsAppInviter
            invitation={currentInvite}
            rsvps={rsvps.filter((r) => r.invitationId === currentInvite.id)}
          />
        )}
      </div>
    </div>
  );
};
