import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge, Avatar, ConfirmDialog } from './UI';
import { announcementService } from '../services';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AnnouncementCard({ announcement: a, onBookmarkChange, compact = false }) {
  const { user, hasLevel } = useAuth();
  const navigate = useNavigate();
  const [bookmarking, setBookmarking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  const isOwner = user?.id === a.authorId || user?.id === a.author?.id;
  const canModerate = hasLevel('L2_DEPT_ADMIN');

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarking(true);
    try {
      // We optimistically check if bookmarked via count — simplified toggle
      await announcementService.bookmark(a.id).catch(async () => {
        // Already bookmarked — remove
        await announcementService.unbookmark(a.id);
      });
      onBookmarkChange?.();
    } finally {
      setBookmarking(false);
    }
  };

  const handleDelete = async () => {
    try {
      await announcementService.delete(a.id);
      setDeleted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const category = a.category;
  const targets = a.targets || [];
  const scopeLabel = targets.map((t) => t.scope.toLowerCase()).join(', ');

  return (
    <>
      <Link
        to={`/announcements/${a.id}`}
        className={`card card-hover flex flex-col gap-3 group no-underline
          ${a.isPinned ? 'ring-2 ring-brand-300 dark:ring-brand-700' : ''}
          ${a.isImportant ? 'border-l-4 border-l-red-400' : ''}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar user={a.author} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{a.author?.fullName}</p>
              <p className="text-[10px] text-slate-400">{timeAgo(a.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {a.isPinned && <span title="Pinned" className="text-brand-400">📌</span>}
            {a.isImportant && <span title="Important" className="text-red-400">❗</span>}
            <StatusBadge status={a.status} />
          </div>
        </div>

        {/* Category */}
        {category && (
          <span
            className="badge"
            style={{ backgroundColor: `${category.colorHex}22`, color: category.colorHex }}
          >
            {category.name}
          </span>
        )}

        {/* Content */}
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-1 line-clamp-2 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
            {a.title}
          </h3>
          {!compact && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {a.content}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 capitalize">📍 {scopeLabel || 'general'}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              disabled={bookmarking}
              className="btn-ghost btn-icon text-xs text-slate-400 hover:text-brand-600"
              title="Bookmark"
            >
              🔖
            </button>
            {(isOwner || canModerate) && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/announcements/${a.id}/edit`); }}
                  className="btn-ghost btn-icon text-xs text-slate-400 hover:text-amber-500"
                  title="Edit"
                >✏️</button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(true); }}
                  className="btn-ghost btn-icon text-xs text-slate-400 hover:text-red-500"
                  title="Delete"
                >🗑️</button>
              </>
            )}
          </div>
        </div>
      </Link>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        danger
      />
    </>
  );
}
