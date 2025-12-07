# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EduCart is a Next.js 15 marketplace application for universities, built with React 19, TypeScript, and Supabase. The platform supports multiple user types (Students, Faculty, Alumni, Organizations, Admins) with distinct features for each role. It includes a mobile Android app via Capacitor that points to the production Vercel deployment.

## Tech Stack

- **Framework**: Next.js 15.4.3 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS 4, Radix UI, shadcn/ui components
- **State Management**: TanStack Query (React Query) v5
- **Backend**: Supabase (auth, database, storage)
- **Payments**: PayMongo integration
- **Maps**: Mapbox GL JS with geocoding and directions
- **Mobile**: Capacitor 7 (Android)
- **AI**: Google Generative AI

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Android development (after building web app)
npx cap sync android
npx cap open android
```

## Architecture

### Authentication & Authorization

Authentication uses Supabase with a multi-role system managed via middleware:

- **Roles**: Student, Faculty, Alumni, Organization (stored in `users.role`)
- **Admin Access**: Separate `admin_users` table with `is_enabled` flag
- **Middleware**: `utils/supabase/middleware.ts` handles all auth logic and role-based redirects
  - Public paths defined in `publicPaths` array
  - Admin routes (`/admin/*`) require admin privileges
  - Organization routes (`/organization-account/*`) require Organization role
  - User-only routes (`/home`, `/browse`, etc.) blocked for Organizations
  - Smart redirects based on role after login

### Supabase Client Patterns

- **Client Components**: Use `utils/supabase/client.ts` - creates browser client
- **Server Components/Actions**: Use `utils/supabase/server.ts` - creates server client with cookies
- **Middleware**: Uses inline `createServerClient` with custom cookie handling

### Route Structure

The app uses Next.js 15 App Router with route groups:

- `(auth)/` - Authentication pages (login, signup, organization signup, password reset)
- `(user-profile)/` - User profile pages
- `(view-public-profile)/` - Public profile viewing
- `admin/` - Admin dashboard (protected, requires `admin_users.is_enabled = true`)
- `organization-account/` - Organization dashboard (protected, requires `role = "Organization"`)
- `app/` - Main application routes (home, browse, messages, wallet, etc.)
- `api/` - API routes organized by feature

### Post/Transaction Types

The platform supports multiple transaction types, each with its own form, card component, and transaction flow:

1. **For Sale** - Standard marketplace sale
2. **Rent** - Time-based rentals with date picker
3. **Trade** - Item exchange
4. **Emergency** - Urgent borrowing (no payment)
5. **PasaBuy** - Group buying/purchasing service
6. **Giveaway** - Free items with likes/comments

Each type has:
- Form component in `components/forms/` (e.g., `ForSaleForm.tsx`)
- Display card in `components/posts/displayposts/` (e.g., `ItemCard.tsx`)
- Transaction form in `components/transaction/forms/`
- Status update actions in `components/transaction/update-status/`
- API routes in `app/api/formSubmit/` and `app/api/status-update/`

### Payment Integration

- **PayMongo**: Production payment gateway (test keys in `.env`)
- **Wallet System**: Internal credits stored in `user_wallets` table
- **Flow**: Payment → Webhook → Transaction Status Update → Wallet Update
- **API Routes**:
  - `/api/payments/*` - PayMongo integration
  - `/api/wallet/*` - Wallet operations (cashin, cashout, balance)
  - `/api/credits/*` - Credit purchase flow

### Messaging System

Real-time messaging between users:
- Route: `app/messages/[id]/`
- Components: `components/messages/`
- Mobile optimized with `MobileMessagesClient.tsx`
- Uses Supabase Realtime subscriptions

### Map Integration

Mapbox for location-based features:
- Token: `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env`
- Components:
  - `components/location/MapPicker.tsx` - Inline map picker
  - `components/location/FullScreenMapPicker.tsx` - Full screen map
  - `components/location/AddressPickerWithMap.tsx` - Address with map
- `utils/getRoadDistance.ts` - Calculate road distance
- `utils/deliveryFee.ts` - Calculate delivery fees
- `components/DeliveryFeeCalculator.tsx` - UI component for fee calculation

### Image Handling

- Storage: Supabase Storage bucket (configured in `next.config.ts` remote patterns)
- Upload: `app/api/uploadImage/route.ts`
- Components:
  - `components/posts/ImageUpload.tsx` - Multi-image upload
  - `components/AvatarUploader.tsx` - Avatar upload
  - `components/BackgroundUploader.tsx` - Background image upload
  - `components/OCRUploader.tsx` - OCR-enabled upload

### UI Components

Built with shadcn/ui pattern (Radix UI + Tailwind):
- Base components in `components/ui/`
- Custom compositions in feature-specific folders
- Consistent theme using Poppins font (configured in `app/layout.tsx`)
- Dark mode support with `next-themes`
- Toast notifications via `sonner`

### Loading States

- Global loading provider: `components/loading/LoadingOverlay.tsx`
- Route loading indicator: `components/loading/RouteLoading.tsx`
- Both wrapped in root layout

### Mobile App (Capacitor)

- Config: `capacitor.config.ts`
- App ID: `com.educart.app`
- Points to production URL: `https://educart-capstone.vercel.app`
- Android source: `android/` directory
- Main activity: `android/app/src/main/java/com/educart/app/MainActivity.java`

## Important Notes

### Build Configuration

- TypeScript errors ignored in build (`ignoreBuildErrors: true`) - fix errors before committing
- Server actions have 10mb body size limit
- Turbopack enabled for faster dev builds

### Environment Variables

Required in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (server-side only)
- `PAYMONGO_SECRET_KEY` - PayMongo secret
- `NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY` - PayMongo public key
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token
- `NEXT_PUBLIC_BASE_URL` - Base URL for the app

### Database Tables (Key Tables)

Based on the codebase:
- `users` - User profiles with `role` field
- `admin_users` - Admin privileges with `is_enabled` flag
- `public_user_profiles` - Public profile data
- `user_wallets` - Wallet balances
- `posts` - All marketplace posts/items
- `transactions` - Transaction records
- `messages` - Message data
- Reports tables for moderation

### Server Actions Pattern

Server actions are colocated with routes in `actions.ts` files:
- Return typed results (success/error objects)
- Use `revalidatePath()` for cache invalidation
- Example: `app/(auth)/login/actions.ts`

### API Route Pattern

RESTful API routes in `app/api/`:
- Use Supabase server client for auth
- Return JSON responses
- Organized by feature domain
- Some use service role key for admin operations

### TypeScript Configuration

- Path alias: `@/*` maps to project root
- Target: ES2017
- Strict mode enabled
- Module resolution: bundler
