import React, { useState, useEffect } from 'react';
import { IndianRupee, Package, ShoppingCart, TrendingUp, AlertTriangle, ArrowUpRight, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import api from '../api';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_products: 0,
    total_inventory_value: 0.0,
    total_expenses: 0.0,
    total_revenue: 0.0,
    total_profit: 0.0
  });
  
  const [trendData, setTrendData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, trendRes] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/dashboard/profit-trend')
        ]);
        
        setSummary(sumRes.data);
        setTrendData(trendRes.data.profit_trend || []);
        setTopProducts(trendRes.data.top_products || []);
        setForecastData(trendRes.data.forecast || []);
        setLowStock(trendRes.data.low_stock_products || []);
        setRecentPurchases(trendRes.data.recent_purchases || []);
        setRecentSales(trendRes.data.recent_sales || []);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleExportAll = async () => {
    try {
      // Trigger default reports spreadsheet download
      const res = await api.get('/api/reports/profit', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Daily_Profit_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch(e) {
      console.error('Failed to export daily report', e);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 flex items-start justify-between hover:shadow-md transition-all">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-850 dark:text-white">
          {typeof value === 'number' ? `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value}
        </h3>
        {trend && (
          <p className="flex items-center text-xs mt-3 text-emerald-500 font-medium">
            <ArrowUpRight size={14} className="mr-1" />
            <span>{trend}</span>
          </p>
        )}
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-slate-900 transition-colors pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time inventory valuation and sales performance tracking.</p>
        </div>
        <button 
          onClick={handleExportAll}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-indigo-500/20 flex items-center"
        >
          <FileSpreadsheet size={16} className="mr-2" />
          Export Profit Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Products" 
          value={summary.total_products}
          icon={Package} 
          color="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md"
        />
        <StatCard 
          title="Inventory Value" 
          value={summary.total_inventory_value}
          icon={Package} 
          color="bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-md"
        />
        <StatCard 
          title="Total Cost" 
          value={summary.total_expenses}
          icon={TrendingUp} 
          color="bg-gradient-to-br from-rose-450 to-red-600 shadow-md"
        />
        <StatCard 
          title="Total Revenue" 
          value={summary.total_revenue}
          icon={ShoppingCart} 
          color="bg-gradient-to-br from-amber-500 to-orange-600 shadow-md"
        />
        <StatCard 
          title="Net Profit" 
          value={summary.total_profit}
          icon={IndianRupee} 
          color="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Profit Trends */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Historical Revenue vs. Profit</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-slate-700/50" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} className="dark:bg-slate-800 dark:text-white" />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366F1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day ML Forecast */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">7-Day Profit Prediction</h3>
            <span className="text-xs font-semibold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">ML Linear Forecast</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-slate-700/50" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Line type="monotone" dataKey="profit" name="Predicted Profit" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4, stroke: '#F59E0B', strokeWidth: 2, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Top Performing Products</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" className="dark:stroke-slate-700/50" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                <YAxis dataKey="product_name" type="category" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} width={90} />
                <Tooltip />
                <Bar dataKey="quantity_sold" name="Units Sold" fill="#8B5CF6" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Recent Sales</h3>
          <div className="space-y-4 overflow-y-auto max-h-64">
            {recentSales.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No recent sales.</p>
            ) : (
              recentSales.map((s, i) => (
                <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-55 dark:border-slate-700/50 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(s.sold_at).toLocaleDateString()} · {s.quantity} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+₹{s.total_sale.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Profit: ₹{s.profit.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Low Stock Warnings</h3>
          <div className="space-y-4 overflow-y-auto max-h-64">
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-emerald-500">
                <p className="text-sm font-medium">All products fully stocked!</p>
              </div>
            ) : (
              lowStock.map((p, i) => (
                <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-55 dark:border-slate-700/50 last:border-0 last:pb-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 mr-3">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{p.product_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                      {p.quantity} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
