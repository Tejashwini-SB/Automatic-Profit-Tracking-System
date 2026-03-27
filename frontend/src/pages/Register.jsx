import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock } from 'lucide-react';
import api from '../api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', {
        email,
        password
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-teal-500 via-emerald-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 text-white">
        <div className="text-center mb-8">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
            <UserPlus size={32} className="text-white drop-shadow-md" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
          <p className="text-teal-100 mt-2 font-medium">Start automating your profit tracking</p>
        </div>

        {error && <div className="bg-red-500/80 border border-red-400 text-white px-4 py-3 rounded-xl mb-6 text-sm font-medium shadow-sm backdrop-blur-md">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-teal-100 mb-1.5 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-300 text-white/50">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-2xl bg-white/5 placeholder-white/40 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/10 transition-all duration-300 ease-out shadow-inner"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-teal-100 mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-300 text-white/50">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-2xl bg-white/5 placeholder-white/40 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/10 transition-all duration-300 ease-out shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-white hover:bg-gray-50 text-teal-800 font-bold py-3.5 px-4 rounded-2xl shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,255,255,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-teal-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-teal-100/80">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-white hover:text-emerald-200 transition-colors underline decoration-emerald-400/50 underline-offset-4">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
