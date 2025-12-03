/**
 * Swiss Minimalist Template
 *
 * Inspired by International Typographic Style
 * - Grid-based layout with mathematical precision
 * - Left-aligned sans-serif typography
 * - Minimal color palette (2-3 colors max)
 * - Generous white space
 * - Clean, professional aesthetic
 *
 * Best for: Modern art, minimalist exhibitions, professional galleries
 */

import { TemplateDefinition } from './types'

export const swissMinimalistTemplate: TemplateDefinition = {
  id: 'swiss-minimalist',
  name: 'Swiss Minimalist',
  description: 'Clean, grid-based design with left-aligned typography. Professional and timeless.',

  colorScheme: {
    primary: '#1E293B',        // Deep navy for main text
    secondary: '#475569',      // Slate gray for secondary text
    accent: '#3B82F6',         // Subtle blue accent
    background: '#FFFFFF',     // White/transparent for overlays
    backgroundOpacity: 0.85,   // High transparency to show artwork
  },

  typography: {
    titleFont: "'Helvetica Neue', 'Arial', sans-serif",
    bodyFont: "'Helvetica Neue', 'Arial', sans-serif",
    titleWeight: 900,
    bodyWeight: 600,
    titleSize: {
      min: 80,
      max: 140,
      default: 110,
    },
    subtitleSize: {
      min: 32,
      max: 40,
      default: 36,
    },
    detailsSize: {
      min: 36,
      max: 48,
      default: 40,
    },
    letterSpacing: '-0.02em',
    lineHeight: 1.05,
  },

  layout: {
    alignment: 'left',
    titlePosition: 'top',
    detailsPosition: 'bottom',
    padding: {
      top: 80,
      right: 60,
      bottom: 80,
      left: 80,
    },
    spacing: 40,
    useGrid: true,
    gridColumns: 12,
    gridRows: 12,
  },

  customCSS: `
    /* Swiss Grid System */
    .poster-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-template-rows: repeat(12, 1fr);
      gap: 20px;
      height: 100%;
    }

    .title-section {
      grid-column: 1 / 11;
      grid-row: 1 / 3;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 16px;
    }

    .details-section {
      grid-column: 1 / 13;
      grid-row: 11 / 13;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: rgba(0, 0, 0, 0.85);
      padding: 30px 40px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    /* Typography */
    .title {
      text-transform: none;
      word-break: keep-all;
      overflow-wrap: break-word;
      max-width: 100%;
    }

    .artist {
      font-weight: 600;
      margin-bottom: 0;
    }

    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px 40px;
      line-height: 1.8;
    }

    .details p {
      margin: 0;
      font-weight: 700;
    }

    .date {
      font-weight: 900;
      margin-bottom: 0;
    }

    .venue {
      font-weight: 700;
    }

    .location {
      font-weight: 700;
    }

    /* Minimal decorative line */
    .accent-line {
      width: 60px;
      height: 3px;
      background-color: currentColor;
      margin: 20px 0;
      opacity: 0.6;
    }
  `,
}

/**
 * Generate HTML for Swiss Minimalist template
 */
export function generateSwissMinimalistHTML(
  backgroundUrl: string,
  title: string,
  artistName: string,
  dateRange: string,
  venue: string,
  location: string,
  customFonts?: { titleFont: string; bodyFont: string; googleFontUrl?: string }
): string {
  const template = swissMinimalistTemplate
  const { colorScheme, typography, layout } = template

  // Use custom fonts if provided
  const titleFont = customFonts?.titleFont || typography.titleFont
  const bodyFont = customFonts?.bodyFont || typography.bodyFont
  const googleFontUrl = customFonts?.googleFontUrl

  // Calculate responsive font sizes
  const titleFontSize = Math.max(
    typography.titleSize.min,
    Math.min(typography.titleSize.max,
      typography.titleSize.default - (title.length > 20 ? (title.length - 20) * 1.5 : 0)
    )
  )

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      ${googleFontUrl ? `<link href="${googleFontUrl}" rel="stylesheet">` : ''}
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
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: 'Pretendard', ${bodyFont};
          color: ${colorScheme.primary};
          background: black;
        }

        .poster-container {
          position: relative;
          width: 1024px;
          height: 1792px;
          overflow: hidden;
        }

        .background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .content-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px;
        }

        ${template.customCSS}

        .title {
          font-size: ${titleFontSize}px;
          font-weight: ${typography.titleWeight};
          line-height: ${typography.lineHeight};
          letter-spacing: ${typography.letterSpacing};
          color: #FFFFFF;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
        }

        .artist {
          font-size: ${typography.subtitleSize.default}px;
          color: #FFFFFF;
          font-weight: ${typography.bodyWeight};
          text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.6);
        }

        .details {
          font-size: ${typography.detailsSize.default}px;
          color: #FFFFFF;
          font-weight: ${typography.bodyWeight};
          text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.6);
        }

        .date, .venue, .location {
          color: #FFFFFF !important;
        }

        .accent-line {
          background-color: ${colorScheme.accent};
        }
      </style>
    </head>
    <body>
      <div class="poster-container">
        <img class="background" src="${backgroundUrl}" alt="Background" />

        <div class="content-overlay">
          <div class="poster-grid">
            <div class="title-section">
              <h1 class="title">${title || '전시회'}</h1>
              <div class="accent-line"></div>
            </div>

            <div class="details-section">
              <div class="details">
                ${artistName ? `<p class="artist">${artistName}</p>` : ''}
                ${dateRange ? `<p class="date">${dateRange}</p>` : ''}
                ${venue ? `<p class="venue">${venue}</p>` : ''}
                ${location ? `<p class="location">${location}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
