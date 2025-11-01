import { getCurrentUser } from "@/services/auth/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Calendar, Shield } from "lucide-react"
import Link from "next/link"
import { CopyEmailButton } from "./_CopyEmailButton"
import { LogoutButton } from "./_LogoutButton"

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (user == null) return redirect("/sign-in")

  const userName = user.user_metadata?.full_name || user.email || "User"
  const userImageUrl = user.user_metadata?.avatar_url || ""
  const userEmail = user.email || "No email"

  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const createdAt = new Date(user.created_at)
  const formattedDate = createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col items-center gap-4">
            {/* Avatar */}
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/20">
              <AvatarImage src={userImageUrl} alt={userName} />
              <AvatarFallback className="text-lg font-bold bg-primary/10">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <div className="text-center">
              <CardTitle className="text-xl sm:text-2xl">{userName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">User Profile</p>
            </div>

            {/* Status Badge */}
            <Badge variant="secondary" className="rounded-full">
              <Shield className="mr-1 h-3 w-3" />
              Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {/* Email Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Mail className="h-4 w-4" />
              Email
            </div>
            <div className="flex items-center gap-2 justify-between bg-muted p-2 sm:p-3 rounded-lg">
              <span className="text-xs sm:text-sm break-all">{userEmail}</span>
              <CopyEmailButton email={userEmail} />
            </div>
          </div>

          {/* Joined Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Joined
            </div>
            <p className="text-xs sm:text-sm text-foreground">{formattedDate}</p>
          </div>

          {/* Account Info */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Account Info
            </p>
            <div className="text-xs space-y-1">
              <p>
                <span className="text-muted-foreground">ID:</span>{" "}
                <code className="text-primary font-mono text-xs">
                  {user.id.slice(0, 8)}...
                </code>
              </p>
              <p>
                <span className="text-muted-foreground">Provider:</span>{" "}
                <Badge variant="outline" className="ml-2 text-xs">
                  {user.app_metadata?.providers?.[0] || "Email"}
                </Badge>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3 pt-2">
            <Button asChild variant="outline" className="w-full text-sm sm:text-base">
              <Link href="/app">Back to Dashboard</Link>
            </Button>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
