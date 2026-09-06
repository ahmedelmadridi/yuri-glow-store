import Link from 'next/link';
import styles from './layout.module.css';
import { headers } from 'next/headers';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Yuri Glow Admin</h2>
        </div>
        <nav className={styles.nav}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}>لوحة القيادة</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/orders" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>الطلبات الواردة</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/products" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>إدارة المنتجات</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/banners" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>إدارة البنرات (الصور)</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/announcements" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>شريط الأخبار الإعلاني</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/reviews" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>إدارة التقييمات</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/admin/coupons" style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>أكواد الخصم</Link>
            </li>
          </ul>
          <Link href="/" className={styles.navLink} style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none' }}>
            العودة للمتجر
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
