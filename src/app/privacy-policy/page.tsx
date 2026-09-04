import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | Yuri Glow',
  description: 'كيف نقوم بحماية بياناتك الشخصية في متجر Yuri Glow.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', minHeight: '60vh', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
          &rarr; العودة للرئيسية
        </Link>
      </div>

      <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: 'var(--spacing-xl)', fontSize: '2.5rem', textAlign: 'center' }}>
        سياسة الخصوصية
      </h1>

      <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', lineHeight: '1.8' }}>
        
        <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.1rem' }}>
          في متجر <strong>Yuri Glow</strong>، ندرك تماماً أهمية حماية خصوصيتك وبياناتك الشخصية. هذه الصفحة توضح كيف نقوم بجمع واستخدام وحماية معلوماتك عند استخدامك لموقعنا.
        </p>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          1. المعلومات التي نجمعها
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          نحن نجمع فقط المعلومات الضرورية لإتمام عملية الشراء وتوصيل الطلبات إليك بنجاح، وتشمل:
        </p>
        <ul style={{ paddingRight: '20px', marginBottom: 'var(--spacing-md)' }}>
          <li style={{ marginBottom: '8px' }}>الاسم بالكامل.</li>
          <li style={{ marginBottom: '8px' }}>رقم الهاتف (للتواصل وتأكيد الطلب).</li>
          <li style={{ marginBottom: '8px' }}>عنوان التوصيل بالتفصيل (المحافظة، المدينة، الشارع).</li>
        </ul>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          2. كيف نستخدم بياناتك؟
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          تُستخدم بياناتك للأغراض التالية حصراً:
        </p>
        <ul style={{ paddingRight: '20px', marginBottom: 'var(--spacing-md)' }}>
          <li style={{ marginBottom: '8px' }}>تجهيز وشحن طلبك إلى عنوانك الصحيح.</li>
          <li style={{ marginBottom: '8px' }}>إرسال إشعارات وتحديثات حول حالة طلبك.</li>
          <li style={{ marginBottom: '8px' }}>التواصل معك في حال وجود استفسار أو مشكلة متعلقة بالشحنة.</li>
        </ul>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          3. مشاركة المعلومات مع جهات خارجية
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          نحن <strong>لا نقوم أبداً ببيع أو تأجير</strong> بياناتك الشخصية لأي جهة تسويقية. يتم مشاركة بياناتك الأساسية (الاسم، العنوان، ورقم الهاتف) فقط مع <strong>شركات الشحن المعتمدة</strong> لدينا لضمان وصول طلبك لباب منزلك.
        </p>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          4. حماية البيانات وأمان الموقع
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          متجرنا مزود بشهادة أمان (SSL) لتشفير كافة البيانات المرسلة بينك وبين الموقع، ونستخدم قواعد بيانات مشفرة ومؤمنة (Supabase) لحفظ بيانات الطلبات وفقاً لأعلى معايير الحماية العالمية.
        </p>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          5. التعديلات على سياسة الخصوصية
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          نحتفظ بالحق في تعديل سياسة الخصوصية في أي وقت، وسيتم تحديث تاريخ آخر تعديل أسفل هذه الصفحة. استخدامك المستمر للموقع يعني موافقتك على هذه الشروط.
        </p>

        <hr style={{ margin: 'var(--spacing-2xl) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
        </p>
      </div>
    </div>
  );
}
