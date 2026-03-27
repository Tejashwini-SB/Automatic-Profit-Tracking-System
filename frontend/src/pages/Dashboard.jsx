import React, { useState, useEffect } from 'react';
import { IndianRupee, Package, ShoppingCart, TrendingUp, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({ profit: 0, totalProducts: 0, lowStock: 0 });
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profitRes, productsRes] = await Promise.all([
          api.get('/total-profit'),
          api.get('/products')
        ]);
        
        const products = productsRes.data;
        const lowStockCount = products.filter(p => p.quantity < 10).length;
        
        setStats({
          profit: profitRes.data.total_profit,
          totalProducts: products.length,
          lowStock: lowStockCount
        });

        const chartData = products.map(p => ({
          name: p.name,
          stock: p.quantity,
          cost: p.cost_price,
          price: p.selling_price
        })).slice(0, 5); // top 5 for chart

        setProductData(chartData);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {trend && (
          <p className="flex items-center text-sm mt-3 text-emerald-500 font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            <span>{trend}</span>
          </p>
        )}
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your wholesale business today.</p>
        </div>
        <button onClick={async () => {
          try {
            const res = await api.get('/export-report', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Profit_Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          } catch(e) {
            console.error('Failed to export', e);
          }
        }} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
          <TrendingUp size={16} className="mr-2" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Profit" 
          value={`₹${stats.profit.toFixed(2)}`} 
          icon={IndianRupee} 
          color="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200/50 shadow-lg"
          trend="+12.5% from last month"
        />
        <StatCard 
          title="Active Products" 
          value={stats.totalProducts} 
          icon={Package} 
          color="bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-200/50 shadow-lg"
          trend="2 new this week"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStock} 
          icon={ShoppingCart} 
          color="bg-gradient-to-br from-rose-400 to-red-500 shadow-rose-200/50 shadow-lg"
          trend="Needs immediate restock"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Top Products Inventory</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="stock" name="Current Stock" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">System Analytics Updated</p>
                  <p className="text-xs text-gray-500 mt-1">Just now</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium rounded-xl transition-colors text-sm">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
