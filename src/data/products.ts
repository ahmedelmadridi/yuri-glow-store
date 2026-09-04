import { supabase } from '@/lib/supabase';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price?: number | null;
  discount_percentage?: number | null;
  description: string;
  image: string;
  stock?: number;
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
