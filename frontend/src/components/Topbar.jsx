import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, SearchInput } from './UI';
import { announcementService } from '../services';
import { Menu, Search, Bell } from 'lucide-react';

// Plays a premium dual-tone chime using the Web Audio API (no file needed)
function playNotificationChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const playTone = (freq, startTime, duration, gainValue) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(gainValue, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.3, 0.25);        // A5 — first note
    playTone(1174.66, now + 0.18, 0.45, 0.18); // D6 — second note (higher, softer)
  } catch {
    // Web Audio not available — silently skip
  }
}

export default function Topbar({ onMenuClick, addToast }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [unread, setUnread] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const lastUnreadRef = useRef(null); // track previous unread count

  // Fetch unread count and trigger sound + toast if new notifications arrive
  const checkNotifications = useCallback(async () => {
    try {
      const { data } = await announcementService.getNotifications({ unreadOnly: true, limit: 5 });
      const count = data.data.unreadCount || 0;
      const notifications = data.data.notifications || [];

      setUnread(count);

      // Only alert if we have previously fetched a baseline and the count grew
      if (lastUnreadRef.current !== null && count > lastUnreadRef.current) {
        playNotificationChime();
        // Show the latest notification as a toast
        const newest = notifications[0];
        if (newest && addToast) {
          addToast(`🔔 ${newest.message}`, 'info');
        }
      }
      lastUnreadRef.current = count;
    } catch {
      // Silently ignore errors
    }
  }, [addToast]);

  // Initial check + polling every 12 seconds
  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 12000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/announcements?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setShowSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-4 px-4 sm:px-6
                        bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
                        border-b border-slate-100 dark:border-slate-800">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="btn-ghost btn-icon lg:hidden text-slate-500"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Header / Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-slate-800 dark:text-white truncate">
          University of Buea
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
          UAIMS
        </p>
      </div>

      {/* Search — desktop */}
      <div className="hidden md:block w-72" onKeyDown={handleSearch}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search announcements…"
          className="[&_input]:py-2"
        />
        {search && (
          <div className="absolute mt-1 text-xs text-slate-400">Press Enter to search</div>
        )}
      </div>

      {/* Search icon (mobile) */}
      <button
        className="btn-ghost btn-icon md:hidden text-slate-500"
        onClick={() => setShowSearch((v) => !v)}
        aria-label="Search"
      ><Search size={20} /></button>

      {/* Notifications */}
      <button
        onClick={() => navigate('/notifications')}
        className="btn-ghost btn-icon relative text-slate-500"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Avatar */}
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="Profile"
      >
        <Avatar user={user} size="sm" />
        <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
          {user?.fullName?.split(' ')[0]}
        </span>
      </button>

      {/* Mobile search bar */}
      {showSearch && (
        <div className="absolute top-full left-0 right-0 px-4 pb-3 pt-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 md:hidden" onKeyDown={handleSearch}>
          <input
            autoFocus
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements…"
            className="input"
          />
        </div>
      )}
    </header>
  );
}
