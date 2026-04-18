export const metadata = {
  title: '개인정보처리방침 | Second Life Planner',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">개인정보처리방침</h1>
          <p className="text-sm text-gray-500 mt-1">시행일: 2026년 1월 1일</p>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          Second Life Planner(이하 &ldquo;서비스&rdquo;)는 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등
          관련 법령을 준수하며, 이용자의 개인정보를 안전하게 보호합니다.
        </p>

        <Section title="제1조 (수집하는 개인정보 항목)">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <Th>구분</Th>
                <Th>항목</Th>
                <Th>수집 방법</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>소셜 로그인</Td>
                <Td>카카오 계정 이메일, 닉네임, 프로필 이미지</Td>
                <Td>카카오 OAuth</Td>
              </tr>
              <tr>
                <Td>시뮬레이션 입력</Td>
                <Td>나이, 복무연수, 연금 수령액, 재산 정보 (서버 미저장)</Td>
                <Td>직접 입력</Td>
              </tr>
              <tr>
                <Td>결제</Td>
                <Td>결제 수단 정보 (토스페이먼츠가 직접 처리, 당사 미보관)</Td>
                <Td>토스페이먼츠 결제창</Td>
              </tr>
              <tr>
                <Td>서비스 이용</Td>
                <Td>접속 IP, 브라우저 정보, 접속 일시</Td>
                <Td>자동 수집</Td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="제2조 (개인정보 수집·이용 목적)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>회원 식별 및 로그인 서비스 제공</li>
            <li>AI 리포트 생성 및 결제 내역 관리</li>
            <li>서비스 품질 개선 및 오류 분석</li>
            <li>법령상 의무 이행</li>
          </ol>
        </Section>

        <Section title="제3조 (개인정보 보유 및 이용 기간)">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <Th>항목</Th>
                <Th>보유 기간</Th>
                <Th>근거</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>회원 계정 정보</Td>
                <Td>회원 탈퇴 시까지</Td>
                <Td>이용자 동의</Td>
              </tr>
              <tr>
                <Td>결제 기록</Td>
                <Td>5년</Td>
                <Td>전자상거래법 §6</Td>
              </tr>
              <tr>
                <Td>접속 로그</Td>
                <Td>3개월</Td>
                <Td>통신비밀보호법 §15의2</Td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="제4조 (개인정보 제3자 제공)">
          <p>
            회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
            다만, 아래의 경우는 예외입니다.
          </p>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ol>
        </Section>

        <Section title="제5조 (개인정보 처리 위탁)">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <Th>수탁업체</Th>
                <Th>위탁 업무</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>Kakao Corp.</Td>
                <Td>소셜 로그인 인증</Td>
              </tr>
              <tr>
                <Td>토스페이먼츠(주)</Td>
                <Td>결제 처리</Td>
              </tr>
              <tr>
                <Td>Neon Inc. (Vercel Postgres)</Td>
                <Td>데이터베이스 호스팅</Td>
              </tr>
              <tr>
                <Td>Anthropic PBC</Td>
                <Td>AI 리포트 생성 (입력 데이터 일시 전송)</Td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="제6조 (이용자의 권리)">
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>개인정보 열람 요청</li>
            <li>개인정보 정정·삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
            <li>회원 탈퇴 (서비스 내 탈퇴 기능 또는 이메일 요청)</li>
          </ol>
          <p className="mt-2">요청 처리 기한: 수령일로부터 10일 이내</p>
        </Section>

        <Section title="제7조 (개인정보 보호 조치)">
          <ol className="list-decimal pl-5 space-y-1">
            <li>전송 구간 TLS(HTTPS) 암호화</li>
            <li>비밀번호 미사용 (소셜 로그인 전용)</li>
            <li>데이터베이스 접근 권한 최소화</li>
            <li>시뮬레이션 입력값은 서버에 저장하지 않음 (결과 계산 후 즉시 폐기)</li>
          </ol>
        </Section>

        <Section title="제8조 (쿠키 및 세션)">
          <p>
            서비스는 로그인 상태 유지를 위해 세션 쿠키를 사용합니다.
            브라우저에서 쿠키를 비활성화하면 로그인이 필요한 서비스 이용이 제한될 수 있습니다.
          </p>
        </Section>

        <Section title="제9조 (개인정보 보호책임자)">
          <ul className="space-y-1">
            <li>성명: 문형철</li>
            <li>이메일: ohhmoon85@gmail.com</li>
          </ul>
          <p className="mt-2">
            개인정보 침해 신고·상담은 개인정보보호위원회(privacy.go.kr, 국번없이 182) 또는
            한국인터넷진흥원(privacy.kisa.or.kr, 국번없이 118)에 문의하실 수 있습니다.
          </p>
        </Section>

        <div className="text-sm text-gray-500 border-t pt-4">
          <p>공고일: 2026년 1월 1일 | 시행일: 2026년 1월 1일</p>
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">{children}</th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="border border-gray-200 px-3 py-2 text-gray-700">{children}</td>
  )
}
