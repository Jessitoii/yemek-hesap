import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * Hook for basic step tracking using expo-pedometer.
 * Used for simple real-time feedback without full Health integration.
 * Also acts as the primary step data source if Health Kit is unavailable.
 */
export function usePedometer() {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let subscription: Pedometer.Subscription | null = null;

    const startUpdate = async () => {
      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (available && Platform.OS !== 'web') {
         // Subscribe to step changes while the hook is mounted
         subscription = Pedometer.watchStepCount((result) => {
           setSteps(result.steps);
         });
         setIsSubscribed(true);

         // Also fetch today's total steps initially
         const start = new Date();
         start.setHours(0, 0, 0, 0);
         const end = new Date();
         const result = await Pedometer.getStepCountAsync(start, end);
         setSteps(result.steps);
      }
    };

    startUpdate();

    return () => {
      if (subscription) subscription.remove();
      setIsSubscribed(false);
    };
  }, []);

  return { 
    steps, 
    isAvailable, 
    isSubscribed 
  };
}
