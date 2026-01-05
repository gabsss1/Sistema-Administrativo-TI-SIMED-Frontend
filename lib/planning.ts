import { authenticatedFetch, authenticatedFetchRaw, getUserFromToken } from './auth'
import { crearNotificacion } from './notificaciones'

const base = '/planning'

// Interfaces
export interface PlanningItem {
  planning_id?: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  titulo: string
  descripcion?: string
  estado?: 'asignada' | 'completada' | 'cancelada'
  observaciones?: string
  motivo_cancelacion?: string
  usuario_id?: number
  usuario?: {
    usuario_id: number
    nombre: string
    apellido: string
  }
  hospital_id?: number
  hospital?: any
}

export interface CreatePlanningDto {
  fecha: string
  hora_inicio: string
  hora_fin: string
  titulo: string
  descripcion?: string
  estado?: 'asignada' | 'completada' | 'cancelada'
  observaciones?: string
  motivo_cancelacion?: string
  usuario_id?: number
  hospital_id?: number
}

export interface UpdatePlanningDto extends Partial<CreatePlanningDto> {}

export async function fetchPlannings() {
  const res = await authenticatedFetch(base)
  if (!res.ok) throw new Error(`Error fetching plannings: ${res.status}`)
  return res.json()
}

export async function fetchPlanning(id: number) {
  const res = await authenticatedFetch(`${base}/${id}`)
  if (!res.ok) throw new Error(`Error fetching planning ${id}: ${res.status}`)
  return res.json()
}

export async function createPlanning(payload: CreatePlanningDto) {
  const res = await authenticatedFetchRaw(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Error creating planning: ${res.status} ${text}`)
  }
  
  const nuevoPlanning = await res.json()
  
  // Notificar al usuario asignado si existe
  if (payload.usuario_id && payload.fecha && payload.hora_inicio && payload.hora_fin) {
    // Parsear fecha como local para evitar problemas de zona horaria
    const [year, month, day] = payload.fecha.split('-').map(Number)
    const fechaLocal = new Date(year, month - 1, day)
    const fecha = fechaLocal.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    
    const mensaje = `Se te ha asignado un nuevo planning "${payload.titulo}" para el ${fecha} de ${payload.hora_inicio} a ${payload.hora_fin}`
    
    // Obtener el usuario que está asignando
    const usuarioActual = await getUserFromToken()
    const usuarioAsignadoPorId = usuarioActual?.id ? parseInt(usuarioActual.id) : undefined
    
    await crearNotificacion(mensaje, payload.usuario_id, usuarioAsignadoPorId)
  }
  
  return nuevoPlanning
}

export async function updatePlanning(id: number, payload: UpdatePlanningDto, usuarioAnteriorId?: number) {
  const res = await authenticatedFetchRaw(`${base}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Error updating planning: ${res.status} ${text}`)
  }
  
  const planningActualizado = await res.json()
  
  // Si se cambió el usuario asignado, el backend debería manejar las notificaciones
  // Solo notificamos si se actualizó sin cambiar usuario
  if (payload.usuario_id && (!usuarioAnteriorId || payload.usuario_id === usuarioAnteriorId) && payload.fecha && payload.hora_inicio && payload.hora_fin) {
    // Parsear fecha como local para evitar problemas de zona horaria
    const [year, month, day] = payload.fecha.split('-').map(Number)
    const fechaLocal = new Date(year, month - 1, day)
    const fecha = fechaLocal.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    
    const mensaje = `Tu planning "${payload.titulo || 'sin título'}" ha sido actualizado para el ${fecha} de ${payload.hora_inicio} a ${payload.hora_fin}`
    
    // Obtener el usuario que está actualizando
    const usuarioActual = await getUserFromToken()
    const usuarioAsignadoPorId = usuarioActual?.id ? parseInt(usuarioActual.id) : undefined
    
    await crearNotificacion(mensaje, payload.usuario_id, usuarioAsignadoPorId)
  }
  
  return planningActualizado
}

export async function deletePlanning(id: number) {
  const res = await authenticatedFetch(`${base}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Error deleting planning: ${res.status} ${text}`)
  }
  return res.json()
}

export default {
  fetchPlannings,
  fetchPlanning,
  createPlanning,
  updatePlanning,
  deletePlanning,
}
