"use client";

import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="site-header">
      <div className="container header-content">
        <Link href="/" className="logo">Yuri Glow</Link>
        <nav className="main-nav">
          <Link href="/">الرئيسية</Link>
          <Link href="/products">المنتجات</Link>
          <Link href="/about">من نحن</Link>
          <Link href="/contact">اتصل بنا</Link>
        </nav>
        <div className="header-actions">
          <Link href="/cart" className="cart-btn" aria-label="سلة المشتريات">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {totalItems}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
