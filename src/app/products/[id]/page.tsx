import { getProductById } from '@/data/products';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import styles from './page.module.css';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProductById(parseInt(resolvedParams.id));

  if (!product) {
    notFound();
  }

  // Calculate discount percentage automatically
  let calculatedDiscount = product.discount_percentage;
  if (!calculatedDiscount && product.original_price && product.original_price > product.price) {
    calculatedDiscount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <div className={styles.breadcrumb}>
        <Link href="/">الرئيسية</Link> &gt; <Link href="/products">المنتجات</Link> &gt; <span>{product.name}</span>
      </div>

      <div className={styles.productLayout}>
        <div className={styles.imageSection} style={{ position: 'relative' }}>
          <img src={product.image} alt={product.name} className={styles.mainImage} />
          {calculatedDiscount && (
            <div style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: '#e74c3c', color: 'white', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              خصم {calculatedDiscount}%
            </div>
          )}
        </div>
        
        <div className={styles.detailsSection}>
          <div className={styles.category}>{product.category}</div>
          <h1 className={styles.title}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-xl)' }}>
            <div className={styles.price} style={{ marginBottom: 0 }}>{formatPrice(product.price)}</div>
            {product.original_price && (
              <div style={{ color: '#95a5a6', textDecoration: 'line-through', fontSize: '1.2rem' }}>
                {formatPrice(product.original_price)}
              </div>
            )}
          </div>
          
          <div className={styles.description}>
            <p>{product.description}</p>
          </div>

          <AddToCartButton product={product} />

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✅</span>
              <span>منتج كوري أصلي ١٠٠٪</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🚗</span>
              <span>توصيل سريع داخل مصر</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>💳</span>
              <span>الدفع عند الاستلام</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
