'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ViewCounter() {
  useEffect(() => {
    // Only count once per session to avoid counting page refreshes
    if (typeof window !== 'undefined' && !sessionStorage.getItem('visited')) {
      supabase.rpc('increment_page_view').then(({ error }) => {
        if (!error) {
          sessionStorage.setItem('visited', 'true');
        }
      });
    }
  }, []);
  
  return null;
}
