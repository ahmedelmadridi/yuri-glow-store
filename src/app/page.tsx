import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

// Mock data for featured products
import { getProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';

export default async function Home() {
  const allProducts = await getProducts();
  const featuredProducts = allProducts.slice(0, 4);

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
          {/* Using a placeholder aesthetic image */}
          <img 
            src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop" 
            alt="Yuri Glow Skincare" 
            className={styles.heroImage}
          />
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <SearchBar />
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
