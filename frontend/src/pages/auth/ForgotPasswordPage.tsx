import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailVal = emailRef.current?.value || '';
    if (!emailVal) {
      setError('Email address is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailVal)) {
      setError('Invalid email address format');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: emailVal });
      const resetToken = response.data.resetToken;
      setSuccess(`Reset request received! Redirecting... Token is: ${resetToken}`);
      setTimeout(() => {
        navigate(`/reset-password?token=${resetToken}`);
      }, 3000);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const msg = err.response?.data?.error || 'Failed to request password reset';
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2 4a2 2 0 012 2m-8-3a2 2 0 012-2m-2 4a2 2 0 012 2m-3 4h12a2 2 0 002-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc]">Forgot Password</h1>
          <p className="mt-2 text-sm text-[#94a3b8]">Request a token to recover your account</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              ref={emailRef}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-[#1e293b] bg-[#0b0f19] px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#475569] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              placeholder="operator@sentinelx.ai"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366f1]/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'Requesting...' : 'Send Recovery Token'}
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
