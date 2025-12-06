# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EduCart is a university marketplace platform built with Next.js 15 (App Router), React 19, TypeScript, Supabase, and Capacitor for Android deployment. The application enables students to buy, sell, rent, trade items, request emergency help (pasabuy), participate in giveaways, and message each other in real-time.

## Common Development Commands

### Development
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Android (Capacitor)
The project includes Android support via Capacitor. The app points to the production URL (https://educart-capstone.vercel.app) configured in `capacitor.config.ts`.

```bash
npx cap sync android     # Sync web assets and plugins to Android project
npx cap open android     # Open Android project in Android Studio
npx cap run android      # Build and run on connected Android device/emulator
```

## Architecture Overview

### Directory Structure

- **`app/`** - Next.js App Router pages and layouts
  - `(auth)/` - Auth-related pages (login, signup, organization signup, password reset)
  - `(user-profile)/` - User profile views
  - `admin/` - Admin dashboard and management
  - `organization-account/` - Organization seller dashboard and product management
  - `browse/` - Product browsing (featured, emergency, giveaways, pasabuy)
  - `messages/` - Real-time messaging system
  - `wallet/` - Wallet and credit management
  - `credits/` - Credit purchase flows (GCash, bank transfer)
  - `payment/` - Payment success/failure pages
  - `product/[id]/` - Individual product detail pages

- **`components/`** - React components organized by feature
  - `admin/` - Admin-specific UI (sidebars, navigation)
  - `auth/` - Authentication forms and dialogs
  - `forms/` - Product creation forms (EmergencyForm, ForSaleForm, GiveawayForm, PasaBuyForm, RentForm, TradeForm)
  - `location/` - Map components (MapPicker, AddressPickerWithMap, FullScreenMapPicker)
  - `messages/` - Messaging UI components with realtime subscriptions
  - `organization/` - Organization dashboard components
  - `payments/` - Payment dialogs and processing
  - `posts/` - Product display cards and details
  - `ui/` - Shadcn UI components
  - `wallet/` - Wallet-related UI

- **`hooks/`** - React hooks for data fetching and mutations
  - `queries/` - TanStack Query hooks for fetching data (displayItems.ts, GiveawayPosts.ts, profiles.ts, etc.)
  - `mutations/` - Mutation hooks (useAddDelivery.ts, useConfirmReceived.ts)

- **`utils/`** - Utility functions
  - `supabase/` - Supabase client setup (client.ts, server.ts, middleware.ts)
  - `checkAdmin.ts` - Admin role verification
  - `deliveryFee.ts` - Delivery fee calculation
  - `getRoadDistance.ts` - Distance calculation using Mapbox
  - `getRelativeTime.ts` - Time formatting utilities

- **`lib/`** - Library code
  - `auth/` - Authentication utilities (resendConfirmation.ts)
  - `utils.ts` - cn() utility for className merging

### Key Technologies

- **Next.js 15** with App Router and React 19
- **Supabase** - Backend (auth, database, storage, realtime)
- **TanStack Query** - Server state management (5-minute stale time, 15-minute cache)
- **Mapbox GL** - Maps and geocoding for location-based features
- **PayMongo** - Payment processing (GCash)
- **Capacitor** - Cross-platform Android deployment
- **Shadcn UI + Radix UI** - Component library
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety

### Authentication & Authorization

- Supabase Auth handles user authentication
- Session management via middleware (`middleware.ts` and `utils/supabase/middleware.ts`)
- Two user types: regular users and organization accounts
- Admin access checked via `utils/checkAdmin.ts`
- Route groups: `(auth)` for public auth pages, protected routes check authentication

### Real-time Features

The messaging system uses Supabase Realtime:
- `MessagesRealtimeRefresher` component subscribes to new messages and conversation changes
- Channels subscribe to `conversation_participants` and `messages` table changes
- Router refresh triggered on new data to update UI

### Product Types

The platform supports multiple transaction types, each with dedicated forms:
1. **For Sale** - Standard marketplace listings
2. **For Rent** - Time-based rentals with date pickers
3. **For Trade** - Item exchange listings
4. **Emergency/PasaBuy** - Urgent requests for item pickup/delivery
5. **Giveaways** - Free item listings

### Location & Maps

- Mapbox integration for address selection and delivery distance calculation
- `AddressPickerWithMap` and `FullScreenMapPicker` components
- Distance-based delivery fee calculation in `utils/deliveryFee.ts`
- Road distance API in `utils/getRoadDistance.ts`

### Payment Flow

- Credits can be purchased via GCash (PayMongo) or bank transfer
- Individual and business/organization payment flows
- Wallet system for managing user balances
- Transaction tracking in admin and organization dashboards

### State Management

- TanStack Query for server state with custom defaults:
  - `staleTime: 5 minutes`
  - `gcTime: 15 minutes`
  - `refetchOnWindowFocus: false`
  - `refetchOnReconnect: false`
- Provider setup in `app/providers.tsx`

### Image Handling

- Remote images from Supabase storage configured in `next.config.ts`
- Pattern: `https://tujhvkxppflutrbftxkv.supabase.co/storage/v1/object/public/**`
- `AvatarUploader`, `BackgroundUploader`, and `OCRUploader` components handle uploads

## Environment Variables

Required variables (create a `.env.local` file in the project root):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox API token
- `PAYMONGO_SECRET_KEY` - PayMongo secret key
- `NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY` - PayMongo public key
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application

## Important Patterns

### Supabase Client Usage
- **Client Components**: Use `createClient()` from `utils/supabase/client.ts`
- **Server Components**: Use `createClient()` from `utils/supabase/server.ts`
- Session refreshed via middleware on every request

### Path Aliases
- `@/*` maps to root directory (configured in `tsconfig.json`)
- Example: `@/components/ui/button` → `components/ui/button.tsx`

### Build Configuration
- TypeScript build errors ignored (`ignoreBuildErrors: true`)
- Server actions body size limit: 10MB
- Turbopack enabled for development

### Component Patterns
- Shadcn UI components in `components/ui/`
- Forms use controlled components with React state
- Real-time components subscribe to Supabase channels
- Mobile-responsive design throughout

## Database Schema Notes

Key tables (inferred from code):
- `profiles` - User profiles
- `messages` - Chat messages
- `conversations` - Chat conversations
- `conversation_participants` - Many-to-many relationship
- `items`/`posts` - Product listings (multiple types)
- `transactions` - Payment and sale records
- `favorites` - User favorites/bookmarks
- `organizations` - Business accounts
- `reviews` - User reviews

## Testing & Development

- No test suite currently configured
- Linting via ESLint with Next.js config
- Development with hot reload via Turbopack
