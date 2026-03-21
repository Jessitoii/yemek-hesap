import React, { useEffect, useState } from "react";
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen'; // ← 1. IMPORT EKLENDİ

import { Stack, useRouter, useSegments } from "expo-router";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold
} from "@expo-google-fonts/nunito";
import { initDB } from "../db";
import { clearCalorieCache } from "@/db/queries/cache";

// ← 2. COMPONENT DIŞINDA — splash'i hazır olana kadar tut
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false)
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded, fontError] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-Medium': Nunito_500Medium,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
    'Nunito-ExtraBold': Nunito_800ExtraBold,
  });

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.debug('[RootLayout] Notifications not supported in this environment');
  }

  useEffect(() => {
    async function init() {
      try {
        await initDB()

        const { useUserStore } = await import("@/stores/userStore")
        const { useRecipesStore } = await import("@/stores/recipesStore")
        const { useDailyStore } = await import("@/stores/dailyStore")

        await useUserStore.getState().loadUser()
        setUserLoaded(true)

        await useRecipesStore.getState().loadRecipes()
        await useRecipesStore.getState().loadIngredients()

        const today = new Date().toISOString().split('T')[0]
        await useDailyStore.getState().loadLog(today)

      } catch (e) {
        console.error("Initialization failed:", e)
        setUserLoaded(true)
      } finally {
        setDbReady(true)
      }
    }
    init()
  }, [])

  // ← 3. SPLASH'İ KAPAT — fontlar ve db hazır olunca
  useEffect(() => {
    if ((fontsLoaded || fontError) && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dbReady])

  useEffect(() => {
    if (!userLoaded || !fontsLoaded) return

    const { useUserStore } = require("@/stores/userStore")
    const onboardingCompleted = useUserStore.getState().onboardingCompleted
    const inOnboardingGroup = segments[0] === "(onboarding)"
    if (!onboardingCompleted && !inOnboardingGroup) {
      router.replace("/(onboarding)")
    } else if (onboardingCompleted && inOnboardingGroup) {
      router.replace("/(tabs)/discover")
    }
  }, [userLoaded, fontsLoaded, segments])

  // ← 4. NULL RETURN'LER KALDIRILDI — splash zaten ekranı kapatıyor
  // if (!fontsLoaded && !fontError) return null;  // artık gerekmiyor
  // if (!dbReady) return null;                    // artık gerekmiyor

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
}
