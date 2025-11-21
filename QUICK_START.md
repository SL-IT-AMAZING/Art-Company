# Art Wizard - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Environment Variables

Create `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

### Step 3: Setup Supabase

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for it to initialize

2. **Run the Migration**
   - Go to SQL Editor in Supabase dashboard
   - Copy the content from `supabase/migrations/001_initial_schema.sql`
   - Paste and execute

3. **Create Storage Bucket**
   - Go to Storage section
   - Click "New bucket"
   - Name: `artworks`
   - Public: ✅ Yes
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

4. **Get Your Keys**
   - Go to Project Settings → API
   - Copy `URL` → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and use as `OPENAI_API_KEY`

### Step 5: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## ✨ First Exhibition Test

1. Click "전시 만들기 시작" on the homepage
2. Enter keywords (e.g., "자연", "도시", "빛", "시간")
3. Upload 2-3 artwork images
4. Select a generated title
5. Review generated content
6. Complete the flow

---

## 🐛 Troubleshooting

### Error: Cannot connect to Supabase
- Check `.env.local` has correct URL and key
- Verify Supabase project is running
- Check you're using the correct project URL

### Error: OpenAI API error
- Check your OpenAI API key is valid
- Verify you have credits in your OpenAI account
- Check rate limits

### Images not uploading
- Verify storage bucket is created
- Check bucket is set to public
- Verify file size is under 10MB
- Check file type (JPG, PNG, WebP only)

### Migration failed
- Make sure UUID extension is enabled
- Run migration in correct order
- Check for syntax errors in SQL

---

## 📚 Next Steps

Once running:
1. Create an account
2. Build your first exhibition
3. Publish it and share the URL
4. Check My Page for statistics

---

## 🎯 Key Features to Test

- ✅ AI title generation
- ✅ AI content generation (intro, preface)
- ✅ Image upload with validation
- ✅ 2.5D virtual gallery
- ✅ Public/private exhibitions
- ✅ My Page dashboard
- ✅ PDF download (HTML format)

---

## 🔗 Useful Links

- Documentation: See README.md
- Implementation Notes: See IMPLEMENTATION_NOTES.md
- Full Plan: See ArtWizard_Implementation_Plan_v1.md

---

Happy exhibition building! 🎨
