import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Package, ShoppingCart, Users, TrendingUp, Clock, Activity, AlertCircle, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import Stats from "../components/Stats";
import { analyticsAPI } from "../services/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_customers: 0,
    pending_orders: 0
  });

  useEffect(() => {
    fetchRecentActivity();
    fetchStats();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const data = await analyticsAPI.getRecentActivity();
      
      // Format time strings to relative time
      const formattedActivities = data.map(activity => ({
        ...activity,
        time: formatRelativeTime(activity.time)
      }));
      
      setRecentActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await analyticsAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatRelativeTime = (timeStr) => {
    if (timeStr === 'Just now') return timeStr;
    
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

  const quickActions = [
    {
      icon: Package,
      label: "Add Product",
      description: "Create new product listing",
      onClick: () => navigate("/products"),
    },
    {
      icon: ShoppingCart,
      label: "View Orders",
      description: "Manage customer orders",
      onClick: () => navigate("/orders"),
    },
    {
      icon: Users,
      label: "Add Customer",
      description: "Register new customer",
      onClick: () => navigate("/customers"),
    },
    {
      icon: Activity,
      label: "Analytics",
      description: "View detailed reports",
      onClick: () => navigate("/analytics"),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full text-sm font-bold text-gray-800">
                Dashboard Overview
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white">
                <TrendingUp className="w-4 h-4" />
                <span>+24.5% Growth</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
              Welcome back, Manager! 🍦
              <Sparkles className="w-8 h-8 text-brand-50" />
            </h1>
            <p className="text-white/90 max-w-2xl text-lg mb-6">
              Here's what's happening with your ice cream business today. Use quick actions to manage your store efficiently.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-3 bg-white text-brand-700 rounded-2xl font-bold hover:bg-brand-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                View Products
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <Stats />

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brand-700">Quick Actions</h2>
                <button className="text-sm text-brand-600 hover:text-brand-800 font-bold">
                  View All
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="group relative p-6 rounded-2xl bg-brand-50 hover:bg-brand-100 transition-all duration-500 text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-1">{action.label}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-3xl p-6 shadow-xl h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brand-700">Recent Activity</h2>
                <Clock className="w-5 h-5 text-brand-600" />
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-brand-50 transition-colors duration-200 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        activity.status === "success"
                          ? "bg-gradient-to-br from-brand-400 to-brand-600 text-white"
                          : activity.status === "warning"
                          ? "bg-brand-200 text-brand-800"
                          : "bg-brand-300 text-white"
                      }`}
                    >
                      {activity.status === "success" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : activity.status === "warning" ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 text-sm font-bold text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-2xl transition-all duration-200">
                View All Activity
              </button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-6 h-6 opacity-90" />
              <span className="text-sm font-bold opacity-90">Inventory</span>
            </div>
            <p className="text-3xl font-bold mb-2">{stats.total_products} Products</p>
            <p className="text-sm opacity-90 mb-4">Available in store</p>
            <button
              onClick={() => navigate("/products")}
              className="w-full py-3 bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-xl font-bold hover:bg-white/80 transition-all duration-300 text-gray-800"
            >
              Manage Products
            </button>
          </div>

          <div className="bg-gradient-to-br from-brand-400 to-brand-500 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-6 h-6 opacity-90" />
              <span className="text-sm font-bold opacity-90">Orders</span>
            </div>
            <p className="text-3xl font-bold mb-2">{stats.total_orders} Orders</p>
            <p className="text-sm opacity-90 mb-4">{stats.pending_orders} pending</p>
            <button
              onClick={() => navigate("/orders")}
              className="w-full py-3 bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-xl font-bold hover:bg-white/80 transition-all duration-300 text-gray-800"
            >
              View Orders
            </button>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-6 h-6 opacity-90" />
              <span className="text-sm font-bold opacity-90">Customers</span>
            </div>
            <p className="text-3xl font-bold mb-2">{stats.total_customers} Customers</p>
            <p className="text-sm opacity-90 mb-4">Registered users</p>
            <button
              onClick={() => navigate("/customers")}
              className="w-full py-3 bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-xl font-bold hover:bg-white/80 transition-all duration-300 text-gray-800"
            >
              Manage Customers
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}