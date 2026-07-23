import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services';
import { Spinner } from '../components/UI';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState(''); // Dev helper

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setMessage('');
    setResetToken('');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage('If an account with that email exists, a password reset link has been sent.');
      if (res.data.data.resetToken) {
        setResetToken(res.data.data.resetToken); // Dev shortcut
      }
    } catch {
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="card w-full max-w-md animate-slide-up">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Forgot Password</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter your email and we'll send you a password reset link.</p>

        {message ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
              {message}
            </div>
            {resetToken && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 px-4 py-3 text-xs">
                <p className="font-semibold mb-1">🛠️ Development shortcut token:</p>
                <code className="break-all bg-white p-1 block border rounded">{resetToken}</code>
                <Link to={`/reset-password?token=${resetToken}`} className="btn btn-secondary btn-sm w-full mt-2 text-center block">
                  Proceed to Reset →
                </Link>
              </div>
            )}
            <Link to="/login" className="btn-secondary btn w-full text-center block">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn w-full">
              {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
            </button>
            <Link to="/login" className="text-sm text-brand-600 dark:text-brand-400 hover:underline block text-center mt-4">
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
