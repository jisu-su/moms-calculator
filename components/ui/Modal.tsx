/**
 * components/ui/Modal.tsx
 * 앱 전역 공통 모달 컴포넌트
 * - 확인/취소 버튼 제공
 */

import { StyleSheet, Text, View, Pressable } from "react-native";
import RNModal from "react-native-modal";

import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { defaults } from "../../constants/defaults";

type ModalProps = {
  visible: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function Modal(props: ModalProps) {
  const {
    visible,
    title = "확인",
    description,
    confirmText = "확인",
    cancelText = "취소",
    onConfirm,
    onCancel,
  } = props;

  return (
    <RNModal isVisible={visible} onBackdropPress={onCancel}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.desc}>{description}</Text>}

        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>{cancelText}</Text>
          </Pressable>
          <Pressable style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmText}>{confirmText}</Text>
          </Pressable>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: typography.sizes.subheading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  desc: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.inputFilled,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: defaults.minTouchSize,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: defaults.minTouchSize,
  },
  cancelText: {
    fontSize: typography.sizes.button,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  confirmText: {
    fontSize: typography.sizes.button,
    color: colors.white,
    fontWeight: "700",
  },
});
