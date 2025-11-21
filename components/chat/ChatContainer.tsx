'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { ImageUploader } from './ImageUploader'
import { KeywordsInput } from './KeywordsInput'
import ArtworkTitleEditor from './ArtworkTitleEditor'
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
import { mapStepToContentType } from '@/lib/utils/helpers'

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
    const failedUploads: string[] = []

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
              title: `작품 ${imageUrls.length}`, // Use numbered title as default
              order_index: imageUrls.length - 1,
            })

          if (artworkError) {
            console.error('Error saving artwork to database:', artworkError)
            alert(`작품 정보 저장 실패: ${file.name}. 다시 시도해주세요.`)
            failedUploads.push(file.name)
          }
        }
      } else {
        console.error('Error uploading image to storage:', error)
        console.error('Failed file:', file.name)
        console.error('Error details:', error?.message || 'Unknown error')

        failedUploads.push(file.name)

        // Show user-friendly error message
        alert(
          `이미지 업로드 실패: ${file.name}\n\n` +
          `오류: ${error?.message || '알 수 없는 오류'}\n\n` +
          'Supabase Storage 설정을 확인해주세요:\n' +
          '1. "artworks" 버킷이 존재하는지\n' +
          '2. 버킷이 Public으로 설정되어 있는지\n' +
          '3. 업로드 권한이 있는지'
        )
      }
    }

    // Only proceed if all uploads succeeded
    if (failedUploads.length > 0) {
      console.error('Failed to upload files:', failedUploads)
      alert(
        `${failedUploads.length}개의 이미지 업로드에 실패했습니다.\n\n` +
        `실패한 파일:\n${failedUploads.join('\n')}\n\n` +
        '모든 이미지가 성공적으로 업로드되어야 진행할 수 있습니다.'
      )
      return // Don't proceed to next step
    }

    // Only save if all uploads succeeded
    if (imageUrls.length === files.length) {
      setExhibitionData((prev) => ({ ...prev, images: imageUrls }))
      setStep('edit-titles') // Go to title editing step
    }
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

    // Generate introduction and preface
    try {
      const introResponse = await fetch('/api/generate/introduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          keywords: exhibitionData.keywords,
        }),
      })

      const prefaceResponse = await fetch('/api/generate/preface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          keywords: exhibitionData.keywords,
        }),
      })

      if (introResponse.ok && prefaceResponse.ok) {
        const introData = await introResponse.json()
        const prefaceData = await prefaceResponse.json()

        setExhibitionData((prev) => ({
          ...prev,
          introduction: introData.introduction,
          preface: prefaceData.preface,
        }))

        // Save introduction and preface to exhibition_content table
        if (exhibitionData.id) {
          // Save introduction
          await supabase
            .from('exhibition_content')
            .insert({
              exhibition_id: exhibitionData.id,
              content_type: 'introduction',
              content: introData.introduction,
            })

          // Save preface
          await supabase
            .from('exhibition_content')
            .insert({
              exhibition_id: exhibitionData.id,
              content_type: 'preface',
              content: prefaceData.preface,
            })
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
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
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

        {step === 'edit-titles' && exhibitionData.id && (
          <ArtworkTitleEditor
            exhibitionId={exhibitionData.id}
            onComplete={() => setStep('titles')}
            onSkip={() => setStep('titles')}
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

        {['content'].includes(step) && messages.length > 0 && (
          <MessageList messages={messages} />
        )}
      </div>

      {['content'].includes(step) && (
        <div className="border-t pt-4 mt-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder="AI 큐레이터와 대화하기..."
          />
        </div>
      )}
    </div>
  )
}
