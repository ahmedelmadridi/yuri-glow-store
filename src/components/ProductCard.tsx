"use client";

import Link from 'next/link';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/format';
import styles from './ProductCard.module.css';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // Calculate discount percentage automatically
  let calculatedDiscount = product.discount_percentage;
  if (!calculatedDiscount && product.original_price && product.original_price > product.price) {
    calculatedDiscount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the link
    if (isOutOfStock) return;
    addToCart(product, 1);
    
    // Optional: show a small toast or visual feedback here
    alert('تم إضافة المنتج للسلة بنجاح!');
  };

  return (
    <div className={`${styles.productCard} ${isOutOfStock ? styles.outOfStockCard : ''}`}>
      <Link href={`/products/${product.id}`} className={styles.productImageWrapper}>
        <img src={product.image} alt={product.name} className={`${styles.productImage} ${isOutOfStock ? styles.dimmedImage : ''}`} />
        
        {isOutOfStock ? (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem', zIndex: 10, whiteSpace: 'nowrap' }}>
            نفذت الكمية
          </div>
        ) : calculatedDiscount ? (
          <div className={styles.discountBadge}>
            خصم {calculatedDiscount}%
          </div>
        ) : null}

        <div onClick={(e) => e.preventDefault()} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
          <WishlistButton productId={product.id} />
        </div>
      </Link>
      <div className={styles.productInfo}>
        <div className={styles.productCategory}>{product.category}</div>
        <Link href={`/products/${product.id}`}>
          <h3 className={styles.productName}>{product.name}</h3>
        </Link>
        <div className={styles.productBottom}>
          <div className={styles.priceContainer}>
            <span className={styles.productPrice}>{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className={styles.originalPrice}>{formatPrice(product.original_price)}</span>
            )}
          </div>
          <div className={styles.actionsContainer}>
            <Link href={`/products/${product.id}`} className={styles.detailsBtn}>
              التفاصيل
            </Link>
            <button 
              onClick={handleAddToCart} 
              className={styles.addToCartBtn} 
              aria-label="أضف للسلة"
              disabled={isOutOfStock}
              style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
