"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
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

        {/* Social Media Links */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', margin: '10px 0' }}>
          <a href="https://instagram.com/yuri.glow.eg" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'white' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://tiktok.com/@yuri.glow.eg" target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ color: 'white' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          </a>
          <a href="https://facebook.com/yuriglowegy" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: 'white' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo.png" alt="Yuri Glow" style={{ maxHeight: '60px', width: 'auto', marginBottom: 'var(--spacing-sm)' }} />
          <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة.</p>
          <p style={{ marginTop: 'var(--spacing-xs)', fontWeight: 'bold' }}>🚗 التوصيل متاح داخل جمهورية مصر العربية فقط</p>
        </div>
        
      </div>
    </footer>
  );
}
