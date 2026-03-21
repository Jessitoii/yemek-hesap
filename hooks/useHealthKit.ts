import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { 
  requestHealthPermissions, 
  getTodaySteps, 
  writeCaloriesConsumed 
} from '@/services/health';
import { usePedometer } from './usePedometer';
import { useActivityStore } from '@/stores/activityStore';

/**
 * Hook for integrating with platform-specific health kits (HealthKit/Health Connect).
 * Automatically falls back to internalusePedometer hook if health app permissions are denied.
 */
export function useHealthKit() {
  const [isConnected, setIsConnected] = useState(false);
  const { steps: pedometerSteps, isAvailable: isPedometerAvailable } = usePedometer();
  const activityStore = useActivityStore();

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    
    try {
      const granted = await requestHealthPermissions();
      setIsConnected(granted);
      return granted;
    } catch (error) {
      console.warn('[useHealthKit] Permission request failed:', error);
      setIsConnected(false);
      return false;
    }
  }, []);

  const syncSteps = useCallback(async () => {
    if (isConnected) {
       const steps = await getTodaySteps();
       // Estimated calories from steps (e.g., 0.04 kcal per step)
       const burnedCalories = Math.round(steps * 0.04);
       await activityStore.updateSteps(steps, burnedCalories);
    } else if (isPedometerAvailable) {
       const burnedCalories = Math.round(pedometerSteps * 0.04);
       await activityStore.updateSteps(pedometerSteps, burnedCalories);
    }
  }, [isConnected, isPedometerAvailable, pedometerSteps, activityStore]);

  const writeCalories = useCallback(async (calories: number) => {
    if (isConnected) {
      await writeCaloriesConsumed(calories);
    }
  }, [isConnected]);

  // Initial permission check if previously granted (logic simplified for now)
  useEffect(() => {
    // On mount, if we are not connected but it is possible, check status or request if already seen
    // requestPermission(); 
    // Commented out to avoid intrusive popups on first mount
  }, []);

  return {
    isConnected,
    steps: isConnected ? 0 /* fetched in syncSteps */ : pedometerSteps,
    requestPermission,
    syncSteps,
    writeCalories,
  };
}
