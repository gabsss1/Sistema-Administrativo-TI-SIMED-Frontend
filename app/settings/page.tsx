import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Administra la configuración del sistema</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>Ajustes básicos del sistema administrativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="site-name">Nombre del Sitio</Label>
              <Input id="site-name" defaultValue="Admin Panel" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-email">Email del Administrador</Label>
              <Input id="admin-email" type="email" defaultValue="admin@example.com" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones de actividad del sistema</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo de Mantenimiento</Label>
                <p className="text-sm text-muted-foreground">Activar modo de mantenimiento para el sitio</p>
              </div>
              <Switch />
            </div>

            <div className="pt-4">
              <Button>Guardar Cambios</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Configuración de seguridad y acceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-muted-foreground">Requerir 2FA para todos los administradores</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registro de Actividad</Label>
                <p className="text-sm text-muted-foreground">Mantener logs detallados de actividad</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="pt-4">
              <Button>Actualizar Configuración</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
