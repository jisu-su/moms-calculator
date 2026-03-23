# 엄마의 월급 계산기 (Mom's Calculator)

가족(엄마, 아빠, 나)만 사용하는 실시간 월급 계산기 앱입니다.  
Expo + Firebase(Web SDK) 기반이며, APK로 배포합니다.

---

## 결정된 스펙

- 데이터 공유: Firebase **Firestore** (실시간 동기화)
- SDK: Firebase **Web SDK** (Expo Go 테스트 가능)
- 배포: **EAS Build로 APK 생성**
- 사용자 수: 2~3명 (가족 전용)
- 인증/보안: Firebase Auth + Firestore Rules 필수

---

## 디렉토리 구조 요약

```
app/           화면(라우팅)
components/    재사용 UI 컴포넌트
components/ui  공통 UI 컴포넌트
hooks/         데이터/계산 훅
utils/         순수 계산 로직
constants/     디자인 토큰/기본값
db/            (기존 로컬 DB 레이어, Firebase 전환 시 역할 축소)
```

---

## Firestore 스키마 (기반 확정)

### 컬렉션 구조

```
employees/        알바생 정보
workLogs/         근무 기록 (날짜별)
payHistory/       월급 지급 이력
```

### 1) employees

**문서 ID**: `employeeId` (Firestore 자동 ID 사용)

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `name` | string | "가나다" | 알바생 이름 |
| `startDate` | string | "2026-04-01" | 일 시작한 날 (정산 기준) |
| `firstPayDate` | string | "2026-04-05" | 첫 월급날 |
| `hourlyWage` | number | 11000 | 시급 (기본 11,000) |
| `accountPrefix` | string | "12345" | 계좌번호 앞 5자리 |
| `createdAt` | string | "2026-03-23T10:00:00Z" | 생성 시간(ISO) |
| `updatedAt` | string | "2026-03-23T10:30:00Z" | 수정 시간(ISO) |

### 2) workLogs

**문서 ID**: 자동 ID 사용  
**연결**: `employeeId` 필드로 employees와 연결

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `employeeId` | string | "abc123" | 알바생 문서 ID |
| `date` | string | "2026-04-02" | 근무 날짜 |
| `startTime` | string | "10:00" | 출근 시간 |
| `endTime` | string | "14:30" | 퇴근 시간 |
| `minutes` | number | 270 | 총 근무 시간(분 단위) |
| `createdAt` | string | "2026-04-02T14:31:00Z" | 생성 시간(ISO) |
| `updatedAt` | string | "2026-04-02T14:31:00Z" | 수정 시간(ISO) |

### 3) payHistory

**문서 ID**: 자동 ID 사용  
**연결**: `employeeId` 필드로 employees와 연결

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `employeeId` | string | "abc123" | 알바생 문서 ID |
| `periodStart` | string | "2026-04-02" | 정산 기간 시작 |
| `periodEnd` | string | "2026-05-01" | 정산 기간 종료 |
| `paidAt` | string | "2026-05-01" | 지급 날짜 |
| `amount` | number | 132000 | 지급 금액 |
| `createdAt` | string | "2026-05-01T09:00:00Z" | 생성 시간(ISO) |

---

## 스키마 규칙

- 날짜는 `YYYY-MM-DD`, 시간은 `HH:MM` 문자열로 저장한다.
- 계산에 필요한 시간은 **분(minutes)** 단위 정수로 저장한다.
- 모든 문서는 `createdAt`, `updatedAt` 필드를 갖는다.
- `employeeId`는 employees 문서의 ID를 참조한다.

