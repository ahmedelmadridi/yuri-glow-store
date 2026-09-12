'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

interface Testimonial {
  id: string | number;
  image_url: string;
}

export default function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollNext = () => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 300 : 250;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 300 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto-slide effect
  useEffect(() => {
    if (!testimonials || testimonials.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const scrollAmount = window.innerWidth > 768 ? 300 : 250;
        
        // max scroll in RTL (since scrollLeft goes negative or positive depending on browser, taking Math.abs is safer)
        const maxScroll = scrollWidth - clientWidth;
        
        if (Math.abs(scrollLeft) >= maxScroll - 10) {
          // Reached the end, go back to start
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll next
          scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3000); // slide every 3 seconds

    return () => clearInterval(interval);
  }, [testimonials, isPaused]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div 
      style={{ position: 'relative', width: '100%', padding: '0 10px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div 
        ref={scrollRef}
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          scrollBehavior: 'smooth',
          gap: 'var(--spacing-xl)',
          paddingBottom: '20px',
          paddingTop: '10px',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
        className="hide-scrollbar"
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {testimonials.map((testi) => (
          <div key={testi.id} style={{
            flex: '0 0 auto',
            width: '250px',
            borderRadius: 'var(--border-radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            aspectRatio: '9/16',
            position: 'relative'
          }}>
            <Image 
              src={testi.image_url} 
              alt="Customer Review" 
              fill 
              style={{ objectFit: 'cover' }}
              sizes="250px"
            />
          </div>
        ))}
      </div>

      {testimonials.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            style={{
              position: 'absolute',
              right: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 10,
              color: 'var(--color-text)',
            }}
            aria-label="السابق"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          
          <button 
            onClick={scrollNext}
            style={{
              position: 'absolute',
              left: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 10,
              color: 'var(--color-text)',
            }}
            aria-label="التالي"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
