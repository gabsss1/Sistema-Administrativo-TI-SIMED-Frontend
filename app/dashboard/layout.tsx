"use client"

import type React from "react"
import { AdminLayout } from "@/components/admin-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
