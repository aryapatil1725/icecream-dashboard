import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IceCream, 
  ShoppingCart, 
  ShoppingBag, 
  User, 
  LogOut, 
  Search, 
  Plus,
  Heart,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export default function CustomerDashboard() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [favoriteProduct, setFavoriteProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();

  const customerName = localStorage.getItem("customerName") || "Guest";
  const customerEmail = localStorage.getItem("customerEmail");
  
  useEffect(() => {
    console.log("CustomerDashboard loaded");
    console.log("Customer email:", customerEmail);
    console.log("Customer name:", customerName);
  }, [customerEmail, customerName]);

  useEffect(() => {
    fetchProducts();
    loadCart();
    fetchOrdersCount();
  }, []);

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products || data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem("customerCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const fetchOrdersCount = async () => {
    if (!customerEmail) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/orders/customer/${customerEmail}`);
      let backendOrders = [];
      
      if (response.ok) {
        backendOrders = await response.json();
      }
      
      const customerOrdersKey = `customerOrders_${customerEmail}`;
      const localStorageOrders = JSON.parse(localStorage.getItem(customerOrdersKey) || "[]");
      
      const allOrders = [...backendOrders];
      localStorageOrders.forEach(localOrder => {
        if (!allOrders.find(backendOrder => backendOrder.id === localOrder.id)) {
          allOrders.push(localOrder);
        }
      });
      
      setOrdersCount(allOrders.length);
      
      const total = allOrders.reduce((sum, order) => {
        const orderTotal = order.total || order.total_price || 0;
        return sum + orderTotal;
      }, 0);
      setTotalSpent(total);
      
      const productCounts = {};
      allOrders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
          });
        } else {
          const productName = order.product_name || `Product #${order.product_id}`;
          productCounts[productName] = (productCounts[productName] || 0) + order.quantity;
        }
      });
      
      const favorite = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
      if (favorite) {
        setFavoriteProduct({ name: favorite[0], count: favorite[1] });
      }
      
    } catch (error) {
      console.error("Error fetching orders count:", error);
      
      if (customerEmail) {
        const customerOrdersKey = `customerOrders_${customerEmail}`;
        const localStorageOrders = JSON.parse(localStorage.getItem(customerOrdersKey) || "[]");
        setOrdersCount(localStorageOrders.length);
        const total = localStorageOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        setTotalSpent(total);
      }
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem("customerCart", JSON.stringify(newCart));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("customerEmail");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerCart");
    setShowLogoutDialog(false);
    navigate("/Login");
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 scoop bg-gradient-to-br from-brand-400 to-brand-600 animate-bounce mx-auto mb-4"></div>
          <p className="text-lg font-bold text-brand-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <IceCream className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-brand-700">Ice Cream Shop</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/customer/cart")}
                className="relative p-2 text-gray-600 hover:text-brand-600"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate("/customer/orders")}
                className="p-2 text-gray-600 hover:text-brand-600"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/customer/profile")}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-500 text-white rounded-lg font-semibold text-sm"
              >
                <User className="w-4 h-4" />
                {customerName}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Logout Confirmation</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? Your cart will be cleared.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div 
        className="relative py-16 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/icecream-hero.jpg')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/80 to-brand-700/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
            Welcome, {customerName}!
          </h2>
          <p className="text-white/95 text-base mb-6 drop-shadow-md">
            Discover our delicious ice cream flavors
          </p>
          
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-300" />
            <input
              type="text"
              placeholder="Search flavors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/95 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-xl font-bold text-brand-700 mb-4">
          Our Ice Creams 🍨
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-brand-50 transition-all duration-300"
              >
                <div className="relative aspect-square bg-brand-50 mb-2 overflow-hidden">
                  {product.image ? (
                    <img
                      src={`http://localhost:5000${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-400">
                      <IceCream className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1 truncate">{product.name}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-brand-700">₹{product.price}</span>
                    <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                  </div>
                  
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
ground                    Add
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg font-bold text-gray-600">No ice creams found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-xl font-bold text-brand-700 mb-4">
          Your Summary 📊
        </h3>
        
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] px-4 py-3 bg-brand-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-brand-600" />
              <div>
                <p className="text-xs text-gray-600 font-semibold">Total Spent</p>
                <p className="text-lg font-bold text-gray-900">₹{totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] px-4 py-3 bg-brand-500 rounded-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-white" />
              <div>
                <p className="text-xs text-white/90 font-semibold">Favorite</p>
                <p className="text-sm font-bold text-white truncate">
                  {favoriteProduct ? favoriteProduct.name : "None"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] px-4 py-3 bg-brand-100 rounded-lg">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <div>
                <p className="text-xs text-gray-600 font-semibold">Orders</p>
                <p className="text-lg font-bold text-gray-900">{ordersCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 Ice Cream Shop. 🍦
          </p>
        </div>
      </footer>
    </div>
  );
}