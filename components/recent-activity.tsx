import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    user: "Ana García",
    action: "Creó un nuevo usuario",
    time: "Hace 2 minutos",
    avatar: "/diverse-woman-portrait.png",
    type: "create",
  },
  {
    id: 2,
    user: "Carlos López",
    action: "Actualizó configuración",
    time: "Hace 5 minutos",
    avatar: "/thoughtful-man.png",
    type: "update",
  },
  {
    id: 3,
    user: "María Rodríguez",
    action: "Eliminó un registro",
    time: "Hace 10 minutos",
    avatar: "/woman-2.jpg",
    type: "delete",
  },
  {
    id: 4,
    user: "Juan Pérez",
    action: "Inició sesión",
    time: "Hace 15 minutos",
    avatar: "/man-2.jpg",
    type: "login",
  },
]

const getTypeBadge = (type: string) => {
  switch (type) {
    case "create":
      return (
        <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
          Crear
        </Badge>
      )
    case "update":
      return (
        <Badge variant="secondary" className="bg-chart-3/20 text-chart-3">
          Actualizar
        </Badge>
      )
    case "delete":
      return (
        <Badge variant="secondary" className="bg-destructive/20 text-destructive">
          Eliminar
        </Badge>
      )
    case "login":
      return (
        <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
          Login
        </Badge>
      )
    default:
      return <Badge variant="secondary">Acción</Badge>
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                <AvatarFallback>
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.user}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>
              <div className="flex items-center gap-2">
                {getTypeBadge(activity.type)}
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
