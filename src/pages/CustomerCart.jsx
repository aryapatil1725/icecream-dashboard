  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import { ShoppingCart, Trash2, Plus, Minus, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw, ShoppingBag } from "lucide-react";

  export default function CustomerCart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: "", message: "" });
    const [clearConfirm, setClearConfirm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      loadCart();
    }, []);

    const showNotification = (type, message) => {
      setNotification({ show: true, type, message });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    };

    const loadCart = () => {
      const savedCart = localStorage.getItem("customerCart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    };

    const updateQuantity = (id, delta) => {
      const updated = cart.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      setCart(updated);
      localStorage.setItem("customerCart", JSON.stringify(updated));
    };

    const removeFromCart = (id) => {
      const itemToRemove = cart.find((item) => item.id === id);
      const updated = cart.filter((item) => item.id !== id);
      setCart(updated);
      localStorage.setItem("customerCart", JSON.stringify(updated));
      showNotification("success", `${itemToRemove?.name || "Item"} removed from cart`);
    };

    const clearCart = () => {
      setCart([]);
      localStorage.removeItem("customerCart");
      setClearConfirm(false);
      showNotification("success", "Cart cleared successfully");
    };

    const handleCheckout = async () => {
      if (cart.length === 0) {
        showNotification("error", "Your cart is empty!");
        return;
      }

      const email = localStorage.getItem("customerEmail");
      const name = localStorage.getItem("customerName") || "Guest";

      if (!email) {
        showNotification("error", "Please login to continue");
        setTimeout(() => navigate("/Login"), 1500);
        return;
      }

      setLoading(true);

      const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const tax = Math.round(total * 0.18); // 18% GST
      const deliveryFee = total > 500 ? 0 : 50;
      const grandTotal = total + tax + deliveryFee;

      const order = {
        id: Date.now(),
        items: cart,
        total,
        tax,
        deliveryFee,
        grandTotal,
        customerEmail: email,
        customerName: name,
        date: new Date().toISOString(),
      };

      // Save locally
      const key = `customerOrders_${email}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([...existing, order]));

      // Send to backend
      try {
        for (const item of cart) {
          await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customer_name: name,
              customer_email: email,
              product_id: item.id,
              quantity: item.quantity,
              total_price: item.price * item.quantity,
            }),
          });
        }
        showNotification("success", "Order placed successfully! 🎉");
        setTimeout(() => {
          clearCart();
          navigate("/customer/orders");
        }, 1500);
      } catch (error) {
        showNotification("warning", "Order saved locally (backend issue)");
        setLoading(false);
      }
    };

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    const tax = Math.round(total * 0.18);
    const deliveryFee = total > 500 ? 0 : 50;
    const savings = cart.reduce((s, i) => s + (i.price * 2) * i.quantity, 0);
    const grandTotal = total + tax + deliveryFee;

    return (
      <div className="min-h-screen bg-white">

        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slideIn ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : notification.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Continue Shopping</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
              <p className="text-gray-500">{count} {count === 1 ? "item" : "items"} in your cart</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {cart.length === 0 ? (
                  <div className="text-center py-20 px-6">
                    <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 mb-6">Looks like you haven't added any delicious ice creams yet!</p>
                    <button
                      onClick={() => navigate("/customer/dashboard")}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {cart.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-6 hover:bg-gray-50 transition-colors animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex gap-6">
                          {/* Image */}
                          <div className="w-36 h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-inner overflow-hidden">
                            {item.image ? (
                              <img
                                src={`http://localhost:5000${item.image}`}
                                alt={item.name}
                                className="h-full w-full object-contain hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <ShoppingBag className="w-16 h-16 text-gray-300" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                              <p className="text-gray-500 text-sm mt-1 capitalize">{item.category}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  In Stock
                                </span>
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                  FREE Delivery
                                </span>
                              </div>
                            </div>

                            {/* Quantity and Price */}
                            <div className="flex justify-between items-end mt-4">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <span className="px-4 py-2 font-semibold text-gray-800 min-w-[50px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="p-2 hover:bg-gray-100 transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-800">₹{item.price * item.quantity}</p>
                                <p className="text-sm text-gray-400 line-through">₹{item.price * 3 * item.quantity}</p>
                                <p className="text-sm text-green-600 font-medium">
                                  Save ₹{(item.price * 2) * item.quantity}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Savings Banner */}
              {cart.length > 0 && savings > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="bg-green-500 text-white rounded-full p-2">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">You're saving ₹{savings} on this order!</p>
                    <p className="text-sm text-green-600">Great job adding items to your cart</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cart.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({count} items)</span>
                      <span className="font-medium">₹{total}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (18% GST)</span>
                      <span className="font-medium">₹{tax}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    {total < 500 && (
                      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                        Add ₹{500 - total} more for FREE delivery!
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-blue-600">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo code"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Proceed to Checkout
                      </>
                    )}
                  </button>

                  {/* Clear Cart Button */}
                  {!clearConfirm ? (
                    <button
                      onClick={() => setClearConfirm(true)}
                      className="w-full mt-4 text-red-500 hover:text-red-700 text-sm font-medium py-2 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Cart
                    </button>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={clearCart}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        Yes, Clear
                      </button>
                      <button
                        onClick={() => setClearConfirm(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Security Note */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Secure checkout powered by SSL</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }
