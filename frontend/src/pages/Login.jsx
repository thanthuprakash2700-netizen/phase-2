import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl shadow-2xl shadow-primary/30 mb-6"
          >
            <LogIn className="text-white w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Securely manage your enterprise tasks</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-sm font-medium"
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  required
                  className="input pl-12 py-3.5 bg-slate-50/50 border-slate-100 hover:border-slate-200 focus:bg-white"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="password"
                  required
                  className="input pl-12 py-3.5 bg-slate-50/50 border-slate-100 hover:border-slate-200 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary gradient-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all font-bold text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn size={22} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500 font-medium">
              New to TaskFlow?{' '}
              <Link to="/register" className="text-primary font-bold hover:text-accent transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admin</p>
            <p className="text-xs font-mono font-bold text-slate-700 break-all">admin@example.com</p>
            <p className="text-[10px] text-primary font-bold mt-1">Pass: adminpassword123</p>
          </div>
          <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Manager</p>
            <p className="text-xs font-mono font-bold text-slate-700 break-all">manager@example.com</p>
            <p className="text-[10px] text-primary font-bold mt-1">Pass: managerpassword123</p>
          </div>
          <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee</p>
            <p className="text-xs font-mono font-bold text-slate-700 break-all">employee@example.com</p>
            <p className="text-[10px] text-primary font-bold mt-1">Pass: employeepassword123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
