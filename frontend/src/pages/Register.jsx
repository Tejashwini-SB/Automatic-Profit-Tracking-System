import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User as UserIcon, Shield } from 'lucide-react';
import api from '../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/register', {
        username,
        email,
        password,
        role
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-teal-600 via-emerald-700 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 text-white">
        <div className="text-center mb-6">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm shadow-inner">
            <UserPlus size={30} className="text-white drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
          <p className="text-emerald-100 text-sm mt-1 font-medium">Automatic Profit Tracking Presets</p>
        </div>

        {error && <div className="bg-red-500/80 border border-red-400 text-white px-4 py-2.5 rounded-xl mb-4 text-xs font-medium shadow-sm backdrop-blur-md">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-emerald-100 mb-1 ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50">
                <UserIcon size={16} />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-white/5 placeholder-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/10 transition-all shadow-inner"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-100 mb-1 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-white/5 placeholder-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/10 transition-all shadow-inner"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-100 mb-1 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-white/5 placeholder-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/10 transition-all shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-100 mb-1 ml-1">Select Role</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50">
                <Shield size={16} />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-slate-800/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
              >
                <option value="Staff">Staff</option>
                <option value="Admin">Admin (Manager)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-white hover:bg-gray-50 text-teal-850 font-bold py-3 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] transition-all duration-200 disabled:opacity-75"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-xs text-emerald-100/80">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-white hover:text-emerald-200 transition-colors underline underline-offset-4">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
