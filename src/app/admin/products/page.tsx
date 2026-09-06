import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';

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
      ) : products?.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
          <h2>لا توجد منتجات حتى الآن</h2>
          <p style={{ color: 'var(--color-text-light)', marginTop: '8px' }}>قم بإضافة منتجك الأول لتبدأ البيع!</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: 'var(--spacing-md)' }}>المنتج</th>
                <th style={{ padding: 'var(--spacing-md)' }}>التصنيف</th>
                <th style={{ padding: 'var(--spacing-md)' }}>السعر الحالي</th>
                <th style={{ padding: 'var(--spacing-md)' }}>العدد في المخزون</th>
                <th style={{ padding: 'var(--spacing-md)' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontWeight: 'bold' }}>{product.name}</span>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>{product.category}</td>
                  <td style={{ padding: 'var(--spacing-md)', fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatPrice(product.price)}</td>
                  <td style={{ padding: 'var(--spacing-md)', fontWeight: 'bold', color: product.stock_quantity <= 5 ? '#e74c3c' : 'var(--color-text)' }}>
                    {product.stock_quantity ?? 0}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <Link href={`/admin/products/${product.id}/edit`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                      تعديل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
