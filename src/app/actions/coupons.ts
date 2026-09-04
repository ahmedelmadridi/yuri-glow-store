'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function addCoupon(code: string, discountPercentage: number) {
  if (!code || discountPercentage < 1 || discountPercentage > 100) {
    return { error: 'بيانات الكوبون غير صحيحة' };
  }

  const { error } = await supabaseAdmin
    .from('coupons')
    .insert([{ code: code.toUpperCase(), discount_percentage: discountPercentage, is_active: true }]);

  if (error) {
    if (error.code === '23505') return { error: 'هذا الكود موجود بالفعل' };
    return { error: 'حدث خطأ أثناء إضافة الكوبون' };
  }

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function toggleCouponStatus(id: number, currentStatus: boolean) {
  const { error } = await supabaseAdmin
    .from('coupons')
    .update({ is_active: !currentStatus })
    .eq('id', id);

  if (error) {
    return { error: 'حدث خطأ' };
  }

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function deleteCoupon(id: number) {
  const { error } = await supabaseAdmin
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: 'حدث خطأ' };
  }

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function validateCoupon(code: string) {
  if (!code) return { error: 'أدخل كود الخصم' };

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { error: 'كود الخصم غير صحيح أو منتهي الصلاحية' };
  }

  return { discount: data.discount_percentage, code: data.code };
}
