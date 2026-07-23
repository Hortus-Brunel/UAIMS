import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const schema = z.object({
  identifier: z.string().min(1, 'Email or Matricule is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ identifier, password }) => {
    setServerError('');
    setLoading(true);
    try {
      // Detect if identifier is an email or matricule
      const isEmail = identifier.includes('@');
      const payload = isEmail
        ? { email: identifier, password }
        : { matricule: identifier.toUpperCase(), password };

      await login(payload);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left panel – brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative text-center">
          <div className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-2xl p-2">
            <img src="/icon.png" alt="UB Logo" className="w-full h-full object-contain rounded-full drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold mb-3">UB - UAIMS</h1>
          <p className="text-white/70 text-lg mb-8">University Announcement<br />&amp; Information Management System</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-left">
            {['📢 Targeted Announcements','🎯 Audience Segmentation','🔔 Real-time Notifications','🛡️ Role-Based Access'].map((f) => (
              <div key={f} className="bg-white/10 rounded-xl px-3 py-2">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-brand-700 flex items-center justify-center p-1">
              <img src="/icon.png" alt="UB Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="font-bold text-brand-700 dark:text-brand-300">UB - UAIMS</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Welcome back!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="label">Email or Student ID (Matricule)</label>
              <input
                id="identifier"
                type="text"
                placeholder="e.g. user@gmail.com or FE24A228"
                className={`input ${errors.identifier ? 'input-error' : ''}`}
                {...register('identifier')}
                autoComplete="username"
              />
              {errors.identifier && <p className="field-error">{errors.identifier.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn w-full mt-2"
              id="login-submit-btn"
            >
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
