// 군인연금 지급 정지 규정 (군인연금법 제33조, 2026년 기준)
// 퇴직 후 공무원·공공기관 등 직역연금 대상 기관 재취업 시 적용

export const PENSION_SUSPENSION_RULES_2026 = {
  version: '2026-01',

  // 재취업 유형별 연금 지급 정지 여부
  SUSPENSION_BY_TYPE: {
    공무원: true,           // 국가·지방공무원 → 전부 또는 일부 정지
    공공기관: true,         // 공공기관·지방공사 등 → 전부 또는 일부 정지
    사립학교: true,         // 사립학교 교직원 → 전부 또는 일부 정지
    민간기업: false,        // 민간 → 정지 없음
    자영업: false,          // 자영업 → 정지 없음
    무직: false,            // 무직 → 정지 없음
  } as const,

  근거: [
    '군인연금법 제33조 퇴직연금 일시 정지',
    '군인연금법 시행령 제32조 정지금액 산정',
    '공무원연금법 제60조 연계 적용',
  ],
} as const

export type ReemploymentType = keyof typeof PENSION_SUSPENSION_RULES_2026.SUSPENSION_BY_TYPE

/**
 * 재취업 시 군인연금 월 정지액 계산 (군인연금법 제33조)
 *
 * 정지액 = MAX(0, (월연금 + 재직 보수월액 - 퇴직 전 기준소득월액) × 1/2)
 * 단, 정지액은 월연금을 초과할 수 없음
 *
 * @param monthlyPension    현재 월 연금 수령액 (원)
 * @param newMonthlySalary  재취업 후 보수월액 (원)
 * @param prevMonthlySalary 퇴직 직전 기준소득월액 (원)
 */
export function calcPensionSuspension(
  monthlyPension: number,
  newMonthlySalary: number,
  prevMonthlySalary: number
): number {
  const excess = monthlyPension + newMonthlySalary - prevMonthlySalary
  if (excess <= 0) return 0
  const suspension = Math.round(excess / 2)
  return Math.min(suspension, monthlyPension)
}
