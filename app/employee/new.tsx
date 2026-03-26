/**
 * app/employee/new.tsx
 * 알바생 추가 화면
 * - 워크플로우 기준: 이름, 시작일, 시급(고정), 첫 월급날, 계좌 앞 5자리
 * - 저장 완료 화면 표시
 */

import { useState } from "react";
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
import { formatKRW } from "../../utils/payCalc";
import { useEmployees } from "../../hooks/useEmployees";

export default function EmployeeNewScreen() {
  const { addEmployee, loading } = useEmployees();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [firstPayDate, setFirstPayDate] = useState("");
  const [accountHint, setAccountHint] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 저장 완료 상태
  const [showSuccess, setShowSuccess] = useState(false);

  // 계좌번호 앞 5자리만 입력되도록 제한
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
        startDate: startDate.trim(),
        hourlyWage: defaults.hourlyWage,
        firstPayDate: firstPayDate.trim(),
        accountHint: accountHint.trim(),
      });

      // 저장 완료 화면 표시
      setShowSuccess(true);

      // 2초 후 홈으로 이동
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (e) {
      setError("알바생 저장에 실패했습니다.");
    }
  };

  // ---------------------------------------------------------
  // 저장 완료 화면
  // ---------------------------------------------------------
  if (showSuccess) {
    return (
      <View style={styles.successScreen}>
        <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
        <Text style={styles.successTitle}>새로운 알바생 저장.</Text>
        <Text style={styles.successSubtitle}>{name}님이 추가되었습니다.</Text>
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
          <Text style={styles.title}>알바생 추가</Text>
        </View>

        {/* 이름 입력 */}
        <View style={styles.section}>
          <Text style={styles.label}>이름 입력</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 가나다"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* 일 시작한 날 */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>일 시작한 날</Text>
            <Pressable style={styles.inputButton}>
              <Text style={styles.inputButtonText}>입력</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={startDate}
            onChangeText={setStartDate}
          />
        </View>

        {/* 시급 (고정) */}
        <View style={styles.section}>
          <Text style={styles.label}>시급 : {formatKRW(defaults.hourlyWage)}</Text>
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>
              {formatKRW(defaults.hourlyWage)}
            </Text>
            <Text style={styles.readOnlyHint}>자동 적용됨</Text>
          </View>
        </View>

        {/* 첫 월급 날 */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>첫 월급 날</Text>
            <Pressable style={styles.inputButton}>
              <Text style={styles.inputButtonText}>입력</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={firstPayDate}
            onChangeText={setFirstPayDate}
          />
        </View>

        {/* 계좌번호 앞 5자리 */}
        <View style={styles.section}>
          <Text style={styles.label}>계좌번호 앞 5자리</Text>
          <Text style={styles.optionalHint}>추후에 입력 가능</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 12345"
            placeholderTextColor={colors.textSecondary}
            value={accountHint}
            onChangeText={handleAccountHintChange}
            keyboardType="number-pad"
            maxLength={5}
          />
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
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: typography.sizes.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionalHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -4,
    marginBottom: 8,
  },
  inputButton: {
    backgroundColor: colors.inputFilled,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  inputButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
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
  readOnlyBox: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputFilled,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readOnlyText: {
    fontSize: typography.sizes.body,
    color: colors.text,
    fontWeight: "600",
  },
  readOnlyHint: {
    fontSize: 13,
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
