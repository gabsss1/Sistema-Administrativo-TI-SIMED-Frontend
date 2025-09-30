"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { AdminSidebar } from "./admin-sidebar"
import { LoginForm } from "./login-form"
import { Loader2 } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
