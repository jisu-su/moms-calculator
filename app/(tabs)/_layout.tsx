/**
 * app/(tabs)/_layout.tsx
 * 하단 탭 레이아웃
 * - 로그인 성공 후 진입하는 주요 화면 2개를 묶는다.
 */

import { Tabs } from "expo-router";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: "#EEE",
          paddingVertical: 6,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: typography.sizes.body,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "알바생",
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "달력",
        }}
      />
    </Tabs>
  );
}
