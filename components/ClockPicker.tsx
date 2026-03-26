/**
 * components/ClockPicker.tsx
 * 근무 시간 입력용 아날로그 시계 + 디지털 입력 UI
 * - 워크플로우의 시계 UI 구현
 * - 시간/분 선택 가능
 */

import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { defaults } from "../constants/defaults";

type ClockPickerProps = {
  label: string;
  value: string; // "HH:MM"
  onChange: (value: string) => void;
};

export function ClockPicker(props: ClockPickerProps) {
  const { label, value, onChange } = props;

  // 시간과 분 파싱
  const [hours, minutes] = value.split(":").map((v) => parseInt(v, 10) || 0);

  const [showClock, setShowClock] = useState(false);
  const [selectingHours, setSelectingHours] = useState(true);

  // 시계 핸들 위치 계산
  const clockSize = 180;
  const centerX = clockSize / 2;
  const centerY = clockSize / 2;
  const radius = 70;

  // 시간 핸들 (12시간 기준)
  const hourAngle = ((hours % 12) / 12) * 2 * Math.PI - Math.PI / 2;
  const hourHandLength = 40;
  const hourX = centerX + Math.cos(hourAngle) * hourHandLength;
  const hourY = centerY + Math.sin(hourAngle) * hourHandLength;

  // 분 핸들
  const minuteAngle = (minutes / 60) * 2 * Math.PI - Math.PI / 2;
  const minuteHandLength = 60;
  const minuteX = centerX + Math.cos(minuteAngle) * minuteHandLength;
  const minuteY = centerY + Math.sin(minuteAngle) * minuteHandLength;

  // 시간 숫자 배열 (1-12)
  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const handleClockPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    // 중심에서의 각도 계산
    const dx = locationX - centerX;
    const dy = locationY - centerY;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    if (selectingHours) {
      // 시간 선택 (0-23)
      let hour = Math.round((angle / (2 * Math.PI)) * 12);
      if (hour === 0) hour = 12;

      // 오전/오후 유지
      const newHour = hours >= 12 ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
      const formatted = `${String(newHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      onChange(formatted);
      setSelectingHours(false);
    } else {
      // 분 선택 (0-59)
      let minute = Math.round((angle / (2 * Math.PI)) * 60);
      if (minute === 60) minute = 0;
      const formatted = `${String(hours).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      onChange(formatted);
      setShowClock(false);
      setSelectingHours(true);
    }
  };

  const toggleAmPm = () => {
    const newHours = hours >= 12 ? hours - 12 : hours + 12;
    const formatted = `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    onChange(formatted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* 디지털 시간 표시 및 입력 */}
      <Pressable
        style={styles.timeDisplay}
        onPress={() => setShowClock(!showClock)}
      >
        <Text style={styles.timeText}>
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
        </Text>
      </Pressable>

      {/* 아날로그 시계 UI */}
      {showClock && (
        <View style={styles.clockContainer}>
          {/* AM/PM 토글 */}
          <View style={styles.ampmRow}>
            <Pressable
              style={[styles.ampmButton, hours < 12 && styles.ampmActive]}
              onPress={() => hours >= 12 && toggleAmPm()}
            >
              <Text style={[styles.ampmText, hours < 12 && styles.ampmTextActive]}>
                오전
              </Text>
            </Pressable>
            <Pressable
              style={[styles.ampmButton, hours >= 12 && styles.ampmActive]}
              onPress={() => hours < 12 && toggleAmPm()}
            >
              <Text style={[styles.ampmText, hours >= 12 && styles.ampmTextActive]}>
                오후
              </Text>
            </Pressable>
          </View>

          <Text style={styles.selectHint}>
            {selectingHours ? "시간을 선택하세요" : "분을 선택하세요"}
          </Text>

          <Pressable onPress={handleClockPress}>
            <Svg width={clockSize} height={clockSize}>
              {/* 시계 외곽 */}
              <Circle
                cx={centerX}
                cy={centerY}
                r={radius + 10}
                fill={colors.inputFilled}
                stroke={colors.inputBorder}
                strokeWidth={2}
              />

              {/* 시간 숫자 */}
              {hourNumbers.map((num, i) => {
                const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
                const x = centerX + Math.cos(a) * (radius - 5);
                const y = centerY + Math.sin(a) * (radius - 5);
                return (
                  <SvgText
                    key={num}
                    x={x}
                    y={y + 4}
                    fill={colors.textSecondary}
                    fontSize={12}
                    textAnchor="middle"
                  >
                    {num}
                  </SvgText>
                );
              })}

              {/* 중심점 */}
              <Circle cx={centerX} cy={centerY} r={4} fill={colors.primary} />

              {/* 시간 핸들 */}
              <Line
                x1={centerX}
                y1={centerY}
                x2={hourX}
                y2={hourY}
                stroke={colors.primary}
                strokeWidth={4}
                strokeLinecap="round"
              />

              {/* 분 핸들 */}
              <Line
                x1={centerX}
                y1={centerY}
                x2={minuteX}
                y2={minuteY}
                stroke={colors.accent}
                strokeWidth={2}
                strokeLinecap="round"
              />

              {/* 선택 포인터 */}
              {selectingHours ? (
                <Circle cx={hourX} cy={hourY} r={8} fill={colors.primary} />
              ) : (
                <Circle cx={minuteX} cy={minuteY} r={6} fill={colors.accent} />
              )}
            </Svg>
          </Pressable>

          {/* 직접 입력 필드 */}
          <View style={styles.directInputRow}>
            <TextInput
              style={styles.directInput}
              value={String(hours).padStart(2, "0")}
              onChangeText={(text) => {
                const h = Math.min(23, Math.max(0, parseInt(text, 10) || 0));
                onChange(`${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
              }}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.colonText}>:</Text>
            <TextInput
              style={styles.directInput}
              value={String(minutes).padStart(2, "0")}
              onChangeText={(text) => {
                const m = Math.min(59, Math.max(0, parseInt(text, 10) || 0));
                onChange(`${String(hours).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
              }}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </View>
      )}
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
  timeDisplay: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputFilled,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: defaults.minTouchSize,
    justifyContent: "center",
  },
  timeText: {
    fontSize: typography.sizes.amount,
    color: colors.text,
    fontWeight: "600",
    textAlign: "center",
  },
  clockContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ampmRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  ampmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.inputFilled,
  },
  ampmActive: {
    backgroundColor: colors.primary,
  },
  ampmText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  ampmTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  selectHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  directInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  directInput: {
    width: 50,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputFilled,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: typography.sizes.body,
    color: colors.text,
    textAlign: "center",
  },
  colonText: {
    fontSize: typography.sizes.amount,
    color: colors.text,
    fontWeight: "600",
  },
});
