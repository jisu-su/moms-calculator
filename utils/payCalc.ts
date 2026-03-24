/**
 * utils/payCalc.ts
 * 월급 계산과 시간 계산에 관련된 "순수 함수" 모음
 * 화면/훅/DB 어디에서든 같은 규칙을 쓰기 위해 여기서만 계산한다.
 */

/**
 * 월급 계산
 * totalPay = hourlyWage × totalHours
 * - 소수점이 생기면 올림 처리 (예: 11000 × 1.2 = 13200 → 13200)
 */
export function calcPay(hourlyWage: number, totalHours: number): number {
  // Math.ceil로 올림 처리하여 원 단위 금액을 만든다.
  return Math.ceil(hourlyWage * totalHours);
}

/**
 * 근무 시간 계산 (HH:MM ~ HH:MM → 시간 단위 소수)
 * - 자정을 넘기는 경우(예: 22:00 ~ 02:00)도 처리한다.
 */
export function calcHours(startTime: string, endTime: string): number {
  // "HH:MM" 형식 문자열을 ":"로 나눠 숫자로 변환
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  // 분 단위로 통일
  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;

  // 자정을 넘기는 경우: 종료 시간이 더 작다면 하루(24h)를 더해준다.
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  // 최종 결과는 "시간 단위" 소수로 반환
  return (endMinutes - startMinutes) / 60;
}

/**
 * 금액을 한국 원화 포맷으로 변환
 * 예: 132000 → "132,000원"
 */
export function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
