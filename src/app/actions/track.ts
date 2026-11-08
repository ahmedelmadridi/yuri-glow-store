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

function getTodayDateInt(): number {
  const now = new Date();
  // Egypt time UTC+2
  const egyptTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const y = egyptTime.getUTCFullYear();
  const m = String(egyptTime.getUTCMonth() + 1).padStart(2, '0');
  const d = String(egyptTime.getUTCDate()).padStart(2, '0');
  return parseInt(`${y}${m}${d}`, 10);
}

export async function trackStoreVisit() {
  return trackMetric(1);
}

export async function trackMetric(metricId: number) {
  try {
    // 1: Store Visits, 2: Add To Cart, 3: Initiate Checkout
    // 1. Update all-time cumulative counter
    const { data: current } = await supabaseAdmin
      .from('store_metrics')
      .select('total_visits')
      .eq('id', metricId)
      .single();
      
    if (current) {
      await supabaseAdmin
        .from('store_metrics')
        .update({ total_visits: current.total_visits + 1 })
        .eq('id', metricId);
    } else {
      await supabaseAdmin
        .from('store_metrics')
        .insert({ id: metricId, total_visits: 1 });
    }

    // 2. Update daily counter (YYYYMMDD * 10 + metricId)
    const todayInt = getTodayDateInt();
    const dailyId = todayInt * 10 + metricId;

    const { data: dailyCurrent } = await supabaseAdmin
      .from('store_metrics')
      .select('total_visits')
      .eq('id', dailyId)
      .single();

    if (dailyCurrent) {
      await supabaseAdmin
        .from('store_metrics')
        .update({ total_visits: dailyCurrent.total_visits + 1 })
        .eq('id', dailyId);
    } else {
      await supabaseAdmin
        .from('store_metrics')
        .insert({ id: dailyId, total_visits: 1 });
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to track metric', err);
    return { error: 'Failed to track metric' };
  }
}

