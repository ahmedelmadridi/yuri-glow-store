'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateStoreSetting } from '@/app/actions/admin-content';

export default function ColorManager({ initialSettings }: { initialSettings: any }) {
  const [colors, setColors] = useState({
    color_primary: initialSettings.color_primary || '#A88F48',
    color_bg: initialSettings.color_bg || '#FDFCF0',
    color_text: initialSettings.color_text || '#2B3024',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Calculate a darker shade for primary automatically (simple approach)
      // We can just set color-primary-dark based on color_primary or let user pick.
      // For simplicity, we just save the main ones.
      
      for (const [key, value] of Object.entries(colors)) {
        const { success, error } = await updateStoreSetting(key, value);
        if (!success) throw new Error(error);
      }
      
      alert('تم حفظ الألوان بنجاح!');
      router.refresh();
    } catch (err: any) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اللون الأساسي (Primary)</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="color" 
              value={colors.color_primary} 
              onChange={(e) => handleColorChange('color_primary', e.target.value)}
              style={{ width: '50px', height: '50px', cursor: 'pointer', border: 'none', padding: 0 }}
            />
            <input 
              type="text" 
              value={colors.color_primary} 
              onChange={(e) => handleColorChange('color_primary', e.target.value)}
              style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px', flex: 1 }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>لون الخلفية (Background)</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="color" 
              value={colors.color_bg} 
              onChange={(e) => handleColorChange('color_bg', e.target.value)}
              style={{ width: '50px', height: '50px', cursor: 'pointer', border: 'none', padding: 0 }}
            />
            <input 
              type="text" 
              value={colors.color_bg} 
              onChange={(e) => handleColorChange('color_bg', e.target.value)}
              style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px', flex: 1 }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>لون النصوص (Text)</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="color" 
              value={colors.color_text} 
              onChange={(e) => handleColorChange('color_text', e.target.value)}
              style={{ width: '50px', height: '50px', cursor: 'pointer', border: 'none', padding: 0 }}
            />
            <input 
              type="text" 
              value={colors.color_text} 
              onChange={(e) => handleColorChange('color_text', e.target.value)}
              style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px', flex: 1 }}
            />
          </div>
        </div>

      </div>

      <button 
        className="btn-primary" 
        onClick={handleSave} 
        disabled={isSaving}
        style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'wait' : 'pointer' }}
      >
        {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
      </button>
    </div>
  );
}
