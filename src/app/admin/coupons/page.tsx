import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { addCoupon, toggleCouponStatus, deleteCoupon } from '@/app/actions/coupons';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const { data: coupons, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>خطأ في جلب الكوبونات</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)' }}>إدارة الكوبونات</h1>

      {/* Add New Coupon Form */}
      <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: 'var(--spacing-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem' }}>إضافة كوبون جديد</h2>
        <form action={async (formData) => {
          'use server';
          const code = formData.get('code') as string;
          const discount = parseInt(formData.get('discount') as string);
          await addCoupon(code, discount);
        }} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>كود الخصم (مثل YURI10)</label>
            <input type="text" name="code" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>نسبة الخصم (%)</label>
            <input type="number" name="discount" required min="1" max="100" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <button type="submit" style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            إضافة
          </button>
        </form>
      </div>

      {/* Coupons Table */}
      <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--color-border)', textAlign: 'right' }}>
              <th style={{ padding: '16px' }}>الكود</th>
              <th style={{ padding: '16px' }}>نسبة الخصم</th>
              <th style={{ padding: '16px' }}>الحالة</th>
              <th style={{ padding: '16px' }}>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {coupons && coupons.map((coupon) => (
              <tr key={coupon.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{coupon.code}</td>
                <td style={{ padding: '16px' }}>{coupon.discount_percentage}%</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem',
                    backgroundColor: coupon.is_active ? '#e8f8f5' : '#fdedec',
                    color: coupon.is_active ? '#27ae60' : '#e74c3c'
                  }}>
                    {coupon.is_active ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <form action={async () => {
                      'use server';
                      await toggleCouponStatus(coupon.id, coupon.is_active);
                    }}>
                      <button type="submit" style={{ backgroundColor: coupon.is_active ? '#f39c12' : '#2ecc71', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        {coupon.is_active ? 'تعطيل' : 'تفعيل'}
                      </button>
                    </form>

                    <form action={async () => {
                      'use server';
                      await deleteCoupon(coupon.id);
                    }}>
                      <button type="submit" style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        حذف
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            
            {(!coupons || coupons.length === 0) && (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#7f8c8d' }}>
                  لا توجد كوبونات حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
