import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  { icon: '🎯', title: 'Targeted Information', desc: 'Only receive announcements relevant to your faculty, department, class, or clubs.' },
  { icon: '🔔', title: 'Real-time Notifications', desc: 'Instant alerts when new announcements are published to your groups.' },
  { icon: '🛡️', title: 'Secure & Reliable', desc: 'Role-based access control ensures only authorized users manage announcements.' },
];

export default function Landing() {
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-brand-700 flex items-center justify-center shadow-sm overflow-hidden">
              <img src="http://localhost:5000/uploads/icon.png" alt="UAIMS Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-sm text-brand-700 dark:text-brand-300 leading-tight">UAIMS</p>
              <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">University Announcement System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="btn-ghost btn-icon text-slate-500">{dark ? '☀️' : '🌙'}</button>
            <Link to="/login" className="btn-secondary btn btn-sm">Log In</Link>
            <Link to="/register" className="btn-primary btn btn-sm">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-white">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 badge bg-white/10 text-white border border-white/20 mb-6 px-3 py-1">
              🎓 University Communication Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Stay Informed.<br />
              <span className="text-accent-light">Stay Ahead.</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              All university announcements in one place — delivered to the right people,
              at the right time. Targeted by faculty, department, class, and clubs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn bg-white text-brand-700 hover:bg-slate-100 btn-lg font-semibold shadow-lg">
                Get Started Free
              </Link>
              <Link to="/login" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 btn-lg">
                Log In →
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full fill-slate-50 dark:fill-slate-950">
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
            Everything your university needs
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A centralized platform that eliminates misinformation and ensures every announcement
            reaches exactly the intended audience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-700 dark:bg-brand-950">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: '6', label: 'Access Levels' },
            { value: '8+', label: 'Audience Scopes' },
            { value: '100%', label: 'Targeted' },
            { value: '∞', label: 'Announcements' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-accent-light">{s.value}</p>
              <p className="text-sm text-white/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Join your university's centralized announcement platform today.
        </p>
        <Link to="/register" className="btn-primary btn btn-lg inline-flex">
          Create Your Account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-8 text-center">
        <p className="text-sm text-slate-400">
          © 2026 UAIMS — University Announcement &amp; Information Management System
        </p>
      </footer>
    </div>
  );
}
