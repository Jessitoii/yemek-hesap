import { MigrosProduct } from '@/types/ingredient';

export type ExtractedProductWeight = {
  grams: number;
  unit: string;
};

type MigrosApiProduct = {
  id: string | number;
  name: string;
  shownPrice: number;
  unitPrice?: string | null;
  images?: { urls?: { PRODUCT_LIST?: string } }[];
  brand?: { name?: string };
  unit?: string;
  category?: { name?: string };
  categoryAscendants?: { name?: string }[];
};

type MigrosSearchResponse = {
  data?: {
    searchInfo?: {
      storeProductInfos?: MigrosApiProduct[];
    };
  };
};

function parseNumber(value: string): number {
  return Number(value.replace(',', '.'));
}

export const NON_FOOD_CATEGORY_SIGNALS = [
  'kisisel bakim',
  'temizlik',
  'deterjan',
  'sampuan',
  'kozmetik',
];

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c');
}

function normalizeMigrosText(value: string): string {
  return normalizeText(value)
    .replace(/\u0131/g, 'i')
    .replace(/\u011f/g, 'g')
    .replace(/\u015f/g, 's')
    .replace(/\u00f6/g, 'o')
    .replace(/\u00fc/g, 'u')
    .replace(/\u00e7/g, 'c');
}

export function hasNonFoodMigrosSignal(values: Array<string | undefined>): boolean {
  const text = normalizeMigrosText(values.filter(Boolean).join(' '));
  return NON_FOOD_CATEGORY_SIGNALS.some(signal => text.includes(signal));
}

const DRY_SPICE_KEYWORDS = ['tsp', 'teaspoon', 'cay kasigi', 'tbsp', 'tablespoon', 'yemek kasigi'];
const DRY_SPICE_INGREDIENTS = [
  'paprika',
  'cumin',
  'turmeric',
  'coriander',
  'garam masala',
  'kimyon',
  'zerdecal',
  'tarcin',
  'karabiber',
  'pul biber',
  'kirmizi biber tozu',
  'nane',
  'kekik',
  'oregano',
];
const FRESH_PRODUCE_SIGNALS = ['meyve sebze', 'meyve & sebze'];
const SPICE_PRODUCT_SIGNALS = ['baharat', 'baharatlar'];
const BOUILLON_PRODUCT_SIGNALS = ['tablet', 'kubu', 'kupu', 'tableti', 'bouillon'];
const LIQUID_VOLUME_UNITS = ['l', 'lt', 'liter', 'litre', 'ml', 'cup', 'bardak', 'quart', 'qt', 'pint', 'pt'];
const SAUCE_PRODUCT_SIGNALS = ['sos', 'salca', 'ketcap', 'mayonez', 'hardal', 'tabasco', 'dressing', 'sirke'];
const LIQUID_PRODUCT_BLOCKED_CATEGORIES = ['biskuvi & gofret', 'cikolata', 'sekerleme'];

function isDrySpiceIngredient(query: string, unit: string): boolean {
  const normalizedQuery = normalizeMigrosText(query);
  const normalizedUnit = normalizeMigrosText(unit);

  return DRY_SPICE_INGREDIENTS.some(spice => normalizedQuery.includes(spice))
    || DRY_SPICE_KEYWORDS.some(keyword => normalizedUnit.includes(keyword));
}

export function isLiquidMeasureUnit(unit: string | null | undefined): boolean {
  if (!unit) return false;
  const normalized = normalizeMigrosText(unit);
  return LIQUID_VOLUME_UNITS.some(liquidUnit => normalized === liquidUnit || normalized.includes(liquidUnit));
}

export function isBouillonTabletProduct(productName: string): boolean {
  const normalized = normalizeMigrosText(productName);
  return BOUILLON_PRODUCT_SIGNALS.some(signal => normalized.includes(signal));
}

