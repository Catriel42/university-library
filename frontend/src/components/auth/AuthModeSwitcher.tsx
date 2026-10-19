import { LogIn, UserPlus } from 'lucide-react';

interface AuthModeSwitcherProps {
  mode: 'login' | 'register';
  onSwitch: (mode: 'login' | 'register') => void;
}

export function AuthModeSwitcher({ mode, onSwitch }: AuthModeSwitcherProps) {
  return (
    <div className="bg-surface-2 border-border mb-6 flex rounded-xl border p-1">
      <button
        type="button"
        onClick={() => onSwitch('login')}
        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-sans text-sm transition-all ${
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
        onClick={() => onSwitch('register')}
        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-sans text-sm transition-all ${
          mode === 'register'
            ? 'bg-surface text-text font-medium shadow-sm'
            : 'text-muted hover:text-text'
        }`}
      >
        <UserPlus size={16} />
        <span>Register</span>
      </button>
    </div>
  );
}
