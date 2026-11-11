import Link from 'next/link';

interface CheckoutSuccessProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessProps) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams?.orderId;
  const shortOrderCode = orderId
    ? (orderId.includes('-') ? orderId.split('-')[0] : orderId.slice(0, 8)).toUpperCase()
    : null;

  const whatsappMessage = shortOrderCode
    ? `مرحباً، أود تأكيد طلبي من متجر يوري جلو. كود الطلب: #${shortOrderCode}`
    : 'مرحباً، أريد تأكيد طلبي من متجر يوري جلو.';

  const whatsappUrl = `https://wa.me/201505432061?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      className="container"
      style={{
        padding: 'var(--spacing-3xl) var(--spacing-md)',
        textAlign: 'center',
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🎉</div>
      <h1
        style={{
          marginBottom: 'var(--spacing-md)',
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-primary-dark)',
        }}
      >
        تم استلام طلبك بنجاح!
      </h1>

      {shortOrderCode && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-alt, #f7f5ef)',
            border: '1px dashed var(--color-primary, #A88F48)',
            borderRadius: '12px',
            padding: '14px 28px',
            marginBottom: 'var(--spacing-lg)',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light, #666)' }}>
            كود الطلب الخاص بك
          </span>
          <span
            style={{
              fontSize: '1.6rem',
              fontWeight: 'bold',
              letterSpacing: '2px',
              color: 'var(--color-primary-dark, #876E2E)',
              fontFamily: 'monospace',
              direction: 'ltr',
            }}
          >
            #{shortOrderCode}
          </span>
        </div>
      )}

      <p
        style={{
          color: 'var(--color-text-light)',
          marginBottom: 'var(--spacing-2xl)',
          maxWidth: '520px',
          lineHeight: '1.8',
        }}
      >
        شكراً لتسوقك من Yuri Glow. سنقوم بالتواصل معك قريباً على رقم الهاتف الذي أدخلته لتأكيد الطلب وترتيب موعد التوصيل. يمكنك أيضاً تأكيد الطلب مباشرة عبر الواتساب بالضغط على الزر أدناه:
      </p>

      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            backgroundColor: '#25D366',
            borderColor: '#25D366',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          تأكيد الطلب عبر الواتساب
        </a>
        {shortOrderCode && (
          <Link 
            href={`/track?orderId=${shortOrderCode}`} 
            className="btn-outline"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary-dark)'
            }}
          >
            تتبع حالة الطلب 📦
          </Link>
        )}
        <Link href="/" className="btn-outline">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
