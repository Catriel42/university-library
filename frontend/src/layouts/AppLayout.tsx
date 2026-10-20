import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Library, User as UserIcon, Menu, X, BookMarked, Clock, BookOpen, LogOut, LogIn } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AppLayout() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <nav className="bg-bg/90 border-border sticky top-0 z-50 flex w-full max-w-[1200px] items-center justify-between border-b px-4 py-4 backdrop-blur-md md:px-8 md:py-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-text flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Library className="text-accent" size={24} />
          <span className="font-serif text-lg font-medium tracking-wide sm:text-xl">
            University Library
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex md:gap-4">
          {user ? (
            <>
              <Link
                to="/loans"
                className={`text-muted hover:text-text font-sans ${buttonVariants({ variant: 'ghost' })}`}
              >
                My Loans
              </Link>
              <Link
                to="/reservations"
                className={`text-muted hover:text-text font-sans ${buttonVariants({ variant: 'ghost' })}`}
              >
                Reservations
              </Link>
              <Link
                to="/my-books"
                className={`text-muted hover:text-text font-sans ${buttonVariants({ variant: 'ghost' })}`}
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

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text hover:text-accent border-border bg-surface-2/80 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="bg-bg/95 border-border fixed inset-x-0 top-[65px] z-40 flex flex-col gap-3 border-b p-5 shadow-2xl backdrop-blur-xl md:hidden">
          {user ? (
            <>
              <div className="bg-surface border-border flex items-center gap-3 rounded-xl border p-3">
                <div className="bg-accent/10 flex h-9 w-9 items-center justify-center rounded-full">
                  <UserIcon size={18} className="text-accent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-text font-sans text-sm font-semibold">{user.name}</span>
                  <span className="text-muted font-sans text-xs">{user.email}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-2">
                <Link
                  to="/"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-sans text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'bg-accent/15 text-accent'
                      : 'text-text hover:bg-surface-2'
                  }`}
                >
                  <Library size={18} />
                  <span>Catalog</span>
                </Link>

                <Link
                  to="/loans"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-sans text-sm font-medium transition-colors ${
                    location.pathname === '/loans'
                      ? 'bg-accent/15 text-accent'
                      : 'text-text hover:bg-surface-2'
                  }`}
                >
                  <BookMarked size={18} />
                  <span>My Loans</span>
                </Link>

                <Link
                  to="/reservations"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-sans text-sm font-medium transition-colors ${
                    location.pathname === '/reservations'
                      ? 'bg-accent/15 text-accent'
                      : 'text-text hover:bg-surface-2'
                  }`}
                >
                  <Clock size={18} />
                  <span>Reservations</span>
                </Link>

                <Link
                  to="/my-books"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-sans text-sm font-medium transition-colors ${
                    location.pathname === '/my-books'
                      ? 'bg-accent/15 text-accent'
                      : 'text-text hover:bg-surface-2'
                  }`}
                >
                  <BookOpen size={18} />
                  <span>My Books</span>
                </Link>
              </div>

              <div className="border-border/80 border-t pt-3">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="text-danger hover:bg-danger/10 flex w-full items-center gap-3 rounded-xl px-4 py-3 font-sans text-sm font-medium transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={closeMenu}
                className="text-text hover:bg-surface-2 flex items-center gap-3 rounded-xl px-4 py-3 font-sans text-sm font-medium transition-colors"
              >
                <Library size={18} />
                <span>Catalog</span>
              </Link>
              <Link
                to="/login"
                onClick={closeMenu}
                className="bg-accent text-bg hover:bg-accent/90 flex items-center justify-center gap-2 rounded-xl py-3 font-sans text-sm font-semibold shadow-sm transition-colors"
              >
                <LogIn size={18} />
                <span>Sign In to Your Account</span>
              </Link>
            </div>
          )}
        </div>
      )}

      <main className="flex w-full max-w-[1200px] flex-1 flex-col px-4 py-6 md:px-8 md:py-12">
        <Outlet />
      </main>

      <footer className="border-border mt-auto w-full border-t py-6 md:py-8">
        <div className="text-muted mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-4 text-center text-xs sm:flex-row sm:text-left sm:text-sm md:px-8">
          <span>&copy; {new Date().getFullYear()} University Library</span>
          <span className="font-mono text-xs">catodev_</span>
        </div>
      </footer>
    </div>
  );
}
