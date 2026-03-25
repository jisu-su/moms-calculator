/**
 * components/ui/Card.tsx
 * 앱 전역 공통 카드 컴포넌트
 * - 흰 배경 + 둥근 모서리 + 기본 그림자
 */

import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors } from "../../constants/colors";

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function Card(props: CardProps) {
  const { children, style } = props;

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
