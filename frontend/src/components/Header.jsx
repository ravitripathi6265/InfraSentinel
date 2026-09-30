import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Maximize, Minimize, LogOut, User, CheckCircle2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ presentationMode, togglePresentation }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        // Normalize user properties if needed
        const email = parsed.email || (parsed.username?.includes('@') ? parsed.username : `${parsed.username || 'user'}@sentinel.gov.in`);
        const name = parsed.name || (parsed.username?.includes('ravi') ? 'Ravi Tripathi' : (parsed.username || 'Sentinel Officer'));
        const initials = parsed.initials || (name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SO');
        
        setUser({
          ...parsed,
          name,
          email,
          initials,
          role: parsed.role || 'Project Director',
          agency: parsed.agency || 'Ministry of Statistics and Programme Implementation (MoSPI)'
        });
      } catch (e) {
        console.error("Could not parse user from local storage", e);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for storage changes or custom auth events
    const handleAuthChange = () => loadUser();
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth_change', handleAuthChange);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth_change', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth_change'));
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 relative">
      <div className="flex items-center w-1/3">
        {presentationMode && (
          <h1 className="text-xl font-bold tracking-wider text-blue-900 mr-6">SI Ignite</h1>
        )}
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search projects by code, state or sector..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Presentation Toggle */}
        <button 
          onClick={togglePresentation}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-slate-200"
          title={presentationMode ? 'Exit Presentation' : 'Maximize for Briefings'}
        >
          {presentationMode ? <Minimize size={15} /> : <Maximize size={15} />}
          <span className="hidden sm:inline">{presentationMode ? 'Exit Mode' : 'Presentation'}</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Currently Active User Profile Card */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all text-left group"
              title="Click to view user profile details"
            >
              {/* Avatar with Initials & Active Status Dot */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>

              {/* Person Name & Email display */}
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate max-w-[160px] leading-tight mt-0.5">
                  {user.email}
                </p>
              </div>

              <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shadow">
                      {user.initials}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">{user.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 border border-blue-100">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 py-1">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Department</span>
                    <span className="font-medium text-slate-700 text-right">MoSPI</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Active System</span>
                    <span className="font-medium text-slate-700">SI Ignite Portal</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Currently Online
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors border border-red-200 hover:border-red-600"
                  >
                    <LogOut size={14} /> Sign Out of Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

