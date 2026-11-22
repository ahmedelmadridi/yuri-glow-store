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
    // 1. Separate base columns from English translation columns
    const {
      name_en,
      description_en,
      category_en,
      features_en,
      ingredients_en,
      usage_instructions_en,
      ...baseProductData
    } = productData;

    // 2. Prepare English translations (if not provided, auto-translate from Arabic)
    let finalNameEn = name_en || '';
    let finalDescEn = description_en || '';
    let finalCategoryEn = category_en || '';
    let finalFeaturesEn = features_en || '';
    let finalIngredientsEn = ingredients_en || '';
    let finalUsageEn = usage_instructions_en || '';

    if (!finalDescEn && baseProductData.description) {
      try {
        const trans = await translateProductFields({
          name: baseProductData.name,
          category: baseProductData.category,
          description: baseProductData.description,
          features: baseProductData.features,
          ingredients: baseProductData.ingredients,
          usage_instructions: baseProductData.usage_instructions,
        });

        finalNameEn = finalNameEn || trans.name_en;
        finalDescEn = finalDescEn || trans.description_en;
        finalCategoryEn = finalCategoryEn || trans.category_en;
        finalFeaturesEn = finalFeaturesEn || trans.features_en;
        finalIngredientsEn = finalIngredientsEn || trans.ingredients_en;
        finalUsageEn = finalUsageEn || trans.usage_instructions_en;
      } catch (transErr) {
        console.warn('Auto translation warning in upsertProduct:', transErr);
      }
    }

    const isUpdate = !!baseProductData.id;
    let result;
    
    // 3. Update or Insert base product data first (always guaranteed to succeed in Supabase)
    if (isUpdate) {
      result = await supabaseAdmin
        .from('products')
        .update(baseProductData)
        .eq('id', baseProductData.id)
        .select();
    } else {
      result = await supabaseAdmin
        .from('products')
        .insert(baseProductData)
        .select();
    }

    const { data, error } = result;

    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      throw new Error('لم يتم تحديث/إضافة المنتج. تأكد من إعداد SUPABASE_SERVICE_ROLE_KEY بشكل صحيح.');
    }

    const savedProduct = data[0];

    // 4. Optionally update English columns in Supabase if the columns exist
    if (finalNameEn || finalDescEn || finalCategoryEn) {
      try {
        const enRes = await supabaseAdmin
          .from('products')
          .update({
            name_en: finalNameEn || null,
            description_en: finalDescEn || null,
            category_en: finalCategoryEn || null,
            features_en: finalFeaturesEn || null,
            ingredients_en: finalIngredientsEn || null,
            usage_instructions_en: finalUsageEn || null,
          })
          .eq('id', savedProduct.id);
        if (enRes?.error) {
          console.warn('Supabase English columns note:', enRes.error.message);
        }
      } catch (enColErr: any) {
        // Silently skip if columns don't exist yet in Supabase schema cache
        console.warn('Supabase English columns not yet created or cached:', enColErr?.message);
      }
    }

    // 5. Also persist translation in productTranslations.json for immediate zero-latency access
    try {
      const transFilePath = path.join(process.cwd(), 'src', 'data', 'productTranslations.json');
      let currentTrans: Record<string, any> = {};
      if (fs.existsSync(transFilePath)) {
        currentTrans = JSON.parse(fs.readFileSync(transFilePath, 'utf8'));
      }
      currentTrans[savedProduct.id] = {
        name_en: finalNameEn || savedProduct.name,
        category_en: finalCategoryEn || (savedProduct.category === 'العناية بالبشرة' ? 'Skincare' : savedProduct.category === 'العناية بالشعر' ? 'Haircare' : savedProduct.category === 'مكياج' ? 'Makeup' : savedProduct.category),
        description_en: finalDescEn || savedProduct.description,
        features_en: finalFeaturesEn || savedProduct.features || '',
        ingredients_en: finalIngredientsEn || savedProduct.ingredients || '',
        usage_instructions_en: finalUsageEn || savedProduct.usage_instructions || '',
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
