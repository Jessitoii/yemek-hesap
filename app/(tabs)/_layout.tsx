import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CookingPot,
  CalendarBlank,
  Compass,
  Lightning,
  User,
  CookingPotIcon
} from "phosphor-react-native";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";

interface TabIconProps {
  Icon: any;
  color: string;
  focused: boolean;
}

const TabIcon = ({ Icon, color, focused }: TabIconProps) => (
  <View style={styles.iconContainer}>
    <Icon color={color} size={24} weight={focused ? "fill" : "regular"} />
    {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
  </View>
);

export default function Layout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarInactiveTintColor: colors.textDisabled,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
            borderTopWidth: 1,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontFamily: typography.fontSemiBold,
            fontSize: 11,
            marginBottom: 4,
          },
        }}
      >
        <Tabs.Screen
          name="recipes"
          options={{
            title: "Tarifler",
            tabBarLabel: "Tarifler",
            tabBarActiveTintColor: colors.primary,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={CookingPot} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="daily"
          options={{
            title: "Günlük",
            tabBarLabel: "Günlük",
            tabBarActiveTintColor: colors.secondary,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={CookingPot} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: "Keşfet",
            tabBarLabel: "Keşfet",
            tabBarActiveTintColor: colors.accent,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Compass} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: "Aktivite",
            tabBarLabel: "Aktivite",
            tabBarActiveTintColor: colors.pink,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Lightning} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarLabel: "Profil",
            tabBarActiveTintColor: colors.bordo,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
