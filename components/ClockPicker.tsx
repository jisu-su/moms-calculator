/**
 * components/ClockPicker.tsx
 * 근무 시간 입력용 간단한 시간 입력 UI
 * - HH:MM 형식의 텍스트 입력을 사용 (추후 아날로그 UI로 확장 가능)
 */

import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { defaults } from "../constants/defaults";

type ClockPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function ClockPicker(props: ClockPickerProps) {
  const { label, value, onChange } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder="HH:MM"
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChange}
        keyboardType="numbers-and-punctuation"
      />
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
});
