'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(prevState: any, formData: FormData) {
  const newStatus = formData.get('status') as string;
  const orderId = formData.get('orderId') as string;
  
  if (!orderId || !newStatus) {
    return { success: false, message: 'بيانات غير مكتملة' };
  }
  
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);
    
  if (error) {
    console.error('Error updating order:', error);
    return { success: false, message: 'حدث خطأ أثناء التحديث' };
  }
    
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders', 'layout');
  
  return { success: true, message: 'تم تحديث الحالة بنجاح!', timestamp: Date.now() };
}
