"use client";

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import styles from './page.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>سلة المشتريات فارغة</h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xl)' }}>لم تقومي بإضافة أي منتجات للسلة بعد.</p>
        <Link href="/products" className="btn-primary">تصفح المنتجات</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <h1 className={styles.pageTitle}>سلة المشتريات</h1>
      
      <div className={styles.cartLayout}>
        <div className={styles.cartItems}>
          {cart.map((item) => (
            <div key={item.product.id} className={styles.cartItem}>
              <div className={styles.itemImageWrapper}>
                <img src={item.product.image} alt={item.product.name} />
              </div>
              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.product.name}</h3>
                <div className={styles.itemPrice}>{formatPrice(item.product.price)}</div>
              </div>
              <div className={styles.itemTotal}>
                المجموع: {formatPrice(item.product.price * item.quantity)}
              </div>
              <div className={styles.itemActions}>
                <div className={styles.quantityControl}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.product.stock_quantity !== undefined && item.product.stock_quantity !== null && item.quantity >= item.product.stock_quantity}
                    style={{ opacity: (item.product.stock_quantity !== undefined && item.product.stock_quantity !== null && item.quantity >= item.product.stock_quantity) ? 0.3 : 1, cursor: (item.product.stock_quantity !== undefined && item.product.stock_quantity !== null && item.quantity >= item.product.stock_quantity) ? 'not-allowed' : 'pointer' }}
                  >+</button>
                </div>
                <button 
                  className={styles.removeBtn} 
                  onClick={() => removeFromCart(item.product.id)}
                  aria-label="إزالة المنتج"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>ملخص الطلب</h2>
          <div className={styles.summaryRow}>
            <span>المجموع الفرعي</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>التوصيل</span>
            <span>يتم حسابه عند الدفع</span>
          </div>
          <hr className={styles.divider} />
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>الإجمالي (بدون الشحن)</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <Link href="/checkout" className={`btn-primary ${styles.checkoutBtn}`}>
            متابعة الدفع
          </Link>
        </div>
      </div>
    </div>
  );
}
