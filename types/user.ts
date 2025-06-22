import type { Tables } from "@/types/database.types"

export type UserProfile = {
  profile_image: string
  display_name: string
  email: string
  created_at: string
  last_active_at: string
} & Tables<"users">
