# House of Cohort — Implementation Plan

**Project:** Luxury Perfume E-Commerce Store  
**Stack:** Next.js 16 (App Router) · NeonDB + Prisma · NextAuth v5 · Cloudinary · shadcn/ui + Tailwind · Monime Payments · Recharts  
**Timeline:** 2–4 weeks (solo developer)  
**Scope:** Full PRD — storefront, admin panel, payments, reviews, wishlist, staff management  
**Design:** Minimal luxury — black (`#0A0A0A`), gold (`#C9A84C`), white (`#FAFAFA`). Placeholder assets until real imagery arrives.

---

## Overview

This is a greenfield build. The PRD is finalised. All external service accounts (NeonDB, Cloudinary, Monime, Google OAuth) are active and credentials are ready. Follow the phases **in order** — each phase depends on the previous one being complete.

---

## Phase 1 — Project Scaffold & Configuration
**Goal:** A running Next.js app with Tailwind, shadcn/ui, TypeScript, ESLint, and all environment variables wired.  
**Estimated time:** 1 day

---

### 1.1 Initialise Next.js

Run this command from inside the project folder:

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Accept all prompts with the default answers. This creates a standard Next.js 16 App Router project using TypeScript and Tailwind CSS.

---

### 1.2 Install all dependencies

Run each block separately:

```bash
# ORM & Database
npm install prisma @prisma/client

# Authentication
npm install next-auth@beta @auth/prisma-adapter

# UI component library
npx shadcn@latest init
# When prompted:
#   Style        → Default
#   Base colour  → Slate
#   CSS variables → Yes

# Add individual shadcn components used in the project
npx shadcn@latest add button card input label select textarea badge \
  table dialog dropdown-menu form toast avatar separator sheet skeleton \
  progress slider

# Cloudinary image upload
npm install cloudinary next-cloudinary

# Charts (admin dashboard)
npm install recharts

# Password hashing
npm install bcryptjs
npm install -D @types/bcryptjs

# Form handling and validation
npm install zod react-hook-form @hookform/resolvers

# Date formatting
npm install date-fns

# HTTP client for Monime API calls
npm install axios

# Seed script runner
npm install -D ts-node
```

---

### 1.3 Folder structure

Create the following folder tree inside `src/`. You can run the `mkdir` command below or create the folders manually.

```
src/
├── app/
│   ├── (store)/                        # Customer-facing route group
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # / — Homepage
│   │   ├── products/
│   │   │   ├── page.tsx                # /products — Product listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # /products/[slug] — Product detail
│   │   ├── cart/
│   │   │   └── page.tsx                # /cart
│   │   ├── checkout/
│   │   │   ├── page.tsx                # /checkout
│   │   │   └── success/
│   │   │       └── page.tsx            # /checkout/success
│   │   ├── wishlist/
│   │   │   └── page.tsx                # /wishlist
│   │   └── account/
│   │       ├── page.tsx                # /account — Profile
│   │       └── orders/
│   │           ├── page.tsx            # /account/orders — Order history
│   │           └── [id]/
│   │               └── page.tsx        # /account/orders/[id] — Order detail
│   ├── (auth)/
│   │   └── auth/
│   │       └── signin/
│   │           └── page.tsx            # /auth/signin
│   ├── admin/
│   │   ├── layout.tsx                  # Admin shell (sidebar + auth guard)
│   │   ├── page.tsx                    # /admin — Dashboard
│   │   ├── products/
│   │   │   ├── page.tsx                # /admin/products — Product list
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # /admin/products/new
│   │   │   └── [id]/
│   │   │       └── page.tsx            # /admin/products/[id] — Edit product
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── inventory/
│   │   │   └── page.tsx
│   │   ├── discounts/
│   │   │   └── page.tsx                # Admin only
│   │   ├── delivery/
│   │   │   └── page.tsx
│   │   └── staff/
│   │       └── page.tsx                # Admin only
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── products/
│       │   ├── route.ts
│       │   └── [slug]/
│       │       └── route.ts
│       ├── categories/
│       │   └── route.ts
│       ├── cart/
│       │   └── route.ts
│       ├── wishlist/
│       │   ├── route.ts
│       │   └── [productId]/
│       │       └── route.ts
│       ├── reviews/
│       │   ├── route.ts
│       │   └── [productId]/
│       │       └── route.ts
│       ├── orders/
│       │   └── route.ts
│       ├── checkout/
│       │   ├── route.ts
│       │   └── verify/
│       │       └── route.ts
│       └── admin/
│           ├── products/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           ├── categories/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           ├── orders/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           ├── inventory/
│           │   └── [variantId]/
│           │       └── route.ts
│           ├── coupons/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           ├── delivery/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           └── staff/
│               ├── route.ts
│               └── [id]/
│                   └── route.ts
├── components/
│   ├── ui/                             # shadcn auto-generated — do not edit manually
│   ├── store/                          # Customer storefront components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── VariantSelector.tsx
│   │   ├── CartItem.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── StarRating.tsx
│   │   └── ImageGallery.tsx
│   └── admin/                          # Admin panel components
│       ├── AdminSidebar.tsx
│       ├── StatCard.tsx
│       ├── RevenueChart.tsx
│       ├── OrderStatusChart.tsx
│       ├── ProductForm.tsx
│       ├── VariantManager.tsx
│       ├── ImageUploader.tsx
│       ├── OrderStatusControl.tsx
│       └── StockEditor.tsx
├── lib/
│   ├── prisma.ts                       # Prisma client singleton
│   ├── auth.ts                         # NextAuth config
│   ├── cloudinary.ts                   # Cloudinary config
│   ├── monime.ts                       # Monime API helpers
│   ├── cart.ts                         # Cart helper (get or create cart)
│   ├── coupon.ts                       # Coupon validation and discount logic
│   └── utils.ts                        # cn(), formatSLE(), generateSlug()
├── middleware.ts                        # Route protection middleware
└── types/
    └── index.ts                        # Shared TypeScript types
```

Command to create all directories at once:

```bash
mkdir -p \
  "src/app/(store)/products/[slug]" \
  "src/app/(store)/cart" \
  "src/app/(store)/checkout/success" \
  "src/app/(store)/wishlist" \
  "src/app/(store)/account/orders/[id]" \
  "src/app/(auth)/auth/signin" \
  "src/app/admin/products/new" \
  "src/app/admin/products/[id]" \
  "src/app/admin/categories" \
  "src/app/admin/orders/[id]" \
  "src/app/admin/inventory" \
  "src/app/admin/discounts" \
  "src/app/admin/delivery" \
  "src/app/admin/staff" \
  "src/app/api/auth/[...nextauth]" \
  "src/app/api/products/[slug]" \
  "src/app/api/categories" \
  "src/app/api/cart" \
  "src/app/api/wishlist/[productId]" \
  "src/app/api/reviews/[productId]" \
  "src/app/api/orders" \
  "src/app/api/checkout/verify" \
  "src/app/api/admin/products/[id]" \
  "src/app/api/admin/categories/[id]" \
  "src/app/api/admin/orders/[id]" \
  "src/app/api/admin/inventory/[variantId]" \
  "src/app/api/admin/coupons/[id]" \
  "src/app/api/admin/delivery/[id]" \
  "src/app/api/admin/staff/[id]" \
  src/components/store \
  src/components/admin \
  src/lib \
  src/types
```

