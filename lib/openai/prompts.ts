export const PROMPTS = {
  generateTitles: (keywords: string[], artworkDescriptions: string[], conversationContext: string = '') => `
당신은 한국 현대미술 전문 큐레이터입니다.
다음 정보를 바탕으로 전시 타이틀 5개를 제안해주세요.

${conversationContext ? `사용자와의 대화 내용:\n${conversationContext}\n\n` : ''}키워드: ${keywords.join(', ')}
작품 설명: ${artworkDescriptions.join('\n')}

각 타이틀은:
- 사용자와의 대화에서 나온 전시 컨셉과 아이디어를 반영
- 키워드의 핵심 의미를 담기
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

  generateArtistBio: (artistInfo: any, context: string) => `
당신은 한국 현대미술 전문 큐레이터입니다.
다음 정보를 바탕으로 작가 소개를 작성해주세요.

작가 정보:
${JSON.stringify(artistInfo, null, 2)}

참고 스타일: ${context}

작가 소개 작성 원칙:
- 300~500자 분량
- 작가의 예술 세계와 작업 철학 소개
- 주요 작품과 전시 경력 언급
- 독자가 작가의 작품 세계를 이해할 수 있도록 설명

JSON 형식으로 응답:
{ "artistBio": "작가 소개 내용" }
`
}
