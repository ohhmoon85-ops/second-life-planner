export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calcAssetOptimizer } from '@/lib/calculators/asset-optimizer'

const schema = z.object({
  currentAge: z.number().int().min(40).max(90),
  retirementAge: z.number().int().min(50).max(90),
  housingPrice: z.number().int().min(0),
  irpBalance: z.number().int().min(0),
  irpAnnualContribution: z.number().int().min(0),
  annualReturnRate: z.number().min(0).max(0.2).optional(),
  annualPensionIncome: z.number().int().min(0),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() }
  catch { return NextResponse.json({ message: '잘못된 요청 형식' }, { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
  }

  if (parsed.data.retirementAge <= parsed.data.currentAge) {
    return NextResponse.json({ message: '은퇴 예정 나이가 현재 나이보다 커야 합니다.' }, { status: 400 })
  }

  try {
    return NextResponse.json(calcAssetOptimizer(parsed.data))
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : '계산 오류' }, { status: 400 })
  }
}
