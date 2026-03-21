import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';

/**
 * Platform-aware health service. 
 * On iOS: Intended for react-native-health (HealthKit)
 * On Android: Intended for react-native-health-connect (Google Health Connect)
 * Universal Fallback: expo-pedometer
 */

export async function requestHealthPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) return false;

    const { status } = await Pedometer.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('[Health Service] Permission request failed:', error);
    return false;
  }
}

export async function getTodaySteps(): Promise<number> {
  if (Platform.OS === 'web') return 0;

  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) return 0;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();

    const result = await Pedometer.getStepCountAsync(start, end);
    return result.steps;
  } catch (error) {
    console.warn('[Health Service] Error getting steps:', error);
    return 0;
  }
}

export async function writeCaloriesConsumed(calories: number): Promise<void> {
  // Logic to write to HealthKit/Health Connect would go here.
  // Requires native modules and EAS build.
  // For now, this is a placeholder interface.
  console.log(`[Health Service] Placeholder: Writing ${calories} kcal to health app`);
}
