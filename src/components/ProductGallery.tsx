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
  const [activeIndex, setActiveIndex] = useState(0);
  
  const allImages = [mainImage];
  if (galleryImages && galleryImages.length > 0) {
    allImages.push(...galleryImages);
  }

  const activeImage = allImages[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageWrapper} style={{ position: 'relative' }}>
        <img src={activeImage} alt={productName} className={styles.mainImage} />
        {calculatedDiscount && (
          <div style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: '#e74c3c', color: 'white', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            خصم {calculatedDiscount}%
          </div>
        )}
        
        {allImages.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 5 }}
              aria-label="الصورة السابقة"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <button 
              onClick={handleNext}
              style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 5 }}
              aria-label="الصورة التالية"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          </>
        )}
      </div>
      
      {allImages.length > 1 && (
        <div className={styles.thumbnailList}>
          {allImages.map((img, index) => (
            <div 
              key={index} 
              className={`${styles.thumbnailWrapper} ${activeIndex === index ? styles.activeThumbnail : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <img src={img} alt={`${productName} - صورة ${index + 1}`} className={styles.thumbnail} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
