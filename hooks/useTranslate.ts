import { useState, useCallback } from 'react';
import { translateToTurkish, translateToEnglish as translateToEnSvc, translateLongText as translateLongSvc } from '@/services/mymemory';
import { getTranslation, setTranslation } from '@/db/queries/cache';

/**
 * Hook for ingredient translation with caching support.
 */
export function useTranslate() {
  const [isLoading, setIsLoading] = useState(false);

  const translate = useCallback(async (textEn: string): Promise<string> => {
    const trimmed = textEn.trim().toLowerCase();
    
    setIsLoading(true);
    try {
      // 1. Check SQLite cache first
      const cached = await getTranslation(trimmed);
      if (cached) {
        setIsLoading(false);
        return cached;
      }

      // 2. Fetch from MyMemory (via service)
      const translated = await translateToTurkish(trimmed);
      
      // 3. Cache the result (Already handled inside service, but double-ensuring)
      await setTranslation(trimmed, translated);
      
      return translated;
    } catch (error) {
      console.warn('[useTranslate] Error:', error);
      return textEn; // Handover original in case of error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translateToEnglish = useCallback(async (textTr: string) => {
    setIsLoading(true);
    try {
      return await translateToEnSvc(textTr);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translateLongText = useCallback(async (text: string) => {
    setIsLoading(true);
    try {
      return await translateLongSvc(text);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    translate, 
    translateToEnglish,
    translateLongText,
    isLoading 
  };
}
