"use client"

import React, { useEffect, useState } from 'react'
import { Hospital, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { getHospitalesPorModuloAll } from '@/lib/registro-base-ti'
import type { HospitalesPorModuloItem } from '@/lib/registro-base-ti'

type Props = {
  selectedModuloId?: number | null
  selectedModuloLisId?: number | null
}

export default function DashboardModulosPorHospitales({ selectedModuloId = null, selectedModuloLisId = null }: Props) {
  const [data, setData] = useState<HospitalesPorModuloItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [openValue, setOpenValue] = useState<string | null>(null)
  const PAGE_SIZE = 3

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getHospitalesPorModuloAll()
        if (!mounted) return
        setData(res)
        // quick debug log to verify counts
        console.debug('[dashboard-modulos-por-hospitales] fetched hospitales:', Array.isArray(res) ? res.length : 'no-array', res)
      } catch (err: any) {
        console.error('Error loading hospitales por modulo', err)
        if (!mounted) return
        setError(err?.message || String(err))
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [])

  

  const totalHospitals = data ? data.length : 0
  // When a modulo filter is applied we must filter hospitals first, then paginate the filtered list
  const filteredHospitals = data
    ? (selectedModuloId
        ? data.filter((h) => Array.isArray(h.modulos) && h.modulos.some((m) => Number((m as any).modulo_id) === Number(selectedModuloId) && (selectedModuloLisId ? Number((m as any).lis_id) === Number(selectedModuloLisId) : true)))
        : data)
    : []

  const totalHospitalsFiltered = filteredHospitals.length
  const totalPages = Math.max(1, Math.ceil(totalHospitalsFiltered / PAGE_SIZE))

  // When the selected module changes, reset pagination to first page
  useEffect(() => {
    setPage(1)
    // auto-open first hospital that contains the selected module and go to its page
    if (selectedModuloId && filteredHospitals.length > 0) {
      const firstIndex = filteredHospitals.findIndex((h) => Array.isArray(h.modulos) && h.modulos.some((m) => Number((m as any).modulo_id) === Number(selectedModuloId) && (selectedModuloLisId ? Number((m as any).lis_id) === Number(selectedModuloLisId) : true)))
      if (firstIndex >= 0) {
        const targetPage = Math.floor(firstIndex / PAGE_SIZE) + 1
        setPage(targetPage)
        setOpenValue(`hmod-${firstIndex}`)
      } else {
        setOpenValue(null)
      }
    } else {
      setOpenValue(null)
    }

    console.debug('[dashboard-modulos-por-hospitales] selectedModuloId changed to:', selectedModuloId, 'lisId:', selectedModuloLisId)
  }, [selectedModuloId, selectedModuloLisId])

  // If the current page is out of range after filtering, reset to 1
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const truncateText = (text: string | null | undefined, max = 40) => {
    if (!text) return ''
    const s = String(text)
    return s.length > max ? s.slice(0, max) + '...' : s
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Módulos por Hospital</CardTitle>
          <CardDescription>Listado de módulos agrupados por hospital</CardDescription>
          {/* header counts removed per request */}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
        ) : filteredHospitals.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay resultados para el filtro seleccionado</div>
        ) : (
          <>
            <Accordion type="single" collapsible value={openValue ?? undefined} onValueChange={(v) => setOpenValue(v ?? null)}>
              {filteredHospitals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((hosp, idx) => {
                const globalIndex = (page - 1) * PAGE_SIZE + idx
                const thisItemValue = `hmod-${globalIndex}`
                const filteredModulos = selectedModuloId
                  ? hosp.modulos.filter((m) => Number((m as any).modulo_id) === Number(selectedModuloId) && (selectedModuloLisId ? Number((m as any).lis_id) === Number(selectedModuloLisId) : true))
                  : hosp.modulos

                const displayTotal = selectedModuloId
                  ? filteredModulos.reduce((s, m) => {
                      const raw = (m as any).cantidad
                      const qty = raw != null ? Number(raw) : 1 // treat missing cantidad as 1 (count duplicates)
                      return s + (Number.isNaN(qty) ? 0 : qty)
                    }, 0)
                  : hosp.total

                return (
                  <AccordionItem key={`${hosp.hospital}-${idx}`} value={thisItemValue}>
                    <AccordionTrigger>
                      <div className={`w-full flex items-center justify-between px-1 py-2`}>
                        <span className="text-base font-medium text-foreground flex items-center gap-2 min-w-0 flex-1 mr-2">
                          <Hospital className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate" title={hosp.hospital}>{truncateText(hosp.hospital, 60)}</span>
                          {selectedModuloId ? (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {displayTotal}
                            </span>
                          ) : null}
                        </span>
                        {!selectedModuloId && (
                          <span className="text-base font-semibold text-muted-foreground flex-shrink-0">{displayTotal}</span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="mt-1 space-y-1 px-2">
                        {filteredModulos.map((m, mi) => (
                          <li key={mi} className={`flex items-center justify-between`}>
                            <span className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                              <span className="text-sm text-foreground truncate" title={(m as any).nombre}>{truncateText((m as any).nombre, 60)}</span>
                            </span>
                            <span className="text-sm text-muted-foreground">{((m as any).cantidad != null ? (m as any).cantidad : 1)}</span>
                          </li>
                        ))}
                        {filteredModulos.length === 0 && (
                          <li className="text-sm text-muted-foreground py-2">No hay módulos para este hospital</li>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>

            {/* Pagination */}
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
