# Art Wizard MVP - Implementation Plan

## 🗂️ Project Structure

```
art-wizard/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing
│   │   ├── curation/
│   │   │   └── page.tsx                # AI Chatbot
│   │   ├── exhibition/
│   │   │   ├── page.tsx                # Exhibition List
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Virtual Exhibition Viewer
│   │   ├── salon/
│   │   │   └── page.tsx                # Art Salon (Community)
│   │   ├── notice/
│   │   │   └── page.tsx                # Notice Board
│   │   ├── about/
│   │   │   └── page.tsx                # About Page
│   │   └── mypage/
│   │       ├── page.tsx                # Dashboard
│   │       └── exhibitions/
│   │           └── [id]/page.tsx       # Edit Exhibition
│   ├── api/
│   │   ├── chat/route.ts               # Streaming Chat API
│   │   ├── generate/
│   │   │   ├── title/route.ts          # Generate Titles
│   │   │   ├── content/route.ts        # Generate Content
│   │   │   ├── poster/route.ts         # Generate Poster
│   │   │   └── pdf/route.ts            # Generate PDF Package
│   │   └── exhibition/
│   │       ├── route.ts                # CRUD Exhibition
│   │       └── [id]/route.ts           # Single Exhibition
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                             # shadcn components
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── MessageList.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── TitleSelector.tsx
│   │   └── ContentPreview.tsx
│   ├── exhibition/
│   │   ├── VirtualGallery.tsx
│   │   ├── ParallaxGallery.tsx
│   │   ├── ArtworkFrame.tsx
│   │   ├── ArtworkDetail.tsx
│   │   └── GalleryNavigation.tsx
│   ├── poster/
│   │   ├── PosterPreview.tsx
│   │   └── PosterTemplate.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── openai/
│   │   ├── client.ts
│   │   └── prompts.ts
│   ├── rag/
│   │   ├── embeddings.ts
│   │   └── retrieval.ts
│   ├── generators/
│   │   ├── pdf.ts
│   │   ├── poster.ts
│   │   └── exhibition.ts
│   └── utils/
│       ├── helpers.ts
│       └── constants.ts
├── hooks/
│   ├── useChat.ts
│   ├── useExhibition.ts
│   └── useAuth.ts
├── types/
│   ├── exhibition.ts
│   ├── chat.ts
│   └── database.ts
├── public/
│   ├── templates/
│   │   ├── poster-minimal.png
│   │   ├── poster-classic.png
│   │   └── gallery-room.glb
│   └── fonts/
├── data/
│   └── reference/
│       ├── prefaces.json
│       ├── press-releases.json
│       └── marketing-reports.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "ai": "^3.4.0",
    "openai": "^4.67.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^9.115.0",
    "three": "^0.169.0",
    "framer-motion": "^11.11.0",
    "zustand": "^5.0.0",
    "react-dropzone": "^14.2.9",
    "pdfkit": "^0.15.0",
    "sharp": "^0.33.5",
    "lucide-react": "^0.454.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-toast": "^1.2.2"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 🔧 Core Implementation

### 1. Supabase Setup

**`lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### 2. OpenAI Integration

**`lib/openai/client.ts`**
```typescript
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
```

**`lib/openai/prompts.ts`**
```typescript
export const PROMPTS = {
  generateTitles: (keywords: string[], artworkDescriptions: string[]) => `
당신은 한국 현대미술 전문 큐레이터입니다.
다음 키워드와 작품 설명을 바탕으로 전시 타이틀 5개를 제안해주세요.

키워드: ${keywords.join(', ')}
작품 설명: ${artworkDescriptions.join('\n')}

각 타이틀은:
- 감성적이고 상징적인 표현 사용
- 한국어와 영어 병기 가능
- 전시의 핵심 메시지 담기

JSON 형식으로 응답:
{ "titles": ["타이틀1", "타이틀2", "타이틀3", "타이틀4", "타이틀5"] }
`,

  generateIntroduction: (title: string, keywords: string[], context: string) => `
당신은 한국 현대미술 전문 큐레이터입니다.
다음 정보를 바탕으로 전시 소개문을 작성해주세요.

전시 타이틀: ${title}
키워드: ${keywords.join(', ')}
참고 스타일: ${context}

