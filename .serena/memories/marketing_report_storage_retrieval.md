# Marketing Report Storage and Retrieval System

## Overview
Marketing reports are a key component of the exhibition creation process in Art Company. They are AI-generated reports containing marketing strategies, target audience analysis, and promotional recommendations.

## 1. MARKETING REPORT DATA STRUCTURE

### TypeScript Interfaces

#### MarketingReport Interface (types/exhibition.ts)
```typescript
export interface MarketingReport {
  overview: string                  // 2-3 sentence summary of exhibition's core message
  targetAudience: string[]         // 3-5 target audience groups (e.g., "아트 컬렉터", "미술 애호가")
  marketingPoints: string[]        // 3-5 differentiated strengths and promotional points
  pricingStrategy: string          // Ticket price and pricing policy recommendations
  promotionStrategy: string[]      // 3-5 effective promotional methods
}
```

#### ExhibitionData Interface (types/exhibition.ts)
```typescript
export interface ExhibitionData {
  id?: string
  keywords: string[]
  images: string[]
  selectedTitle: string
  introduction?: string
  preface?: string
  artistBio?: string
  artworkDescriptions?: ArtworkDescription[]
  pressRelease?: string
  marketingReport?: MarketingReport     // Optional marketing report object
  // ... other fields
}
```

#### ExhibitionContent Interface (lib/types/api.types.ts)
```typescript
export interface ExhibitionContent {
  artistName: string
  keywords: string[]
  // ... other fields
  marketingReport?: string           // Stored as string in API type
  // ... other fields
}
```

## 2. DATABASE SCHEMA

### exhibition_content Table
**Location:** supabase-schema.sql

```sql
CREATE TABLE public.exhibition_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exhibition_id UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,        -- 'introduction', 'preface', 'marketing_report', etc.
  content TEXT NOT NULL,              -- Stores the content (JSON or plain text)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exhibition_id, content_type)
);
```

**Key Points:**
- Marketing reports are stored with `content_type = 'marketing_report'` or `'marketingReport'`
- The `content` field stores the JSON object (MarketingReport) or wrapped in {text: ...}
- One marketing report per exhibition (UNIQUE constraint)
- Automatic timestamps for tracking changes

## 3. MARKETING REPORT CREATION FLOW

### Generation Endpoints

#### 1. POST /api/generate/marketing-report/route.ts
**Purpose:** Generate a complete marketing report object

**Input:**
```typescript
{
  exhibitionId?: string
  title: string
  keywords: string[]
  introduction?: string
  preface?: string
}
```

**Process:**
1. Fetches RAG context using `getRAGContext('marketing_report')`
2. Calls OpenAI with GPT-4o model
3. System prompt: `PROMPTS.generateMarketingReport(exhibitionData, ragContext)`
4. Returns JSON with MarketingReport object structure

**Output:**
```typescript
{
  marketingReport: {
    overview: "...",
    targetAudience: ["...", "..."],
    marketingPoints: ["...", "..."],
    pricingStrategy: "...",
    promotionStrategy: ["...", "..."]
  }
}
```

#### 2. POST /api/chat/route.ts
**Purpose:** Stream marketing report generation with database saving

**Input:**
```typescript
{
  messages: ChatMessage[],
  exhibitionId: string,
  step: 'marketingReport',
  data: ExhibitionData
}
```

**Process:**
1. Generates system prompt based on step: `PROMPTS.generateMarketingReport(data, ragContext)`
2. Streams response via OpenAI
3. **On completion callback:** Saves to database:
   ```typescript
   await supabase.from('exhibition_content').insert({
     exhibition_id: exhibitionId,
     content_type: step,          // 'marketingReport'
     content: { text: completion }
   })
   ```

### Generation Prompt
**Location:** lib/openai/prompts.ts

```typescript
generateMarketingReport: (exhibitionData: any, context: string) => `
당신은 미술 시장 전문 분석가입니다.
다음 전시 정보를 바탕으로 마케팅 리포트를 한글로 작성해주세요.