---

### 1.4 Environment variables

Create a file named `.env.local` at the project root with these keys:

```env
# Database — get from NeonDB dashboard → Connection string
DATABASE_URL="postgresql://..."

# NextAuth — generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth — from Google Cloud Console → Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary — from Cloudinary dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Monime — from Monime developer dashboard
MONIME_API_KEY="your-monime-api-key"
MONIME_API_URL="https://api.monime.net"

# App URL (change to production URL when deploying)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Also create `.env.example` with the same keys but empty values (safe to commit). Make sure `.env.local` is listed in `.gitignore` (Next.js adds it by default).

---

### 1.5 Tailwind brand colours

In `tailwind.config.ts`, add the brand colour palette and fonts inside `theme.extend`:

```ts
colors: {
  brand: {
    black:      "#0A0A0A",
    gold:       "#C9A84C",
    white:      "#FAFAFA",
    "gold-light": "#E8D49E",
  },
},
fontFamily: {
  serif: ["var(--font-cormorant)", "Georgia", "serif"],
  sans:  ["var(--font-inter)", "system-ui", "sans-serif"],
},
```

In `src/app/layout.tsx`, load Google Fonts using `next/font/google`:
- **Cormorant Garamond** — for headings (`font-serif`)
- **Inter** — for body text (`font-sans`)

Set both as CSS variables so Tailwind can reference them.

---

### 1.6 Global CSS

In `src/app/globals.css`, add these CSS custom properties after the Tailwind directives:

```css
:root {
  --background: #FAFAFA;
  --foreground: #0A0A0A;
  --gold: #C9A84C;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

---

### 1.7 Shared utility helpers — `src/lib/utils.ts`

Add these three helpers (alongside the existing `cn()` from shadcn):

- **`formatSLE(minorUnits: number): string`** — converts integer minor units to display string. Example: `25000` → `"SLE 250.00"`. Used on every price display across the app.
- **`generateSlug(name: string): string`** — lowercases, replaces spaces with hyphens, strips special characters. Example: `"Golden Oud"` → `"golden-oud"`. Used in product and category forms.

---

### Phase 1 verification

Run `npm run dev` — the default Next.js homepage should load at `http://localhost:3000`. No errors in the terminal.

---

## Phase 2 — Database Schema & Seed Data
**Goal:** Complete Prisma schema for all 14 data models pushed to NeonDB, plus seed data so the admin panel has real content to display from day one.  
**Estimated time:** 1 day

---

### 2.1 Initialise Prisma

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma`. The `DATABASE_URL` environment variable is already set in `.env.local` — Prisma reads it automatically.

---

### 2.2 Complete Prisma schema

Replace the entire contents of `prisma/schema.prisma` with the schema below. Every model maps directly to a section in the PRD data models (§9).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────────────

enum Role {
  CUSTOMER
  STAFF
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum CouponType {
  PERCENTAGE
  FIXED
}

// ─── Auth (NextAuth v5 Prisma Adapter tables) ─────────────

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  image         String?
  password      String?        // null for Google OAuth users
  role          Role           @default(CUSTOMER)
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  cart          Cart?
  orders        Order[]
  wishlistItems WishlistItem[]
  reviews       Review[]
  addresses     Address[]
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Catalogue ────────────────────────────────────────────

model Category {
  id       String    @id @default(cuid())
  name     String
  slug     String    @unique
  image    String?
  products Product[]
}

model Product {
  id            String           @id @default(cuid())
  name          String
  slug          String           @unique
  description   String
  categoryId    String
  images        String[]         // Cloudinary URLs — array of strings
  isFeatured    Boolean          @default(false)
  isActive      Boolean          @default(true)
  createdAt     DateTime         @default(now())
  category      Category         @relation(fields: [categoryId], references: [id])
  variants      ProductVariant[]
  wishlistItems WishlistItem[]
  reviews       Review[]
  orderItems    OrderItem[]
}

model ProductVariant {
  id         String      @id @default(cuid())
  productId  String
  size       String      // e.g. "50ml", "100ml", "200ml"
  price      Int         // SLE in minor units (1 SLE = 100 minor units)
  stock      Int         @default(0)
  sku        String?
  product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems  CartItem[]
  orderItems OrderItem[]
}

// ─── Cart ─────────────────────────────────────────────────

model Cart {
  id        String     @id @default(cuid())
  userId    String?    @unique          // linked to authenticated user
  sessionId String?    @unique          // cookie-based ID for guests
  updatedAt DateTime   @updatedAt
  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
}

model CartItem {
  id        String         @id @default(cuid())
  cartId    String
  variantId String
  quantity  Int
  cart      Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  variant   ProductVariant @relation(fields: [variantId], references: [id])

  @@unique([cartId, variantId])   // one row per variant per cart
}

// ─── Delivery ─────────────────────────────────────────────

model DeliveryZone {
  id        String    @id @default(cuid())
  name      String
  fee       Int       // SLE minor units
  isActive  Boolean   @default(true)
  orders    Order[]
  addresses Address[]
}

model Address {
  id             String       @id @default(cuid())
  userId         String?
  recipientName  String
  phone          String
  streetAddress  String
  city           String
  deliveryZoneId String
  user           User?        @relation(fields: [userId], references: [id])
  deliveryZone   DeliveryZone @relation(fields: [deliveryZoneId], references: [id])
  orders         Order[]
}

// ─── Coupons ──────────────────────────────────────────────

model Coupon {
  id        String     @id @default(cuid())
  code      String     @unique
  type      CouponType
  value     Int        // percentage (0–100) for PERCENTAGE, or SLE minor units for FIXED
  minOrder  Int?       // minimum order subtotal in minor units before coupon applies
  maxUses   Int?       // null = unlimited
  usedCount Int        @default(0)
  expiresAt DateTime?
  isActive  Boolean    @default(true)
  orders    Order[]
}

// ─── Orders ───────────────────────────────────────────────

model Order {
  id              String       @id @default(cuid())
  userId          String?
  guestEmail      String?
  status          OrderStatus  @default(PENDING)
  subtotal        Int          // SLE minor units — sum of line items
  deliveryFee     Int          // SLE minor units
  discount        Int          @default(0)  // SLE minor units
  total           Int          // subtotal + deliveryFee - discount
  deliveryZoneId  String
  addressId       String
  couponId        String?
  monimeSessionId String?      // Monime checkout session ID
  monimeReference String?      // Monime payment reference
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  user            User?        @relation(fields: [userId], references: [id])
  deliveryZone    DeliveryZone @relation(fields: [deliveryZoneId], references: [id])
  address         Address      @relation(fields: [addressId], references: [id])
  coupon          Coupon?      @relation(fields: [couponId], references: [id])
  items           OrderItem[]
}

model OrderItem {
  id        String         @id @default(cuid())
  orderId   String
  variantId String
  productId String
  quantity  Int
  price     Int            // variant price at the moment of purchase (snapshot)
  order     Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant   ProductVariant @relation(fields: [variantId], references: [id])
  product   Product        @relation(fields: [productId], references: [id])
}

// ─── Wishlist & Reviews ───────────────────────────────────

model WishlistItem {
  id        String  @id @default(cuid())
  userId    String
  productId String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])

  @@unique([userId, productId])   // one wishlist entry per product per user
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  productId String
  rating    Int      // 1–5
  comment   String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])

  @@unique([userId, productId])   // one review per product per user
}
```

---

### 2.3 Run the migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

- `migrate dev` pushes the schema to NeonDB and creates the migration file in `prisma/migrations/`
- `prisma generate` creates the TypeScript client

---

### 2.4 Prisma client singleton — `src/lib/prisma.ts`

Create this file. It prevents multiple Prisma client instances during Next.js hot-reload in development:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Import from this file everywhere: `import { prisma } from "@/lib/prisma"`.

---

### 2.5 Seed script — `prisma/seed.ts`

Create this file to pre-populate the database with an admin user, two categories, one sample product with three variants, and five delivery zones:

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Admin user ─────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);
  await prisma.user.upsert({
    where:  { email: adminEmail },
    update: {},
    create: {
      email:    adminEmail,
      name:     "Admin",
      password: adminPassword,
      role:     "ADMIN",
    },
  });

  // ── Categories ─────────────────────────────────────────
  const oud = await prisma.category.upsert({
    where:  { slug: "oud" },
    update: {},
    create: { name: "Oud", slug: "oud" },
  });

  await prisma.category.upsert({
    where:  { slug: "floral" },
    update: {},
    create: { name: "Floral", slug: "floral" },
  });

  // ── Sample product ─────────────────────────────────────
  await prisma.product.upsert({
    where:  { slug: "golden-oud" },
    update: {},
    create: {
      name:        "Golden Oud",
      slug:        "golden-oud",
      description: "A rich, woody fragrance with notes of oud and amber.",
      categoryId:  oud.id,
      images:      [],           // add Cloudinary URLs here once available
      isFeatured:  true,
      isActive:    true,
      variants: {
        create: [
          { size: "50ml",  price: 25000, stock: 20 },
          { size: "100ml", price: 45000, stock: 15 },
          { size: "200ml", price: 80000, stock: 8  },
        ],
      },
    },
  });

  // ── Delivery zones ─────────────────────────────────────
  // Fees are in SLE minor units (e.g. 2000 = SLE 20.00)
  await prisma.deliveryZone.createMany({
    skipDuplicates: true,
    data: [
      { name: "Freetown Central", fee: 2000  },
      { name: "East Freetown",    fee: 3000  },
      { name: "West Freetown",    fee: 3000  },
      { name: "Bo",               fee: 10000 },
      { name: "Kenema",           fee: 12000 },
    ],
  });
}

