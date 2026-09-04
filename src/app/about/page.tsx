import styles from './page.module.css';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <h1 className={styles.title}>من نحن</h1>
      
      <div className={styles.content}>
        <div className={styles.imageSection}>
          <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop" alt="من نحن - Yuri Glow" className={styles.mainImage} />
        </div>
        
        <div className={styles.textSection}>
          <h2>قصة يوري جلو</h2>
          <p>
            تأسست <strong>يوري جلو</strong> من شغفنا العميق بجمال وصحة البشرة. نؤمن بأن العناية بالبشرة ليست مجرد روتين يومي، بل هي لحظة من الاهتمام بالنفس والثقة.
          </p>
          <p>
            رحلتنا بدأت باكتشاف أسرار العناية بالبشرة الكورية (K-Beauty) التي تعتمد على المكونات الطبيعية والترطيب العميق والنتائج طويلة الأمد بدلاً من الحلول السريعة.
          </p>
          
          <h3>مهمتنا</h3>
          <p>
            مهمتنا هي توفير أفضل منتجات العناية بالبشرة الكورية الأصلية 100% للسوق المصري بأسعار تنافسية وتجربة تسوق لا تُنسى. نحن نختار بعناية كل منتج نعرضه لضمان جودته وفعاليته.
          </p>

          <Link href="/products" className="btn-primary" style={{ display: 'inline-block', marginTop: 'var(--spacing-lg)' }}>
            تصفح منتجاتنا
          </Link>
        </div>
      </div>
    </div>
  );
}
