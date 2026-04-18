export const PENSION_RULES_2026 = {
  version: '2026-01',

  // 복무연수별 지급률 (2015년 개혁 이후, 재직 1년당 1.7%)
  RATE_PER_YEAR: 0.017,

  // 최대 지급률 (76%)
  MAX_PAYMENT_RATE: 0.76,

  // 최소 복무연수 (20년)
  MIN_SERVICE_YEARS: 20,

  // 전투·대간첩작전 참가 가산율 (연 0.5%)
  COMBAT_BONUS_RATE_PER_YEAR: 0.005,

  // 전투 가산 최대치 (5%)
  COMBAT_BONUS_MAX: 0.05,

  // 조기 전역 감액률 (5%)
  EARLY_RETIREMENT_PENALTY: 0.05,

  // 물가상승률 가정 (최근 5년 CPI 평균)
  ASSUMED_INFLATION_RATE: 0.025,

  // 인플레이션 프로젝션 기간 (년)
  PROJECTION_YEARS: 10,

  근거: [
    '공무원연금법 시행령 제38조 (2015.1.1. 개정) 지급률 1.7% 적용',
    '군인연금법 제23조 퇴직연금 지급률 규정',
    '군인연금법 제24조 전투 등 특수근무 가산',
    '물가연동: 통계청 소비자물가지수 기준 연 2.5% 가정',
  ],
} as const

// 물가지수 연도별 실적치 (참고용, 실제 연동 시 API 연계 필요)
export const HISTORICAL_INFLATION: Record<number, number> = {
  2020: 0.005,
  2021: 0.025,
  2022: 0.051,
  2023: 0.038,
  2024: 0.023,
  2025: 0.021,
}
