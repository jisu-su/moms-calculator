/**
 * app/worklog/new.tsx
 * 근무 시간 입력 화면
 * - 워크플로우 기준: 알바생 선택, 날짜 선택, 시계 UI로 시간 입력
 * - 저장 완료 화면 표시
 */

import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { defaults } from "../../constants/defaults";
import { getYesterday } from "../../utils/dateUtils";
import { useEmployees } from "../../hooks/useEmployees";
import { useWorkLogs } from "../../hooks/useWorkLogs";
import { EmployeeSearch } from "../../components/EmployeeSearch";
import { ClockPicker } from "../../components/ClockPicker";

export default function WorkLogNewScreen() {
  const { employees } = useEmployees();
  const { addWorkLog, loading } = useWorkLogs();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [error, setError] = useState<string | null>(null);

  // 저장 완료 상태
  const [showSuccess, setShowSuccess] = useState(false);

  // 기본 날짜는 전날로 세팅
  useEffect(() => {
    setDate(getYesterday());
  }, []);

  // 선택된 알바생 이름
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // ---------------------------------------------------------
  // 저장 버튼 처리
  // ---------------------------------------------------------
  const handleSave = async () => {
    if (!selectedEmployeeId) {
      setError("알바생을 선택해주세요.");
      return;
    }
    if (!date.trim() || !startTime.trim() || !endTime.trim()) {
      setError("날짜/출근/퇴근 시간을 모두 입력해주세요.");
      return;
    }

    setError(null);

    try {
      await addWorkLog({
        employeeId: selectedEmployeeId,
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      });

      // 저장 완료 화면 표시
      setShowSuccess(true);

      // 2초 후 홈으로 이동
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (e) {
      setError("근무 기록 저장에 실패했습니다.");
    }
  };

  // ---------------------------------------------------------
  // 저장 완료 화면
  // ---------------------------------------------------------
  if (showSuccess) {
    return (
      <View style={styles.successScreen}>
        <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
        <Text style={styles.successTitle}>입력이 완료되었습니다!</Text>
        <Text style={styles.successSubtitle}>고생하셨습니다.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>일한 시간 입력!</Text>
        </View>

        {/* 알바생 선택 */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>알바생 입력</Text>
            <Text style={styles.hint}>
              현재 알바생 목록 조회 되서{"\n"}엄마가 선택할 수 있도록
            </Text>
          </View>
          <EmployeeSearch
            employees={employees.map((e) => ({ id: e.id, name: e.name }))}
            selectedId={selectedEmployeeId}
            onSelect={setSelectedEmployeeId}
          />
        </View>

        {/* 입력할 날짜 */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>입력할 날짜</Text>
            <Text style={styles.hint}>
              날짜는 기본적으로 전날 설정{"\n"}마지막 출근자도 전날 22시이므로
            </Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={date}
            onChangeText={setDate}
          />
        </View>

        {/* 일한 시간 */}
        <View style={styles.section}>
          <Text style={styles.label}>일한 시간</Text>

          {/* 시계 UI */}
          <View style={styles.clockSection}>
            <ClockPicker
              label="출근 시간"
              value={startTime}
              onChange={setStartTime}
            />

            <View style={styles.timeRange}>
              <Text style={styles.timeDisplay}>{startTime}</Text>
              <Text style={styles.tilde}>~</Text>
              <Text style={styles.timeDisplay}>{endTime}</Text>
            </View>

            <ClockPicker
              label="퇴근 시간"
              value={endTime}
              onChange={setEndTime}
            />
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {/* 버튼 */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, loading && styles.saveDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveText}>저장</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
  },
  section: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  label: {
    fontSize: typography.sizes.body,
    color: colors.text,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    lineHeight: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.sizes.body,
    color: colors.text,
    minHeight: defaults.minTouchSize,
  },
  clockSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  timeRange: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.inputBorder,
    marginVertical: 12,
  },
  timeDisplay: {
    fontSize: typography.sizes.amount,
    fontWeight: "700",
    color: colors.text,
  },
  tilde: {
    fontSize: typography.sizes.amount,
    color: colors.textSecondary,
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.body,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: defaults.minTouchSize,
  },
  cancelText: {
    color: colors.error,
    fontSize: typography.sizes.button,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: defaults.minTouchSize,
  },
  saveDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  saveText: {
    color: colors.white,
    fontSize: typography.sizes.button,
    fontWeight: "700",
  },
  successScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  successTitle: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
    marginTop: 20,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
