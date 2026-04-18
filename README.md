# Second Life Planner

4050 예비역·공직자를 위한 은퇴 설계 시뮬레이션 SaaS. 군인·공무원·사학·국민연금, 건보료 피부양자, 재취업 가능성을 단일 화면에서 통합 시뮬레이션합니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 App Router (TypeScript) |
| 스타일 | Tailwind CSS |
| 차트 | Recharts |
| 폼 | react-hook-form + zod |
| **DB** | **Neon (Serverless PostgreSQL)** |
| **ORM** | **Drizzle ORM** |
| **인증** | **Auth.js v5 (카카오 OAuth)** |
| 배포 | Vercel (서울 리전 icn1) |
| 테스트 | Vitest |

---

## 로컬 개발 방법

```bash
# 1. 저장소 클론
git clone https://github.com/ohhmoon85-ops/second-life-planner.git
cd second-life-planner

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 아래 값 입력:
#   DATABASE_URL     → Neon 콘솔에서 복사
#   AUTH_SECRET      → openssl rand -base64 32
#   KAKAO_CLIENT_ID  → 카카오 개발자 콘솔
#   KAKAO_CLIENT_SECRET

# 4. DB 마이그레이션 실행
npm run db:generate
npm run db:migrate

# 5. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## Neon DB 설정 (무료)

1. [console.neon.tech](https://console.neon.tech) 가입
2. **New Project** → 프로젝트 이름 입력, Region: **ap-southeast-1 (Singapore)**
3. **Connection String** 복사 → `.env.local`의 `DATABASE_URL`에 붙여넣기
4. `npm run db:migrate` 실행 → 테이블 자동 생성

---

## 카카오 OAuth 설정

1. [developers.kakao.com](https://developers.kakao.com) → **내 애플리케이션 추가**
2. **앱 키** → REST API 키 복사 → `KAKAO_CLIENT_ID`
3. **카카오 로그인** 활성화 → **Redirect URI 등록**:
   - 로컬: `http://localhost:3000/api/auth/callback/kakao`
   - 프로덕션: `https://your-domain.com/api/auth/callback/kakao`
4. **보안** → Client Secret 생성 → `KAKAO_CLIENT_SECRET`

---

## Vercel 배포 방법

1. GitHub에 코드 push
2. [vercel.com](https://vercel.com) 가입 후 **GitHub 연동**
3. **Import Repository** → `second-life-planner` 선택
4. **Environment Variables** 등록:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `KAKAO_CLIENT_ID`
   - `KAKAO_CLIENT_SECRET`
   - `AUTH_URL` (= `https://your-domain.vercel.app`)
5. **Deploy** 클릭

---

## DB 관리 명령어

```bash
npm run db:generate   # 스키마 변경 후 마이그레이션 파일 생성
npm run db:migrate    # 마이그레이션 실행
npm run db:studio     # Drizzle Studio (브라우저 DB 뷰어)
```

---

## 테스트 실행

```bash
npm run test          # 전체 테스트 (20개 계산기 단위 테스트)
npm run type-check    # TypeScript 타입 검사
npm run lint          # ESLint 검사
```

---

## 배포 전 체크리스트

- [ ] Neon 프로젝트 생성 및 `DATABASE_URL` 설정
- [ ] `npm run db:migrate` 로 테이블 생성 확인
- [ ] 카카오 개발자 앱 생성 및 Redirect URI 등록
- [ ] `AUTH_SECRET` 랜덤 문자열 생성 및 등록
- [ ] Vercel 환경변수 전체 등록
- [ ] 커스텀 도메인 및 SSL 인증서
- [ ] 카카오 Redirect URI에 프로덕션 URL 추가
- [ ] 모바일/태블릿/데스크탑 실기기 테스트
- [ ] Lighthouse Performance/Accessibility 90+ 확인
