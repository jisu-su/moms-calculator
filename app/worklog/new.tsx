/**
 * app/worklog/new.tsx
 * 근무 시간 입력 화면
 * - 알바생 선택
 * - 날짜 선택 (기본값: 전날)
 * - 출근/퇴근 시간 입력
 */

import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // 기본 날짜는 전날로 세팅
  // ---------------------------------------------------------
  useEffect(() => {
    setDate(getYesterday());
  }, []);

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
        date: date.trim(),       // "YYYY-MM-DD"
        startTime: startTime.trim(), // "HH:MM"
        endTime: endTime.trim(), // "HH:MM"
      });
      router.back();
    } catch (e) {
      setError("근무 기록 저장에 실패했습니다.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>근무 시간 입력</Text>

      <Text style={styles.label}>알바생 선택</Text>
      <EmployeeSearch
        employees={employees.map((e) => ({ id: e.id, name: e.name }))}
        selectedId={selectedEmployeeId}
        onSelect={setSelectedEmployeeId}
      />

      <Text style={styles.label}>날짜</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textSecondary}
        value={date}
        onChangeText={setDate}
      />

      <ClockPicker label="출근 시간" value={startTime} onChange={setStartTime} />
      <ClockPicker label="퇴근 시간" value={endTime} onChange={setEndTime} />

      {error && <Text style={styles.error}>{error}</Text>}

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: typography.sizes.body,
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputFilled,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.sizes.body,
    color: colors.text,
    marginBottom: 12,
    minHeight: defaults.minTouchSize,
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.body,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.inputFilled,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.button,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  saveText: {
    color: colors.white,
    fontSize: typography.sizes.button,
    fontWeight: "700",
  },
});
