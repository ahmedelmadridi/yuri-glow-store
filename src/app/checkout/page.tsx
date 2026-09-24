"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { governorates } from '@/data/governorates';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import { sendTelegramOrder } from '@/app/actions/telegram';
import { validateCoupon } from '@/app/actions/coupons';
import { sendGAEvent } from '@next/third-parties/google';
import styles from './page.module.css';

function CopyButton({ text, color }: { text: string, color: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button 
      type="button" 
      onClick={handleCopy} 
      style={{ 
        background: 'none', 
        border: `1px solid ${color}`, 
        borderRadius: '4px', 
        padding: '2px 6px', 
        fontSize: '0.75rem', 
        marginRight: '8px', 
        cursor: 'pointer', 
        color: color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
      title="نسخ"
    >
      {copied ? '✅ تم' : '📋 نسخ'}
    </button>
  );
}

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
    notes: '',
    paymentMethod: 'wallet',
    walletReference: ''
  });
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);

  // Redirect if cart is empty (but not if we just submitted the order)
  useEffect(() => {
    if (cart.length === 0 && !isSubmitted) {
      router.push('/cart');
    } else if (cart.length > 0 && !isSubmitted) {
      // Fire GA event for begin checkout
      sendGAEvent('event', 'begin_checkout', {
        currency: 'EGP',
        value: totalPrice,
        items: cart.map(item => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))
      });

      // Fire Meta Pixel event for begin checkout
      import('@/utils/fpixel').then(({ trackEvent }) => {
        trackEvent('InitiateCheckout', {
          content_ids: cart.map(item => item.product.id),
          content_type: 'product',
          value: totalPrice,
          currency: 'EGP',
        });
      });
    }
  }, [cart, isSubmitted, router, totalPrice]);

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

  // Calculate totals
  let subtotal = totalPrice;
  if (appliedCoupon) {
    subtotal = Math.round(subtotal - (subtotal * (appliedCoupon.discount / 100)));
  }
  
  // Free shipping if subtotal >= 3000 AND no coupon is applied (using totalPrice as original code did)
  const actualShippingCost = (totalPrice >= 3000 && !appliedCoupon) ? 0 : shippingCost;
  
  const finalTotal = subtotal + actualShippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

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
        notes: formData.notes + 
               (appliedCoupon ? `\n(تم استخدام كود خصم: ${appliedCoupon.code})` : '') +
               (formData.paymentMethod === 'wallet' ? `\n[دفع إلكتروني: انستاباي/محفظة - الرقم المرجعي: ${formData.walletReference}]` : `\n[طريقة الدفع: عند الاستلام${actualShippingCost > 0 ? ` - تم دفع الشحن مقدماً من: ${formData.walletReference || 'لم يحدد'}` : ''}]`),
        subtotal_amount: subtotal,
        shipping_cost: actualShippingCost,
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
    }
    
    // 3. Send Telegram Notification
    try {
      const orderItemsText = cart.map(item => `- ${item.product.name} (x${item.quantity})`).join('\n');
      let paymentText = '';
      if (formData.paymentMethod === 'wallet') {
        paymentText = `انستاباي / محفظة إلكترونية\n🔢 <b>الرقم المحول منه:</b> ${formData.walletReference}`;
      } else {
        paymentText = `الدفع عند الاستلام\n${actualShippingCost > 0 ? `(تم دفع الشحن ${actualShippingCost} مقدماً من: ${formData.walletReference || 'لم يحدد'})` : ''}`;
      }

      const message = `
📦 <b>طلب جديد!</b> (Yuri Glow)

👤 <b>الاسم:</b> ${formData.name}
📱 <b>الهاتف:</b> ${formData.phone}
📍 <b>المحافظة:</b> ${selectedGov}
🏠 <b>العنوان:</b> ${formData.address}
📝 <b>ملاحظات:</b> ${formData.notes || 'لا يوجد'}
💳 <b>طريقة الدفع:</b> ${paymentText}
🎟️ <b>كود الخصم:</b> ${appliedCoupon ? `${appliedCoupon.code} (${appliedCoupon.discount}%)` : 'لا يوجد'}

🛍️ <b>المنتجات:</b>
${orderItemsText}

💰 <b>الإجمالي:</b> ${formatPrice(finalTotal)} (بما في ذلك الشحن)
      `;
      
      const tgFormData = new FormData();
      tgFormData.append('message', message);
      if (paymentReceipt) {
        tgFormData.append('photo', paymentReceipt);
      }
      await sendTelegramOrder(tgFormData);
    } catch (e) {
      console.error("Failed to send telegram notification", e);
    }
    
    // Facebook Pixel Purchase Event
    import('@/utils/fpixel').then(({ trackEvent }) => {
      trackEvent('Purchase', {
        value: finalTotal,
        currency: 'EGP',
        content_ids: cart.map(item => item.product.id),
        content_type: 'product',
      });
    });

    // Google Analytics Purchase Event
    sendGAEvent('event', 'purchase', {
      transaction_id: orderId,
      currency: 'EGP',
      value: finalTotal,
      shipping: actualShippingCost,
      coupon: appliedCoupon ? appliedCoupon.code : undefined,
      items: cart.map(item => ({
        item_id: item.product.id,
        item_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))
    });
    
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
                    backgroundColor: 'var(--color-primary-dark)', 
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
            <span>
              {totalPrice >= 3000 && !appliedCoupon ? (
                <span style={{ color: '#27ae60', fontWeight: 'bold' }}>مجانًا! 🎁</span>
              ) : (
                formatPrice(shippingCost)
              )}
            </span>
          </div>
          
          <hr className={styles.divider} />
          
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>الإجمالي المطلوب</span>
            <span>{formatPrice((appliedCoupon ? Math.round(totalPrice - (totalPrice * (appliedCoupon.discount / 100))) : totalPrice) + ((totalPrice >= 3000 && !appliedCoupon) ? 0 : shippingCost))}</span>
          </div>
          
          <div style={{ marginBottom: 'var(--spacing-md)', backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>طريقة الدفع</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={formData.paymentMethod === 'cod'} 
                  onChange={handleInputChange} 
                />
                الدفع عند الاستلام 💵
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="wallet" 
                  checked={formData.paymentMethod === 'wallet'} 
                  onChange={handleInputChange} 
                />
                دفع إلكتروني (انستاباي/محفظة) 📱
              </label>
            </div>
            
            {formData.paymentMethod === 'cod' && actualShippingCost > 0 && (
              <div style={{ padding: '12px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeeba', marginBottom: '16px' }}>
                <p style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#856404' }}>
                  <strong>تنبيه هام:</strong> لتأكيد طلبك بنظام "الدفع عند الاستلام"، برجاء تحويل قيمة الشحن (<strong>{formatPrice(actualShippingCost)}</strong>) مقدماً، وسيتم دفع باقي المبلغ (<strong>{formatPrice(finalTotal - actualShippingCost)}</strong>) عند الاستلام.
                </p>
                <ul style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#856404', paddingRight: '20px' }}>
                  <li>انستاباي: <strong>ahmed_elmadridi@instapay</strong> <CopyButton text="ahmed_elmadridi@instapay" color="#856404" /></li>
                  <li>المحافظ الإلكترونية (أورانج كاش/فودافون كاش): <strong style={{ direction: 'ltr', display: 'inline-block' }}>01277885159</strong> <CopyButton text="01277885159" color="#856404" /></li>
                </ul>
                <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                  <label htmlFor="walletReferenceCod" style={{ fontSize: '0.9rem', color: '#856404' }}>رقم الهاتف المحول منه لتأكيد دفع الشحن *</label>
                  <input 
                    type="text" 
                    id="walletReferenceCod" 
                    name="walletReference" 
                    required={formData.paymentMethod === 'cod' && actualShippingCost > 0} 
                    value={formData.walletReference} 
                    onChange={handleInputChange} 
                    placeholder="مثال: 01012345678"
                    style={{ border: '1px solid #ffeeba' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="paymentReceiptCod" style={{ fontSize: '0.9rem', color: '#856404' }}>إرفاق سكرين شوت للتحويل *</label>
                  <input 
                    type="file" 
                    id="paymentReceiptCod" 
                    accept="image/*"
                    required={formData.paymentMethod === 'cod' && actualShippingCost > 0}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPaymentReceipt(e.target.files[0]);
                      }
                    }}
                    style={{ border: '1px solid #ffeeba', padding: '8px', backgroundColor: 'white', borderRadius: '4px', width: '100%' }}
                  />
                </div>
              </div>
            )}

            {formData.paymentMethod === 'wallet' && (
              <div style={{ padding: '12px', backgroundColor: '#e8f8f5', borderRadius: '4px', border: '1px solid #27ae60' }}>
                <p style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#1e8449' }}>
                  <strong>برجاء تحويل إجمالي المبلغ (<strong>{formatPrice(finalTotal)}</strong>) على أحد الأرقام التالية لتأكيد طلبك:</strong>
                </p>
                <ul style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#1e8449', paddingRight: '20px' }}>
                  <li>انستاباي: <strong>ahmed_elmadridi@instapay</strong> <CopyButton text="ahmed_elmadridi@instapay" color="#1e8449" /></li>
                  <li>المحافظ الإلكترونية (أورانج كاش/فودافون كاش): <strong style={{ direction: 'ltr', display: 'inline-block' }}>01277885159</strong> <CopyButton text="01277885159" color="#1e8449" /></li>
                </ul>
                <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                  <label htmlFor="walletReferenceWallet" style={{ fontSize: '0.9rem', color: '#1e8449' }}>رقم الهاتف المحول منه أو رقم العملية لتأكيد الدفع *</label>
                  <input 
                    type="text" 
                    id="walletReferenceWallet" 
                    name="walletReference" 
                    required={formData.paymentMethod === 'wallet'} 
                    value={formData.walletReference} 
                    onChange={handleInputChange} 
                    placeholder="مثال: 01012345678"
                    style={{ border: '1px solid #27ae60' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="paymentReceiptWallet" style={{ fontSize: '0.9rem', color: '#1e8449' }}>إرفاق سكرين شوت للتحويل *</label>
                  <input 
                    type="file" 
                    id="paymentReceiptWallet" 
                    accept="image/*"
                    required={formData.paymentMethod === 'wallet'}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPaymentReceipt(e.target.files[0]);
                      }
                    }}
                    style={{ border: '1px solid #27ae60', padding: '8px', backgroundColor: 'white', borderRadius: '4px', width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {errorMsg && <div style={{ color: 'red', marginBottom: 'var(--spacing-md)' }}>{errorMsg}</div>}
          
          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب'}
          </button>
        </div>
      </form>
    </div>
  );
}
