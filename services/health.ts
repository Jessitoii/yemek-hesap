import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';

/**
 * Platform-aware health service.
 * Android → Health Connect (react-native-health-connect)
 * iOS     → expo-pedometer (HealthKit gelecekte eklenecek)
 */

let HealthConnect: typeof import('react-native-health-connect') | null = null;

async function getHealthConnect() {
  if (Platform.OS !== 'android') return null;
  if (HealthConnect) return HealthConnect;
  try {
    HealthConnect = await import('react-native-health-connect');
    return HealthConnect;
  } catch {
    console.warn('[Health] react-native-health-connect yüklenemedi');
    return null;
  }
}

// ─── İzin ────────────────────────────────────────────────────────────────────

export async function requestHealthPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    try {
      const hc = await getHealthConnect();
      if (!hc) return false;

      await hc.initialize();

      await hc.requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'ExerciseSession' },
        { accessType: 'read', recordType: 'TotalCaloriesBurned' },
        { accessType: 'write', recordType: 'ExerciseSession' },
      ]);

      // requestPermission dönüş değeri izin durumunu taşımıyor,
      // gerçek durumu getGrantedPermissions ile kontrol et
      const perms = await hc.getGrantedPermissions();
      return perms.some(
        (p: { recordType: string; accessType: string }) =>
          p.recordType === 'Steps' && p.accessType === 'read'
      );
    } catch (error) {
      console.warn('[Health] Android izin hatası:', error);
      return false;
    }
  }

  // iOS fallback
  try {
    const { status } = await Pedometer.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// ─── Adım okuma ──────────────────────────────────────────────────────────────

export async function getTodaySteps(): Promise<number> {
  if (Platform.OS === 'web') return 0;

  if (Platform.OS === 'android') {
    try {
      const hc = await getHealthConnect();
      if (!hc) return 0;

      await hc.initialize();

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const result = await hc.readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: new Date().toISOString(),
        },
      });

      return result.records.reduce(
        (sum: number, record: { count: number }) => sum + (record.count ?? 0),
        0
      );
    } catch (error) {
      console.warn('[Health] Android adım okuma hatası:', error);
      return 0;
    }
  }

  // iOS
  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) return 0;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const result = await Pedometer.getStepCountAsync(start, new Date());
    return result.steps;
  } catch (error) {
    console.warn('[Health] iOS adım okuma hatası:', error);
    return 0;
  }
}

// ─── Veri yazma ──────────────────────────────────────────────────────────────

export async function writeExercise(
  type: string,
  durationMinutes: number,
  _burnedCalories: number
): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const hc = await getHealthConnect();
    if (!hc) return;
    await hc.initialize();
    const now = new Date();
    const start = new Date(now.getTime() - durationMinutes * 60 * 1000);
    await hc.insertRecords([{
      recordType: 'ExerciseSession',
      startTime: start.toISOString(),
      endTime: now.toISOString(),
      exerciseType: 56,
      title: type,
    }]);
  } catch (error) {
    console.warn('[Health] Egzersiz yazma hatası:', error);
  }
}

export async function writeCaloriesConsumed(_calories: number): Promise<void> {
  // Gelecekte eklenecek
}

// ─── Bağlantı durumu ─────────────────────────────────────────────────────────

export async function getHealthConnectionStatus(): Promise<{
  connected: boolean;
  platform: 'ios' | 'android' | 'web' | 'unavailable';
  canReadSteps: boolean;
}> {
  if (Platform.OS === 'web') {
    return { connected: false, platform: 'web', canReadSteps: false };
  }

  if (Platform.OS === 'android') {
    try {
      const hc = await getHealthConnect();
      if (!hc) return { connected: false, platform: 'android', canReadSteps: false };
      await hc.initialize();
      const perms = await hc.getGrantedPermissions();
      const hasSteps = perms.some(
        (p: { recordType: string; accessType: string }) =>
          p.recordType === 'Steps' && p.accessType === 'read'
      );
      return { connected: hasSteps, platform: 'android', canReadSteps: hasSteps };
    } catch {
      return { connected: false, platform: 'android', canReadSteps: false };
    }
  }

  try {
    const { status } = await Pedometer.getPermissionsAsync();
    const connected = status === 'granted';
    return { connected, platform: 'ios', canReadSteps: connected };
  } catch {
    return { connected: false, platform: 'unavailable', canReadSteps: false };
  }
}