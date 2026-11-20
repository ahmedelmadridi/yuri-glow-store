"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getAllConcerns } from '@/data/concerns';
import styles from './ShopByConcern.module.css';

function ConcernIcon({ icon, color }: { icon: string; color: string }) {
  switch (icon) {
    case 'acne':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'pores':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="7" cy="12" r="1" fill={color} />
          <circle cx="17" cy="12" r="1" fill={color} />
          <circle cx="12" cy="7" r="1" fill={color} />
          <circle cx="12" cy="17" r="1" fill={color} />
        </svg>
      );
    case 'sparkle':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
        </svg>
      );
    case 'drop':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          <path d="M12 12a4 4 0 0 0 4 4" />
        </svg>
      );
    case 'leaf':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
    case 'time':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
          <path d="M18 4l2-2" />
          <path d="M6 4L4 2" />
        </svg>
      );
    case 'eye':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'hair':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v18" />
          <path d="M18 3v18" />
          <path d="M6 8c3-3 9-3 12 0" />
          <path d="M6 13c3-3 9-3 12 0" />
          <path d="M6 18c3-3 9-3 12 0" />
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export default function ShopByConcern() {
  const { t, locale, isRTL } = useLanguage();
  const concerns = getAllConcerns(locale);

  return (
    <section className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>
            <span>✨</span>
            <span>{locale === 'en' ? 'Targeted Solutions' : 'حلول مخصصة لبشرتك'}</span>
          </span>
          <h2 className={styles.title}>{t('concerns.sectionTitle')}</h2>
          <p className={styles.subtitle}>{t('concerns.sectionSubtitle')}</p>
        </div>

        <div className={styles.grid}>
          {concerns.map((concern) => (
            <Link
              key={concern.id}
              href={`/products?concern=${concern.id}`}
              className={styles.card}
              style={{
                background: concern.bgGradient,
              }}
            >
              <div className={styles.cardTop}>
                <div
                  className={styles.iconWrapper}
                  style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  <ConcernIcon icon={concern.icon} color={concern.accentColor} />
                </div>
                <span className={styles.productCount}>
                  {concern.productIds.length} {locale === 'en' ? 'items' : 'منتج'}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{concern.displayName}</h3>
              <p className={styles.cardDesc}>{concern.displaySubtitle}</p>

              <div className={styles.cardAction} style={{ color: concern.accentColor }}>
                <span>{locale === 'en' ? 'Explore Products' : 'تسوقي المنتجات'}</span>
                <span className={styles.arrowIcon}>
                  {isRTL ? '←' : '→'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
