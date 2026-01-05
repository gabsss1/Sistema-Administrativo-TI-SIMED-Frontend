"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { type AuthState, signIn as authSignIn, signOut as authSignOut, getStoredUser, storeUser, getAuthToken, clearExpiredToken } from "@/lib/auth"

interface AuthContextType extends AuthState {
  signIn: (usuario: string, contrasena: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Limpiar tokens expirados primero
    clearExpiredToken()
    
    // Verificar si hay un token válido guardado
    const token = getAuthToken()
    const storedUser = getStoredUser()

    if (token && storedUser) {
      // Si el usuario no tiene nombre/apellido, obtenerlos del servidor
      if (!storedUser.nombre || !storedUser.apellido) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.16.12.219:3001"
        fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(res => res.ok ? res.json() : null)
          .then(profileData => {
            if (profileData && profileData.nombre && profileData.apellido) {
              const updatedUser = {
                ...storedUser,
                nombre: profileData.nombre,
                apellido: profileData.apellido,
                name: `${profileData.nombre} ${profileData.apellido}`,
              }
              storeUser(updatedUser)
              setState({
                user: updatedUser,
                isLoading: false,
                isAuthenticated: true,
              })
            } else {
              setState({
                user: storedUser,
                isLoading: false,
                isAuthenticated: true,
              })
            }
          })
          .catch(() => {
            setState({
              user: storedUser,
              isLoading: false,
              isAuthenticated: true,
            })
          })
      } else {
        setState({
          user: storedUser,
          isLoading: false,
          isAuthenticated: true,
        })
      }
    } else {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      
      // Si no está en la página de login, redirigir
      if (pathname !== "/login") {
        console.log('🔒 Sin token válido - redirigiendo a login')
        router.push("/login")
      }
    }
  }, [pathname, router])

  const signIn = async (usuario: string, contrasena: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const user = await authSignIn(usuario, contrasena)

      if (user) {
        storeUser(user)
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
        router.push("/dashboard")
        return true
      } else {
        setState((prev) => ({ ...prev, isLoading: false }))
        return false
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const signOut = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      await authSignOut()
      storeUser(null)
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      router.push("/login")
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  return <AuthContext.Provider value={{ ...state, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
