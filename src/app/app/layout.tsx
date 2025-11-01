import { getCurrentUser } from "@/services/auth/server"
import { redirect } from "next/navigation"
import { ReactNode } from "react"
import { Navbar } from "./_Navbar"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return redirect("/sign-in")
  }

  // Get user info from Supabase auth (no database lookup needed)
  const userName = supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User"
  const userImage = supabaseUser.user_metadata?.avatar_url || ""

  return (
    <>
      <Navbar user={{ name: userName, imageUrl: userImage }} />
      {children}
    </>
  )
}
