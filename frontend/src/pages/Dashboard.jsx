import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Circle, 
  ClipboardList, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  Calendar, 
  UserPlus,
  FileCheck,
  BarChart as BarChartIcon, 
  TrendingUp, 
  PieChart as PieChartIcon,
  User as UserIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import dashboardService from '../services/dashboardService';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, summaryRes, distRes, perfRes] = await Promise.all([
        api.get('/tasks/'),
        dashboardService.getSummary(),
        dashboardService.getTaskDistribution(),
        dashboardService.getPerformance()
      ]);
      
      setTasks(tasksRes.data);
      setSummary(summaryRes.data);
      setDistribution(distRes.data);
      setPerformance(perfRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      try {
        const response = await api.get('/users/');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchUsers();
    }
  }, [fetchData, fetchUsers, user]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ? true : task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks(tasks.filter(t => t.id !== id));
      } catch (error) {
        alert('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update status');
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Enterprise Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user.name?.split(' ')[0]}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 w-full md:w-64"
            />
          </div>
          {(user.role === 'admin' || user.role === 'manager') && (
            <button 
              onClick={() => { setEditingTask(null); setShowModal(true); }}
              className="btn btn-primary gradient-primary flex items-center gap-2"
            >
              <Plus size={18} />
              New Task
            </button>
          )}
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          label="Total Tasks" 
          value={summary?.total_tasks || 0} 
          icon={<ClipboardList className="text-blue-500" />} 
          trend="+12%" 
        />
        <StatsCard 
          label="Active Tasks" 
          value={summary?.tasks_by_status?.in_progress || 0} 
          icon={<TrendingUp className="text-amber-500" />} 
          trend="+5%" 
        />
        <StatsCard 
          label="Pending Approvals" 
          value={summary?.pending_approvals || 0} 
          icon={<FileCheck size={20} className="text-purple-500" />} 
          trend="-2" 
        />
        <StatsCard 
          label="Completed" 
          value={summary?.completed_tasks || 0} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          trend="+8%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Task Distribution Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <PieChartIcon size={18} className="text-primary" />
              Task Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#8b5cf6', '#10b981'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChartIcon size={18} className="text-primary" />
              Team Performance
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="user_name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="completed_count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={18} />
          <span className="text-sm font-medium text-slate-600">Recent Tasks</span>
          <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">{filteredTasks.length}</span>
        </div>
        <Link to="/kanban" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
          View Kanban <ChevronRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="card h-48 animate-pulse bg-slate-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
          <AnimatePresence mode="popLayout">
            {filteredTasks.slice(0, 6).map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                user={user}
                onDelete={handleDelete}
                onEdit={(t) => { setEditingTask(t); setShowModal(true); }}
                onStatusChange={handleStatusChange}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Task Modal */}
      <AnimatePresence>
        {showModal && (
          <TaskModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            task={editingTask}
            users={users}
            onSave={() => { setShowModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatsCard = ({ label, value, icon, trend }) => (
  <div className="card flex items-center gap-6">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-center gap-3">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

const TaskCard = ({ task, user, onDelete, onEdit, onStatusChange }) => {
  const statusColors = {
    todo: 'bg-slate-100 text-slate-600 border-slate-200',
    in_progress: 'bg-blue-50 text-blue-600 border-blue-100',
    review: 'bg-purple-50 text-purple-600 border-purple-100',
    done: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  const statusIcons = {
    todo: <Circle size={14} />,
    in_progress: <Clock size={14} />,
    review: <Clock size={14} />,
    done: <CheckCircle2 size={14} />
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-500',
    medium: 'bg-amber-100 text-amber-600',
    high: 'bg-rose-100 text-rose-600'
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="card group relative"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${
        task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-300'
      }`} />
      
      <div className="flex justify-between items-start mb-5 pl-2">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${statusColors[task.status]} flex items-center gap-1.5`}>
          {statusIcons[task.status]}
          {task.status.replace('_', ' ')}
        </span>
        
        {(user.role === 'admin' || (user.role === 'manager' && task.created_by_id === user.id)) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button onClick={() => onEdit(task)} className="p-2 hover:bg-primary/10 rounded-xl text-slate-400 hover:text-primary transition-colors">
              <Edit2 size={16} />
            </button>
            <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <h3 className="font-bold text-slate-800 mb-3 truncate text-lg group-hover:text-primary transition-colors pl-2">{task.title}</h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed pl-2 font-medium">
        {task.description || 'No additional details provided.'}
      </p>

      <div className="flex items-center justify-between pt-5 border-t border-slate-50 pl-2">
        <div className="flex items-center gap-4">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.due_date && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar size={14} className="opacity-70" />
              <span className="text-[11px] font-bold">{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {task.assigned_to_id ? (
              <div className="w-8 h-8 rounded-full gradient-primary text-white border-2 border-white flex items-center justify-center text-[11px] font-bold shadow-sm" title={`Assigned to ${task.assigned_to_name}`}>
                {(task.assigned_to_name || 'U').charAt(0)}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border-2 border-white flex items-center justify-center shadow-sm" title="Unassigned">
                <UserIcon size={14} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 pl-2">
        {task.status !== 'done' && (
          <button 
            onClick={() => {
              let nextStatus = 'in_progress';
              if (task.status === 'in_progress') nextStatus = 'review';
              else if (task.status === 'review') nextStatus = 'done';
              else if (task.status === 'todo') nextStatus = 'in_progress';
              onStatusChange(task, nextStatus);
            }}
            className="w-full py-2.5 bg-slate-50 hover:bg-primary hover:text-white text-slate-600 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-slate-100 hover:border-primary shadow-sm hover:shadow-primary/20"
          >
            <ChevronRight size={16} /> Next Stage
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
