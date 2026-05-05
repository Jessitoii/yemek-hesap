import { useState, useEffect, useCallback } from 'react';
import { MigrosProduct } from '@/types/ingredient';
import { hasNonFoodMigrosSignal, searchMigrosProducts } from '@/services/migros';
import { getMigrosCache, setMigrosCache } from '@/db/queries/cache';

/**
 * Hook for searching Migros products with 500ms debounce and caching.
 */
export function useMigrosSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MigrosProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (searchTerm: string) => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Check cache first
      const cached = await getMigrosCache(trimmed);
      if (cached) {
        setResults(cached.filter(product => !hasNonFoodMigrosSignal([
          product.category,
          product.topCategory,
          product.name,
        ])));
        setIsLoading(false);
        return;
      }

      // 2. Fetch from API
      const apiResults = await searchMigrosProducts(trimmed);
      
      // 3. Cache the result
      await setMigrosCache(trimmed, apiResults);
      
      setResults(apiResults);
    } catch (error) {
      console.warn('[useMigrosSearch] Error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query);
      }
    }, 500); // 500ms debounce requirement

    return () => clearTimeout(timer);
  }, [query, search]);

  return { 
    results, 
    isLoading, 
    query, 
    setQuery,
    search // Expose manual search too
  };
}
