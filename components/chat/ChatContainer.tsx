'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { ImageUploader } from './ImageUploader'
import { KeywordsInput } from './KeywordsInput'
import { TitleSelector } from './TitleSelector'
import { ContentPreview } from './ContentPreview'
import { PosterGenerator } from '../poster/PosterGenerator'
import { PressReleaseGenerator } from '../press-release/PressReleaseGenerator'
import { MarketingReportGenerator } from '../marketing/MarketingReportGenerator'
import { VirtualExhibitionPrompt } from '../exhibition/VirtualExhibitionPrompt'
import { ExhibitionComplete } from '../exhibition/ExhibitionComplete'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ExhibitionData, MarketingReport } from '@/types/exhibition'
import { Step } from '@/types/chat'
import { StepProgress } from './StepProgress'

export function ChatContainer() {
  const [step, setStep] = useState<Step>('welcome')
  const [exhibitionData, setExhibitionData] = useState<ExhibitionData>({
    keywords: [],
    images: [],
    selectedTitle: '',
  })

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      exhibitionId: exhibitionData.id,
      step,
      data: exhibitionData,
    },
  })

  const supabase = createClient()

  // Initialize exhibition in database
  const initExhibition = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // If not logged in, still allow creation but without user_id
      // In production, you'd want to require login
      console.warn('User not logged in')
      setStep('keywords')
      return
    }

    const { data, error } = await supabase
      .from('exhibitions')
      .insert({ user_id: user.id, status: 'draft' })
      .select()
      .single()

    if (data && !error) {
      setExhibitionData((prev) => ({ ...prev, id: data.id }))
      setStep('keywords')
    } else {
      console.error('Error creating exhibition:', error)
      setStep('keywords') // Continue anyway for demo
    }
  }

  const handleStart = () => {
    initExhibition()
  }

  const handleKeywordsSubmit = async (keywords: string[]) => {
    setExhibitionData((prev) => ({ ...prev, keywords }))

    // Save keywords to database
    if (exhibitionData.id) {
      const { error } = await supabase
        .from('exhibitions')
        .update({ keywords })
        .eq('id', exhibitionData.id)

      if (error) {
        console.error('Error saving keywords:', error)
      }
    }

    setStep('images')
  }

  const handleImagesUpload = async (files: File[]) => {
    const imageUrls: string[] = []

    // Upload to Supabase Storage and save artwork records
    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('artworks')
        .upload(fileName, file)

      if (data && !error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('artworks').getPublicUrl(data.path)
        imageUrls.push(publicUrl)

        // Save artwork metadata to database
        if (exhibitionData.id) {
          const { error: artworkError } = await supabase
            .from('artworks')
            .insert({
              exhibition_id: exhibitionData.id,
              image_url: publicUrl,
              title: file.name.replace(/\.[^/.]+$/, ''), // Use filename without extension as default title
              order_index: imageUrls.length - 1,
            })

          if (artworkError) {
            console.error('Error saving artwork:', artworkError)
          }
        }
      } else {
        console.error('Error uploading image:', error)
        // For demo, create a placeholder URL
        imageUrls.push(URL.createObjectURL(file))
      }
    }

    setExhibitionData((prev) => ({ ...prev, images: imageUrls }))
    setStep('titles')
  }

  const handleTitleSelect = async (title: string) => {
    setExhibitionData((prev) => ({ ...prev, selectedTitle: title }))

    // Save title to database
    if (exhibitionData.id) {
      const { error } = await supabase
        .from('exhibitions')
        .update({ title })
        .eq('id', exhibitionData.id)

      if (error) {
        console.error('Error saving title:', error)
      }
    }

    // Generate all content: introduction, preface, artist bio, artwork descriptions
    try {
      const [introResponse, prefaceResponse, artistBioResponse, artworkDescResponse] = await Promise.all([
        fetch('/api/generate/introduction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            keywords: exhibitionData.keywords,
          }),
        }),
        fetch('/api/generate/preface', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            keywords: exhibitionData.keywords,
          }),
        }),
        fetch('/api/generate/artist-bio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artistName: '작가', // TODO: Get from user input
            keywords: exhibitionData.keywords,
            title,
          }),
        }),
        fetch('/api/generate/artwork-descriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artworks: exhibitionData.images.map((url, idx) => ({
              id: idx,
              imageUrl: url,
              title: `작품 ${idx + 1}`,
            })),
            title,
            keywords: exhibitionData.keywords,
          }),
        }),
      ])

      if (introResponse.ok && prefaceResponse.ok && artistBioResponse.ok && artworkDescResponse.ok) {
        const introData = await introResponse.json()
        const prefaceData = await prefaceResponse.json()
        const artistBioData = await artistBioResponse.json()
        const artworkDescData = await artworkDescResponse.json()

        setExhibitionData((prev) => ({
          ...prev,
          introduction: introData.introduction,
          preface: prefaceData.preface,
          artistBio: artistBioData.artistBio,
          artworkDescriptions: artworkDescData.descriptions,
        }))

        // Save all content to database
        if (exhibitionData.id) {
          await Promise.all([
            supabase.from('exhibition_content').insert({
              exhibition_id: exhibitionData.id,
              content_type: 'introduction',
              content: introData.introduction,
            }),
            supabase.from('exhibition_content').insert({
              exhibition_id: exhibitionData.id,
              content_type: 'preface',
              content: prefaceData.preface,
            }),
            supabase.from('exhibition_content').insert({
              exhibition_id: exhibitionData.id,
              content_type: 'artist_bio',
              content: artistBioData.artistBio,
            }),
            ...artworkDescData.descriptions.map((desc: any) =>
              supabase.from('exhibition_content').insert({
                exhibition_id: exhibitionData.id,
                content_type: 'artwork_description',
                content: JSON.stringify(desc),
              })
            ),
          ])
        }
      }
    } catch (error) {
      console.error('Error generating content:', error)
    }

    setStep('content')
  }

  const handleMarketingComplete = (report: MarketingReport) => {
    setExhibitionData((prev) => ({ ...prev, marketingReport: report }))
    setStep('virtual')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr] h-[calc(100vh-64px)] p-4">
      <div className="flex flex-col border rounded-lg bg-card/30 p-4 overflow-hidden">
        <div className="pb-4 border-b mb-4">
          <StepProgress currentStep={step} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {step === 'welcome' && (
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold mb-4">Art Wizard</h1>
              <p className="text-xl text-gray-600 mb-8">
                AI 큐레이터가 당신의 전시를 기획합니다
              </p>
              <Button onClick={handleStart} size="lg">
                전시 만들기 시작
              </Button>
            </div>
          )}

          {step === 'keywords' && (
            <KeywordsInput onSubmit={handleKeywordsSubmit} />
          )}

          {step === 'images' && (
            <ImageUploader
              onUpload={handleImagesUpload}
              existingImages={exhibitionData.images}
            />
          )}

          {step === 'titles' && (
            <TitleSelector
              keywords={exhibitionData.keywords}
              images={exhibitionData.images}
              onSelect={handleTitleSelect}
            />
          )}

          {step === 'content' && (
            <ContentPreview
              data={exhibitionData}
              onNext={() => setStep('press-release')}
            />
          )}

          {step === 'press-release' && (
            <PressReleaseGenerator
              data={exhibitionData}
              onComplete={() => setStep('poster')}
            />
          )}

          {step === 'poster' && (
            <PosterGenerator
              data={exhibitionData}
              onComplete={() => setStep('marketing')}
            />
          )}

          {step === 'marketing' && (
            <MarketingReportGenerator
              data={exhibitionData}
              onComplete={handleMarketingComplete}
            />
          )}

          {step === 'virtual' && (
            <VirtualExhibitionPrompt
              data={exhibitionData}
              onComplete={() => setStep('complete')}
            />
          )}

          {step === 'complete' && (
            <ExhibitionComplete data={exhibitionData} />
          )}
        </div>
      </div>

      <div className="flex flex-col border rounded-lg bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">AI 큐레이터와 대화</h2>
          <p className="text-sm text-muted-foreground">
            전시 과정 전반에 대해 질문하거나 피드백을 요청하세요.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length > 0 ? (
            <MessageList messages={messages} />
          ) : (
            <div className="text-center text-sm text-muted-foreground mt-12">
              아직 대화가 없습니다. 궁금한 점을 입력해보세요.
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder="AI 큐레이터와 대화하기..."
          />
        </div>
      </div>
    </div>
  )
}
