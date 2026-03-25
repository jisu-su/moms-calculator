/**
 * app/index.tsx
 * 로그인 화면 (Firebase 이메일/비밀번호)
 * - 엄마/아빠가 최초 1회 로그인할 때 사용하는 진입 화면
 * - 로그인 성공 시 /(tabs)/home 으로 이동
 */

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { auth } from "../lib/firebase";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { defaults } from "../constants/defaults";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------------------------------------
  // 로그인 상태 확인 + 자동 로그인 방지 (메모리 저장)
  // -----------------------------------------------------------
  useEffect(() => {
    // 로그인 상태가 이미 있으면 바로 홈으로 이동
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace("/(tabs)/home");
      }
      setChecking(false);
    });

    return unsubscribe;
  }, []);

  // -----------------------------------------------------------
  // 로그인 버튼 클릭 시 처리
  // -----------------------------------------------------------
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await auth.signInWithEmailAndPassword(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e) {
      setError("로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 로그인 상태 확인 중에는 로딩 화면만 표시
  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>엄마의 월급 계산기</Text>
        <Text style={styles.subtitle}>가족 전용 로그인</Text>

        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>로그인</Text>
          )}
        </Pressable>

        <Text style={styles.note}>
          * 이 화면은 휴대폰을 바꿀 때만 다시 보게 됩니다.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: defaults.minTouchSize,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.button,
    fontWeight: "700",
  },
  note: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
  },
});
