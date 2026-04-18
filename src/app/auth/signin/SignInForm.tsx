'use client'

import { signIn } from 'next-auth/react'

export default function SignInForm() {
  return (
    <button
      type="button"
      onClick={() => signIn('kakao', { callbackUrl: '/simulator/health-insurance' })}
      className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-yellow-400 text-gray-900 font-semibold py-4 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 text-base"
    >
      <KakaoIcon />
      카카오로 시작하기
    </button>
  )
}

function KakaoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0C4.029 0 0 3.138 0 7.01c0 2.49 1.568 4.674 3.938 5.914l-.957 3.572a.35.35 0 0 0 .533.38L7.76 14.52A10.77 10.77 0 0 0 9 14.02C13.971 14.02 18 10.882 18 7.01 18 3.138 13.971 0 9 0Z"
        fill="#000"
      />
    </svg>
  )
}
