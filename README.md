# Art Company

AI 기반 전시 기획 및 큐레이션 서비스 - 아트 큐레이터를 위한 올인원 솔루션

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
art-company/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Authentication pages
│   ├── (main)/             # Main application pages
│   ├── api/                # API routes
│   ├── globals.css
│   └── layout.tsx
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── chat/               # AI Wizard chat components
│   ├── exhibition/         # Exhibition display components
│   └── layout/             # Layout components
├── lib/                    # Core utilities and integrations
│   ├── api/                # API client (fetch wrapper)
│   ├── supabase/           # Supabase clients
│   ├── openai/             # OpenAI/Vercel AI SDK integration
│   ├── rag/                # RAG system for content generation
│   └── utils/              # Helper functions
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── data/                   # RAG reference data (sample content)
├── docs/                   # Project documentation (PRD, Architecture, etc.)
└── supabase/               # Database schema and migrations
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

## Deployment

### Vercel Deployment

This project is optimized for deployment on Vercel.

#### Quick Deploy

1. **Connect to Vercel**
   - Visit [Vercel Dashboard](https://vercel.com)
   - Import your GitHub repository
   - Select framework: Next.js
   - Configure build settings (auto-detected)

2. **Set Environment Variables**

   Add these in Vercel Dashboard → Settings → Environment Variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_API_URL=your_api_url (optional)
   ```

3. **Deploy**
   - Production: Push to `main` branch
   - Preview: Create a pull request or push to `develop` branch

#### Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Auto Deployment

- **Production**: Automatic deployment on push to `main`
- **Preview**: Automatic preview deployment for all PRs
- **CI/CD**: GitHub Actions runs lint, type-check, and build tests

For detailed deployment instructions, see [Development Guide](./docs/development-guide.md#배포).

## Documentation

- [Product Requirements Document (PRD)](./docs/prd.md)
- [Architecture](./docs/architecture.md)
- [UX Design Specification](./docs/ux-design-specification.md)
- [Development Guide](./docs/development-guide.md)
- [Epic Breakdown](./docs/epics.md)

## Git Workflow

This project follows a feature branch workflow:

1. `main` - Production branch
2. `develop` - Integration branch
3. `feature/*` - Feature branches
4. `bugfix/*` - Bug fix branches
5. `hotfix/*` - Hotfix branches

**Commit Convention**: [Conventional Commits](https://www.conventionalcommits.org/)
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

## License

MIT
