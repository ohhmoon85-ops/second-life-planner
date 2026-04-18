import { INCOME_TAX_BRACKETS_2026, LOCAL_INCOME_TAX_RATE } from '@/lib/constants/tax-brackets'
import { calcPensionIncomeDeduction, calcIncomeTax } from '@/lib/calculators/income-tax'

// 분리과세 세율 (연금소득 분리과세, 소득세법 제14조③)
// 사적연금: 1,500만원 이하 → 3~5%, 초과 → 종합과세 또는 15% 선택
// 공적연금(군인연금): 전액 종합과세 대상이나, 타 소득과의 합산 방식 비교
const WITHHOLDING_RATE_LOW = 0.05    // 700만원 이하 연금소득 원천징수세율 (5%)
const WITHHOLDING_RATE_HIGH = 0.15   // 1,500만원 초과 사적연금 선택적 분리과세

export interface TaxComparisonInput {
  annualMilitaryPension: number      // 군인연금 연간 (원)
  annualOtherIncome?: number         // 기타 합산 소득 (근로·사업 등, 원)
  personalDeductions?: number        // 인적공제 합계 (기본공제 등, 원)
}

export interface TaxComparisonResult {
  // 종합과세 방식
  comprehensive: {
    grossIncome: number
    pensionDeduction: number
    otherDeductions: number
    taxableIncome: number
    incomeTax: number
    localTax: number
    totalTax: number
    afterTaxAnnual: number
    effectiveRate: number
  }
  // 분리과세 방식 (연금소득 별도 원천징수, 소득세법 §14③)
  // 공적연금은 종합과세 의무이므로 "연금 이외 소득만 별도 신고" 시나리오로 표시
  separateWithholding: {
    pensionTax: number                // 연금 원천징수세액 (연간)
    pensionLocalTax: number
    otherIncomeTax: number            // 기타소득 별도 세액
    otherLocalTax: number
    totalTax: number
    afterTaxAnnual: number
    effectiveRate: number
    note: string
  }
  // 절약액 (종합과세 - 분리과세)
  saving: number
  recommendation: '종합과세' | '분리과세(원천징수 유지)'
  recommendationReason: string
}

export function calcTaxComparison(input: TaxComparisonInput): TaxComparisonResult {
  const pension = input.annualMilitaryPension
  const other = input.annualOtherIncome ?? 0
  const personalDed = input.personalDeductions ?? 1_500_000 // 기본공제 본인 150만원

  // ── 종합과세 ─────────────────────────────────────────────
  const pensionDeduction = calcPensionIncomeDeduction(pension)
  const pensionIncome = Math.max(0, pension - pensionDeduction)

  // 기타 소득은 별도 공제 없이 합산 (단순화: 근로소득공제 미적용)
  const totalTaxable = Math.max(0, pensionIncome + other - personalDed)
  const incomeTax = calcIncomeTax(totalTaxable)
  const localTax = Math.round(incomeTax * LOCAL_INCOME_TAX_RATE)
  const totalTaxComp = incomeTax + localTax
  const afterTaxComp = pension + other - totalTaxComp
  const effectiveComp = (pension + other) > 0
    ? Math.round((totalTaxComp / (pension + other)) * 10000) / 100 : 0

  // ── 분리과세 시나리오 ────────────────────────────────────
  // 공적연금은 종합과세 의무이지만, 타 소득 없이 연금만 있을 경우
  // 원천징수 후 확정신고 면제(소득세법 §73①4호) 효과를 비교
  // → 연금 원천징수 5% (간이세율) vs 종합과세 누진세율 비교
  const pensionWithheld = Math.round(pension * WITHHOLDING_RATE_LOW)
  const pensionLocalWithheld = Math.round(pensionWithheld * LOCAL_INCOME_TAX_RATE)

  // 기타 소득 별도 분리 (15% 원천징수 가정)
  const otherWithheld = Math.round(other * WITHHOLDING_RATE_HIGH)
  const otherLocalWithheld = Math.round(otherWithheld * LOCAL_INCOME_TAX_RATE)

  const totalTaxSep = pensionWithheld + pensionLocalWithheld + otherWithheld + otherLocalWithheld
  const afterTaxSep = pension + other - totalTaxSep
  const effectiveSep = (pension + other) > 0
    ? Math.round((totalTaxSep / (pension + other)) * 10000) / 100 : 0

  const saving = totalTaxComp - totalTaxSep

  // 공적연금(군인연금)은 종합과세 의무이므로, 실제로 분리과세 선택 불가
  // 단, 타 소득이 없고 연금 규모가 작으면 확정신고 면제 → 원천징수로 종결 가능
  const canAvoidFiling = other === 0 && pension <= 35_000_000
  const recommendation: TaxComparisonResult['recommendation'] =
    canAvoidFiling && saving > 0 ? '분리과세(원천징수 유지)' : '종합과세'

  const recommendationReason = canAvoidFiling && saving > 0
    ? `다른 소득이 없고 연금 ${(pension / 10000).toFixed(0)}만원 → 원천징수(5%)로 확정신고 면제 가능. 연간 ${saving.toLocaleString('ko-KR')}원 절약`
    : totalTaxComp <= totalTaxSep
    ? '종합과세가 누적공제(연금소득공제 + 인적공제) 효과로 세부담이 더 낮습니다.'
    : '기타 소득이 있어 종합과세 합산이 불리. 소득 분리 전략을 세무사와 상담하세요.'

  return {
    comprehensive: {
      grossIncome: pension + other,
      pensionDeduction,
      otherDeductions: personalDed,
      taxableIncome: totalTaxable,
      incomeTax,
      localTax,
      totalTax: totalTaxComp,
      afterTaxAnnual: afterTaxComp,
      effectiveRate: effectiveComp,
    },
    separateWithholding: {
      pensionTax: pensionWithheld,
      pensionLocalTax: pensionLocalWithheld,
      otherIncomeTax: otherWithheld,
      otherLocalTax: otherLocalWithheld,
      totalTax: totalTaxSep,
      afterTaxAnnual: afterTaxSep,
      effectiveRate: effectiveSep,
      note: canAvoidFiling
        ? '타 소득 없음 → 원천징수(5%)로 확정신고 면제 가능 (소득세법 §73①4호)'
        : '공적연금(군인연금)은 종합과세 의무 — 타 소득과 합산 신고 필요',
    },
    saving,
    recommendation,
    recommendationReason,
  }
}
