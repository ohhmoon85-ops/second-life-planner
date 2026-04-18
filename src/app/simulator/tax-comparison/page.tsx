'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { TaxComparisonResult } from '@/lib/calculators/tax-comparison'

const schema = z.object({
  annualMilitaryPension: z.number({ invalid_type_error: '연간 연금액을 입력하세요' }).int().min(1_000_000),
  annualOtherIncome: z.number().int().min(0).optional(),
  personalDeductions: z.number().int().min(0).optional(),
})
type FormValues = z.infer<typeof schema>

const fmt = (n: number) => n.toLocaleString('ko-KR')
const wan = (n: number) => `${(n / 10000).toFixed(0)}만원`

export default function TaxComparisonPage() {
  const [result, setResult] = useState<TaxComparisonResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { personalDeductions: 1_500_000 },
  })

  function handleMoneyInput(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '')
      const num = parseInt(raw, 10)
      setValue(field, isNaN(num) ? (0 as never) : (num as never), { shouldValidate: true })
      e.target.value = isNaN(num) || num === 0 ? '' : num.toLocaleString('ko-KR')
    }
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true); setError(null)
    try {
      const res = await fetch('/api/calculate/tax-comparison', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { setError((await res.json()).message); return }
      setResult(await res.json())
    } catch { setError('네트워크 오류') }
    finally { setIsLoading(false) }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">분리과세 vs 종합과세 비교</h1>
          <p className="text-primary-200 text-base">군인연금 수령 시 납부세액 최적화 전략</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 안내 박스 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p className="font-medium">군인연금(공적연금)은 원칙적으로 종합과세 의무</p>
            <p>단, 다른 소득이 없고 연금소득만 있으면 원천징수(5%)로 확정신고 면제 가능 (소득세법 §73①4호)</p>
            <p>이 계산기는 두 방식의 세부담 차이를 비교해 드립니다.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <h2 className="text-base font-semibold text-primary">소득 정보 입력</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  군인연금 연간 수령액 (원) <span className="text-danger">*</span>
                </label>
                <input type="text" inputMode="numeric" placeholder="예: 36,000,000"
                  className={inputCls(!!errors.annualMilitaryPension)}
                  onChange={handleMoneyInput('annualMilitaryPension')} />
                {errors.annualMilitaryPension && (
                  <p className="mt-1 text-xs text-danger">{errors.annualMilitaryPension.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  기타 합산 소득 (연, 원)
                </label>
                <input type="text" inputMode="numeric" placeholder="임대·금융 등, 없으면 빈칸"
                  className={inputCls(false)}
                  onChange={handleMoneyInput('annualOtherIncome')} />
                <p className="mt-1 text-xs text-gray-400">근로·사업·임대·금융소득 합계</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  인적공제 합계 (원)
                </label>
                <input type="text" inputMode="numeric" placeholder="기본 1,500,000"
                  defaultValue="1,500,000"
                  className={inputCls(false)}
                  onChange={handleMoneyInput('personalDeductions')} />
                <p className="mt-1 text-xs text-gray-400">본인 150만 + 부양가족 1인당 150만</p>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full h-14 bg-accent hover:bg-orange-700 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />계산 중...</> : '세금 비교 계산'}
            </button>
          </div>
        </form>

        {error && <div className="p-4 bg-red-50 border border-danger/30 rounded-lg text-danger">⚠ {error}</div>}

        {result && (
          <div className="space-y-4">
            {/* 추천 배너 */}
            <div className={cn('rounded-lg p-5',
              result.recommendation === '분리과세(원천징수 유지)'
                ? 'bg-success/10 border border-success/30'
                : 'bg-blue-50 border border-blue-200')}>
              <p className={cn('font-bold text-lg mb-1',
                result.recommendation === '분리과세(원천징수 유지)' ? 'text-success' : 'text-blue-700')}>
                추천: {result.recommendation}
              </p>
              <p className="text-sm text-gray-700">{result.recommendationReason}</p>
              {result.saving > 0 && (
                <p className="mt-2 font-bold text-success">
                  분리과세 유지 시 연간 {fmt(result.saving)}원 절약
                </p>
              )}
            </div>

            {/* 비교 테이블 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">항목</th>
                    <th className="px-4 py-3 text-right font-semibold text-primary">종합과세</th>
                    <th className="px-4 py-3 text-right font-semibold text-accent">원천징수 유지</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <TaxRow label="총 소득" a={result.comprehensive.grossIncome} b={result.comprehensive.grossIncome} />
                  <TaxRow label="연금소득공제" a={result.comprehensive.pensionDeduction} b={0} note="종합과세만 공제 적용" />
                  <TaxRow label="인적공제" a={result.comprehensive.otherDeductions} b={0} />
                  <TaxRow label="과세표준" a={result.comprehensive.taxableIncome} b={result.comprehensive.grossIncome} />
                  <TaxRow label="소득세" a={result.comprehensive.incomeTax} b={result.separateWithholding.pensionTax + result.separateWithholding.otherIncomeTax} highlight />
                  <TaxRow label="지방소득세" a={result.comprehensive.localTax} b={result.separateWithholding.pensionLocalTax + result.separateWithholding.otherLocalTax} />
                  <TaxRow label="총 세금" a={result.comprehensive.totalTax} b={result.separateWithholding.totalTax} highlight bold />
                  <TaxRow label="세후 연간 수령액" a={result.comprehensive.afterTaxAnnual} b={result.separateWithholding.afterTaxAnnual} positive />
                  <tr>
                    <td className="px-4 py-2 text-gray-500">실효세율</td>
                    <td className="px-4 py-2 text-right font-medium">{result.comprehensive.effectiveRate}%</td>
                    <td className="px-4 py-2 text-right font-medium">{result.separateWithholding.effectiveRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 주의사항 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-700 mb-1">주의사항</p>
              <p className="text-sm text-amber-600">{result.separateWithholding.note}</p>
              <p className="text-xs text-amber-500 mt-1">이 계산은 참고용입니다. 정확한 세금 최적화는 세무사 상담을 권장합니다.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function TaxRow({ label, a, b, highlight, bold, positive, note }: {
  label: string; a: number; b: number
  highlight?: boolean; bold?: boolean; positive?: boolean; note?: string
}) {
  const cls = cn('px-4 py-2',
    highlight ? 'bg-gray-50' : '',
    bold ? 'font-semibold' : '',
    positive ? 'text-success' : '')
  return (
    <tr>
      <td className={cn(cls, 'text-gray-700')}>
        {label}
        {note && <span className="ml-1 text-xs text-gray-400">({note})</span>}
      </td>
      <td className={cn(cls, 'text-right')}>{fmt(a)}원</td>
      <td className={cn(cls, 'text-right')}>{fmt(b)}원</td>
    </tr>
  )
}

function inputCls(hasError: boolean) {
  return cn('block w-full h-12 rounded-lg border px-3 text-base',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    hasError ? 'border-danger bg-red-50' : 'border-gray-300')
}
