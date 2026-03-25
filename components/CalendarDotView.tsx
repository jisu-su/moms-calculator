/**
 * components/CalendarDotView.tsx
 * 달력 화면에서 월별 날짜와 근무 점을 표시하는 컴포넌트
 * - 워크플로우 기준: 요일 헤더, 날짜별 점 표시
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { getDaysInMonth, parseDate } from "../utils/dateUtils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type CalendarDotViewProps = {
  year: number;
  month: number; // 1~12
  dotCounts: Record<string, number>; // key: "YYYY-MM-DD", value: 근무자 수
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
};

export function CalendarDotView(props: CalendarDotViewProps) {
  const { year, month, dotCounts, selectedDate, onSelectDate } = props;
  const days = getDaysInMonth(year, month);

  // 첫 날의 요일 계산 (빈 셀 추가용)
  const firstDayOfWeek = parseDate(days[0]).getDay();

  // 오늘 날짜
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <View style={styles.container}>
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
      <View style={styles.grid}>
        {/* 빈 셀 */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.cell} />
        ))}

        {/* 날짜 셀 */}
        {days.map((date) => {
          const d = parseDate(date).getDate();
          const dayOfWeek = parseDate(date).getDay();
          const dots = dotCounts[date] ?? 0;
          const isSelected = selectedDate === date;
          const isToday = date === todayStr;

          return (
            <Pressable
              key={date}
              style={[styles.cell, isSelected && styles.selectedCell]}
              onPress={() => onSelectDate?.(date)}
            >
              <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedText,
                    isToday && styles.todayText,
                    dayOfWeek === 0 && !isToday && styles.sundayText,
                    dayOfWeek === 6 && !isToday && styles.saturdayText,
                  ]}
                >
                  {d}
                </Text>
              </View>
              <View style={styles.dotsRow}>
                {Array.from({ length: Math.min(dots, 4) }).map((_, i) => (
                  <View key={i} style={styles.dot} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  weekText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  sundayText: {
    color: colors.error,
  },
  saturdayText: {
    color: colors.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 4,
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: colors.inputFilled,
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
    fontSize: 14,
    color: colors.text,
  },
  selectedText: {
    fontWeight: "700",
  },
  todayText: {
    color: colors.white,
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
    flexWrap: "wrap",
    justifyContent: "center",
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
