/**
 * app/(tabs)/home.tsx
 * 홈 화면 — 알바생 목록
 * - 알바생 카드 목록 표시
 * - 알바생 추가 / 근무 입력으로 이동 버튼 제공
 */

import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { defaults } from "../../constants/defaults";
import { useEmployees } from "../../hooks/useEmployees";
import { EmployeeCard } from "../../components/EmployeeCard";

export default function HomeScreen() {
  const { employees, loading, error, refetch } = useEmployees();

  // ---------------------------------------------------------
  // 카드 클릭 시 상세 화면으로 이동
  // ---------------------------------------------------------
  const handlePressEmployee = useCallback((id: string) => {
    router.push(`/employee/${id}`);
  }, []);

  // ---------------------------------------------------------
  // 알바생 추가 화면으로 이동
  // ---------------------------------------------------------
  const handleAddEmployee = useCallback(() => {
    router.push("/employee/new");
  }, []);

  // ---------------------------------------------------------
  // 근무 입력 화면으로 이동
  // ---------------------------------------------------------
  const handleAddWorkLog = useCallback(() => {
    router.push("/worklog/new");
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>알바생 목록</Text>
        <Pressable style={styles.headerButton} onPress={refetch}>
          <Text style={styles.headerButtonText}>새로고침</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EmployeeCard
              id={item.id}
              name={item.name}
              payDay={item.payDay}
              hourlyWage={item.hourlyWage}
              onPress={() => handlePressEmployee(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                아직 등록된 알바생이 없습니다.
              </Text>
              <Text style={styles.emptySubText}>
                아래 버튼을 눌러 알바생을 추가해 주세요.
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.fabContainer}>
        <Pressable style={styles.fabSecondary} onPress={handleAddWorkLog}>
          <Text style={styles.fabText}>근무 입력</Text>
        </Pressable>
        <Pressable style={styles.fabPrimary} onPress={handleAddEmployee}>
          <Text style={styles.fabText}>알바생 추가</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.inputFilled,
  },
  headerButtonText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.body,
  },
  empty: {
    alignItems: "center",
    marginTop: 32,
  },
  emptyText: {
    fontSize: typography.sizes.body,
    color: colors.text,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 20,
    flexDirection: "column",
    gap: 10,
  },
  fabPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    minHeight: defaults.minTouchSize,
    alignItems: "center",
  },
  fabSecondary: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    minHeight: defaults.minTouchSize,
    alignItems: "center",
  },
  fabText: {
    color: colors.white,
    fontSize: typography.sizes.button,
    fontWeight: "700",
  },
});
