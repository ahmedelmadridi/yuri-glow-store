"use client";

import { useState } from 'react';
import styles from './page.module.css';
import {
  loginAdmin,
  requestPasswordChangeOtp,
  confirmPasswordChange,
} from '@/app/actions/admin-auth';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // حالة استعادة كلمة المرور
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPin, setForgotPin] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  // تسجيل الدخول العادي
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginAdmin(password);

      if (res.success) {
        window.location.href = '/admin';
      } else {
        setErrorMsg(res.message || 'فشل تسجيل الدخول');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('حدث خطأ في الاتصال');
      setIsLoading(false);
    }
  };

  // طلب رمز استعادة كلمة المرور
  const handleRequestForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await requestPasswordChangeOtp({
        isForgotPassword: true,
        email: forgotEmail,
        securityPin: forgotPin,
      });

      if (res.success) {
        if (res.maskedEmail) setMaskedEmail(res.maskedEmail);
        setForgotStep('verify');
        setSuccessMsg(res.message || 'تم إرسال رمز الاستعادة بنجاح!');
      } else {
        setErrorMsg(res.message || 'تعذر إرسال رمز الاستعادة');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء طلب رمز الاستعادة');
    } finally {
      setIsLoading(false);
    }
  };

  // تأكيد وتعيين كلمة المرور الجديدة
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('كلمة المرور الجديدة يجب ألا تقل عن 6 خانات');
      setIsLoading(false);
      return;
    }

    try {
      const res = await confirmPasswordChange(otp, newPassword);

      if (res.success) {
        setSuccessMsg('تم تعيين كلمة المرور بنجاح! جاري تحويلك للوحة التحكم...');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1500);
      } else {
        setErrorMsg(res.message || 'رمز التحقق غير صحيح');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء تحديث كلمة المرور');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: isForgotMode ? '440px' : '400px' }}>
        <h1 className={styles.logo}>Yuri Glow</h1>
        <h2 className={styles.title}>
          {isForgotMode ? 'استعادة كلمة المرور' : 'لوحة تحكم الإدارة'}
        </h2>

        {successMsg && (
          <div style={{
            backgroundColor: '#e8f8f5',
            color: '#27ae60',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.9rem',
            textAlign: 'right'
          }}>
            {successMsg}
          </div>
        )}

        {errorMsg && <div className={styles.error} style={{ marginBottom: '16px' }}>{errorMsg}</div>}

        {!isForgotMode ? (
          /* شاشة تسجيل الدخول العادية */
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">كلمة المرور</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="أدخل كلمة المرور"
                dir="ltr"
                autoFocus
              />
            </div>

            <button type="submit" className={`btn-primary ${styles.loginBtn}`} disabled={isLoading}>
              {isLoading ? 'جاري التحقق...' : 'دخول'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotMode(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#7f8c8d',
                cursor: 'pointer',
                fontSize: '0.88rem',
                marginTop: '12px',
                textDecoration: 'underline'
              }}
            >
              نسيت كلمة المرور؟
            </button>
          </form>
        ) : (
          /* شاشة استعادة كلمة المرور */
          <div>
            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestForgotOtp} className={styles.form}>
                <p style={{ fontSize: '0.88rem', color: '#666', lineHeight: 1.5, textAlign: 'right', margin: '0 0 14px' }}>
                  لأمان حسابك ومنع أي محاولات غير مصرح بها، أدخل البريد الإلكتروني المعتمد ورمز الأمان الرئيسي (Master PIN) لإرسال رمز التحقق:
                </p>

                <div className={styles.inputGroup}>
                  <label htmlFor="forgotEmail">البريد الإلكتروني للإدارة</label>
                  <input
                    type="email"
                    id="forgotEmail"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="yuri.glow.eg@gmail.com"
                    dir="ltr"
                    autoFocus
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="forgotPin">رمز الأمان السري (Master PIN)</label>
                  <input
                    type="password"
                    id="forgotPin"
                    required
                    maxLength={10}
                    value={forgotPin}
                    onChange={(e) => setForgotPin(e.target.value)}
                    placeholder="أدخل الرمز السري الخاص بك"
                    dir="ltr"
                  />
                </div>

                <button type="submit" className={`btn-primary ${styles.loginBtn}`} disabled={isLoading}>
                  {isLoading ? 'جاري التحقق والإرسال...' : '📩 إرسال رمز التحقق'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7f8c8d',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    marginTop: '12px'
                  }}
                >
                  العودة لتسجيل الدخول
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className={styles.form}>
                <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'right', margin: '0 0 12px' }}>
                  أدخل رمز التحقق الذي وصل إلى بريدك: <strong dir="ltr">{maskedEmail}</strong>
                </p>

                <div className={styles.inputGroup}>
                  <label htmlFor="otp">رمز التحقق (OTP)</label>
                  <input
                    type="text"
                    id="otp"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    dir="ltr"
                    autoFocus
                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem', fontWeight: 'bold' }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="newPassword">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    id="newPassword"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="6 خانات على الأقل"
                    dir="ltr"
                  />
                </div>

                <button type="submit" className={`btn-primary ${styles.loginBtn}`} disabled={isLoading}>
                  {isLoading ? 'جاري التحقق...' : '✅ تعيين كلمة المرور والدخول'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('request');
                    setErrorMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7f8c8d',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    marginTop: '8px'
                  }}
                >
                  إعادة إرسال الرمز
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
