import React from 'react';

export type MagicEffectType =
  | 'magic_sparkles'
  | 'rose_petals'
  | 'butterflies'
  | 'constellation'
  | 'fairy_dust'
  | 'bloom_effect'
  | 'heartbeat'
  | 'hidden_messages'
  | 'magic_ripple'
  | 'shooting_star'
  | 'bubble_effect'
  | 'heart_drawing';

export type MagicEffectSelectionMode = 'auto_cycle' | MagicEffectType;

export interface InvitationClickEffectOption {
  id: 'none' | MagicEffectType | 'auto_cycle';
  labelAr: string;
  shortAr: string;
  descAr: string;
  symbol: string;
  accentColor: string;
}

export const INVITATION_CLICK_EFFECT_OPTIONS: InvitationClickEffectOption[] = [
  {
    id: 'none',
    labelAr: 'بدون تفاعل عند النقر (افتراضي هادئ)',
    shortAr: 'بدون تفاعل',
    descAr: 'الاكتفاء بالتفاعل الافتتاحي الرئيسي للدعوة فقط',
    symbol: '—',
    accentColor: '#A98445',
  },
  {
    id: 'magic_sparkles',
    labelAr: 'بريق ذهبي ناعم',
    shortAr: 'بريق ذهبي',
    descAr: 'ذرات ذهبية هادئة داخل الدعوة فقط',
    symbol: '✦',
    accentColor: '#D6B574',
  },
  {
    id: 'rose_petals',
    labelAr: 'بتلات الورد الملكية',
    shortAr: 'بتلات الورد',
    descAr: 'بتلات ورد ناعمة داخل الدعوة فقط',
    symbol: '❀',
    accentColor: '#D6B574',
  },
  {
    id: 'heartbeat',
    labelAr: 'نبض رومانسي هادئ',
    shortAr: 'نبض هادئ',
    descAr: 'تأثير رومانسي خفيف داخل الدعوة فقط',
    symbol: '♡',
    accentColor: '#D6B574',
  },
];

export type ClickEffectSpeed = 'slow' | 'medium' | 'fast';

export interface ClickEffectSpeedOption {
  id: ClickEffectSpeed;
  sliderIndex: 0 | 1 | 2;
  labelAr: string;
  labelEn: string;
  shortAr: string;
  descAr: string;
  descEn: string;
  multiplierLabel: string;
}

export const CLICK_SPEED_MULTIPLIER: Record<ClickEffectSpeed, number> = {
  slow: 1.6,
  medium: 1.0,
  fast: 0.58,
};

export const CLICK_EFFECT_SPEED_OPTIONS: ClickEffectSpeedOption[] = [
  {
    id: 'slow',
    sliderIndex: 0,
    labelAr: 'بطيء (هادئ)',
    labelEn: 'Slow (Calm)',
    shortAr: 'بطيء',
    descAr: 'حركة هادئة وناعمة',
    descEn: 'Calm and gentle motion',
    multiplierLabel: '0.6x',
  },
  {
    id: 'medium',
    sliderIndex: 1,
    labelAr: 'متوسط (متوازن)',
    labelEn: 'Medium (Balanced)',
    shortAr: 'متوسط',
    descAr: 'سرعة متوازنة وأنيقة',
    descEn: 'Balanced standard speed',
    multiplierLabel: '1.0x',
  },
  {
    id: 'fast',
    sliderIndex: 2,
    labelAr: 'سريع',
    labelEn: 'Fast',
    shortAr: 'سريع',
    descAr: 'استجابة سريعة',
    descEn: 'Quick response',
    multiplierLabel: '1.5x',
  },
];

export function dispatchClickEffectPreview(
  _effectType?: 'none' | MagicEffectType | 'auto_cycle',
  _clientX?: number,
  _clientY?: number,
  _speed: ClickEffectSpeed = 'medium'
): void {
  // Website-wide decorative click effects are intentionally disabled per Part 3 & Part 5.
}

/**
 * Website-wide decorative interactions (click hearts, falling symbols, corner ornaments,
 * and the fixed left-side floating widget) are removed so the main Maraseem platform
 * stays clean, minimal, and free of mobile horizontal overflow.
 * All creative 3D interactions live strictly inside the opened invitation.
 */
export const MaraseemMagicEffectsSystem: React.FC = () => {
  return null;
};
