import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsService } from '../services';
import { Spinner, SectionHeader, Pagination, EmptyState, SearchInput } from '../components/UI';

export default function AuditLogs() {
  const { addToast } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAuditLogs({ page, limit: 20, action: action || undefined });
      setData(res.data.data);
    } catch {
      addToast?.('Failed to fetch system audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action]);

  return (
    <div>
      <SectionHeader
        title="Security Audit Logs"
        description="Chronological record of privileged transactions, access changes, and moderation history."
      />

      <div className="flex gap-4 mb-6">
        <SearchInput
          value={action}
          onChange={(v) => { setAction(v); setPage(1); }}
          placeholder="Filter by action code (e.g. LOGIN, UPDATE)…"
          className="flex-1 max-w-sm"
        />
      </div>

      {loading ? (
        <div className="card space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-2 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/12 ml-auto" />
            </div>
          ))}
        </div>
      ) : data?.logs?.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No log entries found"
          description="Audit trail is clear."
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 text-xs uppercase">
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Actor</th>
                  <th className="px-6 py-4 font-semibold">Action Event</th>
                  <th className="px-6 py-4 font-semibold">Location (IP)</th>
                  <th className="px-6 py-4 font-semibold">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {data.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-sans font-medium text-slate-700 dark:text-slate-300">
                      {log.actor?.fullName || 'System'}
                      <span className="block text-[10px] text-slate-400 font-mono">{log.actor?.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-brand-600 dark:text-brand-400">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{log.ipAddress || '—'}</td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-400" title={JSON.stringify(log.metadata)}>
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
