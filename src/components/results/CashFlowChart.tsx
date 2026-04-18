'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MilitaryPensionResult } from '@/lib/types/pension'

interface Props {
  result: MilitaryPensionResult
}

export default function CashFlowChart({ result }: Props) {
  const data = result.inflationAdjustedProjection.map((entry) => ({
    year: `${entry.year}년`,
    '명목 수령액': Math.round(entry.nominalAmount / 10000),
    '실질 수령액': Math.round(entry.realAmount / 10000),
  }))

  function customTooltipFormatter(value: number) {
    return [`${value.toLocaleString('ko-KR')}만원`]
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-1">10년 물가 연동 시뮬레이션</h2>
      <p className="text-sm text-gray-500 mb-4">
        연 2.5% 물가상승률 가정 | 단위: 만원/월
      </p>

      {/* 차트 접근성: 스크린리더용 테이블 */}
      <div className="sr-only">
        <table>
          <caption>10년 월 연금 수령액 예측</caption>
          <thead>
            <tr>
              <th scope="col">연도</th>
              <th scope="col">명목 수령액 (만원)</th>
              <th scope="col">실질 수령액 (만원)</th>
            </tr>
          </thead>
          <tbody>
            {result.inflationAdjustedProjection.map((entry) => (
              <tr key={entry.year}>
                <td>{entry.year}년</td>
                <td>{Math.round(entry.nominalAmount / 10000)}</td>
                <td>{Math.round(entry.realAmount / 10000)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 실제 차트: 모바일 가로 스크롤 가능 */}
      <div
        className="overflow-x-auto"
        role="img"
        aria-label="10년간 월 연금 수령액 명목·실질 비교 차트"
      >
        <div className="min-w-[320px]">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${v}만`}
                width={55}
              />
              <Tooltip
                formatter={customTooltipFormatter}
                contentStyle={{ fontSize: '13px' }}
              />
              <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} />
              <Line
                type="monotone"
                dataKey="명목 수령액"
                stroke="#E85D04"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="실질 수령액"
                stroke="#1E3A5F"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400 text-center">
        실질 수령액 = 2026년 구매력 기준 / 명목 수령액 = 물가연동 후 실제 수령액
      </p>
    </div>
  )
}
