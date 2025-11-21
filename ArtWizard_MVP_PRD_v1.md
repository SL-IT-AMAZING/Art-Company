# Art Wizard MVP - Product Requirements Document (PRD)

## 📋 Executive Summary

**Product Name:** Art Wizard  
**Version:** MVP 1.0  
**Target Launch:** November 25, 2025  
**Document Version:** 1.0  
**Last Updated:** November 21, 2025

Art Wizard는 AI 기반 디지털 큐레이터 서비스로, 챗봇 인터페이스를 통해 전시 기획의 전 과정을 자동화합니다. 사용자가 키워드와 이미지를 입력하면 전시 타이틀, 서문, 소개문, 보도자료, 마케팅 리포트, 포스터, 그리고 2.5D 가상 전시 공간까지 자동으로 생성합니다.

---

## 🎯 Problem Statement

### 핵심 문제
1. **반복적 문서 작업**: 전시 기획에는 전시 서문, 소개, 작가/작품 소개, 보도자료, 포스터 카피, 마케팅 포인트 등 반복적인 문서 작업이 많음
2. **인력/시간 부족**: 작가, 큐레이터, 기관 모두 시간과 전문 인력이 부족
3. **진입 장벽**: 비전문가가 전시 기획에 접근하기 어려움

### 솔루션
Art Wizard는 "잡무를 해결하는 보조 큐레이터(Bot)" 역할을 수행하여, 대화형 인터페이스로 전시 결과물을 패키지로 제공

---

## 👥 Target Users

| User Type | Description | Primary Needs |
|-----------|-------------|---------------|
| 개인 작가 | 전시를 기획하려는 신진/중견 작가 | 빠른 전시 문서 생성, 비용 절감 |
| 소규모 갤러리 | 전시 기획 인력이 부족한 갤러리 | 효율적인 문서 자동화 |
| 아트 콜렉터 | 컬렉팅 포인트 분석이 필요한 수집가 | 마케팅 리포트, 가치 분석 |

**MVP 초점:** 개인 작가 (작가 확정 모드)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router)                                         │
│  ├── Chatbot UI (AI Curation)                                    │
│  ├── Virtual Exhibition Viewer (React Three Fiber / 2.5D)        │
│  ├── My Page (Dashboard)                                         │
│  └── Art Salon (Community Board)                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes / Edge Functions                             │
│  ├── Chat Orchestration (LLM Pipeline)                           │
│  ├── Exhibition Package Generator                                │
│  ├── PDF/Image Generation Service                                │
│  └── Virtual Exhibition Builder                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       External Services                          │
├─────────────────────────────────────────────────────────────────┤
│  ├── OpenAI GPT API (Text Generation)                            │
│  ├── RAG Database (Reference Styles)                             │
│  └── Supabase (Auth, DB, Storage)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Notes |
|------------|---------|-------|
| **Next.js 14** | Framework | App Router, Server Components |
| **React 18** | UI Library | Hooks, Suspense |
| **Tailwind CSS** | Styling | Utility-first |
| **shadcn/ui** | Component Library | Accessible, customizable |
| **React Three Fiber** | 3D/2.5D Rendering | Virtual Exhibition |
| **@react-three/drei** | R3F Helpers | Image, Environment |
| **Framer Motion** | Animation | Smooth transitions |

### Backend
| Technology | Purpose | Notes |
|------------|---------|-------|
| **Next.js API Routes** | API Layer | Edge-compatible |
| **Supabase** | Backend-as-a-Service | Auth, DB, Storage |
| **OpenAI API** | LLM | GPT-4o / GPT-4o-mini |
| **Vercel AI SDK** | Streaming | useChat, useCompletion |
| **ReportLab / pdfkit** | PDF Generation | Server-side |

### Database Schema (Supabase)

