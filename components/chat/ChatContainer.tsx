'use client'

import { useState, useEffect } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
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
  const [chatInitialized, setChatInitialized] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      exhibitionId: exhibitionData.id,
      step,
      data: exhibitionData,
    },
  })

  const supabase = createClient()

  // Initialize chat and exhibition
  const initExhibition = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('User not logged in')
        return
      }

      const { data, error } = await supabase
        .from('exhibitions')
        .insert({ user_id: user.id, status: 'draft' })
        .select()
        .single()

      if (data && !error) {
        setExhibitionData((prev) => ({ ...prev, id: data.id }))
      } else {
        console.error('Error creating exhibition:', error)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  // Initialize chat on mount
  const initializeChat = () => {
    if (!chatInitialized) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: '안녕하세요! 저는 Art Wizard의 AI 큐레이터입니다. 🎨\n\n어떤 전시를 기획 중이신가요? 전시의 주제, 컨셉, 분위기 등 자유롭게 말씀해주세요!',
          createdAt: new Date(),
        },
      ])
      setChatInitialized(true)
      initExhibition()
    }
  }

  const handleProceedToKeywords = () => {
    setStep('keywords')
  }

  const handlePreviousStep = () => {
    const stepOrder: Step[] = [
      'welcome',
      'keywords',
      'images',
      'titles',
      'content',
      'press-release',
      'poster',
      'marketing',
      'virtual',
      'complete',
    ]
    const currentIndex = stepOrder.indexOf(step)
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1])
    }
  }

  // Auto-initialize chat on mount
  useEffect(() => {
    initializeChat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setIsGeneratingContent(true)

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
              content: { text: introData.introduction },
            }),
            supabase.from('exhibition_content').insert({
              exhibition_id: exhibitionData.id,
              content_type: 'preface',
              content: { text: prefaceData.preface },
            }),
            supabase.from('exhibition_content').insert({
              exhibition_id: exhibitionData.id,
              content_type: 'artist_bio',
              content: { text: artistBioData.artistBio },
            }),
          ])
        }
      }
    } catch (error) {
      console.error('Error generating content:', error)
      alert('콘텐츠 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGeneratingContent(false)
    }

    setStep('content')
  }

  const handleMarketingComplete = (report: MarketingReport) => {
    setExhibitionData((prev) => ({ ...prev, marketingReport: report }))
    setStep('virtual')
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-64px)] p-2 sm:p-4 flex flex-col">
      {/* Step Progress Bar */}
      <div className="pb-2 sm:pb-4 mb-2 sm:mb-4 border-b flex-shrink-0">
        <StepProgress currentStep={step} onStepChange={setStep} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {step === 'welcome' && (
          <div className="flex flex-col items-center h-full space-y-2 sm:space-y-4">
            {/* Header */}
            <div className="text-center space-y-1 sm:space-y-2 flex-shrink-0 px-2">
              <h1 className="text-xl sm:text-2xl font-bold">AI 큐레이터와 전시 기획하기</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                AI 큐레이터와 대화하며 당신의 전시 아이디어를 구체화하세요
              </p>
            </div>

            {/* Chat Container */}
            <div className="w-full max-w-4xl border rounded-lg sm:rounded-xl bg-gradient-to-b from-card to-card/50 shadow-lg overflow-hidden flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="bg-primary/5 border-b px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg sm:text-xl">🎨</span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold">AI 큐레이터</h3>
                      <p className="text-xs text-muted-foreground">전시 기획 전문가</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto bg-background/50">
                  {messages.length > 0 ? (
                    <MessageList messages={messages} />
                  ) : (
                    <div className="text-center text-xs sm:text-sm text-muted-foreground py-8">
                      대화를 시작해주세요...
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t bg-card p-2 sm:p-4 flex-shrink-0">
                  <ChatInput
                    input={input}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    placeholder="전시 아이디어를 자유롭게 말씀해주세요..."
                  />
                </div>
              </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 flex-shrink-0">
              <Button
                onClick={handleProceedToKeywords}
                size="lg"
                disabled={isLoading}
              >
                다음 단계로 →
              </Button>
            </div>
          </div>
        )}

        {step === 'keywords' && (
          <div className="space-y-4 overflow-y-auto">
              <KeywordsInput onSubmit={handleKeywordsSubmit} />
              <div className="flex justify-between pt-4">
                <Button onClick={handlePreviousStep} variant="outline">
                  ← 이전 단계
                </Button>
              </div>
            </div>
          )}

        {step === 'images' && (
          <div className="space-y-4 overflow-y-auto">
            <ImageUploader
              onUpload={handleImagesUpload}
              existingImages={exhibitionData.images}
            />
            <div className="flex justify-between pt-4">
              <Button onClick={handlePreviousStep} variant="outline">
                ← 이전 단계
              </Button>
            </div>
          </div>
        )}

        {step === 'edit-titles' && exhibitionData.id && (
          <ArtworkTitleEditor
            exhibitionId={exhibitionData.id}
            onComplete={() => setStep('titles')}
            onSkip={() => setStep('titles')}
          />
        )}

        {step === 'titles' && (
          <div className="space-y-4 overflow-y-auto">
            {isGeneratingContent ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">전시 본문 생성 중...</h3>
                    <p className="text-sm text-muted-foreground">
                      AI가 전시 소개, 서문, 작가 소개, 작품 설명을 생성하고 있습니다.
                      <br />
                      <span className="font-medium text-primary">예상 소요시간: 약 20-30초</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      전시 소개문 생성 중
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                      전시 서문 및 작품 설명 생성 중
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <TitleSelector
                  keywords={exhibitionData.keywords}
                  images={exhibitionData.images}
                  conversationContext={messages
                    .filter((m) => m.role === 'user')
                    .map((m) => m.content)
                    .join(' ')}
                  onSelect={handleTitleSelect}
                />
                <div className="flex justify-between pt-4">
                  <Button onClick={handlePreviousStep} variant="outline">
                    ← 이전 단계
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'content' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <ContentPreview
                data={exhibitionData}
                onNext={() => setStep('press-release')}
              />
            </div>
            <div className="flex justify-between pt-4 flex-shrink-0">
              <Button onClick={handlePreviousStep} variant="outline">
                ← 이전 단계
              </Button>
            </div>
          </div>
        )}

        {step === 'press-release' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <PressReleaseGenerator
                data={exhibitionData}
                onComplete={() => setStep('poster')}
              />
            </div>
            <div className="flex justify-between pt-4 flex-shrink-0">
              <Button onClick={handlePreviousStep} variant="outline">
                ← 이전 단계
              </Button>
            </div>
          </div>
        )}

        {step === 'poster' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <PosterGenerator
                data={exhibitionData}
                onComplete={() => setStep('marketing')}
              />
            </div>
            <div className="flex justify-between pt-4 flex-shrink-0">
              <Button onClick={handlePreviousStep} variant="outline">
                ← 이전 단계
              </Button>
            </div>
          </div>
        )}

        {step === 'marketing' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <MarketingReportGenerator
                data={exhibitionData}
                onComplete={handleMarketingComplete}
              />
            </div>
            <div className="flex justify-between pt-4 flex-shrink-0">
              <Button onClick={handlePreviousStep} variant="outline">
                ← 이전 단계
              </Button>
            </div>
          </div>
        )}

        {step === 'virtual' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <VirtualExhibitionPrompt
                data={exhibitionData}
                onComplete={() => setStep('complete')}
              />
            </div>
            <div className="flex justify-between pt-4 flex-shrink-0">
              <Button onClick={handlePreviousStep} variant="outline">
                ← 이전 단계
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <ExhibitionComplete data={exhibitionData} />
            </div>
            <div className="flex justify-between pt-4 flex-shrink-0">
              <Button onClick={handlePreviousStep} variant="outline">
                ← 이전 단계
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
