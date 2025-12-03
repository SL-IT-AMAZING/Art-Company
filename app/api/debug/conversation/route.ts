import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 디버그용 API - curator_conversation 확인
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 최근 exhibition 가져오기
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, title, curator_conversation, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = exhibitions?.map(ex => ({
      id: ex.id,
      title: ex.title,
      created_at: ex.created_at,
      conversation_count: ex.curator_conversation?.length || 0,
      conversation_preview: ex.curator_conversation?.slice(0, 2) || [],
    }))

    return NextResponse.json({ exhibitions: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
