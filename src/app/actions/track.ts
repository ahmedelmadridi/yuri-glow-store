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

export async function trackMetric(metricId: number) {
  try {
    // We increment the total_visits counter for the given metric ID
    // 1: Store Visits, 2: Add To Cart, 3: Initiate Checkout
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('store_metrics')
      .select('total_visits')
      .eq('id', metricId)
      .single();
      
    if (!fetchError && current) {
      await supabaseAdmin
        .from('store_metrics')
        .update({ total_visits: current.total_visits + 1 })
        .eq('id', metricId);
    }
  } catch (err) {
    console.error('Failed to track metric', err);
  }
}
