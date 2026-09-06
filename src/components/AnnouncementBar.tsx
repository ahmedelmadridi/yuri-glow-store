'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>(['🚚 شحن مجاني لأي طلب يتخطى 3000 ج.م (بدون استخدام كود خصم)']);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase
        .from('announcements')
        .select('text')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
        
      if (data && data.length > 0) {
        setMessages(data.map(d => d.text));
      }
    }
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === messages.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 seconds
    
    return () => clearInterval(interval);
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div style={{ 
      backgroundColor: 'var(--color-primary-dark)', 
      color: 'white', 
      textAlign: 'center', 
      padding: '8px', 
      fontSize: '0.95rem', 
      fontWeight: 'bold',
      minHeight: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {messages.map((msg, idx) => (
        <div 
          key={idx}
          style={{
            position: messages.length > 1 ? 'absolute' : 'static',
            opacity: idx === currentIndex ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            width: '100%',
            pointerEvents: idx === currentIndex ? 'auto' : 'none'
          }}
        >
          {msg}
        </div>
      ))}
    </div>
  );
}
