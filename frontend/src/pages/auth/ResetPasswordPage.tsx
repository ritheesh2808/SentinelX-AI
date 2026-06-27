import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam && tokenRef.current) {
      tokenRef.current.value = tokenParam;
    }
  }, [searchParams]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const tokenVal = tokenRef.current?.value || '';
    const passwordVal = passwordRef.current?.value || '';
    const confirmVal = confirmRef.current?.value || '';

    if (!tokenVal) {
      setError('Reset token is required');
      return;
    }
    if (!passwordVal) {
      setError('New password is required');
      return;
    }
    if (passwordVal !== confirmVal) {
      setError('Passwords do not match');
      return;
    }

    const pwdError = validatePassword(passwordVal);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token: tokenVal, newPassword: passwordVal });
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      const msg = err.response?.data?.error || 'Failed to reset password';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-2xl border border-[#1e293b] bg-[#131c2e] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent"></div>

        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6366f1]/20 to-[#a855f7]/20 border border-[#6366f1]/30 text-[#6366f1] mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc]">Reset Password</h1>
          <p className="mt-2 text-sm text-[#94a3b8]">Create a secure new password for your account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400 text-center animate-pulse">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-[#94a3b8]">
              Reset Token
            </label>
            <input
              id="token"
              type="text"
              ref={tokenRef}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-[#1e293b] bg-[#0b0f19] px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              placeholder="Enter recovery code"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#94a3b8]">
              New Password
            </label>
            <input
              id="password"
              type="password"
              ref={passwordRef}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-[#1e293b] bg-[#0b0f19] px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-[#64748b]">Must contain min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#94a3b8]">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              ref={confirmRef}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-[#1e293b] bg-[#0b0f19] px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366f1]/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'Resetting...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-[#6366f1] hover:text-[#818cf8] transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
