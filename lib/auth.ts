// Fetch con autenticación Basic Auth para APIs protegidas por usuario/contraseña
export async function basicAuthenticatedFetch(url: string, options: RequestInit = {}) {
  const user = process.env.NEXT_PUBLIC_API_USER;
  const pass = process.env.NEXT_PUBLIC_API_PASS;
  const basic = typeof window === "undefined"
    ? Buffer.from(`${user}:${pass}`).toString("base64")
    : btoa(`${user}:${pass}`);

  const fullUrl = `${API_BASE_URL}${url}`;
  console.log('🔗 Petición:', fullUrl);

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basic}`,
      ...options.headers,
    },
  });

  console.log('📊 Status:', response.status, response.statusText);
  
  return response;
}

// Variant that does not force a Content-Type header (useful for FormData uploads)
export async function basicAuthenticatedFetchRaw(url: string, options: RequestInit = {}) {
  const user = process.env.NEXT_PUBLIC_API_USER;
  const pass = process.env.NEXT_PUBLIC_API_PASS;
  const basic = typeof window === "undefined"
    ? Buffer.from(`${user}:${pass}`).toString("base64")
    : btoa(`${user}:${pass}`);

  const fullUrl = `${API_BASE_URL}${url}`;
  console.log('🔗 Petición RAW:', fullUrl);

  const mergedHeaders: Record<string, string> = {
    Authorization: `Basic ${basic}`,
    ...((options && options.headers) as Record<string, string> || {}),
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers: mergedHeaders,
  });

  console.log('📊 Status RAW:', response.status, response.statusText);

  return response;
}
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginResponse {
  access_token: string
  user: User
}

// NestJS backend URL - cambiar según tu configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Invalid credentials")
    }

    const data: LoginResponse = await response.json()

    // Guardar el token JWT
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-token", data.access_token)
    }

    return data.user
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

export async function signOut(): Promise<void> {
  // Remover token del localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("auth-user")
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("auth-user")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function storeUser(user: User | null): void {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem("auth-user", JSON.stringify(user))
  } else {
    localStorage.removeItem("auth-user")
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth-token")
}

// Función para hacer peticiones autenticadas al backend
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken()

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })
}
