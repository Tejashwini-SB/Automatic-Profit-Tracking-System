import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, IndianRupee, Truck, Calendar, ShoppingBag, Check } from 'lucide-react';
import api from '../api';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Form State
  const [formData, setFormData] = useState({
    product_id: '',
    supplier: '',
    quantity: '',
    purchase_price: ''
  });

  const fetchData = async () => {
    try {
      const offset = (page - 1) * limit;
      const [purchRes, prodRes] = await Promise.all([
        api.get('/api/purchases', { params: { limit, offset } }),
        api.get('/api/products', { params: { limit: 1000 } }) // fetch all for select dropdown
      ]);
      setPurchases(purchRes.data);
      setProducts(prodRes.data);
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

  // Autofill purchase price if product is selected
  const handleProductChange = (e) => {
    const pId = e.target.value;
    const selectedProd = products.find(p => p.id === parseInt(pId));
    setFormData({
      ...formData,
      product_id: pId,
      purchase_price: selectedProd ? selectedProd.cost_price : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/purchases', {
        product_id: parseInt(formData.product_id),
        supplier: formData.supplier,
        quantity: parseInt(formData.quantity),
        purchase_price: parseFloat(formData.purchase_price)
      });
      
      setSuccessMsg(`Successfully recorded purchase of ${formData.quantity} units.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowModal(false);
      setFormData({ product_id: '', supplier: '', quantity: '', purchase_price: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error recording purchase transaction');
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 min-h-screen transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Purchase Logistics</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Log restock invoices and track wholesale supplier costs.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Log Restock Purchase
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center shadow-sm">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-1 rounded-full mr-3">
            <Check size={14} />
          </div>
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* History table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-5 font-semibold">Product Name</th>
                <th className="p-5 font-semibold">Supplier</th>
                <th className="p-5 font-semibold text-right">Quantity Ingested</th>
                <th className="p-5 font-semibold text-right">Unit Purchase Cost</th>
                <th className="p-5 font-semibold text-right">Total Outflow</th>
                <th className="p-5 font-semibold">Date Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50 text-sm text-gray-800 dark:text-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 dark:text-gray-500">Loading purchase log history...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 dark:text-gray-500">No purchases found. Click Log Purchase to restock.</td></tr>
              ) : (
                purchases.map((purchase, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center text-gray-950 dark:text-white font-medium">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-slate-900 flex items-center justify-center mr-3 text-rose-500">
                          <ShoppingBag size={16} />
                        </div>
                        {purchase.product_name}
                      </div>
                    </td>
                    <td className="p-5 text-gray-500 dark:text-gray-400">{purchase.supplier}</td>
                    <td className="p-5 text-right font-medium">{purchase.quantity} units</td>
                    <td className="p-5 text-right font-medium">₹{purchase.purchase_price.toFixed(2)}</td>
                    <td className="p-5 text-right text-rose-600 dark:text-rose-400 font-semibold">₹{purchase.total_amount.toFixed(2)}</td>
                    <td className="p-5 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center text-xs">
                        <Calendar size={14} className="mr-1.5 text-gray-400" />
                        {new Date(purchase.purchased_at).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Record Stock Purchase</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Product</label>
                <select required name="product_id" value={formData.product_id} onChange={handleProductChange}
                  className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-sm text-gray-805 dark:text-white">
                  <option value="" disabled>Choose a product to restock...</option>
                  {products.map((p, i) => <option key={i} value={p.id}>{p.product_name} (Current: {p.quantity})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Supplier Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Truck size={16} />
                  </div>
                  <input required type="text" name="supplier" value={formData.supplier} onChange={handleChange}
                    className="pl-10 w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" placeholder="Apex Supplies Ltd" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" placeholder="50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Cost Price (CPU)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <IndianRupee size={14} />
                    </div>
                    <input required type="number" step="0.01" name="purchase_price" value={formData.purchase_price} onChange={handleChange}
                      className="pl-10 w-full rounded-xl border-gray-200 dark:border-slate-700 border py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm text-gray-800 dark:text-white" placeholder="12.00" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 rounded-xl text-gray-750 dark:text-gray-200 font-medium hover:bg-gray-200 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm">Log Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
