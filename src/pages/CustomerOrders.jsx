import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  ArrowLeft, 
  IceCream, 
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Calendar
} from "lucide-react";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const customerEmail = localStorage.getItem("customerEmail");
    
    if (!customerEmail) {
      console.error("No customer email found. Please login.");
      navigate("/Login");
      return;
    }
    
    try {
      // Fetch orders from backend (already filtered by customer email)
      const response = await fetch(`http://localhost:5000/api/orders/customer/${customerEmail}`);
      if (response.ok) {
        const backendOrders = await response.json();
        
        // Map backend orders to display format
        const formattedOrders = backendOrders.map((order) => ({
          id: order.id,
          items: [{
            id: order.id,
            name: order.product_name || `Product #${order.product_id}`,
            image: order.product_image,
            price: (order.total_price / order.quantity).toFixed(2),
            quantity: order.quantity
          }],
          total: order.total_price,
          customerEmail: order.customer_email,
          date: order.created_at || new Date().toISOString(),
          status: order.status
        }));

        // Load from customer-specific localStorage for historical orders
        const customerOrdersKey = `customerOrders_${customerEmail}`;
        const localStorageOrders = JSON.parse(localStorage.getItem(customerOrdersKey) || "[]");
        
        // Merge orders, removing duplicates by ID
        const mergedOrders = [...formattedOrders];
        localStorageOrders.forEach(localOrder => {
          if (!mergedOrders.find(backendOrder => backendOrder.id === localOrder.id)) {
            mergedOrders.push(localOrder);
          }
        });
        
        // Sort by date (newest first)
        mergedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setOrders(mergedOrders);
      } else {
        // Fallback to customer-specific localStorage only
        const customerOrdersKey = `customerOrders_${customerEmail}`;
        const savedOrders = JSON.parse(localStorage.getItem(customerOrdersKey) || "[]");
        setOrders(savedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Fallback to customer-specific localStorage
      const customerOrdersKey = `customerOrders_${customerEmail}`;
      const savedOrders = JSON.parse(localStorage.getItem(customerOrdersKey) || "[]");
      setOrders(savedOrders);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-emerald-100 text-emerald-700";
      case "processing":
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "processing":
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = orders.filter(order => 
    order.status === "completed" || order.status === "delivered"
  ).length;

  return (
    <div className="min-h-screen bg-white">

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/customer/dashboard")}
                className="p-2 hover:bg-brand-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-brand-600" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <IceCream className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                My Orders
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-200 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-brand-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedOrders}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-300 flex items-center justify-center">
                <Package className="w-6 h-6 text-brand-800" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{totalSpent}</p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders. Start shopping now!</p>
            <button
              onClick={() => navigate("/customer/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-semibold hover:from-brand-600 hover:to-brand-700 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        Order #{order.id}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(order.date)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img
                                src={`http://localhost:5000${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <IceCream className="w-8 h-8 text-brand-300" />
                            )}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-gray-600">
                    <span className="font-medium">Total Amount:</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                    ₹{order.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}