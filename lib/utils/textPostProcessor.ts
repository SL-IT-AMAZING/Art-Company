/**
 * Text post-processor for LLM output before PDF generation
 * Ensures gender-neutral language, removes JSON artifacts, and normalizes tone
 */

// Gender-specific terms to replace with neutral alternatives
const GENDER_REPLACEMENTS: [RegExp, string][] = [
  // Korean gender pronouns
  [/그녀는/g, '작가는'],
  [/그녀의/g, '작가의'],
  [/그녀가/g, '작가가'],
  [/그녀를/g, '작가를'],
  [/그는/g, '작가는'],
  [/그의/g, '작가의'],
  [/그가/g, '작가가'],
  [/그를/g, '작가를'],
  // English pronouns (sometimes slip through)
  [/\bshe\b/gi, 'the artist'],
  [/\bher\b/gi, "the artist's"],
  [/\bhe\b/gi, 'the artist'],
  [/\bhis\b/gi, "the artist's"],
  [/\bhim\b/gi, 'the artist'],
  // Gendered artist terms
  [/여류\s*작가/g, '작가'],
  [/여성\s*작가/g, '작가'],
  [/남성\s*작가/g, '작가'],
  [/여류\s*예술가/g, '예술가'],
  [/여성\s*예술가/g, '예술가'],
  [/남성\s*예술가/g, '예술가'],
]

/**
 * Remove gendered language from text
 * Replaces gender pronouns and gendered terms with neutral alternatives
 */
export function removeGenderedLanguage(text: string): string {
  if (!text) return text

  let result = text
  for (const [pattern, replacement] of GENDER_REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }

  return result
}

/**
 * Remove Markdown formatting from text
 * Strips headers, bold, italic, links, bullet points, etc.
 */
