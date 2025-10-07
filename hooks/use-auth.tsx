"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { type AuthState, signIn as authSignIn, signOut as authSignOut, getStoredUser, storeUser } from "@/lib/auth"

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Always authenticate without login - simplified for internal use
    const defaultUser = {
      id: "1",
      email: "admin@simed.com",
      name: "Administrador SIMED",
      role: "admin" as const,
    }
    
    setState({
      user: defaultUser,
      isLoading: false,
      isAuthenticated: true,
    })
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const user = await authSignIn(email, password)

      if (user) {
        storeUser(user)
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
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
