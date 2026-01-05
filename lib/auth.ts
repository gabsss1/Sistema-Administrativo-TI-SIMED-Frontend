// NestJS backend URL - cambiar según tu configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.16.12.219:3001"

// Función para obtener el token JWT del localStorage
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  
  const token = localStorage.getItem("auth-token")
  
  // Verificar si el token existe y si ha expirado
  if (token && isTokenExpired(token)) {
    console.log('🕐 Token expirado - limpiando sesión')
    localStorage.removeItem("auth-token")
    localStorage.removeItem("auth-user")
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    return null
  }
  
  return token
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
  nombre: string
  apellido: string
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

// Función para verificar si el token JWT ha expirado
export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJwt(token)
    if (!payload || !payload.exp) {
      return true
    }
    
    // exp está en segundos, Date.now() está en milisegundos
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.error("Error checking token expiration:", error)
    return true
  }
}

// Función para limpiar tokens expirados
export function clearExpiredToken(): void {
  if (typeof window === "undefined") return
  
  const token = getAuthToken()
  if (token && isTokenExpired(token)) {
    console.log('🕐 Token expirado detectado - limpiando sesión')
    localStorage.removeItem("auth-token")
    localStorage.removeItem("auth-user")
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
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
    
    console.log('🔍 JWT Payload completo:', payload)
    
    if (!payload) {
      throw new Error("Invalid token")
    }

    // Guardar el token JWT en localStorage y cookie
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-token", data.access_token)
      // Guardar en cookie para el middleware
      document.cookie = `auth-token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    }

    // Crear objeto de usuario desde el JWT payload
    let user: User = {
      id: payload.sub.toString(),
      usuario: payload.usuario,
      name: payload.nombre && payload.apellido ? `${payload.nombre} ${payload.apellido}` : payload.usuario,
      nombre: payload.nombre || '',
      apellido: payload.apellido || '',
      role: payload.rol,
    }
    
    // Si el JWT no incluye nombre/apellido, obtenerlos del endpoint de perfil
    if (!payload.nombre || !payload.apellido) {
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        })
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          console.log('📝 Datos de perfil obtenidos:', profileData)
          
          user = {
            ...user,
            nombre: profileData.nombre || '',
            apellido: profileData.apellido || '',
            name: profileData.nombre && profileData.apellido 
              ? `${profileData.nombre} ${profileData.apellido}` 
              : payload.usuario,
          }
        }
      } catch (error) {
        console.log('⚠️ No se pudo obtener el perfil completo')
      }
    }
    
    console.log('👤 User object final:', user)

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

// Función para obtener el usuario desde el token actual
export async function getUserFromToken(): Promise<User | null> {
  try {
    const token = getAuthToken()
    if (!token) return null
    
    const payload = parseJwt(token)
    if (!payload) return null
    
    // Crear objeto de usuario desde el JWT payload
    const user: User = {
      id: payload.sub.toString(),
      usuario: payload.usuario,
      name: payload.nombre && payload.apellido ? `${payload.nombre} ${payload.apellido}` : payload.usuario,
      nombre: payload.nombre || '',
      apellido: payload.apellido || '',
      role: payload.rol,
    }
    
    return user
  } catch (error) {
    console.error("Error obteniendo usuario del token:", error)
    return null
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
