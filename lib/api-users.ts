const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  createdAt: string
  avatar?: string
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// CRUD operations para integración con NestJS
export async function getUsers(search?: string): Promise<User[]> {
  const queryParam = search ? `?search=${encodeURIComponent(search)}` : ""
  return apiRequest<User[]>(`/api/users${queryParam}`)
}

export async function getUserById(id: string): Promise<User> {
  return apiRequest<User>(`/api/users/${id}`)
}

export async function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  return apiRequest<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(userData),
  })
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  return apiRequest<User>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  })
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequest<void>(`/api/users/${id}`, {
    method: "DELETE",
  })
}
