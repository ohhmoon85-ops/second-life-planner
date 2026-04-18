export const metadata = {
  title: '이용약관 | Second Life Planner',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이용약관</h1>
          <p className="text-sm text-gray-500 mt-1">시행일: 2026년 1월 1일</p>
        </div>

        <Section title="제1조 (목적)">
          <p>
            본 약관은 Second Life Planner(이하 "서비스")를 운영하는 문형철(이하 "회사")이 제공하는
            은퇴 설계 시뮬레이션 서비스의 이용 조건 및 절차, 회사와 이용자의 권리·의무 및
            책임사항을 규정함을 목적으로 합니다.
          </p>
        </Section>

        <Section title="제2조 (정의)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>"서비스"란 회사가 제공하는 공적연금 시뮬레이션, 건강보험료 계산, 재취업 시나리오 분석, AI 리포트 생성 등 일체의 온라인 서비스를 의미합니다.</li>
            <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 개인을 의미합니다.</li>
            <li>"유료 서비스"란 결제 후 이용 가능한 AI 리포트 생성 서비스를 의미합니다.</li>
          </ol>
        </Section>

        <Section title="제3조 (약관의 효력 및 변경)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다.</li>
            <li>회사는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자 7일 전 공지합니다.</li>
            <li>이용자가 변경된 약관에 동의하지 않으면 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
          </ol>
        </Section>

        <Section title="제4조 (서비스의 제공 및 변경)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검·장애 등으로 일시 중단될 수 있습니다.</li>
            <li>회사는 서비스 내용을 변경할 경우 사전에 공지합니다. 단, 불가피한 사정이 있을 경우 사후 통지할 수 있습니다.</li>
          </ol>
        </Section>

        <Section title="제5조 (서비스의 성격 및 면책)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>본 서비스의 모든 계산 결과는 <strong>참고용 시뮬레이션</strong>이며, 법적·재정적 조언이 아닙니다.</li>
            <li>실제 연금 수령액, 건강보험료, 세금 등은 관련 공단 및 세무 전문가에게 확인하시기 바랍니다.</li>
            <li>회사는 시뮬레이션 결과를 신뢰하여 발생한 재산상 손실에 대해 책임을 지지 않습니다.</li>
            <li>AI 리포트는 입력된 정보를 기반으로 생성되며, 개인 상황에 따라 실제와 차이가 있을 수 있습니다.</li>
          </ol>
        </Section>

        <Section title="제6조 (유료 서비스 및 환불)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>AI 리포트 생성 서비스는 결제 후 제공됩니다.</li>
            <li>결제 완료 후 리포트가 생성된 경우 환불이 불가합니다.</li>
            <li>리포트 생성에 실패한 경우(기술적 오류) 전액 환불을 요청하실 수 있습니다.</li>
            <li>환불 요청: ohhmoon85@gmail.com</li>
          </ol>
        </Section>

        <Section title="제7조 (이용자의 의무)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>이용자는 서비스 이용 시 타인의 정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.</li>
            <li>서비스의 운영을 방해하거나 서버에 과부하를 주는 행위를 금지합니다.</li>
            <li>서비스에서 생성된 결과물을 무단으로 상업적 목적에 사용해서는 안 됩니다.</li>
          </ol>
        </Section>

        <Section title="제8조 (지적재산권)">
          <p>
            서비스 내 모든 콘텐츠(계산 로직, UI, AI 프롬프트, 리포트 형식 등)의 지적재산권은
            회사에 귀속됩니다. 이용자는 서비스를 통해 얻은 결과물을 개인적 용도로만 사용할 수 있습니다.
          </p>
        </Section>

        <Section title="제9조 (준거법 및 관할)">
          <p>
            본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련한 분쟁은
            회사 소재지 관할 법원을 전속 관할 법원으로 합니다.
          </p>
        </Section>

        <div className="text-sm text-gray-500 border-t pt-4">
          <p>문의: ohhmoon85@gmail.com</p>
          <p>운영자: 문형철</p>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </section>
  )
}
