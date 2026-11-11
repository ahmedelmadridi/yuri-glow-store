import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatPrice } from '@/utils/format';
import Link from 'next/link';

import DateFilter from '@/components/DateFilter';
import { governorates } from '@/data/governorates';
import { getShippingSettings } from '@/app/actions/settings';
import ExpandableContainer from '@/components/ExpandableContainer';

export const revalidate = 0; // Disable caching for admin dashboard

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const resolvedParams = await searchParams;
  const period = resolvedParams.period || 'all';

  const shippingSettingsRes = await getShippingSettings();
  const currentGovernorates = shippingSettingsRes.data.governorates;

  const now = new Date();
  let startDate: string | null = null;
  let prevStartDate: string | null = null;
  let comparisonLabel = '';

  if (period === 'today') {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    startDate = startOfToday.toISOString();

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    prevStartDate = startOfYesterday.toISOString();
    comparisonLabel = 'مقارنة بالأمس';
  } else if (period === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    comparisonLabel = 'مقارنة بـ 7 أيام السابقة';
  } else if (period === '30d') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    prevStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
    comparisonLabel = 'مقارنة بـ 30 يوماً السابقة';
  } else if (period === '1y') {
    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    prevStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000).toISOString();
    comparisonLabel = 'مقارنة بالسنة السابقة';
  }

  // Fetch orders starting from prevStartDate (for comparison) or startDate or all
  const fetchFromDate = prevStartDate || startDate;

  let ordersQuery = supabaseAdmin
    .from('orders')
    .select(`
      id,
      total_amount,
      shipping_cost,
      governorate,
      status,
      created_at,
      order_items (
        quantity,
        price_at_time_of_order,
        product_id,
        products (
          name,
          cost_price
        )
      )
    `);

  if (fetchFromDate) {
    ordersQuery = ordersQuery.gte('created_at', fetchFromDate);
  }

  const { data: allOrders, error: ordersError } = await ordersQuery;

  // Fetch products for inventory alerts
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, name, stock_quantity, image')
    .order('stock_quantity', { ascending: true });

  // Fetch store metrics (both all-time totals and daily records)
  const { data: allMetricsData, error: metricsError } = await supabaseAdmin
    .from('store_metrics')
    .select('id, total_visits');

  const metricsRows = allMetricsData || [];

  // Fetch Wishlist Events (for the selected period or all-time)
  let wishlistQuery = supabaseAdmin
    .from('wishlist_events')
    .select('id, product_id, action, created_at');

  if (startDate) {
    wishlistQuery = wishlistQuery.gte('created_at', startDate);
  }

  const { data: wishlistData, error: wishlistError } = await wishlistQuery;

  // Fetch Search Logs (for the selected period or latest 1000)
  let searchLogsQuery = supabaseAdmin
    .from('search_logs')
    .select('id, query, created_at')
    .order('created_at', { ascending: false });

  if (startDate) {
    searchLogsQuery = searchLogsQuery.gte('created_at', startDate);
  } else {
    searchLogsQuery = searchLogsQuery.limit(1000);
  }

  const { data: searchLogsData, error: searchError } = await searchLogsQuery;

  if (ordersError || productsError || metricsError) {
    return <div>خطأ في جلب البيانات</div>;
  }

  // Partition orders into current period and previous period
  const rawOrders = allOrders || [];
  const currentOrders = startDate
    ? rawOrders.filter(o => new Date(o.created_at) >= new Date(startDate!))
    : rawOrders;

  const previousOrders = (startDate && prevStartDate)
    ? rawOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= new Date(prevStartDate!) && d < new Date(startDate!);
      })
    : [];

  // Helper to calculate statistics for an order set
  const calculatePeriodStats = (orderList: typeof rawOrders) => {
    const validOrders = orderList.filter(o => o.status !== 'cancelled');
    const totalOrders = orderList.length;
    const pendingOrders = orderList.filter(o => o.status === 'pending').length;

    // Product Revenue (excluding shipping paid by customer)
    const revenue = validOrders.reduce((sum, order) => sum + (order.total_amount - (order.shipping_cost || 0)), 0);
    const averageOrderValue = validOrders.length > 0 ? revenue / validOrders.length : 0;

    let totalCostOfGoods = 0;
    let totalShippingLoss = 0;

    validOrders.forEach(order => {
      const courierFee = currentGovernorates.find(g => g.name === order.governorate)?.shippingCost ?? (governorates.find(g => g.name === order.governorate)?.shippingCost || 0);
      const customerPaidShipping = order.shipping_cost || 0;
      const shippingLoss = Math.max(0, courierFee - customerPaidShipping);
      totalShippingLoss += shippingLoss;

      order.order_items?.forEach((item: any) => {
        const quantity = item.quantity || 0;
        const cost = item.products?.cost_price || 0;
        totalCostOfGoods += (cost * quantity);
      });
    });

    const netProfit = revenue - totalCostOfGoods - totalShippingLoss;

    return {
      totalOrders,
      pendingOrders,
      validOrders,
      revenue,
      averageOrderValue,
      netProfit,
    };
  };

  const currentStats = calculatePeriodStats(currentOrders);
  const previousStats = calculatePeriodStats(previousOrders);

  // Helper to calculate percentage difference
  const calculateChange = (current: number, previous: number) => {
    if (!startDate || !prevStartDate) {
      return null;
    }
    if (previous === 0) {
      if (current === 0) return { percent: 0, direction: 'neutral' as const };
      return { percent: 100, direction: 'up' as const };
    }
    const diff = current - previous;
    const percent = Math.round((diff / Math.abs(previous)) * 100);
    if (percent === 0) return { percent: 0, direction: 'neutral' as const };
    return {
      percent: Math.abs(percent),
      direction: diff > 0 ? ('up' as const) : ('down' as const),
    };
  };

  const revenueChange = calculateChange(currentStats.revenue, previousStats.revenue);
  const profitChange = calculateChange(currentStats.netProfit, previousStats.netProfit);
  const ordersChange = calculateChange(currentStats.totalOrders, previousStats.totalOrders);
  const aovChange = calculateChange(currentStats.averageOrderValue, previousStats.averageOrderValue);

  // Helper to convert date to integer YYYYMMDD
  const toDateInt = (d: Date): number => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return parseInt(`${y}${m}${day}`, 10);
  };

  // Calculate visits, addToCart, initiateCheckout for current and previous periods
  const currentMetrics = { visits: 0, addToCart: 0, initiateCheckout: 0 };
  const previousMetrics = { visits: 0, addToCart: 0, initiateCheckout: 0 };

  if (!startDate) {
    // "all" period: use lifetime cumulative rows (id: 1, 2, 3)
    currentMetrics.visits = metricsRows.find(m => m.id === 1)?.total_visits || 0;
    currentMetrics.addToCart = metricsRows.find(m => m.id === 2)?.total_visits || 0;
    currentMetrics.initiateCheckout = metricsRows.find(m => m.id === 3)?.total_visits || 0;
  } else {
    const todayInt = toDateInt(now);
    const startDayInt = toDateInt(new Date(startDate));
    const prevStartDayInt = prevStartDate ? toDateInt(new Date(prevStartDate)) : null;

    metricsRows.forEach(r => {
      if (r.id > 10) {
        const type = r.id % 10;
        const dInt = Math.floor(r.id / 10);

        // Current period: from startDayInt to todayInt
        if (dInt >= startDayInt && dInt <= todayInt) {
          if (type === 1) currentMetrics.visits += r.total_visits;
          else if (type === 2) currentMetrics.addToCart += r.total_visits;
          else if (type === 3) currentMetrics.initiateCheckout += r.total_visits;
        }

        // Previous period: from prevStartDayInt to startDayInt - 1
        if (prevStartDayInt !== null && dInt >= prevStartDayInt && dInt < startDayInt) {
          if (type === 1) previousMetrics.visits += r.total_visits;
          else if (type === 2) previousMetrics.addToCart += r.total_visits;
          else if (type === 3) previousMetrics.initiateCheckout += r.total_visits;
        }
      }
    });
  }

  const visitsChange = calculateChange(currentMetrics.visits, previousMetrics.visits);
  const addToCartChange = calculateChange(currentMetrics.addToCart, previousMetrics.addToCart);
  const checkoutChange = calculateChange(currentMetrics.initiateCheckout, previousMetrics.initiateCheckout);

  // Best selling products tracking (for the selected period)
  const productSalesCount: Record<string, { name: string, quantity: number, revenue: number }> = {};
  currentStats.validOrders.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const quantity = item.quantity || 0;
      const price = item.price_at_time_of_order || 0;
      const pId = item.product_id;
      if (!productSalesCount[pId]) {
        productSalesCount[pId] = {
          name: item.products?.name || 'منتج محذوف',
          quantity: 0,
          revenue: 0
        };
      }
      productSalesCount[pId].quantity += quantity;
      productSalesCount[pId].revenue += (price * quantity);
    });
  });

  const bestSellers = Object.values(productSalesCount)
    .sort((a, b) => b.quantity - a.quantity);

  // Inventory Alerts (Products with stock strictly less than 5)
  const lowStockProducts = products?.filter(p => (p.stock_quantity ?? 0) < 5) || [];

  // Wishlist Analytics Processing
  const productMap: Record<number, { name: string; image: string; stock_quantity: number }> = {};
  products?.forEach(p => {
    productMap[p.id] = {
      name: p.name,
      image: p.image,
      stock_quantity: p.stock_quantity ?? 0,
    };
  });

  const wishlistCounts: Record<number, { productId: number; name: string; image: string; adds: number; stock: number }> = {};
  (wishlistData || []).forEach((event: any) => {
    if (event.action === 'add') {
      const pId = Number(event.product_id);
      const productInfo = productMap[pId] || { name: `منتج #${pId}`, image: '', stock: 0 };
      if (!wishlistCounts[pId]) {
        wishlistCounts[pId] = {
          productId: pId,
          name: productInfo.name,
          image: productInfo.image,
          adds: 0,
          stock: productInfo.stock_quantity,
        };
      }
      wishlistCounts[pId].adds += 1;
    }
  });

  const topWishlist = Object.values(wishlistCounts)
    .sort((a, b) => b.adds - a.adds);

  const totalWishlistAdds = (wishlistData || []).filter((e: any) => e.action === 'add').length;

  // Search Analytics Processing
  const searchCounts: Record<string, { query: string; count: number; lastSearched: string }> = {};
  (searchLogsData || []).forEach((log: any) => {
    const rawQ = (log.query || '').trim();
    if (!rawQ) return;
    const lowerQ = rawQ.toLowerCase();
    if (!searchCounts[lowerQ]) {
      searchCounts[lowerQ] = {
        query: rawQ,
        count: 0,
        lastSearched: log.created_at,
      };
    }
    searchCounts[lowerQ].count += 1;
    if (new Date(log.created_at) > new Date(searchCounts[lowerQ].lastSearched)) {
      searchCounts[lowerQ].lastSearched = log.created_at;
    }
  });

  const topSearches = Object.values(searchCounts)
    .sort((a, b) => b.count - a.count);

  const totalSearches = (searchLogsData || []).length;

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays === 1) return 'أمس';
      if (diffDays < 30) return `منذ ${diffDays} يوم`;
      return date.toLocaleDateString('ar-EG');
    } catch {
      return '';
    }
  };

  // Helper to render trend badges
  const renderTrendBadge = (change: { percent: number; direction: 'up' | 'down' | 'neutral' } | null) => {
    if (!change) {
      return (
        <div style={{ marginTop: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '10px' }}>
            إجمالي شامل
          </span>
        </div>
      );
    }

    const isUp = change.direction === 'up';
    const isDown = change.direction === 'down';
    const bgColor = isUp ? '#e8f5e9' : isDown ? '#ffebee' : '#f5f5f5';
    const textColor = isUp ? '#2e7d32' : isDown ? '#c62828' : '#616161';
    const arrow = isUp ? '↑' : isDown ? '↓' : '•';
    const sign = isUp ? '+' : isDown ? '-' : '';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          fontSize: '0.8rem',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: bgColor,
          color: textColor,
        }}>
          <span>{arrow}</span>
          <span dir="ltr">{sign}{change.percent}%</span>
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
          {comparisonLabel}
        </span>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>نظرة عامة وإحصائيات</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            مقارنة الأداء والنمو بالفترة السابقة
          </p>
        </div>
        <DateFilter />
      </div>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-2xl)' }}>
        
        {/* Visits Metric */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '0.95rem' }}>إجمالي الزيارات 👁️</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0 }}>{currentMetrics.visits}</p>
          {renderTrendBadge(visitsChange)}
        </div>

        {/* Add To Cart Metric */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '0.95rem' }}>إضافة للسلة 🛒</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e67e22', margin: 0 }}>{currentMetrics.addToCart}</p>
          {renderTrendBadge(addToCartChange)}
        </div>

        {/* Initiate Checkout Metric */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '0.95rem' }}>بدء الشراء 💳</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#9b59b6', margin: 0 }}>{currentMetrics.initiateCheckout}</p>
          {renderTrendBadge(checkoutChange)}
        </div>

        {/* Revenue */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '0.95rem' }}>مبيعات المنتجات (بدون الشحن)</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', margin: 0 }}>{formatPrice(currentStats.revenue)}</p>
          {renderTrendBadge(revenueChange)}
        </div>

        {/* Net Profit */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '0.95rem' }}>صافي الربح</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#27ae60', margin: 0 }}>{formatPrice(currentStats.netProfit)}</p>
          {renderTrendBadge(profitChange)}
        </div>

        {/* Total Orders */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '0.95rem' }}>إجمالي الطلبات</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text)', margin: 0 }}>{currentStats.totalOrders}</p>
          {renderTrendBadge(ordersChange)}
        </div>

        {/* Average Order Value */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '0.95rem' }}>متوسط سعر الطلب</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text)', margin: 0 }}>{formatPrice(currentStats.averageOrderValue)}</p>
          {renderTrendBadge(aovChange)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
        
        {/* Best Sellers */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>المنتجات الأكثر مبيعاً 🏆</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
              {period === 'all' ? 'كل الأوقات' : period === 'today' ? 'اليوم' : period === '7d' ? 'آخر 7 أيام' : period === '30d' ? 'آخر 30 يوم' : 'آخر سنة'}
            </span>
          </div>
          {bestSellers.length > 0 ? (
            <ExpandableContainer
              totalCount={bestSellers.length}
              initialChildren={
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {bestSellers.slice(0, 5).map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx !== Math.min(bestSellers.length, 5) - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                      <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-light)' }}>
                        <span>{item.quantity} قطعة</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatPrice(item.revenue)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              }
              expandedChildren={
                bestSellers.length > 5 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--color-border)' }}>
                    {bestSellers.slice(5).map((item, idx) => (
                      <li key={idx + 5} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx !== bestSellers.length - 6 ? '1px solid var(--color-border)' : 'none' }}>
                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                        <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-light)' }}>
                          <span>{item.quantity} قطعة</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatPrice(item.revenue)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : undefined
              }
            />
          ) : (
            <p style={{ color: 'var(--color-text-light)' }}>لا توجد مبيعات بعد.</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem', color: '#e74c3c' }}>تنبيهات المخزون (أقل من 5 قطع) ⚠️</h2>
          {lowStockProducts.length > 0 ? (
            <ExpandableContainer
              totalCount={lowStockProducts.length}
              initialChildren={
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {lowStockProducts.slice(0, 5).map((product, idx) => (
                    <li key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== Math.min(lowStockProducts.length, 5) - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <Link href={`/admin/products/${product.id}/edit`} style={{ fontWeight: '500', color: 'var(--color-text)', textDecoration: 'none' }}>
                          {product.name}
                        </Link>
                      </div>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontWeight: 'bold',
                        backgroundColor: product.stock_quantity === 0 ? '#fceceb' : '#fff3cd',
                        color: product.stock_quantity === 0 ? '#c62828' : '#856404'
                      }}>
                        {product.stock_quantity === 0 ? 'نفذت الكمية' : `متبقي ${product.stock_quantity}`}
                      </span>
                    </li>
                  ))}
                </ul>
              }
              expandedChildren={
                lowStockProducts.length > 5 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--color-border)' }}>
                    {lowStockProducts.slice(5).map((product, idx) => (
                      <li key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== lowStockProducts.length - 6 ? '1px solid var(--color-border)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          <Link href={`/admin/products/${product.id}/edit`} style={{ fontWeight: '500', color: 'var(--color-text)', textDecoration: 'none' }}>
                            {product.name}
                          </Link>
                        </div>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontWeight: 'bold',
                          backgroundColor: product.stock_quantity === 0 ? '#fceceb' : '#fff3cd',
                          color: product.stock_quantity === 0 ? '#c62828' : '#856404'
                        }}>
                          {product.stock_quantity === 0 ? 'نفذت الكمية' : `متبقي ${product.stock_quantity}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : undefined
              }
            />
          ) : (
            <p style={{ color: 'var(--color-text-light)' }}>جميع المنتجات متوفرة بكميات كافية (5 قطع فأكثر).</p>
          )}
        </div>

      </div>

      {/* Search & Wishlist Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)', marginTop: 'var(--spacing-xl)' }}>
        
        {/* Most Wishlisted Products */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>المنتجات الأكثر في المفضلة ❤️</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
              {period === 'all' ? 'كل الأوقات' : period === 'today' ? 'اليوم' : period === '7d' ? 'آخر 7 أيام' : period === '30d' ? 'آخر 30 يوم' : 'آخر سنة'}
            </span>
          </div>

          {wishlistError ? (
            <div style={{ padding: '16px', backgroundColor: '#fff8e1', borderRadius: '8px', border: '1px solid #ffe082', color: '#856404', fontSize: '0.9rem', lineHeight: '1.5' }}>
              ⚠️ لتفعيل تتبع المفضلة، يرجى تشغيل كود SQL من ملف <code>analytics.sql</code> في Supabase SQL Editor.
            </div>
          ) : topWishlist.length > 0 ? (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                إجمالي الإضافات للمفضلة: <strong style={{ color: 'var(--color-primary-dark)' }}>{totalWishlistAdds}</strong>
              </div>
              <ExpandableContainer
                totalCount={topWishlist.length}
                initialChildren={
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {topWishlist.slice(0, 5).map((item, idx) => (
                      <li key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== Math.min(topWishlist.length, 5) - 1 ? '1px solid var(--color-border)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {item.image && (
                            <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          )}
                          <div>
                            <Link href={`/admin/products/${item.productId}/edit`} style={{ fontWeight: '500', color: 'var(--color-text)', textDecoration: 'none' }}>
                              {item.name}
                            </Link>
                            <div style={{ fontSize: '0.75rem', color: item.stock === 0 ? '#c62828' : 'var(--color-text-light)' }}>
                              {item.stock === 0 ? 'نفذت الكمية' : `المتبقي في المخزون: ${item.stock}`}
                            </div>
                          </div>
                        </div>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          backgroundColor: '#fceceb',
                          color: '#e74c3c'
                        }}>
                          {item.adds} إضافة ♥
                        </span>
                      </li>
                    ))}
                  </ul>
                }
                expandedChildren={
                  topWishlist.length > 5 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--color-border)' }}>
                      {topWishlist.slice(5).map((item, idx) => (
                        <li key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== topWishlist.length - 6 ? '1px solid var(--color-border)' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {item.image && (
                              <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            )}
                            <div>
                              <Link href={`/admin/products/${item.productId}/edit`} style={{ fontWeight: '500', color: 'var(--color-text)', textDecoration: 'none' }}>
                                {item.name}
                              </Link>
                              <div style={{ fontSize: '0.75rem', color: item.stock === 0 ? '#c62828' : 'var(--color-text-light)' }}>
                                {item.stock === 0 ? 'نفذت الكمية' : `المتبقي في المخزون: ${item.stock}`}
                              </div>
                            </div>
                          </div>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            backgroundColor: '#fceceb',
                            color: '#e74c3c'
                          }}>
                            {item.adds} إضافة ♥
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-light)' }}>لا توجد إضافات للمفضلة في هذه الفترة بعد.</p>
          )}
        </div>

        {/* Top Search Queries */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>الكلمات الأكثر بحثاً في المتجر 🔍</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
              {period === 'all' ? 'كل الأوقات' : period === 'today' ? 'اليوم' : period === '7d' ? 'آخر 7 أيام' : period === '30d' ? 'آخر 30 يوم' : 'آخر سنة'}
            </span>
          </div>

          {searchError ? (
            <div style={{ padding: '16px', backgroundColor: '#fff8e1', borderRadius: '8px', border: '1px solid #ffe082', color: '#856404', fontSize: '0.9rem', lineHeight: '1.5' }}>
              ⚠️ لتفعيل تتبع الكلمات الأكثر بحثاً، يرجى تشغيل كود SQL من ملف <code>analytics.sql</code> في Supabase SQL Editor.
            </div>
          ) : topSearches.length > 0 ? (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                إجمالي عمليات البحث: <strong style={{ color: 'var(--color-primary-dark)' }}>{totalSearches}</strong>
              </div>
              <ExpandableContainer
                totalCount={topSearches.length}
                initialChildren={
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {topSearches.slice(0, 5).map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== Math.min(topSearches.length, 5) - 1 ? '1px solid var(--color-border)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            backgroundColor: idx < 3 ? 'var(--color-primary)' : '#eee', 
                            color: idx < 3 ? 'white' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            {idx + 1}
                          </span>
                          <div>
                            <span style={{ fontWeight: '600' }}>"{item.query}"</span>
                            {item.lastSearched && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                آخر بحث: {formatTimeAgo(item.lastSearched)}
                              </div>
                            )}
                          </div>
                        </div>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          backgroundColor: '#e8f4fd',
                          color: '#1976d2'
                        }}>
                          {item.count} مرة
                        </span>
                      </li>
                    ))}
                  </ul>
                }
                expandedChildren={
                  topSearches.length > 5 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--color-border)' }}>
                      {topSearches.slice(5).map((item, idx) => (
                        <li key={idx + 5} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== topSearches.length - 6 ? '1px solid var(--color-border)' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              backgroundColor: '#eee', 
                              color: '#666',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              {idx + 6}
                            </span>
                            <div>
                              <span style={{ fontWeight: '600' }}>"{item.query}"</span>
                              {item.lastSearched && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                  آخر بحث: {formatTimeAgo(item.lastSearched)}
                                </div>
                              )}
                            </div>
                          </div>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            backgroundColor: '#e8f4fd',
                            color: '#1976d2'
                          }}>
                            {item.count} مرة
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-light)' }}>لا توجد عمليات بحث مسجلة في هذه الفترة بعد.</p>
          )}
        </div>

      </div>

      {/* Google Analytics Dashboard */}
      <div style={{ marginTop: 'var(--spacing-2xl)', backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>إحصائيات جوجل التفصيلية 📊</h2>
        <div style={{ width: '100%', height: '850px' }}>
          <iframe 
            src="https://datastudio.google.com/embed/reporting/abbced74-2123-47aa-8ac1-c70255d8aa13/page/1M" 
            frameBorder="0" 
            style={{ border: 0, width: '100%', height: '100%' }} 
            allowFullScreen 
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
          </iframe>
        </div>
      </div>
    </div>
  );
}
