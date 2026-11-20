'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackOrder } from '@/app/actions/track';
import { formatPrice } from '@/utils/format';
import { useLanguage } from '@/context/LanguageContext';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { t, locale, isRTL } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<any[] | null>(null);

  const executeTrack = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setOrders(null);

    const result = await trackOrder(trimmed);

    if (result.error) {
      setError(locale === 'en' ? 'No order found matching this information. Please double-check.' : result.error);
    } else if (result.orders) {
      setOrders(result.orders);
    }

    setLoading(false);
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeTrack(query);
  };

  // Auto-search if orderId or code is provided in the URL
  useEffect(() => {
    const param = searchParams.get('orderId') || searchParams.get('code');
    if (param && param.trim()) {
      setQuery(param.trim());
      executeTrack(param.trim());
    }
  }, [searchParams]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('track.statusPending');
      case 'confirmed': return t('track.statusConfirmed');
      case 'shipped': return t('track.statusShipped');
      case 'delivered': return t('track.statusDelivered');
      case 'cancelled': return t('track.statusCancelled');
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'confirmed': return '#3498db';
      case 'shipped': return '#9b59b6';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)', color: 'var(--color-primary-dark)' }}>
        {t('track.title')} 📦
      </h1>
      <p style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-light)', lineHeight: '1.7' }}>
        {t('track.subtitle')}
      </p>

      <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: 'var(--spacing-2xl)' }}>
        <input 
          type="text" 
          placeholder={t('track.inputPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          dir="auto"
          style={{
            flex: 1,
            padding: '14px 18px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius)',
            fontSize: '1rem',
            textAlign: isRTL ? 'right' : 'left',
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            padding: '0 28px',
            cursor: (loading || !query.trim()) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            opacity: (loading || !query.trim()) ? 0.7 : 1,
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? t('track.searching') : (locale === 'en' ? 'Track' : 'تتبع')}
        </button>
      </form>

      {error && (
        <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#fceceb', color: '#c62828', borderRadius: 'var(--border-radius)', textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          {error}
        </div>
      )}

      {orders && orders.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-primary-dark)' }}>
            {locale === 'en' ? `Search Results (${orders.length})` : `نتائج البحث (${orders.length})`}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {orders.map((order) => {
              const shortCode = order.id ? order.id.split('-')[0].toUpperCase() : '';
              return (
                <div 
                  key={order.id} 
                  style={{ 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--border-radius-lg)', 
                    padding: 'var(--spacing-lg)', 
                    backgroundColor: 'white',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid #eee', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        backgroundColor: 'var(--color-bg-alt, #f7f5ef)', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold',
                        color: 'var(--color-primary-dark)',
                        direction: 'ltr'
                      }}>
                        #{shortCode}
                      </span>
                      <span style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                        {new Date(order.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <span style={{ 
                      backgroundColor: getStatusColor(order.status) + '20', 
                      color: getStatusColor(order.status),
                      padding: '4px 14px', 
                      borderRadius: '20px', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem' 
                    }}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  
                  <ul style={{ padding: '0', listStyle: 'none', marginBottom: 'var(--spacing-md)' }}>
                    {order.order_items?.map((item: any, idx: number) => (
                      <li key={idx} style={{ padding: '6px 0', fontSize: '0.95rem', borderBottom: idx < order.order_items.length - 1 ? '1px dashed #f0f0f0' : 'none' }}>
                        • {item.products?.name} <span style={{ color: 'var(--color-text-light)' }}>(x{item.quantity})</span>
                      </li>
                    ))}
                  </ul>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                    <span>{t('track.total')}</span>
                    <span style={{ color: 'var(--color-primary-dark)' }}>{formatPrice(order.total_amount, locale)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  const { t } = useLanguage();
  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', minHeight: '60vh' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>{t('common.loading')}</div>}>
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
