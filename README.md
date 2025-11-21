# Art Wizard

AI 기반 디지털 큐레이터 서비스

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `OPENAI_API_KEY`: Your OpenAI API key

### 3. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the migration file in your Supabase SQL editor:
   - Go to SQL Editor
   - Copy content from `supabase/migrations/001_initial_schema.sql`
   - Execute

3. Create a storage bucket:
   - Go to Storage
   - Create bucket named `artworks`
   - Set as public
   - Set file size limit to 10MB
   - Allow MIME types: image/jpeg, image/png, image/webp

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
art-wizard/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages
│   ├── (main)/             # Main app pages
│   ├── api/                # API routes
│   ├── globals.css
│   └── layout.tsx
├── components/             # React components
│   ├── ui/                 # shadcn UI components
│   ├── chat/               # Chat components
│   ├── exhibition/         # Exhibition components
│   └── layout/             # Layout components
├── lib/                    # Utility functions
│   ├── supabase/           # Supabase clients
│   ├── openai/             # OpenAI integration
│   ├── rag/                # RAG system
│   └── utils/              # Helper functions
├── types/                  # TypeScript types
├── data/                   # Reference data
└── supabase/               # Database migrations
```

## Features

- AI-powered exhibition curation
- Automatic title, introduction, and press release generation
- Virtual 2.5D gallery
- PDF package generation
- Marketing reports
- Public/private exhibitions

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- OpenAI GPT-4o
- React Three Fiber (Virtual Gallery)
- Framer Motion (Animations)

## License

MIT
