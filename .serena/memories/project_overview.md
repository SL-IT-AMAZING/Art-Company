# Art Company Project Overview

## Project Purpose
AI-powered exhibition curation service - Art Wizard MVP
- Automated exhibition planning and content generation
- Uses ChatGPT-style interface to generate exhibition packages
- Features: titles, introductions, press releases, posters, virtual 2.5D gallery

## Tech Stack
- Next.js 14 (App Router)
- React 18, TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Storage)
- OpenAI GPT-4o / GPT-4o-mini
- Vercel AI SDK for streaming
- React Three Fiber for virtual gallery
- Framer Motion for animations
- pdfkit for PDF generation

## Key Documentation Files
- PRD: ArtWizard_MVP_PRD_v1.md and docs/prd.md
- Architecture: docs/architecture.md
- UX Design: docs/ux-design-specification.md
- Epics: docs/epics.md
- Implementation Plan: ArtWizard_Implementation_Plan_v1.md

## Project Structure
- app/ - Next.js App Router pages
  - (auth)/ - Authentication pages
  - (main)/ - Main application pages
  - api/ - API routes
- components/ - React components (ui/, chat/, exhibition/, layout/)
- lib/ - Core utilities (api/, supabase/, openai/, rag/)
- hooks/ - Custom React hooks
- types/ - TypeScript definitions
- data/ - RAG reference data
- docs/ - Documentation
- supabase/ - Database schema and migrations

## Important Commands
- npm run dev - Development server
- npm run build - Production build
- npm run lint - Linting
- npm start - Run production build
