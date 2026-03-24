/**
 * components/EmployeeCard.tsx
 * 홈 화면에서 알바생 1명을 카드 형태로 표시
 * - 이름, 월급날, 오늘까지의 월급을 보여준다.
 */

import { memo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

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

  // ---------------------------------------------------------
  // 오늘까지의 월급 계산
  // - 알바생이 많아질 경우 비용이 커질 수 있으니
  //   이후 캐싱/집계 방식으로 개선 가능
  // ---------------------------------------------------------
  const { totalPay, loading } = usePayCalc({ employeeId: id });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.payDay}>월급날: 매월 {payDay}일</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>시급</Text>
        <Text style={styles.value}>{formatKRW(hourlyWage)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>오늘까지 월급</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.value}>{formatKRW(totalPay)}</Text>
        )}
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
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: typography.sizes.subheading,
    color: colors.text,
    fontWeight: "700",
  },
  payDay: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
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
});
