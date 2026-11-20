import { supabase } from '@/lib/supabase';
import productTranslations from './productTranslations.json';

export interface Product {
  id: number;
  name: string;
  name_en?: string | null;
  category: string;
  category_en?: string | null;
  price: number;
  original_price?: number | null;
  discount_percentage?: number | null;
  cost_price?: number;
  stock_quantity?: number;
  description: string;
  description_en?: string | null;
  image: string;
  gallery_images?: string[] | null;
  stock?: number;
  ingredients?: string | null;
  ingredients_en?: string | null;
  features?: string | null;
  features_en?: string | null;
  usage_instructions?: string | null;
  usage_instructions_en?: string | null;
  created_at?: string;
}

export function getLocalizedProduct<T extends { id: number; name: string; category?: string; [key: string]: any }>(
  product: T,
  locale: 'ar' | 'en' = 'ar'
): T {
  if (locale === 'ar') return product;

  const translation = (productTranslations as Record<string, any>)[product.id] || {};

  return {
    ...product,
    name: (product as any).name_en || translation.name_en || product.name,
    category: (product as any).category_en || translation.category_en || (product.category === 'العناية بالبشرة' ? 'Skincare' : product.category === 'العناية بالشعر' ? 'Haircare' : product.category === 'مكياج' ? 'Makeup' : product.category),
    ...(product.description !== undefined ? { description: (product as any).description_en || translation.description_en || product.description } : {}),
    ...(product.features !== undefined ? { features: (product as any).features_en || translation.features_en || product.features } : {}),
    ...(product.ingredients !== undefined ? { ingredients: (product as any).ingredients_en || translation.ingredients_en || product.ingredients } : {}),
    ...(product.usage_instructions !== undefined ? { usage_instructions: (product as any).usage_instructions_en || translation.usage_instructions_en || product.usage_instructions } : {}),
  };
}

export async function getProducts(searchQuery?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

export async function getRelatedProducts(category: string, currentProductId: number, limit: number = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', currentProductId)
    .limit(limit);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return data || [];
}
