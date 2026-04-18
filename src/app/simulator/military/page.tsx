'use client'

import { useState } from 'react'
import MilitaryPensionForm from '@/components/forms/MilitaryPensionForm'
import PensionSummary from '@/components/results/PensionSummary'
import CashFlowChart from '@/components/results/CashFlowChart'
import TaxBreakdown from '@/components/results/TaxBreakdown'
import type { MilitaryPensionInput, MilitaryPensionResult } from '@/lib/types/pension'

export default function MilitarySimulatorPage() {
  const [result, setResult] = useState<MilitaryPensionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: MilitaryPensionInput) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/calculate/military', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        if (res.status === 400) {
          setError(errBody.message ?? '입력값을 확인해주세요.')
        } else {
          setError('계산 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        }
        return
      }

      const data2: MilitaryPensionResult = await res.json()
      setResult(data2)

      // 모바일에서 결과 영역으로 자동 스크롤
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 페이지 헤더 */}
      <div className="bg-primary text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">군인연금 시뮬레이터</h1>
          <p className="text-primary-200 text-base">
            복무 정보를 입력하면 예상 연금과 세금을 즉시 계산해드립니다
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 데스크탑: 2컬럼 레이아웃 */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* 폼 영역 */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-20">
              <MilitaryPensionForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* 결과 영역 */}
          <div className="lg:col-span-7 mt-6 lg:mt-0" id="result-section">
            {error && (
              <div
                role="alert"
                className="mb-4 p-4 bg-red-50 border border-danger/30 rounded-lg text-danger font-medium flex gap-2"
              >
                <span aria-hidden="true">⚠</span> {error}
              </div>
            )}

            {!result && !error && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
                <p className="text-lg mb-2">👈 왼쪽 폼에 복무 정보를 입력하고</p>
                <p className="text-lg">[군인연금 계산하기]를 눌러주세요</p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
                  <p className="text-sm text-blue-700 font-medium mb-2">계산 기준</p>
                  <ul className="text-sm text-blue-600 space-y-1" role="list">
                    <li>· 공무원연금법 시행령 제38조 (2015년 개혁)</li>
                    <li>· 군인연금법 제23~24조</li>
                    <li>· 소득세법 제47조의2 연금소득공제</li>
                    <li>· 2026년 세법 기준</li>
                  </ul>
                </div>
              </div>
            )}

            {result && (
              <div>
                <PensionSummary result={result} />
                <CashFlowChart result={result} />
                <TaxBreakdown result={result} />

                {/* 모바일 하단 여백 (sticky CTA 가림 방지) */}
                <div className="h-24 sm:hidden" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
