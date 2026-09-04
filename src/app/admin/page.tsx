import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatPrice } from '@/utils/format';
import Link from 'next/link';

export const revalidate = 0; // Disable caching for admin dashboard

export default async function AdminDashboard() {
  // Fetch orders with their items and related products
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      total_amount,
      shipping_cost,
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

  // Fetch products for inventory alerts
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, name, stock_quantity, image')
    .order('stock_quantity', { ascending: true });

  if (ordersError || productsError) {
    return <div>خطأ في جلب البيانات</div>;
  }

  // Basic Stats
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  
  const validOrders = orders?.filter(o => o.status !== 'cancelled') || [];
  const revenue = validOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const averageOrderValue = validOrders.length > 0 ? revenue / validOrders.length : 0;

  // Calculate Net Profit
  // Net Profit = (Revenue - Shipping) - (Total Cost of Items)
  // Assuming shipping_cost is exactly what we pay the courier, so it's a pass-through cost.
  let totalCostOfGoods = 0;
  let totalShippingCost = 0;

  const productSalesCount: Record<string, { name: string, quantity: number, revenue: number }> = {};

  validOrders.forEach(order => {
    totalShippingCost += (order.shipping_cost || 0);
    
    order.order_items.forEach((item: any) => {
      const quantity = item.quantity;
      const price = item.price_at_time_of_order;
      const cost = item.products?.cost_price || 0;
      
      totalCostOfGoods += (cost * quantity);

      // Best selling products tracking
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

  const netProfit = revenue - totalShippingCost - totalCostOfGoods;

  // Sort best selling products
  const bestSellers = Object.values(productSalesCount)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Inventory Alerts (Products with stock <= 5)
  const lowStockProducts = products?.filter(p => (p.stock_quantity || 0) <= 5) || [];

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)' }}>نظرة عامة وإحصائيات</h1>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-2xl)' }}>
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '1rem' }}>إجمالي المبيعات</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{formatPrice(revenue)}</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '1rem' }}>صافي الربح</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#27ae60' }}>{formatPrice(netProfit)}</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '1rem' }}>إجمالي الطلبات</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>{totalOrders}</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-xs)', fontSize: '1rem' }}>متوسط سعر الطلب</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>{formatPrice(averageOrderValue)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
        
        {/* Best Sellers */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>المنتجات الأكثر مبيعاً 🏆</h2>
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
    </div>
  );
}
