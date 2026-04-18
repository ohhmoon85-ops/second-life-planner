'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ReemploymentResult, ReemploymentScenario } from '@/lib/types/health-insurance'
import type { ReemploymentType } from '@/lib/constants/pension-suspension-rules'

const schema = z.object({
  monthlyMilitaryPension: z.number({ invalid_type_error: '월 연금액 입력' }).int().min(100_000),
  prevMonthlySalary: z.number({ invalid_type_error: '퇴직 전 월급 입력' }).int().min(1_000_000),
  newMonthlySalary: z.number({ invalid_type_error: '재취업 예상 월급 입력' }).int().min(0),
  propertyTaxBase: z.number().int().min(0).optional(),
})
type FormValues = z.infer<typeof schema>

const TYPE_LABELS: Record<ReemploymentType, { label: string; badge: string; color: string }> = {
  공무원:   { label: '공무원 재취업',   badge: '연금 일부 정지', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  공공기관: { label: '공공기관 재취업', badge: '연금 일부 정지', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  사립학교: { label: '사립학교 재취업', badge: '연금 일부 정지', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  민간기업: { label: '민간기업 재취업', badge: '연금 정지 없음', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  자영업:   { label: '자영업 창업',     badge: '연금 정지 없음', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  무직:     { label: '재취업 안 함',    badge: '기준값',         color: 'text-gray-600 bg-gray-50 border-gray-200' },
}

export default function ReemploymentPage() {
  const [result, setResult] = useState<ReemploymentResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
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
      const res = await fetch('/api/calculate/reemployment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { setError((await res.json()).message); return }
      setResult(await res.json())
      if (window.innerWidth < 1024)
        setTimeout(() => document.getElementById('re-result')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch { setError('네트워크 오류') }
    finally { setIsLoading(false) }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">재취업 시나리오 비교</h1>
          <p className="text-primary-200 text-base">
            공무원·공공기관·민간·자영업·무직 5가지 케이스별 공적연금 감액 + 건보료 + 실수령액 비교
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* ── 폼 ── */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h2 className="text-base font-semibold text-primary mb-4">연금 정보</h2>
                  <div className="space-y-4">
                    <Field label="공적연금 월 수령액 (세전)" id="monthlyMilitaryPension" error={errors.monthlyMilitaryPension?.message}>
                      <MoneyInput id="monthlyMilitaryPension" onChange={handleMoneyInput('monthlyMilitaryPension')} hasError={!!errors.monthlyMilitaryPension} placeholder="예: 3,060,000" />
                    </Field>
                    <Field label="퇴직 직전 기준소득월액" id="prevMonthlySalary" error={errors.prevMonthlySalary?.message} helper="연금 정지액 계산 기준. 퇴직 전 3년 평균 월급">
                      <MoneyInput id="prevMonthlySalary" onChange={handleMoneyInput('prevMonthlySalary')} hasError={!!errors.prevMonthlySalary} placeholder="예: 6,000,000" />
                    </Field>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h2 className="text-base font-semibold text-primary mb-4">재취업 예상 조건</h2>
                  <div className="space-y-4">
                    <Field label="재취업 예상 보수월액" id="newMonthlySalary" error={errors.newMonthlySalary?.message} helper="무직으로 비교하려면 0 입력">
                      <MoneyInput id="newMonthlySalary" onChange={handleMoneyInput('newMonthlySalary')} hasError={!!errors.newMonthlySalary} placeholder="예: 4,000,000" />
                    </Field>
                    <Field label="재산세 과표 (선택)" id="propertyTaxBase" helper="지역가입자 건보료 계산에 사용">
                      <MoneyInput id="propertyTaxBase" onChange={handleMoneyInput('propertyTaxBase')} placeholder="없으면 빈칸" />
                    </Field>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                  <p className="font-medium mb-1">계산 기준 안내</p>
                  <ul className="space-y-1 text-xs">
                    <li>· 공무원 재임용: 재직 중 연금 전액 정지</li>
                    <li>· 공공기관·사립학교: 연금+보수가 퇴직전소득 160% 초과분의 50% 정지</li>
                    <li>· 민간기업: 초과소득 구간별 30~70% 부분 정지</li>
                    <li>· 자영업·무직: 연금 정지 없음</li>
                  </ul>
                </div>

                <div className="hidden sm:block">
                  <button type="submit" disabled={isLoading}
                    className="w-full h-14 bg-accent hover:bg-orange-700 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />계산 중...</> : '시나리오 비교하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── 결과 ── */}
          <div className="lg:col-span-8 mt-6 lg:mt-0" id="re-result">
            {error && <div role="alert" className="mb-4 p-4 bg-red-50 border border-danger/30 rounded-lg text-danger font-medium">⚠ {error}</div>}

            {!result && !error && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
                <p className="text-lg mb-2">👈 왼쪽 폼을 입력하고</p>
                <p className="text-lg mb-4">[시나리오 비교하기]를 눌러주세요</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mt-4">
                  {Object.entries(TYPE_LABELS).map(([type, info]) => (
                    <div key={type} className={cn('rounded-lg border p-3 text-sm text-center', info.color)}>
                      <p className="font-medium">{info.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* 기준 케이스 */}
                <div className="bg-gray-100 rounded-lg border border-gray-300 p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">기준값 (재취업 없이 연금만 수령)</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">월 순소득 (연금 - 건보료)</span>
                    <span className="text-xl font-bold text-gray-800">
                      ₩{result.baseScenario.totalMonthly.toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    연금 {result.baseScenario.monthlyPension.toLocaleString('ko-KR')}원 - 건보료 {result.baseScenario.healthPremium.toLocaleString('ko-KR')}원
                  </p>
                </div>

                {/* 시나리오 카드들 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.scenarios.filter(s => s.type !== '무직').map((scenario) => (
                    <ScenarioCard
                      key={scenario.type}
                      scenario={scenario}
                      baseMonthly={result.baseScenario.totalMonthly}
                      isBest={result.bestScenario === scenario.type}
                      isWorst={result.worstScenario === scenario.type}
                    />
                  ))}
                </div>

                {/* 요약 테이블 */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 overflow-x-auto">
                  <h2 className="text-base font-semibold text-gray-800 mb-4">전체 비교표</h2>
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="text-left py-2 pr-3 font-medium">구분</th>
                        <th className="text-right py-2 px-2 font-medium">보수</th>
                        <th className="text-right py-2 px-2 font-medium">연금 정지</th>
                        <th className="text-right py-2 px-2 font-medium">건보료</th>
                        <th className="text-right py-2 pl-2 font-medium">월 순소득</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* 기준 */}
                      <tr className="bg-gray-50">
                        <td className="py-2.5 pr-3 font-medium text-gray-600">재취업 안 함</td>
                        <td className="py-2.5 px-2 text-right text-gray-500">0</td>
                        <td className="py-2.5 px-2 text-right text-gray-500">0</td>
                        <td className="py-2.5 px-2 text-right text-gray-500">{result.baseScenario.healthPremium.toLocaleString('ko-KR')}</td>
                        <td className="py-2.5 pl-2 text-right font-semibold">{result.baseScenario.totalMonthly.toLocaleString('ko-KR')}</td>
                      </tr>
                      {result.scenarios.filter(s => s.type !== '무직').map((s) => {
                        const diff = s.totalMonthlyIncome - result.baseScenario.totalMonthly
                        return (
                          <tr key={s.type} className={cn(
                            result.bestScenario === s.type ? 'bg-success/5' :
                            result.worstScenario === s.type ? 'bg-red-50' : ''
                          )}>
                            <td className="py-2.5 pr-3 font-medium text-gray-700">{s.type}</td>
                            <td className="py-2.5 px-2 text-right text-gray-600">{s.newMonthlySalary.toLocaleString('ko-KR')}</td>
                            <td className="py-2.5 px-2 text-right text-danger">{s.pensionSuspension > 0 ? `-${s.pensionSuspension.toLocaleString('ko-KR')}` : '0'}</td>
                            <td className="py-2.5 px-2 text-right text-gray-600">-{(s.healthPremium + s.ltciPremium).toLocaleString('ko-KR')}</td>
                            <td className="py-2.5 pl-2 text-right">
                              <span className="font-bold">{s.totalMonthlyIncome.toLocaleString('ko-KR')}</span>
                              <span className={cn('ml-1 text-xs', diff >= 0 ? 'text-success' : 'text-danger')}>
                                ({diff >= 0 ? '+' : ''}{diff.toLocaleString('ko-KR')})
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-gray-400">단위: 원/월 | 괄호는 재취업 없음 대비 증감</p>
                </div>

                <div className="h-24 sm:hidden" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 하단 버튼 */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10">
        <button onClick={handleSubmit(onSubmit)} disabled={isLoading}
          className="w-full h-16 bg-accent hover:bg-orange-700 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
          {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />계산 중...</> : '시나리오 비교하기'}
        </button>
      </div>
    </main>
  )
}

function ScenarioCard({ scenario, baseMonthly, isBest, isWorst }: {
  scenario: ReemploymentScenario; baseMonthly: number; isBest: boolean; isWorst: boolean
}) {
  const info = TYPE_LABELS[scenario.type]
  const diff = scenario.totalMonthlyIncome - baseMonthly

  return (
    <div className={cn('rounded-xl border p-4 relative',
      isBest ? 'border-success bg-success/5' : isWorst ? 'border-danger/30 bg-red-50' : 'border-gray-200 bg-white')}>
      {isBest && <span className="absolute top-3 right-3 text-xs bg-success text-white px-2 py-0.5 rounded-full">순소득 최고</span>}
      {isWorst && <span className="absolute top-3 right-3 text-xs bg-danger text-white px-2 py-0.5 rounded-full">순소득 최저</span>}

      <p className="font-semibold text-gray-800 mb-1">{info.label}</p>
      <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', info.color)}>{info.badge}</span>

      <div className="mt-3 space-y-1.5 text-sm">
        {scenario.pensionSuspension > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">연금 정지액</span>
            <span className="text-danger font-medium">-{scenario.pensionSuspension.toLocaleString('ko-KR')}원</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">실수령 연금</span>
          <span>{scenario.netMonthlyPension.toLocaleString('ko-KR')}원</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">건보료+장기요양</span>
          <span className="text-danger">-{(scenario.healthPremium + scenario.ltciPremium).toLocaleString('ko-KR')}원</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>월 순소득</span>
          <span className={isBest ? 'text-success' : isWorst ? 'text-danger' : 'text-gray-800'}>
            {scenario.totalMonthlyIncome.toLocaleString('ko-KR')}원
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {diff > 0 ? <TrendingUp className="h-3.5 w-3.5 text-success" /> :
           diff < 0 ? <TrendingDown className="h-3.5 w-3.5 text-danger" /> :
           <Minus className="h-3.5 w-3.5 text-gray-400" />}
          <span className={diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-gray-500'}>
            무직 대비 월 {diff >= 0 ? '+' : ''}{diff.toLocaleString('ko-KR')}원
          </span>
        </div>
      </div>

      {scenario.notes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {scenario.notes.map((n, i) => (
            <p key={i} className="text-xs text-gray-500 flex gap-1"><AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5 text-amber-400" />{n}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, id, error, helper, children }: { label: string; id: string; error?: string; helper?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-medium text-gray-800 mb-1.5">{label}</label>
      {children}
      {helper && !error && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
      {error && <p role="alert" className="mt-1 text-sm font-medium text-danger">⚠ {error}</p>}
    </div>
  )
}

function MoneyInput({ id, onChange, hasError, placeholder }: { id: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; hasError?: boolean; placeholder?: string }) {
  return (
    <input id={id} type="text" inputMode="numeric" placeholder={placeholder}
      onChange={onChange}
      className={cn('block w-full h-14 rounded-lg border px-4 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        hasError ? 'border-danger bg-red-50' : 'border-gray-300 bg-white')} />
  )
}
