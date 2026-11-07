import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { InvitationData, RSVPRecord, GuestbookMessage } from '../../types/invitation';
import { InteractiveInvitationView } from '../invitation-experience/InteractiveInvitationView';

interface PreviewModalProps {
  invitation: InvitationData;
  onClose: () => void;
  onSaveRSVP: (rsvp: Omit<RSVPRecord, 'id' | 'createdAt'>) => void;
  onAddGuestbook: (msg: Omit<GuestbookMessage, 'id' | 'createdAt'>) => void;
  guestbookMessages: GuestbookMessage[];
  existingRSVPs: RSVPRecord[];
  onOpenEditor?: () => void;
}

export const InvitationPreviewModal: React.FC<PreviewModalProps> = ({
  invitation,
  onClose,
  onSaveRSVP,
  onAddGuestbook,
  guestbookMessages,
  existingRSVPs,
  onOpenEditor,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="relative w-full max-w-4xl my-auto">
        {/* Top Floating Control Bar */}
        <div className="flex items-center justify-between pb-3 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-neutral-300 font-cairo">
              معاينة تجربة المدعو الفعلية
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenEditor && (
              <button
                onClick={onOpenEditor}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors font-cairo"
              >
                تخصيص هذا القالب
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="إغلاق المعاينة"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* The Real Interactive Multi-Scene Viewer */}
        <InteractiveInvitationView
          invitation={invitation}
          onSaveRSVP={onSaveRSVP}
          onAddGuestbook={onAddGuestbook}
          guestbookMessages={guestbookMessages}
          existingRSVPs={existingRSVPs}
        />
      </div>
    </div>
  );
};
