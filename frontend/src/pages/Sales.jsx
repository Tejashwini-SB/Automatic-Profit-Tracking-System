import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../api';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saleMsg, setSaleMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    product_name: '',
    quantity: ''
  });

  useEffect(() => {
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
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const selectedProduct = products.find(p => p.name === formData.product_name);
  const currentTotal = selectedProduct && formData.quantity ? (selectedProduct.selling_price * parseInt(formData.quantity || 0)) : 0;
  const currentProfit = selectedProduct && formData.quantity ? ((selectedProduct.selling_price - selectedProduct.cost_price) * parseInt(formData.quantity || 0)) : 0;

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

      await api.post('/sale', {
        product_name: formData.product_name,
        quantity: qty,
        total_sale: selectedProduct.selling_price * qty
      });
      
      setSaleMsg(`Successfully processed sale of ${qty} ${formData.product_name}`);
      setFormData({ product_name: '', quantity: '' });
      setTimeout(() => setSaleMsg(''), 4000);
      
      // update local inventory for fast UI sync
      setProducts(products.map(p => p.name === formData.product_name ? {...p, quantity: p.quantity - qty} : p));
      
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Error processing sale');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Record a New Sale</h2>
        <p className="text-gray-500 mt-2">Automatically deducts stock and computes your profit margin.</p>
      </div>

      {saleMsg && (
        <div className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl border border-emerald-100 flex items-center shadow-sm">
          <CheckCircle2 size={24} className="text-emerald-500 mr-3" />
          <span className="font-medium text-lg">{saleMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl border border-rose-100 flex items-center shadow-sm">
          <span className="font-medium text-lg">{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Product</label>
              <select 
                required 
                name="product_name" 
                value={formData.product_name} 
                onChange={handleChange}
                className="w-full rounded-2xl border-gray-200 border py-4 px-5 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-gray-700 bg-gray-50/50 appearance-none"
              >
                <option value="" disabled>Select a product...</option>
                {products.map((p, idx) => (
                  <option key={idx} value={p.name}>{p.name} (Stock: {p.quantity})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
              <input 
                required 
                type="number" 
                min="1" 
                name="quantity" 
                value={formData.quantity} 
                onChange={handleChange}
                disabled={!formData.product_name}
                className="w-full rounded-2xl border-gray-200 border py-4 px-5 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-gray-900 bg-gray-50/50" 
                placeholder="0" 
              />
            </div>
          </div>

          {selectedProduct && formData.quantity && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-500 mb-1">Total Sale Amount</p>
                <p className="text-3xl font-extrabold text-indigo-900">₹{currentTotal.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-50">
                <p className="text-sm font-medium text-emerald-600 mb-1 flex items-center">
                  <TrendingUp size={16} className="mr-1" /> Estimated Profit
                </p>
                <p className="text-3xl font-extrabold text-emerald-600">+₹{currentProfit.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button 
              type="submit"
              disabled={submitting || !formData.product_name || !formData.quantity}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-lg"
            >
              <ShoppingCart size={22} className="mr-3" />
              {submitting ? 'Processing...' : 'Complete Sale transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sales;
