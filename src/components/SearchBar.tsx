"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', maxWidth: compact ? '250px' : '500px', margin: compact ? '0' : '0 auto var(--spacing-xl) auto', width: '100%' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن منتج..."
        style={{
          flex: 1,
          padding: '12px 16px',
          border: '1px solid var(--color-border)',
          borderRadius: '30px',
          fontSize: '1rem',
          outline: 'none',
        }}
      />
      <button 
        type="submit"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          padding: '0 24px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        بحث
      </button>
    </form>
  );
}
