'use client';

import { useState, useEffect } from 'react';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Load initial from local storage
  useEffect(() => {
    const stored = localStorage.getItem('yuri_wishlist');
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }

    // Listen to changes from other tabs or components
    const handleStorageChange = () => {
      const updated = localStorage.getItem('yuri_wishlist');
      if (updated) {
        setWishlist(JSON.parse(updated));
      } else {
        setWishlist([]);
      }
    };

    window.addEventListener('wishlist-updated', handleStorageChange);
    return () => window.removeEventListener('wishlist-updated', handleStorageChange);
  }, []);

  const toggleWishlist = (productId: number) => {
    let newWishlist = [...wishlist];
    if (newWishlist.includes(productId)) {
      newWishlist = newWishlist.filter(id => id !== productId);
    } else {
      newWishlist.push(productId);
    }
    
    setWishlist(newWishlist);
    localStorage.setItem('yuri_wishlist', JSON.stringify(newWishlist));
    // Dispatch event so other components (like header) know it changed
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const isInWishlist = (productId: number) => wishlist.includes(productId);

  return { wishlist, toggleWishlist, isInWishlist };
}
