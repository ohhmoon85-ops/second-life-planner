import { HEALTH_INSURANCE_RULES_2026, calcPropertyScore } from '@/lib/constants/health-insurance-rules'
import type {
  HealthInsuranceInput,
  HealthInsuranceResult,
  HealthPremiumOption,
  DependentStatus,
} from '@/lib/types/health-insurance'

const R = HEALTH_INSURANCE_RULES_2026

/**
 * 연간 합산 소득 계산 (건강보험 기준)
 * - 군인연금: 연금소득
 * - 임대소득, 금융소득, 사업소득 포함
 */
export function calcAnnualTotalIncome(input: HealthInsuranceInput): number {
  const pension = input.monthlyMilitaryPension * 12
  const rental = input.annualRentalIncome ?? 0
  const financial = input.annualFinancialIncome ?? 0
  const business = input.annualBusinessIncome ?? 0
  return pension + rental + financial + business
}

/**
 * 피부양자 자격 판정 (건강보험법 시행규칙 제2조)
 */
export function judgeDependentStatus(input: HealthInsuranceInput): DependentStatus {
  // 사업소득이 있으면 무조건 불가
  if ((input.annualBusinessIncome ?? 0) > 0) {
    return 'ineligible_business'
  }

  const annualIncome = calcAnnualTotalIncome(input)
  const property = input.propertyTaxBase ?? 0

  // 소득 초과
  if (annualIncome > R.DEPENDENT_INCOME_LIMIT) {
    return 'ineligible_income'
  }

  // 재산 초과
  if (property > R.DEPENDENT_PROPERTY_LIMIT_2) {
    return 'ineligible_property'
  }
  if (property > R.DEPENDENT_PROPERTY_LIMIT_1 && annualIncome > R.DEPENDENT_PROPERTY_INCOME_LIMIT) {
    return 'ineligible_property'
  }

  return 'eligible'
}

/**
 * 지역가입자 월 보험료 계산
 * = (소득분 + 재산분) × 보험료율 → 실제로는 소득 기반 + 재산 점수제
 *
 * 단순화: 소득분 = 연소득 ÷ 12 × 7.09% + 재산점수 × 208.4원
 */
export function calcRegionMonthlyPremium(input: HealthInsuranceInput): number {
  const annualIncome = calcAnnualTotalIncome(input)
  const incomeMonthly = Math.round((annualIncome / 12) * R.EMPLOYEE_RATE)

  const propertyScore = calcPropertyScore(input.propertyTaxBase ?? 0)
  const propertyMonthly = Math.round(propertyScore * R.REGION_SCORE_UNIT)

  const premium = incomeMonthly + propertyMonthly
  return Math.max(premium, R.REGION_MIN_PREMIUM)
}

/**
 * 임의계속가입 월 보험료 (퇴직 전 보수 기준, 전액 본인 부담)
 */
export function calcVoluntaryContinuePremium(prevMonthlySalary: number): number {
  return Math.round(prevMonthlySalary * R.EMPLOYEE_RATE)
}

/**
 * 직장가입자 월 보험료 (재취업 후, 50% 본인 부담)
 */
export function calcEmployeePremium(monthlySalary: number): number {
  return Math.round((monthlySalary * R.EMPLOYEE_RATE) / 2)
}

/**
 * 장기요양보험료 계산 (건강보험료 × 12.95%)
 */
export function calcLTCI(healthPremium: number): number {
  return Math.round(healthPremium * R.LTCI_RATE)
}

/**
 * 건보료 전체 시뮬레이션 메인 함수
 */