전시 소개문 작성 원칙:
- 200~300자 분량
- 관람객이 쉽게 이해할 수 있는 설명적 톤
- 전시의 핵심 주제와 메시지 전달
- 작품과 작가에 대한 간략한 맥락 제공

JSON 형식으로 응답:
{ "introduction": "소개문 내용" }
`,

  generatePreface: (title: string, keywords: string[], context: string) => `
당신은 한국 현대미술 전문 큐레이터입니다.
다음 정보를 바탕으로 전시 서문을 작성해주세요.

전시 타이틀: ${title}
키워드: ${keywords.join(', ')}
참고 스타일: ${context}

전시 서문 작성 원칙:
- 500~800자 분량
- 학술적이면서도 깊이 있는 톤
- 전시의 예술사적/문화적 맥락 설명
- 작가의 예술 세계와 철학 탐구
- 관람객에게 작품을 바라보는 시선 제안

JSON 형식으로 응답:
{ "preface": "서문 내용" }
`,

  generatePressRelease: (exhibitionData: any, context: string) => `
당신은 미술 전문 홍보 담당자입니다.
다음 전시 정보를 바탕으로 보도자료를 작성해주세요.

전시 정보:
${JSON.stringify(exhibitionData, null, 2)}

참고 스타일: ${context}

보도자료 작성 원칙:
- 400~600자 분량
- 언론 보도 형식 준수
- 전시의 뉴스 가치 강조
- 5W1H 포함 (누가, 무엇을, 언제, 어디서, 왜, 어떻게)

JSON 형식으로 응답:
{ "pressRelease": "보도자료 내용" }
`,

  generateMarketingReport: (exhibitionData: any, context: string) => `
당신은 미술 시장 전문 분석가입니다.
다음 전시 정보를 바탕으로 마케팅 리포트(컬렉팅 포인트)를 작성해주세요.

전시 정보:
${JSON.stringify(exhibitionData, null, 2)}

참고 스타일: ${context}

마케팅 리포트 구조:
1. 전시 요약 (Brief Overview)
2. 주요 타깃 (Target Audience)
3. 마케팅 포인트 (Marketing Points)
4. 가격 전략 (Pricing Strategy) - 일반적 제안
5. 추천 홍보 전략 (Promotion Strategy)

JSON 형식으로 응답:
{
  "marketingReport": {
    "overview": "...",
    "targetAudience": [...],
    "marketingPoints": [...],
    "pricingStrategy": "...",
    "promotionStrategy": [...]
  }
}
`
}
```

### 3. Chat API Route

**`app/api/chat/route.ts`**
```typescript
import { openai } from '@/lib/openai/client'
import { PROMPTS } from '@/lib/openai/prompts'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, exhibitionId, step, data } = await req.json()
  
  const supabase = await createClient()
  
  // Get RAG context based on step
  const ragContext = await getRAGContext(step)
  
  let systemPrompt = ''
  
  switch (step) {
    case 'titles':
      systemPrompt = PROMPTS.generateTitles(data.keywords, data.artworkDescriptions)
      break
    case 'introduction':
      systemPrompt = PROMPTS.generateIntroduction(data.title, data.keywords, ragContext)
      break
    case 'preface':
      systemPrompt = PROMPTS.generatePreface(data.title, data.keywords, ragContext)
      break
    case 'pressRelease':
      systemPrompt = PROMPTS.generatePressRelease(data, ragContext)
      break
    case 'marketingReport':
      systemPrompt = PROMPTS.generateMarketingReport(data, ragContext)
      break
    default:
      systemPrompt = '당신은 전문 미술 큐레이터입니다.'
  }
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })
  
  const stream = OpenAIStream(response, {
    onCompletion: async (completion) => {
      // Save to database
      if (exhibitionId && step) {
        await supabase
          .from('exhibition_content')
          .insert({
            exhibition_id: exhibitionId,
            content_type: step,
            content: completion
          })
      }
    }
  })
  
  return new StreamingTextResponse(stream)
}

async function getRAGContext(step: string): Promise<string> {
  // Simple RAG: load from JSON files
  // In production, use vector DB (Supabase pgvector)
  const referenceData = await import(`@/data/reference/${step}.json`)
  return referenceData.examples.slice(0, 3).join('\n---\n')
}
```

### 4. Chat Container Component

