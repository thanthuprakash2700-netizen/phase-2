import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs/');
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-8">Not authorized</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">System Audit Logs</h1>
        <p className="text-slate-500 font-medium">Monitor all system activities and changes</p>
      </header>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="text-primary" />
          <h3 className="font-bold text-slate-800 text-lg">Activity Feed</h3>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                key={log.id} 
                className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">{log.entity}</span>
                    <span className="text-xs text-slate-400">ID: {log.entity_id}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">User ID: {log.user_id || 'System'}</p>
                </div>
                <div className="text-sm text-slate-400 font-medium">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </motion.div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-8 text-slate-500">No activity logged yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
