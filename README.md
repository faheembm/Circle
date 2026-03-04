# Relay Chat

A minimal, production-quality real-time chat platform built with Next.js 14, Supabase, and TypeScript.

---

## Stack

- **Frontend** — Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend** — Supabase (Auth + PostgreSQL + Realtime)
- **Hosting** — Vercel
- **PWA** — Installable, offline shell caching

---

## Project Structure

```
relay-chat/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, providers, PWA metadata
│   ├── globals.css               # Design system (CSS variables, components)
│   ├── page.tsx                  # Landing page
│   ├── auth/
│   │   ├── layout.tsx            # Centered auth layout
│   │   ├── login/page.tsx        # Login form
│   │   └── signup/page.tsx       # Signup form
│   ├── dashboard/
│   │   ├── layout.tsx            # App shell (auth guard + sidebar)
│   │   ├── page.tsx              # Dashboard (channels + DMs list)
│   │   ├── groups/page.tsx       # Group discovery + creation
│   │   └── people/page.tsx       # User search + follow
│   ├── chat/[id]/
│   │   ├── layout.tsx            # Chat layout with auth guard
│   │   └── page.tsx              # Group chat room
│   ├── dm/[id]/
│   │   ├── layout.tsx            # DM layout with auth guard
│   │   └── page.tsx              # Direct message conversation
│   ├── profile/[username]/
│   │   └── page.tsx              # Public profile page
│   └── settings/
│       └── page.tsx              # User settings + profile edit
│
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx        # Desktop sidebar nav
│   │   └── MobileNav.tsx         # Mobile bottom navigation
│   ├── chat/
│   │   ├── MessageInput.tsx      # Auto-expanding message composer
│   │   ├── MessageBubble.tsx     # Individual message with sender
│   │   └── MessageList.tsx       # Virtualized list + infinite scroll
│   └── ServiceWorkerRegistration.tsx
│
├── hooks/
│   ├── useAuth.tsx               # Auth context + provider
│   ├── useTheme.tsx              # Dark/light mode context
│   └── useMessages.ts            # Realtime messages + pagination
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client (SSR)
│   ├── auth.ts                   # Auth helpers (signIn/signUp/signOut)
│   ├── profiles.ts               # Profile + follow queries
│   ├── groups.ts                 # Group CRUD queries
│   ├── messages.ts               # Message queries
│   └── utils.ts                  # Formatting, cn(), utilities
│
├── types/
│   └── index.ts                  # All TypeScript types
│
├── database/
│   └── schema.sql                # Full Supabase SQL schema
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # App icons (add your own)
│
├── middleware.ts                 # Auth session refresh + route guards
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── .env.example
```

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo>
cd relay-chat
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for provisioning to complete

### 3. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open `database/schema.sql`
3. Paste the entire contents and click **Run**
4. This creates all tables, RLS policies, triggers, indexes, and seeds the official "General" group

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these in: **Supabase Dashboard → Settings → API**

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public API key | ✅ |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | Optional |

---

## Deployment to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow prompts. When asked for environment variables, add your Supabase credentials.

### Option B — GitHub + Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repository
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

### Post-deployment

After deploying, update your Supabase project:
- **Authentication → URL Configuration**:
  - Site URL: `https://your-app.vercel.app`
  - Redirect URLs: `https://your-app.vercel.app/**`

---

## PWA — App Icons

The `public/icons/` directory needs two PNG icons:
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px
- `apple-touch-icon.png` — 180×180px

You can generate these from any image using [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator):
```bash
npx pwa-asset-generator logo.png public/icons
```

---

## Features Overview

### Authentication
- Email + password sign up / login via Supabase Auth
- Auto profile creation on signup via database trigger
- Auto-join "General" official group on signup
- Session management with SSR middleware
- Protected routes via Next.js middleware

### Profiles
- Username, display name, avatar URL, bio
- Public or private profile toggle
- Follow / unfollow system
- Followers / following counts

### Messaging
- Real-time group chat (Supabase Realtime)
- Real-time 1:1 direct messages
- Infinite scroll with pagination (oldest-first, load more upward)
- Soft delete (mark as deleted, not hard delete)
- Message grouping (consecutive messages from same sender)

### Groups
- Create / join / leave groups
- Admin role for group creator
- One official "General" group visible to all users
- Group discovery page

### UI
- Dark / light mode (persisted to localStorage, respects OS preference)
- Fully responsive: sidebar on desktop, bottom tab nav on mobile
- Monochrome minimal design system via CSS variables
- No heavy UI library dependencies

---

## Design System

All colors are CSS custom properties in `globals.css`. Switching theme changes the `data-theme` attribute on `<html>`.

Key tokens:
```css
--bg             /* Page background */
--bg-secondary   /* Subtle surfaces */
--bg-elevated    /* Cards, modals */
--border         /* Hard borders */
--border-soft    /* Subtle separators */
--text           /* Primary text */
--text-muted     /* Secondary text */
--text-faint     /* Placeholder, timestamps */
--accent         /* Primary action color */
--accent-text    /* Text on accent */
```

Reusable classes: `.btn`, `.btn-ghost`, `.btn-danger`, `.input`, `.card`, `.avatar`, `.nav-item`, `.badge`

---

## Extending

### Add avatar uploads
Use Supabase Storage — create a `avatars` bucket (public), upload files, store the public URL in `profiles.avatar_url`.

### Add message reactions
Add a `message_reactions` table: `(message_id, user_id, emoji)` with RLS and subscribe to changes.

### Add typing indicators
Use Supabase Realtime presence channels — broadcast a `typing` event when the user starts typing.

### Add push notifications
Use the Web Push API with a service worker and store push subscriptions in a `push_subscriptions` table.
