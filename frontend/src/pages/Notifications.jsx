import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Inbox, Clock } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;

    try {
      // Mark all unread in parallel
      await Promise.all(unread.map(n => api.patch(`/notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and view your system activities and alerts</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-2 self-start md:self-auto py-2.5 px-4 shadow-sm"
          >
            <CheckCheck size={18} className="text-emerald-500" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="card">
        {/* Filters */}
        <div className="flex border-b border-slate-100 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors relative ${
              filter === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            All Notifications
            {notifications.length > 0 && (
              <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors relative ${
              filter === 'unread'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 p-4 border border-slate-50 rounded-2xl animate-pulse bg-slate-50/50">
                <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-400 border border-slate-100">
              <Inbox size={28} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">No Notifications</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">
              {filter === 'unread'
                ? "You don't have any unread notifications at the moment."
                : "You're all caught up! When you receive alerts, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filteredNotifications.map(notif => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    notif.is_read
                      ? 'border-slate-50 bg-slate-50/30 opacity-70 hover:opacity-100 hover:bg-slate-50/50'
                      : 'border-primary/10 bg-primary/5 hover:bg-primary/10 shadow-sm shadow-primary/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      notif.is_read ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'
                    }`}>
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold leading-relaxed ${
                        notif.is_read ? 'text-slate-600' : 'text-slate-800'
                      }`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-slate-400 text-xs font-medium">
                        <Clock size={12} />
                        <span>{new Date(notif.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-xs bg-white hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm shrink-0"
                    >
                      Mark Read
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
