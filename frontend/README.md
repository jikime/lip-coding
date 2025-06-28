# Lip Coding - Mentor-Mentee Matching Frontend

Next.js와 TypeScript로 구축된 멘토-멘티 매칭 애플리케이션의 프론트엔드입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Package Manager**: npm

## 주요 기능

### 인증 시스템
- 사용자 로그인/회원가입
- JWT 토큰 기반 인증
- 역할 기반 접근 제어 (멘토/멘티)

### 프로필 관리
- 개인 프로필 조회/수정
- 멘토: 기술 스택, 경력, 소개 관리
- 멘티: 관심 분야, 목표 관리

### 멘토 검색 및 매칭
- 기술 스택 기반 멘토 검색
- 정렬 옵션 (경력순, 평점순, 최신순)
- 매칭 요청 전송

### 매칭 요청 관리
- 멘토: 받은 요청 수락/거절
- 멘티: 보낸 요청 상태 확인

## 프로젝트 구조

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router 페이지
│   │   ├── globals.css      # 전역 스타일
│   │   ├── layout.tsx       # 루트 레이아웃
│   │   ├── page.tsx         # 홈페이지
│   │   ├── login/           # 로그인 페이지
│   │   ├── signup/          # 회원가입 페이지
│   │   ├── profile/         # 프로필 페이지
│   │   ├── mentors/         # 멘토 검색 페이지
│   │   └── requests/        # 요청 관리 페이지
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   └── Navigation.tsx   # 네비게이션 바
│   ├── hooks/               # 커스텀 React 훅
│   │   └── useAuth.ts       # 인증 상태 관리
│   ├── lib/                 # 유틸리티 및 설정
│   │   └── api.ts           # API 클라이언트
│   └── types/               # TypeScript 타입 정의
│       └── index.ts         # 공통 타입
├── package.json             # 의존성 및 스크립트
├── tsconfig.json           # TypeScript 설정
├── next.config.js          # Next.js 설정
├── tailwind.config.js      # Tailwind CSS 설정
└── postcss.config.js       # PostCSS 설정
```

## 설치 및 실행

### 사전 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 설치
```bash
cd frontend
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 프로덕션 실행
```bash
npm start
```

## 환경 설정

API 엔드포인트는 `next.config.js`에서 프록시로 설정되어 있습니다:
- 개발 환경: `http://localhost:8000/api`
- 프로덕션 환경: 배포된 백엔드 URL로 변경 필요

## API 연동

백엔드 API와의 통신은 `src/lib/api.ts`에서 관리됩니다:

- **Auth API**: 로그인, 회원가입, 토큰 갱신
- **User API**: 사용자 정보 조회/수정
- **Mentor API**: 멘토 목록 조회, 검색
- **Match Request API**: 매칭 요청 생성, 조회, 상태 업데이트

## 테스트 ID

UI 테스트를 위한 `data-testid` 속성이 모든 주요 요소에 추가되어 있습니다:

### 로그인/회원가입
- `email-input`, `password-input`
- `login-button`, `signup-button`
- `role-mentor`, `role-mentee`

### 멘토 검색
- `mentor-search-input`, `mentor-sort-select`
- `mentor-name-{id}`, `mentor-skill-{id}-{index}`
- `match-request-button-{id}`

### 요청 관리
- `received-requests-tab`, `sent-requests-tab`
- `request-{id}`, `request-status-{id}`
- `accept-request-{id}`, `reject-request-{id}`

## 주요 특징

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 지원
- Tailwind CSS를 활용한 responsive 레이아웃

### 접근성
- 적절한 ARIA 라벨 및 키보드 내비게이션
- 시맨틱 HTML 구조

### 사용자 경험
- 로딩 스테이트 및 에러 처리
- 직관적인 네비게이션
- 실시간 폼 밸리데이션

### 보안
- JWT 토큰 자동 갱신
- API 요청 인터셉터를 통한 인증 헤더 관리
- 역할 기반 라우트 보호

## 개발 가이드

### 새 페이지 추가
1. `src/app/` 디렉토리에 새 폴더 생성
2. `page.tsx` 파일 추가
3. 필요시 `Navigation.tsx`에 링크 추가

### 새 API 엔드포인트 추가
1. `src/lib/api.ts`에 API 함수 추가
2. 필요시 `src/types/index.ts`에 타입 정의 추가

### 스타일 커스터마이징
- `src/app/globals.css`에서 전역 스타일 수정
- `tailwind.config.js`에서 테마 색상 및 설정 변경

## 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.