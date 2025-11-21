import fs from 'fs/promises'
import path from 'path'

export async function getRAGContext(contentType: string): Promise<string> {
  try {
    // Map content types to file names
    const fileMap: Record<string, string> = {
      'introduction': 'introductions.json',
      'preface': 'prefaces.json',
      'press_release': 'press-releases.json',
      'marketing_report': 'marketing-reports.json',
    }

    const fileName = fileMap[contentType]
    if (!fileName) {
      console.warn(`No reference file for content type: ${contentType}`)
      return ''
    }

    const filePath = path.join(process.cwd(), 'data/reference', fileName)
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent)

    if (!data.examples || !Array.isArray(data.examples)) {
      console.warn(`Invalid format in ${fileName}`)
      return ''
    }

    // Return first 3 examples joined with separator
    return data.examples.slice(0, 3).join('\n\n---\n\n')
  } catch (error) {
    console.error(`Error loading RAG context for ${contentType}:`, error)
    return ''
  }
}
