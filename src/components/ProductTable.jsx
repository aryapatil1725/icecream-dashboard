import { useMemo, useState, useEffect } from "react";
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";

const styles = `
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

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.4s ease-out forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.4s ease-out forwards;
  }

  .animate-pulse-subtle {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .product-row {
    animation: fadeIn 0.6s ease-out forwards;
  }

  .product-row:nth-child(1) { animation-delay: 0.1s; }
  .product-row:nth-child(2) { animation-delay: 0.2s; }
  .product-row:nth-child(3) { animation-delay: 0.3s; }
  .product-row:nth-child(4) { animation-delay: 0.4s; }
  .product-row:nth-child(5) { animation-delay: 0.5s; }
  .product-row:nth-child(6) { animation-delay: 0.6s; }
`;

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "", price: "", stock: "", image: null });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    if (formData.image) data.append("image", formData.image);

    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct
      ? `http://localhost:5000/api/products/${editingProduct.id}`
      : "http://localhost:5000/api/products";

    fetch(url, {
      method,
      body: data,
    })
      .then(() => {
        fetchProducts();
        setFormData({ name: "", category: "", price: "", stock: "", image: null });
        setEditingProduct(null);
      })
      .catch((error) => console.error("Error saving product:", error));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: null,
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      fetch(`http://localhost:5000/api/products/${id}`, { method: "DELETE" })
        .then(() => fetchProducts())
        .catch((error) => console.error("Error deleting product:", error));
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
      ),
    [query, products]
  );

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-pink-200/50 animate-fade-in">
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium animate-pulse-subtle">Loading products...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="bg-white p-6 rounded-3xl shadow-lg shadow-pink-200/50 animate-fade-in">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-slide-in-left">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Products</h3>
            <p className="text-sm text-gray-500">Manage your ice cream products and inventory.</p>
          </div>

          <div className="w-full sm:w-80">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="product-search">
              Search products
            </label>
            <input
              id="product-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or category"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-300"
            />
          </div>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className="rounded-2xl bg-pink-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-700"
          >
            {formOpen || editingProduct ? "Hide product form" : "Open product form"}
          </button>
        </div>

        {(formOpen || editingProduct) && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl animate-slide-in-right border border-pink-200/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm transition-all duration-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none hover:border-pink-300"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm transition-all duration-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none hover:border-pink-300"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm transition-all duration-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none hover:border-pink-300"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm transition-all duration-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none hover:border-pink-300"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-pink-700 hover:to-pink-600 font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({ name: "", category: "", price: "", stock: "", image: null });
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] divide-y divide-gray-200 text-left text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-pink-50 to-pink-100/50 text-gray-700">
              <th className="px-4 py-3 font-semibold">Image</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="product-row transition-all duration-300 hover:bg-pink-50/50 hover:shadow-sm">
                  <td className="px-4 py-4">
                    {product.image ? (
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-400 transition-all duration-300">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-900">{product.name}</td>
                  <td className="px-4 py-4 text-gray-600">{product.category}</td>
                  <td className="px-4 py-4 text-gray-900 font-bold">₹{product.price}</td>
                  <td className="px-4 py-4 text-gray-700">{product.stock}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                        product.stock > 15
                          ? "bg-emerald-100 text-emerald-700"
                          : product.stock > 5
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {product.stock > 15
                        ? "In stock"
                        : product.stock > 5
                        ? "Low stock"
                        : "Almost sold out"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={7}>
                  No products found. Add your first product above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
