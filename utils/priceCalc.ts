/**
 * Calculates the cost of a specific amount of an ingredient.
 * @param priceTL Price of the product in Turkish Lira.
 * @param productGrams Total weight of the product in grams.
 * @param usedGrams Used weight of the ingredient in grams.
 * @returns Estimated cost in Turkish Lira.
 */
export function calcCostTL(
  priceTL: number,
  productGrams: number | null | undefined,
  usedGrams: number | null | undefined
): number | null {
  if (productGrams == null || usedGrams == null || productGrams <= 0) return null;
  return Number(((priceTL / productGrams) * usedGrams).toFixed(2));
}

export function parseUnitPricePerKg(unitPrice: string | null | undefined): number | null {
  if (!unitPrice) return null;

  const normalized = unitPrice
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('tr-TR');

  const match = normalized.match(/(\d+(?:[.,]\d+)?)\s*tl\s*\/\s*(kg|kilogram|l|lt|litre|liter)\b/i);
  if (!match) return null;

  return Number(match[1].replace(',', '.'));
}

export function calcCostFromUnitPrice(
  unitPricePerKg: number | null | undefined,
  usedGrams: number | null | undefined
): number | null {
  if (unitPricePerKg == null || usedGrams == null || unitPricePerKg <= 0) return null;
  return Number(((unitPricePerKg / 1000) * usedGrams).toFixed(2));
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
