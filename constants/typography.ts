/**
 * constants/typography.ts
 * 앱 전역 타이포그래피 규칙
 * - PRD 5-2 폰트 크기 체계 기준
 * - 최소 글자 크기 18sp 이상 기준 반영
 */
export const typography = {
  // 앱 전역 폰트 패밀리
  family: "NotoSansKR",

  // 화면에서 자주 쓰이는 크기 토큰
  sizes: {
    body: 18,       // 본문 / 입력
    subheading: 20, // 중간 제목 (알바생 이름 등)
    amount: 24,     // 주요 숫자 / 금액
    button: 18,     // 대형 버튼 텍스트
    heading: 22,    // 대제목 (스플래시 등)
  },
} as const;
