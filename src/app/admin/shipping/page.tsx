import { getShippingSettings } from '@/app/actions/settings';
import ShippingManager from './ShippingManager';

export const revalidate = 0;

export default async function AdminShippingPage() {
  const result = await getShippingSettings();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ color: 'var(--color-primary-dark)' }}>إدارة أسعار الشحن</h1>
      </div>

      <ShippingManager initialSettings={result.data} />
    </div>
  );
}
