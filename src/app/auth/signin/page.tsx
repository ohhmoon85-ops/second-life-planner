import { signIn } from '@/lib/auth'
import { Shield } from 'lucide-react'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-accent" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">로그인</h1>
        <p className="text-gray-500 text-sm mb-8">
          계산 결과를 저장하고 이력을 관리하려면 로그인하세요
        </p>

        <form
          action={async () => {
            'use server'
            await signIn('kakao', { redirectTo: '/simulator/military' })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-yellow-400 text-gray-900 font-semibold py-4 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 text-base"
          >
            <KakaoIcon />
            카카오로 시작하기
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400 leading-relaxed">
          로그인 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주합니다.
          <br />
          카카오 계정 외 정보는 수집하지 않습니다.
        </p>
      </div>
    </main>
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
