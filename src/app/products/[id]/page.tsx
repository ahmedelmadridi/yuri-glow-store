import { getProductById, getRelatedProducts } from '@/data/products';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import AddToCartButton from '@/components/AddToCartButton';
import ProductCard from '@/components/ProductCard';
import ReviewForm from '@/components/ReviewForm';
import WishlistButton from '@/components/WishlistButton';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductById(parseInt(resolvedParams.id));

  if (!product) {
    return {
      title: 'المنتج غير موجود - Yuri Glow'
    };
  }

  const title = `${product.name} | Yuri Glow`;
  const description = product.description.substring(0, 160) + '...';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://yuri-glow.vercel.app/products/${product.id}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'article', // Used for products too
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProductById(parseInt(resolvedParams.id));

  if (!product) {
    notFound();
  }

  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.category, product.id);

  // Fetch approved reviews
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false });

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className={styles.category}>{product.category}</div>
              <h1 className={styles.title}>{product.name}</h1>
            </div>
            <WishlistButton productId={product.id} style={{ position: 'static' }} />
          </div>
          
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

      {/* Reviews Section */}
      <div style={{ marginTop: 'var(--spacing-3xl)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary-dark)', fontSize: '1.8rem' }}>
          تقييمات العملاء
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
                  {new Date(review.created_at).toLocaleDateString('ar-EG')}
                </p>
                <p style={{ lineHeight: '1.6' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-light)', fontStyle: 'italic', backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-md)' }}>لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيم!</p>
        )}

        <ReviewForm productId={product.id} />
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-3xl)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)', fontSize: '1.8rem', textAlign: 'center' }}>
            قد يعجبك أيضاً
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
