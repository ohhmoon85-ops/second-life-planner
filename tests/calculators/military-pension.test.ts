import { describe, it, expect } from 'vitest'
import {
  calcMilitaryPension,
  calcPaymentRate,
  calcCombatBonus,
  calcGrossMonthlyPension,
} from '@/lib/calculators/military-pension'
import { calcPensionTax } from '@/lib/calculators/income-tax'

describe('calcPaymentRate', () => {
  it('30년 복무 → 지급률 51%', () => {
    const rate = calcPaymentRate(30, 0)
    expect(rate).toBeCloseTo(0.51, 4)
  })

  it('20년 복무 → 지급률 34%', () => {
    const rate = calcPaymentRate(20, 0)
    expect(rate).toBeCloseTo(0.34, 4)
  })

  it('45년 환산 시 최대 76% 상한 적용', () => {
    const rate = calcPaymentRate(45, 0)
    expect(rate).toBe(0.76)
  })

  it('30년 6개월 복무 → 지급률 정확 계산', () => {
    const rate = calcPaymentRate(30, 6)
    expect(rate).toBeCloseTo(30.5 * 0.017, 6)
  })
})

describe('calcCombatBonus', () => {
  it('전투 2년 → 가산율 1%', () => {
    expect(calcCombatBonus(2)).toBeCloseTo(0.01, 4)
  })

  it('전투 12년 → 최대 5% 상한 적용', () => {
    expect(calcCombatBonus(12)).toBe(0.05)
  })

  it('전투 0년 → 0%', () => {
    expect(calcCombatBonus(0)).toBe(0)
  })
})

describe('calcMilitaryPension — 5가지 시나리오', () => {
  // 시나리오 1: 대령 30년, 기준소득월액 600만
  // 지급률 = 30 × 1.7% = 51%
  // 세전 월연금 = 6,000,000 × 0.51 = 3,060,000
  it('시나리오1: 대령 30년 복무, 기준소득 600만 → 세전 약 306만', () => {
    const result = calcMilitaryPension({
      birthDate: '1970-01-01',
      retirementDate: '2024-01-01',
      rank: '대령',
      serviceYears: 30,
      serviceMonths: 0,
      avgBaseMonthlySalary: 6_000_000,
    })
    expect(result.monthlyPension).toBe(3_060_000)
    expect(result.afterTaxMonthly).toBeGreaterThan(2_500_000)
    expect(result.afterTaxMonthly).toBeLessThan(3_060_001)
  })

  // 시나리오 2: 중령 25년, 기준소득월액 500만
  // 지급률 = 25 × 1.7% = 42.5%
  // 세전 월연금 = 5,000,000 × 0.425 = 2,125,000
  it('시나리오2: 중령 25년 복무, 기준소득 500만 → 세전 약 212.5만', () => {
    const result = calcMilitaryPension({
      birthDate: '1975-01-01',
      retirementDate: '2024-01-01',
      rank: '중령',
      serviceYears: 25,
      serviceMonths: 0,
      avgBaseMonthlySalary: 5_000_000,
    })
    expect(result.monthlyPension).toBe(2_125_000)
    expect(result.afterTaxMonthly).toBeGreaterThan(1_900_000)
  })

  // 시나리오 3: 소령 20년 조기전역, 기준소득 420만
  // 지급률 = 20 × 1.7% = 34%
  // 감액 후 = 34% × (1 - 5%) = 32.3%
  // 세전 월연금 = 4,200,000 × 0.323 = 1,356,600
  it('시나리오3: 소령 20년 조기전역, 기준소득 420만 → 5% 감액 적용', () => {
    const result = calcMilitaryPension({
      birthDate: '1980-01-01',
      retirementDate: '2024-01-01',
      rank: '소령',
      serviceYears: 20,
      serviceMonths: 0,
      avgBaseMonthlySalary: 4_200_000,
      earlyRetirement: true,
    })
    const expectedGross = Math.round(4_200_000 * 0.34 * 0.95)
    expect(result.monthlyPension).toBe(expectedGross)
    expect(result.afterTaxMonthly).toBeLessThan(expectedGross)
  })

  // 시나리오 4: 대위 20년, 기준소득 380만
  // 지급률 = 34%
  // 세전 월연금 = 3,800,000 × 0.34 = 1,292,000
  it('시나리오4: 대위 20년 복무, 기준소득 380만 → 세전 129.2만', () => {
    const result = calcMilitaryPension({
      birthDate: '1985-01-01',
      retirementDate: '2024-01-01',
      rank: '대위',
      serviceYears: 20,
      serviceMonths: 0,
      avgBaseMonthlySalary: 3_800_000,
    })
    expect(result.monthlyPension).toBe(1_292_000)
  })

  // 시나리오 5: 장성급 35년, 지급률 상한(35×1.7%=59.5%, 상한 미달)
  // 세전 월연금 = 9,000,000 × 0.595 = 5,355,000
  it('시나리오5: 장성급 35년 복무, 기준소득 900만 → 지급률 59.5%', () => {
    const result = calcMilitaryPension({
      birthDate: '1965-01-01',
      retirementDate: '2024-01-01',
      rank: '장성급',
      serviceYears: 35,
      serviceMonths: 0,
      avgBaseMonthlySalary: 9_000_000,
    })
    expect(result.monthlyPension).toBe(5_355_000)
    expect(result.paymentRate).toBeCloseTo(59.5, 1)
    expect(result.afterTaxMonthly).toBeGreaterThan(0)
    expect(result.afterTaxMonthly).toBeLessThan(result.monthlyPension)
  })
})

