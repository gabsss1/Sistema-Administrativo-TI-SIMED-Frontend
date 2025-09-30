import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, TrendingUp, Settings } from "lucide-react"

export default function DashboardPage() {
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
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">+12.5% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15.3%</div>
            <p className="text-xs text-muted-foreground">+2.1% desde la semana pasada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuraciones</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Configuraciones activas</p>
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nuevo usuario registrado</p>
                  <p className="text-xs text-muted-foreground">Hace 2 minutos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Configuración actualizada</p>
                  <p className="text-xs text-muted-foreground">Hace 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Usuario eliminado</p>
                  <p className="text-xs text-muted-foreground">Hace 1 hora</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Backup completado</p>
                  <p className="text-xs text-muted-foreground">Hace 3 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen del Sistema</CardTitle>
            <CardDescription>Estado general de la aplicación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado del Servidor</span>
                <span className="text-sm text-chart-2">Operativo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Base de Datos</span>
                <span className="text-sm text-chart-2">Conectada</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Último Backup</span>
                <span className="text-sm text-muted-foreground">Hace 3 horas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uso de Memoria</span>
                <span className="text-sm text-muted-foreground">68%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
