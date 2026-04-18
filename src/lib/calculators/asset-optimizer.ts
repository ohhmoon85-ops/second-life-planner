/**
 * 주택연금 + IRP 조합 최적화 계산기
 *
 * 주택연금: 한국주택금융공사 (HF) 역모기지 상품
 * IRP: 개인형 퇴직연금 (세액공제 + 연금 수령)
 */

// 주택연금 월 지급금 추정 (2026년 기준 지급률 테이블 단순화)
// 실제는 HF 공시 지급률표 사용. 여기서는 연령·주택가격별 월 지급금을 추정
// 출처: 주택금융공사 홈페이지 공시 지급률 (2024년 기준 보정)
const HOUSING_PENSION_RATE: Record<number, number> = {
  55: 0.00180, // 55세: 주택가격 × 0.18%/월
  60: 0.00210,
  65: 0.00255,
  70: 0.00318,
  75: 0.00408,
  80: 0.00540,
}

function getHousingPensionRate(age: number): number {
  const ages = Object.keys(HOUSING_PENSION_RATE).map(Number).sort((a, b) => a - b)
  // 가장 가까운 나이 기준 적용
  let rate = HOUSING_PENSION_RATE[ages[0]]
  for (const a of ages) {
    if (age >= a) rate = HOUSING_PENSION_RATE[a]
  }
  return rate
}

// IRP 세액공제 (소득세법 §59의3)
const IRP_DEDUCTION_LIMIT = 9_000_000          // 연간 납입 한도 (연금저축 포함)
const IRP_TAX_CREDIT_RATE_NORMAL = 0.12         // 종합소득 4,500만원 이하: 16.5%, 초과: 13.2%
const IRP_TAX_CREDIT_RATE_HIGH = 0.132

// IRP 연금 수령 시 분리과세율
const IRP_PENSION_RATE_UNDER70 = 0.05           // 70세 미만: 5%
const IRP_PENSION_RATE_70_79 = 0.04             // 70~79세: 4%
const IRP_PENSION_RATE_OVER80 = 0.03            // 80세 이상: 3%

function getIrpPensionRate(age: number): number {
  if (age >= 80) return IRP_PENSION_RATE_OVER80
  if (age >= 70) return IRP_PENSION_RATE_70_79
  return IRP_PENSION_RATE_UNDER70
}

export interface AssetOptimizerInput {
  currentAge: number                 // 현재 나이
  retirementAge: number              // 은퇴 예정 나이 (IRP 납입 종료)
  housingPrice: number               // 주택 공시가격 (원)
  irpBalance: number                 // 현재 IRP 잔액 (원)
  irpAnnualContribution: number      // 연간 IRP 납입액 (원)
  annualReturnRate?: number          // IRP 운용 수익률 가정 (기본 4%)
  annualPensionIncome: number        // 기타 연간 소득 (군인연금 등, 건보료 계산용)
}

export interface AssetOptimizerResult {
  housingPension: {
    monthlyPayment: number           // 주택연금 월 지급금 (추정)
    annualPayment: number
    appliedRate: number              // 적용 지급률
    notes: string[]
  }
  irp: {
    estimatedBalance: number         // 은퇴 시점 IRP 잔액 (복리 추정)
    annualTaxCredit: number          // 연간 세액공제액
    totalTaxSaving: number           // 은퇴까지 누적 세액공제
    monthlyPension: number           // IRP 연금화 시 월 수령액 (20년 분할)
    annualPension: number
    pensionTaxRate: number           // 수령 시 분리과세율
    notes: string[]
  }
  combined: {
    totalMonthly: number             // 주택연금 + IRP 월 합계
    totalAnnual: number
    healthInsuranceImpact: string    // 건보료 영향 요약
  }
  recommendation: string
}

