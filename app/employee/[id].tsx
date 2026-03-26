/**
 * app/employee/[id].tsx
 * 알바생 상세 화면
 * - 워크플로우 기준: 이름, 계좌번호 앞 5자리 + 수정/삭제 버튼
 * - 월급날, 월급(오늘까지의) + 일한 시간
 * - 미니 달력(근무일 점, 월급날 동그라미)
 * - 삭제 확인 모달
 */

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { defaults } from "../../constants/defaults";
import { formatKRW } from "../../utils/payCalc";
import { useEmployees } from "../../hooks/useEmployees";
import { usePayCalc } from "../../hooks/usePayCalc";
import { useWorkLogs } from "../../hooks/useWorkLogs";
import { MiniCalendar } from "../../components/MiniCalendar";
import { Modal } from "../../components/ui/Modal";

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getEmployee, deleteEmployee, updateEmployee, loading } = useEmployees();
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

  // 수정 모드
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAccountHint, setEditAccountHint] = useState("");

  // 삭제 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

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
        setAccountHint(emp.accountHint || "");
        setPayDay(emp.payDay);
        setStartDate(emp.startDate);
        setHourlyWage(emp.hourlyWage);
        setEditName(emp.name);
        setEditAccountHint(emp.accountHint || "");
      } catch (e) {
        setError("알바생 정보를 불러오지 못했습니다.");
      } finally {
        setLoadingDetail(false);
      }
    };

    void load();
  }, [id, getEmployee]);

  // ---------------------------------------------------------
  // 수정 저장
  // ---------------------------------------------------------
  const handleSaveEdit = async () => {
    if (!id) return;

    try {
      await updateEmployee(id, {
        name: editName.trim(),
        accountHint: editAccountHint.trim(),
      });
      setName(editName.trim());
      setAccountHint(editAccountHint.trim());
      setIsEditing(false);
    } catch (e) {
      setError("수정에 실패했습니다.");
    }
  };

  // ---------------------------------------------------------
  // 삭제 처리
  // ---------------------------------------------------------
  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await deleteEmployee(id);
      setShowDeleteModal(false);
      setShowDeleteSuccess(true);

      // 1.5초 후 홈으로 이동
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (e) {
      setError("삭제에 실패했습니다.");
      setShowDeleteModal(false);
    }
  };

  // ---------------------------------------------------------
  // 근무 날짜 목록 (미니 달력용)
  // ---------------------------------------------------------
  const workDates = workLogs.map((log) => log.date);
  const today = new Date();

  // 월급날 표시
  const currentMonth = today.getMonth() + 1;
  const payDateDisplay = `${today.getFullYear()}년 ${currentMonth}월 ${payDay}일`;

  if (loadingDetail) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // 삭제 완료 화면
  if (showDeleteSuccess) {
    return (
      <View style={styles.successScreen}>
        <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
        <Text style={styles.successText}>삭제 완료!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더: 이름과 버튼들 */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerButtons}>
          {isEditing ? (
            <>
              <Pressable
                style={styles.headerBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.headerBtnText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.headerBtn, styles.primaryBtn]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.primaryBtnText}>저장</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={styles.headerBtn}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editBtnText}>수정</Text>
              </Pressable>
              <Pressable
                style={[styles.headerBtn, styles.deleteBtn]}
                onPress={() => setShowDeleteModal(true)}
              >
                <Text style={styles.deleteBtnText}>삭제</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* 이름 */}
      {isEditing ? (
        <TextInput
          style={styles.nameInput}
          value={editName}
          onChangeText={setEditName}
          placeholder="이름"
          placeholderTextColor={colors.textSecondary}
        />
      ) : (
        <Text style={styles.name}>{name}</Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {/* 계좌번호 앞 5자리 */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>계좌번호 앞 5자리</Text>
          {isEditing ? (
            <TextInput
              style={styles.inlineInput}
              value={editAccountHint}
              onChangeText={(text) =>
                setEditAccountHint(text.replace(/\D/g, "").slice(0, 5))
              }
              placeholder="12345"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={5}
            />
          ) : (
            <Text style={styles.value}>{accountHint || "-"}</Text>
          )}
        </View>
      </View>

      {/* 월급날 */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>월급날</Text>
        <Text style={styles.payDate}>{payDateDisplay}</Text>
      </View>

      {/* 월급 (오늘까지의) + 일한 시간 */}
      <View style={styles.payCard}>
        <Text style={styles.payLabel}>월급 (오늘까지의) + 일한 시간</Text>
        <View style={styles.payRow}>
          <Text style={styles.payAmount}>{formatKRW(totalPay)}</Text>
          <Text style={styles.payHours}>{totalHours}시간</Text>
        </View>
        <Text style={styles.periodText}>
          정산 기간: {periodStart} ~ {periodEnd}
        </Text>
      </View>

      {/* 미니 달력 */}
      <View style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>달력</Text>
        <Text style={styles.sectionHint}>
          한 달간 일한 날짜에 표시{"\n"}월급 날에 동그라미
        </Text>
        <MiniCalendar
          year={today.getFullYear()}
          month={today.getMonth() + 1}
          workDates={workDates}
          payDay={payDay}
        />
      </View>

      {/* 삭제 확인 모달 */}
      <Modal
        visible={showDeleteModal}
        title="삭제 확인"
        description={`정말 삭제하시겠습니까?\n${name}님의 모든 근무 기록이 함께 삭제됩니다.`}
        confirmText="예"
        cancelText="아니요"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.inputFilled,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  deleteBtn: {
    backgroundColor: colors.error,
  },
  headerBtnText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  editBtnText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "600",
  },
  primaryBtnText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: "600",
  },
  deleteBtnText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: "600",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  nameInput: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.body,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  inlineInput: {
    fontSize: typography.sizes.body,
    color: colors.text,
    fontWeight: "600",
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 2,
    minWidth: 80,
    textAlign: "right",
  },
  cardTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  payDate: {
    fontSize: typography.sizes.subheading,
    color: colors.text,
    fontWeight: "700",
  },
  payCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  payLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  payAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
  },
  payHours: {
    fontSize: typography.sizes.body,
    color: colors.white,
    opacity: 0.9,
  },
  periodText: {
    fontSize: 13,
    color: colors.white,
    opacity: 0.8,
    marginTop: 8,
  },
  calendarSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: typography.sizes.body,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  successScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  successText: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
    marginTop: 16,
  },
});
