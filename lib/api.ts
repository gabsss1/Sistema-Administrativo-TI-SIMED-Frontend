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
  const response = await basicAuthenticatedFetch("/dashboard/stats")
  if (!response.ok) throw new Error("Error fetching dashboard stats")
  return response.json()
}

// CRUD RegistroBaseTI
export interface RegistroBaseTIDto {
  registro_base_id?: number;
  name_cliente: string;
  version: string;
  area_medica: any;
  equipo: string;
  status: boolean;
  lis: any;
  tipo_licencia: any;
  modalidad: any;
  provincia: any;
  fecha_implentacion: string;
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
