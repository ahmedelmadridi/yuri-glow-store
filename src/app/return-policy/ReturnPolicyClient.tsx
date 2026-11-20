"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function ReturnPolicyClient() {
  const { locale, isRTL } = useLanguage();

  if (locale === 'en') {
    return (
      <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)', minHeight: '60vh', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
            &larr; Back to Home
          </Link>
        </div>

        <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: 'var(--spacing-xl)', fontSize: '2.5rem', textAlign: 'center' }}>
          Exchange & Return Policy
        </h1>

        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-2xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', lineHeight: '1.8' }}>
          <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.1rem' }}>
            At <strong>Yuri Glow</strong>, customer satisfaction is our top priority. If you are not completely satisfied with your purchase, we are here to assist you according to the following guidelines:
          </p>

          <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
            1. Return & Exchange Period
          </h3>
          <p style={{ marginBottom: 'var(--spacing-md)' }}>
            You may request a return or exchange within <strong>14 days</strong> of receiving your order, in accordance with applicable consumer protection regulations.
          </p>

          <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
            2. Conditions for Acceptance
          </h3>
          <ul style={{ paddingLeft: '20px', marginBottom: 'var(--spacing-md)' }}>
            <li style={{ marginBottom: '8px' }}>The item must be completely intact in its original condition, unopened, and unused.</li>
            <li style={{ marginBottom: '8px' }}>The external manufacturer seal or protective wrap must be unbroken, due to the hygienic and sensitive nature of skincare products.</li>
            <li style={{ marginBottom: '8px' }}>Proof of purchase or your order reference number is required.</li>
          </ul>

          <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
            3. Damaged or Incorrect Items
          </h3>
          <p style={{ marginBottom: 'var(--spacing-md)' }}>
            If you received a damaged item or an order differing from what you placed, please reach out to us on the same day of delivery. We will gladly cover all return and replacement delivery fees.
          </p>

          <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
            4. Shipping Fees
          </h3>
          <p style={{ marginBottom: 'var(--spacing-md)' }}>
            In the case of returns or exchanges initiated out of personal preference (with no defect in the product), the customer covers the full shipping fees for return and re-dispatch.
          </p>

          <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
            5. Cash on Delivery Policy
          </h3>
          <p style={{ marginBottom: 'var(--spacing-md)' }}>
            When selecting Cash on Delivery (COD), an advance shipping deposit via Instapay or mobile wallets is required to confirm the shipment. The remaining balance for the items is paid upon receipt. Once dispatched, the shipping fee is non-refundable.
          </p>

          <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
            6. How to Request a Return
          </h3>
          <p style={{ marginBottom: 'var(--spacing-md)' }}>
            To initiate an exchange or return, please message our dedicated customer support team on WhatsApp using the contact number provided in our footer, attaching your order code and clear photos of the item.
          </p>

          <hr style={{ margin: 'var(--spacing-2xl) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>
        </div>
      </div>
    );
  }

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
          5. سياسة الدفع عند الاستلام
        </h3>
        <p style={{ marginBottom: 'var(--spacing-md)' }}>
          عند اختيار طريقة "الدفع عند الاستلام"، يُشترط تحويل قيمة الشحن مقدماً (عبر انستاباي أو المحافظ الإلكترونية) لتأكيد الطلب، على أن يتم دفع قيمة المنتجات فقط عند الاستلام. في حال إلغاء الطلب بعد شحنه، لا يتم استرداد قيمة الشحن.
        </p>

        <h3 style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)' }}>
          6. خطوات الاسترجاع
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
