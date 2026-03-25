/**
 * app/employee/new.tsx
 * 알바생 추가 화면
 * - 이름, 시작일, 첫 월급날, 계좌 앞 5자리 입력
 * - 시급은 기본값(11,000원) 고정
 */

import { useState } from "react";
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
import { formatKRW } from "../../utils/payCalc";
import { useEmployees } from "../../hooks/useEmployees";

export default function EmployeeNewScreen() {
  const { addEmployee, loading } = useEmployees();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [firstPayDate, setFirstPayDate] = useState("");
  const [accountHint, setAccountHint] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // 계좌번호 앞 5자리만 입력되도록 제한
  // ---------------------------------------------------------
  const handleAccountHintChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
    setAccountHint(digitsOnly.slice(0, 5));
  };

  // ---------------------------------------------------------
  // 저장 버튼 처리
  // ---------------------------------------------------------
  const handleSave = async () => {
    if (!name.trim() || !startDate.trim() || !firstPayDate.trim()) {
      setError("필수 항목(이름/시작일/첫 월급날)을 입력해주세요.");
      return;
    }

    setError(null);

    try {
      await addEmployee({
        name: name.trim(),
        startDate: startDate.trim(),     // "YYYY-MM-DD"
        hourlyWage: defaults.hourlyWage, // 기본 시급 고정
        firstPayDate: firstPayDate.trim(), // "YYYY-MM-DD"
        accountHint: accountHint.trim(), // 5자리 또는 빈 문자열
      });

      // 저장 성공 후 홈으로 이동
      router.back();
    } catch (e) {
      setError("알바생 저장에 실패했습니다.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>알바생 추가</Text>

      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 가나다"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>일 시작한 날</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textSecondary}
        value={startDate}
        onChangeText={setStartDate}
      />

      <Text style={styles.label}>시급</Text>
      <View style={styles.readOnlyBox}>
        <Text style={styles.readOnlyText}>{formatKRW(defaults.hourlyWage)}</Text>
      </View>

      <Text style={styles.label}>첫 월급날</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textSecondary}
        value={firstPayDate}
        onChangeText={setFirstPayDate}
      />

      <Text style={styles.label}>계좌번호 앞 5자리</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 12345"
        placeholderTextColor={colors.textSecondary}
        value={accountHint}
        onChangeText={handleAccountHintChange}
        keyboardType="number-pad"
        maxLength={5}
      />

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
  readOnlyBox: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputFilled,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  readOnlyText: {
    fontSize: typography.sizes.body,
    color: colors.text,
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
