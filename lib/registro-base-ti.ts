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
  name_cliente: string;
  version: string;
  // area_medica_id: number; // Eliminado, solo se usa area_medica_ids
  area_medica_ids?: number[]; // Agregado para permitir múltiples IDs de área médica
  equipo: string;
  status: boolean;
  lis_id: number; // ID del LIS
  licencia_id: number; // ID del tipo de licencia
  modalidad_id: number; // ID de la modalidad
  provincia_id: number; // ID de la provincia
  fecha_implentacion?: string; // Opcional, se envía solo si implementado = true
  implementado?: boolean; // Campo para estado de implementación
}

// Interfaces para las entidades relacionadas
export interface AreaMedica {
  area_medica_id: number;
  area_medica_nombre: string;
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
