"use client"

import { NotificacionToastContainer, useToasts } from "./notificacion-toast"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, dismissToast } = useToasts()

  return (
    <>
      {children}
      <NotificacionToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}
