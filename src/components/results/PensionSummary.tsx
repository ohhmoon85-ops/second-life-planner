'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { MilitaryPensionResult } from '@/lib/types/pension'

interface Props {
  result: MilitaryPensionResult
}

export default function PensionSummary({ result }: Props) {
  const [showBasis, setShowBasis] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">예상 연금 수령액</h2>

      {/* 핵심 금액 */}
      <div className="text-center py-4 border-b border-gray-100 mb-4">
        <p className="text-sm text-gray-500 mb-1">세전 월 수령액</p>
        <p className="text-4xl md:text-5xl font-bold text-primary">
          ₩{result.monthlyPension.toLocaleString('ko-KR')}
        </p>
        <p className="text-base text-gray-600 mt-2">
          세후 월 수령액:{' '}
          <span className="font-semibold text-success">
            ₩{result.afterTaxMonthly.toLocaleString('ko-KR')}
          </span>
        </p>
      </div>

      {/* 요약 지표 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard
          label="연간 세전"
          value={`₩${(result.annualPension / 10000).toFixed(0)}만`}
        />
        <MetricCard
          label="연간 세후"
          value={`₩${(result.afterTaxAnnual / 10000).toFixed(0)}만`}
          highlight
        />
        <MetricCard
          label="지급률"
          value={`${result.paymentRate.toFixed(2)}%`}
        />
        <MetricCard
          label="실효세율"
          value={`${result.effectiveTaxRate.toFixed(1)}%`}
        />
      </div>

      {/* 계산 근거 아코디언 */}
      <button
        type="button"
        onClick={() => setShowBasis(!showBasis)}
        aria-expanded={showBasis}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-600 transition-colors w-full text-left py-2"
      >
        <Info className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        계산 근거 및 적용 규정
        {showBasis ? (
          <ChevronUp className="h-4 w-4 ml-auto" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto" aria-hidden="true" />
        )}
      </button>

      {showBasis && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">
            적용 규정 버전: {result.calculationBasis.ruleVersion}
          </p>
          <ul className="space-y-1.5" role="list">
            {result.calculationBasis.basisNote.map((note, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-primary font-bold mt-0.5 flex-shrink-0">·</span>
                {note}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            ※ 본 계산은 시뮬레이션 도구이며 투자 조언이 아닙니다.
            실제 수령액은 각 공단(공무원연금공단·군인공제회·사학연금공단·국민연금공단)에 문의하세요.
          </p>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg p-3 text-center',
        highlight ? 'bg-success/10 border border-success/30' : 'bg-gray-50'
      )}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={cn(
          'text-base font-bold',
          highlight ? 'text-success' : 'text-gray-800'
        )}
      >
        {value}
      </p>
    </div>
  )
}
