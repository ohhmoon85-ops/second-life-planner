import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calcPensionPortfolio } from '@/lib/calculators/other-pensions'

const pensionBase = z.object({
  avgMonthlyIncome: z.number().int().min(0),
  serviceYears: z.number().int().min(0),
  serviceMonths: z.number().int().min(0).max(11).optional(),
})

const schema = z.object({
  civilServant: pensionBase.optional(),
  privateSchool: pensionBase.optional(),
  national: z.object({
    avgMonthlyIncome: z.number().int().min(0),
    contributionMonths: z.number().int().min(0),
  }).optional(),
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
    return NextResponse.json(calcPensionPortfolio(parsed.data))
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : '계산 오류' }, { status: 400 })
  }
}
