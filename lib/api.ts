import { authenticatedFetch } from "./auth"

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
  const response = await authenticatedFetch("/users")
  if (!response.ok) throw new Error("Error fetching users")
  return response.json()
}

export async function createUser(userData: CreateUserDto) {
  const response = await authenticatedFetch("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  })
  if (!response.ok) throw new Error("Error creating user")
  return response.json()
}

export async function updateUser(userData: UpdateUserDto) {
  const response = await authenticatedFetch(`/users/${userData.id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  })
  if (!response.ok) throw new Error("Error updating user")
  return response.json()
}

export async function deleteUser(id: string) {
  const response = await authenticatedFetch(`/users/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Error deleting user")
  return response.json()
}

// API functions para dashboard stats
export async function getDashboardStats() {
  const response = await authenticatedFetch("/dashboard/stats")
  if (!response.ok) throw new Error("Error fetching dashboard stats")
  return response.json()
}
