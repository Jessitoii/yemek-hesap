import React, { useEffect, useState } from "react";
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



  useEffect(() => {
    async function init() {
      try {
        await initDB()

        const { useUserStore } = await import("@/stores/userStore")
        const { useRecipesStore } = await import("@/stores/recipesStore")
        const { useDailyStore } = await import("@/stores/dailyStore")

        await useUserStore.getState().loadUser()
        setUserLoaded(true)  // ← BURAYA EKLE

        await useRecipesStore.getState().loadRecipes()
        await useRecipesStore.getState().loadIngredients()

        const today = new Date().toISOString().split('T')[0]
        await useDailyStore.getState().loadLog(today)

      } catch (e) {
        console.error("Initialization failed:", e)
        setUserLoaded(true)  // ← HATA OLSA DA DEVAM ET
      } finally {
        setDbReady(true)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!userLoaded || !fontsLoaded) return  // dbReady yerine userLoaded

    const { useUserStore } = require("@/stores/userStore")
    const onboardingCompleted = useUserStore.getState().onboardingCompleted
    const inOnboardingGroup = segments[0] === "(onboarding)"
    console.log('segments:', segments)
    console.log('onboardingCompleted:', useUserStore.getState().onboardingCompleted)
    if (!onboardingCompleted && !inOnboardingGroup) {
      router.replace("/(onboarding)")
    } else if (onboardingCompleted && inOnboardingGroup) {
      router.replace("/(tabs)/daily")
    }
  }, [userLoaded, fontsLoaded, segments])


  if (!fontsLoaded && !fontError) return null;
  if (!dbReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
}
