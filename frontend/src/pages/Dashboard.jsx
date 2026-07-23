import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { analyticsService } from '../services';
import { announcementService } from '../services';
import { SkeletonCard, SectionHeader, SkeletonRow } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import AnnouncementCard from '../components/AnnouncementCard';

function StatCard({ icon, label, value, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300',
    green: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
  };
  return (
    <div className="card card-hover flex items-center gap-4">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value ?? '—'}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, hasLevel } = useAuth();
  const { addToast } = useOutletContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const feedRes = await announcementService.getFeed({ page: 1, limit: 4 });
        setFeed(feedRes.data.data.announcements || []);

        if (hasLevel('L3_FACULTY_ADMIN')) {
          const statsRes = await analyticsService.getOverview();
          setStats(statsRes.data.data);
        }
      } catch (err) {
        addToast?.('Failed to load dashboard.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="card bg-gradient-to-br from-brand-700 to-brand-900 text-white border-0">
        <p className="text-sm text-white/70 mb-1">{greeting},</p>
        <h1 className="text-3xl font-bold">{firstName} 👋</h1>
        <p className="text-white/70 text-sm mt-1">{user?.accessLevel?.replace(/_/g, ' ')} · {user?.matricule}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => navigate('/announcements')} className="btn bg-white/10 hover:bg-white/20 text-white text-sm">
            📢 View Announcements
          </button>
          {hasLevel('L1_REP') && (
            <button onClick={() => navigate('/create')} className="btn bg-white text-brand-700 hover:bg-slate-100 text-sm font-semibold">
              ✏️ New Post
            </button>
          )}
        </div>
      </div>

      {/* Admin Stats */}
      {hasLevel('L3_FACULTY_ADMIN') && (
        <div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">System Overview</h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="👥" label="Active Users" value={stats?.totalUsers} color="brand" />
              <StatCard icon="📢" label="Total Announcements" value={stats?.totalAnnouncements} color="green" />
              <StatCard icon="⏳" label="Pending Approval" value={stats?.pendingApproval} color="amber" />
              <StatCard icon="📅" label="Published Today" value={stats?.publishedToday} color="red" />
            </div>
          )}
        </div>
      )}

      {/* Recent feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Recent Announcements</h2>
          <button onClick={() => navigate('/announcements')} className="btn-ghost btn btn-sm text-brand-600 dark:text-brand-400">
            View all →
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : feed.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">No announcements yet for your groups.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {feed.map((a) => <AnnouncementCard key={a.id} announcement={a} compact />)}
          </div>
        )}
      </div>

      {/* User level breakdown (admin) */}
      {hasLevel('L3_FACULTY_ADMIN') && stats?.usersByLevel && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Users by Access Level</h3>
          <div className="space-y-3">
            {stats.usersByLevel.map((g) => {
              const maxCount = Math.max(...stats.usersByLevel.map((x) => x.count), 1);
              const pct = Math.round((g.count / maxCount) * 100);
              return (
                <div key={g.level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{g.level.replace('_', ' ')}</span>
                    <span className="font-semibold">{g.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
