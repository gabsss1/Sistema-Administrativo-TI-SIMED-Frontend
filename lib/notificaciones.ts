import { authenticatedFetch } from "./auth"

// Tipos para notificaciones
export type NotificationType = "info" | "success" | "warning" | "error"
export type NotificationCategory = "sistema" | "guardia" | "equipo" | "planning" | "usuario"

// Interfaz que coincide con el backend
export interface NotificacionBackend {
  notificacion_id: number
  mensaje: string
  leida: boolean
  usuario: {
    usuario_id: number
    usuario: string
    nombre: string
    apellido: string
  }
  createdAt: string
}

// Interfaz para el frontend (simplificada y compatible)
export interface Notificacion {
  id: string
  userId: string
  message: string
  read: boolean
  createdAt: string
}

// Función helper para convertir notificación del backend al formato frontend
function mapNotificacion(notif: NotificacionBackend): Notificacion {
  return {
    id: notif.notificacion_id.toString(),
    userId: notif.usuario.usuario_id.toString(),
    message: notif.mensaje,
    read: notif.leida,
    createdAt: notif.createdAt,
  }
}

/**
 * Obtiene todas las notificaciones de un usuario
 */
export async function getNotificaciones(userId: string): Promise<Notificacion[]> {
  try {
    const response = await authenticatedFetch(`/notificacion/usuario/${userId}`)
    if (!response.ok) {
      console.error("Error al obtener notificaciones")
      return []
    }
    const data: NotificacionBackend[] = await response.json()
    return data.map(mapNotificacion)
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

/**
 * Obtiene solo las notificaciones no leídas de un usuario
 */
export async function getNotificacionesNoLeidas(userId: string): Promise<Notificacion[]> {
  try {
    const response = await authenticatedFetch(`/notificacion/usuario/${userId}/no-leidas`)
    if (!response.ok) {
      console.error("Error al obtener notificaciones no leídas")
      return []
    }
    const data: NotificacionBackend[] = await response.json()
    return data.map(mapNotificacion)
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

/**
 * Marca una notificación como leída
 */
export async function marcarComoLeida(notificationId: string): Promise<boolean> {
  try {
    const response = await authenticatedFetch(`/notificacion/${notificationId}/marcar-leida`, {
      method: "PATCH",
    })
    return response.ok
  } catch (error) {
    console.error("Error al marcar como leída:", error)
    return false
  }
}

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export async function marcarTodasComoLeidas(userId: string): Promise<boolean> {
  try {
    const response = await authenticatedFetch(`/notificacion/usuario/${userId}/marcar-todas-leidas`, {
      method: "PATCH",
    })
    return response.ok
  } catch (error) {
    console.error("Error al marcar todas como leídas:", error)
    return false
  }
}

/**
 * Elimina una notificación
 */
export async function eliminarNotificacion(notificationId: string): Promise<boolean> {
  try {
    const response = await authenticatedFetch(`/notificacion/${notificationId}`, {
      method: "DELETE",
    })
    return response.ok
  } catch (error) {
    console.error("Error al eliminar notificación:", error)
    return false
  }
}

/**
 * Crea una nueva notificación con información del usuario que asigna
 */
export async function crearNotificacion(
  mensaje: string, 
  usuario_id: number, 
  usuarioAsignadoPorId?: number
): Promise<boolean> {
  try {
    let mensajeFinal = mensaje
    
    // Si hay un usuario asignador, obtener sus datos y modificar el mensaje
    if (usuarioAsignadoPorId) {
      try {
        const response = await authenticatedFetch(`/auth/users`)
        if (response.ok) {
          const usuarios = await response.json()
          const usuarioAsignador = usuarios.find((u: any) => u.usuario_id === usuarioAsignadoPorId)
          
          if (usuarioAsignador) {
            const nombreCompleto = `${usuarioAsignador.nombre} ${usuarioAsignador.apellido}`
            // Reemplazar "Se te ha asignado" por "Nombre Apellido te asignó"
            mensajeFinal = mensaje
              .replace('Se te ha asignado un nuevo planning', `${nombreCompleto} te asignó un planning`)
              .replace('Se te ha asignado una nueva guardia', `${nombreCompleto} te asignó una guardia`)
              .replace('Tu planning', `${nombreCompleto} actualizó tu planning`)
              .replace('Tu guardia', `${nombreCompleto} actualizó tu guardia`)
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario asignador:", error)
        // Si falla, usar el mensaje original
      }
    }
    
    const dto = { mensaje: mensajeFinal, usuario_id }
    const response = await authenticatedFetch("/notificacion", {
      method: "POST",
      body: JSON.stringify(dto),
    })
    return response.ok
  } catch (error) {
    console.error("Error al crear notificación:", error)
    return false
  }
}

/**
 * Obtiene el contador de notificaciones no leídas
 */
export async function getContadorNoLeidas(userId: string): Promise<number> {
  try {
    const response = await authenticatedFetch(`/notificacion/usuario/${userId}/count-no-leidas`)
    if (!response.ok) return 0
    const data = await response.json()
    return data.count || 0
  } catch (error) {
    console.error("Error al obtener contador:", error)
    return 0
  }
}
