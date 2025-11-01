"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/services/supabase/client"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/sign-in")
  }

  return (
    <Button
      onClick={handleLogout}
      variant="destructive"
      className="w-full"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}
