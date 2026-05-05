export interface DensityEntry {
  teaspoon?: number;
  tablespoon?: number;
  cup?: number;
  piece?: number;
  slice?: number;
  handful?: number;
  clove?: number;
}

const TURKISH_CHAR_MAP: Record<string, string> = {
  ğ: 'g',
  ş: 's',
  ı: 'i',
  ö: 'o',
  ü: 'u',
  ç: 'c',
};

export function normalizeDensityKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[ğşıöüç\u011f\u015f\u0131\u00f6\u00fc\u00e7]/g, (char) => TURKISH_CHAR_MAP[char] ?? char)
    .replace(/\s+/g, ' ');
}

const rawDensityTable: Record<string, DensityEntry> = {
  su: { teaspoon: 5, tablespoon: 15, cup: 240 },
  süt: { teaspoon: 5, tablespoon: 15, cup: 240 },
  milk: { teaspoon: 5, tablespoon: 15, cup: 240 },
  yogurt: { teaspoon: 6, tablespoon: 18, cup: 245 },
  yoğurt: { teaspoon: 6, tablespoon: 18, cup: 245 },
  zeytinyağı: { teaspoon: 4.3, tablespoon: 13, cup: 216 },
  'olive oil': { teaspoon: 4.3, tablespoon: 13, cup: 216 },
  'ayçiçek yağı': { teaspoon: 4.3, tablespoon: 13, cup: 216 },
  oil: { teaspoon: 4.3, tablespoon: 13, cup: 216 },
  tereyağı: { teaspoon: 5, tablespoon: 14, cup: 227 },
  butter: { teaspoon: 5, tablespoon: 14, cup: 227 },
  bal: { teaspoon: 7, tablespoon: 21, cup: 340 },
  honey: { teaspoon: 7, tablespoon: 21, cup: 340 },
  tahin: { teaspoon: 6, tablespoon: 18, cup: 250 },
  sirke: { teaspoon: 5, tablespoon: 15, cup: 240 },
  'limon suyu': { teaspoon: 5, tablespoon: 15, cup: 240 },

  un: { teaspoon: 3, tablespoon: 8, cup: 125 },
  flour: { teaspoon: 3, tablespoon: 8, cup: 125 },
  'all purpose flour': { teaspoon: 3, tablespoon: 8, cup: 125 },
  'tam buğday unu': { teaspoon: 3, tablespoon: 8, cup: 120 },
  'mısır unu': { teaspoon: 3, tablespoon: 9, cup: 130 },
  pirinç: { teaspoon: 4, tablespoon: 12, cup: 185 },
  rice: { teaspoon: 4, tablespoon: 12, cup: 185 },
  bulgur: { teaspoon: 4, tablespoon: 11, cup: 180 },
  yulaf: { teaspoon: 2, tablespoon: 6, cup: 90 },
  oats: { teaspoon: 2, tablespoon: 6, cup: 90 },
  şeker: { teaspoon: 4, tablespoon: 12, cup: 200 },
  sugar: { teaspoon: 4, tablespoon: 12, cup: 200 },
  tuz: { teaspoon: 6, tablespoon: 18 },
  salt: { teaspoon: 6, tablespoon: 18 },
  kakao: { teaspoon: 2, tablespoon: 6, cup: 80 },
  'bay leaf': { piece: 0.5 },
  'bay leaves': { piece: 0.5 },
  'defne yapragi': { piece: 0.5 },
  'cinnamon stick': { piece: 3 },
  'tarcin cubugu': { piece: 3 },
  'cardamom pod': { piece: 0.3 },
  kakule: { piece: 0.3 },
  clove: { piece: 0.3 },
  'star anise': { piece: 1 },
  anason: { piece: 1 },
  'dried chili': { piece: 2 },
  'kuru biber': { piece: 2 },
  'vanilla bean': { piece: 3 },
  'vanilya cubugu': { piece: 3 },

  soğan: { piece: 110, handful: 50 },
  onion: { piece: 110, handful: 50 },
  'medium onion': { piece: 110 },
  'kuru soğan': { piece: 110 },
  'taze soğan': { piece: 15 },
  'green onion': { piece: 15 },
  sarımsak: { piece: 5, clove: 4 },
  garlic: { piece: 5, clove: 4 },
  'clove garlic': { piece: 4, clove: 4 },
  domates: { piece: 150 },
  tomato: { piece: 150 },
  'medium tomato': { piece: 150 },
  patates: { piece: 150 },
  potato: { piece: 150 },
  'small potato': { piece: 100 },
  havuç: { piece: 80 },
  carrot: { piece: 80 },
  'medium carrot': { piece: 80 },
  biber: { piece: 80 },
  pepper: { piece: 120 },
  salatalık: { piece: 200, slice: 20 },
  cucumber: { piece: 200, slice: 20 },
  patlıcan: { piece: 300 },
  eggplant: { piece: 300 },
  kabak: { piece: 250 },
  zucchini: { piece: 200 },
  ıspanak: { handful: 30, cup: 30 },
  spinach: { handful: 30, cup: 30 },
  marul: { handful: 20 },
  lettuce: { handful: 20 },
  mantar: { piece: 20, handful: 40, cup: 70 },
  mushroom: { piece: 20, handful: 40, cup: 70 },

  yumurta: { piece: 50 },
  egg: { piece: 50 },
  'large egg': { piece: 50 },
  tavuk: { piece: 160 },
  chicken: { piece: 160 },
  'tavuk göğsü': { piece: 180 },
  'chicken breast': { piece: 180 },
  peynir: { slice: 30, handful: 40, cup: 150 },
  cheese: { slice: 30, handful: 40, cup: 150 },

  ekmek: { slice: 25, piece: 400 },
  bread: { slice: 25, piece: 400 },
  'slice bread': { slice: 25, piece: 25 },
  'bread slice': { slice: 25, piece: 25 },

  elma: { piece: 180 },
  apple: { piece: 180 },
  muz: { piece: 120 },
  banana: { piece: 120 },
  limon: { piece: 100 },
  lemon: { piece: 100 },
  portakal: { piece: 200 },
  orange: { piece: 200 },
};

export const densityTable: Record<string, DensityEntry> = Object.entries(rawDensityTable).reduce(
  (acc, [key, value]) => {
    acc[normalizeDensityKey(key)] = value;
    return acc;
  },
  {} as Record<string, DensityEntry>
);

export function findDensityEntry(ingredientName?: string): DensityEntry | null {
  if (!ingredientName) return null;

  const normalized = normalizeDensityKey(ingredientName);
  if (densityTable[normalized]) return densityTable[normalized];

  const tokens = normalized.split(/\s+/).filter(Boolean);
  for (const [key, entry] of Object.entries(densityTable)) {
    if (normalized.includes(key) || key.split(/\s+/).every((part) => tokens.includes(part))) {
      return entry;
    }
  }

  return null;
}
