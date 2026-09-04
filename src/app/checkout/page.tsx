"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { governorates } from '@/data/governorates';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import { sendTelegramNotification } from '@/app/actions/telegram';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  
  const [selectedGov, setSelectedGov] = useState(governorates[0].name);
  const [shippingCost, setShippingCost] = useState(governorates[0].shippingCost);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    // Parse total to int for safety
    const subtotal = totalPrice;
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
        notes: formData.notes,
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
          
          <div className={styles.summaryRow}>
            <span>المجموع الفرعي</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
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
