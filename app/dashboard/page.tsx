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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { DashboardGuardiasStats } from "@/components/dashboard-guardias-stats"

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
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LIS por Regiones</CardTitle>
            <CardDescription>Distribución de sistemas por provincias</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {lisPorRegiones.map((region, index) => (
                <AccordionItem key={index} value={`region-${index}`}>
                  <AccordionTrigger>
                    <div className="w-full flex items-center justify-between px-1 py-2">
                      <span className="text-base font-medium text-foreground">{region.region}</span>
                      <span className="text-base font-semibold text-muted-foreground">{region.total}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-1 space-y-1 px-2">
                      {region.lis.map((lis, lisIndex) => {
                        return (
                          <li key={lisIndex} className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-black" />
                              <span className="text-sm text-foreground">{lis.nombre}</span>
                            </span>
                            <span className="text-sm text-muted-foreground">{lis.cantidad}</span>
                          </li>
                        );
                      })}
                      {region.lis.length === 0 && (
                        <li className="text-sm text-muted-foreground py-2">No hay LIS en esta región</li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas de Guardias */}
      <DashboardGuardiasStats />
    </div>
  )
}
