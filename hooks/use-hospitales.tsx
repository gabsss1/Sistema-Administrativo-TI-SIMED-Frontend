"use client"

import { useState, useEffect } from 'react'
import { basicAuthenticatedFetch } from '@/lib/auth'
import { useOptimizedFetch } from './use-optimized-fetch'

interface Hospital {
  hospital_id: number
  hospital_nombre: string
}

async function fetchHospitales(): Promise<Hospital[]> {
  const response = await basicAuthenticatedFetch('/hospitales')
  if (!response.ok) throw new Error('Error al cargar hospitales')
  return response.json()
}

export function useHospitales() {
  const { data, loading, error } = useOptimizedFetch('hospitales', fetchHospitales)
  
  return { 
    hospitales: data || [], 
    loading, 
    error 
  }
}