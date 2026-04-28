import { useState, useEffect } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ customer_name: '', product_id: '', quantity: '', total_price: '', status: 'pending' });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = () => {
    fetch('http://localhost:5000/api/orders')
      .then(response => response.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      });
  };

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  };

  const calculateTotal = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (!product || !quantity) return '';
    return (product.price * quantity).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingOrder ? 'PUT' : 'POST';
    const url = editingOrder ? `http://localhost:5000/api/orders/${editingOrder.id}` : 'http://localhost:5000/api/orders';

    const payload = {
      customer_name: formData.customer_name,
      product_id: Number(formData.product_id),
      quantity: Number(formData.quantity),
      total_price: formData.total_price || calculateTotal(formData.product_id, formData.quantity),
      status: formData.status || 'pending'
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(() => {
      fetchOrders();
      setFormData({ customer_name: '', product_id: '', quantity: '', total_price: '', status: 'pending' });
      setEditingOrder(null);
    })
    .catch(error => console.error('Error saving order:', error));
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormOpen(true);
    setFormData({
      customer_name: order.customer_name,
      product_id: order.product_id,
      quantity: order.quantity,
      total_price: order.total_price,
      status: order.status || 'pending'
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      fetch(`http://localhost:5000/api/orders/${id}`, { method: 'DELETE' })
      .then(() => fetchOrders())
      .catch(error => console.error('Error deleting order:', error));
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-lg shadow-pink-200/50">
        <div className="text-center py-10">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg shadow-pink-200/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-2xl font-semibold text-gray-900">Orders</h3>
        <button
          type="button"
          onClick={() => setFormOpen((open) => !open)}
          className="rounded-2xl bg-fuchsia-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-700"
        >
          {formOpen || editingOrder ? 'Hide order form' : 'Open order form'}
        </button>
      </div>

      {(formOpen || editingOrder) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-pink-50 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            className="rounded-xl border border-gray-200 px-3 py-2"
            required
          />
          <select
            value={formData.product_id}
            onChange={(e) => {
              const productId = parseInt(e.target.value, 10) || '';
              setFormData({
                ...formData,
                product_id: productId,
                total_price: calculateTotal(productId, formData.quantity)
              });
            }}
            className="rounded-xl border border-gray-200 px-3 py-2"
            required
          >
            <option value="">Select Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) => {
              const quantity = parseInt(e.target.value, 10) || '';
              setFormData({
                ...formData,
                quantity,
                total_price: calculateTotal(formData.product_id, quantity)
              });
            }}
            className="rounded-xl border border-gray-200 px-3 py-2"
            required
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="rounded-xl border border-gray-200 px-3 py-2"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="number"
            placeholder="Total Price"
            value={formData.total_price}
            readOnly
            className="rounded-xl border border-gray-200 px-3 py-2 bg-gray-50"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700">
            {editingOrder ? 'Update Order' : 'Add Order'}
          </button>
          {editingOrder && (
            <button
              type="button"
              onClick={() => {
                setEditingOrder(null);
                setFormOpen(false);
                setFormData({ customer_name: '', product_id: '', quantity: '', total_price: '', status: 'pending' });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] divide-y divide-gray-200 text-left text-sm">
          <thead>
            <tr className="bg-pink-50 text-gray-600">
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length > 0 ? (
              orders.map((order) => {
                const product = products.find(p => p.id === order.product_id);
                return (
                  <tr key={order.id} className="transition hover:bg-pink-50">
                    <td className="px-4 py-4 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-4 py-4 text-gray-600">{order.customer_name}</td>
                    <td className="px-4 py-4 text-gray-900">{product ? product.name : 'Unknown'}</td>
                    <td className="px-4 py-4 text-gray-700">{order.quantity}</td>
                    <td className="px-4 py-4 text-gray-900">₹{order.total_price}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleEdit(order)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                      <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={7}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}