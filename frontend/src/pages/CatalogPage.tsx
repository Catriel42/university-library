import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookX } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { WorkDTO, SearchResponseDTO } from '@university-library/shared';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CopyPips } from '@/components/CopyPips';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const queryParam = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(queryParam);
  const [isSearching, setIsSearching] = useState(Boolean(queryParam));
  const [hasSearched, setHasSearched] = useState(Boolean(queryParam));
  const [results, setResults] = useState<WorkDTO[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ignore = false;
    
    if (queryParam) {
      const fetchData = async () => {
        try {
          const response = await axios.get<SearchResponseDTO>('http://localhost:3001/api/books', {
            params: { q: queryParam, limit: 12 }
          });
          if (!ignore) setResults(response.data.docs);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          if (!ignore) setIsSearching(false);
        }
      };
      
      fetchData();
    }
    
    return () => { ignore = true; };
  }, [queryParam]);

  const handleSearchSubmit = (formData: FormData) => {
    const queryValue = formData.get('searchQuery')?.toString();
    if (!queryValue?.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    setResults([]);
    
    setSearchParams({ q: queryValue });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="max-w-2xl mx-auto w-full text-center mb-16 mt-4">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight text-text">
          Search the catalog
        </h1>
        <p className="text-muted text-lg font-sans mb-8">
          Millions of texts, journals, and academic books at your fingertips.
        </p>

        <form
          action={handleSearchSubmit}
          className="relative w-full group"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-muted group-focus-within:text-accent transition-colors" size={20} />
          </div>
          <input
            ref={inputRef}
            name="searchQuery"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find by title, author, or ISBN..."
            className="w-full bg-surface border border-border rounded-full py-4 pl-12 pr-[100px] text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-base shadow-sm"
            disabled={isSearching}
          />
          <Button 
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute inset-y-1.5 right-1.5 rounded-full px-5 bg-accent text-bg hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      <div className="w-full">
        {hasSearched && (
          <div className="mb-8 flex justify-between items-end border-b border-border pb-4">
            <h2 className="text-2xl font-serif text-text">Results for "{query}"</h2>
            <span className="text-mono text-sm text-muted">{results.length} items</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="w-full aspect-2/3 rounded-xl bg-surface" />
                  <Skeleton className="h-5 w-3/4 bg-surface" />
                  <Skeleton className="h-4 w-1/2 bg-surface" />
                  <Skeleton className="h-3 w-1/4 bg-surface mt-2" />
                </div>
              ))}
            </motion.div>
          ) : !isSearching && hasSearched && results.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center py-24 text-center border border-dashed border-border rounded-2xl bg-surface"
            >
              <BookX className="text-muted mb-4 opacity-50" size={48} />
              <h3 className="text-xl font-serif text-text mb-2">No matching items found</h3>
              <p className="text-muted max-w-md">
                We couldn't find any books matching your query. Try a different term or check your spelling.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full"
            >
              {results.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, ease: "easeOut", duration: 0.3 }}
                  className="group h-full"
                >
                  <Card 
                    onClick={() => navigate(`/book/${encodeURIComponent(book.id)}`)}
                    className="bg-surface border-border overflow-hidden rounded-2xl hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(45,212,168,0.1)] hover:border-accent/30 transition-all duration-300 h-full flex flex-col cursor-pointer"
                  >
                    
                    <div className="w-full aspect-[2/3] relative bg-surface-2 border-b border-border overflow-hidden shrink-0">
                      {book.coverId ? (
                        <img 
                          src={`https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`} 
                          alt={`Cover of ${book.title}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-surface to-border flex items-center justify-center p-6 text-center">
                          <span className="font-serif text-muted/60 text-lg line-clamp-4 leading-snug">
                            {book.title}
                          </span>
                        </div>
                      )}
                      
                      {book.availableCopies === 0 && (
                        <div className="absolute top-2 right-2 bg-surface-2/90 backdrop-blur border border-border px-2 py-1 rounded-md">
                          <span className="text-[10px] uppercase tracking-wider font-mono text-warn">Waitlist</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-serif text-text text-base leading-tight line-clamp-2 mb-1 group-hover:text-accent transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm font-sans text-muted line-clamp-1 mb-4">
                        {book.firstAuthor || 'Unknown Author'}
                      </p>
                      
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <CopyPips total={book.totalCopies} available={book.availableCopies} />
                        
                        {book.availableCopies > 0 ? (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-accent hover:bg-accent/10 px-2 ml-auto" onClick={(e) => { e.stopPropagation(); console.log('Borrow', book.id); }}>
                            Borrow
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-muted hover:bg-surface-2 px-2 ml-auto" onClick={(e) => { e.stopPropagation(); console.log('Hold', book.id); }}>
                            Place hold
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
