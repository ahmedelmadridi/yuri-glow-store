import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

// Mock data for featured products
import { getProducts } from '@/data/products';
import SearchBar from '@/components/SearchBar';
import SortableProductGrid from '@/components/SortableProductGrid';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import HeroSlider from '@/components/HeroSlider';

export const revalidate = 3600; // Cache the home page for 1 hour

export default async function Home() {
  const allProducts = await getProducts();
  let featuredProducts = allProducts.slice(0, 6);

  // Fetch real best sellers
  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('product_id, quantity');

  if (orderItems && orderItems.length > 0) {
    const salesCount: Record<number, number> = {};
    orderItems.forEach(item => {
      salesCount[item.product_id] = (salesCount[item.product_id] || 0) + item.quantity;
    });
    
    const sortedProductIds = Object.entries(salesCount)
      .sort((a, b) => b[1] - a[1])
      .map(entry => Number(entry[0]));
      
    const realBestSellers = sortedProductIds
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean) as typeof allProducts;
      
    if (realBestSellers.length > 0) {
      // Pad with other products if less than 6 best sellers exist
      featuredProducts = [...realBestSellers, ...allProducts]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        .slice(0, 6);
    }
  }

  // Fetch hero banners
  let bannerImages = ['/hero.jpg']; // Default fallback
  const { data: banners, error: bannersError } = await supabaseAdmin
    .from('banners')
    .select('image_url')
    .order('sort_order', { ascending: true })
    .eq('is_active', true);
    
  if (!bannersError && banners && banners.length > 0) {
    bannerImages = banners.map(b => b.image_url);
  }

  // Fetch screenshot reviews
  const { data: testimonials } = await supabaseAdmin
    .from('screenshot_reviews')
    .select('id, image_url, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <>
      <section className={styles.heroFullWidth}>
        <HeroSlider images={bannerImages} />
      </section>

      <section className={styles.section}>
        <div className="container">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
          <h2 className={styles.sectionTitle}>الأكثر مبيعاً</h2>
          <div className={styles.productGrid}>
          {featuredProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          </div>
        </div>
      </section>

      {testimonials && testimonials.length > 0 && (
        <section className={styles.section} style={{ backgroundColor: '#fcfbf4' }}>
          <div className="container">
            <h2 className={styles.sectionTitle}>آراء عملائنا</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: 'var(--spacing-xl)' 
            }}>
              {testimonials.map((testi) => (
                <div key={testi.id} style={{
                  borderRadius: 'var(--border-radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  aspectRatio: '9/16', // Typical screenshot ratio
                  position: 'relative'
                }}>
                  <Image 
                    src={testi.image_url} 
                    alt="Customer Review" 
                    fill 
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
