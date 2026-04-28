import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, ChevronDown } from "lucide-react";
import Layout from "../components/Layout";
import { productsAPI } from "../services/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "", price: "", stock: "", image: null });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll(1, 100);
      setProducts(data.products || data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    return ["All Categories", ...uniqueCategories];
  }, [products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, payload);
      } else {
        await productsAPI.create(payload);
      }

      fetchProducts();
      setFormData({ name: "", category: "", price: "", stock: "", image: null });
      setEditingProduct(null);
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsAPI.delete(id);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase());
        const matchesCategory =
          selectedCategory === "All Categories" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [query, selectedCategory, products]
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-20 h-20 scoop bg-gradient-to-br from-brand-400 to-brand-600 animate-bounce mx-auto mb-4"></div>
            <p className="text-xl font-bold text-brand-700">Loading sweet treats...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700">Products</h1>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {formOpen ? "Close" : "Add Product"}
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-lg">
            <p className="text-xl font-bold text-brand-700">{products.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-lg">
            <p className="text-xl font-bold text-brand-700">{categories.length - 1}</p>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-lg">
            <p className="text-xl font-bold text-brand-700">{products.filter(p => p.stock > 15).length}</p>
            <p className="text-sm text-gray-600">In Stock</p>
          </div>
        </div>

        {formOpen && (
          <div className="p-4 bg-brand-50 rounded-lg">
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                  required
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                  required
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-bold text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                  required
                />
              </div>
              <div className="w-20">
                <label className="block text-xs font-bold text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all text-sm">
                {editingProduct ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingProduct(null);
                  setFormData({ name: "", category: "", price: "", stock: "", image: null });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-600" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-brand-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-lg hover:bg-brand-100 transition-all duration-300 min-w-[150px] justify-between"
            >
              <span className="text-sm font-medium text-gray-800">{selectedCategory}</span>
              <ChevronDown className={`w-4 h-4 text-brand-600 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-[100] overflow-hidden">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left transition-all duration-200 text-sm ${
                      selectedCategory === category
                        ? "bg-brand-500 text-white font-semibold"
                        : "text-gray-700 hover:bg-brand-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-brand-50 transition-all duration-300"
              >
                <div className="relative w-full aspect-square bg-brand-50 mb-2 overflow-hidden">
                  {product.image ? (
                    <img
                      src={`http://localhost:5000${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-400">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  {product.stock <= 5 && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-brand-600 text-white text-xs font-semibold rounded">Low</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-brand-700">₹{product.price}</p>
                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-3 py-1.5 bg-brand-500 text-white text-xs font-semibold rounded hover:bg-brand-600 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1.5 bg-rose-100 text-rose-600 text-xs font-semibold rounded hover:bg-rose-200 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-32 h-32 scoop bg-gradient-to-br from-brand-300 to-brand-400 mx-auto mb-6 opacity-50"></div>
              <p className="text-xl font-bold text-gray-600">No products found</p>
              <p className="text-sm text-gray-500 mt-2">
                {query || selectedCategory !== "All Categories"
                  ? "Try adjusting your search or category filter"
                  : "Add your first product to get started"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}