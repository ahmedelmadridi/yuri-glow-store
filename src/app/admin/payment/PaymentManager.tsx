'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentSettings, defaultPaymentSettings } from '@/data/storeSettingsDefaults';
import { updatePaymentSettings } from '@/app/actions/settings';

export default function PaymentManager({ initialSettings }: { initialSettings: PaymentSettings }) {
  const [settings, setSettings] = useState<PaymentSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();

  const handleResetDefaults = () => {
    if (confirm('هل أنت متأكد من استعادة إعدادات طرق الدفع الافتراضية؟')) {
      setSettings(defaultPaymentSettings);
    }
  };

  const handleSave = async () => {
    if (!settings.cod_enabled && !settings.wallet_enabled) {
      alert('تنبيه: يجب تفعيل وسيلة دفع واحدة على الأقل حتى يتمكن العملاء من إتمام الطلبات.');
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const res = await updatePaymentSettings(settings);
      if (res.success) {
        setMessage({ type: 'success', text: 'تم حفظ إعدادات طرق الدفع بنجاح!' });
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

      {/* Card 1: Cash On Delivery (COD) */}
      <div
        style={{
          backgroundColor: 'white',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>💵</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary-dark)' }}>
                الدفع عند الاستلام (Cash On Delivery)
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                تحكم في إتاحة الدفع عند الاستلام وتفاصيل العربون المسبق
              </span>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={settings.cod_enabled}
              onChange={e => setSettings(prev => ({ ...prev, cod_enabled: e.target.checked }))}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span>{settings.cod_enabled ? 'مفعلة ✅' : 'معطلة ❌'}</span>
          </label>
        </div>

        {settings.cod_enabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                  اسم طريقة الدفع بالصفحة
                </label>
                <input
                  type="text"
                  value={settings.cod_title}
                  onChange={e => setSettings(prev => ({ ...prev, cod_title: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                  وصف مختصر
                </label>
                <input
                  type="text"
                  value={settings.cod_description}
                  onChange={e => setSettings(prev => ({ ...prev, cod_description: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Deposit Box */}
            <div style={{ backgroundColor: '#fffbe6', padding: '16px', borderRadius: '6px', border: '1px solid #ffe58f', marginTop: '8px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#874d00' }}>
                  <input
                    type="checkbox"
                    checked={settings.cod_deposit_required}
                    onChange={e => setSettings(prev => ({ ...prev, cod_deposit_required: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>اشتراط دفع عربون مسبق لتأكيد الطلب</span>
                </label>
                <p style={{ fontSize: '0.85rem', color: '#874d00', margin: '4px 26px 0 0' }}>
                  في حال تفعيله، سيطلب من العميل تحويل العربون لتأكيد الطلب وإرفاق رقم العملية/سكرين شوت. إذا عُطّل، سيتمكن العميل من الطلب بدون أي تحويل مسبق.
                </p>
              </div>

              {settings.cod_deposit_required && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px', paddingRight: '26px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>طريقة احتساب العربون:</span>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="cod_deposit_amount_type"
                          value="shipping_cost"
                          checked={settings.cod_deposit_amount_type === 'shipping_cost'}
                          onChange={() => setSettings(prev => ({ ...prev, cod_deposit_amount_type: 'shipping_cost' }))}
                        />
                        <span>العربون = قيمة مصاريف الشحن للمحافظة</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="cod_deposit_amount_type"
                          value="fixed"
                          checked={settings.cod_deposit_amount_type === 'fixed'}
                          onChange={() => setSettings(prev => ({ ...prev, cod_deposit_amount_type: 'fixed' }))}
                        />
                        <span>مبلغ ثابت محدد</span>
                      </label>
                    </div>
                  </div>

                  {settings.cod_deposit_amount_type === 'fixed' && (
                    <div style={{ maxWidth: '240px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.9rem' }}>
                        قيمة العربون الثابت (ج.م):
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={settings.cod_deposit_fixed_amount}
                        onChange={e => setSettings(prev => ({ ...prev, cod_deposit_fixed_amount: Number(e.target.value) || 0 }))}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                      />
                    </div>
                  )}

                  <div style={{ maxWidth: '300px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.9rem' }}>
                      قيمة العربون في حالة الشحن المجاني (ج.م):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settings.cod_deposit_free_shipping_amount}
                      onChange={e => setSettings(prev => ({ ...prev, cod_deposit_free_shipping_amount: Number(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                    <small style={{ color: '#888', display: 'block', marginTop: '4px' }}>
                      (مثال: 100 ج.م كعربون تأكيد حتى لو كان الشحن مجاني)
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.9rem' }}>
                      نص التنبيه المعروض للعميل:
                    </label>
                    <textarea
                      rows={2}
                      value={settings.cod_notice}
                      onChange={e => setSettings(prev => ({ ...prev, cod_notice: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Electronic Wallet & Instapay */}
      <div
        style={{
          backgroundColor: 'white',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>📱</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary-dark)' }}>
                الدفع الإلكتروني (انستاباي / محفظة إلكترونية)
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                تحكم في حساب انستاباي ورقم المحافظ الإلكترونية وتعليمات التحويل
              </span>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={settings.wallet_enabled}
              onChange={e => setSettings(prev => ({ ...prev, wallet_enabled: e.target.checked }))}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span>{settings.wallet_enabled ? 'مفعلة ✅' : 'معطلة ❌'}</span>
          </label>
        </div>

        {settings.wallet_enabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                اسم طريقة الدفع بالصفحة
              </label>
              <input
                type="text"
                value={settings.wallet_title}
                onChange={e => setSettings(prev => ({ ...prev, wallet_title: e.target.value }))}
                style={{ width: '100%', maxWidth: '400px', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                  حساب / رقم انستاباي (Instapay)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: 01277885159 أو username@instapay"
                  value={settings.wallet_instapay}
                  onChange={e => setSettings(prev => ({ ...prev, wallet_instapay: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', textAlign: 'left' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                  رقم المحافظ الإلكترونية (فودافون كاش / أورانج / اتصالات / وي)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: 01277885159"
                  value={settings.wallet_vodafone_cash}
                  onChange={e => setSettings(prev => ({ ...prev, wallet_vodafone_cash: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', textAlign: 'left' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                نص تعليمات التحويل للعميل
              </label>
              <textarea
                rows={2}
                value={settings.wallet_instructions}
                onChange={e => setSettings(prev => ({ ...prev, wallet_instructions: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card 3: Verification & General Settings */}
      <div
        style={{
          backgroundColor: 'white',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
          ⚙️ إعدادات التحقق وتأكيد الطلب
        </h2>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={settings.require_receipt_upload}
              onChange={e => setSettings(prev => ({ ...prev, require_receipt_upload: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>إلزام العميل بإرفاق سكرين شوت إيصال التحويل (عند التحويل الإلكتروني أو دفع العربون)</span>
          </label>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px', marginRight: '28px' }}>
            إذا تم إلغاء التحديد، سيكون بإمكان العميل تأكيد الطلب بكتابة رقم العملية فقط دون الحاجة لرفع صورة.
          </p>
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
          استعادة الإعدادات الافتراضية
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
          {isSaving ? 'جاري حفظ التعديلات...' : '💾 حفظ تعديلات طرق الدفع'}
        </button>
      </div>
    </div>
  );
}
