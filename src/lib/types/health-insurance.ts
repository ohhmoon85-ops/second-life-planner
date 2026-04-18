import type { ReemploymentType } from '@/lib/constants/pension-suspension-rules'

export interface HealthInsuranceInput {
  monthlyMilitaryPension: number
  annualRentalIncome?: number
  annualFinancialIncome?: number
  annualBusinessIncome?: number
  propertyTaxBase?: number
  hasSpouseWithInsurance?: boolean

  // 배우자 정보 (부부 동반 탈락 시뮬레이션)
  spouseMonthlyPension?: number           // 배우자 월 연금 (군인/공무원/사학/국민)
  spouseAnnualOtherIncome?: number        // 배우자 기타 연간 소득
  spousePropertyTaxBase?: number          // 배우자 재산세 과표

  prevMonthlySalary: number
  yearsOfInsuredEmployment: number
}

export type DependentStatus =
  | 'eligible'
  | 'ineligible_income'
  | 'ineligible_property'
  | 'ineligible_business'

export interface CoupleDependent {
  selfEligible: boolean
  selfStatus: DependentStatus
  selfAnnualIncome: number
  spouseEligible: boolean
  spouseAnnualIncome: number
  bothDisqualified: boolean               // 부부 모두 탈락 여부
  warningMessage?: string
}

export interface HealthPremiumOption {
  type: '피부양자' | '지역가입자' | '임의계속가입' | '직장가입자(재취업)'
  monthlyPremium: number
  ltciPremium: number
  totalMonthly: number
  available: boolean
  unavailableReason?: string
  notes: string[]
}

export interface HealthInsuranceResult {
  dependentStatus: DependentStatus
  dependentEligible: boolean
  annualTotalIncome: number
  coupleCheck?: CoupleDependent           // 부부 동반 분석 (배우자 정보 있을 때만)
  options: HealthPremiumOption[]
  recommendedOption: '피부양자' | '지역가입자' | '임의계속가입'
  recommendedReason: string
  annualSaving: number
  calculationBasis: {
    ruleVersion: string
    notes: string[]
  }
}

export interface ReemploymentInput {
  monthlyMilitaryPension: number
  prevMonthlySalary: number
  newMonthlySalary: number
  reemploymentType?: ReemploymentType  // 단일 유형 필터링 시 사용 (없으면 전체 계산)
  propertyTaxBase?: number
}

export interface ReemploymentScenario {
  type: ReemploymentType
  newMonthlySalary: number
  pensionSuspension: number
  netMonthlyPension: number
  healthPremium: number
  ltciPremium: number
  totalMonthlyIncome: number
  annualIncome: number
  notes: string[]
}

export interface ReemploymentResult {
  baseScenario: {
    monthlyPension: number
    healthPremium: number
    totalMonthly: number
  }
  scenarios: ReemploymentScenario[]
  bestScenario: ReemploymentType
  worstScenario: ReemploymentType
}
