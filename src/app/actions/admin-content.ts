'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

// --- Announcements ---

export async function addAnnouncement(text: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({ text, is_active: true })
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath('/', 'layout');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleAnnouncement(id: string, is_active: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('announcements')
      .update({ is_active })
      .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Banners ---

export async function addBanner(image_url: string, sort_order: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert({ image_url, sort_order, is_active: true })
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath('/', 'layout');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBanner(id: string, fileName: string) {
  try {
    // 1. Delete from DB
    const { error: dbError } = await supabaseAdmin
      .from('banners')
      .delete()
      .eq('id', id);

    if (dbError) throw new Error(dbError.message);

    // 2. Delete from storage using admin
    const { error: storageError } = await supabaseAdmin.storage
      .from('product-images')
      .remove([`banners/${fileName}`]);

    if (storageError) console.error('Failed to delete image from storage:', storageError);

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