describe('calcMilitaryPension — 계산 결과 구조 검증', () => {
  const baseInput = {
    birthDate: '1970-01-01',
    retirementDate: '2024-01-01',
    rank: '대령' as const,
    serviceYears: 30,
    serviceMonths: 0,
    avgBaseMonthlySalary: 6_000_000,
  }

  it('인플레이션 프로젝션: 11개 항목(현재+10년)', () => {
    const result = calcMilitaryPension(baseInput)
    expect(result.inflationAdjustedProjection).toHaveLength(11)
  })

  it('명목 수령액은 실질 수령액보다 크거나 같다', () => {
    const result = calcMilitaryPension(baseInput)
    result.inflationAdjustedProjection.forEach((entry) => {
      expect(entry.nominalAmount).toBeGreaterThanOrEqual(entry.realAmount)
    })
  })

  it('계산 근거 버전이 포함됨', () => {
    const result = calcMilitaryPension(baseInput)
    expect(result.calculationBasis.ruleVersion).toBe('2026-01')
    expect(result.calculationBasis.basisNote.length).toBeGreaterThan(0)
  })

  it('20년 미만 복무 시 에러 발생', () => {
    expect(() =>
      calcMilitaryPension({ ...baseInput, serviceYears: 15 })
    ).toThrow()
  })
})

describe('calcPensionTax', () => {
  it('연금 0원 → 세금 0', () => {
    const result = calcPensionTax(0)
    expect(result.totalTax).toBe(0)
    expect(result.effectiveTaxRate).toBe(0)
  })

  it('세후 연간 수령액 = 세전 - 총세금', () => {
    const annual = 36_000_000
    const result = calcPensionTax(annual)
    expect(result.afterTaxAnnual).toBe(annual - result.totalTax)
  })

  it('지방소득세 = 소득세의 10%', () => {
    const result = calcPensionTax(36_000_000)
    expect(result.localTax).toBe(Math.round(result.incomeTax * 0.1))
  })

  it('연금소득공제 적용 후 과세표준 < 총연금액', () => {
    const result = calcPensionTax(36_000_000)
    expect(result.taxableIncome).toBeLessThan(result.grossIncome)
    expect(result.pensionDeduction).toBeGreaterThan(0)
  })
})
