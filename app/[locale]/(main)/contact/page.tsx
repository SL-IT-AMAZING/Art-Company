import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/contact/ContactForm'

export default async function ContactPage() {
  const t = await getTranslations('contact')
  const supabase = await createClient()

  // Get user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email
  const userName = user?.user_metadata?.full_name as string | undefined

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-muted-foreground">{t('description')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('formTitle')}</CardTitle>
            <CardDescription>{t('formDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm userEmail={userEmail} userName={userName} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
