"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { getAllConcerns } from '@/data/concerns';
import styles from './ShopByConcern.module.css';

export default function ShopByConcern() {
  const { t, locale } = useLanguage();
  const concerns = getAllConcerns(locale);

  return (
    <section className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>
            <span>✨</span>
            <span>{locale === 'en' ? 'Shop by Concern' : 'اختاري حسب مشكلة بشرتك'}</span>
          </span>
          <h2 className={styles.title}>{t('concerns.sectionTitle')}</h2>
        </div>

        <div className={styles.avatarGrid}>
          {concerns.map((concern) => (
            <Link
              key={concern.id}
              href={`/products?concern=${concern.id}`}
              className={styles.avatarItem}
            >
              <div className={styles.circleWrapper}>
                <div className={styles.circleInner}>
                  <img
                    src={concern.image}
                    alt={concern.displayName}
                    className={styles.avatarImage}
                    loading="lazy"
                  />
                </div>
              </div>

              <span className={styles.avatarTitle}>{concern.displayName}</span>
              <span className={styles.itemCount}>
                {concern.productIds.length} {locale === 'en' ? 'items' : 'منتج'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
