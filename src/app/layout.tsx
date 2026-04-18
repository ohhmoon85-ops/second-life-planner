import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SessionProvider from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: {
    default: 'Second Life Planner — 4050 은퇴 설계 AI',
    template: '%s | Second Life Planner',
  },
  description:
    '군인·공무원·사학·국민연금 + 건보료 피부양자 + 재취업 가능성을 단일 화면에서 통합 시뮬레이션. 4050 예비역·공직자를 위한 은퇴 설계 플랫폼.',
  keywords: ['군인연금', '공무원연금', '은퇴설계', '연금 계산기', '4050', '예비역'],
  openGraph: {
    title: 'Second Life Planner — 4050 은퇴 설계 AI',
    description: '규정 하나가 연 1,500만원 차이를 만듭니다.',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-gray-50 text-gray-900">
        <SessionProvider>
          <Header />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
