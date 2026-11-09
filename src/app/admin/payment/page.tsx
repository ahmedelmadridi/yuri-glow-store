import { getPaymentSettings } from '@/app/actions/settings';
import PaymentManager from './PaymentManager';

export const revalidate = 0;

export default async function AdminPaymentPage() {
  const result = await getPaymentSettings();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ color: 'var(--color-primary-dark)' }}>إدارة طرق الدفع</h1>
      </div>

      <PaymentManager initialSettings={result.data} />
    </div>
  );
}
