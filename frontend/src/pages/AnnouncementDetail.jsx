import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { announcementService } from '../services';
import { Spinner, StatusBadge, Avatar, ConfirmDialog } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { Paperclip, Download, ThumbsUp, ThumbsDown, Repeat2, MessageCircle, Trash2, Send } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
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

const STATUS_ACTIONS = {
  pending_approval: [{ label: '✅ Approve', value: 'approved', cls: 'btn-primary' }, { label: '❌ Reject', value: 'rejected', cls: 'btn-danger' }],
  approved:         [{ label: '📢 Publish', value: 'published', cls: 'btn-primary' }, { label: '❌ Reject', value: 'rejected', cls: 'btn-danger' }],
  published:        [{ label: '📦 Archive', value: 'archived', cls: 'btn-secondary' }],
  draft:            [{ label: '📤 Submit for Approval', value: 'pending_approval', cls: 'btn-primary' }],
};

// ─── Reactions Bar ────────────────────────────────────────────────────────────
function ReactionsBar({ announcementId, addToast }) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState({ counts: [], userReactions: [] });
  const [loading, setLoading] = useState('');

  useEffect(() => {
    announcementService.getReactions(announcementId)
      .then(({ data }) => setReactions(data.data))
      .catch(() => {});
  }, [announcementId]);

  const getCount = (type) => {
    const entry = reactions.counts.find((c) => c.type === type);
    return entry?._count?.type || 0;
  };

  const hasReacted = (type) => reactions.userReactions.includes(type);

  const handleReact = async (type) => {
    if (loading) return;
    setLoading(type);
    try {
      const { data } = await announcementService.react(announcementId, type);
      setReactions({ counts: data.data.counts, userReactions: data.data.added
        ? [...reactions.userReactions.filter(r => r !== type), type]
        : reactions.userReactions.filter(r => r !== type)
      });
    } catch (err) {
      addToast?.('Failed to react.', 'error');
    } finally {
      setLoading('');
    }
  };

  const btn = (type, icon, label) => (
    <button
      onClick={() => handleReact(type)}
      disabled={!!loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        hasReacted(type)
          ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 ring-1 ring-brand-400'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
      aria-label={label}
    >
      {loading === type ? <Spinner size="xs" /> : icon}
      <span>{getCount(type) || 0}</span>
    </button>
  );

  return (
    <div className="flex items-center gap-2 py-3 border-t border-slate-100 dark:border-slate-800 mt-4">
      {btn('LIKE', <ThumbsUp size={16} />, 'Like')}
      {btn('DISLIKE', <ThumbsDown size={16} />, 'Dislike')}
      {btn('RESHARE', <Repeat2 size={16} />, 'Reshare')}
    </div>
  );
}

