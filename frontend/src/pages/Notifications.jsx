import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { announcementService } from '../services';
import { Spinner, EmptyState, Pagination, SectionHeader } from '../components/UI';

export default function Notifications() {
  const { addToast } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [marking, setMarking] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getNotifications({ page, limit: 15 });
      setData(res.data.data);
    } catch (err) {
      addToast?.('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await announcementService.markNotificationsRead();
      addToast?.('All notifications marked as read.', 'success');
      fetchNotifications();
    } catch (err) {
      addToast?.('Failed to mark notifications as read.', 'error');
    } finally {
      setMarking(false);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await announcementService.markNotificationsRead([id]);
      fetchNotifications();
    } catch (err) {
      addToast?.('Failed to mark notification as read.', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <SectionHeader
        title="Notifications"
        description="Stay updated with targeted system and announcement notifications."
        action={
          data?.notifications?.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              disabled={marking}
              className="btn btn-secondary btn-sm"
            >
              {marking ? <Spinner size="sm" /> : '✓ Mark all read'}
            </button>
          )
        }
      />

      {loading ? (
        <div className="card space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-2 animate-pulse">
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-12 ml-auto" />
            </div>
          ))}
        </div>
      ) : data?.notifications?.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="All caught up!"
          description="You will see notifications here when announcements are posted to your groups."
        />
      ) : (
        <div className="space-y-3">
          <div className="card divide-y divide-slate-100 dark:divide-slate-800 p-0">
            {data.notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkSingleRead(n.id)}
                className={`flex items-start justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl cursor-pointer ${
                  !n.isRead ? 'bg-brand-50/40 dark:bg-brand-950/10 border-l-4 border-brand-500' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {n.message}
                  </p>
                  {n.announcement && (
                    <Link
                      to={`/announcements/${n.announcementId}`}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-1 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View details →
                    </Link>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>

          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
