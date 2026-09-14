import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Playfair_Display, Cairo } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import ViewCounter from '@/components/ViewCounter';
import WhatsAppButton from '@/components/WhatsAppButton';
import FacebookPixel from '@/components/FacebookPixel';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const cairo = Cairo({ 
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.yurigloweg.com'),
  title: {
    template: '%s | Yuri Glow',
    default: 'Yuri Glow - مستحضرات العناية بالبشرة الكورية الأصلية في مصر',
  },
  description: 'اكتشفي سر جمالك مع أفضل منتجات العناية بالبشرة الكورية الأصلية في مصر (Yuri Glow). تسوقي الآن أحدث صيحات الجمال الكوري، كريمات، سيروم، وغسول كوري بأفضل الأسعار.',
  keywords: ['يوري جلو', 'Yuri Glow', 'عناية بالبشرة', 'منتجات كورية', 'تجميل كوري', 'سيروم كوري', 'مستحضرات كورية في مصر', 'سكين كير كوري', 'كريم الحلزون', 'كوريا'],
  openGraph: {
    title: 'Yuri Glow - مستحضرات العناية بالبشرة الكورية',
    description: 'اكتشفي سر جمالك مع أفضل منتجات العناية بالبشرة الكورية الأصلية في مصر.',
    url: 'https://www.yurigloweg.com',
    siteName: 'Yuri Glow Egypt',
    images: [
      {
        url: '/hero.jpg', // Using the hero image as default share image
        width: 1200,
        height: 630,
        alt: 'Yuri Glow - مستحضرات التجميل الكورية',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yuri Glow - مستحضرات العناية بالبشرة الكورية',
    description: 'اكتشفي سر جمالك مع أفضل منتجات العناية بالبشرة الكورية الأصلية.',
    images: ['/hero.jpg'],
  },
  verification: {
    google: 'Znm7Z7JfOmTOf43V3ypyW-3RzYXgWQyvBjHE4UzjggQ',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.variable} ${playfair.variable} ${cairo.variable}`}>
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <ViewCounter />
        <WhatsAppButton />
        <CartProvider>
          <Header />
          
          <main>{children}</main>
        <Footer />
        </CartProvider>
        <Analytics />
        <GoogleAnalytics gaId="G-GHT70K89VB" />
      </body>
    </html>
  );
}
