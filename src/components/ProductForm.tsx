"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { revalidateStore } from '@/app/actions/revalidate';
import { upsertProduct } from '@/app/actions/product';
import { translateProductFields } from '@/app/actions/translate';
import { Product } from '@/data/products';
import { compressImage } from '@/utils/imageCompression';

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [translateSuccess, setTranslateSuccess] = useState('');

  // English state fields
  const [nameEn, setNameEn] = useState(initialData?.name_en || '');
  const [descEn, setDescEn] = useState(initialData?.description_en || '');
  const [featuresEn, setFeaturesEn] = useState(initialData?.features_en || '');
  const [ingredientsEn, setIngredientsEn] = useState(initialData?.ingredients_en || '');
  const [usageEn, setUsageEn] = useState(initialData?.usage_instructions_en || '');

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    setTranslateSuccess('');
    setErrorMsg('');

    try {
      const form = document.querySelector('form') as HTMLFormElement;
      if (!form) return;

      const formData = new FormData(form);
      const name = formData.get('name') as string;
      const category = formData.get('category') as string;
      const description = formData.get('description') as string;
      const features = formData.get('features') as string;
      const ingredients = formData.get('ingredients') as string;
      const usage_instructions = formData.get('usage_instructions') as string;

      if (!description && !name) {
        setErrorMsg('يرجى إدخال اسم ووصف المنتج بالعربية أولاً لتتم ترجمتها.');
        setIsTranslating(false);
        return;
      }

      const res = await translateProductFields({
        name,
        category,
        description,
        features,
        ingredients,
        usage_instructions,
      });

      setNameEn(res.name_en || name);
      setDescEn(res.description_en || '');
      setFeaturesEn(res.features_en || '');
      setIngredientsEn(res.ingredients_en || '');
      setUsageEn(res.usage_instructions_en || '');

      setTranslateSuccess('✨ تم توليد الترجمة الإنجليزية بنجاح! يمكنك مراجعتها قبل الحفظ.');
    } catch (err: any) {
      console.error('Translation error:', err);
      setErrorMsg('حدث خطأ أثناء الترجمة التلقائية: ' + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const price = parseInt(formData.get('price') as string);
    const original_price_str = formData.get('original_price') as string;
    const original_price = original_price_str ? parseInt(original_price_str) : null;
    const cost_price = parseInt(formData.get('cost_price') as string) || 0;
    const stock_quantity = parseInt(formData.get('stock_quantity') as string) || 0;
    const description = formData.get('description') as string;
    const ingredients = formData.get('ingredients') as string || null;
    const features = formData.get('features') as string || null;
    const usage_instructions = formData.get('usage_instructions') as string || null;
    const imageFile = formData.get('image') as File;
    const galleryFiles = formData.getAll('gallery_images') as File[];

    if (!name || !category || !price || !description) {
      setErrorMsg('الرجاء تعبئة جميع الحقول المطلوبة.');
      setIsSubmitting(false);
      return;
    }

    if (!initialData && (!imageFile || !imageFile.size)) {
      setErrorMsg('الرجاء اختيار صورة للمنتج.');
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = initialData?.image || '';
      let galleryUrls = initialData?.gallery_images || [];

      // 1. Upload Main Image to Supabase Storage if a new one is selected
      if (imageFile && imageFile.size > 0) {
        const compressedMain = await compressImage(imageFile, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.82,
          targetFormat: 'image/webp',
        });

        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedMain.file, {
            contentType: 'image/webp',
            upsert: false,
          });

        if (uploadError) {
          throw new Error('حدث خطأ أثناء رفع الصورة الأساسية: ' + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // 2. Upload Gallery Images
      const validGalleryFiles = galleryFiles.filter(f => f.size > 0);
      if (validGalleryFiles.length > 0) {
        const newGalleryUrls: string[] = [];
        
        for (const file of validGalleryFiles) {
          const compressedGallery = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.82,
            targetFormat: 'image/webp',
          });

          const fileName = `gallery_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`;
          const filePath = `public/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, compressedGallery.file, {
              contentType: 'image/webp',
              upsert: false,
            });

          if (uploadError) {
            throw new Error('حدث خطأ أثناء رفع صور المعرض: ' + uploadError.message);
          }

          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          newGalleryUrls.push(publicUrlData.publicUrl);
        }
        
        galleryUrls = newGalleryUrls;
      }

      // 3. Category English Mapping
      let category_en = 'Skincare';
      if (category.includes('شعر')) category_en = 'Haircare';
      else if (category.includes('مكياج')) category_en = 'Makeup';

      // 4. Insert or Update Product into Database using Server Action
      const productData: any = {
        name,
        name_en: nameEn || name,
        category,
        category_en,
        price,
        original_price,
        cost_price,
        stock_quantity,
        description,
        description_en: descEn || null,
        ingredients,
        ingredients_en: ingredientsEn || null,
        features,
        features_en: featuresEn || null,
        usage_instructions,
        usage_instructions_en: usageEn || null,
        image: imageUrl,
        gallery_images: galleryUrls.length > 0 ? galleryUrls : null
      };
      
      if (initialData) {
        productData.id = initialData.id;
      }
      
      const { success, error } = await upsertProduct(productData);

      if (!success) {
        throw new Error(error || 'حدث خطأ غير معروف أثناء حفظ المنتج');
      }

      alert(initialData ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!');

      await revalidateStore();
      router.push('/admin/products');
      router.refresh();

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {errorMsg && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px' }}>
          {errorMsg}
        </div>
      )}

      {translateSuccess && (
        <div style={{ backgroundColor: '#e8f8f5', color: '#27ae60', padding: '12px', borderRadius: '8px' }}>
          {translateSuccess}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم المنتج *</label>
        <input type="text" name="name" defaultValue={initialData?.name} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>التصنيف *</label>
        <select name="category" defaultValue={initialData?.category || ''} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <option value="">اختر التصنيف...</option>
          <option value="العناية بالبشرة">العناية بالبشرة (Skincare)</option>
          <option value="مكياج">مكياج (Makeup)</option>
          <option value="العناية بالشعر">العناية بالشعر (Haircare)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>السعر الحالي (أرقام إنجليزية) *</label>
          <input type="number" name="price" defaultValue={initialData?.price} required min="1" placeholder="مثال: 850" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>السعر القديم (اختياري)</label>
          <input type="number" name="original_price" defaultValue={initialData?.original_price || ''} min="1" placeholder="لعمل خصم، مثال: 1000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>سعر التكلفة (لحساب الأرباح) *</label>
          <input type="number" name="cost_price" defaultValue={initialData?.cost_price ?? 0} required min="0" placeholder="مثال: 450" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>الكمية المتاحة في المخزن *</label>
          <input type="number" name="stock_quantity" defaultValue={initialData?.stock_quantity ?? 10} required min="0" placeholder="مثال: 50" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          الصورة الرئيسية للمنتج {initialData ? '(اتركها فارغة للاحتفاظ بالصورة الحالية)' : '*'}
        </label>
        <input type="file" name="image" accept="image/*" required={!initialData} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          صور إضافية للمنتج (معرض الصور - يمكنك تحديد أكثر من صورة)
        </label>
        <input type="file" name="gallery_images" accept="image/*" multiple style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }} />
        {initialData?.gallery_images && initialData.gallery_images.length > 0 && (
          <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>يوجد حالياً {initialData.gallery_images.length} صور إضافية. رفع صور جديدة سيستبدل الصور القديمة.</p>
        )}
      </div>

      {/* Auto Translate Banner */}
      <div style={{ backgroundColor: '#f5f0e1', border: '1px dashed var(--color-primary)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <strong style={{ color: 'var(--color-primary-dark)' }}>✨ الترجمة التلقائية الذكية</strong>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            اكتب البيانات بالعربية ثم اضغط هذا الزر لتوليد الحقول الإنجليزية تلقائياً، أو اتركها فارغة ليتم ترجمتها تلقائياً عند الحفظ!
          </p>
        </div>
        <button
          type="button"
          onClick={handleAutoTranslate}
          disabled={isTranslating}
          style={{
            backgroundColor: 'var(--color-primary-dark)',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: isTranslating ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: isTranslating ? 0.7 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isTranslating ? 'جاري الترجمة...' : '✨ ترجمة الحقول للإنجليزية الآن'}
        </button>
      </div>

      {/* Arabic Fields */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>وصف المنتج الأساسي (بالعربية) *</label>
        <textarea name="description" defaultValue={initialData?.description} required rows={5} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}></textarea>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>مكونات المنتج (بالعربية)</label>
        <textarea name="ingredients" defaultValue={initialData?.ingredients || ''} rows={3} placeholder="اختياري" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}></textarea>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>مميزات المنتج (بالعربية)</label>
        <textarea name="features" defaultValue={initialData?.features || ''} rows={3} placeholder="اختياري" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}></textarea>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>طريقة الاستخدام (بالعربية)</label>
        <textarea name="usage_instructions" defaultValue={initialData?.usage_instructions || ''} rows={3} placeholder="اختياري" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}></textarea>
      </div>

      {/* English Fields Section */}
      <div style={{ backgroundColor: '#fafafa', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <h3 style={{ color: 'var(--color-primary-dark)', fontSize: '1.2rem', marginBottom: '4px' }}>
          🇬🇧 الحقول باللغة الإنجليزية (English Content)
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: 0 }}>
          يتم ملؤها تلقائياً عند الضغط على زر الترجمة التلقائية أعلاه، أو يمكنك تعديلها يدوياً.
        </p>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Product Name (English)</label>
          <input 
            type="text" 
            value={nameEn} 
            onChange={(e) => setNameEn(e.target.value)} 
            placeholder="e.g. Celimax The Vita A Retinal Shot..."
            dir="ltr"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Product Description (English)</label>
          <textarea 
            value={descEn} 
            onChange={(e) => setDescEn(e.target.value)} 
            rows={4} 
            placeholder="English description..."
            dir="ltr"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          ></textarea>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Ingredients (English)</label>
          <textarea 
            value={ingredientsEn} 
            onChange={(e) => setIngredientsEn(e.target.value)} 
            rows={3} 
            placeholder="English ingredients..."
            dir="ltr"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          ></textarea>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Features (English)</label>
          <textarea 
            value={featuresEn} 
            onChange={(e) => setFeaturesEn(e.target.value)} 
            rows={3} 
            placeholder="English features..."
            dir="ltr"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          ></textarea>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>How to Use (English)</label>
          <textarea 
            value={usageEn} 
            onChange={(e) => setUsageEn(e.target.value)} 
            rows={3} 
            placeholder="English usage instructions..."
            dir="ltr"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          ></textarea>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', border: 'none', opacity: isSubmitting ? 0.7 : 1 }}>
        {isSubmitting ? 'جاري الحفظ...' : (initialData ? 'تحديث المنتج' : 'إضافة المنتج')}
      </button>
    </form>
  );
}
