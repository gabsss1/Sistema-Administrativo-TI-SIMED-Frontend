import { basicAuthenticatedFetch } from "./auth"

// Interfaces para Guardias
export interface Guardia {
  guardia_id?: number
  fecha: string
  fecha_inicio?: string // Opcional, se calcula en frontend
  fecha_fin?: string    // Opcional, se calcula en frontend
  estado: "asignada" | "completada" | "cancelada"
  observaciones?: string | null
  responsable_id?: number // Opcional porque viene dentro del objeto responsable
  responsable?: {
    responsable_id: number
    nombre: string
  }
  created_at?: string
  updated_at?: string
}

export interface CreateGuardiaDto {
  fecha: string
  fecha_inicio: string
  fecha_fin: string
  estado?: "asignada" | "completada" | "cancelada"
  observaciones?: string
  responsable_id: number
}

export interface UpdateGuardiaDto extends Partial<CreateGuardiaDto> {}

// API Functions para Guardias
export async function getGuardias() {
  const response = await basicAuthenticatedFetch("/guardia")
  if (!response.ok) throw new Error("Error fetching guardias")
  return response.json()
}

export async function getGuardiasPorCalendario(year: number, month: number): Promise<Guardia[]> {
  try {
    const response = await basicAuthenticatedFetch(`/guardia/calendario?year=${year}&month=${month}`)
    
    if (!response.ok) {
      console.error('❌ Error HTTP:', response.status, response.statusText);
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('❌ Content-Type incorrecto:', contentType);
      throw new Error('Backend no devolvió JSON. Verifica que esté ejecutándose correctamente.');
    }
    
    const data = await response.json();
    console.log('✅ Guardias cargadas:', data.length, 'guardias encontradas');
    return data;
    
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ Error de conexión: Backend no disponible en http://172.16.12.73:3000');
      throw new Error('No se puede conectar al backend. Verifica que esté ejecutándose.');
    }
    throw error;
  }
}

export async function getGuardiasPorSemana(fechaInicio: string, fechaFin: string): Promise<Guardia[]> {
  const response = await basicAuthenticatedFetch(`/guardia/semana?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
  if (!response.ok) throw new Error("Error fetching guardias por semana")
  return response.json()
}

export async function createGuardia(guardiaData: CreateGuardiaDto) {
  const response = await basicAuthenticatedFetch("/guardia", {
    method: "POST",
    body: JSON.stringify(guardiaData),
  })
  if (!response.ok) throw new Error("Error creating guardia")
  return response.json()
}

export async function updateGuardia(id: number, guardiaData: UpdateGuardiaDto) {
  const response = await basicAuthenticatedFetch(`/guardia/${id}`, {
    method: "PUT",
    body: JSON.stringify(guardiaData),
  })
  if (!response.ok) throw new Error("Error updating guardia")
  return response.json()
}

export async function deleteGuardia(id: number) {
  const response = await basicAuthenticatedFetch(`/guardia/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Error deleting guardia")
  return response.json()
}

export async function getEstadisticasGuardias(year: number, month: number) {
  const response = await basicAuthenticatedFetch(`/guardia/estadisticas?year=${year}&month=${month}`)
  if (!response.ok) throw new Error("Error fetching estadisticas")
  return response.json()
}

export async function descargarExcelGuardias(year: number, month: number) {
  const response = await basicAuthenticatedFetch(`/guardia/excel?year=${year}&month=${month}`)
  if (!response.ok) throw new Error("Error generando Excel")
  
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `guardias-${month}-${year}.xlsx`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}