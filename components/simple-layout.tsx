"use client"

import type React from "react"
import { SimpleNavbar } from "./simple-navbar"

interface SimpleLayoutProps {
  children: React.ReactNode
}

export function SimpleLayout({ children }: SimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SimpleNavbar />
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
