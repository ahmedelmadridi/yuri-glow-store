"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { revalidateStore } from '@/app/actions/revalidate';
import { upsertProduct } from '@/app/actions/product';

import { Product } from '@/data/products';

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

      // 1. Upload Image to Supabase Storage if a new one is selected
      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error('حدث خطأ أثناء رفع الصورة: ' + uploadError.message);
        }

        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // 3. Insert or Update Product into Database using Server Action
      const productData: any = {
        name,
        category,
        price,
        original_price,
        cost_price,
        stock_quantity,
        description,
        ingredients,
        features,
        usage_instructions,
        image: imageUrl
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

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم المنتج *</label>
        <input type="text" name="name" defaultValue={initialData?.name} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>التصنيف *</label>
        <select name="category" defaultValue={initialData?.category || ''} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <option value="">اختر التصنيف...</option>
          <option value="العناية بالبشرة">العناية بالبشرة</option>
          <option value="مكياج">مكياج</option>
          <option value="العناية بالشعر">العناية بالشعر</option>
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
          صورة المنتج {initialData ? '(اتركه فارغاً للاحتفاظ بالصورة الحالية)' : '*'}
        </label>
        <input type="file" name="image" accept="image/*" required={!initialData} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>وصف المنتج الأساسي *</label>
        <textarea name="description" defaultValue={initialData?.description} required rows={5} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}></textarea>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>مكونات المنتج (اختياري)</label>
        <textarea name="ingredients" defaultValue={initialData?.ingredients || ''} rows={4} placeholder="اتركه فارغاً إذا كنت لا ترغب بإظهاره للعميل" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}></textarea>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>مميزات المنتج (اختياري)</label>
        <textarea name="features" defaultValue={initialData?.features || ''} rows={4} placeholder="اتركه فارغاً إذا كنت لا ترغب بإظهاره للعميل" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}></textarea>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>طريقة الاستخدام (اختياري)</label>
        <textarea name="usage_instructions" defaultValue={initialData?.usage_instructions || ''} rows={4} placeholder="اتركه فارغاً إذا كنت لا ترغب بإظهاره للعميل" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}></textarea>
      </div>

      <button type="submit" disabled={isSubmitting} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', border: 'none', opacity: isSubmitting ? 0.7 : 1 }}>
        {isSubmitting ? 'جاري الحفظ...' : (initialData ? 'تحديث المنتج' : 'إضافة المنتج')}
      </button>
    </form>
  );
}
