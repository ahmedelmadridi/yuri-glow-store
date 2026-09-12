'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function trackOrderByPhone(phone: string) {
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  
  if (!cleanPhone || cleanPhone.length < 8) {
    return { error: 'يرجى إدخال رقم هاتف صحيح' };
  }

  let basePhone = cleanPhone;
  if (basePhone.startsWith('+20')) {
    basePhone = basePhone.substring(3);
  } else if (basePhone.startsWith('+2')) {
    basePhone = basePhone.substring(2);
  } else if (basePhone.startsWith('0020')) {
    basePhone = basePhone.substring(4);
  }

  if (basePhone.startsWith('0')) {
    basePhone = basePhone.substring(1);
  }

  const possiblePhones = Array.from(new Set([
    cleanPhone,
    basePhone,
    '0' + basePhone,
    '+2' + basePhone,
    '+20' + basePhone,
    '+20' + '0' + basePhone,
    '20' + basePhone,
    '20' + '0' + basePhone,
    '0020' + basePhone,
    '0020' + '0' + basePhone,
  ]));

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
    .in('phone', possiblePhones)
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
