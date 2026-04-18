// 군인연금 지급 정지 규정 (군인연금법 제33조, 2026년 기준)

export const PENSION_SUSPENSION_RULES_2026 = {
  version: '2026-01',

  // 재취업 유형별 정지 방식
  // 'full'   : 전액 정지 (공무원 재임용)
  // 'excess' : (연금+보수-퇴직전소득) ÷ 2 초과분 정지
  // 'none'   : 정지 없음
  SUSPENSION_MODE: {
    공무원:   'full',    // 국가·지방공무원 재임용 → 재직 중 전액 정지
    공공기관: 'excess',  // 공공기관·지방공사 → 160% 초과분의 50% 정지
    사립학교: 'excess',  // 사립학교 교직원 → 동일 방식
    민간기업: 'income',  // 민간 → 소득구간별 30~70% 부분 정지 (군인연금법 §33②)
    자영업:   'none',    // 자영업 → 정지 없음
    무직:     'none',    // 무직 → 정지 없음
  } as const,

  // 민간기업 재취업 소득구간별 정지율 (군인연금법 §33②, 보수월액 기준)
  // [초과기준(월), 정지율]  ← 퇴직전 기준소득월액 대비 초과율
  CIVILIAN_BRACKETS: [
    { threshold: 0.0,  rate: 0.0  }, // 퇴직전 소득 이하 → 정지 없음
    { threshold: 0.1,  rate: 0.3  }, // 10% 초과 → 초과분의 30%
    { threshold: 0.5,  rate: 0.5  }, // 50% 초과 → 초과분의 50%
    { threshold: 1.0,  rate: 0.7  }, // 100% 초과 → 초과분의 70%
  ],

  // 공공기관 기준: 연금 + 보수 합계가 퇴직전 기준소득의 160% 초과 시 정지
  PUBLIC_INSTITUTION_THRESHOLD: 1.6,

  근거: [
    '군인연금법 제33조 퇴직연금 지급 정지',
    '군인연금법 시행령 제32조 정지금액 산정',
    '군인연금법 제33조②항 민간기업 소득구간별 정지',
  ],
} as const

export type ReemploymentType = keyof typeof PENSION_SUSPENSION_RULES_2026.SUSPENSION_MODE

/**
 * 재취업 시 군인연금 월 정지액 계산
 */
export function calcPensionSuspension(
  type: ReemploymentType,
  monthlyPension: number,
  newMonthlySalary: number,
  prevMonthlySalary: number
): number {
  const SR = PENSION_SUSPENSION_RULES_2026
  const mode = SR.SUSPENSION_MODE[type]

  if (mode === 'none') return 0

  // 공무원 재임용: 전액 정지
  if (mode === 'full') return monthlyPension

  // 공공기관/사립학교: (연금 + 보수)가 퇴직전소득 × 160% 초과 시 초과분의 50%
  if (mode === 'excess') {
    const total = monthlyPension + newMonthlySalary
    const ceiling = Math.round(prevMonthlySalary * SR.PUBLIC_INSTITUTION_THRESHOLD)
    if (total <= ceiling) return 0
    const suspension = Math.round((total - ceiling) / 2)
    return Math.min(suspension, monthlyPension)
  }

  // 민간기업: 보수월액이 퇴직전소득 대비 초과율에 따른 구간별 부분 정지
  if (mode === 'income') {
    if (newMonthlySalary <= prevMonthlySalary) return 0
    const excess = newMonthlySalary - prevMonthlySalary
    const ratio = excess / prevMonthlySalary

    // 구간별 정지율 결정 (가장 높은 해당 구간 적용)
    let rate = 0
    for (const bracket of SR.CIVILIAN_BRACKETS) {
      if (ratio >= bracket.threshold) rate = bracket.rate
    }
    const suspension = Math.round(excess * rate)
    return Math.min(suspension, monthlyPension)
  }

  return 0
}
