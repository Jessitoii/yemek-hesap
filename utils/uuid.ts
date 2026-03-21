/**
 * Generates a unique identifier.
 * Using a simple implementation as we are in a pure utility module.
 * In a real-world scenario, you might use 'uuid' or 'expo-crypto'.
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11) + 
         Math.random().toString(36).substring(2, 11);
};
