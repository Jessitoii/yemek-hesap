import { densityTable } from './densityTable';

export type UnitType =
  | 'gram'
  | 'ml'
  | 'çay kaşığı'
  | 'yemek kaşığı'
  | 'bardak'
  | 'adet'
  | 'dilim'
  | 'avuç';
/**
 * Converts a given quantity and unit to grams based on the ingredient's density and specific unit weights.
 * @param amount The numeric amount to convert.
 * @param unit The unit of the amount.
 * @param ingredientName The name of the ingredient (case-insensitive).
 * @param productGrams Optional: Net weight of the Migros product.
 * @returns The weight in grams.
 */
export function toGrams(
  amount: number,
  unit: string,
  ingredientName?: string,
  productGrams?: number
): number {
  const normalizedName = ingredientName?.toLowerCase().trim() || '';
  const u = unit.toLowerCase().trim();

  // Basic grams
  if (u === 'gram' || u === 'g' || u === 'gr') {
    return amount;
  }

  // 1. Piece/Adet handling with productGrams fallback
  if (u === 'adet' || u === 'piece' || u === 'pieces' || u === 'tane') {
    if (productGrams) return amount * productGrams;
    return amount * lookupAverageWeight(normalizedName);
  }

  // English Weight Units (TheMealDB)
  if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') {
    return amount * 453.592;
  }
  if (u === 'oz' || u === 'ounce' || u === 'ounces') {
    return amount * 28.3495;
  }

  // Density factor (default 1 for water)
  // Logic: 1ml = 1g for water/milk, but 0.9g for oil etc.
  let density = 1.0;
  if (normalizedName.includes('yağ') || normalizedName.includes('oil')) density = 0.92;
  if (normalizedName.includes('bal') || normalizedName.includes('honey')) density = 1.42;

  // Liquid Units
  if (u === 'ml' || u === 'milliliter' || u === 'millilitre') {
    return amount * density;
  }
  if (u === 'l' || u === 'litre' || u === 'liter') {
    return amount * 1000 * density;
  }
  if (u === 'fl oz' || u === 'fluid ounce') {
    return amount * 29.5735 * density;
  }
  if (u === 'pint' || u === 'pt') {
    return amount * 473.176 * density;
  }
  if (u === 'quart' || u === 'qt') {
    return amount * 946.353 * density;
  }
  if (u === 'gallon' || u === 'gal') {
    return amount * 3785.41 * density;
  }

  // Cooking Units (Cups/Spoons)
  if (u === 'su bardağı' || u === 'cup' || u === 'cups' || u === 'bardak') {
    return amount * 200 * density;
  }
  if (u === 'yemek kaşığı' || u === 'tbsp' || u === 'tablespoon' || u === 'tablespoons' || u === 'tblsp') {
    return amount * 15 * density;
  }
  if (u === 'çay kaşığı' || u === 'tsp' || u === 'teaspoon' || u === 'teaspoons') {
    return amount * 5 * density;
  }
  if (u === 'kg') return amount * 1000;

  // Common Containers / Portions
  if (u === 'can' || u === 'tin' || u === 'kutu') return amount * 400;
  if (u === 'package' || u === 'pkg' || u === 'packet' || u === 'paket') return amount * 100;
  if (u === 'stick') return amount * 113; // 1 stick butter = 113g
  if (u === 'diş' || u === 'clove' || u === 'cloves') return amount * 5;
  if (u === 'avuç' || u === 'handful') return amount * 30;
  if (u === 'tutam' || u === 'pinch') return amount * 2;
  if (u === 'dal' || u === 'sprig') return amount * 3;

  if (u === 'head') {
    if (normalizedName.includes('sar') || normalizedName.includes('garlic')) return amount * 40;
    if (normalizedName.includes('marul') || normalizedName.includes('lettuce') || normalizedName.includes('lahana')) return amount * 500;
    return amount * 100;
  }

  if (u === 'large' || u === 'medium' || u === 'small') {
    return amount * lookupAverageWeight(normalizedName);
  }

  // Default fallback 0 (forces manual check)
  return 0;
}

/**
 * Returns average weight in grams for common items when specific data is missing.
 */
