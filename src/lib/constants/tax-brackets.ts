// 2026년 귀속 소득세 과세표준 구간 (원 단위 정수)
export const INCOME_TAX_BRACKETS_2026 = [
  { upTo: 14_000_000, rate: 0.06, deduction: 0 },
  { upTo: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { upTo: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { upTo: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { upTo: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { upTo: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { upTo: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { upTo: Infinity, rate: 0.45, deduction: 65_940_000 },
] as const

// 연금소득공제 구간 (소득세법 제47조의2)
// 연금소득금액 = 총연금액 - 연금소득공제
export const PENSION_INCOME_DEDUCTION_2026 = [
  { upTo: 3_500_000, rate: 1.00, fixed: 0 },          // 350만 이하: 전액 공제
  { upTo: 7_000_000, rate: 0.40, fixed: 3_500_000 },  // 350~700만: 350 + 초과분 40%
  { upTo: 14_000_000, rate: 0.20, fixed: 4_900_000 }, // 700~1400만: 490 + 초과분 20%
  { upTo: 35_000_000, rate: 0.10, fixed: 6_300_000 }, // 1400~3500만: 630 + 초과분 10%
  { upTo: Infinity, rate: 0.00, fixed: 8_400_000 },   // 3500만 초과: 840만 정액
] as const

// 지방소득세율
export const LOCAL_INCOME_TAX_RATE = 0.10
