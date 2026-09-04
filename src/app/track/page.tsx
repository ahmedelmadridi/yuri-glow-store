'use client';

import { useState } from 'react';
import { trackOrderByPhone } from '@/app/actions/track';
import { formatPrice } from '@/utils/format';

export default function TrackOrderPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<any[] | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrders(null);

    const result = await trackOrderByPhone(phone);

    if (result.error) {
      setError(result.error);
    } else if (result.orders) {
      setOrders(result.orders);
    }
    
    setLoading(false);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ قيد المراجعة';
      case 'shipped': return '🚚 تم الشحن';
      case 'delivered': return '✅ تم التوصيل';
      case 'cancelled': return '❌ ملغي';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'shipped': return '#3498db';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', minHeight: '60vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)', color: 'var(--color-primary-dark)' }}>تتبع طلبك 📦</h1>
        <p style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-light)' }}>
          أدخل رقم الهاتف الذي قمت باستخدامه أثناء الطلب لمعرفة حالة طلبك الحالي.
        </p>

        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: 'var(--spacing-2xl)' }}>
          <input 
            type="tel" 
            placeholder="أدخل رقم الهاتف (مثال: 01012345678)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            dir="ltr"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              textAlign: 'right',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={loading || !phone}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              padding: '0 24px',
              cursor: (loading || !phone) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: (loading || !phone) ? 0.7 : 1
            }}
          >
            {loading ? 'جاري البحث...' : 'تتبع'}
          </button>
        </form>

        {error && (
          <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#fceceb', color: '#c62828', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {orders && orders.length > 0 && (
          <div>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>الطلبات السابقة ({orders.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {orders.map((order) => (
                <div key={order.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)', padding: 'var(--spacing-lg)', backgroundColor: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                      تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-EG')}
                    </span>
                    <span style={{ 
                      backgroundColor: getStatusColor(order.status) + '20', 
                      color: getStatusColor(order.status),
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  
                  <ul style={{ padding: '0', listStyle: 'none', marginBottom: 'var(--spacing-md)' }}>
                    {order.order_items.map((item: any, idx: number) => (
                      <li key={idx} style={{ padding: '4px 0', fontSize: '0.95rem' }}>
                        - {item.products?.name} <span style={{ color: 'var(--color-text-light)' }}>(x{item.quantity})</span>
                      </li>
                    ))}
                  </ul>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>الإجمالي (شامل الشحن):</span>
                    <span style={{ color: 'var(--color-primary-dark)' }}>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