function lookupAverageWeight(name: string): number {
  const n = name.toLowerCase();

  // Kümes hayvanları
  if (n.includes('tavuk göğsü') || n.includes('chicken breast')) return 180;
  if (n.includes('tavuk but') || n.includes('chicken thigh') || n.includes('chicken leg')) return 150;
  if (n.includes('piliç but') || n.includes('piliç incik') || n.includes('chicken drumstick')) return 150;
  if (n.includes('tavuk kanat') || n.includes('chicken wing')) return 90;
  if (n.includes('tavuk') || n.includes('chicken')) return 160;
  if (n.includes('hindi') || n.includes('turkey')) return 200;

  // Kırmızı et
  if (n.includes('biftek') || n.includes('steak')) return 200;
  if (n.includes('köfte') || n.includes('meatball')) return 30;
  if (n.includes('pirzola') || n.includes('chop')) return 150;
  if (n.includes('sosis') || n.includes('sausage')) return 50;
  if (n.includes('sucuk')) return 50;
  if (n.includes('pastırma') || n.includes('bacon')) return 20;

  // Balık & deniz ürünleri
  if (n.includes('karides') || n.includes('shrimp') || n.includes('prawn')) return 15;
  if (n.includes('somon') || n.includes('salmon')) return 150;
  if (n.includes('ton balığı') || n.includes('tuna')) return 150;
  if (n.includes('levrek') || n.includes('sea bass')) return 300;
  if (n.includes('balık') || n.includes('fish')) return 150;

  // Sebzeler
  if (n.includes('yumurta') || n.includes('egg')) return 55;
  if (n.includes('soğan') || n.includes('onion')) return 110;
  if (n.includes('taze soğan') || n.includes('spring onion') || n.includes('green onion')) return 15;
  if (n.includes('sarımsak') || n.includes('garlic')) return 5;
  if (n.includes('domates') || n.includes('tomato')) return 120;
  if (n.includes('patates') || n.includes('potato')) return 150;
  if (n.includes('havuç') || n.includes('carrot')) return 80;
  if (n.includes('biber') || n.includes('pepper')) return 120;
  if (n.includes('patlıcan') || n.includes('eggplant') || n.includes('aubergine')) return 300;
  if (n.includes('kabak') || n.includes('zucchini') || n.includes('courgette')) return 200;
  if (n.includes('brokoli') || n.includes('broccoli')) return 150;
  if (n.includes('karnabahar') || n.includes('cauliflower')) return 600;
  if (n.includes('lahana') || n.includes('cabbage')) return 500;
  if (n.includes('ıspanak') || n.includes('spinach')) return 30;
  if (n.includes('marul') || n.includes('lettuce')) return 500;
  if (n.includes('salatalık') || n.includes('cucumber')) return 200;
  if (n.includes('mantar') || n.includes('mushroom')) return 20;
  if (n.includes('kereviz') || n.includes('celery')) return 40;
  if (n.includes('pırasa') || n.includes('leek')) return 200;
  if (n.includes('turp') || n.includes('radish')) return 15;
  if (n.includes('enginar') || n.includes('artichoke')) return 120;
  if (n.includes('bezelye') || n.includes('pea')) return 5;
  if (n.includes('mısır') || n.includes('corn')) return 150;

  // Meyveler
  if (n.includes('elma') || n.includes('apple')) return 180;
  if (n.includes('armut') || n.includes('pear')) return 170;
  if (n.includes('muz') || n.includes('banana')) return 120;
  if (n.includes('portakal') || n.includes('orange')) return 200;
  if (n.includes('limon') || n.includes('lemon')) return 100;
  if (n.includes('misket limonu') || n.includes('lime')) return 60;
  if (n.includes('çilek') || n.includes('strawberry')) return 15;
  if (n.includes('üzüm') || n.includes('grape')) return 5;
  if (n.includes('kivi') || n.includes('kiwi')) return 80;
  if (n.includes('şeftali') || n.includes('peach')) return 150;
  if (n.includes('kayısı') || n.includes('apricot')) return 40;
  if (n.includes('erik') || n.includes('plum')) return 50;
  if (n.includes('kiraz') || n.includes('cherry')) return 8;
  if (n.includes('avokado') || n.includes('avocado')) return 200;
  if (n.includes('ananas') || n.includes('pineapple')) return 900;
  if (n.includes('karpuz') || n.includes('watermelon')) return 3000;
  if (n.includes('kavun') || n.includes('melon')) return 1500;

  // Ekmek & hamur işleri
  if (n.includes('ekmek dilimi') || n.includes('bread slice')) return 25;
  if (n.includes('ekmek') || n.includes('bread')) return 400;
  if (n.includes('tortilla') || n.includes('wrap')) return 30;
  if (n.includes('kraker') || n.includes('cracker')) return 10;

  // Süt ürünleri
  if (n.includes('yumurta') || n.includes('egg')) return 55;
  if (n.includes('tereyağı') || n.includes('butter')) return 10;
  if (n.includes('peynir dilimi') || n.includes('cheese slice')) return 20;
  if (n.includes('peynir') || n.includes('cheese')) return 30;

  // Kuruyemiş & tohumlar
  if (n.includes('ceviz') || n.includes('walnut')) return 5;
  if (n.includes('badem') || n.includes('almond')) return 1;
  if (n.includes('fındık') || n.includes('hazelnut')) return 1;
  if (n.includes('fıstık') || n.includes('peanut') || n.includes('pistachio')) return 1;
  if (n.includes('susam') || n.includes('sesame')) return 1;

  return 80; // default — 100 yerine 80, biraz daha gerçekçi
}

