import { supabaseAdmin } from '@/lib/supabaseAdmin';
import BannerManager from './BannerManager';

export const revalidate = 0;

export default async function AdminBannersPage() {
  const { data: banners, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>إدارة البنرات (الصور المتحركة بالرئيسية)</h1>
      </div>

      {error ? (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '16px', borderRadius: '8px' }}>
          <strong>تنبيه:</strong> يبدو أنك لم تقم بإنشاء جدول <code>banners</code> في قاعدة البيانات بعد. يرجى تنفيذ الكود البرمجي في Supabase SQL Editor أولاً.
        </div>
      ) : (
        <BannerManager initialBanners={banners || []} />
      )}
    </div>
  );
}
