"use client";

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedProduct } from '@/data/products';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import styles from './page.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { t, locale } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>{t('cart.emptyTitle')}</h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xl)' }}>{t('cart.emptySubtitle')}</p>
        <Link href="/products" className="btn-primary">{t('cart.browseProducts')}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <h1 className={styles.pageTitle}>{t('cart.title')}</h1>
      
      <div className={styles.cartLayout}>
        <div className={styles.cartItems}>
          {cart.map((item) => {
            const product = getLocalizedProduct(item.product, locale);
            return (
              <div key={item.product.id} className={styles.cartItem}>
                <div className={styles.itemImageWrapper}>
                  <img src={product.image} alt={product.name} />
                </div>
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{product.name}</h3>
                  <div className={styles.itemPrice}>{formatPrice(product.price, locale)}</div>
                </div>
                <div className={styles.itemTotal}>
                  {t('cart.itemTotal')} {formatPrice(product.price * item.quantity, locale)}
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.quantityControl}>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Decrease quantity">-</button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.product.stock_quantity !== undefined && item.product.stock_quantity !== null && item.quantity >= item.product.stock_quantity}
                      style={{ opacity: (item.product.stock_quantity !== undefined && item.product.stock_quantity !== null && item.quantity >= item.product.stock_quantity) ? 0.3 : 1, cursor: (item.product.stock_quantity !== undefined && item.product.stock_quantity !== null && item.quantity >= item.product.stock_quantity) ? 'not-allowed' : 'pointer' }}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <button 
                    className={styles.removeBtn} 
                    onClick={() => removeFromCart(item.product.id)}
                    aria-label={t('cart.removeItem')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.cartSummary}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>{t('checkout.orderSummary')}</h2>
          <div className={styles.summaryRow}>
            <span>{t('cart.subtotal')}</span>
            <span>{formatPrice(totalPrice, locale)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>{t('checkout.shipping')}</span>
            <span>{locale === 'en' ? 'Calculated at checkout' : 'يتم حسابه عند الدفع'}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#856404', backgroundColor: '#fff3cd', padding: '8px', borderRadius: '4px', marginTop: '8px', textAlign: 'center' }}>
            <strong>{t('checkout.codNoticeLabel')}</strong> {locale === 'en' ? 'For Cash on Delivery, an advance shipping deposit is required via Instapay or e-wallets to confirm.' : 'في حال اختيار "الدفع عند الاستلام"، يتم تحويل قيمة الشحن مقدماً (عبر انستاباي أو المحافظ الإلكترونية) لتأكيد الطلب.'}
          </div>
          <hr className={styles.divider} />
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>{locale === 'en' ? 'Total (excl. shipping)' : 'الإجمالي (بدون الشحن)'}</span>
            <span>{formatPrice(totalPrice, locale)}</span>
          </div>
          <Link href="/checkout" className={`btn-primary ${styles.checkoutBtn}`}>
            {t('cart.checkoutBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
