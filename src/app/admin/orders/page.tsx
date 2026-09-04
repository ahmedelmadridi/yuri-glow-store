import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>خطأ في جلب الطلبات</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span style={{ padding: '4px 8px', backgroundColor: '#f39c12', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>قيد الانتظار</span>;
      case 'confirmed': return <span style={{ padding: '4px 8px', backgroundColor: '#3498db', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>مؤكد</span>;
      case 'shipped': return <span style={{ padding: '4px 8px', backgroundColor: '#9b59b6', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>تم الشحن</span>;
      case 'delivered': return <span style={{ padding: '4px 8px', backgroundColor: '#2ecc71', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>مكتمل</span>;
      case 'cancelled': return <span style={{ padding: '4px 8px', backgroundColor: '#e74c3c', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>ملغى</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)' }}>إدارة الطلبات</h1>
      
      <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: 'var(--spacing-md)' }}>رقم الطلب</th>
              <th style={{ padding: 'var(--spacing-md)' }}>العميل</th>
              <th style={{ padding: 'var(--spacing-md)' }}>المحافظة</th>
              <th style={{ padding: 'var(--spacing-md)' }}>التاريخ</th>
              <th style={{ padding: 'var(--spacing-md)' }}>الإجمالي</th>
              <th style={{ padding: 'var(--spacing-md)' }}>الحالة</th>
              <th style={{ padding: 'var(--spacing-md)' }}>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>{order.id.split('-')[0]}...</td>
                <td style={{ padding: 'var(--spacing-md)', fontWeight: '500' }}>{order.customer_name}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>{order.governorate}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                <td style={{ padding: 'var(--spacing-md)', fontWeight: 'bold' }}>{formatPrice(order.total_amount)}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>{getStatusBadge(order.status)}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <Link href={`/admin/orders/${order.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                    التفاصيل
                  </Link>
                </td>
              </tr>
            ))}
            
            {orders?.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-light)' }}>
                  لا توجد طلبات حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
