import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Formats a numeric value to Turkish Lira currency string.
 * @param value Price value.
 * @returns Formatted currency string (e.g., ₺12.34).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);
}

/**
 * Formats a numeric value to an unformatted Turkish Lira string (for simple display).
 * @param value Price value.
 * @returns Simple currency string (e.g., ₺12.34).
 */
export function formatPriceSimple(value: number): string {
  return `₺${Number(value).toFixed(2)}`;
}

/**
 * Formats a calorie value with the unit.
 * @param value Calories value.
 * @returns Formatted calories string (e.g., 1,234 kcal).
 */
export function formatCalories(value: number): string {
  return `${Math.round(value).toLocaleString('tr-TR')} kcal`;
}

/**
 * Formats a date to a human-readable string.
 * @param date Date value.
 * @returns Formatted date string (e.g., Çarşamba, 18 Mart).
 */
export function formatDate(date: Date): string {
  try {
    return format(date, 'EEEE, d MMMM', { locale: tr });
  } catch {
    return date.toDateString();
  }
}

/**
 * Formats a weight value with the unit.
 */
export function formatWeight(value: number, unit: string = 'g'): string {
  return `${value.toLocaleString('tr-TR')}${unit}`;
}

/**
 * Extracts the ingredient name from a product name.
 * @param productName The product name to extract from.
 * @returns The extracted ingredient name.
 */
export function extractIngredientName(productName: string): string {
  const brands = ['migros', 'pınar', 'sek', 'danone', 'ülker', 'eti',
    'torku', 'sunar', 'dimes', 'tamek', 'namet', 'türkiye', "sütaş", "filiz"]

  let name = productName.toLowerCase()

  // Marka adlarını kaldır
  brands.forEach(brand => {
    name = name.replace(new RegExp(brand, 'gi'), '')
  })

  // Hacim/ağırlık bilgisini kaldır
  name = name.replace(/\d+[.,]?\d*\s*(ml|l|g|gr|kg|litre|lt)/gi, '')

  // % içeren kısımları kaldır (%3 yağlı gibi)
  name = name.replace(/%\d+[^a-zğüşıöç]*/gi, '')

  // Fazla boşlukları temizle
  name = name.replace(/\s+/g, ' ').trim()

  return name || productName
}