import { basicAuthenticatedFetch } from "./auth"

// Tipos para el CRUD de usuarios
export interface CreateUserDto {
  name: string
  email: string
  role: "admin" | "user"
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  id: string
}

// API functions para usuarios
export async function getUsers() {
  const response = await basicAuthenticatedFetch("/users")
  if (!response.ok) throw new Error("Error fetching users (Basic Auth)")
  return response.json()
}

export async function createUser(userData: CreateUserDto) {
  const response = await basicAuthenticatedFetch("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  })
  if (!response.ok) throw new Error("Error creating user")
  return response.json()
}

export async function updateUser(userData: UpdateUserDto) {
  const response = await basicAuthenticatedFetch(`/users/${userData.id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  })
  if (!response.ok) throw new Error("Error updating user")
  return response.json()
}

export async function deleteUser(id: string) {
  const response = await basicAuthenticatedFetch(`/users/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Error deleting user")
  return response.json()
}

// API functions para dashboard stats
export async function getDashboardStats() {
  const response = await basicAuthenticatedFetch("/registro-base-ti/dashboard/stats")
  if (!response.ok) throw new Error("Error fetching dashboard stats")
  return response.json()
}

export async function getLisMasUsados() {
  const response = await basicAuthenticatedFetch("/registro-base-ti/dashboard/lis-mas-usados")
  if (!response.ok) throw new Error("Error fetching LIS más usados")
  return response.json()
}

export async function getLisPorRegiones() {
  const response = await basicAuthenticatedFetch("/registro-base-ti/dashboard/lis-por-regiones")
  if (!response.ok) throw new Error("Error fetching LIS por regiones")
  return response.json()
}

// CRUD RegistroBaseTI
export interface RegistroBaseTIDto {
  registro_base_id?: number;
  version: string;
  equipo: string;
  status: boolean;
  lis_id: number; // ID del LIS
  licencia_id: number; // ID del tipo de licencia
  modalidad_id: number; // ID de la modalidad
  provincia_id: number; // ID de la provincia
  responsable_id: number; // ID del responsable
  numero_proyecto: string; // Número del proyecto
  numero_licencia: string; // Número de licencia
  fecha_implentacion?: string | null; // Opcional, se envía solo si implementado = true
  codigo_centro?: string; // Nuevo campo agregado en backend
  implementado?: boolean; // Campo para estado de implementación
  // Compatibilidad: nombre de cliente antiguo
  name_cliente?: string;
  // Nuevo/actual: enviar hospital_id y area_medica_id (IDs únicos)
  hospital_id?: number;
  area_medica_id?: number;
}

// Interfaces para las entidades relacionadas
export interface AreaMedica {
  area_medica_id: number;
  area_medica_nombre: string;
}

export interface Hospital {
  hospital_id: number;
  hospital_nombre: string;
}

export interface Lis {
  lis_id: number;
  lis_nombre: string;
}

export interface Modalidad {
  modalidad_id: number;
  modalidad_nombre: string;
}

export interface Provincia {
  provincia_id: number;
  provincia_nombre: string;
}

export interface TipoLicencia {
  licencia_id: number;
  tipo_licencia: string;
}

export interface Responsable {
  responsable_id: number;
  nombre: string;
}

// Estructura que puede venir del backend para RegistroBaseTI completo
export interface RegistroBaseTI {
  registro_base_id: number;
  // Mantener name_cliente por compatibilidad, pero el nuevo campo es 'hospitales'
  name_cliente?: string;
  lis?: Lis;
  provincia?: Provincia;
  responsable?: Responsable;
  numero_proyecto?: string;
  numero_licencia?: string;
  codigo_centro?: string;
  fecha_implentacion?: string | null;
  implementado?: boolean;
  // Getter dual que el backend puede exponer
  fecha_display?: string;
}

// Interfaces para Dashboard Analytics
export interface DashboardStats {
  total_registros: number;
  implementados: number;
  pendientes: number;
}

export interface LisMasUsado {
  nombre: string;
  cantidad: number;
  porcentaje: number; // Added to match backend response
}

export interface LisPorRegion {
  region: string;
  lis: {
    nombre: string;
    cantidad: number;
  }[];
  total: number;
}

// Nuevo tipo para la respuesta solicitada: LIS por Hospitales
export interface LisPorHospitalItem {
  hospital: string;
  total: number;
  lis: {
    nombre: string;
    cantidad: number;
  }[];
}

export async function getLisPorHospitales() {
  const response = await basicAuthenticatedFetch('/registro-base-ti/dashboard/hospitales-por-lis')
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('Error fetching LIS por hospitales', response.status, response.statusText, text)
    throw new Error(`Error fetching LIS por hospitales: ${response.status} ${response.statusText} - ${text}`)
  }
  return response.json() as Promise<LisPorHospitalItem[]>
}

export async function getRegistroBaseTI() {
  const response = await basicAuthenticatedFetch("/registro-base-ti");
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error detalle:", response.status, errorText);
    throw new Error("Error al obtener registros base TI");
  }
  return response.json();
}

