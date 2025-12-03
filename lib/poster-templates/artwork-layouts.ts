/**
 * Artwork-Based Layout Functions
 *
 * Generate poster HTML using actual artwork images instead of DALL-E backgrounds
 * Supports multiple layout styles: single, collage, pattern
 */

import {
  TemplateStyle,
  ArtworkLayout,
  PosterData,
} from './types'

import { swissMinimalistTemplate } from './swiss-minimalist'
import { boldBrutalistTemplate } from './bold-brutalist'
import { classicElegantTemplate } from './classic-elegant'
import { vibrantContemporaryTemplate } from './vibrant-contemporary'

/**
 * Get template definition by style
 */
function getTemplate(style: TemplateStyle) {
  switch (style) {
    case 'swiss-minimalist':
      return swissMinimalistTemplate
    case 'bold-brutalist':
      return boldBrutalistTemplate
    case 'classic-elegant':
      return classicElegantTemplate
    case 'vibrant-contemporary':
      return vibrantContemporaryTemplate
    default:
      return swissMinimalistTemplate
  }
}

/**
 * Single Large Artwork Layout
 * Uses one primary artwork as the main background
 */
export function generateSingleArtworkHTML(
  artworkUrl: string,
  posterData: PosterData,
  templateStyle: TemplateStyle
): string {
  const template = getTemplate(templateStyle)
  const { colorScheme, typography, layout } = template

  const titleFontSize = Math.max(
    typography.titleSize.min,
    Math.min(
      typography.titleSize.max,
      typography.titleSize.default - (posterData.title.length > 20 ? (posterData.title.length - 20) * 1.5 : 0)
    )
  )

  // Format date range
  const dateRange = posterData.exhibitionDate
    ? posterData.exhibitionEndDate
      ? `${formatDate(posterData.exhibitionDate)} - ${formatDate(posterData.exhibitionEndDate)}`
      : formatDate(posterData.exhibitionDate)
    : ''

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Inter:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400&family=Montserrat:wght@600;800;900&display=swap" rel="stylesheet">
      <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          width: 1024px;
          height: 1792px;
          overflow: hidden;
          font-family: 'Pretendard', ${typography.bodyFont};
          color: ${colorScheme.primary};
        }

        .poster-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
        }

        .artwork-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        /* Gradient overlay for better text readability */
        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.5) 0%,
            rgba(0, 0, 0, 0.2) 40%,
            rgba(0, 0, 0, 0.2) 60%,
            rgba(0, 0, 0, 0.7) 100%
          );
        }

        .content-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px;
          z-index: 2;
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          text-align: ${layout.alignment};
          align-items: ${layout.alignment === 'center' ? 'center' : 'flex-start'};
        }

        .title-section {
          flex: 0 0 auto;
        }

        .title {
          font-family: ${typography.titleFont};
          font-size: ${titleFontSize}px;
          font-weight: ${typography.titleWeight};
          line-height: ${typography.lineHeight};
          letter-spacing: ${typography.letterSpacing};
          color: #FFFFFF;
          text-shadow:
            0 2px 20px rgba(0, 0, 0, 0.8),
            0 4px 40px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(0, 0, 0, 0.4);
          margin-bottom: 20px;
          max-width: 90%;
          word-break: keep-all;
          overflow-wrap: break-word;
        }

        .artist {
          font-family: ${typography.bodyFont};
          font-size: ${typography.subtitleSize.default}px;
          font-weight: ${typography.bodyWeight};
          color: #FFFFFF;
          opacity: 0.95;
          text-shadow:
            0 2px 15px rgba(0, 0, 0, 0.8),
            0 4px 30px rgba(0, 0, 0, 0.5);
        }

        .details-section {
          flex: 0 0 auto;
        }

        .details {
          font-family: ${typography.bodyFont};
          font-size: ${typography.detailsSize.default}px;
          color: #FFFFFF;
          line-height: 1.6;
          text-shadow:
            0 2px 15px rgba(0, 0, 0, 0.8),
            0 4px 30px rgba(0, 0, 0, 0.5);
        }

        .details p {
          margin: 10px 0;
        }

        .date {
          font-weight: 600;
          font-size: 1.15em;
          margin-bottom: 16px;
        }

        .venue {
          font-weight: 500;
        }

        .location {
          font-size: 0.9em;
          opacity: 0.9;
        }

        ${template.customCSS || ''}
      </style>
    </head>
    <body>
      <div class="poster-container">
        <img class="artwork-background" src="${artworkUrl}" alt="Artwork" />
        <div class="gradient-overlay"></div>

        <div class="content-overlay">
          <div class="content-wrapper">
            <div class="title-section">
              <h1 class="title">${posterData.title}</h1>
              ${posterData.artistName ? `<p class="artist">${posterData.artistName}</p>` : ''}
            </div>

            <div class="details-section">
              <div class="details">
                ${dateRange ? `<p class="date">${dateRange}</p>` : ''}
                ${posterData.venue ? `<p class="venue">${posterData.venue}</p>` : ''}
                ${posterData.location ? `<p class="location">${posterData.location}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Collage Layout
 * Displays 2-4 artworks in a grid composition
 */
export function generateCollageHTML(
  artworkUrls: string[],
  posterData: PosterData,
  templateStyle: TemplateStyle
): string {
  const template = getTemplate(templateStyle)
  const { typography, layout } = template

  const artworks = artworkUrls.slice(0, 4) // Max 4 artworks
  const gridLayout = artworks.length === 2 ? 'two-column' : 'grid'

  const titleFontSize = Math.max(
    typography.titleSize.min,
    Math.min(
      typography.titleSize.max,
      typography.titleSize.default - (posterData.title.length > 20 ? (posterData.title.length - 20) * 1.5 : 0)
    )
  )

  const dateRange = posterData.exhibitionDate
    ? posterData.exhibitionEndDate
      ? `${formatDate(posterData.exhibitionDate)} - ${formatDate(posterData.exhibitionEndDate)}`
      : formatDate(posterData.exhibitionDate)
    : ''

  const artworkHTMLs = artworks.map((url, idx) => `
    <img class="collage-artwork artwork-${idx}" src="${url}" alt="Artwork ${idx + 1}" />
  `).join('')

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&family=Lato:wght@300;400&family=Montserrat:wght@600;800;900&display=swap" rel="stylesheet">
      <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          width: 1024px;
          height: 1792px;
          overflow: hidden;
          font-family: 'Pretendard', ${typography.bodyFont};
          background: #0F0F0F;
        }

        .poster-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .collage-grid {
          position: absolute;
          top: 120px;
          left: 60px;
          right: 60px;
          height: 1100px;
          display: grid;
          grid-template-columns: ${gridLayout === 'two-column' ? '1fr 1fr' : 'repeat(2, 1fr)'};
          grid-template-rows: ${gridLayout === 'two-column' ? '1fr' : 'repeat(2, 1fr)'};
          gap: 20px;
        }

        .collage-artwork {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .header-section {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 60px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%);
          z-index: 2;
        }

        .title {
          font-family: ${typography.titleFont};
          font-size: ${Math.min(titleFontSize, 64)}px;
          font-weight: ${typography.titleWeight};
          line-height: 1.1;
          letter-spacing: ${typography.letterSpacing};
          color: #FFFFFF;
          margin-bottom: 12px;
          text-align: ${layout.alignment};
        }

        .artist {
          font-family: ${typography.bodyFont};
          font-size: ${typography.subtitleSize.default}px;
          color: #CCCCCC;
          text-align: ${layout.alignment};
        }

        .footer-section {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 60px;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%);
          z-index: 2;
        }

        .details {
          font-family: ${typography.bodyFont};
          font-size: ${typography.detailsSize.default}px;
          color: #FFFFFF;
          line-height: 1.6;
          text-align: ${layout.alignment};
        }

        .details p {
          margin: 8px 0;
        }

        .date {
          font-weight: 600;
          font-size: 1.15em;
          margin-bottom: 12px;
        }
      </style>
    </head>
    <body>
      <div class="poster-container">
        <div class="header-section">
          <h1 class="title">${posterData.title}</h1>
          ${posterData.artistName ? `<p class="artist">${posterData.artistName}</p>` : ''}
        </div>

        <div class="collage-grid">
          ${artworkHTMLs}
        </div>

        <div class="footer-section">
          <div class="details">
            ${dateRange ? `<p class="date">${dateRange}</p>` : ''}
            ${posterData.venue ? `<p class="venue">${posterData.venue}</p>` : ''}
            ${posterData.location ? `<p class="location">${posterData.location}</p>` : ''}
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Pattern Layout
 * Repeats artwork in a pattern with text overlay
 */
export function generatePatternHTML(
  artworkUrl: string,
  posterData: PosterData,
  templateStyle: TemplateStyle
): string {
  const template = getTemplate(templateStyle)
  const { typography, layout } = template

  const titleFontSize = Math.max(
    typography.titleSize.min,
    Math.min(
      typography.titleSize.max,
      typography.titleSize.default - (posterData.title.length > 20 ? (posterData.title.length - 20) * 1.5 : 0)
    )
  )

  const dateRange = posterData.exhibitionDate
    ? posterData.exhibitionEndDate
      ? `${formatDate(posterData.exhibitionDate)} - ${formatDate(posterData.exhibitionEndDate)}`
      : formatDate(posterData.exhibitionDate)
    : ''

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&family=Lato:wght@300;400&family=Montserrat:wght@600;800;900&display=swap" rel="stylesheet">
      <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          width: 1024px;
          height: 1792px;
          overflow: hidden;
          font-family: 'Pretendard', ${typography.bodyFont};
          background: #000;
        }

        .poster-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .pattern-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(5, 1fr);
          gap: 10px;
          padding: 10px;
          opacity: 0.4;
        }

        .pattern-item {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .solid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1;
        }

        .content-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px;
          z-index: 2;
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          height: 100%;
        }

        .title {
          font-family: ${typography.titleFont};
          font-size: ${titleFontSize}px;
          font-weight: ${typography.titleWeight};
          line-height: 1.1;
          letter-spacing: ${typography.letterSpacing};
          color: #FFFFFF;
          margin-bottom: 20px;
          max-width: 85%;
          text-shadow:
            0 4px 30px rgba(0, 0, 0, 0.9),
            0 0 60px rgba(0, 0, 0, 0.6);
        }

        .artist {
          font-family: ${typography.bodyFont};
          font-size: ${typography.subtitleSize.default}px;
          color: #FFFFFF;
          opacity: 0.95;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.9);
        }

        .details {
          font-family: ${typography.bodyFont};
          font-size: ${typography.detailsSize.default}px;
          color: #FFFFFF;
          line-height: 1.6;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.9);
        }

        .details p {
          margin: 10px 0;
        }

        .date {
          font-weight: 600;
          font-size: 1.15em;
          margin-bottom: 16px;
        }
      </style>
    </head>
    <body>
      <div class="poster-container">
        <div class="pattern-grid">
          ${Array(15).fill('').map(() => `<img class="pattern-item" src="${artworkUrl}" alt="Pattern" />`).join('')}
        </div>
        <div class="solid-overlay"></div>

        <div class="content-overlay">
          <div class="content-wrapper">
            <div class="title-section">
              <h1 class="title">${posterData.title}</h1>
              ${posterData.artistName ? `<p class="artist">${posterData.artistName}</p>` : ''}
            </div>

            <div class="details-section">
              <div class="details">
                ${dateRange ? `<p class="date">${dateRange}</p>` : ''}
                ${posterData.venue ? `<p class="venue">${posterData.venue}</p>` : ''}
                ${posterData.location ? `<p class="location">${posterData.location}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Helper: Format date for display
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
