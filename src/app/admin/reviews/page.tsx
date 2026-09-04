import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { approveReview, deleteReview } from '@/app/actions/reviews';
import { getProductById } from '@/data/products';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const { data: reviews, error } = await supabaseAdmin
    .from('product_reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>خطأ في جلب التقييمات</div>;
  }

  // Enrich with product names
  const enrichedReviews = await Promise.all(
    reviews.map(async (r) => {
      const product = await getProductById(r.product_id);
      return { ...r, productName: product?.name || 'منتج غير معروف' };
    })
  );

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)' }}>إدارة التقييمات</h1>

      <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--color-border)', textAlign: 'right' }}>
              <th style={{ padding: '16px' }}>المنتج</th>
              <th style={{ padding: '16px' }}>العميل</th>
              <th style={{ padding: '16px' }}>التقييم</th>
              <th style={{ padding: '16px' }}>التعليق</th>
              <th style={{ padding: '16px' }}>الحالة</th>
              <th style={{ padding: '16px' }}>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {enrichedReviews.map((review) => (
              <tr key={review.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px' }}>
                  <Link href={`/products/${review.product_id}`} target="_blank" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                    {review.productName}
                  </Link>
                </td>
                <td style={{ padding: '16px' }}>{review.customer_name}</td>
                <td style={{ padding: '16px', color: '#f1c40f' }}>{'★'.repeat(review.rating)}</td>
                <td style={{ padding: '16px', maxWidth: '300px' }}>{review.comment}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem',
                    backgroundColor: review.is_approved ? '#e8f8f5' : '#fff3cd',
                    color: review.is_approved ? '#27ae60' : '#856404'
                  }}>
                    {review.is_approved ? 'تمت الموافقة' : 'في الانتظار'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!review.is_approved && (
                      <form action={async () => {
                        'use server';
                        await approveReview(review.id, review.product_id);
                      }}>
                        <button type="submit" style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                          موافقة
                        </button>
                      </form>
                    )}
                    <form action={async () => {
                      'use server';
                      await deleteReview(review.id, review.product_id);
                    }}>
                      <button type="submit" style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        حذف
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            
            {enrichedReviews.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#7f8c8d' }}>
                  لا توجد تقييمات حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
