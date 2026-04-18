'use client'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, FileText, Lock, CheckCircle2, Download } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const REPORT_PRICE = 19_900
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ''

interface ReportFormState {
  monthlyMilitaryPension: string
  serviceYears: string
  rank: string
  healthInsuranceOption: '피부양자' | '지역가입자' | '임의계속가입'
  monthlyHealthPremium: string
  annualSaving: string
  bestReemploymentType: string
  bestReemploymentIncome: string
  housingPrice: string
  irpBalance: string
  currentAge: string
  targetMonthlyIncome: string
}

export default function ReportPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState<ReportFormState>({
    monthlyMilitaryPension: '',
    serviceYears: '',
    rank: '',
    healthInsuranceOption: '지역가입자',
    monthlyHealthPremium: '',
    annualSaving: '0',
    bestReemploymentType: '',
    bestReemploymentIncome: '',
    housingPrice: '',
    irpBalance: '',
    currentAge: '',
    targetMonthlyIncome: '',
  })
  const [report, setReport] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof ReportFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function parseNum(s: string) {
    return parseInt(s.replace(/,/g, ''), 10) || 0
  }

  async function handlePayment() {
    if (!session) {
      alert('카카오 로그인 후 결제하세요')
      return
    }

    // 토스페이먼츠 SDK가 없으면 개발 환경 mock
    if (!TOSS_CLIENT_KEY || TOSS_CLIENT_KEY === '') {
      setHasPaid(true)
      return
    }

    setIsPaying(true)
    try {
      // 토스페이먼츠 SDK 동적 로드
      const { loadTossPayments } = await import('@tosspayments/payment-sdk')
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY)
      await tossPayments.requestPayment('카드', {
        amount: REPORT_PRICE,
        orderId: `REPORT_${Date.now()}`,
        orderName: '맞춤형 은퇴설계 AI 리포트',
        customerName: session.user?.name ?? '고객',
        successUrl: `${window.location.origin}/report/success`,
        failUrl: `${window.location.origin}/report`,
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('결제')) {
        setError('결제가 취소되었습니다.')
      }
    } finally {
      setIsPaying(false)
    }
  }

  async function handleGenerateReport() {
    setIsGenerating(true); setError(null)
    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyMilitaryPension: parseNum(form.monthlyMilitaryPension),
          serviceYears: parseNum(form.serviceYears),
          rank: form.rank || undefined,
          healthInsuranceOption: form.healthInsuranceOption,
          monthlyHealthPremium: parseNum(form.monthlyHealthPremium),
          annualSaving: parseNum(form.annualSaving),
          bestReemploymentType: form.bestReemploymentType || undefined,
          bestReemploymentIncome: parseNum(form.bestReemploymentIncome) || undefined,
          housingPrice: parseNum(form.housingPrice) || undefined,
          irpBalance: parseNum(form.irpBalance) || undefined,
          currentAge: parseNum(form.currentAge),
          targetMonthlyIncome: parseNum(form.targetMonthlyIncome) || undefined,
        }),
      })
      if (!res.ok) { setError((await res.json()).message); return }
      const data = await res.json()
      setReport(data.report)
    } catch { setError('리포트 생성 중 오류가 발생했습니다.') }
    finally { setIsGenerating(false) }
  }

  function downloadReport() {
    if (!report) return
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `은퇴설계_리포트_${new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">맞춤형 은퇴설계 AI 리포트</h1>
          <p className="text-primary-200">시뮬레이터 결과를 바탕으로 20페이지 맞춤 보고서 생성</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* 상품 설명 */}
        {!hasPaid && !report && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI 맞춤 은퇴설계 리포트</h2>
                <p className="text-gray-500 mt-1">나의 데이터 기반 개인화된 전략 보고서</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">₩19,900</p>
                <p className="text-sm text-gray-400">1회 구매</p>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                '현황 진단 · 위험 요소 분석',
                '건강보험료 절약 단계별 전략',
                '재취업 시나리오별 최적 선택',
                '주택연금·IRP 자산 조합 전략',
                '5년 은퇴 로드맵',
                '지금 당장 해야 할 핵심 실행 과제',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={handlePayment}
              disabled={isPaying}
              className="w-full h-14 bg-accent hover:bg-orange-700 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              {isPaying
                ? <><Loader2 className="h-5 w-5 animate-spin" />결제 처리 중...</>
                : <><Lock className="h-5 w-5" />₩19,900 결제 후 리포트 받기</>}
            </button>
            {!TOSS_CLIENT_KEY && (
              <p className="text-xs text-center text-gray-400 mt-2">
                개발 환경: 결제 없이 바로 생성 가능
              </p>
            )}
          </div>
        )}

        {/* 결제 완료 후 정보 입력 */}
        {hasPaid && !report && (
          <div className="space-y-4">
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="text-success font-medium">결제 완료! 아래 정보를 입력하고 리포트를 생성하세요.</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
              <h2 className="text-base font-semibold text-primary">리포트 생성 정보 입력</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormRow label="현재 나이" id="currentAge" type="number" placeholder="예: 55" value={form.currentAge} onChange={set('currentAge')} />
                <FormRow label="최종 계급" id="rank" placeholder="예: 중령" value={form.rank} onChange={set('rank')} />
                <FormRow label="군인연금 월 수령액 (원)" id="monthlyMilitaryPension" placeholder="예: 3,200,000" value={form.monthlyMilitaryPension} onChange={set('monthlyMilitaryPension')} />
                <FormRow label="복무연수" id="serviceYears" type="number" placeholder="예: 25" value={form.serviceYears} onChange={set('serviceYears')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">최적 건보료 옵션</label>
                  <select value={form.healthInsuranceOption}
                    onChange={e => setForm(f => ({ ...f, healthInsuranceOption: e.target.value as '피부양자' | '지역가입자' | '임의계속가입' }))}
                    className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="피부양자">피부양자</option>
                    <option value="지역가입자">지역가입자</option>
                    <option value="임의계속가입">임의계속가입</option>
                  </select>
                </div>
                <FormRow label="월 건보료 (원)" id="monthlyHealthPremium" placeholder="예: 150,000" value={form.monthlyHealthPremium} onChange={set('monthlyHealthPremium')} />
                <FormRow label="최적 재취업 유형" id="bestReemploymentType" placeholder="예: 민간기업" value={form.bestReemploymentType} onChange={set('bestReemploymentType')} />
                <FormRow label="목표 월 생활비 (원)" id="targetMonthlyIncome" placeholder="예: 4,000,000" value={form.targetMonthlyIncome} onChange={set('targetMonthlyIncome')} />
                <FormRow label="주택 공시가격 (원)" id="housingPrice" placeholder="없으면 빈칸" value={form.housingPrice} onChange={set('housingPrice')} />
                <FormRow label="IRP 잔액 (원)" id="irpBalance" placeholder="없으면 빈칸" value={form.irpBalance} onChange={set('irpBalance')} />
              </div>

              {error && <div className="p-3 bg-red-50 text-danger text-sm rounded">⚠ {error}</div>}

              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || !form.currentAge || !form.monthlyMilitaryPension}
                className="w-full h-14 bg-primary hover:bg-blue-800 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                {isGenerating
                  ? <><Loader2 className="h-5 w-5 animate-spin" />리포트 생성 중 (약 30초)...</>
                  : <><FileText className="h-5 w-5" />AI 리포트 생성</>}
              </button>
            </div>
          </div>
        )}

        {/* 리포트 결과 */}
        {report && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">맞춤형 은퇴설계 리포트</h2>
              <button onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-800">
                <Download className="h-4 w-4" />
                다운로드
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                {report}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

function FormRow({ label, id, type = 'text', placeholder, value, onChange }: {
  label: string; id: string; type?: string; placeholder: string
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input id={id} type={type} inputMode="numeric" placeholder={placeholder}
        value={value} onChange={onChange}
        className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  )
}
