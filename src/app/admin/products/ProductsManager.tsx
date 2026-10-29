'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/data/products';
import { formatPrice } from '@/utils/format';
import DeleteProductButton from './DeleteProductButton';

type StockFilterType = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

interface ProductsManagerProps {
  products: Product[];
}

export default function ProductsManager({ products }: ProductsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<StockFilterType>('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        cats.add(p.category.trim());
      }
    });
    return Array.from(cats);
  }, [products]);

  // Filter products based on search query, category, and stock filter
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      // 1. Text Search matching
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.category && product.category.toLowerCase().includes(query)) ||
        product.id.toString().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query));

      // 2. Category matching
      const matchesCategory =
        selectedCategory === 'ALL' ||
        product.category === selectedCategory;

      // 3. Stock matching
      const stock = product.stock_quantity ?? 0;
      let matchesStock = true;
      if (stockFilter === 'IN_STOCK') {
        matchesStock = stock > 5;
      } else if (stockFilter === 'LOW_STOCK') {
        matchesStock = stock > 0 && stock <= 5;
      } else if (stockFilter === 'OUT_OF_STOCK') {
        matchesStock = stock <= 0;
      }

      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'ALL' || stockFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setStockFilter('ALL');
  };

  if (products.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'white',
          padding: 'var(--spacing-2xl)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center',
        }}
      >
        <h2>لا توجد منتجات حتى الآن</h2>
        <p style={{ color: 'var(--color-text-light)', marginTop: '8px' }}>
          قم بإضافة منتجك الأول لتبدأ البيع!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters Bar */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              flex: '1',
              minWidth: '260px',
              maxWidth: '600px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8c8c8c',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، التصنيف، أو كود المنتج (ID)..."
              style={{
                width: '100%',
                padding: '10px 42px 10px 36px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                backgroundColor: '#fafafa',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(168, 143, 72, 0.2)';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#fafafa';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="مسح البحث"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#eaeaea',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters controls */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'white',
                fontSize: '0.9rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">جميع التصنيفات ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilterType)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'white',
                fontSize: '0.9rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">حالة المخزون: الكل</option>
              <option value="IN_STOCK">متوفر في المخزون (&gt; 5)</option>
              <option value="LOW_STOCK">مخزون منخفض (1 - 5)</option>
              <option value="OUT_OF_STOCK">نافذ من المخزون (0)</option>
            </select>
          </div>
        </div>

        {/* Status / Counters Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem',
            color: 'var(--color-text-light)',
            borderTop: '1px solid #f0f0f0',
            paddingTop: '10px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            عرض <strong style={{ color: 'var(--color-text)' }}>{filteredProducts.length}</strong> من أصل{' '}
            <strong>{products.length}</strong> منتج
            {searchQuery && (
              <span style={{ marginRight: '8px' }}>
                لنتائج البحث عن: &ldquo;<strong style={{ color: 'var(--color-primary)' }}>{searchQuery}</strong>&rdquo;
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.88rem',
                textDecoration: 'underline',
                padding: '2px 6px',
              }}
            >
              إعادة ضبط الفلاتر والبحث
            </button>
          )}
        </div>
      </div>

      {/* Products Table or Empty State */}
      {filteredProducts.length === 0 ? (
        <div
          style={{
            backgroundColor: 'white',
            padding: 'var(--spacing-2xl)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <h3>لم يتم العثور على أي منتج يطابق البحث</h3>
          <p style={{ color: 'var(--color-text-light)', marginTop: '6px', marginBottom: '16px' }}>
            جرب البحث بكلمات أخرى أو قم بإلغاء الفلاتر المحددة.
          </p>
          <button
            onClick={handleResetFilters}
            type="button"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            إظهار كافة المنتجات
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: 'var(--spacing-md)' }}>كود</th>
                <th style={{ padding: 'var(--spacing-md)' }}>المنتج</th>
                <th style={{ padding: 'var(--spacing-md)' }}>التصنيف</th>
                <th style={{ padding: 'var(--spacing-md)' }}>السعر الحالي</th>
                <th style={{ padding: 'var(--spacing-md)' }}>العدد في المخزون</th>
                <th style={{ padding: 'var(--spacing-md)' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stock = product.stock_quantity ?? 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= 5;

                return (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td
                      style={{
                        padding: 'var(--spacing-md)',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-light)',
                        fontWeight: '500',
                      }}
                    >
                      #{product.id}
                    </td>
                    <td
                      style={{
                        padding: 'var(--spacing-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={50}
                        height={50}
                        unoptimized
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #eee',
                        }}
                      />
                      <span style={{ fontWeight: 'bold' }}>{product.name}</span>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <span
                        style={{
                          backgroundColor: '#f1f1f1',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {product.category || 'غير مصنف'}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: 'var(--spacing-md)',
                        fontWeight: 'bold',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {formatPrice(product.price)}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      {isOutOfStock ? (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                          }}
                        >
                          نافذ (0)
                        </span>
                      ) : isLowStock ? (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#fff3e0',
                            color: '#e65100',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                          }}
                        >
                          منخفض ({stock})
                        </span>
                      ) : (
                        <span style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>
                          {stock}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: 'var(--spacing-md)',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        style={{
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          padding: '6px 12px',
                          backgroundColor: '#e3f2fd',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                        }}
                      >
                        تعديل
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
