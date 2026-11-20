import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function translateText(text, from = 'ar', to = 'en') {
  if (!text || !text.trim()) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map(chunk => chunk[0]).join('');
    }
    return text;
  } catch (err) {
    console.error('Translation error on:', text.slice(0, 30), err.message);
    return text;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabase.from('products').select('*').order('id', { ascending: true });
  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products. Translating...`);

  const translations = {};
  let count = 0;

  for (const product of products) {
    count++;
    const arabicRegex = /[\u0600-\u06FF]/;
    
    // Category mapping
    let category_en = 'Skincare';
    if (product.category) {
      if (product.category.includes('شعر')) category_en = 'Haircare';
      else if (product.category.includes('مكياج')) category_en = 'Makeup';
    }

    // Name (most are already in English)
    let name_en = product.name || '';
    if (name_en && arabicRegex.test(name_en)) {
      name_en = await translateText(name_en, 'ar', 'en');
      await sleep(100);
    }

    // Description
    const description_en = product.description ? await translateText(product.description, 'ar', 'en') : '';
    await sleep(100);

    // Features
    const features_en = product.features ? await translateText(product.features, 'ar', 'en') : '';
    await sleep(100);

    // Ingredients
    const ingredients_en = product.ingredients ? await translateText(product.ingredients, 'ar', 'en') : '';
    await sleep(100);

    // Usage Instructions
    const usage_instructions_en = product.usage_instructions ? await translateText(product.usage_instructions, 'ar', 'en') : '';
    await sleep(100);

    translations[product.id] = {
      name_en,
      category_en,
      description_en,
      features_en,
      ingredients_en,
      usage_instructions_en,
    };

    console.log(`[${count}/${products.length}] Translated ID ${product.id}: ${name_en.slice(0, 30)}...`);
  }

  // Save to JSON file
  fs.writeFileSync('src/data/productTranslations.json', JSON.stringify(translations, null, 2), 'utf8');
  console.log('Successfully wrote src/data/productTranslations.json!');

  // Also attempt updating Supabase columns if they exist
  console.log('Attempting to update Supabase products table...');
  let updatedInDB = 0;
  for (const [id, t] of Object.entries(translations)) {
    const { error: updateErr } = await supabase.from('products').update({
      name_en: t.name_en,
      description_en: t.description_en,
      category_en: t.category_en,
      features_en: t.features_en,
      ingredients_en: t.ingredients_en,
      usage_instructions_en: t.usage_instructions_en,
    }).eq('id', id);

    if (!updateErr) {
      updatedInDB++;
    }
  }
  console.log(`Updated ${updatedInDB} products in Supabase directly.`);
}

main().catch(console.error);