**`components/chat/ChatContainer.tsx`**
```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { ImageUploader } from './ImageUploader'
import { TitleSelector } from './TitleSelector'
import { ContentPreview } from './ContentPreview'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type Step = 'welcome' | 'keywords' | 'images' | 'titles' | 'content' | 'poster' | 'marketing' | 'virtual' | 'complete'

interface ExhibitionData {
  id?: string
  keywords: string[]
  images: string[]
  selectedTitle: string
  introduction?: string
  preface?: string
  pressRelease?: string
  marketingReport?: any
}

export function ChatContainer() {
  const [step, setStep] = useState<Step>('welcome')
  const [exhibitionData, setExhibitionData] = useState<ExhibitionData>({
    keywords: [],
    images: [],
    selectedTitle: ''
  })
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      exhibitionId: exhibitionData.id,
      step,
      data: exhibitionData
    }
  })
  
  const supabase = createClient()
  
  // Initialize exhibition in database
  const initExhibition = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data } = await supabase
      .from('exhibitions')
      .insert({ user_id: user.id, status: 'draft' })
      .select()
      .single()
    
    if (data) {
      setExhibitionData(prev => ({ ...prev, id: data.id }))
    }
  }
  
  const handleStart = () => {
    initExhibition()
    setStep('keywords')
  }
  
  const handleKeywordsSubmit = (keywords: string[]) => {
    setExhibitionData(prev => ({ ...prev, keywords }))
    setStep('images')
  }
  
  const handleImagesUpload = async (files: File[]) => {
    // Upload to Supabase Storage
    const imageUrls: string[] = []
    
    for (const file of files) {
      const { data } = await supabase.storage
        .from('artworks')
        .upload(`${exhibitionData.id}/${file.name}`, file)
      
      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('artworks')
          .getPublicUrl(data.path)
        imageUrls.push(publicUrl)
      }
    }
    
    setExhibitionData(prev => ({ ...prev, images: imageUrls }))
    setStep('titles')
  }
  
  const handleTitleSelect = (title: string) => {
    setExhibitionData(prev => ({ ...prev, selectedTitle: title }))
    setStep('content')
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {step === 'welcome' && (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Art Wizard</h1>
            <p className="text-gray-600 mb-8">
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
          <>
            <MessageList messages={messages} />
            <ContentPreview 
              data={exhibitionData}
              onNext={() => setStep('poster')}
            />
          </>
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
            onComplete={() => setStep('virtual')}
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
      
      {['content', 'poster', 'marketing'].includes(step) && (
        <div className="border-t p-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}
```

### 5. 2.5D Virtual Gallery

