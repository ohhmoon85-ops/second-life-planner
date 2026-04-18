import { PENSION_RULES_2026 } from '@/lib/constants/pension-rules'
import { calcPensionTax } from '@/lib/calculators/income-tax'
import { calcInflationProjection } from '@/lib/calculators/inflation'
import type { MilitaryPensionInput, MilitaryPensionResult } from '@/lib/types/pension'

/**
 * 복무연수별 지급률 계산
 * 2015년 개혁 이후: 재직 1년당 1.7%, 최대 76%
 */
export function calcPaymentRate(serviceYears: number, serviceMonths: number): number {
  // 총 복무기간을 연(소수) 단위로 환산
  const totalYears = serviceYears + serviceMonths / 12
  const rawRate = totalYears * PENSION_RULES_2026.RATE_PER_YEAR
  return Math.min(rawRate, PENSION_RULES_2026.MAX_PAYMENT_RATE)
}

/**
 * 전투·대간첩작전 참가 가산율 계산
 */
export function calcCombatBonus(combatYears: number): number {
  const bonus = combatYears * PENSION_RULES_2026.COMBAT_BONUS_RATE_PER_YEAR
  return Math.min(bonus, PENSION_RULES_2026.COMBAT_BONUS_MAX)
}

/**
 * 군인연금 세전 월 수령액 계산
 * = 평균기준소득월액 × (복무지급률 + 전투가산율) × (1 - 조기전역감액률)
 * 모든 금액은 정수(원) 단위로 처리
 */
export function calcGrossMonthlyPension(input: MilitaryPensionInput): number {
  if (input.serviceYears < PENSION_RULES_2026.MIN_SERVICE_YEARS) {
    throw new Error(
      `최소 복무연수(${PENSION_RULES_2026.MIN_SERVICE_YEARS}년) 미달로 연금 수령 불가`
    )
  }

  const base = Math.round(input.avgBaseMonthlySalary)
  const paymentRate = calcPaymentRate(input.serviceYears, input.serviceMonths)
  const combatBonus = calcCombatBonus(input.combatYears ?? 0)
  const effectiveRate = paymentRate + combatBonus
  const earlyPenalty = input.earlyRetirement ? PENSION_RULES_2026.EARLY_RETIREMENT_PENALTY : 0

  const gross = Math.round(base * effectiveRate * (1 - earlyPenalty))
  return gross
}

/**
 * 군인연금 전체 계산 (메인 함수)
 * 순수 함수: 동일 입력 → 동일 출력, 외부 의존 없음
 */
export function calcMilitaryPension(input: MilitaryPensionInput): MilitaryPensionResult {
  const monthlyPension = calcGrossMonthlyPension(input)
  const annualPension = monthlyPension * 12

  const taxResult = calcPensionTax(annualPension)
  const afterTaxMonthly = Math.round(taxResult.afterTaxAnnual / 12)
  const afterTaxAnnual = taxResult.afterTaxAnnual

  const paymentRate = calcPaymentRate(input.serviceYears, input.serviceMonths)
  const combatBonus = calcCombatBonus(input.combatYears ?? 0)

  const inflationAdjustedProjection = calcInflationProjection(monthlyPension)

  const basisNote: string[] = [
    `공무원연금법 시행령 제38조 (2015.1.1. 개정) 지급률 ${(PENSION_RULES_2026.RATE_PER_YEAR * 100).toFixed(1)}%/년 적용`,
    `군인연금법 제23조 퇴직연금 지급률: 복무 ${input.serviceYears}년 ${input.serviceMonths}개월 → ${(paymentRate * 100).toFixed(2)}%`,
  ]

  if ((input.combatYears ?? 0) > 0) {
    basisNote.push(
      `군인연금법 제24조 전투 등 특수근무 가산: ${input.combatYears}년 × 0.5% = +${(combatBonus * 100).toFixed(1)}%`
    )
  }

  if (input.earlyRetirement) {
    basisNote.push(
      `조기 전역 감액: -${(PENSION_RULES_2026.EARLY_RETIREMENT_PENALTY * 100).toFixed(0)}% 적용`
    )
  }

  basisNote.push(
    `연금소득공제: ${taxResult.pensionDeduction.toLocaleString('ko-KR')}원 (소득세법 제47조의2)`,
    `물가연동: 통계청 CPI 기준 연 ${(PENSION_RULES_2026.ASSUMED_INFLATION_RATE * 100).toFixed(1)}% 가정`
  )

  return {
    monthlyPension,
    annualPension,
    afterTaxMonthly,
    afterTaxAnnual,
    effectiveTaxRate: taxResult.effectiveTaxRate,
    paymentRate: Math.round((paymentRate + combatBonus) * 10000) / 100,
    inflationAdjustedProjection,
    calculationBasis: {
      ruleVersion: PENSION_RULES_2026.version,
      basisNote,
    },
  }
}
