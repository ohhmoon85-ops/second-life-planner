# Second Life Planner

4050 예비역·공직자를 위한 은퇴 설계 시뮬레이션 SaaS. 군인·공무원·사학·국민연금, 건보료 피부양자, 재취업 가능성을 단일 화면에서 통합 시뮬레이션합니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 App Router (TypeScript) |
| 스타일 | Tailwind CSS + shadcn/ui |
| 차트 | Recharts |
| 폼 | react-hook-form + zod |
| DB/Auth | Supabase (카카오 소셜 로그인) |
| 배포 | Vercel (서울 리전 icn1) |
| 테스트 | Vitest + @testing-library/react |

---

## 로컬 개발 방법

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/second-life-planner.git
cd second-life-planner

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase URL/Key 입력

# 4. 개발 서버 실행
npm run dev
# → http://localhost:3000 접속
```

---

## Vercel 배포 방법

1. GitHub에 코드 push
2. [vercel.com](https://vercel.com) 가입 후 **GitHub 연동**
3. **Import Repository** → `second-life-planner` 선택
4. Framework: **Next.js** 자동 감지 확인
5. **Environment Variables** 탭에서 `.env.local.example` 값 등록
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
6. **Deploy** 클릭
7. (선택) 커스텀 도메인 연결: **Settings → Domains → Add**

---

## 테스트 실행

```bash
npm run test          # 전체 테스트
npm run test:watch    # 감시 모드
npm run type-check    # TypeScript 타입 검사
npm run lint          # ESLint 검사
```

---

## 기여 가이드

1. `feature/기능명` 브랜치 생성
2. 변경 후 PR 생성 → GitHub Actions CI 통과 확인
3. Vercel Preview URL로 모바일 테스트
4. main 브랜치 머지 → 자동 프로덕션 배포

---

## 배포 전 체크리스트

- [ ] Supabase 프로젝트 생성 및 URL/Key 설정
- [ ] Vercel 프로젝트에 환경변수 등록
- [ ] 커스텀 도메인 및 SSL 인증서 확인
- [ ] robots.txt / sitemap.ts 생성
- [ ] Google Analytics 4 연동 (NEXT_PUBLIC_GA_ID)
- [ ] 모바일/태블릿/데스크탑에서 실기기 테스트
- [ ] Lighthouse 점수 Performance/Accessibility 90+ 확인
