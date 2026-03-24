/**
 * utils/dateUtils.ts
 * 날짜 처리 관련 "순수 함수" 모음
 * - 저장 형식(YYYY-MM-DD)을 통일하고
 * - 정산 기간 계산을 이 파일에서만 관리한다.
 */

// -----------------------------------------------------------
// 헬퍼: Date → "YYYY-MM-DD" 문자열로 변환
// -----------------------------------------------------------
export function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// -----------------------------------------------------------
// 헬퍼: "YYYY-MM-DD" 문자열 → Date 객체로 변환
// -----------------------------------------------------------
export function parseDate(dateString: string): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d); // 월은 0부터 시작
}

// -----------------------------------------------------------
// 헬퍼: 날짜 문자열에 일수 더하기/빼기
// 예: addDays("2026-04-01", -1) → "2026-03-31"
// -----------------------------------------------------------
export function addDays(dateString: string, days: number): string {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// -----------------------------------------------------------
// 헬퍼: 어제 날짜 문자열 반환
// 근무 입력 화면 기본값으로 사용
// -----------------------------------------------------------
export function getYesterday(): string {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  return formatDate(today);
}

// -----------------------------------------------------------
// 헬퍼: 특정 연/월의 마지막 날짜 계산
// month는 1~12로 받는다.
// -----------------------------------------------------------
export function getLastDayOfMonth(year: number, month: number): number {
  // 다음 달 0일 = 이번 달의 마지막 날
  return new Date(year, month, 0).getDate();
}

// -----------------------------------------------------------
// 정산 기간 계산 (startDate 기준)
// - startDate의 "일(day)"을 기준으로 매달 정산 주기가 돌아간다.
// - targetDate가 속한 정산 기간을 계산해 반환한다.
// -----------------------------------------------------------
export function getPayPeriodByStartDate(
  startDate: string,
  targetDate: string
): { periodStart: string; periodEnd: string } {
  const start = parseDate(startDate);
  const target = parseDate(targetDate);

  const startDay = start.getDate(); // 예: 2일 시작
  const targetYear = target.getFullYear();
  const targetMonth = target.getMonth() + 1; // 1~12
  const targetDay = target.getDate();

  // targetDate가 속한 달의 "시작일" 계산
  // 만약 해당 달에 startDay가 없다면 (예: 31일인데 4월은 30일)
  // 그 달의 마지막 날을 시작일로 잡는다.
  const lastDayThisMonth = getLastDayOfMonth(targetYear, targetMonth);
  const thisMonthStartDay = Math.min(startDay, lastDayThisMonth);

  let periodStart: Date;
  let periodEnd: Date;

  if (targetDay >= thisMonthStartDay) {
    // 이번 달의 시작일이 targetDate보다 앞에 있거나 같은 경우
    periodStart = new Date(targetYear, targetMonth - 1, thisMonthStartDay);

    // 다음 달의 시작일 - 1일이 정산 종료일
    const nextMonthYear = targetMonth === 12 ? targetYear + 1 : targetYear;
    const nextMonth = targetMonth === 12 ? 1 : targetMonth + 1;
    const lastDayNextMonth = getLastDayOfMonth(nextMonthYear, nextMonth);
    const nextMonthStartDay = Math.min(startDay, lastDayNextMonth);

    const nextMonthStart = new Date(nextMonthYear, nextMonth - 1, nextMonthStartDay);
    periodEnd = new Date(nextMonthStart);
    periodEnd.setDate(periodEnd.getDate() - 1);
  } else {
    // targetDate가 이번 달 시작일보다 이전이면, 이전 달 주기에 속한다.
    const prevMonthYear = targetMonth === 1 ? targetYear - 1 : targetYear;
    const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
    const lastDayPrevMonth = getLastDayOfMonth(prevMonthYear, prevMonth);
    const prevMonthStartDay = Math.min(startDay, lastDayPrevMonth);

    periodStart = new Date(prevMonthYear, prevMonth - 1, prevMonthStartDay);

    // 이번 달 시작일 - 1일이 정산 종료일
    const thisMonthStart = new Date(targetYear, targetMonth - 1, thisMonthStartDay);
    periodEnd = new Date(thisMonthStart);
    periodEnd.setDate(periodEnd.getDate() - 1);
  }

  return {
    periodStart: formatDate(periodStart),
    periodEnd: formatDate(periodEnd),
  };
}

// -----------------------------------------------------------
// 특정 연/월의 날짜 목록 생성
// 달력 화면에서 날짜 배열이 필요할 때 사용
// month는 1~12로 받는다.
// -----------------------------------------------------------
export function getDaysInMonth(year: number, month: number): string[] {
  const lastDay = getLastDayOfMonth(year, month);
  const days: string[] = [];

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month - 1, day);
    days.push(formatDate(date));
  }

  return days;
}
