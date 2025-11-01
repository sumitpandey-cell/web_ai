# REMAINING API ROUTES - Update Instructions

## File 1: `src/app/api/ai/questions/generate-feedback/route.ts`

Find this section at the top:
```typescript
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
```

Replace with:
```typescript
import { getCurrentUser } from "@/services/auth/server"
```

---

Find this section:
```typescript
const { userId } = await getCurrentUser()

if (userId == null) {
  return new Response("You are not logged in", { status: 401 })
}
```

Replace with:
```typescript
const supabaseUser = await getCurrentUser()

if (!supabaseUser) {
  return new Response("You are not logged in", { status: 401 })
}

const userId = supabaseUser.id
```

---

## File 2: `src/app/api/ai/resumes/analyze/route.ts`

Find this section at the top:
```typescript
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
```

Replace with:
```typescript
import { getCurrentUser } from "@/services/auth/server"
```

---

Find this section:
```typescript
const { userId } = await getCurrentUser()

if (userId == null) {
  return new Response("Unauthorized", { status: 401 })
}
```

Replace with:
```typescript
const supabaseUser = await getCurrentUser()

if (!supabaseUser) {
  return new Response("Unauthorized", { status: 401 })
}

const userId = supabaseUser.id
```

---

## File 3 (Optional): Check `src/features/resumeAnalyses/permissions.ts`

If this file exists and uses Clerk, update it similarly:

**Current:**
```typescript
import { hasPermission } from "@/services/clerk/lib/hasPermission"
```

**New:**
```typescript
import { hasPermission, recordUsage } from "@/services/auth/permissions"
import { getCurrentUser } from "@/services/auth/server"
```

And update the function to call `recordUsage()` after permission check.

---

## That's It!

After these 3 small changes, all your API routes will work with Supabase auth and the new billing system!
