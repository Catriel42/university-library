import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoanEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="border-border bg-surface flex flex-col items-center rounded-2xl border border-dashed px-4 py-20 text-center">
      <BookOpen size={44} className="text-muted mb-3 opacity-50" />
      <h3 className="text-text mb-2 font-serif text-xl">
        You have no active loans
      </h3>
      <p className="text-muted mb-6 max-w-md font-sans text-sm leading-relaxed">
        Browse our catalog to discover research papers, academic journals, and
        classic texts to borrow.
      </p>
      <Button
        onClick={() => navigate('/')}
        className="bg-accent text-bg hover:bg-accent/90 rounded-xl px-5 text-sm font-medium"
      >
        Explore Book Catalog
      </Button>
    </div>
  );
}
