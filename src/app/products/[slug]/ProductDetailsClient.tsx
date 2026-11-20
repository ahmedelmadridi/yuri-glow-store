"use client";

import Link from 'next/link';
import { Product, getLocalizedProduct } from '@/data/products';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/utils/format';
import AddToCartButton from '@/components/AddToCartButton';
import ProductCard from '@/components/ProductCard';
import ReviewForm from '@/components/ReviewForm';
import WishlistButton from '@/components/WishlistButton';
import ProductGallery from '@/components/ProductGallery';
import { getConcernsForProduct } from '@/data/concerns';
import styles from './page.module.css';

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
  reviews: any[];
  calculatedDiscount?: number | null;
}

export default function ProductDetailsClient({
  product: rawProduct,
  relatedProducts,
  reviews,
  calculatedDiscount,
}: ProductDetailsClientProps) {
  const { t, locale, isRTL } = useLanguage();
  const product = getLocalizedProduct(rawProduct, locale);

  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <div className={styles.breadcrumb} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href="/">{t('product.breadcrumbHome')}</Link>
        <span>{isRTL ? '>' : '/'}</span>
        <Link href="/products">{t('product.breadcrumbProducts')}</Link>
        <span>{isRTL ? '>' : '/'}</span>
        <span style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>{product.name}</span>
      </div>

      <div className={styles.productLayout}>
        <div className={styles.imageSection}>
          <ProductGallery 
            mainImage={product.image} 
            galleryImages={product.gallery_images} 
            productName={product.name} 
            calculatedDiscount={calculatedDiscount} 
          />
        </div>
        
        <div className={styles.detailsSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className={styles.category}>{product.category}</div>
              <h1 className={styles.title}>{product.name}</h1>
              {getConcernsForProduct(product.id, locale).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', margin: '6px 0 12px 0' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
                    {t('concerns.targetsConcern')}
                  </span>
                  {getConcernsForProduct(product.id, locale).map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?concern=${c.id}`}
                      style={{
                        fontSize: '0.78rem',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(168, 143, 72, 0.08)',
                        color: 'var(--color-primary-dark)',
                        fontWeight: 600,
                        textDecoration: 'none',
                        border: '1px solid rgba(168, 143, 72, 0.25)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <WishlistButton productId={product.id} style={{ position: 'static' }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-md)' }}>
            <div className={styles.price} style={{ marginBottom: 0 }}>
              {formatPrice(product.price, locale)}
            </div>
            {product.original_price && (
              <div style={{ color: '#95a5a6', textDecoration: 'line-through', fontSize: '1.2rem' }}>
                {formatPrice(product.original_price, locale)}
              </div>
            )}
          </div>
          
          {/* Stock Indicator */}
          {product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity > 0 && (
            <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: product.stock_quantity <= 5 ? '#e74c3c' : '#2ecc71',
                boxShadow: product.stock_quantity <= 5 ? '0 0 8px #e74c3c' : '0 0 8px #2ecc71'
              }}></span>
              <span style={{ 
                color: product.stock_quantity <= 5 ? '#e74c3c' : '#27ae60', 
                fontWeight: 'bold', 
                fontSize: '1rem' 
              }}>
                {product.stock_quantity <= 5 
                  ? t('common.onlyLeft', { count: product.stock_quantity })
                  : `${t('common.inStock')} (${product.stock_quantity})`}
              </span>
            </div>
          )}

          <div className={styles.description}>
            <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
          </div>

          <AddToCartButton product={rawProduct} />

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✅</span>
              <span>{t('product.authenticGuarantee')}</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🚗</span>
              <span>{t('product.fastDelivery')}</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>💳</span>
              <span>{t('product.cashOnDelivery')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Product Description & Features */}
      {(product.features || product.ingredients || product.usage_instructions) && (
        <div style={{ marginTop: 'var(--spacing-3xl)', backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--border-radius-lg)', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)', fontSize: '1.8rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '16px' }}>
            {t('product.productDetails')}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            {product.ingredients && (
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  {t('product.ingredients')}
                </h3>
                <ul style={{ lineHeight: '1.8', color: 'var(--color-text)', paddingInlineStart: '24px', fontSize: '1.05rem' }}>
                  {product.ingredients.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>{line.trim()}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.features && (
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  {t('product.features')}
                </h3>
                <ul style={{ lineHeight: '1.8', color: 'var(--color-text)', paddingInlineStart: '24px', fontSize: '1.05rem' }}>
                  {product.features.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>{line.trim()}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.usage_instructions && (
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  {t('product.howToUse')}
                </h3>
                <ul style={{ lineHeight: '1.8', color: 'var(--color-text)', paddingInlineStart: '24px', fontSize: '1.05rem' }}>
                  {product.usage_instructions.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>{line.trim()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div style={{ marginTop: 'var(--spacing-3xl)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary-dark)', fontSize: '1.8rem' }}>
          {t('product.reviews')}
        </h2>
        
        {reviews && reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{review.customer_name}</strong>
                  <div style={{ color: '#f1c40f', fontSize: '1.2rem' }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '12px' }}>
                  {new Date(review.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-EG')}
                </p>
                <p style={{ lineHeight: '1.6' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-light)', fontStyle: 'italic', backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-md)' }}>
            {t('product.noReviewsYet')}
          </p>
        )}

        <ReviewForm productId={product.id} />
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-3xl)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)', fontSize: '1.8rem', textAlign: 'center' }}>
            {t('product.relatedProducts')}
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: 'var(--spacing-lg)' 
          }}>
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
