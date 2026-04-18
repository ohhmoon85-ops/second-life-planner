export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-3">Second Life Planner</h3>
            <p className="text-sm leading-relaxed">
              4050 예비역·공직자를 위한 은퇴 설계 시뮬레이션 플랫폼
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">법적 고지</h3>
            <p className="text-sm leading-relaxed">
              본 서비스는 시뮬레이션 도구이며 투자 조언이 아닙니다.
              실제 연금 수령액은 각 공단(공무원연금공단·군인공제회·사학연금공단·국민연금공단)에 문의하세요.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">법적 문서</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  이용약관
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-xs">© 2026 Second Life Planner. All rights reserved.</p>
          <p className="text-xs">
            사업자등록번호: 000-00-00000 | 대표: 문형철
          </p>
        </div>
      </div>
    </footer>
  )
}
