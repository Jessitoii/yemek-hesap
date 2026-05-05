# Calculation Engine Bug Report

## Bug 1: Migros package size is not structured
- **Root cause**: Migros product responses expose `shownPrice`, `unit`, `unitPrice`, name, brand and category fields, but not a reliable structured net gram/litre field. Sizes such as `Migros Un 2 Kg`, `Migros %3 Yağlı Uht Süt 1 L`, and `Keskinoglu 15'li L Büyük Boy Yumurta (63-72 G)` are embedded in `name`.
- **Example**: Recipe says `1 medium onion`. Migros can return an onion product sold by kilogram or a named package. If the code divides price by a hardcoded package gram value, cost can be off by the full package-size ratio.
- **Affected files**: `services/migros.ts`, `utils/unitConverter.ts`, `utils/priceCalc.ts`, `hooks/useRecipeCalculation.ts`.
- **Severity**: High

## Bug 2: Unknown product weights were guessed
- **Root cause**: The old calculation path could keep going when product size was unknown, which made cost look precise even when the package denominator was missing.
- **Example**: Migros returns `Doğal Ürün` with no `500 g`, `1 L`, `10'lu`, or similar size token. Current behavior must show `₺?.??` instead of pretending the product is 100g.
- **Affected files**: `services/migros.ts`, `utils/priceCalc.ts`, recipe and daily UI surfaces.
- **Severity**: High

## Bug 3: Piece-based recipe measures need ingredient context
- **Root cause**: TheMealDB uses measures like `5 thinly sliced`, `2 finely chopped`, `8 cloves chopped`, `1 bunch`, `2`, and `To taste`. Unit words such as `medium`, `clove`, `slice`, and missing units cannot be converted without the ingredient.
- **Example**: `3 cloves garlic` should use garlic clove grams, while `3 pieces tomato` should use tomato piece grams. A generic `adet = 100g` fallback is unsafe.
- **Affected files**: `utils/unitConverter.ts`, `utils/densityTable.ts`, `hooks/useRecipeCalculation.ts`.
- **Severity**: High

## Bug 4: Turkish density keys did not normalize
- **Root cause**: Lookup keys must normalize Turkish characters. Without normalization, `soğan` and `sogan` can miss each other.
- **Example**: TheMealDB translation may produce `soğan`, while user/manual text or search cleanup may produce `sogan`; both should hit the onion entry.
- **Affected files**: `utils/densityTable.ts`, `utils/unitConverter.ts`.
- **Severity**: Medium

## Bug 5: OpenFoodFacts energy fields need validation
- **Root cause**: OpenFoodFacts usually provides `energy-kcal_100g` as per-100g data, but some records only include serving energy and serving quantity. Some records are absurd, such as tens of thousands of kcal per 100g.
- **Example**: If only `energy-kcal` and `serving_quantity` exist, kcal must be normalized to 100g. Absurd records should be rejected instead of clamped into misleading values.
- **Affected files**: `services/openfoodfacts.ts`, `hooks/useNutrition.ts`.
- **Severity**: Medium

## Bug 6: USDA energy selection was too broad
- **Root cause**: USDA can include several energy-like nutrient rows. The calculator should prefer nutrient name `Energy` with unit `KCAL`, using Atwater energy only as fallback.
- **Example**: Branded items with a `servingSize` not equal to 100 may need extra review, so the service now warns rather than silently assuming every record is already 100g-normalized.
- **Affected files**: `services/usda.ts`.
- **Severity**: Medium

## Bug 7: Partial totals looked complete
- **Root cause**: Recipe totals summed available ingredient values while missing ingredients contributed `0`.
- **Example**: If 4 ingredients have costs and 1 ingredient has null cost, total cost must show `₺?.?? (bazı malzemeler eksik)` rather than a partial TL amount.
- **Affected files**: `hooks/useRecipeCalculation.ts`, `components/recipes/RecipeDetailHeader.tsx`, `components/recipes/RecipeCard.tsx`, recipe creation/detail screens.
- **Severity**: High

## Migros response shape notes
- Search endpoint: `data.searchInfo.storeProductInfos[]`.
- Useful fields found: `id`, `name`, `shownPrice` in kuruş, `unit`, `unitPrice`, `brand.name`, `category.name`, `categoryAscendants[]`, `images[].urls.PRODUCT_LIST`.
- Missing structured data: no dependable net grams/litres/count field for every product.
- Safe assumption: `shownPrice / 100` converts kuruş to TL for display/calculation.
- Unsafe assumption: deriving package size from `unit`, `unitPrice`, or a hardcoded 100g fallback.

## Safe vs unsafe assumptions
- **Safe**: `energy-kcal_100g` from OpenFoodFacts is per 100g when present and sane.
- **Safe**: USDA raw/common foods generally report nutrients per 100g.
- **Safe enough**: litres and millilitres can be approximated as grams with `1 ml = 1 g` unless ingredient-specific density is available.
- **Unsafe**: count-only packages like `6'lı` for non-egg products. Return null unless the product name contains enough context.
- **Unsafe**: vague TheMealDB measures like `to taste`, `bunch`, or bare `1` when no density/manual override exists.
