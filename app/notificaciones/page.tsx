"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useNotificaciones } from "@/hooks/use-notificaciones"
import { cn } from "@/lib/utils"
import type { Notificacion } from "@/lib/notificaciones"

// Función para formatear el tiempo relativo
function formatearTiempoRelativo(fecha: string): string {
  const ahora = new Date()
  const fechaNotificacion = new Date(fecha)
  const diferenciaMs = ahora.getTime() - fechaNotificacion.getTime()
  
  const minutos = Math.floor(diferenciaMs / 60000)
  const horas = Math.floor(diferenciaMs / 3600000)
  const dias = Math.floor(diferenciaMs / 86400000)
  
  if (minutos < 1) return "Ahora mismo"
  if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? "s" : ""}`
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? "s" : ""}`
  if (dias < 7) return `Hace ${dias} día${dias > 1 ? "s" : ""}`
  
  return fechaNotificacion.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

interface NotificacionCardProps {
  notificacion: Notificacion
  onMarcarLeida: (id: string) => void
  onEliminar: (id: string) => void
}

function NotificacionCard({
  notificacion,
  onMarcarLeida,
  onEliminar,
}: NotificacionCardProps) {
  return (
    <Card
      className={cn(
        "p-4 transition-all hover:shadow-md",
        notificacion.read
          ? "bg-background opacity-75"
          : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
      )}
    >
      <div className="flex gap-4">
        {/* Indicador visual */}
        <div className="shrink-0 pt-1">
          {!notificacion.read && (
            <div className="w-3 h-3 rounded-full bg-blue-600" />
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <p className={cn(
              "text-sm",
              !notificacion.read && "font-semibold"
            )}>
              {notificacion.message}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatearTiempoRelativo(notificacion.createdAt)}
            </span>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 mt-3">
            {!notificacion.read && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarcarLeida(notificacion.id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar como leída
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEliminar(notificacion.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function NotificacionesPage() {
  const {
    notificaciones,
    contador,
    isLoading,
    marcarLeida,
    marcarTodasLeidas,
    eliminar,
  } = useNotificaciones()

  const [filtro, setFiltro] = useState<"todas" | "no-leidas">("todas")

  const notificacionesFiltradas = filtro === "no-leidas" 
    ? notificaciones.filter(n => !n.read) 
    : notificaciones

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notificaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus notificaciones del sistema
          </p>
        </div>

        {contador > 0 && (
          <Button
            variant="outline"
            onClick={marcarTodasLeidas}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{notificaciones.length}</p>
            </div>
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">No leídas</p>
              <p className="text-2xl font-bold text-blue-600">{contador}</p>
            </div>
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {contador}
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Leídas</p>
              <p className="text-2xl font-bold text-green-600">
                {notificaciones.length - contador}
              </p>
            </div>
            <CheckCheck className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Button
          variant={filtro === "todas" ? "default" : "outline"}
          onClick={() => setFiltro("todas")}
        >
          Todas ({notificaciones.length})
        </Button>
        <Button
          variant={filtro === "no-leidas" ? "default" : "outline"}
          onClick={() => setFiltro("no-leidas")}
        >
          No leídas ({contador})
        </Button>
      </div>

      {/* Lista de notificaciones */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando notificaciones...</p>
        </div>
      ) : notificacionesFiltradas.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold mb-2">
              {filtro === "no-leidas" ? "No tienes notificaciones sin leer" : "No tienes notificaciones"}
            </h3>
            <p className="text-muted-foreground">
              {filtro === "no-leidas" 
                ? "Todas tus notificaciones están al día" 
                : "Las notificaciones aparecerán aquí cuando las recibas"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notificacionesFiltradas.map((notificacion) => (
            <NotificacionCard
              key={notificacion.id}
              notificacion={notificacion}
              onMarcarLeida={marcarLeida}
              onEliminar={eliminar}
            />
          ))}
        </div>
      )}
    </div>
  )
}
