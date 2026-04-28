import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IceCream, 
  ShoppingCart,
  ShoppingBag,
  User,
  Search,
  Plus,
  ArrowRight,
  Star,
  Clock,
  Truck
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => {
        const allProducts = data.products || data || [];
        setProducts(allProducts);
        setFeaturedProducts(allProducts.slice(0, 4));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Header */}
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
                onClick={() => navigate("/Login")}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all"
              >
                <User className="w-4 h-4" />
                Login
              </button>
              <button
                onClick={() => navigate("/Login")}
                className="px-4 py-2 border-2 border-brand-500 text-brand-600 rounded-lg font-semibold hover:bg-brand-50 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-700 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Welcome to Ice Cream Shop! 🍦
          </h2>
          <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
            Discover our delicious handcrafted ice creams made with premium ingredients. Order now and enjoy the sweet taste of happiness!
          </p>
          
          <div className="max-w-md mx-auto relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-300" />
            <input
              type="text"
              placeholder="Search your favorite flavors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/95 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all text-lg"
            />
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/Login")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-brand-600 rounded-lg font-bold hover:bg-brand-50 transition-all shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Start Shopping
            </button>
            <button
              onClick={() => navigate("/Login")}
              className="flex items-center gap-2 px-6 py-3 bg-brand-400 text-white rounded-lg font-bold hover:bg-brand-300 transition-all"
            >
              View Menu
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-gradient-to-br from-brand-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Fast Delivery</h3>
            </div>
            <p className="text-gray-600 text-sm">Get your ice cream delivered fresh within 30 minutes</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-brand-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Premium Quality</h3>
            </div>
            <p className="text-gray-600 text-sm">Made with fresh, natural ingredients and love</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-brand-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">24/7 Service</h3>
            </div>
            <p className="text-gray-600 text-sm">Order anytime, we're always ready to serve you</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-brand-700">
            Featured Flavors ⭐
          </h3>
          <button
            onClick={() => navigate("/Login")}
            className="flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-all"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <div 
              key={product.id} 
              className="hover:bg-purple-100 transition-all duration-300 rounded-2xl p-2 cursor-pointer"
            >
              <div className="relative aspect-square bg-brand-100 mb-3 overflow-hidden rounded-2xl">
                {product.image ? (
                  <img
                    src={`http://localhost:5000${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-400">
                    <IceCream className="w-12 h-12 opacity-50" />
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">{product.name}</h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-brand-700">₹{product.price}</span>
                  <span className="text-xs text-gray-500">In Stock</span>
                </div>
                
                <button
                  onClick={() => navigate("/Login")}
                  className="w-full py-2.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold text-brand-700 mb-6">
          All Our Ice Creams 🍨
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="hover:bg-purple-100 transition-all duration-300 rounded-2xl p-2 cursor-pointer"
              >
                <div className="relative aspect-square bg-brand-100 mb-2 overflow-hidden rounded-2xl">
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
                    onClick={() => navigate("/Login")}
                    disabled={product.stock === 0}
                    className="w-full py-2 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add
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

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-8 md:p-12 text-center shadow-xl">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Indulge? 🎉
          </h3>
          <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of happy customers and experience the best ice cream in town. Sign up now and get 10% off your first order!
          </p>
          <button
            onClick={() => navigate("/Login")}
            className="px-8 py-4 bg-white text-brand-600 rounded-lg font-bold hover:bg-brand-50 transition-all shadow-lg text-lg"
          >
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                  <IceCream className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-lg font-bold text-brand-700">Ice Cream Shop</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Premium handcrafted ice creams delivered fresh to your door.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-3">Quick Links</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-brand-600 transition-all">Home</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-all">About Us</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-all">Menu</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-all">Contact</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-3">Contact</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>📍 123 Ice Cream Lane</li>
                <li>📞 +1 234 567 890</li>
                <li>✉️ info@icecreamshop.com</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-3">Hours</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Mon - Fri: 10 AM - 10 PM</li>
                <li>Sat - Sun: 9 AM - 11 PM</li>
                <li>Delivery: 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6 text-center">
            <p className="text-gray-600 text-sm">
              © 2024 Ice Cream Shop. All rights reserved. 🍦
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}