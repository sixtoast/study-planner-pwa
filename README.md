# Study Planner PWA – 2026 Exam Prep 

A modern Progressive Web App for planning and tracking study for the 2026 South African NSC exams (and similar).

**Live features in this foundation:**
- Full 2026 exam timetable pre-loaded
- Dashboard with upcoming exams & countdown
- Working Pomodoro timer (25/5/15/50 min presets)
- AI Tutor UI (ready for OpenAI key)
- Dark, mobile-friendly interface
- Sidebar navigation
- PWA manifest ready

**Coming in next iterations:**
- Supabase Auth (email + Google) + user accounts
- Auto-generated personalized study calendar (FullCalendar)
- Persistent study logs & progress stats (Recharts)
- Web Push notifications
- One-click Google Calendar export
- Offline support via Serwist

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/sixtoast/study-planner-pwa.git
cd study-planner-pwa
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

- **Supabase** – Create a free project at [supabase.com](https://supabase.com) → Project Settings → API. Copy URL + anon key.
- **OpenAI** – Get an API key from [platform.openai.com](https://platform.openai.com) (gpt-4o-mini is cheap and excellent for this use case).

### 3. Database setup

In the Supabase SQL Editor, paste and run the contents of `supabase/schema.sql`.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
  app/                 # Next.js App Router pages
    page.tsx           # Dashboard
    exams/             # Full timetable
    timer/             # Pomodoro
    calendar/          # (next) FullCalendar + auto-scheduler
    stats/             # (next) Charts
    ai/                # AI Tutor chat
    settings/          # Preferences + integrations
  components/          # Shared UI
  data/exams.ts        # Your 2026 timetable (source of truth)
  lib/                 # Supabase clients, utils
  types/               # TypeScript types
supabase/
  schema.sql           # Database tables + RLS policies
public/
  manifest.json        # PWA manifest
```

---

## Roadmap

1. **Auth & persistence** – Wire Supabase login, save Pomodoro sessions, user subjects preference.
2. **Auto-scheduler** – Algorithm that places revision blocks before each exam based on your daily hours & preferred times.
3. **FullCalendar** – Interactive calendar view of exams + study slots (drag & drop).
4. **AI backend** – `/api/ai` route that calls OpenAI with context about the user’s exams.
5. **Stats dashboard** – Hours per subject, streaks, completion %.
6. **Google Calendar export** + browser notifications.
7. **PWA polish** – Serwist service worker, offline shell, install prompt, icons.

---

Built with Next.js 15, TypeScript, Tailwind CSS v4, Supabase, FullCalendar, Recharts, OpenAI & Lucide.

Contributions and feature requests welcome.
