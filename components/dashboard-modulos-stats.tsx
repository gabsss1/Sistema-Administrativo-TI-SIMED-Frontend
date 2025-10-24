"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
// Usamos una vista de barras horizontales en lugar de PieChart para mayor legibilidad
import { getModulosMasUsados } from '@/lib/registro-base-ti'

type ModulosStatsProps = {
  selectedModuloId?: number | null
  selectedModuloNombre?: string | null
  onSelectModulo?: (m: { id: number; nombre: string; lis_id?: number | null } | null) => void
}

export default function DashboardModulosStats({ selectedModuloId = null, selectedModuloNombre = null, onSelectModulo }: ModulosStatsProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await getModulosMasUsados()
        if (!mounted) return
        setData(res || [])
      } catch (err: any) {
        console.error('Error loading modulos mas usados', err)
        if (!mounted) return
        setError(err?.message || String(err))
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [])
  const router = useRouter()
  const COLORS = [
    '#6366F1','#EF4444','#F59E0B','#10B981','#06B6D4','#8B5CF6','#F97316','#94A3B8','#FB7185','#60A5FA'
  ]
  // Mostrar todos los módulos (sin agrupar en "Otros") y calcular porcentaje
  const totalCount = data.reduce((s, d) => s + (Number(d.cantidad) || 0), 0)
  const sorted = [...data].sort((a: any, b: any) => (Number(b.cantidad) || 0) - (Number(a.cantidad) || 0))
  const pieData = sorted.map((d: any) => ({
    id: Number(d.modulo_id),
    nombre: String(d.nombre),
    cantidad: Number(d.cantidad) || 0,
    porcentaje: totalCount > 0 ? ((Number(d.cantidad) || 0) / totalCount) * 100 : 0,
    lis_nombre: d.lis_nombre ? String(d.lis_nombre) : null,
    lis_id: d.lis_id ? Number(d.lis_id) : null,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Módulos Más Usados</CardTitle>
        <CardDescription>Distribución por módulo</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {pieData.map((mod: { id: number; nombre: string; cantidad: number; porcentaje: number; lis_nombre?: string | null; lis_id?: number | null }, index: number) => {
              const pct = Number(mod.porcentaje) || 0
              // ensure visible min width for very small values
              const barWidth = Math.max(pct, pct > 0 ? 2 : 0)
              return (
                <div
                  key={mod.id ?? index}
                  role="button"
                  aria-pressed={selectedModuloId === mod.id}
                  className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-4 py-2 px-3 rounded-md hover:bg-slate-50 ${selectedModuloId === mod.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                  onClick={() => {
                    if (!onSelectModulo) return
                    if (selectedModuloId === mod.id) onSelectModulo(null)
                    else onSelectModulo({ id: mod.id, nombre: mod.nombre, lis_id: mod.lis_id ?? null })
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 md:flex-1">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[index % COLORS.length] }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-sm font-medium truncate" title={mod.nombre} style={{ maxWidth: 520 }}>{mod.nombre}</div>
                        {mod.lis_nombre && (
                          <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">{mod.lis_nombre}</div>
                        )}
                        {selectedModuloId === mod.id && (
                          <Check className="w-4 h-4 text-indigo-600 ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <div className="mt-2 h-3 bg-slate-100 rounded overflow-hidden">
                        <div className="h-3 rounded" style={{ width: `${barWidth}%`, background: COLORS[index % COLORS.length] }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:ml-4 md:flex-shrink-0">
                    <span className="text-sm text-muted-foreground">{mod.cantidad}</span>
                    <span className="text-xs font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded">{pct.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