**`components/exhibition/ParallaxGallery.tsx`**
```tsx
'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { ArtworkDetail } from './ArtworkDetail'

interface Artwork {
  id: string
  title: string
  description: string
  imageUrl: string
  position: { x: number; y: number }
  size: { width: number; height: number }
}

interface ViewPoint {
  id: number
  background: string
  artworks: Artwork[]
}

interface ParallaxGalleryProps {
  viewPoints: ViewPoint[]
  exhibitionTitle: string
}

export function ParallaxGallery({ viewPoints, exhibitionTitle }: ParallaxGalleryProps) {
  const [currentView, setCurrentView] = useState(0)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  
  const goToNextView = useCallback(() => {
    setCurrentView(prev => (prev + 1) % viewPoints.length)
  }, [viewPoints.length])
  
  const goToPrevView = useCallback(() => {
    setCurrentView(prev => (prev - 1 + viewPoints.length) % viewPoints.length)
  }, [viewPoints.length])
  
  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Exhibition Title Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-lg">
        <h1 className="text-xl font-bold">{exhibitionTitle}</h1>
      </div>
      
      {/* Background Layers */}
      <div className="absolute inset-0">
        {viewPoints.map((view, index) => (
          <motion.div
            key={view.id}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: currentView === index ? 1 : 0,
              scale: currentView === index ? 1 : 1.1,
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <Image
              src={view.background}
              alt={`View ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Artworks Layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          className="absolute inset-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {viewPoints[currentView]?.artworks.map((artwork) => (
            <motion.div
              key={artwork.id}
              className="absolute cursor-pointer group"
              style={{
                left: `${artwork.position.x}%`,
                top: `${artwork.position.y}%`,
                width: `${artwork.size.width}%`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedArtwork(artwork)}
            >
              <div className="relative shadow-2xl">
                {/* Frame */}
                <div className="absolute -inset-2 bg-black/20 rounded" />
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  width={400}
                  height={300}
                  className="relative w-full h-auto rounded"
                />
                {/* Hover Label */}
                <div className="absolute -bottom-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/70 text-white text-sm px-3 py-1 rounded">
                    {artwork.title}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        <button
          onClick={goToPrevView}
          className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* View Indicators */}
        <div className="flex gap-2">
          {viewPoints.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentView(index)}
              className={`w-3 h-3 rounded-full transition ${
                currentView === index ? 'bg-black' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={goToNextView}
          className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      
      {/* View Counter */}
      <div className="absolute bottom-8 right-8 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-lg">
        <span className="text-sm font-medium">
          {currentView + 1} / {viewPoints.length}
        </span>
      </div>
      
      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <ArtworkDetail
            artwork={selectedArtwork}
            onClose={() => setSelectedArtwork(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
```

**`components/exhibition/ArtworkDetail.tsx`**
```tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'

interface Artwork {
  id: string
  title: string
  description: string
  imageUrl: string
}

interface ArtworkDetailProps {
  artwork: Artwork
  onClose: () => void
}

export function ArtworkDetail({ artwork, onClose }: ArtworkDetailProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-4xl w-full mx-4 bg-white rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-1/2 aspect-square bg-gray-100">
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              fill
              className="object-contain"
            />
          </div>
          
          {/* Info */}
          <div className="flex-1 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4">{artwork.title}</h2>
            <p className="text-gray-600 leading-relaxed">
              {artwork.description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
```

### 6. PDF Generator

**`lib/generators/pdf.ts`**
```typescript
import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

interface ExhibitionPDFData {
  title: string
  introduction: string
  preface: string
  artworks: Array<{
    title: string
    description: string
    imageUrl: string
  }>
  pressRelease: string
  marketingReport: {
    overview: string
    targetAudience: string[]
    marketingPoints: string[]
    pricingStrategy: string
    promotionStrategy: string[]
  }
}

export async function generateExhibitionPDF(data: ExhibitionPDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    })
    
    const chunks: Buffer[] = []
    
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    
    // Page 1: Cover
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .text(data.title, { align: 'center' })
    doc.moveDown(2)
    doc.fontSize(14)
       .font('Helvetica')
       .text('Exhibition Package', { align: 'center' })
    doc.moveDown()
    doc.text(`Generated by Art Wizard`, { align: 'center' })
    doc.text(new Date().toLocaleDateString('ko-KR'), { align: 'center' })
    
    // Page 2: Introduction
    doc.addPage()
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('전시 소개')
    doc.moveDown()
    doc.fontSize(12)
       .font('Helvetica')
       .text(data.introduction, { lineGap: 4 })
    
    // Page 3: Preface
    doc.addPage()
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('전시 서문')
    doc.moveDown()
    doc.fontSize(12)
       .font('Helvetica')
       .text(data.preface, { lineGap: 4 })
    
    // Pages 4+: Artworks
    for (const artwork of data.artworks) {
      doc.addPage()
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text(artwork.title)
      doc.moveDown()
      doc.fontSize(12)
         .font('Helvetica')
         .text(artwork.description, { lineGap: 4 })
      // Note: Image handling would need additional implementation
    }
    
    // Press Release
    doc.addPage()
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('보도자료')
    doc.moveDown()
    doc.fontSize(12)
       .font('Helvetica')
       .text(data.pressRelease, { lineGap: 4 })
    
    // Marketing Report
    doc.addPage()
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('마케팅 리포트')
    doc.moveDown()
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('1. 전시 요약')
    doc.fontSize(12)
       .font('Helvetica')
       .text(data.marketingReport.overview, { lineGap: 4 })
    doc.moveDown()
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('2. 주요 타깃')
    for (const target of data.marketingReport.targetAudience) {
      doc.fontSize(12)
         .font('Helvetica')
         .text(`• ${target}`)
    }
    doc.moveDown()
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('3. 마케팅 포인트')
    for (const point of data.marketingReport.marketingPoints) {
      doc.fontSize(12)
         .font('Helvetica')
         .text(`• ${point}`)
    }
    doc.moveDown()
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('4. 가격 전략')
    doc.fontSize(12)
       .font('Helvetica')
       .text(data.marketingReport.pricingStrategy, { lineGap: 4 })
    doc.moveDown()
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('5. 추천 홍보 전략')
    for (const strategy of data.marketingReport.promotionStrategy) {
      doc.fontSize(12)
         .font('Helvetica')
         .text(`• ${strategy}`)
    }
    
    doc.end()
  })
}
```

---

## 🗄️ Database Migration

**`supabase/migrations/001_initial_schema.sql`**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exhibitions table
CREATE TABLE exhibitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  keywords TEXT[],
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'complete')),
  is_public BOOLEAN DEFAULT false,
  public_slug VARCHAR(100) UNIQUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exhibition content table
