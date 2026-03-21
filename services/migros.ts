import { MigrosProduct } from '@/types/ingredient';

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

    const json = await response.json();
    const items = json?.data?.searchInfo?.storeProductInfos ?? [];

    return items.map((item: any): MigrosProduct => ({
      id: String(item.id),
      name: item.name,
      price: item.shownPrice / 100,
      imageUrl: item.images?.[0]?.urls?.PRODUCT_LIST ?? '',
      brand: item.brand?.name ?? 'Migros',
      unit: item.unit ?? 'adet',
      pricePerUnit: item.unitPrice ? item.unitPrice / 100 : undefined,
      unitType: item.unitPrice ? (item.unitType === 'KG' ? 'kg' : 'adet') : undefined,
      category: item.category?.name ?? null,
      topCategory: item.categoryAscendants?.[item.categoryAscendants.length - 2]?.name
        ?? item.categoryAscendants?.[0]?.name
        ?? item.category?.name ?? null,
    }));
  } catch (error) {
    console.warn('[Migros API] Error searching products:', error);
    return [];
  }
}
