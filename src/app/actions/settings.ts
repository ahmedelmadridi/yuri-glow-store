'use server';

import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import {
  ShippingSettings,
  PaymentSettings,
  defaultShippingSettings,
  defaultPaymentSettings,
} from '@/data/storeSettingsDefaults';

export async function getShippingSettings(): Promise<{ success: boolean; data: ShippingSettings; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping_settings')
      .maybeSingle();

    if (error && error.code !== 'PGRST205') {
      console.warn('Could not fetch shipping_settings, using defaults:', error.message);
      return { success: true, data: defaultShippingSettings };
    }

    if (!data?.value) {
      return { success: true, data: defaultShippingSettings };
    }

    const parsed = JSON.parse(data.value) as Partial<ShippingSettings>;

    // Merge with defaults to ensure all governorates and properties exist
    const mergedGovernorates = defaultShippingSettings.governorates.map((defaultGov) => {
      const existing = parsed.governorates?.find((g) => g.name === defaultGov.name);
      return existing
        ? {
            name: defaultGov.name,
            shippingCost: typeof existing.shippingCost === 'number' ? existing.shippingCost : defaultGov.shippingCost,
            is_active: existing.is_active !== undefined ? existing.is_active : true,
          }
        : defaultGov;
    });

    const finalSettings: ShippingSettings = {
      governorates: mergedGovernorates,
      free_shipping_enabled:
        parsed.free_shipping_enabled !== undefined
          ? parsed.free_shipping_enabled
          : defaultShippingSettings.free_shipping_enabled,
      free_shipping_threshold:
        typeof parsed.free_shipping_threshold === 'number'
          ? parsed.free_shipping_threshold
          : defaultShippingSettings.free_shipping_threshold,
      allow_free_shipping_with_coupon:
        parsed.allow_free_shipping_with_coupon !== undefined
          ? parsed.allow_free_shipping_with_coupon
          : defaultShippingSettings.allow_free_shipping_with_coupon,
    };

    return { success: true, data: finalSettings };
  } catch (err: any) {
    console.warn('Error reading shipping settings, fallback to defaults:', err.message);
    return { success: true, data: defaultShippingSettings };
  }
}

export async function updateShippingSettings(settings: ShippingSettings): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { data: existing } = await supabaseAdmin
      .from('store_settings')
      .select('id')
      .eq('key', 'shipping_settings')
      .maybeSingle();

    const value = JSON.stringify(settings);
    let res;

    if (existing) {
      res = await supabaseAdmin
        .from('store_settings')
        .update({ value })
        .eq('id', existing.id);
    } else {
      res = await supabaseAdmin
        .from('store_settings')
        .insert({ key: 'shipping_settings', value });
    }

    if (res.error) throw new Error(res.error.message);

    revalidatePath('/checkout');
    revalidatePath('/admin/shipping');
    revalidatePath('/admin');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPaymentSettings(): Promise<{ success: boolean; data: PaymentSettings; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('value')
      .eq('key', 'payment_settings')
      .maybeSingle();

    if (error && error.code !== 'PGRST205') {
      console.warn('Could not fetch payment_settings, using defaults:', error.message);
      return { success: true, data: defaultPaymentSettings };
    }

    if (!data?.value) {
      return { success: true, data: defaultPaymentSettings };
    }

    const parsed = JSON.parse(data.value) as Partial<PaymentSettings>;

    const finalSettings: PaymentSettings = {
      ...defaultPaymentSettings,
      ...parsed,
    };

    return { success: true, data: finalSettings };
  } catch (err: any) {
    console.warn('Error reading payment settings, fallback to defaults:', err.message);
    return { success: true, data: defaultPaymentSettings };
  }
}

export async function updatePaymentSettings(settings: PaymentSettings): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { data: existing } = await supabaseAdmin
      .from('store_settings')
      .select('id')
      .eq('key', 'payment_settings')
      .maybeSingle();

    const value = JSON.stringify(settings);
    let res;

    if (existing) {
      res = await supabaseAdmin
        .from('store_settings')
        .update({ value })
        .eq('id', existing.id);
    } else {
      res = await supabaseAdmin
        .from('store_settings')
        .insert({ key: 'payment_settings', value });
    }

    if (res.error) throw new Error(res.error.message);

    revalidatePath('/checkout');
    revalidatePath('/admin/payment');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
