import { extractProductWeight } from '@/services/migros';
import { findDensityEntry, normalizeDensityKey } from './densityTable';

export type UnitType =
  | 'gram'
  | 'ml'
  | 'çay kaşığı'
  | 'yemek kaşığı'
  | 'bardak'
  | 'adet'
  | 'dilim'
  | 'avuç'
  | 'juice_of';

const VAGUE_MEASURES = [
  'to taste', 'some', 'a pinch', 'as needed', 'as required',
  'a bit', 'a few', 'dash', 'splash', 'handful',
  'enough', 'desired', 'optional', 'garnish', 'for garnish',
  'to serve', 'for serving', 'to coat', 'for coating',
  'bunch', '', 'null', 'undefined',
];

const UNIT_ALIASES: Record<string, string> = {
  gram: 'gram',
  grams: 'gram',
  g: 'gram',
  gr: 'gram',
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  ml: 'ml',
  milliliter: 'ml',
  millilitre: 'ml',
  l: 'l',
  lt: 'l',
  liter: 'l',
  litre: 'l',
  cup: 'bardak',
  cups: 'bardak',
  bardak: 'bardak',
  'su bardağı': 'bardak',
  tbsp: 'yemek kaşığı',
  tblsp: 'yemek kaşığı',
  tablespoon: 'yemek kaşığı',
  tablespoons: 'yemek kaşığı',
  'yemek kaşığı': 'yemek kaşığı',
  tsp: 'çay kaşığı',
  teaspoon: 'çay kaşığı',
  teaspoons: 'çay kaşığı',
  'çay kaşığı': 'çay kaşığı',
  piece: 'adet',
  pieces: 'adet',
  adet: 'adet',
  tane: 'adet',
  medium: 'adet',
  large: 'adet',
  small: 'adet',
  clove: 'diş',
  cloves: 'diş',
  diş: 'diş',
  slice: 'dilim',
  slices: 'dilim',
  dilim: 'dilim',
  juice_of: 'juice_of',
  handful: 'avuç',
  avuç: 'avuç',
  pinch: 'tutam',
  tutam: 'tutam',
  sprig: 'dal',
  sprigs: 'dal',
  dal: 'dal',
  can: 'kutu',
  tin: 'kutu',
  kutu: 'kutu',
  package: 'paket',
  packet: 'paket',
  pkg: 'paket',
  paket: 'paket',
};

const KNOWN_UNITS = Object.keys(UNIT_ALIASES).sort((a, b) => b.length - a.length);

function normalizeUnicodeFractions(value: string): string {
  return value
    .replace(/¼/g, '1/4')
    .replace(/½/g, '1/2')
    .replace(/¾/g, '3/4')
    .replace(/⅓/g, '1/3')
    .replace(/⅔/g, '2/3')
    .replace(/⅛/g, '1/8')
    .replace(/⅜/g, '3/8')
    .replace(/⅝/g, '5/8')
    .replace(/⅞/g, '7/8');
}

function normalizeUnit(unit: string): string {
  const cleaned = normalizeDensityKey(unit);
  return UNIT_ALIASES[cleaned] ?? cleaned;
}

function densityForVolume(ingredientName?: string): number {
  const lower = normalizeDensityKey(ingredientName ?? '');
  if (lower.includes('yag') || lower.includes('oil')) return 0.92;
  if (lower.includes('bal') || lower.includes('honey')) return 1.42;
  return 1;
}

const SMALL_PIECE_INDICATORS = ['leaf', 'yaprak', 'stick', 'cubuk', 'pod', 'bean'];

function capSmallPieceGrams(grams: number, ingredientName?: string): number | null {
  const normalizedName = normalizeDensityKey(ingredientName ?? '');
  if (grams > 20 && SMALL_PIECE_INDICATORS.some(indicator => normalizedName.includes(indicator))) {
    console.warn('[UnitConverter] Suspicious piece weight for small herb/spice:', ingredientName, grams);
    return null;
  }
  return grams;
}

