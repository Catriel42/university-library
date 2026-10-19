import { useState, useActionState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import {
  registerSchema,
  loginSchema,
  type ApiError,
} from '@university-library/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthModeSwitcher } from '@/components/auth/AuthModeSwitcher';
import { useAuth } from '@/context/AuthContext';

interface AuthActionState {
  mode?: 'login' | 'register';
  errors?: Record<string, string>;
  serverError?: string | null;
}

export function AuthPage() {
  const { user, login, register } = useAuth();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clearedFields, setClearedFields] = useState<Record<string, boolean>>(
    {}
  );

  const [state, formAction, isPending] = useActionState(
    async (
      _prevState: AuthActionState,
      formData: FormData
    ): Promise<AuthActionState> => {
      setClearedFields({});
      const activeMode = (formData.get('mode') as 'login' | 'register') || mode;
      const emailVal = ((formData.get('email') as string) || '').trim();
      const passwordVal = (formData.get('password') as string) || '';

      if (activeMode === 'register') {
        const nameVal = ((formData.get('name') as string) || '').trim();
        const parsed = registerSchema.safeParse({
          name: nameVal,
          email: emailVal,
          password: passwordVal,
        });

        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, issues] of Object.entries(
            parsed.error.flatten().fieldErrors
          )) {
            if (issues && issues.length > 0) {
              fieldErrors[key] = issues[0];
            }
          }
          return { mode: activeMode, errors: fieldErrors };
        }

        try {
          await register(parsed.data);
          return { mode: activeMode };
        } catch (err: unknown) {
          let message = 'An unexpected error occurred. Please try again.';
          if (isAxiosError<ApiError>(err)) {
            message = err.response?.data?.error?.message || message;
          } else if (err instanceof Error) {
            message = err.message;
          }
          return { mode: activeMode, serverError: message };
        }
      } else {
        const parsed = loginSchema.safeParse({
          email: emailVal,
          password: passwordVal,
        });

        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, issues] of Object.entries(
            parsed.error.flatten().fieldErrors
          )) {
            if (issues && issues.length > 0) {
              fieldErrors[key] = issues[0];
            }
          }
          return { mode: activeMode, errors: fieldErrors };
        }

        try {
          await login(parsed.data);
          return { mode: activeMode };
        } catch (err: unknown) {
          let message = 'An unexpected error occurred. Please try again.';
          if (isAxiosError<ApiError>(err)) {
            message = err.response?.data?.error?.message || message;
          } else if (err instanceof Error) {
            message = err.message;
          }
          return { mode: activeMode, serverError: message };
        }
      }
    },
    {}
  );

  const from = (location.state as { from?: string })?.from || '/';
  if (user) {
    return <Navigate to={from} replace />;
  }

  const isCurrentMode = state.mode === mode;
  const currentErrors = isCurrentMode ? state.errors || {} : {};
  const currentServerError = isCurrentMode ? state.serverError : null;

  const getFieldError = (field: string) => {
    if (clearedFields[field]) return '';
    return currentErrors[field] || '';
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    setClearedFields((prev) => ({ ...prev, [field]: true }));
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setClearedFields({});
  };

  const nameError = getFieldError('name');
  const emailError = getFieldError('email');
  const passwordError = getFieldError('password');

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center py-6 md:py-12">
      <Card className="bg-surface border-border w-full max-w-md rounded-2xl p-6 shadow-xl md:p-8">
        <AuthHeader mode={mode} />
        <AuthModeSwitcher mode={mode} onSwitch={switchMode} />

        <AnimatePresence>
          {currentServerError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6"
            >
              <AlertMessage message={currentServerError} />
            </motion.div>
          )}
        </AnimatePresence>

        <form action={formAction} noValidate className="flex flex-col gap-4">
          <input type="hidden" name="mode" value={mode} />

          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name-input"
                className="text-muted font-mono text-xs tracking-wider uppercase"
              >
                Full Name
              </label>
              <input
                id="name-input"
                name="name"
                type="text"
                value={name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Jane Doe"
                disabled={isPending}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? 'name-error' : undefined}
                className={`bg-surface-2 text-text placeholder:text-muted/60 w-full rounded-xl border px-4 py-3 text-base transition-colors focus:outline-none ${
                  nameError
                    ? 'border-danger focus:border-danger'
                    : 'border-border focus:border-accent/60 focus:ring-accent/60 focus:ring-1'
                }`}
              />
              {nameError && (
                <span id="name-error" className="text-danger font-sans text-xs">
                  {nameError}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email-input"
              className="text-muted font-mono text-xs tracking-wider uppercase"
            >
              Email Address
            </label>
            <input
              id="email-input"
              name="email"
              type="email"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder="student@university.edu"
              autoComplete="email"
              disabled={isPending}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'email-error' : undefined}
              className={`bg-surface-2 text-text placeholder:text-muted/60 w-full rounded-xl border px-4 py-3 text-base transition-colors focus:outline-none ${
                emailError
                  ? 'border-danger focus:border-danger'
                  : 'border-border focus:border-accent/60 focus:ring-accent/60 focus:ring-1'
              }`}
            />
            {emailError && (
              <span id="email-error" className="text-danger font-sans text-xs">
                {emailError}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password-input"
              className="text-muted font-mono text-xs tracking-wider uppercase"
            >
              Password
            </label>
            <input
              id="password-input"
              name="password"
              type="password"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              placeholder="At least 8 characters"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              disabled={isPending}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className={`bg-surface-2 text-text placeholder:text-muted/60 w-full rounded-xl border px-4 py-3 text-base transition-colors focus:outline-none ${
                passwordError
                  ? 'border-danger focus:border-danger'
                  : 'border-border focus:border-accent/60 focus:ring-accent/60 focus:ring-1'
              }`}
            />
            {passwordError && (
              <span
                id="password-error"
                className="text-danger font-sans text-xs"
              >
                {passwordError}
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="bg-accent text-bg hover:bg-accent/90 mt-4 h-12 w-full rounded-xl text-base font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? (
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

        <div className="text-muted mt-6 text-center font-sans text-xs">
          <span>
            By continuing, you agree to the University Library policies and
            honor code.
          </span>
        </div>
      </Card>
    </div>
  );
}
