import React from 'react';
import { Bell, Search, User, LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const token = localStorage.getItem('token');
  let username = "User";
  let role = "Staff";

  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      // sub contains the email or username
      username = payload.sub.split('@')[0];
      // default role to Admin if user contains admin, or just fallback
      role = payload.sub.includes("admin") || payload.sub.includes("agent") ? "Admin" : "Staff";
    } catch (e) {
      console.error(e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 ml-64 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm transition-colors">
      <div className="flex items-center bg-gray-100/80 dark:bg-slate-800/80 rounded-full px-4 py-2 w-96 border border-gray-200/50 dark:border-slate-700/50 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <Search size={18} className="text-gray-400 dark:text-gray-500" />
        <input 
          type="text" 
          placeholder="Search products, sales, reports..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm placeholder-gray-500 text-gray-700 dark:text-gray-200"
        />
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
          title="Toggle Light/Dark Mode"
        >
          {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>

        <button className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        
        <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-slate-800 pl-6">
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">{username}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5 rounded-full shadow-sm">
              <div className="bg-white dark:bg-slate-800 p-1 rounded-full cursor-pointer">
                <User size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
