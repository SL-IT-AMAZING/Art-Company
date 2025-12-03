/**
 * Bold Brutalist Template
 *
 * Inspired by Brutalist design principles
 * - Oversized, expressive typography
 * - Asymmetric, unconventional layout
 * - Stark contrasts (B&W + accent)
 * - Overlapping elements
 * - Raw, edgy aesthetic
 * - Text as primary design element
 *
 * Best for: Contemporary art, experimental exhibitions, avant-garde shows
 */

import { TemplateDefinition } from './types'

export const boldBrutalistTemplate: TemplateDefinition = {
  id: 'bold-brutalist',
  name: 'Bold Brutalist',
  description: 'Oversized typography with bold, unconventional layout. Modern and eye-catching.',

  colorScheme: {
    primary: '#FFFFFF',        // White for main text
    secondary: '#E5E7EB',      // Light gray for secondary
    accent: '#EF4444',         // Bold red accent
    background: '#000000',     // Black overlay
    backgroundOpacity: 0.4,    // Medium opacity
  },

  typography: {
    titleFont: "'Montserrat', 'Arial Black', sans-serif",
    bodyFont: "'Inter', 'Arial', sans-serif",
    titleWeight: 900,
    bodyWeight: 600,
    titleSize: {
      min: 56,
      max: 120,
      default: 96,
    },
    subtitleSize: {
      min: 28,
      max: 48,
      default: 40,
    },
    detailsSize: {
      min: 20,
      max: 30,
      default: 24,
    },
    letterSpacing: '-0.04em',
    lineHeight: 0.95,
  },

  layout: {
    alignment: 'left',
    titlePosition: 'middle',
    detailsPosition: 'bottom',
    padding: {
      top: 60,
      right: 60,
      bottom: 60,
      left: 60,
    },
    spacing: 30,
    useGrid: false,
  },

  customCSS: `
    /* Brutalist asymmetric layout */
    .content-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      position: relative;
    }

    .title-section {
      flex: 0 0 auto;
      margin-top: 15%;
      position: relative;
      z-index: 2;
    }

    .title {
      text-transform: uppercase;
      word-break: break-word;
      line-height: 0.9;
      transform: translateX(-4px);
      position: relative;
    }

    /* Overlapping effect */
    .title::before {
      content: attr(data-text);
      position: absolute;
      top: 4px;
      left: 4px;
      z-index: -1;
      opacity: 0.15;
    }

    .artist {
      margin-top: 30px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      position: relative;
      display: inline-block;
    }

    .artist::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 50%;
      height: 4px;
      background: currentColor;
    }

    .details-section {
      flex: 0 0 auto;
      margin-top: auto;
      border-top: 3px solid currentColor;
      padding-top: 24px;
    }

    .details {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .details p {
      margin: 0;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .date {
      font-size: 1.3em;
      margin-bottom: 8px;
    }

    /* Stark contrast */
    .venue {
      text-transform: uppercase;
      font-size: 0.9em;
    }

    .location {
      font-size: 0.85em;
      opacity: 0.85;
    }
  `,
}

/**
 * Generate HTML for Bold Brutalist template
 */
export function generateBoldBrutalistHTML(
  backgroundUrl: string,
  title: string,
  artistName: string,
  dateRange: string,
  venue: string,
  location: string
): string {
  const template = boldBrutalistTemplate
  const { colorScheme, typography, layout } = template

  // Calculate responsive font sizes - keep brutalist large
  const titleFontSize = Math.max(
    typography.titleSize.min,
    Math.min(typography.titleSize.max,
      typography.titleSize.default - (title.length > 15 ? (title.length - 15) * 2 : 0)
    )
  )

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800;900&family=Inter:wght@400;600&display=swap" rel="stylesheet">
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
          background: black;
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

        /* Dark overlay for contrast */
        .background::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${colorScheme.background};
          opacity: ${colorScheme.backgroundOpacity};
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
          font-family: 'Montserrat', 'Pretendard', sans-serif;
          font-size: ${titleFontSize}px;
          font-weight: ${typography.titleWeight};
          line-height: ${typography.lineHeight};
          letter-spacing: ${typography.letterSpacing};
          color: ${colorScheme.primary};
          text-shadow:
            0 0 40px rgba(0, 0, 0, 0.8),
            0 0 80px rgba(0, 0, 0, 0.5);
        }

        .artist {
          font-size: ${typography.subtitleSize.default}px;
          color: ${colorScheme.accent};
          text-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
        }

        .details {
          font-size: ${typography.detailsSize.default}px;
          color: ${colorScheme.primary};
          border-color: ${colorScheme.accent};
        }

        .date {
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
              <h1 class="title" data-text="${title || '전시회'}">${title || '전시회'}</h1>
              ${artistName ? `<p class="artist">${artistName}</p>` : ''}
            </div>

            <div class="details-section">
              <div class="details">
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
