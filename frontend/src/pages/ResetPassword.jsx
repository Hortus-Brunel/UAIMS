import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services';
import { Spinner } from '../components/UI';

const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
    .regex(/\d/, 'Must contain at least one number.')
    .regex(/[!@#$%^&*]/, 'Must contain at least one special character.'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    if (!token) {
      setServerError('Reset token is missing in URL.');
      return;
    }
    setServerError('');
    setLoading(true);
    try {
      await authService.resetPassword({ token, password });
      setSuccess(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="card w-full max-w-md animate-slide-up">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Reset Password</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">Set your new password credentials.</p>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
              Password reset successful. You can now log in with your new password.
            </div>
            <Link to="/login" className="btn-primary btn w-full text-center block">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!token && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 px-4 py-2.5 text-xs text-red-600">
                ⚠️ Warning: No reset token detected in the URL query string.
              </div>
            )}

            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                {...register('password')}
              />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={loading || !token} className="btn-primary btn w-full">
              {loading ? <Spinner size="sm" /> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
