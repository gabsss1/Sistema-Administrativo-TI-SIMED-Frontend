"use client"

import type React from "react"
import { SimpleLayout } from "@/components/simple-layout"

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SimpleLayout>{children}</SimpleLayout>
}
