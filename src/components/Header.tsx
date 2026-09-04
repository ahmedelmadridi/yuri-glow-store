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
          <Link href="/cart" className="cart-btn">
            سلة المشتريات ({totalItems})
          </Link>
        </div>
      </div>
    </header>
  );
}
