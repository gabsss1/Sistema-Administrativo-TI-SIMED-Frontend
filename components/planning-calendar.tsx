"use client"

import { useEffect, useState, useMemo } from "react"
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Clock, CalendarDays, Users, Check, ChevronsUpDown } from "lucide-react"
import Swal from 'sweetalert2'
import * as planningApi from '@/lib/planning'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  type Responsable,
  type Hospital,
  getResponsables,
  getHospitales
} from '@/lib/registro-base-ti'

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

function getPeruDate() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const peruOffset = -5
  return new Date(utc + 3600000 * peruOffset)
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(d: Date, days: number) {
  const result = new Date(d)
  result.setDate(result.getDate() + days)
  return result
}

function formatDateISO(d: Date) {
  if (!d || isNaN(d.getTime())) {
    console.error('Invalid date in formatDateISO:', d)
    return new Date().toISOString().slice(0, 10)
  }
  return d.toISOString().slice(0, 10)
}

function dateTimeFromParts(dateIso: string, time: string) {
  if (!dateIso || !time) {
    console.error('Invalid date or time in dateTimeFromParts:', { dateIso, time })
    return new Date()
  }
  
  // Normalizar la hora si viene en formato HH:MM:SS
  const timeParts = time.split(':')
  const normalizedTime = `${timeParts[0]}:${timeParts[1]}`
  
  const date = new Date(`${dateIso}T${normalizedTime}:00`)
  if (isNaN(date.getTime())) {
    console.error('Invalid date created in dateTimeFromParts:', { dateIso, time })
    return new Date()
  }
  return date
}

function partsForDay(ev: PlanningItem, day: Date) {
  if (!ev.fecha || !ev.hora_inicio || !ev.hora_fin) return []
  
  const dayIso = formatDateISO(day)
  const dayStart = new Date(`${dayIso}T00:00:00`)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  let evStart = dateTimeFromParts(ev.fecha, ev.hora_inicio)
  let evEnd = dateTimeFromParts(ev.fecha, ev.hora_fin)
  
  // Validar fechas creadas
  if (isNaN(evStart.getTime()) || isNaN(evEnd.getTime())) {
    console.error('Invalid event dates:', { ev, evStart, evEnd })
    return []
  }
  
  // Si la hora de fin cruza medianoche
  if (evEnd <= evStart) {
    evEnd = new Date(evEnd)
    evEnd.setDate(evEnd.getDate() + 1)
  }

  // Verificar si el evento ocurre en este día específico
  // El evento debe iniciarse en este día O terminar en este día (si cruza medianoche)
  const eventStartDate = formatDateISO(evStart)
  const eventEndDate = formatDateISO(evEnd)
  
  // Si el evento no inicia ni termina en este día, no mostrar
  if (eventStartDate !== dayIso && eventEndDate !== dayIso) {
    return []
  }

  const overlapStart = evStart > dayStart ? evStart : dayStart
  const overlapEnd = evEnd < dayEnd ? evEnd : dayEnd
  if (overlapEnd <= overlapStart) return []

  const top = Math.floor((overlapStart.getTime() - dayStart.getTime()) / 60000)
  const height = Math.max(30, Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 60000))
  
  return [{ top, height, start: overlapStart, end: overlapEnd }]
}

