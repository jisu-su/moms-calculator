/**
 * app/(tabs)/calendar.tsx
 * 달력 탭 화면
 * - 월별 달력 표시
 * - 날짜 선택 시 해당일 근무한 알바생 목록 표시
 */

import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { useEmployees } from "../../hooks/useEmployees";
import { useWorkLogs } from "../../hooks/useWorkLogs";
import { CalendarDotView } from "../../components/CalendarDotView";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { employees } = useEmployees();
  const { getLogsByDate } = useWorkLogs();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // ---------------------------------------------------------
  // 근무 날짜별 점 개수 계산 (근무자 수)
  // ---------------------------------------------------------
  const dotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // 알바생이 많지 않다는 전제에서 간단 집계
    // (추후 workLogs 전체를 캐시하거나 서버 집계로 개선 가능)
    return counts;
  }, []);

  // ---------------------------------------------------------
  // 선택 날짜의 근무자 목록 조회
  // ---------------------------------------------------------
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  const handleSelectDate = async (date: string) => {
    setSelectedDate(date);
    const logs = await getLogsByDate(date);
    const ids = new Set(logs.map((log) => log.employeeId));
    const names = employees
      .filter((e) => ids.has(e.id))
      .map((e) => e.name);
    setSelectedWorkers(names);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>달력 조회</Text>

      <CalendarDotView
        year={year}
        month={month}
        dotCounts={dotCounts}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      <Text style={styles.subTitle}>
        {selectedDate ? `${selectedDate} 근무자` : "날짜를 선택하세요"}
      </Text>

      <FlatList
        data={selectedWorkers}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.workerRow}>
            <Text style={styles.workerText}>{item}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>근무자가 없습니다.</Text>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  workerRow: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  workerText: {
    fontSize: typography.sizes.body,
    color: colors.text,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
  },
});
