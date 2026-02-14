# MKT Positioner

A Next.js web app with two AI-powered tools for brand positioning, powered by Gemini and Supabase.

1. **Positioning Interview** — AI-guided brand positioning interview as a chat. Gemini acts as a senior brand strategist, walking you through audience, category, differentiators, proof points, pricing perception, and brand personality. Delivers a Brand Key, Positioning Statement, UVP, and decision log.

2. **Batch Processor** — Upload CSV data with question/answer pairs, process each through Gemini with a custom prompt, and view results.

## Tech Stack

- **Frontend:** Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Database:** Supabase (PostgreSQL with RLS)
- **AI:** Google Gemini 2.0 Flash
- **Export:** XLSX spreadsheet generation

## Setup

### 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project named `mkt-positioner`
2. Wait for provisioning (~2 min)
3. Go to **Project Settings > API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Authentication > Providers > Email** — ensure enabled (default)
5. *(Optional)* **Authentication > Providers > Google** — toggle ON, set Google Client ID + Secret from Google Cloud Console, add Supabase redirect URL to Google Console
6. Go to **SQL Editor** and run the contents of `supabase/schema.sql`

### 2. Gemini API Key

- Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- Create an API key

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`.

### 4. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 5. Make Yourself Admin

In Supabase SQL Editor:

```sql
UPDATE public.profiles SET is_admin = true WHERE email = 'your@email.com';
```

## Deploying to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Set environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`)
4. Deploy
5. Add your Vercel URL to Supabase: **Authentication > URL Configuration > Site URL** and **Redirect URLs**

## Project Structure

```
src/
  app/
    (auth)/          — Login, signup, OAuth callback
    (app)/           — Authenticated app pages
      interview/     — Interview chat (new + resume)
      processor/     — Batch CSV processor
      history/       — User's interview history
    admin/           — Admin dashboard, users, interview details
    api/
      chat/          — Gemini chat endpoint
      interview/     — Interview CRUD
      processor/     — Batch processing with SSE
      export/        — XLSX download
  components/
    chat/            — ChatContainer, ChatInput, ChatMessage
    processor/       — FileUpload, ResultsTable
  lib/
    supabase/        — Browser, server, and admin clients
    gemini.ts        — Gemini setup + system instruction
    types.ts         — TypeScript types
    export.ts        — XLSX generation
supabase/
  schema.sql         — Database schema with RLS policies
```
