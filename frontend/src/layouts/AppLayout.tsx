import { Outlet, Link } from 'react-router-dom';
import { Library, User as UserIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <nav className="bg-bg/90 border-border sticky top-0 z-50 flex w-full max-w-[1200px] items-center justify-between border-b px-4 py-6 backdrop-blur-md md:px-8">
        <Link
          to="/"
          className="text-text flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Library className="text-accent" size={24} />
          <span className="font-serif text-xl font-medium tracking-wide">
            University Library
          </span>
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <>
              <Link
                to="/loans"
                className={`text-muted hover:text-text hidden font-sans md:flex ${buttonVariants({ variant: 'ghost' })}`}
              >
                My Loans
              </Link>
              <Link
                to="/reservations"
                className={`text-muted hover:text-text hidden font-sans md:flex ${buttonVariants({ variant: 'ghost' })}`}
              >
                Reservations
              </Link>
              <Link
                to="/my-books"
                className={`text-muted hover:text-text hidden font-sans md:flex ${buttonVariants({ variant: 'ghost' })}`}
              >
                My Books
              </Link>
              <div className="bg-surface border-border text-text flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
                <UserIcon size={14} className="text-accent" />
                <span className="max-w-[120px] truncate font-sans font-medium">
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className={`text-muted hover:text-danger font-sans ${buttonVariants({ variant: 'ghost' })}`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`bg-surface-2 text-text border-border hover:bg-border/50 border font-sans ${buttonVariants()}`}
            >
              Sign In
            </Link>
          )}
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex w-full max-w-[1200px] flex-1 flex-col px-4 py-8 md:px-8 md:py-12">
        <Outlet />
      </main>

      <footer className="border-border mt-auto w-full border-t py-8">
        <div className="text-muted mx-auto flex max-w-[1200px] items-center justify-between px-4 text-sm md:px-8">
          <span>&copy; {new Date().getFullYear()} University Library</span>
          <span className="font-mono text-xs">catodev_</span>
        </div>
      </footer>
    </div>
  );
}
