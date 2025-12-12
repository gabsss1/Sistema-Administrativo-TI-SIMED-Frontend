"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react'
import * as planningApi from '@/lib/planning'

type PlanningItem = {
  planning_id: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  titulo: string
  descripcion?: string
  responsable?: any
  hospital?: any
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function dateTimeFromParts(dateIso: string, time: string) {
  return new Date(`${dateIso}T${time}:00`)
}

function overlapWithDay(ev: PlanningItem, dayIso: string) {
  const dayStart = new Date(`${dayIso}T00:00:00`)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  let evStart = dateTimeFromParts(ev.fecha, ev.hora_inicio)
  let evEnd = dateTimeFromParts(ev.fecha, ev.hora_fin)
  if (evEnd <= evStart) evEnd = new Date(evEnd.getTime() + 24 * 60 * 60000)

  const s = evStart > dayStart ? evStart : dayStart
  const e = evEnd < dayEnd ? evEnd : dayEnd
  if (e <= s) return null
  
  // Calculate top and height in minutes for timeline rendering
  const top = Math.floor((s.getTime() - dayStart.getTime()) / 60000)
  const height = Math.max(20, Math.floor((e.getTime() - s.getTime()) / 60000))
  
  return { start: s, end: e, top, height }
}

export default function DashboardPlanning() {
  const [items, setItems] = useState<PlanningItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const data = await planningApi.fetchPlannings()
        if (!mounted) return
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setItems([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const day = todayISO()
  const todays = items
    .map(it => ({ it, part: overlapWithDay(it, day) }))
    .filter(x => x.part !== null)
    .sort((a, b) => a.part!.start.getTime() - b.part!.start.getTime())

  // summary numbers
  const totalEvents = todays.length
  const multiHour = todays.filter(x => {
    const minutes = Math.floor((x.part!.end.getTime() - x.part!.start.getTime()) / 60000)
    return minutes >= 120 // 2+ horas
  }).length
  const totalMinutes = todays.reduce((acc, x) => acc + Math.max(0, Math.floor((x.part!.end.getTime() - x.part!.start.getTime()) / 60000)), 0)
  const shortEvents = todays.filter(x => {
    const minutes = Math.floor((x.part!.end.getTime() - x.part!.start.getTime()) / 60000)
    return minutes < 60
  }).length

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Planificación - Hoy
            </CardTitle>
            <CardDescription>Resumen de eventos por horas</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : todays.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay eventos planificados para hoy</p>
          </div>
        ) : (
          (() => {
            console.log('🔍 Renderizando planning con:', todays);
            
            return (
              <div className="space-y-4">
                {/* Resumen general */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">Total Eventos</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {totalEvents}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Eventos largos (≥2h)</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {multiHour}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Horas totales</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {Math.round((totalMinutes / 60) * 10) / 10}h
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Eventos cortos (&lt;1h)</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900 mt-1">
                      {shortEvents}
                    </p>
                  </div>
                </div>

                {/* Calendario visual del día */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Vista del Día</h4>
                  <div className="relative border border-gray-200 rounded-lg bg-white overflow-hidden" style={{ height: '400px' }}>
                    {/* Grid de horas */}
                    <div className="absolute inset-0 flex">
                      {/* Columna de horas */}
                      <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50">
                        {Array.from({ length: 24 }).map((_, h) => (
                          <div key={h} className="h-[16.666px] border-b border-gray-100 px-2 text-[10px] text-gray-500 flex items-center justify-end">
                            {h.toString().padStart(2, '0')}:00
                          </div>
                        ))}
                      </div>
                      
                      {/* Columna del día con eventos */}
                      <div className="flex-1 relative">
                        {/* Líneas horizontales de horas */}
                        {Array.from({ length: 24 }).map((_, h) => (
                          <div key={h} className="absolute left-0 right-0 border-b border-gray-100" style={{ top: `${h * 16.666}px` }} />
                        ))}
                        
                        {/* Eventos posicionados */}
                        {todays.map(({ it, part }, idx) => {
                          const topPx = (part!.top / 1440) * 400 // 1440 minutos en un día, 400px altura
                          const heightPx = Math.max(15, (part!.height / 1440) * 400)
                          const durationMinutes = Math.floor((part!.end.getTime() - part!.start.getTime()) / 60000)
                          
                          return (
                            <div
                              key={`${it.planning_id}-${idx}`}
                              className="absolute left-1 right-1 bg-blue-500 text-white rounded px-2 py-1 text-xs overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                              }}
                              title={`${it.titulo}\n${it.hora_inicio} - ${it.hora_fin}\n${it.responsable?.nombre || ''} - ${it.hospital?.nombre || ''}`}
                            >
                              <div className="font-semibold truncate">{it.titulo}</div>
                              <div className="text-[10px] opacity-90">
                                {it.hora_inicio} - {it.hora_fin} ({Math.round((durationMinutes / 60) * 10) / 10}h)
                              </div>
                              {it.responsable?.nombre && (
                                <div className="text-[9px] opacity-75 truncate">
                                  {it.responsable.nombre}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eventos de hoy */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Eventos de Hoy</h4>
                  <div className="space-y-3">
                    {todays.map(({ it, part }, index) => {
                      const durationMinutes = Math.floor((part!.end.getTime() - part!.start.getTime()) / 60000)
                      const durationHours = Math.round((durationMinutes / 60) * 10) / 10
                      
                      return (
                        <div key={`${it.planning_id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                                <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                              </div>
                              <h5 className="font-medium text-gray-900">{it.titulo}</h5>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold text-gray-900">
                                {durationHours}h
                              </span>
                              <p className="text-xs text-gray-500">{it.hora_inicio} - {it.hora_fin}</p>
                            </div>
                          </div>

                          {/* Información adicional */}
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                            {it.responsable?.nombre && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{it.responsable.nombre}</span>
                            )}
                            {it.hospital?.nombre && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{it.hospital.nombre}</span>
                            )}
                          </div>

                          {/* Barra de progreso visual */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${totalMinutes > 0 ? (durationMinutes / totalMinutes) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {totalMinutes > 0 
                                ? `${((durationMinutes / totalMinutes) * 100).toFixed(1)}% del tiempo total` 
                                : '0% del tiempo total'
                              }
                            </p>
                          </div>
                        </div>
                      )
                    })}
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
