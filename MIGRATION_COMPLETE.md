# Clerk → Supabase Auth + Stripe Billing Migration - COMPLETE GUIDE

## ✅ COMPLETED WORK

### 1. **Environment Setup**
- [x] Updated `src/data/env/server.ts` - Removed Clerk vars, added Supabase & Stripe
- [x] Updated `src/data/env/client.ts` - Removed Clerk vars, added Supabase & Stripe  
- [x] Installed: `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `@stripe/react-stripe-js`, `@stripe/stripe-js`

### 2. **Database Schema**
- [x] Created `src/drizzle/schema/subscription.ts`:
  - `SubscriptionTable` - Tracks Stripe subscriptions
  - `UsageTable` - Tracks monthly feature usage
  - `PlanTable` - Defines pricing tiers and limits
- [x] Updated `src/drizzle/schema.ts` to export subscription schema

### 3. **Supabase Services**
- [x] `src/services/supabase/client.ts` - Browser-safe client
- [x] `src/services/supabase/server.ts` - Server-side auth with cookies
- [x] `src/services/auth/server.ts` - Get current Supabase user

### 4. **Stripe Integration**
- [x] `src/services/stripe/server.ts` - Checkout, subscriptions, billing
- [x] `src/app/api/webhooks/stripe/route.ts` - Webhook handler
- [x] `src/app/api/billing/checkout/route.ts` - Checkout API
- [x] `src/app/api/billing/manage/route.ts` - Billing portal

### 5. **Authentication System**
- [x] `src/services/auth/permissions.ts` - New permission system:
  - Free tier: 1 interview/month, 5 questions/month, 1 resume/month
  - Pro tier: unlimited everything
- [x] `src/app/sign-in/[[...sign-in]]/page.tsx` - Supabase signin
- [x] `src/app/sign-up/page.tsx` - Supabase signup

### 6. **Middleware & Routing**
- [x] `src/middleware.ts` - Replaced clerkMiddleware with Supabase
- [x] `src/app/layout.tsx` - Removed ClerkProvider
- [x] `src/app/app/layout.tsx` - Updated to use new auth
- [x] `src/app/app/_Navbar.tsx` - Added Supabase logout

### 7. **Permission System**
- [x] Updated `src/features/questions/permissions.ts`
- [x] Updated `src/app/api/ai/questions/generate-question/route.ts`

---

## 📋 REMAINING TASKS

### 1. **Update Remaining API Routes** (High Priority)
Need to update these routes to use new permission system:

```bash
src/app/api/ai/questions/generate-feedback/route.ts
src/app/api/ai/resumes/analyze/route.ts
src/app/api/ai/interviews/...
```

Replace this pattern:
```typescript
// OLD
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
const { userId } = await getCurrentUser()

// NEW
import { getCurrentUser } from "@/services/auth/server"
const supabaseUser = await getCurrentUser()
const userId = supabaseUser?.id
```

### 2. **Update Remaining Pages** (Medium Priority)

#### `src/app/page.tsx`
- Remove or update PricingTable reference

#### `src/app/onboarding/_client.tsx`
- Update to sync Supabase user to database
- Use `getCurrentUser` from `@/services/auth/server`

#### `src/app/app/page.tsx`  
- Update import statements

#### `src/app/app/upgrade/page.tsx` (NEW)
- Create new billing/subscription page
- Add checkout button for Pro plan
- Show current plan status

### 3. **Create Database Migration** (Critical)
Run this to add billing tables:
```bash
npm run db:generate
npm run db:push
```

### 4. **Configure Stripe** (Critical)
1. Go to Stripe Dashboard
2. Create Products:
   - Free Plan (no product needed)
   - Pro Plan ($29/month or custom price)
3. Copy Price IDs
4. Add to environment: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
5. Set webhook endpoint: `{your-domain}/api/webhooks/stripe`

### 5. **Cleanup Old Clerk Code** (Medium Priority)
```bash
# Delete these:
rm -rf src/services/clerk/
rm -rf src/app/api/webhooks/clerk/

# Remove from package.json:
npm uninstall @clerk/nextjs
```

### 6. **Testing Checklist** (Critical Before Deploy)
- [ ] Signup with email/password
- [ ] Signin with credentials
- [ ] Create interview (free tier)
- [ ] Create 6 questions (should block on 5th)
- [ ] Subscribe to Pro plan via Stripe
- [ ] Create unlimited questions (should work)
- [ ] Logout
- [ ] Middleware correctly protects `/app` routes

---

## 🚀 QUICK START NEXT STEPS

1. **Generate DB Migration:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

2. **Set Environment Variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<from Supabase>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase>
   SUPABASE_JWT_SECRET=<from Supabase>
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Update 2-3 Remaining Routes:**
   - See "REMAINING TASKS" section above

4. **Create Upgrade Page:**
   - Component to show plans
   - Checkout button integration

5. **Test Everything:**
   - Use checklist above

---

## 📚 HELPFUL REFERENCES

**Supabase:**
- Auth Docs: https://supabase.com/docs/guides/auth
- Session: `supabase.auth.getUser()`

**Stripe:**
- API Docs: https://stripe.com/docs/api
- Webhooks: https://stripe.com/docs/webhooks

---

## SUMMARY

You now have:
- ✅ Full Supabase Auth (signup/signin/logout)
- ✅ Stripe integration ready
- ✅ Permission system based on billing tiers
- ✅ Webhook handlers
- ✅ Database schema for subscriptions

**Next: Create migration, update 2-3 API routes, test, deploy!**
