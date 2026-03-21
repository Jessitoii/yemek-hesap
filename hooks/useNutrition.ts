import { useState, useCallback } from 'react';
import { NutritionData } from '@/types/api';
import { getNutritionFromOFF } from '@/services/openfoodfacts';
import { getNutritionFromUSDA } from '@/services/usda';
import { getCalorieCache, setCalorieCache } from '@/db/queries/cache';
import { translateToEnglish } from '@/services/mymemory'

/**
 * Hook for nutrition data fetching with fallback chain.
 * OpenFoodFacts -> USDA fallback chain.
 * Incorporates SQLite calorie_cache first.
 */

export function useNutrition() {
  const [isLoading, setIsLoading] = useState(false)

  const getNutrition = useCallback(async (
    queries: string | string[]
  ): Promise<NutritionData | null> => {

    // String veya array kabul et
    const queryList = Array.isArray(queries)
      ? queries.filter(q => q?.trim())
      : [queries.trim()]

    if (queryList.length === 0) return null

    const cacheKey = queryList[0].trim().toLowerCase()
    setIsLoading(true)

    try {
      // 1. Cache kontrol — sadece ilk query ile
      const cached = await getCalorieCache(cacheKey)
      if (cached) {
        return {
          calories: cached.calories_per_100g,
          protein: cached.protein_per_100g,
          carbs: cached.carbs_per_100g,
          fat: cached.fat_per_100g,
          source: cached.source || 'manual',
        }
      }

      // 2. Türkçe sırayla dene — spesifikten genele
      for (const q of queryList) {
        const trimmed = q.trim().toLowerCase()
        if (!trimmed) continue

        const off = await getNutritionFromOFF(trimmed)
        if (off) {
          await setCalorieCache(cacheKey, off)
          return off
        }
      }

      // 3. İngilizce'ye çevir, her query için tekrar dene
      for (const q of queryList) {
        const trimmed = q.trim().toLowerCase()
        if (!trimmed) continue

        const english = await translateToEnglish(trimmed)
        if (!english || english === trimmed) continue

        // OpenFoodFacts İngilizce
        const offEn = await getNutritionFromOFF(english)
        if (offEn) {
          await setCalorieCache(cacheKey, offEn)
          return offEn
        }

        // USDA İngilizce
        const usda = await getNutritionFromUSDA(english)
        if (usda) {
          await setCalorieCache(cacheKey, usda)
          return usda
        }
      }

      // 4. Son çare — USDA Türkçe ile dene
      for (const q of queryList) {
        const trimmed = q.trim().toLowerCase()
        if (!trimmed) continue

        const usda = await getNutritionFromUSDA(trimmed)
        if (usda) {
          await setCalorieCache(cacheKey, usda)
          return usda
        }
      }

      return null

    } catch (error) {
      console.warn('[useNutrition] Error:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { getNutrition, isLoading }
}