import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate embeddings for a query string using OpenAI
 */
async function generateEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
    encoding_format: 'float',
  })

  return response.data[0].embedding
}

/**
 * Retrieve RAG context for content generation
 * Uses vector similarity search to find relevant curator samples
 */
export async function getRAGContext(
  contentType: string,
  keywords?: string[],
  limit: number = 3
): Promise<string> {
  try {
    const supabase = await createClient()

    // Create query string for embedding
    const queryString = keywords
      ? `${contentType} 전시 큐레이터 텍스트 예시: ${keywords.join(', ')}`
      : `${contentType} 전시 큐레이터 텍스트 예시`

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(queryString)

    // Query Supabase for similar curator samples using vector similarity
    // Note: This requires pgvector extension and embeddings to be populated
    const { data: samples, error } = await supabase.rpc('match_curator_samples', {
      query_embedding: queryEmbedding,
      match_content_type: contentType,
      match_threshold: 0.7, // Cosine similarity threshold
      match_count: limit,
    })

    if (error) {
      console.error('RAG retrieval error:', error)
      // Fallback: Get samples without vector search
      const { data: fallbackSamples } = await supabase
        .from('curator_samples')
        .select('content')
        .eq('content_type', contentType)
        .limit(limit)

      if (fallbackSamples && fallbackSamples.length > 0) {
        return fallbackSamples.map((s: any) => s.content).join('\n\n---\n\n')
      }

      return ''
    }

    if (!samples || samples.length === 0) {
      return ''
    }

    // Format samples as context
    const contextSamples = samples
      .map((sample: any, index: number) => {
        return `[참고 예시 ${index + 1}]\n${sample.content}`
      })
      .join('\n\n---\n\n')

    return contextSamples
  } catch (error) {
    console.error('Error in getRAGContext:', error)
    return ''
  }
}

/**
 * Add a new curator sample to the RAG database
 */
export async function addCuratorSample(
  content: string,
  contentType: string,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Generate embedding for the content
    const embedding = await generateEmbedding(content)

    // Insert into database
    const { error } = await supabase.from('curator_samples').insert({
      content,
      content_type: contentType,
      embedding,
      metadata,
    })

    if (error) {
      console.error('Error adding curator sample:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in addCuratorSample:', error)
    return false
  }
}

/**
 * Populate embeddings for existing curator samples
 */
export async function populateEmbeddings(): Promise<void> {
  try {
    const supabase = await createClient()

    // Get samples without embeddings
    const { data: samples } = await supabase
      .from('curator_samples')
      .select('id, content')
      .is('embedding', null)

    if (!samples || samples.length === 0) {
      console.log('No samples to process')
      return
    }

    console.log(`Processing ${samples.length} samples...`)

    for (const sample of samples) {
      const embedding = await generateEmbedding(sample.content)

      await supabase
        .from('curator_samples')
        .update({ embedding })
        .eq('id', sample.id)

      console.log(`Processed sample ${sample.id}`)
    }

    console.log('All embeddings populated')
  } catch (error) {
    console.error('Error populating embeddings:', error)
  }
}
