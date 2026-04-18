import { HEALTH_INSURANCE_RULES_2026, calcPropertyScore } from '@/lib/constants/health-insurance-rules'
import type {
  HealthInsuranceInput,
  HealthInsuranceResult,
  HealthPremiumOption,
  DependentStatus,
  CoupleDependent,
} from '@/lib/types/health-insurance'

const R = HEALTH_INSURANCE_RULES_2026

export function calcAnnualTotalIncome(input: HealthInsuranceInput): number {
  const pension = input.monthlyMilitaryPension * 12
  const rental = input.annualRentalIncome ?? 0
  const financial = input.annualFinancialIncome ?? 0
  const business = input.annualBusinessIncome ?? 0
  return pension + rental + financial + business
}

export function judgeDependentStatus(input: HealthInsuranceInput): DependentStatus {
  if ((input.annualBusinessIncome ?? 0) > 0) return 'ineligible_business'

  const annualIncome = calcAnnualTotalIncome(input)
  const property = input.propertyTaxBase ?? 0

  if (annualIncome > R.DEPENDENT_INCOME_LIMIT) return 'ineligible_income'

  if (property > R.DEPENDENT_PROPERTY_LIMIT_2) return 'ineligible_property'
  if (property > R.DEPENDENT_PROPERTY_LIMIT_1 && annualIncome > R.DEPENDENT_PROPERTY_INCOME_LIMIT) {
    return 'ineligible_property'
  }

  return 'eligible'
}

/**
 * 배우자 피부양자 자격 단독 판정 (배우자 소득·재산 기준)
 */
function judgeSpouseDependentStatus(
  spouseAnnualIncome: number,
  spousePropertyTaxBase: number
): DependentStatus {
  if (spouseAnnualIncome > R.DEPENDENT_INCOME_LIMIT) return 'ineligible_income'
  if (spousePropertyTaxBase > R.DEPENDENT_PROPERTY_LIMIT_2) return 'ineligible_property'
  if (
    spousePropertyTaxBase > R.DEPENDENT_PROPERTY_LIMIT_1 &&
    spouseAnnualIncome > R.DEPENDENT_PROPERTY_INCOME_LIMIT
  ) {
    return 'ineligible_property'
  }
  return 'eligible'
}

/**
 * 부부 동반 탈락 시뮬레이션
 * 배우자가 피부양자로 등록된 상태에서 본인 소득이 증가할 때
 * 배우자까지 함께 탈락하는 시나리오를 경고
 */
export function checkCoupleDependent(input: HealthInsuranceInput): CoupleDependent | undefined {
  if (!input.spouseMonthlyPension && !input.spouseAnnualOtherIncome) return undefined

  const selfAnnualIncome = calcAnnualTotalIncome(input)
  const selfStatus = judgeDependentStatus(input)
  const selfEligible = selfStatus === 'eligible'

  const spouseAnnualIncome =
    (input.spouseMonthlyPension ?? 0) * 12 + (input.spouseAnnualOtherIncome ?? 0)
  const spousePropertyTaxBase = input.spousePropertyTaxBase ?? 0
  const spouseStatus = judgeSpouseDependentStatus(spouseAnnualIncome, spousePropertyTaxBase)
  const spouseEligible = spouseStatus === 'eligible'

  const bothDisqualified = !selfEligible && !spouseEligible

  let warningMessage: string | undefined

  if (!selfEligible && spouseEligible) {
    warningMessage = `본인 연소득 ${(selfAnnualIncome / 10000).toFixed(0)}만원으로 피부양자 탈락. 배우자는 단독으로 피부양자 유지 가능합니다.`
  } else if (!selfEligible && !spouseEligible) {
    warningMessage = `⚠️ 부부 모두 피부양자 탈락. 본인 연소득 ${(selfAnnualIncome / 10000).toFixed(0)}만원 + 배우자 연소득 ${(spouseAnnualIncome / 10000).toFixed(0)}만원으로 각각 2,000만원 기준 초과. 부부 합산 건보료가 발생합니다.`
  } else if (selfEligible && !spouseEligible) {
    warningMessage = `배우자 연소득 ${(spouseAnnualIncome / 10000).toFixed(0)}만원으로 피부양자 탈락. 본인은 피부양자 유지 가능합니다.`
  }

  return {
    selfEligible,
    selfStatus,
    selfAnnualIncome,
    spouseEligible,
    spouseAnnualIncome,
    bothDisqualified,
    warningMessage,
  }
}

