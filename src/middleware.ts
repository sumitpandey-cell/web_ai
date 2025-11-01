import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next"
import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const isPublicRoute = (path: string) => {
  const publicRoutes = ["/sign-in", "/sign-up", "/", "/api/webhooks"]
  return publicRoutes.some(route => path.startsWith(route))
}

const aj = arcjet({
  key: process.env.ARCJET_KEY || "",
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 100,
    }),
  ],
})

export async function middleware(request: NextRequest) {
  // Rate limiting
  const decision = await aj.protect(request)

  if (decision.isDenied()) {
    return new Response(null, { status: 403 })
  }

  // For public routes, allow access
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // For protected routes, verify Supabase session
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to sign in
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
