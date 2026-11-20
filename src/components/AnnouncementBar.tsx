'use client';

import { useEffect, useState, useRef } from 'react';
import { getPublicAnnouncements } from '@/app/actions/admin-content';

function AnnouncementItem({
  text,
  isActive,
  isAbsolute,
}: {
  text: string;
  isActive: boolean;
  isAbsolute: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const adjustScale = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth - 16; // 16px safety padding
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > containerWidth && containerWidth > 0) {
          setScale(containerWidth / textWidth);
        } else {
          setScale(1);
        }
      }
    };

    adjustScale();
    window.addEventListener('resize', adjustScale);
    return () => window.removeEventListener('resize', adjustScale);
  }, [text]);

  return (
    <div
      ref={containerRef}
      style={{
        position: isAbsolute ? 'absolute' : 'static',
        inset: isAbsolute ? 0 : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 8px',
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        pointerEvents: isActive ? 'auto' : 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        ref={textRef}
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          fontSize: 'clamp(0.72rem, 3.2vw, 0.95rem)',
          fontWeight: 'bold',
          transform: scale < 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'center',
          transition: 'transform 0.2s ease',
        }}
      >
        {text}
      </span>
    </div>
  );
}

import { useLanguage } from '@/context/LanguageContext';

export default function AnnouncementBar() {
  const { t, locale } = useLanguage();
  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { success, data } = await getPublicAnnouncements();
        
      if (success && data && data.length > 0) {
        setMessages(data.map((d: any) => d.text));
      }
    }
    fetchAnnouncements();
  }, []);

  const effectiveMessages = messages.length > 0 
    ? messages 
    : [t('announcement.defaultText')];


  useEffect(() => {
    if (effectiveMessages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === effectiveMessages.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 seconds
    
    return () => clearInterval(interval);
  }, [effectiveMessages]);

  if (effectiveMessages.length === 0) return null;

  return (
    <div style={{ 
      backgroundColor: 'var(--color-primary-dark)', 
      color: 'white', 
      textAlign: 'center', 
      padding: '8px 4px', 
      minHeight: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      {effectiveMessages.map((msg, idx) => (
        <AnnouncementItem
          key={idx}
          text={msg}
          isActive={idx === currentIndex}
          isAbsolute={effectiveMessages.length > 1}
        />
      ))}
    </div>
  );
}
