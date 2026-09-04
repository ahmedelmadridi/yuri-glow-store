import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';

export default async function AdminOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  // Fetch Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return notFound();
  }

  // Fetch Order Items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      quantity,
      price_at_time_of_order,
      products (name, image)
    `)
    .eq('order_id', orderId);

  // Server Action to update status
  async function updateStatus(formData: FormData) {
    'use server';
    const newStatus = formData.get('status') as string;
    
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
      
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders`);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ color: 'var(--color-primary-dark)' }}>تفاصيل الطلب: {order.id.split('-')[0]}</h1>
        <Link href="/admin/orders" style={{ padding: '8px 16px', backgroundColor: 'var(--color-bg-alt)', borderRadius: '4px', textDecoration: 'none', color: 'var(--color-text)' }}>
          &larr; العودة للطلبات
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        
        {/* Customer Details */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>بيانات العميل</h2>
          <p style={{ margin: '8px 0' }}><strong>الاسم:</strong> {order.customer_name}</p>
          <p style={{ margin: '8px 0' }}><strong>رقم الهاتف:</strong> <a href={`tel:${order.phone}`} dir="ltr">{order.phone}</a></p>
          <p style={{ margin: '8px 0' }}><strong>المحافظة:</strong> {order.governorate}</p>
          <p style={{ margin: '8px 0' }}><strong>العنوان:</strong> {order.address}</p>
          {order.notes && <p style={{ margin: '8px 0', backgroundColor: '#fff9e6', padding: '8px', borderRadius: '4px' }}><strong>ملاحظات:</strong> {order.notes}</p>}
        </div>

        {/* Order Status & Update */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>حالة الطلب</h2>
          
          <form action={updateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px 0' }}>الحالة الحالية:</p>
              <select name="status" defaultValue={order.status} style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '1rem' }}>
                <option value="pending">قيد الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">مكتمل (تم التوصيل)</option>
                <option value="cancelled">ملغى</option>
              </select>
            </div>
            <button type="submit" style={{ padding: '12px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
              تحديث الحالة
            </button>
          </form>
        </div>
      </div>

      {/* Order Items */}
      <h2 style={{ margin: 'var(--spacing-xl) 0 var(--spacing-md) 0', fontSize: '1.2rem' }}>المنتجات المطلوبة</h2>
      <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead style={{ backgroundColor: 'var(--color-bg-alt)' }}>
            <tr>
              <th style={{ padding: 'var(--spacing-md)' }}>المنتج</th>
              <th style={{ padding: 'var(--spacing-md)' }}>السعر</th>
              <th style={{ padding: 'var(--spacing-md)' }}>الكمية</th>
              <th style={{ padding: 'var(--spacing-md)' }}>المجموع</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item, index) => {
              // Type workaround since we know the structure from the join
              const product = item.products as any;
              
              return (
                <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={product?.image || ''} alt={product?.name || ''} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontWeight: '500' }}>{product?.name || 'منتج غير معروف'}</span>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>{formatPrice(item.price_at_time_of_order)}</td>
                  <td style={{ padding: 'var(--spacing-md)' }}>{item.quantity}</td>
                  <td style={{ padding: 'var(--spacing-md)', fontWeight: 'bold' }}>{formatPrice(item.price_at_time_of_order * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Financial Summary */}
        <div style={{ padding: 'var(--spacing-lg)', backgroundColor: '#fafafa', borderTop: '2px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px' }}>
            <span>المجموع الفرعي:</span>
            <span>{formatPrice(order.subtotal_amount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px' }}>
            <span>مصاريف الشحن:</span>
            <span>{formatPrice(order.shipping_cost)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
            <span>الإجمالي:</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
