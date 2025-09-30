export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  createdAt: string
  avatar?: string
}

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    name: "Ana García",
    email: "ana.garcia@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
    avatar: "/diverse-woman-portrait.png",
  },
  {
    id: "2",
    name: "Carlos López",
    email: "carlos.lopez@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-02-20",
    avatar: "/thoughtful-man.png",
  },
  {
    id: "3",
    name: "María Rodríguez",
    email: "maria.rodriguez@example.com",
    role: "user",
    status: "inactive",
    createdAt: "2024-03-10",
    avatar: "/woman-2.jpg",
  },
  {
    id: "4",
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-03-25",
    avatar: "/man-2.jpg",
  },
]

// CRUD operations
export async function getUsers(): Promise<User[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [...mockUsers]
}

export async function getUserById(id: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockUsers.find((user) => user.id === id) || null
}

export async function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split("T")[0],
  }

  mockUsers.push(newUser)
  return newUser
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const userIndex = mockUsers.findIndex((user) => user.id === id)
  if (userIndex === -1) return null

  mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData }
  return mockUsers[userIndex]
}

export async function deleteUser(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const userIndex = mockUsers.findIndex((user) => user.id === id)
  if (userIndex === -1) return false

  mockUsers.splice(userIndex, 1)
  return true
}
