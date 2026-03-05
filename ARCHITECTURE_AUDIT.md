# Architecture Audit

## High-level architecture
- Next.js 14 App Router frontend with mostly client-side pages and layouts under `app/`.
- Supabase is used for auth, Postgres storage, and realtime subscriptions.
- Data access is centralized in `lib/*` modules and consumed by hooks/pages.
- Global providers in `app/layout.tsx` initialize auth and theme contexts.

## Authentication flow
- Browser auth calls live in `lib/auth.ts` (`signUp`, `signIn`, `signOut`).
- `AuthProvider` in `hooks/useAuth.tsx` initializes session and profile, and listens to auth state changes.
- Route protection is implemented twice:
  - Edge middleware (`middleware.ts`) redirects unauthenticated access to protected route prefixes.
  - Client layouts (`app/dashboard/layout.tsx`, `app/chat/[id]/layout.tsx`, `app/dm/[id]/layout.tsx`) check auth and redirect.
- Login/signup pages submit forms and navigate to `/dashboard` on success.

## Routing
- App Router route groups:
  - Public: `/`, `/auth/login`, `/auth/signup`.
  - App shell: `/dashboard`, `/dashboard/groups`, `/dashboard/people`.
  - Chat routes: `/chat/[id]`, `/dm/[id]`.
  - User/account: `/profile/[username]`, `/settings`.
- Sidebar and mobile nav provide primary navigation.

## Supabase integration
- Client SDK setup: `lib/supabase/client.ts` (`createBrowserClient`).
- Server SDK setup: `lib/supabase/server.ts` (`createServerClient` with cookie handling).
- Middleware creates a server client to refresh/check user session per request.
- Database schema (`database/schema.sql`) defines:
  - tables (`profiles`, `follows`, `groups`, `group_members`, `messages`),
  - RLS policies,
  - triggers for `updated_at`,
  - signup profile trigger,
  - realtime publication on `messages`.

## Message system
- Message queries and writes in `lib/messages.ts`:
  - paginated group and DM fetch,
  - send group/direct messages,
  - soft delete via `is_deleted`.
- `hooks/useMessages.ts` handles:
  - initial fetch,
  - pagination (`loadMore`),
  - realtime insert subscription on `messages`.
- UI components:
  - `MessageList` (infinite scroll + grouped rendering),
  - `MessageInput` (send composer).

## Group system
- Group data logic in `lib/groups.ts`:
  - list/get groups,
  - membership checks,
  - create/join/leave.
- Group discovery and create flow in `app/dashboard/groups/page.tsx`.
- Group chat route `app/chat/[id]/page.tsx` gates message view by membership and offers join action.
- Schema enforces membership and role constraints through RLS and `group_role` enum.

## Obvious risk areas for infinite loading / startup breakage
1. **Dashboard can stay in loading forever when `user` is absent in page effect**
   - `DashboardPage` starts with `loading=true` and returns early in effect when `!user`, never setting loading false.
   - This is usually masked by layout guard, but race conditions can still show persistent skeleton.

2. **DM page can render blank forever if profile lookup fails or errors**
   - `DMPage` returns `null` while `loading || !other`.
   - On `getProfile` failure there is redirect path, but on unresolved promise/error edge-cases loading can remain true with no visual fallback.

3. **Chat/DM layouts return `null` while auth is loading**
   - `app/chat/[id]/layout.tsx` and `app/dm/[id]/layout.tsx` render nothing for `loading || !user`, causing blank screens during slow auth/session initialization.

4. **Missing routes linked from UI**
   - `/dashboard/search` is linked from dashboard but route does not exist.
   - `/chat/[id]/members` is linked from group chat but route does not exist.
   - These produce navigation to 404 and look like broken startup/navigation.

5. **Environment variable hard assertions can crash app initialization**
   - Supabase client/server constructors use `process.env.*!` without runtime guard.
   - Missing env vars can crash middleware/client usage immediately.

6. **Signup metadata is not used by profile creation trigger**
   - `signUp` sends `username`/`display_name` metadata, but `handle_new_user()` always derives both from email prefix.
   - Can cause mismatches and confusion right after onboarding.

7. **Potential over-broad realtime subscription for DMs**
   - DM subscription in `useMessages` listens to all inserts on `messages` (no direct-message filter), then fetches by inserted id.
   - This can add unnecessary load and surprise behavior at scale.
