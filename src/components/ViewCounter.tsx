'use client';

import { useEffect } from 'react';
import { trackStoreVisit } from '@/app/actions/track';

export default function ViewCounter() {
  useEffect(() => {
    // Only count once per session to avoid counting page refreshes
    if (typeof window !== 'undefined' && !sessionStorage.getItem('visited')) {
      trackStoreVisit().then((res) => {
        if (!res?.error) {
          sessionStorage.setItem('visited', 'true');
        }
      }).catch(console.error);
    }
  }, []);
  
  return null;
}
