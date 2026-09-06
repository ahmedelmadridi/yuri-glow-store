"use client";

import { useCart, Product } from '@/context/CartContext';
import { useState } from 'react';
import { trackEvent } from '@/utils/fpixel';
import styles from './AddToCartButton.module.css';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, quantity);
    
    // Facebook Pixel AddToCart Event
    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'EGP'
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity <= 0;

  if (isOutOfStock) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center' }}>
        <button 
          className={`btn-primary ${styles.addButton}`}
          style={{ backgroundColor: '#95a5a6', cursor: 'not-allowed', width: '100%' }}
          disabled
        >
          نفذت الكمية 😔
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.quantityControl}>
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className={styles.qtyBtn}
        >-</button>
        <span className={styles.qtyValue}>{quantity}</span>
        <button 
          onClick={() => setQuantity(quantity + 1)}
          className={styles.qtyBtn}
        >+</button>
      </div>
      <button 
        className={`btn-primary ${styles.addButton} ${added ? styles.added : ''}`}
        onClick={handleAdd}
      >
        {added ? 'تمت الإضافة بنجاح ✓' : 'إضافة إلى السلة'}
      </button>
    </div>
  );
}
