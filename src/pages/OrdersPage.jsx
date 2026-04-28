import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Clock, CheckCircle, XCircle, Package, X } from "lucide-react";
import Layout from "../components/Layout";
import { ordersAPI, productsAPI } from "../services/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("");
  const [formData, setFormData] = useState({ customer_name: "", product_id: "", quantity: "", total_price: "", status: "pending" });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll(1, 100);
      setOrders(data.orders || data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll(1, 100);
      setProducts(data.products || data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const calculateTotal = (productId, quantity) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !quantity) return "";
    return (product.price * quantity).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer_name: formData.customer_name,
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
        total_price: formData.total_price || calculateTotal(formData.product_id, formData.quantity),
        status: formData.status || "pending",
      };

      if (editingOrder) {
        await ordersAPI.update(editingOrder.id, payload);
      } else {
        await ordersAPI.create(payload);
      }

      fetchOrders();
      setFormData({ customer_name: "", product_id: "", quantity: "", total_price: "", status: "pending" });
      setEditingOrder(null);
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormOpen(true);
    setFormData({
      customer_name: order.customer_name,
      product_id: order.product_id,
      quantity: order.quantity,
      total_price: order.total_price,
      status: order.status || "pending",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await ordersAPI.delete(id);
        fetchOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle,
          bgClass: "bg-brand-500 text-white",
        };
      case "processing":
        return {
          label: "Processing",
          icon: Clock,
          bgClass: "bg-brand-200 text-brand-800",
        };
      default:
        return {
          label: "Pending",
          icon: XCircle,
          bgClass: "bg-gray-200 text-gray-800",
        };
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const product = products.find((p) => p.id === order.product_id);
      const matchesQuery =
        order.customer_name.toLowerCase().includes(query.toLowerCase()) ||
        (product && product.name.toLowerCase().includes(query.toLowerCase())) ||
        order.id.toString().includes(query);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesCustomer = customerFilter === "" || order.customer_name === customerFilter;
      return matchesQuery && matchesStatus && matchesCustomer;
    });
  }, [orders, products, query, statusFilter, customerFilter]);

  const uniqueCustomers = useMemo(() => {
    const customers = new Set(orders.map(order => order.customer_name));
    return Array.from(customers).sort();
  }, [orders]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 scoop bg-gradient-to-br from-brand-400 to-brand-600 animate-bounce mx-auto mb-4"></div>
            <p className="text-lg font-bold text-gray-700">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {formOpen ? "Close" : "Add Order"}
          </button>
        </div>

        {formOpen && (
          <div className="p-4 bg-brand-50 rounded-lg">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Customer name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => {
                      const productId = parseInt(e.target.value, 10) || "";
                      setFormData({
                        ...formData,
                        product_id: productId,
                        total_price: calculateTotal(productId, formData.quantity),
                      });
                    }}
                    className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    placeholder="1"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value, 10) || "";
                      setFormData({
                        ...formData,
                        quantity,
                        total_price: calculateTotal(formData.product_id, quantity),
                      });
                    }}
                    className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {formData.total_price && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Total:</span>
                  <span className="text-lg font-bold text-brand-700">₹{formData.total_price}</span>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 text-sm">
                  {editingOrder ? "Update" : "Create"}
                </button>
                {editingOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOrder(null);
                      setFormData({ customer_name: "", product_id: "", quantity: "", total_price: "", status: "pending" });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-600" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 bg-brand-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
          >
            <option value="">All Customers</option>
            {uniqueCustomers.map(customer => (
              <option key={customer} value={customer}>{customer}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const product = products.find((p) => p.id === order.product_id);
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={order.id} className="p-3 bg-white border rounded-lg hover:bg-brand-50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-bold text-gray-900">#{order.id}</span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${statusInfo.bgClass}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      <button onClick={() => handleEdit(order)} className="p-0.5 text-brand-600 hover:bg-brand-50 rounded">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="p-0.5 text-rose-600 hover:bg-rose-50 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-brand-500 flex-shrink-0" />
                      <p className="text-xs font-bold text-gray-900 truncate flex-1">{product?.name || "Unknown"}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-600 font-semibold">Customer:</span>
                      <span className="text-xs font-bold text-gray-900 truncate flex-1">{order.customer_name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-600">Qty: {order.quantity}</span>
                      <span className="text-sm font-bold text-brand-700">₹{order.total_price}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full mt-2 py-1 bg-brand-500 text-white rounded text-[10px] font-semibold hover:bg-brand-600 transition-all"
                  >
                    View Details
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg font-bold text-gray-600">No orders found</p>
              <p className="text-sm text-gray-500 mt-1">
                {query || statusFilter !== "all" || customerFilter !== ""
                  ? "Try adjusting your search or filters"
                  : "Add your first order to get started"}
              </p>
            </div>
          )}
        </div>


        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-center mb-4">
                  {(() => {
                    const statusInfo = getStatusInfo(selectedOrder.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusInfo.bgClass}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.label}
                      </span>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Customer Information</h3>
                    <p className="text-sm font-bold text-gray-900">{selectedOrder.customer_name}</p>
                  </div>

                  <div className="p-3 bg-brand-50 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Product Details</h3>
                    {(() => {
                      const product = products.find((p) => p.id === selectedOrder.product_id);
                      return (
                        <>
                          <p className="text-sm font-bold text-gray-900">{product?.name || "Unknown"}</p>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div>
                              <p className="text-xs text-gray-600">Quantity</p>
                              <p className="text-sm font-bold text-gray-900">{selectedOrder.quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Price per Unit</p>
                              <p className="text-sm font-bold text-gray-900">₹{product?.price || "0.00"}</p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="p-4 bg-brand-500 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold opacity-90">Total Amount</p>
                        <p className="text-2xl font-bold mt-1">₹{selectedOrder.total_price}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      handleEdit(selectedOrder);
                    }}
                    className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 text-sm"
                  >
                    Edit Order
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}