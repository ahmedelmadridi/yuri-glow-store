'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function upsertProduct(productData: any) {
  try {
    const isUpdate = !!productData.id;
    let result;
    
    if (isUpdate) {
      result = await supabaseAdmin
        .from('products')
        .update(productData)
        .eq('id', productData.id)
        .select();
    } else {
      result = await supabaseAdmin
        .from('products')
        .insert(productData)
        .select();
    }
    
    const { data, error } = result;

    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      throw new Error('لم يتم تحديث/إضافة المنتج. تأكد من إعداد SUPABASE_SERVICE_ROLE_KEY بشكل صحيح.');
    }
    
    // Revalidate relevant paths
    revalidatePath('/', 'layout');
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Upsert Product Error:', error);
    return { success: false, error: error.message };
  }
}
