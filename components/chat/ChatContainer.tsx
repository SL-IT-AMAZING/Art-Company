'use client'

import { useState, useEffect, useRef } from 'react'
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
import ExhibitionMetadataForm from './ExhibitionMetadataForm'
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
  const initRef = useRef(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

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
    if (initRef.current) return  // Guard with ref to prevent StrictMode double-calls
    initRef.current = true

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

  const handleProceedToMetadata = () => {
    setStep('metadata')
  }

  const handleMetadataSubmit = async (metadata: {
    exhibitionDate: string
    exhibitionEndDate?: string
    venue: string
    location: string
    artistName: string
    openingHours?: string
    admissionFee?: string
    contactInfo?: string
  }) => {
    // Update exhibition data
    setExhibitionData((prev) => ({
      ...prev,
      exhibitionDate: metadata.exhibitionDate,
      exhibitionEndDate: metadata.exhibitionEndDate,
      venue: metadata.venue,
      location: metadata.location,
      artistName: metadata.artistName,
      openingHours: metadata.openingHours,
      admissionFee: metadata.admissionFee,
      contactInfo: metadata.contactInfo,
    }))

    // Save metadata to database
    if (exhibitionData.id) {
      const { error } = await supabase
        .from('exhibitions')
        .update({
          exhibition_date: metadata.exhibitionDate,
          exhibition_end_date: metadata.exhibitionEndDate || null,
          venue: metadata.venue,
          location: metadata.location,
          artist_name: metadata.artistName,
          opening_hours: metadata.openingHours || null,
          admission_fee: metadata.admissionFee || null,
          contact_info: metadata.contactInfo || null,
        })
        .eq('id', exhibitionData.id)

      if (error) {
        console.error('Error saving metadata:', error)
      }
    }

    setStep('keywords')
  }

  const handlePreviousStep = () => {
    const stepOrder: Step[] = [
      'welcome',
      'metadata',
      'keywords',
      'images',
      'edit-titles',
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

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

  // Sanitize filename for Supabase Storage (remove Korean/special characters)
  const sanitizeFilename = (filename: string): string => {
    // Get file extension
    const lastDotIndex = filename.lastIndexOf('.')
    const ext = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : ''
    const nameWithoutExt = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename

    // Replace non-ASCII characters and spaces with underscore
    const sanitized = nameWithoutExt
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w.-]/g, '_') // Replace non-alphanumeric with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 50) // Limit length

    // If sanitized name is empty, use 'image'
    const finalName = sanitized || 'image'

    return `${finalName}${ext}`.toLowerCase()
  }

  const handleImagesUpload = async (files: File[]) => {
    const imageUrls: string[] = []
    const failedUploads: string[] = []
    const uploadedPaths: string[] = [] // Track uploaded file paths for cleanup

    // Get current max order_index BEFORE starting uploads to prevent race condition
    let nextOrderIndex = 0
    if (exhibitionData.id) {
      const { data: existingArtworks } = await supabase
        .from('artworks')
        .select('order_index')
        .eq('exhibition_id', exhibitionData.id)
        .order('order_index', { ascending: false })
        .limit(1)

      nextOrderIndex = existingArtworks?.[0]?.order_index != null
        ? existingArtworks[0].order_index + 1
        : 0
    }

    // Upload to Supabase Storage and save artwork records
    for (const file of files) {
      // Load image to get dimensions
      const imageData = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new window.Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
          URL.revokeObjectURL(url)
          resolve({ width: img.width, height: img.height })
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('Failed to load image'))
        }
        img.src = url
      }).catch(() => ({ width: 0, height: 0 }))

      // Sanitize filename to remove Korean characters and special characters
      const sanitizedName = sanitizeFilename(file.name)
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}`

      // Add timeout to upload request (30 seconds)
      const uploadPromise = supabase.storage
        .from('artworks')
        .upload(fileName, file)

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('업로드 시간이 초과되었습니다. 이미지 파일이 너무 클 수 있습니다.')), 30000)
      )

      let data, error
      try {
        const result = await Promise.race([uploadPromise, timeoutPromise]) as any
        data = result.data
        error = result.error
      } catch (timeoutError: any) {
        error = timeoutError
        data = null
      }

      if (data && !error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('artworks').getPublicUrl(data.path)

        // Track the path for potential cleanup
        uploadedPaths.push(data.path)

        // Calculate aspect ratio
        const aspectRatio = imageData.width > 0 ? imageData.width / imageData.height : 1

        // Save artwork metadata to database with dimensions
        if (exhibitionData.id) {
          const { error: artworkError } = await supabase
            .from('artworks')
            .insert({
              exhibition_id: exhibitionData.id,
              image_url: publicUrl,
              title: `작품 ${nextOrderIndex + 1}`, // Use counter-based title
              order_index: nextOrderIndex,
              image_width: imageData.width,
              image_height: imageData.height,
              aspect_ratio: aspectRatio,
            })

          if (artworkError) {
            console.error('Error saving artwork to database:', artworkError)
            // Clean up the uploaded file since DB insert failed
            await supabase.storage.from('artworks').remove([data.path])
            uploadedPaths.pop() // Remove from tracking since we deleted it
            failedUploads.push(file.name)
          } else {
            // Only add to imageUrls after BOTH storage and DB succeed
            imageUrls.push(publicUrl)
            // Increment counter for next artwork
            nextOrderIndex++
          }
        } else {
          // No exhibition ID - this shouldn't happen, but handle it
          await supabase.storage.from('artworks').remove([data.path])
          uploadedPaths.pop()
          failedUploads.push(file.name)
          console.error('No exhibition ID available for artwork upload')
        }
      } else {
        console.error('Error uploading image to storage:', error)
        console.error('Failed file:', file.name)
        console.error('Error details:', error?.message || 'Unknown error')

        failedUploads.push(file.name)

        // Determine error type and show appropriate message
        let errorMessage = error?.message || '알 수 없는 오류'
        let troubleshootingTips = ''

        if (errorMessage.includes('시간이 초과')) {
          troubleshootingTips =
            '해결 방법:\n' +
            '1. 이미지 파일 크기를 줄여보세요 (5MB 이하 권장)\n' +
            '2. 네트워크 연결 상태를 확인해주세요\n' +
            '3. 잠시 후 다시 시도해주세요'
        } else if (errorMessage.includes('not valid JSON') || errorMessage.includes('504')) {
          errorMessage = '서버 응답 시간 초과 (이미지 파일이 너무 크거나 네트워크가 불안정합니다)'
          troubleshootingTips =
            '해결 방법:\n' +
            '1. 이미지 파일 크기를 줄여보세요 (5MB 이하 권장)\n' +
            '2. 네트워크 연결 상태를 확인해주세요\n' +
            '3. 잠시 후 다시 시도해주세요'
        } else {
          troubleshootingTips =
            'Supabase Storage 설정을 확인해주세요:\n' +
            '1. "artworks" 버킷이 존재하는지\n' +
            '2. 버킷이 Public으로 설정되어 있는지\n' +
            '3. 업로드 권한이 있는지'
        }

        // Show user-friendly error message
        alert(
          `이미지 업로드 실패: ${file.name}\n\n` +
          `오류: ${errorMessage}\n\n` +
          troubleshootingTips
        )
      }
    }

    // Handle partial or complete failure
    if (failedUploads.length > 0) {
      // Clean up all successfully uploaded files on any failure (atomic operation)
      if (uploadedPaths.length > 0) {
        console.log('Cleaning up uploaded files due to partial failure...')
        await supabase.storage.from('artworks').remove(uploadedPaths)

        // Also clean up database records
        if (exhibitionData.id && imageUrls.length > 0) {
          await supabase
            .from('artworks')
            .delete()
            .eq('exhibition_id', exhibitionData.id)
            .in('image_url', imageUrls)
        }
      }

      console.error('Failed to upload files:', failedUploads)
      alert(
        `${failedUploads.length}개의 이미지 업로드에 실패했습니다.\n\n` +
        `실패한 파일:\n${failedUploads.join('\n')}\n\n` +
        '모든 이미지가 성공적으로 업로드되어야 진행할 수 있습니다.\n' +
        '다시 시도해주세요.'
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
            artistName: exhibitionData.artistName || '작가',
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
          // Note: Artwork titles/descriptions are preserved from original upload (edit-titles step)
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
                <div ref={messagesContainerRef} className="flex-1 p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto bg-background/50">
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
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              {messages.filter(m => m.role === 'user').length === 0 && (
                <p className="text-sm text-muted-foreground">
                  AI 큐레이터와 최소 1번 대화해주세요
                </p>
              )}
              <Button
                onClick={handleProceedToMetadata}
                size="lg"
                disabled={isLoading || messages.filter(m => m.role === 'user').length === 0}
              >
                다음 단계로 →
              </Button>
            </div>
          </div>
        )}

        {step === 'metadata' && (
          <div className="space-y-4 overflow-y-auto">
            <ExhibitionMetadataForm
              onSubmit={handleMetadataSubmit}
              onBack={handlePreviousStep}
              initialData={{
                exhibitionDate: exhibitionData.exhibitionDate,
                exhibitionEndDate: exhibitionData.exhibitionEndDate,
                venue: exhibitionData.venue,
                location: exhibitionData.location,
                artistName: exhibitionData.artistName,
                openingHours: exhibitionData.openingHours,
                admissionFee: exhibitionData.admissionFee,
                contactInfo: exhibitionData.contactInfo,
              }}
            />
          </div>
        )}

        {step === 'keywords' && (
          <div className="space-y-4 overflow-y-auto">
              <KeywordsInput
                onSubmit={handleKeywordsSubmit}
                initialKeywords={exhibitionData.keywords}
              />
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
