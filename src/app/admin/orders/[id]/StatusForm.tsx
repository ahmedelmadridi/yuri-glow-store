'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateOrderStatus } from '../actions';

export default function StatusForm({ 
  orderId, 
  currentStatus 
}: { 
  orderId: string, 
  currentStatus: string 
}) {
  const [state, formAction, isPending] = useActionState(updateOrderStatus, null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (state?.success || state?.success === false) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <p style={{ margin: '0 0 8px 0' }}>الحالة الحالية:</p>
        <select 
          name="status" 
          defaultValue={currentStatus} 
          style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
        >
          <option value="pending">قيد الانتظار</option>
          <option value="confirmed">مؤكد</option>
          <option value="shipped">تم الشحن</option>
          <option value="delivered">مكتمل (تم التوصيل)</option>
          <option value="cancelled">ملغى</option>
        </select>
      </div>
      
      <button 
        type="submit" 
        disabled={isPending}
        style={{ 
          padding: '12px', 
          backgroundColor: isPending ? '#95a5a6' : 'var(--color-primary)', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: isPending ? 'not-allowed' : 'pointer', 
          fontSize: '1rem', 
          fontWeight: 'bold',
          transition: 'background-color 0.2s'
        }}
      >
        {isPending ? 'جاري التحديث...' : 'تحديث الحالة'}
      </button>

      {showMessage && state && (
        <div style={{
          padding: '12px',
          borderRadius: '4px',
          backgroundColor: state.success ? '#d4edda' : '#f8d7da',
          color: state.success ? '#155724' : '#721c24',
          border: `1px solid ${state.success ? '#c3e6cb' : '#f5c6cb'}`,
          marginTop: '8px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {state.message}
        </div>
      )}
    </form>
  );
}
