import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // If user is already authenticated, redirect them away
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if redirect query parameter for expired session exists
  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const validate = (emailVal: string, passwordVal: string) => {
    const tempErrors: typeof errors = {};
    if (!emailVal) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailVal)) {
      tempErrors.email = 'Invalid email address';
    }

    if (!passwordVal) {
      tempErrors.password = 'Password is required';
    } else if (passwordVal.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const emailVal = emailRef.current?.value || '';
    const passwordVal = passwordRef.current?.value || '';
    
    if (!validate(emailVal, passwordVal)) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email: emailVal, password: passwordVal });
      const { token, user } = response.data;
      
      login(token, user);
      
      // Navigate to intended page or dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      const serverMessage = error.response?.data?.error || 'Authentication failed. Please verify your credentials.';
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
            {/* Hexagon Shield Icon */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc]">SentinelX AI</h1>
          <p className="mt-2 text-sm text-[#94a3b8]">Security Operations Control Portal</p>
        </div>

        {isExpired && (
          <div className="mb-6 rounded-lg border border-[#e2e8f0]/10 bg-amber-500/10 p-3 text-sm text-amber-400 text-center">
            Session expired. Please sign in again.
          </div>
        )}

        {errors.general && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 text-center animate-shake">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8] mb-2 text-left">
              Security Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              ref={emailRef}
              defaultValue=""
              className={`w-full rounded-xl border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e293b] focus:border-[#6366f1]'} bg-[#0b0f19] px-4 py-3 text-sm text-[#f8fafc] outline-none transition-all placeholder:text-[#475569]`}
              placeholder="operator@sentinelx.ai"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400 text-left">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#94a3b8] mb-2 text-left">
              Operator Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              ref={passwordRef}
              defaultValue=""
              className={`w-full rounded-xl border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e293b] focus:border-[#6366f1]'} bg-[#0b0f19] px-4 py-3 text-sm text-[#f8fafc] outline-none transition-all placeholder:text-[#475569]`}
              placeholder="••••••••••••"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400 text-left">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] py-3 text-sm font-semibold text-[#f8fafc] shadow-lg shadow-[#6366f1]/20 transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authorizing Operator...
              </>
            ) : (
              'Access Command Center'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors">
            Forgot password?
          </Link>
        </div>

        <div className="mt-8 border-t border-[#1e293b] pt-6 text-center">
          <p className="text-xs text-[#475569]">
            Authorized Personnel Only. Actions are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
