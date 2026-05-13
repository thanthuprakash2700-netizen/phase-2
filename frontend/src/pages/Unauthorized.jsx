import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4 text-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-50 text-rose-500 rounded-[32px] mb-8 shadow-xl shadow-rose-500/10 border border-rose-100">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Access Denied</h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
          You don't have the required permissions to access this area. Please contact your administrator if you believe this is an error.
        </p>
        <Link 
          to="/dashboard" 
          className="btn btn-primary gradient-primary px-8 py-4 rounded-2xl inline-flex items-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all font-bold"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
