# ScentSL — Student Assignment

A full-stack perfume storefront built on **Next.js 16**, Prisma, NextAuth, Neon Postgres, and Cloudinary.

Your job: fork this repo, wire up the third-party services it needs, run it locally, and deploy a working copy to Vercel.

**Deliverable:** a live Vercel URL and a link to your GitHub fork.

---

## Prerequisites

- Node.js **20 or newer** (`node -v`)
- npm (ships with Node)
- A GitHub account
- A free Vercel account — https://vercel.com/signup
- Git installed (`git --version`)

> ⚠️ This project uses **Next.js 16**, which has breaking changes from earlier versions. If you extend the app, read the docs in `node_modules/next/dist/docs/` instead of relying on older tutorials.

---

## Environment variables at a glance

You will collect these across the steps below. Make sure every one is set in both `.env.local` (for local dev) **and** in Vercel project settings (for production).

| Variable | What it's for | Where to get it |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | Neon (Step 2) |
| `NEXTAUTH_SECRET` | NextAuth session encryption key | Generate with `openssl rand -base64 32` (Step 5) |
| `NEXTAUTH_URL` | NextAuth base URL | `http://localhost:3000` locally; your `https://*.vercel.app` URL in prod |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | Google Cloud Console (Step 3) — leave as placeholder to skip |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) | Google Cloud Console (Step 3) — leave as placeholder to skip |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary account name | Cloudinary dashboard (Step 4) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary dashboard (Step 4) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary dashboard (Step 4) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset name | Cloudinary → Settings → Upload (Step 4) |
| `NEXT_PUBLIC_APP_URL` | Public app URL used on the client | `http://localhost:3000` locally; your Vercel URL in prod |
| `MONIME_API_KEY` | Payment gateway key (placeholder for now) | Leave as a placeholder string |
| `MONIME_API_URL` | Payment gateway URL (placeholder for now) | Leave as a placeholder string |

> **Note:** `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` is used in the admin image uploader but is **not** listed in `.env.example`. Add it manually to your `.env.local`.
> **Note:** Monime is a future payment integration. Set the two `MONIME_*` vars to any non-empty placeholder string — the app will run fine without real keys.

---

## Step 1 — Fork & clone

1. Click **Fork** at the top right of this repo on GitHub.
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/house-of-cohort.git
   cd house-of-cohort
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## Step 2 — Provision a Neon Postgres database

1. Go to https://neon.tech and sign up (free tier is fine).
2. Create a new project — any region close to you is OK.
3. From the **Connection Details** panel, copy the **pooled** connection string. It looks like:
   ```
   postgresql://USER:PASSWORD@HOST-pooler.region.aws.neon.tech/dbname?sslmode=require
   ```
4. Save it — this is your `DATABASE_URL`.

---

## Step 3 — Create a Google OAuth client (optional)

> **Optional.** Skip this step if you only want email/password sign-in. The app still runs fine — just leave `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as placeholder strings, and the Google sign-in button simply won't work. Come back and complete this step any time you want Google login enabled.

1. Open https://console.cloud.google.com → create or pick a project.
2. **APIs & Services → OAuth consent screen** → configure (External, your name/email is fine).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-vercel-url>/api/auth/callback/google` ← add this after Step 9
6. Click **Create** and copy:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client secret** → `GOOGLE_CLIENT_SECRET`

---

## Step 4 — Create a Cloudinary account

1. Sign up at https://cloudinary.com (free tier is fine).
2. On the dashboard, copy:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
3. Create an unsigned upload preset:
   - **Settings (gear icon) → Upload → Upload presets → Add upload preset**.
   - **Signing mode:** Unsigned.
   - Save, then copy the preset name → `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

---

## Step 5 — Generate an auth secret

```bash
openssl rand -base64 32
```

Copy the output into `NEXTAUTH_SECRET`. For local dev, also set `NEXTAUTH_URL=http://localhost:3000`.

---

## Step 6 — Create `.env.local`

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value collected above. Don't forget to **add** the missing line:

```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset-name"
```

And set:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For Monime, leave placeholder strings (e.g. `MONIME_API_KEY="placeholder"`).

---

## Step 7 — Set up the database

Apply the migrations and seed sample data:

```bash
npx prisma migrate deploy
npx prisma db seed
```

This creates 7 perfume categories, 18+ products with variants, 5 Sierra Leone delivery zones, and one admin user:

> Change this password before doing anything real with the deployment.

To browse the database visually:

```bash
npx prisma studio
```

---

## Step 8 — Run locally

```bash
npm run dev
```

Open http://localhost:3000 and verify:

- The home page and product catalog load with seeded perfumes.
- You can sign in with Google.
- You can sign in as the admin using the seeded credentials and reach the admin pages.

If any of these fail, double-check the matching env var.

---

## Step 9 — Deploy to Vercel

1. Push your fork to GitHub (`git push`).
2. Go to https://vercel.com/new → **Import** your fork. Vercel auto-detects Next.js — accept the defaults.
3. **Before the first deploy**, expand **Environment Variables** and add **every** variable from your `.env.local`, with these production tweaks:
   - `NEXTAUTH_URL` → `https://<your-project>.vercel.app`
   - `NEXT_PUBLIC_APP_URL` → same `https://<your-project>.vercel.app`
4. Click **Deploy**. The first build takes 1–3 minutes.
5. Once deployed, copy your Vercel URL and:
   - If you set up Google OAuth, go back to **Google Cloud Console → Credentials** and add `https://<your-project>.vercel.app/api/auth/callback/google` to the OAuth client's authorized redirect URIs. Save.
6. **Migrate and seed the production database.** The easiest path:
   - Temporarily edit `.env.local` so `DATABASE_URL` points at your **production** Neon connection string.
   - Run:
     ```bash
     npx prisma migrate deploy
     npx prisma db seed
     ```
   - Restore `.env.local` to the local connection string when done.
7. Visit your Vercel URL and confirm the catalog loads and sign-in works in production.

---

## Step 10 — Submit

Send your instructor:

1. The URL of your forked repo on GitHub.
2. Your live Vercel deployment URL.

---

## Troubleshooting

| Problem | Likely cause |
|---|---|
| `PrismaClientInitializationError` on startup | `DATABASE_URL` missing or wrong — verify the **pooled** Neon URL |
| Google sign-in returns `redirect_uri_mismatch` | The exact callback URL is not in Google Cloud's authorized redirect URIs |
| `NEXTAUTH_URL` warning | Make sure `NEXTAUTH_URL` matches the URL you're actually visiting |
| Admin image uploads fail with `Upload preset not found` | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` missing or not set to **Unsigned** mode |
| Build fails on Vercel with missing env var | Add it under **Project Settings → Environment Variables** and redeploy |

---

## Useful scripts

```bash
npm run dev          # local dev server
npm run build        # production build
npm run start        # run the production build locally
npm run lint         # eslint
npx prisma studio    # browse the database in your browser
npx tsx scripts/inspect-state.ts   # dump cart/wishlist/review state
npx tsx scripts/reset-carts.ts     # clear carts, wishlists, reviews
```
