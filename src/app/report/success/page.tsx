'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    // 토스페이먼츠 결제 완료 후 리포트 페이지로 이동
    // 실제 구현 시 결제 검증 API 호출 필요
    const timer = setTimeout(() => {
      router.push('/report?paid=1')
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
        <p className="text-gray-500 mb-4">리포트 생성 페이지로 이동합니다...</p>
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
      </div>
    </div>
  )
}
