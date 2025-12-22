import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas públicas que no requieren autenticación
const publicPaths = ['/login']

// Función para verificar si el token JWT ha expirado
function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return true
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)
    
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar si la ruta es pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // Obtener el token de las cookies
  const token = request.cookies.get('auth-token')?.value
  
  // Si es una ruta pública, permitir acceso
  if (isPublicPath) {
    // Si ya está autenticado con token válido y trata de ir a login, redirigir a dashboard
    if (token && !isTokenExpired(token) && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }
  
  // Si no hay token o el token está expirado, redirigir a login
  if (!token || isTokenExpired(token)) {
    console.log('🔒 Token inválido o expirado - redirigiendo a login')
    const loginUrl = new URL('/login', request.url)
    
    // Crear respuesta con redirección
    const response = NextResponse.redirect(loginUrl)
    
    // Limpiar la cookie si el token está expirado
    if (token && isTokenExpired(token)) {
      response.cookies.set('auth-token', '', { 
        path: '/', 
        expires: new Date(0) 
      })
    }
    
    return response
  }
  
  return NextResponse.next()
}

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logos).*)',
  ],
}
