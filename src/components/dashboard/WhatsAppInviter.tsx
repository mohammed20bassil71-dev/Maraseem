import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  Copy,
  Check,
  Sparkles,
  Users,
  Search,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { InvitationData, RSVPRecord } from '../../types/invitation';
import { buildShareableInvitationUrl } from '../../utils/shareLink';

interface WhatsAppInviterProps {
  invitation: InvitationData;
  rsvps: RSVPRecord[];
}

export const WhatsAppInviter: React.FC<WhatsAppInviterProps> = ({
  invitation,
  rsvps,
}) => {
  const [tone, setTone] = useState<'formal' | 'warm' | 'friendly'>('formal');
  const [customGuestName, setCustomGuestName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const inviteUrl = buildShareableInvitationUrl(invitation);

  const getMessageText = (guestName: string) => {
    const greetingName = guestName.trim() ? guestName.trim() : 'ضيوفنا الأعزاء';

    if (tone === 'formal') {
      return (
        `السلام عليكم ورحمة الله وبركاته،\n\n` +
        `حضرة الفاضل/ة: ${greetingName} المحترم/ة 🕊️\n\n` +
        `يتشرف الداعون بدعوتكم لحضور ${invitation.title}، ومشاركتنا أبهى لحظات الفرح والسرور.\n\n` +
        `📅 الموعد: ${invitation.eventDate} | ${invitation.eventTime || '08:00 مساءً'}\n` +
        `📍 المكان: ${invitation.venueName} - ${invitation.city}\n\n` +
        `لمشاهدة بطاقة الدعوة التفاعلية وتأكيد الحضور (RSVP) يسعدنا زيارتكم للرابط أدناه:\n` +
        `${inviteUrl}\n\n` +
        `حضوركم شرف لنا ويزيد بهجتنا ✨`
      );
    } else if (tone === 'warm') {
      return (
        `أهلاً وسهلاً بالغالي/ة ${greetingName} 🌸\n\n` +
        `فرحتنا ما تكتمل إلا بوجودكم معنا، بكل محبة وسرور ندعوكم لمشاركتنا فرحة ${invitation.title}.\n\n` +
        `✨ الموعد: ${invitation.eventDate} الساعة ${invitation.eventTime || '08:00 مساءً'}\n` +
        `🏛️ الصالة: ${invitation.venueName} (${invitation.city})\n\n` +
        `فتحنا لكم دعوة رقمية خاصة مع تفاصيل المكان والعد التنازلي:\n` +
        `${inviteUrl}\n\n` +
        `ننتظركم بكل شوق وفرحة ❤️`
      );
    } else {
      return (
        `أحلى تحية لـ ${greetingName}! 🎉✨\n\n` +
        `قرب الموعد والحماس واصل حده! لازم تكون ويانا ونحتفل سوا بـ ${invitation.title} 🥳\n\n` +
        `🗓️ التاريخ: ${invitation.eventDate}\n` +
        `📍 المكان: ${invitation.venueName}\n\n` +
        `شوف الدعوة التفاعلية واللوكيشن من الرابط وأكد لنا حضورك:\n` +
        `${inviteUrl}\n\n` +
        `يلا نلتقي هناك ونسويها ليلة للتاريخ! 🔥`
      );
    }
  };

  const handleSendToCustom = () => {
    if (!customPhone.trim()) return;
    const cleanPhone = customPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(getMessageText(customGuestName || 'ضيفنا الكريم'));
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank');
  };

  const handleSendToGuest = (guest: RSVPRecord) => {
    const cleanPhone = guest.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(getMessageText(guest.guestName));
    const targetUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`
      : `https://api.whatsapp.com/send?text=${message}`;
    window.open(targetUrl, '_blank');
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-cairo">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="text-emerald-400" size={22} />
            <span>مولّد رسائل واتساب الذكية المخصصة بالأسماء</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              VIP WhatsApp Inviter
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            أرسل دعوات مخصصة لكل ضيف باسمه بنقرة واحدة عبر تطبيق واتساب بدلاً من الرسائل العشوائية المكررة.
          </p>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          {[
            { id: 'formal', label: 'رسمي وفخم' },
            { id: 'warm', label: 'عائلي ومحب' },
            { id: 'friendly', label: 'شبابي وحماسي' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tone === t.id
                  ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Single Sender Box */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Smartphone size={16} className="text-emerald-400" />
          <span>إرسال دعوة فورية سريعة لرقم محدد</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="اسم الضيف (مثال: أ.د. سامر الكرخي)"
            value={customGuestName}
            onChange={(e) => setCustomGuestName(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />

          <input
            type="tel"
            placeholder="رقم هاتف الواتساب (مثال: +9647701234567)"
            value={customPhone}
            onChange={(e) => setCustomPhone(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={handleSendToCustom}
            disabled={!customPhone.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-40 transition-all shadow"
          >
            <Send size={14} />
            <span>فتح واتساب وإرسال الدعوة المخصصة</span>
          </button>
        </div>

        {/* Live Message Preview */}
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs text-neutral-300 font-mono whitespace-pre-line leading-relaxed relative">
          <div className="text-[10px] text-emerald-400 font-semibold mb-1 uppercase tracking-wider">
            معاينة نص الرسالة الذكية:
          </div>
          {getMessageText(customGuestName || 'اسم الضيف الكريم')}

          <button
            onClick={() => handleCopyMessage('preview', getMessageText(customGuestName || 'اسم الضيف الكريم'))}
            className="absolute top-3 left-3 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] flex items-center gap-1"
          >
            {copiedId === 'preview' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copiedId === 'preview' ? 'تم النسخ' : 'نسخ النص'}</span>
          </button>
        </div>
      </div>

      {/* Guest List Broadcast Table */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users size={16} className="text-amber-400" />
            <span>قائمة الضيوف لإرسال الدعوات المخصصة ({rsvps.length})</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="بحث في أسماء الضيوف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {rsvps.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-neutral-950/40 border border-neutral-800 text-neutral-400 text-xs">
            لا توجد جهات اتصال مسجلة في سجل الحضور بعد. يمكنك الإرسال مباشرة بالرقم أعلاه أو مشاركة الرابط العام.
          </div>
        ) : (
          <div className="space-y-2">
            {rsvps
              .filter(
                (r) =>
                  r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.phone.includes(searchQuery)
              )
              .map((guest) => (
                <div
                  key={guest.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{guest.guestName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          guest.status === 'attending'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : guest.status === 'declined'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {guest.status === 'attending'
                          ? 'مؤكد الحضور'
                          : guest.status === 'declined'
                          ? 'معتذر'
                          : 'بانتظار الرد'}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">{guest.phone}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleCopyMessage(guest.id, getMessageText(guest.guestName))
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-all"
                      title="نسخ الرسالة المخصصة"
                    >
                      {copiedId === guest.id ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span>{copiedId === guest.id ? 'تم النسخ' : 'نسخ'}</span>
                    </button>

                    <button
                      onClick={() => handleSendToGuest(guest)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                    >
                      <MessageCircle size={14} />
                      <span>إرسال عبر واتساب</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
