'use server';

import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { translateProductFields } from './translate';
import fs from 'fs';
import path from 'path';

export async function upsertProduct(productData: any) {
  await requireAdmin();
  try {
    // 1. If English translation fields are not provided, auto-translate from Arabic
    if (!productData.description_en && productData.description) {
      try {
        const trans = await translateProductFields({
          name: productData.name,
          category: productData.category,
          description: productData.description,
          features: productData.features,
          ingredients: productData.ingredients,
          usage_instructions: productData.usage_instructions,
        });

        productData.name_en = productData.name_en || trans.name_en;
        productData.category_en = productData.category_en || trans.category_en;
        productData.description_en = productData.description_en || trans.description_en;
        productData.features_en = productData.features_en || trans.features_en;
        productData.ingredients_en = productData.ingredients_en || trans.ingredients_en;
        productData.usage_instructions_en = productData.usage_instructions_en || trans.usage_instructions_en;
      } catch (transErr) {
        console.warn('Auto translation warning in upsertProduct:', transErr);
      }
    }

    const isUpdate = !!productData.id;
    let result;
    
    // Attempt insert/update with English columns
    if (isUpdate) {
      result = await supabaseAdmin
        .from('products')
        .update(productData)
        .eq('id', productData.id)
        .select();
    } else {
      result = await supabaseAdmin
        .from('products')
        .insert(productData)
        .select();
    }
    
    // If Supabase throws error because _en columns don't exist yet, fallback to base columns
    if (result.error && (result.error.message?.includes('does not exist') || result.error.code === '42703')) {
      console.warn('English columns not found in products table, falling back to base columns...');
      const {
        name_en,
        description_en,
        category_en,
        features_en,
        ingredients_en,
        usage_instructions_en,
        ...baseData
      } = productData;

      if (isUpdate) {
        result = await supabaseAdmin
          .from('products')
          .update(baseData)
          .eq('id', baseData.id)
          .select();
      } else {
        result = await supabaseAdmin
          .from('products')
          .insert(baseData)
          .select();
      }
    }

    const { data, error } = result;

    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      throw new Error('لم يتم تحديث/إضافة المنتج. تأكد من إعداد SUPABASE_SERVICE_ROLE_KEY بشكل صحيح.');
    }

    const savedProduct = data[0];

    // Also persist translation in productTranslations.json for immediate zero-latency access
    try {
      const transFilePath = path.join(process.cwd(), 'src', 'data', 'productTranslations.json');
      let currentTrans: Record<string, any> = {};
      if (fs.existsSync(transFilePath)) {
        currentTrans = JSON.parse(fs.readFileSync(transFilePath, 'utf8'));
      }
      currentTrans[savedProduct.id] = {
        name_en: productData.name_en || savedProduct.name,
        category_en: productData.category_en || (savedProduct.category === 'العناية بالبشرة' ? 'Skincare' : savedProduct.category === 'العناية بالشعر' ? 'Haircare' : savedProduct.category === 'مكياج' ? 'Makeup' : savedProduct.category),
        description_en: productData.description_en || savedProduct.description,
        features_en: productData.features_en || savedProduct.features || '',
        ingredients_en: productData.ingredients_en || savedProduct.ingredients || '',
        usage_instructions_en: productData.usage_instructions_en || savedProduct.usage_instructions || '',
      };
      fs.writeFileSync(transFilePath, JSON.stringify(currentTrans, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Could not update productTranslations.json file:', fsErr);
    }
    
    // Revalidate relevant paths
    revalidatePath('/', 'layout');
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Upsert Product Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(productId: number) {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);
      
    if (error) {
      throw new Error(error.message);
    }
    
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete Product Error:', error);
    return { success: false, error: error.message };
  }
}
