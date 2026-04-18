export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import SuccessContent from './SuccessContent'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  )
}
