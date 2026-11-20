"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ar } from '@/dictionaries/ar';
import { en } from '@/dictionaries/en';

export type Locale = 'ar' | 'en';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  dict: typeof ar;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
}

const dictionaries: Record<Locale, typeof ar> = { ar, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLocale = 'ar',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    // Check cookie or localStorage on client mount
    const saved = localStorage.getItem('yuri_lang') as Locale | null;
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = initialLocale;
      document.documentElement.dir = initialLocale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [initialLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('yuri_lang', newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLocale = () => {
    const next = locale === 'ar' ? 'en' : 'ar';
    setLocale(next);
  };

  const dict = dictionaries[locale] || dictionaries.ar;
  const isRTL = locale === 'ar';
  const dir: 'rtl' | 'ltr' = isRTL ? 'rtl' : 'ltr';

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let current: any = dict;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to Arabic dict if key missing in current dict
        let fallback: any = dictionaries.ar;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            fallback = path;
            break;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return path;
    }

    if (params) {
      let result = current;
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      }
      return result;
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t, dict, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components rendered outside provider
    return {
      locale: 'ar' as Locale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: (path: string) => path,
      dict: ar,
      isRTL: true,
      dir: 'rtl' as const,
    };
  }
  return context;
}
