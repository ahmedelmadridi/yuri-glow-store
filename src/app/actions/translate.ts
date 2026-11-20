'use server';

export async function translateText(text: string, from: string = 'ar', to: string = 'en'): Promise<string> {
  if (!text || !text.trim()) return '';

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 86400 }, // Cache translated string
    });

    if (!res.ok) {
      throw new Error(`Translation API responded with status ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map((chunk: any) => chunk[0]).join('');
    }

    return text;
  } catch (err) {
    console.error('Translation error:', err);
    return text; // Fallback to original text on error
  }
}

export async function translateProductFields(fields: {
  name?: string;
  description?: string;
  category?: string;
  features?: string;
  ingredients?: string;
  usage_instructions?: string;
}): Promise<{
  name_en: string;
  description_en: string;
  category_en: string;
  features_en: string;
  ingredients_en: string;
  usage_instructions_en: string;
}> {
  // Translate categories with high accuracy mapping if matches known categories
  let category_en = '';
  if (fields.category) {
    const trimmedCat = fields.category.trim();
    if (trimmedCat.includes('شعر')) {
      category_en = 'Haircare';
    } else if (trimmedCat.includes('مكياج')) {
      category_en = 'Makeup';
    } else if (trimmedCat.includes('بشرة')) {
      category_en = 'Skincare';
    } else {
      category_en = await translateText(trimmedCat, 'ar', 'en');
    }
  }

  // If product name is already English/Korean (contains predominantly latin letters), keep it
  let name_en = fields.name?.trim() || '';
  const arabicRegex = /[\u0600-\u06FF]/;
  if (name_en && arabicRegex.test(name_en)) {
    name_en = await translateText(name_en, 'ar', 'en');
  }

  const [description_en, features_en, ingredients_en, usage_instructions_en] = await Promise.all([
    fields.description ? translateText(fields.description, 'ar', 'en') : Promise.resolve(''),
    fields.features ? translateText(fields.features, 'ar', 'en') : Promise.resolve(''),
    fields.ingredients ? translateText(fields.ingredients, 'ar', 'en') : Promise.resolve(''),
    fields.usage_instructions ? translateText(fields.usage_instructions, 'ar', 'en') : Promise.resolve(''),
  ]);

  return {
    name_en,
    description_en,
    category_en,
    features_en,
    ingredients_en,
    usage_instructions_en,
  };
}
