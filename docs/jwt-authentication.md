# Autenticación JWT - Sistema Administrativo TI SIMED

## Resumen de Cambios

Se ha implementado un sistema completo de autenticación basado en JWT (JSON Web Tokens) para proteger todas las rutas de la aplicación. Se eliminó el sistema anterior de Basic Auth y se integró con el backend NestJS que ya tiene implementado JWT con bcrypt.

## Características Implementadas

### 1. **Sistema de Autenticación JWT**
- Login con usuario y contraseña
- Almacenamiento seguro del token JWT en localStorage y cookies
- Validación automática del token en cada petición
- Cierre de sesión automático cuando el token expira (401)

### 2. **Protección de Rutas**
- Middleware de Next.js que protege todas las rutas
- Redirección automática a `/login` si no hay token válido
- Redirección a `/dashboard` después del login exitoso
- Prevención de acceso a `/login` si ya está autenticado

### 3. **Integración con Backend**
- Endpoints utilizados:
  - `POST /auth/login` - Inicio de sesión
  - `POST /auth/register` - Registro de usuarios (si es necesario)
- Todas las peticiones ahora incluyen el header `Authorization: Bearer {token}`

## Archivos Modificados

### Core de Autenticación
1. **`lib/auth.ts`**
   - Funciones `signIn()` y `signOut()` actualizadas para JWT
   - `authenticatedFetch()` - Reemplaza a `basicAuthenticatedFetch()`
   - `authenticatedFetchRaw()` - Para peticiones con FormData
   - Manejo automático de tokens en cookies y localStorage
   - Redirección automática en errores 401

2. **`hooks/use-auth.tsx`**
   - Context de autenticación actualizado
   - Verificación de token al iniciar la app
   - Manejo de estado de autenticación
   - Funciones de login/logout

3. **`middleware.ts`** (NUEVO)
   - Protege todas las rutas excepto `/login`
   - Verifica el token en cookies
   - Redirige a login si no hay autenticación

### Componentes de UI
4. **`components/login-form.tsx`**
   - Campos actualizados: `usuario` y `contraseña` (en lugar de email/password)
   - Iconos actualizados (User en lugar de Mail)
   - Mensajes de error mejorados

5. **`components/admin-layout.tsx`**
   - Verificación de autenticación antes de renderizar
   - Compatibilidad con el middleware

6. **`components/admin-sidebar.tsx`**
   - Sección de usuario al final del sidebar
   - Botón de cerrar sesión
   - Muestra nombre de usuario y rol

### Servicios Actualizados
Todos los archivos en `lib/` ahora usan `authenticatedFetch` en lugar de `basicAuthenticatedFetch`:
- `lib/anydesk.ts`
- `lib/equipos.ts`
- `lib/guardias.ts`
- `lib/planning.ts`
- `lib/registro-base-ti.ts`
- `lib/registro-base-ti-pdf.ts`

## Flujo de Autenticación

### Login
1. Usuario ingresa credenciales en `/login`
2. Se envía POST a `/auth/login` con `{usuario, contrasena}`
3. Backend valida y retorna `{access_token, usuario: {...}}`
4. Token se guarda en localStorage y cookie
5. Redirección a `/dashboard`

### Validación de Rutas
1. Usuario intenta acceder a cualquier ruta
2. Middleware verifica si existe token en cookies
3. Si no hay token → redirige a `/login`
4. Si hay token → permite acceso

### Peticiones API
1. Cada petición incluye `Authorization: Bearer {token}`
2. Si recibe 401 → token inválido/expirado
3. Se limpia localStorage y cookies
4. Redirección automática a `/login`

### Logout
1. Usuario hace clic en "Cerrar Sesión"
2. Se eliminan token y datos de usuario
3. Se limpia la cookie
4. Redirección a `/login`

## Estructura del Token JWT

El backend retorna un objeto con esta estructura:

```typescript
{
  access_token: string,
  usuario: {
    usuario_id: number,
    usuario: string,
    rol: string
  }
}
```

## Configuración Necesaria

### Variables de Entorno
Asegúrate de tener en tu `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://172.16.12.219:3001
```

### Backend (NestJS)
El backend debe tener implementado:
- JwtStrategy con PassportJS
- JwtAuthGuard para proteger endpoints
- Variables de entorno `JWT_SECRET`
- Endpoints de auth funcionando

## Seguridad

### Implementado
✅ Tokens JWT en lugar de Basic Auth  
✅ Almacenamiento en localStorage y cookies  
✅ Middleware de protección de rutas  
✅ Validación automática de tokens  
✅ Cierre de sesión en tokens expirados  
✅ SameSite=Lax en cookies  

### Recomendaciones Futuras
- 🔄 Implementar refresh tokens
- 🔄 Agregar tiempo de expiración visible para el usuario
- 🔄 Implementar verificación de rol/permisos en frontend
- 🔄 Agregar HTTPS en producción
- 🔄 Implementar rate limiting en login

## Testing

### Probar el Sistema
1. Iniciar el backend NestJS
2. Crear un usuario de prueba con `/auth/register`
3. Intentar acceder a `http://172.16.12.219:3001/anydesk` sin login → debe redirigir a `/login`
4. Hacer login con credenciales válidas
5. Verificar redirección a `/dashboard`
6. Navegar por las rutas protegidas
7. Hacer logout y verificar redirección a `/login`

### Verificar Tokens
Abrir DevTools → Application → Storage:
- **LocalStorage**: debe tener `auth-token` y `auth-user`
- **Cookies**: debe tener `auth-token`

### Verificar Peticiones
Abrir DevTools → Network:
- Todas las peticiones API deben tener header `Authorization: Bearer ...`
- Login exitoso debe retornar 200 con token
- Peticiones sin token deben retornar 401

## Troubleshooting

### "No puedo iniciar sesión"
- Verificar que el backend esté corriendo
- Verificar credenciales en la base de datos
- Revisar logs del backend
- Verificar `NEXT_PUBLIC_API_URL`

### "Sigo viendo la página de login"
- Verificar que el login retorne un token válido
- Abrir DevTools y verificar que el token se guardó
- Verificar que no haya errores en consola

### "Me redirige a login constantemente"
- El token puede estar expirado
- Verificar que el middleware no esté bloqueando la cookie
- Verificar configuración de SameSite en cookies

### "Error 401 en todas las peticiones"
- Token inválido o expirado
- Verificar que `JWT_SECRET` coincida entre frontend y backend
- Hacer logout y volver a hacer login

## Soporte para Roles

El sistema ya almacena el rol del usuario. Para implementar protección por roles:

```typescript
// En el componente o página
const { user } = useAuth()

if (user?.role !== 'admin') {
  return <div>No tienes permisos</div>
}
```

O usar el `RolesGuard` que ya existe en el backend para proteger endpoints específicos.
