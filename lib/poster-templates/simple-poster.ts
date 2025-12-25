/**
 * Simple Poster Template
 * - 위/아래 15% 흰색 여백
 * - 중앙에 원본 이미지 (여백 제외 꽉 채움)
 * - 위 여백: 타이틀 (중앙정렬)
 * - 아래 여백: 작가명 | 기간 | 장소 (1열 배치)
 */

export interface SimplePosterData {
  title: string
  artistName?: string
  exhibitionDate?: string
  exhibitionEndDate?: string
  venue?: string
  imageUrl: string
  isVertical?: boolean // 세로로 긴 이미지인지 여부
  headerHeight?: number // 상단 여백 높이 (px)
  footerHeight?: number // 하단 여백 높이 (px)
  locale?: 'ko' | 'en' // 언어 설정
}

/**
 * 제목 파싱 함수
 * - / 구분자로 한글 전체 / 영어 전체 분리
 * - 예: "오월의 향기: 한강과 함께하는 여정 / Scent of May: Journey with the Han River"
 *   → { korean: "오월의 향기: 한강과 함께하는 여정", english: "Scent of May: Journey with the Han River" }
 */
function parseTitle(title: string): { korean: string; english: string } {
  if (!title) return { korean: '', english: '' }

  console.log('[Poster] Parsing title:', title)

  const hasKorean = (str: string) => /[가-힣]/.test(str)
  const hasEnglish = (str: string) => /[a-zA-Z]/.test(str)
  const isMainlyKorean = (str: string) => hasKorean(str)
  const isMainlyEnglish = (str: string) => hasEnglish(str) && !hasKorean(str)

  // 먼저 / 또는 | 구분자로 분리 시도 (한글 전체 / 영어 전체)
  const mainSeparators = [' / ', ' | ']
  for (const sep of mainSeparators) {
    if (title.includes(sep)) {
      const parts = title.split(sep).map(p => p.trim())
      console.log('[Poster] Split by', sep, ':', parts)
      if (parts.length >= 2) {
        const part1 = parts[0]
        const part2 = parts.slice(1).join(sep)
        console.log('[Poster] part1:', part1, 'isMainlyKorean:', isMainlyKorean(part1))
        console.log('[Poster] part2:', part2, 'isMainlyEnglish:', isMainlyEnglish(part2))

        if (isMainlyKorean(part1) && isMainlyEnglish(part2)) {
          console.log('[Poster] Matched! Korean first, English second')
          return { korean: part1, english: part2 }
        } else if (isMainlyEnglish(part1) && isMainlyKorean(part2)) {
          console.log('[Poster] Matched! English first, Korean second')
          return { korean: part2, english: part1 }
        }
      }
    }
  }

  // / 없으면 : 또는 - 로 분리 시도
  const separators = [':', ' - ', ' – ']
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep).map(p => p.trim())
      if (parts.length >= 2) {
        const part1 = parts[0]
        const part2 = parts.slice(1).join(sep)

        // 한글 + 영어 조합인 경우에만 분리
        if (isMainlyKorean(part1) && isMainlyEnglish(part2)) {
          return { korean: part1, english: part2 }
        } else if (isMainlyEnglish(part1) && isMainlyKorean(part2)) {
          return { korean: part2, english: part1 }
        }
      }
    }
  }

  // 구분자로 분리 안 되면 전체를 하나의 타이틀로
  if (hasKorean(title)) {
    return { korean: title, english: '' }
  } else if (hasEnglish(title)) {
    return { korean: '', english: title }
  }

  return { korean: title, english: '' }
}

/**
 * 날짜 포맷 함수
 * - 같은 년도: 2025.11.12 - 11.25
 * - 다른 년도: 2024.12.25 - 2025.01.15
 */
