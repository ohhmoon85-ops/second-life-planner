import Link from 'next/link'
import { Shield } from 'lucide-react'
import AuthButton from '@/components/auth/AuthButton'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-primary text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
            aria-label="Second Life Planner 홈으로"
          >
            <Shield className="h-6 w-6 text-accent" aria-hidden="true" />
            <span>Second Life Planner</span>
          </Link>

          <nav aria-label="주 메뉴" className="flex items-center gap-2">
            <ul className="flex items-center gap-1" role="list">
              <li>
                <Link
                  href="/simulator/military"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  군인연금
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="px-3 py-2 text-sm font-medium bg-accent text-white hover:bg-orange-700 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  리포트 구매
                </Link>
              </li>
            </ul>
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  )
}
