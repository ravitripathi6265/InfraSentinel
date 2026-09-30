import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const payload = {
        username: username.trim(),
        password
      };
      if (!isLogin && name.trim()) {
        payload.name = name.trim();
      }

      const response = await axios.post(`http://localhost:3001${endpoint}`, payload);

      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth_change'));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isLogin ? 'login' : 'sign up'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (email, pass) => {
    setUsername(email);
    setPassword(pass);
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center text-blue-600">
          <ShieldCheck size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          SI Ignite
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          AI-Powered Infrastructure Project Early-Warning & Decision Support System
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 text-center mb-6">
            {isLogin ? 'Sign In to Portal' : 'Create New Account'}
          </h3>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ravi Tripathi"
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all" 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Email / Username</label>
              <div className="mt-1">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. tipathiravi205@gmail.com"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all" 
                />
              </div>
            </div>

            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {isLogin ? 'Login to Portal' : 'Create Account'}
              </button>
            </div>

            {isLogin && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-700">Quick Login Credentials:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('tipathiravi205@gmail.com', 'ravi@6265')}
                    className="px-2 py-1 bg-white border border-slate-300 hover:border-blue-400 rounded text-blue-600 font-medium transition-colors"
                  >
                    Ravi Tripathi (tipathiravi205@gmail.com)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('admin', 'password')}
                    className="px-2 py-1 bg-white border border-slate-300 hover:border-blue-400 rounded text-slate-700 font-medium transition-colors"
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
