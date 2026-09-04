import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🎉</div>
      <h1 style={{ marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-heading)', color: 'var(--color-primary-dark)' }}>تم استلام طلبك بنجاح!</h1>
      <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-2xl)', maxWidth: '500px', lineHeight: '1.8' }}>
        شكراً لتسوقك من Yuri Glow. سنقوم بالتواصل معك قريباً على رقم الهاتف الذي أدخلته لتأكيد الطلب وترتيب موعد التوصيل.
      </p>
      <Link href="/" className="btn-primary">العودة للرئيسية</Link>
    </div>
  );
}
