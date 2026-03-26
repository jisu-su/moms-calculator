/**
 * app/(tabs)/calendar.tsx
 * 달력 탭 화면
 * - 월별 달력 표시 (요일 헤더 포함)
 * - 날짜 선택 시 해당일 근무한 알바생 목록 표시
 */

import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { useEmployees } from "../../hooks/useEmployees";
import { useWorkLogs } from "../../hooks/useWorkLogs";
import { getDaysInMonth, parseDate } from "../../utils/dateUtils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const { employees } = useEmployees();
  const { getLogsByDate, getLogsByPeriod } = useWorkLogs();

  // ---------------------------------------------------------
  // 근무 날짜별 알바생 수 계산
  // ---------------------------------------------------------
  const datesInMonth = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const [dotCounts, setDotCounts] = useState<Record<string, number>>({});
  const [selectedWorkers, setSelectedWorkers] = useState<
    { name: string; payDay: number; startTime?: string; endTime?: string }[]
  >([]);

  // 월별 근무자 수 집계
  useEffect(() => {
    let isMounted = true;

    const loadCounts = async () => {
      const base: Record<string, number> = {};
      datesInMonth.forEach((d) => {
        base[d] = 0;
      });

      if (employees.length === 0) {
        if (isMounted) setDotCounts(base);
        return;
      }

      const monthStart = datesInMonth[0];
      const monthEnd = datesInMonth[datesInMonth.length - 1];

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
  // 날짜 선택 시 근무자 목록 조회
  // ---------------------------------------------------------
  const handleSelectDate = async (date: string) => {
    setSelectedDate(date);
    const logs = await getLogsByDate(date);

    const workers = logs
      .map((log) => {
        const emp = employees.find((e) => e.id === log.employeeId);
        if (!emp) return null;
        return {
          name: emp.name,
          payDay: emp.payDay,
          startTime: log.startTime,
          endTime: log.endTime,
        };
      })
      .filter(Boolean) as { name: string; payDay: number; startTime?: string; endTime?: string }[];

    setSelectedWorkers(workers);
  };

  // ---------------------------------------------------------
  // 이전/다음 월 이동
  // ---------------------------------------------------------
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
    setSelectedWorkers([]);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
    setSelectedWorkers([]);
  };

  // ---------------------------------------------------------
  // 달력 시작 요일 계산 (빈 셀 추가)
  // ---------------------------------------------------------
  const firstDate = datesInMonth[0];
  const firstDayOfWeek = parseDate(firstDate).getDay(); // 0=일, 1=월, ...

  // 선택된 날짜 표시 포맷
  const selectedDateDisplay = selectedDate
    ? `${parseInt(selectedDate.split("-")[1], 10)}월 ${parseInt(selectedDate.split("-")[2], 10)}일 일한 사람`
    : "날짜를 선택하세요";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 월 네비게이션 */}
      <View style={styles.monthNav}>
        <Pressable style={styles.navButton} onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.monthTitle}>
          {currentYear}년 {currentMonth}월
        </Text>
        <Pressable style={styles.navButton} onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.weekHeader}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={styles.weekCell}>
            <Text
              style={[
                styles.weekText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 달력 그리드 */}
      <View style={styles.calendarGrid}>
        {/* 빈 셀 (월의 시작 요일까지) */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.dayCell} />
        ))}

        {/* 날짜 셀 */}
        {datesInMonth.map((date) => {
          const d = parseDate(date).getDate();
          const dayOfWeek = parseDate(date).getDay();
          const dots = dotCounts[date] ?? 0;
          const isSelected = selectedDate === date;
          const isToday =
            date ===
            `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

          return (
            <Pressable
              key={date}
              style={[styles.dayCell, isSelected && styles.selectedCell]}
              onPress={() => handleSelectDate(date)}
            >
              <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedText,
                    isToday && styles.todayText,
                    dayOfWeek === 0 && styles.sundayText,
                    dayOfWeek === 6 && styles.saturdayText,
                  ]}
                >
                  {d}
                </Text>
              </View>
              {/* 근무자 점 표시 */}
              <View style={styles.dotsContainer}>
                {Array.from({ length: Math.min(dots, 4) }).map((_, i) => (
                  <View key={i} style={styles.dot} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* 선택된 날짜의 근무자 목록 */}
      <View style={styles.workerSection}>
        <Text style={styles.workerTitle}>{selectedDateDisplay}</Text>

        {selectedDate && selectedWorkers.length > 0 ? (
          <FlatList
            data={selectedWorkers}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            contentContainerStyle={styles.workerList}
            renderItem={({ item }) => (
              <View style={styles.workerCard}>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>{item.name}</Text>
                  <Text style={styles.workerPayDay}>
                    월급날: {currentMonth}월 {item.payDay}일
                  </Text>
                </View>
                {item.startTime && item.endTime && (
                  <Text style={styles.workerTime}>
                    {item.startTime} - {item.endTime}
                  </Text>
                )}
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyWorker}>
            <Text style={styles.emptyText}>
              {selectedDate ? "근무자가 없습니다." : "날짜를 선택해주세요."}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
  },
  weekHeader: {
    flexDirection: "row",
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  weekCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  sundayText: {
    color: colors.error,
  },
  saturdayText: {
    color: colors.primary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    backgroundColor: colors.white,
    marginHorizontal: 12,
    borderRadius: 16,
    paddingVertical: 8,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  selectedCell: {
    backgroundColor: colors.inputFilled,
    borderRadius: 12,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  todayCircle: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 15,
    color: colors.text,
  },
  selectedText: {
    fontWeight: "700",
  },
  todayText: {
    color: colors.white,
    fontWeight: "700",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  workerSection: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  workerTitle: {
    fontSize: typography.sizes.body,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  workerList: {
    paddingBottom: 100,
  },
  workerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: typography.sizes.body,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  workerPayDay: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  workerTime: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  emptyWorker: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
  },
});
