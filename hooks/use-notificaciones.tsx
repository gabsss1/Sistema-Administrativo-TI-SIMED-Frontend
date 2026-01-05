"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"
import {
  type Notificacion,
  getNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  getContadorNoLeidas,
} from "@/lib/notificaciones"

export function useNotificaciones() {
  const { user } = useAuth()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [contador, setContador] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar notificaciones
  const cargarNotificaciones = useCallback(async () => {
    if (!user?.id) {
      setNotificaciones([])
      setContador(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const [todasLasNotificaciones, contadorNoLeidas] = await Promise.all([
        getNotificaciones(user.id),
        getContadorNoLeidas(user.id),
      ])

      setNotificaciones(todasLasNotificaciones)
      setContador(contadorNoLeidas)
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Cargar notificaciones al montar y cuando cambie el usuario
  useEffect(() => {
    cargarNotificaciones()

    // Polling cada 10 segundos para actualizar notificaciones
    const interval = setInterval(() => {
      cargarNotificaciones()
    }, 10000)

    return () => clearInterval(interval)
  }, [cargarNotificaciones])

  // Marcar como leída
  const marcarLeida = useCallback(
    async (notificationId: string) => {
      try {
        // Actualizar el estado local inmediatamente para UI responsiva
        setNotificaciones((prev) => {
          const notificacion = prev.find((n) => n.id === notificationId)
          if (notificacion && !notificacion.read) {
            // Solo decrementar si la notificación no estaba leída
            setContador((c) => Math.max(0, c - 1))
          }
          return prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        })
        
        // Hacer la petición al backend
        await marcarComoLeida(notificationId)
      } catch (error) {
        console.error("Error al marcar notificación como leída:", error)
        // Recargar en caso de error para sincronizar
        cargarNotificaciones()
      }
    },
    [cargarNotificaciones]
  )

  // Marcar todas como leídas
  const marcarTodasLeidas = useCallback(async () => {
    if (!user?.id) return

    try {
      // Actualizar el estado local inmediatamente
      setNotificaciones((prev) => prev.map((n) => ({ ...n, read: true })))
      setContador(0)
      
      // Hacer la petición al backend
      await marcarTodasComoLeidas(user.id)
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error)
      // Recargar en caso de error para sincronizar
      cargarNotificaciones()
    }
  }, [user?.id, cargarNotificaciones])

  // Eliminar notificación
  const eliminar = useCallback(async (notificationId: string) => {
    try {
      // Actualizar el estado local inmediatamente para UI responsiva
      setNotificaciones((prev) => {
        const notificacion = prev.find((n) => n.id === notificationId)
        if (notificacion && !notificacion.read) {
          // Solo decrementar si la notificación no estaba leída
          setContador((c) => Math.max(0, c - 1))
        }
        return prev.filter((n) => n.id !== notificationId)
      })
      
      // Hacer la petición al backend
      await eliminarNotificacion(notificationId)
    } catch (error) {
      console.error("Error al eliminar notificación:", error)
      // Recargar en caso de error para sincronizar
      cargarNotificaciones()
    }
  }, [cargarNotificaciones])

  return {
    notificaciones,
    contador,
    isLoading,
    marcarLeida,
    marcarTodasLeidas,
    eliminar,
    recargar: cargarNotificaciones,
  }
}
