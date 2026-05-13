
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TaskModal = ({ isOpen, onClose, task, users, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(task ? {
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    assigned_to_id: task.assigned_to_id || ''
  } : {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    assigned_to_id: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.assigned_to_id) payload.assigned_to_id = null;
      if (!payload.due_date) payload.due_date = null;

      if (task) {
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        await api.post('/tasks/', payload);
      }
      onSave();
    } catch (error) {
      alert('Failed to save task');
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
        className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-white"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-bold text-2xl text-slate-900 tracking-tight">{task ? 'Edit Task' : 'New Task'}</h2>
            <p className="text-sm text-slate-500 font-medium">{task ? 'Update task details' : 'Define a new enterprise objective'}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-2xl transition-all duration-200">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
            <input 
              required
              className="input py-3.5"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Q3 Performance Review"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
            <textarea 
              className="input min-h-[120px] py-4"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Provide context and expectations..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Priority</label>
              <select 
                className="input py-3.5 appearance-none"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
              <input 
                type="date"
                className="input py-3.5"
                value={formData.due_date}
                onChange={e => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Assignee</label>
            <div className="relative group">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <select 
                className="input pl-12 py-3.5 appearance-none"
                value={formData.assigned_to_id}
                onChange={e => setFormData({...formData, assigned_to_id: e.target.value})}
              >
                <option value="">Unassigned</option>
                {users
                  .filter(u => user.role === 'admin' || (user.role === 'manager' && u.role === 'employee'))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-4 rounded-2xl font-bold">Cancel</button>
            <button type="submit" className="btn btn-primary gradient-primary flex-1 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
              {task ? 'Update Objective' : 'Launch Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskModal;
