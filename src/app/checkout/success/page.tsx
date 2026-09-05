import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🎉</div>
      <h1 style={{ marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-heading)', color: 'var(--color-primary-dark)' }}>تم استلام طلبك بنجاح!</h1>
      <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-2xl)', maxWidth: '500px', lineHeight: '1.8' }}>
        شكراً لتسوقك من Yuri Glow. سنقوم بالتواصل معك قريباً على رقم الهاتف الذي أدخلته لتأكيد الطلب وترتيب موعد التوصيل.
      </p>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a 
          href="https://wa.me/201505432061?text=مرحباً، أريد تأكيد طلبي من متجر يوري جلو." 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-primary" 
          style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', verticalAlign: 'middle' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          تأكيد الطلب عبر الواتساب
        </a>
        <Link href="/" className="btn-outline">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
