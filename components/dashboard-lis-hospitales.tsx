"use client"

import React, { useEffect, useState } from 'react'
import { Hospital } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { getLisPorHospitales, type LisPorHospitalItem } from '@/lib/registro-base-ti'

export default function DashboardLisHospitales() {
  const [data, setData] = useState<LisPorHospitalItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 3

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getLisPorHospitales()
        if (!mounted) return
        setData(res)
      } catch (err: any) {
        console.error('Error loading lis por hospitales', err)
        if (!mounted) return
        setError(err?.message || String(err))
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>LIS por Hospitales</CardTitle>
        <CardDescription>Distribución de sistemas LIS por hospital</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
        ) : (
          <>
            <Accordion type="single" collapsible>
              {data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((hosp, idx) => (
                <AccordionItem key={idx} value={`h-${idx}`}>
                  <AccordionTrigger>
                    <div className="w-full flex items-center justify-between px-1 py-2">
                      <span className="text-base font-medium text-foreground flex items-center gap-2 min-w-0">
                        <Hospital className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{hosp.hospital}</span>
                      </span>
                      <span className="text-base font-semibold text-muted-foreground">{hosp.total}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="mt-1 space-y-1 px-2">
                      {hosp.lis.map((l, li) => (
                        <li key={li} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                            <span className="text-sm text-foreground truncate">{l.nombre}</span>
                          </span>
                          <span className="text-sm text-muted-foreground">{l.cantidad}</span>
                        </li>
                      ))}
                      {hosp.lis.length === 0 && (
                        <li className="text-sm text-muted-foreground py-2">No hay LIS para este hospital</li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Pagination controls */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {page} de {Math.max(1, Math.ceil((data?.length || 0) / PAGE_SIZE))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </button>
                <button
                  className="px-2 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil((data?.length || 0) / PAGE_SIZE)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
