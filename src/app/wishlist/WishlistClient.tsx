'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { useLanguage } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/data/products';
import Link from 'next/link';

interface WishlistClientProps {
  allProducts: Product[];
}

export default function WishlistClient({ allProducts }: WishlistClientProps) {
  const { wishlist } = useWishlist();
  const { t } = useLanguage();

  const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));

  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', minHeight: '60vh' }}>
      <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: 'var(--spacing-xl)', textAlign: 'center', fontSize: '2.5rem' }}>
        {t('wishlist.title')}
      </h1>

      {wishlistProducts.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)', marginBottom: 'var(--spacing-lg)' }}>
            {t('wishlist.emptySubtitle')}
          </p>
          <Link href="/products" style={{ 
            display: 'inline-block', 
            backgroundColor: 'var(--color-primary)', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '25px', 
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            {t('wishlist.browseProducts')}
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: 'var(--spacing-xl)' 
        }}>
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
