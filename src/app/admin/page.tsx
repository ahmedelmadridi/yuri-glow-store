import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatPrice } from '@/utils/format';
import Link from 'next/link';

import DateFilter from '@/components/DateFilter';
import { governorates } from '@/data/governorates';

export const revalidate = 0; // Disable caching for admin dashboard

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const resolvedParams = await searchParams;
  const period = resolvedParams.period || 'all';

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

  // Fetch store metrics (visits, add to cart, initiate checkout)
  const { data: metricsData } = await supabaseAdmin
    .from('store_metrics')
    .select('id, total_visits')
    .in('id', [1, 2, 3]);

  const metrics = {
    visits: metricsData?.find(m => m.id === 1)?.total_visits || 0,
    addToCart: metricsData?.find(m => m.id === 2)?.total_visits || 0,
    initiateCheckout: metricsData?.find(m => m.id === 3)?.total_visits || 0,
  };

  if (ordersError || productsError) {
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
      const courierFee = governorates.find(g => g.name === order.governorate)?.shippingCost || 0;
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
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

  // Inventory Alerts (Products with stock <= 5)
  const lowStockProducts = products?.filter(p => (p.stock_quantity || 0) <= 5) || [];

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xs)' }}>
            <h3 style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '0.95rem' }}>إجمالي الزيارات 👁️</h3>
            <span style={{ fontSize: '0.7rem', color: '#666', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '6px' }}>تراكمي</span>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0 }}>{metrics.visits}</p>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', display: 'block', marginTop: '8px' }}>
            إجمالي الزيارات منذ التدشين
          </span>
        </div>

        {/* Add To Cart Metric */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xs)' }}>
            <h3 style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '0.95rem' }}>إضافة للسلة 🛒</h3>
            <span style={{ fontSize: '0.7rem', color: '#666', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '6px' }}>تراكمي</span>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e67e22', margin: 0 }}>{metrics.addToCart}</p>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', display: 'block', marginTop: '8px' }}>
            مرات الإضافة للسلة التراكمية
          </span>
        </div>

        {/* Initiate Checkout Metric */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xs)' }}>
            <h3 style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '0.95rem' }}>بدء الشراء 💳</h3>
            <span style={{ fontSize: '0.7rem', color: '#666', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '6px' }}>تراكمي</span>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#9b59b6', margin: 0 }}>{metrics.initiateCheckout}</p>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', display: 'block', marginTop: '8px' }}>
            محاولات الشراء في صفحة الدفع
          </span>
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
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {bestSellers.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx !== bestSellers.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <span style={{ fontWeight: '500' }}>{item.name}</span>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-light)' }}>
                    <span>{item.quantity} قطعة</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatPrice(item.revenue)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--color-text-light)' }}>لا توجد مبيعات بعد.</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem', color: '#e74c3c' }}>تنبيهات المخزون (أوشك على النفاذ) ⚠️</h2>
          {lowStockProducts.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {lowStockProducts.map((product, idx) => (
                <li key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== lowStockProducts.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
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
          ) : (
            <p style={{ color: 'var(--color-text-light)' }}>جميع المنتجات متوفرة بكميات كافية.</p>
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
