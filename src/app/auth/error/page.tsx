import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorMessages: Record<string, string> = {
    OAuthSignin: '카카오 로그인을 시작하는 중 오류가 발생했습니다.',
    OAuthCallback: '카카오 로그인 처리 중 오류가 발생했습니다.',
    OAuthCreateAccount: '계정 생성 중 오류가 발생했습니다.',
    Default: '로그인 중 알 수 없는 오류가 발생했습니다.',
  }

  const message =
    errorMessages[searchParams.error ?? ''] ?? errorMessages.Default

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <AlertCircle className="h-12 w-12 text-danger mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-900 mb-3">로그인 오류</h1>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <Link
          href="/auth/signin"
          className="block w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-600 transition-colors"
        >
          다시 시도
        </Link>
        <Link
          href="/"
          className="block mt-3 text-sm text-gray-500 hover:text-gray-800"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  )
}
