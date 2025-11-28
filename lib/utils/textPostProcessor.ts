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

/**
 * Main post-processing function
 * Applies all filters in the correct order
 */
export function postProcessLLMOutput(text: string): string {
  if (!text) return text

  let result = text

  // Step 1: Remove JSON artifacts and formatting
  result = removeJsonArtifacts(result)

  // Step 2: Remove gendered language
  result = removeGenderedLanguage(result)

  // Step 3: Refine tone and formatting
  result = refineTextTone(result)

  return result
}

export default postProcessLLMOutput
