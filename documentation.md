# Jobars Events — Frontend Documentation

## Architecture

### Authentication

Firebase Auth handles all authentication. Supabase is used as a data store only — Supabase Auth is not used.

**Flow:**
1. User signs in via Firebase (email/password or Google)
2. Client gets ID token from `user.getIdToken()`
3. Client calls `createAuthSession(idToken)` (server action)
4. Server verifies the ID token via Firebase's JWKS endpoint using `jose`
5. Server creates a signed session cookie (HS256, 14-day expiry)
6. Server upserts the user's profile into Supabase via `upsert_profile` RPC
7. Subsequent requests use `requireUser()` → `verifySessionCookie()` to read the session cookie

**Key files:**
- `lib/firebase/admin.ts` — Firebase Admin SDK (verifyIdToken, createUser, etc.) + session cookie management
- `lib/firebase/client.ts` — Firebase client SDK initialization
- `lib/user.ts` — `requireUser()` helper for server components
- `app/auth/actions.ts` — `createAuthSession`, `clearAuthSession`, `registerUser`, `signOut`

### Supabase Integration

Supabase client is initialized with the **service role key** (`SUPABASE_SERVICE_ROLE_KEY`) server-side. This bypasses RLS entirely.

**Why:**
- `auth.uid()` is always null because Firebase handles auth, not Supabase
- RLS policies that depend on `auth.uid()` are non-functional
- Service role key ensures all server-side operations work without RLS policies

**Key files:**
- `utils/supabase/server.ts` — creates Supabase client with service role key
- `utils/supabase/client.ts` — creates anonymous Supabase client for real-time subscriptions

### Environment Variables (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_SERVICE_ACCOUNT` | Base64-encoded Firebase service account JSON |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (used client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

### Google OAuth Avatar

Google profile pictures are served from `lh3.googleusercontent.com`. This hostname is whitelisted in `next.config.ts` under `images.remotePatterns`:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
  ],
},
```

### Email Verification

Traditional email/password sign-up requires email verification before accessing the dashboard.

**Flow:**
1. User signs up → `registerUser` creates Firebase user with custom claims
2. Client auto-logs in → sends verification email via `sendEmailVerification()` with `handleCodeInApp: true`
3. User is redirected to `/auth/verify-email?email=...`
4. User clicks link in email → link goes to `/auth/verify-email?mode=verifyEmail&oobCode=...`
5. Client calls `applyActionCode(oobCode)` to verify
6. "Go to Dashboard" creates session cookie and redirects

**Login on unverified account:**
- Check `user.emailVerified` after `signInWithEmailAndPassword`
- If false → send verification email → redirect to `/auth/verify-email`
- Google accounts are pre-verified, skip check

**Key files:**
- `app/auth/verify-email/page.tsx` — verification page (pending + verified + error states)
- `components/auth/signup.tsx` — triggers verification email after registration
- `components/auth/login.tsx` — blocks unverified email/password login

### Google Maps URL Input

Business locations accept full Google Maps embed iframe HTML as input. The app extracts the `src` attribute and parses coordinates from the `pb` parameter (`!2d<lng>!3d<lat>` format).

- `lib/maps.ts` — `resolveGoogleMapsUrl()` handles iframe extraction, coordinate parsing, and URL validation
- `goo.gl` / `maps.app.goo.gl` short links are rejected with clear error messages
- Medium size (600×450) recommended in form helper text

### Avatars

Google profile pictures are displayed throughout the dashboard with initials fallback:

| Location | File | Size |
|---|---|---|
| Dashboard header | `app/dashboard/layout.tsx` | 28px |
| Dashboard greeting hero | `app/dashboard/page.tsx` | 64px |
| Settings page | `app/dashboard/settings/page.tsx` | 64px |
| Chat room rows | `app/chat/layout.tsx` | 36px / 32px |
| Chat room header | `components/chat/chat-room-client.tsx` | 36px |
| Online user dots | `components/chat/chat-room-client.tsx` | 28px |
| Message sender | `components/chat/chat-room-client.tsx` | 32px |
| Testimonials | `components/section/testimonials.tsx` | 28px |
| Team grid | `components/section/team-grid.tsx` | 80px |

## Database Migrations

| File | Description |
|---|---|
| `00001_init_schema.sql` | Initial schema |
| `20260610000001_business_settings.sql` | Single-row business settings table |
| `20260610000002_wipe_and_maps_url.sql` | Wipe data, add `maps_url` column |
| `20260610000003_security_definer_admin_fns.sql` | 5 security-definer RPCs for admin writes |
| `20260610000004_firebase_uid_text.sql` | Change `profiles.id` to `text`, update all FK columns, drop all RLS policies |

### Key RPC Functions (security definer)

- `upsert_profile(p_id, p_full_name, p_email, p_avatar_url, p_role)` — insert or update profile
- `insert_business_location(p_name, p_address, p_maps_url, p_updated_by)` — add location
- `insert_location_update_request(p_name, p_address, p_maps_url, p_requested_by, p_reason)` — manager request
- `review_location_request(p_request_id, p_status, p_reviewed_by)` — approve/deny request
- `set_primary_location(p_location_id, p_profile_id)` — set primary location

Session cookie signing key is derived from the last 64 characters of the Firebase service account private key.
