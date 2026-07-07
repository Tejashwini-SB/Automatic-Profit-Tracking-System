import React, { useState, useEffect } from 'react';
import { Package, Plus, IndianRupee, Archive, Edit3, Trash2, Search, FileUp, ArrowLeft, ArrowRight, X, Check } from 'lucide-react';
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState(['All', 'Electronics', 'Hardware', 'Energy', 'Telecom', 'Lighting', 'General']);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  
  const token = localStorage.getItem('token');
  let isAdmin = false;
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      isAdmin = payload.sub.includes("admin") || payload.sub.includes("agent");
    } catch (e) {}
  }

  // Form States
  const [addForm, setAddForm] = useState({
    product_name: '',
    category: 'General',
    cost_price: '',
    selling_price: '',
    quantity: '0'
  });
  
  const [editForm, setEditForm] = useState({
    id: null,
    product_name: '',
    category: 'General',
    cost_price: '',
    selling_price: '',
    quantity: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const res = await api.get('/api/products', {
        params: {
          category: category,
          search: search,
          limit: limit,
          offset: offset
        }
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, search]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/products', {
        product_name: addForm.product_name,
        category: addForm.category,
        cost_price: parseFloat(addForm.cost_price),
        selling_price: parseFloat(addForm.selling_price),
        quantity: parseInt(addForm.quantity)
      });
      setSuccessMsg(`Successfully created product ${addForm.product_name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowAddModal(false);
      setAddForm({ product_name: '', category: 'General', cost_price: '', selling_price: '', quantity: '0' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Error adding product');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/products/${editForm.id}`, {
        product_name: editForm.product_name,
        category: editForm.category,
        cost_price: parseFloat(editForm.cost_price),
        selling_price: parseFloat(editForm.selling_price),
        quantity: parseInt(editForm.quantity)
      });
      setSuccessMsg(`Successfully updated product ${editForm.product_name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowEditModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Error updating product');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/api/products/${id}`);
      setSuccessMsg(`Successfully deleted product ${name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Error deleting product');
    }
  };

  const handleCsvImport = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      const res = await api.post('/api/products/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowImportModal(false);
      setCsvFile(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'CSV Import failed');
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 min-h-screen transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Inventory Management</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add products, track stocks, and load bulk CSV inventory sheets.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-55 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center"
          >
            <FileUp size={16} className="mr-2" />
            Import CSV
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center shadow-sm">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-1 rounded-full mr-3">
            <Check size={14} />
          </div>
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-850 shadow-sm transition-colors">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-5 font-semibold">Product Name</th>
                <th className="p-5 font-semibold">Category</th>
                <th className="p-5 font-semibold text-right">Cost Price (CPU)</th>
                <th className="p-5 font-semibold text-right">Selling Price (SPU)</th>
                <th className="p-5 font-semibold text-right">Margin</th>
                <th className="p-5 font-semibold">Stock Status</th>
                {isAdmin && <th className="p-5 font-semibold text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50 text-sm text-gray-800 dark:text-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400 dark:text-gray-500">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400 dark:text-gray-500">No products found matching filters.</td></tr>
              ) : (
                products.map((product, idx) => {
                  const margin = product.selling_price - product.cost_price;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center text-gray-950 dark:text-white font-medium">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-900 flex items-center justify-center mr-3 text-indigo-500 dark:text-indigo-400">
                            <Package size={16} />
                          </div>
                          {product.product_name}
                        </div>
                      </td>
                      <td className="p-5 text-gray-500 dark:text-gray-400">{product.category}</td>
                      <td className="p-5 text-right font-medium">₹{product.cost_price.toFixed(2)}</td>
                      <td className="p-5 text-right font-semibold">₹{product.selling_price.toFixed(2)}</td>
                      <td className="p-5 text-right text-emerald-600 dark:text-emerald-400 font-medium">+₹{margin.toFixed(2)}</td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.quantity < 10 ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-705 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'}`}>
                          {product.quantity} units
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => {
                                setEditForm({
                                  id: product.id,
                                  product_name: product.product_name,
                                  category: product.category,
                                  cost_price: product.cost_price,
                                  selling_price: product.selling_price,
                                  quantity: product.quantity
                                });
                                setShowEditModal(true);
                              }}
                              className="text-gray-400 hover:text-indigo-650 transition-colors"
                              title="Edit product parameters"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.product_name)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination bar */}
        <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Page {page}</span>
          <div className="flex space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} className="dark:text-white" />
            </button>
            <button
              disabled={products.length < limit}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight size={16} className="dark:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input required type="text" value={addForm.product_name} onChange={(e) => setAddForm({...addForm, product_name: e.target.value})}
                  className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" placeholder="Premium Widgets" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={addForm.category} onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-white">
                    {categories.filter(c => c !== "All").map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input required type="number" min="0" value={addForm.quantity} onChange={(e) => setAddForm({...addForm, quantity: e.target.value})}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Cost Price (CPU)</label>
                  <input required type="number" step="0.01" value={addForm.cost_price} onChange={(e) => setAddForm({...addForm, cost_price: e.target.value})}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" placeholder="10.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Selling Price (SPU)</label>
                  <input required type="number" step="0.01" value={addForm.selling_price} onChange={(e) => setAddForm({...addForm, selling_price: e.target.value})}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" placeholder="15.00" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 rounded-xl text-gray-750 dark:text-gray-200 font-medium hover:bg-gray-200 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Modify Product Parameters</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input required type="text" value={editForm.product_name} onChange={(e) => setEditForm({...editForm, product_name: e.target.value})}
                  className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-white">
                    {categories.filter(c => c !== "All").map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Quantity In Stock</label>
                  <input required type="number" min="0" value={editForm.quantity} onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Cost Price (CPU)</label>
                  <input required type="number" step="0.01" value={editForm.cost_price} onChange={(e) => setEditForm({...editForm, cost_price: e.target.value})}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Selling Price (SPU)</label>
                  <input required type="number" step="0.01" value={editForm.selling_price} onChange={(e) => setEditForm({...editForm, selling_price: e.target.value})}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 rounded-xl text-gray-750 dark:text-gray-200 font-medium hover:bg-gray-200 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium text-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import Bulk Products CSV</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCsvImport} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-400 transition-colors">
                <FileUp size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Choose your inventory CSV file</p>
                <p className="text-xs text-gray-400 mt-1">Columns: product_name, category, cost_price, selling_price, quantity</p>
                <input required type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="mt-4 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowImportModal(false)} className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 rounded-xl text-gray-750 dark:text-gray-200 font-medium hover:bg-gray-200 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm">Import Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
