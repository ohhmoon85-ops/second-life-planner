export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })

const schema = z.object({
  // 군인연금
  monthlyMilitaryPension: z.number().int().min(0),
  serviceYears: z.number().int().min(0),
  rank: z.string().optional(),

  // 건보료 결과 요약
  healthInsuranceOption: z.enum(['피부양자', '지역가입자', '임의계속가입']),
  monthlyHealthPremium: z.number().int().min(0),
  annualSaving: z.number().int().min(0),

  // 재취업 시나리오 베스트
  bestReemploymentType: z.string().optional(),
  bestReemploymentIncome: z.number().int().min(0).optional(),

  // 자산 정보
  housingPrice: z.number().int().min(0).optional(),
  irpBalance: z.number().int().min(0).optional(),

  // 사용자 기본 정보
  currentAge: z.number().int().min(40).max(80),
  targetMonthlyIncome: z.number().int().min(0).optional(),
})

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ message: 'AI 리포트 기능이 설정되지 않았습니다.' }, { status: 503 })
  }

  let body: unknown
  try { body = await request.json() }
  catch { return NextResponse.json({ message: '잘못된 요청 형식' }, { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
  }

  const d = parsed.data

  const prompt = `당신은 공직자(군인·공무원·교사) 퇴직자 전문 은퇴 설계 전문가입니다.
아래 데이터를 바탕으로 맞춤형 은퇴 설계 리포트를 한국어로 작성하세요.

## 입력 데이터
- 현재 나이: ${d.currentAge}세
- 공적연금 월 수령액: ${d.monthlyMilitaryPension.toLocaleString('ko-KR')}원
- 복무연수: ${d.serviceYears}년${d.rank ? ` / 최종 계급: ${d.rank}` : ''}
- 최적 건보료 옵션: ${d.healthInsuranceOption} (월 ${d.monthlyHealthPremium.toLocaleString('ko-KR')}원)
- 건보료 최적화 연간 절약액: ${d.annualSaving.toLocaleString('ko-KR')}원
${d.bestReemploymentType ? `- 최적 재취업 시나리오: ${d.bestReemploymentType} (월 실수령 ${d.bestReemploymentIncome?.toLocaleString('ko-KR')}원)` : ''}
${d.housingPrice ? `- 주택 공시가격: ${d.housingPrice.toLocaleString('ko-KR')}원` : ''}
${d.irpBalance ? `- IRP 잔액: ${d.irpBalance.toLocaleString('ko-KR')}원` : ''}
${d.targetMonthlyIncome ? `- 목표 월 생활비: ${d.targetMonthlyIncome.toLocaleString('ko-KR')}원` : ''}

## 리포트 구성 (각 섹션을 상세하게 작성)

### 1. 현황 진단 (2페이지 분량)
- 현재 재정 상태 요약
- 퇴직 후 소득 구조 분석
- 위험 요소 및 기회 요소

### 2. 건강보험료 전략 (3페이지)
- ${d.healthInsuranceOption} 선택의 근거
- 피부양자 자격 유지를 위한 소득 관리 방법
- 건보료 절약을 위한 단계별 행동 계획
- 배우자 건보료 연계 전략

### 3. 재취업 전략 (3페이지)
${d.bestReemploymentType
  ? `- ${d.bestReemploymentType} 재취업의 장단점 분석
- 공적연금 감액 최소화 방법
- 재취업 준비 로드맵 (6개월~1년)`
  : '- 재취업 없이 수입 다각화 방법\n- 자격증·강의·컨설팅 등 수입 창출 방안'}

### 4. 자산 운용 전략 (4페이지)
${d.housingPrice ? `- 주택연금 가입 시 월 수령액 및 타이밍 조언` : '- 부동산 자산 활용 방안'}
${d.irpBalance ? `- IRP 납입 극대화 및 수령 전략` : '- IRP 신규 가입 권장 사항'}
- 분리과세 vs 종합과세 선택 전략

### 5. 5년 로드맵 (3페이지)
- 연도별 재정 목표 및 실행 계획
- 목표 월 생활비 달성 시나리오
- 법령 변경 모니터링 포인트

### 6. 결론 및 핵심 실행 과제 (1페이지)
- 지금 당장 해야 할 3가지
- 6개월 내 완료할 과제
- 전문가 상담 필요 항목

실용적이고 구체적인 수치와 법적 근거를 포함하여 작성하세요. 마크다운 형식으로 작성하되, 각 섹션을 ## 헤더로 구분하고 핵심 수치는 **굵게** 표시하세요.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text' || !('text' in content)) {
      return NextResponse.json({ message: '리포트 생성 실패' }, { status: 500 })
    }

    return NextResponse.json({
      report: (content as { type: 'text'; text: string }).text,
      generatedAt: new Date().toISOString(),
      inputSummary: {
        age: d.currentAge,
        monthlyPension: d.monthlyMilitaryPension,
        recommendation: d.healthInsuranceOption,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI 리포트 생성 오류'
    return NextResponse.json({ message }, { status: 500 })
  }
}
