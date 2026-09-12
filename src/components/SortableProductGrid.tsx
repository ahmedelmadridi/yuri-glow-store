"use client";

import { useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/data/products';
import styles from '@/app/page.module.css';

interface SortableProductGridProps {
  products: Product[];
  productRatings?: Record<number, number>; // productId -> average rating
}

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'rating';

export default function SortableProductGrid({ products, productRatings = {} }: SortableProductGridProps) {
  const [sortOption, setSortOption] = useState<SortOption>('default');

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === 'price_asc') {
      return a.price - b.price;
    } else if (sortOption === 'price_desc') {
      return b.price - a.price;
    } else if (sortOption === 'rating') {
      const ratingA = productRatings[a.id] || 0;
      const ratingB = productRatings[b.id] || 0;
      return ratingB - ratingA;
    }
    // 'default' - keep original order
    return 0;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="sort-select" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            ترتيب حسب:
          </label>
          <select 
            id="sort-select"
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: 'var(--border-radius)', 
              border: '1px solid var(--color-border)',
              backgroundColor: 'white',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            <option value="default">الافتراضي</option>
            <option value="price_asc">السعر: من الأقل للأعلى</option>
            <option value="price_desc">السعر: من الأعلى للأقل</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>
      </div>
      
      <div className={styles.productGrid}>
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
