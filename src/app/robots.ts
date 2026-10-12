import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/api',
        '/api/*',
        '/checkout',
        '/checkout/*',
        '/cart',
        '/wishlist',
        '/track',
      ],
    },
    sitemap: 'https://www.yurigloweg.com/sitemap.xml',
  };
}
