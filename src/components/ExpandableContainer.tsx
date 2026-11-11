"use client";

import { useState } from 'react';

interface ExpandableContainerProps {
  initialChildren: React.ReactNode;
  expandedChildren?: React.ReactNode;
  totalCount: number;
}

export default function ExpandableContainer({
  initialChildren,
  expandedChildren,
  totalCount,
}: ExpandableContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (totalCount <= 5 || !expandedChildren) {
    return <>{initialChildren}</>;
  }

  return (
    <div>
      {initialChildren}
      {isExpanded && expandedChildren}
      <div style={{ marginTop: '14px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            backgroundColor: isExpanded ? '#f5f5f5' : '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '6px 18px',
            fontSize: '0.85rem',
            color: 'var(--color-primary-dark)',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isExpanded ? '#f5f5f5' : '#ffffff';
            e.currentTarget.style.color = 'var(--color-primary-dark)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          {isExpanded ? (
            <>
              <span>عرض أقل</span>
              <span style={{ fontSize: '0.75rem' }}>▲</span>
            </>
          ) : (
            <>
              <span>عرض المزيد ({totalCount - 5} إضافي)</span>
              <span style={{ fontSize: '0.75rem' }}>▼</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