export function removeMarkdown(text: string): string {
  if (!text) return text

  let result = text

  // Remove headers (# ## ###)
  result = result.replace(/^#{1,6}\s+/gm, '')

  // Remove bold (**text** or __text__)
  result = result.replace(/\*\*(.+?)\*\*/g, '$1')
  result = result.replace(/__(.+?)__/g, '$1')

  // Remove italic (*text* or _text_) - be careful not to remove valid underscores
  result = result.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '$1')
  result = result.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '$1')

  // Remove Korean-style labels (헤드라인:, 본문:, etc.)
  result = result.replace(/^(헤드라인|본문|소제목|제목|부제|결론|개요|요약):\s*/gm, '')

  // Remove bullet points
  result = result.replace(/^[\*\-•]\s+/gm, '')

  // Remove numbered lists prefix
  result = result.replace(/^\d+\.\s+/gm, '')

  // Remove links [text](url) → text
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove inline code `code`
  result = result.replace(/`([^`]+)`/g, '$1')

  // Remove horizontal rules
  result = result.replace(/^[-*_]{3,}\s*$/gm, '')

  // Clean up extra whitespace from removals
  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
}

/**
 * Remove JSON artifacts and formatting remnants from text
 * Cleans up markdown code blocks, JSON wrappers, and formatting characters
 */
export function removeJsonArtifacts(text: string): string {
  if (!text) return text

  let result = text

  // Remove markdown code blocks
  result = result.replace(/```json\s*/gi, '')
  result = result.replace(/```\s*/g, '')

  // Try to extract content from JSON if the text is a JSON object
  if (result.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(result)
      // Extract the actual content from common response formats
      if (parsed.artistBio) return parsed.artistBio
      if (parsed.introduction) return parsed.introduction
      if (parsed.preface) return parsed.preface
      if (parsed.pressRelease) return parsed.pressRelease
      if (parsed.text) return parsed.text
      if (parsed.content) return parsed.content
    } catch {
      // If parsing fails, continue with cleanup
    }
  }

  // Remove escaped newlines and tabs
  result = result.replace(/\\n/g, '\n')
  result = result.replace(/\\t/g, ' ')

  // Remove excessive whitespace
  result = result.replace(/\n{3,}/g, '\n\n')
  result = result.replace(/[ \t]{2,}/g, ' ')

  return result.trim()
}

/**
 * Refine text tone - normalize sentence length and terminology
 * Ensures consistent style and professional tone
 */
export function refineTextTone(text: string): string {
  if (!text) return text

  let result = text

  // Remove excessive punctuation
  result = result.replace(/!{2,}/g, '!')
  result = result.replace(/\?{2,}/g, '?')
  result = result.replace(/\.{4,}/g, '...')

  // Remove excessive emoji (keep only one if multiple)
  result = result.replace(/([\u{1F300}-\u{1F9FF}])\1+/gu, '$1')

  // Normalize quotation marks
  result = result.replace(/[""]/g, '"')
  result = result.replace(/['']/g, "'")

  return result.trim()
}

// Common English typo corrections
const ENGLISH_TYPO_FIXES: [RegExp, string][] = [
  [/\bIn to\b/g, 'Into'],
  [/\bin to\b/g, 'into'],
  [/\bAlot\b/gi, 'A lot'],
  [/\bInfomation\b/gi, 'Information'],
  [/\bOccured\b/gi, 'Occurred'],
  [/\bRecieve\b/gi, 'Receive'],
  [/\bSeperately\b/gi, 'Separately'],
  [/\bUntill\b/gi, 'Until'],
  [/\bDefinately\b/gi, 'Definitely'],
  [/\bAccomodate\b/gi, 'Accommodate'],
  [/\bOccasion ally\b/gi, 'Occasionally'],
  [/\bNeccessary\b/gi, 'Necessary'],
  [/\bExhibtion\b/gi, 'Exhibition'],
  [/\bGallary\b/gi, 'Gallery'],
]

/**
 * Fix common English typos in text
 */
export function fixEnglishTypos(text: string): string {
  if (!text) return text

  let result = text
  for (const [pattern, replacement] of ENGLISH_TYPO_FIXES) {
    result = result.replace(pattern, replacement)
  }

  return result
}

/**
 * Exhibition data interface for TBD replacement
 */
interface ExhibitionData {
  exhibition_date?: string
  exhibition_end_date?: string
  venue?: string
  location?: string
  admission_fee?: string
}

/**
 * Get locale-aware default values
 */
function getDefaults(locale: string = 'ko') {
  const isEnglish = locale === 'en'
  return {
    tbd: isEnglish ? 'TBD' : '미정',
    free: isEnglish ? 'Free' : '무료',
  }
}

/**
 * Replace [TBD] placeholders with actual exhibition data
 * @param text The text to process
 * @param exhibition Exhibition data to use for replacements
 * @param locale The locale for formatting (default: 'ko')
 */
export function replaceTBDPlaceholders(
  text: string,
  exhibition: ExhibitionData,
  locale: string = 'ko'
): string {
  if (!text) return text

  let result = text
  const defaults = getDefaults(locale)
  const isEnglish = locale === 'en'

  // Format date helper with locale support
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const startDate = formatDate(exhibition.exhibition_date)
  const endDate = formatDate(exhibition.exhibition_end_date)
  const dateRange = startDate
    ? endDate
      ? `${startDate} - ${endDate}`
      : startDate
    : defaults.tbd

  // Replace common [TBD] patterns - both English and Korean
  result = result.replace(/\[TBD\]|\[미정\]|\[추후 공지\]|\[추후공지\]/gi, defaults.tbd)
  result = result.replace(/\[날짜\]|\[일정\]|\[전시 기간\]|\[전시기간\]|\[Date\]|\[Period\]/gi, dateRange)
  result = result.replace(/\[장소\]|\[전시장\]|\[갤러리\]|\[Venue\]|\[Gallery\]/gi, exhibition.venue || defaults.tbd)
  result = result.replace(/\[위치\]|\[주소\]|\[Location\]|\[Address\]/gi, exhibition.location || defaults.tbd)
  result = result.replace(/\[입장료\]|\[관람료\]|\[가격\]|\[티켓\]|\[Admission\]|\[Ticket\]/gi, exhibition.admission_fee || defaults.free)

  return result
}

/**
 * Main post-processing function
 * Applies all filters in the correct order
 * @param text The text to process
 * @param locale Optional locale for localized defaults (default: 'ko')
 */
export function postProcessLLMOutput(text: string, locale: string = 'ko'): string {
  if (!text) return text

  let result = text

  // Step 1: Remove JSON artifacts and formatting
  result = removeJsonArtifacts(result)

  // Step 2: Remove Markdown formatting
  result = removeMarkdown(result)

  // Step 3: Remove gendered language
  result = removeGenderedLanguage(result)

  // Step 4: Fix English typos
  result = fixEnglishTypos(result)

  // Step 5: Refine tone and formatting
  result = refineTextTone(result)

  return result
}

export default postProcessLLMOutput
