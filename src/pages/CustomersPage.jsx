import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, User, Mail, Phone, X, ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";
import Layout from "../components/Layout";
import { customersAPI, ordersAPI } from "../services/api";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [query, setQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerOrders(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const data = await customersAPI.getAll(1, 100);
      setCustomers(data.customers || data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId) => {
    setLoadingOrders(true);
    try {
      const data = await ordersAPI.getAll(1, 100);
      const allOrders = data.orders || data;
      const customer = customers.find(c => c.id === customerId);
      const customerOrders = allOrders.filter(order => 
        customer && order.customer_name.toLowerCase() === customer.name.toLowerCase()
      );
      setCustomerOrders(customerOrders);
      setLoadingOrders(false);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, formData);
      } else {
        await customersAPI.create(formData);
      }

      fetchCustomers();
      setFormData({ name: "", email: "", phone: "" });
      setEditingCustomer(null);
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await customersAPI.delete(id);
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  const handleViewOrders = (customer) => {
    setSelectedCustomer(customer);
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

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase()) ||
      (customer.phone && customer.phone.includes(query))
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-20 h-20 scoop bg-gradient-to-br from-brand-400 to-brand-600 animate-bounce mx-auto mb-4"></div>
            <p className="text-xl font-bold text-brand-700">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700">Customers</h1>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {formOpen ? "Close" : "Add Customer"}
          </button>
        </div>

        {formOpen && (
          <div className="p-4 bg-brand-50 rounded-lg">
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                  required
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                  required
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all text-sm">
                {editingCustomer ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingCustomer(null);
                  setFormData({ name: "", email: "", phone: "" });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-600" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 bg-brand-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-3 hover:bg-brand-50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleViewOrders(customer)}
                      className="p-1 text-brand-600 hover:bg-brand-100 rounded"
                      title="View Orders"
                    >
                      <ShoppingBag className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-1 text-brand-600 hover:bg-brand-100 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{customer.name}</h3>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-3 h-3 text-brand-500 flex-shrink-0" />
                    <p className="text-gray-600 truncate">{customer.email}</p>
                  </div>

                  {customer.phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="w-3 h-3 text-brand-500 flex-shrink-0" />
                      <p className="text-gray-600">{customer.phone}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleViewOrders(customer)}
                  className="w-full mt-2 py-1.5 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-all"
                >
                  View Orders
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg font-bold text-gray-600">No customers found</p>
              <p className="text-sm text-gray-500 mt-1">
                {query ? "Try adjusting your search" : "Add your first customer to get started"}
              </p>
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="sticky top-0 bg-white border-b p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-brand-700">
                    {selectedCustomer.name}'s Orders
                  </h2>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {loadingOrders ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading...</p>
                  </div>
                ) : customerOrders.length > 0 ? (
                  <div className="space-y-2">
                    {customerOrders.map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div
                          key={order.id}
                          className="p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-900">#{order.id}</span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${statusInfo.bgClass}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Qty: {order.quantity}</span>
                            <span className="font-bold text-brand-700">₹{order.total_price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No orders found</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}