main().finally(() => prisma.$disconnect());
```

Add the seed config to `package.json` (inside the top-level object, alongside `"scripts"`):

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Run the seed:

```bash
npx prisma db seed
```

---

### Phase 2 verification

```bash
npx prisma studio
```

Open `http://localhost:5555` in a browser. Confirm these tables have data:
- `User` — one admin row
- `Category` — two rows (Oud, Floral)
- `Product` + `ProductVariant` — one product with three variants
- `DeliveryZone` — five rows

---

## Phase 3 — Authentication
**Goal:** NextAuth v5 with Google OAuth and email/password credentials. The user's role is stored in the JWT and available in every server component and API route. Middleware enforces access rules on every protected route.  
**Estimated time:** 1 day

---

### 3.1 NextAuth config — `src/lib/auth.ts`

This is the central auth configuration. It exports `auth`, `signIn`, and `signOut` which are used throughout the app.

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },     // JWT — no database session table needed
  pages:   { signIn: "/auth/signin" },
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Reject if user not found, has no password (Google-only), or is deactivated
        if (!user || !user.password || !user.isActive) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    // Attach id and role to the JWT token on sign-in
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    // Expose id and role on the session object used in components
    async session({ session, token }) {
      if (token) {
        session.user.id        = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
```

---

### 3.2 NextAuth API route — `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

---

### 3.3 Route protection middleware — `src/middleware.ts`

This runs on every request that matches the `config.matcher` pattern. It enforces the access rules from PRD §8.2.

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session      = req.auth;
  const role         = (session?.user as any)?.role;

  // ── Admin routes ───────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Not logged in → send to sign-in
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    // Logged in as customer → send to homepage
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // Staff cannot access staff management or discounts pages
    if (role === "STAFF") {
      if (
        pathname.startsWith("/admin/staff") ||
        pathname.startsWith("/admin/discounts")
      ) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  // ── Customer-protected routes ──────────────────────────
  if (pathname.startsWith("/account") || pathname.startsWith("/wishlist")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/wishlist/:path*"],
};
```

---

### 3.4 Auth helper guards — `src/lib/auth.ts` (additions)

Add these two helper functions at the bottom of `src/lib/auth.ts`. Call them at the top of every admin API route handler to prevent direct API access by unauthorised users.

```ts
import { NextResponse } from "next/server";

// Use in API routes accessible by both ADMIN and STAFF
export function requireStaff(session: any) {
  if (!session || !["ADMIN", "STAFF"].includes(session.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null; // null means access is allowed
}

// Use in API routes accessible by ADMIN only
export function requireAdmin(session: any) {
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
```

Usage inside any API route:

```ts
const session = await auth();
const denied  = requireAdmin(session);
if (denied) return denied;
// ... rest of handler
```

---

### 3.5 Sign-in page — `src/app/(auth)/auth/signin/page.tsx`

Build a client component with:

1. **"Continue with Google" button** — calls `signIn("google")` from `next-auth/react` on click
2. **Email/password form** — built with `react-hook-form` and `zod`:
   - `email` field: required, must be valid email
   - `password` field: required, minimum 8 characters
   - On submit: calls `signIn("credentials", { email, password, redirectTo: "/account" })`
   - Shows an error message if sign-in fails (wrong password, deactivated account)
3. **Styling**: dark background (`brand-black`), gold border accents, white text, serif headings

---

### Phase 3 verification

- Sign in with Google → should land on homepage as a CUSTOMER
- Sign in with admin credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`) → should land on homepage
- Navigate to `/admin` → should succeed (role is ADMIN)
- Sign out, then navigate to `/admin` → should redirect to `/auth/signin`
- Sign in as a customer, then navigate to `/admin` → should redirect to `/`

---

## Phase 4 — Admin Panel
**Goal:** All 8 admin pages fully functional with CRUD operations, role enforcement, and a live dashboard with charts.  
**Estimated time:** 5–7 days

Build the pages in this order: Layout → Dashboard → Products → Categories → Orders → Inventory → Discounts → Delivery → Staff

---

### 4.1 Admin layout — `src/app/admin/layout.tsx`

This is a **server component**. It:
1. Calls `auth()` to get the session server-side
2. Redirects to `/auth/signin` if not logged in, or `/` if role is `CUSTOMER`
3. Renders the two-column admin shell:
   - Left: `<AdminSidebar />` (fixed width, collapsible on mobile using shadcn `Sheet`)
   - Right: `{children}` in a scrollable content area

**`<AdminSidebar>` navigation links:**

| Label | Route | Visible to |
|---|---|---|
| Dashboard | `/admin` | All |
| Products | `/admin/products` | All |
| Categories | `/admin/categories` | All |
| Orders | `/admin/orders` | All |
| Inventory | `/admin/inventory` | All |
| Discounts | `/admin/discounts` | Admin only |
| Delivery Zones | `/admin/delivery` | All |
| Staff | `/admin/staff` | Admin only |

Hide the "Admin only" links by checking `session.user.role` in the component.

---

### 4.2 Dashboard — `src/app/admin/page.tsx`

Server component. Fetch all stat data directly with Prisma (no separate API route needed for the dashboard page).

**Stat cards (top row):**

```
Revenue Today      Orders Today      Active Products      Low-Stock Variants
(sum of paid       (count of all     (isActive = true)    (stock < 5)
 orders today)      orders today)
```

Prisma queries:
```ts
// Revenue today — only count orders that have been paid (not PENDING)
prisma.order.aggregate({
  where: { status: { not: "PENDING" }, createdAt: { gte: startOfDay(new Date()) } },
  _sum: { total: true },
})

// Orders today
prisma.order.count({ where: { createdAt: { gte: startOfDay(new Date()) } } })

// Active products
prisma.product.count({ where: { isActive: true } })

// Low-stock variants
prisma.productVariant.count({ where: { stock: { lt: 5, gt: 0 } } })
```

**Charts (below stat cards):**
- `<RevenueChart>` — Recharts `LineChart` — last 30 days, one data point per day (sum of paid order totals). Query: group orders by `createdAt` date, aggregate `total`.
- `<OrderStatusChart>` — Recharts `PieChart` (donut style) — count of orders per status. Query: `prisma.order.groupBy({ by: ["status"], _count: true })`.

Charts are **client components** (Recharts requires browser APIs). Pass the pre-fetched data from the server page as props.

**Quick action links:**
- "View pending orders" → `/admin/orders?status=PENDING`
- "View low-stock items" → `/admin/inventory?filter=low`

---

### 4.3 Products — `src/app/admin/products/`

**List page (`page.tsx`):**
- Server component
- Fetch: `prisma.product.findMany({ include: { category: true, _count: { select: { variants: true } } } })`
- If URL has `?q=searchterm`, filter: `where: { name: { contains: q, mode: "insensitive" } }`
- Render a shadcn `Table` with columns: Name, Category, Variants (count), Status (Active/Inactive badge), Edit (link), Delete (button)
- Delete button triggers `DELETE /api/admin/products/[id]` then refreshes the list
- "Add Product" button links to `/admin/products/new`

**Create page (`new/page.tsx`) and Edit page (`[id]/page.tsx`):**
- Both render `<ProductForm />` (client component)
- Edit page fetches existing product data and passes it as `defaultValues`

**`<ProductForm>` client component** (`src/components/admin/ProductForm.tsx`):

Fields and behaviour:

| Field | Type | Notes |
|---|---|---|
| Name | Text input | On change, auto-populate Slug field using `generateSlug()` |
| Slug | Text input | Editable; auto-generated from Name |
| Category | Select dropdown | Options fetched from `GET /api/admin/categories` |
| Description | Textarea | Free text |
| Featured | Toggle/Switch | Shows product on homepage |
| Active | Toggle/Switch | Hides product from storefront when off |
| Images | `<ImageUploader>` | See below |
| Variants | `<VariantManager>` | See below |

Validation (zod schema):
- Name: required, min 2 chars
- Slug: required, only lowercase letters, numbers, hyphens
- Category: required
- Description: required, min 10 chars
- Variants: array, minimum 1 item required
- Each variant: size required, price > 0, stock ≥ 0

On submit: `POST /api/admin/products` (create) or `PATCH /api/admin/products/[id]` (edit)

**`<ImageUploader>` component** (`src/components/admin/ImageUploader.tsx`):
- Uses `next-cloudinary` `<CldUploadWidget>` with upload preset set in Cloudinary dashboard
- Displays uploaded image thumbnails in a row (up to 5)
- Each thumbnail has a delete (×) button to remove it from the list
- The list of Cloudinary URLs is stored as a `string[]` in the form state

**`<VariantManager>` component** (`src/components/admin/VariantManager.tsx`):
- Renders a list of variant rows
- Each row: Size (text input), Price in SLE (number input — display as SLE, store as minor units), Stock (number input), SKU (optional text input), Delete button
- "Add Variant" button appends a new empty row
- Enforce minimum 1 variant using form validation

**Admin product API routes:**

| Route | Method | Handler logic |
|---|---|---|
| `/api/admin/products` | GET | `prisma.product.findMany` with category + variants |
| `/api/admin/products` | POST | Validate body → `prisma.product.create` with nested `variants.create` in a transaction |
| `/api/admin/products/[id]` | PATCH | Update product fields + delete removed variants + upsert remaining variants |
| `/api/admin/products/[id]` | DELETE | Soft delete: set `isActive: false`. If no orders reference the product, hard delete is also acceptable. |

---

### 4.4 Categories — `src/app/admin/categories/page.tsx`

Single-page component with:
- shadcn `Table`: Name, Slug, Product count, Edit (opens dialog), Delete (button)
- "Add Category" button opens a shadcn `Dialog` with a form: Name input + Slug input (auto-generated from name) + optional image upload
- Delete: first check if `_count.products > 0`. If yes, show a warning dialog instead of deleting.
- API routes: `GET/POST /api/admin/categories`, `PATCH/DELETE /api/admin/categories/[id]`

---

### 4.5 Orders — `src/app/admin/orders/`

**List page (`page.tsx`):**
- Filter by status via URL param: `?status=PENDING` (default: all)
- Search by order ID or email via `?q=`
- Table columns: Order ID (truncated), Customer name/email, Date, Total (formatted SLE), Status badge, View link

**Detail page (`[id]/page.tsx`):**
- Fetch: `prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true, variant: true } }, address: { include: { deliveryZone: true } }, coupon: true, user: true } })`
- Display: Customer info, delivery address, line items table, Monime session ID, coupon applied
- `<OrderStatusControl>` component: a dropdown (all OrderStatus values) + "Save" button → calls `PATCH /api/admin/orders/[id]` with the new status

**API routes:**
- `GET /api/admin/orders` — list with filters
- `PATCH /api/admin/orders/[id]` — update status (both ADMIN and STAFF can do this)

---

### 4.6 Inventory — `src/app/admin/inventory/page.tsx`

- Fetch all `ProductVariant` records joined with their `Product`
- Filter buttons: All / Low Stock (`stock < 5`) / Out of Stock (`stock = 0`) — controlled via URL param `?filter=`
- `<StockEditor>` component per row: an editable number input, Save button → `PATCH /api/admin/inventory/[variantId]`
- Status label per row: Out of Stock (stock = 0), Low Stock (stock 1–4), In Stock (stock ≥ 5)
- Bulk adjust: checkbox per row, enter a delta (+/−), apply to all selected rows

---

### 4.7 Discounts — `src/app/admin/discounts/page.tsx` *(Admin only)*

- Coupon list table: Code, Type (Percentage/Fixed), Value, Min Order, Uses (`usedCount / maxUses` or "Unlimited"), Expiry, Active toggle, Edit button
- "Create Coupon" dialog with fields:
  - Code: text input + "Generate" button (generate a random 8-char alphanumeric code)
  - Type: radio (Percentage or Fixed SLE)
  - Value: number (0–100 for Percentage, any positive integer for Fixed)
  - Min Order (optional): number in SLE — store as minor units
  - Max Uses (optional): number — leave blank for unlimited
  - Expiry Date (optional): date picker
- API routes: `GET/POST /api/admin/coupons`, `PATCH /api/admin/coupons/[id]`

---

### 4.8 Delivery Zones — `src/app/admin/delivery/page.tsx`

- Simple table: Zone Name, Delivery Fee (SLE), Active toggle, Edit button
- Create/edit in a dialog: Zone Name (text) + Fee (number in SLE — store as minor units)
- No delete button — only deactivate (orders reference zones). Show a tooltip explaining why.
- API routes: `GET/POST /api/admin/delivery`, `PATCH /api/admin/delivery/[id]`

---

### 4.9 Staff Management — `src/app/admin/staff/page.tsx` *(Admin only)*

- Table: Name, Email, Role badge (Staff / Admin), Joined date, Status (Active/Inactive), Change Role dropdown, Deactivate button
- "Invite Staff" button opens a dialog:
  - Email input
  - On submit: server creates a `User` record with role `STAFF`, generates a random temporary password (e.g. using `crypto.randomUUID()`), sends an invite email with a one-time setup link
  - For email sending: use **Resend** (`npm install resend`) — add `RESEND_API_KEY` to `.env.local`
- Change Role: select dropdown (Staff / Admin) → `PATCH /api/admin/staff/[id]` with `{ role: "ADMIN" | "STAFF" }`
- Deactivate: `PATCH /api/admin/staff/[id]` with `{ isActive: false }` — prevents login without deleting the record

---

### Phase 4 verification

- Create a product with two variants, upload placeholder images
- Verify it appears in Prisma Studio
- Create a coupon (10% off, no expiry)
- Create a delivery zone (Test Zone, SLE 50.00)
- Invite a staff member, log in as them, confirm they cannot see Discounts or Staff pages

---

## Phase 5 — Customer Storefront
**Goal:** All 11 customer-facing pages built, styled in the minimal-luxury aesthetic, with working cart, wishlist, and account management.  
**Estimated time:** 5–6 days

Build in this order: Layout → Homepage → Product Listing → Product Detail → Cart → Checkout → Checkout Success → Wishlist → Account pages → Sign-in page

---

### 5.1 Store layout — `src/app/(store)/layout.tsx`

Server component. Renders:
- `<Navbar>` — brand name (text placeholder for logo), nav links (Products), Cart icon with item count badge, Sign In or Account dropdown
- `{children}`
- `<Footer>` — brand name, placeholder social links, copyright

**`<Navbar>` cart badge:** Fetch cart item count from `GET /api/cart` (or direct Prisma query in the server component). Display the count in a small gold badge on the cart icon.

---

### 5.2 Homepage — `src/app/(store)/page.tsx`

Server component. Four sections:

**1. Hero section**
- Full-viewport height (`h-screen`)
- Background: black; text: white and gold
- Headline: "House of Cohort" (serif font, large)
- Tagline: "Luxury Fragrances for Sierra Leone" (smaller, tracking-wide)
- Primary CTA button: "Explore Collection" → `/products`

**2. Featured Products**
```ts
const featured = await prisma.product.findMany({
  where:   { isFeatured: true, isActive: true },
  include: { variants: true },
  take:    8,
});
```
Render with `<ProductGrid products={featured} />`

**3. Category Browsing**
```ts
const categories = await prisma.category.findMany();
```
Display as a grid of cards — category name, placeholder image, link to `/products?category=[slug]`

**4. Promotional Banner**
Static section — gold background, black text, a short promotional message placeholder

---

### 5.3 Product Listing — `src/app/(store)/products/page.tsx`

Server component. URL params: `?category=slug`, `?minPrice=X`, `?maxPrice=Y`, `?sort=newest|price_asc|price_desc`, `?page=1`

```ts
// Build the Prisma where clause from URL params
const where = {
  isActive: true,
  ...(category && { category: { slug: category } }),
  ...(minPrice || maxPrice) && {
    variants: {
      some: {
        price: {
          ...(minPrice && { gte: minPrice * 100 }),
          ...(maxPrice && { lte: maxPrice * 100 }),
        },
      },
    },
  },
};

const orderBy =
  sort === "price_asc"  ? { variants: { _min: { price: "asc"  } } } :
  sort === "price_desc" ? { variants: { _min: { price: "desc" } } } :
                          { createdAt: "desc" };

const [products, total] = await Promise.all([
  prisma.product.findMany({ where, orderBy, include: { variants: true, category: true }, skip: (page - 1) * 24, take: 24 }),
  prisma.product.count({ where }),
]);
```

Layout:
- Left sidebar: category filter checkboxes, price range (min/max number inputs), "Apply Filters" button
- Main area: sort dropdown + `<ProductGrid />` + pagination (Previous / Next links)

**`<ProductCard>` component** (`src/components/store/ProductCard.tsx`):
- Product image (first Cloudinary URL, or a placeholder if none)
- Product name (serif font)
- Category name
- Starting price: "From SLE X.XX" (lowest variant price)
- "View" link → `/products/[slug]`

---

### 5.4 Product Detail — `src/app/(store)/products/[slug]/page.tsx`

Server component.

```ts
const product = await prisma.product.findUnique({
  where:   { slug, isActive: true },
  include: {
    variants:  true,
    category:  true,
    reviews:   { include: { user: true }, orderBy: { createdAt: "desc" } },
  },
});
if (!product) notFound();
```

Sections on the page:

**Image Gallery (`<ImageGallery>`):**
- Client component
- Large main image on the left
- Row of up to 5 thumbnail images below
- Clicking a thumbnail updates the main image
- If no images uploaded: show a styled placeholder div

**Product Info (right side):**
- Category name (gold, small caps)
- Product name (serif, large)
- Description

**`<VariantSelector>` client component:**
- Renders one button per variant (size label)
- On click: updates the displayed price and stock status badge in the same component
- Passes the selected `variantId` to the Add to Cart button

**Stock status badge:**
- `stock === 0` → red badge "Out of Stock"
- `1 ≤ stock ≤ 4` → amber badge "Low Stock"
- `stock ≥ 5` → green badge "In Stock"

**Action buttons:**
- "Add to Cart" → `POST /api/cart` with `{ variantId, quantity: 1 }`; disabled if out of stock
- "Add to Wishlist" → shown only to authenticated users; `POST /api/wishlist` with `{ productId }`

**Reviews section:**
- Star distribution: a mini bar chart showing count per rating (1–5 stars) using simple CSS bars or Recharts
- List of `<ReviewCard>` components: reviewer name, date, star rating, comment
- Review form (authenticated users only — check session in the server component):
  - Star picker (`<StarRating>` interactive component)
  - Comment textarea
  - Submit → `POST /api/reviews`
  - One review per user per product — if user already reviewed, show their existing review instead of the form

---

### 5.5 Cart — `src/app/(store)/cart/page.tsx`

Client component (needs interactivity for quantity changes).

**Guest cart identification:**
- When a guest first adds an item, generate a UUID and store it in a cookie named `cart-session` (expires in 30 days)
- Pass this cookie value as the `sessionId` when calling cart API routes

**Cart API** — `src/app/api/cart/route.ts`:

| Method | Purpose | Logic |
|---|---|---|
| GET | Get cart contents | Identify user by session or `cart-session` cookie. Return cart with items, variant (price, size, stock), and product (name, images). |
| POST | Add item to cart | Find or create Cart for this user/session. Upsert CartItem (if variant already in cart, increment quantity). |
| PATCH | Update quantity | Update CartItem quantity. If quantity ≤ 0, delete the item. |
| DELETE | Remove item | Delete CartItem by `variantId`. |

**Cart page layout:**
- Left (main): list of `<CartItem>` components
  - Each CartItem: product image, product name, variant size, quantity stepper (minus button / number / plus button), line total, remove (×) button
  - Quantity changes call `PATCH /api/cart`
  - Remove calls `DELETE /api/cart`
- Right (sidebar): order summary
  - Subtotal (sum of all line items)
  - "Proceed to Checkout" button → `/checkout`
- Empty cart state: icon + "Your cart is empty" + "Browse Products" button

---

### 5.6 Checkout — `src/app/(store)/checkout/page.tsx`

Client component. Single-page form (not a multi-step wizard) with react-hook-form + zod.

**Guest checkout:** If not authenticated, show an email field at the top. Authenticated users skip this.

**Form fields:**

```
Contact
  [Email — only for guests]

Delivery Details
  [Recipient Name]       [Phone Number]
  [Street Address]
  [City]
  [Delivery Zone — dropdown]     Delivery fee: SLE X.XX (updates on zone change)

Coupon
  [Coupon Code input]   [Apply] button
  (shows "SLE X.XX discount applied" or error message)
```

**Order Summary sidebar (right side):**
```
Items:
  Golden Oud 100ml × 2    SLE 900.00

Subtotal                  SLE 900.00
Delivery                  SLE 30.00
Discount                 −SLE 90.00
─────────────────────────────────────
Total                     SLE 840.00

[Pay Now →]
```

**Coupon validation:** On click "Apply" → `POST /api/checkout/apply-coupon` with `{ code, subtotal }` → server validates: code exists, is active, not expired, not maxed out, subtotal meets minimum order. Returns `{ discount }` or `{ error }`.

**"Pay Now" flow:**
1. Client POSTs form data to `POST /api/checkout`
2. Server creates the Order (status: PENDING) and Monime checkout session
3. Server returns `{ redirectUrl }`
4. Client does `window.location.href = redirectUrl` to redirect to Monime hosted checkout

---

### 5.7 Checkout Success — `src/app/(store)/checkout/success/page.tsx`

Server component. URL: `/checkout/success?orderId=xxx&sid=MONIME_SESSION_ID`

1. Read `orderId` and `sid` from URL search params
2. Call `GET /api/checkout/verify?orderId=xxx&sid=yyy` (internal fetch, server-to-server)
3. The verify route (see Phase 6) queries Monime, confirms `status === "completed"`, updates the order to PAID, decrements stock
4. If verified: display success UI
5. If not verified: display "Payment could not be confirmed" with a link back to `/checkout`

**Success UI:**
- Tick icon (gold)
- "Order Confirmed!" heading
- Order ID
- Summary of items ordered
- Delivery address
- If guest user: "Create an account to track your orders" prompt with link to sign-in

---

### 5.8 Wishlist — `src/app/(store)/wishlist/page.tsx`

Server component (middleware already ensures the user is authenticated).

```ts
const wishlistItems = await prisma.wishlistItem.findMany({
  where:   { userId: session.user.id },
  include: { product: { include: { variants: true } } },
});
```

Renders a product grid. Each card has two extra buttons:
- "Add to Cart" → `POST /api/cart`
- "Remove" → `DELETE /api/wishlist/[productId]`

Empty state: "Your wishlist is empty" + "Browse Products" button.

---

### 5.9 Account pages

**Profile — `src/app/(store)/account/page.tsx`:**
- Displays name, email
- Sign-in method indicator: if `user.password` is null → Google icon + "Google account"; else → "Email & Password"
- List of saved addresses; each has a delete button

**Order History — `src/app/(store)/account/orders/page.tsx`:**
```ts
const orders = await prisma.order.findMany({
  where:   { userId: session.user.id },
  orderBy: { createdAt: "desc" },
});
```
Table: Order ID, Date, Total, Status badge, View link

**Order Detail — `src/app/(store)/account/orders/[id]/page.tsx`:**
```ts
const order = await prisma.order.findUnique({
  where:   { id },
  include: { items: { include: { product: true, variant: true } }, address: { include: { deliveryZone: true } } },
});
// Security: verify the order belongs to the logged-in user
if (order.userId !== session.user.id) notFound();
```

Visual status timeline (CSS-only component):
```
● Pending → ● Paid → ● Processing → ● Shipped → ● Delivered
```
Fill each circle in gold up to and including the current status. Use an array of statuses and compare index to current status.

---

### 5.10 Guest cart merge

When a guest (who has a `cart-session` cookie) signs in, merge their guest cart into their authenticated cart. Implement this in the NextAuth `signIn` callback (in `src/lib/auth.ts`):

```ts
// In the NextAuth callbacks
async signIn({ user }) {
  // After a successful sign-in, merge guest cart if cookie exists
  // This runs server-side — read the cookie from the request headers
  // 1. Find Cart where sessionId = guestSessionId
  // 2. Find Cart where userId = user.id
  // 3. For each item in the guest cart:
  //    - If the variant is already in the user cart → add quantities together
  //    - If not → move the CartItem to the user cart
  // 4. Delete the guest Cart record
  return true;
}
```

Alternatively, implement the merge as a server action called immediately after `signIn()` succeeds on the sign-in page, reading the `cart-session` cookie from the browser.

---

### Phase 5 verification

- Browse products as a guest, add items to cart, verify the cart persists on page reload (cookie-based)
- Sign in with Google, verify the guest cart is merged
- Complete the checkout form up to the "Pay Now" step (don't submit yet)
- Add to wishlist, navigate to `/wishlist`, remove an item

---

## Phase 6 — Monime Payment Integration
**Goal:** Complete the purchase flow: create a Monime checkout session, redirect the customer, verify payment server-side, update the order, and decrement stock.  
**Estimated time:** 2 days

---

### 6.1 Monime API helper — `src/lib/monime.ts`

```ts
import axios from "axios";

const monimeClient = axios.create({
  baseURL: process.env.MONIME_API_URL,
  headers: {
    Authorization:  `Bearer ${process.env.MONIME_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export interface MonimeLineItem {
  name:      string;
  amount:    number;    // SLE minor units
  quantity:  number;
  imageUrl?: string;
}

// Create a hosted checkout session on Monime
export async function createCheckoutSession(params: {
  orderId:    string;
  lineItems:  MonimeLineItem[];
  successUrl: string;
  cancelUrl:  string;
}) {
  const response = await monimeClient.post(
    "/checkout-sessions",
    {
      name:      "House of Cohort Order",
      lineItems: params.lineItems,
      successUrl: params.successUrl,
      cancelUrl:  params.cancelUrl,
      reference:  params.orderId,
    },
    {
      headers: { "Idempotency-Key": params.orderId },
      // Idempotency-Key prevents duplicate sessions if the request is retried
    }
  );
  return response.data as { id: string; redirectUrl: string };
}

// Retrieve a checkout session to verify its status
export async function getCheckoutSession(sessionId: string) {
  const response = await monimeClient.get(`/checkout-sessions/${sessionId}`);
  return response.data as { id: string; status: string };
}
```

---

### 6.2 Checkout API route — `src/app/api/checkout/route.ts`

This is the most critical server-side route. It does the following in a single request:

```
POST /api/checkout
Body: {
  guestEmail?:    string,
  recipientName:  string,
  phone:          string,
  streetAddress:  string,
  city:           string,
  deliveryZoneId: string,
  couponCode?:    string,
}
```

**Step-by-step handler logic:**

1. **Get the session** — call `auth()` to check if authenticated (may be null for guests)
2. **Get the cart** — find Cart by `userId` (authenticated) or `sessionId` from `cart-session` cookie (guest). Return 400 if cart is empty.
3. **Fetch variant data** — get current `price` and `stock` for each cart item from the database (never trust client-side prices)
4. **Validate stock** — for each item, check `variant.stock >= cartItem.quantity`. Return 400 with the out-of-stock variant name if validation fails.
5. **Validate delivery zone** — fetch the zone by `deliveryZoneId`, confirm `isActive: true`. Return 400 if invalid.
6. **Validate coupon** (if `couponCode` provided):
   - Code must exist, `isActive: true`, not expired, `usedCount < maxUses` (if maxUses set)
   - Subtotal must meet `minOrder` (if set)
   - Return 400 with a specific error if invalid
7. **Calculate totals:**
   ```
   subtotal    = sum of (variant.price × cartItem.quantity)
   discount    = coupon type is PERCENTAGE ? floor(subtotal × value/100) : coupon.value
   discount    = min(discount, subtotal)   // discount cannot exceed subtotal
   deliveryFee = deliveryZone.fee
   total       = subtotal + deliveryFee - discount
   ```
8. **Create DB records** (use `prisma.$transaction` to ensure atomicity):
   - Create `Address` record
   - Create `Order` with status `PENDING`
   - Create `OrderItem` records (one per cart item, with price snapshot)
   - Increment `coupon.usedCount` if a coupon was used
9. **Create Monime session:**
   ```ts
   const { id: monimeSessionId, redirectUrl } = await createCheckoutSession({
     orderId:    order.id,
     lineItems:  cartItems.map(item => ({
       name:     `${item.product.name} — ${item.variant.size}`,
       amount:   item.variant.price,
       quantity: item.quantity,
       imageUrl: item.product.images[0] ?? undefined,
     })),
     successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}&sid={CHECKOUT_SESSION_ID}`,
     cancelUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
   });
   ```
   Note: `{CHECKOUT_SESSION_ID}` is a Monime template placeholder — Monime replaces it with the actual session ID in the redirect.
10. **Save `monimeSessionId` to the Order** — `prisma.order.update({ where: { id: order.id }, data: { monimeSessionId } })`
11. **Return** `{ redirectUrl }` to the client

---

### 6.3 Payment verification route — `src/app/api/checkout/verify/route.ts`

```
GET /api/checkout/verify?orderId=xxx&sid=MONIME_SESSION_ID
```

This is called **server-side only** from the success page (internal fetch). Do not call this from client-side JavaScript.

**Handler logic:**

1. Read `orderId` and `sid` from URL params
2. Fetch the order from DB — return 400 if not found
3. If `order.status !== "PENDING"` — the order was already verified (idempotency). Return `{ verified: true }` immediately to prevent duplicate stock decrements.
4. Call `getCheckoutSession(sid)` from `src/lib/monime.ts`
5. If `session.status !== "completed"` → return `{ verified: false }`
6. Use `prisma.$transaction` to:
   - Update `order.status` → `PAID`
   - For each `OrderItem`: `prisma.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } })`
   - Delete the cart: `prisma.cart.delete({ where: { userId: order.userId } })` (or by sessionId for guests)
7. Return `{ verified: true, orderId }`

---

### 6.4 Cancellation handling

If the customer cancels on Monime, they are redirected back to `/checkout?cancelled=true`. In the checkout page, check for this URL param and show a dismissible info banner: "Your previous payment was cancelled. You can try again below."

The order remains `PENDING` — do not delete it. The customer can submit a new checkout form which creates a new Monime session. (The PENDING order will be orphaned — a periodic cleanup job can delete old PENDING orders, but this is not required at launch.)

---

### Phase 6 verification

Use Monime's sandbox/test environment:
1. Add a product to cart as a guest
2. Fill in the checkout form
3. Click "Pay Now" — should redirect to Monime
4. Complete the test payment on Monime
5. Should redirect back to `/checkout/success`
6. Check in Prisma Studio: order status is `PAID`, variant stock has decremented, cart is empty

---

## Phase 7 — Polish, Testing & Deployment
**Goal:** Production-ready app — error states, loading skeletons, mobile layout, security hardened, and deployed to Vercel.  
**Estimated time:** 3–4 days

---

### 7.1 Loading skeletons

For every page that fetches data, create a `loading.tsx` file in the same directory. This file renders immediately while the page's server component is loading.

Use shadcn `Skeleton` component. Match the shape of the real content:
- Product grid loading → rows of rectangular skeleton cards
- Table loading → rows of skeleton lines
- Product detail loading → a two-column skeleton matching the image + info layout

---

### 7.2 Error pages

For every major page, create an `error.tsx` file. The Next.js App Router catches server-side errors and renders this instead of crashing.

Each error page should:
- Show a friendly message: "Something went wrong. Please try again."
- Include a "Try again" button that calls the Next.js built-in `reset()` function
- Include a link back to the homepage

---

### 7.3 Empty states

| Page | Empty state message |
|---|---|
| Cart | "Your cart is empty" + Browse Products button |
| Wishlist | "Your wishlist is empty" + Browse Products button |
| Order History | "You haven't placed any orders yet" |
| Admin Orders list | "No orders found" |
| Admin Products list | "No products yet — Add your first product" |

---

### 7.4 Toast notifications

The shadcn `Toaster` component should be added to `src/app/layout.tsx`. Use the `useToast` hook to trigger toasts for these events:

| Event | Toast type | Message |
|---|---|---|
| Item added to cart | Success | "Added to cart" |
| Item removed from cart | Default | "Item removed" |
| Coupon applied | Success | "Discount applied — SLE X.XX off" |
| Coupon invalid | Error | Specific error (expired, not found, etc.) |
| Review submitted | Success | "Your review has been submitted" |
| Admin: product saved | Success | "Product saved" |
| Admin: order status updated | Success | "Order status updated" |
| Admin: coupon created | Success | "Coupon created" |
| API error (any) | Error | "Something went wrong. Please try again." |

---

### 7.5 Mobile responsiveness checklist

Test every page at 375px (mobile) and 768px (tablet) viewport widths:

| Component | Mobile behaviour |
|---|---|
| Navbar | Hamburger menu (shadcn Sheet) |
| Admin sidebar | Slides in as Sheet; hamburger trigger in admin layout header |
| Product grid | `grid-cols-2` on mobile, `grid-cols-3` on tablet, `grid-cols-4` on desktop |
| Data tables | Wrap in `overflow-x-auto` container |
| Checkout form | Single column on mobile |
| Product detail | Image gallery stacks above product info on mobile |
| Stat cards (admin) | 2 columns on mobile, 4 on desktop |

---

### 7.6 Security checklist

Before deploying, verify every item below:

- [ ] Every admin API route calls `requireStaff()` or `requireAdmin()` at the top of the handler
- [ ] Admin-only routes (coupons, delivery, staff) call `requireAdmin()` specifically
- [ ] Coupon discount is calculated server-side in `POST /api/checkout` — client-submitted discount amounts are never used
- [ ] Payment is verified by querying the Monime API server-side — the `orderId` from the success URL is not trusted alone
- [ ] Passwords are hashed with `bcrypt` at cost factor 12
- [ ] All DB queries use Prisma's query builder — no raw SQL string concatenation anywhere
- [ ] `.env.local` is in `.gitignore` and not committed
- [ ] `NEXT_PUBLIC_` prefix is only used for env vars that are safe to expose to the browser

---

### 7.7 Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts. After the project is linked:

1. Go to the Vercel dashboard → your project → Settings → Environment Variables
2. Add all variables from `.env.local` (with production values)
3. Update these specific values for production:
   - `NEXTAUTH_URL` → `https://your-domain.vercel.app`
   - `NEXT_PUBLIC_APP_URL` → `https://your-domain.vercel.app`
4. In Google Cloud Console → OAuth credentials → add `https://your-domain.vercel.app/api/auth/callback/google` to authorised redirect URIs
5. After the first deploy, run the production migration:
   ```bash
   npx prisma migrate deploy
   ```
6. Run the seed against production NeonDB (one time only):
   ```bash
   NODE_ENV=production npx prisma db seed
   ```
7. Change the admin password immediately after first login in production

---

### 7.8 Post-deploy smoke test

Go through each item in order:

- [ ] Homepage loads, featured product and categories are visible
- [ ] Product listing page loads, filtering by category works
- [ ] Product detail page loads, variant selector updates price
- [ ] Add to cart as guest — cart badge updates
- [ ] Sign in with Google — cart merges
- [ ] Sign in with admin credentials
- [ ] Admin dashboard loads with stat cards and charts
- [ ] Create a product in admin panel — appears in storefront
- [ ] Complete a test checkout — redirected to Monime
- [ ] Complete test payment on Monime — redirected to success page
- [ ] Order status in admin panel shows PAID
- [ ] Variant stock has decremented in Prisma Studio / admin inventory

---

## Key Utilities Reference

| Function | File | Description |
|---|---|---|
| `formatSLE(n)` | `src/lib/utils.ts` | `25000` → `"SLE 250.00"` |
| `generateSlug(s)` | `src/lib/utils.ts` | `"Golden Oud"` → `"golden-oud"` |
| `requireAdmin(session)` | `src/lib/auth.ts` | Returns 403 response or null |
| `requireStaff(session)` | `src/lib/auth.ts` | Returns 403 response or null |
| `getOrCreateCart(userId?, sessionId?)` | `src/lib/cart.ts` | Finds or creates the correct cart |
| `applyCoupon(coupon, subtotal)` | `src/lib/coupon.ts` | Returns discount amount in minor units |
| `createCheckoutSession(params)` | `src/lib/monime.ts` | Calls Monime API, returns `redirectUrl` |
| `getCheckoutSession(id)` | `src/lib/monime.ts` | Calls Monime API, returns `{ status }` |

---

## Phase Summary

| Phase | Deliverable | Est. Days |
|---|---|---|
| 1 | Next.js scaffold, Tailwind brand tokens, folder structure, env vars | 1 |
| 2 | Prisma schema (14 models), NeonDB migration, seed data | 1 |
| 3 | NextAuth v5 (Google + credentials), JWT role, middleware, sign-in page | 1 |
| 4 | All 8 admin pages + 14 admin API routes | 5–7 |
| 5 | All 11 customer pages + cart/wishlist/account/reviews APIs | 5–6 |
| 6 | Monime checkout session, payment verify route, stock decrement | 2 |
| 7 | Loading states, error pages, mobile audit, security checklist, Vercel deploy | 3–4 |
| **Total** | | **~18–22 days** |