전시 정보:
${JSON.stringify(exhibitionData, null, 2)}

참고 스타일: ${context}

**중요: 모든 내용을 한글로 작성하세요. 영어 단어나 영어 문장을 사용하지 마세요.**

마케팅 리포트 구조:
1. 전시 요약: 전시의 핵심 메시지와 특징을 2-3문장으로 요약
2. 주요 타깃: 이 전시에 관심을 가질 관람객 그룹 (3-5개 항목)
3. 마케팅 포인트: 전시의 차별화된 강점과 홍보 포인트 (3-5개 항목)
4. 가격 전략: 입장료 및 가격 정책 제안
5. 추천 홍보 전략: 효과적인 홍보 방법 (3-5개 항목)

JSON 형식으로 응답 (모든 내용은 한글로):
{
  "marketingReport": {
    "overview": "전시 요약을 한글로...",
    "targetAudience": ["타깃1 한글로", "타깃2 한글로", ...],
    "marketingPoints": ["포인트1 한글로", "포인트2 한글로", ...],
    "pricingStrategy": "가격 전략을 한글로...",
    "promotionStrategy": ["전략1 한글로", "전략2 한글로", ...]
  }
}
`
```

## 4. MARKETING REPORT STORAGE

### Component: MarketingReportGenerator
**Location:** components/marketing/MarketingReportGenerator.tsx

**Flow:**
1. User clicks "마케팅 리포트 생성하기"
2. Calls `POST /api/generate/marketing-report` with exhibition data
3. Receives MarketingReport object
4. **SAVES TO DATABASE:**
   ```typescript
   const supabase = createClient()
   await supabase
     .from('exhibition_content')
     .upsert({
       exhibition_id: data.id,
       content_type: 'marketing_report',
       content: result.marketingReport,    // Stored as object
     }, { onConflict: 'exhibition_id,content_type' })
   ```
5. Displays report to user
6. Calls `onComplete(report)` callback with MarketingReport object

### Storage Format
- **Direct object storage:** `content` field stores the MarketingReport object directly
- **Alternative format:** Some flows wrap in `{text: string}` structure
- **Database handles both:** Both `marketingReport` and `marketing_report` content_type values are supported

## 5. MARKETING REPORT RETRIEVAL FOR PDF GENERATION

### Retrieval in PDF Routes

#### A. POST /api/pdf/generate/route.ts (Server-side PDF generation)

**Retrieval Process:**
```typescript
// Fetch exhibition content
const { data: contents } = await supabase
  .from('exhibition_content')
  .select('*')
  .eq('exhibition_id', exhibitionId)

// Organize content
const contentMap = new Map()
contents?.forEach((content) => {
  contentMap.set(content.content_type, content)
})

// Retrieve marketing report
const getContentText = (type: string): string => {
  const content = contentMap.get(type)
  if (!content?.content) return ''

  // Handle JSON parsing
  let text = typeof content.content === 'string'
    ? content.content
    : content.content.text || ''

  // If type is 'marketingReport' and parsed successfully:
  if (type === 'marketingReport' && parsed.marketingReport) {
    if (typeof parsed.marketingReport === 'object') {
      const mr = parsed.marketingReport
      let formatted = ''
      if (mr.overview) formatted += mr.overview + '\n\n'
      if (mr.targetAudience) formatted += '주요 타깃:\n' + mr.targetAudience.join('\n') + '\n\n'
      if (mr.marketingPoints) formatted += '마케팅 포인트:\n' + mr.marketingPoints.join('\n') + '\n\n'
      if (mr.pricingStrategy) formatted += '가격 전략:\n' + mr.pricingStrategy + '\n\n'
      if (mr.promotionStrategy) formatted += '추천 홍보 전략:\n' + mr.promotionStrategy.join('\n')
      return formatted.trim()
    }
    return parsed.marketingReport
  }
}

// Usage in PDF HTML generation
const htmlContent = generatePDFHTML({
  // ... other fields
  marketingReport: getContentText('marketingReport'),
  // ...
})
```

