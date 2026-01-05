"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type NotificationType = "info" | "success" | "warning" | "error"

interface ToastNotificacion {
  id: string
  title: string
  message: string
  type: NotificationType
  duration?: number // duración en ms, por defecto 5000
}

const iconMap: Record<NotificationType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap: Record<NotificationType, string> = {
  success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-900 dark:text-green-100",
  error: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-900 dark:text-red-100",
  warning: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900 text-yellow-900 dark:text-yellow-100",
  info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100",
}

interface NotificacionToastItemProps {
  toast: ToastNotificacion
  onDismiss: (id: string) => void
}

function NotificacionToastItem({ toast, onDismiss }: NotificacionToastItemProps) {
  const Icon = iconMap[toast.type]
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg p-4 transition-all duration-300",
        colorMap[toast.type],
        isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
      )}
    >
      <div className="flex gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
          <p className="text-sm opacity-90">{toast.message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface NotificacionToastContainerProps {
  toasts: ToastNotificacion[]
  onDismiss: (id: string) => void
}

export function NotificacionToastContainer({ toasts, onDismiss }: NotificacionToastContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <NotificacionToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// Hook para usar toasts
let toastId = 0
const toastListeners: ((toasts: ToastNotificacion[]) => void)[] = []
let currentToasts: ToastNotificacion[] = []

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...currentToasts]))
}

export function showToast(
  title: string,
  message: string,
  type: NotificationType = "info",
  duration?: number
) {
  const newToast: ToastNotificacion = {
    id: `toast-${++toastId}`,
    title,
    message,
    type,
    duration,
  }

  currentToasts.push(newToast)
  notifyListeners()

  return newToast.id
}

export function dismissToast(id: string) {
  currentToasts = currentToasts.filter((t) => t.id !== id)
  notifyListeners()
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastNotificacion[]>([])

  useEffect(() => {
    toastListeners.push(setToasts)
    setToasts([...currentToasts])

    return () => {
      const index = toastListeners.indexOf(setToasts)
      if (index > -1) {
        toastListeners.splice(index, 1)
      }
    }
  }, [])

  return {
    toasts,
    showToast,
    dismissToast,
  }
}
