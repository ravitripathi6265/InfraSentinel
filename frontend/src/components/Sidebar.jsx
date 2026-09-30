import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Radar, 
  TrendingUp,
  AlertTriangle, 
  FolderOpen, 
  Newspaper, 
  BarChart3, 
  GitCompare, 
  Bot, 
  FileText, 
  Settings,
  Database,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ presentationMode }) => {
  const [user, setUser] = useState(null);

  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        const email = parsed.email || (parsed.username?.includes('@') ? parsed.username : `${parsed.username || 'user'}@sentinel.gov.in`);
        const name = parsed.name || (parsed.username?.includes('ravi') ? 'Ravi Tripathi' : (parsed.username || 'Sentinel Officer'));
        const initials = parsed.initials || (name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SO');

        setUser({
          ...parsed,
          name,
          email,
          initials,
          role: parsed.role || 'Project Director'
        });
      } catch (e) {
        console.error("Could not parse user in sidebar", e);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    const handleAuthChange = () => loadUser();
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth_change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Risk Radar', path: '/risk-radar', icon: Radar },
    { name: 'Risk Forecasting', path: '/forecasting', icon: TrendingUp },
    { name: 'Early Warnings', path: '/early-warnings', icon: AlertTriangle },
    { name: 'News Intelligence', path: '/news', icon: Newspaper },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'What-if Simulator', path: '/simulator', icon: GitCompare },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Executive Reports', path: '/reports', icon: FileText },
  ];

  if (presentationMode) {
    return null; // Hide sidebar in presentation mode to maximize charts
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-white">SI Ignite</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Decision Support</p>
          </div>
        </div>
      </div>

      <motion.nav 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 px-4 space-y-1 overflow-y-auto"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div variants={itemVariants} key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* Dynamic User Profile & System Status */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Database size={13} className="text-blue-400" />
            <span>Live SQLite DB</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
          </span>
        </div>

        {user ? (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
                {user.initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate" title={user.name}>
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate" title={user.email}>
                {user.email}
              </p>
              <p className="text-[10px] text-blue-400 font-medium truncate mt-0.5">
                {user.role}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              SO
            </div>
            <div>
              <p className="text-xs font-medium text-slate-300">Guest User</p>
              <p className="text-[10px] text-slate-500">Sign in to sync</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