```sql
-- Users (Supabase Auth handles this)

-- Exhibitions
CREATE TABLE exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(500),
  keywords TEXT[],
  status VARCHAR(50) DEFAULT 'draft',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Exhibition Content
CREATE TABLE exhibition_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  content_type VARCHAR(50), -- 'title_suggestions', 'introduction', 'preface', 'artist_bio', 'press_release', 'marketing_report'
  content TEXT,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Artworks
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  title VARCHAR(500),
  description TEXT,
  image_url TEXT,
  order_index INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posters
CREATE TABLE posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  template_id VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Virtual Exhibition Settings
CREATE TABLE virtual_exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  template_type VARCHAR(50) DEFAULT '2.5d_fixed',
  public_url VARCHAR(255) UNIQUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📱 Feature Specifications

### A. 챗봇 기반 전시 생성 (Core Feature)

**User Flow:**
```
사용자 입력 → AI 전시 타이틀 → 전시 소개/서문 → 작품 소개 → 
보도자료 → 마케팅 리포트 → 포스터 → 가상 전시 → 패키지 완료
```

**Conversation Flow (7 Turns):**

| Turn | User Action | AI Response |
|------|-------------|-------------|
| 1 | "전시 만들고 싶어요" | "키워드 5~10개를 입력해주세요" |
| 2 | 키워드 입력 | "작품 이미지를 업로드해주세요" |
| 3 | 이미지 업로드 | 전시 타이틀 5개 제안 |
| 4 | 타이틀 선택 | 전시 소개문 + 서문 생성 |
| 5 | 확인/수정 요청 | 포스터 시안 + 보도자료 생성 |
| 6 | 확인 | 컬렉팅 포인트(마케팅 리포트) 생성 |
| 7 | 확인 | "온라인 전시 페이지 생성할까요?" |

**Chatbot UI Components:**
```tsx
// Key components needed
<ChatContainer>
  <MessageList messages={messages} />
  <ImageUploader onUpload={handleImageUpload} />
  <TitleSelector titles={suggestedTitles} onSelect={handleTitleSelect} />
  <ContentPreview content={generatedContent} onEdit={handleEdit} />
  <ChatInput onSend={handleSend} />
