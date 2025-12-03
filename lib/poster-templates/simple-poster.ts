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
    headerHeight = 200,
    footerHeight = 200,
  } = data

  const dateRange = formatDateRange(exhibitionDate, exhibitionEndDate)
  const imageContainerClass = isVertical ? 'image-container vertical' : 'image-container horizontal'

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
      padding: 0 290px;
      box-sizing: border-box;
    }

    .image-container.horizontal {
      padding: 0 !important;
    }

    .artwork-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
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

    .title {
      font-size: 350px;
      font-weight: 800;
      color: #1a1a1a;
      text-align: center;
      line-height: 1.3;
      word-break: keep-all;
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
      <h1 class="title">${title || ''}</h1>
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
