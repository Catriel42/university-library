import { motion } from 'motion/react';
import { BookX } from 'lucide-react';

export function CatalogEmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-border bg-surface flex w-full flex-col items-center rounded-2xl border border-dashed py-24 text-center"
    >
      <BookX className="text-muted mb-4 opacity-50" size={48} />
      <h3 className="text-text mb-2 font-serif text-xl">
        No matching items found
      </h3>
      <p className="text-muted max-w-md text-sm">
        We couldn't find any books matching your query and filters. Try
        adjusting your search term, clearing category filters, or showing
        unavailable copies.
      </p>
    </motion.div>
  );
}
