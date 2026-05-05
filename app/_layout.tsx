import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from "react";
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
import { Platform } from 'react-native';
import { getDB, initDB } from "../db";
import { clearCalorieCache } from "@/db/queries/cache";
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const Notifications = isExpoGo ? null : require('expo-notifications');

if (!isExpoGo && Notifications && Platform.OS === 'android') {
  try {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Varsayılan',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4FC3F7',
    });
  } catch (error) {
    console.debug('[RootLayout] Notifications not supported in this environment');
  }
}
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

  useEffect(() => {
    async function init() {
      try {
        await initDB()
        console.log('[Init] DB ready')
        // initDB()'den hemen sonra ekle, test bitince kaldır
        const db = getDB()

        const { useUserStore } = await import("@/stores/userStore")
        const { useRecipesStore } = await import("@/stores/recipesStore")
        const { useDailyStore } = await import("@/stores/dailyStore")

        await useUserStore.getState().loadUser()
        setUserLoaded(true)
        console.log('[Init] User loaded:', useUserStore.getState().onboardingCompleted)

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

  useEffect(() => {
    if (isExpoGo || !Notifications) return;

    const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const { data } = response.notification.request.content;
      if (data?.recipeId) {
        router.push(`/(tabs)/recipes/${data.recipeId}`);
      } else if (data?.recipeName) {
        router.push(`/(tabs)/recipes`);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
