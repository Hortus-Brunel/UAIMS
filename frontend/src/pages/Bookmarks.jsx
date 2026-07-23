import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { announcementService } from '../services';
import { SkeletonCard, EmptyState, Pagination, SectionHeader } from '../components/UI';
import AnnouncementCard from '../components/AnnouncementCard';

export default function Bookmarks() {
  const { addToast } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getBookmarks({ page, limit: 12 });
      setData(res.data.data);
    } catch (err) {
      addToast?.('Failed to load bookmarked announcements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [page]);

  return (
    <div>
      <SectionHeader
        title="My Bookmarks"
        description="Access your saved announcements offline or whenever you need them quickly."
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data?.bookmarks?.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No bookmarks yet"
          description="Bookmark announcements by clicking the bookmark icon on any announcement card."
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.bookmarks.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} onBookmarkChange={fetchBookmarks} />
            ))}
          </div>
          <Pagination pagination={data?.pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
