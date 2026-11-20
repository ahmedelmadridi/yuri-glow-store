"use client";

import styles from './page.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
  const { t, locale, isRTL } = useLanguage();

  return (
    <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-md)' }}>
      <h1 className={styles.title}>{t('contact.title')}</h1>
      
      <div className={styles.content}>
        <div className={styles.infoSection}>
          <h2>{t('contact.subtitle')}</h2>
          <p>{t('contact.desc')}</p>
          
          <div className={styles.contactCards}>
            <div className={styles.card}>
              <h3>{t('contact.addressTitle')}</h3>
              <p>{t('contact.addressVal')}</p>
            </div>
            
            <div className={styles.card}>
              <h3>{t('contact.phoneTitle')}</h3>
              <p dir="ltr" style={{ textAlign: isRTL ? 'right' : 'left' }}>+20 150 543 2061</p>
            </div>
            
            <div className={styles.card}>
              <h3>{t('contact.emailTitle')}</h3>
              <p>contact@yuriglow.com</p>
            </div>
          </div>
          
          <div className={styles.socialMedia}>
            <h3>{t('contact.socialTitle')}</h3>
            <div className={styles.socialLinks}>
              <a href="https://instagram.com/yuri.glow.eg" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Instagram</a>
              <a href="https://facebook.com/yuriglowegy" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Facebook</a>
              <a href="https://tiktok.com/@yuri.glow.eg" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>TikTok</a>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>{t('contact.formTitle')}</h2>
          <form className={styles.form} onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name');
            const phone = formData.get('phone');
            const message = formData.get('message');
            
            const whatsappNumber = "201505432061"; 
            
            const text = locale === 'en'
              ? `Hello Yuri Glow! 👋\n\nName: ${name}\nPhone: ${phone}\n\nMessage:\n${message}`
              : `مرحباً يوري جلو! 👋\n\nالاسم: ${name}\nرقم التواصل: ${phone}\n\nالرسالة:\n${message}`;
            const encodedText = encodeURIComponent(text);
            
            window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
          }}>
            <div className={styles.inputGroup}>
              <label>{t('contact.fullName')}</label>
              <input type="text" name="name" placeholder={t('contact.namePlaceholder')} required />
            </div>
            
            <div className={styles.inputGroup}>
              <label>{t('contact.phoneNumber')}</label>
              <input type="tel" name="phone" placeholder={t('contact.phonePlaceholder')} required dir="ltr" style={{ textAlign: isRTL ? 'right' : 'left' }} />
            </div>
            
            <div className={styles.inputGroup}>
              <label>{t('contact.message')}</label>
              <textarea name="message" rows={5} placeholder={t('contact.messagePlaceholder')} required></textarea>
            </div>
            
            <button type="submit" className="btn-primary">
              {t('contact.sendWhatsapp')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
