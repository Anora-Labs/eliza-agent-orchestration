"use client"

import { redirect } from "next/navigation"

export default function AuthErrorPage() {
  redirect("/")
  return null
}
