# Product Requirements Document
# ScentSL — Luxury Perfume E-Commerce Store

**Version:** 1.0  
**Date:** 2026-05-21  
**Status:** Draft  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Users & Roles](#3-users--roles)
4. [Tech Stack](#4-tech-stack)
5. [Customer-Facing Store](#5-customer-facing-store)
6. [Admin Panel](#6-admin-panel)
7. [Payment Integration (Monime)](#7-payment-integration-monime)
8. [Authentication](#8-authentication)
9. [Data Models](#9-data-models)
10. [API Surface](#10-api-surface)
11. [Non-Functional Requirements](#11-non-functional-requirements)

---

## 1. Overview

**ScentSL** is a luxury perfume e-commerce store targeting the Sierra Leone market. It consists of two surfaces:

- **Customer Storefront** — a polished, minimal-luxury shopping experience where customers browse, select, and purchase perfumes.
- **Admin Panel** — an internal tool for store administrators and staff to manage products, inventory, orders, discounts, and delivery logistics.

**Design Aesthetic:** Minimal luxury — black, gold, and white tones. Clean typography, generous whitespace, high-quality product imagery.

**Currency:** SLE (Sierra Leone Leone) exclusively, as required by the Monime payment gateway.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Launch a fully functional storefront | All customer flows work end-to-end in production |
| Enable self-service order management | Admin can update order statuses without developer involvement |
| Reduce checkout friction | Guest checkout available; no account required to purchase |
| Support product variety | Variants (size/volume) per product with independent pricing and stock |
| Enable discounting | Coupon codes apply correctly at checkout |
| Accurate inventory | Stock decrements on purchase; low-stock alerts on admin dashboard |

---

## 3. Users & Roles

### 3.1 Customer
- Can browse all active products and categories
- Can add items to cart as a guest or authenticated user
- Can check out without creating an account (guest checkout)
- Can create an account via Google login or email/password
- Authenticated customers can: save a wishlist, write product reviews, view order history and tracking

### 3.2 Staff
- Internal store employee with limited admin access
- Can view and update orders (change order status)
- Can view and adjust inventory (stock levels)
- Cannot manage: staff accounts, discount/coupon codes, delivery zones

### 3.3 Admin
- Full access to all admin panel features
- Can manage products, categories, inventory, orders, discounts, delivery zones, and staff accounts
- At least one admin account exists at launch

---

## 4. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16+ (App Router) | Full-stack React framework |
| Database | NeonDB (PostgreSQL) | Primary data store |
| ORM | Prisma | Type-safe DB access and migrations |
| Authentication | NextAuth v5 | Google OAuth + email/password credentials |
| Image Storage | Cloudinary | Product image upload and optimized delivery |
| UI Library | shadcn/ui + Tailwind CSS | Accessible, customizable component system |
| Payment | Monime Checkout Session API | Hosted checkout for SLE payments |
| Charts | Recharts | Admin dashboard analytics |

---

## 5. Customer-Facing Store

### 5.1 Homepage (`/`)
- Hero section with brand tagline and primary CTA
- Featured products grid (products flagged as featured by admin)
- Category browsing section
- Promotional banner area

### 5.2 Product Listing (`/products`)
- Grid of all active products
- Filters: category, price range
- Sort options: newest, price low–high, price high–low
- Pagination (24 products per page)

### 5.3 Product Detail (`/products/[slug]`)
- Image gallery (up to 5 Cloudinary images)
- Product name, description, and category
- Variant selector — customer picks a size (e.g. 50ml, 100ml, 200ml); price and stock status update dynamically
- Stock status indicator: In Stock / Low Stock / Out of Stock
- Add to Cart button
- Add to Wishlist button (authenticated users only)
- Reviews section showing star rating distribution and individual reviews
- Review submission form (authenticated users only; one review per product per user)

### 5.4 Cart (`/cart`)
- Line items: product image, name, selected variant, quantity stepper, line subtotal, remove button
- Order subtotal (before delivery)
- Proceed to Checkout button

### 5.5 Checkout (`/checkout`)

**Fields:**
- Recipient name and phone number
- Street address and city
- Delivery zone selector — dropdown populated from admin-configured zones; delivery fee displayed dynamically
- Coupon code field with Apply button — shows applied discount amount or error message
- Order summary: items, subtotal, delivery fee, discount, **total in SLE**

**Guest checkout:** Customer provides an email address for order reference. No password or account creation required.

**Pay Now** → customer is redirected to the Monime hosted checkout page.

### 5.6 Checkout Success (`/checkout/success`)
- Order ID and confirmation message
- Summary of items ordered
- Delivery address
- Prompt to create an account (shown to guest customers)

### 5.7 Wishlist (`/wishlist`)
- Requires authentication; unauthenticated users are redirected to sign-in
- Grid of saved products with Add to Cart and Remove from Wishlist actions per item

### 5.8 Account — Profile (`/account`)
- Requires authentication
- Displays name, email, and sign-in method (Google or email)
- Saved delivery addresses

### 5.9 Account — Order History (`/account/orders`)
- List of past orders: order ID, date, total, status badge
- Sorted by most recent first

### 5.10 Account — Order Detail (`/account/orders/[id]`)
- Full order breakdown: items, variants, quantities, unit prices
- Delivery address and zone
- Current order status with visual timeline:  
  Pending → Paid → Processing → Shipped → Delivered

### 5.11 Sign In (`/auth/signin`)
- "Continue with Google" button
- Email + password form

---

## 6. Admin Panel

All `/admin/*` routes are protected. Staff cannot access Staff Management or Discounts pages.

### 6.1 Dashboard (`/admin`)

**Stat cards:**
- Revenue today (SLE)
- Orders today
- Total active products
- Low-stock items (variants with stock < 5)

**Charts:**
- Revenue over the last 30 days (line chart)
- Orders by status breakdown (donut chart)

**Quick actions:** links to pending orders and low-stock products

---

### 6.2 Products (`/admin/products`)

**Product list:**
- Table: product name, category, number of variants, active/inactive status, edit and delete actions
- Search by name; filter by category

**Create / Edit Product:**
- Name and slug (slug auto-generated from name, editable)
- Category (dropdown)
- Description
- Image upload via Cloudinary (up to 5 images; reorderable)
- Featured toggle (appears on homepage)
- Active / Inactive toggle (inactive products are hidden from the storefront)

**Variant Manager (inline on the product form):**
- Add and remove variants
- Per variant: size label, price (SLE), stock quantity, optional SKU
- Minimum of one variant required per product

---

### 6.3 Categories (`/admin/categories`)
- Table: name, slug, product count
- Create and edit: name, slug, optional cover image
- Delete with a warning if the category contains active products

---

### 6.4 Orders (`/admin/orders`)

**Order list:**
- Table: order ID, customer name/email, date, total, status badge
- Filter by status: All / Pending / Paid / Processing / Shipped / Delivered / Cancelled
- Search by order ID or customer email

**Order detail (`/admin/orders/[id]`):**
- Customer info and delivery address
- Line items with variant, quantity, and price
- Monime session reference
- Coupon applied (if any)
- Status update control — Admin and Staff can update the order status

---

### 6.5 Inventory (`/admin/inventory`)
- Table of all product variants: product name, size, SKU, current stock, status label
- Inline stock editing (input field + save per row)
- Filter: low stock (< 5), out of stock
- Bulk stock adjustment

---

### 6.6 Discount / Coupon Codes (`/admin/discounts`) — Admin only

**Coupon list:**
- Table: code, type, value, minimum order, uses (used / max), expiry date, active toggle

**Create coupon:**
- Code (manually entered or auto-generated)
- Type: Percentage (%) or Fixed amount (SLE)
- Value
- Minimum order amount (optional)
- Maximum total uses (optional; blank = unlimited)
- Expiry date (optional)

**Edit and deactivate** existing coupons

---

### 6.7 Delivery Zones (`/admin/delivery`)
- Table: zone name, delivery fee (SLE), active toggle
- Create and edit: zone name, fee
- Deactivate a zone without deleting it (past orders reference zones)

---

### 6.8 Staff Management (`/admin/staff`) — Admin only
- Table: name, email, role (Staff or Admin), joined date, account status
- Invite by email: creates a credentials account and triggers a one-time setup link
- Change role: promote Staff → Admin or demote Admin → Staff
- Deactivate account (prevents login without deleting the record)

---

## 7. Payment Integration (Monime)

### 7.1 About Monime
Monime is a Sierra Leone payment platform. Supported payment methods on the hosted checkout:
- Card payments
- Bank transfer (Sierra Leone banks)
- Mobile Money
- Wallet

All amounts are in **SLE minor units** (integer). 1 SLE = 100 minor units. E.g. SLE 25.00 → `2500`.

### 7.2 Checkout Session Flow

```
Customer submits checkout form
    ↓
Server validates cart, delivery zone, and coupon
    ↓
Server creates an Order record in DB with status = PENDING
    ↓
Server calls Monime POST /checkout-sessions
  - name: "House of Cohort Order"
  - lineItems: ordered products with name, SLE price, quantity, image URL
  - successUrl: /checkout/success?orderId=xxx&sid={CHECKOUT_SESSION_ID}
  - cancelUrl: /checkout?cancelled=true
  - reference: orderId
  - Idempotency-Key header: orderId
    ↓
Server receives { redirectUrl } and returns it to the client
    ↓
Client redirects customer to Monime hosted checkout
    ↓
Customer completes payment on Monime
    ↓
Monime redirects to successUrl
    ↓
Server verifies payment by querying Monime GET /checkout-sessions/:id
  - Confirms status === "completed"
  - Updates Order status → PAID
  - Decrements stock for each ordered variant
    ↓
Customer sees order confirmation page
```

### 7.3 Cancellation & Expiry
- If the customer cancels, Monime redirects to `cancelUrl`. The Order remains `PENDING` and the customer can retry.
- If the Monime session expires, the Order remains `PENDING`. The customer must return to checkout.
- Payment verification always happens server-side by querying the Monime API — client-supplied parameters are never trusted alone.

---

## 8. Authentication

### 8.1 Providers

| Provider | Used by |
|---|---|
| Google OAuth | Customers — primary sign-in method |
| Credentials (email + hashed password) | Admin and Staff accounts |

### 8.2 Role Enforcement

Middleware runs on all `/admin/*` routes:

| Role | Access |
|---|---|
| Unauthenticated | Redirected to `/auth/signin` |
| CUSTOMER | Redirected to `/` (access denied) |
| STAFF | All `/admin/*` except `/admin/staff` and `/admin/discounts` |
| ADMIN | Full access to all admin routes |

Customer-protected routes (`/account/*`, `/wishlist`) redirect unauthenticated users to sign-in.

### 8.3 Guest Cart Merge
When a guest logs in after adding items to cart, the guest cart (keyed by a session cookie) is merged into the authenticated user's cart. Duplicate variants have their quantities combined. The guest cart record is deleted after the merge.

---

## 9. Data Models

### Users
`id, email, name, image, role (CUSTOMER | STAFF | ADMIN), createdAt`

### Products
`id, name, slug, description, categoryId, images (String[]), isFeatured, isActive, createdAt`

### Product Variants
`id, productId, size, price (Int — SLE minor units), stock (Int), sku (optional)`

### Categories
`id, name, slug, image (optional)`

### Carts
`id, userId (nullable), sessionId (nullable — for guests), updatedAt`

### Cart Items
`id, cartId, variantId, quantity`

### Orders
`id, userId (nullable), guestEmail, status, subtotal, deliveryFee, discount, total, deliveryZoneId, addressId, couponId, monimeSessionId, monimeReference, createdAt, updatedAt`

**Order statuses:** `PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED`

### Order Items
`id, orderId, variantId, productId, quantity, price (price at time of purchase)`

### Addresses
`id, userId (nullable), recipientName, phone, streetAddress, city, deliveryZoneId`

### Delivery Zones
`id, name, fee (Int — SLE minor units), isActive`

### Wishlist Items
`id, userId, productId` — unique per user + product pair

### Reviews
`id, userId, productId, rating (1–5), comment, createdAt` — unique per user + product pair

### Coupons
`id, code, type (PERCENTAGE | FIXED), value, minOrder (optional), maxUses (optional), usedCount, expiresAt (optional), isActive`

---

## 10. API Surface

### Public
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List products (filterable by category, price) |
| GET | `/api/products/[slug]` | Single product with variants and reviews |
| GET | `/api/categories` | List all categories |
| GET | `/api/reviews/[productId]` | Reviews for a product |

### Authenticated Customers
| Method | Endpoint | Description |
|---|---|---|
| GET / POST / DELETE | `/api/cart` | Manage cart items |
| POST | `/api/wishlist` | Add product to wishlist |
| DELETE | `/api/wishlist/[productId]` | Remove product from wishlist |
| POST | `/api/reviews` | Submit a product review |
| GET | `/api/orders` | Customer's own order history |
| POST | `/api/checkout` | Create Monime session + pending order |
| GET | `/api/checkout/verify` | Verify payment and update order status |

### Admin & Staff
| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/admin/products` | List or create products |
| PATCH / DELETE | `/api/admin/products/[id]` | Update or delete a product |
| PATCH | `/api/admin/inventory/[variantId]` | Update stock level |
| GET / PATCH | `/api/admin/orders` | List orders or update order status |
| GET / POST | `/api/admin/categories` | List or create categories |

### Admin Only
| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/admin/coupons` | List or create coupon codes |
| PATCH | `/api/admin/coupons/[id]` | Update or deactivate a coupon |
| GET / POST | `/api/admin/delivery` | List or create delivery zones |
| PATCH | `/api/admin/delivery/[id]` | Update a delivery zone |
| GET / POST | `/api/admin/staff` | List staff or invite a new member |
| PATCH | `/api/admin/staff/[id]` | Update role or deactivate account |

---

## 11. Non-Functional Requirements

### Performance
- Product listing page LCP under 2 seconds on a standard mobile connection
- All product images served via Cloudinary with format optimization and lazy loading
- Database queries use indexed fields (slug, categoryId, userId, status)

### Security
- All admin routes protected server-side via middleware — role check is not client-side only
- Coupon validation and discount calculation are server-side; client totals are never trusted
- Payment verification queries the Monime API server-side; `successUrl` parameters alone are not sufficient proof of payment
- Passwords for credentials accounts are hashed with bcrypt
- All database queries use Prisma's parameterized query system (no raw SQL interpolation)

### Responsive Design
- Mobile-first layouts using Tailwind CSS breakpoints
- Storefront fully usable on mobile (375px+)
- Admin panel optimized for desktop; functional on tablet (768px+)

### Accessibility
- shadcn/ui components are ARIA-compliant
- All product images include descriptive alt text
- Color contrast meets WCAG AA standard

### Inventory Integrity
- Stock is only decremented after payment is verified as `completed` via the Monime API
- Stock is never decremented at cart addition or order creation
- If stock reaches 0, the variant is displayed as Out of Stock and cannot be added to cart

---

*Document maintained by the development team. Update version and date on any significant scope change.*
