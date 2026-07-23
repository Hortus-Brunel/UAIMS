import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { announcementService } from '../services';
import { SkeletonCard, EmptyState, Pagination, SectionHeader } from '../components/UI';
import AnnouncementCard from '../components/AnnouncementCard';

const FILTERS = [
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Draft', value: 'draft' },
];

export default function Moderation() {
  const { addToast } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending_approval');
  const [page, setPage] = useState(1);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getAll({ page, limit: 12, status });
      setData(res.data.data);
    } catch (err) {
      addToast?.('Failed to fetch announcements for moderation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page, status]);

  const handleFilterChange = (val) => {
    setStatus(val);
    setPage(1);
  };

  return (
    <div>
      <SectionHeader
        title="Moderation Portal"
        description="Review, approve, reject, or manage announcement lifecycle states."
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              status === f.value
                ? 'border-brand-600 text-brand-700 dark:text-brand-300 dark:border-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data?.announcements?.length === 0 ? (
        <EmptyState
          icon="🛡️"
          title={`No announcements in ${status.replace('_', ' ')}`}
          description="Everything is current. No entries require action."
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} onBookmarkChange={fetchAnnouncements} />
            ))}
          </div>
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