**Output in PDF HTML:**
```html
<h2>마케팅 리포트</h2>
<p>${marketingReport}</p>
```

#### B. POST /api/generate/pdf/route.ts (Puppeteer PDF generation with Chromium)

**Retrieval Process:**
```typescript
// Get all content
const { data: content } = await supabase
  .from('exhibition_content')
  .select('*')
  .eq('exhibition_id', exhibitionId)

// Content mapping helper
const getContent = (type: string) => {
  const snakeCase = type
  const camelCase = type.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

  const item = content?.find((c: any) =>
    c.content_type === snakeCase || c.content_type === camelCase
  )
  if (!item?.content) return ''

  // Special handling for marketing_report object format
  if (type === 'marketing_report' && typeof item.content === 'object' && !item.content.text) {
    const mr = item.content
    let formatted = ''
    if (mr.overview) formatted += mr.overview + '<br><br>'
    if (mr.targetAudience?.length) formatted += '<strong>주요 타깃:</strong><br>' + mr.targetAudience.join('<br>') + '<br><br>'
    if (mr.marketingPoints?.length) formatted += '<strong>마케팅 포인트:</strong><br>' + mr.marketingPoints.join('<br>') + '<br><br>'
    if (mr.pricingStrategy) formatted += '<strong>가격 전략:</strong><br>' + mr.pricingStrategy + '<br><br>'
    if (mr.promotionStrategy?.length) formatted += '<strong>추천 홍보 전략:</strong><br>' + mr.promotionStrategy.join('<br>')

    return formatted.trim()
  }
  // ... handle other formats
}
```

### Content Type Mapping
**Location:** lib/utils/helpers.ts

```typescript
export function mapStepToContentType(step: string): string {
  const mapping: Record<string, string> = {
    'titles': 'title_suggestions',
    'marketing': 'marketing_report',  // UI step 'marketing' -> DB 'marketing_report'
  }
  return mapping[step] || step
}
```

## 6. DATA FLOW SUMMARY

### Full Exhibition Creation Flow with Marketing Report

```
1. User starts exhibition creation
   ↓
2. User completes metadata, keywords, images
   ↓
3. AI generates titles, introduction, preface, artist bio, press release
   ↓
4. MarketingReportGenerator component appears
   ↓
5. User clicks "마케팅 리포트 생성하기"
   ↓
6. Frontend calls POST /api/generate/marketing-report
   ↓
7. Backend:
   - Gets RAG context for marketing reports
   - Calls OpenAI with exhibition data
   - Returns MarketingReport JSON object
   ↓
8. Frontend receives MarketingReport object
   ↓
9. Frontend saves to database:
   exhibition_content table
   - exhibition_id
   - content_type: 'marketing_report'
   - content: { full MarketingReport object }
   ↓
10. User confirms and proceeds to virtual exhibition
    ↓
11. PDF Generation (on demand):
    - Fetch exhibition_content rows
    - Find content_type = 'marketing_report'
    - Parse MarketingReport object
    - Format with fields: overview, targetAudience, marketingPoints, pricingStrategy, promotionStrategy
    - Include in PDF document
```

## 7. KEY IMPLEMENTATION DETAILS

### Content Storage Variations
The system handles multiple storage formats:
1. **Object format:** `content: { overview: "...", targetAudience: [...], ... }`
2. **Wrapped format:** `content: { text: "..." }`
3. **String format:** `content: "plain text string"`
4. **JSON wrapped string:** `content: "{...json...}"`

All formats are parsed and formatted correctly in both PDF generation routes.

### Error Handling
- If MarketingReport generation fails, system provides fallback with default values
- If database save fails, error is logged but user flow continues
- Invalid JSON is detected and handled gracefully

