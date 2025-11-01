import { experienceLevels } from "@/lib/db/types"
import z from "zod"

export const jobInfoSchema = z.object({
  name: z.string().min(1, "Required"),
  title: z.string().min(1, "Required").default(""),
  experienceLevel: z.enum(experienceLevels),
  description: z.string().min(1, "Required"),
})
