import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, TrendingUp, Calendar, Tag, AlertCircle } from 'lucide-react';
import api from '../api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const [saleMsg, setSaleMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    selling_price: ''
  });

  const fetchData = async () => {
    try {
      const offset = (page - 1) * limit;
      const [salesRes, productsRes] = await Promise.all([
        api.get('/api/sales', { params: { limit, offset } }),
        api.get('/api/products', { params: { limit: 1000 } })
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleProductChange = (e) => {
    const pId = e.target.value;
    const selectedProd = products.find(p => p.id === parseInt(pId));
    setFormData({
      ...formData,
      product_id: pId,
      selling_price: selectedProd ? selectedProd.selling_price : '',
      quantity: ''
    });
  };

  const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));
  const currentTotal = selectedProduct && formData.quantity ? (parseFloat(formData.selling_price || 0) * parseInt(formData.quantity || 0)) : 0;
  const currentProfit = selectedProduct && formData.quantity ? ((parseFloat(formData.selling_price || 0) - selectedProduct.cost_price) * parseInt(formData.quantity || 0)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSaleMsg('');
    setErrorMsg('');
    try {
      if(!selectedProduct) throw new Error("Product not selected");
      
      const qty = parseInt(formData.quantity);
      if(qty > selectedProduct.quantity) {
         setErrorMsg(`Not enough stock. Only ${selectedProduct.quantity} units available.`);
         setSubmitting(false);
         return;
      }

      await api.post('/api/sales', {
        product_id: parseInt(formData.product_id),
        quantity: qty,
        selling_price: parseFloat(formData.selling_price)
      });
      
      setSaleMsg(`Successfully processed sale of ${qty} ${selectedProduct.product_name}`);
      setFormData({ product_id: '', quantity: '', selling_price: '' });
      setTimeout(() => setSaleMsg(''), 4000);
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Error processing sale');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 min-h-screen transition-colors pb-12">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Sales & Checkout</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Deduct stock, register sales invoices, and calculate profit margins instantly.</p>
      </div>

      {saleMsg && (
        <div className="max-w-4xl mx-auto bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 px-6 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center shadow-sm">
          <CheckCircle2 size={24} className="text-emerald-500 mr-3" />
          <span className="font-semibold text-base">{saleMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="max-w-4xl mx-auto bg-rose-50 dark:bg-rose-950/30 text-rose-650 dark:text-rose-450 px-6 py-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center shadow-sm">
          <AlertCircle size={24} className="text-rose-500 mr-3" />
          <span className="font-semibold text-base">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Checkout Card Form */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 h-fit transition-colors">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <ShoppingCart size={18} className="mr-2 text-indigo-600 dark:text-indigo-400" />
            Checkout terminal
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Select Product</label>
              <select 
                required 
                name="product_id" 
                value={formData.product_id} 
                onChange={handleProductChange}
                className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-white"
              >
                <option value="" disabled>Choose a product to sell...</option>
                {products.map((p, idx) => (
                  <option key={idx} value={p.id}>{p.product_name} (Stock: {p.quantity})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Quantity</label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleChange}
                  disabled={!formData.product_id}
                  className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-850 dark:text-white" 
                  placeholder="Quantity" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Selling Price (SPU)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  name="selling_price" 
                  value={formData.selling_price} 
                  onChange={handleChange}
                  disabled={!formData.product_id}
                  className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-850 dark:text-white" 
                  placeholder="Price" 
                />
              </div>
            </div>

            {selectedProduct && formData.quantity && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-slate-900/50 dark:to-indigo-950/20 rounded-xl p-4 border border-indigo-100/50 dark:border-indigo-950/30 space-y-3">
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total Sale Revenue</span>
                  <span className="text-base font-extrabold text-indigo-900 dark:text-indigo-400">₹{currentTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                    <TrendingUp size={14} className="mr-1" /> Estimated Profit
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">+₹{currentProfit.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={submitting || !formData.product_id || !formData.quantity}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md disabled:opacity-50 text-sm flex items-center justify-center"
            >
              {submitting ? 'Processing Transaction...' : 'Record Invoice Sale'}
            </button>
          </form>
        </div>

        {/* Sales Logs List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Transaction History Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Selling Price</th>
                  <th className="pb-3 text-right">Total Invoice</th>
                  <th className="pb-3 text-right">Net Profit</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50 text-gray-700 dark:text-gray-300">
                {loading ? (
                  <tr><td colSpan="6" className="py-8 text-center text-gray-400">Loading history...</td></tr>
                ) : sales.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-gray-400">No sales logged.</td></tr>
                ) : (
                  sales.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-55 dark:hover:bg-slate-900/40">
                      <td className="py-3 font-semibold text-gray-900 dark:text-white">{s.product_name}</td>
                      <td className="py-3 text-right">{s.quantity} units</td>
                      <td className="py-3 text-right">₹{s.selling_price.toFixed(2)}</td>
                      <td className="py-3 text-right text-indigo-650 dark:text-indigo-400 font-bold">₹{s.total_sale.toFixed(2)}</td>
                      <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">+₹{s.profit.toFixed(2)}</td>
                      <td className="py-3 text-gray-400">
                        <div className="flex items-center text-[10px]">
                          <Calendar size={12} className="mr-1 text-gray-400" />
                          {new Date(s.sold_at).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
