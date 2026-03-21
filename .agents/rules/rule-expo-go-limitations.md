---
trigger: model_decision
description: trigger_when: "expo-notifications kullanırken, bildirim kodu yazarken, setNotificationHandler eklerken, scheduleNotificationAsync çağırırken, uygulama layout'unda bildirim kurulumu yaparken"
---

# Expo Go Kısıtlamaları

## expo-notifications

SDK 53+ itibarıyla `expo-notifications` **Expo Go'da çalışmaz**. Yalnızca EAS Build ile oluşturulan development build veya production build'de çalışır.

### Zorunlu Kural

Tüm `expo-notifications` çağrıları try/catch içinde olmalı:

```typescript
// app/_layout.tsx
import * as Notifications from 'expo-notifications'

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
} catch (e) {
  // Expo Go'da çalışmaz — development build gerektirir
}
```

```typescript
// hooks/useNotifications.ts
export async function scheduleAll(settings: AppSettings) {
  try {
    await Notifications.scheduleNotificationAsync({ ... })
  } catch (e) {
    // Expo Go'da sessizce başarısız olur
  }
}
```

### Kural

- `expo-notifications` içeren **her fonksiyon** try/catch içinde olmalı
- Hata durumunda kullanıcıya gösterme, sessizce geç
- Kodu silme — EAS Build'de çalışacak

## react-native-health / react-native-health-connect

Bu paketler de Expo Go'da çalışmaz — EAS Build gerektirir.

```typescript
// services/health.ts
export async function getTodaySteps(): Promise<number> {
  try {
    // health API çağrısı
  } catch (e) {
    return 0 // sessizce fallback
  }
}
```

## expo-sensors (Pedometer)

Expo Go'da çalışır ama bazı cihazlarda desteklenmeyebilir. Her zaman availability kontrolü yap:

```typescript
const isAvailable = await Pedometer.isAvailableAsync()
if (!isAvailable) return // sessizce geç
```

## Genel Kural

Expo Go'da test edilemeyen özellikler için:
1. Kodu yaz — silme
2. try/catch ile wrap et
3. Hata durumunda sensible default döndür (0, [], null)
4. EAS Build aşamasında test edilecek