'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Home, PiggyBank, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { AssetOptimizerResult } from '@/lib/calculators/asset-optimizer'

const schema = z.object({
  currentAge: z.number({ invalid_type_error: '현재 나이 입력' }).int().min(40).max(89),
  retirementAge: z.number({ invalid_type_error: '은퇴 나이 입력' }).int().min(50).max(90),
  housingPrice: z.number({ invalid_type_error: '주택 공시가격 입력' }).int().min(0),
  irpBalance: z.number().int().min(0),
  irpAnnualContribution: z.number().int().min(0),
  annualReturnRate: z.number().min(0).max(20),
  annualPensionIncome: z.number({ invalid_type_error: '공적연금 연액 입력' }).int().min(0),
})
type FormValues = z.infer<typeof schema>

const fmt = (n: number) => n.toLocaleString('ko-KR')

export default function AssetOptimizerPage() {
  const [result, setResult] = useState<AssetOptimizerResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { annualReturnRate: 4, irpBalance: 0, irpAnnualContribution: 0 },
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
      const res = await fetch('/api/calculate/asset-optimizer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, annualReturnRate: data.annualReturnRate / 100 }),
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">주택연금 + IRP 최적화</h1>
          <p className="text-primary-200">자산 조합으로 월 추가 수입 극대화 전략</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-20">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                <Card title="기본 정보">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="현재 나이" id="currentAge" error={errors.currentAge?.message}>
                      <input id="currentAge" type="number" inputMode="numeric" placeholder="예: 55"
                        className={inputCls(!!errors.currentAge)}
                        {...register('currentAge', { valueAsNumber: true })} />
                    </Field>
                    <Field label="은퇴 예정 나이" id="retirementAge" error={errors.retirementAge?.message}>
                      <input id="retirementAge" type="number" inputMode="numeric" placeholder="예: 60"
                        className={inputCls(!!errors.retirementAge)}
                        {...register('retirementAge', { valueAsNumber: true })} />
                    </Field>
                  </div>
                  <Field label="공적연금 연간 수령액 (원)" id="annualPensionIncome" error={errors.annualPensionIncome?.message} helper="건보료 영향 분석에 사용">
                    <input id="annualPensionIncome" type="text" inputMode="numeric" placeholder="예: 36,000,000"
                      className={inputCls(!!errors.annualPensionIncome)}
                      onChange={handleMoneyInput('annualPensionIncome')} />
                  </Field>
                </Card>

                <Card title="주택연금">
                  <Field label="주택 공시가격 (원)" id="housingPrice" error={errors.housingPrice?.message} helper="국토교통부 공시가격 기준. 시세의 약 70~90%">
                    <input id="housingPrice" type="text" inputMode="numeric" placeholder="예: 500,000,000"
                      className={inputCls(!!errors.housingPrice)}
                      onChange={handleMoneyInput('housingPrice')} />
                  </Field>
                </Card>

                <Card title="IRP (개인형 퇴직연금)">
                  <div className="space-y-3">
                    <Field label="현재 IRP 잔액 (원)" id="irpBalance">
                      <input id="irpBalance" type="text" inputMode="numeric" placeholder="없으면 0"
                        className={inputCls(false)}
                        onChange={handleMoneyInput('irpBalance')} />
                    </Field>
                    <Field label="연간 납입액 (원)" id="irpAnnualContribution" helper="최대 9,000,000원까지 세액공제">
                      <input id="irpAnnualContribution" type="text" inputMode="numeric" placeholder="예: 9,000,000"
                        className={inputCls(false)}
                        onChange={handleMoneyInput('irpAnnualContribution')} />
                    </Field>
                    <Field label="연간 운용 수익률 (%)" id="annualReturnRate" helper="보수적: 3~4%, 적극적: 5~7%">
                      <input id="annualReturnRate" type="number" step="0.1" inputMode="decimal" placeholder="4"
                        className={inputCls(false)}
                        {...register('annualReturnRate', { valueAsNumber: true })} />
                    </Field>
                  </div>
                </Card>

                <button type="submit" disabled={isLoading}
                  className="w-full h-14 bg-accent hover:bg-orange-700 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />계산 중...</> : '최적화 계산'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 mt-6 lg:mt-0">
            {error && <div className="p-4 bg-red-50 border border-danger/30 rounded-lg text-danger mb-4">⚠ {error}</div>}

            {!result && !error && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>주택가격과 IRP 정보를 입력하고 계산하면</p>
                <p>월 추가 수입 최적화 방안을 보여드립니다</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* 합계 배너 */}
                <div className="bg-primary text-white rounded-lg p-5">
                  <p className="text-sm opacity-80 mb-1">월 추가 수입 합계 (추정)</p>
                  <p className="text-3xl font-bold">{fmt(result.combined.totalMonthly)}원/월</p>
                  <p className="text-sm opacity-70 mt-1">연간 {fmt(result.combined.totalAnnual)}원</p>
                </div>

                {/* 주택연금 */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-5 w-5 text-primary" />
                    <h2 className="text-base font-semibold text-primary">주택연금</h2>
                  </div>
                  <div className="text-2xl font-bold mb-3">{fmt(result.housingPension.monthlyPayment)}원/월</div>
                  <ul className="space-y-1">
                    {result.housingPension.notes.map((n, i) => (
                      <li key={i} className="text-sm text-gray-500 flex gap-1"><span>·</span>{n}</li>
                    ))}
                  </ul>
                </div>

                {/* IRP */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <PiggyBank className="h-5 w-5 text-accent" />
                    <h2 className="text-base font-semibold text-accent">IRP (개인형 퇴직연금)</h2>
                  </div>
                  <div className="text-2xl font-bold mb-1">{fmt(result.irp.monthlyPension)}원/월</div>
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-gray-500 text-xs">은퇴 시 잔액</p>
                      <p className="font-semibold">{fmt(result.irp.estimatedBalance)}원</p>
                    </div>
                    <div className="bg-success/10 rounded p-2">
                      <p className="text-gray-500 text-xs">누적 세액공제</p>
                      <p className="font-semibold text-success">{fmt(result.irp.totalTaxSaving)}원</p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {result.irp.notes.map((n, i) => (
                      <li key={i} className="text-sm text-gray-500 flex gap-1"><span>·</span>{n}</li>
                    ))}
                  </ul>
                </div>

                {/* 건보료 영향 */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-700 mb-1">건강보험료 영향</p>
                  <p className="text-sm text-amber-600">{result.combined.healthInsuranceImpact}</p>
                  <p className="text-xs text-amber-500 mt-1">주택연금 지급금은 대출 성격으로 건보료 산정 소득에 미포함</p>
                </div>

                {/* 추천 요약 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-700 mb-1">전략 요약</p>
                  <p className="text-sm text-blue-600">{result.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
      <h2 className="text-base font-semibold text-primary">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, id, error, helper, children }: { label: string; id: string; error?: string; helper?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {helper && !error && <p className="mt-1 text-xs text-gray-400">{helper}</p>}
      {error && <p className="mt-1 text-xs text-danger">⚠ {error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn('block w-full h-12 rounded-lg border px-3 text-base',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    hasError ? 'border-danger bg-red-50' : 'border-gray-300')
}
