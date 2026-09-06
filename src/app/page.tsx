import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

// Mock data for featured products
import { getProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import HeroSlider from '@/components/HeroSlider';

export const revalidate = 3600; // Cache the home page for 1 hour

export default async function Home() {
  const allProducts = await getProducts();
  let featuredProducts = allProducts.slice(0, 4);

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
      // Pad with other products if less than 4 best sellers exist
      featuredProducts = [...realBestSellers, ...allProducts]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        .slice(0, 4);
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

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>سر جمالك<br />من الطبيعة الكورية</h1>
            <p className={styles.heroSubtitle}>
              اكتشفي مجموعة يوري جلو للعناية بالبشرة، المستوحاة من أسرار الجمال الكوري 
              لتمنحك بشرة نضرة، مشرقة، ومفعمة بالحيوية.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/products" className="btn-primary">
                تسوقي الآن
              </Link>
              <Link href="/about" className="btn-outline">
                اكتشفي المزيد
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <HeroSlider images={bannerImages} />
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
          <h2 className={styles.sectionTitle}>الأكثر مبيعاً</h2>
          <div className={styles.productGrid}>
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        </div>
      </section>
    </>
  );
}
