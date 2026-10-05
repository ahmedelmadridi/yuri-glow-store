import { NextResponse } from 'next/server';
import { getProducts } from '@/data/products';
import { createProductSlug } from '@/utils/slug';

export async function GET() {
  try {
    const products = await getProducts();
    const baseUrl = 'https://www.yurigloweg.com';

    // CSV Header for Facebook / Google Catalog
    const header = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'google_product_category'];

    const rows = products.map((p) => {
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

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="products_feed.csv"',
      },
    });
  } catch (error) {
    console.error('Error generating CSV feed:', error);
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
  }
}
