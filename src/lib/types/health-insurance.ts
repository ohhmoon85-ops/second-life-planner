import type { ReemploymentType } from '@/lib/constants/pension-suspension-rules'

export interface HealthInsuranceInput {
  // 연금 소득
  monthlyMilitaryPension: number        // 군인연금 월 수령액 (세전, 원)

  // 기타 소득 (선택)
  annualRentalIncome?: number           // 임대소득 (연, 원)
  annualFinancialIncome?: number        // 금융소득 (연, 원)
  annualBusinessIncome?: number         // 사업소득 (연, 원) → 있으면 피부양자 불가

  // 재산
  propertyTaxBase?: number              // 재산세 과세표준 (원)

  // 가족 정보
  hasSpouseWithInsurance?: boolean      // 배우자 직장보험 있음 (피부양자 등록 가능)

  // 퇴직 전 직장 정보 (임의계속가입 계산용)
  prevMonthlySalary: number             // 퇴직 직전 보수월액 (원)
  yearsOfInsuredEmployment: number      // 직장 건보 가입 기간 (개월)
}

export type DependentStatus = 'eligible' | 'ineligible_income' | 'ineligible_property' | 'ineligible_business'

export interface HealthPremiumOption {
  type: '피부양자' | '지역가입자' | '임의계속가입' | '직장가입자(재취업)'
  monthlyPremium: number                // 월 보험료 본인 부담 (원)
  ltciPremium: number                   // 장기요양보험료 (원)
  totalMonthly: number                  // 합계 (원)
  available: boolean                    // 선택 가능 여부
  unavailableReason?: string            // 불가 사유
  notes: string[]                       // 주요 고지 사항
}

export interface HealthInsuranceResult {
  // 피부양자 판정
  dependentStatus: DependentStatus
  dependentEligible: boolean
  annualTotalIncome: number             // 합산 연간 소득

  // 옵션별 보험료 비교
  options: HealthPremiumOption[]

  // 추천 옵션
  recommendedOption: '피부양자' | '지역가입자' | '임의계속가입'
  recommendedReason: string

  // 연간 절감액 (최고 vs 최저)
  annualSaving: number

  calculationBasis: {
    ruleVersion: string
    notes: string[]
  }
}

// ─────────────────────────────────────────────
// 재취업 시나리오 타입
// ─────────────────────────────────────────────

export interface ReemploymentInput {
  monthlyMilitaryPension: number        // 현재 월 연금 (원)
  prevMonthlySalary: number             // 퇴직 직전 기준소득월액 (원)
  newMonthlySalary: number              // 재취업 후 예상 보수월액 (원)
  reemploymentType: ReemploymentType
  propertyTaxBase?: number              // 재산세 과표 (지역가입 계산용)
}

export interface ReemploymentScenario {
  type: ReemploymentType
  newMonthlySalary: number

  // 연금
  pensionSuspension: number             // 월 연금 정지액
  netMonthlyPension: number             // 실 수령 연금 (정지 후)

  // 건보료
  healthPremium: number                 // 월 건보료 (직장가입자)
  ltciPremium: number                   // 장기요양보험료

  // 최종 순소득
  totalMonthlyIncome: number            // 연금 + 보수 - 건보료
  annualIncome: number

  notes: string[]
}

export interface ReemploymentResult {
  baseScenario: {
    monthlyPension: number              // 재취업 없이 연금만
    healthPremium: number               // 지역/피부양자 보험료
    totalMonthly: number
  }
  scenarios: ReemploymentScenario[]
  bestScenario: ReemploymentType        // 순소득 기준 최적
  worstScenario: ReemploymentType
}
