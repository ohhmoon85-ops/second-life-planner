// 2026년 건강보험료 기준
// 출처: 건강보험법 시행령, 보건복지부 고시

export const HEALTH_INSURANCE_RULES_2026 = {
  version: '2026-01',

  // ── 보험료율 ───────────────────────────────────────
  // 직장가입자 보험료율 (2024년 7.09%, 2025~26년 동결 가정)
  EMPLOYEE_RATE: 0.0709,

  // 장기요양보험료율 (건강보험료의 12.95%)
  LTCI_RATE: 0.1295,

  // ── 피부양자 자격 기준 (건강보험법 시행규칙 제2조) ──────
  DEPENDENT_INCOME_LIMIT: 20_000_000,      // 연간 합산소득 2,000만원 이하 (건강보험법 시행규칙 제2조)
  DEPENDENT_PROPERTY_LIMIT_1: 540_000_000, // 재산세 과세표준 5.4억 이하 (무조건 유지)
  DEPENDENT_PROPERTY_LIMIT_2: 900_000_000, // 5.4억~9억: 소득 1천만원 이하 조건
  DEPENDENT_PROPERTY_INCOME_LIMIT: 10_000_000, // 재산 5.4억 초과 시 소득 한도

  // 사업소득 있으면 피부양자 불가 (금액 불문)
  BUSINESS_INCOME_DISQUALIFIES: true,

  // ── 지역가입자 보험료 ──────────────────────────────
  // 소득분: 연소득 ÷ 12 × 7.09%
  // 재산분: (재산세 과표 - 기본공제) × 점수 × 점수당 금액
  REGION_PROPERTY_DEDUCTION: 50_000_000,   // 재산 기본공제 5천만원
  REGION_PROPERTY_SCORE_RATE: 0.00220,     // 재산점수 환산율 (재산과표 × 0.22%)
  REGION_SCORE_UNIT: 208.4,               // 점수당 금액 (원, 2024년 기준)
  REGION_MIN_PREMIUM: 19_780,             // 최저 월 보험료 (2024년)

  // ── 임의계속가입 ───────────────────────────────────
  VOLUNTARY_CONTINUE_MAX_MONTHS: 36,       // 최대 36개월
  VOLUNTARY_CONTINUE_MIN_INSURED_MONTHS: 18, // 자격 조건: 직장 가입 18개월 이상

  근거: [
    '건강보험법 시행규칙 제2조 피부양자 자격 기준 (2024년 9월 개정)',
    '건강보험법 시행령 제41조 지역가입자 보험료 산정',
    '건강보험법 제110조 임의계속가입자',
    '장기요양보험법 제9조 보험료',
  ],
} as const

// 재산 구간별 점수 환산표 (단순화 버전, 재산세 과표 기준)
// 실제는 구간별 점수표 존재 → 여기서는 선형 근사 사용
export function calcPropertyScore(propertyTaxBase: number): number {
  const deducted = Math.max(0, propertyTaxBase - HEALTH_INSURANCE_RULES_2026.REGION_PROPERTY_DEDUCTION)
  return Math.round(deducted * HEALTH_INSURANCE_RULES_2026.REGION_PROPERTY_SCORE_RATE)
}
