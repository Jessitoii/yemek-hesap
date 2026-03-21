import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * iOS     → getStepCountAsync (gün başından toplam) + watchStepCount (delta)
 * Android → SADECE watchStepCount (uygulama açıldığından itibaren)
 *           Gün başından itibaren adım için Health Connect gerekli (services/health.ts)
 */
export function usePedometer() {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const baseStepsRef = useRef(0);

  useEffect(() => {
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;

    const startUpdate = async () => {
      const available = await Pedometer.isAvailableAsync();
      console.log('[Pedometer] isAvailable:', available);
      console.log('[Pedometer] Platform:', Platform.OS);
      setIsAvailable(available);

      if (!available || Platform.OS === 'web') return;

      if (Platform.OS === 'ios') {
        try {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const todayResult = await Pedometer.getStepCountAsync(start, new Date());
          baseStepsRef.current = todayResult.steps;
          setSteps(todayResult.steps);
        } catch {
          baseStepsRef.current = 0;
        }
      }

      // Android ve iOS: watchStepCount ile delta'ları izle
      subscription = Pedometer.watchStepCount((result) => {
        console.log('[Pedometer] watchStepCount delta:', result.steps);
        if (Platform.OS === 'ios') {
          setSteps(baseStepsRef.current + result.steps);
        } else {
          // Android: sadece uygulama açıldığından itibaren delta
          setSteps(result.steps);
        }
      });

      setIsSubscribed(true);
    };

    startUpdate();

    return () => {
      if (subscription) subscription.remove();
      setIsSubscribed(false);
    };
  }, []);

  return { steps, isAvailable, isSubscribed };
}