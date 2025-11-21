import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { contentType, content } = await req.json()
    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this exhibition
    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (!exhibition || exhibition.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if content already exists
    const { data: existing } = await supabase
      .from('exhibition_content')
      .select('id')
      .eq('exhibition_id', params.id)
      .eq('content_type', contentType)
      .single()

    if (existing) {
      // Update existing content
      const { error: updateError } = await supabase
        .from('exhibition_content')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Insert new content
      const { error: insertError } = await supabase
        .from('exhibition_content')
        .insert({
          exhibition_id: params.id,
          content_type: contentType,
          content,
        })

      if (insertError) {
        throw insertError
      }
    }

    // Update exhibition's updated_at timestamp
    await supabase
      .from('exhibitions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving content:', error)
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all content for this exhibition
    const { data: contents, error } = await supabase
      .from('exhibition_content')
      .select('*')
      .eq('exhibition_id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ contents })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
