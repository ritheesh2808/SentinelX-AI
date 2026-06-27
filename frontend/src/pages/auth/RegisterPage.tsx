import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; general?: string }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);

    const fullNameVal = fullNameRef.current?.value || '';
    const emailVal = emailRef.current?.value || '';
    const passwordVal = passwordRef.current?.value || '';

    const newErrors: typeof errors = {};

    if (!fullNameVal.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!emailVal.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailVal)) {
      newErrors.email = 'Invalid email address format';
    }

    if (!passwordVal) {
      newErrors.password = 'Password is required';
    } else {
      const pwdErr = validatePassword(passwordVal);
      if (pwdErr) {
        newErrors.password = pwdErr;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        fullName: fullNameVal,
        email: emailVal,
        password: passwordVal,
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      console.error('Registration error:', err);
      const serverMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setErrors({ general: serverMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-2xl border border-[#1e293b] bg-[#131c2e] p-8 shadow-2xl relative overflow-hidden">
        {/* Border glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent"></div>

        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6366f1]/20 to-[#a855f7]/20 border border-[#6366f1]/30 text-[#6366f1] mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc]">Create Security Account</h1>
          <p className="mt-2 text-sm text-[#94a3b8]">Register as a SentinelX AI Operator</p>
        </div>

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400 text-center animate-pulse">
            {success}
          </div>
        )}

        {errors.general && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 text-center">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[#94a3b8] mb-1 text-left">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              ref={fullNameRef}
              disabled={isLoading}
              className={`w-full rounded-lg border ${errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e293b] focus:border-[#6366f1]'} bg-[#0b0f19] px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition-all placeholder:text-[#475569]`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-400 text-left">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8] mb-1 text-left">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              ref={emailRef}
              disabled={isLoading}
              className={`w-full rounded-lg border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e293b] focus:border-[#6366f1]'} bg-[#0b0f19] px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition-all placeholder:text-[#475569]`}
              placeholder="operator@sentinelx.ai"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400 text-left">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#94a3b8] mb-1 text-left">
              Password
            </label>
            <input
              id="password"
              type="password"
              ref={passwordRef}
              disabled={isLoading}
              className={`w-full rounded-lg border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e293b] focus:border-[#6366f1]'} bg-[#0b0f19] px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition-all placeholder:text-[#475569]`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400 text-left">{errors.password}</p>}
            <p className="mt-1.5 text-[11px] text-[#64748b] leading-tight text-left">
              Must be at least 8 characters, include an uppercase, a lowercase, a number, and a special character.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6366f1]/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'Creating Account...' : 'Register Operator'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-[#94a3b8]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#6366f1] hover:text-[#818cf8] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
