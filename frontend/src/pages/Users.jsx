import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Search, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users/');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    admin: 'bg-rose-50 text-rose-600 border-rose-100',
    manager: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    employee: 'bg-slate-50 text-slate-600 border-slate-100'
  };

  return (
    <div className="min-h-screen bg-page p-8">
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary font-bold mb-4 hover:underline">
            <ChevronLeft size={18} />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">System Users</h1>
          <p className="text-slate-500 font-medium">Manage and monitor all enterprise accounts</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="input pl-12 py-3.5 bg-white shadow-xl shadow-slate-200/40 w-full md:w-80 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="card h-40 animate-pulse bg-white" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-white/80 backdrop-blur-xl border border-white flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                    {user.name.charAt(0)}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{user.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Mail size={14} className="opacity-60" />
                    {user.email}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tight">
                    <Shield size={14} className="opacity-60" />
                    {user.id === currentUser.id ? 'You' : 'Active Account'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Users;
