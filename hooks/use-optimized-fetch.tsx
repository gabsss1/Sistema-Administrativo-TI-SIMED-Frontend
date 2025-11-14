"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

// Cache simple en memoria
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export function useOptimizedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      setLoading(true)
      setError(null)

      // Verificar caché
      const cached = cache.get(key) as CacheEntry<T> | undefined
      const now = Date.now()
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setData(cached.data)
        setLoading(false)
        return
      }

      // Fetch datos
      const result = await fetchFn()
      
      // Verificar si no se canceló
      if (!abortController.signal.aborted) {
        // Guardar en caché
        cache.set(key, { data: result, timestamp: now })
        setData(result)
      }
    } catch (err: any) {
      if (!abortController.signal.aborted) {
        setError(err.message || 'Error al cargar datos')
        console.error(`Error fetching ${key}:`, err)
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [key, fetchFn, ...dependencies])

  useEffect(() => {
    fetchData()

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  // Función para invalidar caché
  const invalidateCache = useCallback(() => {
    cache.delete(key)
    fetchData()
  }, [key, fetchData])

  // Función para refrescar datos
  const refetch = useCallback(() => {
    cache.delete(key)
    fetchData()
  }, [key, fetchData])

  return { 
    data, 
    loading, 
    error, 
    refetch, 
    invalidateCache 
  }
}

// Hook específico para listas con paginación
export function useOptimizedList<T>(
  key: string,
  fetchFn: (search?: string) => Promise<T[]>,
  searchTerm: string = '',
  debounceMs: number = 300
) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, debounceMs)
    
    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  const cacheKey = `${key}:${debouncedSearch}`
  const fetchData = useCallback(() => fetchFn(debouncedSearch || undefined), [fetchFn, debouncedSearch])
  
  return useOptimizedFetch(cacheKey, fetchData, [debouncedSearch])
}