export function calcRegionMonthlyPremium(input: HealthInsuranceInput): number {
  const annualIncome = calcAnnualTotalIncome(input)
  const incomeMonthly = Math.round((annualIncome / 12) * R.EMPLOYEE_RATE)
  const propertyScore = calcPropertyScore(input.propertyTaxBase ?? 0)
  const propertyMonthly = Math.round(propertyScore * R.REGION_SCORE_UNIT)
  const premium = incomeMonthly + propertyMonthly
  return Math.max(premium, R.REGION_MIN_PREMIUM)
}

export function calcVoluntaryContinuePremium(prevMonthlySalary: number): number {
  return Math.round(prevMonthlySalary * R.EMPLOYEE_RATE)
}

export function calcEmployeePremium(monthlySalary: number): number {
  return Math.round((monthlySalary * R.EMPLOYEE_RATE) / 2)
}

export function calcLTCI(healthPremium: number): number {
  return Math.round(healthPremium * R.LTCI_RATE)
}

export function calcHealthInsurance(input: HealthInsuranceInput): HealthInsuranceResult {
  const annualTotalIncome = calcAnnualTotalIncome(input)
  const dependentStatus = judgeDependentStatus(input)
  const dependentEligible = dependentStatus === 'eligible'
  const coupleCheck = checkCoupleDependent(input)

  const limitLabel = `${(R.DEPENDENT_INCOME_LIMIT / 10000).toFixed(0)}만원`

  const options: HealthPremiumOption[] = []

  // ── 옵션 1: 피부양자 ────────────────────────────────
  const depNotes: string[] = []
  if (dependentEligible && input.hasSpouseWithInsurance) {
    depNotes.push('배우자 직장 건보에 피부양자 등록 → 보험료 0원')
    depNotes.push(`연 합산소득 ${(annualTotalIncome / 10000).toFixed(0)}만원으로 ${limitLabel} 기준 충족`)
  } else if (dependentEligible && !input.hasSpouseWithInsurance) {
    depNotes.push(`소득·재산 기준 충족하나 직장가입자 가족 없어 피부양자 등록 불가`)
  }
  if (coupleCheck?.warningMessage) {
    depNotes.push(coupleCheck.warningMessage)
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
        ? `연 합산소득 ${(annualTotalIncome / 10000).toFixed(0)}만원 → ${limitLabel} 초과`
        : dependentStatus === 'ineligible_business'
        ? '사업소득 있으면 피부양자 불가 (금액 무관)'
        : '재산세 과표 기준 초과'
      : !input.hasSpouseWithInsurance
      ? '배우자 직장 건보 없음 (등록 대상 없음)'
      : undefined,
    notes: depNotes,
  })

  // ── 옵션 2: 지역가입자 ────────────────────────────
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

  // ── 옵션 3: 임의계속가입 ─────────────────────────
  const voluntaryAvailable =
    input.yearsOfInsuredEmployment >= R.VOLUNTARY_CONTINUE_MIN_INSURED_MONTHS
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
      '퇴직 전 직장 보험료와 동일 (고용주 부담분도 본인 전액 납부)',
      '최대 36개월 유지 가능',
      '이후 지역가입자로 자동 전환',
    ],
  })

  const availableOptions = options.filter(o => o.available)
  const cheapest = [...availableOptions].sort((a, b) => a.totalMonthly - b.totalMonthly)[0]

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

  const maxPremium = Math.max(...availableOptions.map(o => o.totalMonthly))
  const minPremium = cheapest?.totalMonthly ?? 0
  const annualSaving = (maxPremium - minPremium) * 12

  return {
    dependentStatus,
    dependentEligible,
    annualTotalIncome,
    coupleCheck,
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