export function calcHealthInsurance(input: HealthInsuranceInput): HealthInsuranceResult {
  const annualTotalIncome = calcAnnualTotalIncome(input)
  const dependentStatus = judgeDependentStatus(input)
  const dependentEligible = dependentStatus === 'eligible'

  const options: HealthPremiumOption[] = []

  // ── 옵션 1: 피부양자 ───────────────────────────────────
  const depNotes = []
  if (dependentEligible && input.hasSpouseWithInsurance) {
    depNotes.push('배우자 직장 건보에 피부양자 등록 → 보험료 0원')
    depNotes.push(`연 합산소득 ${(annualTotalIncome / 10000).toFixed(0)}만원으로 3,400만원 기준 충족`)
  } else if (dependentEligible && !input.hasSpouseWithInsurance) {
    depNotes.push('소득·재산 기준은 충족하나 직장가입자 가족이 없어 피부양자 등록 불가')
  }

  const dependentAvailable = dependentEligible && (input.hasSpouseWithInsurance ?? false)
  options.push({
    type: '피부양자',
    monthlyPremium: 0,
    ltciPremium: 0,
    totalMonthly: 0,
    available: dependentAvailable,
    unavailableReason: !dependentEligible
      ? dependentStatus === 'ineligible_income'
        ? `연 합산소득 ${(annualTotalIncome / 10000).toFixed(0)}만원 → 3,400만원 초과`
        : dependentStatus === 'ineligible_business'
        ? '사업소득 있으면 피부양자 불가 (금액 무관)'
        : '재산세 과표 기준 초과'
      : !input.hasSpouseWithInsurance
      ? '배우자 직장 건보 없음 (등록 대상 없음)'
      : undefined,
    notes: depNotes,
  })

  // ── 옵션 2: 지역가입자 ────────────────────────────────
  const regionPremium = calcRegionMonthlyPremium(input)
  const regionLtci = calcLTCI(regionPremium)
  options.push({
    type: '지역가입자',
    monthlyPremium: regionPremium,
    ltciPremium: regionLtci,
    totalMonthly: regionPremium + regionLtci,
    available: true,
    notes: [
      `소득분: 월 ${Math.round((annualTotalIncome / 12) * R.EMPLOYEE_RATE).toLocaleString('ko-KR')}원`,
      input.propertyTaxBase
        ? `재산분: 과표 ${(input.propertyTaxBase / 10000).toFixed(0)}만원 → 월 ${Math.round(calcPropertyScore(input.propertyTaxBase) * R.REGION_SCORE_UNIT).toLocaleString('ko-KR')}원`
        : '재산분: 없음',
      '건강보험료 + 장기요양보험료 합산',
    ],
  })

  // ── 옵션 3: 임의계속가입 (최대 36개월) ────────────────
  const voluntaryAvailable = input.yearsOfInsuredEmployment >= R.VOLUNTARY_CONTINUE_MIN_INSURED_MONTHS
  const voluntaryPremium = calcVoluntaryContinuePremium(input.prevMonthlySalary)
  const voluntaryLtci = calcLTCI(voluntaryPremium)
  options.push({
    type: '임의계속가입',
    monthlyPremium: voluntaryPremium,
    ltciPremium: voluntaryLtci,
    totalMonthly: voluntaryPremium + voluntaryLtci,
    available: voluntaryAvailable,
    unavailableReason: !voluntaryAvailable
      ? `직장 건보 가입 기간 ${input.yearsOfInsuredEmployment}개월 (18개월 이상 필요)`
      : undefined,
    notes: [
      '퇴직 전 직장 보험료와 동일 (고용주 부담분도 본인이 전액 납부)',
      '최대 36개월 유지 가능',
      '이후 지역가입자로 자동 전환',
    ],
  })

  // ── 추천 로직 ─────────────────────────────────────────
  const availableOptions = options.filter((o) => o.available)
  const cheapest = availableOptions.sort((a, b) => a.totalMonthly - b.totalMonthly)[0]

  let recommendedOption: HealthInsuranceResult['recommendedOption'] = '지역가입자'
  let recommendedReason = ''

  if (dependentAvailable) {
    recommendedOption = '피부양자'
    recommendedReason = '보험료 0원. 배우자 직장 건보 피부양자 자격을 최대한 유지하세요.'
  } else if (voluntaryAvailable && voluntaryPremium < regionPremium) {
    recommendedOption = '임의계속가입'
    recommendedReason = `지역가입자 대비 월 ${(regionPremium - voluntaryPremium).toLocaleString('ko-KR')}원 절약. 단, 36개월 후 지역가입자 전환됩니다.`
  } else {
    recommendedOption = '지역가입자'
    recommendedReason = '해당 조건에서 지역가입자로 전환이 기본값입니다.'
  }

  // 최고-최저 연간 절감액
  const maxPremium = Math.max(...availableOptions.map((o) => o.totalMonthly))
  const minPremium = cheapest?.totalMonthly ?? 0
  const annualSaving = (maxPremium - minPremium) * 12

  return {
    dependentStatus,
    dependentEligible,
    annualTotalIncome,
    options,
    recommendedOption,
    recommendedReason,
    annualSaving,
    calculationBasis: {
      ruleVersion: R.version,
      notes: R.근거 as unknown as string[],
    },
  }
}
