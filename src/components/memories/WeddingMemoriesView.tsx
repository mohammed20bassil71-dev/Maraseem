import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Film,
  Heart,
  MessageSquare,
  Plus,
  Share2,
  Sparkles,
  Upload,
  CheckCircle2,
  Eye,
  Calendar,
  MapPin,
  Crown,
} from 'lucide-react';
import {
  GuestbookMessage,
  InvitationData,
  WeddingMemoriesConfig,
  WeddingMemoryMedia,
} from '../../types/invitation';
import { DEFAULT_WEDDING_MEMORIES } from '../../data/platformData';
import { buildShareableInvitationUrl } from '../../utils/shareLink';
import { useLanguage } from '../../i18n/LanguageContext';

interface WeddingMemoriesViewProps {
  invitation: InvitationData;
  guestbook: GuestbookMessage[];
  onAddGuestbook?: (msg: Omit<GuestbookMessage, 'id' | 'createdAt'>) => void;
  onUpdateInvitation?: (updated: InvitationData) => void;
  onBackToInvitation?: () => void;
  isHostMode?: boolean;
}

export const WeddingMemoriesView: React.FC<WeddingMemoriesViewProps> = ({
  invitation,
  guestbook,
  onAddGuestbook,
  onUpdateInvitation,
  onBackToInvitation,
  isHostMode = false,
}) => {
  const { lang, tr } = useLanguage();
  const memories: WeddingMemoriesConfig = invitation.memoriesConfig || DEFAULT_WEDDING_MEMORIES;
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'guestbook' | 'upload'>('photos');
  const [newCaption, setNewCaption] = useState('');
  const [newUploader, setNewUploader] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'photo' | 'video'>('photo');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Guestbook form
  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Thank you note editing for host
  const [editingThankYou, setEditingThankYou] = useState(false);
  const [thankYouTitle, setThankYouTitle] = useState(memories.thankYouTitle);
  const [thankYouMessage, setThankYouMessage] = useState(memories.thankYouMessage);

  const mediaList = memories.mediaItems?.length
    ? memories.mediaItems
    : DEFAULT_WEDDING_MEMORIES.mediaItems;

  const photos = mediaList.filter((m) => m.type === 'photo');
  const videos = mediaList.filter((m) => m.type === 'video');

  const handleTogglePostEventMode = () => {
    if (!onUpdateInvitation) return;
    const nextState = !memories.isPostEventActive;
    onUpdateInvitation({
      ...invitation,
      memoriesConfig: {
        ...memories,
        enabled: true,
        isPostEventActive: nextState,
        mediaItems: mediaList,
      },
    });
  };

  const handleSaveThankYou = () => {
    if (!onUpdateInvitation) return;
    onUpdateInvitation({
      ...invitation,
      memoriesConfig: {
        ...memories,
        thankYouTitle,
        thankYouMessage,
        mediaItems: mediaList,
      },
    });
    setEditingThankYou(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    setNewMediaType(isVideo ? 'video' : 'photo');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewMediaUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim() || !newCaption.trim()) return;
    const item: WeddingMemoryMedia = {
      id: `mem-${Date.now()}`,
      type: newMediaType,
      url: newMediaUrl.trim(),
      caption: newCaption.trim(),
      uploadedBy: newUploader.trim() || tr('ضيف محب', 'Loving Guest'),
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (onUpdateInvitation) {
      onUpdateInvitation({
        ...invitation,
        memoriesConfig: {
          ...memories,
          mediaItems: [item, ...mediaList],
        },
      });
    }
    setNewCaption('');
    setNewMediaUrl('');
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setActiveTab(newMediaType === 'video' ? 'videos' : 'photos');
    }, 1500);
  };

  const handleShareMemories = () => {
    const updatedInvite: InvitationData = {
      ...invitation,
      memoriesConfig: {
        ...memories,
        isPostEventActive: true,
      },
    };
    const url = buildShareableInvitationUrl(updatedInvite);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full rounded-3xl border border-[#E9DDC9] bg-[#FFFDF8] text-[#566B49] shadow-lg overflow-hidden">
      {/* Top VIP Banner */}
      <div className="bg-[#566B49] text-[#FFFDF8] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#B9CCA0]/25 border border-[#DCE8CB]/40 flex items-center justify-center text-[#DCE8CB]">
            <Crown size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-[#DCE8CB]">
                {tr('نظام الذكريات الخالدة', 'Eternal Wedding Memories')}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B9CCA0]/30 text-[#FFFDF8] border border-[#DCE8CB]/30">
                {tr('بعد انتهاء المناسبة', 'Post-Event Album')}
              </span>
            </div>
            <p className="text-[11px] text-[#F8F6EF]/85">
              {tr(
                'تحوّل رابط الدعوة إلى ألبوم ذكريات تفاعلي يجمع الصور والفيديو وتهاني الأحبة',
                'Transform the invitation link into an interactive memory album of photos, videos, and guest wishes'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isHostMode && onUpdateInvitation && (
            <button
              type="button"
              onClick={handleTogglePostEventMode}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                memories.isPostEventActive
                  ? 'bg-[#B9CCA0] text-[#566B49] shadow-sm'
                  : 'bg-[#FFFDF8]/15 text-[#FFFDF8] border border-[#FFFDF8]/25 hover:bg-[#FFFDF8]/25'
              }`}
            >
              <Sparkles size={14} />
              <span>
                {memories.isPostEventActive
                  ? tr('وضع الذكريات مفعّل على رابط الدعوة ✓', 'Memories Mode Active on Link ✓')
                  : tr('تفعيل تحويل رابط الدعوة إلى ذكريات', 'Convert Invite Link to Memories Album')}
              </span>
            </button>
          )}

          {onBackToInvitation && (
            <button
              type="button"
              onClick={onBackToInvitation}
              className="px-3.5 py-2 rounded-xl bg-[#FFFDF8]/15 hover:bg-[#FFFDF8]/25 text-[#FFFDF8] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Eye size={14} />
              <span>{tr('عرض بطاقة الدعوة الأصلية', 'View Original Invitation Card')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShareMemories}
            className="px-3.5 py-2 rounded-xl bg-[#F8F6EF] text-[#566B49] hover:bg-[#DCE8CB] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Share2 size={14} />
            <span>
              {copiedLink
                ? tr('تم نسخ رابط الذكريات ✓', 'Memories Link Copied ✓')
                : tr('مشاركة ألبوم الذكريات', 'Share Memories Album')}
            </span>
          </button>
        </div>
      </div>

      {/* Hero Thank You Section */}
      <div className="p-6 sm:p-10 text-center border-b border-[#E9DDC9] bg-gradient-to-b from-[#F8F6EF] to-[#FFFDF8] space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DCE8CB]/65 border border-[#B9CCA0] text-[#566B49] text-xs font-bold">
          <Heart size={13} className="text-[#566B49] fill-[#566B49]" />
          <span>{invitation.title}</span>
          <span>•</span>
          <span className="font-mono">{invitation.eventDate}</span>
        </div>

        {editingThankYou ? (
          <div className="max-w-xl mx-auto space-y-3 bg-[#FFFDF8] p-4 rounded-2xl border border-[#B9CCA0] text-start">
            <label className="block text-xs font-bold text-[#566B49]">
              {tr('عنوان رسالة الشكر:', 'Thank You Title:')}
            </label>
            <input
              type="text"
              value={thankYouTitle}
              onChange={(e) => setThankYouTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9DDC9] bg-[#F8F6EF] text-sm font-bold text-[#566B49]"
            />
            <label className="block text-xs font-bold text-[#566B49]">
              {tr('نص رسالة الشكر للضيوف:', 'Thank You Message to Guests:')}
            </label>
            <textarea
              rows={3}
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9DDC9] bg-[#F8F6EF] text-xs text-[#566B49]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingThankYou(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#6E8261]"
              >
                {tr('إلغاء', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveThankYou}
                className="px-4 py-1.5 rounded-lg bg-[#566B49] text-[#FFFDF8] text-xs font-bold"
              >
                {tr('حفظ رسالة الشكر', 'Save Message')}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold font-amiri text-[#566B49]">
              {memories.thankYouTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#6E8261] leading-relaxed">
              «{memories.thankYouMessage}»
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-[#91A77D] font-semibold pt-1">
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {invitation.venueName} - {invitation.city}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} /> {invitation.eventDate}
              </span>
            </div>
            {isHostMode && (
              <button
                type="button"
                onClick={() => setEditingThankYou(true)}
                className="text-xs text-[#566B49] underline hover:text-[#91A77D] cursor-pointer"
              >
                {tr('تعديل رسالة الشكر للضيوف ✎', 'Edit Thank You Message ✎')}
              </button>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-[#566B49] text-[#FFFDF8] shadow-sm'
                : 'bg-[#FFFDF8] text-[#566B49] border border-[#E9DDC9] hover:bg-[#DCE8CB]/40'
            }`}
          >
            <Camera size={15} />
            <span>{tr('ألبوم الصور', 'Photo Album')} ({photos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-[#566B49] text-[#FFFDF8] shadow-sm'
                : 'bg-[#FFFDF8] text-[#566B49] border border-[#E9DDC9] hover:bg-[#DCE8CB]/40'
            }`}
          >
            <Film size={15} />
            <span>{tr('مقاطع الفيديو', 'Video Clips')} ({videos.length + 1})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guestbook')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'guestbook'
                ? 'bg-[#566B49] text-[#FFFDF8] shadow-sm'
                : 'bg-[#FFFDF8] text-[#566B49] border border-[#E9DDC9] hover:bg-[#DCE8CB]/40'
            }`}
          >
            <MessageSquare size={15} />
            <span>{tr('دفتر الضيوف والتهاني', 'Guestbook & Wishes')} ({guestbook.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#566B49] text-[#FFFDF8] shadow-sm'
                : 'bg-[#B9CCA0] text-[#566B49] hover:bg-[#566B49] hover:text-[#FFFDF8]'
            }`}
          >
            <Upload size={15} />
            <span>{tr('شاركنا صورة أو ذكرى من الحفل +', 'Share a Photo or Memory +')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8 bg-[#F8F6EF]">
        <AnimatePresence mode="wait">
          {/* TAB 1: Photos */}
          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
            >
              {photos.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] overflow-hidden shadow-xs hover:shadow-md transition-all"
                >
                  <div className="aspect-16/10 overflow-hidden bg-[#F8F6EF] relative">
                    <img
                      src={item.url}
                      alt={item.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FFFDF8]/90 backdrop-blur-sm text-[#566B49] border border-[#E9DDC9] text-[10px] font-bold">
                      {tr('بعدسة:', 'By:')} {item.uploadedBy}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-bold text-[#566B49]">{item.caption}</p>
                    <span className="text-[11px] font-mono text-[#91A77D] shrink-0">
                      {item.createdAt}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 2: Videos */}
          {activeTab === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#566B49] flex items-center gap-2">
                    <Film size={18} className="text-[#91A77D]" />
                    <span>{tr('الفيلم القصير لتوثيق ليلة العمر', 'Event Highlight Reel')}</span>
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#DCE8CB] text-[#566B49] font-bold">
                    {tr('جودة فائقة', 'Ultra HD')}
                  </span>
                </div>

                {invitation.backgroundVideoUrl ? (
                  <video
                    src={invitation.backgroundVideoUrl}
                    controls
                    className="w-full rounded-xl aspect-video object-cover bg-black"
                  />
                ) : (
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#566B49] flex flex-col items-center justify-center text-center p-6">
                    <img
                      src={photos[0]?.url}
                      alt="Highlight Cover"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="relative z-10 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-[#B9CCA0] text-[#566B49] flex items-center justify-center mx-auto shadow-lg">
                        <Film size={28} />
                      </div>
                      <h4 className="text-lg font-bold text-[#FFFDF8]">
                        {tr('ملخص لحظات الفرح والزفة الملكية', 'Highlights of Joy & Celebration')}
                      </h4>
                      <p className="text-xs text-[#F8F6EF] max-w-md">
                        {tr(
                          'يمكن لصاحب المناسبة أو الضيوف رفع مقاطع الفيديو القصيرة من الحفل لتظهر هنا بجودة عالية.',
                          'The host or guests can upload short video clips from the celebration to display here in high quality.'
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 rounded-xl bg-[#FFFDF8] text-[#566B49] text-xs font-bold cursor-pointer"
                      >
                        {tr('رفع مقطع فيديو من الحفل الآن', 'Upload a Video Clip Now')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {videos.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-3">
                  <video src={v.url} controls className="w-full rounded-xl max-h-96 bg-black" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#566B49]">{v.caption}</span>
                    <span className="text-[#91A77D]">{tr('مشاركة:', 'Shared by:')} {v.uploadedBy}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 3: Guestbook & Congratulations */}
          {activeTab === 'guestbook' && (
            <motion.div
              key="guestbook"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {onAddGuestbook && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!senderName.trim() || !messageText.trim()) return;
                    onAddGuestbook({
                      invitationId: invitation.id,
                      senderName: senderName.trim(),
                      message: messageText.trim(),
                    });
                    setSenderName('');
                    setMessageText('');
                  }}
                  className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-3"
                >
                  <h4 className="text-sm font-bold text-[#566B49]">
                    {tr(
                      'اترك كلمة تذكارية وتهنئة تبقى في ألبوم الذكريات 💌',
                      'Leave a memorable wish in the celebration album 💌'
                    )}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder={tr('اسمك الكريم أو اسم العائلة...', 'Your name or family name...')}
                      className="px-3.5 py-2 rounded-xl border border-[#E9DDC9] bg-[#F8F6EF] text-xs text-[#566B49]"
                    />
                    <input
                      type="text"
                      required
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={tr('اكتب تهنئتك أو أجمل لحظة أعجبتك في الحفل...', 'Write your congratulations or favorite moment...')}
                      className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-[#E9DDC9] bg-[#F8F6EF] text-xs text-[#566B49]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] text-xs font-bold cursor-pointer transition-all"
                    >
                      {tr('تخليد التهنئة في دفتر الذكريات', 'Save Wish to Memories Book')}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {guestbook.map((gb) => (
                  <div
                    key={gb.id}
                    className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#566B49]">{gb.senderName}</span>
                      <span className="text-[10px] font-mono text-[#91A77D]">
                        {new Date(gb.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-US')}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E8261] leading-relaxed">«{gb.message}»</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: Upload Photo/Video */}
          {activeTab === 'upload' && (
            <motion.form
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAddMemorySubmit}
              className="max-w-xl mx-auto p-6 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC9] space-y-4"
            >
              <h3 className="text-base font-bold text-[#566B49] flex items-center gap-2">
                <Plus size={18} className="text-[#91A77D]" />
                <span>{tr('إضافة صورة أو فيديو إلى ألبوم ذكريات المناسبة', 'Add a Photo or Video to Event Memories')}</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#566B49] mb-1">
                  {tr('اسم المشارك (صاحب الصورة):', 'Contributor Name:')}
                </label>
                <input
                  type="text"
                  required
                  value={newUploader}
                  onChange={(e) => setNewUploader(e.target.value)}
                  placeholder={tr('مثال: خال العريس أبو مصطفى / المصور', 'e.g., Uncle Abu Mustafa / Photographer')}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E9DDC9] bg-[#F8F6EF] text-xs text-[#566B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#566B49] mb-1">
                  {tr('وصف اللقطة أو الذكرى:', 'Caption or Memory Description:')}
                </label>
                <input
                  type="text"
                  required
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder={tr('مثال: لقطة جماعية مع أصدقاء العريس...', 'e.g., Group photo with the groom’s friends...')}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E9DDC9] bg-[#F8F6EF] text-xs text-[#566B49]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#566B49]">
                  {tr('اختر ملف صورة أو فيديو من جهازك أو ضع رابطاً مباشراً:', 'Choose a photo/video file from your device or paste a direct URL:')}
                </label>
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={handleFileUpload}
                  className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#B9CCA0] file:text-[#566B49] file:font-bold"
                />
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder={tr('أو الصق رابط الصورة المباشر هنا...', 'Or paste direct image URL here (https://...)')}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E9DDC9] bg-[#F8F6EF] text-xs dir-ltr text-[#566B49]"
                />
              </div>

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-[#DCE8CB] border border-[#91A77D] text-[#566B49] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{tr('تمت إضافة الذكرى إلى الألبوم بنجاح!', 'Memory added to the album successfully!')}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#B9CCA0] hover:bg-[#566B49] text-[#566B49] hover:text-[#FFFDF8] font-bold text-xs shadow-xs cursor-pointer transition-all"
              >
                {tr('نشر في ألبوم الذكريات', 'Publish to Memories Album')}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
