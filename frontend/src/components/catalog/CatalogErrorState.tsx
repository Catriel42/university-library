import { motion } from 'motion/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CatalogErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function CatalogErrorState({ error, onRetry }: CatalogErrorStateProps) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="border-danger/30 bg-danger/5 flex w-full flex-col items-center rounded-2xl border px-4 py-16 text-center"
    >
      <AlertCircle className="text-danger mb-3" size={40} />
      <h3 className="text-text mb-2 font-serif text-xl">Search Error</h3>
      <p className="text-muted mb-6 max-w-md text-sm">{error}</p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="border-border hover:border-accent text-text flex items-center gap-2"
      >
        <RefreshCw size={14} />
        <span>Retry Search</span>
      </Button>
    </motion.div>
  );
}
