export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calcTaxComparison } from '@/lib/calculators/tax-comparison'

const schema = z.object({
  annualMilitaryPension: z.number().int().min(0),
  annualOtherIncome: z.number().int().min(0).optional(),
  personalDeductions: z.number().int().min(0).optional(),
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
    return NextResponse.json(calcTaxComparison(parsed.data))
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : '계산 오류' }, { status: 400 })
  }
}
