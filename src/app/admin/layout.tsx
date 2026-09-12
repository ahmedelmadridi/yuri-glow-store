"use client";

import Link from 'next/link';
import styles from './layout.module.css';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      {!isLoginPage && (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Yuri Glow Admin</h2>
        </div>
        <nav className={styles.nav}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px', backgroundColor: pathname === '/admin' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>لوحة القيادة</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/orders" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px', backgroundColor: pathname.startsWith('/admin/orders') ? 'rgba(255,255,255,0.1)' : 'transparent' }}>الطلبات الواردة</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/products" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px', backgroundColor: pathname.startsWith('/admin/products') ? 'rgba(255,255,255,0.1)' : 'transparent' }}>إدارة المنتجات</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/banners" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px', backgroundColor: pathname.startsWith('/admin/banners') ? 'rgba(255,255,255,0.1)' : 'transparent' }}>إدارة البنرات (الصور)</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/announcements" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px', backgroundColor: pathname.startsWith('/admin/announcements') ? 'rgba(255,255,255,0.1)' : 'transparent' }}>شريط الأخبار الإعلاني</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/reviews" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px', backgroundColor: pathname.startsWith('/admin/reviews') ? 'rgba(255,255,255,0.1)' : 'transparent' }}>إدارة التقييمات</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/testimonials" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px', backgroundColor: pathname.startsWith('/admin/testimonials') ? 'rgba(255,255,255,0.1)' : 'transparent' }}>آراء العملاء (صور)</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/coupons" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px', backgroundColor: pathname.startsWith('/admin/coupons') ? 'rgba(255,255,255,0.1)' : 'transparent' }}>أكواد الخصم</Link>
            </li>
          </ul>
          <button 
            onClick={() => {
              document.cookie = "admin_session=; path=/; max-age=0; SameSite=Lax";
              window.location.href = '/admin/login';
            }}
            style={{ 
              marginTop: 'auto', 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              display: 'block', 
              padding: '12px 16px', 
              color: '#ff6b6b', 
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              width: '100%',
              textAlign: 'right',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            تسجيل الخروج
          </button>
          <Link href="/" className={styles.navLink} style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none' }}>
            العودة للمتجر
          </Link>
        </nav>
      </aside>
      )}

      {/* Main Content */}
      <main className={styles.mainContent} style={isLoginPage ? { marginRight: 0 } : {}}>
        {children}
      </main>
    </div>
  );
}
