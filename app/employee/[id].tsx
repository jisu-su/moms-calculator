/**
 * app/employee/[id].tsx
 * 알바생 상세 화면
 * - 알바생 기본 정보
 * - 정산 기간 및 월급
 * - 미니 달력(근무일 표시)
 * - 삭제 버튼
 */

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { defaults } from "../../constants/defaults";
import { formatKRW } from "../../utils/payCalc";
import { useEmployees } from "../../hooks/useEmployees";
import { usePayCalc } from "../../hooks/usePayCalc";
import { useWorkLogs } from "../../hooks/useWorkLogs";
import { MiniCalendar } from "../../components/MiniCalendar";

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getEmployee, deleteEmployee, loading } = useEmployees();
  const { workLogs } = useWorkLogs(id);
  const { periodStart, periodEnd, totalHours, totalPay } = usePayCalc({
    employeeId: id,
  });

  const [name, setName] = useState("");
  const [accountHint, setAccountHint] = useState("");
  const [payDay, setPayDay] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [hourlyWage, setHourlyWage] = useState(defaults.hourlyWage);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  // ---------------------------------------------------------
  // 알바생 정보 로드
  // ---------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoadingDetail(true);

      try {
        const emp = await getEmployee(id);
        if (!emp) {
          setError("알바생 정보를 찾을 수 없습니다.");
          return;
        }
        setName(emp.name);
        setAccountHint(emp.accountHint);
        setPayDay(emp.payDay);
        setStartDate(emp.startDate);
        setHourlyWage(emp.hourlyWage);
      } catch (e) {
        setError("알바생 정보를 불러오지 못했습니다.");
      } finally {
        setLoadingDetail(false);
      }
    };

    void load();
  }, [id, getEmployee]);

  // ---------------------------------------------------------
  // 삭제 처리
  // ---------------------------------------------------------
  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteEmployee(id);
      router.back();
    } catch (e) {
      setError("삭제에 실패했습니다.");
    }
  };

  // ---------------------------------------------------------
  // 근무 날짜 목록 (미니 달력용)
  // ---------------------------------------------------------
  const workDates = workLogs.map((log) => log.date);
  const today = new Date();

  if (loadingDetail) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.infoRow}>
        <Text style={styles.label}>계좌 앞 5자리</Text>
        <Text style={styles.value}>{accountHint || "-"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>시작일</Text>
        <Text style={styles.value}>{startDate}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>시급</Text>
        <Text style={styles.value}>{formatKRW(hourlyWage)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>월급날</Text>
        <Text style={styles.value}>매월 {payDay}일</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.boxTitle}>이번 정산 기간</Text>
        <Text style={styles.boxText}>
          {periodStart} ~ {periodEnd}
        </Text>
        <Text style={styles.boxText}>총 근무 시간: {totalHours}시간</Text>
        <Text style={styles.boxText}>월급: {formatKRW(totalPay)}</Text>
      </View>

      <MiniCalendar
        year={today.getFullYear()}
        month={today.getMonth() + 1}
        workDates={workDates}
        payDay={payDay}
      />

      <Pressable
        style={[styles.deleteButton, loading && styles.deleteDisabled]}
        onPress={handleDelete}
        disabled={loading}
      >
        <Text style={styles.deleteText}>알바생 삭제</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
  box: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  boxTitle: {
    fontSize: typography.sizes.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  boxText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.body,
    marginBottom: 12,
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: defaults.minTouchSize,
  },
  deleteDisabled: {
    opacity: 0.6,
  },
  deleteText: {
    color: colors.white,
    fontSize: typography.sizes.button,
    fontWeight: "700",
  },
});