</ChatContainer>
```

### B. 텍스트 생성 (LLM 기반)

**생성 항목:**
| 항목 | 길이 가이드 | 톤/스타일 |
|------|------------|----------|
| 전시 타이틀 | 3~5개 옵션 | 감성적, 상징적 |
| 전시 소개문 | 200~300자 | 설명적, 접근성 |
| 전시 서문 | 500~800자 | 학술적, 깊이감 |
| 작가/작품 소개 | 각 150~250자 | 서사적 |
| 보도자료 | 400~600자 | 언론 형식 |
| 마케팅 리포트 | 구조화된 형식 | 분석적, 실용적 |

**Prompt Engineering Strategy:**
```javascript
const systemPrompt = `당신은 전문 미술 큐레이터입니다. 
한국 현대미술 전시의 텍스트를 작성합니다.
다음 레퍼런스 스타일을 참고하여 작성하세요:
{RAG_CONTEXT}

작성 원칙:
1. 작품의 본질적 메시지를 포착
2. 관람객의 감성적 공감 유도
3. 학술적 깊이와 대중적 접근성의 균형
4. 한국어의 자연스러운 흐름`;
```

### C. 이미지 생성

**MVP 범위:**
- 템플릿 기반 포스터 1~2종
- 사용자 업로드 이미지 + 텍스트 오버레이
- Canvas API 또는 서버사이드 이미지 처리

**포스터 템플릿 구조:**
```typescript
interface PosterTemplate {
  id: string;
  name: string;
  layout: 'minimal' | 'classic' | 'modern';
  backgroundColor: string;
  titlePosition: 'top' | 'center' | 'bottom';
  imagePosition: { x: number; y: number; width: number; height: number };
  fonts: {
    title: string;
    subtitle: string;
    body: string;
  };
}
```

### D. 결과 패키지

**패키지 구성:**
1. PDF 다운로드 (전체 내용 통합)
2. 온라인 전시 URL 자동 생성
3. 공개/비공개 전환
4. 마이페이지 저장

**PDF 생성 구조:**
```
[1] 표지 (포스터 이미지 + 타이틀)
[2] 전시 소개
[3] 전시 서문
[4] 작품 소개 (작품별 1페이지)
[5] 보도자료
[6] 마케팅 리포트
```

### E. 온라인 가상 전시 공간 (Virtual Exhibition)

**MVP 사양: 2.5D 고정 뷰 라이트 버전**

| Feature | Description |
|---------|-------------|
| 렌더링 | 3~5개의 고정 시점 이미지 |
| 작품 배치 | 자동 배치 알고리즘 |
| 인터랙션 | 작품 클릭 → 상세 팝업 |
| URL | 자동 발급 (예: `/exhibition/[slug]`) |
| 반응형 | 데스크톱 + 모바일 지원 |

---

## 🎨 Virtual Exhibition 구현 전략

### Option A: React Three Fiber (추천 - MVP)

**장점:**
- React 생태계와 완벽한 통합
- 풍부한 예제와 커뮤니티
- 2.5D 효과 구현이 간단
- 성능 최적화가 용이

**핵심 오픈소스:**
| Repository | Stars | Description |
|------------|-------|-------------|
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | 43k+ | React renderer for Three.js |
| [pmndrs/drei](https://github.com/pmndrs/drei) | 8k+ | Useful helpers for R3F |
| [shubh0107/image-gallery-with-react-three-fiber](https://github.com/shubh0107/image-gallery-with-react-three-fiber) | - | Scrollable image gallery |
| [nguyend-nam/r3f-image-gallery](https://github.com/nguyend-nam/r3f-image-gallery) | - | Grid layout gallery |

**구현 예시:**
```tsx
import { Canvas } from '@react-three/fiber'
import { Image, Environment, OrbitControls } from '@react-three/drei'

