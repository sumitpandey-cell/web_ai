import { hasPermission, recordUsage } from "@/services/auth/permissions"
import { getCurrentUser } from "@/services/auth/server"

export async function canCreateQuestion() {
  const user = await getCurrentUser()
  if (!user) return false

  const allowed = await hasPermission(user.id, "create_question")
  if (allowed) {
    await recordUsage(user.id, "create_question")
  }
  return allowed
}
