"use client"

import { useState, useEffect, useCallback } from "react"
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
import PieChart from "@/components/pie-chart"
import DashboardModulosStats from '@/components/dashboard-modulos-stats'
import DashboardModulosPorHospitales from '@/components/dashboard-modulos-por-hospitales'
// Accordion removed: replaced by hospitals dashboard component
import { DashboardGuardiasStats } from "@/components/dashboard-guardias-stats"
import DashboardLisHospitales from '@/components/dashboard-lis-hospitales'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lisCount, setLisCount] = useState<number>(0)
  const [lisMasUsados, setLisMasUsados] = useState<LisMasUsado[]>([])
  const [selectedLisFilter, setSelectedLisFilter] = useState<{ nombre: string; cantidad: number } | null>(null)
  const [selectedModulo, setSelectedModulo] = useState<{ id: number; nombre: string; lis_id?: number | null } | null>(null)
  
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      // Cargar todas las estadísticas en paralelo
      const [dashboardStats, lisData, lisMasUsadosData] = await Promise.all([
        getDashboardStats(),
        getLis(),
        getLisMasUsados()
      ])

      setStats(dashboardStats)
      setLisCount(lisData.length || 0)
      setLisMasUsados(lisMasUsadosData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const router = useRouter()

  const goToRegistroBase = (params?: Record<string, string>) => {
    const base = '/registro-base-ti'
    if (!params || Object.keys(params).length === 0) {
      router.push(base)
      return
    }
    const qs = new URLSearchParams(params).toString()
    router.push(`${base}?${qs}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema administrativo</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div role="button" tabIndex={0} onClick={() => goToRegistroBase()} onKeyDown={(e) => e.key === 'Enter' && goToRegistroBase()}>
          <Card className="cursor-pointer hover:shadow">
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
        </div>

        <div role="button" tabIndex={0} onClick={() => goToRegistroBase({ implementado: 'true' })} onKeyDown={(e) => e.key === 'Enter' && goToRegistroBase({ implementado: 'true' })}>
          <Card className="cursor-pointer hover:shadow">
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
        </div>

        <div>
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
        </div>

        <div role="button" tabIndex={0} onClick={() => goToRegistroBase({ pendientes: 'true' })} onKeyDown={(e) => e.key === 'Enter' && goToRegistroBase({ pendientes: 'true' })}>
          <Card className="cursor-pointer hover:shadow">
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

      </div>

      {/* Analytics: organized as two rows x two columns
          Row 1: LIS Más Usados | LIS por Hospitales
          Row 2: Módulos Más Usados | Módulos por Hospital
      */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Row 1, Col 1: LIS Más Usados */}
        <Card>
          <CardHeader>
            <CardTitle>LIS Más Usados</CardTitle>
            <CardDescription>Sistemas más implementados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Cargando...</div>
            ) : lisMasUsados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="flex items-center justify-center">
                  <PieChart
                    data={lisMasUsados.slice(0, 8).map((lis) => ({
                      nombre: lis.nombre,
                      cantidad: lis.cantidad,
                      porcentaje: lis.porcentaje,
                    }))}
                    size={200}
                    onSliceClick={(slice) => {
                      setSelectedLisFilter({ nombre: slice.nombre, cantidad: slice.cantidad })
                    }}
                    onCenterClick={() => setSelectedLisFilter(null)}
                  />
                </div>

                <div className="space-y-3">
                  {lisMasUsados.slice(0, 8).map((lis, index) => {
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" />
                          <span className="text-sm font-medium">{lis.nombre}</span>
                        </div>
                        <span className="text-sm font-bold">{lis.cantidad}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
            )}
          </CardContent>
        </Card>

        {/* Row 1, Col 2: LIS por Hospitales */}
        <DashboardLisHospitales selectedLisFilter={selectedLisFilter} onClearFilter={() => setSelectedLisFilter(null)} />

        {/* Row 2, Col 1: Módulos Más Usados */}
        <DashboardModulosStats
          selectedModuloId={selectedModulo?.id ?? null}
          selectedModuloNombre={selectedModulo?.nombre ?? null}
          onSelectModulo={(m) => setSelectedModulo(m as any)}
        />

        {/* Row 2, Col 2: Módulos por Hospital (filtrado por módulo seleccionado) */}
  <DashboardModulosPorHospitales selectedModuloId={selectedModulo?.id ?? null} selectedModuloLisId={selectedModulo?.lis_id ?? null} />
      </div>

      {/* Estadísticas de Guardias */}
      <DashboardGuardiasStats />
    </div>
  )
}
