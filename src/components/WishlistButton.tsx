'use client';

import { useWishlist } from '@/hooks/useWishlist';

interface WishlistButtonProps {
  productId: number;
  style?: React.CSSProperties;
}

export default function WishlistButton({ productId, style }: WishlistButtonProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '1.5rem',
        color: inWishlist ? '#e74c3c' : '#ccc',
        transition: 'all 0.3s ease',
        ...style
      }}
      title={inWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
    >
      {inWishlist ? '♥' : '♡'}
    </button>
  );
}
