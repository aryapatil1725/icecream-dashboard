import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, IndianRupee } from "lucide-react";

export default function Stats() {
  const [stats, setStats] = useState([
    {
      title: "Total Revenue",
      value: "₹0",
      change: "+0%",
      trend: "up",
      icon: IndianRupee,
    },
    {
      title: "Total Orders",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Products",
      value: "0",
      change: "+0",
      trend: "up",
      icon: Package,
    },
    {
      title: "Customers",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Users,
    },
  ]);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/analytics/stats', {
        headers
      });
      const data = await response.json();

      
      setStats([
        {
          title: "Total Revenue",
          value: `₹${data.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          change: "+12.5%",
          trend: "up",
          icon: IndianRupee,
        },
        {
          title: "Total Orders",
          value: data.total_orders.toString(),
          change: "+8.2%",
          trend: "up",
          icon: ShoppingCart,
        },
        {
          title: "Products",
          value: data.total_products.toString(),
          change: `+${data.total_products}`,
          trend: "up",
          icon: Package,
        },
        {
          title: "Customers",
          value: data.total_customers.toString(),
          change: "+5.3%",
          trend: "up",
          icon: Users,
        },
      ]);
 

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
            <div className="w-14 h-14 bg-brand-200 rounded-2xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative bg-white rounded-3xl p-6 shadow-lg shadow-brand-100/50 hover:shadow-xl hover:shadow-brand-200/30 transition-all duration-500"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
              <stat.icon className="w-7 h-7 text-white" />
            </div>

            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-3">{stat.value}</p>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                  stat.trend === "up"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {stat.change}
              </div>
              <span className="text-xs text-gray-400">from last month</span>
            </div>
          </div>

          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-1000 ease-out group-hover:w-full"
              style={{ width: `${65 + Math.random() * 30}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

