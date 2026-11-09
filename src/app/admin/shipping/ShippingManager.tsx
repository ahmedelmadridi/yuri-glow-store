'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShippingSettings, defaultShippingSettings } from '@/data/storeSettingsDefaults';
import { updateShippingSettings } from '@/app/actions/settings';

export default function ShippingManager({ initialSettings }: { initialSettings: ShippingSettings }) {
  const [settings, setSettings] = useState<ShippingSettings>(initialSettings);
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();

  const handlePriceChange = (govName: string, price: number) => {
    setSettings(prev => ({
      ...prev,
      governorates: prev.governorates.map(g =>
        g.name === govName ? { ...g, shippingCost: Math.max(0, price) } : g
      ),
    }));
  };

  const handleToggleActive = (govName: string) => {
    setSettings(prev => ({
      ...prev,
      governorates: prev.governorates.map(g =>
        g.name === govName ? { ...g, is_active: !g.is_active } : g
      ),
    }));
  };

  const handleApplyBulkPrice = () => {
    const priceNum = Number(bulkPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('يرجى إدخال سعر صحيح (رقم موجب).');
      return;
    }
    if (confirm(`هل أنت متأكد من تعيين سعر الشحن (${priceNum} ج.م) لجميع المحافظات؟`)) {
      setSettings(prev => ({
        ...prev,
        governorates: prev.governorates.map(g => ({ ...g, shippingCost: priceNum })),
      }));
      setBulkPrice('');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('هل أنت متأكد من رغبتك في استعادة أسعار الشحن الافتراضية؟')) {
      setSettings(defaultShippingSettings);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await updateShippingSettings(settings);
      if (res.success) {
        setMessage({ type: 'success', text: 'تم حفظ إعدادات الشحن بنجاح!' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء الحفظ.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ غير متوقع.' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredGovs = settings.governorates.filter(g =>
    g.name.includes(searchQuery.trim())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      {message && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--border-radius)',
            backgroundColor: message.type === 'success' ? '#e8f8f5' : '#fde8e8',
            color: message.type === 'success' ? '#1e8449' : '#c0392b',
            fontWeight: 'bold',
            border: `1px solid ${message.type === 'success' ? '#a3e4d7' : '#f5c6cb'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Free Shipping Settings Card */}
      <div
        style={{
          backgroundColor: 'white',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
          🎁 إعدادات الشحن المجاني
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
              <input
                type="checkbox"
                checked={settings.free_shipping_enabled}
                onChange={e =>
                  setSettings(prev => ({ ...prev, free_shipping_enabled: e.target.checked }))
                }
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              تفعيل الشحن المجاني التلقائي للطلبات الكبيرة
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '6px' }}>
              عند تفعيله، سيحصل العميل على شحن مجاني إذا تجاوز طلبه المبلغ المحدد أدناه.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
              الحد الأدنى لقيمة الطلب للشحن المجاني (ج.م)
            </label>
            <input
              type="number"
              min={0}
              value={settings.free_shipping_threshold}
              onChange={e =>
                setSettings(prev => ({ ...prev, free_shipping_threshold: Number(e.target.value) || 0 }))
              }
              disabled={!settings.free_shipping_enabled}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                backgroundColor: settings.free_shipping_enabled ? 'white' : '#f5f5f5',
              }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.allow_free_shipping_with_coupon}
                onChange={e =>
                  setSettings(prev => ({ ...prev, allow_free_shipping_with_coupon: e.target.checked }))
                }
                disabled={!settings.free_shipping_enabled}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>السماح بالشحن المجاني حتى في حال تطبيق كود خصم</span>
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px', marginRight: '28px' }}>
              (الوضع الافتراضي: لا يُطبق الشحن المجاني إذا استخدم العميل كود خصم لتفادي ازدواج العروض).
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Edit & Governorate Prices */}
      <div
        style={{
          backgroundColor: 'white',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary-dark)' }}>
              🚚 أسعار الشحن حسب المحافظة
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
              يمكنك تعديل سعر كل محافظة أو تفعيل/إيقاف التوصيل إليها.
            </p>
          </div>

          {/* Quick uniform price application */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              placeholder="سعر موحد (ج.م)"
              value={bulkPrice}
              onChange={e => setBulkPrice(e.target.value)}
              style={{ width: '140px', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
            />
            <button
              type="button"
              onClick={handleApplyBulkPrice}
              style={{
                backgroundColor: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                padding: '8px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            >
              تطبيق على الكل
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="🔍 ابحث عن محافظة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '350px', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          />
        </div>

        {/* Governorates Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead style={{ backgroundColor: 'var(--color-bg-alt)' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid var(--color-border)' }}>المحافظة</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid var(--color-border)' }}>سعر الشحن (ج.م)</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid var(--color-border)' }}>حالة التوصيل</th>
              </tr>
            </thead>
            <tbody>
              {filteredGovs.map(gov => (
                <tr key={gov.name} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: !gov.is_active ? '#fafafa' : 'white' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                    {gov.name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min={0}
                        value={gov.shippingCost}
                        onChange={e => handlePriceChange(gov.name, Number(e.target.value))}
                        disabled={!gov.is_active}
                        style={{
                          width: '120px',
                          padding: '8px 12px',
                          border: '1px solid var(--color-border)',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          color: gov.is_active ? 'inherit' : '#999',
                          backgroundColor: gov.is_active ? 'white' : '#f0f0f0',
                        }}
                      />
                      <span>ج.م</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(gov.name)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        backgroundColor: gov.is_active ? '#e8f8f5' : '#fde8e8',
                        color: gov.is_active ? '#27ae60' : '#c0392b',
                      }}
                    >
                      {gov.is_active ? '✅ متاح للشحن' : '❌ الشحن موقوف'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredGovs.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    لا توجد نتائج بحث مطابقة لـ "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={handleResetDefaults}
          style={{
            background: 'none',
            border: '1px solid #ccc',
            color: '#666',
            padding: '10px 18px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          استعادة الأسعار الافتراضية
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '12px 32px',
            fontSize: '1rem',
            fontWeight: 'bold',
            opacity: isSaving ? 0.7 : 1,
            cursor: isSaving ? 'wait' : 'pointer',
          }}
        >
          {isSaving ? 'جاري حفظ التعديلات...' : '💾 حفظ تعديلات الشحن'}
        </button>
      </div>
    </div>
  );
}
