'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

import { addAnnouncement, toggleAnnouncement, deleteAnnouncement } from '@/app/actions/admin-content';

export default function AnnouncementManager({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newText, setNewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    
    setIsSubmitting(true);

    try {
      const { success, data, error } = await addAnnouncement(newText.trim());

      if (!success) throw new Error(error);

      setAnnouncements([...announcements, data]);
      setNewText('');
      router.refresh();
    } catch (err: any) {
      alert('حدث خطأ أثناء إضافة الخبر: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;

    try {
      const { success, error } = await deleteAnnouncement(id);
      if (!success) throw new Error(error);

      setAnnouncements(announcements.filter(a => a.id !== id));
      router.refresh();
    } catch (err: any) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { success, error } = await toggleAnnouncement(id, !currentStatus);
      if (!success) throw new Error(error);

      setAnnouncements(announcements.map(a => 
        a.id === id ? { ...a, is_active: !currentStatus } : a
      ));
      router.refresh();
    } catch (err: any) {
      alert('حدث خطأ أثناء التحديث: ' + err.message);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ marginBottom: 'var(--spacing-xl)', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px' }}>إضافة خبر جديد</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="اكتب الخبر هنا (مثال: خصم 50% على جميع المنتجات اليوم!)"
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
            required
          />
          <button type="submit" className="btn-primary" disabled={isSubmitting || !newText.trim()}>
            {isSubmitting ? 'جاري الإضافة...' : 'إضافة'}
          </button>
        </form>
      </div>

      <div>
        <h3>الأخبار الحالية ({announcements.length})</h3>
        {announcements.length === 0 ? (
          <p style={{ color: 'var(--color-text-light)', marginTop: '10px' }}>لا توجد أخبار حالياً. لن يتم عرض شريط الأخبار في الموقع.</p>
        ) : (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcements.map((announcement, index) => (
              <div key={announcement.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: announcement.is_active ? 'white' : '#f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{index + 1}.</span>
                  <span style={{ textDecoration: announcement.is_active ? 'none' : 'line-through', color: announcement.is_active ? 'var(--color-text)' : '#999' }}>
                    {announcement.text}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                    style={{ backgroundColor: announcement.is_active ? '#f39c12' : '#27ae60', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {announcement.is_active ? 'إيقاف' : 'تفعيل'}
                  </button>
                  <button 
                    onClick={() => handleDelete(announcement.id)}
                    style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
