"use client";

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={locale === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
      title={locale === 'ar' ? 'English' : 'عربي'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '20px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg, #FDFCF0)',
        color: 'var(--color-text)',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all var(--transition-fast, 0.2s ease)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.color = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.color = 'var(--color-text)';
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
    </button>
  );
}
