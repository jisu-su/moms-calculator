/**
 * components/EmployeeSearch.tsx
 * 근무 입력 화면에서 알바생을 선택하는 간단한 리스트/칩 UI
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";

type EmployeeChip = {
  id: string;
  name: string;
};

type EmployeeSearchProps = {
  employees: EmployeeChip[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
};

export function EmployeeSearch(props: EmployeeSearchProps) {
  const { employees, selectedId, onSelect } = props;

  return (
    <View style={styles.container}>
      {employees.map((emp) => {
        const isSelected = emp.id === selectedId;
        return (
          <Pressable
            key={emp.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(emp.id)}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {emp.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.inputFilled,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.body,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
});
