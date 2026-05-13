import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'employee', label: 'Employee', desc: 'Can view and update assigned tasks' },
    { id: 'manager', label: 'Manager', desc: 'Can create and assign tasks' },
    { id: 'admin', label: 'Admin', desc: 'Full system access' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Create Account</h1>
          <p className="text-slate-500 font-medium">Join the next-gen enterprise collaboration platform</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-white">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-3xl mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Registration Successful!</h2>
              <p className="text-slate-500 font-medium">Redirecting you to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="text"
                        required
                        className="input pl-12 py-3.5 bg-slate-50/50 border-slate-100 hover:border-slate-200 focus:bg-white"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="email"
                        required
                        className="input pl-12 py-3.5 bg-slate-50/50 border-slate-100 hover:border-slate-200 focus:bg-white"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="password"
                        required
                        className="input pl-12 py-3.5 bg-slate-50/50 border-slate-100 hover:border-slate-200 focus:bg-white"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Your Role</label>
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <label 
                        key={role.id}
                        className={`block cursor-pointer p-4 rounded-2xl border transition-all duration-300 ${
                          formData.role === role.id 
                            ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5 ring-1 ring-primary' 
                            : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            formData.role === role.id ? 'border-primary' : 'border-slate-300'
                          }`}>
                            {formData.role === role.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <input
                            type="radio"
                            name="role"
                            value={role.id}
                            checked={formData.role === role.id}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="hidden"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{role.label}</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight">{role.desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary gradient-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all font-bold text-lg mt-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <UserPlus size={22} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:text-accent transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
