# Art Company - Setup Guide

## 완료된 구현 내역

이 문서는 모든 미구현 기능을 완료한 후 작성되었습니다. 다음 7가지 Critical 기능이 모두 구현되었습니다:

### ✅ 구현 완료 기능

1. **이미지 업로드 백엔드 (Supabase Storage)**
   - `/api/upload/artwork` - 이미지 업로드 API
   - Supabase Storage 'artworks' bucket 사용
   - 파일 크기 제한: 10MB
   - 지원 형식: JPG, PNG, WebP

2. **OpenAI Vision API 이미지 분석**
   - `/api/analyze/images` - 이미지 분석 API
   - gpt-4o 모델 사용
   - 작품 주제, 기법, 스타일, 감정 분석
   - 키워드 자동 추출

3. **DALL-E 3 포스터 생성**
   - `/api/generate/poster` - AI 포스터 생성 API
   - DALL-E 3 HD 품질 (1024x1792 portrait)
   - 미니멀하고 고급스러운 갤러리 스타일
   - Supabase posters 테이블에 자동 저장

4. **Puppeteer PDF 생성**
   - `/api/generate/pdf` - PDF 생성 API
   - Pretendard 한글 폰트 지원
   - A4 사이즈, 전체 콘텐츠 포함
   - 표지, 소개, 서문, 작품, 보도자료, 포스터 포함

5. **RAG 시스템 (pgvector + OpenAI Embeddings)**
   - `lib/rag/retrieval.ts` - RAG 검색 시스템
   - Supabase pgvector 벡터 검색
   - text-embedding-3-small 모델 (1536 차원)
   - 큐레이터 샘플 기반 스타일 학습

6. **전시 복제 기능**
   - `/api/exhibitions/[id]/duplicate` - 전시 복제 API
   - 콘텐츠, 작품 모두 복제
   - 포스터는 비용 문제로 복제 제외

7. **소셜 로그인 백엔드**
   - Google, GitHub OAuth 지원
   - `SocialLoginButtons.tsx` 활성화 완료
   - Supabase Auth callback 처리

---

## 환경 설정

### 1. 환경변수 (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# Optional
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Supabase 설정

#### Storage Bucket 생성

Supabase Dashboard → Storage에서 다음 bucket 생성:

```sql
-- artworks bucket (public)
CREATE BUCKET artworks
  PUBLIC true
  FILE_SIZE_LIMIT 10485760; -- 10MB
```

#### 데이터베이스 마이그레이션 실행

```bash
# Supabase CLI 설치
npm install -g supabase

# 마이그레이션 적용
supabase db push

# 또는 직접 SQL 실행 (Supabase Dashboard → SQL Editor):
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_additional_tables.sql
# 3. supabase/migrations/003_curator_samples.sql
# 4. supabase/migrations/004_vector_search_function.sql
```

#### pgvector Extension 활성화

Supabase Dashboard → Database → Extensions에서 `vector` 활성화

또는 SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### RAG 샘플 데이터 임베딩 생성

프로젝트에서 스크립트 실행:

```bash
# scripts/populate-embeddings.ts 생성 필요
npm run populate-embeddings
```

또는 API 호출:

```typescript
import { populateEmbeddings } from '@/lib/rag/retrieval'
await populateEmbeddings()
```

### 3. OAuth 설정 (선택사항)

Supabase Dashboard → Authentication → Providers에서:

**Google OAuth:**
1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
2. 승인된 리디렉션 URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Supabase에 Client ID, Client Secret 입력

**GitHub OAuth:**
1. GitHub → Settings → Developer settings → OAuth Apps
2. Authorization callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Supabase에 Client ID, Client Secret 입력

### 4. Puppeteer 설정 (Vercel 배포용)

Puppeteer를 Vercel에서 사용하려면 추가 설정 필요:

**package.json에 추가:**

```json
{
  "dependencies": {
    "@sparticuz/chromium": "^119.0.0"
  }
}
```

**PDF route 수정:**

```typescript
import chromium from '@sparticuz/chromium'

// Vercel 환경
const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
})
```

---

## 실행 방법

### 개발 서버

```bash
npm install
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

---

## API 사용 예시

### 1. 이미지 업로드

```typescript
import { uploadApi } from '@/lib/api/upload'

