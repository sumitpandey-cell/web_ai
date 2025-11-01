# ✅ MIGRATION CHECKLIST

## Pre-Launch Checklist

### Environment & Secrets
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` to `.env.local`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Add `SUPABASE_JWT_SECRET` to `.env.local`
- [ ] Add `STRIPE_SECRET_KEY` to `.env.local`
- [ ] Add `STRIPE_WEBHOOK_SECRET` to `.env.local`
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`

### Database
- [ ] Run `npm run db:generate` (creates migration)
- [ ] Review migration in `src/drizzle/migrations/`
- [ ] Run `npm run db:push` (applies to database)
- [ ] Verify tables created: `subscriptions`, `usage`, `plans`

### Stripe Setup
- [ ] Go to https://dashboard.stripe.com
- [ ] Create Product: "Pro Plan"
- [ ] Create Price: $29/month (or desired price)
- [ ] Copy Price ID and add to env as `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
- [ ] Create Webhook Endpoint at `/api/webhooks/stripe`
- [ ] Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Copy signing secret and add to env

### Code Updates
- [ ] Update `src/app/api/ai/questions/generate-feedback/route.ts` (see API_ROUTES_TO_UPDATE.md)
- [ ] Update `src/app/api/ai/resumes/analyze/route.ts` (see API_ROUTES_TO_UPDATE.md)
- [ ] Check for any other files importing from `@services/clerk/` (use grep)

### Cleanup Old Clerk Code
- [ ] Delete `src/services/clerk/` directory
- [ ] Delete `src/app/api/webhooks/clerk/` directory
- [ ] Run `npm uninstall @clerk/nextjs`
- [ ] Check `.env.local` - remove old CLERK_* variables
- [ ] Check `package.json` - verify @clerk/nextjs is gone

### Local Testing
- [ ] Start dev server: `npm run dev`
- [ ] Visit `http://localhost:3000` - should show marketing page
- [ ] Click "Sign Up" - should go to `/sign-up`
- [ ] Sign up with test email (test@example.com)
- [ ] Check email (if real email, confirm in Supabase)
- [ ] Sign in with credentials
- [ ] Should be redirected to `/app`
- [ ] View navbar - user avatar should show
- [ ] Create first job info (should work)
- [ ] Create first interview (should work - free tier allows 1)
- [ ] Try to create 2nd interview (should fail with "Plan limit")
- [ ] Click "Upgrade" button
- [ ] Should go to `/app/upgrade` with pricing
- [ ] Click "Upgrade to Pro" button
- [ ] Should redirect to Stripe checkout
- [ ] **TEST PAYMENT:** Use Stripe test card: `4242 4242 4242 4242`
- [ ] After payment, should redirect back to app
- [ ] Now creating 2nd interview should work
- [ ] Test logout - click user avatar → Logout
- [ ] Should go to `/sign-in`
- [ ] Sign back in - should still see Pro plan status

### Browser Storage & Cookies
- [ ] Open DevTools → Application → Cookies
- [ ] Should see Supabase auth cookies (not Clerk)
- [ ] Reload page - should stay logged in
- [ ] Clear cookies - should logout on next navigation

### Error Handling
- [ ] Try signing up with existing email - should show error
- [ ] Try signing in with wrong password - should show error
- [ ] Try accessing `/app` without signin - should redirect to `/sign-in`
- [ ] Try accessing invalid routes - should show appropriate errors

### Stripe Integration
- [ ] In Stripe Dashboard, should see test customer created
- [ ] Subscription should show as active
- [ ] Check `/api/webhooks/stripe` - should receive webhook events
- [ ] Check database: `subscriptions` table should have entry

### Performance
- [ ] Page load times should be reasonable
- [ ] No console errors
- [ ] Network tab shows all requests succeeding

### Backup & Documentation
- [ ] Create backup of old Clerk configuration (if needed)
- [ ] Update team documentation
- [ ] Share env setup guide with team
- [ ] Document Stripe webhook URLs for team

---

## Launch Readiness Criteria

Before deploying to production, ensure:

✅ All 12 environment variables configured
✅ Database migration applied
✅ 2 API routes updated  
✅ Stripe product/price created
✅ Stripe webhook configured
✅ All local tests passing
✅ No console errors
✅ Old Clerk code removed
✅ Git commits organized and documented

---

## Deployment Steps

1. **Staging Environment:**
   ```bash
   git push staging
   # Verify all env vars in staging
   # Run migrations
   # Run tests
   ```

2. **Production Environment:**
   ```bash
   git push production
   # Verify all env vars in production
   # Run migrations with backup
   # Monitor for errors
   ```

3. **Post-Deployment:**
   - [ ] Monitor error logs for 1 hour
   - [ ] Test signup flow in production
   - [ ] Test payment flow with small amount
   - [ ] Verify webhooks receiving events
   - [ ] Monitor database for new records

---

## Rollback Plan

If something goes wrong:

1. **Immediate:** 
   - Revert to previous Clerk version from git
   - Deploy to production
   - Direct users to email support

2. **Investigation:**
   - Check server logs
   - Check database logs
   - Check Stripe dashboard
   - Check Supabase auth logs

3. **Recovery:**
   - Fix issues in new branch
   - Test thoroughly in staging
   - Re-deploy to production

---

## Support & Resources

**Supabase Issues?**
- Check: https://supabase.com/docs
- Status: https://status.supabase.com

**Stripe Issues?**
- Check: https://stripe.com/docs
- Test cards: https://stripe.com/docs/testing

**Next.js Issues?**
- Check: https://nextjs.org/docs
- Error format: `Error: [message]`

---

## Success Metrics

- ✅ Users can signup
- ✅ Users can signin  
- ✅ Free tier limits enforced
- ✅ Checkout works
- ✅ Pro tier unlocks features
- ✅ Monthly reset works
- ✅ Zero Clerk code remaining
- ✅ Webhooks receiving events
- ✅ No errors in logs
