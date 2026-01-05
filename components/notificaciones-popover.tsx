"use client"

import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
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
  
  if (minutos < 1) return "Ahora"
  if (minutos < 60) return `Hace ${minutos} min`
  if (horas < 24) return `Hace ${horas}h`
  if (dias < 7) return `Hace ${dias}d`
  
  return fechaNotificacion.toLocaleDateString()
}

interface NotificacionItemProps {
  notificacion: Notificacion
  onMarcarLeida: (id: string) => void
  onEliminar: (id: string) => void
}

function NotificacionItem({
  notificacion,
  onMarcarLeida,
  onEliminar,
}: NotificacionItemProps) {
  const handleClick = () => {
    if (!notificacion.read) {
      onMarcarLeida(notificacion.id)
    }
  }

  return (
    <div
      className={cn(
        "group relative p-3 rounded-lg border transition-colors cursor-pointer",
        notificacion.read
          ? "bg-background border-border hover:bg-muted/50"
          : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 hover:bg-blue-100/50 dark:hover:bg-blue-950/30"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Indicador de no leída */}
        {!notificacion.read && (
          <div className="shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
        )}
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
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
          
          <div className="flex items-center justify-between">
            {/* Botones de acción */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notificacion.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarcarLeida(notificacion.id)
                  }}
                  title="Marcar como leída"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onEliminar(notificacion.id)
                }}
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificacionesPopover() {
  const router = useRouter()
  const {
    notificaciones,
    contador,
    isLoading,
    marcarLeida,
    marcarTodasLeidas,
    eliminar,
  } = useNotificaciones()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {contador > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 flex items-center justify-center text-[10px] font-semibold text-white"
            >
              {contador > 9 ? "9+" : contador}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notificaciones</h3>
            {contador > 0 && (
              <Badge variant="secondary" className="text-xs">
                {contador}
              </Badge>
            )}
          </div>
          {contador > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasLeidas}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Contenido */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {notificaciones.map((notificacion) => (
                <NotificacionItem
                  key={notificacion.id}
                  notificacion={notificacion}
                  onMarcarLeida={marcarLeida}
                  onEliminar={eliminar}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notificaciones.length > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => router.push("/notificaciones")}
            >
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
