# `db/` — 데이터베이스 레이어 디렉토리

로컬 SQLite 데이터베이스와 직접 통신하는 유일한 계층.  
테이블 정의와 CRUD 함수를 담당한다. 다른 계층에서 DB를 직접 건드리지 않는다.

---

## 파일 목록

| 파일 | 역할 |
|---|---|
| `schema.ts` | 테이블 생성 SQL (`employees`, `work_logs`, `pay_history`) + DB 싱글톤 인스턴스 |
| `employees.ts` | 알바생 테이블 CRUD 함수 및 `Employee` 타입 정의 |
| `workLogs.ts` | 근무 기록 테이블 CRUD 함수 및 `WorkLog` 타입 정의 |
| `payHistory.ts` | 월급 지급 이력 테이블 CRUD 함수 및 `PayHistory` 타입 정의 |

## 데이터베이스 구조 요약

```
employees      (알바생 정보)
    ↓ 1:N
work_logs      (날짜별 근무 기록 — 알바생 삭제 시 CASCADE 삭제)
    
employees
    ↓ 1:N  
pay_history    (월급 지급 이력 — 알바생 삭제 시 CASCADE 삭제)
```

## 규칙

- 외부에서 `expo-sqlite`를 직접 import하지 않는다. 반드시 `schema.ts`의 `getDB()`를 통해 접근한다.
- 이 폴더의 함수들은 `async/await` 기반 비동기 함수로 작성한다.
- 계산 로직(시급×시간 등)은 `utils/`에서 처리하고, 이 폴더는 저장/조회만 담당한다.
- 모든 날짜는 `YYYY-MM-DD`, 시간은 `HH:MM` 문자열 포맷으로 저장한다.
