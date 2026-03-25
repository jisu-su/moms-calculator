/**
 * components/MiniCalendar.tsx
 * 알바생 상세 화면에서 쓰는 미니 달력
 * - 근무한 날은 점으로 표시
 * - 월급날은 동그라미 표시
 */

import { StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { getDaysInMonth, parseDate } from "../utils/dateUtils";

type MiniCalendarProps = {
  year: number;
  month: number; // 1~12
  workDates: string[]; // "YYYY-MM-DD"
  payDay: number; // 월급날 (예: 5)
};

export function MiniCalendar(props: MiniCalendarProps) {
  const { year, month, workDates, payDay } = props;

  const days = getDaysInMonth(year, month);
  const workDateSet = new Set(workDates);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{year}년 {month}월</Text>
      <View style={styles.grid}>
        {days.map((date) => {
          const d = parseDate(date).getDate();
          const isWork = workDateSet.has(date);
          const isPayDay = d === payDay;

          return (
            <View key={date} style={styles.cell}>
              <Text style={styles.dayText}>{d}</Text>
              {isWork && <View style={styles.dot} />}
              {isPayDay && <View style={styles.payRing} />}
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
    position: "relative",
  },
  dayText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dot: {
    marginTop: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  payRing: {
    position: "absolute",
    top: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
