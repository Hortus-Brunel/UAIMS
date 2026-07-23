import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './UI';
import { LayoutDashboard, Megaphone, Bookmark, Bell, PenSquare, Shield, Users, Tags, BarChart3, ClipboardList, User, Settings, Sun, Moon, LogOut, School } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',      icon: <LayoutDashboard size={20}/>,  path: '/dashboard',     minLevel: null },
  { label: 'Announcements',  icon: <Megaphone size={20}/>,        path: '/announcements', minLevel: null },
  { label: 'My Bookmarks',   icon: <Bookmark size={20}/>,         path: '/bookmarks',     minLevel: null },
  { label: 'Notifications',  icon: <Bell size={20}/>,             path: '/notifications', minLevel: null },
  { label: '─',              icon: null,                          path: null,             minLevel: null },
  { label: 'Create Post',    icon: <PenSquare size={20}/>,        path: '/create',        minLevel: 'L1_REP' },
  { label: 'Moderation',     icon: <Shield size={20}/>,           path: '/moderation',    minLevel: 'L2_DEPT_ADMIN' },
  { label: 'User Management',icon: <Users size={20}/>,            path: '/users',         minLevel: 'L2_DEPT_ADMIN' },
  { label: 'Categories',     icon: <Tags size={20}/>,             path: '/categories',    minLevel: 'L2_DEPT_ADMIN' },
  { label: 'Analytics',      icon: <BarChart3 size={20}/>,        path: '/analytics',     minLevel: 'L3_FACULTY_ADMIN' },
  { label: 'Audit Logs',     icon: <ClipboardList size={20}/>,    path: '/audit',         minLevel: 'L4_UNIVERSITY_ADMIN' },
  { label: '─',              icon: null,                          path: null,             minLevel: null },
  { label: 'My Profile',     icon: <User size={20}/>,             path: '/profile',       minLevel: null },
  { label: 'Settings',       icon: <Settings size={20}/>,         path: '/settings',      minLevel: null },
  { label: 'About UB',       icon: <School size={20}/>,           path: '/about',         minLevel: null, public: true },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, hasLevel } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allVisible = NAV_ITEMS.filter((item) => {
    if (item.label === '─') return true; // keep temporarily, will prune below
    if (!user && !item.public) return false;
    return !item.minLevel || hasLevel(item.minLevel);
  });

  // Remove leading, trailing, and consecutive dividers
  const visibleItems = allVisible.filter((item, idx, arr) => {
    if (item.label !== '─') return true;
    const prev = arr[idx - 1];
    const next = arr[idx + 1];
    if (!prev || prev.label === '─') return false; // leading or consecutive
    if (!next) return false; // trailing
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 flex flex-col
          bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800
          shadow-sidebar transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
          <img src="/icon.png" alt="UB Logo" className="h-10 w-10 object-contain rounded-full drop-shadow-sm flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-brand-700 dark:text-brand-300 leading-tight">UB - UAIMS</p>
            <p className="text-[10px] text-slate-400 leading-tight">Announcement System</p>
          </div>
          <button onClick={onClose} className="ml-auto btn-ghost btn-icon lg:hidden text-slate-400">✕</button>
        </div>

        {/* User quick info */}
        {user ? (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-white">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.accessLevel?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 text-center">Welcome, Guest</p>
            <Link to="/login" className="btn-primary btn btn-sm w-full mt-2">Sign In</Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {visibleItems.map((item, idx) => {
            if (item.label === '─') {
              return <div key={idx} className="divider !my-2" />;
            }
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <span className="text-slate-400 flex items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button
            onClick={toggle}
            className="nav-item w-full text-left"
          >
            <span className="text-slate-400 flex items-center justify-center">{dark ? <Sun size={20}/> : <Moon size={20}/>}</span>
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="nav-item w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
            >
              <span className="flex items-center justify-center"><LogOut size={20}/></span>
              <span>Log Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
