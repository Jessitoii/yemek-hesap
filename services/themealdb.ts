import { TheMealDBRecipe, RawIngredient } from '@/types/api';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Parses a recipe from TheMealDB API response into the application's internal type.
 * Aggregates strIngredient and strMeasure fields.
 */
export function parseMealDBRecipe(meal: any): TheMealDBRecipe {
  const ingredients: RawIngredient[] = [];

  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (name && name !== '') {
      ingredients.push({ nameEn: name, measure: measure || '' });
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    cuisine: meal.strArea,
    instructions: meal.strInstructions,
    imageUrl: meal.strMealThumb,
    ingredients,
  };
}

/**
 * Searches for recipes by name in TheMealDB.
 */
export async function searchRecipes(query: string): Promise<TheMealDBRecipe[]> {
  try {
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
    const json = await response.json();
    return (json?.meals ?? []).map(parseMealDBRecipe);
  } catch (error) {
    console.warn('[TheMealDB API] Error searching recipes:', error);
    return [];
  }
}

/**
 * Fetches a single recipe by its ID.
 */
export async function getRecipeById(id: string): Promise<TheMealDBRecipe | null> {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    const json = await response.json();
    const meal = json?.meals?.[0];
    return meal ? parseMealDBRecipe(meal) : null;
  } catch (error) {
    console.warn('[TheMealDB API] Error fetching recipe by id:', error);
    return null;
  }
}

/**
 * Fetches a random recipe.
 */
export async function getRandomRecipe(): Promise<TheMealDBRecipe | null> {
  try {
    const response = await fetch(`${BASE_URL}/random.php`);
    const json = await response.json();
    const meal = json?.meals?.[0];
    return meal ? parseMealDBRecipe(meal) : null;
  } catch (error) {
    console.warn('[TheMealDB API] Error fetching random recipe:', error);
    return null;
  }
}

/**
 * Fetches all meal categories.
 */
export async function getCategories(): Promise<any[]> {
  try {
    const response = await fetch(`${BASE_URL}/categories.php`);
    const json = await response.json();
    return json?.categories ?? [];
  } catch (error) {
    console.warn('[TheMealDB API] Error fetching categories:', error);
    return [];
  }
}

/**
 * Filters recipes by category name.
 */
export async function filterByCategory(category: string): Promise<any[]> {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    const json = await response.json();
    const meals = json?.meals ?? [];

    // filter.php sadece idMeal, strMeal, strMealThumb döndürüyor
    // Bunu DiscoverCard'ın beklediği formata çevir
    return meals.map((meal: any) => ({
      id: meal.idMeal,
      name: meal.strMeal,
      imageUrl: meal.strMealThumb,
      category: category,
    }));
  } catch (error) {
    console.warn('[TheMealDB API] Error filtering by category:', error);
    return [];
  }
}

/**
 * Filters recipes by cuisine/area name.
 */
export async function filterByCuisine(cuisine: string): Promise<any[]> {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?a=${encodeURIComponent(cuisine)}`);
    const json = await response.json();
    const meals = json?.meals ?? [];

    // filter.php sadece idMeal, strMeal, strMealThumb döndürüyor
    // Bunu DiscoverCard'ın beklediği formata çevir
    return meals.map((meal: any) => ({
      id: meal.idMeal,
      name: meal.strMeal,
      imageUrl: meal.strMealThumb,
      cuisine: cuisine,
    }));
  } catch (error) {
    console.warn('[TheMealDB API] Error filtering by cuisine:', error);
    return [];
  }
}

export const getRandomMeal = getRandomRecipe;
export const getMealsByCategory = filterByCategory;
export const getMealsByArea = filterByCuisine;
export const searchMeals = searchRecipes;
