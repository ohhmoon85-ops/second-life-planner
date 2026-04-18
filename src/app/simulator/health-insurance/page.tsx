'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { HealthInsuranceResult, HealthPremiumOption, CoupleDependent } from '@/lib/types/health-insurance'

const schema = z.object({
  monthlyMilitaryPension: z.number({ invalid_type_error: '월 연금액을 입력하세요' }).int().min(100_000, '10만원 이상 입력'),
  annualRentalIncome: z.number().int().min(0).optional(),
  annualFinancialIncome: z.number().int().min(0).optional(),
  annualBusinessIncome: z.number().int().min(0).optional(),
  propertyTaxBase: z.number().int().min(0).optional(),
  hasSpouseWithInsurance: z.boolean(),
  spouseMonthlyPension: z.number().int().min(0).optional(),
  spouseAnnualOtherIncome: z.number().int().min(0).optional(),
  spousePropertyTaxBase: z.number().int().min(0).optional(),
  prevMonthlySalary: z.number({ invalid_type_error: '퇴직 전 월급을 입력하세요' }).int().min(1_000_000),
  yearsOfInsuredEmployment: z.number({ invalid_type_error: '가입 기간을 입력하세요' }).int().min(0).max(600),
})
type FormValues = z.infer<typeof schema>

