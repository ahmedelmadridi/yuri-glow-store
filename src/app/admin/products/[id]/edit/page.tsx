import ProductForm from '@/components/ProductForm';
import Link from 'next/link';
import { getProductById } from '@/data/products';
import { notFound } from 'next/navigation';

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProductById(parseInt(resolvedParams.id));

  if (!product) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
        <Link href="/admin/products" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
          &rarr; عودة
        </Link>
        <h1 style={{ margin: 0 }}>تعديل المنتج: {product.name}</h1>
      </div>

      <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <ProductForm initialData={product} />
      </div>
    </div>
  );
}
