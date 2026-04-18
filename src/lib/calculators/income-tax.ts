import {
  INCOME_TAX_BRACKETS_2026,
  LOCAL_INCOME_TAX_RATE,
} from '@/lib/constants/tax-brackets'
import type { IncomeTaxResult } from '@/lib/types/pension'

/**
 * 연금소득공제 계산 (소득세법 제47조의2)
 * 모든 금액은 정수(원) 단위
 */
export function calcPensionIncomeDeduction(annualPension: number): number {
  // 구간별 계산
  const annual = annualPension
  if (annual <= 3_500_000) return annual
  if (annual <= 7_000_000) return 3_500_000 + Math.round((annual - 3_500_000) * 0.4)
  if (annual <= 14_000_000) return 4_900_000 + Math.round((annual - 7_000_000) * 0.2)
  if (annual <= 35_000_000) return 6_300_000 + Math.round((annual - 14_000_000) * 0.1)
  return 8_400_000
}

/**
 * 종합소득세 누진세율 적용
 */
export function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0

  for (const bracket of INCOME_TAX_BRACKETS_2026) {
    if (taxableIncome <= bracket.upTo) {
      return Math.round(taxableIncome * bracket.rate - bracket.deduction)
    }
  }
  return 0
}

/**
 * 군인연금 연간 수령액에 대한 소득세 전체 계산
 * - 2002년 이후 납입분만 과세 대상 (현재는 전액 과세로 가정)
 * - 연금소득공제 적용 후 누진세율
 * - 지방소득세 10% 별도
 */
export function calcPensionTax(annualPension: number): IncomeTaxResult {
  const grossIncome = Math.round(annualPension)
  const pensionDeduction = calcPensionIncomeDeduction(grossIncome)
  const taxableIncome = Math.max(0, grossIncome - pensionDeduction)
  const incomeTax = calcIncomeTax(taxableIncome)
  const localTax = Math.round(incomeTax * LOCAL_INCOME_TAX_RATE)
  const totalTax = incomeTax + localTax
  const afterTaxAnnual = grossIncome - totalTax
  const effectiveTaxRate =
    grossIncome > 0 ? Math.round((totalTax / grossIncome) * 10000) / 100 : 0

  return {
    grossIncome,
    pensionDeduction,
    taxableIncome,
    incomeTax,
    localTax,
    totalTax,
    afterTaxAnnual,
    effectiveTaxRate,
  }
}
