'use client';

import { useState } from 'react';
import styles from './ProductGallery.module.css';

interface ProductGalleryProps {
  mainImage: string;
  galleryImages?: string[] | null;
  productName: string;
  calculatedDiscount?: number | null;
}

export default function ProductGallery({ mainImage, galleryImages, productName, calculatedDiscount }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(mainImage);
  
  const allImages = [mainImage];
  if (galleryImages && galleryImages.length > 0) {
    allImages.push(...galleryImages);
  }

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageWrapper} style={{ position: 'relative' }}>
        <img src={activeImage} alt={productName} className={styles.mainImage} />
        {calculatedDiscount && (
          <div style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: '#e74c3c', color: 'white', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            خصم {calculatedDiscount}%
          </div>
        )}
      </div>
      
      {allImages.length > 1 && (
        <div className={styles.thumbnailList}>
          {allImages.map((img, index) => (
            <div 
              key={index} 
              className={`${styles.thumbnailWrapper} ${activeImage === img ? styles.activeThumbnail : ''}`}
              onClick={() => setActiveImage(img)}
            >
              <img src={img} alt={`${productName} - صورة ${index + 1}`} className={styles.thumbnail} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
