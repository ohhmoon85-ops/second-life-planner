import { PENSION_SUSPENSION_RULES_2026, calcPensionSuspension } from '@/lib/constants/pension-suspension-rules'
import { HEALTH_INSURANCE_RULES_2026 } from '@/lib/constants/health-insurance-rules'
import { calcHealthInsurance } from '@/lib/calculators/health-insurance'
import type { ReemploymentInput, ReemploymentResult, ReemploymentScenario } from '@/lib/types/health-insurance'

const R = HEALTH_INSURANCE_RULES_2026
const SR = PENSION_SUSPENSION_RULES_2026

export function calcReemploymentScenarios(input: ReemploymentInput): ReemploymentResult {
  const types = Object.keys(SR.SUSPENSION_MODE) as Array<keyof typeof SR.SUSPENSION_MODE>

  // 재취업 없이 연금만 수령하는 기준 케이스
  const baseHealthResult = calcHealthInsurance({
    monthlyMilitaryPension: input.monthlyMilitaryPension,
    prevMonthlySalary: input.prevMonthlySalary,
    yearsOfInsuredEmployment: 240,
    propertyTaxBase: input.propertyTaxBase,
    hasSpouseWithInsurance: false,
  })
  const baseHealthPremium =
    baseHealthResult.options.find(o => o.available && o.totalMonthly > 0)?.totalMonthly ?? 0

  const scenarios: ReemploymentScenario[] = types.map((type) => {
    const mode = SR.SUSPENSION_MODE[type]

    const pensionSuspension = calcPensionSuspension(
      type,
      input.monthlyMilitaryPension,
      input.newMonthlySalary,
      input.prevMonthlySalary
    )

    const netMonthlyPension = input.monthlyMilitaryPension - pensionSuspension

    let healthPremium = 0
    let ltciPremium = 0

    if (type === '자영업') {
      const hiResult = calcHealthInsurance({
        monthlyMilitaryPension: input.monthlyMilitaryPension,
        annualBusinessIncome: input.newMonthlySalary * 12,
        prevMonthlySalary: input.prevMonthlySalary,
        yearsOfInsuredEmployment: 240,
        propertyTaxBase: input.propertyTaxBase,
        hasSpouseWithInsurance: false,
      })
      const regionOption = hiResult.options.find(o => o.type === '지역가입자')
      healthPremium = regionOption?.monthlyPremium ?? 0
      ltciPremium = regionOption?.ltciPremium ?? 0
    } else if (type === '무직') {
      healthPremium = baseHealthPremium
      ltciPremium = 0
    } else {
      // 직장가입자: 보수월액 × 7.09% ÷ 2
      healthPremium = Math.round((input.newMonthlySalary * R.EMPLOYEE_RATE) / 2)
      ltciPremium = Math.round(healthPremium * R.LTCI_RATE)
    }

    const salary = type === '무직' ? 0 : input.newMonthlySalary
    const totalMonthlyIncome = netMonthlyPension + salary - healthPremium - ltciPremium

    const notes: string[] = []

    if (mode === 'full') {
      notes.push('공무원 재임용 시 재직 기간 중 군인연금 전액 정지 (군인연금법 §33①)')
      notes.push('퇴직 후 다시 수령 재개')
    } else if (mode === 'excess') {
      if (pensionSuspension > 0) {
        notes.push(`연금+보수(${(netMonthlyPension + salary).toLocaleString('ko-KR')}원)가 퇴직전소득 160%(${Math.round(input.prevMonthlySalary * 1.6).toLocaleString('ko-KR')}원) 초과`)
        notes.push(`월 ${pensionSuspension.toLocaleString('ko-KR')}원 정지 → 실 수령 ${netMonthlyPension.toLocaleString('ko-KR')}원`)
      } else {
        notes.push('연금+보수가 퇴직전소득 160% 이하 → 연금 정지 없음')
      }
    } else if (mode === 'income') {
      if (pensionSuspension > 0) {
        notes.push(`보수월액이 퇴직전소득 초과 → 소득구간별 ${Math.round(pensionSuspension / (input.newMonthlySalary - input.prevMonthlySalary) * 100)}% 부분 정지`)
        notes.push(`월 ${pensionSuspension.toLocaleString('ko-KR')}원 정지 → 실 수령 ${netMonthlyPension.toLocaleString('ko-KR')}원`)
      } else {
        notes.push('보수월액이 퇴직전 기준소득 이하 → 연금 정지 없음')
      }
    } else {
      notes.push('민간·자영업 재취업 시 군인연금 정지 없음')
    }

    if (type === '자영업') {
      notes.push('사업소득 발생 시 건보 피부양자 자격 즉시 상실 → 지역가입자 전환')
    }
    if (type === '공무원') {
      notes.push('공무원연금 가입 → 향후 공무원연금 별도 수령 가능')
    }

    return {
      type,
      newMonthlySalary: salary,
      pensionSuspension,
      netMonthlyPension,
      healthPremium,
      ltciPremium,
      totalMonthlyIncome,
      annualIncome: totalMonthlyIncome * 12,
      notes,
    }
  })

  const sorted = [...scenarios].sort((a, b) => b.totalMonthlyIncome - a.totalMonthlyIncome)

  return {
    baseScenario: {
      monthlyPension: input.monthlyMilitaryPension,
      healthPremium: baseHealthPremium,
      totalMonthly: input.monthlyMilitaryPension - baseHealthPremium,
    },
    scenarios,
    bestScenario: sorted[0].type,
    worstScenario: sorted[sorted.length - 1].type,
  }
}
