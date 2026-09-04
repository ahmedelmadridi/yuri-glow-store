import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'سياسة الاسترجاع والاستبدال | Yuri Glow',
  description: 'تعرف على سياسة الاسترجاع والاستبدال الخاصة بمتجر Yuri Glow لضمان حقوقك وتجربة تسوق آمنة.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', minHeight: '60vh', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
          &rarr; العودة للرئيسية
        </Link>
      </div>

      <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: 'var(--spacing-xl)', fontSize: '2.5rem', textAlign: 'center' }}>
        سياسة الاسترجاع والاستبدال
      </h1>

      <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', lineHeight: '1.8' }}>
        
        <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.1rem' }}>
          في <strong>Yuri Glow</strong>، رضا عملائنا هو أولويتنا. إذا لم تكن راضياً تماماً عن مشترياتك، فنحن هنا لمساعدتك وفقاً للشروط التالية:
        </p>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          1. فترة الاسترجاع والاستبدال
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          يحق للعميل استرجاع أو استبدال المنتجات خلال <strong>14 يوماً</strong> من تاريخ استلام الطلب، وذلك وفقاً لقانون حماية المستهلك.
        </p>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          2. شروط قبول الاسترجاع
        </h3>
        <ul style={{ paddingRight: '20px', marginBottom: 'var(--spacing-md)' }}>
          <li style={{ marginBottom: '8px' }}>أن يكون المنتج في حالته الأصلية تماماً ولم يتم فتحه أو استخدامه.</li>
          <li style={{ marginBottom: '8px' }}>أن يكون الغلاف الخارجي (الختم أو البلاستيك) سليماً وغير ممزق، نظراً لطبيعة منتجات العناية بالبشرة والتجميل.</li>
          <li style={{ marginBottom: '8px' }}>توفر إيصال الشراء أو رقم الطلب.</li>
        </ul>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          3. المنتجات التالفة أو الخاطئة
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          إذا استلمت منتجاً تالفاً أو مختلفاً عما قمت بطلبه، نرجو التواصل معنا فوراً في نفس يوم الاستلام. سنتكفل نحن بجميع مصاريف الشحن الخاصة بالاسترجاع وإرسال المنتج البديل.
        </p>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          4. مصاريف الشحن
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          في حالة الاسترجاع أو الاستبدال لرغبة شخصية من العميل (بدون وجود عيب مصنعي في المنتج)، يتحمل العميل مصاريف الشحن بالكامل (رسوم شحن الاسترجاع ورسوم شحن المنتج الجديد إن وجد).
        </p>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          5. خطوات الاسترجاع
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          لبدء عملية الاسترجاع، يرجى التواصل معنا عبر الواتساب على الرقم المخصص لخدمة العملاء الموجود في أسفل الموقع، مع تزويدنا برقم الطلب وصور للمنتج.
        </p>

        <hr style={{ margin: 'var(--spacing-2xl) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
        </p>
      </div>
    </div>
  );
}
