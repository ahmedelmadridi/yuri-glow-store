'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

import { addBanner, deleteBanner } from '@/app/actions/admin-content';
import { compressImage } from '@/utils/imageCompression';

export default function BannerManager({ initialBanners }: { initialBanners: any[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const rawFile = e.target.files[0];

    try {
      setUploadStatus('جاري ضغط الصورة وتصغير أبعادها وتحويلها إلى WebP...');
      
      // Auto compress & resize to max 1920x1080 and convert to modern WebP format
      const compressed = await compressImage(rawFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.82,
        targetFormat: 'image/webp',
      });

      setUploadStatus(
        `تم ضغط الصورة من ${compressed.originalFormatted} إلى ${compressed.compressedFormatted} (توفير ${compressed.savedPercentage}%). جاري الرفع للسيرفر...`
      );

      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
      const filePath = `banners/${fileName}`;

      // 1. Upload compressed WebP image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressed.file, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // 2. Save to database using server action
      const { success, data: newBanner, error } = await addBanner(imageUrl, banners.length);

      if (!success) throw new Error(error);

      setBanners([...banners, newBanner]);
      router.refresh();
      alert(
        `✅ تم رفع البنر بنجاح بصيغة WebP فائقة السرعة!\n\n• الحجم الأصلي: ${compressed.originalFormatted}\n• الحجم بعد الضغط: ${compressed.compressedFormatted}\n• تم توفير: ${compressed.savedPercentage}% من استهلاك الباقة.`
      );
    } catch (err: any) {
      alert('حدث خطأ أثناء رفع الصورة: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadStatus('');
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البنر؟')) return;

    try {
      // Extract file path from URL
      const pathParts = imageUrl.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Delete using server action
      const { success, error } = await deleteBanner(id, fileName);
      if (!success) throw new Error(error);

      setBanners(banners.filter(b => b.id !== id));
      router.refresh();
    } catch (err: any) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ marginBottom: 'var(--spacing-xl)', padding: '20px', border: '2px dashed var(--color-border)', borderRadius: '8px', textAlign: 'center' }}>
        <h3>إضافة صورة جديدة</h3>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '8px' }}>
          يتم ضغط الصورة وتحويلها تلقائياً إلى صيغة <strong>WebP</strong> خفيفة وسريعة التحميل للحفاظ على باقة السيرفر وسرعة المتجر.
        </p>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '15px' }}>
          الأبعاد الموصى بها: بعرض 1920 بكسل وارتفاع 800 بكسل.
        </p>
        
        {uploadStatus && (
          <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', border: '1px solid #bbf7d0' }}>
            {uploadStatus}
          </div>
        )}

        <label className="btn-primary" style={{ cursor: isUploading ? 'wait' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
          {isUploading ? 'جاري المعالجة والرفع...' : 'اختيار صورة ورفعها'}
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
        <h3>الصور الحالية ({banners.length})</h3>
        {banners.length === 0 ? (
          <p style={{ color: 'var(--color-text-light)', marginTop: '10px' }}>لا توجد صور حالياً. سيتم عرض الصورة الافتراضية للمتجر.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {banners.map((banner, index) => (
              <div key={banner.id} style={{ position: 'relative', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={banner.image_url} alt={`Banner ${index + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>صورة رقم {index + 1}</span>
                  <button 
                    onClick={() => handleDelete(banner.id, banner.image_url)}
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
