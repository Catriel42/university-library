import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import type { ApiError } from '@university-library/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to catalog or previous location
  if (user) {
    return <Navigate to="/" replace />;
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === 'register') {
      if (!name.trim()) {
        newErrors.name = 'Full name is required';
      } else if (name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters long';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid academic or personal email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ name: name.trim(), email: email.trim(), password });
      }

      // Check for redirect state or default to /
      const from = (location.state as { from?: string })?.from || '/';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      let message = 'An unexpected error occurred. Please try again.';
      if (isAxiosError<ApiError>(err)) {
        message = err.response?.data?.error?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrors({});
    setServerError(null);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-6 md:py-12">
      <Card className="w-full max-w-md bg-surface border-border rounded-2xl p-6 md:p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-text mb-2 tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-muted text-sm font-sans">
            {mode === 'login'
              ? 'Access your library card, active loans, and holds'
              : 'Sign up to borrow books and access university collections'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-surface-2 p-1 rounded-xl mb-6 border border-border">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-sm font-sans rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-surface text-text font-medium shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-sm font-sans rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-surface text-text font-medium shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            <UserPlus size={16} />
            <span>Register</span>
          </button>
        </div>

        {/* Server Error Alert */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              role="alert"
              className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-2.5"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-sans leading-tight">{serverError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name-input" className="text-xs font-mono text-muted uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="Jane Doe"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={`w-full bg-surface-2 border rounded-xl px-4 py-3 text-text placeholder:text-muted/60 focus:outline-none transition-colors text-base ${
                  errors.name
                    ? 'border-danger focus:border-danger'
                    : 'border-border focus:border-accent/60 focus:ring-1 focus:ring-accent/60'
                }`}
              />
              {errors.name && (
                <span id="name-error" className="text-xs text-danger font-sans">
                  {errors.name}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email-input" className="text-xs font-mono text-muted uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="student@university.edu"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full bg-surface-2 border rounded-xl px-4 py-3 text-text placeholder:text-muted/60 focus:outline-none transition-colors text-base ${
                errors.email
                  ? 'border-danger focus:border-danger'
                  : 'border-border focus:border-accent/60 focus:ring-1 focus:ring-accent/60'
              }`}
            />
            {errors.email && (
              <span id="email-error" className="text-xs text-danger font-sans">
                {errors.email}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password-input" className="text-xs font-mono text-muted uppercase tracking-wider">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="At least 8 characters"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`w-full bg-surface-2 border rounded-xl px-4 py-3 text-text placeholder:text-muted/60 focus:outline-none transition-colors text-base ${
                errors.password
                  ? 'border-danger focus:border-danger'
                  : 'border-border focus:border-accent/60 focus:ring-1 focus:ring-accent/60'
              }`}
            />
            {errors.password && (
              <span id="password-error" className="text-xs text-danger font-sans">
                {errors.password}
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 h-12 bg-accent text-bg hover:bg-accent/90 font-medium rounded-xl transition-colors disabled:opacity-50 text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </span>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-muted font-sans">
          <span>By continuing, you agree to the University Library policies and honor code.</span>
        </div>
      </Card>
    </div>
  );
}
