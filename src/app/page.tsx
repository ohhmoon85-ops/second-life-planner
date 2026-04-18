import Link from 'next/link'
import {
  Shield,
  TrendingDown,
  AlertCircle,
  FileText,
  Home,
  CheckCircle2,
  Calculator,
  Clock,
  RefreshCw,
  Star,
} from 'lucide-react'

export default function HomePage() {
  return (
    <main>
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            4대 연금·건보료·재취업 통합 시뮬레이션
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
            당신이 모르는 규정 하나가<br className="hidden sm:block" />
            <span className="text-accent"> 연 1,500만원 차이</span>를 만듭니다
          </h1>
          <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
            군인·공무원·사학·국민연금 + 건보료 피부양자 + 재취업 가능성을
            <br className="hidden sm:block" />
            ₩19,900 한 번으로 통합 시뮬레이션
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/simulator/health-insurance"
              className="btn-primary px-8 py-4 text-lg rounded-xl inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              무료로 건보료 계산하기
            </Link>
            <Link
              href="/simulator/reemployment"
              className="btn-outline border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg rounded-xl inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5" aria-hidden="true" />
              재취업 시나리오 비교
            </Link>
          </div>
        </div>
      </section>

      {/* 문제 제기 섹션 */}
      <section id="about" className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            혹시 이런 고민 있으신가요?
          </h2>
          <p className="text-center text-gray-500 mb-10">
            4050 예비역·공직자가 가장 많이 놓치는 4가지
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ProblemCard
              icon={<Shield className="h-6 w-6 text-danger" />}
              title="건보료 피부양자 탈락"
              desc="연금 수령 시작과 동시에 건보료 피부양자 자격 상실. 연 400~700만원 추가 부담이 발생할 수 있습니다."
              highlight="연 400~700만원 손실"
            />
            <ProblemCard
              icon={<TrendingDown className="h-6 w-6 text-danger" />}
              title="재취업 가능성 미인지"
              desc="전역 후 재취업 시 연금 일부 정지(연금법 시행령)를 모르면 연 1,500~3,000만원 손실 위험."
              highlight="연 1,500~3,000만원 손실"
            />
            <ProblemCard
              icon={<AlertCircle className="h-6 w-6 text-accent" />}
              title="소득세 구조 복잡"
              desc="연금소득공제 구간 착오, 지방소득세 누락 등 세금 계산 오류로 실수령액을 과대 추정하는 경우가 많습니다."
              highlight="계산 오류 빈번"
            />
            <ProblemCard
              icon={<Home className="h-6 w-6 text-accent" />}
              title="주택연금·퇴직금 조합 미활용"
              desc="군인연금 + 주택연금 + 퇴직금 최적 조합을 모르면 노후 현금흐름이 불안정해집니다."
              highlight="최적 조합 미활용"
            />
          </div>
        </div>
      </section>

      {/* 솔루션 섹션 */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Second Life Planner가 해결합니다
          </h2>
          <p className="text-center text-gray-500 mb-10">
            복잡한 규정을 자동으로 적용해 정확한 수령액을 계산
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SolutionCard
              icon={<CheckCircle2 className="h-7 w-7 text-primary" />}
              title="건보료 피부양자 판정"
              desc="연금 수령 시 피부양자 유지 가능 여부와 옵션별 보험료 비교. 연간 절약액 자동 계산"
              href="/simulator/health-insurance"
              ctaLabel="건보료 계산하기 →"
            />
            <SolutionCard
              icon={<RefreshCw className="h-7 w-7 text-primary" />}
              title="재취업 5가지 시나리오"
              desc="공무원·공공기관·민간·자영업·무직별 군인연금 삭감액 + 건보료 + 실수령액 비교"
              href="/simulator/reemployment"
              ctaLabel="시나리오 비교하기 →"
            />
            <SolutionCard
              icon={<Calculator className="h-7 w-7 text-primary" />}
              title="군인연금 세금 계산"
              desc="2026년 최신 군인연금법·소득세법 기준. 연금소득공제·지방소득세 포함 ±1% 보장"
              href="/simulator/military"
              ctaLabel="연금 계산하기 →"
            />
          </div>
        </div>
      </section>

      {/* 경쟁사 비교 */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
            왜 Second Life Planner인가요?
          </h2>

          {/* 데스크탑: 테이블 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th scope="col" className="text-left px-4 py-3 font-semibold">기능</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-center">Second Life<br />Planner</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-center">공단<br />계산기</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-center">금융사<br />계산기</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-center">FP<br />상담</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['군인·공무원 연금 통합', '✅', '⚠ 단독만', '❌', '✅'],
                  ['건보료 피부양자 계산', '✅', '❌', '❌', '✅'],
                  ['재취업 시나리오 비교', '✅', '❌', '❌', '✅'],
                  ['세금 상세 분해', '✅', '⚠ 일부', '⚠ 일부', '✅'],
                  ['즉시 결과 확인', '✅', '✅', '✅', '❌ 수일 소요'],
                  ['비용', '₩19,900', '무료', '무료', '₩200,000+'],
                ].map(([feature, a, b, c, d], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-700">{feature}</td>
                    <td className="px-4 py-3 text-center font-bold text-success">{a}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{b}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{c}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일: 카드 */}
          <div className="md:hidden space-y-4">
            {[
              { title: '공단 계산기', pros: '무료, 연금 단독 계산', cons: '건보료·재취업 시나리오 없음' },
              { title: '금융사 계산기', pros: '무료, 빠른 확인', cons: '군인·공무원 연금 미지원' },
              { title: 'FP 상담', pros: '전문가 맞춤 상담', cons: '₩200,000+, 수일 소요' },
            ].map((item) => (
              <div key={item.title} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-success mb-1">✅ {item.pros}</p>
                <p className="text-sm text-danger">❌ {item.cons}</p>
              </div>
            ))}
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                Second Life Planner
              </h3>
              <p className="text-sm text-success">✅ 4대 연금 통합 + 건보료 + 재취업 + 세금 상세</p>
              <p className="text-sm text-gray-600 mt-1">₩19,900 일회성 결제</p>
            </div>
          </div>
        </div>
      </section>

      {/* 가격 섹션 */}
      <section id="pricing" className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            투명한 가격
          </h2>
          <p className="text-center text-gray-500 mb-10">
            필요한 만큼만 결제하세요
          </p>

          {/* 모바일: 기본 리포트만 먼저 표시 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <PricingCard
              name="무료 체험"
              price="₩0"
              features={['군인연금 계산기', '세전/세후 월 수령액', '10년 물가연동 차트']}
              cta="무료로 시작"
              ctaHref="/simulator/military"
              variant="outline"
            />
            <PricingCard
              name="기본 리포트"
              price="₩19,900"
              badge="가장 많이 선택"
              features={[
                '군인연금 + 건보료 분석',
                '재취업 4가지 시나리오',
                '20페이지 PDF 리포트',
                '6개월 무료 규정 업데이트',
              ]}
              cta="리포트 구매"
              ctaHref="/#pricing"
              variant="primary"
            />
            <PricingCard
              name="연간 패스"
              price="₩29,000"
              features={[
                '기본 리포트 전체 포함',
                '4대 연금 통합 분석',
                '무제한 재계산',
                '1년 규정 업데이트',
              ]}
              cta="연간 패스 구매"
              ctaHref="/#pricing"
              variant="outline"
            />
          </div>
        </div>
      </section>

      {/* 신뢰 요소 */}
      <section className="py-10 px-4 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <TrustItem
              icon={<Clock className="h-6 w-6 text-primary mx-auto mb-2" />}
              text="4대 지역연금 공식 산정식 기반"
            />
            <TrustItem
              icon={<CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />}
              text="±1% 오차 보증"
            />
            <TrustItem
              icon={<RefreshCw className="h-6 w-6 text-primary mx-auto mb-2" />}
              text="6개월 무료 규정 업데이트"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function ProblemCard({
  icon,
  title,
  desc,
  highlight,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  highlight: string
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
          <p className="text-sm font-semibold text-danger mt-2">{highlight}</p>
        </div>
      </div>
    </div>
  )
}

function SolutionCard({
  icon,
  title,
  desc,
  href,
  ctaLabel,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  href: string
  ctaLabel: string
}) {
  return (
    <Link href={href} className="block bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-lg hover:border-primary/30 transition-all group">
      <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{desc}</p>
      <span className="text-sm font-medium text-accent group-hover:underline">{ctaLabel}</span>
    </Link>
  )
}

function PricingCard({
  name,
  price,
  badge,
  features,
  cta,
  ctaHref,
  variant,
}: {
  name: string
  price: string
  badge?: string
  features: string[]
  cta: string
  ctaHref: string
  variant: 'primary' | 'outline'
}) {
  return (
    <div
      className={`relative rounded-xl border-2 p-6 ${
        variant === 'primary'
          ? 'border-accent bg-white shadow-lg'
          : 'border-gray-200 bg-white'
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
          {badge}
        </span>
      )}
      <h3 className="font-bold text-gray-900 text-lg mb-1">{name}</h3>
      <p className="text-3xl font-bold text-primary mb-4">{price}</p>
      <ul className="space-y-2 mb-6" role="list">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
          variant === 'primary'
            ? 'bg-accent text-white hover:bg-orange-700'
            : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="py-3">
      {icon}
      <p className="text-sm font-medium text-gray-700">{text}</p>
    </div>
  )
}
