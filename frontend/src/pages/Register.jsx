import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';
import { organizationService } from '../services';
import { getApiErrorMessage } from '../utils/apiError';

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  matricule: z
    .string()
    .regex(/^[A-Z]{2}\d{2}[A-Z]\d{3,4}$/i, 'Invalid format. Example: FE24A228')
    .toUpperCase(),
  password: z
    .string()
    .min(8, 'Min 8 characters.')
    .regex(/[A-Z]/, 'Must contain uppercase letter.')
    .regex(/[a-z]/, 'Must contain lowercase letter.')
    .regex(/\d/, 'Must contain a number.')
    .regex(/[!@#$%^&*]/, 'Must contain a special character (!@#$%^&*).'),
  confirmPassword: z.string(),
  primaryFacultyId: z.string().optional(),
  primaryDepartmentId: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [step, setStep] = useState(1); // 2-step form

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const selectedFacultyId = watch('primaryFacultyId');

  useEffect(() => {
    organizationService.getFaculties().then(({ data }) => setFaculties(data.data.faculties || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      organizationService.getDepartments(selectedFacultyId)
        .then(({ data }) => setDepartments(data.data.departments || []))
        .catch(() => setDepartments([]));
    } else {
      setDepartments([]);
    }
  }, [selectedFacultyId]);

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const { authService } = await import('../services');
      const { confirmPassword, ...payload } = data;
      payload.matricule = payload.matricule.toUpperCase();
      await authService.register(payload);
      // Auto-login after register
      await login({ email: data.email, password: data.password });
      navigate('/dashboard');
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative text-center">
          <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-4 shadow-2xl p-2">
            <img src="/icon.png" alt="UB Logo" className="w-full h-full object-contain rounded-full drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join UB - UAIMS</h1>
          <p className="text-white/70 mb-6">Create your account and connect with your university community.</p>
          <div className="text-sm text-left space-y-2">
            {['✓ Target-based announcements', '✓ Real-time notifications', '✓ Class & club feeds', '✓ Secure & private'].map((f) => (
              <p key={f} className="text-white/80">{f}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto p-6 py-10">
        <div className="w-full max-w-lg animate-slide-up">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-brand-700 flex items-center justify-center p-1">
              <img src="/icon.png" alt="UB Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="font-bold text-brand-700 dark:text-brand-300">UB - UAIMS</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Create your account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Fill in the details to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Personal details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name *</label>
                <input type="text" placeholder="e.g. John Doe" className={`input ${errors.fullName ? 'input-error' : ''}`} {...register('fullName')} />
                {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input type="email" placeholder="you@example.com" className={`input ${errors.email ? 'input-error' : ''}`} {...register('email')} autoComplete="email" />
                {errors.email && <p className="field-error">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Matricule *</label>
                <input type="text" placeholder="FE24A228" className={`input uppercase ${errors.matricule ? 'input-error' : ''}`} {...register('matricule')} />
                {errors.matricule && <p className="field-error">{errors.matricule.message}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars" className={`input pr-10 ${errors.password ? 'input-error' : ''}`} {...register('password')} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm" tabIndex={-1}>{showPassword ? '🙈' : '👁️'}</button>
                </div>
                {errors.password && <p className="field-error">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirm Password *</label>
                <input type={showPassword ? 'text' : 'password'} placeholder="Repeat password" className={`input ${errors.confirmPassword ? 'input-error' : ''}`} {...register('confirmPassword')} autoComplete="new-password" />
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Academic info (optional) */}
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Academic Information (Optional)</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Faculty</label>
                  <select className="input" {...register('primaryFacultyId')}>
                    <option value="">Select faculty…</option>
                    {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select className="input" {...register('primaryDepartmentId')} disabled={!selectedFacultyId || departments.length === 0}>
                    <option value="">Select department…</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {serverError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary btn w-full" id="register-submit-btn">
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
