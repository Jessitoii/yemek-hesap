import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs, usePathname } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CookingPot,
  CalendarBlank,
  Compass,
  Lightning,
  User,
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

const getActiveBackground = (pathname: string) => {
  if (pathname.includes('/recipes')) return colors.bgRecipes;
  if (pathname.includes('/discover')) return colors.bgDiscover;
  if (pathname.includes('/activity')) return colors.bgActivity;
  if (pathname.includes('/profile')) return colors.bgProfile;
  return colors.bgDaily;
};

const getTabBarStyle = (backgroundColor: string, borderTopColor: string, bottomInset: number) => ({
  backgroundColor,
  borderTopColor,
  height: 60 + bottomInset,
  paddingBottom: bottomInset,
  paddingTop: 8,
  borderTopWidth: 1,
  elevation: 0,
  shadowOpacity: 0,
});

export default function Layout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: getActiveBackground(pathname) }]} edges={['top']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarInactiveTintColor: colors.textDisabled,
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
            tabBarStyle: getTabBarStyle(colors.bgRecipes, colors.primaryLight, insets.bottom),
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
            tabBarStyle: getTabBarStyle(colors.bgDaily, colors.secondaryLight, insets.bottom),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={CalendarBlank} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: "Keşfet",
            tabBarLabel: "Keşfet",
            tabBarActiveTintColor: colors.accent,
            tabBarStyle: getTabBarStyle(colors.bgDiscover, colors.accentLight, insets.bottom),
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
            tabBarStyle: getTabBarStyle(colors.bgActivity, colors.pinkLight, insets.bottom),
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
            tabBarStyle: getTabBarStyle(colors.bgProfile, colors.bordoLight, insets.bottom),
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
  safeArea: {
    flex: 1,
  },
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
