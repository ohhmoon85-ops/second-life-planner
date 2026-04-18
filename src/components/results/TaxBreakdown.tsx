'use client'

import type { MilitaryPensionResult } from '@/lib/types/pension'
import { calcPensionTax } from '@/lib/calculators/income-tax'

interface Props {
  result: MilitaryPensionResult
}

export default function TaxBreakdown({ result }: Props) {
  const tax = calcPensionTax(result.annualPension)

  const rows = [
    { label: '연간 세전 수령액', value: tax.grossIncome, note: '' },
    { label: '연금소득공제', value: -tax.pensionDeduction, note: '소득세법 제47조의2' },
    { label: '과세표준', value: tax.taxableIncome, note: '' },
    { label: '산출세액 (소득세)', value: -tax.incomeTax, note: '누진세율 적용' },
    { label: '지방소득세', value: -tax.localTax, note: '소득세의 10%' },
    { label: '세후 연간 수령액', value: tax.afterTaxAnnual, note: '', highlight: true },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">세금 계산 상세</h2>

      {/* 모바일: 리스트 스타일 */}
      <div className="md:hidden space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex justify-between items-start py-2 border-b border-gray-100 last:border-0 ${
              row.highlight ? 'font-bold text-success' : ''
            }`}
          >
            <div>
              <p className={`text-sm ${row.highlight ? 'text-success font-semibold' : 'text-gray-700'}`}>
                {row.label}
              </p>
              {row.note && <p className="text-xs text-gray-400 mt-0.5">{row.note}</p>}
            </div>
            <p
              className={`text-sm font-medium tabular-nums ${
                row.value < 0
                  ? 'text-danger'
                  : row.highlight
                  ? 'text-success'
                  : 'text-gray-800'
              }`}
            >
              {row.value < 0 ? '-' : ''}
              {Math.abs(row.value).toLocaleString('ko-KR')}원
            </p>
          </div>
        ))}
      </div>

      {/* 데스크탑: 테이블 스타일 */}
      <table className="hidden md:table w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="text-left py-2 font-medium text-gray-500 w-1/2">
              항목
            </th>
            <th scope="col" className="text-right py-2 font-medium text-gray-500">
              금액 (원)
            </th>
            <th scope="col" className="text-right py-2 font-medium text-gray-500 pl-4">
              근거
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-gray-100 last:border-0 ${
                row.highlight ? 'bg-success/5' : ''
              }`}
            >
              <td className={`py-2.5 ${row.highlight ? 'font-bold text-success' : 'text-gray-700'}`}>
                {row.label}
              </td>
              <td
                className={`py-2.5 text-right tabular-nums font-medium ${
                  row.value < 0
                    ? 'text-danger'
                    : row.highlight
                    ? 'text-success font-bold'
                    : 'text-gray-800'
                }`}
              >
                {row.value < 0 ? '-' : ''}
                {Math.abs(row.value).toLocaleString('ko-KR')}
              </td>
              <td className="py-2.5 text-right text-gray-400 text-xs pl-4">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          실효세율:{' '}
          <span className="font-semibold">{tax.effectiveTaxRate.toFixed(1)}%</span>
          <span className="text-xs text-gray-400 ml-2">
            (= 총 세액 ÷ 세전 수령액)
          </span>
        </p>
      </div>
    </div>
  )
}
