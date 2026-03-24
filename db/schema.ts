// ============================================================
// db/schema.ts
// Firestore에 저장되는 데이터의 "모양(타입)"을 정의하는 파일
// TypeScript의 interface = 데이터가 어떤 필드를 가져야 하는지 약속하는 틀
// ============================================================

// -----------------------------------------------------------
// 알바생 (employees 컬렉션)
// Firestore 경로: /employees/{employeeId}
// -----------------------------------------------------------
export interface Employee {
  id: string;              // Firestore가 자동으로 만들어주는 문서 고유 ID
  name: string;            // 알바생 이름 (예: "홍길동")
  startDate: string;       // 일 시작한 날 — "YYYY-MM-DD" 형식 (예: "2025-03-02")
  hourlyWage: number;      // 시급 (원 단위, 기본값 11000)
  firstPayDate: string;    // 첫 월급 날 — 엄마가 직접 결정, "YYYY-MM-DD" 형식
  payDay: number;          // 매월 반복되는 월급날 숫자 (firstPayDate의 일(day)값, 예: 5 → 매월 5일)
  accountHint: string;     // 계좌번호 앞 5자리 (헷갈림 방지용, 없으면 빈 문자열 "")
  createdAt: string;       // 이 알바생을 앱에 등록한 날짜 — "YYYY-MM-DD" 형식
}

// -----------------------------------------------------------
// 근무 기록 (workLogs 컬렉션)
// Firestore 경로: /workLogs/{workLogId}
// -----------------------------------------------------------
export interface WorkLog {
  id: string;              // Firestore 자동 생성 고유 ID
  employeeId: string;      // 어떤 알바생의 기록인지 — Employee.id와 연결
  date: string;            // 근무한 날 — "YYYY-MM-DD" 형식 (예: "2025-03-15")
  startTime: string;       // 출근 시간 — "HH:MM" 형식 (예: "09:00")
  endTime: string;         // 퇴근 시간 — "HH:MM" 형식 (예: "18:00")
  hours: number;           // 근무 시간 (자동 계산: endTime - startTime, 예: 9.0)
}

// -----------------------------------------------------------
// 월급 지급 이력 (payHistory 컬렉션)
// Firestore 경로: /payHistory/{payHistoryId}
// 월급을 지급할 때마다 기록 — 나중에 분쟁 방지용
// -----------------------------------------------------------
export interface PayHistory {
  id: string;              // Firestore 자동 생성 고유 ID
  employeeId: string;      // 어떤 알바생에게 지급했는지 — Employee.id와 연결
  periodStart: string;     // 이번 정산 기간 시작일 — "YYYY-MM-DD" (예: "2025-03-02")
  periodEnd: string;       // 이번 정산 기간 종료일 — "YYYY-MM-DD" (예: "2025-04-01")
  totalHours: number;      // 이 기간 동안 총 근무 시간 (예: 72.5)
  totalPay: number;        // 지급 금액 (원 단위, 예: 797500)
  paidAt: string;          // 실제 지급한 날 — "YYYY-MM-DD" 형식
}

// -----------------------------------------------------------
// Firestore 컬렉션 이름 상수
// 오타 방지를 위해 문자열을 직접 쓰지 않고 여기서 한 번에 관리
// 사용 예: collection(db, COLLECTIONS.EMPLOYEES)
// -----------------------------------------------------------
export const COLLECTIONS = {
  EMPLOYEES: "employees",      // 알바생 목록
  WORK_LOGS: "workLogs",       // 근무 기록
  PAY_HISTORY: "payHistory",   // 월급 지급 이력
} as const;