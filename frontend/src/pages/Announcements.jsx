import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { announcementService } from '../services';
import { SkeletonCard, EmptyState, Pagination, StatusBadge, SectionHeader, SearchInput } from '../components/UI';
import AnnouncementCard from '../components/AnnouncementCard';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: '🟢 Published', value: 'published' },
  { label: '📌 Pinned', value: '__pinned' },
];

export default function Announcements() {
  const { addToast } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getFeed({ page, limit: 12, search: search || undefined });
      setData(res.data.data);
    } catch (err) {
      addToast?.('Failed to load announcements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page, search]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div>
      <SectionHeader
        title="Announcements"
        description="Announcements targeted to you based on your academic groups."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search announcements…"
          className="flex-1 max-w-sm"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data?.announcements?.length === 0 ? (
        <EmptyState
          icon="📢"
          title="No announcements yet"
          description="Announcements targeted to your groups will appear here."
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} onBookmarkChange={fetchAnnouncements} />
            ))}
          </div>
          <Pagination pagination={data?.pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
