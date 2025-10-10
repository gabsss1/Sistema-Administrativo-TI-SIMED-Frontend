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

// Estadísticas de guardias por responsable (estructura del backend)
export interface ResponsableMasActivo {
  nombre: string
  cantidad: number
}

export interface ResumenGuardias {
  total_guardias: number
  asignadas: number
  completadas: number
  canceladas: number
}

export interface EstadisticasBackend {
  resumen: ResumenGuardias
  responsables_mas_activos: ResponsableMasActivo[]
}

// Estructura adaptada para el componente
export interface EstadisticasResponsable {
  responsable_id?: number
  nombre: string
  total_guardias: number
  guardias_completadas?: number
  guardias_asignadas?: number
  guardias_canceladas?: number
}

export interface EstadisticasPorMes {
  year: number
  month: number
  responsables: EstadisticasResponsable[]
  resumen?: ResumenGuardias
}

export async function getEstadisticasGuardiasPorMes(year: number, month: number): Promise<EstadisticasPorMes> {
  try {
    const response = await basicAuthenticatedFetch(`/guardia/estadisticas?year=${year}&month=${month}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('⚠️ Endpoint de estadísticas no implementado aún en el backend');
        return { year, month, responsables: [] };
      }
      console.error('❌ Error obteniendo estadísticas de guardias:', response.status, response.statusText);
      throw new Error(`Error obteniendo estadísticas: ${response.status} ${response.statusText}`);
    }
    
    const data: EstadisticasBackend = await response.json();
    console.log('📊 Estadísticas de guardias obtenidas:', data);
    
    // Validar estructura de respuesta
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ Respuesta de estadísticas tiene formato inválido');
      return { year, month, responsables: [] };
    }
    
    console.log('🔍 Datos recibidos del backend:', JSON.stringify(data, null, 2));
    
    // Adaptar la estructura del backend a nuestro formato
    const responsablesAdaptados: EstadisticasResponsable[] = data.responsables_mas_activos?.map((resp) => ({
      nombre: resp.nombre,
      total_guardias: resp.cantidad,
      // Por ahora no tenemos desglose detallado por estado desde el backend
      guardias_asignadas: 0,
      guardias_completadas: 0,
      guardias_canceladas: 0,
    })) || [];
    
    const resultado = {
      year,
      month,
      responsables: responsablesAdaptados,
      resumen: data.resumen || {
        total_guardias: 0,
        asignadas: 0,
        completadas: 0,
        canceladas: 0
      }
    };
    
    console.log('📋 Datos adaptados para el componente:', JSON.stringify(resultado, null, 2));
    
    return resultado;
  } catch (error) {
    console.error('❌ Error en getEstadisticasGuardiasPorMes:', error);
    // Devolver estructura vacía en lugar de lanzar error
    return { year, month, responsables: [] };
  }
}