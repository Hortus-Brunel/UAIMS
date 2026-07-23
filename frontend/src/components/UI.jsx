/* Reusable shared UI components for UAIMS */

// ─── Loading Spinner ──────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' };
  return (
    <div
      className={`${sizes[size]} rounded-full border-brand-200 border-t-brand-700 animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

// ─── Page Loader ──────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-700 flex items-center justify-center shadow-lg p-2">
          <img src="/icon.png" alt="UB Logo" className="w-full h-full object-contain rounded-full" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
          <span className="text-white font-bold text-lg hidden">U</span>
        </div>
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading UAIMS…</p>
      </div>
    </div>
  );
}

// ─── Skeleton Loaders ─────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-4 w-2/3 mb-3" />
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-4/5 mb-4" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="skeleton h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="skeleton h-4 w-1/3 mb-2" />
        <div className="skeleton h-3 w-1/2" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
const STATUS_LABELS = {
  draft: 'Draft', pending_approval: 'Pending', approved: 'Approved',
  scheduled: 'Scheduled', published: 'Published', archived: 'Archived', rejected: 'Rejected',
};

export function StatusBadge({ status }) {
  return (
    <span className={`status-${status} badge`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Access Level Badge ───────────────────────────────────────
const LEVEL_LABELS = {
  L0_STUDENT: { label: 'Student', cls: 'badge-slate' },
  L1_REP: { label: 'Rep/Leader', cls: 'badge-blue' },
  L2_DEPT_ADMIN: { label: 'Dept Admin', cls: 'badge-yellow' },
  L3_FACULTY_ADMIN: { label: 'Faculty Admin', cls: 'badge-purple' },
  L4_UNIVERSITY_ADMIN: { label: 'Uni Admin', cls: 'badge-green' },
  L5_SUPER_ADMIN: { label: 'Super Admin', cls: 'badge-red' },
};

export function LevelBadge({ level }) {
  const { label, cls } = LEVEL_LABELS[level] || { label: level, cls: 'badge-slate' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Toast Notifications ──────────────────────────────────────
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onRemove(t.id)}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lg text-sm font-medium cursor-pointer animate-slide-up
            ${t.type === 'error'   ? 'bg-red-600 text-white' :
              t.type === 'warning' ? 'bg-amber-500 text-white' :
              t.type === 'info'    ? 'bg-accent text-white' :
                                     'bg-emerald-600 text-white'}`}
        >
          <span>{t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : '✓'}</span>
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon || '📭'}</div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────
export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn-ghost btn-sm disabled:opacity-40"
      >← Prev</button>

      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`btn btn-sm w-9 ${p === page ? 'btn-primary' : 'btn-ghost'}`}
          >{p}</button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-ghost btn-sm disabled:opacity-40"
      >Next →</button>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="card max-w-md w-full animate-slide-up shadow-xl">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary btn">Cancel</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger btn' : 'btn-primary btn'}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Wrapper ────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`card w-full ${sizes[size]} animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-icon text-slate-400 hover:text-slate-600">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
function resolveAvatarSrc(avatarUrl) {
  if (!avatarUrl) return null;

  const isAbsolute = /^(https?:)?\/\//i.test(avatarUrl) || /^data:/i.test(avatarUrl);
  if (isAbsolute) return avatarUrl;

  if (avatarUrl.startsWith('/')) {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const backendBase = apiBase.startsWith('http')
      ? apiBase.replace(/\/api\/?$/i, '')
      : window.location.origin;
    return `${backendBase}${avatarUrl}`;
  }

  return avatarUrl;
}

export function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' };
  const initials = user?.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'U';

  if (user?.avatarUrl) {
    const src = resolveAvatarSrc(user.avatarUrl);
    return <img src={src} alt={user.fullName} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800`} />;
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-brand-700 flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
      />
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────
export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h1>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