export function toGrams(
  amount: number,
  unit: string,
  ingredientName?: string,
  productGrams?: number | null
): number | null {
  if (!Number.isFinite(amount)) return null;

  const u = normalizeUnit(unit);
  const entry = findDensityEntry(ingredientName);

  if (u === 'gram') return amount;
  if (u === 'kg') return amount * 1000;
  if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') return amount * 453.592;
  if (u === 'oz' || u === 'ounce' || u === 'ounces') return amount * 28.3495;

  const density = densityForVolume(ingredientName);
  if (u === 'ml') return amount * density;
  if (u === 'l') return amount * 1000 * density;
  if (u === 'fl oz' || u === 'fluid ounce') return amount * 29.5735 * density;
  if (u === 'pint' || u === 'pt') return amount * 473.176 * density;
  if (u === 'quart' || u === 'qt') return amount * 946.353 * density;
  if (u === 'gallon' || u === 'gal') return amount * 3785.41 * density;

  if (u === 'bardak') return entry?.cup != null ? amount * entry.cup : amount * 240 * density;
  if (u === 'yemek kaşığı') return entry?.tablespoon != null ? amount * entry.tablespoon : amount * 15 * density;
  if (u === 'çay kaşığı') return entry?.teaspoon != null ? amount * entry.teaspoon : amount * 5 * density;
  if (u === 'dilim') return entry?.slice != null ? amount * entry.slice : null;
  if (u === 'juice_of') {
    const normalizedName = normalizeDensityKey(ingredientName ?? '');
    if (normalizedName.includes('lemon') || normalizedName.includes('limon')) return amount * 30;
    if (normalizedName.includes('orange') || normalizedName.includes('portakal')) return amount * 60;
    return null;
  }
  if (u === 'avuç') return entry?.handful != null ? amount * entry.handful : null;
  if (u === 'diş') return entry?.clove != null ? amount * entry.clove : entry?.piece != null ? amount * entry.piece : null;
  if (u === 'adet') {
    if (entry?.piece != null) return capSmallPieceGrams(amount * entry.piece, ingredientName);
    return productGrams != null ? capSmallPieceGrams(amount * productGrams, ingredientName) : null;
  }

  if (u === 'tutam') return amount * 2;
  if (u === 'dal') return amount * 3;
  if (u === 'kutu' || u === 'paket') return productGrams != null ? amount * productGrams : null;
  if (u === 'stick') return amount * 113;
  if (u === 'head') return entry?.piece != null ? amount * entry.piece : null;

  return null;
}

function extractUnit(rest: string): string {
  if (!rest) return 'piece';
  const lower = rest.toLowerCase().trim();

  for (const known of KNOWN_UNITS) {
    const escaped = known.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`^${escaped}\\b`).test(lower)) {
      return known;
    }
  }

  for (const known of KNOWN_UNITS) {
    const escaped = known.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`).test(lower)) {
      return known;
    }
  }

  return 'piece';
}

export function parseMeasure(measure: string): { amount: number; unit: string; requiresManualInput: boolean } {
  const cleaned = normalizeUnicodeFractions((measure ?? '').trim().toLowerCase());

  if (!cleaned || VAGUE_MEASURES.includes(cleaned) || cleaned.includes('to serve') || cleaned.includes('bunch')) {
    return { amount: 0, unit: 'gram', requiresManualInput: true };
  }

  let amount = 1;
  let unit = 'piece';
  let requiresManualInput = false;

  const juiceOfMatch = cleaned.match(/^juice\s+of\s+(\d+(?:\.\d+)?)/);
  if (juiceOfMatch) {
    return { amount: Number(juiceOfMatch[1]), unit: 'juice_of', requiresManualInput: false };
  }

  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  const fractionMatch = cleaned.match(/^(\d+)\/(\d+)\s*(.*)$/);
  const rangeMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(.*)$/);
  const simpleMatch = cleaned.match(/^([\d.]+)\s*(.*)$/);

  if (rangeMatch) {
    amount = (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2;
    unit = extractUnit(rangeMatch[3].trim());
  } else if (mixedMatch) {
    amount = Number(mixedMatch[1]) + Number(mixedMatch[2]) / Number(mixedMatch[3]);
    unit = extractUnit(mixedMatch[4].trim());
  } else if (fractionMatch) {
    amount = Number(fractionMatch[1]) / Number(fractionMatch[2]);
    unit = extractUnit(fractionMatch[3].trim());
  } else if (simpleMatch) {
    amount = Number(simpleMatch[1]);
    unit = extractUnit(simpleMatch[2].trim());
  } else {
    requiresManualInput = true;
  }

  return { amount, unit: normalizeUnit(unit), requiresManualInput };
}

export function parseProductGrams(productName: string): number | null {
  return extractProductWeight(productName)?.grams ?? null;
}
