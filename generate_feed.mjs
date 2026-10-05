import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnv() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function createProductSlug(name, id) {
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${cleanName}-${id}`;
}

async function exportProducts() {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  const baseUrl = 'https://www.yurigloweg.com';

  const header = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'google_product_category'];
  
  const rows = products.map(p => {
    const id = p.id;
    const title = `"${(p.name || '').replace(/"/g, '""')}"`;
    const description = `"${(p.description || '').replace(/"/g, '""')}"`;
    
    const qty = p.stock_quantity !== undefined ? p.stock_quantity : (p.stock !== undefined ? p.stock : 10);
    const availability = qty > 0 ? 'in stock' : 'out of stock';
    const condition = 'new';
    const price = `${p.price} EGP`;
    const link = `${baseUrl}/products/${createProductSlug(p.name, p.id)}`;
    
    let image_link = p.image || '';
    if (image_link && image_link.startsWith('/')) {
      image_link = `${baseUrl}${image_link}`;
    } else if (image_link && !image_link.startsWith('http')) {
      image_link = `${baseUrl}/${image_link}`;
    }

    const brand = 'Yuri Glow';
    const category = `"${(p.category || '').replace(/"/g, '""')}"`;

    return [id, title, description, availability, condition, price, link, image_link, brand, category].join(',');
  });

  const csvContent = [header.join(','), ...rows].join('\n');
  fs.writeFileSync('products_feed.csv', csvContent, 'utf-8');
  console.log(`Successfully created products_feed.csv with ${products.length} products`);
}

exportProducts();
