'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { PensionPortfolioResult, CivilPensionResult, NationalPensionResult } from '@/lib/calculators/other-pensions'

type PensionType = '공무원연금' | '사학연금' | '국민연금'

interface FormState {
  types: Set<PensionType>
  civilAvg: string; civilYears: string; civilMonths: string
  schoolAvg: string; schoolYears: string; schoolMonths: string
  nationalAvg: string; nationalMonths: string
}

const fmt = (n: number) => n.toLocaleString('ko-KR')
const wan = (n: number) => `${(n / 10000).toFixed(0)}만원`

export default function PensionPortfolioPage() {
  const [form, setForm] = useState<FormState>({
    types: new Set(),
    civilAvg: '', civilYears: '', civilMonths: '0',
    schoolAvg: '', schoolYears: '', schoolMonths: '0',
    nationalAvg: '', nationalMonths: '',
  })
  const [result, setResult] = useState<PensionPortfolioResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleType(t: PensionType) {
    setForm(f => {
      const next = new Set(f.types)
      next.has(t) ? next.delete(t) : next.add(t)
      return { ...f, types: next }
    })
  }

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true); setError(null)

    const body: Record<string, unknown> = {}
    if (form.types.has('공무원연금') && form.civilAvg && form.civilYears) {
      body.civilServant = {
        avgMonthlyIncome: parseInt(form.civilAvg.replace(/,/g, ''), 10),
        serviceYears: parseInt(form.civilYears, 10),
        serviceMonths: parseInt(form.civilMonths, 10) || 0,
      }
    }
    if (form.types.has('사학연금') && form.schoolAvg && form.schoolYears) {
      body.privateSchool = {
        avgMonthlyIncome: parseInt(form.schoolAvg.replace(/,/g, ''), 10),
        serviceYears: parseInt(form.schoolYears, 10),
        serviceMonths: parseInt(form.schoolMonths, 10) || 0,
      }
    }
    if (form.types.has('국민연금') && form.nationalAvg && form.nationalMonths) {
      body.national = {
        avgMonthlyIncome: parseInt(form.nationalAvg.replace(/,/g, ''), 10),
        contributionMonths: parseInt(form.nationalMonths, 10),
      }
    }

    try {
      const res = await fetch('/api/calculate/pension-portfolio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">공적연금 포트폴리오 계산기</h1>
          <p className="text-primary-200">공무원연금 · 사학연금 · 국민연금 예상 수령액 통합 산출</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 연금 유형 선택 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-primary mb-4">보유 연금 종류 선택</h2>
            <div className="flex flex-wrap gap-3">
              {(['공무원연금', '사학연금', '국민연금'] as PensionType[]).map(t => (
                <button key={t} type="button"
                  onClick={() => toggleType(t)}
                  className={cn('px-4 py-2 rounded-full border text-sm font-medium transition-colors',
                    form.types.has(t)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary')}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 공무원연금 */}
          {form.types.has('공무원연금') && (
            <PensionInputCard title="공무원연금" color="blue">
              <MoneyFieldRow label="재직기간 평균 기준소득월액 (원)" value={form.civilAvg} onChange={set('civilAvg')} />
              <YearMonthRow
                yearValue={form.civilYears} onYearChange={set('civilYears')}
                monthValue={form.civilMonths} onMonthChange={set('civilMonths')}
              />
            </PensionInputCard>
          )}

          {/* 사학연금 */}
          {form.types.has('사학연금') && (
            <PensionInputCard title="사학연금" color="purple">
              <MoneyFieldRow label="재직기간 평균 기준소득월액 (원)" value={form.schoolAvg} onChange={set('schoolAvg')} />
              <YearMonthRow
                yearValue={form.schoolYears} onYearChange={set('schoolYears')}
                monthValue={form.schoolMonths} onMonthChange={set('schoolMonths')}
              />
            </PensionInputCard>
          )}

          {/* 국민연금 */}
          {form.types.has('국민연금') && (
            <PensionInputCard title="국민연금" color="green">
              <MoneyFieldRow label="가입기간 평균 소득월액 (원)" value={form.nationalAvg} onChange={set('nationalAvg')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">납부 기간 (개월)</label>
                <input type="number" inputMode="numeric" placeholder="예: 240 (20년)"
                  value={form.nationalMonths} onChange={set('nationalMonths')}
                  className={inputCls(false)} />
                <p className="mt-1 text-xs text-gray-400">10년(120개월) 이상이어야 연금 수령 가능</p>
              </div>
            </PensionInputCard>
          )}

          {form.types.size > 0 && (
            <button type="submit" disabled={isLoading}
              className="w-full h-14 bg-accent hover:bg-orange-700 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />계산 중...</> : '연금 포트폴리오 계산'}
            </button>
          )}
        </form>

        {error && <div className="p-4 bg-red-50 border border-danger/30 rounded-lg text-danger">⚠ {error}</div>}

        {result && (
          <div className="space-y-4">
            {/* 합계 배너 */}
            <div className="bg-primary text-white rounded-lg p-5">
              <p className="text-sm opacity-80 mb-1">예상 월 수령액 합계</p>
              <p className="text-3xl font-bold">{fmt(result.totalMonthly)}원/월</p>
              <p className="text-sm opacity-70 mt-1">연간 {fmt(result.totalAnnual)}원</p>
            </div>

            {/* 개별 결과 */}
            <div className="grid sm:grid-cols-2 gap-4">
              {result.civilServant && <PensionResultCard title="공무원연금" r={result.civilServant} />}
              {result.privateSchool && <PensionResultCard title="사학연금" r={result.privateSchool} />}
              {result.national && <NationalResultCard r={result.national} />}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs text-amber-600">이 계산은 참고용 추정치입니다. 정확한 연금액은 각 공단 공식 계산기(공무원연금공단·사학연금공단·국민연금공단)에서 확인하세요.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function PensionInputCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-white rounded-lg border p-5 space-y-3',
      color === 'blue' ? 'border-blue-200' : color === 'purple' ? 'border-purple-200' : 'border-green-200')}>
      <h2 className={cn('text-base font-semibold',
        color === 'blue' ? 'text-blue-700' : color === 'purple' ? 'text-purple-700' : 'text-green-700')}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function MoneyFieldRow({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type="text" inputMode="numeric" placeholder="예: 4,000,000"
        value={value} onChange={onChange}
        className={inputCls(false)} />
    </div>
  )
}

function YearMonthRow({ yearValue, onYearChange, monthValue, onMonthChange }: {
  yearValue: string; onYearChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  monthValue: string; onMonthChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">재직연수</label>
        <input type="number" inputMode="numeric" placeholder="예: 25"
          value={yearValue} onChange={onYearChange} className={inputCls(false)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">추가 개월 (0~11)</label>
        <input type="number" inputMode="numeric" min="0" max="11" placeholder="0"
          value={monthValue} onChange={onMonthChange} className={inputCls(false)} />
      </div>
    </div>
  )
}

function PensionResultCard({ title, r }: { title: string; r: CivilPensionResult }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-primary">{fmt(r.monthlyPension)}원/월</p>
      <p className="text-sm text-gray-500">연간 {fmt(r.annualPension)}원</p>
      <p className="text-xs text-gray-400 mt-1">지급률 {r.paymentRate}%</p>
      <p className="text-xs text-gray-400 mt-1">{r.note}</p>
    </div>
  )
}

function NationalResultCard({ r }: { r: NationalPensionResult }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">국민연금</p>
      {r.monthlyPension > 0 ? (
        <>
          <p className="text-2xl font-bold text-primary">{fmt(r.monthlyPension)}원/월</p>
          <p className="text-sm text-gray-500">연간 {fmt(r.annualPension)}원</p>
          {r.earlyPenalty && (
            <p className="text-xs text-gray-400 mt-1">
              조기수령 1년당 {(r.earlyPenalty * 100).toFixed(0)}% 감액 / 연기 1년당 {((r.lateBonus ?? 0) * 100).toFixed(1)}% 가산
            </p>
          )}
        </>
      ) : (
        <p className="text-base font-medium text-danger">수령 불가</p>
      )}
      <p className="text-xs text-gray-400 mt-1">{r.note}</p>
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn('block w-full h-12 rounded-lg border px-3 text-base',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    hasError ? 'border-danger bg-red-50' : 'border-gray-300')
}
