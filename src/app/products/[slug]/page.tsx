import { getProductById, getRelatedProducts, getProducts } from '@/data/products';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { getIdFromSlug, createProductSlug } from '@/utils/slug';
import ProductViewTracker from '@/components/ProductViewTracker';
import ProductDetailsClient from './ProductDetailsClient';


export const revalidate = 3600; // Cache and revalidate every hour (ISR)

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: createProductSlug(product.name, product.id),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const id = getIdFromSlug(decodeURIComponent(resolvedParams.slug));
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'المنتج غير موجود - Yuri Glow'
    };
  }

  const description = product.description.substring(0, 160) + '...';
  const productSlug = createProductSlug(product.name, product.id);

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `https://www.yurigloweg.com/products/${productSlug}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'article', // Used for products too
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [product.image],
    },
    alternates: {
      canonical: `https://www.yurigloweg.com/products/${productSlug}`,
    },
  };
}

export default async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const id = getIdFromSlug(decodeURIComponent(resolvedParams.slug));
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.category, product.id);

  // Fetch approved reviews
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false });

  // Calculate discount percentage automatically
  let calculatedDiscount = product.discount_percentage;
  if (!calculatedDiscount && product.original_price && product.original_price > product.price) {
    calculatedDiscount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }

  const productSlug = createProductSlug(product.name, product.id);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.image, ...(product.gallery_images || [])].filter(Boolean),
    description: product.description,
    sku: `YG-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Yuri Glow',
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.yurigloweg.com/products/${productSlug}`,
      priceCurrency: 'EGP',
      price: product.price,
      priceValidUntil: '2027-12-31',
      validFrom: product.created_at ? new Date(product.created_at).toISOString().split('T')[0] : '2024-01-01',
      itemCondition: 'https://schema.org/NewCondition',
      availability: (product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity <= 0)
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 80,
          currency: 'EGP',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'EG',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 4,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'EG',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
        url: 'https://www.yurigloweg.com/return-policy',
      },
    },
    ...(reviews && reviews.length > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length,
      }
    } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductViewTracker productId={product.id} productName={product.name} price={product.price} />
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
        reviews={reviews || []}
        calculatedDiscount={calculatedDiscount}
      />
    </>
  );
}

