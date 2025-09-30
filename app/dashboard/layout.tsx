"use client"

import type React from "react"
import { SimpleLayout } from "@/components/simple-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SimpleLayout>{children}</SimpleLayout>
}
