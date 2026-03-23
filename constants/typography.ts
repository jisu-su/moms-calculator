// 타이포그래피 — PRD 5-2 폰트 크기 체계 기준
export const typography = {
  family: 'NotoSansKR',
  sizes: {
    body: 18,       // 본문 / 입력
    subheading: 20, // 중간 제목 (알바생 이름 등)
    amount: 24,     // 주요 숫자 / 금액
    button: 18,     // 대형 버튼 텍스트
    heading: 22,    // 대제목 (스플래시 등)
  },
} as const;
