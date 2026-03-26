/**
 * components/EmployeeSearch.tsx
 * 근무 입력 화면에서 알바생을 선택하는 UI
 * - 워크플로우 기준: 검색 아이콘 + 알바생 목록에서 선택
 */

import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { defaults } from "../constants/defaults";

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
  const [searchText, setSearchText] = useState("");
  const [showList, setShowList] = useState(false);

  // 선택된 알바생 이름
  const selectedEmployee = employees.find((e) => e.id === selectedId);

  // 필터링된 목록
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onSelect(id);
    setShowList(false);
    setSearchText("");
  };

  return (
    <View style={styles.container}>
      {/* 검색 입력 필드 */}
      <Pressable
        style={styles.searchBox}
        onPress={() => setShowList(true)}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        {selectedEmployee ? (
          <Text style={styles.selectedText}>{selectedEmployee.name}</Text>
        ) : (
          <Text style={styles.placeholder}>알바생 검색 또는 선택</Text>
        )}
        <Ionicons
          name={showList ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      {/* 드롭다운 리스트 */}
      {showList && (
        <View style={styles.dropdown}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="이름 검색..."
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          </View>

          <ScrollView style={styles.listContainer} nestedScrollEnabled>
            {filteredEmployees.length === 0 ? (
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            ) : (
              filteredEmployees.map((emp) => {
                const isSelected = emp.id === selectedId;
                return (
                  <Pressable
                    key={emp.id}
                    style={[styles.listItem, isSelected && styles.listItemSelected]}
                    onPress={() => handleSelect(emp.id)}
                  >
                    <Text
                      style={[
                        styles.listItemText,
                        isSelected && styles.listItemTextSelected,
                      ]}
                    >
                      {emp.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <Pressable
            style={styles.closeButton}
            onPress={() => setShowList(false)}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        </View>
      )}

      {/* 칩 형태로 빠른 선택 */}
      {!showList && (
        <View style={styles.chipContainer}>
          {employees.slice(0, 5).map((emp) => {
            const isSelected = emp.id === selectedId;
            return (
              <Pressable
                key={emp.id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => onSelect(emp.id)}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextSelected]}
                >
                  {emp.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    minHeight: defaults.minTouchSize,
  },
  placeholder: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  selectedText: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: colors.text,
    fontWeight: "600",
  },
  dropdown: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 100,
    maxHeight: 280,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: colors.text,
    paddingVertical: 0,
  },
  listContainer: {
    maxHeight: 180,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputFilled,
  },
  listItemSelected: {
    backgroundColor: colors.inputFilled,
  },
  listItemText: {
    fontSize: typography.sizes.body,
    color: colors.text,
  },
  listItemTextSelected: {
    fontWeight: "600",
    color: colors.primary,
  },
  emptyText: {
    padding: 16,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
  },
  closeButtonText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
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
    fontSize: 15,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
});
