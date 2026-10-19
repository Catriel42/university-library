import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-lg',
        'border border-border bg-surface transition-all duration-200',
        'hover:bg-surface-2 hover:border-accent/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
      )}
    >
      {/* Icono con animación de fade */}
      <div className="relative h-5 w-5">
        <Sun
          size={20}
          className={cn(
            'absolute inset-0 text-accent transition-all duration-300',
            theme === 'dark'
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          )}
        />
        <Moon
          size={20}
          className={cn(
            'absolute inset-0 text-accent transition-all duration-300',
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
    </button>
  );
}
