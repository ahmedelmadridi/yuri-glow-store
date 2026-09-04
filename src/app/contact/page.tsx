"use client";

import styles from './page.module.css';

export default function ContactPage() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <h1 className={styles.title}>اتصل بنا</h1>
      
      <div className={styles.content}>
        <div className={styles.infoSection}>
          <h2>نسعد بتواصلك معنا!</h2>
          <p>
            سواء كان لديك استفسار عن منتج معين، أو تحتاج إلى مساعدة في اختيار الروتين المناسب لبشرتك، فريقنا دائماً جاهز لمساعدتك.
          </p>
          
          <div className={styles.contactCards}>
            <div className={styles.card}>
              <h3>📍 العنوان</h3>
              <p>القاهرة، مصر (متجر إلكتروني)</p>
            </div>
            
            <div className={styles.card}>
              <h3>📞 رقم الهاتف / واتساب</h3>
              <p dir="ltr" style={{ textAlign: 'right' }}>+20 150 543 2061</p>
            </div>
            
            <div className={styles.card}>
              <h3>✉️ البريد الإلكتروني</h3>
              <p>contact@yuriglow.com</p>
            </div>
          </div>
          
          <div className={styles.socialMedia}>
            <h3>تابعنا على الشبكات الاجتماعية:</h3>
            <div className={styles.socialLinks}>
              <a href="https://instagram.com/yuri.glow.eg" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Instagram</a>
              <a href="https://facebook.com/yuriglowegy" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Facebook</a>
              <a href="https://tiktok.com/@yuri.glow.eg" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>TikTok</a>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>أرسل لنا رسالة</h2>
          <form className={styles.form} onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name');
            const phone = formData.get('phone');
            const message = formData.get('message');
            
            // قم بتغيير هذا الرقم إلى رقم الواتساب الفعلي الخاص بك
            const whatsappNumber = "201505432061"; 
            
            const text = `مرحباً يوري جلو! 👋\n\nالاسم: ${name}\nرقم التواصل: ${phone}\n\nالرسالة:\n${message}`;
            const encodedText = encodeURIComponent(text);
            
            window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
          }}>
            <div className={styles.inputGroup}>
              <label>الاسم بالكامل</label>
              <input type="text" name="name" placeholder="اكتب اسمك هنا" required />
            </div>
            
            <div className={styles.inputGroup}>
              <label>رقم الهاتف</label>
              <input type="tel" name="phone" placeholder="رقم الهاتف للتواصل" required />
            </div>
            
            <div className={styles.inputGroup}>
              <label>الرسالة</label>
              <textarea name="message" rows={5} placeholder="كيف يمكننا مساعدتك؟" required></textarea>
            </div>
            
            <button type="submit" className="btn-primary">
              إرسال عبر الواتساب 💬
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