// ─── Comments Section ─────────────────────────────────────────────────────────
function CommentsSection({ announcementId, addToast }) {
  const { user, hasLevel } = useAuth();
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState('');
  const [draft, setDraft] = useState('');
  const [showComments, setShowComments] = useState(false);

  const loadComments = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await announcementService.getComments(announcementId, { page: p, limit: 10 });
      setComments(p === 1 ? data.data.comments : [...comments, ...data.data.comments]);
      setTotal(data.data.pagination.total);
    } catch {
      addToast?.('Failed to load comments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await announcementService.addComment(announcementId, draft.trim());
      setComments((prev) => [data.data.comment, ...prev]);
      setTotal((t) => t + 1);
      setDraft('');
    } catch (err) {
      addToast?.('Failed to post comment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    setDeleting(commentId);
    try {
      await announcementService.deleteComment(announcementId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotal((t) => t - 1);
    } catch {
      addToast?.('Failed to delete comment.', 'error');
    } finally {
      setDeleting('');
    }
  };

  const toggleComments = () => {
    if (!showComments) loadComments(1);
    setShowComments((v) => !v);
  };

  return (
    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
      <button
        onClick={toggleComments}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <MessageCircle size={16} />
        {total > 0 ? `${total} comment${total > 1 ? 's' : ''}` : 'Add a comment'}
        <span className="text-xs">{showComments ? '▲' : '▼'}</span>
      </button>

      {showComments && (
        <div className="mt-4 space-y-4">
          {/* Post a comment */}
          <form onSubmit={handleSubmit} className="flex gap-3 items-start">
            <Avatar user={user} size="sm" />
            <div className="flex-1 flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a comment…"
                rows={2}
                className="input flex-1 resize-none text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              />
              <button
                type="submit"
                disabled={submitting || !draft.trim()}
                className="btn-primary btn btn-icon shrink-0 self-end"
                aria-label="Post comment"
              >
                {submitting ? <Spinner size="sm" /> : <Send size={16} />}
              </button>
            </div>
          </form>

          {/* Comment list */}
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[1,2].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <Avatar user={c.user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.user.fullName}</span>
                        <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                  {(c.user.id === user?.id || hasLevel('L2_DEPT_ADMIN')) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost btn-icon text-red-400 hover:text-red-600 self-start mt-1"
                      aria-label="Delete comment"
                    >
                      {deleting === c.id ? <Spinner size="xs" /> : <Trash2 size={14} />}
                    </button>
                  )}
                </div>
              ))}

              {comments.length < total && (
                <button
                  onClick={() => { const next = page + 1; setPage(next); loadComments(next); }}
                  className="w-full text-xs text-brand-600 dark:text-brand-400 hover:underline py-2"
                >
                  Load more comments…
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnnouncementDetail() {
  const { id } = useParams();
  const { addToast } = useOutletContext();
  const { user, hasLevel } = useAuth();
  const navigate = useNavigate();

  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusLoading, setStatusLoading] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const fetchAnnouncement = async () => {
    try {
      const res = await announcementService.getById(id);
      setAnnouncement(res.data.data.announcement);
    } catch {
      setError('Announcement not found or you do not have access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncement(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'rejected') { setShowRejectionInput(true); return; }
    setStatusLoading(newStatus);
    try {
      await announcementService.changeStatus(id, { status: newStatus });
      addToast?.(`Status changed to ${newStatus}`, 'success');
      fetchAnnouncement();
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to change status.', 'error');
    } finally {
      setStatusLoading('');
    }
  };

  const handleReject = async () => {
    setStatusLoading('rejected');
    try {
      await announcementService.changeStatus(id, { status: 'rejected', rejectionReason });
      addToast?.('Announcement rejected.', 'warning');
      setShowRejectionInput(false);
      fetchAnnouncement();
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Failed to reject.', 'error');
    } finally {
      setStatusLoading('');
    }
  };

  const handleDelete = async () => {
    try {
      await announcementService.delete(id);
      addToast?.('Announcement deleted.', 'success');
      navigate('/announcements');
    } catch (err) {
      addToast?.(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error || !announcement) return (
    <div className="card text-center py-16">
      <p className="text-4xl mb-4">⚠️</p>
      <p className="text-slate-500">{error || 'Announcement not found.'}</p>
      <button onClick={() => navigate('/announcements')} className="btn-secondary btn mt-4">← Back</button>
    </div>
  );

  const a = announcement;
  const isOwner = user?.id === a.author?.id;
  const canModerate = hasLevel('L2_DEPT_ADMIN');
  const availableActions = (canModerate ? STATUS_ACTIONS[a.status] : null) || [];

  // Map scopeId back to a friendly name for display
  const targetLabel = (t) => {
    if (!t.scopeId) return `${t.scope} (All)`;
    return `${t.scope} (${t.scopeId.slice(0, 8)}…)`;
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <button onClick={() => navigate(-1)} className="btn-ghost btn mb-4 text-slate-500">← Back</button>

      <div className="card">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar user={a.author} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 dark:text-white">{a.author?.fullName}</p>
              <p className="text-xs text-slate-400">{timeAgo(a.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {a.isPinned && <span className="text-brand-400 text-xl" title="Pinned">📌</span>}
            {a.isImportant && <span className="text-red-400 text-xl" title="Important">❗</span>}
            <StatusBadge status={a.status} />
          </div>
        </div>

        {/* Category */}
        {a.category && (
          <span className="badge mb-3 inline-block" style={{ backgroundColor: `${a.category.colorHex}22`, color: a.category.colorHex }}>
            {a.category.name}
          </span>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{a.title}</h1>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-6">
          {a.content}
        </div>

        {/* Attachments */}
        {a.attachments?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Paperclip size={16} /> Attachments ({a.attachments.length})
            </h4>
            <div className="flex flex-col gap-2">
              {a.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                      <Paperclip size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{att.fileName}</p>
                      <p className="text-xs text-slate-500">{att.fileSizeBytes ? (att.fileSizeBytes / 1024).toFixed(1) + ' KB' : 'Unknown size'}</p>
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 pr-2">
                    <Download size={20} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Rejection reason */}
        {a.status === 'rejected' && a.rejectionReason && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400 mb-4">
            <strong>Rejection reason:</strong> {a.rejectionReason}
          </div>
        )}

        {/* Audience targets */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Audience</p>
          <div className="flex flex-wrap gap-2">
            {(a.targets || []).map((t) => (
              <span key={t.id} className="badge badge-blue">{targetLabel(t)}</span>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="text-xs text-slate-400 space-y-1 mb-4">
          {a.publishAt && <p>📅 Scheduled: {new Date(a.publishAt).toLocaleString()}</p>}
          {a.expiresAt && <p>⏰ Expires: {new Date(a.expiresAt).toLocaleString()}</p>}
          {a.approvedAt && <p>✅ Approved: {timeAgo(a.approvedAt)} by {a.moderator?.fullName}</p>}
        </div>

        {/* Reactions (only on published) */}
        {a.status === 'published' && (
          <ReactionsBar announcementId={id} addToast={addToast} />
        )}

        {/* Admin/author actions */}
        {(availableActions.length > 0 || isOwner || canModerate) && (
          <div className="flex flex-wrap gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            {availableActions.map((action) => (
              <button
                key={action.value}
                onClick={() => handleStatusChange(action.value)}
                disabled={!!statusLoading}
                className={`${action.cls} btn`}
              >
                {statusLoading === action.value ? <Spinner size="sm" /> : action.label}
              </button>
            ))}
            {(isOwner || canModerate) && (
              <button onClick={() => navigate(`/announcements/${id}/edit`)} className="btn-secondary btn">✏️ Edit</button>
            )}
            {(isOwner || canModerate) && (
              <button onClick={() => setConfirmDelete(true)} className="btn-danger btn">🗑️ Delete</button>
            )}
          </div>
        )}

        {/* Rejection input */}
        {showRejectionInput && (
          <div className="mt-4 space-y-2">
            <label className="label">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this announcement is being rejected…"
              className="input h-20 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleReject} disabled={!!statusLoading} className="btn-danger btn">
                {statusLoading === 'rejected' ? <Spinner size="sm" /> : 'Confirm Rejection'}
              </button>
              <button onClick={() => setShowRejectionInput(false)} className="btn-secondary btn">Cancel</button>
            </div>
          </div>
        )}

        {/* Comments */}
        {a.status === 'published' && (
          <CommentsSection announcementId={id} addToast={addToast} />
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Announcement"
        message="Are you sure you want to permanently delete this announcement?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        danger
      />
    </div>
  );
}
