import { useState, useEffect } from 'react';

const STORAGE_KEY = 'maraseem_royal_dark_mode';
const EVENT_NAME = 'maraseem-dark-mode-change';

export function getInitialRoyalDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setRoyalDarkMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent<boolean>(EVENT_NAME, { detail: enabled }));
  } catch {
    // ignore storage errors
  }
}

export function useRoyalDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState<boolean>(getInitialRoyalDarkMode);

  useEffect(() => {
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsDark(Boolean(customEvent.detail));
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setIsDark(e.newValue === 'true');
      }
    };

    window.addEventListener(EVENT_NAME, handleCustom);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleDark = () => {
    setRoyalDarkMode(!isDark);
  };

  return [isDark, toggleDark];
}
