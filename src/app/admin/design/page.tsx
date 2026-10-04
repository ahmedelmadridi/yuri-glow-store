import { supabaseAdmin } from '@/lib/supabaseAdmin';
import BannerManager from './BannerManager';
import ColorManager from './ColorManager';

export const revalidate = 0;

export default async function AdminDesignPage() {
  const { data: banners, error: bannersError } = await supabaseAdmin
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true });

  const { data: settings, error: settingsError } = await supabaseAdmin
    .from('store_settings')
    .select('*');

  // Convert settings array to object if settings exist
  const currentSettings = settings?.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {}) || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>تنسيق المتجر</h1>
      </div>

      <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}>
        
        {/* Colors Section */}
        <section>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>ألوان المتجر</h2>
          {settingsError && settingsError.code === 'PGRST205' ? (
            <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '16px', borderRadius: '8px' }}>
              <strong>تنبيه:</strong> يبدو أنك لم تقم بإنشاء جدول <code>store_settings</code> في قاعدة البيانات. قم بإنشائه للتحكم في الألوان.
            </div>
          ) : (
            <ColorManager initialSettings={currentSettings} />
          )}
        </section>

        {/* Banners Section */}
        <section>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>البنرات (الصور المتحركة بالرئيسية)</h2>
          {bannersError ? (
            <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '16px', borderRadius: '8px' }}>
              <strong>تنبيه:</strong> يبدو أنك لم تقم بإنشاء جدول <code>banners</code> في قاعدة البيانات بعد. يرجى تنفيذ الكود البرمجي في Supabase SQL Editor أولاً.
            </div>
          ) : (
            <BannerManager initialBanners={banners || []} />
          )}
        </section>

      </div>
    </div>
  );
}
