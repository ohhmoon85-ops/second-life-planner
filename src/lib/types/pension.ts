export type MilitaryRank = '대위' | '소령' | '중령' | '대령' | '장성급'

export interface MilitaryPensionInput {
  birthDate: string
  retirementDate: string
  rank: MilitaryRank
  serviceYears: number
  serviceMonths: number
  avgBaseMonthlySalary: number
  combatYears?: number
  earlyRetirement?: boolean
}

export interface InflationProjectionEntry {
  year: number
  nominalAmount: number
  realAmount: number
}

export interface MilitaryPensionResult {
  monthlyPension: number
  annualPension: number
  afterTaxMonthly: number
  afterTaxAnnual: number
  effectiveTaxRate: number
  paymentRate: number
  inflationAdjustedProjection: InflationProjectionEntry[]
  calculationBasis: {
    ruleVersion: string
    basisNote: string[]
  }
}

export interface IncomeTaxInput {
  annualIncome: number
}

export interface IncomeTaxResult {
  grossIncome: number
  pensionDeduction: number
  taxableIncome: number
  incomeTax: number
  localTax: number
  totalTax: number
  afterTaxAnnual: number
  effectiveTaxRate: number
}