function isSolidIngredientUnit(unit: string): boolean {
  const normalized = normalizeMigrosText(unit || '');
  return ['gram', 'gr', 'g', 'kg', 'adet', 'tane', 'piece', 'pieces'].includes(normalized);
}

export function shouldExcludeLiquidIngredientProduct(product: MigrosProduct, query: string, unit: string): boolean {
  const normalizedQuery = normalizeMigrosText(query);
  const normalizedUnit = normalizeMigrosText(unit || '');
  const categoryText = normalizeMigrosText([product.category, product.topCategory].filter(Boolean).join(' '));
  const isLiquidIngredient = isLiquidMeasureUnit(normalizedUnit)
    || ['ml', 'l', 'lt', 'cup', 'bardak'].includes(normalizedUnit)
    || ['milk', 'sut', 'juice', 'suyu'].some(signal => normalizedQuery.includes(signal));

  return isLiquidIngredient && LIQUID_PRODUCT_BLOCKED_CATEGORIES.some(category => categoryText.includes(category));
}

export function scoreMigrosMatch(
  product: MigrosProduct,
  query: string,
  unit: string,
  amount = 1,
  usedGrams: number | null = null
): number {
  let score = 0;
  const productName = normalizeMigrosText(product.name);
  const q = normalizeMigrosText(query);
  const categoryText = normalizeMigrosText([product.category, product.topCategory].filter(Boolean).join(' '));

  score += extractProductWeight(product.name) ? 20 : -50;
  if (hasNonFoodMigrosSignal([product.category, product.topCategory, product.name])) score -= 200;
  if (usedGrams != null) {
    const productGrams = extractProductWeight(product.name)?.grams;
    if (productGrams != null && productGrams < usedGrams * 0.5) score -= 80;
  }
  if (q === 'sogan' && productName.includes('siniklav')) score -= 80;
  if (q === 'sogan' && productName.includes('frenk')) score -= 60;
  if (isSolidIngredientUnit(unit) && SAUCE_PRODUCT_SIGNALS.some(signal => productName.includes(signal))) score -= 150;

  if (productName === q) score += 100;
  else if (productName.includes(q)) score += 50;

  const targetUnitLower = normalizeMigrosText(unit || '');
  if (targetUnitLower === 'gram' || targetUnitLower === 'gr' || targetUnitLower === 'kg') {
    if (productName.includes(' g') || productName.includes(' gr') || productName.includes('kg')) {
      score += 30;
    }
  } else if (targetUnitLower === 'adet' || targetUnitLower === 'tane') {
    if (productName.includes(' adet') || productName.includes(' tane')) {
      score += 30;
    }
  }

  q.split(' ').forEach(keyword => {
    if (keyword.length > 2 && productName.includes(keyword)) score += 20;
  });

  if (isDrySpiceIngredient(query, unit)) {
    if (FRESH_PRODUCE_SIGNALS.some(signal => categoryText.includes(signal)) || productName.includes('taze')) {
      score -= 100;
    }
    if (
      SPICE_PRODUCT_SIGNALS.some(signal => categoryText.includes(signal))
      || productName.includes('toz')
      || productName.includes('kuru')
    ) {
      score += 30;
    }
  }

  if (isLiquidMeasureUnit(unit) && isBouillonTabletProduct(product.name)) {
    score -= 200;
  }

  return score;
}

/**
 * Extracts package weight/volume from Migros product names.
 * Returns null instead of guessing when the name has no usable size.
 */
