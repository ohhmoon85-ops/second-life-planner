import { PENSION_RULES_2026 } from '@/lib/constants/pension-rules'
import type { InflationProjectionEntry } from '@/lib/types/pension'

/**
 * 물가 연동 미래 연금 수령액 시뮬레이션
 * nominalAmount: 물가연동 후 명목 수령액 (매년 물가상승률만큼 증가)
 * realAmount: 기준연도(2026) 구매력 기준 실질 수령액
 */
export function calcInflationProjection(
  monthlyPension: number,
  years: number = PENSION_RULES_2026.PROJECTION_YEARS,
  inflationRate: number = PENSION_RULES_2026.ASSUMED_INFLATION_RATE
): InflationProjectionEntry[] {
  const baseYear = new Date().getFullYear()
  const result: InflationProjectionEntry[] = []

  for (let i = 0; i <= years; i++) {
    const inflationFactor = Math.pow(1 + inflationRate, i)
    const nominalMonthly = Math.round(monthlyPension * inflationFactor)
    const realMonthly = Math.round(monthlyPension) // 2026 구매력 기준 불변

    result.push({
      year: baseYear + i,
      nominalAmount: nominalMonthly,
      realAmount: realMonthly,
    })
  }

  return result
}
