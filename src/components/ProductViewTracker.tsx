'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/utils/fpixel';

interface ProductViewTrackerProps {
  productId: number;
  productName: string;
  price: number;
}

export default function ProductViewTracker({ productId, productName, price }: ProductViewTrackerProps) {
  useEffect(() => {
    trackEvent('ViewContent', {
      content_ids: [productId],
      content_name: productName,
      content_type: 'product',
      value: price,
      currency: 'EGP'
    });
  }, [productId, productName, price]);

  return null;
}
