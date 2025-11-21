import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatContainer } from '@/components/chat/ChatContainer'

export default async function CurationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto">
      <ChatContainer />
    </div>
  )
}
