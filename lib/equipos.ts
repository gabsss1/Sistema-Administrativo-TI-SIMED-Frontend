import { basicAuthenticatedFetch } from './auth'

// Tipos para los enums
export enum TipoEquipo {
  PC = 'PC',
  IMPRESORA = 'Impresora'
}

export enum EstadoEquipo {
  CONCLUIDO = 'Concluido',
  NO_CONCLUIDO = 'No Concluido',
  PENDIENTE = 'Pendiente',
}

// Interfaces
export interface Equipo {
  equipo_id: number
  tipo_equipo: TipoEquipo
  marca_equipo: string
  modelo_equipo: string
  numero_serie_equipo: string
  marca_mouse?: string
  modelo_mouse?: string
  serie_mouse?: string
  marca_teclado?: string
  modelo_teclado?: string
  serie_teclado?: string
  fecha_revision_paquete?: Date
  fecha_conclusion?: Date
  observaciones?: string
  estado_equipo: EstadoEquipo
}

export interface CreateEquipoData {
  tipo_equipo: TipoEquipo
  marca_equipo: string
  modelo_equipo: string
  numero_serie_equipo: string
  marca_mouse?: string
  modelo_mouse?: string
  serie_mouse?: string
  marca_teclado?: string
  modelo_teclado?: string
  serie_teclado?: string
  fecha_revision_paquete?: Date
  fecha_conclusion?: Date
  observaciones?: string
  estado_equipo: EstadoEquipo
}

export interface UpdateEquipoData extends Partial<CreateEquipoData> {}

// API Functions
export async function getEquiposList(): Promise<Equipo[]> {
  try {
    const response = await basicAuthenticatedFetch('/equipos')
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching equipos:', error)
    throw error
  }
}

export async function getEquipo(id: number): Promise<Equipo> {
  try {
    const response = await basicAuthenticatedFetch(`/equipos/${id}`)
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching equipo:', error)
    throw error
  }
}

export async function createEquipo(data: CreateEquipoData): Promise<Equipo> {
  try {
    const response = await basicAuthenticatedFetch('/equipos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating equipo:', error)
    throw error
  }
}

export async function updateEquipo(id: number, data: UpdateEquipoData): Promise<Equipo> {
  try {
    const response = await basicAuthenticatedFetch(`/equipos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating equipo:', error)
    throw error
  }
}

export async function deleteEquipo(id: number): Promise<void> {
  try {
    const response = await basicAuthenticatedFetch(`/equipos/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting equipo:', error)
    throw error
  }
}