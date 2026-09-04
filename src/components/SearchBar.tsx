"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
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
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-xl)', maxWidth: '500px', margin: '0 auto var(--spacing-xl) auto' }}>
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
