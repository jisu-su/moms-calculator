/**
 * app/(tabs)/calendar.tsx
 * 달력 탭 화면
 * - 월별 달력 표시
 * - 날짜 선택 시 해당일 근무한 알바생 목록 표시
 */

import { useEffect, useMemo, useState } from "react";
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
import { getDaysInMonth } from "../../utils/dateUtils";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { employees } = useEmployees();
  const { getLogsByDate, getLogsByPeriod } = useWorkLogs();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // ---------------------------------------------------------
  // 근무 날짜별 점 개수 계산 (근무자 수)
  // ---------------------------------------------------------
  const datesInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const [dotCounts, setDotCounts] = useState<Record<string, number>>({});

  // ---------------------------------------------------------
  // 월별 근무자 수 집계 (가족 2~3명 기준의 간단 집계)
  // ---------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const loadCounts = async () => {
      // 기본값 0으로 초기화
      const base: Record<string, number> = {};
      datesInMonth.forEach((d) => {
        base[d] = 0;
      });

      // 알바생이 없으면 바로 종료
      if (employees.length === 0) {
        if (isMounted) setDotCounts(base);
        return;
      }

      // 이번 달 기간 계산 (YYYY-MM-01 ~ 마지막 날)
      const monthStart = datesInMonth[0];
      const monthEnd = datesInMonth[datesInMonth.length - 1];

      // 알바생별 근무 기록을 가져와 날짜별로 집계
      // - 가족 규모에서만 쓰는 단순한 방식
      const allLogs = await Promise.all(
        employees.map((e) => getLogsByPeriod(e.id, monthStart, monthEnd))
      );

      allLogs.flat().forEach((log) => {
        base[log.date] = (base[log.date] ?? 0) + 1;
      });

      if (isMounted) setDotCounts(base);
    };

    void loadCounts();

    return () => {
      isMounted = false;
    };
  }, [employees, datesInMonth, getLogsByPeriod]);

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

      {/* 날짜 선택을 위한 간단한 버튼 (현재 월 전체) */}
      <View style={styles.quickGrid}>
        {datesInMonth.map((date) => {
          const day = Number(date.split("-")[2]);
          return (
            <Pressable
              key={date}
              style={[styles.dayButton, selectedDate === date && styles.dayButtonSelected]}
              onPress={() => handleSelectDate(date)}
            >
              <Text style={styles.dayButtonText}>{day}</Text>
            </Pressable>
          );
        })}
      </View>
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
