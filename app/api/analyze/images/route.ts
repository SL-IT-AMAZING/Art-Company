import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageUrls } = await req.json()

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'No image URLs provided' },
        { status: 400 }
      )
    }

    // Analyze images using OpenAI Vision API
    const analysisPromises = imageUrls.map(async (imageUrl: string) => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `당신은 한국 현대미술 전문가입니다. 이 작품 이미지를 분석하여 다음 정보를 제공해주세요:
1. 작품의 주요 주제와 컨셉
2. 사용된 기법과 스타일
3. 색채와 구도의 특징
4. 작품에서 느껴지는 감정과 분위기
5. 작품을 설명할 수 있는 키워드 5-7개

JSON 형식으로 응답해주세요:
{
  "theme": "작품의 주제",
  "technique": "사용된 기법",
  "style": "예술 스타일",
  "colors": "색채 특징",
  "composition": "구도 특징",
  "emotion": "감정과 분위기",
  "keywords": ["키워드1", "키워드2", ...]
}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Parse JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
        return { error: 'Failed to parse response' }
      } catch {
        return { error: 'Invalid JSON response' }
      }
    })

    const analyses = await Promise.all(analysisPromises)

    // Aggregate keywords from all images
    const allKeywords: string[] = []
    analyses.forEach((analysis) => {
      if (analysis.keywords && Array.isArray(analysis.keywords)) {
        allKeywords.push(...analysis.keywords)
      }
    })

    // Get unique keywords
    const uniqueKeywords = [...new Set(allKeywords)]

    return NextResponse.json({
      analyses,
      aggregatedKeywords: uniqueKeywords.slice(0, 15), // Top 15 keywords
    })
  } catch (error) {
    console.error('Image analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze images' },
      { status: 500 }
    )
  }
}
