# Taibosi Exhaust Korea

차량 적합성을 중심으로 상품 탐색, 주문, 장착 예약, 국내 문의·AS를 연결하는 고객 쇼핑몰과 운영자 어드민 데모입니다. 모든 상품·차량·장착점 정보는 개발 환경용 샘플이며 실제 사업자 정보나 법적 보장으로 사용하지 않습니다.

## 실행

Node.js 22가 필요합니다.

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

```bash
npm run build
npm test
npm run lint
```

데이터 스키마 변경 후에는 다음 명령으로 PostgreSQL 마이그레이션을 생성합니다.

```bash
npm run db:generate
```

## 주요 경로

- 고객: `/`, `/vehicles`, `/products`, `/products/bmw-g8x-valved-catback`, `/cart`, `/checkout`, `/installation/booking`, `/support`, `/mypage`
- 운영자: `/admin/login`, `/admin`, `/admin/products`, `/admin/fitments`, `/admin/inventory`, `/admin/orders`, `/admin/bookings`, `/admin/roles`, `/admin/audit-logs`

첨부 요구사항의 나머지 고객·어드민 경로도 공통 라우터에서 업무 맥락에 맞는 화면으로 연결됩니다.

## 데이터 연동

- PostgreSQL이 주문, 주문 상품 스냅샷, 상태 이력, 문의, 재입고 알림, 장착 신청, 재고·적합성 변경 이벤트를 보존합니다.
- 주문 생성은 `/api/orders`에서 서버 기준 상품 가격을 적용하고 고유 요청 키로 중복 접수를 차단한 뒤 하나의 트랜잭션으로 저장합니다.
- 어드민 `/admin/orders`와 대시보드의 최근 주문은 PostgreSQL 데이터를 실시간으로 조회합니다.
- 어드민 `/admin/products/new`에서 기본 정보, 최대 4장의 이미지, 상세 설명, 제품 사양, 공개 상태를 등록하며 상품과 이미지는 하나의 트랜잭션으로 PostgreSQL에 저장됩니다.
- 업로드 이미지는 브라우저에서 최대 1600px WebP로 압축하고 장당 2MB, 전체 4MB로 제한합니다. 임시저장 이미지에는 운영자 세션이 필요합니다.
- `app/api/actions`가 데모 작업을 저장하며, 재고·적합성·주문 변경은 감사로그를 함께 생성합니다.
- PG, 배송, 문자, 이메일, 지도는 외부 키 없이 동작하도록 화면과 Mock 상태로 구성했습니다.
- 확정 데이터가 없는 배송일, 입고일, 장착비, 인증, 성능 수치는 생성하지 않습니다.

로컬에서는 `.env.local`에 PostgreSQL 연결 문자열을 설정합니다.

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
LOCAL_ADMIN_EMAIL=local-admin@example.com
LOCAL_ADMIN_PASSWORD=충분히-긴-로컬-운영자-비밀번호
LOCAL_ADMIN_SESSION_SECRET=32자-이상의-로컬-무작위-문자열
```

로컬 개발 서버는 `LOCAL_ADMIN_*` 변수만 사용합니다. Vercel 프로덕션은 `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`을 별도로 사용합니다.

## Vercel 배포

Vercel 프로젝트 설정은 다음 값이면 됩니다.

- Framework Preset: `Next.js`
- Root Directory: `./`
- Build Command: Override 끄기 (`next build` 자동 사용)
- Output Directory: Override 끄기 (`.next` 자동 사용)
- Install Command: Override 끄기 (`npm install` 자동 사용)
- Node.js Version: `22.x`

Vercel Marketplace의 PostgreSQL 공급자를 연결하거나 Project Settings의 Environment Variables에 `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`을 등록한 뒤 재배포합니다. Prisma Postgres는 런타임 쿼리에 pooled 연결 문자열을 권장하며, 직접 연결 문자열은 마이그레이션에 사용합니다. 별도 Cloudflare 또는 Sites 설정은 필요하지 않습니다.

현재 마이그레이션을 대상 DB에 적용하려면 다음 명령을 실행합니다.

```bash
npm run db:migrate
```

PG가 아직 연결되지 않았으므로 주문은 `RECEIVED`, 결제는 `PENDING`으로 저장됩니다. 실제 카드 승인 완료 처리는 결제 공급자 연동 후 웹훅에서 갱신해야 합니다.

## 인증과 샘플 계정

고객 `/login`, `/signup`은 제품 흐름 검증을 위한 UI 데모입니다. 운영자 `/admin/login`은 환경 변수의 계정을 확인하고 12시간 유효한 HttpOnly 세션 쿠키를 발급하며, 주문 조회 API는 이 세션이 있어야 사용할 수 있습니다.

- 고객 데모: `taibosi.demo@example.com`
- 운영자 데모: `admin@admin.com`
- 화면에 비밀번호를 하드코딩하지 않았으며 어떤 값도 실제 인증 자격증명으로 사용되지 않습니다.

## 역할별 권한

- Super Admin: 전체 설정, 권한, 개인정보, Export, 감사로그
- Catalog Manager: 상품, 차량, 적합성, 재고 조회 및 편집
- Order Manager: 주문, 결제, 배송, 장착 상태 관리
- Support Agent: 문의·AS, 고객 답변, 제한된 고객 정보 조회
- Installer Viewer: 장착 일정과 필요한 차량·상품 정보 조회

민감 변경은 사유 입력을 요구하고 작업자, 대상, 변경 내용을 감사로그로 남기도록 설계했습니다.

## 테스트 범위

테스트는 홈·상품 상세·어드민 렌더링, 적합성·재고별 CTA, 가용 재고 계산, 주문 상태 전이, 금액 및 미정 장착비 표기를 검증합니다. 핵심 구매 및 운영 화면은 빌드 시 함께 컴파일됩니다.

## 디자인 토큰

고객 화면은 Graphite `#111214`와 Performance Red `#D93A2F`, Warm White `#FCFBF8`를 중심으로 구성합니다. 어드민은 장시간 사용을 고려한 라이트 테마와 명확한 상태색을 사용합니다. 모바일 고객 화면은 360px부터, 어드민은 1280px 중심으로 대응합니다.
