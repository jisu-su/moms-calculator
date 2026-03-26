/**
 * components/EmployeeCard.tsx
 * 홈 화면에서 알바생 1명을 카드 형태로 표시
 * - 워크플로우 기준: 이름 / 월급날짜 / 월급(오늘까지의)
 */

import { memo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { formatKRW } from "../utils/payCalc";
import { usePayCalc } from "../hooks/usePayCalc";

type EmployeeCardProps = {
  id: string;
  name: string;
  payDay: number;
  hourlyWage: number;
  onPress?: () => void;
};

function EmployeeCardBase(props: EmployeeCardProps) {
  const { id, name, payDay, hourlyWage, onPress } = props;

  // 오늘까지의 월급 계산
  const { totalPay, totalHours, loading } = usePayCalc({ employeeId: id });

  // 이번 달과 월급날로 "4월 1일" 형식 생성
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const payDateDisplay = `${currentMonth}월 ${payDay}일`;

  // D-day 계산
  const currentDay = today.getDate();
  let daysUntilPay = payDay - currentDay;
  if (daysUntilPay < 0) {
    // 다음 달 월급날까지
    const daysInMonth = new Date(today.getFullYear(), currentMonth, 0).getDate();
    daysUntilPay = daysInMonth - currentDay + payDay;
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* 상단: 이름과 월급날 */}
      <View style={styles.topRow}>
        <Text style={styles.name}>{name}</Text>
        {daysUntilPay <= 3 && daysUntilPay >= 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {daysUntilPay === 0 ? "오늘!" : `D-${daysUntilPay}`}
            </Text>
          </View>
        )}
      </View>

      {/* 월급날 */}
      <View style={styles.infoRow}>
        <View style={styles.iconLabel}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.label}>월급날</Text>
        </View>
        <Text style={styles.value}>{payDateDisplay}</Text>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 오늘까지의 월급 */}
      <View style={styles.payRow}>
        <Text style={styles.payLabel}>월급 (오늘까지의)</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.payAmount}>{formatKRW(totalPay)}</Text>
        )}
      </View>

      {/* 총 근무 시간 */}
      {!loading && (
        <Text style={styles.hoursText}>총 {totalHours}시간</Text>
      )}

      {/* 화살표 아이콘 */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

export const EmployeeCard = memo(EmployeeCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: typography.sizes.subheading,
    color: colors.text,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.sizes.body,
    color: colors.text,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBorder,
    marginVertical: 12,
  },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  payAmount: {
    fontSize: typography.sizes.amount,
    color: colors.primary,
    fontWeight: "700",
  },
  hoursText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },
  arrowContainer: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -10,
  },
});
