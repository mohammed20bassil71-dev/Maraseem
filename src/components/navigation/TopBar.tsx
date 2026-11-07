import React from 'react';
import { Sparkles, Shield, User } from 'lucide-react';

interface TopBarProps {
  onGoHome: () => void;
  onGoCategories: () => void;
  onGoTemplates: () => void;
  onGoPricing: () => void;
  onGoDashboard: () => void;
  onGoAdmin: () => void;
  onCreateInvite: () => void;
  currentView: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onGoHome,
  onGoCategories,
  onGoTemplates,
  onGoPricing,
  onGoDashboard,
  onGoAdmin,
  onCreateInvite,
  currentView,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark in display face */}
      <button
        onClick={onGoHome}
        className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-amber-300 transition-colors font-cairo flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300" />
        <span>مراسيم · MARASEEM</span>
      </button>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
        <button
          onClick={onGoHome}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'home' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          الرئيسية
        </button>
        <button
          onClick={onGoCategories}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
        >
          المناسبات
        </button>
        <button
          onClick={onGoTemplates}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
        >
          مكتبة القوالب
        </button>
        <button
          onClick={onGoPricing}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
        >
          الباقات والأسعار
        </button>
        <button
          onClick={onGoDashboard}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentView === 'dashboard' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          <User size={14} />
          <span>لوحة تحكمي</span>
        </button>
        <button
          onClick={onGoAdmin}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-xs text-neutral-400 ${
            currentView === 'admin' ? 'text-red-400 font-semibold' : ''
          }`}
          title="لوحة الإدارة"
        >
          <Shield size={13} />
          <span>الإدارة</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onCreateInvite}
          className="px-4 py-2 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-full hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Sparkles size={14} />
          <span>اصنع دعوتك الآن</span>
        </button>
      </div>
    </header>
  );
};
