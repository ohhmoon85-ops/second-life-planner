import { PENSION_SUSPENSION_RULES_2026, calcPensionSuspension } from '@/lib/constants/pension-suspension-rules'
import { HEALTH_INSURANCE_RULES_2026 } from '@/lib/constants/health-insurance-rules'
import { calcHealthInsurance } from '@/lib/calculators/health-insurance'
import type { ReemploymentInput, ReemploymentResult, ReemploymentScenario } from '@/lib/types/health-insurance'

const R = HEALTH_INSURANCE_RULES_2026
const SR = PENSION_SUSPENSION_RULES_2026

/**
 * 재취업 유형별 시나리오 계산
 * 공무원·공공기관·사립학교 → 군인연금 일부 정지
 * 민간·자영업 → 연금 정지 없음
 */
export function calcReemploymentScenarios(input: ReemploymentInput): ReemploymentResult {
  const types = Object.keys(SR.SUSPENSION_BY_TYPE) as Array<keyof typeof SR.SUSPENSION_BY_TYPE>

  // 재취업 없이 연금만 받는 기준 케이스
  const baseHealthResult = calcHealthInsurance({
    monthlyMilitaryPension: input.monthlyMilitaryPension,
    prevMonthlySalary: input.prevMonthlySalary,
    yearsOfInsuredEmployment: 240, // 20년 이상 가정 → 임의계속가입 가능
    propertyTaxBase: input.propertyTaxBase,
    hasSpouseWithInsurance: false,
  })
  const baseHealthPremium = baseHealthResult.options.find(o => o.available && o.totalMonthly > 0)?.totalMonthly ?? 0

  const scenarios: ReemploymentScenario[] = types.map((type) => {
    const suspended = SR.SUSPENSION_BY_TYPE[type]

    // 연금 정지액
    const pensionSuspension = suspended
      ? calcPensionSuspension(
          input.monthlyMilitaryPension,
          input.newMonthlySalary,
          input.prevMonthlySalary
        )
      : 0

    const netMonthlyPension = input.monthlyMilitaryPension - pensionSuspension

    // 재취업 후 건보료 (직장가입자 전환)
    let healthPremium = 0
    let ltciPremium = 0

    if (type === '자영업') {
      // 자영업: 지역가입자로 잔류 (소득 증가분 반영)
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
      // 직장가입자: 보수월액 × 7.09% ÷ 2 (본인 50%)
      healthPremium = Math.round((input.newMonthlySalary * R.EMPLOYEE_RATE) / 2)
      ltciPremium = Math.round(healthPremium * R.LTCI_RATE)
    }

    const salary = type === '무직' ? 0 : input.newMonthlySalary
    const totalMonthlyIncome = netMonthlyPension + salary - healthPremium - ltciPremium

    const notes: string[] = []
    if (suspended && pensionSuspension > 0) {
      notes.push(`군인연금법 제33조: 월 ${pensionSuspension.toLocaleString('ko-KR')}원 정지`)
      notes.push(`실 수령 연금: ${netMonthlyPension.toLocaleString('ko-KR')}원/월`)
    } else if (suspended && pensionSuspension === 0) {
      notes.push('재취업 보수가 퇴직 전 기준소득 이하 → 연금 정지 없음')
    } else {
      notes.push('민간·자영업 재취업 시 군인연금 정지 없음')
    }
    if (type === '자영업') {
      notes.push('사업소득 발생 시 건보 피부양자 자격 즉시 상실')
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

  // 순소득 기준 최적/최악 시나리오
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
