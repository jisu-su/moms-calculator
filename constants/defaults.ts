// 앱 전역 기본값 상수
export const defaults = {
  /** 기본 시급 (원) */
  hourlyWage: 11_000,

  /** 알림 발송 시간대 (시 단위, 24h) */
  notificationHours: [9, 14, 18],

  /** 스플래시 표시 시간 (ms) */
  splashDuration: 1500,

  /** 근무 입력 기본 날짜: 전날 */
  defaultWorkDateOffsetDays: -1,
} as const;
