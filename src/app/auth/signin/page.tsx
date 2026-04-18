export const dynamic = 'force-dynamic'

import SignInForm from './SignInForm'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <svg className="h-12 w-12 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">로그인</h1>
        <p className="text-gray-500 text-sm mb-8">
          계산 결과를 저장하고 이력을 관리하려면 로그인하세요
        </p>
        <SignInForm />
        <p className="mt-6 text-xs text-gray-400 leading-relaxed">
          로그인 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주합니다.
          <br />
          카카오 계정 외 정보는 수집하지 않습니다.
        </p>
      </div>
    </main>
  )
}
