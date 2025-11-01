# ALL CLERK REFERENCES - COMPLETE UPDATE GUIDE

Found **10 more files** that need updating. Here's the complete list:

## Pattern to Replace Everywhere

**Old Pattern:**
```typescript
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
const { userId } = await getCurrentUser()

if (userId == null) return redirect("/")
```

**New Pattern:**
```typescript
import { getCurrentUser } from "@/services/auth/server"
const supabaseUser = await getCurrentUser()

if (!supabaseUser) return redirect("/sign-in")
const userId = supabaseUser.id
```

---

## Files to Update (Copy-Paste Ready)

### 1. `src/features/interviews/permissions.ts`
**Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { hasPermission } from "@/services/clerk/lib/hasPermission"

// WITH:
import { hasPermission, recordUsage } from "@/services/auth/permissions"
import { getCurrentUser } from "@/services/auth/server"
```

---

### 2. `src/features/resumeAnalyses/permissions.ts`
**Lines to change:**
```typescript
// REPLACE:
import { hasPermission } from "@/services/clerk/lib/hasPermission"

// WITH:
import { hasPermission, recordUsage } from "@/services/auth/permissions"
import { getCurrentUser } from "@/services/auth/server"
```

---

### 3. `src/features/interviews/actions.ts`
**Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"

// WITH:
import { getCurrentUser } from "@/services/auth/server"
```

**Then find:**
```typescript
const { userId } = await getCurrentUser()
```

**Replace with:**
```typescript
const supabaseUser = await getCurrentUser()
if (!supabaseUser) throw new Error("Unauthorized")
const userId = supabaseUser.id
```

---

### 4. `src/app/api/questions/generate-feedback/route.ts` (Already Started)
**Already updated in migration - VERIFY it's done**

---

### 5. `src/app/api/resumes/analyze/route.ts` (Already Started)
**Already updated in migration - VERIFY it's done**

---

### 6. `src/app/app/job-infos/[jobInfoId]/interviews/new/page.tsx`
**Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"

// WITH:
import { getCurrentUser } from "@/services/auth/server"
```

**Find and replace:**
```typescript
const { userId } = await getCurrentUser()
```
With:
```typescript
const supabaseUser = await getCurrentUser()
if (!supabaseUser) return redirect("/sign-in")
const userId = supabaseUser.id
```

---

### 7. `src/app/app/job-infos/[jobInfoId]/interviews/[interviewId]/page.tsx`
**Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"

// WITH:
import { getCurrentUser } from "@/services/auth/server"
```

**Find and replace:**
```typescript
const { userId } = await getCurrentUser()
```
With:
```typescript
const supabaseUser = await getCurrentUser()
if (!supabaseUser) return redirect("/sign-in")
const userId = supabaseUser.id
```

---

### 8. `src/app/app/job-infos/[jobInfoId]/interviews/page.tsx`
**Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"

// WITH:
import { getCurrentUser } from "@/services/auth/server"
```

**Find and replace:**
```typescript
const { userId } = await getCurrentUser()
```
With:
```typescript
const supabaseUser = await getCurrentUser()
if (!supabaseUser) return redirect("/sign-in")
const userId = supabaseUser.id
```

---

### 9. `src/app/app/job-infos/[jobInfoId]/questions/page.tsx`
**Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"

// WITH:
import { getCurrentUser } from "@/services/auth/server"
```

**Find and replace:**
```typescript
const { userId } = await getCurrentUser()
```
With:
```typescript
const supabaseUser = await getCurrentUser()
if (!supabaseUser) return redirect("/sign-in")
const userId = supabaseUser.id
```

---

### 10. `src/app/app/job-infos/[jobInfoId]/edit/page.tsx`
**Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"

// WITH:
import { getCurrentUser } from "@/services/auth/server"
```

**Find and replace:**
```typescript
const { userId } = await getCurrentUser()
```
With:
```typescript
const supabaseUser = await getCurrentUser()
if (!supabaseUser) return redirect("/sign-in")
const userId = supabaseUser.id
```

---

### 11. `src/features/jobInfos/actions.ts`
**Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"

// WITH:
import { getCurrentUser } from "@/services/auth/server"
```

**Find and replace:**
```typescript
const { userId } = await getCurrentUser()
```
With:
```typescript
const supabaseUser = await getCurrentUser()
if (!supabaseUser) throw new Error("Unauthorized")
const userId = supabaseUser.id
```

---

### 12. `src/app/app/job-infos/[jobInfoId]/page.tsx`
**Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"

// WITH:
import { getCurrentUser } from "@/services/auth/server"
```

**Find and replace:**
```typescript
const { userId } = await getCurrentUser()
```
With:
```typescript
const supabaseUser = await getCurrentUser()
if (!supabaseUser) return redirect("/sign-in")
const userId = supabaseUser.id
```

---

### 13. `src/app/page.tsx` (2 changes)
**Change 1 - Lines to change:**
```typescript
// REPLACE:
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"

// WITH:
import { getCurrentUser } from "@/services/auth/server"
```

**Change 2 - Lines to change:**
```typescript
// REPLACE:
import { PricingTable } from "@/services/clerk/components/PricingTable"

// WITH:
// DELETE THIS LINE - we have a new pricing component
```

**Then find usage of PricingTable and replace with:**
```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Instead of <PricingTable />, use:
<div className="text-center">
  <p className="mb-4">Choose your plan to get started</p>
  <Button asChild>
    <Link href="/sign-in">Get Started</Link>
  </Button>
</div>
```

---

## Verification Script

After updating, run this to find any remaining references:

```bash
# Check for any remaining @/services/clerk imports
grep -r "@/services/clerk" src/

# Should return: NO RESULTS (except in documentation)
```

---

## Summary

- **13 files to update**
- **Simple find & replace pattern**
- **~5 minutes to update all**
- After done, zero Clerk code remains! ✅

---

## Next Steps After Updates

1. Save all files
2. Run type check: `npm run lint`
3. Fix any TypeScript errors
4. Verify no remaining clerk imports: `grep -r "@/services/clerk" src/`
5. Then run the database migration
6. Test locally
