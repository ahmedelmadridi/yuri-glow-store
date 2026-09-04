import { getProducts } from '@/data/products';
import WishlistClient from './WishlistClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المفضلة | Yuri Glow',
  description: 'قائمة منتجاتك المفضلة من Yuri Glow',
};

export default async function WishlistPage() {
  const products = await getProducts();
  
  return <WishlistClient allProducts={products} />;
}
