/**
 * 월급 계산 유틸
 * totalPay = hourlyWage × totalHours (소수점 올림 후 원 단위)
 */
export function calcPay(hourlyWage: number, totalHours: number): number {
  return Math.ceil(hourlyWage * totalHours);
}

/**
 * 근무 시간 계산 (HH:MM ~ HH:MM → 시간 단위 소수)
 * 자정을 넘기는 경우(예: 22:00 ~ 02:00) 처리 포함
 */
export function calcHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;

  // 자정을 넘기는 경우
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
}

/**
 * 금액을 한국 원화 포맷으로 변환 (예: 132000 → "132,000원")
 */
export function formatKRW(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}
