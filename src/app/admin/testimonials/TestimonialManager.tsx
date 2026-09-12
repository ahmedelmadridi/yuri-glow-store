'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { addScreenshotReview, deleteScreenshotReview } from '@/app/actions/admin-content';

export default function TestimonialManager({ initialTestimonials }: { initialTestimonials: any[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `testimonials/${fileName}`;

    try {
      // 1. Upload image to Supabase Storage (using the same product-images bucket)
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // 2. Save to database using server action
      const { success, data: newTestimonial, error } = await addScreenshotReview(imageUrl, testimonials.length);

      if (!success) throw new Error(error);

      setTestimonials([...testimonials, newTestimonial]);
      router.refresh();
    } catch (err: any) {
      alert('حدث خطأ أثناء رفع الصورة: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      // Extract file path from URL
      const pathParts = imageUrl.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Delete using server action
      const { success, error } = await deleteScreenshotReview(id, fileName);
      if (!success) throw new Error(error);

      setTestimonials(testimonials.filter(t => t.id !== id));
      router.refresh();
    } catch (err: any) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ marginBottom: 'var(--spacing-xl)', padding: '20px', border: '2px dashed var(--color-border)', borderRadius: '8px', textAlign: 'center' }}>
        <h3>إضافة صورة رأي جديد (سكرين شوت)</h3>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '15px' }}>قم برفع صور شاشة (Screenshots) لرسائل العملاء.</p>
        <label className="btn-primary" style={{ cursor: isUploading ? 'wait' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
          {isUploading ? 'جاري الرفع...' : 'اختيار صورة ورفعها'}
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      <div>
        <h3>الآراء الحالية ({testimonials.length})</h3>
        {testimonials.length === 0 ? (
          <p style={{ color: 'var(--color-text-light)', marginTop: '10px' }}>لا توجد صور لآراء العملاء حالياً.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {testimonials.map((testi, index) => (
              <div key={testi.id} style={{ position: 'relative', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={testi.image_url} alt={`Testimonial ${index + 1}`} style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>صورة {index + 1}</span>
                  <button 
                    onClick={() => handleDelete(testi.id, testi.image_url)}
                    style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
