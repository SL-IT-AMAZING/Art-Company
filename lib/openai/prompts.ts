// Bilingual prompt system - generates prompts based on locale
export const getPrompts = (locale: string = 'ko') => {
  const isEnglish = locale === 'en'

  return {
    generateTitles: (keywords: string[], artworkDescriptions: string[], conversationContext: string = '') =>
      isEnglish
        ? `
You are an expert contemporary art curator.
Based on the following information, suggest 5 exhibition titles.

${conversationContext ? `Conversation with the user:\n${conversationContext}\n\n` : ''}Keywords: ${keywords.join(', ')}
Artwork descriptions: ${artworkDescriptions.join('\n')}

Each title should:
- Reflect the exhibition concept and ideas from the conversation
- Capture the essence of the keywords
- Use evocative and symbolic expressions
- Convey the core message of the exhibition

**Important - Title format:**
- Each title must be in "Korean Title | English Title" format
- Use " | " (space+pipe+space) as separator between Korean and English
- Do not use parentheses ()
- Example: "도시의 숨결 | Breath of the City"

Respond in JSON format:
{ "titles": ["한글 타이틀1 | English Title1", "한글 타이틀2 | English Title2", ...] }
`
        : `
당신은 한국 현대미술 전문 큐레이터입니다.
다음 정보를 바탕으로 전시 타이틀 5개를 제안해주세요.

${conversationContext ? `사용자와의 대화 내용:\n${conversationContext}\n\n` : ''}키워드: ${keywords.join(', ')}
작품 설명: ${artworkDescriptions.join('\n')}

각 타이틀은:
- 사용자와의 대화에서 나온 전시 컨셉과 아이디어를 반영
- 키워드의 핵심 의미를 담기
- 감성적이고 상징적인 표현 사용
- 전시의 핵심 메시지 담기

**중요 - 타이틀 형식:**
- 반드시 "한글 타이틀 | English Title" 형식으로 작성
- 한글과 영어 사이에 " | " (공백+파이프+공백) 구분자 사용
- 괄호() 사용 금지
- 예시: "도시의 숨결 | Breath of the City"

JSON 형식으로 응답:
{ "titles": ["한글 타이틀1 | English Title1", "한글 타이틀2 | English Title2", ...] }
`,

    generateIntroduction: (title: string, keywords: string[], context: string) =>
      isEnglish
        ? `
You are an expert contemporary art curator.
Based on the following information, write an exhibition introduction in English.

Exhibition title: ${title}
Keywords: ${keywords.join(', ')}
Reference style: ${context}

Exhibition introduction guidelines:
- 150-250 words
- Use an accessible, descriptive tone for visitors
- Convey the core theme and message of the exhibition
- Provide brief context about the works and artist

**Important - Gender-neutral language rules:**
- Never use gendered pronouns (he/she, his/her)
- Use only "the artist", "the creator", "they/their" etc.
- Do not assume or imply gender
- Maintain 100% neutral tone

Respond in JSON format:
{ "introduction": "Introduction content in English" }
`
        : `
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

**중요 - 성별 중립 언어 규칙:**
- 성별 대명사(그/그녀, he/she) 절대 사용 금지
- '작가', '해당 예술가', '창작자', '아티스트' 등의 표현만 사용
- 성별을 추정하거나 암시하는 표현 금지
- 100% 중립적 톤 유지

JSON 형식으로 응답:
{ "introduction": "소개문 내용" }
`,

    generatePreface: (title: string, keywords: string[], context: string) =>
      isEnglish
        ? `
You are an expert contemporary art curator.
Based on the following information, write an exhibition preface in English with a curatorial voice.

Exhibition title: ${title}
Keywords: ${keywords.join(', ')}
Reference style: ${context}

Exhibition preface guidelines:
- 400-600 words
- Follow a 5-part structure: 'Philosophical inquiry → Sensory description → Conceptual development → Aesthetic context → Lingering impression'
- Use appropriate metaphors of sensory imagery (light, waves, materiality, texture)
- Include descriptions directly connected to the images/artworks
- Naturally incorporate 3-8 art criticism terms
- Avoid overly simple narration, maintain intellectual depth
- Use a neutral, refined tone, avoid exaggeration

**Important - Gender-neutral language rules:**
- Never use gendered pronouns (he/she, his/her)
- Use only "the artist", "the creator", "they/their" etc.
- Do not assume or imply gender
- Maintain 100% neutral tone

Respond in JSON format:
{ "preface": "Preface content in English" }
`
        : `
당신은 한국 현대미술 전문 큐레이터입니다.
다음 정보를 바탕으로 전시 서문을 예술 큐레이터 문체로 작성해주세요.

전시 타이틀: ${title}
키워드: ${keywords.join(', ')}
참고 스타일: ${context}

전시 서문 작성 원칙:
- 500~800자 분량
- '철학적 질문 → 감각적 묘사 → 사유의 전개 → 미학적 맥락 → 여운'의 5단 구성
- 감각적 이미지(빛, 파동, 물성, 결)의 은유를 적절히 사용
- 이미지/작품과 직접적으로 연동된 묘사 포함
- 예술 비평 용어 3~8개 자연스럽게 배치
- 너무 단순한 서술 금지, 지적 밀도 유지
- 중립적·세련된 톤, 과장 표현 금지

**중요 - 성별 중립 언어 규칙:**
- 성별 대명사(그/그녀, he/she) 절대 사용 금지
- '작가', '해당 예술가', '창작자', '아티스트' 등의 표현만 사용
- 성별을 추정하거나 암시하는 표현 금지
- 100% 중립적 톤 유지

JSON 형식으로 응답:
{ "preface": "서문 내용" }
`,

    generatePressRelease: (exhibitionData: any, context: string) =>
      isEnglish
        ? `
You are a journalist writing a news article. Write a short news article about the following exhibition in English.

Exhibition name: ${exhibitionData.title || ''}
Artist: ${exhibitionData.artistName || ''}
Period: ${exhibitionData.exhibition_date || ''}${exhibitionData.exhibition_end_date ? ' - ' + exhibitionData.exhibition_end_date : ''}
Venue: ${exhibitionData.venue || ''}
Address: ${exhibitionData.location || ''}

Article format:
- 3-4 paragraphs as a general news article
- Write only the body text without section titles or labels
- 300-450 words

{ "pressRelease": "Write only the article body here. No titles or section divisions, just paragraphs." }
`
        : `
당신은 신문 기사를 작성하는 기자입니다. 아래 전시 정보로 짧은 뉴스 기사를 작성하세요.

전시명: ${exhibitionData.title || ''}
작가: ${exhibitionData.artistName || ''}
기간: ${exhibitionData.exhibition_date || ''}${exhibitionData.exhibition_end_date ? ' - ' + exhibitionData.exhibition_end_date : ''}
장소: ${exhibitionData.venue || ''}
주소: ${exhibitionData.location || ''}

기사 형식:
- 3~4개의 문단으로 구성된 일반 뉴스 기사
- 섹션 제목이나 라벨 없이 바로 본문만 작성
- 400~600자

{ "pressRelease": "기사 본문만 여기에 작성. 제목이나 섹션 구분 없이 문단만." }
`,

    generateMarketingReport: (exhibitionData: any, context: string) =>
      isEnglish
        ? `
You are an art market analyst.
Based on the following exhibition information, write a marketing report in English.

Exhibition information:
${JSON.stringify(exhibitionData, null, 2)}

Reference style: ${context}

**Important: Write all content in English.**

Marketing report structure:
1. Exhibition Overview: Summarize the core message and features of the exhibition in 2-3 sentences
2. Target Audience: Groups of visitors who would be interested in this exhibition (3-5 items)
3. Marketing Points: Differentiated strengths and promotional points of the exhibition (3-5 items)
4. Pricing Strategy: Admission fee and pricing policy suggestions
5. Promotion Strategy: Effective promotional methods (3-5 items)

Respond in JSON format (all content in English):
{
  "marketingReport": {
    "overview": "Exhibition overview in English...",
    "targetAudience": ["Target 1 in English", "Target 2 in English", ...],
    "marketingPoints": ["Point 1 in English", "Point 2 in English", ...],
    "pricingStrategy": "Pricing strategy in English...",
    "promotionStrategy": ["Strategy 1 in English", "Strategy 2 in English", ...]
  }
}
`
        : `
당신은 미술 시장 전문 분석가입니다.
다음 전시 정보를 바탕으로 마케팅 리포트를 한글로 작성해주세요.

전시 정보:
${JSON.stringify(exhibitionData, null, 2)}

참고 스타일: ${context}

**중요: 모든 내용을 한글로 작성하세요. 영어 단어나 영어 문장을 사용하지 마세요.**

마케팅 리포트 구조:
1. 전시 요약: 전시의 핵심 메시지와 특징을 2-3문장으로 요약
2. 주요 타깃: 이 전시에 관심을 가질 관람객 그룹 (3-5개 항목)
3. 마케팅 포인트: 전시의 차별화된 강점과 홍보 포인트 (3-5개 항목)
4. 가격 전략: 입장료 및 가격 정책 제안
5. 추천 홍보 전략: 효과적인 홍보 방법 (3-5개 항목)

JSON 형식으로 응답 (모든 내용은 한글로):
{
  "marketingReport": {
    "overview": "전시 요약을 한글로...",
    "targetAudience": ["타깃1 한글로", "타깃2 한글로", ...],
    "marketingPoints": ["포인트1 한글로", "포인트2 한글로", ...],
    "pricingStrategy": "가격 전략을 한글로...",
    "promotionStrategy": ["전략1 한글로", "전략2 한글로", ...]
  }
}
`,

    generateArtistBio: (artistInfo: any, context: string) =>
      isEnglish
        ? `
You are an expert contemporary art curator.
Based on the following information, write an artist biography in English as a gender-neutral artist profile.

Artist information:
${JSON.stringify(artistInfo, null, 2)}

Reference style: ${context}

Artist biography guidelines:
- 200-350 words
- Focus on the artist's work tendencies, materials, philosophical interests, and aesthetic orientation
- Avoid simple list-style sentences
- Summarize 'the driving force behind the artist's world' in one sentence
- Harmoniously use art, technology, and sensory language

**Very Important - Gender-neutral language rules (MUST follow):**
- Never use gendered pronouns (he/she, his/her, him/her)
- Use only "the artist", "this creator", "they/their" etc.
- Never assume or imply gender in any expression
- Maintain 100% neutral tone
- Use the artist's name as subject, or phrases like "the artist", "this creator"

Respond in JSON format:
{ "artistBio": "Artist biography content in English" }
`
        : `
당신은 한국 현대미술 전문 큐레이터입니다.
다음 정보를 바탕으로 작가 소개를 성별 중립적 예술가 프로필 형태로 작성해주세요.

작가 정보:
${JSON.stringify(artistInfo, null, 2)}

참고 스타일: ${context}

작가 소개 작성 원칙:
- 300~500자 분량
- 작가의 작업 경향, 재료, 철학적 관심사, 미학적 지향을 중심으로 설명
- 단순한 나열형 문장 금지
- '작가의 세계를 관통하는 핵심 동력'이 무엇인지 한 문장으로 요약
- 예술·기술·감각 언어를 조화롭게 사용

**매우 중요 - 성별 중립 언어 규칙 (필수 준수):**
- 성별 대명사(그/그녀, he/she, 그는/그녀는) 절대 사용 금지
- '작가', '이 예술가', '해당 창작자', '아티스트' 등의 표현만 사용
- 성별을 추정하거나 암시하는 모든 표현 금지 (예: 여류 작가, 남성 작가 등)
- 100% 중립적 톤 유지
- 작가의 이름을 주어로 사용하거나, '작가는', '이 예술가는' 형태로 문장 구성

JSON 형식으로 응답:
{ "artistBio": "작가 소개 내용" }
`,

    summarizeConversation: (conversation: any[], exhibitionTitle: string) =>
      isEnglish
        ? `
You are an exhibition planning expert.
The following is a conversation between a curator and user during the planning of the exhibition "${exhibitionTitle}".
Please organize this conversation content for inclusion in an exhibition planning document.

Conversation:
${conversation.map(msg => `${msg.role === 'user' ? 'User' : 'Curator'}: ${msg.content}`).join('\n\n')}

**Do NOT summarize - Very Important**

Organization principles:
- **Do NOT summarize; organize ALL content from the conversation without omission**
- Include all details, ideas, and suggestions mentioned in the conversation as-is
- Organize both user requirements and curator suggestions in detail
- Do NOT abbreviate or omit conversation content; include everything
- Mention all keywords, concepts, and directions from the conversation
- Reconstruct sentences naturally in an objective, professional tone
- Only exclude unnecessary greetings; include everything else

Respond in JSON format:
{ "summary": "Organized content in English" }
`
        : `
당신은 전시 기획 전문가입니다.
다음은 전시 "${exhibitionTitle}" 기획 과정에서 큐레이터와 사용자 간의 대화입니다.
이 대화 내용을 전시 기획서에 들어갈 내용으로 정리해주세요.

대화 내용:
${conversation.map(msg => `${msg.role === 'user' ? '사용자' : '큐레이터'}: ${msg.content}`).join('\n\n')}

**절대 요약하지 말 것 - 매우 중요**

정리 원칙:
- **절대 요약하지 말고, 대화에서 나온 모든 내용을 빠짐없이 정리할 것**
- 대화에서 언급된 모든 세부사항, 아이디어, 제안사항을 그대로 포함
- 사용자의 요구사항과 큐레이터의 제안을 모두 상세히 정리
- 대화 내용을 축약하거나 생략하지 말고 전부 포함
- 대화에 나온 키워드, 컨셉, 방향성을 모두 언급
- 객관적이고 전문적인 톤으로 문장을 자연스럽게 재구성
- 불필요한 인사말만 제외하고 나머지는 모두 포함

JSON 형식으로 응답:
{ "summary": "정리된 내용" }
`,

    // System prompt for chat
    systemPrompt: () =>
      isEnglish
        ? `You are an expert art curator. Help users plan their exhibitions by discussing themes, concepts, and artistic directions. Respond in English. Be thoughtful, creative, and professional in your guidance.`
        : `당신은 전문 미술 큐레이터입니다. 사용자가 전시를 기획할 수 있도록 테마, 컨셉, 예술적 방향에 대해 함께 논의해주세요. 한국어로 응답하세요. 사려 깊고 창의적이며 전문적인 안내를 제공하세요.`,
  }
}

// Legacy export for backward compatibility (defaults to Korean)
export const PROMPTS = getPrompts('ko')
