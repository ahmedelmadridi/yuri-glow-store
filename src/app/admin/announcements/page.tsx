import { supabaseAdmin } from '@/lib/supabaseAdmin';
import AnnouncementManager from './AnnouncementManager';

export const revalidate = 0;

export default async function AdminAnnouncementsPage() {
  const { data: announcements, error } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>إدارة شريط الأخبار</h1>
      </div>

      {error ? (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '16px', borderRadius: '8px' }}>
          <strong>تنبيه:</strong> يبدو أنك لم تقم بإنشاء جدول <code>announcements</code> في قاعدة البيانات بعد. يرجى تنفيذ الكود البرمجي في Supabase SQL Editor أولاً.
        </div>
      ) : (
        <AnnouncementManager initialAnnouncements={announcements || []} />
      )}
    </div>
  );
}
