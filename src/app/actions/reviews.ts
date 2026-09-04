'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addReview(productId: number, customerName: string, rating: number, comment: string) {
  if (!customerName || !rating || rating < 1 || rating > 5) {
    return { error: 'البيانات غير مكتملة' };
  }

  // Allow public insert using standard supabase client (anon key)
  // because we enabled RLS for insert
  const { error } = await supabase
    .from('product_reviews')
    .insert([{
      product_id: productId,
      customer_name: customerName,
      rating,
      comment,
      is_approved: false // Admin must approve it
    }]);

  if (error) {
    console.error('Error adding review:', error);
    return { error: 'حدث خطأ أثناء إضافة التقييم' };
  }

  return { success: true };
}

export async function approveReview(reviewId: number, productId: number) {
  const { error } = await supabaseAdmin
    .from('product_reviews')
    .update({ is_approved: true })
    .eq('id', reviewId);

  if (error) {
    return { error: 'حدث خطأ' };
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath(`/admin/reviews`);
  return { success: true };
}

export async function deleteReview(reviewId: number, productId: number) {
  const { error } = await supabaseAdmin
    .from('product_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    return { error: 'حدث خطأ' };
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath(`/admin/reviews`);
  return { success: true };
}
