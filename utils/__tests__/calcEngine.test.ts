import {
  extractProductWeight,
  hasNonFoodMigrosSignal,
  isBouillonTabletProduct,
  isLiquidMeasureUnit,
  scoreMigrosMatch,
  shouldExcludeLiquidIngredientProduct,
} from '@/services/migros';
import { calcCostFromUnitPrice, calcCostTL, parseUnitPricePerKg } from '@/utils/priceCalc';
import { findDensityEntry } from '@/utils/densityTable';
import { parseMeasure, toGrams } from '@/utils/unitConverter';

function caloriesFor(kcalPer100g: number | null, grams: number | null): number | null {
  if (kcalPer100g == null || grams == null) return null;
  return (kcalPer100g / 100) * grams;
}

function completeTotal(values: Array<number | null>): number | null {
  if (values.some(value => value == null)) return null;
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

describe('extractProductWeight', () => {
  it('parses "2.5 Kg"', () => {
    expect(extractProductWeight('Migros Kuru Soğan 2.5 Kg')).toEqual({ grams: 2500, unit: 'kg' });
  });

  it('parses "500 g"', () => {
    expect(extractProductWeight('Migros Un 500 g')).toEqual({ grams: 500, unit: 'g' });
  });

  it('parses "1 L"', () => {
    expect(extractProductWeight('Pınar Süt 1 L')).toEqual({ grams: 1000, unit: 'l' });
  });

  it('parses "200 ml"', () => {
    expect(extractProductWeight('Ayran 200 ml')).toEqual({ grams: 200, unit: 'ml' });
  });

  it('parses egg count packages', () => {
    expect(extractProductWeight("Yumurta 10'lu")).toEqual({ grams: 550, unit: 'adet' });
  });

  it('parses egg count packages without per-egg gram ranges', () => {
    expect(extractProductWeight("Yayla Yumurta L 15'li")).toEqual({ grams: 825, unit: 'adet' });
  });

  it('parses egg count packages with gram ranges', () => {
    const result = extractProductWeight("Keskinoglu 15'li L Büyük Boy Yumurta (63-72 G)");
    expect(result?.unit).toBe('adet');
    expect(result?.grams).toBeCloseTo(15 * 67.5, 1);
  });

  it('parses multipack gram products', () => {
    expect(extractProductWeight('Tavuk Yağı 4 x 50 G')).toEqual({ grams: 200, unit: 'g' });
  });

  it('returns null for unknown names', () => {
    expect(extractProductWeight('Doğal Ürün')).toBeNull();
  });
});

describe('priceCalc', () => {
  it('calculates cost for 200g from a 1kg product at 100 TL', () => {
    expect(calcCostTL(100, 1000, 200)).toBe(20);
  });

  it('handles kuruş to TL conversion before calculation', () => {
    const shownPriceKurus = 10000;
    expect(calcCostTL(shownPriceKurus / 100, 1000, 200)).toBe(20);
  });

  it('returns null when product weight is unknown', () => {
    expect(calcCostTL(100, null, 200)).toBeNull();
  });

  it('returns null for the onion smoke case when product weight is unknown', () => {
    expect(calcCostTL(87.50, null, 110)).toBeNull();
  });

  it('calculates cost from Migros unit price when package grams are unavailable', () => {
    const unitPricePerKg = parseUnitPricePerKg('(59,93 TL/Kg)');
    expect(unitPricePerKg).toBe(59.93);
    expect(calcCostFromUnitPrice(unitPricePerKg, 220)).toBe(13.18);
  });

  it('calculates egg carton cost from count-derived package grams', () => {
    expect(calcCostTL(89.90, extractProductWeight("Yayla Yumurta L 15'li")?.grams, 220)).toBe(23.97);
  });
});

describe('unitConverter', () => {
  it('converts "1 medium onion" to about 110g', () => {
    expect(toGrams(1, 'medium', 'onion')).toBe(110);
  });

  it('converts "2 tablespoons olive oil" to about 26g', () => {
    expect(toGrams(2, 'tablespoons', 'olive oil')).toBe(26);
  });

  it('converts "1 cup flour" to about 125g', () => {
    expect(toGrams(1, 'cup', 'flour')).toBe(125);
  });

  it('converts "3 cloves garlic" to about 12g', () => {
    expect(toGrams(3, 'cloves', 'garlic')).toBe(12);
  });

  it('converts 2 bay leaves to about 1g', () => {
    expect(toGrams(2, 'piece', 'bay leaf')).toBe(1);
  });

  it('parses range measures using the midpoint', () => {
    expect(parseMeasure('1-2 tbsp')).toEqual({
      amount: 1.5,
      unit: 'yemek kaşığı',
      requiresManualInput: false,
    });
    expect(parseMeasure('6-8 slices')).toEqual({
      amount: 7,
      unit: 'dilim',
      requiresManualInput: false,
    });
  });

  it('parses juice-of measures and converts citrus juice', () => {
    expect(parseMeasure('juice of 2')).toEqual({
      amount: 2,
      unit: 'juice_of',
      requiresManualInput: false,
    });
    expect(toGrams(2, 'juice_of', 'lemon')).toBe(60);
    expect(toGrams(2, 'juice_of', 'orange')).toBe(120);
  });

  it('strips descriptive words after the unit', () => {
    expect(parseMeasure('750g piece')).toEqual({
      amount: 750,
      unit: 'gram',
      requiresManualInput: false,
    });
  });

  it('marks bunch measures as manual-needed', () => {
    expect(parseMeasure('1 bunch')).toEqual({
      amount: 0,
      unit: 'gram',
      requiresManualInput: true,
    });
  });
});

describe('calorie calculation per ingredient', () => {
  it('calculates calories for 110g onion at 40 kcal/100g', () => {
    expect(caloriesFor(40, 110)).toBe(44);
  });

  it('calculates calories for 2 eggs at 155 kcal/100g', () => {
    const grams = toGrams(2, 'adet', 'egg');
    expect(caloriesFor(155, grams)).toBe(155);
  });
});

describe('onion calculation smoke trace', () => {
  it('calculates grams, cost, and calories for 1 medium onion from a 2.5kg Migros product', () => {
    const productWeight = extractProductWeight('Kuru Sogan 2.5 Kg');
    const usedGrams = toGrams(1, 'medium', 'onion');

    expect(productWeight).toEqual({ grams: 2500, unit: 'kg' });
    expect(usedGrams).toBe(110);
    expect(calcCostTL(87.50, productWeight?.grams, usedGrams)).toBe(3.85);
    expect(caloriesFor(40, usedGrams)).toBe(44);
  });
});

describe('density normalization', () => {
  it('matches "soğan" and "sogan" to the same entry', () => {
    expect(findDensityEntry('soğan')).toEqual(findDensityEntry('sogan'));
  });
});

describe('density Turkish character normalization', () => {
  it('matches Turkish characters and ASCII aliases to the same entry', () => {
    expect(findDensityEntry('soğan')).toEqual(findDensityEntry('sogan'));
  });
});

describe('Migros non-food filtering', () => {
  it('detects personal care products as non-food matches', () => {
    expect(hasNonFoodMigrosSignal(['Kişisel Bakım', 'Clear Women Kepeğe Karşı Şampuan'])).toBe(true);
  });
});

describe('Migros match scoring', () => {
  it('prefers spice products over fresh vegetables for dry spices', () => {
    const freshPepper = {
      id: '1',
      name: 'Taze Kirmizi Biber 500g',
      price: 39.90,
      imageUrl: '',
      unit: 'adet',
      category: 'Meyve & Sebze',
      topCategory: 'Meyve & Sebze',
    };
    const paprikaPowder = {
      id: '2',
      name: 'Kirmizi Biber Toz 50g',
      price: 29.90,
      imageUrl: '',
      unit: 'adet',
      category: 'Baharatlar',
      topCategory: 'Baharatlar',
    };

    expect(scoreMigrosMatch(paprikaPowder, 'paprika', 'tsp', 1))
      .toBeGreaterThan(scoreMigrosMatch(freshPepper, 'paprika', 'tsp', 1));
  });

  it('identifies liquid broth tablet matches as disqualified', () => {
    expect(isLiquidMeasureUnit('quart')).toBe(true);
    expect(isBouillonTabletProduct("Knorr Et Suyu Tableti 12'li")).toBe(true);
  });

  it('penalizes implausibly small onion products', () => {
    const onionPack = {
      id: '1',
      name: 'Kuru Sogan 2.5 Kg',
      price: 87.50,
      imageUrl: '',
      unit: 'adet',
      category: 'Meyve & Sebze',
      topCategory: 'Meyve & Sebze',
    };
    const chives = {
      id: '2',
      name: 'Frenk Sogani Siniklav 25g',
      price: 175.90,
      imageUrl: '',
      unit: 'adet',
      category: 'Meyve & Sebze',
      topCategory: 'Meyve & Sebze',
    };

    expect(scoreMigrosMatch(onionPack, 'sogan', 'adet', 1, 110))
      .toBeGreaterThan(scoreMigrosMatch(chives, 'sogan', 'adet', 1, 110));
  });

  it('penalizes sauce products for solid ingredients', () => {
    const freshPepper = {
      id: '1',
      name: 'Yesil Biber 500g',
      price: 39.90,
      imageUrl: '',
      unit: 'adet',
      category: 'Meyve & Sebze',
      topCategory: 'Meyve & Sebze',
    };
    const tabasco = {
      id: '2',
      name: 'Tabasco Yesil Biber Sosu 60ml',
      price: 89.90,
      imageUrl: '',
      unit: 'adet',
      category: 'Soslar',
      topCategory: 'Soslar',
    };

    expect(scoreMigrosMatch(freshPepper, 'yesil biber', 'adet', 1, 80))
      .toBeGreaterThan(scoreMigrosMatch(tabasco, 'yesil biber', 'adet', 1, 80));
  });

  it('excludes confectionery products for liquid ingredients', () => {
    const wafer = {
      id: '1',
      name: 'Ulker Cokonat Gofret',
      price: 15.90,
      imageUrl: '',
      unit: 'adet',
      category: 'Bisküvi & Gofret',
      topCategory: 'Atıştırmalık',
    };

    expect(shouldExcludeLiquidIngredientProduct(wafer, 'coconut milk', 'ml')).toBe(true);
  });
});

describe('complete totals', () => {
  it('returns null when any ingredient cost is null', () => {
    expect(completeTotal([12, null, 8])).toBeNull();
  });

  it('returns null when any ingredient calories value is null', () => {
    expect(completeTotal([44, 155, null])).toBeNull();
  });
});
