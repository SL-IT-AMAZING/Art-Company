/**
 * Vibrant Contemporary Template
 *
 * Inspired by modern digital and pop art aesthetics
 * - Bold gradients and vibrant colors
 * - Dynamic diagonal/angular layouts
 * - Modern sans-serif typography
 * - Energetic, eye-catching design
 * - Social media-friendly aesthetic
 *
 * Best for: Pop art, contemporary exhibitions, modern galleries, digital art
 */

import { TemplateDefinition } from './types'

export const vibrantContemporaryTemplate: TemplateDefinition = {
  id: 'vibrant-contemporary',
  name: 'Vibrant Contemporary',
  description: 'Bold gradients with dynamic layout. Energetic and modern.',

  colorScheme: {
    primary: '#FFFFFF',        // White for main text
    secondary: '#F0F9FF',      // Light cyan for secondary
    accent: '#06B6D4',         // Cyan accent
    background: '#6366F1',     // Vibrant gradient base (will be overridden)
    backgroundOpacity: 0.75,   // Medium-high opacity
  },

  typography: {
    titleFont: "'Poppins', 'Noto Sans KR', sans-serif",
    bodyFont: "'Inter', 'Noto Sans KR', sans-serif",
    titleWeight: 800,
    bodyWeight: 600,
    titleSize: {
      min: 54,
      max: 92,
      default: 74,
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
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },

  layout: {
    alignment: 'left',
    titlePosition: 'middle',
    detailsPosition: 'bottom',
    padding: {
      top: 70,
      right: 70,
      bottom: 70,
      left: 70,
    },
    spacing: 35,
    useGrid: false,
  },

  customCSS: `
    /* Dynamic angular layout */
    .content-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      position: relative;
    }

    /* Diagonal accent element */
    .diagonal-accent {
      position: absolute;
      top: 0;
      right: 0;
      width: 40%;
      height: 100%;
      background: linear-gradient(135deg, transparent 0%, rgba(99, 102, 241, 0.3) 100%);
      transform: skewX(-10deg);
      transform-origin: top right;
      z-index: 0;
    }

    .title-section {
      flex: 0 0 auto;
      margin-top: 20%;
      position: relative;
      z-index: 2;
      max-width: 90%;
    }

    .title {
      text-transform: none;
      word-break: keep-all;
      overflow-wrap: break-word;
      position: relative;
      display: inline-block;
    }

    /* Modern highlight effect */
    .title::after {
      content: '';
      position: absolute;
      bottom: 8px;
      left: -8px;
      right: -8px;
      height: 35%;
      background: linear-gradient(90deg, #06B6D4 0%, #8B5CF6 100%);
      opacity: 0.25;
      z-index: -1;
      border-radius: 4px;
    }

    .artist {
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 0;
    }

    .details-section {
      flex: 0 0 auto;
      margin-top: auto;
      position: relative;
      z-index: 2;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(20px);
      padding: 30px 40px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      width: 100%;
    }


    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px 40px;
    }

    .details p {
      margin: 0;
      font-weight: 900;
    }

    .date {
      font-size: 1.1em;
      margin-bottom: 0;
      color: #06B6D4;
    }

    .venue {
      font-size: 1em;
      font-weight: 700;
    }

    .location {
      font-size: 0.95em;
      opacity: 0.9;
      font-weight: 600;
    }

    /* Vibrant shadows */
    .title {
      text-shadow:
        0 0 20px rgba(6, 182, 212, 0.5),
        0 4px 40px rgba(0, 0, 0, 0.4);
    }

    .artist, .details {
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
    }
  `,
}

/**
 * Generate HTML for Vibrant Contemporary template
 */
export function generateVibrantContemporaryHTML(
  backgroundUrl: string,
  title: string,
  artistName: string,
  dateRange: string,
  venue: string,
  location: string
): string {
  const template = vibrantContemporaryTemplate
  const { colorScheme, typography, layout } = template

  // Calculate responsive font sizes
  const titleFontSize = Math.max(
    typography.titleSize.min,
    Math.min(typography.titleSize.max,
      typography.titleSize.default - (title.length > 18 ? (title.length - 18) * 1.8 : 0)
    )
  )

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Inter:wght@400;600&display=swap" rel="stylesheet">
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        }

        /* Vibrant gradient overlay */
        .background::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.6) 0%,
            rgba(139, 92, 246, 0.5) 50%,
            rgba(236, 72, 153, 0.6) 100%
          );
          mix-blend-mode: multiply;
        }

        .content-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px;
          z-index: 1;
        }

        ${template.customCSS}

        .title {
          font-family: 'Poppins', 'Pretendard', sans-serif;
          font-size: ${titleFontSize}px;
          font-weight: ${typography.titleWeight};
          line-height: ${typography.lineHeight};
          letter-spacing: ${typography.letterSpacing};
          color: ${colorScheme.primary};
        }

        .artist {
          font-family: 'Inter', 'Pretendard', sans-serif;
          font-size: ${typography.subtitleSize.default}px;
          color: ${colorScheme.primary};
        }

        .details {
          font-family: 'Inter', 'Pretendard', sans-serif;
          font-size: ${typography.detailsSize.default}px;
          color: #FFFFFF;
        }

        .date, .venue, .location, .artist {
          color: #FFFFFF !important;
        }
      </style>
    </head>
    <body>
      <div class="poster-container">
        <img class="background" src="${backgroundUrl}" alt="Background" />

        <div class="content-overlay">
          <div class="diagonal-accent"></div>
          <div class="content-wrapper">
            <div class="title-section">
              <h1 class="title">${title || '전시회'}</h1>
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
