import { Outlet, Link } from 'react-router-dom';
import { Library } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function AppLayout() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <nav className="w-full max-w-[1200px] px-4 md:px-8 py-6 flex justify-between items-center bg-bg/90 backdrop-blur-md sticky top-0 z-50 border-b border-border">
        <Link to="/" className="flex items-center gap-3 text-text hover:opacity-80 transition-opacity">
          <Library className="text-accent" size={24} />
          <span className="font-serif text-xl tracking-wide font-medium">University Library</span>
        </Link>
        <div className="flex gap-4">
          <Link to="/loans" className={`text-muted hover:text-text font-sans hidden md:flex ${buttonVariants({ variant: 'ghost' })}`}>
            My Loans
          </Link>
          <Link to="/login" className={`font-sans bg-surface-2 text-text border border-border hover:bg-border/50 ${buttonVariants()}`}>
            Sign In
          </Link>
        </div>
      </nav>

      <main className="w-full max-w-[1200px] px-4 md:px-8 py-8 md:py-12 flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="w-full border-t border-border mt-auto py-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex justify-between items-center text-sm text-muted">
          <span>&copy; {new Date().getFullYear()} University Library</span>
          <span className="font-mono text-xs">System Status: Online</span>
        </div>
      </footer>
    </div>
  );
}
