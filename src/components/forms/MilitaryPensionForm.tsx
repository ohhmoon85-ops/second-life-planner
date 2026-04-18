'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { MilitaryPensionInput } from '@/lib/types/pension'

const schema = z.object({
  birthDate: z.string().min(1, '생년월일을 입력해주세요'),
  rank: z.enum(['대위', '소령', '중령', '대령', '장성급'], {
    errorMap: () => ({ message: '계급을 선택해주세요' }),
  }),
  retirementDate: z.string().min(1, '전역일을 입력해주세요'),
  serviceYears: z
    .number({ invalid_type_error: '복무연수를 입력해주세요' })
    .int()
    .min(20, '최소 20년 이상 복무해야 연금 수령이 가능합니다')
    .max(40, '40년을 초과할 수 없습니다'),
  serviceMonths: z
    .number({ invalid_type_error: '월수를 입력해주세요' })
    .int()
    .min(0)
    .max(11),
  avgBaseMonthlySalary: z
    .number({ invalid_type_error: '평균 기준소득월액을 입력해주세요' })
    .int()
    .min(1_000_000, '최소 100만원 이상 입력해주세요')
    .max(20_000_000, '금액을 확인해주세요'),
  combatYears: z.number().int().min(0).max(30).optional(),
  earlyRetirement: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (data: MilitaryPensionInput) => void
  isLoading: boolean
}

export default function MilitaryPensionForm({ onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceMonths: 0,
      combatYears: 0,
      earlyRetirement: false,
    },
  })

  const earlyRetirement = watch('earlyRetirement')
  const avgSalary = watch('avgBaseMonthlySalary')

  function handleSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = parseInt(raw, 10)
    setValue('avgBaseMonthlySalary', isNaN(num) ? 0 : num, { shouldValidate: true })
    e.target.value = isNaN(num) ? '' : num.toLocaleString('ko-KR')
  }

  function handleFormSubmit(data: FormValues) {
    onSubmit({
      birthDate: data.birthDate,
      retirementDate: data.retirementDate,
      rank: data.rank,
      serviceYears: data.serviceYears,
      serviceMonths: data.serviceMonths,
      avgBaseMonthlySalary: data.avgBaseMonthlySalary,
      combatYears: data.combatYears,
      earlyRetirement: data.earlyRetirement,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <h2 className="text-lg font-semibold text-primary mb-4">기본 정보</h2>
        <div className="space-y-4">
          <FieldGroup
            label="생년월일"
            htmlFor="birthDate"
            error={errors.birthDate?.message}
            helper="YYYY-MM-DD 형식"
          >
            <input
              id="birthDate"
              type="date"
              autoComplete="bday"
              aria-invalid={!!errors.birthDate}
              aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
              className={inputClass(!!errors.birthDate)}
              {...register('birthDate')}
            />
          </FieldGroup>

          <FieldGroup label="계급" htmlFor="rank" error={errors.rank?.message}>
            <select
              id="rank"
              aria-invalid={!!errors.rank}
              className={inputClass(!!errors.rank)}
              {...register('rank')}
            >
              <option value="">계급 선택</option>
              {(['대위', '소령', '중령', '대령', '장성급'] as const).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="전역일" htmlFor="retirementDate" error={errors.retirementDate?.message}>
            <input
              id="retirementDate"
              type="date"
              autoComplete="off"
              aria-invalid={!!errors.retirementDate}
              className={inputClass(!!errors.retirementDate)}
              {...register('retirementDate')}
            />
          </FieldGroup>
        </div>
      </div>

      {/* 복무 기간 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <h2 className="text-lg font-semibold text-primary mb-4">복무 기간</h2>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="복무연수" htmlFor="serviceYears" error={errors.serviceYears?.message}>
            <input
              id="serviceYears"
              type="number"
              inputMode="numeric"
              min="20"
              max="40"
              autoComplete="off"
              placeholder="예: 30"
              aria-invalid={!!errors.serviceYears}
              className={inputClass(!!errors.serviceYears)}
              {...register('serviceYears', { valueAsNumber: true })}
            />
          </FieldGroup>

          <FieldGroup label="추가 개월수" htmlFor="serviceMonths" error={errors.serviceMonths?.message}>
            <input
              id="serviceMonths"
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              autoComplete="off"
              placeholder="예: 6"
              aria-invalid={!!errors.serviceMonths}
              className={inputClass(!!errors.serviceMonths)}
              {...register('serviceMonths', { valueAsNumber: true })}
            />
          </FieldGroup>
        </div>
      </div>

      {/* 소득 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <h2 className="text-lg font-semibold text-primary mb-4">소득 정보</h2>
        <FieldGroup
          label="평균 기준소득월액 (원)"
          htmlFor="avgBaseMonthlySalary"
          error={errors.avgBaseMonthlySalary?.message}
          helper="전역 직전 3년 평균 월급. 급여명세서 참조"
        >
          <input
            id="avgBaseMonthlySalary"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="예: 6,000,000"
            aria-invalid={!!errors.avgBaseMonthlySalary}
            aria-describedby="avgSalary-helper"
            className={inputClass(!!errors.avgBaseMonthlySalary)}
            defaultValue=""
            onChange={handleSalaryChange}
          />
          {avgSalary > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              월 {(avgSalary / 10000).toLocaleString('ko-KR')}만원
            </p>
          )}
        </FieldGroup>
      </div>

      {/* 특수 사항 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">특수 사항 (선택)</h2>
        <div className="space-y-4">
          <FieldGroup
            label="전투·대간첩작전 참가 연수"
            htmlFor="combatYears"
            error={errors.combatYears?.message}
            helper="해당 없으면 0 입력 (연 0.5% 가산, 최대 5%)"
          >
            <input
              id="combatYears"
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              autoComplete="off"
              placeholder="예: 2"
              className={inputClass(!!errors.combatYears)}
              {...register('combatYears', { valueAsNumber: true })}
            />
          </FieldGroup>

          <div className="flex items-center justify-between py-2">
            <div>
              <label htmlFor="earlyRetirement" className="text-base font-medium text-gray-800">
                조기 전역 여부
              </label>
              <p className="text-sm text-gray-600 mt-0.5">해당 시 연금 5% 감액</p>
            </div>
            <button
              type="button"
              role="switch"
              id="earlyRetirement"
              aria-checked={earlyRetirement}
              onClick={() => setValue('earlyRetirement', !earlyRetirement)}
              className={cn(
                'relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                earlyRetirement ? 'bg-accent' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                  earlyRetirement ? 'translate-x-8' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 제출 버튼 (데스크탑) */}
      <div className="hidden sm:block">
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full h-14 bg-accent hover:bg-accent-600 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              계산 중...
            </>
          ) : (
            '군인연금 계산하기'
          )}
        </button>
      </div>

      {/* 모바일 하단 고정 버튼 */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-10">
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full h-16 bg-accent hover:bg-accent-600 disabled:opacity-60 text-white text-lg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              계산 중...
            </>
          ) : (
            '군인연금 계산하기'
          )}
        </button>
      </div>
    </form>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'block w-full h-14 rounded-lg border px-4 text-base transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    hasError
      ? 'border-danger bg-red-50 focus:ring-danger'
      : 'border-gray-300 bg-white focus:ring-primary'
  )
}

interface FieldGroupProps {
  label: string
  htmlFor: string
  error?: string
  helper?: string
  children: React.ReactNode
}

function FieldGroup({ label, htmlFor, error, helper, children }: FieldGroupProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-base font-medium text-gray-800 mb-1.5">
        {label}
      </label>
      {children}
      {helper && !error && (
        <p id={`${htmlFor}-helper`} className="mt-1.5 text-sm text-gray-600">
          {helper}
        </p>
      )}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 text-base font-medium text-danger flex items-center gap-1"
        >
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  )
}
