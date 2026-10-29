import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ProductsManager from './ProductsManager';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: false });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>إدارة المنتجات</h1>
        <Link href="/admin/products/new" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          + إضافة منتج جديد
        </Link>
      </div>

      {error ? (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '16px', borderRadius: '8px' }}>
          حدث خطأ أثناء جلب المنتجات: {error.message}
        </div>
      ) : (
        <ProductsManager products={products || []} />
      )}
    </div>
  );
}