CREATE TABLE exhibition_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
    'title_suggestions', 'introduction', 'preface', 
    'artist_bio', 'press_release', 'marketing_report'
  )),
  content JSONB NOT NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artworks table
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posters table
CREATE TABLE posters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  template_id VARCHAR(50),
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual exhibition settings
CREATE TABLE virtual_exhibitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  template_type VARCHAR(50) DEFAULT '2.5d_fixed',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_exhibitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own exhibitions" ON exhibitions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exhibitions" ON exhibitions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exhibitions" ON exhibitions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exhibitions" ON exhibitions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public exhibitions are viewable" ON exhibitions
  FOR SELECT USING (is_public = true);

-- Similar policies for other tables...
CREATE POLICY "Users can manage own exhibition content" ON exhibition_content
  FOR ALL USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own artworks" ON artworks
  FOR ALL USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_exhibition_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public = true AND NEW.public_slug IS NULL THEN
    NEW.public_slug := LOWER(
      REGEXP_REPLACE(
        SUBSTRING(NEW.title FROM 1 FOR 50),
        '[^a-zA-Z0-9가-힣]', '-', 'g'
      ) || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_exhibition_slug
  BEFORE UPDATE ON exhibitions
  FOR EACH ROW
  EXECUTE FUNCTION generate_exhibition_slug();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exhibitions_updated_at
  BEFORE UPDATE ON exhibitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## ⏰ Implementation Timeline (10 Days)

| Day | Phase | Tasks |
|-----|-------|-------|
| 1 | Setup | Project init, Supabase, Auth, Basic layout |
| 2 | Setup | Navigation, Routing, UI components |
| 3 | Chat | Chatbot UI, Message components |
| 4 | Chat | OpenAI integration, Streaming |
| 5 | Generation | Title, Introduction, Preface generation |
| 6 | Generation | Press release, Marketing report |
| 7 | Assets | Poster templates, PDF generation |
| 8 | Virtual | 2.5D Gallery component |
| 9 | Virtual | Artwork placement, Detail modal |
| 10 | Deploy | My Page, Polish, Vercel deploy |

---

## 🔗 Key Open Source References

### 3D/Virtual Gallery
- **React Three Fiber**: https://github.com/pmndrs/react-three-fiber
- **Drei**: https://github.com/pmndrs/drei
- **OpenVGal**: https://github.com/lbartworks/openvgal
- **Three.js Art Gallery**: https://github.com/theringsofsaturn/3D-art-gallery-threejs

### Authentication & Backend
- **Supabase Starter**: https://github.com/vercel/next.js/tree/canary/examples/with-supabase
- **Next.js with Supabase Template**: https://vercel.com/templates/next.js/supabase

### AI/LLM
- **Vercel AI SDK**: https://github.com/vercel/ai
- **LangChain JS**: https://github.com/langchain-ai/langchainjs

---

## ✅ MVP Checklist

### Must Have (P0)
- [ ] 사용자 인증 (로그인/회원가입)
- [ ] 챗봇 대화 인터페이스
- [ ] 키워드 입력 → 타이틀 생성
- [ ] 이미지 업로드
- [ ] 전시 소개문/서문 생성
- [ ] 보도자료 생성
- [ ] 마케팅 리포트 생성
- [ ] PDF 다운로드
- [ ] 2.5D 가상 전시 (3~5 뷰포인트)
- [ ] 마이페이지 (저장/복제)

### Nice to Have (P1)
- [ ] 포스터 템플릿 2종
- [ ] 전시 공개/비공개 설정
- [ ] 공유 URL
- [ ] 조회수 카운트

### Future (P2)
- [ ] 작품 클릭 상세 정보
- [ ] 반응형 모바일 최적화
- [ ] 커뮤니티 게시판 (Art Salon)
- [ ] 공지사항

---

*Implementation Plan v1.0*
*Last Updated: November 21, 2025*
