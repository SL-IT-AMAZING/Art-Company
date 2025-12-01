# Critical Issue: Marketing Report Not Appearing in PDF

## ROOT CAUSE IDENTIFIED

There is a **CONTENT_TYPE MISMATCH** between where the marketing report is saved and where it's being retrieved.

### The Problem

**SAVE LOCATION vs CONTENT_TYPE USED:**

1. **MarketingReportGenerator.tsx (Line 54):**
   ```typescript
   content_type: 'marketing_report'  // ← SNAKE_CASE
   ```
   - Saves directly via upsert (not via chat route)
   - Uses snake_case: 'marketing_report'

2. **app/api/chat/route.ts (Line 67):**
   ```typescript
   content_type: step,  // ← Takes step param directly
   // If step = 'marketingReport' (from ChatContainer), saves as CAMELCASE
   ```
   - When marketing report is generated via chat streaming, uses the step value directly
   - step = 'marketingReport' (camelCase) → saves as 'marketingReport'

3. **PDF Generation Routes (Expected values):**
   - `app/api/generate/pdf/route.ts` (Line 445): Looks for 'marketing_report' (snake_case)
   - `app/api/pdf/generate/route.ts` (Line 119): Looks for 'marketingReport' (camelCase)

### Why The Marketing Report Doesn't Appear

**Scenario 1: Through MarketingReportGenerator Component**
- Component saves with: `content_type: 'marketing_report'` (snake_case)
- Generates PDF with `app/api/generate/pdf/route.ts`
- Route queries for both 'marketing_report' and 'marketingReport' (has fallback)
- **SHOULD WORK** ✓

**Scenario 2: Through Chat/Stream (if implemented)**
- Chat route would save with: `content_type: 'marketingReport'` (camelCase)
- If using older `app/api/pdf/generate/route.ts`
- That route only looks for exact keys in contentMap ('marketingReport')
- **COULD FAIL** ✗

**Scenario 3: Content Retrieval Issue (MOST LIKELY)**
- The `getContent()` helper in `app/api/generate/pdf/route.ts` (lines 82-165)
- Has fallback logic that checks both snake_case and camelCase
- **BUT:** It assumes content exists in contentMap which is built from database

## How data.id Gets Set

**TIMELINE:**

1. **ChatContainer.tsx - initExhibition() (Lines 49-71)**
   ```typescript
   const { data, error } = await supabase
     .from('exhibitions')
     .insert({ user_id: user.id, status: 'draft' })
     .select()
     .single()
   
   if (data && !error) {
     setExhibitionData((prev) => ({ ...prev, id: data.id }))  // ← ID SET HERE
   }
   ```
   - Called from `initializeChat()` on component mount
   - Creates new exhibition record in DB
   - Sets `exhibitionData.id` immediately

2. **MarketingReportGenerator receives data:**
   ```typescript
   <MarketingReportGenerator data={exhibitionData} onComplete={...} />
   ```
   - Receives `exhibitionData` which INCLUDES `id` from step 1
   - Line 32: passes `exhibitionId: data.id` to API
   - Line 48: checks `if (data.id && result.marketingReport)` before saving

3. **Save happens (Line 50-56):**
   ```typescript
   const { error: saveError } = await supabase
     .from('exhibition_content')
     .upsert({
       exhibition_id: data.id,          // ← ID IS AVAILABLE
       content_type: 'marketing_report',
       content: result.marketingReport,
     }, { onConflict: 'exhibition_id,content_type' })
   ```
   - ID is definitely available
   - Saves directly with the correct exhibition_id

## ALL SAVE LOCATIONS FOR MARKETING REPORT

1. **MarketingReportGenerator.tsx** (Lines 48-65)
   - Uses: `content_type: 'marketing_report'` (snake_case)
   - Method: upsert with onConflict
   - Condition: `if (data.id && result.marketingReport)`
   - Problem: If save fails silently, no error shown to user

2. **app/api/chat/route.ts** (Lines 65-69)
   - Uses: `content_type: step` (where step = 'marketingReport' in camelCase)
   - Method: insert in onCompletion callback
   - Problem: If step name is wrong, content_type will be wrong

## OTHER CONTENT TYPE USAGES (For Comparison)

```
ChatContainer.tsx:
  - 'introduction' (snake_case) ✓
  - 'preface' (snake_case) ✓
  - 'artist_bio' (snake_case) ✓

PressReleaseGenerator.tsx:
  - 'press_release' (snake_case) ✓

MarketingReportGenerator.tsx:
  - 'marketing_report' (snake_case) ✓

app/api/chat/route.ts:
  - Uses step directly:
    - 'marketingReport' (camelCase) if step='marketingReport' ✗
    - Should be 'marketing_report' (snake_case) for consistency
```

## DATABASE SCHEMA

Exhibition_content table has:
- UNIQUE constraint on (exhibition_id, content_type)
- Can have multiple records with different content_types
- Stores content as JSON or plain text

## LIKELY ROOT CAUSES (In Priority Order)

1. **Content is saved with 'marketing_report' but PDF route queries wrong value**
   - MarketingReportGenerator saves as 'marketing_report'
   - But PDF retrieval might not find it if using wrong name

2. **Content save silently fails due to duplicate key constraint**
   - UNIQUE(exhibition_id, content_type) violation
   - Trying to insert twice instead of update
   - Error caught but not user-facing

3. **Chat route saves as 'marketingReport' (camelCase)**
   - If marketing report is generated via chat/stream instead of component
   - Gets saved as 'marketingReport' which PDF route doesn't handle correctly
   - Older pdf/generate/route.ts only looks for exact key 'marketingReport'

4. **Missing marketing report in database entirely**
   - Save request never reaches database
   - Exhibition ID is null or undefined
   - Network error during save

## PDF GENERATION DEBUGGING

The `getContent()` function in `app/api/generate/pdf/route.ts` has proper fallback:
```typescript
const snakeCase = type
const camelCase = type.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

const item = content?.find((c: any) =>
  c.content_type === snakeCase || c.content_type === camelCase
)
```

This SHOULD find the content regardless of naming convention.

## RECOMMENDED CHECKS

1. Verify content_type value in database after generation
2. Check if save error is happening silently
3. Ensure data.id is available before save attempt
4. Add console logs to MarketingReportGenerator for debugging
5. Check if UNIQUE constraint is causing insert failures
