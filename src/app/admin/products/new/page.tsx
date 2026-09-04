import ProductForm from '@/components/ProductForm';
import Link from 'next/link';

export default function AdminNewProductPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
        <Link href="/admin/products" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
          &rarr; عودة
        </Link>
        <h1 style={{ margin: 0 }}>إضافة منتج جديد</h1>
      </div>

      <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <ProductForm />
      </div>
    </div>
  );
}
