'use client';

import Link from 'next/link';
import { useWishlist } from '@/hooks/useWishlist';

export default function WishlistHeaderLink() {
  const { wishlist } = useWishlist();

  return (
    <Link href="/wishlist" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      {wishlist.length > 0 && (
        <span style={{
          position: 'absolute',
          top: '-8px',
          right: '-12px',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {wishlist.length}
        </span>
      )}
    </Link>
  );
}
