"use client";

import styles from './page.module.css';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutClient() {
  const { t } = useLanguage();

  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <h1 className={styles.title}>{t('about.title')}</h1>
      
      <div className={styles.content}>
        <div className={styles.imageSection}>
          <img src="/logo.png" alt="Yuri Glow Logo" className={styles.mainImage} style={{ objectFit: 'contain', padding: '20px', backgroundColor: 'var(--color-bg)' }} />
        </div>
        
        <div className={styles.textSection}>
          <h2>{t('about.storyTitle')}</h2>
          <p>{t('about.storyP1')}</p>
          <p>{t('about.storyP2')}</p>
          
          <h3>{t('about.missionTitle')}</h3>
          <p>{t('about.missionP')}</p>

          <Link href="/products" className="btn-primary" style={{ display: 'inline-block', marginTop: 'var(--spacing-lg)' }}>
            {t('about.browseBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
