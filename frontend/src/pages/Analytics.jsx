import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsService } from '../services';
import { Spinner, SectionHeader } from '../components/UI';
import { Users, Megaphone, Shield, Calendar } from 'lucide-react';

// Reusable SVG Bar Chart Component
function SvgBarChart({ data, height = 250 }) {
  if (!data || data.length === 0) return <div className="text-sm text-slate-500 text-center py-10">No data available</div>;
  
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = 40;
  const spacing = 40;
  const width = data.length * (barWidth + spacing) + spacing;
  
  return (
    <div className="w-full overflow-x-auto hide-scrollbar">
      <svg width={width} height={height + 60} className="mx-auto" aria-label="Bar Chart">
        {data.map((item, i) => {
          const barHeight = (item.value / maxVal) * height;
          const x = spacing + i * (barWidth + spacing);
          const y = height - barHeight + 20;
          return (
            <g key={i} className="group transition-transform duration-300">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                className="fill-brand-500 hover:fill-brand-400 transition-colors cursor-pointer"
              />
              <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-xs fill-slate-700 dark:fill-slate-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </text>
              <text x={x + barWidth / 2} y={height + 40} textAnchor="middle" className="text-xs fill-slate-500 capitalize transform -rotate-45 origin-[50%_100%]">
                {item.label}
              </text>
            </g>
          );
        })}
        {/* Baseline */}
        <line x1="20" y1={height + 20} x2={width - 20} y2={height + 20} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="2" />
      </svg>
    </div>
  );
}

// Reusable SVG Donut Chart Component
function SvgDonutChart({ data, size = 250, strokeWidth = 40 }) {
  if (!data || data.length === 0) return <div className="text-sm text-slate-500 text-center py-10">No data available</div>;

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90" aria-label="Donut Chart">
          {data.map((item, i) => {
            const fraction = item.value / total;
            const dashArray = `${fraction * circumference} ${circumference}`;
            const offset = currentOffset;
            currentOffset -= fraction * circumference;
            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out hover:opacity-80 cursor-pointer hover:stroke-[50px]"
              >
                <title>{item.label}: {item.value}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-slate-800 dark:text-white">{total}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
            <span className="text-slate-600 dark:text-slate-300 capitalize min-w-[100px]">{item.label}</span>
            <span className="font-bold text-slate-800 dark:text-white">{item.value}</span>
            <span className="text-xs text-slate-400">({((item.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { addToast } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getOverview()
      .then(({ data }) => setStats(data.data))
      .catch(() => addToast?.('Failed to load system analytics.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  // Prepare data for charts
  const usersChartData = stats?.usersByLevel?.map(u => ({ label: u.level.replace('_', ' ').toLowerCase(), value: u.count })) || [];
  const announcementsChartData = stats?.announcementsByStatus?.map(a => ({ label: a.status.replace('_', ' '), value: a.count })) || [];

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Analytics &amp; Statistics"
        description="Comprehensive dashboard displaying user metrics, post statuses, and system metrics."
      />

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Active Users', value: stats?.totalUsers, icon: <Users size={24} /> },
          { label: 'Total Announcements', value: stats?.totalAnnouncements, icon: <Megaphone size={24} /> },
          { label: 'Pending Moderation', value: stats?.pendingApproval, icon: <Shield size={24} /> },
          { label: 'New Today', value: stats?.publishedToday, icon: <Calendar size={24} /> },
        ].map((item) => (
          <div key={item.label} className="card flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300 flex items-center justify-center flex-shrink-0 shadow-sm">
              {item.icon}
            </div>
            <div>
              <p className="text-2xl font-bold">{item.value ?? 0}</p>
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SVG Bar Chart for Users */}
        <div className="card">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-6 border-b pb-2 dark:border-slate-800">Users by Access Level</h3>
          <SvgBarChart data={usersChartData} />
        </div>

        {/* SVG Donut Chart for Announcements */}
        <div className="card">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-6 border-b pb-2 dark:border-slate-800">Announcements by Status</h3>
          <SvgDonutChart data={announcementsChartData} />
        </div>
      </div>
    </div>
  );
}
