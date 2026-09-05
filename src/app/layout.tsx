import type { Metadata } from 'next';
import { Inter, Playfair_Display, Cairo } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import ViewCounter from '@/components/ViewCounter';
import WhatsAppButton from '@/components/WhatsAppButton';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const cairo = Cairo({ 
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yurigloweg.com'),
  title: 'Yuri Glow - مستحضرات العناية بالبشرة الكورية الأصلية في مصر',
  description: 'اكتشفي سر جمالك مع أفضل منتجات العناية بالبشرة الكورية الأصلية في مصر (Yuri Glow). تسوقي الآن أحدث صيحات الجمال الكوري، كريمات، سيروم، وغسول كوري بأفضل الأسعار.',
  keywords: ['يوري جلو', 'Yuri Glow', 'عناية بالبشرة', 'منتجات كورية', 'تجميل كوري', 'سيروم كوري', 'مستحضرات كورية في مصر', 'سكين كير كوري', 'كريم الحلزون', 'كوريا'],
  openGraph: {
    title: 'Yuri Glow - مستحضرات العناية بالبشرة الكورية',
    description: 'اكتشفي سر جمالك مع أفضل منتجات العناية بالبشرة الكورية الأصلية في مصر.',
    url: 'https://yurigloweg.com',
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
        <ViewCounter />
        <WhatsAppButton />
        <CartProvider>
          <Header />
          
          <main>{children}</main>
        
        <footer className="site-footer" style={{ textAlign: 'center' }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
              <strong>روابط هامة:</strong>
              <Link href="/products" style={{ color: 'white', textDecoration: 'none' }}>المنتجات</Link>
              <span style={{ color: '#aaa' }}>|</span>
              <Link href="/about" style={{ color: 'white', textDecoration: 'none' }}>من نحن</Link>
              <span style={{ color: '#aaa' }}>|</span>
              <Link href="/contact" style={{ color: 'white', textDecoration: 'none' }}>اتصل بنا</Link>
              <span style={{ color: '#aaa' }}>|</span>
              <Link href="/return-policy" style={{ color: 'white', textDecoration: 'none' }}>سياسة الاسترجاع</Link>
              <span style={{ color: '#aaa' }}>|</span>
              <Link href="/privacy-policy" style={{ color: 'white', textDecoration: 'none' }}>سياسة الخصوصية</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src="/logo.png" alt="Yuri Glow" style={{ maxHeight: '60px', width: 'auto', marginBottom: 'var(--spacing-sm)' }} />
              <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة.</p>
              <p style={{ marginTop: 'var(--spacing-xs)', fontWeight: 'bold' }}>🚗 التوصيل متاح داخل جمهورية مصر العربية فقط</p>
            </div>
            
          </div>
        </footer>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
