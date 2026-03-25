/**
 * components/ui/Button.tsx
 * 앱 전역 공통 버튼
 * - primary / secondary 스타일 지원
 * - loading, disabled 상태 지원
 */

import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { defaults } from "../../constants/defaults";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
};

export function Button(props: ButtonProps) {
  const {
    label,
    onPress,
    variant = "primary",
    loading = false,
    disabled = false,
  } = props;

  const isDisabled = disabled || loading;
  const isPrimary = variant === "primary";

  return (
    <Pressable
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.text, !isPrimary && styles.secondaryText]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: defaults.minTouchSize,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.inputFilled,
  },
  disabled: {
    backgroundColor: colors.primaryDisabled,
  },
  text: {
    fontSize: typography.sizes.button,
    fontWeight: "700",
    color: colors.white,
  },
  secondaryText: {
    color: colors.textSecondary,
  },
});
