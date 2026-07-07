import React, { useState } from 'react';
import { FileSpreadsheet, Download, Check, AlertCircle } from 'lucide-react';
import api from '../api';

const Reports = () => {
  const [downloading, setDownloading] = useState('');
  const [success, setSuccess] = useState('');

  const triggerDownload = async (endpoint, reportName) => {
    setDownloading(reportName);
    try {
      const res = await api.get(`/api/reports/${endpoint}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportName}_Report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setSuccess(`${reportName} report downloaded successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      console.error(e);
      alert(`Failed to export ${reportName} report.`);
    } finally {
      setDownloading('');
    }
  };

  const ReportCard = ({ title, description, endpoint, reportName }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
      <div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
          <FileSpreadsheet size={24} />
        </div>
        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">{description}</p>
      </div>
      <button 
        disabled={downloading !== ''}
        onClick={() => triggerDownload(endpoint, reportName)}
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm flex items-center justify-center transition-all shadow-sm"
      >
        {downloading === reportName ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Excel...
          </span>
        ) : (
          <>
            <Download size={16} className="mr-2" />
            Generate Excel Report
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 dark:bg-slate-900 min-h-screen transition-colors">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Excel Report Exports</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Export full spreadsheets containing transaction logs, audits, and valuation indices.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center shadow-sm">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-1 rounded-full mr-3">
            <Check size={14} />
          </div>
          <span className="font-medium text-sm">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title="Inventory Valuation" 
          description="Downloads complete list of products, stock levels, unit cost/selling pricing, and inventory valuation sums." 
          endpoint="inventory" 
          reportName="Inventory" 
        />
        <ReportCard 
          title="Purchase Logs" 
          description="Downloads complete historical records of product restocks, supplier invoices, unit purchase cost, and expenditure details." 
          endpoint="purchases" 
          reportName="Purchases" 
        />
        <ReportCard 
          title="Sales History" 
          description="Downloads full customer billing history, listing unit sales, invoice totals, cost prices, and margins." 
          endpoint="sales" 
          reportName="Sales" 
        />
        <ReportCard 
          title="Profit Summaries" 
          description="Downloads daily revenue summaries, listing daily expenditures, revenues, and aggregated net profits." 
          endpoint="profit" 
          reportName="Daily_Profit" 
        />
      </div>
    </div>
  );
};

export default Reports;
