import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (if configured)
    const signature = request.headers.get('x-webhook-signature')
    const secret = process.env.SUPABASE_WEBHOOK_SECRET

    // TODO: Implement signature verification for production
    // See: https://supabase.com/docs/guides/auth/auth-hooks

    const payload = await request.json()
    const { user } = payload

    if (!user) {
      return NextResponse.json({ error: 'No user data' }, { status: 400 })
    }

    // Create notification for admin
    const { error } = await supabaseAdmin
      .from('registration_notifications')
      .insert({
        user_id: user.id,
        user_email: user.email,
        user_metadata: user.user_metadata || null,
        is_read: false,
      })

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
