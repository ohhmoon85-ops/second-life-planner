import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calcHealthInsurance } from '@/lib/calculators/health-insurance'

const schema = z.object({
  monthlyMilitaryPension: z.number().int().min(0),
  annualRentalIncome: z.number().int().min(0).optional(),
  annualFinancialIncome: z.number().int().min(0).optional(),
  annualBusinessIncome: z.number().int().min(0).optional(),
  propertyTaxBase: z.number().int().min(0).optional(),
  hasSpouseWithInsurance: z.boolean().optional(),
  spouseMonthlyPension: z.number().int().min(0).optional(),
  spouseAnnualOtherIncome: z.number().int().min(0).optional(),
  spousePropertyTaxBase: z.number().int().min(0).optional(),
  prevMonthlySalary: z.number().int().min(0),
  yearsOfInsuredEmployment: z.number().int().min(0),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() }
  catch { return NextResponse.json({ message: '잘못된 요청 형식' }, { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
  }

  try {
    const result = calcHealthInsurance(parsed.data)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : '계산 오류'
    return NextResponse.json({ message }, { status: 400 })
  }
}