/**
 * Translates common English measure units and prep terms to Turkish.
 */
function translateUnit(unit: string): string {
  const u = unit.toLowerCase().trim();

  // Prep terms mapping
  const prepMap: Record<string, string> = {
    'chopped': 'doğranmış',
    'finely chopped': 'ince kıyılmış',
    'thinly sliced': 'ince dilimlenmiş',
    'sliced': 'dilimlenmiş',
    'peeled': 'soyulmuş',
    'seeded': 'çekirdekleri çıkarılmış',
    'crushed': 'ezilmiş',
    'beaten': 'çırpılmış',
    'drained': 'süzülmüş',
    'shredded': 'rendelenmiş',
    'melted': 'eritilmiş',
  };

  const unitMap: Record<string, string> = {
    'tsp': 'çay kaşığı',
    'teaspoon': 'çay kaşığı',
    'teaspoons': 'çay kaşığı',
    'tbsp': 'yemek kaşığı',
    'tblsp': 'yemek kaşığı',
    'tablespoon': 'yemek kaşığı',
    'tablespoons': 'yemek kaşığı',
    'cup': 'su bardağı',
    'cups': 'su bardağı',
    'piece': 'adet',
    'pieces': 'adet',
    'slice': 'dilim',
    'slices': 'dilim',
    'handful': 'avuç',
    'pinch': 'tutam',
    'clove': 'diş',
    'cloves': 'diş',
    'can': 'kutu',
    'kg': 'kg',
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'liter': 'L',
    'litre': 'L',
    'oz': 'oz',
    'lb': 'lb',
    'sprig': 'dal',
    'sprigs': 'dal',
    'stalk': 'sap',
    'stalks': 'sap',
  };

  // If match exactly, return it
  if (unitMap[u]) return unitMap[u];
  if (prepMap[u]) return prepMap[u];

  // Try to match partials (e.g. "cups, chopped")
  let translated = u;
  for (const [en, tr] of Object.entries(unitMap)) {
    translated = translated.replace(new RegExp(`\\b${en}\\b`, 'g'), tr);
  }
  for (const [en, tr] of Object.entries(prepMap)) {
    translated = translated.replace(new RegExp(`\\b${en}\\b`, 'g'), tr);
  }

  return translated !== u ? translated : unit;
}

const MODIFIERS = [
  // İngilizce
  'thinly', 'finely', 'roughly', 'coarsely', 'freshly', 'lightly',
  'sliced', 'chopped', 'diced', 'minced', 'grated', 'crushed',
  'peeled', 'trimmed', 'beaten', 'melted', 'softened', 'packed',
  'heaped', 'heaping', 'level', 'rounded',
  'fresh', 'dried', 'frozen', 'cooked', 'raw', 'skinless', 'boneless',
  // Türkçe ← BUNLAR EKSİKTİ
  'ince', 'iri', 'doğranmış', 'kıyılmış', 'rendelenmiş', 'dilimlenmiş',
  'soyulmuş', 'ezilmiş', 'çırpılmış', 'eritilmiş', 'taze', 'kuru'
];

const KNOWN_UNITS = [
  // İngilizce
  'g', 'gr', 'gram', 'kg', 'ml', 'l', 'liter', 'litre',
  'cup', 'cups', 'tbsp', 'tblsp', 'tsp', 'tablespoon', 'teaspoon',
  'oz', 'lb', 'lbs', 'pound', 'pounds', 'ounce', 'ounces',
  'piece', 'pieces', 'clove', 'cloves', 'slice', 'slices',
  'can', 'tin', 'stick', 'head', 'bunch', 'sprig', 'handful',
  'pint', 'quart', 'gallon', 'packet', 'package',
  // Türkçe ← BUNLAR EKSİKTİ
  'çay kaşığı', 'yemek kaşığı', 'su bardağı', 'adet', 'dilim',
  'avuç', 'tutam', 'diş', 'kutu', 'dal', 'sap', 'demet'
];

