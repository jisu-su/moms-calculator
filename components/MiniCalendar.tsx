/**
 * components/MiniCalendar.tsx
 * 알바생 상세 화면에서 쓰는 미니 달력
 * - 워크플로우 기준: 근무한 날은 점으로 표시, 월급날은 동그라미 표시
 * - 요일 헤더 포함
 */

import { StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { getDaysInMonth, parseDate } from "../utils/dateUtils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

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

  // 첫 날의 요일 계산 (빈 셀 추가용)
  const firstDayOfWeek = parseDate(days[0]).getDay();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{year}년 {month}월</Text>

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
          const isWork = workDateSet.has(date);
          const isPayDay = d === payDay;

          return (
            <View key={date} style={styles.cell}>
              <View style={[styles.dayCircle, isPayDay && styles.payDayCircle]}>
                <Text
                  style={[
                    styles.dayText,
                    dayOfWeek === 0 && styles.sundayText,
                    dayOfWeek === 6 && styles.saturdayText,
                    isPayDay && styles.payDayText,
                  ]}
                >
                  {d}
                </Text>
              </View>
              {isWork && <View style={styles.dot} />}
            </View>
          );
        })}
      </View>

      {/* 범례 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>근무일</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendRing} />
          <Text style={styles.legendText}>월급날</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
  },
  title: {
    fontSize: typography.sizes.body,
    color: colors.text,
    marginBottom: 12,
    fontWeight: "600",
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekCell: {
    width: "14.28%",
    alignItems: "center",
  },
  weekText: {
    fontSize: 12,
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
    marginBottom: 8,
    height: 36,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  payDayCircle: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    color: colors.text,
  },
  payDayText: {
    fontWeight: "700",
    color: colors.primary,
  },
  dot: {
    marginTop: 2,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  legendRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
