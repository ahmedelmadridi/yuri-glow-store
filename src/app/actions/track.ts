'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function trackOrder(query: string) {
  const raw = (query || '').trim();
  if (!raw) {
    return { error: 'يرجى إدخال كود الطلب أو رقم الهاتف' };
  }

  const cleanCode = raw.replace(/^#/, '').trim();
  const isHex8 = /^[0-9a-fA-F]{8}$/.test(cleanCode);
  const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(cleanCode);

  // If input matches Order Code pattern (UUID or 8-char hex code)
  if (isUUID || isHex8) {
    let orderQuery = supabaseAdmin
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
      `);

    if (isUUID) {
      orderQuery = orderQuery.eq('id', cleanCode.toLowerCase()).limit(1);
    } else {
      const lower = `${cleanCode.toLowerCase()}-0000-0000-0000-000000000000`;
      const upper = `${cleanCode.toLowerCase()}-ffff-ffff-ffff-ffffffffffff`;
      orderQuery = orderQuery.gte('id', lower).lte('id', upper).limit(5);
    }

    const { data, error } = await orderQuery;

    if (error) {
      console.error('Track Order by Code Error:', error);
      return { error: 'حدث خطأ أثناء البحث عن الطلب، يرجى المحاولة لاحقاً' };
    }

    if (data && data.length > 0) {
      return { orders: data };
    }

    // If not found by code, try as phone if digits are enough
    if (raw.replace(/\D/g, '').length >= 8) {
      return trackOrderByPhone(raw);
    }

    return { error: `لم نتمكن من العثور على أي طلب بالكود "${raw}". تأكد من صحة الكود المدخل.` };
  }

  // Otherwise treat as phone number
  return trackOrderByPhone(raw);
}

export async function trackOrderByPhone(phone: string) {
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  
  if (!cleanPhone || cleanPhone.length < 8) {
    return { error: 'يرجى إدخال كود طلب صحيح أو رقم هاتف صحيح' };
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
    return { error: 'لم نتمكن من العثور على أي طلبات مرتبطة بالبيانات المدخلة. تأكد من صحة كود الطلب أو رقم الهاتف.' };
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

export async function trackWishlistEvent(productId: number, action: 'add' | 'remove') {
  try {
    if (!productId || typeof productId !== 'number') {
      return { error: 'Invalid product ID' };
    }
    const { error } = await supabaseAdmin
      .from('wishlist_events')
      .insert({ product_id: productId, action });

    if (error) {
      console.warn('Track Wishlist Event Warning (check if wishlist_events table exists):', error.message);
      return { error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Failed to track wishlist event', err);
    return { error: 'Failed to track wishlist event' };
  }
}

export async function trackSearchQuery(query: string) {
  try {
    const cleanQuery = query?.trim();
    if (!cleanQuery || cleanQuery.length < 2 || cleanQuery.length > 100) {
      return { error: 'Invalid query length' };
    }

    const { error } = await supabaseAdmin
      .from('search_logs')
      .insert({ query: cleanQuery });

    if (error) {
      console.warn('Track Search Query Warning (check if search_logs table exists):', error.message);
      return { error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Failed to track search query', err);
    return { error: 'Failed to track search query' };
  }
}

