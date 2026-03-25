/**
 * app/(tabs)/_layout.tsx
 * 하단 탭 레이아웃
 * - 워크플로우 기준: [달력 조회] [+] [알바생 조회]
 */

import { Pressable, StyleSheet, View } from "react-native";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { defaults } from "../../constants/defaults";

export default function TabLayout() {
  const handleAddWorkLog = () => {
    router.push("/worklog/new");
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tabs.Screen
          name="calendar"
          options={{
            title: "달력 조회",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: "알바생 조회",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* 중앙 + 버튼 (근무 시간 입력) */}
      <Pressable style={styles.centerFab} onPress={handleAddWorkLog}>
        <Ionicons name="add" size={32} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.inputBorder,
    borderTopWidth: 1,
    paddingVertical: 8,
    height: 70,
    paddingBottom: 12,
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabBarItem: {
    paddingTop: 4,
  },
  centerFab: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 100,
  },
});
