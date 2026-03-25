/**
 * components/CalendarDotView.tsx
 * 달력 화면에서 월별 날짜와 근무 점을 표시하는 컴포넌트
 */

import { StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { getDaysInMonth, parseDate } from "../utils/dateUtils";

type CalendarDotViewProps = {
  year: number;
  month: number; // 1~12
  dotCounts: Record<string, number>; // key: "YYYY-MM-DD", value: 근무자 수
  selectedDate?: string | null;
};

export function CalendarDotView(props: CalendarDotViewProps) {
  const { year, month, dotCounts, selectedDate } = props;
  const days = getDaysInMonth(year, month);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{year}년 {month}월</Text>
      <View style={styles.grid}>
        {days.map((date) => {
          const d = parseDate(date).getDate();
          const dots = dotCounts[date] ?? 0;
          const isSelected = selectedDate === date;

          return (
            <View key={date} style={[styles.cell, isSelected && styles.selectedCell]}>
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                {d}
              </Text>
              <View style={styles.dotsRow}>
                {Array.from({ length: Math.min(dots, 5) }).map((_, i) => (
                  <View key={i} style={styles.dot} />
                ))}
              </View>
            </View>
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
  title: {
    fontSize: typography.sizes.body,
    color: colors.text,
    marginBottom: 8,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "14.28%",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: colors.inputFilled,
  },
  dayText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedText: {
    color: colors.text,
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
