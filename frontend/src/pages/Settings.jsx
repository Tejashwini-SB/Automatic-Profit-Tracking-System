import React, { useState, useEffect } from 'react';
import { User, Lock, Shield, Bell, IndianRupee, Save, Settings as SettingsIcon, Check, AlertTriangle, FileSpreadsheet, Calendar } from 'lucide-react';
import api from '../api';

const Settings = () => {
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, audit
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: 'Teja Wholesale Traders',
    currency: 'INR',
    lowStockThreshold: '10',
    notifyOnLowStock: true,
    email: 'admin@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const fetchAuditLogs = async () => {
    if (!isAdmin) return;
    setLogsLoading(true);
    try {
      const res = await api.get('/api/dashboard/audit-logs');
      setAuditLogs(res.data);
    } catch (e) {
      console.error("Failed to load audit logs", e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setSuccessMsg('General settings updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setSuccessMsg('Password updated successfully.');
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 dark:bg-slate-900 min-h-screen transition-colors pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
          <SettingsIcon className="mr-2 text-indigo-650" size={26} />
          Account & App Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure your business rules, alerts, and security preferences.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center shadow-sm">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-1 rounded-full mr-3">
            <Check size={14} />
          </div>
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar inside Settings */}
        <div className="space-y-2">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-1 transition-colors">
            <div 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm' : 'text-gray-650 dark:text-gray-450 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-950'}`}
            >
              <User size={18} />
              <span>General Profile</span>
            </div>
            <div 
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm' : 'text-gray-650 dark:text-gray-450 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-950'}`}
            >
              <Lock size={18} />
              <span>Security & Access</span>
            </div>
            {isAdmin && (
              <div 
                onClick={() => setActiveTab('audit')}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${activeTab === 'audit' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm' : 'text-gray-650 dark:text-gray-450 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-950'}`}
              >
                <Shield size={18} />
                <span>Audit Log Trail</span>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-purple-950 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
              <SettingsIcon size={120} />
            </div>
            <h4 className="font-bold text-lg mb-2">Need Help?</h4>
            <p className="text-xs text-indigo-200 leading-relaxed mb-4">
              Changes configured here affect calculations across your entire dashboard, including purchase margins.
            </p>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors border border-white/10">
              Read Docs
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">General Information</h3>
                <span className="text-xs font-semibold text-indigo-650 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full">Business Profile</span>
              </div>
              <form onSubmit={handleSaveGeneral} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Registered Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-3 px-4 bg-transparent text-sm text-gray-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Local Currency</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <IndianRupee size={16} />
                      </div>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-xl border-gray-200 dark:border-slate-700 border py-3 px-4 text-sm text-gray-700 dark:text-gray-250 bg-white dark:bg-slate-850"
                      >
                        <option value="INR">INR (₹) Rupees</option>
                        <option value="USD">USD ($) Dollars</option>
                        <option value="EUR">EUR (€) Euros</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Low Stock Threshold</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <AlertTriangle size={16} />
                      </div>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-xl border-gray-200 dark:border-slate-700 border py-3 px-4 bg-transparent text-sm text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="notifyOnLowStock"
                    name="notifyOnLowStock"
                    checked={formData.notifyOnLowStock}
                    onChange={handleChange}
                    className="rounded text-indigo-650 h-4 w-4 border-gray-300 dark:border-slate-700"
                  />
                  <label htmlFor="notifyOnLowStock" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                    Enable low stock dashboard alerts
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                  <button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl text-sm flex items-center shadow-md hover:shadow-lg transition-all">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white">Security Credentials</h3>
              </div>
              <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10 w-full rounded-xl border-gray-200 dark:border-slate-700 border py-3 px-4 bg-transparent text-sm text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-3 px-4 bg-transparent text-sm text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-xl border-gray-200 dark:border-slate-700 border py-3 px-4 bg-transparent text-sm text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700/50 flex justify-end">
                  <button type="submit" className="bg-gray-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-medium py-2.5 px-5 rounded-xl text-sm flex items-center shadow-md transition-all">
                    <Shield size={16} className="mr-2" />
                    Update Security Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'audit' && isAdmin && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white">Security Event Audit Trail</h3>
              </div>
              <div className="p-4 max-h-[30rem] overflow-y-auto">
                {logsLoading ? (
                  <p className="text-sm text-gray-400 text-center py-8">Loading audit logs...</p>
                ) : auditLogs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No security logs recorded.</p>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.map((log, index) => (
                      <div key={index} className="flex justify-between items-start pb-3 border-b border-gray-55 dark:border-slate-700/50 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-250">{log.action}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center">
                            <User size={12} className="mr-1" /> User: {log.username}
                          </p>
                        </div>
                        <div className="text-right text-[10px] text-gray-400 flex items-center shrink-0">
                          <Calendar size={12} className="mr-1 text-gray-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
