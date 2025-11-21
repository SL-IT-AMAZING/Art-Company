import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Maps UI step names to database content_type values
 * Required because Step union type doesn't match DB CHECK constraints
 */
export function mapStepToContentType(step: string): string {
  const mapping: Record<string, string> = {
    'titles': 'title_suggestions',
    'marketing': 'marketing_report',
    // content step generates both introduction and preface
    // press_release will be added later
  }

  return mapping[step] || step
}
