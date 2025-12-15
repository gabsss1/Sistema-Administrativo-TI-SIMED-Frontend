"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { AdminSidebar } from "./admin-sidebar"
import { Loader2 } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isLoading, isAuthenticated } = useAuth()

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

  // El middleware se encarga de redirigir a /login si no está autenticado
  // pero agregamos esta verificación adicional por seguridad
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64">
        {/* Header móvil con espacio para el botón hamburguesa */}
        <div className="lg:hidden h-16 flex items-center bg-background border-b border-border px-4">
          <div className="w-10"></div> {/* Espacio para el botón hamburguesa */}
          <h1 className="text-lg font-semibold flex-1 text-center">SIMED Admin Panel</h1>
          <div className="w-10"></div> {/* Balance visual */}
        </div>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
