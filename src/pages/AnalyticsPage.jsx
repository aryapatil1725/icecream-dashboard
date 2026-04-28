import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar, BarChart3, PieChart, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { analyticsAPI, ordersAPI } from "../services/api";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");
  const [stats, setStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [statsData, topProductsData, salesCategoryData, dailySalesData, ordersResponse] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getTopProducts(),
        analyticsAPI.getSalesByCategory(),
        analyticsAPI.getDailySales(),
        ordersAPI.getAll(1, 10)
      ]);
      
      const ordersData = ordersResponse.orders || [];

      setStats([
        {
          title: "Total Revenue",
          value: `₹${statsData.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          change: "+12.5%",
          trend: "up",
          icon: DollarSign,
          color: "brand",
          chart: [65, 75, 70, 85, 80, 95, 90],
        },
        {
          title: "Total Orders",
          value: statsData.total_orders.toString(),
          change: "+8.2%",
          trend: "up",
          icon: ShoppingCart,
          color: "purple",
          chart: [40, 55, 45, 60, 50, 70, 65],
        },
        {
          title: "Active Customers",
          value: statsData.total_customers.toString(),
          change: "+5.3%",
          trend: "up",
          icon: Users,
          color: "orange",
          chart: [50, 52, 48, 55, 53, 58, 56],
        },
        {
          title: "Products Sold",
          value: statsData.total_products.toString(),
          change: "-2.1%",
          trend: "down",
          icon: Package,
          color: "green",
          chart: [80, 75, 78, 70, 72, 68, 65],
        },
      ]);

      setTopProducts(topProductsData.map((product, index) => ({
        id: product.id,
        name: product.name,
        sold: product.orders_count || 0,
        revenue: `₹${(product.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        growth: index < 3 ? `+${15 - index * 3}%` : `-${index}%`
      })));

      const categoryColors = ['bg-brand-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500'];
      const totalRevenue = salesCategoryData.reduce((sum, cat) => sum + (cat.revenue || 0), 0);
      setSalesByCategory(salesCategoryData.map((cat, index) => ({
        category: cat.category || 'Other',
        value: totalRevenue > 0 ? Math.round((cat.revenue || 0) / totalRevenue * 100) : 0,
        color: categoryColors[index % categoryColors.length]
      })));

      setDailySales(dailySalesData);

      setRecentOrders(ordersData.slice(0, 4).map(order => ({
        id: order.id,
        customer: order.customer_name,
        product: order.product_name || 'Unknown',
        amount: `₹${order.total_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        status: order.status,
        time: formatRelativeTime(order.created_at)
      })));

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (timeStr) => {
    if (!timeStr) return 'Unknown';
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${diffDays} days ago`;
    } catch {
      return timeStr;
    }
  };

  const renderMiniChart = (data) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <svg width="120" height="40" viewBox="0 0 120 40" className="overflow-visible">
        <path
          d={`M0,${40 - ((data[0] - min) / range) * 30 + 5} ${data.map((val, i) => {
            const x = (i / (data.length - 1)) * 120;
            const y = 40 - ((val - min) / range) * 30 + 5;
            return `L${x},${y}`;
          }).join(" ")}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-current opacity-60"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 scoop bg-gradient-to-br from-brand-400 to-brand-600 animate-bounce mx-auto mb-4"></div>
            <p className="text-lg font-bold text-gray-700">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white border rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            <button className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all text-sm">
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 bg-white border rounded-lg hover:shadow-md transition-all"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center mb-3`}
              >
                <stat.icon className="w-5 h-5 text-brand-600" />
              </div>

              <p className="text-xs font-bold text-gray-500 mb-1">{stat.title}</p>
              <p className="text-xl font-bold text-gray-900 mb-2">{stat.value}</p>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-gray-400">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 bg-white border rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sales Overview</h2>
            <div className="h-48 flex items-end gap-2">
              {[40, 65, 55, 80, 70, 90, 75].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-brand-500 transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sales by Category</h2>
            <div className="space-y-3">
              {salesByCategory.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700">{item.category}</span>
                    <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 bg-white border rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Top Products</h2>
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{product.revenue}</p>
                    <p
                      className={`text-xs font-semibold ${
                        product.growth.startsWith("+") ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.growth}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                    {order.customer.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{order.customer}</p>
                    <p className="text-xs text-gray-500 truncate">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{order.amount}</p>
                    <p className="text-xs text-gray-500">{order.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-brand-500 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-semibold opacity-80">Growth Rate</span>
            </div>
            <p className="text-2xl font-bold mb-1">+24.5%</p>
            <p className="text-xs opacity-80 mb-3">vs last month</p>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "75%" }} />
            </div>
          </div>

          <div className="p-4 bg-purple-500 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-semibold opacity-80">Conversion</span>
            </div>
            <p className="text-2xl font-bold mb-1">3.2%</p>
            <p className="text-xs opacity-80 mb-3">visitors to customers</p>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "32%" }} />
            </div>
          </div>

          <div className="p-4 bg-orange-500 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-semibold opacity-80">Avg Order</span>
            </div>
            <p className="text-2xl font-bold mb-1">₹1,847</p>
            <p className="text-xs opacity-80 mb-3">per transaction</p>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "58%" }} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}