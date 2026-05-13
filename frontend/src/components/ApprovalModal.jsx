
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import approvalService from '../services/approvalService';

const ApprovalModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await approvalService.createApproval(formData);
      onSave();
      setFormData({ title: '', description: '' });
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-white"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-bold text-2xl text-slate-900 tracking-tight">Request Approval</h2>
            <p className="text-sm text-slate-500 font-medium">Submit a new request for manager review</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-2xl transition-all duration-200">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Request Title</label>
            <input 
              required
              className="input py-3.5"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. ID Card Distribution Authorization"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reason / Description</label>
            <textarea 
              required
              className="input min-h-[150px] py-4"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Provide full details for the approval request..."
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-4 rounded-2xl font-bold">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary gradient-primary flex-1 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting...' : <><Send size={18} /> Send Request</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ApprovalModal;
