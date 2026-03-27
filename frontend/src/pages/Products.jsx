import React, { useState, useEffect } from 'react';
import { Package, Plus, IndianRupee, Archive, Check } from 'lucide-react';
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    cost_price: '',
    selling_price: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/purchase', {
        name: formData.name,
        quantity: parseInt(formData.quantity),
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price)
      });
      setSuccessMsg(`Successfully added ${formData.quantity} units of ${formData.name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowModal(false);
      setFormData({ name: '', quantity: '', cost_price: '', selling_price: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error adding purchase');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Inventory & Products</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your wholesale products, stock levels, and pricing.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Purchase
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl border border-emerald-100 flex items-center shadow-sm">
          <div className="bg-emerald-100 p-1 rounded-full mr-3">
            <Check size={16} className="text-emerald-700" />
          </div>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-5 font-semibold">Product Name</th>
                <th className="p-5 font-semibold">Current Stock</th>
                <th className="p-5 font-semibold text-right">Cost Price (CPU)</th>
                <th className="p-5 font-semibold text-right">Selling Price (SPU)</th>
                <th className="p-5 font-semibold text-right">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No products found. Start by adding a purchase.</td></tr>
              ) : (
                products.map((product, idx) => {
                  const margin = product.selling_price - product.cost_price;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center text-gray-900 font-medium">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3 text-indigo-500">
                            <Package size={16} />
                          </div>
                          {product.name}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.quantity < 10 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                          {product.quantity} units
                        </span>
                      </td>
                      <td className="p-5 text-right text-gray-600 font-medium">₹{product.cost_price.toFixed(2)}</td>
                      <td className="p-5 text-right text-gray-900 font-semibold">₹{product.selling_price.toFixed(2)}</td>
                      <td className="p-5 text-right text-emerald-600 font-medium">+₹{margin.toFixed(2)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Record New Purchase</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Archive size={18} className="text-gray-400" />
                  </div>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange}
                    className="pl-10 w-full rounded-xl border-gray-200 border py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="E.g., Premium Widgets" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Purchased</label>
                <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange}
                  className="w-full rounded-xl border-gray-200 border py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee size={18} className="text-gray-400" />
                    </div>
                    <input required type="number" step="0.01" min="0" name="cost_price" value={formData.cost_price} onChange={handleChange}
                      className="pl-10 w-full rounded-xl border-gray-200 border py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="10.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee size={18} className="text-gray-400" />
                    </div>
                    <input required type="number" step="0.01" min="0" name="selling_price" value={formData.selling_price} onChange={handleChange}
                      className="pl-10 w-full rounded-xl border-gray-200 border py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="15.00" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
