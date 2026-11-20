"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { Product } from '@/data/products';
import { useLanguage } from '@/context/LanguageContext';
import { getAllConcerns, getConcernById, filterProductsByConcern } from '@/data/concerns';
import pageStyles from '@/app/page.module.css';
import styles from './SortableProductGrid.module.css';

interface SortableProductGridProps {
  products: Product[];
  productRatings?: Record<number, number>; // productId -> average rating
  productSales?: Record<number, number>; // productId -> total sales count
  initialConcern?: string;
}

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'rating' | 'best_seller';

export default function SortableProductGrid({
  products,
  productRatings = {},
  productSales = {},
  initialConcern,
}: SortableProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useLanguage();
  
  const currentConcernParam = searchParams.get('concern') || initialConcern || 'all';
  const [selectedConcern, setSelectedConcern] = useState<string>(currentConcernParam);
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Sync state if URL changes externally
  useEffect(() => {
    const fromUrl = searchParams.get('concern') || 'all';
    setSelectedConcern(fromUrl);
  }, [searchParams]);

  const allConcerns = useMemo(() => getAllConcerns(locale), [locale]);
  const activeConcernInfo = useMemo(() => {
    if (selectedConcern === 'all') return null;
    return getConcernById(selectedConcern, locale);
  }, [selectedConcern, locale]);

  // Handle concern selection
  const handleConcernClick = (concernId: string) => {
    setSelectedConcern(concernId);
    
    // Construct new searchParams preserving search queries like `q`
    const params = new URLSearchParams(searchParams.toString());
    if (concernId === 'all') {
      params.delete('concern');
    } else {
      params.set('concern', concernId);
    }

    const newQueryString = params.toString();
    const newUrl = `/products${newQueryString ? `?${newQueryString}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  };

  // Filter products by concern
  const filteredProducts = useMemo(() => {
    if (selectedConcern === 'all') return products;
    return filterProductsByConcern(products, selectedConcern);
  }, [products, selectedConcern]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortOption === 'price_asc') {
        return a.price - b.price;
      } else if (sortOption === 'price_desc') {
        return b.price - a.price;
      } else if (sortOption === 'rating') {
        const ratingA = productRatings[a.id] || 0;
        const ratingB = productRatings[b.id] || 0;
        return ratingB - ratingA;
      } else if (sortOption === 'best_seller') {
        const salesA = productSales[a.id] || 0;
        const salesB = productSales[b.id] || 0;
        return salesB - salesA;
      }
      return 0;
    });
  }, [filteredProducts, sortOption, productRatings, productSales]);

  return (
    <div>
      {/* Concern Filter Pills */}
      <div className={styles.filterSection}>
        <div className={styles.pillContainer}>
          <button
            type="button"
            className={`${styles.pill} ${selectedConcern === 'all' ? styles.activePill : ''}`}
            onClick={() => handleConcernClick('all')}
          >
            <span>✨</span>
            <span>{t('concerns.allConcerns')}</span>
            <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({products.length})</span>
          </button>

          {allConcerns.map((concern) => {
            const count = filterProductsByConcern(products, concern.id).length;
            const isActive = selectedConcern === concern.id;
            return (
              <button
                key={concern.id}
                type="button"
                className={`${styles.pill} ${isActive ? styles.activePill : ''}`}
                onClick={() => handleConcernClick(concern.id)}
              >
                <span>{concern.displayName}</span>
                <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Active Concern Banner */}
        {activeConcernInfo && (
          <div
            className={styles.activeBanner}
            style={{
              background: activeConcernInfo.bgGradient,
              borderColor: activeConcernInfo.accentColor,
            }}
          >
            <div>
              <div className={styles.bannerTitle} style={{ color: activeConcernInfo.accentColor }}>
                {t('concerns.productsFor')} {activeConcernInfo.displayName}
              </div>
              <p className={styles.bannerDesc}>{activeConcernInfo.displaySubtitle}</p>
            </div>
            <button
              type="button"
              className={styles.clearBtn}
              style={{ color: activeConcernInfo.accentColor }}
              onClick={() => handleConcernClick('all')}
            >
              ✕ {locale === 'en' ? 'Show All' : 'إلغاء التصفية'}
            </button>
          </div>
        )}
      </div>

      {/* Controls Row: Counter & Sort */}
      <div className={styles.controlsRow}>
        <div className={styles.resultCount}>
          {locale === 'en'
            ? `Showing ${sortedProducts.length} ${sortedProducts.length === 1 ? 'product' : 'products'}`
            : `عرض ${sortedProducts.length} منتج`}
        </div>

        <div className={styles.sortWrapper}>
          <label htmlFor="sort-select" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            {locale === 'en' ? 'Sort by:' : 'ترتيب حسب:'}
          </label>
          <select
            id="sort-select"
            className={styles.sortSelect}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value="default">{locale === 'en' ? 'Default' : 'الافتراضي'}</option>
            <option value="best_seller">{locale === 'en' ? 'Best Sellers' : 'الأكثر مبيعاً'}</option>
            <option value="price_asc">{locale === 'en' ? 'Price: Low to High' : 'السعر: من الأقل للأعلى'}</option>
            <option value="price_desc">{locale === 'en' ? 'Price: High to Low' : 'السعر: من الأعلى للأقل'}</option>
            <option value="rating">{locale === 'en' ? 'Highest Rated' : 'الأعلى تقييماً'}</option>
          </select>
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {sortedProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl) 0', color: 'var(--color-text-light)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>
            {locale === 'en'
              ? 'No products found for this skin concern.'
              : 'لم يتم العثور على منتجات مطابقة لهذا التصنيف.'}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleConcernClick('all')}
          >
            {locale === 'en' ? 'View All Products' : 'عرض جميع المنتجات'}
          </button>
        </div>
      ) : (
        <div className={pageStyles.productGrid}>
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