### Database Query Patterns
- Query ignores case differences between 'marketingReport' and 'marketing_report'
- Uses UPSERT with conflict handling to prevent duplicates
- RLS policies ensure users can only access their own exhibition content

## 8. FILES AND LOCATIONS

### Type Definitions
- `types/exhibition.ts` - MarketingReport, ExhibitionData
- `lib/types/api.types.ts` - Exhibition, ExhibitionContent
- `types/exhibition.ts` (lines 0-6) - MarketingReport interface definition

### API Routes
- `app/api/generate/marketing-report/route.ts` - Generate marketing report
- `app/api/chat/route.ts` - Stream-based generation with DB save (line 45-46 for marketing step)
- `app/api/pdf/generate/route.ts` - Generate PDF with Puppeteer
- `app/api/generate/pdf/route.ts` - Alternative PDF generation route
- `app/api/generate/poster/route.ts` - Poster generation
- `app/api/exhibitions/[id]/regenerate/route.ts` - Regenerate content

### Components
- `components/marketing/MarketingReportGenerator.tsx` - Frontend component for generating/saving marketing reports
- `components/chat/ChatContainer.tsx` - Chat interface that handles marketing report completion (line 436-439)
- `components/content/ContentPreview.tsx` - Preview marketing reports
- `app/(main)/curation/[id]/edit/page.tsx` - Edit page showing marketing report content

### Utilities
- `lib/openai/prompts.ts` - PROMPTS.generateMarketingReport prompt
- `lib/openai/client.ts` - OpenAI client setup
- `lib/rag/retrieval.ts` - getRAGContext function
- `lib/utils/helpers.ts` - mapStepToContentType mapping function
- `lib/utils/textPostProcessor.ts` - postProcessLLMOutput, replaceTBDPlaceholders

### Database
- `supabase-schema.sql` (lines 45-52) - exhibition_content table schema

## 9. RETRIEVAL QUERY EXAMPLES

### Retrieve Marketing Report from Database
```typescript
const { data: contents } = await supabase
  .from('exhibition_content')
  .select('*')
  .eq('exhibition_id', exhibitionId)
  .eq('content_type', 'marketing_report')

// Parse the content
const marketingReport = contents?.[0]?.content as MarketingReport
```

### Check if Marketing Report Exists
```typescript
const hasMarketingReport = contentMap.has('marketingReport') || contentMap.has('marketing_report')
```

### Format for Display
```typescript
const formatMarketingReport = (mr: MarketingReport): string => {
  let result = ''
  if (mr.overview) result += mr.overview + '\n\n'
  if (mr.targetAudience?.length) result += '주요 타깃:\n' + mr.targetAudience.join('\n') + '\n\n'
  if (mr.marketingPoints?.length) result += '마케팅 포인트:\n' + mr.marketingPoints.join('\n') + '\n\n'
  if (mr.pricingStrategy) result += '가격 전략:\n' + mr.pricingStrategy + '\n\n'
  if (mr.promotionStrategy?.length) result += '추천 홍보 전략:\n' + mr.promotionStrategy.join('\n')
  return result.trim()
}
```

## 10. RELATED FIELDS IN EXHIBITION TABLE

From `supabase-schema.sql`, exhibitions table has fields that provide context:
```sql
exhibition_date DATE
exhibition_end_date DATE
venue TEXT
location TEXT
artist_name TEXT
opening_hours TEXT
admission_fee TEXT
contact_info TEXT
```

These fields are used during PDF generation to replace TBD placeholders in marketing report content using `replaceTBDPlaceholders()`.

---

This comprehensive documentation shows that marketing reports are:
1. **Generated** via AI with structured JSON format
2. **Stored** in exhibition_content table with content_type = 'marketing_report'
3. **Retrieved** during PDF generation with proper parsing of object format
4. **Displayed** in UI with formatted sections for each field
5. **Integrated** throughout the exhibition creation and publishing workflow
