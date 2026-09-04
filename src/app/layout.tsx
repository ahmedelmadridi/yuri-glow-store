import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Yuri Glow - Korean Skincare',
  description: 'Premium Korean Skincare Products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <CartProvider>
          <Header />
          
          <main>{children}</main>
        
        <footer className="site-footer" style={{ textAlign: 'center' }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
              <strong>روابط سريعة:</strong>
              <Link href="/products" style={{ color: 'white', textDecoration: 'none' }}>المنتجات</Link>
              <span style={{ color: '#aaa' }}>|</span>
              <Link href="/about" style={{ color: 'white', textDecoration: 'none' }}>من نحن</Link>
              <span style={{ color: '#aaa' }}>|</span>
              <Link href="/contact" style={{ color: 'white', textDecoration: 'none' }}>اتصل بنا</Link>
            </div>

            <div>
              <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>Yuri Glow</h3>
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
