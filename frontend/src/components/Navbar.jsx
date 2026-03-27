import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 ml-64 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center bg-gray-100/80 rounded-full px-4 py-2 w-96 border border-gray-200/50 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search products or sales..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm placeholder-gray-500 text-gray-700"
        />
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="text-gray-400 hover:text-indigo-600 transition-colors relative p-2 rounded-full hover:bg-indigo-50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5 rounded-full shadow-sm">
              <div className="bg-white p-1 rounded-full cursor-pointer">
                <User size={18} className="text-indigo-600" />
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
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
