import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  User as UserIcon, 
  Columns, 
  FileCheck, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!user) return null;

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Columns size={20} />, label: 'Kanban Board', path: '/kanban' },
    { icon: <FileCheck size={20} />, label: 'Approvals', path: '/approvals' },
  ];

  if (user.role === 'admin') {
    navItems.push({ icon: <UserIcon size={20} />, label: 'System Users', path: '/users' });
  }

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col hidden md:flex border-r border-white/5">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ClipboardList className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">TaskFlow</span>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'bg-white/10 text-white font-bold shadow-lg shadow-black/10' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
                {location.pathname === item.path && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white uppercase shadow-inner">
                {(user.name || 'U').charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user.name || 'User'}</p>
                <p className="text-xs text-white/50 capitalize">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/70 text-sm transition-all duration-200"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