export async function getRegistroBaseTIById(id: number) {
  const response = await basicAuthenticatedFetch(`/registro-base-ti/${id}`);
  if (!response.ok) throw new Error("Error al obtener el registro base TI");
  return response.json();
}

export async function createRegistroBaseTI(data: RegistroBaseTIDto) {
  const response = await basicAuthenticatedFetch("/registro-base-ti", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al crear registro base TI");
  return response.json();
}

export async function updateRegistroBaseTI(id: number, data: RegistroBaseTIDto) {
  const response = await basicAuthenticatedFetch(`/registro-base-ti/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al actualizar registro base TI");
  return response.json();
}

export async function deleteRegistroBaseTI(id: number) {
  const response = await basicAuthenticatedFetch(`/registro-base-ti/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar registro base TI");
  return response.json();
}

// Funciones para obtener datos de entidades relacionadas
export async function getAreasMedicas() {
  const response = await basicAuthenticatedFetch("/area-medica");
  if (!response.ok) throw new Error("Error al obtener áreas médicas");
  return response.json();
}

export async function getLis() {
  const response = await basicAuthenticatedFetch("/lis");
  if (!response.ok) throw new Error("Error al obtener LIS");
  return response.json();
}

export async function getHospitales() {
  // Asumo endpoint plural /hospitales. Si el backend usa otro path, actualizar aquí.
  const response = await basicAuthenticatedFetch("/hospitales");
  if (!response.ok) throw new Error("Error al obtener hospitales");
  return response.json();
}

export async function getModalidades() {
  const response = await basicAuthenticatedFetch("/modalidad");
  if (!response.ok) throw new Error("Error al obtener modalidades");
  return response.json();
}

export async function getProvincias() {
  const response = await basicAuthenticatedFetch("/provincia");
  if (!response.ok) throw new Error("Error al obtener provincias");
  return response.json();
}

export async function getTiposLicencia() {
  const response = await basicAuthenticatedFetch("/tipo-licencia");
  if (!response.ok) throw new Error("Error al obtener tipos de licencia");
  return response.json();
}

export async function getResponsables() {
  const response = await basicAuthenticatedFetch("/responsable");
  if (!response.ok) throw new Error("Error al obtener responsables");
  return response.json();
}

// Buscar registros por LIS y lista de módulos en el servidor
export async function searchRegistroByLisAndModulos(lis_id: number, modulo_ids: number[]) {
  const response = await basicAuthenticatedFetch(`/registro-base-ti/search`, {
    method: 'POST',
    body: JSON.stringify({ lis_id, modulo_ids }),
  })
  if (!response.ok) {
    const text = await response.text()
    console.error('Error searchRegistroByLisAndModulos', response.status, text)
    throw new Error('Error al buscar registros por LIS y módulos')
  }
  return response.json()
}

// Módulos: se pueden filtrar por lis y área médica
export interface Modulo {
  modulo_id: number;
  nombre: string;
  lis?: Lis;
  area_medica?: AreaMedica;
}

export async function getModulos(lis_id?: number) {
  // If a lis_id is provided the backend exposes a dedicated endpoint
  // that returns modules for that LIS (and an empty array when none).
  // Use /lis/{id}/modulos when lis_id is given; otherwise fall back to /modulos
  const url = lis_id ? `/lis/${lis_id}/modulos` : `/modulos`
  const response = await basicAuthenticatedFetch(url)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('Error al obtener módulos', response.status, response.statusText, text)
    throw new Error('Error al obtener módulos')
  }
  return response.json()
}

export async function getModulosForRegistro(registro_base_id: number) {
  const response = await basicAuthenticatedFetch(`/registro-base-ti/${registro_base_id}/modulos`)
  if (!response.ok) throw new Error('Error al obtener módulos del registro')
  return response.json()
}

export async function assignModulosToRegistro(registro_base_id: number, modulo_ids: number[]) {
  // Try POST first (controller supports POST), fallback to PUT if server responds 404
  const url = `/registro-base-ti/${registro_base_id}/modulos`
  // attempt POST
  let response = await basicAuthenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify({ modulo_ids })
  })

  if (!response.ok && response.status === 404) {
    // fallback to PUT for clients that use PUT
    response = await basicAuthenticatedFetch(url, {
      method: 'PUT',
      body: JSON.stringify({ modulo_ids })
    })
  }

  if (!response.ok) {
    const text = await response.text()
    console.error('assignModulos error', response.status, text)
    throw new Error('Error al asignar módulos')
  }

  return response.json()
}

export async function getRegistroBaseTIWithModulos() {
  const response = await basicAuthenticatedFetch('/registro-base-ti/with-modulos')
  if (!response.ok) {
    const text = await response.text()
    console.error('Error getRegistroBaseTIWithModulos', response.status, text)
    throw new Error('Error al obtener registros con módulos')
  }
  return response.json()
}
