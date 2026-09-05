import { supabase } from '@/lib/supabase';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price?: number | null;
  discount_percentage?: number | null;
  cost_price?: number;
  stock_quantity?: number;
  description: string;
  image: string;
  stock?: number;
  ingredients?: string | null;
  features?: string | null;
  usage_instructions?: string | null;
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
