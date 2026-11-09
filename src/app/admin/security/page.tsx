import React from 'react';
import SecurityManager from './SecurityManager';
import { getAdminSecurityStatus } from '@/app/actions/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminSecurityPage() {
  const status = await getAdminSecurityStatus();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#2B3024' }}>الأمان وكلمة المرور</h1>
        <p style={{ margin: '8px 0 0', color: '#7f8c8d' }}>
          إدارة حماية لوحة التحكم وتغيير كلمة المرور بتأكيد البريد الإلكتروني.
        </p>
      </div>

      <SecurityManager initialStatus={status} />
    </div>
  );
}
