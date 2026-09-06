'use client';

import { useState, useEffect } from 'react';
import styles from '../app/page.module.css';

interface HeroSliderProps {
  images: string[];
}

export default function HeroSlider({ images }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <img 
        src="/hero.jpg" 
        alt="مجموعة العناية بالبشرة الكورية" 
        className={styles.heroImage}
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {images.map((img, idx) => (
        <img 
          key={idx}
          src={img} 
          alt={`Slider image ${idx + 1}`} 
          className={styles.heroImage}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: idx === currentIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: idx === currentIndex ? 1 : 0
          }}
        />
      ))}
      
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 10 }}>
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: idx === currentIndex ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
