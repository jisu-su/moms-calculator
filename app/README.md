# `app/` — 화면(Screen) 디렉토리

expo-router 기반의 파일 시스템 라우팅 폴더.  
이 폴더 안의 파일 경로가 곧 앱의 URL/화면 경로가 된다.

---

## 라우팅 구조

```
app/
├── index.tsx           → / (스플래시 화면)
├── (tabs)/             → 하단 탭 그룹
│   ├── _layout.tsx     → 탭 레이아웃 설정
│   ├── home.tsx        → /home (홈 - 알바생 목록)
│   └── calendar.tsx    → /calendar (달력 조회)
├── employee/
│   ├── new.tsx         → /employee/new (알바생 추가)
│   └── [id].tsx        → /employee/:id (알바생 상세)
└── worklog/
    └── new.tsx         → /worklog/new (근무 시간 입력)
```

## 규칙

- **화면 파일만** 이 폴더에 둔다. 재사용 컴포넌트는 `components/`에 넣는다.
- `(tabs)/` 폴더명의 괄호는 URL 경로에 포함되지 않는 그룹 표시다.
- `[id].tsx`처럼 대괄호로 감싼 파일명은 동적 라우트 파라미터를 의미한다.
- 각 화면은 데이터 패칭을 직접 하지 않고 `hooks/`의 커스텀 훅을 통해 데이터를 받는다.