export default function PlanningCalendar() {
  const [items, setItems] = useState<PlanningItem[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(getPeruDate()))
  const [currentMobileDay, setCurrentMobileDay] = useState(() => getPeruDate())
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanningItem | null>(null)
  const [loadingData, setLoadingData] = useState(false)

  const [responsables, setResponsables] = useState<Responsable[]>([])
  const [hospitales, setHospitales] = useState<Hospital[]>([])
  const [searchResponsable, setSearchResponsable] = useState("")
  const [searchHospital, setSearchHospital] = useState("")

  const [form, setForm] = useState({
    fecha: '',
    hora_inicio: '07:00',
    hora_fin: '08:00',
    titulo: '',
    descripcion: '',
    responsable_id: '',
    hospital_id: ''
  })

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i))
  }, [currentWeekStart])

  const mobileDays = useMemo(() => {
    return [currentMobileDay]
  }, [currentMobileDay])

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await planningApi.fetchPlannings()
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading planning:", error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los eventos',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  // Cargar responsables y hospitales cuando se abre el diálogo
  useEffect(() => {
    if (dialogOpen) {
      const loadData = async () => {
        setLoadingData(true)
        try {
          const [responsablesData, hospitalesData] = await Promise.all([
            getResponsables(),
            getHospitales()
          ])
          setResponsables(responsablesData)
          setHospitales(hospitalesData)
        } catch (error) {
          console.error("Error loading data:", error)
          Swal.fire({
            title: 'Error al cargar datos',
            text: 'No se pudieron cargar los responsables y hospitales.',
            icon: 'error',
            confirmButtonText: 'Entendido'
          })
        } finally {
          setLoadingData(false)
        }
      }
      loadData()
    }
  }, [dialogOpen])

  const handleCrearEvento = (fecha?: string) => {
    setEditingItem(null)
    setForm({
      fecha: fecha || formatDateISO(getPeruDate()),
      hora_inicio: '07:00',
      hora_fin: '08:00',
      titulo: '',
      descripcion: '',
      responsable_id: '',
      hospital_id: ''
    })
    setDialogOpen(true)
  }

  const handleEditarEvento = (item: PlanningItem) => {
    setEditingItem(item)
    setForm({
      fecha: item.fecha,
      hora_inicio: item.hora_inicio,
      hora_fin: item.hora_fin,
      titulo: item.titulo,
      descripcion: item.descripcion || '',
      responsable_id: item.responsable?.responsable_id?.toString() || '',
      hospital_id: item.hospital?.hospital_id?.toString() || ''
    })
    setDialogOpen(true)
  }

  const handleEliminarEvento = async (item: PlanningItem) => {
    if (operationLoading) return

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar "${item.titulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      setOperationLoading(true)
      try {
        await planningApi.deletePlanning(item.planning_id)
        await loadItems()
        Swal.fire('Eliminado!', 'El evento ha sido eliminado.', 'success')
      } catch (error) {
        Swal.fire('Error!', 'No se pudo eliminar el evento.', 'error')
      } finally {
        setOperationLoading(false)
      }
    }
  }

  const handleSaveEvento = async () => {
    if (!form.fecha || !form.titulo) {
      Swal.fire('Error', 'Fecha y título son requeridos', 'error')
      return
    }

    setOperationLoading(true)
    try {
      const payload = {
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        titulo: form.titulo,
        descripcion: form.descripcion,
        responsable_id: form.responsable_id ? parseInt(form.responsable_id) : undefined,
        hospital_id: form.hospital_id ? parseInt(form.hospital_id) : undefined
      }

      if (editingItem) {
        await planningApi.updatePlanning(editingItem.planning_id, payload)
      } else {
        await planningApi.createPlanning(payload)
      }

      await loadItems()
      setDialogOpen(false)
      setEditingItem(null)

      Swal.fire({
        title: '¡Éxito!',
        text: editingItem ? 'Evento actualizado.' : 'Evento creado.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      })
    } catch (error) {
      Swal.fire('Error!', 'No se pudo guardar el evento.', 'error')
    } finally {
      setOperationLoading(false)
    }
  }

  const prevWeek = () => setCurrentWeekStart(s => addDays(s, -7))
  const nextWeek = () => setCurrentWeekStart(s => addDays(s, 7))
  const todayWeek = () => setCurrentWeekStart(startOfWeek(getPeruDate()))

  const prevDay = () => setCurrentMobileDay(d => addDays(d, -1))
  const nextDay = () => setCurrentMobileDay(d => addDays(d, 1))
  const todayDay = () => setCurrentMobileDay(getPeruDate())

  const eventsForDay = (d: Date) => {
    return items.filter(it => partsForDay(it, d).length > 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const timelineHeight = 24 * 120 // 120px por hora para que las cards se vean mejor

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Header con título y fecha actual */}
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Planning</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {getPeruDate().toLocaleDateString('es-PE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}, {getPeruDate().toLocaleTimeString('es-PE', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })} (Hora de Perú)
        </p>
      </div>

      {/* Indicaciones informativas */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-4 w-4 text-gray-600" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Planificación por Horas</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Programa eventos específicos con hora de inicio y fin. Haz clic en un evento para editarlo.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-gray-600" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Asignación de Responsables</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Asigna responsables y hospitales a cada evento para mejor organización.
          </p>
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Desktop: Week navigation */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <button
            onClick={prevWeek}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
          
          <button
            onClick={todayWeek}
            className="px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors shrink-0"
          >
            Hoy
          </button>

          <button
            onClick={nextWeek}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1 sm:mx-2 shrink-0"></div>

          <h2 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-900 whitespace-nowrap">
            {days[0].toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - {days[6].toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
          </h2>
        </div>

        {/* Mobile: Day navigation */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={prevDay}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <button
            onClick={todayDay}
            className="px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors shrink-0"
          >
            Hoy
          </button>

          <button
            onClick={nextDay}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1 shrink-0"></div>

          <h2 className="text-sm font-semibold text-gray-900">
            {currentMobileDay.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </h2>
        </div>

        <button
          onClick={() => handleCrearEvento()}
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Evento
        </button>
      </div>

      {/* Desktop: Week view */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <div className="w-20 shrink-0 border-r border-gray-200 bg-gray-50">
            <div className="h-12 border-b border-gray-200"></div>
            <div className="relative" style={{ height: `${timelineHeight}px` }}>
              {Array.from({ length: 24 }).map((_, h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 text-[10px] sm:text-xs text-gray-500 text-right pr-1 sm:pr-2"
                  style={{ top: `${h * 120}px`, height: '120px' }}
                >
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-7">
            {days.map((day, idx) => {
              const isToday = formatDateISO(day) === formatDateISO(getPeruDate())
              const dayEvents = eventsForDay(day)

              return (
                <div key={day.toISOString()} className="border-r border-gray-200 last:border-r-0">
                  <div className={`h-12 sm:h-16 border-b border-gray-200 flex flex-col items-center justify-center transition-colors ${
                    isToday ? 'bg-gradient-to-b from-blue-50 to-blue-100/50' : 'bg-gradient-to-b from-gray-50 to-white'
                  }`}>
                    <div className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-0.5 sm:mb-1 ${
                      isToday ? 'text-blue-600' : 'text-gray-500'
                    }`}>{dayNames[idx]}</div>
                    <div className={`text-base sm:text-lg font-bold transition-all ${
                      isToday ? 'bg-blue-600 text-white rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center shadow-md scale-110' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>

                  <div className="relative" style={{ height: `${timelineHeight}px` }}>
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-gray-100"
                        style={{ top: `${h * 120}px` }}
                      />
                    ))}

                    {dayEvents.map((ev, evIdx) => {
                      const parts = partsForDay(ev, day)
                      return parts.map((part, pidx) => {
                        const topPx = part.top * 2 // Multiplicar por 2 porque ahora son 120px por hora
                        const heightPx = Math.max(60, part.height * 2) // Mínimo 60px de altura

                        // Calcular cuántos eventos se solapan en este tiempo
                        const overlappingEvents = dayEvents.filter((otherEv) => {
                          const otherParts = partsForDay(otherEv, day)
                          return otherParts.some(otherPart => {
                            const otherTop = otherPart.top * 2
                            const otherBottom = otherTop + otherPart.height * 2
                            const thisBottom = topPx + heightPx
                            return otherTop < thisBottom && otherBottom > topPx
                          })
                        })

                        const overlapCount = overlappingEvents.length
                        const currentIndex = overlappingEvents.findIndex(e => e.planning_id === ev.planning_id)
                        const widthPercent = 100 / overlapCount
                        const leftPercent = (100 / overlapCount) * currentIndex

                        return (
                          <div
                            key={`${ev.planning_id}-${pidx}`}
                            className="absolute border-l-4 border-blue-500 bg-blue-50/90 hover:bg-blue-100 cursor-pointer transition-colors group px-1.5 py-1"
                            style={{
                              top: `${topPx}px`,
                              height: `${heightPx}px`,
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            onClick={() => handleEditarEvento(ev)}
                          >
                            <div className="h-full flex flex-col text-xs">
                              <div className="font-semibold text-gray-900 leading-tight mb-0.5 line-clamp-2">{ev.titulo}</div>
                              <div className="text-gray-700 text-xs">
                                {ev.hora_inicio} - {ev.hora_fin}
                              </div>
                              {ev.responsable?.nombre && (
                                <div className="text-gray-600 text-xs truncate">
                                  {ev.responsable.nombre}
                                </div>
                              )}
                              {ev.hospital?.hospital_nombre && (
                                <div className="text-gray-600 text-xs truncate">
                                  {ev.hospital.hospital_nombre}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminarEvento(ev);
                              }}
                              className="absolute top-1 right-1 opacity-50 hover:opacity-100 hover:scale-110 transition-all bg-white/80 rounded p-0.5"
                              title="Eliminar evento"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-700 hover:text-red-600" />
                            </button>
                          </div>
                        )
                      })
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile: Single day view */}
      <div className="md:hidden">
        <div className="flex border-b border-gray-200">
          <div className="w-16 shrink-0 border-r border-gray-200 bg-gray-50">
            <div className="h-12 border-b border-gray-200"></div>
            <div className="relative" style={{ height: `${timelineHeight}px` }}>
              {Array.from({ length: 24 }).map((_, h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 text-[10px] text-gray-500 text-right pr-1"
                  style={{ top: `${h * 120}px`, height: '120px' }}
                >
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {mobileDays.map((day) => {
              const isToday = formatDateISO(day) === formatDateISO(getPeruDate())
              const dayEvents = eventsForDay(day)

              return (
                <div key={day.toISOString()} className="border-r border-gray-200">
                  <div className={`h-12 border-b border-gray-200 flex flex-col items-center justify-center transition-colors ${
                    isToday ? 'bg-gradient-to-b from-blue-50 to-blue-100/50' : 'bg-gradient-to-b from-gray-50 to-white'
                  }`}>
                    <div className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${
                      isToday ? 'text-blue-600' : 'text-gray-500'
                    }`}>{day.toLocaleDateString('es-PE', { weekday: 'short' })}</div>
                    <div className={`text-base font-bold transition-all ${
                      isToday ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md scale-110' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>

                  <div className="relative bg-white" style={{ height: `${timelineHeight}px` }}>
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-b border-gray-100"
                        style={{ top: `${h * 120}px`, height: '120px' }}
                      />
                    ))}

                    {dayEvents.map(ev => {
                      const parts = partsForDay(ev, day)
                      if (!parts.length) return null

                      const overlappingEvents = dayEvents.filter(other => {
                        if (other.planning_id === ev.planning_id) return false
                        const otherParts = partsForDay(other, day)
                        return otherParts.some(op => {
                          return parts.some(p => {
                            return !(op.end <= p.start || op.start >= p.end)
                          })
                        })
                      })

                      const totalOverlapping = overlappingEvents.length + 1
                      const evIndex = [ev, ...overlappingEvents]
                        .sort((a, b) => a.planning_id - b.planning_id)
                        .indexOf(ev)

                      return parts.map((part, i) => {
                        const topPx = (part.top / 60) * 120
                        const heightPx = (part.height / 60) * 120
                        const widthPercent = 100 / totalOverlapping
                        const leftPercent = widthPercent * evIndex

                        return (
                          <div
                            key={`${ev.planning_id}-${i}`}
                            className="absolute border-l-4 border-blue-500 bg-blue-50/90 hover:bg-blue-100 cursor-pointer transition-colors group px-1.5 py-1"
                            style={{
                              top: `${topPx}px`,
                              height: `${heightPx}px`,
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`
                            }}
                            onClick={() => handleEditarEvento(ev)}
                          >
                            <div className="h-full flex flex-col text-xs">
                              <div className="font-semibold text-gray-900 leading-tight mb-0.5 line-clamp-2">{ev.titulo}</div>
                              <div className="text-gray-700 text-xs">
                                {ev.hora_inicio} - {ev.hora_fin}
                              </div>
                              {ev.responsable?.nombre && (
                                <div className="text-gray-600 text-xs truncate">
                                  {ev.responsable.nombre}
                                </div>
                              )}
                              {ev.hospital?.hospital_nombre && (
                                <div className="text-gray-600 text-xs truncate">
                                  {ev.hospital.hospital_nombre}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminarEvento(ev);
                              }}
                              className="absolute top-1 right-1 opacity-50 hover:opacity-100 hover:scale-110 transition-all bg-white/80 rounded p-0.5"
                              title="Eliminar evento"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-700 hover:text-red-600" />
                            </button>
                          </div>
                        )
                      })
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hora_inicio">Hora inicio</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={form.hora_inicio}
                  onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hora_fin">Hora fin</Label>
                <Input
                  id="hora_fin"
                  type="time"
                  value={form.hora_fin}
                  onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Nombre del evento"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsable_id">Responsable</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={loadingData}
                    >
                      {form.responsable_id
                        ? responsables.find(r => r.responsable_id.toString() === form.responsable_id)?.nombre
                        : (loadingData ? "Cargando..." : "Seleccionar Responsable")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[min(90vw,400px)] max-h-[60vh] overflow-y-auto z-50">
                    <Command className="w-full">
                      <div className="sticky top-0 bg-white z-10 p-2">
                        <CommandInput placeholder="Buscar responsable..." value={searchResponsable} onValueChange={setSearchResponsable} />
                      </div>
                      <CommandList className="max-h-[45vh] overflow-y-auto">
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup>
                          {responsables
                            .filter(r => !searchResponsable || r.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchResponsable.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
                            .map(responsable => (
                              <CommandItem
                                key={responsable.responsable_id}
                                value={responsable.nombre}
                                onSelect={() => setForm({ ...form, responsable_id: responsable.responsable_id.toString() })}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form.responsable_id === responsable.responsable_id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {responsable.nombre}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hospital_id">Hospital</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between text-left"
                      disabled={loadingData}
                    >
                      <span className="truncate">
                        {form.hospital_id
                          ? hospitales.find(h => h.hospital_id.toString() === form.hospital_id)?.hospital_nombre
                          : (loadingData ? "Cargando..." : "Seleccionar Hospital")}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[min(90vw,500px)] max-h-[60vh] overflow-y-auto z-50">
                    <Command className="w-full">
                      <div className="sticky top-0 bg-white z-10 p-2">
                        <CommandInput placeholder="Buscar hospital..." value={searchHospital} onValueChange={setSearchHospital} />
                      </div>
                      <CommandList className="max-h-[45vh] overflow-y-auto">
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup>
                          {hospitales
                            .filter(h => !searchHospital || h.hospital_nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchHospital.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
                            .map(hospital => (
                              <CommandItem
                                key={hospital.hospital_id}
                                value={hospital.hospital_nombre}
                                onSelect={() => setForm({ ...form, hospital_id: hospital.hospital_id.toString() })}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 shrink-0",
                                    form.hospital_id === hospital.hospital_id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <span className="wrap-break-word">{hospital.hospital_nombre}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={operationLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEvento}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Guardando...
                  </>
                ) : editingItem ? (
                  'Actualizar'
                ) : (
                  'Crear'
                )}
              </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}