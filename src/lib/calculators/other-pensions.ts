/**
 * 공무원연금, 사학연금, 국민연금 간이 계산기
 * 참고용 추정값 — 각 공단 정식 계산기와 상이할 수 있음
 */

// ── 공무원연금 (공무원연금법 §43) ─────────────────────────────
// 2016년 이후 입직자: 재직기간 × 1.7% × 기준소득월액 평균
// 2015년 이전 입직자: 구간별 복잡한 공식 → 여기서는 1.7% 통일 적용 (단순화)
export interface CivilPensionInput {
  avgMonthlyIncome: number       // 재직기간 평균 기준소득월액 (원)
  serviceYears: number           // 재직연수
  serviceMonths?: number         // 추가 개월
}

export interface CivilPensionResult {
  monthlyPension: number
  annualPension: number
  paymentRate: number
  note: string
}

export function calcCivilServantPension(input: CivilPensionInput): CivilPensionResult {
  const totalYears = input.serviceYears + (input.serviceMonths ?? 0) / 12
  const rate = Math.min(totalYears * 0.017, 0.76)
  const monthlyPension = Math.round(input.avgMonthlyIncome * rate)
  return {
    monthlyPension,
    annualPension: monthlyPension * 12,
    paymentRate: Math.round(rate * 10000) / 100,
    note: '공무원연금법 §43 기준, 1.7%/년 × 최대 76%. 2015년 이전 재직자는 구간 공식 상이.',
  }
}

// ── 사학연금 (사립학교교직원 연금법) ─────────────────────────
// 공무원연금과 동일한 구조 (1.7%/년, 상한 76%)
export function calcPrivateSchoolPension(input: CivilPensionInput): CivilPensionResult {
  const result = calcCivilServantPension(input)
  return {
    ...result,
    note: '사립학교교직원 연금법 §42 기준, 공무원연금과 동일 구조.',
  }
}

// ── 국민연금 (국민연금법 §49) ────────────────────────────────
// 노령연금액 = 1.2 × (A + B) × (1 + 0.05n/12)
// A = 전체 가입자 평균소득월액 (2026년 기준 2,989,237원 가정)
// B = 가입자 개인 평균소득월액
// n = 20년 초과 가입월수
export interface NationalPensionInput {
  avgMonthlyIncome: number       // 가입기간 평균 소득월액 (원)
  contributionMonths: number     // 국민연금 납부 개월 수
}

export interface NationalPensionResult {
  monthlyPension: number
  annualPension: number
  earlyPenalty?: number          // 조기수령 감액률
  lateBonus?: number             // 연기연금 가산률
  note: string
}

const A_VALUE_2026 = 2_989_237  // 2026년 기준 A값 (국민연금공단 고시)

export function calcNationalPension(input: NationalPensionInput): NationalPensionResult {
  const { avgMonthlyIncome, contributionMonths } = input

  if (contributionMonths < 120) {
    // 10년 미만: 반환일시금만 지급 (연금 없음)
    return {
      monthlyPension: 0,
      annualPension: 0,
      note: '가입기간 10년(120개월) 미만 — 노령연금 수급 불가, 반환일시금만 가능',
    }
  }

  const A = A_VALUE_2026
  const B = avgMonthlyIncome
  const baseYears = 20
  const extraMonths = Math.max(0, contributionMonths - baseYears * 12)

  // 기본 연금액 (20년 기준)
  const base = Math.round(1.2 * (A + B) * (contributionMonths / (baseYears * 12)))

  // 20년 초과분 가산 (매 1년당 5%)
  const extraRate = 1 + 0.05 * (extraMonths / 12)
  const monthlyPension = Math.round(base * extraRate)

  return {
    monthlyPension,
    annualPension: monthlyPension * 12,
    earlyPenalty: 0.06,   // 1년 조기수령 시 6% 감액 (최대 30%)
    lateBonus: 0.072,     // 1년 연기 시 7.2% 가산 (최대 36%)
    note: `국민연금법 §49 기준. A값 ${A_VALUE_2026.toLocaleString('ko-KR')}원(2026년 고시). 실제 수령액은 국민연금공단 홈페이지에서 확인하세요.`,
  }
}

// ── 통합 결과 ─────────────────────────────────────────────────
export interface PensionPortfolioInput {
  military?: { avgMonthlyIncome: number; serviceYears: number; serviceMonths?: number }
  civilServant?: CivilPensionInput
  privateSchool?: CivilPensionInput
  national?: NationalPensionInput
}

export interface PensionPortfolioResult {
  military?: { monthlyPension: number; annualPension: number }
  civilServant?: CivilPensionResult
  privateSchool?: CivilPensionResult
  national?: NationalPensionResult
  totalMonthly: number
  totalAnnual: number
}

export function calcPensionPortfolio(input: PensionPortfolioInput): PensionPortfolioResult {
  const results: PensionPortfolioResult = { totalMonthly: 0, totalAnnual: 0 }

  if (input.civilServant) {
    results.civilServant = calcCivilServantPension(input.civilServant)
    results.totalMonthly += results.civilServant.monthlyPension
    results.totalAnnual += results.civilServant.annualPension
  }
  if (input.privateSchool) {
    results.privateSchool = calcPrivateSchoolPension(input.privateSchool)
    results.totalMonthly += results.privateSchool.monthlyPension
    results.totalAnnual += results.privateSchool.annualPension
  }
  if (input.national) {
    results.national = calcNationalPension(input.national)
    results.totalMonthly += results.national.monthlyPension
    results.totalAnnual += results.national.annualPension
  }

  return results
}
