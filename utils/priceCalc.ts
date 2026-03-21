/**
 * Calculates the cost of a specific amount of an ingredient.
 * @param priceTL Price of the product in Turkish Lira.
 * @param productGrams Total weight of the product in grams.
 * @param usedGrams Used weight of the ingredient in grams.
 * @returns Estimated cost in Turkish Lira.
 */
export function calcCostTL(
  priceTL: number,
  productGrams: number,
  usedGrams: number
): number {
  if (productGrams <= 0) return 0;
  return Number(((priceTL / productGrams) * usedGrams).toFixed(2));
}

/**
 * Calculates the percent change between two prices.
 * @param oldPrice Old price in Turkish Lira.
 * @param newPrice New price in Turkish Lira.
 * @returns Percent change.
 */
export function getPercentChange(oldPrice: number, newPrice: number): number {
  if (oldPrice <= 0) return 0;
  return Number((((newPrice - oldPrice) / oldPrice) * 100).toFixed(1));
}
