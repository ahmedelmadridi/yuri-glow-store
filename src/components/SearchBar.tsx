"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProducts, Product } from '@/data/products';
import { createProductSlug } from '@/utils/slug';
import { formatPrice } from '@/utils/format';
import Link from 'next/link';

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      const timer = setTimeout(async () => {
        const data = await getProducts(query.trim());
        setResults(data);
        setIsSearching(false);
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsSearching(false);
      setShowDropdown(false);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: compact ? '250px' : '500px', margin: compact ? '0' : '0 auto var(--spacing-xl) auto' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setShowDropdown(true);
            }
          }}
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

      {showDropdown && (query.trim().length >= 2) && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          backgroundColor: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          {isSearching ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-light)' }}>
              جاري البحث...
            </div>
          ) : results.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {results.map((product) => (
                <li key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <Link 
                    href={`/products/${createProductSlug(product.name, product.id)}`}
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      textDecoration: 'none',
                      color: 'var(--color-text)',
                      gap: '12px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} 
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: '500', fontSize: '0.95rem', lineHeight: '1.2' }}>{product.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && (
                          <span style={{ color: '#95a5a6', textDecoration: 'line-through', fontSize: '0.8rem' }}>
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-light)' }}>
              لا توجد نتائج لـ "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
