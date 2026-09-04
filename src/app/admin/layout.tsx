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
          <Link href="/admin" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>لوحة القيادة</Link>
          <Link href="/admin/orders" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>الطلبات الواردة</Link>
          <Link href="/admin/products" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>إدارة المنتجات</Link>
          <Link href="/admin/reviews" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>إدارة التقييمات</Link>
          <Link href="/admin/coupons" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>أكواد الخصم</Link>
          <Link href="/" className={styles.navLink} style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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
