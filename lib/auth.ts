// NestJS backend URL - cambiar según tu configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.16.12.219:3001"

// Función para obtener el token JWT del localStorage
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth-token")
}

// Función para hacer peticiones autenticadas al backend con JWT
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken()
  const fullUrl = `${API_BASE_URL}${url}`;
  console.log('🔗 Petición JWT:', fullUrl);

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  console.log('📊 Status:', response.status, response.statusText);
  
  // Si recibimos un 401, el token no es válido - cerrar sesión
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token")
      localStorage.removeItem("auth-user")
      window.location.href = "/login"
    }
  }
  
  return response;
}

// Variant that does not force a Content-Type header (useful for FormData uploads)
export async function authenticatedFetchRaw(url: string, options: RequestInit = {}) {
  const token = getAuthToken()
  const fullUrl = `${API_BASE_URL}${url}`;
  console.log('🔗 Petición RAW JWT:', fullUrl);

  const mergedHeaders: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...((options && options.headers) as Record<string, string> || {}),
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers: mergedHeaders,
  });

  console.log('📊 Status RAW:', response.status, response.statusText);

  // Si recibimos un 401, el token no es válido - cerrar sesión
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token")
      localStorage.removeItem("auth-user")
      window.location.href = "/login"
    }
  }

  return response;
}

// Interfaces
export interface User {
  id: string
  usuario: string
  name: string
  role: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginResponse {
  access_token: string
}

// Función para decodificar JWT (solo el payload)
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error parsing JWT:", error)
    return null
  }
}

// Función de login
export async function signIn(usuario: string, contrasena: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usuario, contrasena }),
    })

    if (!response.ok) {
      throw new Error("Invalid credentials")
    }

    const data: LoginResponse = await response.json()

    // Decodificar el JWT para obtener información del usuario
    const payload = parseJwt(data.access_token)
    
    if (!payload) {
      throw new Error("Invalid token")
    }

    // Guardar el token JWT en localStorage y cookie
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-token", data.access_token)
      // Guardar en cookie para el middleware
      document.cookie = `auth-token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    }

    // Crear objeto de usuario compatible desde el JWT payload
    // El payload tiene: { sub: usuario_id, usuario: "nombre", rol: "ADMIN" }
    const user: User = {
      id: payload.sub.toString(),
      usuario: payload.usuario,
      name: payload.usuario,
      role: payload.rol,
    }

    return user
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

// Función de logout
export async function signOut(): Promise<void> {
  // Remover token del localStorage y cookies
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("auth-user")
    // Eliminar cookie
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}

// Funciones de manejo de usuario en localStorage
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