export function extractProductWeight(productName: string): ExtractedProductWeight | null {
  const name = productName.toLowerCase();

  const multipackGramMatch = name.match(/(\d+)\s*[xX×]\s*(\d+(?:[.,]\d+)?)\s*(g|gr|gram)\b/i);
  if (multipackGramMatch) {
    return { grams: parseNumber(multipackGramMatch[1]) * parseNumber(multipackGramMatch[2]), unit: 'g' };
  }

  const eggRangeMatch = name.match(/(\d+)\s*['’]?\s*l[uiı]\b.*?\((\d+)\s*[-–]\s*(\d+)\s*g\)/i)
    ?? name.match(/(\d+)\s*['’]?\s*l[uiı]\b.*?\((\d+)\s*[-–]\s*(\d+)\)\s*g/i);
  if (eggRangeMatch) {
    const count = parseNumber(eggRangeMatch[1]);
    const min = parseNumber(eggRangeMatch[2]);
    const max = parseNumber(eggRangeMatch[3]);
    return { grams: count * ((min + max) / 2), unit: 'adet' };
  }

  const kgMatch = name.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilogram)\b/i);
  if (kgMatch) return { grams: parseNumber(kgMatch[1]) * 1000, unit: 'kg' };

  const gramMatch = name.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gram)\b/i);
  if (gramMatch) return { grams: parseNumber(gramMatch[1]), unit: 'g' };

  const literMatch = name.match(/(\d+(?:[.,]\d+)?)\s*(l|lt|litre|liter)\b/i);
  if (literMatch) return { grams: parseNumber(literMatch[1]) * 1000, unit: 'l' };

  const mlMatch = name.match(/(\d+(?:[.,]\d+)?)\s*(ml|mililitre|millilitre|milliliter)\b/i);
  if (mlMatch) return { grams: parseNumber(mlMatch[1]), unit: 'ml' };

  const pieceWithWeightMatch = name.match(/(\d+)\s*(?:adet|li|lı|lu|lü|['’]li|['’]lı|['’]lu|['’]lü)\b.*?\((\d+)\s*[-–]\s*(\d+)\s*g\)/i)
    ?? name.match(/(\d+)\s*(?:adet|li|lı|lu|lü|['’]li|['’]lı|['’]lu|['’]lü)\b.*?\((\d+)\s*[-–]\s*(\d+)\)\s*g/i);
  if (pieceWithWeightMatch) {
    const count = parseNumber(pieceWithWeightMatch[1]);
    const min = parseNumber(pieceWithWeightMatch[2]);
    const max = parseNumber(pieceWithWeightMatch[3]);
    return { grams: count * ((min + max) / 2), unit: 'adet' };
  }

  const countOnlyMatch = name.match(/(\d+)\s*(?:adet|['’]li|['’]lı|['’]lu|['’]lü)\b/i);
  if (countOnlyMatch) {
    const count = parseNumber(countOnlyMatch[1]);
    if (name.includes('yumurta') || name.includes('egg')) {
      return { grams: count * 55, unit: 'adet' };
    }
    return null;
  }

  return null;
}

/**
 * Searches for products on Migros API.
 * @param query Search term
 * @returns List of Migros products, or empty array if error
 */
export async function searchMigrosProducts(query: string): Promise<MigrosProduct[]> {
  try {
    const url = `https://www.migros.com.tr/rest/search/screens/products?q=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('[Migros API] Search failed with status:', response.status);
      return [];
    }

    const json = await response.json() as MigrosSearchResponse;
    const items = json.data?.searchInfo?.storeProductInfos ?? [];

    return items.filter(item => !hasNonFoodMigrosSignal([
      item.category?.name,
      ...(item.categoryAscendants?.map(category => category.name) ?? []),
      item.name,
    ])).map((item): MigrosProduct => ({
      id: String(item.id),
      name: item.name,
      price: item.shownPrice / 100,
      imageUrl: item.images?.[0]?.urls?.PRODUCT_LIST ?? '',
      brand: item.brand?.name ?? 'Migros',
      unit: item.unit ?? 'adet',
      unitPrice: item.unitPrice ?? null,
      category: item.category?.name,
      topCategory: item.categoryAscendants?.[item.categoryAscendants.length - 2]?.name
        ?? item.categoryAscendants?.[0]?.name
        ?? item.category?.name,
    }));
  } catch (error) {
    console.warn('[Migros API] Error searching products:', error);
    return [];
  }
}
