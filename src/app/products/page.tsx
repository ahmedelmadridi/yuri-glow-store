import Link from 'next/link';
import styles from '../page.module.css'; // Reusing some styles

import { getProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const products = await getProducts(query);
  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <h1 className={styles.sectionTitle}>منتجاتنا</h1>
      <p style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)', color: 'var(--color-text-light)' }}>
        تصفحي مجموعتنا الكاملة من منتجات العناية بالبشرة الكورية الأصيلة
      </p>

      <SearchBar />

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl) 0', color: 'var(--color-text-light)' }}>
          لا توجد منتجات مطابقة لبحثك.
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
