'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function trackOrderByPhone(phone: string) {
  const cleanPhone = phone.trim();
  
  if (!cleanPhone || cleanPhone.length < 8) {
    return { error: 'يرجى إدخال رقم هاتف صحيح' };
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, 
      status, 
      created_at, 
      total_amount, 
      order_items(
        quantity, 
        products(name)
      )
    `)
    .eq('phone', cleanPhone)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Track Order Error:', error);
    return { error: 'حدث خطأ أثناء البحث عن الطلب، يرجى المحاولة لاحقاً' };
  }

  if (!data || data.length === 0) {
    return { error: 'لم نتمكن من العثور على أي طلبات مرتبطة برقم الهاتف هذا. تأكد من كتابة الرقم كما أدخلته وقت الطلب.' };
  }

  return { orders: data };
}
