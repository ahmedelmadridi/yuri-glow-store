"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        // Set the cookie directly in the browser to bypass any API dropping issues
        document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
        // Use window.location to force a full page reload and bypass Next.js router cache
        window.location.href = '/admin';
      } else {
        setErrorMsg(data.message || 'فشل تسجيل الدخول');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('حدث خطأ في الاتصال');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.logo}>Yuri Glow</h1>
        <h2 className={styles.title}>لوحة تحكم الإدارة</h2>
        
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
            />
          </div>
          
          {errorMsg && <div className={styles.error}>{errorMsg}</div>}
          
          <button type="submit" className={`btn-primary ${styles.loginBtn}`} disabled={isLoading}>
            {isLoading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
