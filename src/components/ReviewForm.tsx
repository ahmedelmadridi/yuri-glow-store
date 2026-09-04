'use client';

import { useState } from 'react';
import { addReview } from '@/app/actions/reviews';

interface ReviewFormProps {
  productId: number;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || rating < 1) return;

    setStatus('loading');
    const res = await addReview(productId, name, rating, comment);
    
    if (res.error) {
      setStatus('error');
    } else {
      setStatus('success');
      setName('');
      setComment('');
      setRating(5);
    }
  };

  if (status === 'success') {
    return (
      <div style={{ backgroundColor: '#e8f8f5', color: '#27ae60', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-md)', textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
        شكراً لك! تمت إضافة تقييمك بنجاح. سيتم نشره بعد مراجعته من الإدارة.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 'var(--spacing-lg)', backgroundColor: '#f9f9f9', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)' }}>
      <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-primary-dark)' }}>أضف تقييمك للمنتج</h3>
      
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>التقييم:</label>
        <div style={{ display: 'flex', gap: '8px', fontSize: '1.5rem', cursor: 'pointer' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star} 
              onClick={() => setRating(star)}
              style={{ color: star <= rating ? '#f1c40f' : '#ddd' }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>الاسم:</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
          placeholder="اكتب اسمك..."
        />
      </div>

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>رأيك في المنتج:</label>
        <textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={3}
          style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', resize: 'vertical' }}
          placeholder="أخبرنا عن تجربتك..."
        />
      </div>

      <button 
        type="submit" 
        disabled={status === 'loading'}
        style={{ 
          backgroundColor: 'var(--color-primary)', 
          color: 'white', 
          border: 'none', 
          padding: '12px 24px', 
          borderRadius: '25px', 
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          width: '100%',
          opacity: status === 'loading' ? 0.7 : 1
        }}
      >
        {status === 'loading' ? 'جاري الإرسال...' : 'إرسال التقييم'}
      </button>

      {status === 'error' && (
        <div style={{ color: '#e74c3c', marginTop: '12px', textAlign: 'center' }}>حدث خطأ، يرجى المحاولة مرة أخرى.</div>
      )}
    </form>
  );
}