const file = event.target.files[0]
const { url, path } = await uploadApi.uploadArtwork(file)
```

### 2. 이미지 분석

```typescript
const response = await fetch('/api/analyze/images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrls: ['https://...', 'https://...'],
  }),
})

const { analyses, aggregatedKeywords } = await response.json()
```

### 3. DALL-E 3 포스터 생성

```typescript
const response = await fetch('/api/generate/poster', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exhibitionId: 'uuid',
    title: '전시 제목',
    keywords: ['추상', '색채', '감정'],
    artistName: '작가명',
  }),
})

const { posterUrl } = await response.json()
```

### 4. PDF 생성

```typescript
const response = await fetch('/api/generate/pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exhibitionId: 'uuid',
  }),
})

// PDF 파일 다운로드
const blob = await response.blob()
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'exhibition.pdf'
a.click()
```

### 5. RAG 컨텍스트 검색

```typescript
import { getRAGContext } from '@/lib/rag/retrieval'

const context = await getRAGContext('introduction', ['현대미술', '추상'])
// 유사한 큐레이터 샘플 텍스트 반환
```

### 6. 전시 복제

```typescript
const response = await fetch(`/api/exhibitions/${exhibitionId}/duplicate`, {
  method: 'POST',
})

const { exhibitionId: newId, exhibition } = await response.json()
```

---

## 주요 개선사항

### Before (미구현)
- ❌ 이미지 업로드: UI만 존재, 저장 안 됨
- ❌ 이미지 분석: 구현 안 됨
- ❌ 포스터 생성: placeholder만 반환
- ❌ PDF 생성: HTML만 반환, 한글 미지원
- ❌ RAG 시스템: skeleton만 존재
- ❌ 전시 복제: 버튼 없음
- ❌ 소셜 로그인: 비활성화

### After (구현 완료)
- ✅ 이미지 업로드: Supabase Storage 완전 통합
- ✅ 이미지 분석: OpenAI Vision API (gpt-4o)
- ✅ 포스터 생성: DALL-E 3 HD 품질
- ✅ PDF 생성: Puppeteer + Pretendard 한글 폰트
- ✅ RAG 시스템: pgvector + Embeddings 완전 동작
- ✅ 전시 복제: API + 데이터 복제 완료
- ✅ 소셜 로그인: Google, GitHub OAuth 활성화

---

## 비용 예상

### OpenAI API 비용

- **GPT-4o**: $5 / 1M input tokens, $15 / 1M output tokens
- **DALL-E 3 HD**: $0.08 / image
- **Embeddings**: $0.02 / 1M tokens

**전시 1개당 예상 비용:**
- 텍스트 생성 (6개 콘텐츠): ~$0.30
- 포스터 생성 (1개): $0.08
- 이미지 분석 (5개): ~$0.10
- RAG 임베딩: ~$0.01

**총 예상: ~$0.50 per exhibition**

### Supabase 비용

- **Free tier**: 500MB Storage, 2GB 전송/월
- **Pro tier**: $25/월 (8GB Storage, 50GB 전송)

---

## 트러블슈팅

### Puppeteer 오류 (Vercel)

```bash
Error: Could not find Chrome
```

**해결:**
1. `@sparticuz/chromium` 설치
2. `executablePath` 설정

### pgvector 검색 오류

```bash
function match_curator_samples does not exist
```

**해결:**
1. `004_vector_search_function.sql` 실행 확인
2. pgvector extension 활성화 확인

### OAuth 콜백 오류

```bash
redirect_uri_mismatch
```

**해결:**
1. OAuth provider의 redirect URI 확인
2. Supabase callback URL 정확히 입력

---

## 다음 단계

### 필수 (배포 전)
1. Supabase 마이그레이션 적용
2. pgvector extension 활성화
3. Storage bucket 생성
4. 환경변수 설정
5. RAG 샘플 임베딩 생성

### 선택사항
1. OAuth provider 설정 (Google, GitHub)
2. 커스텀 도메인 설정
3. Analytics 통합
4. 에러 모니터링 (Sentry)

---

**구현 완료일:** 2025-11-22
**버전:** 1.0.0 (MVP Complete)
