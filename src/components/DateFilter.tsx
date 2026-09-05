'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get('period') || 'all';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/admin?period=${e.target.value}`);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label style={{ fontWeight: 'bold', color: 'var(--color-text-light)' }}>الفترة الزمنية:</label>
      <select 
        value={currentPeriod} 
        onChange={handleChange}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'white',
          fontSize: '1rem',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="all">كل الأوقات</option>
        <option value="7d">آخر 7 أيام</option>
        <option value="30d">آخر 30 يوم</option>
        <option value="1y">آخر سنة</option>
      </select>
    </div>
  );
}
