// EAS Build aşamasında implemente edilecek
// Expo Go'da expo-notifications çalışmıyor (SDK 53+)
export function useNotifications() {
  return {
    scheduleAll: async () => {},
    cancelAll: async () => {},
    requestPermission: async () => false,
  }
}