function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return ''

  const start = new Date(startDate)
  const startYear = start.getFullYear()
  const startMonth = String(start.getMonth() + 1).padStart(2, '0')
  const startDay = String(start.getDate()).padStart(2, '0')

  if (!endDate) {
    return `${startYear}.${startMonth}.${startDay}`
  }

  const end = new Date(endDate)
  const endYear = end.getFullYear()
  const endMonth = String(end.getMonth() + 1).padStart(2, '0')
  const endDay = String(end.getDate()).padStart(2, '0')

  if (startYear === endYear) {
    // 같은 년도: 2025.11.12 - 11.25
    return `${startYear}.${startMonth}.${startDay} - ${endMonth}.${endDay}`
  } else {
    // 다른 년도: 2024.12.25 - 2025.01.15
    return `${startYear}.${startMonth}.${startDay} - ${endYear}.${endMonth}.${endDay}`
  }
}

export function generateSimplePosterHTML(data: SimplePosterData): string {
  const {
    title,
    exhibitionDate,
    exhibitionEndDate,
    venue,
    imageUrl,
    isVertical = true,
    headerHeight = 600,
    footerHeight = 600,
    locale = 'ko',
  } = data

  const dateRange = formatDateRange(exhibitionDate, exhibitionEndDate)
  const imageContainerClass = isVertical ? 'image-container vertical' : 'image-container horizontal'
  const { korean: koreanTitle, english: englishTitle } = parseTitle(title)

  // Determine which title(s) to display based on locale
  let displayKoreanTitle = ''
  let displayEnglishTitle = ''

  if (locale === 'en') {
    // English mode: show only English title (fallback to Korean if no English)
    displayEnglishTitle = englishTitle || koreanTitle
  } else {
    // Korean mode: show Korean title, and optionally English as subtitle
    displayKoreanTitle = koreanTitle
    displayEnglishTitle = englishTitle
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 4961px;
      height: 7016px;
      overflow: hidden;
    }

    .poster {
      width: 4961px;
      height: 7016px;
      background: #FFFFFF;
      position: relative;
      font-family: 'Noto Sans KR', sans-serif;
    }

    /* 이미지 - 중앙 배치, 원본 비율 유지 */
    .image-container {
      position: absolute;
      top: ${headerHeight}px;
      left: 0;
      width: 100%;
      height: calc(100% - ${headerHeight}px - ${footerHeight}px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-container.vertical {
      padding: 0 1160px;
      box-sizing: border-box;
    }

    .image-container.horizontal {
      padding: 0 !important;
    }

    .artwork-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* 상단 타이틀 - 이미지 위 영역 중앙 */
    .header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: ${headerHeight}px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 60px;
      box-sizing: border-box;
      background: #FFFFFF;
    }

    .title-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 40px;
    }

    .title-korean {
      font-size: 320px;
      font-weight: 800;
      color: #1a1a1a;
      text-align: center;
      line-height: 1.2;
      word-break: keep-all;
    }

    .title-english {
      font-size: 280px;
      font-weight: 600;
      color: #1a1a1a;
      text-align: center;
      line-height: 1.2;
      letter-spacing: 0.02em;
    }

    /* 하단 정보 - 이미지 아래 영역 중앙 */
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: ${footerHeight}px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 60px;
      box-sizing: border-box;
      background: #FFFFFF;
    }

    .info-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 60px;
      font-size: 270px;
      font-weight: 500;
      color: #333333;
    }

    .info-item {
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="poster">
    <div class="header">
      <div class="title-container">
        ${displayKoreanTitle ? `<h1 class="title-korean">${displayKoreanTitle}</h1>` : ''}
        ${displayEnglishTitle ? `<h2 class="title-english">${displayEnglishTitle}</h2>` : ''}
      </div>
    </div>

    <div class="${imageContainerClass}">
      <img src="${imageUrl}" alt="Artwork" class="artwork-image" />
    </div>

    <div class="footer">
      <div class="info-column">
        ${dateRange ? `<span class="info-item">${dateRange}</span>` : ''}
        ${venue ? `<span class="info-item">${venue}</span>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`
}
