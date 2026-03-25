/**
 * components/ui/Input.tsx
 * 앱 전역 공통 입력 컴포넌트
 * - 라벨, 에러 메시지 표시
 */

import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { defaults } from "../../constants/defaults";

type InputProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  errorText?: string | null;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "number-pad" | "numeric";
};

export function Input(props: InputProps) {
  const {
    label,
    value,
    onChangeText,
    placeholder,
    errorText,
    secureTextEntry,
    keyboardType = "default",
  } = props;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          errorText ? styles.inputError : undefined,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {errorText && <Text style={styles.error}>{errorText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
    minHeight: defaults.minTouchSize,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: 6,
    fontSize: typography.sizes.body,
    color: colors.error,
  },
});
