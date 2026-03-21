import { getTranslation, setTranslation } from '@/db/queries/cache';

/**
 * Translates text from English to Turkish using MyMemory API.
 * Uses SQLite caching as the first priority to avoid unnecessary API calls.
 */
export async function translateToTurkish(text: string): Promise<string> {
  const query = text.trim().toLowerCase();

  try {
    // 1. Check SQLite cache
    const cached = await getTranslation(query);
    if (cached) return cached;

    // 2. Call MyMemory API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|tr`;
    const response = await fetch(url);
    if (!response.ok) return text;

    const json = await response.json();
    const translated = json?.responseData?.translatedText;

    // Status 200 is success, anything else means limits or errors
    if (!translated || json?.responseStatus !== 200) {
      console.warn('[MyMemory API] Translation failed or limit reached. Status:', json?.responseStatus);
      return text;
    }

    // 3. Cache the result
    await setTranslation(query, translated);
    return translated;
  } catch (error) {
    console.warn('[MyMemory API] Error translating text:', error);
    return text; // Return original text on failure
  }
}

/**
 * Translates longer strings by splitting them into chunks to stay within API limits.
 */
export async function translateLongText(text: string): Promise<string> {
  if (!text || text.length < 400) {
    return translateToTurkish(text);
  }

  // Split into chunks of ~400 characters (splitting at spaces if possible)
  const chunks: string[] = [];
  const chunkSize = 400;
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= chunkSize) {
      chunks.push(remaining);
      break;
    }

    // Attempt to find a space near the chunk limit to avoid cutting words
    let splitIndex = remaining.lastIndexOf(' ', chunkSize);
    if (splitIndex === -1) splitIndex = chunkSize;

    chunks.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex).trim();
  }

  // Translate all chunks and join them
  const translatedChunks = await Promise.all(
    chunks.map(chunk => translateToTurkish(chunk))
  );

  return translatedChunks.join(' ');
}

export async function translateToEnglish(text: string): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tr|en`
    const res = await fetch(url)
    const json = await res.json()
    const translated = json?.responseData?.translatedText
    if (translated && translated !== text && json?.responseStatus === 200) {
      return translated.toLowerCase().trim()
    }
    return null
  } catch {
    return null
  }
}
