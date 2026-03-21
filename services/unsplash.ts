import { ImageResult } from '@/types/api';

const ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;

/**
 * Searches for food-related images on Unsplash.
 */
export async function searchUnsplashImages(query: string): Promise<ImageResult[]> {
  if (!ACCESS_KEY) {
    console.warn('[Unsplash API] Access key missing');
    return [];
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' food')}&client_id=${ACCESS_KEY}&per_page=5&orientation=landscape`;

    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 403) console.warn('[Unsplash API] Rate limit reached or key invalid');
        return [];
    }

    const json = await response.json();
    const results = json?.results ?? [];

    return results.map((photo: any): ImageResult => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbUrl: photo.urls.thumb,
      credit: photo.user.name,
    }));
  } catch (error) {
    console.warn('[Unsplash API] Error searching images:', error);
    return [];
  }
}
