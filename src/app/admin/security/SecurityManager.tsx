'use client';

import React, { useState } from 'react';
import { requestPasswordChangeOtp, confirmPasswordChange } from '@/app/actions/admin-auth';

interface SecurityManagerProps {
  initialStatus: {
    isUsingCustomPassword: boolean;
    adminEmail: string;
    lastUpdated?: string;
  };
}

export default function SecurityManager({ initialStatus }: SecurityManagerProps) {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [maskedEmail, setMaskedEmail] = useState(initialStatus.adminEmail);

  // الخطوة 1: طلب رمز الـ OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('كلمة المرور الجديدة يجب ألا تقل عن 6 خانات');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('كلمة المرور الجديدة غير متطابقة مع التأكيد');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية');
      return;
    }

    setIsLoading(true);

    try {
      const res = await requestPasswordChangeOtp({ currentPassword });

      if (res.success) {
        if (res.maskedEmail) setMaskedEmail(res.maskedEmail);
        setStep('otp');
        setSuccessMsg(res.message || 'تم إرسال رمز التأكيد إلى بريدك الإلكتروني بنجاح!');
      } else {
        setErrorMsg(res.message || 'تعذر إرسال رمز التأكيد');
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setIsLoading(false);
    }
  };

  // الخطوة 2: تأكيد الـ OTP وحفظ كلمة المرور
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (otp.trim().length !== 6) {
      setErrorMsg('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setIsLoading(true);

    try {
      const res = await confirmPasswordChange(otp, newPassword);

      if (res.success) {
        setSuccessMsg('✅ تم تغيير كلمة المرور وتأمين حساب الإدارة بنجاح! تم إرسال إشعار تأكيد إلى إيميلك.');
        setStep('form');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtp('');
      } else {
        setErrorMsg(res.message || 'رمز التحقق غير صحيح');
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء حفظ كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      {/* بطاقة معلومات الأمان الحالية */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #ebdcb9',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#2B3024' }}>حالة أمان لوحة التحكم</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#666' }}>
              نظام المصادقة محمي بتشفير الجلسات وحماية ضد التخمين مع تأكيد البريد الإلكتروني.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#faf8f2',
          borderRadius: '8px'
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#7f8c8d' }}>البريد المعتمد للتأكيد</span>
            <strong style={{ color: '#2B3024', direction: 'ltr', display: 'inline-block' }}>
              {maskedEmail || 'لم يُحدد (تأكد من ضبط ADMIN_EMAIL)'}
            </strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#7f8c8d' }}>نوع كلمة المرور</span>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              backgroundColor: initialStatus.isUsingCustomPassword ? '#e8f8f5' : '#fff3cd',
              color: initialStatus.isUsingCustomPassword ? '#27ae60' : '#856404'
            }}>
              {initialStatus.isUsingCustomPassword ? 'مخصصة ومشفرة بقاعدة البيانات' : 'افتراضية / من البيئة'}
            </span>
          </div>
        </div>
      </div>

      {/* رسائل التنبيه والنجاح */}
      {successMsg && (
        <div style={{
          backgroundColor: '#e8f8f5',
          borderRight: '4px solid #27ae60',
          color: '#1e824c',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.95rem'
        }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          backgroundColor: '#fdedec',
          borderRight: '4px solid #e74c3c',
          color: '#c0392b',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.95rem'
        }}>
          {errorMsg}
        </div>
      )}

      {/* نموذج التغيير */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #eee',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        {step === 'form' ? (
          <form onSubmit={handleRequestOtp}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#2B3024' }}>
              تغيير كلمة المرور
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: '#777' }}>
              لأمان حسابك، سيتم إرسال رمز تحقق سري (OTP) إلى بريدك الإلكتروني المسجل لتأكيد التغيير.
            </p>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                كلمة المرور الحالية
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 خانات على الأقل"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة المرور الجديدة"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#A88F48',
                color: '#ffffff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                width: '100%'
              }}
            >
              {isLoading ? 'جاري إرسال رمز التأكيد...' : '📩 إرسال رمز التأكيد إلى الإيميل'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmOtp}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>✉️</span>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#2B3024' }}>
                أدخل رمز التأكيد (OTP)
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                تم إرسال كود تحقق مكون من 6 أرقام إلى: <strong dir="ltr">{maskedEmail}</strong>
              </p>
              <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.8rem', color: '#e67e22' }}>
                ⏳ الكود صالح لمدة 10 دقائق فقط
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                dir="ltr"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #A88F48',
                  fontSize: '1.8rem',
                  textAlign: 'center',
                  letterSpacing: '10px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  outline: 'none',
                  backgroundColor: '#fbf9f4'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 2,
                  backgroundColor: '#27ae60',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'جاري التحقق...' : '✅ تأكيد وتطبيق كلمة المرور'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMsg('');
                }}
                disabled={isLoading}
                style={{
                  flex: 1,
                  backgroundColor: '#f1f2f6',
                  color: '#57606f',
                  border: '1px solid #ced6e0',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                إلغاء / رجوع
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