export function calcAssetOptimizer(input: AssetOptimizerInput): AssetOptimizerResult {
  const {
    currentAge,
    retirementAge,
    housingPrice,
    irpBalance,
    irpAnnualContribution,
    annualReturnRate = 0.04,
    annualPensionIncome,
  } = input

  const yearsToRetire = Math.max(0, retirementAge - currentAge)

  // ── 주택연금 ─────────────────────────────────────────────
  const housingRate = getHousingPensionRate(retirementAge)
  const monthlyHousing = Math.round(housingPrice * housingRate)
  const housingNotes = [
    `${retirementAge}세 기준 지급률 ${(housingRate * 100).toFixed(3)}%/월 적용`,
    '주택 가격 하락 시 지급금 감소 없음 (HF 보증)',
    '배우자 사망 후에도 종신 지급 유지',
    '실제 가입은 한국주택금융공사(HF)에 신청 필요',
  ]

  // ── IRP ──────────────────────────────────────────────────
  // 은퇴까지 복리 운용
  let irpProjected = irpBalance
  for (let y = 0; y < yearsToRetire; y++) {
    irpProjected = irpProjected * (1 + annualReturnRate) + irpAnnualContribution
  }
  irpProjected = Math.round(irpProjected)

  // 세액공제
  const effectiveContrib = Math.min(irpAnnualContribution, IRP_DEDUCTION_LIMIT)
  const taxCreditRate = annualPensionIncome <= 45_000_000
    ? IRP_TAX_CREDIT_RATE_NORMAL
    : IRP_TAX_CREDIT_RATE_HIGH
  const annualTaxCredit = Math.round(effectiveContrib * taxCreditRate * (1 + 0.1)) // 지방소득세 포함
  const totalTaxSaving = annualTaxCredit * yearsToRetire

  // 연금 수령 (20년 분할, 복리 유지 가정)
  const irpPensionYears = 20
  const pensionRate = getIrpPensionRate(retirementAge)
  const monthlyIrp = Math.round(irpProjected / (irpPensionYears * 12))
  const irpNotes = [
    `은퇴 시점(${retirementAge}세) 추정 잔액: ${irpProjected.toLocaleString('ko-KR')}원`,
    `연간 납입액 최대 ${IRP_DEDUCTION_LIMIT.toLocaleString('ko-KR')}원까지 세액공제 (${(taxCreditRate * 110).toFixed(0)}%)`,
    `연금 수령 시 ${retirementAge}세 기준 ${(pensionRate * 100).toFixed(0)}% 분리과세 (종합과세 배제)`,
    `20년 분할 수령 가정, 실제 수령 기간 조정 가능`,
  ]

  // ── 건보료 영향 ───────────────────────────────────────────
  const totalAnnual = (monthlyHousing + monthlyIrp) * 12
  const totalWithPension = annualPensionIncome + totalAnnual
  const healthImpact = totalWithPension > 20_000_000
    ? `주택연금·IRP 합산 후 연간 ${(totalWithPension / 10000).toFixed(0)}만원으로 피부양자 기준(2,000만원) 초과 가능성 있음`
    : `주택연금·IRP 합산 후에도 연간 ${(totalWithPension / 10000).toFixed(0)}만원으로 피부양자 기준 충족`

  const recommendation = [
    `주택연금 월 ${monthlyHousing.toLocaleString('ko-KR')}원 + IRP 월 ${monthlyIrp.toLocaleString('ko-KR')}원 = 월 ${(monthlyHousing + monthlyIrp).toLocaleString('ko-KR')}원 추가 수입`,
    yearsToRetire > 0
      ? `은퇴까지 ${yearsToRetire}년간 IRP 연간 납입으로 세액공제 총 ${totalTaxSaving.toLocaleString('ko-KR')}원 절약`
      : 'IRP 납입 기간이 0년입니다.',
    '주택연금은 피부양자 소득 계산에 포함되지 않음 (역모기지 → 대출 성격)',
  ].join(' ')

  return {
    housingPension: {
      monthlyPayment: monthlyHousing,
      annualPayment: monthlyHousing * 12,
      appliedRate: housingRate,
      notes: housingNotes,
    },
    irp: {
      estimatedBalance: irpProjected,
      annualTaxCredit,
      totalTaxSaving,
      monthlyPension: monthlyIrp,
      annualPension: monthlyIrp * 12,
      pensionTaxRate: pensionRate,
      notes: irpNotes,
    },
    combined: {
      totalMonthly: monthlyHousing + monthlyIrp,
      totalAnnual: (monthlyHousing + monthlyIrp) * 12,
      healthInsuranceImpact: healthImpact,
    },
    recommendation,
  }
}
