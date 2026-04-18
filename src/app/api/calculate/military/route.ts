export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calcMilitaryPension } from '@/lib/calculators/military-pension'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { calculations } from '@/lib/db/schema'

const inputSchema = z.object({
  birthDate: z.string().min(1),
  retirementDate: z.string().min(1),
  rank: z.enum(['대위', '소령', '중령', '대령', '장성급']),
  serviceYears: z.number().int().min(20).max(40),
  serviceMonths: z.number().int().min(0).max(11),
  avgBaseMonthlySalary: z.number().int().min(1_000_000).max(20_000_000),
  combatYears: z.number().int().min(0).max(30).optional(),
  earlyRetirement: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    const messages = parsed.error.errors.map((e) => e.message).join(', ')
    return NextResponse.json({ message: `입력값 오류: ${messages}` }, { status: 400 })
  }

  try {
    const result = calcMilitaryPension(parsed.data)

    // 로그인된 사용자라면 계산 결과 저장 (실패해도 응답에는 영향 없음)
    const session = await auth()
    if (session?.user?.id) {
      await db.insert(calculations).values({
        userId: session.user.id,
        type: 'military',
        input: parsed.data,
        result,
      }).catch(() => {})
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : '계산 오류가 발생했습니다.'
    return NextResponse.json({ message }, { status: 400 })
  }
}
