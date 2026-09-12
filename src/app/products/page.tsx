import Link from 'next/link';
import styles from '../page.module.css'; // Reusing some styles

import { getProducts } from '@/data/products';
import SearchBar from '@/components/SearchBar';
import SortableProductGrid from '@/components/SortableProductGrid';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسوق جميع منتجات العناية بالبشرة | Yuri Glow',
  description: 'تصفحي مجموعتنا الكاملة من منتجات العناية بالبشرة الكورية الأصيلة، ماسكات، سيروم، كريمات، وكل ما تحتاجينه لبشرة نضرة ومشرقة من يوري جلو.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const products = await getProducts(query);
  
  // Fetch ratings
  const { data: reviews } = await supabaseAdmin
    .from('product_reviews')
    .select('product_id, rating')
    .eq('is_approved', true);
    
  const productRatings: Record<number, number> = {};
  if (reviews && reviews.length > 0) {
    const sums: Record<number, { sum: number, count: number }> = {};
    reviews.forEach(r => {
      if (!sums[r.product_id]) sums[r.product_id] = { sum: 0, count: 0 };
      sums[r.product_id].sum += r.rating;
      sums[r.product_id].count += 1;
    });
    Object.keys(sums).forEach(id => {
      const numId = Number(id);
      productRatings[numId] = sums[numId].sum / sums[numId].count;
    });
  }

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
        <SortableProductGrid products={products} productRatings={productRatings} />
      )}
    </div>
  );
}
