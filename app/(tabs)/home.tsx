/**
 * app/(tabs)/home.tsx
 * 홈 화면 — 알바생 목록
 * - 알바생 카드 목록 표시 (월급날 빠른 순 정렬)
 * - 우측 상단 알바생 추가 버튼
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
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { defaults } from "../../constants/defaults";
import { useEmployees } from "../../hooks/useEmployees";
import { EmployeeCard } from "../../components/EmployeeCard";

export default function HomeScreen() {
  const { employees, loading, error, refetch } = useEmployees();

  // 월급날 빠른 순 정렬
  const sortedEmployees = [...employees].sort((a, b) => a.payDay - b.payDay);

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>알바생 목록</Text>
          <Text style={styles.title}>총 {employees.length}명</Text>
        </View>
        <Pressable style={styles.addButton} onPress={handleAddEmployee}>
          <Ionicons name="person-add-outline" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>추가</Text>
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
          <Pressable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={sortedEmployees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
              <Ionicons
                name="people-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                아직 등록된 알바생이 없습니다.
              </Text>
              <Text style={styles.emptySubText}>
                우측 상단의 추가 버튼을 눌러{"\n"}알바생을 등록해 주세요.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    minHeight: defaults.minTouchSize,
  },
  addButtonText: {
    fontSize: typography.sizes.body,
    color: colors.white,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.body,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.inputFilled,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: typography.sizes.body,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
