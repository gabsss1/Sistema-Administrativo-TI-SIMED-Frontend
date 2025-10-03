"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, TrendingUp, Settings, Database } from "lucide-react"
import { 
  getDashboardStats, 
  getLis, 
  getLisMasUsados, 
  getLisPorRegiones,
  type DashboardStats,
  type LisMasUsado,
  type LisPorRegion
} from "@/lib/registro-base-ti"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lisCount, setLisCount] = useState<number>(0)
  const [lisMasUsados, setLisMasUsados] = useState<LisMasUsado[]>([])
  const [lisPorRegiones, setLisPorRegiones] = useState<LisPorRegion[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      // Cargar todas las estadísticas en paralelo
      const [dashboardStats, lisData, lisMasUsadosData, lisPorRegionesData] = await Promise.all([
        getDashboardStats(),
        getLis(),
        getLisMasUsados(),
        getLisPorRegiones()
      ])

      setStats(dashboardStats)
      setLisCount(lisData.length || 0)
      setLisMasUsados(lisMasUsadosData)
      setLisPorRegiones(lisPorRegionesData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema administrativo</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.total_registros || 0}
            </div>
            <p className="text-xs text-muted-foreground">Registros en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.implementados || 0}
            </div>
            <p className="text-xs text-muted-foreground">Sistemas implementados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistemas LIS</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : lisCount}
            </div>
            <p className="text-xs text-muted-foreground">LIS registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.pendientes || 0}
            </div>
            <p className="text-xs text-muted-foreground">Por implementar</p>
          </CardContent>
        </Card>

      </div>

      {/* Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>LIS Más Usados</CardTitle>
            <CardDescription>Sistemas más implementados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : lisMasUsados.length > 0 ? (
                lisMasUsados.slice(0, 5).map((lis, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-chart-1' : 
                        index === 1 ? 'bg-chart-2' : 
                        index === 2 ? 'bg-chart-3' : 
                        index === 3 ? 'bg-chart-4' : 'bg-chart-5'
                      }`}></div>
                      <span className="text-sm font-medium">{lis.nombre}</span>
                    </div>
                    <span className="text-sm font-bold">{lis.cantidad}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LIS por Regiones</CardTitle>
            <CardDescription>Distribución de sistemas por provincias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : lisPorRegiones.length > 0 ? (
                lisPorRegiones.map((region, index) => (
                  <div key={index} className="border-l-2 border-chart-1 pl-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{region.region}</span>
                      <span className="text-sm font-bold text-chart-1">{region.total}</span>
                    </div>
                    <div className="space-y-1">
                      {region.lis.slice(0, 3).map((lis, lisIndex) => (
                        <div key={lisIndex} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>• {lis.nombre}</span>
                          <span>{lis.cantidad}</span>
                        </div>
                      ))}
                      {region.lis.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{region.lis.length - 3} más...
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
