'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-lg" aria-hidden="true" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? '프로필'}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm text-gray-700 hidden sm:block max-w-24 truncate">
          {session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-500 hover:text-gray-800 px-2 py-1 rounded transition-colors"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('kakao')}
      className="flex items-center gap-2 bg-[#FEE500] hover:bg-yellow-400 text-gray-900 text-sm font-medium px-4 py-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
    >
      <KakaoIcon />
      카카오 로그인
    </button>
  )
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0C4.029 0 0 3.138 0 7.01c0 2.49 1.568 4.674 3.938 5.914l-.957 3.572a.35.35 0 0 0 .533.38L7.76 14.52A10.77 10.77 0 0 0 9 14.02C13.971 14.02 18 10.882 18 7.01 18 3.138 13.971 0 9 0Z"
        fill="#000"
      />
    </svg>
  )
}
