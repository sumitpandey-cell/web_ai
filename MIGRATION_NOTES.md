# Migration from Clerk to Supabase Auth + Stripe Billing

## Completed ✅

### 1. Environment Variables Updated
- Replaced `@clerk/nextjs` env vars with Supabase variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_JWT_SECRET`
- Added Stripe variables:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`

### 2. Installed Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/react-stripe-js @stripe/stripe-js
```

### 3. Created Supabase Auth Services
- `src/services/supabase/client.ts` - Browser client
- `src/services/supabase/server.ts` - Server client with cookie handling

### 4. Created Billing Schema
- `SubscriptionTable` - Track user subscriptions
- `UsageTable` - Track feature usage per month
- `PlanTable` - Define pricing plans and limits

### 5. Created Stripe Integration
- `src/services/stripe/server.ts` - Stripe helpers for checkout, subscriptions, etc.

### 6. Replaced Permission System
- `src/services/auth/permissions.ts` - New permission checking based on billing tier
- Supports: `create_interview`, `create_question`, `analyze_resume`
- Free tier: 1 interview/month, 5 questions/month, 1 resume/month
- Pro tier: unlimited

### 7. Created Auth Pages
- `src/app/sign-up/page.tsx` - New Supabase signup
- `src/app/sign-in/[[...sign-in]]/page.tsx` - New Supabase signin

### 8. Updated Core Components
- Removed `ClerkProvider` from `src/app/layout.tsx`
- Updated `src/app/app/layout.tsx` to use new auth
- Updated `src/app/app/_Navbar.tsx` to use Supabase logout

### 9. Updated Middleware
- Replaced `clerkMiddleware` with Supabase session verification
- `src/middleware.ts` now verifies Supabase sessions

## Still TODO 🔄

### 1. Update Remaining Pages
- [ ] `src/app/page.tsx` - Home page (remove PricingTable reference)
- [ ] `src/app/onboarding/page.tsx` - Update to use Supabase user
- [ ] `src/app/app/page.tsx` - Update auth imports
- [ ] `src/app/app/upgrade/page.tsx` - Create new billing/upgrade page with Stripe

### 2. Update API Routes
- [ ] `src/app/api/ai/questions/generate-question/route.ts` - Update permission check
- [ ] `src/app/api/ai/questions/generate-feedback/route.ts` - Update permission check
- [ ] `src/app/api/ai/resumes/analyze/route.ts` - Update permission check
- [ ] Create Stripe webhook handler at `/api/webhooks/stripe`

### 3. Create Stripe Webhook Handler
- Handle `customer.subscription.created`
- Handle `customer.subscription.updated`
- Handle `customer.subscription.deleted`
- Update database subscriptions accordingly

### 4. Create Billing/Checkout Routes
- [ ] GET `/api/billing/checkout` - Create checkout session
- [ ] GET `/api/billing/manage` - Manage billing portal
- [ ] POST `/api/webhooks/stripe` - Handle Stripe events

### 5. Update User Features
- [ ] Update `src/features/users/db.ts` - Already works but verify Supabase user sync
- [ ] Create user onboarding flow to sync Supabase -> Database

### 6. Remove Clerk Dependencies
- [ ] Remove `@clerk/nextjs` from package.json
- [ ] Remove/clean up `src/services/clerk/` directory
- [ ] Delete webhook file at `src/app/api/webhooks/clerk/route.ts`

### 7. Create Database Migration
- [ ] Run `prisma-migrate-dev` to create Subscription, Usage, Plan tables

### 8. Testing
- [ ] Test signup flow
- [ ] Test signin flow
- [ ] Test logout flow
- [ ] Test permission checks
- [ ] Test Stripe checkout
- [ ] Test subscription updates via webhook

## Environment Variables Needed

Add to `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Migration Path

1. Create Stripe products and prices
2. Deploy database migration (subscription tables)
3. Create new billing management page
4. Test complete flow
5. Switch users over when ready
