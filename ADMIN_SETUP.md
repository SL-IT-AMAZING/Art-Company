# 관리자 시스템 설정 가이드

## 1. 데이터베이스 마이그레이션 실행

### 옵션 A: Supabase Dashboard 사용 (권장)

1. Supabase 대시보드 로그인: https://supabase.com/dashboard
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New Query** 버튼 클릭
5. `supabase/migrations/006_admin_system.sql` 파일 내용 복사
6. 쿼리 창에 붙여넣기
7. **Run** 버튼 클릭

### 옵션 B: Supabase CLI 사용

```bash
supabase db push
```

## 2. 환경변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```env
# 기존 변수들
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key

# 새로 추가할 변수들
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_WEBHOOK_SECRET=your-webhook-secret
```

### Service Role Key 찾기:
1. Supabase Dashboard > Settings > API
2. **service_role** 키 복사 (secret!)

### Webhook Secret 설정:
임의의 긴 문자열 생성 (예: `openssl rand -hex 32`)

## 3. 관리자 계정 생성

### 방법 1: Supabase Dashboard에서 수동 생성

1. Supabase Dashboard > Authentication > Users
2. **Add User** 버튼 클릭
3. 이메일과 비밀번호 입력 (예: admin@artcompany.com)
4. **Create User** 클릭

### 방법 2: 일반 회원가입 후 권한 부여

1. 웹사이트에서 일반 회원가입
2. Supabase Dashboard > SQL Editor에서 실행:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

## 4. 가입 알림 웹훅 설정 (선택사항)

### Supabase Auth Hooks 설정

1. Supabase Dashboard > Authentication > Hooks
2. **User signed up** 활성화
3. Webhook URL 입력: `https://your-domain.com/api/webhooks/user-signup`
4. Secret 입력: `.env.local`의 `SUPABASE_WEBHOOK_SECRET` 값과 동일하게
5. 저장

### 대안: 클라이언트 사이드 알림

웹훅 설정이 어려운 경우, 회원가입 페이지에서 직접 알림 생성 가능
(개발 단계에서는 이 방식 추천)

## 5. 테스트

1. 개발 서버 실행:
```bash
npm run dev
```

2. 관리자 계정으로 로그인

3. 헤더에 "Admin" 버튼이 보이는지 확인

4. `/admin/dashboard` 접속하여 관리자 페이지 확인

5. 테스트 공지사항 작성:
   - `/admin/notices` 접속
   - "공지사항 작성" 버튼 클릭
   - 한국어/영문 제목과 내용 입력
   - Rich Text 에디터 사용
   - 저장 후 `/notice` 페이지에서 확인

## 6. 주요 기능

### 관리자 대시보드 (`/admin/dashboard`)
- 전체 회원 수
- 전체 전시 수
- 읽지 않은 알림 수
- 최근 가입자 목록

### 회원 관리 (`/admin/members`)
- 전체 회원 목록
- 검색 기능 (이메일, 이름)
- 회원별 전시 통계 (전시 수, 공개 전시, 조회수)

### 공지사항 관리 (`/admin/notices`)
- 공지사항 목록
- 생성/수정/삭제
- 게시/게시중단 토글
- Rich Text 에디터 (굵게, 이탤릭, 헤딩, 리스트, 링크 등)
- 한국어/영문 별도 작성

### 알림 (`/admin/notifications`)
- 신규 가입자 알림 목록
- 읽음/읽지 않음 상태
- 읽음 처리 기능

## 7. 보안 주의사항

1. **절대 Service Role Key를 클라이언트에 노출하지 마세요**
   - 서버 컴포넌트와 API 라우트에서만 사용
   - `.env.local` 파일을 Git에 커밋하지 마세요

2. **프로덕션 배포 시**
   - Vercel/다른 호스팅에 환경변수 설정
   - 웹훅 서명 검증 구현 (현재 TODO로 표시됨)

3. **관리자 계정 관리**
   - 강력한 비밀번호 사용
   - 필요한 사람에게만 관리자 권한 부여

## 8. 문제 해결

### "관리자 페이지에 접근할 수 없어요"
- 관리자 권한이 올바르게 설정되었는지 확인:
  ```sql
  SELECT email, raw_user_meta_data->>'role' as role
  FROM auth.users
  WHERE email = 'your-email@example.com';
  ```
- 결과가 'admin'이어야 함

### "공지사항이 표시되지 않아요"
- 마이그레이션이 올바르게 실행되었는지 확인
- 공지사항이 게시 상태(`is_published = true`)인지 확인

### "회원 목록이 비어있어요"
- `SUPABASE_SERVICE_ROLE_KEY`가 올바르게 설정되었는지 확인
- 서버 재시작 (`npm run dev` 종료 후 다시 실행)

## 9. 다음 단계

관리자 시스템이 정상적으로 작동하면:

1. 고객에게 관리자 계정 정보 전달
2. 사용법 안내
3. 첫 공지사항 작성 테스트

## 지원

문제가 발생하면 다음을 확인하세요:
- 브라우저 콘솔 에러
- 서버 로그 (`npm run dev` 출력)
- Supabase 대시보드 > Logs