export default function HealthInsurancePage() {
  const [result, setResult] = useState<HealthInsuranceResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBasis, setShowBasis] = useState(false)
  const [showSpouseFields, setShowSpouseFields] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { hasSpouseWithInsurance: false },
  })

  const hasSpouse = watch('hasSpouseWithInsurance')

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
      const res = await fetch('/api/calculate/health-insurance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { setError((await res.json()).message ?? '오류'); return }
      setResult(await res.json())
      if (window.innerWidth < 1024)
        setTimeout(() => document.getElementById('hi-result')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch { setError('네트워크 오류가 발생했습니다.') }
    finally { setIsLoading(false) }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">건강보험료 시뮬레이터</h1>
          <p className="text-primary-200 text-base">퇴직 후 건보료 옵션 비교 · 피부양자 자격 판정 · 부부 동반 탈락 시뮬레이션</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* ── 폼 ── */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-20">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                <Card title="연금 정보">
                  <Field label="군인연금 월 수령액 (세전, 원)" id="monthlyMilitaryPension" error={errors.monthlyMilitaryPension?.message} helper="국방부 인트라넷 계산기에서 확인한 세전 금액">
                    <MoneyInput id="monthlyMilitaryPension" onChange={handleMoneyInput('monthlyMilitaryPension')} hasError={!!errors.monthlyMilitaryPension} />
                  </Field>
                </Card>

                <Card title="기타 소득 (선택)">
                  <div className="space-y-3">
                    <Field label="임대소득 (연, 원)" id="annualRentalIncome">
                      <MoneyInput id="annualRentalIncome" onChange={handleMoneyInput('annualRentalIncome')} placeholder="없으면 빈칸" />
                    </Field>
                    <Field label="금융소득 (연, 원)" id="annualFinancialIncome" helper="이자·배당 합계">
                      <MoneyInput id="annualFinancialIncome" onChange={handleMoneyInput('annualFinancialIncome')} placeholder="없으면 빈칸" />
                    </Field>
                    <Field label="사업소득 (연, 원)" id="annualBusinessIncome" helper="있으면 피부양자 즉시 불가">
                      <MoneyInput id="annualBusinessIncome" onChange={handleMoneyInput('annualBusinessIncome')} placeholder="없으면 빈칸" />
                    </Field>
                  </div>
                </Card>

                <Card title="재산 정보 (선택)">
                  <Field label="재산세 과세표준 (원)" id="propertyTaxBase" helper="주택·토지 합산. 공시가격 × 공정시장가액비율. 없으면 빈칸">
                    <MoneyInput id="propertyTaxBase" onChange={handleMoneyInput('propertyTaxBase')} placeholder="없으면 빈칸" />
                  </Field>
                </Card>

                <Card title="가족 정보">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <label htmlFor="hasSpouseWithInsurance" className="text-base font-medium text-gray-800">
                          배우자가 직장 건보 가입자
                        </label>
                        <p className="text-sm text-gray-500 mt-0.5">피부양자 등록 가능 조건</p>
                      </div>
                      <button type="button" role="switch" id="hasSpouseWithInsurance"
                        aria-checked={hasSpouse}
                        onClick={() => setValue('hasSpouseWithInsurance', !hasSpouse)}
                        className={cn('relative inline-flex h-7 w-14 items-center rounded-full transition-colors',
                          hasSpouse ? 'bg-success' : 'bg-gray-300')}>
                        <span className={cn('inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                          hasSpouse ? 'translate-x-8' : 'translate-x-1')} />
                      </button>
                    </div>

                    {/* 배우자 소득 정보 (부부 동반 탈락 시뮬레이션) */}
                    <div className="border-t pt-3">
                      <button type="button"
                        onClick={() => setShowSpouseFields(!showSpouseFields)}
                        className="flex items-center gap-2 text-sm font-medium text-primary">
                        {showSpouseFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        배우자 소득 입력 (부부 동반 탈락 시뮬레이션)
                      </button>
                      <p className="text-xs text-gray-400 mt-1">배우자도 연금수령자인 경우, 부부 모두 피부양자 탈락 여부를 확인합니다</p>

                      {showSpouseFields && (
                        <div className="mt-3 space-y-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <Field label="배우자 월 연금액 (원)" id="spouseMonthlyPension" helper="군인·공무원·사학·국민연금 합계">
                            <MoneyInput id="spouseMonthlyPension" onChange={handleMoneyInput('spouseMonthlyPension')} placeholder="없으면 빈칸" />
                          </Field>
                          <Field label="배우자 기타 연간 소득 (원)" id="spouseAnnualOtherIncome" helper="임대·금융소득 등">
                            <MoneyInput id="spouseAnnualOtherIncome" onChange={handleMoneyInput('spouseAnnualOtherIncome')} placeholder="없으면 빈칸" />
                          </Field>
                          <Field label="배우자 재산세 과표 (원)" id="spousePropertyTaxBase">
                            <MoneyInput id="spousePropertyTaxBase" onChange={handleMoneyInput('spousePropertyTaxBase')} placeholder="없으면 빈칸" />
                          </Field>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <Card title="임의계속가입 조건">
                  <div className="space-y-3">
                    <Field label="퇴직 직전 보수월액 (원)" id="prevMonthlySalary" error={errors.prevMonthlySalary?.message}>
                      <MoneyInput id="prevMonthlySalary" onChange={handleMoneyInput('prevMonthlySalary')} hasError={!!errors.prevMonthlySalary} />
                    </Field>
                    <Field label="직장 건보 가입 기간 (개월)" id="yearsOfInsuredEmployment" error={errors.yearsOfInsuredEmployment?.message} helper="18개월 이상이면 임의계속가입 가능">
                      <input id="yearsOfInsuredEmployment" type="number" inputMode="numeric" placeholder="예: 240"
                        className={inputCls(!!errors.yearsOfInsuredEmployment)}
                        {...register('yearsOfInsuredEmployment', { valueAsNumber: true })} />
                    </Field>
                  </div>
                </Card>

                <div className="hidden sm:block">
                  <SubmitBtn isLoading={isLoading} />
                </div>
              </form>
            </div>
          </div>

          {/* ── 결과 ── */}
          <div className="lg:col-span-7 mt-6 lg:mt-0" id="hi-result">
            {error && <div role="alert" className="mb-4 p-4 bg-red-50 border border-danger/30 rounded-lg text-danger font-medium">⚠ {error}</div>}

            {!result && !error && <EmptyState />}

            {result && (
              <div className="space-y-4">
                {/* 피부양자 판정 배너 */}
                <DependentBanner result={result} />

                {/* 부부 동반 탈락 경고 */}
                {result.coupleCheck && (
                  <CoupleBanner couple={result.coupleCheck} />
                )}

                {/* 옵션 비교 카드 */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">보험료 옵션 비교</h2>
                  <div className="space-y-3">
                    {result.options.map((opt) => (
                      <OptionCard key={opt.type} option={opt} recommended={result.recommendedOption === opt.type} />
                    ))}
                  </div>
                </div>

                {/* 추천 및 절감액 */}
                <div className="bg-success/5 border border-success/30 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-success mb-1">추천: {result.recommendedOption}</p>
                      <p className="text-sm text-gray-700">{result.recommendedReason}</p>
                      {result.annualSaving > 0 && (
                        <p className="mt-2 text-base font-bold text-success">
                          최적 선택 시 연간 최대 {result.annualSaving.toLocaleString('ko-KR')}원 절약
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 소득 요약 */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">연간 합산 소득 내역</h2>
                  <div className="space-y-2">
                    <IncomeRow label="합산 소득 (연)" value={result.annualTotalIncome} />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">피부양자 기준 (2,000만원)</span>
                      <span className={result.annualTotalIncome <= 20_000_000 ? 'text-success font-medium' : 'text-danger font-medium'}>
                        {result.annualTotalIncome <= 20_000_000 ? '✅ 기준 충족' : '❌ 기준 초과'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 계산 근거 */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <button type="button" onClick={() => setShowBasis(!showBasis)}
                    className="flex items-center gap-2 text-sm font-medium text-primary w-full text-left">
                    <Info className="h-4 w-4" />
                    적용 법령 및 계산 기준
                    {showBasis ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                  </button>
                  {showBasis && (
                    <ul className="mt-3 space-y-1.5" role="list">
                      {result.calculationBasis.notes.map((n, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-primary">·</span>{n}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="h-24 sm:hidden" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 하단 버튼 */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10">
        <SubmitBtn isLoading={isLoading} onClick={handleSubmit(onSubmit)} />
      </div>
    </main>
  )
}

// ── 서브 컴포넌트 ──────────────────────────────────────────

function DependentBanner({ result }: { result: HealthInsuranceResult }) {
  const eligible = result.dependentEligible
  const statusMsg: Record<string, string> = {
    eligible: '피부양자 소득·재산 기준 충족',
    ineligible_income: `연 합산소득 ${(result.annualTotalIncome / 10000).toFixed(0)}만원 → 2,000만원 초과로 피부양자 불가`,
    ineligible_property: '재산세 과표 기준 초과로 피부양자 불가',
    ineligible_business: '사업소득 있음 → 피부양자 자격 상실 (금액 무관)',
  }
  return (
    <div className={cn('rounded-lg p-5 flex items-start gap-3',
      eligible ? 'bg-success/10 border border-success/30' : 'bg-red-50 border border-danger/30')}>
      {eligible
        ? <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
        : <XCircle className="h-6 w-6 text-danger flex-shrink-0 mt-0.5" />}
      <div>
        <p className={cn('font-semibold text-base', eligible ? 'text-success' : 'text-danger')}>
          피부양자 자격: {eligible ? '유지 가능' : '불가'}
        </p>
        <p className="text-sm text-gray-700 mt-1">{statusMsg[result.dependentStatus]}</p>
      </div>
    </div>
  )
}

function CoupleBanner({ couple }: { couple: CoupleDependent }) {
  if (!couple.warningMessage) return null
  const isBothOut = couple.bothDisqualified
  return (
    <div className={cn('rounded-lg p-5 flex items-start gap-3',
      isBothOut ? 'bg-red-50 border border-danger/30' : 'bg-amber-50 border border-amber-300')}>
      <AlertTriangle className={cn('h-6 w-6 flex-shrink-0 mt-0.5', isBothOut ? 'text-danger' : 'text-amber-500')} />
      <div>
        <p className={cn('font-semibold text-base mb-1', isBothOut ? 'text-danger' : 'text-amber-700')}>
          {isBothOut ? '부부 동반 피부양자 탈락' : '배우자 피부양자 상태 변동'}
        </p>
        <p className="text-sm text-gray-700">{couple.warningMessage}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className={cn('rounded p-2', couple.selfEligible ? 'bg-success/10 text-success' : 'bg-red-100 text-danger')}>
            본인: {couple.selfEligible ? '✅ 자격 유지' : '❌ 탈락'}<br />
            연소득 {(couple.selfAnnualIncome / 10000).toFixed(0)}만원
          </div>
          <div className={cn('rounded p-2', couple.spouseEligible ? 'bg-success/10 text-success' : 'bg-red-100 text-danger')}>
            배우자: {couple.spouseEligible ? '✅ 자격 유지' : '❌ 탈락'}<br />
            연소득 {(couple.spouseAnnualIncome / 10000).toFixed(0)}만원
          </div>
        </div>
      </div>
    </div>
  )
}

function OptionCard({ option, recommended }: { option: HealthPremiumOption; recommended: boolean }) {
  return (
    <div className={cn('rounded-lg border p-4 relative',
      !option.available ? 'bg-gray-50 border-gray-200 opacity-60' :
      recommended ? 'border-success bg-success/5' : 'border-gray-200 bg-white')}>
      {recommended && option.available && (
        <span className="absolute top-3 right-3 text-xs bg-success text-white px-2 py-0.5 rounded-full font-medium">추천</span>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800">{option.type}</span>
        {!option.available
          ? <span className="text-sm text-gray-400">이용 불가</span>
          : <span className={cn('text-xl font-bold', recommended ? 'text-success' : 'text-primary')}>
              {option.totalMonthly === 0 ? '₩0' : `₩${option.totalMonthly.toLocaleString('ko-KR')}`}
              <span className="text-sm font-normal text-gray-500">/월</span>
            </span>
        }
      </div>
      {!option.available && option.unavailableReason && (
        <p className="text-sm text-gray-500 mb-1">{option.unavailableReason}</p>
      )}
      {option.available && option.totalMonthly > 0 && (
        <p className="text-xs text-gray-500">
          건강보험료 {option.monthlyPremium.toLocaleString('ko-KR')}원 + 장기요양 {option.ltciPremium.toLocaleString('ko-KR')}원
        </p>
      )}
      {option.notes.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {option.notes.map((n, i) => (
            <li key={i} className="text-xs text-gray-500 flex gap-1"><span>·</span>{n}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
      <p className="text-lg mb-2">👈 왼쪽 폼을 입력하고</p>
      <p className="text-lg mb-4">[건보료 계산하기]를 눌러주세요</p>
      <div className="p-4 bg-blue-50 rounded-lg text-left max-w-sm mx-auto">
        <p className="text-sm font-medium text-blue-700 mb-2">이 계산기가 알려드리는 것</p>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>· 피부양자 자격 유지 가능 여부 (2,000만원 기준)</li>
          <li>· 부부 동반 탈락 시뮬레이션</li>
          <li>· 지역가입자 전환 시 월 보험료</li>
          <li>· 임의계속가입 vs 지역가입자 비교</li>
          <li>· 최적 선택 시 연간 절약액</li>
        </ul>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-primary mb-4">{title}</h2>
      {children}
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

function MoneyInput({ id, onChange, hasError, placeholder = '예: 3,060,000' }: { id: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; hasError?: boolean; placeholder?: string }) {
  return (
    <input id={id} type="text" inputMode="numeric" placeholder={placeholder}
      className={inputCls(hasError ?? false)} onChange={onChange} />
  )
}

function inputCls(hasError: boolean) {
  return cn('block w-full h-14 rounded-lg border px-4 text-base transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    hasError ? 'border-danger bg-red-50' : 'border-gray-300 bg-white')
}

function SubmitBtn({ isLoading, onClick }: { isLoading: boolean; onClick?: () => void }) {
  return (
    <button type={onClick ? 'button' : 'submit'} onClick={onClick} disabled={isLoading}
      className="w-full h-14 sm:h-14 h-16 bg-accent hover:bg-orange-700 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
      {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />계산 중...</> : '건보료 계산하기'}
    </button>
  )
}

function IncomeRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value.toLocaleString('ko-KR')}원</span>
    </div>
  )
}
