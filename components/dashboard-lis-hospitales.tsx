"use client"

import React, { useEffect, useState } from 'react'
import { Hospital, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { getLisPorHospitales } from '@/lib/registro-base-ti'
import type { LisPorHospitalItem } from '@/lib/registro-base-ti'

export default function DashboardLisHospitales({
  selectedLisFilter,
  onClearFilter,
}: {
  selectedLisFilter?: { nombre: string; cantidad: number } | null
  onClearFilter?: () => void
}) {
  // Helper to truncate long names and append ellipsis. Keep full name in title for hover.
  const truncateText = (text: string | null | undefined, max = 30) => {
    if (!text) return ''
    const s = String(text)
    return s.length > max ? s.slice(0, max) + '...' : s
  }
  const [data, setData] = useState<LisPorHospitalItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 3

  // computed filtered data based on selectedLisFilter
  const filteredData = data && selectedLisFilter?.nombre
    ? data.filter((h) => h.lis?.some((l) => l.nombre === selectedLisFilter.nombre))
    : data || []

  const totalHospitals = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalHospitals / PAGE_SIZE))
  // aggregated total of registros for the selected LIS across all hospitals
  const aggregatedLisTotal = selectedLisFilter?.nombre
    ? (data || []).reduce((sum, h) => {
        const match = h.lis?.find((l) => l.nombre === selectedLisFilter.nombre)
        return sum + (match?.cantidad || 0)
      }, 0)
    : 0

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

  // whenever the filter changes, reset the page back to 1
  useEffect(() => {
    setPage(1)
  }, [selectedLisFilter])

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>LIS por Hospitales</CardTitle>
          <CardDescription>Distribución de sistemas LIS por hospital</CardDescription>
          {selectedLisFilter?.nombre ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">{selectedLisFilter.nombre}</span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{aggregatedLisTotal}</span>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
        ) : (
          <>
            <Accordion type="single" collapsible>
              {filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((hosp, idx) => {
                // For each hospital, if a lis filter is active, show only the matching lis entries and adjust total
                const lisToShow = selectedLisFilter?.nombre ? (hosp.lis || []).filter((l) => l.nombre === selectedLisFilter.nombre) : (hosp.lis || [])
                const hospitalTotal = selectedLisFilter?.nombre ? lisToShow.reduce((s, l) => s + (l.cantidad || 0), 0) : hosp.total

                return (
                  <AccordionItem key={idx} value={`h-${idx}`}>
                    <AccordionTrigger>
                      <div className="w-full flex items-center justify-between px-1 py-2">
                        <span className="text-base font-medium text-foreground flex items-center gap-2 min-w-0 flex-1 mr-2">
                          <Hospital className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate" title={hosp.hospital}>{truncateText(hosp.hospital, 30)}</span>
                        </span>
                        <span className="text-base font-semibold text-muted-foreground flex-shrink-0">{hospitalTotal}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="mt-1 space-y-1 px-2">
                        {lisToShow.map((l, li) => (
                          <li key={li} className="flex items-center justify-between">
                            <span className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                              <span className="text-sm text-foreground truncate" title={l.nombre}>{truncateText(l.nombre, 30)}</span>
                            </span>
                            <span className="text-sm text-muted-foreground">{l.cantidad}</span>
                          </li>
                        ))}
                        {lisToShow.length === 0 && (
                          <li className="text-sm text-muted-foreground py-2">No hay LIS para este hospital</li>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>

            {/* Pagination controls */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Página {page} de {totalPages}</div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded bg-white border disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-2 rounded bg-white border disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
