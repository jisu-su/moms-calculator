/**
 * constants/defaults.ts
 * 앱 전역 기본값
 * - PRD 기준으로 자주 바뀌지 않는 값들을 모아둔다.
 */
export const defaults = {
  // 기본 시급 (원 단위)
  hourlyWage: 11_000,

  // 알림 발송 시간대 (시 단위, 24h)
  notificationHours: [9, 14, 18],

  // 스플래시 표시 시간 (ms)
  splashDuration: 1500,

  // 근무 입력 기본 날짜: 전날
  defaultWorkDateOffsetDays: -1,

  // 접근성 기준 최소 터치 영역 (dp)
  minTouchSize: 48,

  // 접근성 기준 최소 글자 크기 (sp)
  minFontSize: 18,
} as const;
