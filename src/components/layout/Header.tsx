import Link from 'next/link'
import { Shield } from 'lucide-react'
import AuthButton from '@/components/auth/AuthButton'

const navLinks = [
  { href: '/simulator/health-insurance', label: '건보료 계산' },
  { href: '/simulator/reemployment',     label: '재취업 시나리오' },
  { href: '/simulator/military',         label: '군인연금' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/"
            className="flex items-center gap-2 font-bold text-primary text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
            aria-label="Second Life Planner 홈으로">
            <Shield className="h-6 w-6 text-accent" aria-hidden="true" />
            <span className="hidden sm:inline">Second Life Planner</span>
            <span className="sm:hidden">SLP</span>
          </Link>

          <nav aria-label="주 메뉴" className="flex items-center gap-1">
            <ul className="hidden md:flex items-center gap-1" role="list">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* 모바일 드롭다운 */}
            <details className="md:hidden relative group">
              <summary className="list-none px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer select-none">
                메뉴 ▾
              </summary>
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                {navLinks.map(({ href, label }) => (
                  <Link key={href} href={href}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                    {label}
                  </Link>
                ))}
              </div>
            </details>

            <Link href="/#pricing"
              className="ml-1 px-3 py-2 text-sm font-medium bg-accent text-white hover:bg-orange-700 rounded-lg transition-colors">
              리포트
            </Link>
            <div className="ml-1">
              <AuthButton />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
