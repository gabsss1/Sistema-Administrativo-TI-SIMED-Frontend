"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, CheckCircle, Clock, XCircle, Calendar } from "lucide-react"
import { getEstadisticasGuardiasPorMes, type EstadisticasPorMes } from "@/lib/guardias"

export function DashboardGuardiasStats() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasPorMes | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const loadEstadisticas = async () => {
    try {
      setLoading(true)
      const data = await getEstadisticasGuardiasPorMes(year, month)
      console.log('🎯 Datos recibidos en el componente:', data);
      
      // Validar que la respuesta tenga la estructura esperada
      if (data && typeof data === 'object') {
        const estadisticasFormateadas = {
          year: data.year || year,
          month: data.month || month,
          responsables: Array.isArray(data.responsables) ? data.responsables : [],
          resumen: data.resumen || {
            total_guardias: 0,
            asignadas: 0,
            completadas: 0,
            canceladas: 0
          }
        };
        
        console.log('📊 Estableciendo estadísticas:', estadisticasFormateadas);
        setEstadisticas(estadisticasFormateadas);
      } else {
        setEstadisticas({ year, month, responsables: [] })
      }
    } catch (error) {
      console.error("Error loading guardias statistics:", error)
      // En caso de error, establecer estructura vacía pero válida
      setEstadisticas({ year, month, responsables: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEstadisticas()
  }, [year, month])

  const getColorByStatus = (status: 'completadas' | 'asignadas' | 'canceladas') => {
    switch (status) {
      case 'completadas':
        return 'text-green-600'
      case 'asignadas':
        return 'text-blue-600'
      case 'canceladas':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getIconByStatus = (status: 'completadas' | 'asignadas' | 'canceladas') => {
    switch (status) {
      case 'completadas':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'asignadas':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'canceladas':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estadísticas de Guardias
            </CardTitle>
            <CardDescription>Resumen de guardias por responsable</CardDescription>
          </div>
          
          {/* Selector de mes y año */}
          <div className="flex gap-2">
            <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption.toString()}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : !estadisticas || !estadisticas.responsables || estadisticas.responsables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos de guardias para {months[month - 1]} {year}</p>
          </div>
        ) : (
          (() => {
            // Debug: Mostrar datos en consola
            console.log('🔍 Renderizando con estadisticas:', estadisticas);
            console.log('📈 Resumen disponible:', estadisticas?.resumen);
            
            return (
              <div className="space-y-4">
                {/* Resumen general */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">Total Guardias</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {estadisticas.resumen?.total_guardias || 0}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Asignadas</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {estadisticas.resumen?.asignadas || 0}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Completadas</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {estadisticas.resumen?.completadas || 0}
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Canceladas</span>
                </div>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {estadisticas.resumen?.canceladas || 0}
                </p>
              </div>
            </div>

            {/* Responsables más activos */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Responsables Más Activos</h4>
              <div className="space-y-3">
                {estadisticas.responsables.map((responsable, index) => (
                  <div key={`${responsable.nombre}-${index}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                          <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                        </div>
                        <h5 className="font-medium text-gray-900">{responsable.nombre}</h5>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-gray-900">
                          {responsable?.total_guardias || 0}
                        </span>
                        <p className="text-xs text-gray-500">días de guardia</p>
                      </div>
                    </div>
                    
                    {/* Barra de progreso visual */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${estadisticas.resumen ? (responsable.total_guardias / estadisticas.resumen.total_guardias) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {estadisticas.resumen ? 
                          `${((responsable.total_guardias / estadisticas.resumen.total_guardias) * 100).toFixed(1)}% del total` 
                          : '0% del total'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
              </div>
            );
          })()
        )}
      </CardContent>
    </Card>
  )
}