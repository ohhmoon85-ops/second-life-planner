export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calcReemploymentScenarios } from '@/lib/calculators/reemployment'

const schema = z.object({
  monthlyMilitaryPension: z.number().int().min(0),
  prevMonthlySalary: z.number().int().min(0),
  newMonthlySalary: z.number().int().min(0),
  propertyTaxBase: z.number().int().min(0).optional(),
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
    const result = calcReemploymentScenarios(parsed.data)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : '계산 오류'
    return NextResponse.json({ message }, { status: 400 })
  }
}