function VirtualGallery({ artworks }) {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
      <Environment preset="warehouse" />
      <ambientLight intensity={0.5} />
      
      {/* Gallery Walls */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      {/* Artworks */}
      {artworks.map((artwork, i) => (
        <ArtworkFrame 
          key={artwork.id}
          position={[i * 3 - 6, 0, -4.9]}
          artwork={artwork}
          onClick={() => handleArtworkClick(artwork)}
        />
      ))}
      
      <OrbitControls 
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}
```

### Option B: 2.5D Parallax Approach (간단한 대안)

CSS/JavaScript 기반의 2.5D 시차 효과:

```tsx
function ParallaxGallery({ artworks, viewpoints }) {
  const [currentView, setCurrentView] = useState(0);
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 transition-transform duration-500"
        style={{ transform: `translateX(-${currentView * 100}%)` }}
      >
        {viewpoints.map((view, i) => (
          <div key={i} className="absolute inset-0" style={{ left: `${i * 100}%` }}>
            <img src={view.background} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      {/* Artworks Layer */}
      <div className="absolute inset-0">
        {artworks.map((artwork, i) => (
          <motion.div
            key={artwork.id}
            className="absolute cursor-pointer"
            style={artwork.position}
            whileHover={{ scale: 1.05 }}
            onClick={() => openArtworkDetail(artwork)}
          >
            <img src={artwork.imageUrl} className="shadow-lg" />
          </motion.div>
        ))}
      </div>
      
      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        {viewpoints.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentView(i)}
            className={`w-3 h-3 rounded-full ${currentView === i ? 'bg-black' : 'bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  );
}
```

### 추천: Hybrid Approach

MVP에서는 **Option B (2.5D Parallax)**로 시작하고, V2에서 **React Three Fiber**로 업그레이드:

1. **MVP (11/25)**: CSS/JS 기반 2.5D 고정 뷰
2. **V1.5**: React Three Fiber 기본 갤러리
3. **V2**: 360° 기반 완전한 가상 공간

---

## 🗂️ Navigation Structure (MVP)

```
Art Wizard
├── AI Curation (AI 큐레이터)      ← 메인 챗봇
├── Virtual Exhibition (온라인 전시) ← 공개된 가상 전시 리스트
├── Art Salon (아트살롱)           ← 사용자 게시판
├── Notice (공지사항)
├── About Art Wizard (서비스 소개)
└── Login / Sign Up (로그인/가입)
    └── My Page (마이페이지)
        ├── 내 전시 목록
        ├── 전시 수정/복제
        └── 설정
```

---

## 📅 Development Roadmap

### Phase 1: Foundation (Day 1-2)
- [ ] Next.js 14 프로젝트 설정
- [ ] Supabase 연동 (Auth, DB)
- [ ] 기본 레이아웃 및 네비게이션
- [ ] 챗봇 UI 기본 구조

### Phase 2: Core Chatbot (Day 3-4)
- [ ] OpenAI API 연동
- [ ] Conversation Flow 구현
- [ ] 이미지 업로드 기능
- [ ] 텍스트 생성 파이프라인

### Phase 3: Content Generation (Day 5-6)
- [ ] RAG 시스템 구축 (레퍼런스 데이터)
- [ ] 각 텍스트 타입별 생성 로직
- [ ] 포스터 템플릿 시스템
- [ ] PDF 생성 기능

### Phase 4: Virtual Exhibition (Day 7-8)
- [ ] 2.5D 갤러리 컴포넌트
- [ ] 작품 배치 알고리즘
- [ ] 작품 상세 팝업
- [ ] 공유 URL 시스템

### Phase 5: Polish & Deploy (Day 9-10)
- [ ] 마이페이지 기능
- [ ] 반응형 디자인 최적화
- [ ] 에러 핸들링
- [ ] Vercel 배포

---

## 📊 Success Metrics (MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| 전시 생성 완료율 | > 70% | 시작 → 완료 비율 |
| 평균 생성 시간 | < 10분 | 첫 입력 → 패키지 완료 |
| 사용자 만족도 | > 4.0/5.0 | 피드백 설문 |
| 가상 전시 조회수 | > 100/전시 | 첫 주 기준 |

---

## 🔐 Security & Privacy

- Supabase RLS (Row Level Security) 적용
- 사용자 데이터 암호화
- 이미지 업로드 용량 제한 (10MB/파일)
- Rate limiting for API calls

---

## 📚 Reference Data (RAG)

MVP에서 사용할 기준 스타일 자료:

| 자료 유형 | 수량 | 용도 |
|----------|------|------|
| 전시 서문 | 5~10개 | 톤/스타일 학습 |
| 보도자료 | 3~5개 | 형식 학습 |
| 작가/작품 소개 | 5개 이상 | 서술 방식 학습 |
| 마케팅 리포트 | 1~2개 | 구조 학습 |
| 포스터 카피 | 추후 추가 | 카피 학습 |

---

## 🚀 Future Roadmap (V2/V3)

| Version | Features |
|---------|----------|
| V2 | 작가 추천 시스템, 전시장 추천 |
| V2.5 | 고급 포스터 생성 (AI 이미지) |
| V3 | 360° 완전한 가상 공간, B2B 기관용 기능 |
| V3.5 | 데이터 리포트, 전시 목업 이미지 |

---

## 📝 Notes

- 마케팅 리포트 샘플 (공명 Resonance)을 레퍼런스로 활용
- MVP는 개인 작가 모드에만 집중
- 작가 추천/전시장 추천은 MVP에서 제외
- 모바일 최적화는 필수 (터치 인터랙션)

---

*Document maintained by: Art Wizard Development Team*
*Last updated: November 21, 2025*