function extractUnit(rest: string): string {
  if (!rest) return 'piece';

  const lower = rest.toLowerCase().trim();

  // Çok kelimeli birimleri önce kontrol et
  if (lower.startsWith('yemek kaşığı') || lower.includes('yemek kaşığı')) return 'yemek kaşığı';
  if (lower.startsWith('çay kaşığı') || lower.includes('çay kaşığı')) return 'çay kaşığı';
  if (lower.startsWith('su bardağı') || lower.includes('su bardağı')) return 'su bardağı';
  if (lower.startsWith('fl oz')) return 'fl oz';

  const words = lower.split(/\s+/);

  for (const word of words) {
    // Türkçe karakterleri de koru
    const clean = word.replace(/[^a-zğüşıöçâîû]/g, '');
    if (KNOWN_UNITS.includes(clean)) {
      return clean;
    }
    if (!MODIFIERS.includes(clean)) {
      break;
    }
  }

  return 'piece';
}

/**
 * Parses a string like "3/4 cup" or "1 1/2 tbsp" into amount and unit.
 * @param measure The measure string from an API (e.g. TheMealDB)
 */
export function parseMeasure(measure: string): { amount: number; unit: string; requiresManualInput: boolean } {
  const VAGUE_MEASURES = [
    'to taste', 'some', 'a pinch', 'as needed', 'as required',
    'a bit', 'a few', 'dash', 'splash', 'handful',
    'enough', 'desired', 'optional', 'garnish', 'for garnish',
    'to serve', 'for serving', 'to coat', 'for coating',
    '', 'null', 'undefined'
  ];

  // VAGUE_MEASURES kontrolünden hemen sonra, cleaned üzerinde çalışmadan önce ekle:
  function normalizeUnicodeFractions(str: string): string {
    return str
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
  const cleaned = normalizeUnicodeFractions(measure.trim().toLowerCase());

  if (!cleaned || VAGUE_MEASURES.includes(cleaned)) {
    return { amount: 0, unit: 'gram', requiresManualInput: true };
  }

  let amount = 1;
  let unit = 'piece';
  let requiresManualInput = false;

  // Handle fractions: "1/2", "3/4"
  const fractionMatch = cleaned.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (fractionMatch) {
    amount = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
    unit = fractionMatch[3].trim() || 'piece';
  } else {
    const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
    if (mixedMatch) {
      amount = parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
      unit = mixedMatch[4].trim() || 'piece';
    } else {
      const simpleMatch = cleaned.match(/^([\d.]+)\s*(.*)$/);
      if (simpleMatch) {
        amount = parseFloat(simpleMatch[1]);
        const rest = simpleMatch[2].trim();
        unit = extractUnit(rest);
      } else {
        requiresManualInput = true;
      }
    }
  }

  const finalUnit = translateUnit(unit);

  return { amount, unit: finalUnit, requiresManualInput };
}

/**
 * Parses the net weight/volume from a product name.
 * Example: "Migros Süt 1 L" -> 1000
 * Example: "Yoğurt 500 g" -> 500
 * Example: "Su 330 ml" -> 330
 */
export function parseProductGrams(productName: string): number {
  const name = productName.toLowerCase();

  // Try to match "1.5 L", "1 L", "1 litre", "1 lt"
  const literMatch = name.match(/(\d+[.,]?\d*)\s*(l|lt|litre)/i);
  if (literMatch) {
    const val = parseFloat(literMatch[1].replace(',', '.'));
    return val * 1000;
  }

  // Try to match "500 ml"
  const mlMatch = name.match(/(\d+[.,]?\d*)\s*(ml|mililitre)/i);
  if (mlMatch) {
    return parseFloat(mlMatch[1].replace(',', '.'));
  }

  // Try to match "2 kg", "2.5 kg"
  const kgMatch = name.match(/(\d+[.,]?\d*)\s*(kg|kilogram)/i);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1].replace(',', '.'));
    return val * 1000;
  }

  // Try to match "500 g", "500 gr"
  const gMatch = name.match(/(\d+[.,]?\d*)\s*(g|gr|gram)/i);
  if (gMatch) {
    return parseFloat(gMatch[1].replace(',', '.'));
  }

  return 100; // Default fallback
}
