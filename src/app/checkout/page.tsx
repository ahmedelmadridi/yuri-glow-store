"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { governorates } from '@/data/governorates';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import { sendTelegramNotification } from '@/app/actions/telegram';
import { validateCoupon } from '@/app/actions/coupons';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  
  const [selectedGov, setSelectedGov] = useState(governorates[0].name);
  const [shippingCost, setShippingCost] = useState(governorates[0].shippingCost);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Redirect if cart is empty (but not if we just submitted the order)
  useEffect(() => {
    if (cart.length === 0 && !isSubmitted) {
      router.push('/cart');
    }
  }, [cart, isSubmitted, router]);

  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const govName = e.target.value;
    setSelectedGov(govName);
    const gov = governorates.find(g => g.name === govName);
    if (gov) {
      setShippingCost(gov.shippingCost);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    
    setIsCheckingCoupon(true);
    const result = await validateCoupon(couponCode);
    setIsCheckingCoupon(false);
    
    if (result.error) {
      setCouponError(result.error);
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon({ code: result.code!, discount: result.discount! });
      setCouponCode('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    // Parse total to int for safety
    let subtotal = totalPrice;
    if (appliedCoupon) {
      subtotal = Math.round(subtotal - (subtotal * (appliedCoupon.discount / 100)));
    }
    
    const shipping = shippingCost;
    const finalTotal = subtotal + shipping;

    const orderId = crypto.randomUUID();

    // 1. Insert order
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        customer_name: formData.name,
        phone: formData.phone,
        governorate: selectedGov,
        address: formData.address,
        notes: formData.notes + (appliedCoupon ? `\n(تم استخدام كود خصم: ${appliedCoupon.code})` : ''),
        subtotal_amount: subtotal,
        shipping_cost: shipping,
        total_amount: finalTotal,
      });

    if (orderError) {
      console.error('Order Error Details:', orderError.message, orderError.details, orderError.hint, orderError.code);
      setErrorMsg(`حدث خطأ أثناء تسجيل الطلب: ${orderError.message}`);
      setIsSubmitting(false);
      return;
    }

    // 2. Insert order items
    const orderItems = cart.map(item => ({
      order_id: orderId,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time_of_order: item.product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order Items Error:', itemsError);
      // We should ideally rollback or alert, but for MVP we log it.
    }
    
    // 3. Send Telegram Notification
    try {
      const orderItemsText = cart.map(item => `- ${item.product.name} (x${item.quantity})`).join('\n');
      const message = `
📦 <b>طلب جديد!</b> (Yuri Glow)

👤 <b>الاسم:</b> ${formData.name}
📱 <b>الهاتف:</b> ${formData.phone}
📍 <b>المحافظة:</b> ${selectedGov}
🏠 <b>العنوان:</b> ${formData.address}
📝 <b>ملاحظات:</b> ${formData.notes || 'لا يوجد'}
🎟️ <b>كود الخصم:</b> ${appliedCoupon ? `${appliedCoupon.code} (${appliedCoupon.discount}%)` : 'لا يوجد'}

🛍️ <b>المنتجات:</b>
${orderItemsText}

💰 <b>الإجمالي:</b> ${formatPrice(finalTotal)} (بما في ذلك الشحن)
      `;
      await sendTelegramNotification(message);
    } catch (e) {
      console.error("Failed to send telegram notification", e);
    }
    
    setIsSubmitted(true);
    
    // Clear cart and go to success
    clearCart();
    router.push('/checkout/success');
  };

  if (cart.length === 0) return null; // Prevent rendering empty checkout while redirecting

  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <h1 className={styles.pageTitle}>إتمام الطلب</h1>
      
      <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
        <div className={styles.formSection}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>بيانات الشحن</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="name">الاسم الكامل *</label>
            <input type="text" id="name" name="name" required value={formData.name} onChange={handleInputChange} />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="phone">رقم الهاتف *</label>
            <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleInputChange} dir="ltr" style={{ textAlign: 'right' }} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="governorate">المحافظة *</label>
            <select id="governorate" name="governorate" value={selectedGov} onChange={handleGovChange} required>
              {governorates.map(gov => (
                <option key={gov.name} value={gov.name}>
                  {gov.name} (شحن: {gov.shippingCost} ج.م)
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="address">العنوان بالتفصيل (الشارع، رقم العمارة، الشقة) *</label>
            <textarea id="address" name="address" required rows={3} value={formData.address} onChange={handleInputChange}></textarea>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">ملاحظات إضافية (اختياري)</label>
            <textarea id="notes" name="notes" rows={2} value={formData.notes} onChange={handleInputChange}></textarea>
          </div>
        </div>

        <div className={styles.summarySection}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>ملخص الطلب</h2>
          
          <div className={styles.summaryItems}>
            {cart.map((item, index) => (
              <div key={index} className={styles.summaryItem}>
                <span className={styles.summaryItemName}>{item.product.name} (x{item.quantity})</span>
                <span>{item.product.price}</span>
              </div>
            ))}
          </div>
          
          <hr className={styles.divider} />
          
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>هل لديك كود خصم؟</label>
            {!appliedCoupon ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="أدخل الكود هنا"
                  style={{ flex: '1', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  dir="ltr"
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon}
                  disabled={isCheckingCoupon || !couponCode.trim()}
                  style={{ 
                    backgroundColor: 'var(--color-secondary)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0 16px', 
                    borderRadius: '4px', 
                    cursor: (isCheckingCoupon || !couponCode.trim()) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: (isCheckingCoupon || !couponCode.trim()) ? 0.7 : 1
                  }}
                >
                  {isCheckingCoupon ? '...' : 'تطبيق'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f8f5', padding: '10px', borderRadius: '4px', color: '#27ae60' }}>
                <div>
                  <strong>تم تفعيل الخصم!</strong> ({appliedCoupon.code})
                </div>
                <button 
                  type="button" 
                  onClick={() => setAppliedCoupon(null)}
                  style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  إلغاء
                </button>
              </div>
            )}
            {couponError && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px' }}>{couponError}</div>}
          </div>

          <hr className={styles.divider} />
          
          <div className={styles.summaryRow}>
            <span>المجموع الفرعي</span>
            <span style={{ textDecoration: appliedCoupon ? 'line-through' : 'none', color: appliedCoupon ? '#999' : 'inherit' }}>
              {formatPrice(totalPrice)}
            </span>
          </div>
          
          {appliedCoupon && (
            <div className={styles.summaryRow} style={{ color: '#27ae60' }}>
              <span>بعد الخصم ({appliedCoupon.discount}%)</span>
              <span>{formatPrice(Math.round(totalPrice - (totalPrice * (appliedCoupon.discount / 100))))}</span>
            </div>
          )}
          <div className={styles.summaryRow}>
            <span>الشحن ({selectedGov})</span>
            <span>{formatPrice(shippingCost)}</span>
          </div>
          
          <hr className={styles.divider} />
          
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>الإجمالي المطلوب</span>
            <span>{formatPrice(totalPrice + shippingCost)}</span>
          </div>
          
          <div className={styles.paymentMethod}>
            <strong>طريقة الدفع:</strong> الدفع عند الاستلام (COD) 💵
          </div>
          
          {errorMsg && <div style={{ color: 'red', marginBottom: 'var(--spacing-md)' }}>{errorMsg}</div>}
          
          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isSubmitting}>
            {isSubmitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب'}
          </button>
        </div>
      </form>
    </div>
  );
}
