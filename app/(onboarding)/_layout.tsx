import React, { createContext, useContext, useState } from "react";
import { Stack } from "expo-router";
import { Gender, ActivityLevel, GoalType } from "@/types/user";

interface OnboardingData {
  name: string;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goalType: GoalType[];
}

interface OnboardingContextProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  currentSlide: number;
  nextSlide: () => void;
  prevSlide: () => void;
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

export default function OnboardingLayout() {
  const [data, setData] = useState<OnboardingData>({
    name: "",
    gender: Gender.MALE,
    age: 25,
    height: 175,
    weight: 70,
    activityLevel: ActivityLevel.SEDENTARY,
    goalType: [],
  });
  const [currentSlide, setCurrentSlide] = useState(1);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, 7));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 1));

  return (
    <OnboardingContext.Provider value={{ data, updateData, currentSlide, nextSlide, prevSlide }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right", // Slide effect
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="slide2" />
        <Stack.Screen name="slide3" />
        <Stack.Screen name="slide4" />
        <Stack.Screen name="slide5" />
        <Stack.Screen name="slide6" />
        <Stack.Screen name="slide7" />
      </Stack>
    </OnboardingContext.Provider>
  );
}
