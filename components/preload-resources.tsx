"use client"

import { useEffect } from 'react'

// Precargar recursos críticos
export function PreloadResources() {
  useEffect(() => {
    // Precargar SweetAlert2 en modo idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        import('sweetalert2')
      })
    } else {
      // Fallback para navegadores sin requestIdleCallback
      setTimeout(() => {
        import('sweetalert2')
      }, 2000)
    }

    // Precargar hospitales en segundo plano
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        import('@/hooks/use-hospitales')
      })
    }
  }, [])

  return null
}