/**
 * Classic Elegant Template
 *
 * Inspired by traditional gallery and museum posters
 * - Centered, balanced composition
 * - Serif + Sans font pairing (Playfair Display + Lato)
 * - Refined, sophisticated aesthetic
 * - Subtle colors with elegant accents
 * - Timeless design
 *
 * Best for: Classical art, historical exhibitions, luxury galleries, traditional shows
 */

import { TemplateDefinition } from './types'

export const classicElegantTemplate: TemplateDefinition = {
  id: 'classic-elegant',
  name: 'Classic Elegant',
  description: 'Centered, refined design with serif typography. Timeless and sophisticated.',

  colorScheme: {
    primary: '#1F2937',        // Charcoal for main text
    secondary: '#6B7280',      // Medium gray for secondary
    accent: '#92400E',         // Deep brown/gold accent
    background: '#FAFAF9',     // Warm off-white
    backgroundOpacity: 0.92,   // High opacity for elegance
  },

  typography: {
    titleFont: "'Playfair Display', 'Noto Serif KR', serif",
    bodyFont: "'Lato', 'Noto Sans KR', sans-serif",
    titleWeight: 700,
    bodyWeight: 600,
    titleSize: {
      min: 52,
      max: 76,
      default: 64,
    },
    subtitleSize: {
      min: 36,
      max: 48,
      default: 42,
    },
    detailsSize: {
      min: 44,
      max: 58,
      default: 50,
    },
    letterSpacing: '0.01em',
    lineHeight: 1.3,
  },

  layout: {
    alignment: 'center',
    titlePosition: 'top',
    detailsPosition: 'bottom',
    padding: {
      top: 100,
      right: 80,
      bottom: 100,
      left: 80,
    },
    spacing: 50,
    useGrid: false,
  },

  customCSS: `
    /* Classic centered layout */
    .content-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      text-align: center;
    }

    .title-section {
      flex: 0 0 auto;
      max-width: 85%;
      margin-top: 5%;
    }

    .title {
      margin-bottom: 24px;
      word-break: keep-all;
      overflow-wrap: break-word;
    }

    .artist {
      font-weight: 600;
      font-style: italic;
      letter-spacing: 0.05em;
      margin-bottom: 0;
    }

    /* Elegant decorative elements */
    .ornament {
      width: 120px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        currentColor 50%,
        transparent 100%
      );
      margin: 32px auto;
      opacity: 0.4;
    }

    .ornament::before,
    .ornament::after {
      content: '◆';
      position: absolute;
      font-size: 8px;
      transform: translateY(-4px);
      opacity: 0.6;
    }

    .ornament::before {
      left: 0;
    }

    .ornament::after {
      right: 0;
    }

    .ornament {
      position: relative;
    }

    .details-section {
      flex: 0 0 auto;
      max-width: 100%;
      margin-bottom: 3%;
      padding: 30px 40px;
    }


    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px 40px;
    }

    .details p {
      margin: 0;
      font-weight: 700;
    }

    .date {
      font-weight: 900;
      font-size: 1.1em;
      margin-bottom: 0;
      letter-spacing: 0.03em;
    }

    .venue {
      font-weight: 700;
    }

    .location {
      font-size: 0.95em;
      opacity: 0.95;
    }

    /* Subtle shadow for depth */
    .title, .artist, .details {
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
  `,
}

/**
 * Generate HTML for Classic Elegant template
 */
export function generateClassicElegantHTML(
  backgroundUrl: string,
  title: string,
  artistName: string,
  dateRange: string,
  venue: string,
  location: string
): string {
  const template = classicElegantTemplate
  const { colorScheme, typography, layout } = template

  // Calculate responsive font sizes
  const titleFontSize = Math.max(
    typography.titleSize.min,
    Math.min(typography.titleSize.max,
      typography.titleSize.default - (title.length > 25 ? (title.length - 25) * 1.2 : 0)
    )
  )

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet">
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
          background: ${colorScheme.background};
        }

        .poster-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
        }

        /* Subtle vignette effect */
        .background::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            rgba(250, 250, 249, 0.3) 70%,
            rgba(250, 250, 249, 0.7) 100%
          );
        }

        .content-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px;
          z-index: 1;
          background: transparent;
        }

        ${template.customCSS}

        .title {
          font-family: 'Playfair Display', 'Pretendard', serif;
          font-size: ${titleFontSize}px;
          font-weight: ${typography.titleWeight};
          line-height: ${typography.lineHeight};
          letter-spacing: ${typography.letterSpacing};
          color: ${colorScheme.primary};
        }

        .artist {
          font-family: 'Playfair Display', 'Pretendard', serif;
          font-size: ${typography.subtitleSize.default}px;
          color: #FFFFFF;
        }

        .details {
          font-family: 'Lato', 'Pretendard', sans-serif;
          font-size: ${typography.detailsSize.default}px;
          color: #FFFFFF;
        }

        .date, .venue, .location, .artist {
          color: #FFFFFF !important;
        }

        .ornament {
          color: ${colorScheme.accent};
        }
      </style>
    </head>
    <body>
      <div class="poster-container">
        <img class="background" src="${backgroundUrl}" alt="Background" />

        <div class="content-overlay">
          <div class="content-wrapper">
            <div class="title-section">
              <h1 class="title">${title || '전시회'}</h1>
              <div class="ornament"></div>
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
